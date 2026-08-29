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

СЕЙЧАС здесь гибрид, и это осознанно:

  силуэт   — сетью (pipeline/silhouette.py, Mask R-CNN на COCO). Проверено на
             двенадцати реальных кадрах: GrabCut по прямоугольнику на подземном
             паркинге брал колонну вместо машины, на контровом солнце — небо.
             Сеть не ошиблась ни разу и сама выбирает нужную машину из трёх.

  части    — геометрией и фотометрией внутри силуэта. COCO не знает частей
             автомобиля, а точная граница делает разбор внутри намного проще:
             искать стекло среди пикселей машины — не то же самое, что искать
             его среди пикселей двора.

Части — то место, где дообученная сеть на ~20 классов даст следующий скачок.
Пока их качество измеряется глазами на out/seg/parts.png, а не метрикой:
разметки у нас нет, и придумывать метрику без разметки — обманывать себя.
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
    """Силуэт автомобиля: сеть, а при её отсутствии — GrabCut с оговоркой."""
    from . import silhouette
    if silhouette.available():
        m = silhouette.car(img)
        if m is not None:
            return m
        # Машины в кадре нет — это не повод подставлять прямоугольник:
        # пустая маска честнее, вызывающий отклонит фото с внятной причиной.
        return np.zeros(img.shape[:2], np.uint8)
    return _car_grabcut(img, iters)


def _car_grabcut(img: np.ndarray, iters: int = 5) -> np.ndarray:
    """Запасной силуэт. Заметно хуже; включается только если сети нет."""
    h, w = img.shape[:2]
    rect = (int(w * 0.05), int(h * 0.20), int(w * 0.90), int(h * 0.70))
    m = np.zeros((h, w), np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(img, m, rect, bgd, fgd, iters, cv2.GC_INIT_WITH_RECT)
    out = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    out = cv2.morphologyEx(out, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    return _largest(out)


def _norm_box(mask):
    """Нормированные координаты внутри габарита силуэта: 0..1 по вертикали и горизонтали."""
    ys, xs = np.nonzero(mask > 0)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    h, w = mask.shape
    ry = (np.arange(h)[:, None] - y0) / max(y1 - y0, 1)
    rx = (np.arange(w)[None, :] - x0) / max(x1 - x0, 1)
    return np.broadcast_to(ry, mask.shape), np.broadcast_to(rx, mask.shape), (x1 - x0), (y1 - y0)


def _paint_reference(img, car_mask, ry):
    """
    Цвет краски, измеренный по низу силуэта.

    Ниже линии остекления у автомобиля только крашеное железо: двери, крылья,
    бампер. Это даёт опорный цвет, к которому можно сравнивать верх кадра, и
    работает одинаково на белой машине и на чёрной — в отличие от абсолютных
    порогов, которые надо подбирать под каждый кузов.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    ref = (car_mask > 0) & (ry > 0.62) & (ry < 0.86)
    if ref.sum() < 200:
        ref = car_mask > 0
    a = np.median(lab[..., 1][ref]); b = np.median(lab[..., 2][ref])
    L = np.median(lab[..., 0][ref])
    return lab, float(L), float(a), float(b)


def glass(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Стёкла: то, что в верхней части силуэта не похоже на краску.

    Стекло либо темнее краски (видно тёмный салон), либо светлее и бесцветнее
    (отражается небо). Краска же держится своего тона. Поэтому признак — не
    «тёмное» и не «светлое», а «далеко от опорного цвета кузова».
    """
    if (car_mask > 0).sum() < 100:
        return np.zeros_like(car_mask)
    ry, rx, cw, ch = _norm_box(car_mask)
    lab, L0, a0, b0 = _paint_reference(img, car_mask, ry)
    L, a, b = (lab[..., i].astype(np.float32) for i in range(3))

    d_chroma = np.hypot(a - a0, b - b0)          # ушёл ли оттенок
    d_light = np.abs(L - L0)                     # ушла ли светлота
    sel = (car_mask > 0) & (ry < 0.58)           # остекление живёт над поясной линией

    if sel.sum() < 200:
        return np.zeros_like(car_mask)
    # Порог по самому кадру: доля «непохожего» в верхней части, а не константа.
    score = d_chroma * 1.6 + d_light
    thr = np.percentile(score[sel], 55)
    m = (sel & (score > max(thr, 8.0))).astype(np.uint8) * 255

    k = max(3, int(cw * 0.012)) | 1
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((k, k), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k * 3, k * 3), np.uint8))
    return _largest(m, n=4)


def wheels(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Колёса: круги в нижней части силуэта.

    Радиус ищем долей от ширины машины, а не в пикселях: на общем плане колесо
    занимает сотню пикселей, на макро — весь кадр, и константа развалится.
    """
    if (car_mask > 0).sum() < 100:
        return np.zeros_like(car_mask)
    ry, rx, cw, ch = _norm_box(car_mask)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)

    out = np.zeros_like(car_mask)
    # Два прохода: обычный план (колесо — доля машины) и макро (колесо — весь кадр).
    macro = ch > 0 and cw / max(ch, 1) < 1.6 and (car_mask > 0).mean() > 0.55
    ranges = [(0.30, 0.70)] if macro else [(0.05, 0.19)]
    for lo, hi in ranges:
        circles = cv2.HoughCircles(
            gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=max(int(cw * 0.16), 10),
            param1=110, param2=38,
            minRadius=max(int(cw * lo), 6), maxRadius=max(int(cw * hi), 12))
        if circles is None:
            continue
        for x, y, r in np.round(circles[0]).astype(int):
            if not (0 <= y < out.shape[0] and 0 <= x < out.shape[1]):
                continue
            if not macro and ry[y, x] < 0.48:     # верх машины — это не колесо
                continue
            if car_mask[y, x] == 0:
                continue
            cv2.circle(out, (x, y), int(r * 0.95), 255, -1)
    return out


def plate(img: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Госномер. Всегда исключается из зоны изменений и всегда возвращается из
    оригинала: это и узнаваемость своей машины, и снятие юридического риска —
    перерисованный чужой номер не нужен ни в каком виде.
    """
    if (car_mask > 0).sum() < 100:
        return np.zeros_like(car_mask)
    ry, rx, cw, ch = _norm_box(car_mask)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT,
                            cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
    _, th = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, cv2.getStructuringElement(
        cv2.MORPH_RECT, (max(int(cw * 0.045), 5), 3)))
    th[car_mask == 0] = 0

    out = np.zeros_like(car_mask)
    best, best_score = None, 0.0
    for c, in [(c,) for c in cv2.findContours(th, cv2.RETR_EXTERNAL,
                                              cv2.CHAIN_APPROX_SIMPLE)[0]]:
        x, y, w, h = cv2.boundingRect(c)
        if h < 4 or w < cw * 0.07 or w > cw * 0.42:
            continue
        ar = w / h
        if not (2.4 <= ar <= 7.0):                # российский номер ≈ 4,5:1
            continue
        cy, cx = min(y + h // 2, out.shape[0] - 1), min(x + w // 2, out.shape[1] - 1)
        if car_mask[cy, cx] == 0 or ry[cy, cx] < 0.42:
            continue
        # Номер белый: медиана яркости внутри должна быть высокой.
        bright = float(np.median(gray[y:y + h, x:x + w])) / 255.0
        score = ry[cy, cx] * min(ar / 4.5, 4.5 / ar) * (0.35 + bright)
        if score > best_score:
            best, best_score = (x, y, w, h), score
    if best:
        x, y, w, h = best
        pad = max(int(h * 0.15), 2)
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
