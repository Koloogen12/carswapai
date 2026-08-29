/**
 * Что доказывает этот прогон.
 *
 *   1. Повторная доставка того же вебхука не создаёт второго сообщения.
 *      Шлюзы доставляют повторно и всплесками — это норма, а не сбой, и
 *      второе обращение от одного клиента менеджер разбирает руками.
 *   2. Повтор с ДРУГИМ идентификатором события тоже не задваивает: первая
 *      линия его пропустит, а уникальный индекс messages — нет.
 *   3. Два обращения с одного телефона из разных каналов попадают в один
 *      тред, даже если номер записан по-разному («8 999…» и «79990…»).
 *   4. Канал без телефона (Авито) склеивается по паре «канал + чат» и не
 *      сливается с чужим клиентом.
 *   5. Эхо собственной отправки не заводит входящего.
 *   6. capabilities() отвечает честно там, где площадка не даёт писать
 *      первым, и Авито отказывает в ссылке ДО обращения к сети.
 *
 * ЗАПУСК. Раннера тестов в проекте нет, поэтому прогон собирается tsc и
 * запускается node — одной командой из каталога app:
 *
 *   npx tsc src/lib/adapters/impl/__tests__/idempotency.test.ts \
 *     --outDir /tmp/carswap-test --module commonjs --moduleResolution node10 \
 *     --target ES2022 --esModuleInterop --skipLibCheck \
 *   && NODE_PATH="$PWD/node_modules" \
 *      node /tmp/carswap-test/adapters/impl/__tests__/idempotency.test.js
 *
 * (Сборка в commonjs не прихоть: lib/db.ts берёт из pg именованный экспорт,
 *  а pg — модуль CommonJS, и напрямую как ESM node его не разбирает.)
 *
 * База берётся из DATABASE_URL, по умолчанию — локальная разработка
 * (сокет /tmp/cswdev, порт 55432, БД carswap, пользователь postgres).
 * Прогон убирает за собой: заводит свои каналы и своих клиентов и удаляет
 * их в конце. Посевные данные не трогает.
 */

import { sys, withTenant, type Claims } from '../../../db';
import { ingestWebhook, normalizePhone } from '../ingest';
import { createWazzupAdapter, wazzupPlug } from '../wazzup';
import { avitoPlug, createAvitoAdapter } from '../avito';

/* ── Данные прогона ──────────────────────────────────────────────────────── */

const POINT = 'b0000000-0000-4000-8000-000000000001';   // посевная точка
const NETWORK = 'a0000000-0000-4000-8000-000000000001'; // её сеть
const WA_CHANNEL = 'test-wz-wa-01';
const TG_CHANNEL = 'test-wz-tg-01';
const AV_ACCOUNT = '9042121';
const AV_CHAT = 'test-av-chat-01';
const AV_ANCHOR = `avito_direct:avito:${AV_CHAT}`;

/** Один и тот же номер в двух видах: так его и присылают разные каналы. */
const PHONE_FROM_WHATSAPP = '79990000142';        // chatId WhatsApp и есть номер
const PHONE_FROM_TELEGRAM = '8 (999) 000-01-42';  // contact.phone из Telegram
const PHONE_STORED = '+79990000142';

const EXTERNAL_IDS = [WA_CHANNEL, TG_CHANNEL, AV_ACCOUNT];

/* ── Мелкий стенд ────────────────────────────────────────────────────────── */

let failures = 0;

function check(name: string, ok: boolean, detail = ''): void {
  if (ok) console.log(`ok  · ${name}`);
  else {
    failures++;
    console.log(`ПРОВАЛ · ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function eq(name: string, got: unknown, want: unknown): void {
  check(name, Object.is(got, want),
    `получили ${JSON.stringify(got)}, ждали ${JSON.stringify(want)}`);
}

// Считаем под претензией арендатора: без неё RLS вернёт ноль, и проверка
// «второго сообщения не появилось» пройдёт даже когда оно появилось.
// Это ровно тот ложно-зелёный результат, ради которого страж и поставлен.
async function count(sql: string, params: unknown[] = []): Promise<number> {
  const rows = /\bwebhook_events\b/.test(sql) && !/\bmessages\b|\bclients\b|\bthreads\b|\bchannels\b/.test(sql)
    ? await sys<{ n: number }>(sql, params)
    : (await withTenant(TENANT, c => c.query<{ n: number }>(sql, params))).rows;
  return Number(rows[0]?.n ?? 0);
}

/* ── Полезные нагрузки в формате провайдеров ─────────────────────────────── */

function waMessage(messageId: string, text: string) {
  return {
    messageId,
    channelId: WA_CHANNEL,
    chatType: 'whatsapp',
    chatId: PHONE_FROM_WHATSAPP,
    dateTime: '2026-08-29T09:00:00.000Z',
    type: 'text',
    isEcho: false,
    status: 'inbound',
    text,
    contact: { name: 'Тестовый Клиент' },
  };
}

function tgMessage(messageId: string, text: string) {
  return {
    messageId,
    channelId: TG_CHANNEL,
    chatType: 'telegram',
    chatId: '5566778899',                       // числовой id, не номер
    dateTime: '2026-08-29T09:05:00.000Z',
    type: 'text',
    isEcho: false,
    status: 'inbound',
    text,
    contact: { name: 'Тестовый Клиент', phone: PHONE_FROM_TELEGRAM },
  };
}

function avEvent(eventId: string, messageId: string, text: string, authorId = 991) {
  return {
    id: eventId,
    version: 'v3',
    timestamp: 1787000000,
    payload: {
      type: 'message',
      value: {
        id: messageId,
        chat_id: AV_CHAT,
        user_id: Number(AV_ACCOUNT),
        author_id: authorId,
        created: 1787000000,
        published_at: '2026-08-29T09:10:00Z',
        type: 'text',
        chat_type: 'u2i',
        item_id: 4242,
        content: { text },
      },
    },
  };
}

/* ── Подготовка и уборка ─────────────────────────────────────────────────── */

// Уборка и подготовка идут под претензией арендатора, а не через sys():
// каналы, клиенты, треды и сообщения — таблицы под RLS, и на боевой роли
// запрос без претензии молча сделал бы ноль строк. Тест, который убирает за
// собой вхолостую, начал бы врать со второго прогона.
// Роль владельца, а не менеджера: миграция 018 запретила менеджеру заводить
// и удалять каналы — и правильно, каналы это деньги и чужие обращения.
// Фикстура теста делает ровно то, что запрещено менеджеру, значит и роль ей
// нужна та, которой это позволено.
const TENANT: Claims = { app_role: 'owner', point_id: POINT, network_id: NETWORK };

async function scrub(): Promise<void> {
  await withTenant(TENANT, async c => {
    await c.query(
      `delete from messages where channel_id in
         (select id from channels where point_id = $1 and external_id = any($2))`,
      [POINT, EXTERNAL_IDS]);
    await c.query(
      `delete from threads where client_id in
         (select id from clients where point_id = $1 and (phone = $2 or source = $3))`,
      [POINT, PHONE_STORED, AV_ANCHOR]);
    await c.query(
      `delete from clients where point_id = $1 and (phone = $2 or source = $3)`,
      [POINT, PHONE_STORED, AV_ANCHOR]);
    await c.query(
      `delete from channels where point_id = $1 and external_id = any($2)`,
      [POINT, EXTERNAL_IDS]);
  });
  // webhook_events вне RLS по построению: вебхук кладётся до того, как
  // арендатор вообще известен. Здесь sys() законен.
  await sys(
    `delete from webhook_events
      where external_event_id like 'wz:test-%' or external_event_id like 'av:test-%'`);
}

async function connectChannels(): Promise<void> {
  await withTenant(TENANT, c => c.query(
    `insert into channels (point_id, kind, provider, external_id, can_send_images, can_initiate)
     values ($1,'whatsapp','wazzup',$2,true,false),
            ($1,'telegram','wazzup',$3,true,true),
            ($1,'avito','avito_direct',$4,true,false)
     on conflict (point_id, kind, external_id) do nothing`,
    [POINT, WA_CHANNEL, TG_CHANNEL, AV_ACCOUNT]));
}

/* ── Прогон ──────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  await scrub();
  await connectChannels();

  // ── 1. Повторная доставка того же вебхука ──────────────────────────────
  const w1 = { messages: [waMessage('test-wa-msg-1', 'Здравствуйте, сколько стоит оклейка X5?')] };

  const first = await ingestWebhook(wazzupPlug, w1, JSON.stringify(w1));
  eq('вебхук принят', first.status, 'accepted');
  check('сообщение создано', first.landed[0]?.messageId !== null);

  const again = await ingestWebhook(wazzupPlug, w1, JSON.stringify(w1));
  eq('повтор опознан как дубликат', again.status, 'duplicate');
  check('повтор не породил работы', again.landed.length === 0);

  eq('в базе одно сообщение, а не два',
    await count(`select count(*)::int as n from messages where external_message_id = $1`,
      ['test-wa-msg-1']), 1);
  eq('в webhook_events одна запись о событии',
    await count(`select count(*)::int as n from webhook_events where external_event_id = $1`,
      ['wz:test-wa-msg-1']), 1);

  const waThread = first.landed[0].threadId;

  // ── 2. Повтор с другим идентификатором события ─────────────────────────
  // Шлюз шлёт пачкой: старое сообщение вместе с новым. Первая линия такое
  // событие пропустит — ключ другой. Не задвоить обязан уникальный индекс
  // messages (channel_id, external_message_id).
  const w2 = {
    messages: [waMessage('test-wa-msg-1', 'Здравствуйте, сколько стоит оклейка X5?'),
               waMessage('test-wa-msg-2', 'И ещё тонировку посчитайте')],
  };
  const batch = await ingestWebhook(wazzupPlug, w2, JSON.stringify(w2));
  eq('пачка с новым ключом события принята', batch.status, 'accepted');

  const old = batch.landed.find(m => m.externalMessageId === 'test-wa-msg-1');
  const fresh = batch.landed.find(m => m.externalMessageId === 'test-wa-msg-2');
  check('старое сообщение не записано повторно', old?.messageId === null,
    `messageId = ${JSON.stringify(old?.messageId)}`);
  check('новое сообщение записано', typeof fresh?.messageId === 'string');
  eq('старого сообщения по-прежнему одна копия',
    await count(`select count(*)::int as n from messages where external_message_id = $1`,
      ['test-wa-msg-1']), 1);

  // ── 3. Один телефон, два канала — один тред ────────────────────────────
  const t1 = { messages: [tgMessage('test-tg-msg-1', 'Это снова я, пишу из телеграма')] };
  const tg = await ingestWebhook(wazzupPlug, t1, JSON.stringify(t1));
  eq('обращение из второго канала принято', tg.status, 'accepted');

  eq('тред тот же, что у WhatsApp', tg.landed[0]?.threadId, waThread);
  eq('клиент один, а не два',
    await count(`select count(*)::int as n from clients where point_id = $1 and phone = $2`,
      [POINT, PHONE_STORED]), 1);
  eq('оба сообщения лежат в одном треде',
    await count(`select count(distinct thread_id)::int as n from messages
                  where external_message_id in ('test-wa-msg-1','test-tg-msg-1')`), 1);
  eq('и пришли они по разным каналам',
    await count(`select count(distinct channel_id)::int as n from messages
                  where external_message_id in ('test-wa-msg-1','test-tg-msg-1')`), 2);
  eq('телефон приведён к одному виду',
    normalizePhone(PHONE_FROM_TELEGRAM), normalizePhone(PHONE_FROM_WHATSAPP));

  // ── 4. Авито: телефона нет, склейка по паре «канал + чат» ──────────────
  const a1 = avEvent('test-av-evt-1', 'test-av-msg-1', 'Здравствуйте, объявление ещё актуально?');
  const av1 = await ingestWebhook(avitoPlug, a1, JSON.stringify(a1));
  eq('обращение с Авито принято', av1.status, 'accepted');

  const av1again = await ingestWebhook(avitoPlug, a1, JSON.stringify(a1));
  eq('повтор с Авито опознан как дубликат', av1again.status, 'duplicate');
  eq('на Авито тоже одно сообщение',
    await count(`select count(*)::int as n from messages where external_message_id = $1`,
      ['test-av-msg-1']), 1);

  const a2 = avEvent('test-av-evt-2', 'test-av-msg-2', 'И ещё вопрос про сроки');
  const av2 = await ingestWebhook(avitoPlug, a2, JSON.stringify(a2));
  eq('второе сообщение того же чата — тот же тред',
    av2.landed[0]?.threadId, av1.landed[0]?.threadId);
  check('клиент без телефона не слился с клиентом по телефону',
    av1.landed[0]?.threadId !== waThread);

  // ── 5. Эхо собственной отправки ────────────────────────────────────────
  const echo = avEvent('test-av-evt-3', 'test-av-msg-3', 'Добрый день! Считаем.',
    Number(AV_ACCOUNT));
  const echoed = await ingestWebhook(avitoPlug, echo, JSON.stringify(echo));
  eq('эхо нашей же отправки не становится входящим', echoed.status, 'ignored');
  eq('и в треде его нет',
    await count(`select count(*)::int as n from messages where external_message_id = $1`,
      ['test-av-msg-3']), 0);

  // ── 6. Честные возможности каналов ─────────────────────────────────────
  const avitoAdapter = createAvitoAdapter({ userId: AV_ACCOUNT });
  const avitoCaps = avitoAdapter.capabilities();
  eq('Авито · ссылки запрещены', avitoCaps.allowsLinks, false);
  eq('Авито · писать первым нельзя', avitoCaps.initiate, false);
  eq('Авито · изображения можно', avitoCaps.images, true);
  eq('Авито · предел текста 1000', avitoCaps.maxTextLength, 1000);

  // Отказ обязан прийти ДО обращения к сети: ключей Авито в окружении нет,
  // и если бы проверка не сработала, в ошибке была бы переменная окружения.
  const linkAttempt = await avitoAdapter.sendText(AV_CHAT, 'Примеры тут: example.ru/portfolio');
  check('Авито · ссылка отклонена до отправки',
    linkAttempt.state === 'failed' && /ссылк/i.test(linkAttempt.error ?? ''),
    JSON.stringify(linkAttempt));

  const cap = (transport: 'business_api' | 'personal' | 'bot',
               kind: 'whatsapp' | 'telegram' = 'whatsapp') =>
    createWazzupAdapter({ kind, channelId: WA_CHANNEL, transport }).capabilities();
  eq('WhatsApp Business API · писать первым нельзя', cap('business_api').initiate, false);
  eq('Telegram-бот · писать первым нельзя', cap('bot', 'telegram').initiate, false);
  eq('Личный номер · писать первым можно', cap('personal').initiate, true);

  await scrub();

  console.log(failures === 0
    ? '\nВсе проверки пройдены.'
    : `\nПРОВАЛ · неуспешных проверок: ${failures}`);

  // Пул соединений держит цикл событий; для скрипта проверки выходим явно.
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch(e => {
  console.error('ПРОВАЛ · прогон оборвался:', e);
  process.exit(1);
});
