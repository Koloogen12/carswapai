/**
 * Wazzup24 API v3 — шлюз к WhatsApp и Telegram.
 *
 * Один провайдер на два канала: в одном теле вебхука приходят сообщения всех
 * каналов аккаунта сразу, поэтому разбор общий на провайдера, а отправка —
 * с конкретного подключённого канала точки (channelId).
 *
 * ЧЕСТНОСТЬ ВОЗМОЖНОСТЕЙ (О-7). initiate зависит не от Wazzup, а от площадки:
 *   whatsapp + business_api — вне 24-часового окна уходит только одобренный
 *     шаблон, произвольный текст не уйдёт → false;
 *   whatsapp + personal     — личный номер пишет кому угодно → true;
 *   telegram + bot          — бот не пишет первым тому, кто не начал диалог.
 *     Это ограничение Telegram, обойти нечем → false;
 *   telegram + personal     — личный аккаунт пишет первым → true.
 * Менеджер обязан узнать про false ДО отправки, иначе он узнает о нём от
 * молчащего клиента — а это обращение точки в управляющую компанию.
 *
 * ГРАНИЦА ПРОВАЙДЕРА, ПРОВЕРЕННАЯ ПО ДОКУМЕНТАЦИИ: POST /v3/message принимает
 * ЛИБО text, ЛИБО contentUri (одну строку, не массив). Ни альбома, ни подписи
 * к изображению, ни пакетной отправки в API нет. Поэтому карточка уходит
 * упорядоченной последовательностью сообщений — см. комментарий к sendCard.
 *
 * ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (секретов в коде и в репозитории нет):
 *   WAZZUP_API_KEY         — ключ API из кабинета Wazzup. Нужен для отправки
 *                            и health(); разбор вебхука работает без него.
 *   WAZZUP_CRM_KEY         — ключ, который Wazzup кладёт в заголовок
 *                            Authorization: Bearer <ключ> при вызове нашего
 *                            вебхука. Задан — проверяем. Это единственная
 *                            проверка подлинности, которую даёт Wazzup:
 *                            подписи тела у него нет.
 *   WEBHOOK_SECRET_WAZZUP  — запасной общий секрет в заголовке
 *                            X-Webhook-Secret, если crmKey не заведён.
 *   WAZZUP_API_BASE        — необязательная замена базового адреса.
 */

import { createHash } from 'node:crypto';
import type {
  Attachment, ChannelAdapter, ChannelCapabilities, ChannelKind,
  DeliveryResult, NormalizedMessage, OutboundCard,
} from '../channel';
import type { ProviderPlug, RoutedMessage } from './ingest';
import {
  arr, bearerSecret, bool, describe, failed, http, optional, required, sharedSecret, str,
} from './transport';

const base = () => optional('WAZZUP_API_BASE') ?? 'https://api.wazzup24.com/v3';

/** Транспорт канала в терминах Wazzup. От него зависит право писать первым. */
export type WazzupTransport = 'business_api' | 'personal' | 'bot';

export interface WazzupConfig {
  /** Wazzup подключает к нам только эти два. */
  kind: Extract<ChannelKind, 'whatsapp' | 'telegram'>;
  /** channelId из Wazzup, он же channels.external_id. */
  channelId: string;
  transport: WazzupTransport;
  /**
   * Wazzup скачивает вложение по ссылке (contentUri) и байтов не принимает.
   * Публикация рендера в достижимый снаружи адрес — дело продукта: файлы
   * отдаются со своего контура (§13, трафик в РФ). Поэтому загрузчик
   * приходит снаружи, и без него sendCard честно отказывает.
   */
  publishImage?: (bytes: Uint8Array, name: string) => Promise<string>;
}

/**
 * chatType из вебхука → канал доменной модели. Что не про нас — null.
 * Групповые чаты (whatsgroup, telegroup) намеренно не разбираем: тред
 * привязан к клиенту, а группа — не клиент.
 */
function chatTypeToKind(chatType: string | undefined): ChannelKind | null {
  switch (chatType) {
    case 'whatsapp': return 'whatsapp';
    case 'telegram': return 'telegram';
    default: return null;
  }
}

/**
 * Телефон из сообщения.
 *   WhatsApp — chatId и ЕСТЬ номер (79011112233), отдельного поля нет;
 *   Telegram — номер приходит в contact.phone и только когда шлюз его знает.
 * Числовой идентификатор Telegram за номер не выдаём: склейка по нему свела
 * бы в одного клиента разных людей, и менеджер увидел бы чужую переписку.
 */
function phoneOf(m: Record<string, unknown>, kind: ChannelKind): string | undefined {
  const explicit = str(m, 'contact', 'phone');
  if (explicit) return explicit;
  if (kind !== 'whatsapp') return undefined;
  const chatId = str(m, 'chatId');
  return chatId && /^\+?\d{10,15}$/.test(chatId) ? chatId : undefined;
}

function attachmentsOf(m: Record<string, unknown>): Attachment[] {
  const uri = str(m, 'contentUri');
  if (!uri) return [];
  const type = str(m, 'type');
  const kind: Attachment['kind'] =
    type === 'image' ? 'image' : type === 'audio' || type === 'voice' ? 'audio' : 'file';
  return [{ kind, url: uri, mime: str(m, 'mimeType') ?? 'application/octet-stream' }];
}

/** Исходящие статусы. Входящее помечено status = 'inbound' либо не помечено. */
const OUTBOUND_STATUS = new Set(['sent', 'delivered', 'read', 'error']);

/**
 * Разбор тела вебхука. Пропускаем всё, что не входящее сообщение:
 *   statuses / channelsUpdates / createContact — не про текст клиента;
 *   isEcho и исходящие статусы — эхо наших же отправок;
 *   { test: true } — проба адреса при подписке. Ответить на неё надо 200,
 *     и обработчик так и делает: разбор просто вернёт пусто.
 * Дедупликация повторов стоит выше по потоку, в webhook_events.
 */
export function parseWazzupWebhook(raw: unknown): RoutedMessage[] {
  const out: RoutedMessage[] = [];
  for (const item of arr(raw, 'messages')) {
    if (typeof item !== 'object' || item === null) continue;
    const m = item as Record<string, unknown>;
    if (bool(m, 'isEcho')) continue;
    if (bool(m, 'isDeleted')) continue;
    const status = str(m, 'status');
    if (status && OUTBOUND_STATUS.has(status)) continue;

    const kind = chatTypeToKind(str(m, 'chatType'));
    const messageId = str(m, 'messageId');
    const chatId = str(m, 'chatId');
    const channelId = str(m, 'channelId');
    if (!kind || !messageId || !chatId || !channelId) continue;

    const dt = str(m, 'dateTime');
    const sentAt = dt ? new Date(dt) : new Date();

    out.push({
      channelKind: kind,
      channelExternalId: channelId,
      externalThreadId: chatId,
      externalMessageId: messageId,
      authorPhone: phoneOf(m, kind),
      authorName: str(m, 'contact', 'name') ?? str(m, 'authorName'),
      text: str(m, 'text'),
      attachments: attachmentsOf(m),
      sentAt: Number.isNaN(sentAt.getTime()) ? new Date() : sentAt,
    });
  }
  return out;
}

export const wazzupPlug: ProviderPlug = {
  slug: 'wazzup',
  dbProvider: 'wazzup',
  /** Wazzup даёт на ответ 30 секунд — успеваем обработать синхронно. */
  ackDeadlineMs: 25_000,
  /**
   * Идентификатора события у Wazzup нет: в теле приходит пачка сообщений.
   * Ключом идемпотентности берём их messageId — они уникальны у провайдера.
   * Для тел без сообщений (проба, статусы) ключ посчитается отпечатком тела
   * в ingest, и повторная проба тоже не заведёт второй строки.
   */
  eventId(raw: unknown): string | null {
    const ids = arr(raw, 'messages')
      .map(m => (typeof m === 'object' && m !== null ? str(m, 'messageId') : undefined))
      .filter((v): v is string => Boolean(v))
      .sort();
    return ids.length > 0 ? 'wz:' + ids.join(',') : null;
  },
  parse: parseWazzupWebhook,
  /** Подписи тела у Wazzup нет. Есть только crmKey в заголовке Authorization. */
  verify(_rawBody, headers) {
    if (optional('WAZZUP_CRM_KEY')) return bearerSecret('WAZZUP_CRM_KEY', headers);
    return sharedSecret('WEBHOOK_SECRET_WAZZUP', headers);
  },
};

class WazzupAdapter implements ChannelAdapter {
  readonly provider = 'wazzup';
  constructor(private readonly cfg: WazzupConfig) {}

  get kind(): ChannelKind { return this.cfg.kind; }

  capabilities(): ChannelCapabilities {
    return {
      text: true,
      images: true,
      files: true,
      // false там, где площадка не даёт писать первым. Молчать здесь нельзя.
      initiate: this.cfg.transport === 'personal',
      // Предел самих площадок на тело сообщения; своего меньшего у Wazzup нет.
      maxTextLength: 4096,
      allowsLinks: true,
    };
  }

  receive(raw: unknown): NormalizedMessage[] {
    return parseWazzupWebhook(raw)
      .filter(m => m.channelExternalId === this.cfg.channelId && m.channelKind === this.cfg.kind);
  }

  async sendText(externalThreadId: string, text: string): Promise<DeliveryResult> {
    const cap = this.capabilities();
    if (text.length > cap.maxTextLength) {
      return failed(`Текст длиннее ${cap.maxTextLength} символов — канал обрежет его молча`);
    }
    return this.post(externalThreadId, { text });
  }

  /**
   * Карточка: три света и строка честности.
   *
   * Одним сообщением это не уходит и уйти не может: /v3/message принимает
   * либо text, либо ОДИН contentUri, поля для подписи нет, альбома нет.
   * Поэтому карточка — упорядоченная последовательность из четырёх вызовов,
   * а наружу отдаётся один результат доставки: для домена это одна отправка.
   *
   * Порядок выбран по цене ошибки. Сначала текст с подписью и строкой
   * честности, потом изображения. Если оборвётся на середине, клиент увидит
   * честный текст без части картинок — неполно, но не обманчиво. Обратный
   * порядок дал бы три рендера без оговорки про оттенок, а это ровно то, что
   * О-2 запрещает: показ без честности хуже, чем показ без картинки.
   *
   * crmMessageId считается от содержимого: у Wazzup он гасит повтор в окне
   * 60 секунд, и двойной клик менеджера не отправит карточку дважды.
   */
  async sendCard(externalThreadId: string, card: OutboundCard): Promise<DeliveryResult> {
    if (!this.cfg.publishImage) {
      return failed(
        'Wazzup принимает изображения только ссылкой: для карточки нужен publishImage ' +
        'в конфигурации канала (публикация рендера со своего контура)',
      );
    }

    const caption = `${card.caption}\n\n${card.honestyLine}`.trim();
    const stamp = cardStamp(externalThreadId, card);

    const head = await this.post(externalThreadId, { text: caption }, `${stamp}-t`);
    if (head.state === 'failed') return head;

    let uris: string[];
    try {
      uris = await Promise.all(
        card.images.map((bytes, i) => this.cfg.publishImage!(bytes, `${stamp}-${i + 1}.jpg`)),
      );
    } catch (e) {
      return {
        state: 'failed',
        externalMessageId: head.externalMessageId,
        error: `Текст ушёл, рендеры опубликовать не удалось: ${e instanceof Error ? e.message : e}`,
      };
    }

    for (let i = 0; i < uris.length; i++) {
      const r = await this.post(externalThreadId, { contentUri: uris[i] }, `${stamp}-i${i + 1}`);
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

  private async post(
    chatId: string,
    payload: Record<string, unknown>,
    crmMessageId?: string,
  ): Promise<DeliveryResult> {
    let key: string;
    try { key = required('WAZZUP_API_KEY'); } catch (e) {
      return failed(e instanceof Error ? e.message : String(e));
    }
    const body: Record<string, unknown> = {
      channelId: this.cfg.channelId,
      chatId,
      chatType: this.cfg.kind,     // 'whatsapp' | 'telegram' — так же зовётся у Wazzup
      ...payload,
    };
    if (crmMessageId) body.crmMessageId = crmMessageId;

    try {
      const r = await http(`${base()}/message`, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      // Повтор в окне 60 секунд Wazzup гасит сам — для нас это не отказ.
      if (r.status === 400 && str(r.body, 'error') === 'REPEATED_CRM_MESSAGE_ID') {
        return { state: 'sent' };
      }
      if (!r.ok) return failed(`Wazzup отказал: ${describe(r)}`);
      return { state: 'sent', externalMessageId: str(r.body, 'messageId') };
    } catch (e) {
      return failed(`Сеть до Wazzup: ${e instanceof Error ? e.message : e}`);
    }
  }

  /**
   * С-3: слетевший токен чинится внутри продукта за три действия. Поэтому
   * health() отдаёт не «плохо», а что именно плохо и что нажать. Состояние
   * берётся у шлюза: наша таблица знает лишь то, что мы успели записать.
   */
  async health(): Promise<{ connected: boolean; reason?: string; fixHint?: string }> {
    let key: string;
    try { key = required('WAZZUP_API_KEY'); } catch (e) {
      return {
        connected: false,
        reason: e instanceof Error ? e.message : String(e),
        fixHint: 'Задать WAZZUP_API_KEY в окружении и перезапустить приложение',
      };
    }
    try {
      const r = await http(`${base()}/channels`, {
        headers: { authorization: `Bearer ${key}` },
        timeoutMs: 8000,
      });
      if (r.status === 401 || r.status === 403) {
        return {
          connected: false,
          reason: 'Wazzup не принял ключ API',
          fixHint: 'Выпустить новый ключ в кабинете Wazzup и заменить WAZZUP_API_KEY',
        };
      }
      if (!r.ok) return { connected: false, reason: `Wazzup недоступен: ${describe(r)}` };

      const list: unknown[] = Array.isArray(r.body) ? r.body : arr(r.body, 'data');
      const mine = list.find(c => str(c, 'channelId') === this.cfg.channelId);
      if (!mine) {
        return {
          connected: false,
          reason: `Канал ${this.cfg.channelId} не найден в аккаунте Wazzup`,
          fixHint: 'Проверить, что канал не удалён, и переподключить его в настройках точки',
        };
      }
      const state = str(mine, 'state') ?? 'unknown';
      if (state === 'active') return { connected: true };
      return {
        connected: false,
        reason: `Канал в состоянии «${state}»`,
        fixHint: state === 'qridle' || state === 'openelsewhere'
          ? 'Пересканировать QR-код в кабинете Wazzup'
          : 'Открыть канал в кабинете Wazzup и завершить подключение',
      };
    } catch (e) {
      return { connected: false, reason: `Сеть до Wazzup: ${e instanceof Error ? e.message : e}` };
    }
  }
}

/** Отпечаток карточки: ключ гашения двойной отправки, а не идентификатор. */
function cardStamp(threadId: string, card: OutboundCard): string {
  const h = createHash('sha256');
  h.update(threadId).update(' ').update(card.caption).update(' ').update(card.honestyLine);
  for (const img of card.images) h.update(img);
  return 'cs' + h.digest('hex').slice(0, 24);
}

export function createWazzupAdapter(cfg: WazzupConfig): ChannelAdapter {
  return new WazzupAdapter(cfg);
}
