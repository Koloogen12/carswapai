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
    const bays = (await c.query(`
      select b.id, b.name,
             (select u.name from shifts sh join users u on u.id = sh.user_id
               where sh.point_id = b.point_id and sh.kind = 'work'
                 and now() between sh.starts_at and sh.ends_at limit 1) as master
        from bays b where b.active order by b.name`)).rows;
    const appts = (await c.query(`
      select ap.id, ap.bay_id, ap.kind::text, ap.status::text, ap.starts_at, ap.ends_at,
             cl.name as client_name, cl.vehicle->>'model' as model,
             ci.name as item_name, o.number as order_number, fr.batch_number
        from appointments ap
        left join clients cl on cl.id = ap.client_id
        left join configurations cfg on cfg.id = ap.configuration_id
        left join configuration_items cit on cit.configuration_id = cfg.id
        left join point_prices pp on pp.id = cit.point_price_id
        left join catalog_items ci on ci.id = pp.catalog_item_id
        left join confirmations cf on cf.configuration_id = cfg.id
        left join orders o on o.confirmation_id = cf.id
        left join film_rolls fr on fr.id = o.verified_roll_id
       where ap.starts_at > now() - interval '1 day' and ap.status <> 'cancelled'
       order by ap.starts_at`)).rows;
    // Ждут слот: подтвердили выбор, но записи нет. В макете они стоят
    // в свободной части ленты — свободный пост и ждущий клиент рядом,
    // чтобы накладка была видна раньше, чем случится.
    const waiting = (await c.query(`
      select cl.name, ci.name as item_name
        from confirmations cf
        join configurations cfg on cfg.id = cf.configuration_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
       where not exists (select 1 from appointments ap
                          where ap.configuration_id = cfg.id and ap.status <> 'cancelled')
       limit 3`)).rows;
    return { bays, appts, waiting } as {
      bays: { id: string; name: string; master: string | null }[];
      appts: { id: string; bay_id: string | null; kind: string; status: string;
               starts_at: string; ends_at: string | null; client_name: string | null;
               model: string | null; item_name: string | null;
               order_number: string | null; batch_number: string | null }[];
      waiting: { name: string | null; item_name: string }[];
    };
  });
}

export async function stock() {
  return withTenant(OWNER, async c => {
    // Забронировано под подтверждённые выборы: именно оно превращает
    // «есть 9,6 м» в «не хватит». Остаток без брони ничего не значит.
    const rolls = (await c.query(`
      select fr.id, fr.batch_number, fr.barcode, fr.meters_initial, fr.meters_left,
             fr.received_at, fr.depleted_at, ci.sku, ci.brand, ci.name, ci.id as item_id,
             coalesce((select sum(cit.meters_required) from configuration_items cit
                        join point_prices pp2 on pp2.id = cit.point_price_id
                        join confirmations cf on cf.configuration_id = cit.configuration_id
                        left join orders o on o.confirmation_id = cf.id
                       where pp2.catalog_item_id = ci.id
                         and coalesce(o.status, 'created') <> 'done'), 0) as booked_meters,
             (select cl.name from configuration_items cit
                join point_prices pp2 on pp2.id = cit.point_price_id
                join confirmations cf on cf.configuration_id = cit.configuration_id
                join configurations cfg on cfg.id = cit.configuration_id
                left join threads t on t.id = cfg.thread_id
                left join clients cl on cl.id = t.client_id
               where pp2.catalog_item_id = ci.id limit 1) as booked_for
        from film_rolls fr join catalog_items ci on ci.id = fr.catalog_item_id
       order by fr.depleted_at nulls first, ci.sku`)).rows;

    // Артикулы прайса, под которые рулона нет вовсе: гаснут в панели
    // и в гараже сами, а здесь видны как «заказать».
    const missing = (await c.query(`
      select ci.sku, ci.brand, ci.name,
             coalesce((select sum(cit.meters_required) from configuration_items cit
                        join point_prices pp2 on pp2.id = cit.point_price_id
                        join confirmations cf on cf.configuration_id = cit.configuration_id
                       where pp2.catalog_item_id = ci.id), 0) as need
        from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
       where ci.category in ('film','ppf')
         and not exists (select 1 from film_rolls fr
                          where fr.catalog_item_id = ci.id and fr.depleted_at is null)
       order by need desc limit 4`)).rows;

    const moves = (await c.query(`
      select sm.at, sm.reason::text, sm.delta_meters, ci.sku, o.number as order_number
        from stock_moves sm
        join film_rolls fr on fr.id = sm.roll_id
        join catalog_items ci on ci.id = fr.catalog_item_id
        left join orders o on o.id = sm.order_id
       order by sm.at desc limit 8`)).rows;

    return { rolls, missing, moves } as {
      rolls: { id: string; batch_number: string; barcode: string; meters_initial: string;
               meters_left: string; received_at: string; depleted_at: string | null;
               sku: string; brand: string; name: string; booked_meters: string;
               booked_for: string | null }[];
      missing: { sku: string; brand: string; name: string; need: string }[];
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

/**
 * Центр событий.
 *
 * Событие — доменный факт, а не строка аудит-лога. Лог отвечает на вопрос
 * «что произошло», а владельцу нужен другой: «что требует меня прямо сейчас».
 * Поэтому лента собирается из состояний, на которые можно ответить действием:
 * заблокированный наряд, порог расхода с аномалией, подтверждённый выбор,
 * запись через гараж без участия менеджера.
 */
export type PointEvent = {
  kind: 'roll_mismatch' | 'budget' | 'confirmed' | 'self_booked' | 'channel';
  tone: 'alert' | 'warm' | 'plain';
  title: string; detail: string; at: string; read: boolean;
};

export async function events(): Promise<PointEvent[]> {
  return withTenant(OWNER, async c => {
    const out: PointEvent[] = [];

    const blocked = (await c.query(`
      select o.number, ci.sku, al.at
        from audit_log al
        join orders o on o.id = al.entity_id
        join confirmations cf on cf.id = o.confirmation_id
        join configurations cfg on cfg.id = cf.configuration_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
       where al.action = 'order.roll_mismatch' order by al.at desc limit 3`)).rows;
    for (const b of blocked) out.push({
      kind: 'roll_mismatch', tone: 'alert', at: b.at, read: false,
      title: 'Рулон не сошёлся',
      detail: `Наряд ${b.number} · в записи ${b.sku}, на рулоне другой артикул. Наряд заблокирован`,
    });

    const [bud] = (await c.query(`select * from app.budget_state($1)`, [OWNER.point_id])).rows;
    const pct = bud.hard_limit ? Math.round((bud.spent_kopecks / bud.hard_limit) * 100) : 0;
    if (pct >= 60) {
      const [spike] = (await c.query(`
        select count(*)::int as n from generation_usage
         where created_at > now() - interval '24 hours'`)).rows;
      out.push({
        kind: 'budget', tone: pct >= 100 ? 'alert' : 'warm', at: new Date().toISOString(),
        read: false, title: `Генерации на ${pct}%`,
        detail: spike.n > 100
          ? `Аномалия: ${spike.n} примерок за сутки — проверьте гараж на накрутку`
          : 'По текущему темпу расход укладывается в потолок',
      });
    }

    const conf = (await c.query(`
      select cf.confirmed_at, cl.name, ci.name as item, o.number
        from confirmations cf
        join configurations cfg on cfg.id = cf.configuration_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
        left join orders o on o.confirmation_id = cf.id
       order by cf.confirmed_at desc limit 4`)).rows;
    for (const x of conf) out.push({
      kind: 'confirmed', tone: 'plain', at: x.confirmed_at, read: true,
      title: `${x.name ?? 'Клиент'} подтвердил выбор`,
      detail: `${x.item}${x.number ? ` · наряд ${x.number} создан` : ' · наряд ещё не создан'}`,
    });

    // Запись через гараж без участия менеджера — отдельное событие: это
    // подтверждение, что второе ядро работает само.
    const self = (await c.query(`
      select ap.starts_at, ap.created_at, cl.name
        from appointments ap
        join configurations cfg on cfg.id = ap.configuration_id
        left join clients cl on cl.id = ap.client_id
       where cfg.origin = 'garage' or cfg.thread_id is null
       order by ap.created_at desc limit 3`)).rows;
    for (const x of self) out.push({
      kind: 'self_booked', tone: 'plain', at: x.created_at, read: true,
      title: `${x.name ?? 'Клиент'} записался на ${new Date(x.starts_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`,
      detail: 'через гараж, без участия менеджера',
    });

    const dead = (await c.query(
      `select kind::text, last_error from channels where status <> 'connected'`)).rows;
    for (const ch of dead) out.push({
      kind: 'channel', tone: 'alert', at: new Date().toISOString(), read: false,
      title: `Канал ${ch.kind} отвалился`,
      detail: ch.last_error ?? 'Повторная привязка — внутри продукта, за три действия',
    });

    return out.sort((a, b) => (a.read === b.read ? +new Date(b.at) - +new Date(a.at)
                                                 : a.read ? 1 : -1));
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
