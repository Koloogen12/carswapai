/**
 * Доменные константы, в которых живут инварианты.
 *
 * Лежат в lib, а не в компоненте: инвариант не должен зависеть от того,
 * какой экран его импортирует, и не должен исчезнуть вместе с вёрсткой.
 */

/** О-2 · три световых условия. Порядок фиксирован и задан здесь. */
export const LIGHTS = [
  { id: 'day', label: 'День' },
  { id: 'overcast', label: 'Пасмурно' },
  { id: 'parking', label: 'Паркинг' },
] as const;
export type LightId = typeof LIGHTS[number]['id'];

/** О-2 · строка честности. Одна на продукт, без вариантов и без тумблера. */
export const HONESTY_LINE =
  'Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.';

export type ChannelId = 'whatsapp' | 'telegram' | 'max' | 'avito' | 'web';

export type TryonStateId =
  'sent' | 'more' | 'confirmed' | 'booked' | 'undelivered' | 'channel_off';
