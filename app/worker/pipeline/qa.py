"""
QA-гейт перед доставкой.

Проверяем сравнением с оригиналом, а не «красотой». No-reference метрики
качества здесь бесполезны: 19 из 21 не детектируют деградацию при
итеративном редактировании, то есть уверенно пропускают именно тот брак,
который мы ищем.
"""
from __future__ import annotations

import cv2
import numpy as np


def outside_mask_identical(original: np.ndarray, result: np.ndarray,
                           mask: np.ndarray, feather_px: int = 12,
                           tolerance: int = 1) -> tuple[bool, float]:
    """
    Вне маски изображение обязано совпадать с оригиналом.

    Зона растушёвки исключается из проверки: там смешение законно.
    Расхождение выше допуска означает, что операция вышла за границы —
    это брак, а не «немного изменилось».
    """
    k = feather_px * 2 + 1
    grown = cv2.dilate((mask > 0).astype(np.uint8), np.ones((k, k), np.uint8))
    outside = grown == 0
    if not outside.any():
        return True, 0.0
    diff = np.abs(original.astype(np.int16) - result.astype(np.int16)).max(axis=2)
    bad = float((diff[outside] > tolerance).mean())
    return bad == 0.0, bad


def changed_area_matches(original: np.ndarray, result: np.ndarray,
                         mask: np.ndarray, min_ratio: float = 0.25) -> tuple[bool, float]:
    """
    Площадь фактического изменения сопоставляется с площадью маски.

    Если изменилось сильно меньше маски — операция не сработала и клиент
    получит «ту же машину». Если сильно больше — вышли за границы.
    """
    diff = np.abs(original.astype(np.int16) - result.astype(np.int16)).max(axis=2)
    changed = (diff > 6)
    area = float((mask > 0).sum())
    if area == 0:
        return False, 0.0
    ratio = float((changed & (mask > 0)).sum()) / area
    return ratio >= min_ratio, ratio


def plate_readable(original: np.ndarray, result: np.ndarray,
                   plate_mask: np.ndarray) -> bool | None:
    """
    Номер на выходе обязан быть теми же пикселями, что на входе.

    Проверяем побитово, а не распознаванием: OCR может совпасть на разных
    пикселях, а нам нужно, чтобы номер вообще не трогали.
    """
    if plate_mask is None or (plate_mask > 0).sum() == 0:
        # НЕ «пройдено». Ненайденный номер означает, что мы не знаем, где он,
        # и не можем утверждать, что не тронули его. Возврат True здесь был
        # ложно-зелёной проверкой: промах детектора выдавался за доказательство.
        return None
    sel = plate_mask > 0
    return bool((original[sel] == result[sel]).all())


def report(original: np.ndarray, result: np.ndarray, mask: np.ndarray,
           plate_mask: np.ndarray | None = None) -> dict:
    ok_out, bad_ratio = outside_mask_identical(original, result, mask)
    ok_area, area_ratio = changed_area_matches(original, result, mask)
    ok_plate = plate_readable(original, result, plate_mask)
    return {
        'outside_untouched': ok_out,
        'outside_bad_ratio': round(bad_ratio, 6),
        'area_ok': ok_area,
        'changed_ratio': round(area_ratio, 4),
        'plate_untouched': ok_plate,          # None — номер не найден, не проверено
        # Непроверенный номер не пропускаем: по §8 отдавать можно только то,
        # за что можно поручиться. Пусть лучше отказ с внятной причиной, чем
        # выдача с перекрашенным чужим госномером.
        'passed': bool(ok_out and ok_area and ok_plate is True),
        'reject_reason': (None if ok_plate is not None else
                          'plate_not_found: номер не найден, не можем поручиться, '
                          'что он не тронут'),
    }
