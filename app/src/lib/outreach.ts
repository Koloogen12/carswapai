'use server';
/**
 * Два способа получить фотографию клиента — оба одним нажатием.
 *
 * Сценарии выбраны основателем, и они не спорят, а дополняют друг друга:
 *
 *   ссылка на гараж — клиент сам перебирает артикулы, играется, возвращается.
 *                     Согласие там явное: текст оферты и политики перед
 *                     глазами, галочка не отмечена по умолчанию.
 *   просьба о фото  — «есть фото вашего авто? пришлите, быстро покажем».
 *                     Короче и продаётся лучше, но согласия нет — и вот
 *                     здесь важное.
 *
 * ПОЧЕМУ ПРОСЬБА УХОДИТ ШАБЛОНОМ, А НЕ СВОИМИ СЛОВАМИ. Основание хранения
 * фотографии в этом сценарии — оферта, и она ищется по доставленному
 * уведомлению с текстом обработки. Если менеджер напишет «скиньте фотку»
 * своими словами, снимок сохранить будет не на чем: media.ts откажет, и
 * правильно сделает.
 *
 * Поэтому просьба и оферта — ОДНО сообщение. Менеджер про согласие вообще не
 * думает: он просто просит фотографию, а основание появляется само. Это не
 * ограничение ради юриста, это способ не делать юридическую работу руками
 * человека, который занят продажей.
 */
import { revalidatePath } from 'next/cache';
import { claimsFor } from './session';
import { withTenant } from './db';
import { MANAGER } from './data';
import { OFFER_TEXT } from './adapters/channel-text';

type Channel = {
  channel_id: string; kind: string; provider: string; external_id: string;
  external_thread_id: string | null; can_initiate: boolean;
};

async function threadChannel(c: import('pg').PoolClient, threadId: string) {
  const r = await c.query<Channel>(
    `select ch.id as channel_id, ch.kind::text, ch.provider, ch.external_id,
            t.external_thread_id, coalesce(ch.can_initiate, false) as can_initiate
       from threads t join channels ch on ch.id = t.channel_id
      where t.id = $1`, [threadId]);
  return r.rows[0] ?? null;
}

/**
 * Записать исходящее сообщение в переписку.
 *
 * Пишем ДО отправки и помечаем состоянием: если шлюз не ответит, сообщение
 * останется видно менеджеру как неотправленное. Обратный порядок дал бы
 * доставленное клиенту сообщение, которого нет в истории, — а по нему потом
 * доказывается основание хранения фотографии.
 */
async function record(c: import('pg').PoolClient, threadId: string,
                      channelId: string, body: string) {
  const r = await c.query<{ id: string }>(
    `insert into messages (point_id, thread_id, channel_id, direction, body, sent_at)
     values ($1,$2,$3,'out',$4, now()) returning id`,
    [MANAGER.point_id, threadId, channelId, body]);
  return r.rows[0].id;
}

/** Сценарий 2 · «есть фото вашего авто?» вместе с офертой, одним сообщением. */
export async function askForPhoto(threadId: string) {
  return withTenant(await claimsFor(), async c => {
    const ch = await threadChannel(c, threadId);
    if (!ch) return { ok: false as const, error: 'у обращения нет канала' };
    const messageId = await record(c, threadId, ch.channel_id, OFFER_TEXT);
    revalidatePath(`/inbox/${threadId}`);
    // Доставка идёт отдельным шагом воркера отправки: держать серверное
    // действие на сетевом вызове к шлюзу — тот же просчёт, что и с генерацией.
    return { ok: true as const, messageId };
  });
}

/** Сценарий 1 · ссылка на гараж: клиент перебирает артикулы сам. */
export async function sendGarageLink(threadId: string) {
  return withTenant(await claimsFor(), async c => {
    const ch = await threadChannel(c, threadId);
    if (!ch) return { ok: false as const, error: 'у обращения нет канала' };

    const pt = await c.query<{ public_slug: string }>(
      `select public_slug from points where id = $1`, [MANAGER.point_id]);
    const slug = pt.rows[0]?.public_slug;
    if (!slug) return { ok: false as const, error: 'у точки нет публичной ссылки' };

    const base = process.env.PUBLIC_BASE_URL ?? '';
    const url = `${base}/g/${slug}`;
    const body =
      `Посмотрите, как плёнка будет выглядеть на вашей машине — загрузите фото ` +
      `и переберите варианты сами: ${url}`;

    // У Авито ссылки запрещены продуктовым решением: отказ обязан прийти
    // здесь, а не после отправки, иначе канал получит бан за наши правила.
    if (ch.provider === 'avito_direct') {
      return { ok: false as const,
               error: 'В Авито ссылки не отправляем — попросите фото прямо в переписке' };
    }

    const messageId = await record(c, threadId, ch.channel_id, body);
    revalidatePath(`/inbox/${threadId}`);
    return { ok: true as const, messageId, url };
  });
}
