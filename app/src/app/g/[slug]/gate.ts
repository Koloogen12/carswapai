/**
 * Гейт качества исходника — стадия 1 из §4.3.
 *
 * СЧИТАЕТСЯ В БРАУЗЕРЕ, ДО ОТПРАВКИ. Так требует сама формулировка §4.3:
 * «плохой исходник отклоняется с внятной причиной ДО списания денег на
 * генерацию». Здесь это выходит даже строже, чем задумано: непригодный
 * кадр вообще не покидает телефон, то есть за него не появляется ни
 * основания хранения, ни строки в photos, ни файла на диске.
 *
 * Меряем ровно то, что честно меряется из пикселей и что действительно
 * ломает примерку:
 *   светлота    — в темноте цвета в кадре просто нет, и модель его выдумает;
 *   пересветы   — контровой свет выжигает кузов, плёнка ляжет на белое;
 *   разрешение  — с мелкого кадра сатин от мата не отличить ни модели, ни
 *                 человеку.
 *
 * Чего здесь НЕТ и почему: «есть ли на кадре автомобиль» и «какой ракурс»
 * без модели не считаются, а угадывать их по гистограмме — значит отказывать
 * наугад. Отказ наугад хуже плохого рендера: он выгоняет человека с готовым
 * снимком. Эти два признака остаются за моделью сегментации (стадия 2).
 *
 * Итог измерения уезжает на сервер и ложится в photos.quality_gate — колонку
 * из миграции 001 §4.3, которая до сих пор оставалась пустой.
 */

/** Измеренное по кадру. Ровно это и записывается в photos.quality_gate. */
export type Gate = {
  width: number;
  height: number;
  /** Средняя светлота 0..1 по всему кадру. */
  luma: number;
  /** Доля почти чёрных пикселей. */
  dark: number;
  /** Доля выжженных пикселей — контровой свет и блики. */
  bright: number;
};

/** Отказ показывается человеку целиком: заголовок и что переснять. */
export type Verdict =
  | { ok: true }
  | { ok: false; reason: string; headline: string; hint: string };

/**
 * Пороги.
 *
 * Подобраны по одному правилу: отказывать только там, где рендер заведомо
 * соврёт про цвет. Сомнительный кадр пропускаем — три света и строка про
 * сверку с рулоном (О-2) закрывают остаток неопределённости честнее, чем
 * отказ на пороге.
 */
const MIN_LONG_SIDE = 720;   // меньше — сатин от мата не отличить
const MIN_SHORT_SIDE = 480;
const TOO_DARK = 0.17;       // ночь и подземный паркинг
const TOO_BLOWN = 0.3;       // против солнца

export function verdict(g: Gate): Verdict {
  const long = Math.max(g.width, g.height);
  const short = Math.min(g.width, g.height);
  if (long < MIN_LONG_SIDE || short < MIN_SHORT_SIDE) {
    return {
      ok: false, reason: 'resolution',
      headline: 'Кадр мелкий — фактуру не видно',
      hint: 'Снимите заново камерой телефона, не пересланной копией: машина '
          + 'целиком в кадре, сбоку. С мелкого кадра сатин от мата не отличить '
          + 'ни нам, ни вам.',
    };
  }
  if (g.luma < TOO_DARK || g.dark > 0.55) {
    return {
      ok: false, reason: 'dark',
      headline: 'Темно — цвет соврёт',
      hint: 'Снимите днём или под навесом: машина целиком в кадре, сбоку, без '
          + 'контрового света. Так плёнка на рендере будет похожа на настоящую.',
    };
  }
  if (g.bright > TOO_BLOWN) {
    return {
      ok: false, reason: 'backlit',
      headline: 'Против солнца — цвет соврёт',
      hint: 'Встаньте так, чтобы солнце светило вам в спину, и снимите машину '
          + 'сбоку целиком. На выжженном кузове плёнку показать нечестно.',
    };
  }
  return { ok: true };
}

/**
 * Измерить кадр в браузере.
 *
 * Уменьшаем до 96 пикселей по длинной стороне: светлота и доля пересветов
 * от масштаба не зависят, а полный кадр на слабом телефоне считался бы
 * заметную долю секунды прямо в потоке нажатия.
 */
export async function measure(file: File): Promise<Gate> {
  const img = await load(file);
  const w = img.width, h = img.height;
  const side = 96;
  const sw = Math.max(1, Math.round(w >= h ? side : side * w / h));
  const sh = Math.max(1, Math.round(h > w ? side : side * h / w));

  const cv = document.createElement('canvas');
  cv.width = sw; cv.height = sh;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    // Холста нет — измерить нечем. Пропускаем кадр: отказ без основания
    // хуже плохого рендера.
    close(img);
    return { width: w, height: h, luma: 0.5, dark: 0, bright: 0 };
  }
  ctx.drawImage(img as CanvasImageSource, 0, 0, sw, sh);
  close(img);

  const px = ctx.getImageData(0, 0, sw, sh).data;
  let sum = 0, dark = 0, bright = 0;
  const n = sw * sh;
  for (let i = 0; i < px.length; i += 4) {
    // Rec. 709: глаз видит зелёный ярче синего, и «средний цвет каналов»
    // назвал бы тёмно-синюю машину светлой.
    const y = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    sum += y;
    if (y < 0.09) dark++;
    if (y > 0.97) bright++;
  }
  return { width: w, height: h, luma: sum / n, dark: dark / n, bright: bright / n };
}

type Decoded = ImageBitmap | HTMLImageElement;

async function load(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file); } catch { /* ниже запасной путь */ }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((ok, no) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = () => no(new Error('Кадр не открылся'));
      im.src = url;
    });
  } finally {
    // Отпускаем ссылку сразу: снимок с телефона весит десятки мегабайт,
    // и забытый objectURL держит их до перезагрузки страницы.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function close(img: Decoded) {
  if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) img.close();
}
