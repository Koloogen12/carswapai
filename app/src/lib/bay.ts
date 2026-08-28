'use server';
import { revalidatePath } from 'next/cache';
import { withTenant } from './db';
import { MANAGER } from './data';

const MASTER = { ...MANAGER, app_role: 'master' as const,
                 user_id: 'c0000000-0000-4000-8000-000000000002' };

export type BayRecord = {
  order_id: string; number: string; status: string;
  client_name: string; plate: string | null; vehicle: string;
  sku: string; item_name: string; brand: string; price_kopecks: number;
  meters_required: string | null;
  confirmed_at: string; honesty_shown: boolean; honesty_line: string;
  renders: { variant: string; storage_path: string }[];
  batch_number: string | null; batch_verified_at: string | null;
};

export async function bayRecord(orderId: string): Promise<BayRecord | null> {
  return withTenant(MASTER, async c => {
    const { rows } = await c.query(`
      select o.id as order_id, o.number, o.status, o.batch_number, o.batch_verified_at,
             cl.name as client_name, cl.vehicle->>'plate' as plate,
             coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','') as vehicle,
             ci2.sku, ci2.name as item_name, ci2.brand, cit.price_kopecks, cit.meters_required,
             cf.confirmed_at, cf.honesty_shown, oc.honesty_line
        from orders o
        join confirmations cf on cf.id = o.confirmation_id
        join outbound_cards oc on oc.id = cf.outbound_card_id
        join configurations cfg on cfg.id = cf.configuration_id
        join threads t on t.id = cfg.thread_id
        join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci2 on ci2.id = pp.catalog_item_id
       where o.id = $1 limit 1`, [orderId]);
    if (!rows.length) return null;
    const r = rows[0];
    const rend = await c.query(`
      select r.variant::text, r.storage_path
        from renders r join configuration_items cit on cit.id = r.configuration_item_id
        join configurations cfg on cfg.id = cit.configuration_id
        join confirmations cf on cf.configuration_id = cfg.id
       where cf.id = (select confirmation_id from orders where id = $1)
       order by array_position(array['day','overcast','parking'], r.variant::text)`, [orderId]);
    return { ...r, renders: rend.rows } as BayRecord;
  });
}

export async function rollsFor(orderId: string) {
  return withTenant(MASTER, async c => {
    const { rows } = await c.query(`
      select fr.id, fr.barcode, fr.batch_number, fr.meters_left, ci.sku, ci.name
        from film_rolls fr join catalog_items ci on ci.id = fr.catalog_item_id
       where fr.depleted_at is null order by ci.sku`);
    return rows as { id: string; barcode: string; batch_number: string;
                     meters_left: string; sku: string; name: string }[];
  });
}

/**
 * МС-3 · сверка рулона.
 *
 * Функция не решает, совпал ли артикул — она пробует перевести наряд в работу,
 * а решает база. Если рулон не тот, триггер отклоняет переход, и сюда придёт
 * ошибка. Так проверку нельзя обойти, поправив этот файл.
 */
export async function verifyRoll(orderId: string, rollId: string) {
  return withTenant(MASTER, async c => {
    try {
      await c.query(
        `update orders set status = 'in_work', verified_roll_id = $2, verified_by = $3
          where id = $1`, [orderId, rollId, MASTER.user_id]);
      await c.query(
        `insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
         values ($1,$2,'master','order.roll_verified','orders',$3, jsonb_build_object('roll',$4))`,
        [MANAGER.point_id, MASTER.user_id, orderId, rollId]);
      revalidatePath(`/bay/${orderId}`);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

export async function closeWork(orderId: string) {
  return withTenant(MASTER, async c => {
    await c.query(`update orders set status = 'done' where id = $1`, [orderId]);
    revalidatePath(`/bay/${orderId}`);
    return { ok: true as const };
  });
}

/** Наряды мастера: его смена, а не все наряды точки. */
export async function myOrders() {
  return withTenant(MASTER, async c => {
    const { rows } = await c.query(`
      select o.id, o.number, o.status, o.batch_verified_at,
             cl.name as client_name, cl.vehicle->>'plate' as plate,
             trim(coalesce(cl.vehicle->>'make','')||' '||coalesce(cl.vehicle->>'model','')) as vehicle,
             ci.brand, ci.sku, ci.name as item_name, cit.meters_required::text as meters,
             (select r.storage_path from renders r
               where r.configuration_item_id = cit.id and r.variant = 'day') as thumb
        from orders o
        join confirmations cf on cf.id = o.confirmation_id
        join configurations cfg on cfg.id = cf.configuration_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
       order by array_position(array['in_work','created','done'], o.status), o.created_at desc`);
    return rows as { id: string; number: string; status: string; batch_verified_at: string | null;
                     client_name: string | null; plate: string | null; vehicle: string;
                     brand: string; sku: string; item_name: string; meters: string | null;
                     thumb: string | null }[];
  });
}
