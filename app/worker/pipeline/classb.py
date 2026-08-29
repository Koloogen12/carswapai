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
    """Что мы просим нарисовать. Артикул описан измеренными числами, а не словом."""
    image: np.ndarray            # BGR, оригинал
    mask: np.ndarray             # куда можно рисовать, 0/255
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


def run(engine: Engine, req: Request, allow_transfer: bool = False) -> Result:
    """
    Выполнить класс B с обязательными проверками вокруг движка.

    allow_transfer — есть ли согласие клиента на трансграничную передачу.
    По умолчанию нет, и внешний движок в этом случае не вызывается вовсе:
    отказать честнее, чем отправить чужие персональные данные за границу и
    рассказать об этом потом.
    """
    if engine.leaves_contour and not allow_transfer:
        return Result(None, engine.name, 0, False,
                      'кадр уходит за контур, а согласия на трансграничную '
                      'передачу нет — по ст. 12 152-ФЗ отправлять нельзя')

    # Номер снимается ДО отправки: наружу не должно уехать то, чего там быть
    # не должно, даже если движок обещает ничего не хранить.
    img = req.image
    if engine.leaves_contour and req.keep:
        img = img.copy()
        for k in req.keep:
            if k is not None and (k > 0).any():
                img[k > 0] = 0

    try:
        drawn = engine.render(Request(img, req.mask, req.sku_name, req.target_lab,
                                      req.finish, req.keep))
    except Exception as e:
        return Result(None, engine.name, 0, False, f'движок не ответил: {e}')

    out = composite.composite(req.image, drawn, req.mask, None, *req.keep)
    rep = qa.report(req.image, out, req.mask,
                    req.keep[0] if req.keep else None)
    if not rep['passed']:
        return Result(None, engine.name, engine.cost_kopecks, False,
                      rep.get('reject_reason') or 'результат не прошёл проверку')
    return Result(out, engine.name, engine.cost_kopecks, True)
