import { withTenant } from './db';
import { OWNER } from './data';

/** Операционка точки, заход 2. Всё читается под правами владельца точки. */

/**
 * Дожим окна 1–7 дней: подтвердили цвет, но не записались.
 *
 * Самая дорогая потеря продукта стоит ПОСЛЕ момента «ага», когда всё уже
 * оплачено усилием. Список поднимается наверх сам на 2-й, 4-й и 6-й день —
 * поэтому сортировка по возрасту молчания, а не по сумме.
 */
export async function followUps() {
  return withTenant(OWNER, async c => {
    const { rows } = await c.query(`
      select cf.id, cl.name, cl.phone,
             trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')) as vehicle,
             cf.confirmed_at, cit.price_kopecks, ci.sku, ci.brand,
             extract(day from now() - cf.confirmed_at)::int as silent_days,
             cfg.id as configuration_id
        from confirmations cf
        join configurations cfg on cfg.id = cf.configuration_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
       where not exists (select 1 from appointments ap
                          where ap.configuration_id = cfg.id and ap.kind = 'measure'
                            and ap.status <> 'cancelled')
       order by cf.confirmed_at asc`);
    return rows as { id: string; name: string; phone: string; vehicle: string;
                     confirmed_at: string; price_kopecks: number; sku: string; brand: string;
                     silent_days: number; configuration_id: string }[];
  });
}

export async function schedule() {
  return withTenant(OWNER, async c => {
    const bays = (await c.query(
      `select id, name from bays where active order by name`)).rows;
    const appts = (await c.query(`
      select ap.id, ap.bay_id, ap.kind::text, ap.status::text, ap.starts_at, ap.ends_at,
             cl.name as client_name,
             trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')) as vehicle
        from appointments ap left join clients cl on cl.id = ap.client_id
       where ap.starts_at > now() - interval '2 days'
       order by ap.starts_at`)).rows;
    return { bays, appts } as {
      bays: { id: string; name: string }[];
      appts: { id: string; bay_id: string | null; kind: string; status: string;
               starts_at: string; ends_at: string | null; client_name: string | null;
               vehicle: string }[];
    };
  });
}

export async function stock() {
  return withTenant(OWNER, async c => {
    const { rows } = await c.query(`
      select fr.id, fr.batch_number, fr.barcode, fr.meters_initial, fr.meters_left,
             fr.received_at, fr.depleted_at, ci.sku, ci.brand, ci.name,
             coalesce((select sum(-sm.delta_meters) from stock_moves sm
                        where sm.roll_id = fr.id and sm.reason = 'consume'), 0) as consumed,
             (select count(*) from orders o
               where o.verified_roll_id = fr.id and o.status = 'in_work')::int as booked
        from film_rolls fr join catalog_items ci on ci.id = fr.catalog_item_id
       order by fr.depleted_at nulls first, ci.sku`);
    const moves = (await c.query(`
      select sm.at, sm.reason::text, sm.delta_meters, ci.sku, o.number as order_number
        from stock_moves sm
        join film_rolls fr on fr.id = sm.roll_id
        join catalog_items ci on ci.id = fr.catalog_item_id
        left join orders o on o.id = sm.order_id
       order by sm.at desc limit 12`)).rows;
    return { rolls: rows, moves } as {
      rolls: { id: string; batch_number: string; barcode: string; meters_initial: string;
               meters_left: string; received_at: string; depleted_at: string | null;
               sku: string; brand: string; name: string; consumed: string; booked: number }[];
      moves: { at: string; reason: string; delta_meters: string; sku: string;
               order_number: string | null }[];
    };
  });
}

export async function billing() {
  return withTenant(OWNER, async c => {
    const sub = (await c.query(
      `select plan, price_kopecks, period_start, period_end, status
         from subscriptions where point_id = $1 order by period_end desc limit 1`,
      [OWNER.point_id])).rows[0];
    const b = (await c.query(`select * from app.budget_state($1)`, [OWNER.point_id])).rows[0];
    const byCat = (await c.query(`
      select category::text, render_class::text, count(*)::int as n,
             sum(cost_kopecks)::int as cost
        from generation_usage
       where created_at >= date_trunc('month', now())
       group by 1,2 order by cost desc`)).rows;
    return { sub, budget: b, byCat } as {
      sub: { plan: string; price_kopecks: number; period_start: string;
             period_end: string; status: string } | undefined;
      budget: { spent_kopecks: number; soft_limit: number; hard_limit: number;
                soft_reached: boolean; hard_reached: boolean };
      byCat: { category: string; render_class: string; n: number; cost: number }[];
    };
  });
}

/** Центр событий: то, что требует человека, а не уведомление в никуда. */
export async function events() {
  return withTenant(OWNER, async c => {
    const { rows } = await c.query(`
      select al.at, al.action, al.entity, al.detail, u.name as actor
        from audit_log al left join users u on u.id = al.actor_id
       order by al.at desc limit 20`);
    return rows as { at: string; action: string; entity: string;
                     detail: Record<string, unknown>; actor: string | null }[];
  });
}

/** Отчёт по менеджерам: кто доводит до подтверждённого выбора. */
export async function managerReport() {
  return withTenant(OWNER, async c => {
    const { rows } = await c.query(`
      select u.id, u.name,
             (select count(*) from threads t where t.assigned_to = u.id)::int as threads,
             (select count(*) from configurations cfg where cfg.created_by = u.id)::int as tryons,
             (select count(*) from confirmations cf
                join configurations cfg on cfg.id = cf.configuration_id
               where cfg.created_by = u.id)::int as confirmed
        from users u where u.role = 'manager' and u.point_id = $1
       order by u.name`, [OWNER.point_id]);
    return rows as { id: string; name: string; threads: number; tryons: number;
                     confirmed: number }[];
  });
}
