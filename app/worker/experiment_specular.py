#!/usr/bin/env python3
"""
Проверка главного технического утверждения проекта.

Вопрос: держится ли подмена цветности в LAB на НАСТОЯЩЕМ глянце, где
в лаке отражается небо. От ответа зависит вся юнит-экономика: класс A стоит
доли копейки, класс B — 8,5 ₽ за кадр. При доле класса A ниже половины
маржа падает с 85–88% до заметно худшей.

Опыт сравнивает две реализации на одном кадре:
  наивная      — L оставили, a,b заменили на всю область;
  с отражением — отражение отделено и возвращено как есть, перекрашена
                 только диффузная часть.

Метрика: насколько отличается цвет в ЯРКИХ пикселях области (там, где
в реальности отражается небо). Если наивная версия красит их так же сильно,
как тёмные, — небо стало цветным, и кадр читается как подделка.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))

import cv2
import numpy as np
from pipeline import color, composite, qa

SRC = pathlib.Path('fixtures/dev-set')
OUT = pathlib.Path('out'); OUT.mkdir(exist_ok=True)

# Целевой цвет — измеренный свотч, не название. Сатин-хром тёмный KPMF K75407.
TARGET = (38.0, -0.8, -1.4)


def body_mask(img: np.ndarray) -> np.ndarray:
    """
    Грубая маска кузова через GrabCut.

    Это ВРЕМЕННО и только для опыта: настоящая сегментация — отдельная работа
    (фиксированный набор из ~20 классов, дообученная сеть). Здесь она нужна
    ровно чтобы проверить цветовую математику, а не качество масок.
    """
    h, w = img.shape[:2]
    rect = (int(w * 0.06), int(h * 0.22), int(w * 0.88), int(h * 0.66))
    mask = np.zeros((h, w), np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, rect, bgd, fgd, 5, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    return m


def hue_shift_by_luma(orig: np.ndarray, res: np.ndarray, mask: np.ndarray):
    """Насколько сдвинулась цветность в тёмных и в ярких пикселях области."""
    lab_o = cv2.cvtColor(orig, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab_r = cv2.cvtColor(res, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab_o[..., 0]
    sel = mask > 0
    if not sel.any():
        return 0.0, 0.0
    hi = sel & (L > np.percentile(L[sel], 85))     # там, где отражается небо
    lo = sel & (L < np.percentile(L[sel], 50))     # собственный цвет краски
    d = np.sqrt((lab_r[..., 1] - lab_o[..., 1]) ** 2 + (lab_r[..., 2] - lab_o[..., 2]) ** 2)
    return float(d[lo].mean()), float(d[hi].mean())


def run(name: str) -> None:
    img = cv2.imread(str(SRC / f'{name}.png'))
    if img is None:
        print(f'нет кадра {name}'); return
    img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    m = body_mask(img)

    naive = composite.composite(img, color.recolor(img, m, TARGET, keep_specular=False), m)
    smart = composite.composite(img, color.recolor(img, m, TARGET, keep_specular=True), m)

    n_lo, n_hi = hue_shift_by_luma(img, naive, m)
    s_lo, s_hi = hue_shift_by_luma(img, smart, m)

    print(f'\n=== {name} ===')
    print(f'  маска кузова: {int((m>0).sum())} px, {100*(m>0).mean():.1f}% кадра')
    print(f'  {"":22s} {"тёмные":>9s} {"яркие":>9s}   яркие/тёмные')
    print(f'  {"наивная подмена a,b":22s} {n_lo:9.1f} {n_hi:9.1f}   {n_hi/max(n_lo,1e-6):8.2f}')
    print(f'  {"с сохранением бликов":22s} {s_lo:9.1f} {s_hi:9.1f}   {s_hi/max(s_lo,1e-6):8.2f}')
    print(f'  QA наивной : {qa.report(img, naive, m)["passed"]}')
    print(f'  QA с бликами: {qa.report(img, smart, m)["passed"]}')

    strip = np.hstack([img, naive, smart])
    cv2.imwrite(str(OUT / f'{name}-compare.jpg'), strip,
                [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    cv2.imwrite(str(OUT / f'{name}-mask.jpg'),
                cv2.cvtColor(m, cv2.COLOR_GRAY2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 80])


if __name__ == '__main__':
    for n in (sys.argv[1:] or ['02-black-crushed-shadows', '01-silver-sun-reflections']):
        run(n)
