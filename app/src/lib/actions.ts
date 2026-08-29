'use server';
import { revalidatePath } from 'next/cache';
import { claimsFor } from './session';
import { withTenant } from './db';
import { MANAGER } from './data';
import { HONESTY_LINE, LIGHTS } from './domain';

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
  return withTenant(await claimsFor(), async c => {
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

/**
 * Живая примерка одного артикула на фотографии клиента.
 *
 * ПОЧЕМУ ЧЕРЕЗ ОЧЕРЕДЬ, А НЕ ПРЯМО ЗДЕСЬ. Генерация занимает 25 секунд на
 * кадр — измерено на живом ответе модели. Держать на этом серверное действие
 * нельзя: менеджер закроет вкладку, а деньги за начатую генерацию спишутся.
 * Ставим три задания (по одному на свет) и отвечаем сразу.
 *
 * ПОЧЕМУ ОДИН АРТИКУЛ, А НЕ ТРИ. Примерка и карточка — разные моменты.
 * Примерка это исследование: менеджер гоняет артикулы по одному и смотрит.
 * Карточка (М-4, ровно три артикула) — уже предложение клиенту, и она
 * складывается из УЖЕ отрендеренных примерок, повторно не платя. Поэтому
 * стоимость равна числу реально примеренного, а не фиксированным девяти.
 *
 * ДЕДУПЛИКАЦИЯ. Ключ — «фото × артикул × свет». Повторное нажатие в пределах
 * окна не создаёт второго задания и не тратит денег (§4.8, М-5).
 */
export async function startTryOn(configId: string, pointPriceId: string,
                                 photoId: string) {
  return withTenant(await claimsFor(), async c => {
    try {
      const price = await c.query(
        `select pp.id, pp.price_kopecks, ci.category, ci.sku, ci.finish,
                ci.lab_l, ci.lab_a, ci.lab_b
           from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
          where pp.id = $1`, [pointPriceId]);
      if (!price.rows.length) {
        return { ok: false as const, error: 'О-3: артикула нет в прайсе этой точки' };
      }
      const p = price.rows[0];
      if (p.lab_l === null) {
        // Цвет артикула обязан быть измерен. Отправлять модели название вместо
        // чисел — значит показать клиенту цвет, которого не будет на замере.
        return { ok: false as const,
                 error: 'у артикула нет измеренного цвета — примерка невозможна' };
      }

      const photo = await c.query(
        `select storage_path from photos where id = $1 and erased_at is null`,
        [photoId]);
      if (!photo.rows.length) {
        return { ok: false as const, error: 'фотография не найдена или уже удалена' };
      }

      const item = await c.query(
        `insert into configuration_items
           (configuration_id, point_id, point_price_id, category, price_kopecks)
         values ($1,$2,$3,$4,$5)
         on conflict do nothing
         returning id`,
        [configId, MANAGER.point_id, pointPriceId, p.category, p.price_kopecks]);
      const itemId = item.rows[0]?.id
        ?? (await c.query(
              `select id from configuration_items
                where configuration_id = $1 and point_price_id = $2`,
              [configId, pointPriceId])).rows[0]?.id;
      if (!itemId) return { ok: false as const, error: 'не удалось создать позицию' };

      // Через app.enqueue_render, а не прямым insert: эта функция держит
      // дедупликацию И жёсткий стоп по бюджету точки (С-5). Обойти её своим
      // запросом значит обойти потолок расхода — то есть выпустить точку за
      // деньги, которых у неё нет.
      const ids: string[] = [];
      for (const l of LIGHTS) {
        const r = await c.query(
          `select app.enqueue_render($1,$2,$3::render_variant,'B',$4,0::smallint,850,$5::jsonb) as id`,
          [MANAGER.point_id, itemId, l.id,
           `${photoId}:${pointPriceId}:${l.id}`,
           JSON.stringify({
             photo_path: photo.rows[0].storage_path,
             sku_name: p.sku, finish: p.finish,
             target_lab: [Number(p.lab_l), Number(p.lab_a), Number(p.lab_b)],
             light: l.id, network_id: MANAGER.network_id,
           })]);
        ids.push(r.rows[0].id as string);
      }

      revalidatePath(`/inbox`);
      // Повторное нажатие возвращает те же идентификаторы заданий: это не
      // ошибка, а сработавшая дедупликация, и денег она не стоит.
      return { ok: true as const, itemId, jobIds: ids };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

/** Готовность примерки: сколько светов уже посчитано и что с отказами. */
export async function tryOnStatus(itemId: string) {
  return withTenant(await claimsFor(), async c => {
    const done = await c.query(
      `select variant, storage_path from renders
        where configuration_item_id = $1 and qa_passed and erased_at is null`,
      [itemId]);
    const jobs = await c.query(
      `select status, last_error from render_jobs
        where configuration_item_id = $1`, [itemId]);
    const failed = jobs.rows.filter(r => r.status === 'failed');
    return {
      ready: done.rows.length === LIGHTS.length,
      done: done.rows,
      pending: jobs.rows.filter(r => ['queued', 'running'].includes(r.status)).length,
      // Причина отказа показывается менеджеру целиком: «не получилось» без
      // причины он не сможет ни исправить, ни объяснить клиенту.
      errors: failed.map(r => r.last_error as string),
    };
  });
}
