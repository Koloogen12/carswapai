"""
Класс B: маска детерминированная, содержимое генеративное.

ПОЧЕМУ ЗДЕСЬ ИНТЕРФЕЙС, А НЕ ГОТОВЫЙ ВЫЗОВ GEMINI. Спецификация (§10, п. 10)
называет `gemini-3.1-flash-image`. На нём нельзя строить по двум причинам,
и обе выяснились не в рассуждении, а в разборе:

1. ЗАКОН. Фотография машины клиента с читаемым номером — персональные данные.
   Отправка её в Google — трансграничная передача (ст. 12 152-ФЗ) в страну без
   адекватной защиты, то есть под отдельное письменное согласие на каждое фото.
   Весь смысл контура в РФ ровно в том, чтобы этого не делать.
2. ДЕНЬГИ. Арифметика самой спецификации (§ про себестоимость): 9 генераций по
   8,5 ₽ — это 76,5 ₽ за отправку и 6 885 ₽ в месяц против 10 000 ₽ выручки при
   целевой себестоимости ≤1 500 ₽. Класс B на каждой примерке ломает маржу.

Отсюда устройство модуля: движок сменный, а всё, что вокруг него, — наше.
Маска, защита номера, проверка результата и рецепт для воспроизведения не
зависят от того, кто именно рисует пиксели.

ЧТО ОДИНАКОВО ПРИ ЛЮБОМ ДВИЖКЕ И ПОЭТОМУ ЖИВЁТ ЗДЕСЬ:
  · за пределы маски генерации выходить нельзя — иначе меняется фон и машина
    перестаёт быть той же самой;
  · номер вырезается ДО отправки и возвращается из оригинала ПОСЛЕ. Если движок
    внешний, это ещё и снятие ПД с исходящего кадра;
  · результат проходит те же проверки, что класс A, — иначе «генеративное»
    означало бы «непроверяемое».
"""
from __future__ import annotations

import abc
from dataclasses import dataclass

import numpy as np

from . import composite, qa


@dataclass(frozen=True)
class Request:
    """Что мы просим нарисовать. Артикул описан измеренными числами, а не словом.

    ВАЖНО ПРО mask. Для класса B это СИЛУЭТ МАШИНЫ, а не маска краски.
    Проверено на реальном ответе Gemini: сборка по маске краски оставляет
    исходный цвет там, где маска не попала, — на кузове проступают пятна
    старого цвета. Сборка по силуэту даёт чистый результат.

    Причина в разделении труда. Различать краску, стекло, фары и решётку —
    это то, что генеративная модель умеет лучше нас, и просить её об этом,
    а потом перепроверять своей неточной маской, значит портить её работу.
    Наше дело — гарантировать, что за пределами машины не изменился ни один
    пиксель, и что номер вернулся из оригинала. Для этого нужен силуэт.

    Из этого следует и практическое: классу B маска краски не нужна вовсе.
    От сегментации ему требуются только силуэт и номер.
    """
    image: np.ndarray            # BGR, оригинал
    mask: np.ndarray             # силуэт машины: где модели позволено рисовать
    sku_name: str                # человеческое имя — только для журнала
    target_lab: tuple[float, float, float]
    finish: str                  # gloss | satin | matte | chrome | carbon
    keep: tuple[np.ndarray, ...] = ()   # номер и шильдики: вернуть побитово


@dataclass(frozen=True)
class Result:
    image: np.ndarray | None
    engine: str
    cost_kopecks: int
    ok: bool
    reason: str | None = None


class Engine(abc.ABC):
    """
    Движок класса B.

    Реализация обязана: рисовать только внутри маски, не трогать остальное,
    не сохранять у себя присланный кадр. Последнее для внешних движков надо
    подтверждать договором, а не верой.
    """

    name: str = 'abstract'
    cost_kopecks: int = 0

    @abc.abstractmethod
    def render(self, req: Request) -> np.ndarray:
        ...

    @property
    def leaves_contour(self) -> bool:
        """Уходит ли кадр за пределы нашего контура. Решает, нужно ли согласие."""
        return True


def run(engine: Engine, req: Request, car: np.ndarray,
        lawyer_cleared: bool = False) -> Result:
    """
    Выполнить класс B с обязательными проверками вокруг движка.

    ПОРЯДОК ДЕЙСТВИЙ И ПОЧЕМУ ИМЕННО ТАКОЙ:

    1. Обезличить. За контур уходит обрезка по машине с залитым номером и
       без фона — см. depersonalize. Это не оптимизация, а единственный
       способ не совершать трансграничную передачу персональных данных.
    2. Отказать, если номер не найден. Не зная, где он, мы не можем
       утверждать, что его нет в отправляемом кадре.
    3. Спросить модель.
    4. Проверить, что вернулась ТА ЖЕ машина. Без этой проверки брак был бы
       скрыт сборкой: снаружи маски остался бы оригинал, а внутри — чужой
       кузов.
    5. Собрать: изменения только внутри маски, номер возвращён побитово.
    6. Прогнать тот же контроль качества, что у класса A. Иначе
       «генеративное» означало бы «непроверяемое».

    lawyer_cleared — подтверждение юриста, что обезличивания достаточно для
    этого контура. По умолчанию его нет, и движок за контуром не вызывается:
    решение о достаточности принимает человек с дипломом, а не эта функция.
    """
    from . import depersonalize

    if engine.leaves_contour and not lawyer_cleared:
        return Result(None, engine.name, 0, False,
                      'внешний движок не согласован юристом: обезличивание '
                      'убирает номер и фон, но VIN, отражения и приметность '
                      'машины остаются — достаточность этого решает не код')

    if not engine.leaves_contour:
        # Свой движок внутри контура: обезличивать незачем, кадр никуда не едет.
        try:
            drawn = engine.render(req)
        except Exception as e:
            return Result(None, engine.name, 0, False, f'движок не ответил: {e}')
        out = composite.composite(req.image, drawn, req.mask, None, *req.keep)
        rep = qa.report(req.image, out, req.mask, req.keep[0] if req.keep else None)
        if not rep['passed']:
            return Result(None, engine.name, engine.cost_kopecks, False,
                          rep.get('reject_reason') or 'qa: результат не прошёл проверку')
        return Result(out, engine.name, engine.cost_kopecks, True)

    plate = req.keep[0] if req.keep else None
    try:
        outgoing = depersonalize.prepare(req.image, car, req.mask, plate)
    except ValueError as e:
        return Result(None, engine.name, 0, False, str(e))

    ok, why = depersonalize.safe_to_send(outgoing)
    if not ok:
        return Result(None, engine.name, 0, False, why)

    try:
        drawn_crop = engine.render(Request(outgoing.image, outgoing.mask,
                                           req.sku_name, req.target_lab,
                                           req.finish, ()))
    except Exception as e:
        return Result(None, engine.name, 0, False, f'движок не ответил: {e}')

    from .engines.openrouter import same_car
    same, iou = same_car(outgoing.image, drawn_crop)
    if not same:
        return Result(None, engine.name, engine.cost_kopecks, False,
                      f'модель вернула другую машину: совпадение силуэта {iou:.2f}')

    drawn = depersonalize.restore(req.image, drawn_crop, outgoing.box)
    # Собираем по силуэту (он же req.mask для класса B) — см. пояснение в
    # Request. Номер возвращается побитово поверх, последним действием.
    out = composite.composite(req.image, drawn, req.mask, None, *req.keep)
    rep = qa.report(req.image, out, req.mask, plate)
    if not rep['passed']:
        return Result(None, engine.name, engine.cost_kopecks, False,
                      rep.get('reject_reason') or 'qa: результат не прошёл проверку')
    return Result(out, engine.name, engine.cost_kopecks, True)
