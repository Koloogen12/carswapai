'use server';
import { revalidatePath } from 'next/cache';
import type { PoolClient } from 'pg';
import { withClient, LinkNotFound } from './db';

/**
 * Клиентский путь, заход 1: от «нравится» до оплаченной работы.
 *
 * Читается публично по неперебираемому идентификатору конфигурации — это
 * ссылка, которую клиент открывает из своего мессенджера, без входа и пароля.
 *
 * Раньше отсюда ходили через `sys()` — в пул без претензии арендатора. На
 * стенде разработки это работало только потому, что запросы шли от
 * суперпользователя, который RLS обходит. На боевой роли те же запросы
 * вернули бы ноль строк и записали бы ноль строк, молча. Теперь всё идёт
 * через `withClient()`: претензия ставится с ролью `client` и идентификатором
 * ЭТОЙ конфигурации, а границы держит RLS из миграции 006 — не фильтр
 * `where` в запросах ниже. Забыть фильтр можно, забыть RLS — нет.
 */
export type Journey = {
  configuration_id: string; point_id: string;
  point_name: string; point_address: string | null;
  client_name: string | null; plate: string | null; vehicle: string;
  sku: string; brand: string; item_name: string; finish: string;
  price_kopecks: number; meters: string | null;
  renders: { variant: string; storage_path: string }[];
  honesty_line: string | null;
  confirmed_at: string | null;
  appointment_id: string | null;
  appointment_at: string | null; appointment_status: string | null;
  order_id: string | null; order_number: string | null; order_status: string | null;
  invoice_id: string | null; invoice_number: string | null; invoice_amount: number | null;
  paid_kopecks: number; warranty_number: string | null;
  warranty_months: number | null; warranty_issued: string | null;
  batch_number: string | null; order_number_done: string | null;
  changes: { id: string; reason: string; amount_kopecks: number; status: string;
             photo: string | null }[];
};

export async function journey(configId: string): Promise<Journey | null> {
  try {
    return await withClient(configId, async c => {
      const { rows } = await c.query<Journey>(`
        select cfg.id as configuration_id, p.id as point_id,
               p.name as point_name, p.address as point_address,
               cl.name as client_name, cl.vehicle->>'plate' as plate,
               trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')) as vehicle,
               ci.sku, ci.brand, ci.name as item_name, ci.finish::text,
               cit.price_kopecks, cit.meters_required::text as meters,
               oc.honesty_line, cf.confirmed_at,
               ap.id as appointment_id,
               ap.starts_at as appointment_at, ap.status::text as appointment_status,
               o.id as order_id, o.number as order_number, o.status as order_status,
               inv.id as invoice_id, inv.number as invoice_number,
               inv.amount_kopecks as invoice_amount,
               coalesce((select sum(case when pay.kind = 'refund' then -pay.amount_kopecks
                                         else pay.amount_kopecks end)
                           from payments pay where pay.invoice_id = inv.id), 0)::int as paid_kopecks,
               w.number as warranty_number, w.months as warranty_months,
               w.issued_at as warranty_issued, o.batch_number,
               coalesce((select json_agg(json_build_object(
                           'id', co.id, 'reason', co.reason,
                           'amount_kopecks', co.amount_kopecks, 'status', co.status,
                           -- Фото состояния ЛКП берётся по визиту ЭТОЙ примерки.
                           -- Раньше здесь стояло сравнение по одной лишь точке,
                           -- то есть карточка могла показать чужую машину.
                           'photo', (select cp.storage_path from condition_photos cp
                                       join appointments cpa on cpa.id = cp.appointment_id
                                      where cpa.configuration_id = cfg.id
                                      order by cp.taken_at limit 1))
                           order by co.proposed_at)
                          from change_orders co where co.order_id = o.id), '[]'::json) as changes,
               (select json_agg(json_build_object('variant', r.variant, 'storage_path', r.storage_path)
                         order by array_position(array['day','overcast','parking'], r.variant::text))
                  from renders r where r.configuration_item_id = cit.id) as renders
          from configurations cfg
          join points p on p.id = cfg.point_id
          join configuration_items cit on cit.configuration_id = cfg.id
          join point_prices pp on pp.id = cit.point_price_id
          join catalog_items ci on ci.id = pp.catalog_item_id
          left join threads t on t.id = cfg.thread_id
          left join clients cl on cl.id = t.client_id
          left join outbound_cards oc on oc.configuration_id = cfg.id
          left join confirmations cf on cf.configuration_id = cfg.id
          left join appointments ap on ap.configuration_id = cfg.id and ap.kind = 'measure'
                                    and ap.status = 'planned'
          left join orders o on o.confirmation_id = cf.id
          left join invoices inv on inv.order_id = o.id
          left join warranties w on w.order_id = o.id
         where cfg.id = $1
         order by cit.price_kopecks desc limit 1`, [configId]);
      return rows[0] ?? null;
    });
  } catch (e) {
    // Битая или устаревшая ссылка — это 404, а не сбой. Всё остальное
    // обязано долететь до логов, а не превратиться в пустую страницу.
    if (e instanceof LinkNotFound) return null;
    throw e;
  }
}

/** Действие клиента либо состоялось, либо объяснено. Молчаливого «ноль строк»
 *  здесь больше нет: именно им был замаскирован отказ RLS. */
type Done = { ok: true } | { ok: false; error: string };

async function act(configId: string, run: (c: PoolClient) => Promise<Done>): Promise<Done> {
  try {
    const r = await withClient(configId, run);
    if (r.ok) revalidatePath(`/c/${configId}`);
    return r;
  } catch (e) {
    if (e instanceof LinkNotFound) return { ok: false, error: 'Ссылка устарела' };
    return { ok: false, error: (e as Error).message };
  }
}

/** М-7 · клиент фиксирует выбор сам. Подтверждение — событие, а не реплика. */
export async function confirmChoice(configId: string) {
  return act(configId, async c => {
    const card = await c.query<{ id: string; point_id: string }>(
      `select id, point_id from outbound_cards where configuration_id = $1 limit 1`, [configId]);
    if (!card.rows.length) return { ok: false, error: 'Карточка ещё не отправлена' };
    const ins = await c.query(
      `insert into confirmations (point_id, configuration_id, outbound_card_id, confirmed_via, ip)
       values ($1,$2,$3,'link',null)`,
      [card.rows[0].point_id, configId, card.rows[0].id]);
    if (!ins.rowCount) return { ok: false, error: 'Подтверждение не записано' };
    return { ok: true };
  });
}

/** М-8 · слот замера выбирает клиент, в момент, когда он ещё горячий. */
export async function bookSlot(configId: string, iso: string) {
  return act(configId, async c => {
    // Точка и контакт берутся из самой конфигурации, а не из аргументов:
    // всё, что приходит со страницы клиента, — недоверенный ввод.
    const ins = await c.query(
      `insert into appointments (point_id, client_id, configuration_id, kind, starts_at, ends_at)
       select cfg.point_id, t.client_id, cfg.id, 'measure',
              $2::timestamptz, $2::timestamptz + interval '20 minutes'
         from configurations cfg
         left join threads t on t.id = cfg.thread_id
        where cfg.id = $1`, [configId, iso]);
    if (!ins.rowCount) return { ok: false, error: 'Конфигурация не найдена' };
    return { ok: true };
  });
}

/**
 * Предоплата. Долг пересчитывается сам — колонки под него нет.
 *
 * Четвёртым аргументом раньше приходила точка со страницы клиента; теперь она
 * выводится из самого счёта. Аргумент оставлен, чтобы не трогать вызов
 * на экране, но его значение больше ни на что не влияет.
 */
export async function payPrepay(configId: string, invoiceId: string, kopecks: number,
                                _pointId?: string) {
  return act(configId, async c => {
    const ins = await c.query(
      `insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
       select o.point_id, i.id, 'prepay', $2, 'card'
         from invoices i join orders o on o.id = i.order_id
        where i.id = $1`, [invoiceId, kopecks]);
    if (!ins.rowCount) return { ok: false, error: 'Счёт не найден' };
    return { ok: true };
  });
}

/**
 * Клиент согласует доплату сам — своим действием и с датой, как и цвет.
 * Согласованная сумма после этого не переписывается: на выдаче она
 * предъявляется наравне с выбором цвета.
 */
export async function decideChange(configId: string, changeId: string, approve: boolean) {
  return act(configId, async c => {
    const upd = await c.query(
      `update change_orders
          set status = $2::change_status, client_acted_at = now(),
              decided_via = 'client_device'
        where id = $1 and status = 'proposed'`,
      [changeId, approve ? 'approved' : 'declined']);
    // Ноль строк здесь значит либо «уже решена», либо «чужая доработка,
    // отрезанная RLS». И то и другое обязано быть видно, а не проглочено.
    if (!upd.rowCount) return { ok: false, error: 'Доработка уже решена или недоступна' };
    return { ok: true };
  });
}

/** Перенос замера. Отмена и возврат — отдельная ветка, не «удалить визит». */
export async function reschedule(configId: string, appointmentId: string, iso: string) {
  return act(configId, async c => {
    const moved = await c.query(
      `update appointments set status = 'moved' where id = $1`, [appointmentId]);
    if (!moved.rowCount) return { ok: false, error: 'Визит не найден' };
    const ins = await c.query(
      `insert into appointments (point_id, client_id, configuration_id, kind, starts_at,
                                 ends_at, moved_from)
       select a.point_id, a.client_id, a.configuration_id, 'measure',
              $2::timestamptz, $2::timestamptz + interval '20 minutes', a.id
         from appointments a where a.id = $1`, [appointmentId, iso]);
    if (!ins.rowCount) return { ok: false, error: 'Новый визит не записан' };
    return { ok: true };
  });
}

/**
 * Клиент сообщает о проблеме по гарантии.
 *
 * Осмотр не назначается здесь: слотов гарантийного осмотра в расписании нет,
 * и обещать клиенту время, которого никто не подтверждал, — тот же обман, что
 * и нарисованная кнопка, только вежливее. Обращение открыто, точка звонит.
 */
export async function openWarrantyClaim(configId: string, reason: string) {
  return act(configId, async c => {
    const r = await c.query<{ claim_id: string; point_name: string }>(
      'select claim_id, point_name from app.open_warranty_claim($1)', [reason]);
    if (!r.rows.length) return { ok: false, error: 'Обращение не удалось открыть' };
    return { ok: true };
  });
}
