import { withTenant, type Claims } from './db';
import type { ChannelId, TryonStateId } from './domain';

/** Претензии менеджера демо-точки. В проде приходят из сессии. */
export const MANAGER: Claims = {
  app_role: 'manager',
  point_id: 'b0000000-0000-4000-8000-000000000001',
  network_id: 'a0000000-0000-4000-8000-000000000001',
  user_id: 'c0000000-0000-4000-8000-000000000001',
};
export const OWNER: Claims = { ...MANAGER, app_role: 'owner' };
export const NETWORK: Claims = {
  app_role: 'network_admin', network_id: 'a0000000-0000-4000-8000-000000000001',
  user_id: 'c0000000-0000-4000-8000-000000000004',
};

export type InboxRow = {
  thread_id: string; client_id: string; client_name: string; phone: string | null;
  vehicle: { make?: string; model?: string; year?: number; plate?: string };
  channel: ChannelId; last_text: string | null; last_at: string;
  state: TryonStateId | null; assigned_to: string | null; unread: number;
};

/**
 * Инбокс точки. Канал берётся из последнего сообщения треда, а не из поля
 * диалога: О-5 — канал это свойство сообщения. Вкладок по каналам нет,
 * и запрос устроен так, что построить их было бы неудобно.
 */
export async function inbox(claims = MANAGER): Promise<InboxRow[]> {
  return withTenant(claims, async c => {
    const { rows } = await c.query(`
      select t.id as thread_id, cl.id as client_id, cl.name as client_name, cl.phone,
             cl.vehicle,
             (select ch.kind from messages m join channels ch on ch.id = m.channel_id
               where m.thread_id = t.id order by m.sent_at desc limit 1) as channel,
             (select m.body from messages m where m.thread_id = t.id
               order by m.sent_at desc limit 1) as last_text,
             t.last_message_at as last_at, t.assigned_to,
             (select count(*) from messages m where m.thread_id = t.id and m.direction = 'in')::int
               as unread,
             case
               when exists (select 1 from confirmations cf
                             join configurations cfg on cfg.id = cf.configuration_id
                            where cfg.thread_id = t.id) then 'confirmed'
               when exists (select 1 from messages m where m.thread_id = t.id
                             and m.direction = 'out' and m.delivery = 'failed') then 'undelivered'
               when exists (select 1 from outbound_cards oc
                             join configurations cfg on cfg.id = oc.configuration_id
                            where cfg.thread_id = t.id) then 'sent'
               else null
             end as state
        from threads t
        join clients cl on cl.id = t.client_id
       order by t.last_message_at desc nulls last`);
    return rows as InboxRow[];
  });
}

export type ThreadMessage = {
  id: string; direction: 'in' | 'out'; body: string | null; channel: ChannelId;
  sent_at: string; delivery: string; card_id: string | null;
};

export type ThreadView = {
  thread_id: string; client_name: string; phone: string | null;
  vehicle: { make?: string; model?: string; year?: number; plate?: string };
  vehicle_model_id: string | null;
  messages: ThreadMessage[];
};

export async function thread(id: string, claims = MANAGER): Promise<ThreadView | null> {
  return withTenant(claims, async c => {
    const head = await c.query(`
      select t.id as thread_id, cl.name as client_name, cl.phone, cl.vehicle,
             cl.vehicle_model_id
        from threads t join clients cl on cl.id = t.client_id
       where t.id = $1`, [id]);
    if (!head.rows.length) return null;
    const msgs = await c.query(`
      select m.id, m.direction, m.body, ch.kind as channel, m.sent_at, m.delivery,
             m.outbound_card_id as card_id
        from messages m join channels ch on ch.id = m.channel_id
       where m.thread_id = $1 order by m.sent_at asc`, [id]);
    return { ...head.rows[0], messages: msgs.rows } as ThreadView;
  });
}

export type PriceRow = {
  point_price_id: string; catalog_item_id: string; sku: string; name: string;
  brand: string; finish: string; category: string; price_kopecks: number;
  in_stock: boolean; hex: string | null; render_class: 'A' | 'B';
};

/**
 * Прайс точки. О-3: единственный источник артикулов и цен. Запрос физически
 * не может вернуть артикул, которого нет в прайсе этой точки — соединение
 * идёт от point_prices, а не от каталога.
 */
export async function priceList(claims = MANAGER, category?: string): Promise<PriceRow[]> {
  return withTenant(claims, async c => {
    const { rows } = await c.query(`
      select pp.id as point_price_id, ci.id as catalog_item_id, ci.sku, ci.name, ci.brand,
             ci.finish::text, ci.category::text, pp.price_kopecks, pp.in_stock,
             ci.attrs->>'hex' as hex, ci.default_class::text as render_class
        from point_prices pp
        join catalog_items ci on ci.id = pp.catalog_item_id
       where pp.zone_code = 'full_body' and ci.active
         and ($1::text is null or ci.category::text = $1)
       order by ci.category, pp.price_kopecks desc`, [category ?? null]);
    return rows as PriceRow[];
  });
}

export async function budget(claims = MANAGER) {
  return withTenant(claims, async c => {
    const { rows } = await c.query(
      `select * from app.budget_state($1)`, [claims.point_id]);
    return rows[0] as {
      spent_kopecks: number; soft_limit: number; hard_limit: number;
      soft_reached: boolean; hard_reached: boolean;
    };
  });
}

export async function channelHealth(claims = MANAGER) {
  return withTenant(claims, async c => {
    const { rows } = await c.query(`
      select kind::text, provider, status, can_send_images, can_initiate, last_error
        from channels order by kind`);
    return rows as { kind: ChannelId; provider: string; status: string;
                     can_send_images: boolean; can_initiate: boolean; last_error: string | null }[];
  });
}

export type CardView = {
  title: string;
  variants: { name: string; sku: string; price: string;
              day: string; overcast: string; parking: string }[];
};

/** Отправленные карточки треда с рендерами по трём светам. */
export async function cardsOf(threadId: string, claims = MANAGER) {
  return withTenant(claims, async c => {
    const { rows } = await c.query(`
      select oc.id as card_id, ci.name, ci.sku, ci.brand, cit.price_kopecks,
             max(r.storage_path) filter (where r.variant = 'day')      as day,
             max(r.storage_path) filter (where r.variant = 'overcast') as overcast,
             max(r.storage_path) filter (where r.variant = 'parking')  as parking
        from outbound_cards oc
        join configurations cfg on cfg.id = oc.configuration_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
        join renders r on r.configuration_item_id = cit.id
       where cfg.thread_id = $1
       group by oc.id, ci.name, ci.sku, ci.brand, cit.price_kopecks, cit.id
       order by oc.id`, [threadId]);
    const out: Record<string, CardView> = {};
    for (const r of rows) {
      (out[r.card_id] ??= { title: 'Три плёнки · три света', variants: [] }).variants.push({
        name: r.name, sku: `${r.brand} ${r.sku}`,
        price: Math.round(r.price_kopecks / 100).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽',
        day: r.day, overcast: r.overcast, parking: r.parking,
      });
    }
    return out;
  });
}

/** Метраж плёнки под кузов клиента, если он известен (М-9). */
export async function metersFor(vehicleModelId: string | null, claims = MANAGER) {
  if (!vehicleModelId) return null;
  return withTenant(claims, async c => {
    const { rows } = await c.query(
      `select running_meters::text from vehicle_zone_metrage
        where vehicle_model_id = $1 and zone_code = 'full_body'`, [vehicleModelId]);
    return rows[0]?.running_meters ?? null;
  });
}
