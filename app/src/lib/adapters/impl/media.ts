/**
 * Фотография из мессенджера: от вложения до снимка в базе.
 *
 * ЭТО НАЧАЛО ВСЕЙ ЦЕПОЧКИ. Клиент присылает фото своей машины, и без этого
 * шага примерять нечего: раньше ссылка на вложение падала в
 * `messages.attachments` как JSON, файл никуда не скачивался, снимок в базе
 * не заводился.
 *
 * ОСНОВАНИЕ ХРАНЕНИЯ — ОФЕРТА ПРИ ПЕРВОМ КОНТАКТЕ. Решение основателя:
 * спрашивать «да» отдельным сообщением значит терять часть клиентов на ровном
 * месте. Но «продолжая переписку, вы соглашаетесь» само по себе ничем не
 * подтверждается, поэтому здесь фиксируется проверяемая последовательность:
 *
 *   1. клиент пишет впервые → уходит уведомление с текстом оферты;
 *   2. клиент присылает фотографию УЖЕ ПОСЛЕ него;
 *   3. согласие записывается со ссылками на оба сообщения.
 *
 * Без пары сообщений строка согласия не вставится — это ограничение таблицы
 * (миграция 011), а не договорённость.
 *
 * ПОРЯДОК ДЕЙСТВИЙ СО ССЫЛКОЙ. Ссылки на вложения у шлюзов живут недолго,
 * поэтому файл скачивается сразу, а не после. Это осознанный выбор: без него
 * фотография протухнет и клиент останется без примерки. Если основания на
 * хранение не окажется, файл удаляется тут же, в том же вызове.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { PoolClient } from 'pg';
import type { Attachment } from '../channel';

// Текст и его признак живут в channel-text.ts: по этому же признаку
// уведомление ищется в переписке. Две копии строки разошлись бы молча, и
// основание перестало бы находиться.
export { OFFER_TEXT, OFFER_VERSION } from '../channel-text';
import { OFFER_MARKER, OFFER_VERSION as VERSION } from '../channel-text';

const STORAGE = process.env.STORAGE_ROOT ?? '/var/lib/carswap/storage';
const MAX_BYTES = Number(process.env.CSW_PHOTO_MAX_BYTES ?? 25 * 1024 * 1024);

/**
 * Отправлено ли клиенту уведомление с офертой, и когда.
 * Ищем среди исходящих: доказательством служит доставленное сообщение,
 * а не факт, что мы его когда-то собирались отправить.
 */
export async function offerNotice(c: PoolClient, threadId: string) {
  const r = await c.query<{ id: string; sent_at: Date }>(
    `select id, sent_at from messages
      where thread_id = $1 and direction = 'out' and body like $2
      order by sent_at limit 1`,
    [threadId, `%${OFFER_MARKER}%`]);
  return r.rows[0] ?? null;
}

/**
 * Сохранить входящую фотографию.
 *
 * Возвращает `{ ok: false, reason }`, если оснований нет — и это нормальный
 * исход, а не ошибка: менеджер увидит причину и отправит оферту.
 */
export async function ingestInboundPhoto(
  c: PoolClient,
  opts: { pointId: string; threadId: string; clientId: string | null;
          messageId: string; messageSentAt: Date; attachment: Attachment },
): Promise<{ ok: true; photoId: string } | { ok: false; reason: string }> {
  const { pointId, threadId, clientId, messageId, messageSentAt, attachment } = opts;

  if (attachment.kind !== 'image') {
    return { ok: false, reason: 'вложение не изображение' };
  }
  if (!clientId) {
    // Субъекта нет — записывать согласие не на кого. Такое бывает у Авито,
    // где телефон не отдаётся; там клиент опознаётся якорем позже.
    return { ok: false, reason: 'клиент ещё не опознан' };
  }

  const notice = await offerNotice(c, threadId);
  if (!notice) {
    return { ok: false, reason:
      'оферта клиенту ещё не отправлена — сохранять фото не на чем' };
  }
  if (new Date(notice.sent_at).getTime() >= new Date(messageSentAt).getTime()) {
    // Фотография пришла раньше уведомления: основание рассыпается, потому что
    // в момент отправки клиент про обработку не знал.
    return { ok: false, reason:
      'фото пришло раньше оферты — нужно отправить оферту и попросить фото ещё раз' };
  }

  // Скачиваем сразу: ссылки шлюзов живут недолго. Если основания не окажется,
  // файл удаляется в этом же вызове, ниже.
  let bytes: Buffer;
  try {
    const res = await fetch(attachment.url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return { ok: false, reason: `шлюз не отдал файл: HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return { ok: false, reason: `файл больше ${Math.round(MAX_BYTES / 1024 / 1024)} МБ` };
    }
    bytes = buf;
  } catch (e) {
    return { ok: false, reason: `не удалось забрать файл: ${(e as Error).message}` };
  }

  const sha = createHash('sha256').update(bytes).digest('hex');
  const ext = attachment.mime.includes('png') ? 'png' : 'jpg';
  const rel = `points/${pointId}/photos/${randomUUID()}.${ext}`;
  const abs = path.join(STORAGE, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);

  try {
    const consent = await c.query<{ id: string }>(
      `insert into consents (point_id, client_id, kind, document_version, granted,
                             basis, notice_message_id, evidence_message_id)
       values ($1,$2,'photo_processing',$3,true,'offer_notice',$4,$5)
       returning id`,
      [pointId, clientId, VERSION, notice.id, messageId]);

    const photo = await c.query<{ id: string }>(
      `insert into photos (point_id, client_id, storage_path, sha256, width, height,
                           consent_id)
       values ($1,$2,$3,$4,0,0,$5)
       returning id`,
      [pointId, clientId, '/' + rel, sha, consent.rows[0].id]);
    return { ok: true, photoId: photo.rows[0].id };
  } catch (e) {
    // Основания не оказалось — файл на диске лежать не должен. Удаляем здесь,
    // а не «потом заданием»: иначе снимок клиента остаётся вне всякого учёта,
    // и удаление по сроку его не найдёт, потому что строки в базе нет.
    await unlink(abs).catch(() => {});
    return { ok: false, reason: (e as Error).message };
  }
}
