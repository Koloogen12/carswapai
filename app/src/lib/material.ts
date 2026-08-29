'use server';
/**
 * Заявка на материал в сеть.
 *
 * Кнопка «Отправить заявку в сеть» на складе была нарисованной, хотя таблица
 * под неё лежала в базе с самого начала (миграция 004). Экран считал, чего не
 * хватает под подтверждённые выборы, показывал сумму закупки — и не умел
 * отправить ничего.
 *
 * Цена бездействия тут прямая и её видно на самом экране: материал не пришёл
 * к слоту — переносим замер, а переносить замер клиенту, который уже сказал
 * «беру», значит его терять.
 *
 * Заявка собирается из подтверждённых выборов, а не из ощущения владельца,
 * что плёнка заканчивается. Поэтому здесь нет поля «сколько заказать»: сколько
 * не хватает, столько и заказываем.
 */
import { revalidatePath } from 'next/cache';
import { claimsFor } from './session';
import { withTenant } from './db';

export async function requestMaterial(items: { itemId: string; meters: number }[]) {
  const pick = items.filter(i => i.itemId && i.meters > 0);
  if (!pick.length) return { ok: false as const, error: 'заказывать нечего — материала хватает' };

  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      // Повтор нажатия не должен превращаться во вторую поставку: если по
      // артикулу уже есть открытая заявка, она обновляется, а не дублируется.
      for (const it of pick) {
        const upd = await c.query(
          `update material_requests set meters = $3, created_at = now(), created_by = $4
            where point_id = $1 and catalog_item_id = $2 and status = 'open'`,
          [who.point_id, it.itemId, it.meters, who.user_id]);
        if (!upd.rowCount) {
          await c.query(
            `insert into material_requests (point_id, catalog_item_id, meters, created_by)
             values ($1,$2,$3,$4)`, [who.point_id, it.itemId, it.meters, who.user_id]);
        }
      }
      revalidatePath('/ops/stock');
      return { ok: true as const, count: pick.length };
    } catch (e) { return { ok: false as const, error: (e as Error).message }; }
  });
}

/** Что уже заказано и ждёт поставки — чтобы заявку не отправляли дважды. */
export async function openRequests() {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const r = await c.query<{ item_id: string; meters: string; created_at: string }>(
      `select catalog_item_id as item_id, meters::text, created_at
         from material_requests where status = 'open' order by created_at desc`);
    return r.rows;
  });
}
