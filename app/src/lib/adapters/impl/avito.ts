/**
 * Авито — прямой Messenger API (api.avito.ru), без шлюза-посредника.
 *
 * ГЛАВНОЕ ПРО ЭТОТ КАНАЛ, И ЭТО НЕ ПРО ТЕХНИКУ.
 *
 * allowsLinks = false. Отправка изображений здесь работает и подтверждена:
 * uploadImages отдаёт image_id, сообщение отправляется с этим image_id.
 * А вот ссылки-уводы модерация Авито режет, и под риском не одно сообщение,
 * а весь канал входящих точки (краевой случай №10). Поэтому ссылка в тексте —
 * это отказ ДО отправки, с внятной причиной менеджеру, а не молчаливая
 * пропажа сообщения у клиента. Цена ошибки несимметрична: не отправленная
 * ссылка стоит одного лишнего клика, отключённый Авито — всего потока
 * обращений точки.
 *
 * initiate = false. У Messenger API нет метода создания чата вовсе: любая
 * отправка требует chat_id, а chat_id появляется только тогда, когда клиент
 * написал сам. Написать первым технически не через что. Менеджер должен
 * увидеть это в интерфейсе ДО того, как напишет и будет ждать ответа.
 *
 * ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (секретов в коде и в репозитории нет):
 *   AVITO_CLIENT_ID       — client_id приложения Авито.
 *   AVITO_CLIENT_SECRET   — client_secret приложения. Скоупы приложения:
 *                           messenger:write (отправка и загрузка картинок),
 *                           messenger:read (список чатов, подписка вебхука).
 *   AVITO_USER_ID         — идентификатор аккаунта продавца. Он же
 *                           channels.external_id для канала kind = 'avito'.
 *   WEBHOOK_SECRET_AVITO  — общий секрет в заголовке X-Webhook-Secret.
 *                           Своей подписи вебхука у Авито нет, поэтому
 *                           адрес вебхука делается неугадываемым, а секрет
 *                           проверяется здесь.
 *   AVITO_API_BASE        — необязательная замена базового адреса.
 */

import type {
  Attachment, ChannelAdapter, ChannelCapabilities, ChannelKind,
  DeliveryResult, NormalizedMessage, OutboundCard,
} from '../channel';
import type { ProviderPlug, RoutedMessage } from './ingest';
import { describe, failed, http, optional, required, sharedSecret, str } from './transport';

const base = () => optional('AVITO_API_BASE') ?? 'https://api.avito.ru';

/** Предел длины текста в сообщении Авито. Не наш выбор — предел площадки. */
const MAX_TEXT = 1000;

/**
 * Ссылки и уводы. Регулярное выражение намеренно шире, чем «http»: модерация
 * реагирует и на голый домен, и на t.me. Лишний отказ дешевле отключённого
 * канала — асимметрия та же, что в шапке файла.
 */
const LINKISH =
  /(https?:\/\/|www\.|\bt\.me\/|\b[a-zA-Zа-яА-Я0-9-]+\.(?:ru|рф|com|net|org|io|me|su|by|kz|online|store|site)\b)/i;

export function containsLink(text: string): boolean {
  return LINKISH.test(text);
}

export interface AvitoConfig {
  /** Идентификатор аккаунта продавца; он же channels.external_id. */
  userId: string;
}

/* ── Токен ────────────────────────────────────────────────────────────────
 * Живёт 24 часа. Держим в памяти процесса и обновляем заранее: истёкший
 * токен — самая частая причина «канал молчит», и чинить её вручную нельзя,
 * иначе С-3 нарушается ровно там, где обещано обратное.
 */
let token: { value: string; expiresAt: number } | null = null;

async function accessToken(force = false): Promise<string> {
  const now = Date.now();
  if (!force && token && token.expiresAt > now + 60_000) return token.value;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: required('AVITO_CLIENT_ID'),
    client_secret: required('AVITO_CLIENT_SECRET'),
  });
  const r = await http(`${base()}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    timeoutMs: 10_000,
  });
  if (!r.ok) throw new Error(`Авито не выдал токен: ${describe(r)}`);
  const value = str(r.body, 'access_token');
  if (!value) throw new Error('Ответ Авито без access_token');
  const ttlRaw = str(r.body, 'expires_in');
  const ttl = ttlRaw ? Number(ttlRaw) : 86_400;
  token = { value, expiresAt: now + (Number.isFinite(ttl) ? ttl : 86_400) * 1000 };
  return value;
}

/** Сбросить токен: нужен тестам и ручной перепривязке канала. */
export function forgetToken(): void { token = null; }

/* ── Разбор вебхука ──────────────────────────────────────────────────────── */

function contentAttachments(value: Record<string, unknown>): Attachment[] {
  const type = str(value, 'type');
  if (type !== 'image') return [];
  const sizes = (value.content as Record<string, unknown> | undefined)?.image;
  if (typeof sizes !== 'object' || sizes === null) return [];
  const bag = (sizes as Record<string, unknown>).sizes;
  if (typeof bag !== 'object' || bag === null) return [];
  // Берём самый крупный доступный размер: ключи вида «1280x960».
  const entries = Object.entries(bag as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'string')
    .sort((a, b) => area(b[0]) - area(a[0]));
  return entries.length
    ? [{ kind: 'image', url: entries[0][1] as string, mime: 'image/jpeg' }]
    : [];
}

function area(size: string): number {
  const [w, h] = size.split('x').map(Number);
  return Number.isFinite(w) && Number.isFinite(h) ? w * h : 0;
}

/**
 * Разбор события Авито.
 *
 * Эхо собственных отправок отличается не полем direction — в вебхуке его нет,
 * — а сравнением author_id с user_id: user_id это всегда аккаунт, на который
 * зарегистрирован вебхук. Совпали — сообщение наше, и второй записью в треде
 * висеть не должно.
 *
 * type = 'system' — служебные сообщения самого Авито (скидки, уведомления).
 * Это не клиент, и заводить на них обращение нельзя: менеджер получит
 * входящее, на которое некому отвечать.
 */
export function parseAvitoWebhook(raw: unknown): RoutedMessage[] {
  const payload = (raw as Record<string, unknown> | null)?.payload;
  if (typeof payload !== 'object' || payload === null) return [];
  if (str(payload, 'type') !== 'message') return [];
  const value = (payload as Record<string, unknown>).value;
  if (typeof value !== 'object' || value === null) return [];
  const v = value as Record<string, unknown>;

  const messageId = str(v, 'id');
  const chatId = str(v, 'chat_id');
  const userId = str(v, 'user_id');
  const authorId = str(v, 'author_id');
  if (!messageId || !chatId || !userId) return [];

  const type = str(v, 'type');
  if (type === 'system' || type === 'deleted') return [];
  if (authorId && authorId === userId) return [];   // эхо нашей же отправки

  const created = str(v, 'created');
  const publishedAt = str(v, 'published_at');
  const sentAt = publishedAt ? new Date(publishedAt)
    : created ? new Date(Number(created) * 1000)
    : new Date();

  return [{
    channelKind: 'avito',
    channelExternalId: userId,
    externalThreadId: chatId,
    externalMessageId: messageId,
    // Телефона Авито не отдаёт нигде: в схеме мессенджера такого поля нет.
    // Значит, склейка по телефону для этого канала невозможна, и клиент
    // опознаётся парой «канал + чат» (см. ingest.ts).
    authorPhone: undefined,
    authorName: undefined,
    text: str(v, 'content', 'text'),
    attachments: contentAttachments(v),
    sentAt: Number.isNaN(sentAt.getTime()) ? new Date() : sentAt,
  }];
}

export const avitoPlug: ProviderPlug = {
  slug: 'avito',
  dbProvider: 'avito_direct',
  /**
   * Авито требует 200 за 2 секунды, иначе считает адрес мёртвым и снимает
   * подписку — а это тот самый отключённый канал входящих. Обработчик
   * укладывается в этот срок или отвечает раньше, дописывая остальное следом.
   */
  ackDeadlineMs: 2_000,
  /** Идентификатор события Авито даёт сам — берём его, а не отпечаток тела. */
  eventId(raw: unknown): string | null {
    const id = str(raw, 'id');
    return id ? 'av:' + id : null;
  },
  parse: parseAvitoWebhook,
  /** Подписи у Авито нет: только неугадываемый адрес и общий секрет. */
  verify(_rawBody, headers) {
    return sharedSecret('WEBHOOK_SECRET_AVITO', headers);
  },
};

/* ── Адаптер ─────────────────────────────────────────────────────────────── */

class AvitoAdapter implements ChannelAdapter {
  readonly kind: ChannelKind = 'avito';
  readonly provider = 'avito_direct';
  constructor(private readonly cfg: AvitoConfig) {}

  capabilities(): ChannelCapabilities {
    return {
      text: true,
      // Подтверждено: uploadImages → image_id → сообщение с этим image_id.
      images: true,
      // Произвольных файлов Messenger API отправлять не умеет: в нём есть
      // только текст и изображение.
      files: false,
      // Метода создания чата в API нет. Первым написать не через что.
      initiate: false,
      maxTextLength: MAX_TEXT,
      // Не техническое ограничение, а защита канала: см. шапку файла.
      allowsLinks: false,
    };
  }

  receive(raw: unknown): NormalizedMessage[] {
    return parseAvitoWebhook(raw).filter(m => m.channelExternalId === this.cfg.userId);
  }

  async sendText(externalThreadId: string, text: string): Promise<DeliveryResult> {
    const guard = this.guardText(text);
    if (guard) return guard;
    return this.postText(externalThreadId, text);
  }

  /**
   * Карточка. Изображений в одном сообщении Авито не принимает: uploadImages
   * грузит по одному файлу за вызов, а отправка берёт ровно один image_id.
   * Значит, карточка — последовательность: сначала текст с подписью и строкой
   * честности, потом три света по одному.
   *
   * Порядок тот же, что у Wazzup, и по той же причине: обрыв после текста
   * оставляет клиента без картинок, обрыв после картинок оставил бы его с
   * рендерами без оговорки про оттенок. Второе прямо запрещено О-2.
   */
  async sendCard(externalThreadId: string, card: OutboundCard): Promise<DeliveryResult> {
    const caption = `${card.caption}\n\n${card.honestyLine}`.trim();
    const guard = this.guardText(caption);
    if (guard) return guard;

    const head = await this.postText(externalThreadId, caption);
    if (head.state === 'failed') return head;

    for (let i = 0; i < card.images.length; i++) {
      const r = await this.postImage(externalThreadId, card.images[i], `light-${i + 1}.jpg`);
      if (r.state === 'failed') {
        return {
          state: 'failed',
          externalMessageId: head.externalMessageId,
          error: `Ушли текст и ${i} из 3 изображений. Дальше отказ: ${r.error}`,
        };
      }
    }
    return { state: 'sent', externalMessageId: head.externalMessageId };
  }

  /** Проверки, которые обязаны сработать ДО обращения к сети. */
  private guardText(text: string): DeliveryResult | null {
    const cap = this.capabilities();
    if (!cap.allowsLinks && containsLink(text)) {
      return failed(
        'В тексте ссылка. Авито режет сообщения со ссылками-уводами модерацией, ' +
        'и под риском весь канал входящих точки. Уберите ссылку или отправьте её ' +
        'другим каналом.',
      );
    }
    if (text.length > cap.maxTextLength) {
      return failed(
        `Авито принимает не больше ${cap.maxTextLength} символов, в тексте ${text.length}. ` +
        'Сообщение целиком не уйдёт.',
      );
    }
    return null;
  }

  private async postText(chatId: string, text: string): Promise<DeliveryResult> {
    return this.call(async auth => {
      const r = await http(
        `${base()}/messenger/v1/accounts/${enc(this.cfg.userId)}/chats/${enc(chatId)}/messages`,
        {
          method: 'POST',
          headers: { ...auth, 'content-type': 'application/json' },
          body: JSON.stringify({ type: 'text', message: { text } }),
        },
      );
      if (!r.ok) return failed(`Авито отказал: ${describe(r)}`);
      return { state: 'sent', externalMessageId: str(r.body, 'id') };
    });
  }

  /**
   * Изображение: сначала uploadImages (multipart, поле uploadfile[]), затем
   * отправка сообщения с полученным image_id. Идентификатор приходит КЛЮЧОМ
   * объекта, а не полем, — поэтому читается через Object.keys.
   */
  private async postImage(
    chatId: string,
    bytes: Uint8Array,
    name: string,
  ): Promise<DeliveryResult> {
    return this.call(async auth => {
      const form = new FormData();
      form.append('uploadfile[]', new Blob([bytes as unknown as BlobPart], { type: 'image/jpeg' }), name);

      const up = await http(
        `${base()}/messenger/v1/accounts/${enc(this.cfg.userId)}/uploadImages`,
        { method: 'POST', headers: auth, body: form, timeoutMs: 30_000 },
      );
      if (!up.ok) return failed(`Авито не принял изображение: ${describe(up)}`);
      const imageId = up.body && typeof up.body === 'object'
        ? Object.keys(up.body as Record<string, unknown>)[0]
        : undefined;
      if (!imageId) return failed('Авито принял изображение, но не вернул image_id');

      const r = await http(
        `${base()}/messenger/v1/accounts/${enc(this.cfg.userId)}/chats/${enc(chatId)}/messages/image`,
        {
          method: 'POST',
          headers: { ...auth, 'content-type': 'application/json' },
          body: JSON.stringify({ image_id: imageId }),
        },
      );
      if (!r.ok) return failed(`Авито отказал в отправке изображения: ${describe(r)}`);
      return { state: 'sent', externalMessageId: str(r.body, 'id') };
    });
  }

  /**
   * Обёртка с одной повторной попыткой на протухший токен. Токен живёт сутки,
   * и «канал вдруг замолчал ровно через сутки» чинится здесь, а не звонком.
   */
  private async call(
    fn: (auth: Record<string, string>) => Promise<DeliveryResult>,
  ): Promise<DeliveryResult> {
    try {
      const first = await fn({ authorization: `Bearer ${await accessToken()}` });
      if (first.state !== 'failed' || !/HTTP 401/.test(first.error ?? '')) return first;
      return await fn({ authorization: `Bearer ${await accessToken(true)}` });
    } catch (e) {
      return failed(e instanceof Error ? e.message : String(e));
    }
  }

  async health(): Promise<{ connected: boolean; reason?: string; fixHint?: string }> {
    let auth: string;
    try {
      auth = await accessToken(true);
    } catch (e) {
      return {
        connected: false,
        reason: e instanceof Error ? e.message : String(e),
        fixHint: 'Проверить AVITO_CLIENT_ID и AVITO_CLIENT_SECRET в окружении',
      };
    }
    try {
      const r = await http(
        `${base()}/messenger/v2/accounts/${enc(this.cfg.userId)}/chats?limit=1`,
        { headers: { authorization: `Bearer ${auth}` }, timeoutMs: 8000 },
      );
      if (r.ok) return { connected: true };
      if (r.status === 403) {
        return {
          connected: false,
          reason: 'Токен получен, но у приложения нет нужных прав',
          fixHint: 'Выдать приложению скоупы messenger:read и messenger:write и переподключить канал',
        };
      }
      if (r.status === 401) {
        return {
          connected: false,
          reason: 'Авито не принял токен',
          fixHint: 'Перевыпустить client_secret в кабинете Авито и заменить AVITO_CLIENT_SECRET',
        };
      }
      if (r.status === 404) {
        return {
          connected: false,
          reason: `Аккаунт ${this.cfg.userId} не найден`,
          fixHint: 'Сверить AVITO_USER_ID с идентификатором аккаунта продавца',
        };
      }
      return { connected: false, reason: `Авито недоступен: ${describe(r)}` };
    } catch (e) {
      return { connected: false, reason: `Сеть до Авито: ${e instanceof Error ? e.message : e}` };
    }
  }
}

function enc(v: string): string { return encodeURIComponent(v); }

export function createAvitoAdapter(cfg: AvitoConfig): ChannelAdapter {
  return new AvitoAdapter(cfg);
}
