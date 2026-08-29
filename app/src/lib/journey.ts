'use server';
import { revalidatePath } from 'next/cache';
import { sys } from './db';

/**
 * Клиентский путь, заход 1: от «нравится» до оплаченной работы.
 *
 * Читается публично по неперебираемому идентификатору конфигурации — это
 * ссылка, которую клиент открывает из своего мессенджера, без входа и пароля.
 * Поэтому здесь нет арендаторного контекста, а запрос отдаёт ровно ту
 * конфигурацию, чей идентификатор знает открывший, и ничего вокруг неё.
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
  const rows = await sys<Journey>(`
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
                       'photo', (select cp.storage_path from condition_photos cp
                                  where cp.point_id = co.point_id limit 1))
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
}

/** М-7 · клиент фиксирует выбор сам. Подтверждение — событие, а не реплика. */
export async function confirmChoice(configId: string) {
  try {
    const card = await sys<{ id: string; point_id: string }>(
      `select id, point_id from outbound_cards where configuration_id = $1 limit 1`, [configId]);
    if (!card.length) return { ok: false as const, error: 'Карточка ещё не отправлена' };
    await sys(
      `insert into confirmations (point_id, configuration_id, outbound_card_id, confirmed_via, ip)
       values ($1,$2,$3,'link',null)`,
      [card[0].point_id, configId, card[0].id]);
    revalidatePath(`/c/${configId}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

/** М-8 · слот замера выбирает клиент, в момент, когда он ещё горячий. */
export async function bookSlot(configId: string, iso: string) {
  try {
    const cfg = await sys<{ point_id: string; client_id: string | null }>(
      `select cfg.point_id, t.client_id from configurations cfg
         left join threads t on t.id = cfg.thread_id where cfg.id = $1`, [configId]);
    if (!cfg.length) return { ok: false as const, error: 'Конфигурация не найдена' };
    await sys(
      `insert into appointments (point_id, client_id, configuration_id, kind, starts_at, ends_at)
       values ($1,$2,$3,'measure',$4,$4::timestamptz + interval '20 minutes')`,
      [cfg[0].point_id, cfg[0].client_id, configId, iso]);
    revalidatePath(`/c/${configId}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

/** Предоплата. Долг пересчитывается сам — колонки под него нет. */
export async function payPrepay(configId: string, invoiceId: string, kopecks: number,
                                pointId: string) {
  try {
    await sys(`insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
               values ($1,$2,'prepay',$3,'card')`, [pointId, invoiceId, kopecks]);
    revalidatePath(`/c/${configId}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

/**
 * Клиент согласует доплату сам — своим действием и с датой, как и цвет.
 * Согласованная сумма после этого не переписывается: на выдаче она
 * предъявляется наравне с выбором цвета.
 */
export async function decideChange(configId: string, changeId: string, approve: boolean) {
  try {
    await sys(
      `update change_orders set status = $2::change_status, client_acted_at = now()
        where id = $1 and status = 'proposed'`,
      [changeId, approve ? 'approved' : 'declined']);
    revalidatePath(`/c/${configId}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

/** Перенос замера. Отмена и возврат — отдельная ветка, не «удалить визит». */
export async function reschedule(configId: string, appointmentId: string, iso: string) {
  try {
    const rows = await sys<{ point_id: string; client_id: string | null }>(
      `select point_id, client_id from appointments where id = $1`, [appointmentId]);
    if (!rows.length) return { ok: false as const, error: 'Визит не найден' };
    await sys(`update appointments set status = 'moved' where id = $1`, [appointmentId]);
    await sys(
      `insert into appointments (point_id, client_id, configuration_id, kind, starts_at,
                                 ends_at, moved_from)
       values ($1,$2,$3,'measure',$4,$4::timestamptz + interval '20 minutes',$5)`,
      [rows[0].point_id, rows[0].client_id, configId, iso, appointmentId]);
    revalidatePath(`/c/${configId}`);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}
