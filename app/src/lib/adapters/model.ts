/**
 * Адаптер модели генерации.
 *
 * Инвариант №7 спеки: ни один слой продукта не знает имени вендора. Смена
 * модели — замена реализации этого интерфейса, а не переписывание пайплайна.
 * Поэтому здесь нет ни одного типа, имени поля или единицы измерения,
 * привязанных к конкретному провайдеру.
 *
 * Два правила, которые интерфейс навязывает вызывающему намеренно:
 *
 * 1. Модель всегда работает ВНУТРИ маски и её выход никогда не является
 *    финалом. Возвращается `patch` — содержимое области, а не кадр целиком.
 *    Композитинг обратно на оригинал делает пайплайн, и только так номер,
 *    фон и геометрия кузова остаются оригинальными пикселями (инвариант №4).
 *
 * 2. Каждый ответ несёт `provenance`. Это не телеметрия: при споре на выдаче
 *    надо знать, чем именно рендерили, а при смене поколения — какие старые
 *    записи чем сделаны. Уходит в renders.pipeline (§5.4).
 */

export type Resolution = '1k' | '2k' | '4k';

/** Референс товара. Цвет плёнки задаётся свотчем, а не словом: «Sapphire Blue»
 *  в промпте и реальный 3M 1080-G347 — разные цвета (§4.5). */
export interface ProductReference {
  kind: 'swatch' | 'product_photo' | 'texture';
  sku: string;
  image: Uint8Array;
  /** Измеренный цвет свотча, CIELAB. Нужен для подбора по ΔE и для проверки
   *  результата: если модель увела цвет, это видно числом, а не на глаз. */
  lab?: readonly [L: number, a: number, b: number];
}

export interface EditRequest {
  /** Оригинал или кроп области с запасом. */
  source: Uint8Array;
  /** Бинарная маска области изменения. Всё вне её — не наше дело. */
  mask: Uint8Array;
  /** Что должно измениться внутри маски, человеческим языком. */
  instruction: string;
  references: ProductReference[];
  resolution: Resolution;
  /** Детерминизм там, где провайдер его поддерживает. Для класса B
   *  побитовая воспроизводимость не гарантируется — поэтому §5.4 хранит
   *  ещё и сам файл, а не только рецепт. */
  seed?: number;
}

export interface Provenance {
  provider: string;
  model: string;
  modelVersion?: string;
  seed?: number;
  /** Фактическая стоимость вызова. В копейках, потому что деньги в рублях
   *  считаются в копейках, а не во float. Включает и вход, и выход:
   *  входные изображения тарифицируются отдельно, и в §4.9 это не учтено. */
  costKopecks: number;
  latencyMs: number;
}

export interface EditResult {
  /** Содержимое области изменения. НЕ финальный кадр. */
  patch: Uint8Array;
  provenance: Provenance;
}

export interface ModelCapabilities {
  /** Сколько объектов-референсов провайдер реально принимает за вызов. */
  maxReferences: number;
  resolutions: Resolution[];
  supportsSeed: boolean;
  supportsBatch: boolean;
  /** Оценка до вызова — нужна для потолков расхода: бюджет проверяется
   *  на постановке в очередь, а не по факту счёта (§14, волна 0, п. 4). */
  estimateKopecks(req: Pick<EditRequest, 'resolution' | 'references'>): number;
}

export interface ModelAdapter {
  readonly id: string;
  capabilities(): ModelCapabilities;
  edit(req: EditRequest, signal?: AbortSignal): Promise<EditResult>;
  /** Доступность для каскада деградации (§8.5). Отказ модели не является
   *  отказом продукта: класс A не зависит от этого интерфейса вовсе. */
  healthy(): Promise<boolean>;
}
