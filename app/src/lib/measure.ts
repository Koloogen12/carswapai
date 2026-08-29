'use server';
import { revalidatePath } from 'next/cache';
import { withTenant } from './db';
import { claimsFor } from './session';

// Мастер у поста — та же сессия, что у всех: роль приходит из базы по
// его пользователю. Раньше здесь была производная от зашитого менеджера,
// то есть любой открывший экран становился мастером этой точки.

/**
 * Контур замера, заход 4.
 *
 * Второй аудит нашёл здесь обрыв: между «записался» и «в работе» в продукте
 * было пусто. Замер — это узел, где оценка превращается в факт: метраж,
 * состояние ЛКП до работ и доработки с новой ценой.
 *
 * Ключевое правило экрана: доработки согласуются на замере, а не при выдаче.
 * Цена, выросшая на выдаче, — это спор, против которого построен весь продукт.
 */
export type MeasureView = {
  appointment_id: string; starts_at: string; status: string;
  client: string; vehicle: string; plate: string | null;
  configuration_id: string | null;
  brand: string; sku: string; item_name: string;
  price_kopecks: number; estimated_meters: string | null;
  confirmed_at: string | null; thumb: string | null;
  vehicle_model_id: string | null;
  order_id: string | null;
  zones: { zone_code: string; meters: string }[];
  photos: { id: string; storage_path: string; zone_note: string | null }[];
  changes: { id: string; reason: string; amount_kopecks: number; status: string }[];
};

const ZONE_RU: Record<string, string> = {
  roof: 'Крыша и капот', full_body: 'Кузов целиком', front_full: 'Борта и двери',
  hood: 'Капот', mirrors: 'Бамперы и зеркала',
};
export async function zoneLabel(code: string) { return ZONE_RU[code] ?? code; }

export async function measureView(id: string): Promise<MeasureView | null> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const { rows } = await c.query(`
      select ap.id as appointment_id, ap.starts_at, ap.status::text, ap.configuration_id,
             coalesce(cl.name,'Клиент') as client,
             trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')) as vehicle,
             cl.vehicle->>'plate' as plate, cfg.vehicle_model_id,
             ci.brand, ci.sku, ci.name as item_name, cit.price_kopecks,
             cit.meters_required::text as estimated_meters, cf.confirmed_at,
             (select r.storage_path from renders r
               where r.configuration_item_id = cit.id and r.variant = 'day') as thumb,
             -- Наряд появляется после подтверждения выбора. До этого доработку
             -- предлагать не к чему, и экран обязан это показать, а не молча
             -- отправить в никуда.
             (select o.id from orders o
                join confirmations c2 on c2.id = o.confirmation_id
               where c2.configuration_id = cfg.id
               order by o.created_at limit 1) as order_id
        from appointments ap
        left join clients cl on cl.id = ap.client_id
        left join configurations cfg on cfg.id = ap.configuration_id
        left join configuration_items cit on cit.configuration_id = cfg.id
        left join point_prices pp on pp.id = cit.point_price_id
        left join catalog_items ci on ci.id = pp.catalog_item_id
        left join confirmations cf on cf.configuration_id = cfg.id
       where ap.id = $1 limit 1`, [id]);
    if (!rows.length) return null;
    const head = rows[0];

    const zones = (await c.query(
      `select zone_code, measured_meters::text as meters from measurements
        where appointment_id = $1 order by at`, [id])).rows;
    const photos = (await c.query(
      `select id, storage_path, zone_note from condition_photos
        where appointment_id = $1 order by taken_at`, [id])).rows;
    const changes = (await c.query(`
      select co.id, co.reason, co.amount_kopecks, co.status::text
        from change_orders co
        join orders o on o.id = co.order_id
        join confirmations cf on cf.id = o.confirmation_id
       where cf.configuration_id = $1 order by co.proposed_at`,
      [head.configuration_id]).catch(() => ({ rows: [] }))).rows;

    return { ...head, zones, photos, changes } as MeasureView;
  });
}

/** Обмер: факт вытесняет оценку и попадает в справочник (М-9). */
export async function saveMeasurement(appointmentId: string, vehicleModelId: string | null,
                                      zone: string, meters: number) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      await c.query(
        `insert into measurements (point_id, appointment_id, vehicle_model_id, zone_code,
                                   measured_meters, measured_by)
         values ($1,$2,$3,$4,$5,$6)`,
        [who.point_id, appointmentId, vehicleModelId, zone, meters, who.user_id]);
      revalidatePath(`/measure/${appointmentId}`);
      return { ok: true as const };
    } catch (e) { return { ok: false as const, error: (e as Error).message }; }
  });
}

/** Доработка предлагается на замере. Согласие клиента — отдельное действие. */
export async function proposeChange(appointmentId: string, orderId: string,
                                    reason: string, kopecks: number) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      await c.query(
        `insert into change_orders (point_id, order_id, reason, amount_kopecks, proposed_by)
         values ($1,$2,$3,$4,$5)`,
        [who.point_id, orderId, reason, kopecks, who.user_id]);
      revalidatePath(`/measure/${appointmentId}`);
      return { ok: true as const };
    } catch (e) { return { ok: false as const, error: (e as Error).message }; }
  });
}

/**
 * Отправить отмеченные доработки клиенту на согласование.
 *
 * Кнопка «Отправить на согласование» была нарисованной: proposeChange лежала
 * готовой и не вызывалась ни из одного места. Мастер отмечал доработки на
 * замере, нажимал — и наряд уходил в работу со старой суммой, а разговор о
 * деньгах переезжал на выдачу. Ровно то, чего этот экран должен избегать.
 *
 * Пустой набор — отказ, а не тихий успех: «отправлено» без единой доработки
 * научило бы мастера, что кнопка врёт.
 */
export async function proposeChanges(appointmentId: string, orderId: string,
                                     items: { reason: string; kopecks: number }[]) {
  const pick = items.filter(i => i.kopecks !== 0 && i.reason.trim());
  if (!pick.length) return { ok: false as const, error: 'не отмечено ни одной доработки' };
  for (const it of pick) {
    const r = await proposeChange(appointmentId, orderId, it.reason.trim(), it.kopecks);
    if (!r.ok) return r;
  }
  return { ok: true as const, count: pick.length };
}

/**
 * Клиент согласовал доплату голосом, стоя у поста.
 *
 * Основание записывается отдельно от решения (миграция 022). В споре слово
 * мастера весит меньше, чем нажатие клиента в своей ссылке, и наряд обязан
 * показывать разницу — а не выглядеть одинаково подтверждённым в обоих случаях.
 *
 * Запретить этот путь нельзя: клиент физически стоит рядом, и запрет заставил
 * бы мастера нажимать «клиент подтвердил» за него. Тогда основание врало бы
 * молча, а это хуже, чем честная пометка «сказал у поста».
 */
export async function approveVerbally(appointmentId: string, orderId: string,
                                      items: { reason: string; kopecks: number }[]) {
  const who0 = await claimsFor();

  // Уже отправленное согласовываем, а не заводим заново. Мастер отправляет
  // клиенту, клиент тут же говорит «да» вслух — это один и тот же разговор,
  // и вторые три строки в наряде означали бы двойную доплату.
  const already = await withTenant(who0, async c => {
    const r = await c.query<{ n: string }>(
      `select count(*)::text as n from change_orders
        where order_id = $1 and status = 'proposed'`, [orderId]);
    return Number(r.rows[0]?.n ?? 0);
  });

  if (!already) {
    const made = await proposeChanges(appointmentId, orderId, items);
    if (!made.ok) return made;
  }

  const who = await claimsFor();
  return withTenant(who, async c => {
    const upd = await c.query(
      `update change_orders
          set status = 'approved', client_acted_at = now(),
              decided_via = 'verbal_at_bay', decided_by = $2
        where order_id = $1 and status = 'proposed'`,
      [orderId, who.user_id]);
    revalidatePath(`/measure/${appointmentId}`);
    return { ok: true as const, count: upd.rowCount ?? 0 };
  });
}
