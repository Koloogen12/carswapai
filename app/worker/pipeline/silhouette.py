"""
Силуэт автомобиля сетью.

GrabCut по прямоугольнику даёт границу, которая видна на результате: срезает
бамперы и зеркала, ловит асфальт под порогом. На перекраске это выглядит как
брак, а не как «примерно так будет».

Mask R-CNN на COCO знает класс «автомобиль» и отдаёт маску экземпляра.
Веса скачиваются один раз и кладутся в образ при сборке — на боевом контуре
интернета у воркера нет.

Части автомобиля COCO не знает: у неё «машина» целиком. Разделение на кузов,
стёкла, колёса и номер остаётся за pipeline/segment.py, но теперь оно работает
внутри точной границы, а не внутри приблизительной.
"""
from __future__ import annotations

import os
import threading

import cv2
import numpy as np

# COCO: 3 — легковой автомобиль, 6 — автобус, 8 — грузовик.
# Кроссовер и пикап сеть нередко относит к грузовику, поэтому берём все три.
VEHICLE_CLASSES = (3, 6, 8)

_model = None
_lock = threading.Lock()


def _load():
    global _model
    with _lock:
        if _model is not None:
            return _model
        import torch
        from torchvision.models.detection import (
            maskrcnn_resnet50_fpn_v2, MaskRCNN_ResNet50_FPN_V2_Weights)
        w = MaskRCNN_ResNet50_FPN_V2_Weights.DEFAULT
        m = maskrcnn_resnet50_fpn_v2(weights=w, box_score_thresh=0.5)
        m.eval()
        torch.set_grad_enabled(False)
        _model = m
        return m


def available() -> bool:
    """Есть ли сеть. Если нет — вызывающий откатывается на GrabCut и пишет об этом."""
    if os.environ.get('CSW_SILHOUETTE') == 'grabcut':
        return False
    try:
        import torchvision  # noqa: F401
        return True
    except Exception:
        return False


def car(img: np.ndarray, min_area_frac: float = 0.03) -> np.ndarray | None:
    """
    Маска главного автомобиля кадра, uint8 0/255. None — если машины не нашлось.

    Главный — не самый уверенный, а самый крупный: клиент фотографирует свою
    машину, она занимает кадр, а уверенность выше бывает у чужой машины на
    заднем плане, снятой целиком и без бликов.
    """
    import torch
    m = _load()
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    t = torch.from_numpy(rgb).permute(2, 0, 1).float() / 255.0
    out = m([t])[0]

    h, w = img.shape[:2]
    frame_area = h * w
    best, best_area = None, 0.0
    for mask, label, score in zip(out['masks'], out['labels'], out['scores']):
        if int(label) not in VEHICLE_CLASSES:
            continue
        binary = (mask[0].numpy() > 0.5)
        area = binary.sum() / frame_area
        if area < min_area_frac or area <= best_area:
            continue
        best, best_area = binary, area
    if best is None:
        return None

    out_mask = (best * 255).astype(np.uint8)
    # Сеть оставляет зазубрины по краю; закрываем их, не съедая форму.
    out_mask = cv2.morphologyEx(out_mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    return out_mask
