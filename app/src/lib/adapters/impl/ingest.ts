/**
 * Приём входящего: сырое событие шлюза → сообщение в треде.
 *
 * Здесь живёт вся защита от повторов и вся склейка тредов. Адаптеры каналов
 * (wazzup.ts, avito.ts) знают только формат провайдера и ничего не знают про
 * базу; этот модуль знает только базу и ничего — про формат.
 *
 * ТРИ ЛИНИИ ОБОРОНЫ ОТ ВТОРОГО ОБРАЩЕНИЯ, по порядку срабатывания:
 *
 *   1. webhook_events (provider, external_event_id) — уникальный индекс.
 *      Пишем ДО всякой бизнес-логики. Повтор доставки натыкается на индекс
 *      и до тредов не доходит вовсе.
 *   2. processed_at. Событие, положенное в webhook_events, но не доведённое
 *      до конца (упали на середине), обязано быть доиграно при следующей
 *      доставке. Поэтому «дубликат» — это не «строка уже есть», а «строка
 *      есть И обработана». Иначе одна сетевая ошибка равна потерянному
 *      обращению, а это хуже второй карточки: пропажу заметит точка, а не мы.
 *   3. messages (channel_id, external_message_id) — уникальный индекс.
 *      Ловит гонку двух одновременных доставок и повтор с новым
 *      идентификатором события. Вторая вставка просто не происходит.
 *
 * СКЛЕЙКА ТРЕДОВ (М-10): один клиент — один тред поверх каналов. Точка
 * склейки — телефон: clients (point_id, phone) уникален. Телефон приводится
 * к одному виду ДО записи, иначе «+7 903 …» и «8903…» станут двумя клиентами
 * и менеджер увидит два обращения от одного человека.
 *
 * Каналы без телефона (Авито не отдаёт номер нигде) склеиваются по паре
 * «канал + внешний чат», которая кладётся в clients.source. Колонка свободная
 * и в схеме ничем не занята; уникального индекса по ней нет, поэтому гонка
 * закрыта транзакционным advisory-локом. Правильное решение — индекс, но это
 * миграция, а миграции здесь не наша территория (см. отчёт).
 *
 * Переменные окружения: только DATABASE_URL (через lib/db). Секретов
 * провайдеров этот модуль не касается.
 */

import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { sys, withTenant, type Claims } from '../../db';
import type { ChannelKind, NormalizedMessage } from '../channel';

/**
 * Входящее плюс маршрутная информация. Контракт NormalizedMessage не знает,
 * в какой из подключённых каналов точки пришло сообщение, — а шлюз это
 * сообщает. Расширяем, а не правим channel.ts: RoutedMessage остаётся
 * присваиваемым к NormalizedMessage, поэтому receive() адаптера возвращает
 * их же и интерфейс не нарушен.
 */
export interface RoutedMessage extends NormalizedMessage {
  /** Соответствует channels.external_id: у Wazzup — GUID канала,
   *  у Авито — идентификатор аккаунта продавца. */
  channelExternalId: string;
}

/** Провайдер как источник вебхуков: чем опознать событие и как его разобрать. */
export interface ProviderPlug {
  /** Сегмент в /api/webhooks/<slug>. */
  readonly slug: string;
  /** Значение channels.provider в БД (у Авито это 'avito_direct'). */
  readonly dbProvider: string;
  /**
   * Сколько у нас есть на ответ шлюзу. Wazzup ждёт 30 секунд, Авито — 2, и
   * при просрочке снимает подписку. Обработчик по этому числу решает, ждать
   * ли конца разбора или ответить сразу после того, как событие легло
   * в webhook_events.
   */
  readonly ackDeadlineMs: number;
  /** Ключ идемпотентности из полезной нагрузки. null — провайдер его не даёт,
   *  тогда ключом станет отпечаток тела. */
  eventId(raw: unknown): string | null;
  /** Разбор. Пусто — событие не про входящие сообщения (статусы, эхо, проба). */
  parse(raw: unknown): RoutedMessage[];
  /** Проверка подлинности вызова. Подпись есть не у всех провайдеров; там,
   *  где её нет, проверяется общий секрет из окружения. Возвращает причину
   *  отказа, а не бросает: обработчик обязан ответить шлюзу кодом. */
  verify(rawBody: string, headers: Headers): { ok: boolean; reason?: string };
}

export type LandedMessage = {
  externalMessageId: string;
  channelId: string;
  clientId: string;
  threadId: string;
  /** null — сообщение уже было: сработала третья линия. */
  messageId: string | null;
};

/** Результат первой фазы: событие durable, дальше можно отвечать шлюзу. */
export type StoredEvent = {
  eventId: string;
  webhookEventId: string;
  /** true — это повтор уже обработанного события, работать не над чем. */
  alreadyProcessed: boolean;
};

export type ProcessResult = {
  /** ignored — событие не про входящие сообщения. */
  status: 'accepted' | 'ignored';
  landed: LandedMessage[];
  /** Сообщения, для которых не нашлось подключённого канала точки. */
  unrouted: string[];
};

export type IngestResult = Omit<ProcessResult, 'status'> & {
  status: 'accepted' | 'duplicate' | 'ignored';
  eventId: string;
  webhookEventId: string;
};

type ChannelRow = {
  id: string;
  point_id: string;
  network_id: string;
  kind: ChannelKind;
  status: string;
};

/** Приведение телефона к одному виду. Без этого склейка по номеру не работает. */
export function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, '');
  if (digits.length < 10) return null;
  // Российская нумерация: 8XXXXXXXXXX и 7XXXXXXXXXX — один и тот же номер.
  const ru = digits.length === 11 && (digits[0] === '8' || digits[0] === '7')
    ? '7' + digits.slice(1)
    : digits.length === 10 ? '7' + digits
    : digits;
  return '+' + ru;
}

/** Отпечаток тела: ключ идемпотентности там, где провайдер своего не прислал. */
export function fingerprint(body: string): string {
  return 'sha256:' + createHash('sha256').update(body).digest('hex');
}

/**
 * Фаза 1. Сырое событие ложится в базу до всякой бизнес-логики.
 * Быстрая, одна вставка: после неё событие не потеряется, даже если процесс
 * умрёт на разборе.
 */
export async function storeEvent(
  plug: ProviderPlug,
  raw: unknown,
  rawBody?: string,
): Promise<StoredEvent> {
  const eventId = plug.eventId(raw) ?? fingerprint(rawBody ?? JSON.stringify(raw));

  // ── Линия 1.
  const inserted = await sys<{ id: string }>(
    `insert into webhook_events (provider, external_event_id, payload)
     values ($1, $2, $3::jsonb)
     on conflict (provider, external_event_id) do nothing
     returning id`,
    [plug.dbProvider, eventId, JSON.stringify(raw)],
  );
  if (inserted.length > 0) {
    return { eventId, webhookEventId: inserted[0].id, alreadyProcessed: false };
  }

  // ── Линия 2. Строка есть. Обработана — уходим; не обработана — доигрываем.
  const prev = await sys<{ id: string; processed_at: string | null }>(
    `select id, processed_at from webhook_events
      where provider = $1 and external_event_id = $2`,
    [plug.dbProvider, eventId],
  );
  if (prev.length === 0) throw new Error('webhook_events: конфликт без строки');
  return {
    eventId,
    webhookEventId: prev[0].id,
    alreadyProcessed: prev[0].processed_at !== null,
  };
}

/** Фаза 2. Разбор и раскладка по тредам. Идемпотентна: можно звать повторно. */
export async function processEvent(
  plug: ProviderPlug,
  raw: unknown,
  webhookEventId: string,
): Promise<ProcessResult> {
  const parsed = plug.parse(raw);
  const landed: LandedMessage[] = [];
  const unrouted: string[] = [];

  for (const msg of parsed) {
    const channel = await resolveChannel(plug.dbProvider, msg);
    if (!channel) {
      unrouted.push(msg.externalMessageId);
      continue;
    }
    const claims: Claims = {
      app_role: 'manager',
      point_id: channel.point_id,
      network_id: channel.network_id,
    };
    landed.push(await withTenant(claims, c => land(c, channel, msg, plug.dbProvider)));
  }

  await sys(`update webhook_events set processed_at = now() where id = $1`, [webhookEventId]);
  return { status: parsed.length === 0 ? 'ignored' : 'accepted', landed, unrouted };
}

/** Обе фазы подряд. Так вызывают тесты и любой не-HTTP путь. */
export async function ingestWebhook(
  plug: ProviderPlug,
  raw: unknown,
  rawBody?: string,
): Promise<IngestResult> {
  const stored = await storeEvent(plug, raw, rawBody);
  if (stored.alreadyProcessed) {
    return { ...stored, status: 'duplicate', landed: [], unrouted: [] };
  }
  const done = await processEvent(plug, raw, stored.webhookEventId);
  return { ...stored, ...done };
}

/**
 * Канал точки по паре «провайдер + внешний идентификатор». Идёт через sys():
 * арендатор ещё неизвестен, RLS-претензии выставить не из чего — точку мы
 * узнаём именно из этой строки.
 */
async function resolveChannel(dbProvider: string, msg: RoutedMessage): Promise<ChannelRow | null> {
  const rows = await sys<ChannelRow>(
    `select ch.id, ch.point_id, p.network_id, ch.kind, ch.status
       from channels ch
       join points p on p.id = ch.point_id
      where ch.provider = $1 and ch.external_id = $2 and ch.kind = $3::channel_kind
      limit 1`,
    [dbProvider, msg.channelExternalId, msg.channelKind],
  );
  return rows[0] ?? null;
}

async function land(
  c: PoolClient,
  channel: ChannelRow,
  msg: RoutedMessage,
  dbProvider: string,
): Promise<LandedMessage> {
  const clientId = await resolveClient(c, channel, msg, dbProvider);
  const threadId = await resolveThread(c, channel, clientId);

  // ── Линия 3. Частичный уникальный индекс messages (channel_id, external_message_id).
  const ins = await c.query(
    `insert into messages
       (point_id, thread_id, channel_id, direction, body, attachments, external_message_id, sent_at)
     values ($1, $2, $3, 'in', $4, $5::jsonb, $6, $7)
     on conflict (channel_id, external_message_id) where external_message_id is not null
     do nothing
     returning id`,
    [
      channel.point_id, threadId, channel.id,
      msg.text ?? null, JSON.stringify(msg.attachments ?? []),
      msg.externalMessageId, msg.sentAt,
    ],
  );

  if (ins.rows.length > 0) {
    await c.query(
      `update threads
          set last_message_at = greatest(coalesce(last_message_at, $2::timestamptz), $2::timestamptz)
        where id = $1`,
      [threadId, msg.sentAt],
    );
  }

  return {
    externalMessageId: msg.externalMessageId,
    channelId: channel.id,
    clientId,
    threadId,
    messageId: ins.rows.length > 0 ? (ins.rows[0].id as string) : null,
  };
}

async function resolveClient(
  c: PoolClient,
  channel: ChannelRow,
  msg: RoutedMessage,
  dbProvider: string,
): Promise<string> {
  const phone = normalizePhone(msg.authorPhone);

  if (phone) {
    // Склейка по телефону. Тот же номер из другого канала попадёт в этого же
    // клиента — а значит, и в его тред. Имя не перетираем: то, что менеджер
    // однажды поправил руками, шлюз затирать не должен.
    const r = await c.query(
      `insert into clients (point_id, name, phone, source)
       values ($1, $2, $3, $4)
       on conflict (point_id, phone) where phone is not null
       do update set name = coalesce(clients.name, excluded.name)
       returning id`,
      [channel.point_id, msg.authorName ?? null, phone, dbProvider],
    );
    return r.rows[0].id as string;
  }

  // Телефона нет. Личность — пара «канал + внешний чат».
  const anchor = `${dbProvider}:${msg.channelKind}:${msg.externalThreadId}`;
  await c.query(
    `select pg_advisory_xact_lock(hashtextextended($1, 0))`,
    [`${channel.point_id}|${anchor}`],
  );

  const found = await c.query(
    `select id from clients where point_id = $1 and source = $2 limit 1`,
    [channel.point_id, anchor],
  );
  if (found.rows.length > 0) return found.rows[0].id as string;

  const created = await c.query(
    `insert into clients (point_id, name, source) values ($1, $2, $3) returning id`,
    [channel.point_id, msg.authorName ?? null, anchor],
  );
  return created.rows[0].id as string;
}

/** Один клиент — один открытый тред. Канал остаётся свойством сообщения (О-5). */
async function resolveThread(c: PoolClient, channel: ChannelRow, clientId: string): Promise<string> {
  const open = await c.query(
    `select id from threads
      where client_id = $1 and status = 'open'
      order by created_at asc limit 1`,
    [clientId],
  );
  if (open.rows.length > 0) return open.rows[0].id as string;

  const created = await c.query(
    `insert into threads (point_id, client_id, status) values ($1, $2, 'open') returning id`,
    [channel.point_id, clientId],
  );
  return created.rows[0].id as string;
}
