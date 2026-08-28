/**
 * Адаптер канала.
 *
 * О-5: канал — свойство сообщения, а не раздел интерфейса. Единая доменная
 * модель диалога, провайдер за адаптером. Смена провайдера не должна
 * требовать переписывания логики диалога.
 *
 * Главное здесь — `capabilities()`. О-7 требует, чтобы возможности канала
 * отвечали честно и UI это показывал, а не молчал. Практический смысл:
 * менеджер узнаёт об ограничении ДО отправки, а не от молчащего клиента —
 * иначе это обращение точки в управляющую компанию и провал С-3.
 */

export type ChannelKind = 'whatsapp' | 'telegram' | 'max' | 'avito' | 'web';
export type DeliveryState = 'queued' | 'sent' | 'delivered' | 'failed';

export interface Attachment {
  kind: 'image' | 'file' | 'audio';
  url: string;
  mime: string;
  bytes?: number;
}

/** Входящее, приведённое к единому виду. Канал здесь — поле, а не ветка логики. */
export interface NormalizedMessage {
  channelKind: ChannelKind;
  externalThreadId: string;
  /** Ключ идемпотентности. Шлюзы доставляют повторно и всплесками;
   *  уникальный индекс на (channel_id, external_message_id) в схеме — это
   *  вторая линия, а первая вот здесь. */
  externalMessageId: string;
  authorPhone?: string;
  authorName?: string;
  text?: string;
  attachments: Attachment[];
  sentAt: Date;
}

export interface OutboundCard {
  /** Ровно три световых условия. Тип задан кортежем, а не массивом:
   *  О-2 нарушается при любой другой длине, и лучше это не компилируется. */
  images: readonly [day: Uint8Array, overcast: Uint8Array, parking: Uint8Array];
  /** Строка про сверку оттенка. Обязательное поле без значения по умолчанию —
   *  забыть её нельзя, потому что объект без неё не собирается. */
  honestyLine: string;
  caption: string;
}

export interface ChannelCapabilities {
  text: boolean;
  images: boolean;
  files: boolean;
  /** Можно ли писать первым. У части каналов есть окно ответа или шаблоны. */
  initiate: boolean;
  maxTextLength: number;
  /** Авито: модерация режет ссылки-уводы, под риском весь канал входящих
   *  точки (краевой случай №10). Это свойство канала, а не правило интерфейса,
   *  поэтому живёт здесь — тогда его невозможно забыть на новом экране. */
  allowsLinks: boolean;
}

export interface DeliveryResult {
  externalMessageId?: string;
  state: DeliveryState;
  error?: string;
}

export interface ChannelAdapter {
  readonly kind: ChannelKind;
  readonly provider: string;
  capabilities(): ChannelCapabilities;
  /** Разбор вебхука. Возвращает пусто, если событие не про сообщения:
   *  дедупликация сырых событий стоит выше по потоку, в webhook_events. */
  receive(raw: unknown): NormalizedMessage[];
  sendText(externalThreadId: string, text: string): Promise<DeliveryResult>;
  sendCard(externalThreadId: string, card: OutboundCard): Promise<DeliveryResult>;
  /** Состояние привязки. С-3: слетевший токен чинится внутри продукта
   *  за ≤3 действия, а не звонком в управляющую компанию. */
  health(): Promise<{ connected: boolean; reason?: string; fixHint?: string }>;
}
