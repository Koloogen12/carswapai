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
    Госномер. ВОЗВРАЩАЕТ ПУСТУЮ МАСКУ — детектора у нас пока нет.

    Была написана и проверена на двенадцати реальных кадрах классическая
    версия: светлое поле, тёмные знаки, пропорция 4,6:1, синяя полоса слева.
    Она нашла «номер» на пяти кадрах, и все пять оказались дверными ручками и
    зеркалом. Это хуже, чем ничего: маска защищала не то место, настоящий
    номер оставался открытым, а проверка качества при этом была зелёной.

    Ложная уверенность опаснее честного незнания, поэтому детектор снят, а не
    оставлен «пока так». Вызывающий получает пустую маску, qa.plate_readable
    возвращает None вместо True, и кадр не проходит контроль — то есть система
    отказывает, а не выдаёт результат, за который не может поручиться.

    Настоящее решение — обученный детектор: задача давно решена, публичные
    наборы российских номеров есть. Учить его надо тем же заходом, что и
    сегментацию частей.

    Пока его нет, номер, шильдики и решётку удерживает от перекраски
    texture_gate(): они мелкофактурные, а краска гладкая.
    """
    return np.zeros(img.shape[:2], np.uint8)


def texture_gate(img: np.ndarray, mask: np.ndarray, quantile: float = 0.88) -> np.ndarray:
    """
    Убрать из маски всё мелкофактурное.

    Крашеная панель — гладкая поверхность с плавным переходом яркости. Номер,
    шильдик, решётка радиатора, протектор и сетка бампера — мелкая частая
    деталь. Одна проверка на локальный разброс яркости отсекает их все разом,
    и не надо заводить детектор на каждое.

    Это НЕ замена детектору номера: гарантии здесь нет, есть уменьшение вреда.
    Гарантию даёт только знание, где номер.
    """
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    k = 5
    mean = cv2.blur(g, (k, k))
    var = cv2.blur(g * g, (k, k)) - mean * mean
    sd = np.sqrt(np.maximum(var, 0))

    sel = mask > 0
    if sel.sum() < 100:
        return mask
    thr = float(np.quantile(sd[sel], quantile))
    out = mask.copy()
    out[(sd > max(thr, 6.0)) & sel] = 0
    # Смыкаем поры, чтобы фактура не превратила кузов в решето.
    out = cv2.morphologyEx(out, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return out


def paint(img: np.ndarray, car_mask: np.ndarray, k: int = 5) -> np.ndarray:
    """
    Крашеная поверхность — самый крупный цветовой кластер внутри силуэта.

    Почему так, а не «силуэт минус стёкла минус колёса минус фары»: плёнка не
    клеится на стекло, резину, фару и решётку, и это ровно те места, где цвет
    не совпадает с цветом краски. Значит вместо четырёх ненадёжных детекторов
    достаточно одного решения — выделить саму краску.

    Светлота приглушена втрое: одна и та же краска на освещённой крыше и в
    тени двери расходится по L сильнее, чем краска расходится со стеклом по
    оттенку. Без этого один кузов распадается на два кластера, и перекрашена
    оказывается половина машины.

    ГРАНИЦА ПРИМЕНИМОСТИ, которую видно на реальных кадрах: серебристый диск и
    серебристая краска — один цвет, чёрное стекло и чёрная краска — тоже. Цвет
    их не разделяет в принципе; разделяет форма, то есть обученная сеть на
    части. До неё на ахроматичных кузовах эта функция прихватывает лишнее.
    """
    sel = car_mask > 0
    if sel.sum() < 200:
        return np.zeros_like(car_mask)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    feat = np.stack([lab[..., 0][sel] * 0.35, lab[..., 1][sel], lab[..., 2][sel]], 1)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    # Фиксированное зерно. Кластеризация стартует со случайных центров, и без
    # этого один и тот же кадр даёт разный результат от прогона к прогону.
    # §15 требует побитовой воспроизводимости класса A: рендер годовой давности
    # обязан повторяться по сохранённому рецепту, иначе спор с клиентом о том,
    # что ему показали, разрешить нечем.
    cv2.setRNGSeed(20260829)
    _, lbl, cen = cv2.kmeans(feat, min(k, int(sel.sum())), None, crit, 3,
                             cv2.KMEANS_PP_CENTERS)
    lbl = lbl.ravel()
    main = int(np.bincount(lbl, minlength=len(cen)).argmax())
    keep = np.where(np.linalg.norm(cen - cen[main], axis=1) < 14.0)[0]

    m = np.zeros(img.shape[:2], np.uint8)
    idx = np.zeros(int(sel.sum()), bool)
    for kk in keep:
        idx |= (lbl == kk)
    m[sel] = idx.astype(np.uint8) * 255
    return _regularize(m, car_mask)


def _regularize(m: np.ndarray, car_mask: np.ndarray) -> np.ndarray:
    """
    Привести попиксельное решение к поверхности.

    Кластеризация судит каждый пиксель в одиночку, поэтому на кузове выходит
    рябь в один пиксель: часть точек перекрашивается, часть нет, и результат
    покрыт крапом. Краска — это сплошная поверхность, а не облако точек, и
    маску надо привести к тому же виду.

    Размеры считаются от габарита машины, а не в пикселях: на макро и на общем
    плане один и тот же кузов занимает на два порядка разное число точек.
    """
    ys, xs = np.nonzero(car_mask > 0)
    if len(xs) == 0:
        return m
    cw = max(xs.max() - xs.min(), 1)
    k = max(int(cw * 0.010) | 1, 3)          # нечётный, не меньше трёх

    m = cv2.medianBlur(m, k)                 # рябь в один пиксель
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k * 2 + 1,) * 2, np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((k,) * 2, np.uint8))

    # Дыры внутри кузова — это блики и отражения, а не «не краска»:
    # плёнка под ними тоже лежит. Заливаем всё, что окружено краской.
    h, w = m.shape
    ff = m.copy()
    pad = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, pad, (0, 0), 255)
    m = m | cv2.bitwise_not(ff)

    # Мелкие островки — шум кластеризации, а не отдельные детали кузова.
    num, lbl, stats, _ = cv2.connectedComponentsWithStats((m > 0).astype(np.uint8), 8)
    if num > 1:
        keep = np.zeros_like(m)
        big = stats[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, num):
            if stats[i, cv2.CC_STAT_AREA] >= max(big * 0.04, cw * cw * 0.002):
                keep[lbl == i] = 255
        m = keep
    m[car_mask == 0] = 0
    return m


def segment(img: np.ndarray) -> dict[str, np.ndarray]:
    """Полный набор масок на кадр. Считается один раз и кэшируется по хешу фото."""
    c = car(img)
    g = glass(img, c)
    w = wheels(img, c)
    p = plate(img, c)
    # Кузов — краска, а не «силуэт минус части»: см. комментарий к paint().
    # Номер и колёса вычитаются дополнительно: номер обязан остаться нетронутым
    # всегда, а серебристый диск попадает в кластер серебристой краски.
    body = paint(img, c)
    for m in (w, p):
        body[m > 0] = 0
    body = texture_gate(img, body)
    return {'car': c, 'body': body, 'glass': g, 'wheel': w, 'plate': p}
