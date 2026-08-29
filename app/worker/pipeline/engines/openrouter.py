"""
Класс B через шлюз, совместимый с OpenAI: OpenRouter или CometAPI.

ПОЧЕМУ ШЛЮЗ, А НЕ GOOGLE НАПРЯМУЮ. Gemini не отвечает на российские адреса.
Шлюз это решает — и только это. Законность он не решает: кадр всё равно
уезжает за границу, получателей теперь двое, и у шлюза свои правила хранения
запросов. Поэтому наружу уходит ТОЛЬКО обезличенная обрезка — см.
pipeline/depersonalize.py, — а не фотография клиента.

ЧЕГО МОДЕЛЬ НЕ УМЕЕТ, И ЧТО ИЗ ЭТОГО СЛЕДУЕТ. Gemini не принимает маску: она
возвращает перерисованный кадр целиком, а не правку внутри области. Значит
инвариант «вне маски побитово оригинал» она соблюсти не может в принципе —
его держим мы сами при сборке (pipeline/classb.run). Но остаётся риск, что
модель нарисует ДРУГУЮ машину в той же позе, и сборка по маске это скроет:
внутри маски будет чужой кузов. Поэтому здесь стоит отдельная проверка
совпадения силуэта, и без неё движок не отдаёт результат.

КЛЮЧ. Только из окружения, в репозитории его нет и быть не может:
  OPENROUTER_API_KEY  или  COMETAPI_KEY
  CSW_B_BASE_URL      — по умолчанию OpenRouter
  CSW_B_MODEL         — модель, задаётся явно, а не угадывается кодом
"""
from __future__ import annotations

import base64
import json
import os
import re
import urllib.request

import cv2
import numpy as np

from .. import classb

DEFAULT_BASE = 'https://openrouter.ai/api/v1'
# Модель НЕ зашита: имена у шлюзов меняются, и молча уехать не на той модели —
# это молча уехать не на той цене и не на том качестве.
MODEL_ENV = 'CSW_B_MODEL'


def _key() -> str:
    for name in ('OPENROUTER_API_KEY', 'COMETAPI_KEY'):
        v = os.environ.get(name)
        if v:
            return v
    raise RuntimeError(
        'ключ шлюза не задан: положите OPENROUTER_API_KEY или COMETAPI_KEY '
        'в окружение. В репозитории ключей нет и не будет.')


def _b64(img: np.ndarray) -> str:
    ok, buf = cv2.imencode('.png', img)
    if not ok:
        raise RuntimeError('не удалось закодировать кадр')
    return 'data:image/png;base64,' + base64.b64encode(buf.tobytes()).decode()


def _decode(data_url: str) -> np.ndarray:
    payload = data_url.split(',', 1)[1] if ',' in data_url else data_url
    raw = np.frombuffer(base64.b64decode(payload), np.uint8)
    img = cv2.imdecode(raw, cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError('шлюз вернул то, что не разбирается как изображение')
    return img


def _extract_image(body: dict) -> np.ndarray:
    """
    Достать картинку из ответа.

    Форма ответа у шлюзов расходится и меняется от версии к версии, поэтому
    перебираем известные варианты, а при неудаче показываем РЕАЛЬНУЮ структуру
    ответа. Молчаливое «не смогли» здесь недопустимо: оно выглядит как отказ
    модели, хотя на деле мы просто не туда посмотрели.
    """
    msg = (body.get('choices') or [{}])[0].get('message') or {}
    for img in (msg.get('images') or []):
        if isinstance(img, str):
            return _decode(img)
        url = (img.get('image_url') or {}).get('url') if isinstance(img, dict) else None
        if url:
            return _decode(url)
    content = msg.get('content')
    # CometAPI отдаёт картинку ВНУТРИ текста, разметкой markdown:
    # «![image](data:image/jpeg;base64,…)». Это не описано ни в одной
    # документации, выяснилось живым запросом.
    if isinstance(content, str):
        m = re.search(r'data:image/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)', content)
        if m:
            return _decode(m.group(1).strip())
    if isinstance(content, list):
        for part in content:
            if isinstance(part, str):
                m = re.search(r'data:image/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)', part)
                if m:
                    return _decode(m.group(1).strip())
            if isinstance(part, dict):
                if isinstance(part.get('text'), str):
                    m = re.search(r'data:image/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=\s]+)',
                                  part['text'])
                    if m:
                        return _decode(m.group(1).strip())
                url = (part.get('image_url') or {}).get('url')
                if url:
                    return _decode(url)
                if part.get('type') == 'image' and part.get('data'):
                    return _decode(part['data'])
    shape = json.dumps(body, ensure_ascii=False)[:600]
    raise RuntimeError(f'изображения в ответе шлюза нет. Ответ начинается так: {shape}')


class GatewayEngine(classb.Engine):
    """Движок класса B через шлюз. Кадр уходит за контур — это его свойство."""

    def __init__(self, model: str | None = None, base_url: str | None = None,
                 timeout: float = 120.0, cost_kopecks: int = 850):
        self.model = model or os.environ.get(MODEL_ENV) or ''
        if not self.model:
            raise RuntimeError(
                f'модель не задана: укажите {MODEL_ENV}. Имена моделей у шлюзов '
                'меняются, и подставлять их из кода — значит однажды молча '
                'уехать не на той цене.')
        self.base_url = (base_url or os.environ.get('CSW_B_BASE_URL')
                         or DEFAULT_BASE).rstrip('/')
        self.timeout = timeout
        self.cost_kopecks = cost_kopecks
        self.name = f'gateway:{self.model}'

    @property
    def leaves_contour(self) -> bool:
        return True

    def prompt(self, req: classb.Request) -> str:
        """
        Задание модели. Цвет описан числами, а не названием: «Sapphire Blue»
        в промпте и реальный артикул — разные цвета, и клиент увидит разницу
        на замере.
        """
        L, a, b = req.target_lab
        return (
            'Перекрась кузов этого автомобиля в плёнку с измеренным цветом '
            f'CIELAB L*={L:.1f} a*={a:.1f} b*={b:.1f}, финиш — {req.finish}. '
            'Сохрани в точности: форму кузова, ракурс, освещение, тени и '
            'отражения, стёкла, фары, колёса, решётку и все шильдики. '
            'Не меняй фон и не двигай камеру. Это должна остаться та же самая '
            'машина, у которой изменён только цвет окрашенных панелей.'
        )

    def render(self, req: classb.Request) -> np.ndarray:
        payload = {
            'model': self.model,
            'messages': [{
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': self.prompt(req)},
                    {'type': 'image_url', 'image_url': {'url': _b64(req.image)}},
                ],
            }],
        }
        rq = urllib.request.Request(
            f'{self.base_url}/chat/completions',
            data=json.dumps(payload).encode(),
            headers={'Authorization': f'Bearer {_key()}',
                     'Content-Type': 'application/json'},
            method='POST')
        with urllib.request.urlopen(rq, timeout=self.timeout) as r:
            body = json.loads(r.read().decode())
        out = _extract_image(body)
        if out.shape[:2] != req.image.shape[:2]:
            out = cv2.resize(out, (req.image.shape[1], req.image.shape[0]),
                             interpolation=cv2.INTER_LANCZOS4)
        return out


def same_car(before: np.ndarray, after: np.ndarray, min_iou: float = 0.88
             ) -> tuple[bool, float]:
    """
    Та же машина в том же ракурсе, или модель нарисовала новую.

    Проверка нужна именно потому, что сборка по маске этот брак СКРЫВАЕТ:
    снаружи маски всё останется оригиналом, а внутри окажется чужой кузов.
    Сравниваем силуэты — форма машины при смене цвета не меняется.
    """
    from .. import silhouette
    a = silhouette.car(before)
    b = silhouette.car(after)
    if a is None or b is None:
        return False, 0.0
    inter = ((a > 0) & (b > 0)).sum()
    union = ((a > 0) | (b > 0)).sum()
    iou = float(inter) / max(int(union), 1)
    return iou >= min_iou, iou
