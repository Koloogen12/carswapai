"""
Композитинг обратно на оригинал.

Несущий приём всего пайплайна: результат операции возвращается в кадр ТОЛЬКО
внутри маски, всё остальное — оригинальные пиксели по построению. Номер
читается, фон тот же, кузовные линии не поплыли — не потому что модель
постаралась, а потому что мы их не трогали. Инвариант №4 выполняется
арифметикой, а не доверием.
"""
from __future__ import annotations

import cv2
import numpy as np


def feather(mask: np.ndarray, width: int | None = None) -> np.ndarray:
    """
    Растушёвка краёв маски.

    Жёсткая граница выдаёт монтаж мгновенно. Ширина — функция разрешения,
    а не константа: на кадре 4K трёхпиксельная растушёвка не видна вовсе,
    на 800px она размазывает половину крыла.
    """
    h, w = mask.shape
    if width is None:
        width = max(2, int(round(min(h, w) * 0.004)))
    m = (mask > 0).astype(np.float32)
    k = width * 2 + 1
    m = cv2.GaussianBlur(m, (k, k), sigmaX=width * 0.6)
    return np.clip(m, 0.0, 1.0)


def composite(original: np.ndarray, edited: np.ndarray, mask: np.ndarray,
              width: int | None = None, *keep: np.ndarray) -> np.ndarray:
    """
    Возвращает изменённое внутрь маски, остальное — байт в байт оригинал.

    keep — области, которые обязаны совпасть с оригиналом ПОБИТОВО. Вычесть их
    из маски заранее недостаточно: растушёвка размывает край и затекает внутрь
    вырезанной дыры, так что несколько рядов пикселей внутри номера всё равно
    меняются. Поэтому они возвращаются жёстко и последним действием, уже после
    смешивания.
    """
    a = feather(mask, width)[..., None]
    out = original.astype(np.float32) * (1 - a) + edited.astype(np.float32) * a
    out = np.clip(out, 0, 255).astype(np.uint8)
    for k in keep:
        if k is not None and (k > 0).any():
            out[k > 0] = original[k > 0]
    return out


def protect(mask: np.ndarray, *protected: np.ndarray) -> np.ndarray:
    """
    Вычитает из маски защищённые области.

    Номер вычитается ВСЕГДА и возвращается из оригинала: это и инвариант
    узнаваемости, и снятие юридического риска — перерисованный чужой госномер
    нам не нужен ни в каком виде. Туда же шильдики: модели их стабильно портят.
    """
    out = (mask > 0).astype(np.uint8) * 255
    for p in protected:
        if p is not None:
            out[p > 0] = 0
    return out
