"""
Детерминированные операции класса A.

Ни одна из них не вызывает внешнюю модель: всё считается формулой на своём
железе. Отсюда три свойства, которых у генерации нет и быть не может:
себестоимость в доли копейки, побитовая воспроизводимость (тот же вход даёт
тот же выход через год) и независимость от доступности вендора.

Всё считается в ЛИНЕЙНОМ свете. Работа с цветом в гамма-пространстве —
самая частая причина, по которой перекраска выглядит «нарисованной»:
смешивание там не соответствует тому, как складывается настоящий свет.
"""
from __future__ import annotations

import cv2
import numpy as np

# ─────────────────────────────────────────────────────────────
# Гамма
# ─────────────────────────────────────────────────────────────

def srgb_to_linear(img: np.ndarray) -> np.ndarray:
    """sRGB 0..1 → линейный свет. Точная кривая, не приближение x**2.2."""
    a = 0.055
    return np.where(img <= 0.04045, img / 12.92, ((img + a) / (1 + a)) ** 2.4)


def linear_to_srgb(img: np.ndarray) -> np.ndarray:
    a = 0.055
    img = np.clip(img, 0.0, 1.0)
    return np.where(img <= 0.0031308, img * 12.92, (1 + a) * img ** (1 / 2.4) - a)


# ─────────────────────────────────────────────────────────────
# Разделение отражения и диффузной составляющей
# ─────────────────────────────────────────────────────────────

def split_specular(lin: np.ndarray, mask: np.ndarray, percentile: float = 82.0,
                   softness: float = 0.35) -> tuple[np.ndarray, np.ndarray]:
    """
    Делит линейное изображение на отражение и диффузную часть.

    Это несущая функция всего класса A. Глянцевый кузов и стекло — зеркала:
    в них видно небо и деревья, и эта часть яркости НЕ принадлежит краске.
    Если её перекрасить вместе с диффузной, отражение неба станет цветным,
    и кадр мгновенно читается как подделка.

    Порог — не константа, а перцентиль по гистограмме самой области: у машины
    на солнце и у машины в паркинге он разный. Переход мягкий, иначе на
    границе появляется ступенька, которая тоже выдаёт монтаж.
    """
    lum = lin @ np.array([0.0722, 0.7152, 0.2126], dtype=np.float32)   # BGR
    inside = lum[mask > 0]
    if inside.size == 0:
        return np.zeros_like(lin), lin.copy()

    thr = float(np.percentile(inside, percentile))
    width = max(thr * softness, 1e-4)
    # Плавная ступенька: 0 — чистая диффузия, 1 — чистое отражение.
    w = np.clip((lum - thr) / width, 0.0, 1.0)
    w = w * w * (3 - 2 * w)                     # smoothstep
    w3 = w[..., None]
    return lin * w3, lin * (1.0 - w3)


# ─────────────────────────────────────────────────────────────
# Смена собственного цвета: диски, суппорты, кузов глянец→глянец
# ─────────────────────────────────────────────────────────────

def recolor(bgr: np.ndarray, mask: np.ndarray, target_lab: tuple[float, float, float],
            keep_specular: bool = True, chroma_scale: float = 1.0) -> np.ndarray:
    """
    Подмена собственного цвета при сохранении светлоты.

    L несёт блики, тени и объём формы — её не трогаем. Меняем только
    цветность a,b. Целевой цвет берётся из ИЗМЕРЕННОГО свотча артикула,
    а не из названия: «Sapphire Blue» в промпте и реальный 3M 1080-G347 —
    разные цвета, и клиент увидит разницу на замере.

    keep_specular=True отделяет отражения до подмены и возвращает их как есть.
    Без этого небо в лаке окрашивается в цвет плёнки — то самое расхождение,
    из-за которого перекраска не проходит проверку глазами.
    """
    src = bgr.astype(np.float32) / 255.0
    lin = srgb_to_linear(src)

    if keep_specular:
        spec, diff = split_specular(lin, mask)
    else:
        spec, diff = np.zeros_like(lin), lin

    diff_srgb = linear_to_srgb(diff)
    lab = cv2.cvtColor(diff_srgb.astype(np.float32), cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)

    tl, ta, tb = target_lab
    # Светлота цели влияет на диффузную часть: серебро → чёрный нельзя
    # сделать одной подменой цветности, там меняется и L.
    if tl is not None:
        src_mean = float(L[mask > 0].mean()) if (mask > 0).any() else float(L.mean())
        L = np.clip(L * (tl / max(src_mean, 1e-3)), 0.0, 100.0)

    a = np.full_like(a, ta * chroma_scale)
    b = np.full_like(b, tb * chroma_scale)

    out_srgb = cv2.cvtColor(cv2.merge([L, a, b]), cv2.COLOR_LAB2BGR)
    out_lin = srgb_to_linear(np.clip(out_srgb, 0.0, 1.0)) + spec
    return (linear_to_srgb(out_lin) * 255.0).astype(np.uint8)


# ─────────────────────────────────────────────────────────────
# Тонировка стёкол
# ─────────────────────────────────────────────────────────────

def tint(bgr: np.ndarray, mask: np.ndarray, vlt: float) -> np.ndarray:
    """
    Тонировка: плёнка гасит ПРОХОДЯЩИЙ свет и почти не гасит отражение
    на поверхности стекла.

    Наивное затемнение всей области серым даёт узнаваемо фальшивый вид:
    в реальности блик от неба на стекле остаётся ярким, а салон за стеклом
    темнеет. Поэтому пропускание умножается на VLT, а отражение — нет.

    Ограничение зашито в продукт: только в сторону темнее. Если стекло уже
    тонировано, информации в пикселях для осветления нет, и UI обязан
    не предлагать невозможного.
    """
    src = bgr.astype(np.float32) / 255.0
    lin = srgb_to_linear(src)
    spec, transmission = split_specular(lin, mask, percentile=88.0, softness=0.30)
    out_lin = spec + transmission * float(vlt)
    return (linear_to_srgb(out_lin) * 255.0).astype(np.uint8)


# ─────────────────────────────────────────────────────────────
# Звёздное небо
# ─────────────────────────────────────────────────────────────

def starlight(bgr: np.ndarray, mask: np.ndarray, fibers: int = 400,
              temperature: str = 'cold', seed: int = 0,
              shooting: bool = False) -> np.ndarray:
    """
    Звёздное небо в потолке: чистая процедурная графика, модель не участвует.

    Плотность растёт к дальнему краю маски по перспективе. Каждое волокно —
    яркое ядро плюс мягкое гауссово свечение, которое слегка подсвечивает
    окружающую обшивку: без этого точки выглядят наклеенными поверх.
    """
    rng = np.random.default_rng(seed)
    h, w = mask.shape
    ys, xs = np.nonzero(mask)
    if ys.size == 0:
        return bgr.copy()

    src = bgr.astype(np.float32) / 255.0
    lin = srgb_to_linear(src)

    # Вечерний тон потолка: днём звёзды не видны, и показывать их на светлом
    # потолке — врать про то, как это выглядит.
    lin[mask > 0] *= 0.35

    y0, y1 = ys.min(), ys.max()
    # Плотность к дальнему краю: вероятность выбора точки растёт с глубиной.
    depth = (ys - y0) / max(y1 - y0, 1)
    p = (1.0 - depth) ** 2 + 0.15
    p = p / p.sum()
    idx = rng.choice(ys.size, size=min(fibers, ys.size), replace=False, p=p)

    glow = np.zeros((h, w), dtype=np.float32)
    for i in idx:
        glow[ys[i], xs[i]] = float(rng.uniform(0.55, 1.0))

    core = glow.copy()
    glow = cv2.GaussianBlur(glow, (0, 0), sigmaX=2.6)
    halo = cv2.GaussianBlur(core, (0, 0), sigmaX=7.5) * 0.45

    tint_bgr = (1.00, 0.94, 0.86) if temperature == 'cold' else (0.80, 0.90, 1.00)
    add = (core * 2.2 + glow * 1.1 + halo)[..., None] * np.array(tint_bgr, dtype=np.float32)
    add *= (mask > 0)[..., None]

    if shooting:
        # Падающая звезда — один след, а не эффект: в салоне их видно по одной.
        yA, xA = int(y0 + 0.15 * (y1 - y0)), int(xs.min() + 0.2 * (xs.max() - xs.min()))
        yB, xB = yA + int(0.10 * (y1 - y0)), xA + int(0.28 * (xs.max() - xs.min()))
        trail = np.zeros((h, w), dtype=np.float32)
        cv2.line(trail, (xA, yA), (xB, yB), 1.0, 1, cv2.LINE_AA)
        trail = cv2.GaussianBlur(trail, (0, 0), sigmaX=1.4) * (mask > 0)
        add += trail[..., None] * np.array(tint_bgr, dtype=np.float32) * 1.6

    return (linear_to_srgb(lin + add) * 255.0).astype(np.uint8)


# ─────────────────────────────────────────────────────────────
# Три световых условия
# ─────────────────────────────────────────────────────────────

LIGHTS = ('day', 'overcast', 'parking')

# Сдвиг экспозиции, баланса белого и контраста по ОДНОМУ рендеру.
# Не три генерации: себестоимость нулевая, и результат воспроизводим.
_LIGHT = {
    'day':      dict(exposure=1.10, wb=(0.98, 1.00, 1.04), contrast=1.06, lift=0.00),
    'overcast': dict(exposure=0.92, wb=(1.05, 1.01, 0.96), contrast=0.94, lift=0.012),
    'parking':  dict(exposure=0.72, wb=(1.10, 1.00, 0.90), contrast=0.88, lift=0.020),
}


def relight(bgr: np.ndarray, light: str) -> np.ndarray:
    """
    Три световых условия из одного рендера.

    ВАЖНОЕ ОГРАНИЧЕНИЕ. Это корректно для СПЛОШНОГО цвета. Для металликов,
    сатинов и хамелеонов отклик на свет нелинейный: цвет меняется с углом
    и спектром, и сдвиг кривой даст три яркости одного цвета — то есть
    соврёт ровно на тех артикулах, ради которых механика честности
    и существует. Такие SKU обязаны иметь измеренный LAB и идти тремя
    отдельными проходами; каталог не даёт завести их без измерения.
    """
    p = _LIGHT[light]
    src = bgr.astype(np.float32) / 255.0
    lin = srgb_to_linear(src)
    lin *= p['exposure']
    lin *= np.array(p['wb'], dtype=np.float32)
    out = linear_to_srgb(lin)
    out = np.clip((out - 0.5) * p['contrast'] + 0.5 + p['lift'], 0.0, 1.0)
    return (out * 255.0).astype(np.uint8)
