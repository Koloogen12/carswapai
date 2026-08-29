"""
Госномер: отдельный детектор, а не класс в сегментации частей.

ПОЧЕМУ ОТДЕЛЬНО. Мы пробовали учить номер восьмым классом вместе с кузовом и
стёклами: 633 размеченных экземпляра против 18 747 у краски, доли процента
площади кадра. Обученная сеть нашла номер на 1 кадре из 12. Это не вопрос
числа эпох — модель, которая одновременно учится обводить капот на пол-экрана,
не выделит ёмкости объекту в тысячу раз мельче.

ЧТО ВЗЯЛИ. open-image-models (ankandrew), лицензия MIT, веса лежат в том же
репозитории под той же лицензией — то есть без копилефта и без отдельного
разговора с юристом. Заявленная точность 0,92–0,97. Считает на процессоре
через ONNX, GPU не требуется.

Отказались от двух известных вариантов сознательно: Nomeroff-Net под GPL-3.0,
OpenALPR под AGPL-3.0 — обе обязывают открыть исходники сетевого сервиса.
Разбор с проверкой лицензий в datasets/PLATES.md.

ЗАЧЕМ НОМЕР НУЖЕН — две разные вещи, и вторая блокирующая:

  1. Не перекрасить его. Плёнка на номер не клеится, а перерисованный чужой
     госномер не нужен ни в каком виде.
  2. Закрасить перед отправкой во внешнюю модель. Фотография с читаемым
     номером — персональные данные; отправка за границу без обезличивания
     это трансграничная передача по ст. 12 152-ФЗ.

Отказ по умолчанию сохраняется: не найден номер — кадр не выдаём и наружу не
отправляем. Детектор с точностью 0,95 ошибается на каждом двадцатом, и знать
об этом лучше отказом, чем перекрашенным номером.
"""
from __future__ import annotations

import os
import threading

import cv2
import numpy as np

MODEL = os.environ.get('CSW_PLATE_MODEL', 'yolo-v9-t-512-license-plate-end2end')
SCORE_MIN = float(os.environ.get('CSW_PLATE_SCORE', '0.35'))
PAD = float(os.environ.get('CSW_PLATE_PAD', '0.18'))

_detector = None
_lock = threading.Lock()


def available() -> bool:
    """
    Доступен ли детектор НА САМОМ ДЕЛЕ.

    Проверять факт установки пакета мало, и это уже стоило прогона: версия
    0.4.0 ставится и импортируется, но `create_detector` в ней нет — он
    появился позже. Воркер решал, что детектор есть, доходил до вызова и
    падал вместо честного отказа «номер не найден».

    Пакет и сам предупреждает при импорте, если нет ONNX Runtime, — но
    предупреждение не мешает `import` пройти. Спрашиваем то, чем будем
    пользоваться.
    """
    try:
        from open_image_models import create_detector  # noqa: F401
        return True
    except Exception:
        return False


def _load():
    global _detector
    with _lock:
        if _detector is None:
            from open_image_models import create_detector
            _detector = create_detector(MODEL)
        return _detector


def _boxes(det) -> list[tuple[float, float, float, float, float]]:
    """
    Достать рамки из ответа детектора.

    Форма ответа в документации не описана, а библиотека живая — поэтому
    перебираем известные варианты, а при неудаче показываем НАСТОЯЩУЮ
    структуру. Молчаливое «ничего не нашли» здесь недопустимо: оно неотличимо
    от честного «номера в кадре нет», а последствия у них разные.
    """
    out = []
    for d in (det or []):
        score = float(getattr(d, 'confidence', None) or getattr(d, 'score', 0.0) or 0.0)
        b = getattr(d, 'bounding_box', None) or getattr(d, 'bbox', None) or d
        try:
            if hasattr(b, 'x1'):
                out.append((float(b.x1), float(b.y1), float(b.x2), float(b.y2), score))
            elif isinstance(b, dict):
                out.append((float(b['x1']), float(b['y1']),
                            float(b['x2']), float(b['y2']), score))
            elif isinstance(b, (list, tuple)) and len(b) >= 4:
                out.append((float(b[0]), float(b[1]), float(b[2]), float(b[3]), score))
            else:
                raise TypeError(type(b).__name__)
        except Exception as e:
            raise RuntimeError(
                f'не разобрал ответ детектора номера: {type(d).__name__} → '
                f'{dir(d)[:20]} ({e})')
    return out


def detect(img: np.ndarray) -> np.ndarray:
    """
    Маска госномеров, uint8 0/255. Пустая — номер не найден.

    Возвращается прямоугольником, а не точным контуром: нам нужно закрасить
    и защитить область, а не обвести знаки. Прямоугольник с запасом надёжнее
    контура — он гарантированно накрывает рамку и крепёж.
    """
    h, w = img.shape[:2]
    out = np.zeros((h, w), np.uint8)
    if not available():
        return out
    for x1, y1, x2, y2, score in _boxes(_load().predict(img)):
        if score < SCORE_MIN:
            continue
        bw, bh = x2 - x1, y2 - y1
        px, py = bw * PAD, bh * PAD
        cv2.rectangle(out,
                      (max(int(x1 - px), 0), max(int(y1 - py), 0)),
                      (min(int(x2 + px), w - 1), min(int(y2 + py), h - 1)),
                      255, -1)
    return out
