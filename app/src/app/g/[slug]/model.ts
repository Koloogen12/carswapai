/**
 * Общее для всех состояний гаража: что такое позиция прайса, какой кадр ей
 * показать и что считать аналогом.
 *
 * Вынесено из компонента, потому что это правила, а не вёрстка. Правило
 * «аналог берётся из прайса ЭТОЙ точки» (О-3) не должно зависеть от того,
 * какой экран его спрашивает.
 */
import type { LightId } from '@/lib/domain';

export type Item = {
  point_price_id: string; sku: string; name: string; brand: string; category: string;
  finish: string; price_kopecks: number; in_stock: boolean; hex: string | null;
};

/** Сохранённая сборка. Живёт на устройстве человека, не у нас (Г-1). */
export type Save = { id: string; skus: string[]; total: number; at: number };

export const rub = (k: number) =>
  Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');

export function short(name: string) {
  return name.length > 12 ? name.split(' ').slice(0, 2).join(' ') : name;
}

/**
 * Кэш типовых кузовов — по три света на артикул.
 *
 * Это тот самый кэш, в который гараж деградирует при исчерпании потолка
 * (§8.2: «при перегрузке гараж деградирует в кэш, поток менеджера — нет»).
 * Три света в нём есть у каждого артикула намеренно: О-2 не отключается ни
 * на каком уровне деградации, иначе деградация начинает врать про цвет.
 */
const LIT: Record<string, Record<LightId, string>> = {
  K75400: {
    day: '/renders/light-black-sun.jpg',
    overcast: '/renders/light-black-cloud.jpg',
    parking: '/renders/light-black-park.jpg',
  },
  'HX20-LG': {
    day: '/renders/light-lagoon-sun.jpg',
    overcast: '/renders/light-lagoon-cloud.jpg',
    parking: '/renders/light-lagoon-park.jpg',
  },
  'GAL-OL': {
    day: '/renders/light-olive-sun.jpg',
    overcast: '/renders/light-olive-cloud.jpg',
    parking: '/renders/light-olive-park.jpg',
  },
};

/** Типовой кузов в трёх светах — общий запасной кадр. */
const TYPICAL: Record<LightId, string> = {
  day: '/renders/render-01.png',
  overcast: '/renders/render-09.png',
  parking: '/renders/render-10.png',
};

/**
 * Единственный дневной кадр артикула — там, где трёх светов ещё не сняли.
 *
 * PPF и тонировка получили кадры кузова, а не салона: до сих пор PPF-PPF
 * показывала render-06 — фотографию сидений, — и на герой-кадре во весь
 * экран это выглядело как «примерка защитной плёнки на алькантару».
 */
const DAY_ONLY: Record<string, string> = {
  K75407: '/renders/render-01.png',
  '970-070': '/renders/render-02.png',
  'PPF-PPF': '/renders/render-13.png',
  'PPF-MATTE': '/renders/render-11.png',
  'ATR-20': '/renders/render-10.png',
};

export const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png', 'ATR-20': '/renders/render-10.png',
  'PPF-PPF': '/renders/render-13.png', 'PPF-MATTE': '/renders/render-11.png',
};

/**
 * Фактура словом, как её называет человек.
 *
 * Нужна кнопке сравнения: в макете там «Беру сатин», и это работает только
 * пока подставляется фактура. Подстановка названия артикула давала
 * «Беру прозрачная ppf» — фразу, которую не сказал бы никто.
 */
export const FINISH: Record<string, string> = {
  satin: 'сатин', matte: 'мат', gloss: 'глянец', clear: 'прозрачную',
};

/** Та же фактура в творительном: «разница между сатином и матом». */
export const FINISH_BETWEEN: Record<string, string> = {
  satin: 'сатином', matte: 'матом', gloss: 'глянцем', clear: 'прозрачной',
};

/** Есть ли у артикула кэш всех трёх светов. */
export const hasThreeLights = (sku: string | undefined) => !!(sku && LIT[sku]);

/** Кадр артикула в заданном свете. */
export function shot(sku: string | undefined, light: LightId): string {
  if (sku && LIT[sku]) return LIT[sku][light];
  if (sku && DAY_ONLY[sku]) return DAY_ONLY[sku];
  return TYPICAL[light];
}

/** Кэшированные артикулы — то, что остаётся доступным после потолка. */
export const cachedSkus = Object.keys(LIT);

/**
 * Аналог из прайса ЭТОЙ точки (О-3).
 *
 * В макете аналогом стоит соседняя точка сети — «Ленинградское шоссе, обвес
 * в наличии». Здесь так нельзя дважды: О-3 требует, чтобы артикул и цена
 * были из прайса этой точки, и претензия анонима в гараже соседней точки
 * не видит вовсе (RLS, миграция 006). Поэтому аналог ищется среди того, что
 * держит она сама.
 *
 * Порядок близости: та же категория → та же фактура → ближайшая цена.
 * «Похожее» без общей фактуры не предлагаем: глянец вместо сатина — это уже
 * другой товар, и назвать его аналогом значит соврать.
 */
export function analogue(items: Item[], want: Item): Item | null {
  const near = items.filter(i =>
    i.point_price_id !== want.point_price_id &&
    i.in_stock &&
    i.category === want.category &&
    i.finish === want.finish);
  if (!near.length) return null;
  return near.sort((a, b) =>
    Math.abs(a.price_kopecks - want.price_kopecks) -
    Math.abs(b.price_kopecks - want.price_kopecks))[0];
}

/**
 * Снятие старой плёнки — позиция прайса, а не примечание.
 *
 * Категория `service` заведена миграцией 003 ровно под экран 37. Если точка
 * такой позиции в своём прайсе не держит, цифры у нас нет и выдумывать её
 * нельзя (О-3): экран честно скажет, что снятие посчитают на замере.
 */
export const removalItem = (items: Item[]) =>
  items.find(i => i.category === 'service') ?? null;

/** Категории шторки. Порядок из макета. */
export const CATS = [
  ['film', 'Плёнка'], ['wheel', 'Диски'], ['interior', 'Салон'], ['trim', 'Обвес'],
] as const;

/** Как называется отсутствующая категория в родительном падеже. */
export const CAT_MISSING: Record<string, string> = {
  film: 'Плёнки', wheel: 'Дисков', interior: 'Отделки салона', trim: 'Обвеса',
};
