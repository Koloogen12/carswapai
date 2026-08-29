"""
Сегментация частей автомобиля обученной сетью.

Заменяет собой эвристики из segment.py — те были написаны, проверены на
двенадцати реальных кадрах и признаны негодными: детекторы стекла и колёс
помечали крышу и капот, детектор номера находил дверные ручки. Разбор в
DECISIONS.md, §3 и §4.

ДВА СЛОВАРЯ. Веса могут быть обучены на исходных 23 классах набора или на
наших восьми (train/vocab.py). Словарь едет внутри файла весов, потому что
внешне такие .pt неотличимы, а перепутать их — получить молча неверные маски.
Здесь оба приводятся к нашим восьми: пайплайну нужны только они.

ЧЕГО ЗДЕСЬ НЕТ. Порога уверенности «на глаз». Он берётся из окружения и по
умолчанию высокий: лучше не найти часть и честно отказать, чем перекрасить
номер, приняв его за бампер.
"""
from __future__ import annotations

import os
import pathlib
import threading

import cv2
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEIGHTS = pathlib.Path(os.environ.get('CSW_PARTS_WEIGHTS',
                                      str(ROOT / 'models' / 'carparts.pt')))
SCORE_MIN = float(os.environ.get('CSW_PARTS_SCORE', '0.60'))

# Наш словарь. Держится здесь же, чтобы модуль читался целиком.
OURS = ('paint', 'glass', 'wheel', 'light', 'mirror', 'grille', 'plate', 'body_other')

# Приведение исходных 23 классов набора к нашим восьми — то же отображение,
# что в train/vocab.py. Продублировано намеренно: боевой воркер не должен
# зависеть от каталога обучения, которого в образе может не быть.
FROM_SOURCE = {
    'back_bumper': 'paint', 'back_door': 'paint', 'back_glass': 'glass',
    'back_left_door': 'paint', 'back_left_light': 'light', 'back_light': 'light',
    'back_right_door': 'paint', 'back_right_light': 'light',
    'front_bumper': 'paint', 'front_door': 'paint', 'front_glass': 'glass',
    'front_left_door': 'paint', 'front_left_light': 'light', 'front_light': 'light',
    'front_right_door': 'paint', 'front_right_light': 'light', 'hood': 'paint',
    'left_mirror': 'mirror', 'right_mirror': 'mirror', 'tailgate': 'paint',
    'trunk': 'paint', 'wheel': 'wheel', 'object': None,
}

_model = None
_names: list[str] = []
_lock = threading.Lock()


def available() -> bool:
    """Есть ли обученные веса. Если нет — вызывающий откатывается и пишет об этом."""
    return WEIGHTS.exists()


def _load():
    global _model, _names
    with _lock:
        if _model is not None:
            return _model
        import torch
        from torchvision.models.detection import maskrcnn_resnet50_fpn_v2
        from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
        from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor

        ckpt = torch.load(WEIGHTS, map_location='cpu', weights_only=False)
        _names = list(ckpt['names'])
        n = len(_names) + 1

        m = maskrcnn_resnet50_fpn_v2(weights=None, num_classes=n)
        inf = m.roi_heads.box_predictor.cls_score.in_features
        m.roi_heads.box_predictor = FastRCNNPredictor(inf, n)
        inm = m.roi_heads.mask_predictor.conv5_mask.in_channels
        m.roi_heads.mask_predictor = MaskRCNNPredictor(inm, 256, n)
        m.load_state_dict(ckpt['model'])
        m.eval()
        torch.set_grad_enabled(False)
        _model = m
        return m


def _to_ours(name: str) -> str | None:
    if name in OURS:
        return name
    return FROM_SOURCE.get(name)


def segment(img: np.ndarray) -> dict[str, np.ndarray]:
    """
    Маски частей в нашем словаре. Ключи — из OURS плюс 'car' (объединение всего).

    Экземпляры одного класса объединяются: пайплайну не нужно знать, что
    колёс было два, ему нужно знать, где резина.
    """
    import torch
    m = _load()
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    t = torch.from_numpy(rgb.copy()).permute(2, 0, 1).float() / 255.0
    out = m([t])[0]

    h, w = img.shape[:2]
    masks = {k: np.zeros((h, w), np.uint8) for k in OURS}
    for mk, label, score in zip(out['masks'], out['labels'], out['scores']):
        if float(score) < SCORE_MIN:
            continue
        idx = int(label) - 1                 # 0 — фон
        if not (0 <= idx < len(_names)):
            continue
        ours = _to_ours(_names[idx])
        if ours is None:
            continue
        masks[ours][mk[0].numpy() > 0.5] = 255

    # ── ГЛАВНАЯ машина, а не все машины в кадре ──────────────────────
    # Сеть частей не знает, где кончается одна машина и начинается другая:
    # она видит двери и капоты, а чьи они — не её задача. На кадре во дворе
    # это дало перекрашенный автомобиль СОСЕДА.
    #
    # Отбор идёт ПО ЧАСТЯМ, а не по их объединению. Первая попытка отсекала
    # объединение целиком, и на кадре с тремя машинами оно оказалось одной
    # связной областью: не прошло проверку и выбросилось всё, включая нужное.
    from . import silhouette
    main = silhouette.car(img) if silhouette.available() else None
    if main is not None and (main > 0).any():
        # Часть засчитывается целиком, если она в основном внутри главной
        # машины: обрезать по границе нельзя — края у двух сетей не совпадут
        # до пикселя, и по кузову пойдёт кайма чужого цвета.
        keep = cv2.dilate(main, np.ones((15, 15), np.uint8))
        for k in OURS:
            num, lbl, stats, _ = cv2.connectedComponentsWithStats(
                (masks[k] > 0).astype(np.uint8), 8)
            out_m = np.zeros_like(masks[k])
            for i in range(1, num):
                comp = (lbl == i)
                if (keep[comp] > 0).mean() > 0.5:
                    out_m[comp] = 255
            masks[k] = out_m

    # Силуэт собирается ПОСЛЕ отбора — из того, что осталось.
    car = np.zeros((h, w), np.uint8)
    for k in OURS:
        car[masks[k] > 0] = 255
    car = cv2.morphologyEx(car, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    if main is not None and (main > 0).any():
        # Независимый силуэт нужен и дальше: по нему меряется, какую долю
        # машины сеть частей вообще объяснила. Своим объединением это мерить
        # нельзя — получится сто процентов при любом качестве.
        masks['car_ref'] = main
    masks['car'] = car
    # 'body' — то, во что ложится плёнка. Синоним paint, оставлен ради
    # совместимости с уже написанным пайплайном.
    masks['body'] = masks['paint']
    return masks
