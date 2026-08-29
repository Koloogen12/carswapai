"""
Генерация карточки: один артикул на три света.

СКОЛЬКО АРТИКУЛОВ ЗА РАЗ — продуктовое решение, и оно принято: ОДИН.
Спецификация считала карточку из трёх артикулов сразу (9 генераций, 76,5 ₽ за
отправку, маржа 25%). На деле клиент примеряет по одному, и 25 секунд на
артикул его устраивают. Это не упрощение ради экономии — это как человек
пользуется: он выбирает цвет, а не сравнивает таблицу.

Следствие для денег: 3 генерации вместо 9, 25,5 ₽ вместо 76,5 ₽, маржа 77%
вместо 25%.

Три света остаются обязательными и здесь не обсуждаются: О-2 требует показать
артикул при трёх освещениях, потому что на солнце и в тени плёнка выглядит
по-разному. Показать один свет — соврать. Проверка полноты стоит и в базе
(app.card_completeness), но узнать об этом лучше здесь, до денег.

ЗАЧЕМ ПАРАЛЛЕЛЬНО, если кадров всего три. Три по 25 секунд подряд — это 75
секунд, параллельно — те же 25. Разница между «подождите» и «уже готово».

ПОЧЕМУ НЕ ПРОСТО «ЗАПУСТИТЬ ВСЁ РАЗОМ». Три причины, и все три стоят денег:

  · У шлюза есть предел одновременных запросов, и превышение даёт 429 —
    то есть часть кадров теряется, а деньги за попытку списываются.
  · Отправлять девять запросов, когда первый же может провалить проверку
    «та же машина», значит платить за восемь заведомо ненужных.
  · Потолок расхода точки (§8.5) считается по факту, а не по намерению:
    параллельные запросы проскочат проверку остатка все разом.

Отсюда устройство: ограниченный параллелизм, ранний отказ по первому кадру
и учёт расхода до запуска каждого следующего.
"""
from __future__ import annotations

import concurrent.futures as cf
import os
from dataclasses import dataclass, field

import numpy as np

from . import classb

# Три света — порядок зафиксирован и совпадает с домашней константой LIGHTS
# в интерфейсе: клиент видит их всегда в одном порядке.
LIGHTS = ('day', 'shade', 'night')

MAX_PARALLEL = int(os.environ.get('CSW_B_PARALLEL', '3'))


@dataclass
class Item:
    """Одна позиция карточки: артикул и его измеренный цвет."""
    sku_name: str
    target_lab: tuple[float, float, float]
    finish: str


@dataclass
class Frame:
    light: str
    item: Item
    image: np.ndarray | None = None
    ok: bool = False
    reason: str | None = None
    cost_kopecks: int = 0


@dataclass
class Card:
    frames: list[Frame] = field(default_factory=list)
    spent_kopecks: int = 0
    aborted: str | None = None

    @property
    def complete(self) -> bool:
        """
        Карточка годна, только если у КАЖДОЙ позиции есть все три света.

        Это не придирка: О-2 требует показывать один и тот же артикул при
        трёх освещениях, потому что на солнце и в тени плёнка выглядит
        по-разному, и показать один свет — значит соврать. Триггер
        app.card_completeness в базе отклонит такую карточку, но узнать об
        этом лучше здесь, до записи и до денег.
        """
        by_item: dict[str, set[str]] = {}
        for f in self.frames:
            if f.ok:
                by_item.setdefault(f.item.sku_name, set()).add(f.light)
        return bool(by_item) and all(len(v) == len(LIGHTS) for v in by_item.values())


def render_card(engine: classb.Engine, image: np.ndarray, car: np.ndarray,
                items: list[Item], keep: tuple[np.ndarray, ...] = (),
                budget_left_kopecks: int | None = None,
                lawyer_cleared: bool = False,
                relight=None) -> Card:
    """
    Собрать карточку. Возвращает всё, что получилось, и причину, если оборвано.

    items обычно из одного элемента — см. шапку модуля. Список оставлен,
    потому что менеджер из рабочего места отправляет и по два-три сравнения,
    и ломать это ради экономии строк незачем.

    relight — функция (кадр, свет) → кадр, если три света делаются из одного
    рендера. Тогда во внешнюю модель уходит один запрос вместо трёх, и
    примерка стоит 8,5 ₽ вместо 25,5 ₽ — это единственный способ уложиться в
    целевые ≤1500 ₽ на точку из §15.

    Но передавать её можно НЕ ВСЕГДА: пересвет из одного кадра честен только
    для однотонных красок. На хамелеоне и металлике свет меняет сам оттенок,
    а не только яркость, и пересвеченный кадр покажет цвет, которого не будет.
    Решение принимает вызывающий по finish артикула, здесь мы исполняем.
    """
    card = Card()

    # Первый кадр — в одиночку. Если модель вернёт другую машину или шлюз
    # откажет, остальные восемь не нужны, а деньги за них уже не вернуть.
    probe = Frame(LIGHTS[0], items[0])
    _one(engine, image, car, probe, keep, lawyer_cleared)
    card.frames.append(probe)
    card.spent_kopecks += probe.cost_kopecks
    if not probe.ok:
        card.aborted = f'первый кадр не прошёл: {probe.reason}'
        return card

    rest: list[Frame] = []
    for it in items:
        for light in LIGHTS:
            if it is items[0] and light == LIGHTS[0]:
                continue
            if relight is not None and light != LIGHTS[0]:
                continue                      # получим пересветом, без запроса
            rest.append(Frame(light, it))

    with cf.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        futures = {}
        for f in rest:
            if budget_left_kopecks is not None:
                # Остаток считается ДО запуска каждого следующего, а не один
                # раз на входе: иначе девять параллельных запросов проскочат
                # проверку все разом и уведут точку за потолок.
                if card.spent_kopecks + engine.cost_kopecks > budget_left_kopecks:
                    card.aborted = 'достигнут потолок расхода точки'
                    break
            card.spent_kopecks += engine.cost_kopecks
            futures[pool.submit(_one, engine, image, car, f, keep, lawyer_cleared)] = f
        for fut in cf.as_completed(futures):
            fut.result()
    card.frames.extend(rest[:len(futures)])

    if relight is not None:
        base = {f.item.sku_name: f for f in card.frames if f.ok and f.light == LIGHTS[0]}
        for it in items:
            b = base.get(it.sku_name)
            if not b or b.image is None:
                continue
            for light in LIGHTS[1:]:
                card.frames.append(Frame(light, it, relight(b.image, light), True))
    return card


def _one(engine: classb.Engine, image: np.ndarray, car: np.ndarray,
         frame: Frame, keep, lawyer_cleared: bool) -> None:
    req = classb.Request(image, car, frame.item.sku_name, frame.item.target_lab,
                         frame.item.finish, keep)
    res = classb.run(engine, req, car, lawyer_cleared=lawyer_cleared)
    frame.image, frame.ok, frame.reason = res.image, res.ok, res.reason
    frame.cost_kopecks = res.cost_kopecks
