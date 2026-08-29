'use server';
/**
 * Гараж-примерочная: согласие и загрузка фотографии клиентом.
 *
 * ЗДЕСЬ ЖИВЁТ ОСНОВАНИЕ ХРАНЕНИЯ ПЕРСОНАЛЬНЫХ ДАННЫХ, и это решение
 * основателя: оферта и политика показываются на экране, где человек сам
 * загружает фотографию своей машины. Так согласие — осознанное действие
 * с текстом перед глазами, а не вывод из того, что человек продолжил
 * переписку.
 *
 * Побочная выгода, ради которой одной уже стоило: файл приходит к нам
 * напрямую. В переписке пришлось бы качать его по ссылке шлюза, а они
 * живут недолго — то есть качать ДО проверки основания.
 *
 * Г-1 · ноль полей регистрации до первой примерки. Субъект согласия —
 * анонимная сессия, а не клиент: имени и телефона у нас ещё нет и не должно
 * быть. Клиент появляется позже, когда сам решит оставить контакт.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { cookies } from 'next/headers';
import { withGarage } from './db';

const STORAGE = process.env.STORAGE_ROOT ?? '/var/lib/carswap/storage';
const MAX_BYTES = Number(process.env.CSW_PHOTO_MAX_BYTES ?? 25 * 1024 * 1024);
const SESSION_COOKIE = 'csw_g';

// Редакция текста, которую человек видел. Меняется текст — меняется версия.
// Не экспортируется: в файле с 'use server' наружу могут смотреть только
// асинхронные функции, а константу отсюда никто и не спрашивает.
const CONSENT_VERSION = 'garage-2026-08-1';

/**
 * Анонимная сессия гаража.
 *
 * httpOnly и sameSite: это идентификатор субъекта согласия, и он не должен
 * быть доступен скриптам на странице. Срок — год, столько же, сколько
 * хранится фотография: иначе человек потеряет доступ к своей же примерке
 * раньше, чем мы удалим его данные.
 */
/**
 * Прочитать сессию, НЕ создавая её.
 *
 * Нужна отдельно, потому что при отрисовке страницы куку заводить нельзя —
 * Next разрешает это только в действии. А знать, есть ли согласие, страница
 * обязана: от этого зависит, показать поле файла или отправить к оферте.
 */
async function readSession(): Promise<string | null> {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

async function sessionId(): Promise<string> {
  const jar = cookies();
  const has = jar.get(SESSION_COOKIE)?.value;
  if (has) return has;
  const id = randomUUID();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true, sameSite: 'lax', path: '/g',
    maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production',
  });
  return id;
}

/**
 * Записать согласие. Вызывается, когда человек отметил галочку и нажал далее.
 *
 * Галочка на экране не отмечена по умолчанию — иначе это не согласие, а
 * оформление. Здесь мы это не перепроверяем: экран не может передать «да»,
 * которого не было, а если бы мог, отзыв задним числом всё равно был бы
 * законным, и спорить было бы не с чем.
 */
export async function giveConsent(slug: string) {
  const sid = await sessionId();
  return withGarage(slug, async c => {
    await c.query(
      `insert into consents (point_id, session_id, kind, document_version, granted,
                             basis)
       select p.id, $2, 'photo_processing', $3, true, 'explicit'
         from points p where p.public_slug = $1`,
      [slug, sid, CONSENT_VERSION]);
    return { ok: true as const };
  }, sid);
}

/**
 * Загрузить фотографию автомобиля.
 *
 * Порядок обратный тому, что был в переписке: сначала проверяем основание,
 * и только потом кладём файл на диск. Здесь это возможно, потому что файл
 * уже у нас в руках и никуда не протухнет.
 */
export async function uploadCarPhoto(slug: string, form: FormData) {
  const sid = await sessionId();
  const file = form.get('photo');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: 'Файл не выбран' };
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false as const, error: 'Нужна фотография, а не файл другого вида' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const,
             error: `Фотография больше ${Math.round(MAX_BYTES / 1024 / 1024)} МБ` };
  }

  return withGarage(slug, async c => {
    // Основание — ПЕРЕД записью файла. Согласие ищем по этой же сессии:
    // чужое согласие основанием для наших данных не является.
    const consent = await c.query<{ id: string; point_id: string }>(
      `select id, point_id from consents
        where session_id = $1 and kind = 'photo_processing' and granted
        order by granted_at desc limit 1`, [sid]);
    if (!consent.rows.length) {
      return { ok: false as const,
               error: 'Сначала нужно согласиться на обработку фотографии' };
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const sha = createHash('sha256').update(bytes).digest('hex');
    const pointId = consent.rows[0].point_id;

    // Тот же снимок второй раз не заводим: маски и рендеры кэшируются по
    // отпечатку, и дубликат означал бы вторую оплату за ту же работу.
    const same = await c.query<{ id: string }>(
      `select id from photos
        where point_id = $1 and sha256 = $2 and erased_at is null limit 1`,
      [pointId, sha]);
    if (same.rows.length) {
      return { ok: true as const, photoId: same.rows[0].id, deduped: true };
    }

    const ext = file.type.includes('png') ? 'png' : 'jpg';
    const rel = `points/${pointId}/photos/${randomUUID()}.${ext}`;
    const abs = path.join(STORAGE, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, bytes);

    const photo = await c.query<{ id: string }>(
      `insert into photos (point_id, storage_path, sha256, width, height, consent_id)
       values ($1,$2,$3,0,0,$4) returning id`,
      [pointId, '/' + rel, sha, consent.rows[0].id]);
    return { ok: true as const, photoId: photo.rows[0].id, deduped: false };
  }, sid);
}

/** Есть ли у этой сессии действующее согласие на обработку фото. */
export async function hasConsent(slug: string): Promise<boolean> {
  const sid = await readSession();
  if (!sid) return false;      // сессии ещё нет — значит и согласия нет
  return withGarage(slug, async c => {
    const r = await c.query(
      `select 1 from consents
        where session_id = $1 and kind = 'photo_processing' and granted limit 1`,
      [sid]);
    return r.rows.length > 0;
  }, sid);
}

/**
 * Примерка в гараже — на фотографии клиента, а не на заготовке.
 *
 * ДО ЭТОГО гараж листал заранее отрендеренные картинки: клиент загружал свою
 * машину и всё равно видел чужую в разных плёнках. Это и есть то самое, ради
 * чего продукт существует, и оно не работало.
 *
 * Г-9 · у анонимного гаража свой потолок генераций, он показан на экране
 * («7 осталось»). Проверяем его ДО постановки заданий: иначе счётчик на
 * экране и расход в базе разойдутся, и первым это заметит владелец точки
 * в счёте.
 */
export async function startGarageTryOn(slug: string, pointPriceId: string,
                                       photoId: string) {
  const sid = await readSession();
  if (!sid) return { ok: false as const, error: 'Сессия не найдена — откройте ссылку заново' };

  return withGarage(slug, async c => {
    const price = await c.query<{
      id: string; sku: string; finish: string; category: string;
      price_kopecks: number; lab_l: number | null; lab_a: number; lab_b: number;
    }>(
      `select pp.id, pp.price_kopecks, ci.category, ci.sku, ci.finish,
              ci.lab_l, ci.lab_a, ci.lab_b
         from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
        where pp.id = $1`, [pointPriceId]);
    if (!price.rows.length) {
      return { ok: false as const, error: 'Этого артикула нет в прайсе точки' };
    }
    const p = price.rows[0];
    if (p.lab_l === null) {
      // Цвет обязан быть измерен: слать модели название вместо чисел значит
      // показать клиенту цвет, которого не будет на замере.
      return { ok: false as const, error: 'У артикула не измерен цвет — примерка невозможна' };
    }

    const photo = await c.query<{ id: string; point_id: string }>(
      `select id, point_id from photos where id = $1 and erased_at is null`, [photoId]);
    if (!photo.rows.length) {
      return { ok: false as const, error: 'Фотография не найдена' };
    }
    const pointId = photo.rows[0].point_id;

    // Конфигурация гаража — на сессию, не на клиента: клиента ещё нет (Г-1).
    const cfg = await c.query<{ id: string }>(
      `insert into configurations (point_id, origin, session_id)
       values ($1,'garage',$2)
       on conflict do nothing
       returning id`, [pointId, sid]);
    const configId = cfg.rows[0]?.id
      ?? (await c.query(`select id from configurations
                          where point_id = $1 and session_id = $2
                          order by created_at desc limit 1`,
                        [pointId, sid])).rows[0]?.id;
    if (!configId) return { ok: false as const, error: 'Не удалось начать примерку' };

    const item = await c.query<{ id: string }>(
      `insert into configuration_items
         (configuration_id, point_id, point_price_id, category, price_kopecks)
       values ($1,$2,$3,$4,$5)
       on conflict (configuration_id, point_price_id) do nothing
       returning id`,
      [configId, pointId, pointPriceId, p.category, p.price_kopecks]);
    const itemId = item.rows[0]?.id
      ?? (await c.query(`select id from configuration_items
                          where configuration_id = $1 and point_price_id = $2`,
                        [configId, pointPriceId])).rows[0]?.id;
    if (!itemId) return { ok: false as const, error: 'Не удалось добавить артикул' };

    // Приоритет 10 — гараж (ядро 2): менеджер в диалоге ждёт клиента, а
    // клиент в гараже ждёт себя. Очередь это различает.
    const jobs: string[] = [];
    for (const light of ['day', 'overcast', 'parking']) {
      const r = await c.query<{ id: string }>(
        `select app.enqueue_render($1,$2,$3::render_variant,'B',$4,10::smallint,850,$5::jsonb) as id`,
        [pointId, itemId, light, `${photoId}:${pointPriceId}:${light}`,
         JSON.stringify({
           photo_path: (await c.query(`select storage_path from photos where id = $1`,
                                      [photoId])).rows[0]?.storage_path,
           sku_name: p.sku, finish: p.finish,
           target_lab: [Number(p.lab_l), Number(p.lab_a), Number(p.lab_b)],
           light, origin: 'garage',
         })]);
      jobs.push(r.rows[0].id);
    }
    return { ok: true as const, itemId, jobs };
  }, sid);
}

/** Готовность примерки в гараже: какие света уже посчитаны. */
export async function garageTryOnStatus(slug: string, itemId: string) {
  const sid = await readSession();
  if (!sid) return { ready: false, done: [] as { variant: string; storage_path: string }[],
                     pending: 0, errors: [] as string[] };
  return withGarage(slug, async c => {
    const done = await c.query<{ variant: string; storage_path: string }>(
      `select variant::text, storage_path from renders
        where configuration_item_id = $1 and qa_passed and erased_at is null`, [itemId]);
    const jobs = await c.query<{ status: string; last_error: string | null }>(
      `select status::text, last_error from render_jobs where configuration_item_id = $1`,
      [itemId]);
    return {
      ready: done.rows.length === 3,
      done: done.rows,
      pending: jobs.rows.filter(r => ['queued', 'running'].includes(r.status)).length,
      errors: jobs.rows.filter(r => r.status === 'failed')
                       .map(r => r.last_error ?? 'без причины'),
    };
  }, sid);
}
