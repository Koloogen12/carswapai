'use server';
/**
 * Действия мастера у поста · МС-3.
 *
 * ПОЧЕМУ ЭТОТ ФАЙЛ ВООБЩЕ ЕСТЬ. Дверью МС-3 задумана `verifyRoll()` из
 * src/lib/bay.ts, и звать надо было бы её. Но сегодня она не открывается
 * НИ ОДНИМ рулоном: запись в журнал внутри неё собрана как
 * `jsonb_build_object('roll', $4)`, и Postgres на это отвечает
 * «could not determine data type of parameter $4». Обновление наряда к тому
 * моменту уже прошло, но исключение откатывает транзакцию целиком, и наружу
 * приходит `{ ok: false }`. Экран показывал это как «рулон не тот» — то есть
 * на ВЕРНОМ рулоне мастер видел отказ и два одинаковых артикула рядом.
 * Проверено вживую: K75407 в записи, K75407 на рулоне, «Рулон не тот».
 *
 * Хуже этого только одно: так продукт учит мастера, что сверка врёт, и её
 * начинают проходить не глядя. Инвариант, которому не верят, не защищает.
 *
 * src/lib/** — не моя территория в этой итерации, поэтому запись живёт здесь,
 * в границах экрана. Когда `verifyRoll()` починят (нужен один каст,
 * `$4::text`), этот файл схлопывается в вызов из lib — контракт тот же.
 *
 * ЧТО ЗДЕСЬ НЕ ПРОИСХОДИТ. Здесь не решается, совпал ли артикул. Решает
 * база: триггер `app.enforce_roll_match()` отклоняет перевод наряда в работу
 * с кодом 23001 и своим текстом. Отказ нельзя обойти, поправив этот файл —
 * можно только соврать о его причине, и вот этого мы больше не делаем.
 */
import { revalidatePath } from 'next/cache';
import { withTenant } from '@/lib/db';
import { claimsFor } from '@/lib/session';

/** Отказ по МС-3 приходит из триггера этим кодом. Всё прочее — поломка. */
const RESTRICT_VIOLATION = '23001';

export type VerifyOutcome =
  /** Артикул сошёлся, наряд переведён в работу. Партия записана базой. */
  | { ok: true; batch: string | null }
  /** МС-3: рулон другой. `reason` — слова самой базы, не наш пересказ. */
  | { ok: false; kind: 'mismatch'; scanned: string | null; reason: string }
  /** Сверка не состоялась по причине, к рулону отношения не имеющей. */
  | { ok: false; kind: 'failed'; reason: string };

/**
 * Сверка рулона, она же разблокировка работ.
 *
 * Возвращает три исхода, а не два, и это принципиально: «рулон не тот» и
 * «сверка сломалась» — разные новости для мастера. В первом случае он идёт
 * за другим рулоном, во втором — зовёт менеджера, и подсказка обязана
 * отличаться. Раньше оба исхода показывались как первый.
 */
export async function verifyRollAtBay(orderId: string, rollId: string): Promise<VerifyOutcome> {
  try {
    // Сессия спрашивается внутри try: у поста смена длиннее срока сессии, и
    // протухшая сессия — самый частый способ получить сюда исключение. Мастер
    // должен увидеть «сверка не прошла, зовите менеджера», а не белый экран.
    const who = await claimsFor();
    return await withTenant(who, async c => {
      const { rows } = await c.query<{ batch_number: string | null }>(
        `update orders set status = 'in_work', verified_roll_id = $2::uuid,
                           verified_by = $3::uuid
          where id = $1::uuid
      returning batch_number`, [orderId, rollId, who.user_id]);
      await c.query(
        `insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
         values ($1::uuid, $2::uuid, $5::text, 'order.roll_verified', 'orders', $3::uuid,
                 jsonb_build_object('roll', $4::text))`,
        [who.point_id, who.user_id, orderId, rollId, who.app_role]);
      // Доска нарядов живёт в клиентском кэше маршрутизатора: без сброса
      // мастер вернётся на неё и увидит наряд заблокированным задним числом.
      revalidatePath('/bay');
      return { ok: true as const, batch: rows[0]?.batch_number ?? null };
    });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code !== RESTRICT_VIOLATION) {
      return { ok: false, kind: 'failed', reason: err.message };
    }
    // Расхождение — доменный факт, а не ошибка выполнения: оно должно
    // пережить откат транзакции. Своей записью его видят и лента событий
    // менеджера (`order.roll_mismatch` в ops.ts), и доска нарядов мастера.
    const scanned = await recordMismatch(orderId, rollId).catch(() => null);
    revalidatePath('/bay');
    return { ok: false, kind: 'mismatch', scanned, reason: err.message };
  }
}

/** Пишет расхождение в журнал точки и отдаёт артикул, который поднесли. */
async function recordMismatch(orderId: string, rollId: string): Promise<string | null> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const { rows } = await c.query<{ scanned: string }>(
      `insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
       select $1::uuid, $2::uuid, $5::text, 'order.roll_mismatch', 'orders', $3::uuid,
              jsonb_build_object('scanned', ci.sku, 'expected', (
                select ci2.sku
                  from orders o
                  join confirmations cf on cf.id = o.confirmation_id
                  join configuration_items cit on cit.configuration_id = cf.configuration_id
                  join point_prices pp on pp.id = cit.point_price_id
                  join catalog_items ci2 on ci2.id = pp.catalog_item_id
                 where o.id = $3::uuid limit 1))
         from film_rolls fr join catalog_items ci on ci.id = fr.catalog_item_id
        where fr.id = $4::uuid
      returning detail->>'scanned' as scanned`,
      [who.point_id, who.user_id, orderId, rollId, who.app_role]);
    return rows[0]?.scanned ?? null;
  });
}

/**
 * «Сообщить менеджеру · 1 действие» с экрана заблокированного наряда.
 *
 * Одно действие и ноль ввода текста: диалог с клиентом уже существует, и
 * объясняет менеджер, а не мастер. Запись видна в аудите точки.
 */
export async function reportMismatch(orderId: string) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    await c.query(
      `insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
       values ($1::uuid, $2::uuid, $5::text, 'order.roll_mismatch_reported', 'orders', $3::uuid,
               jsonb_build_object('text', $4::text))`,
      [who.point_id, who.user_id, orderId,
       'Мастер сообщил менеджеру о расхождении рулона с подтверждённым выбором',
       who.app_role]);
    revalidatePath('/bay');
    return { ok: true as const };
  });
}

/**
 * «Запросить подтверждение» с неполной записи.
 *
 * Мастер не пишет клиенту сам — он поднимает руку. Запрос ложится в журнал
 * точки, где его видит менеджер, и дальше карточку отправляет он: у него
 * диалог, шаблоны и ответственность за обещание.
 */
export async function requestConfirmation(orderId: string) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    await c.query(
      `insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
       values ($1::uuid, $2::uuid, $5::text, 'order.confirmation_requested', 'orders', $3::uuid,
               jsonb_build_object('text', $4::text))`,
      [who.point_id, who.user_id, orderId,
       'Мастер у поста запросил подтверждение выбора клиентом — записи не хватает на выдаче',
       who.app_role]);
    return { ok: true as const };
  });
}
