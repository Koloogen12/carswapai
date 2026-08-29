"""
Сегментация автомобиля на части.

РЕШЕНИЕ ПО АРХИТЕКТУРЕ. Открытая словарная сегментация (SAM 3 и подобные)
нам не нужна: её главная способность — сегментировать произвольное понятие
по фразе, а наш словарь закрыт и известен — около двадцати классов, все
про автомобиль. Плюс у SAM 3 собственная лицензия Meta с географической
оговоркой, которая для российского юрлица требует юриста.

Поэтому целевое решение — небольшая дообученная сеть на фиксированные классы:
быстрее на инференсе, дешевле по GPU, точнее по маскам, и в поставке нет
чужой лицензии.

ЭТОТ МОДУЛЬ — промежуточный: классическое зрение, без обучения и без весов.
Он даёт рабочие маски для тонировки, дисков, номера и кузова прямо сейчас,
чтобы пайплайн можно было проверить на реальных кадрах. Границы у него хуже,
чем даст сеть, и это видно на результате — так и должно быть написано.
"""
from __future__ import annotations

import cv2
import numpy as np

CONCEPTS = ('body', 'glass', 'wheel', 'plate', 'lamp')


def _largest(mask: np.ndarray, n: int = 1) -> np.ndarray:
    num, lbl, stats, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), 8)
    if num <= 1:
        return mask
    order = np.argsort(stats[1:, cv2.CC_STAT_AREA])[::-1][:n] + 1
    out = np.zeros_like(mask)
    for i in order:
        out[lbl == i] = 255
    return out


def car(img: np.ndarray, iters: int = 5) -> np.ndarray:
    """Силуэт автомобиля. Прямоугольник-подсказка по кадру, дальше GrabCut."""
    h, w = img.shape[:2]
    rect = (int(w * 0.05), int(h * 0.20), int(w * 0.90), int(h * 0.70))
    m = np.zeros((h, w), np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, m, rect, bgd, fgd, iters, cv2.GC_INIT_WITH_RECT)
    out = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    out = cv2.morphologyEx(out, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    return _largest(out)


def glass(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Стёкла: внутри силуэта, темнее кузова, низкая насыщенность, верхняя треть.

    Порог берётся по гистограмме самой машины, а не абсолютный: у чёрной
    машины стекло не темнее кузова в абсолютных числах, и константа
    развалилась бы на первом же тёмном кадре.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    v, s = hsv[..., 2].astype(np.float32), hsv[..., 1].astype(np.float32)
    sel = car_mask > 0
    if not sel.any():
        return np.zeros_like(car_mask)

    ys = np.nonzero(sel)[0]
    top, bottom = ys.min(), ys.max()
    height = max(bottom - top, 1)
    row = np.arange(img.shape[0])[:, None].repeat(img.shape[1], axis=1)
    upper = (row - top) / height < 0.55          # стекло живёт в верхней части

    v_thr = np.percentile(v[sel], 34)
    s_thr = np.percentile(s[sel], 62)
    m = (sel & upper & (v < v_thr) & (s < s_thr)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))
    return _largest(m, n=3)


def wheels(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """Колёса: круги в нижней половине силуэта. Радиус — доля от ширины машины."""
    sel = car_mask > 0
    if not sel.any():
        return np.zeros_like(car_mask)
    ys, xs = np.nonzero(sel)
    cw = xs.max() - xs.min()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2,
                               minDist=int(cw * 0.18),
                               param1=110, param2=42,
                               minRadius=int(cw * 0.045), maxRadius=int(cw * 0.16))
    out = np.zeros_like(car_mask)
    if circles is None:
        return out
    y_mid = ys.min() + 0.52 * (ys.max() - ys.min())
    for x, y, r in np.round(circles[0]).astype(int):
        if y < y_mid:                     # верхние круги — это не колёса
            continue
        if not (xs.min() - r <= x <= xs.max() + r):
            continue
        cv2.circle(out, (x, y), int(r * 0.92), 255, -1)
    return out


def plate(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Госномер. Всегда исключается из зоны любых изменений и всегда
    возвращается из оригинала: это и инвариант узнаваемости, и снятие
    юридического риска — перерисованный чужой номер не нужен ни в каком виде.
    """
    sel = car_mask > 0
    if not sel.any():
        return np.zeros_like(car_mask)
    ys, xs = np.nonzero(sel)
    cw = xs.max() - xs.min()

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, cv2.getStructuringElement(
        cv2.MORPH_RECT, (3, 3)))
    _, th = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, cv2.getStructuringElement(
        cv2.MORPH_RECT, (int(cw * 0.05), 3)))

    out = np.zeros_like(car_mask)
    cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best, best_score = None, 0.0
    for c in cnts:
        x, y, w, h = cv2.boundingRect(c)
        if h == 0 or w < cw * 0.08 or w > cw * 0.40:
            continue
        ar = w / h
        if not (2.6 <= ar <= 6.5):            # российский номер ≈ 4,5:1
            continue
        if car_mask[y + h // 2, x + w // 2] == 0:
            continue
        depth = (y + h / 2 - ys.min()) / max(ys.max() - ys.min(), 1)
        if depth < 0.45:                       # номер в нижней половине
            continue
        score = depth * min(ar / 4.5, 4.5 / ar)
        if score > best_score:
            best, best_score = (x, y, w, h), score
    if best:
        x, y, w, h = best
        pad = int(h * 0.18)
        cv2.rectangle(out, (x - pad, y - pad), (x + w + pad, y + h + pad), 255, -1)
    return out


def segment(img: np.ndarray) -> dict[str, np.ndarray]:
    """Полный набор масок на кадр. Считается один раз и кэшируется по хешу фото."""
    c = car(img)
    g = glass(img, c)
    w = wheels(img, c)
    p = plate(img, c)
    # Кузов — силуэт минус всё, что кузовом не является.
    body = c.copy()
    for m in (g, w, p):
        body[m > 0] = 0
    body = cv2.morphologyEx(body, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return {'car': c, 'body': body, 'glass': g, 'wheel': w, 'plate': p}
