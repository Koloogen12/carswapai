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
    const deals = await q(`
      select cl.name, cf.confirmed_at, ci.sku, ci.name as item, cit.price_kopecks
        from confirmations cf
        join configurations cfg on cfg.id = cf.configuration_id
        join threads t on t.id = cfg.thread_id
        join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
       order by cf.confirmed_at desc`);
    const [usage] = await q(`select * from app.budget_state($1)`, [OWNER.point_id]);
    const staff = await q(`select name, role::text, active from users where point_id = $1
                            order by role`, [OWNER.point_id]);
    return { cover, deals, usage, staff };
  });
}

export async function networkPanel() {
  return withTenant(NETWORK, async c => {
    const { rows } = await c.query(`
      select p.id, p.name, p.status::text,
             (select count(*) from threads t where t.point_id = p.id)::int as threads,
             (select count(*) from confirmations cf where cf.point_id = p.id)::int as confirmed,
             coalesce((select sum(cost_kopecks) from generation_usage g
                        where g.point_id = p.id), 0)::int as spent,
             p.hard_cap_kopecks
        from points p order by p.name`);
    return rows as { id: string; name: string; status: string; threads: number;
                     confirmed: number; spent: number; hard_cap_kopecks: number }[];
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
             (select o.status from orders o
               join confirmations cf on cf.id = o.confirmation_id
               join configurations cfg on cfg.id = cf.configuration_id
               join threads t on t.id = cfg.thread_id where t.client_id = cl.id
               order by o.created_at desc limit 1) as order_status
        from clients cl order by cl.created_at desc`);
    return rows as { id: string; name: string; phone: string; vehicle: Record<string, unknown>;
                     tryons: number; confirmed_at: string | null; order_status: string | null }[];
  });
}
