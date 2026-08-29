import { withTenant } from './db';
import { MANAGER, NETWORK, OWNER } from './data';

export async function ownerSummary() {
  return withTenant(OWNER, async c => {
    const q = async (sql: string, p: unknown[] = []) => (await c.query(sql, p)).rows;
    const [cover] = await q(`
      select count(*)::int as threads,
             count(*) filter (where exists (
               select 1 from outbound_cards oc join configurations cfg on cfg.id = oc.configuration_id
                where cfg.thread_id = t.id))::int as with_tryon
        from threads t`);

    // В-3 · сделки поимённо. Атрибуция консервативная: без подтверждения
    // клиента строки нет, даже если сделка состоялась.
    const deals = await q(`
      select cl.name, cf.confirmed_at, ci.sku, ci.name as item, cit.price_kopecks,
             trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')||' '||
                  coalesce(cl.vehicle->>'year','')) as vehicle,
             o.status as order_status, o.number,
             cfg.origin::text as origin,
             (select min(ap.starts_at) from appointments ap
               where ap.configuration_id = cfg.id and ap.kind = 'measure') as measure_at,
             (select r.storage_path from renders r
               where r.configuration_item_id = cit.id and r.variant = 'day') as thumb
        from confirmations cf
        join configurations cfg on cfg.id = cf.configuration_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
        left join orders o on o.confirmation_id = cf.id
       order by cf.confirmed_at desc`);

    const [usage] = await q(`select * from app.budget_state($1)`, [OWNER.point_id]);

    // Расход поимённо: аномалия видна только когда рядом стоят люди
    // и трафик из канала. Одной цифрой «за месяц» её не поймать.
    const byActor = await q(`
      select coalesce(u.name, case when g.session_id is not null
                                   then 'Гараж по публичной ссылке' else 'Система' end) as actor,
             count(*)::int as n, sum(g.cost_kopecks)::int as cost
        from generation_usage g left join users u on u.id = g.user_id
       where g.created_at >= date_trunc('month', now())
       group by 1 order by n desc limit 5`);

    const staff = await q(`select name, role::text, active from users where point_id = $1
                            order by role`, [OWNER.point_id]);
    return { cover, deals, usage, byActor, staff };
  });
}

export async function networkPanel() {
  return withTenant(NETWORK, async c => {
    const points = (await c.query(`
      select p.id, p.name, p.status::text,
             (select count(*) from threads t where t.point_id = p.id)::int as threads,
             (select count(*) from threads t
               where t.point_id = p.id and exists (
                 select 1 from outbound_cards oc
                   join configurations cfg on cfg.id = oc.configuration_id
                  where cfg.thread_id = t.id))::int as with_tryon,
             (select count(*) from confirmations cf where cf.point_id = p.id)::int as deals,
             coalesce((select sum(cost_kopecks) from generation_usage g
                        where g.point_id = p.id), 0)::int as spent,
             p.hard_cap_kopecks
        from points p order by p.name`)).rows as {
      id: string; name: string; status: string; threads: number; with_tryon: number;
      deals: number; spent: number; hard_cap_kopecks: number;
    }[];

    // Обращения точек в управляющую компанию — главный критерий плательщика.
    // Считается явно: любое обращение, дошедшее до УК, попадает в лог.
    const [esc] = (await c.query(`
      select count(*)::int as n from audit_log
       where action = 'point.escalated_to_network'
         and at >= date_trunc('month', now())`)).rows;

    // Краевой случай №2 · точка мертва тихо: подключена, платит, но первой
    // отправки не было. Она не пишет и не жалуется — её надо искать самим.
    // Пороги 24 / 48 / 72 часа.
    const silent = (await c.query(`
      select p.id, p.name,
             round(extract(epoch from now() - p.created_at) / 3600)::int as hours
        from points p
       where not exists (select 1 from outbound_cards oc where oc.point_id = p.id)
       order by hours desc`)).rows as { id: string; name: string; hours: number }[];

    const [net] = (await c.query(`
      select n.price_deviation_allowed_pct::int as markup,
             (select count(*) from catalog_items where active)::int as skus,
             (select count(*) from point_budgets pb where pb.released_at is not null)::int as released
        from networks n where n.id = $1`, [NETWORK.network_id])).rows;

    const withCoverage = points.map(p => ({
      ...p, coverage: p.threads ? Math.round((p.with_tryon / p.threads) * 100) : 0,
    })).sort((a, b) => b.coverage - a.coverage);

    const cov = withCoverage.map(p => p.coverage);
    return {
      points: withCoverage,
      silent, net,
      escalations: esc.n as number,
      avgCoverage: cov.length ? Math.round(cov.reduce((a, x) => a + x, 0) / cov.length) : 0,
      minCoverage: cov.length ? Math.min(...cov) : 0,
      maxCoverage: cov.length ? Math.max(...cov) : 0,
      withDeals: withCoverage.filter(p => p.deals > 0).length,
    };
  });
}

export async function crmClients() {
  return withTenant(MANAGER, async c => {
    const { rows } = await c.query(`
      select cl.id, cl.name, cl.phone, cl.vehicle,
             (select count(*) from configurations cfg
               join threads t on t.id = cfg.thread_id where t.client_id = cl.id)::int as tryons,
             (select max(cf.confirmed_at) from confirmations cf
               join configurations cfg on cfg.id = cf.configuration_id
               join threads t on t.id = cfg.thread_id where t.client_id = cl.id) as confirmed_at,
             (select cit.price_kopecks from configuration_items cit
                join configurations cfg on cfg.id = cit.configuration_id
                join threads t on t.id = cfg.thread_id where t.client_id = cl.id
                order by cit.price_kopecks desc limit 1) as price_kopecks,
             (select min(ap.starts_at) from appointments ap where ap.client_id = cl.id
               and ap.kind = 'measure') as measure_at,
             (select o.status from orders o
               join confirmations cf on cf.id = o.confirmation_id
               join configurations cfg on cfg.id = cf.configuration_id
               join threads t on t.id = cfg.thread_id where t.client_id = cl.id
               order by o.created_at desc limit 1) as order_status
        from clients cl order by cl.created_at desc`);
    return rows as { id: string; name: string; phone: string; vehicle: Record<string, unknown>;
                     tryons: number; confirmed_at: string | null; order_status: string | null;
                     price_kopecks: number | null; measure_at: string | null }[];
  });
}

export async function staffList() {
  return withTenant(OWNER, async c => {
    const { rows } = await c.query(`
      select id, name, phone, role::text, active, created_at
        from users where point_id = $1
       order by array_position(array['owner','manager','master'], role::text)`,
      [OWNER.point_id]);
    return rows as { id: string; name: string; phone: string; role: string;
                     active: boolean; created_at: string }[];
  });
}

/** Сетевой каталог, коридор наценки и тарифы по точкам, модули 05–07 захода 3. */
export async function networkCatalog() {
  return withTenant(NETWORK, async c => {
    const items = (await c.query(`
      select ci.id, ci.brand, ci.sku, ci.name, np.price_kopecks as base,
             n.price_deviation_allowed_pct::int as corridor,
             (select count(*) from point_prices pp where pp.catalog_item_id = ci.id)::int as points
        from network_prices np
        join catalog_items ci on ci.id = np.catalog_item_id
        join networks n on n.id = np.network_id
       where ci.active order by np.price_kopecks desc limit 6`)).rows;

    const tariffs = (await c.query(`
      select p.id, p.name, p.soft_cap_kopecks, p.hard_cap_kopecks,
             coalesce((select sum(cost_kopecks) from generation_usage g
                        where g.point_id = p.id
                          and g.created_at >= date_trunc('month', now())), 0)::int as spent,
             exists (select 1 from point_budgets pb
                      where pb.point_id = p.id and pb.released_at is not null) as released,
             exists (select 1 from outbound_cards oc where oc.point_id = p.id) as started
        from points p order by p.name`)).rows;

    return { items, tariffs } as {
      items: { id: string; brand: string; sku: string; name: string; base: number;
               corridor: number; points: number }[];
      tariffs: { id: string; name: string; soft_cap_kopecks: number; hard_cap_kopecks: number;
                 spent: number; released: boolean; started: boolean }[];
    };
  });
}
