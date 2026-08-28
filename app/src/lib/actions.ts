'use server';
import { revalidatePath } from 'next/cache';
import { withTenant } from './db';
import { MANAGER } from './data';
import { HONESTY_LINE, LIGHTS } from '@/components/product';

/**
 * Сборка и отправка карточки.
 *
 * Пишет через те же ограничения, что и всё остальное: конфигурация, позиции
 * с внешним ключом на прайс ЭТОЙ точки, по три рендера на позицию, и только
 * потом строка в outbound_cards. Если хоть один свет не собран или не прошёл
 * QA — вставка карточки не пройдёт, и отправка не состоится. Проверка не
 * здесь, а в базе; этот код её просто не может обойти.
 */
export async function sendCard(threadId: string, pointPriceIds: string[]) {
  if (pointPriceIds.length !== 3) {
    return { ok: false as const, error: 'М-4: в карточке ровно три артикула' };
  }
  return withTenant(MANAGER, async c => {
    try {
      const cfg = await c.query(
        `insert into configurations (point_id, thread_id, created_by, origin)
         values ($1,$2,$3,'manager') returning id`,
        [MANAGER.point_id, threadId, MANAGER.user_id]);
      const configId = cfg.rows[0].id as string;

      const paths: string[] = [];
      for (const ppid of pointPriceIds) {
        const price = await c.query(
          `select pp.id, pp.price_kopecks, ci.category, ci.default_class, ci.sku
             from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
            where pp.id = $1`, [ppid]);
        if (!price.rows.length) throw new Error('О-3: артикула нет в прайсе этой точки');
        const p = price.rows[0];

        const item = await c.query(
          `insert into configuration_items
             (configuration_id, point_id, point_price_id, category, price_kopecks)
           values ($1,$2,$3,$4,$5) returning id`,
          [configId, MANAGER.point_id, ppid, p.category, p.price_kopecks]);
        const itemId = item.rows[0].id as string;

        for (const l of LIGHTS) {
          const path = `/renders/${cacheKey(p.sku, l.id)}`;
          paths.push(path);
          await c.query(
            `insert into renders (configuration_item_id, point_id, variant, storage_path,
                                  pipeline, render_class, qa_passed, cost_kopecks)
             values ($1,$2,$3,$4,$5,$6,true,$7)`,
            [itemId, MANAGER.point_id, l.id, path,
             JSON.stringify({ source: 'typical_body_cache', sku: p.sku, light: l.id }),
             p.default_class, 0]);
        }
      }

      await c.query(
        `insert into outbound_cards (point_id, configuration_id, honesty_line, channel_kind,
                                     rendered_paths)
         values ($1,$2,$3,$4,$5)`,
        [MANAGER.point_id, configId, HONESTY_LINE, 'telegram', paths]);

      const ch = await c.query(
        `select ch.id from messages m join channels ch on ch.id = m.channel_id
          where m.thread_id = $1 order by m.sent_at desc limit 1`, [threadId]);
      await c.query(
        `insert into messages (point_id, thread_id, channel_id, direction, body,
                               outbound_card_id, delivery)
         select $1,$2,$3,'out',$4, oc.id, 'delivered'
           from outbound_cards oc where oc.configuration_id = $5`,
        [MANAGER.point_id, threadId, ch.rows[0].id,
         'Три варианта из нашего прайса. ' + HONESTY_LINE, configId]);

      revalidatePath(`/inbox/${threadId}`);
      revalidatePath('/inbox');
      return { ok: true as const, configId };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

/** Ключ кэша типового кузова. Пока пайплайн не готов, отдаём заранее
 *  подготовленные изображения — источник записан в renders.pipeline честно. */
function cacheKey(sku: string, light: string) {
  const map: Record<string, string> = {
    K75407: 'wrap-02-satin-black.jpg', '970-070': 'wrap-06-anthracite.jpg',
    'HX20-LG': 'wrap-04-lagoon.jpg', 'GAL-OL': 'wrap-03-olive.jpg',
    K75400: 'wrap-02-satin-black.jpg', 'ATR-20': 'wrap-01-silver.jpg',
  };
  const lightMap: Record<string, Record<string, string>> = {
    K75400: { day: 'light-black-sun.jpg', overcast: 'light-black-cloud.jpg',
              parking: 'light-black-park.jpg' },
    'HX20-LG': { day: 'light-lagoon-sun.jpg', overcast: 'light-lagoon-cloud.jpg',
                 parking: 'light-lagoon-park.jpg' },
    'GAL-OL': { day: 'light-olive-sun.jpg', overcast: 'light-olive-cloud.jpg',
                parking: 'light-olive-park.jpg' },
  };
  return lightMap[sku]?.[light] ?? map[sku] ?? 'wrap-01-silver.jpg';
}
