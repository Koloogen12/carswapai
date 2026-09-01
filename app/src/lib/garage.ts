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
import { refusalTexts } from './refusal';

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
 *
 * Гейт качества (§4.3, стадия 1) считается в браузере и приезжает полем
 * `gate`. Здесь мы его НЕ пересчитываем — нечем: декодера картинок в
 * зависимостях нет, — но и не берём на веру целиком: размеры кадра сервер
 * читает из заголовка файла сам, и они же ложатся в photos.width/height,
 * куда до сих пор писались нули.
 */
export async function uploadCarPhoto(slug: string, form: FormData) {
  const sid = await sessionId();
  // Действие вызывается по сети, и форму ему может передать кто угодно.
  // Ответ обязан быть один и тот же по форме при любом входе: иначе
  // экран получает не отказ, а исключение, и падает целиком.
  if (!(form instanceof FormData)) {
    return { ok: false as const, error: 'Файл не выбран' };
  }
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

  try {
    return await storePhoto(slug, sid, file, form.get('gate'));
  } catch (e) {
    // Место, где кадр не удалось сохранить, — не тупик. Человек остаётся на
    // типовом кузове, который уже посчитан, и это законный режим (О-1).
    // Раньше исключение отсюда уходило наружу и роняло весь экран: клиент с
    // готовым снимком получал белую страницу.
    console.error('[гараж] фотография не сохранена:',
                  (e as { message?: string })?.message ?? e);
    return { ok: false as const,
             error: 'Сохранить кадр сейчас не получилось. Цвета на типовом '
                  + 'кузове уже готовы — смотрите их, а фото попробуем позже.' };
  }
}

async function storePhoto(slug: string, sid: string, file: File,
                          gateRaw: FormDataEntryValue | null) {
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

    // Стадия 1 целиком: что померил браузер плюс что сервер прочитал сам.
    // Размеры из заголовка — единственная часть, которую можно проверить
    // здесь, и именно она решает, годится ли кадр по разрешению.
    const size = imageSize(bytes);
    const gate = {
      stage: 1,
      by: 'client+header',
      bytes: bytes.length,
      mime: file.type,
      ...size,
      ...clientGate(gateRaw),
      checked_at: new Date().toISOString(),
    };

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

    // Запись идёт через app.garage_store_photo, а не прямым insert.
    // Прямой был закрыт ограничительной политикой photos_garage — и правильно:
    // гараж открыт по ссылке кому угодно. Раньше это означало, что загрузка
    // кадра не проходила НИ РАЗУ, а экран показывал тёплый отказ, который
    // читался как временная неполадка.
    const photo = await c.query<{ id: string }>(
      `select app.garage_store_photo($1,$2,$3,$4,$5::jsonb) as id`,
      ['/' + rel, sha, size.width, size.height, JSON.stringify(gate)]);
    return { ok: true as const, photoId: photo.rows[0].id, deduped: false };
  }, sid);
}

/** Измерения браузера — только известные поля и только числа. */
function clientGate(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string') return {};
  try {
    const g = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const k of ['luma', 'dark', 'bright']) {
      const v = g[k];
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v * 1000) / 1000;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Размеры кадра из заголовка файла, без декодирования пикселей.
 *
 * Сорок строк вместо зависимости: sharp тянет за собой нативную сборку, а
 * нужны здесь два числа из первых байт. Не разобрали заголовок — возвращаем
 * нули, как было до сих пор: это хуже, чем размеры, но лучше, чем отказ
 * человеку из-за экзотического формата.
 */
function imageSize(b: Buffer): { width: number; height: number } {
  // PNG: сигнатура, затем IHDR с шириной и высотой.
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  // JPEG: идём по маркерам до любого SOF, размеры лежат сразу за длиной.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const len = b.readUInt16BE(i + 2);
      // SOF0..SOF15, кроме DHT (c4), DAC (cc) и RSTn — у них своя разметка.
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return { width: 0, height: 0 };
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
 * Г-9 · потолок генераций проверяет `app.enqueue_render` (020 поверх бюджета
 * из 002), и второй раз в коде он НЕ проверяется. Дублировать проверку —
 * значит завести второй источник правды: он разойдётся с первым на первой же
 * правке порогов, и разойдётся молча. Здесь только ловим отказ и называем
 * человеку причину, которую назвала база.
 */
export async function startGarageTryOn(slug: string, pointPriceId: string,
                                       photoId: string) {
  const sid = await readSession();
  if (!sid) {
    return { ok: false as const, reason: 'session' as const,
             error: 'Сессия не найдена — откройте ссылку заново' };
  }
  try {
    return await enqueueTryOn(slug, sid, pointPriceId, photoId);
  } catch (e) {
    return refusal(e);
  }
}

/**
 * Примерка на кадре клиента — через единственную дверь app.garage_tryon.
 *
 * Здесь раньше стояли три вставки подряд: configurations, configuration_items и
 * очередь. Все три закрыты ограничительными политиками для роли гаража, и это
 * не оплошность — db/tests/client-link.sql специально это требует. То есть
 * функция была написана против инварианта, который база защищает, и не
 * отработала ни разу с момента, как появилась.
 *
 * Дверь принимает два идентификатора и больше ничего. Артикул, фактуру, цвет
 * и путь к кадру база выводит сама — значит анонимный посетитель не может
 * влиять на то, что уходит во внешнюю модель. Раньше полезную нагрузку
 * собирало приложение по данным из браузера.
 *
 * Потолок §4.10 (три примерки в сутки анониму, пятнадцать после телефона)
 * проверяется внутри двери, до постановки в очередь. Проверять его здесь
 * значило бы иметь два разных ответа на один вопрос.
 */
async function enqueueTryOn(slug: string, sid: string, pointPriceId: string,
                            photoId: string) {
  return withGarage(slug, async c => {
    const r = await c.query<{ item_id: string; job_id: string; job_variant: string }>(
      `select item_id, job_id, job_variant from app.garage_tryon($1,$2)`,
      [photoId, pointPriceId]);
    if (!r.rows.length) {
      return { ok: false as const, reason: 'store' as const,
               error: 'Не удалось начать примерку' };
    }
    return { ok: true as const, itemId: r.rows[0].item_id,
             jobs: r.rows.map(x => x.job_id) };
  }, sid);
}

/**
 * Готовность примерки в гараже: какие света уже посчитаны.
 *
 * Опрашивается из браузера раз в две секунды. Именно поэтому исключение
 * отсюда особенно дорого: оно приходит не в ответ на нажатие, а само по
 * себе, и роняет экран у человека, который просто ждал. Отвечаем всегда
 * одной и той же формой; причина отказа уходит в журнал сервера.
 */
export async function garageTryOnStatus(slug: string, itemId: string) {
  const idle = { ready: false, done: [] as { variant: string; storage_path: string }[],
                 pending: 0, errors: [] as string[] };
  const sid = await readSession();
  if (!sid) return idle;
  try {
    return await readTryOnStatus(slug, sid, itemId);
  } catch (e) {
    console.error('[гараж] опрос готовности не прошёл:',
                  (e as { message?: string })?.message ?? e);
    return idle;
  }
}

async function readTryOnStatus(slug: string, sid: string, itemId: string) {
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
      // Клиенту — человеческая фраза, а не строка из воркера. Техническая
      // причина остаётся в задании: она нужна тому, кто разбирает сбой.
      errors: refusalTexts(
        jobs.rows.filter(r => r.status === 'failed').map(r => r.last_error), 'client'),
    };
  }, sid);
}

/**
 * «Написать точке» из гаража.
 *
 * Г-1 запрещает поля регистрации до первой примерки, поэтому телефон здесь не
 * спрашивается. Вместо этого клиент уходит в мессенджер точки со своим
 * собственным аккаунтом — тем же, которым он и так пользуется. Его опознание
 * приходит из канала, ровно как у любого другого обращения: О-5, канал это
 * свойство сообщения.
 *
 * Заготовленный текст несёт артикул и цену. Не ради удобства: менеджер должен
 * увидеть в первом же сообщении, что человек уже выбрал, — иначе разговор
 * начнётся с «здравствуйте, а сколько стоит», и вся примерка пропадёт зря.
 */
export async function contactLink(slug: string, pointPriceId: string | null) {
  try {
    return await messengerLink(slug, pointPriceId);
  } catch (e) {
    console.error('[гараж] ссылка в мессенджер не собралась:',
                  (e as { message?: string })?.message ?? e);
    return { ok: false as const,
             error: 'Не получилось открыть переписку с точкой — позвоните ей' };
  }
}

async function messengerLink(slug: string, pointPriceId: string | null) {
  return withGarage(slug, async c => {
    const ch = await c.query<{ kind: string; external_id: string }>(
      `select ch.kind::text, ch.external_id
         from channels ch join points p on p.id = ch.point_id
        where p.public_slug = $1 and ch.status = 'active'
        order by case ch.kind::text
                   when 'whatsapp' then 1 when 'telegram' then 2 else 3 end
        limit 1`, [slug]);
    if (!ch.rows.length) {
      return { ok: false as const,
               error: 'У точки пока не подключён ни один канал — позвоните ей' };
    }

    let what = '';
    if (pointPriceId) {
      const p = await c.query<{ name: string; price_kopecks: number }>(
        `select ci.name, pp.price_kopecks
           from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
          where pp.id = $1`, [pointPriceId]);
      if (p.rows.length) {
        const r = Math.round(p.rows[0].price_kopecks / 100).toLocaleString('ru-RU');
        what = ` Смотрю «${p.rows[0].name}» за ${r} ₽.`;
      }
    }
    const text = encodeURIComponent(
      `Здравствуйте! Примерял плёнку в вашей примерочной.${what} Подскажите по срокам и записи на замер.`);

    const { kind, external_id } = ch.rows[0];
    const url = kind === 'telegram'
      ? `https://t.me/${external_id.replace(/^@/, '')}?text=${text}`
      : `https://wa.me/${external_id.replace(/\D/g, '')}?text=${text}`;
    return { ok: true as const, url };
  });
}

/* ─────────────────────────────────────────────────────────────
 * Г-9 · потолок генераций гаража
 * ───────────────────────────────────────────────────────────── */

/**
 * Одна примерка — три света (О-2), и это не настройка, а цена вопроса.
 * Оценка кадра та же, что в `startGarageTryOn`, и та же, из которой считался
 * потолок в миграции 013: 3 × 8,50 ₽ = 25,50 ₽.
 */
const TRYON_KOPECKS = 3 * 850;

export type Quota = {
  /** Осталось примерок сегодня по §4.10 — то, что видит человек. */
  left: number;
  used: number;
  cap: number;
  has_phone: boolean;
  /** Деньги точки. Клиент на них не влияет, но упереться может и в них. */
  spent: number; soft: number; hard: number;
  soft_reached: boolean; hard_reached: boolean;
};

/**
 * Сколько примерок ещё осталось.
 *
 * Счётчик на экране обязан показывать ТУ ЖЕ величину, которой распоряжается
 * `app.enqueue_render`, иначе он врёт: до сих пор в гараже стояла константа
 * «восемь», не связанная ни с чем, и человек упирался в отказ на кадре, где
 * счётчик обещал ещё пять.
 *
 * `app.budget_state` — security definer, поэтому анонимной роли гаража она
 * доступна, хотя сама таблица point_budgets ей закрыта. Это ровно то, что
 * нужно: цифру остатка видно, чужих денег — нет.
 */
/**
 * Сколько примерок осталось — и почему, если ноль.
 *
 * Причин ровно две, и они разные для клиента:
 *   сутки  — §4.10, три примерки анониму. Упёрся сам, и выход есть:
 *            оставить телефон и продолжить (Г-9, мягкий переход).
 *   деньги — потолок расхода точки. Клиент на него не влияет никак, и
 *            предлагать ему что-то сделать было бы издевательством.
 *
 * Раньше на экране стоял один счётчик, посчитанный из денег точки, делённых
 * на цену примерки. Он не был ни тем, ни другим: до §4.10 он не доходил
 * никогда (остаток бюджета — это сотни примерок), а как предупреждение о
 * деньгах точки не работал, потому что человек читал его как свой лимит.
 */
export async function garageQuota(slug: string): Promise<Quota> {
  // Сессия обязана уехать в претензию: без неё app.garage_day_quota() считает
  // расход НЕ ТОЙ сессии и всегда возвращает ноль. Счётчик показывал «3
  // осталось» человеку, который только что израсходовал все три, — а отказ
  // приходил уже из двери, где потолок настоящий. Экран и база расходились.
  //
  // readSession(), а не sessionId(): это вызов со страницы, а куку во время
  // отрисовки поставить нельзя.
  const sid = (await readSession()) ?? undefined;
  return withGarage(slug, async c => {
    const d = await c.query<{ used: number; cap: number; has_phone: boolean }>(
      `select used, cap, has_phone from app.garage_day_quota()`);
    const b = (await c.query<{
      spent_kopecks: number; soft_limit: number; hard_limit: number;
      soft_reached: boolean; hard_reached: boolean;
    }>(`select * from app.budget_state(app.current_point_id())`)).rows[0];

    const day = d.rows[0] ?? { used: 0, cap: 3, has_phone: false };
    const used = Number(day.used), cap = Number(day.cap);
    return {
      left: b?.hard_reached ? 0 : Math.max(0, cap - used),
      used, cap, has_phone: day.has_phone,
      spent: Number(b?.spent_kopecks ?? 0),
      soft: Number(b?.soft_limit ?? 0),
      hard: Number(b?.hard_limit ?? 0),
      soft_reached: !!b?.soft_reached,
      hard_reached: !!b?.hard_reached,
    };
  }, sid);
}

/**
 * Телефон после третьей примерки — мягкий переход Г-9.
 *
 * Это НЕ регистрация и не нарушение Г-1: поле появляется после трёх примерок,
 * а не до первой. Одно действие даёт обе стороны сразу — клиенту пятнадцать
 * примерок вместо трёх, точке обращение с телефоном вместо анонимной сессии,
 * которая ушла молча.
 */
export async function garageLeavePhone(slug: string, phone: string) {
  const sid = await readSession();
  if (!sid) return { ok: false as const, error: 'Сессия не найдена — откройте ссылку заново' };
  try {
    return await withGarage(slug, async c => {
      const r = await c.query<{ cap: number }>(
        `select cap from app.garage_leave_phone($1)`, [phone]);
      return { ok: true as const, cap: Number(r.rows[0]?.cap ?? 15) };
    }, sid);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err?.code === '23514' || /не разобран/.test(err?.message ?? '')) {
      return { ok: false as const, error: 'Проверьте номер — не разобрали' };
    }
    console.error('[гараж] телефон не записан:', err?.message);
    return { ok: false as const, error: 'Не получилось сохранить номер' };
  }
}

/**
 * Отказ базы, переведённый человеку.
 *
 * Причину придумывает база, а не этот код: 23001 «restrict_violation» —
 * это и жёсткий стоп по бюджету из 002, и остановленная точка из 020, и
 * цена вне коридора сети. Текст исключения в каждом случае свой и уже
 * написан по-русски — его и показываем, ничего не переписывая.
 *
 * 42501 — отказ RLS. Человеку он не говорит ничего, и знать ему об этом
 * нечего; в журнал сервера пишем как есть, на экран — что делать дальше.
 */
function refusal(e: unknown) {
  const err = e as { code?: string; message?: string };
  const code = err?.code ?? '';
  const message = err?.message ?? 'без причины';

  if (code === '23001') {
    // Две разные причины с одним кодом: суточный потолок §4.10 и жёсткий стоп
    // по деньгам точки. Обе ведут на кадр 35, но выход у клиента есть только
    // у первой — экран различает их по quota.hard_reached, а не по тексту.
    const limit = /бюджет|израсходован|на сегодня примерок/i.test(message);
    return { ok: false as const, reason: limit ? ('limit' as const) : ('refused' as const),
             error: message };
  }
  if (code === '42501') {
    console.error('[гараж] примерка на своём кадре отклонена политикой доступа:', message);
    return { ok: false as const, reason: 'blocked' as const,
             error: 'Примерка на вашем кадре сейчас недоступна у этой точки. '
                  + 'Цвета на типовом кузове показываем дальше — они уже готовы.' };
  }
  console.error('[гараж] примерка не поставлена в очередь:', message);
  return { ok: false as const, reason: 'refused' as const, error: message };
}
