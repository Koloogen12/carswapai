/**
 * Единая дверь для входящих вебхуков: /api/webhooks/<провайдер>.
 *
 * Провайдер — сегмент пути, а не отдельный обработчик на каждый шлюз: О-5
 * говорит, что канал это свойство сообщения, и разводить мессенджеры по коду
 * значит завести пять путей, где идемпотентность реализована пять раз и
 * по-разному. Формат разбирает адаптер, всё остальное общее.
 *
 * Порядок здесь важнее кода:
 *   1. читаем тело текстом — отпечаток тела нужен там, где провайдер не даёт
 *      идентификатора события;
 *   2. проверяем подлинность;
 *   3. кладём сырое событие в webhook_events под уникальным индексом
 *      (provider, external_event_id) — до всякой бизнес-логики;
 *   4. и только потом разбираем и раскладываем по тредам.
 *
 * СРОК ОТВЕТА. Wazzup ждёт 30 секунд, Авито — 2, и при просрочке снимает
 * подписку: канал входящих точки замолкает целиком, а точка узнаёт об этом
 * от клиента, который «писал и не ответили». Поэтому после шага 3 событие уже
 * durable, и если разбор не укладывается в срок провайдера, отвечаем 200 и
 * дописываем следом. Терять обращение нельзя, врать шлюзу — тоже.
 *
 * Коды ответа выбраны под поведение шлюзов, а не под красоту:
 *   200 — событие принято ИЛИ это повтор уже обработанного. Повтор не ошибка:
 *         шлюзы доставляют повторно по устройству.
 *   401 — не прошла проверка подлинности.
 *   404 — неизвестный провайдер в пути.
 *   400 — тело не JSON.
 *   500 — упали на обработке. Отвечаем ошибкой намеренно: событие лежит в
 *         webhook_events с processed_at = null, и следующая доставка доиграет
 *         его до конца, а уникальный индекс messages не даст задвоить.
 *         Молча ответить 200 значит потерять обращение.
 *
 * ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:
 *   WAZZUP_CRM_KEY / WEBHOOK_SECRET_WAZZUP — подлинность вебхука Wazzup;
 *   WEBHOOK_SECRET_AVITO                   — то же для Авито;
 *   не заданы → проверка отключена, и это состояние возвращается в ответе
 *   полем warning, а не замалчивается.
 *   Переменные самих адаптеров — в шапках wazzup.ts и avito.ts.
 */

import { processEvent, storeEvent, type ProcessResult } from '@/lib/adapters/impl/ingest';
import { plugFor, PROVIDER_SLUGS } from '@/lib/adapters/impl/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function POST(
  req: Request,
  ctx: { params: { provider: string } },
): Promise<Response> {
  const slug = ctx.params.provider;
  const plug = plugFor(slug);
  if (!plug) {
    return json(404, { ok: false, error: `неизвестный провайдер «${slug}»`, known: PROVIDER_SLUGS });
  }

  const rawBody = await req.text();

  const auth = plug.verify(rawBody, req.headers);
  if (!auth.ok) return json(401, { ok: false, error: auth.reason ?? 'не пройдена проверка' });

  let raw: unknown;
  try {
    raw = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return json(400, { ok: false, error: 'тело вебхука не является JSON' });
  }

  try {
    const stored = await storeEvent(plug, raw, rawBody);
    if (stored.alreadyProcessed) {
      return json(200, { ok: true, status: 'duplicate', event: stored.eventId });
    }

    const work = processEvent(plug, raw, stored.webhookEventId);

    // Отвечаем заведомо раньше срока провайдера: у Авито в двух секундах
    // лежит ещё и сеть до нас.
    const budget = Math.max(250, Math.round(plug.ackDeadlineMs * 0.6));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<null>(resolve => {
      timer = setTimeout(() => resolve(null), budget);
    });

    let done: ProcessResult | null;
    try {
      done = await Promise.race([work, deadline]);
    } finally {
      if (timer) clearTimeout(timer);
    }

    if (done === null) {
      // Не успели. Событие уже сохранено, разбор продолжается; не досмотреть
      // его молча нельзя — поэтому отказ уходит в журнал с идентификатором.
      work.catch(e => console.error(
        `[webhook:${slug}] отложенный разбор события ${stored.eventId} не удался:`, e));
      return json(200, {
        ok: true, status: 'accepted', deferred: true, event: stored.eventId,
        warning: auth.reason,
      });
    }

    return json(200, {
      ok: true,
      status: done.status,
      event: stored.eventId,
      landed: done.landed.map(m => ({
        externalMessageId: m.externalMessageId,
        threadId: m.threadId,
        /** false — сообщение уже было: сработал уникальный индекс messages. */
        created: m.messageId !== null,
      })),
      unrouted: done.unrouted,
      // Не задан секрет — говорим об этом в ответе, а не молчим.
      warning: auth.reason,
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    console.error(`[webhook:${slug}] обработка не удалась:`, reason);
    return json(500, { ok: false, error: 'обработка не удалась, событие сохранено для повтора' });
  }
}

/** Проверка живости адреса при настройке шлюза. Данных не отдаёт. */
export async function GET(
  _req: Request,
  ctx: { params: { provider: string } },
): Promise<Response> {
  const plug = plugFor(ctx.params.provider);
  return plug
    ? json(200, { ok: true, provider: plug.slug, accepts: 'POST', ackDeadlineMs: plug.ackDeadlineMs })
    : json(404, { ok: false, known: PROVIDER_SLUGS });
}
