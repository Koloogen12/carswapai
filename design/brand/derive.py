#!/usr/bin/env python3
"""Веб-набор знака YOOMP из исходников в source/.

Зачем нужен вывод, а не прямое использование исходников.

  Лайм. В растре он #DEEC65, фирменный — #DEF23B. Синий канал расходится на
  сорок два пункта: рядом с кислотными плашками продукта, где стоит ровно
  #DEF23B, это читается как ДРУГОЙ цвет, а не как тот же знак. Здесь лайм
  снимается до покрытия и красится точным.

  Прозрачность. В папке 04-transparent-lime она получена мягким ключом: у
  надписи почти нет полностью непрозрачных пикселей, края мыльные. Поэтому
  прозрачность выводится здесь из чистой версии на чёрном — чёрное становится
  прозрачным, лайм остаётся лаймом с честным сглаживанием.

  Иконка — исключение: у неё чёрная плитка часть знака, и её надо сохранить.
  Она берётся из прозрачной версии, где вырезано только поле вокруг плитки.

Запуск (Pillow обязателен):
    python3 design/brand/derive.py
"""
from __future__ import annotations

import pathlib

from PIL import Image

HERE = pathlib.Path(__file__).parent
SRC = HERE / 'source'
OUT = HERE.parent.parent / 'app' / 'public' / 'brand'

LIME = (222, 242, 59)    # #DEF23B — кислота продукта, тот же токен, что в вёрстке
INK = (17, 17, 17)       # #111111 — чёрный продукта

# Порог отсечения поля. Генерация оставляет по краям слабый шум, и обрезка по
# «альфа больше нуля» дала бы рамку в половину кадра — так и вышло на первой
# попытке: bbox надписи занял всю ширину файла.
TRIM_ALPHA = 24


def coverage(px: tuple[int, int, int]) -> float:
    """Насколько пиксель — лайм, а не чёрный фон. 0 — фон, 1 — сплошной знак.

    Считается по зелёному каналу: у лайма он максимален, у чёрного минимален,
    и промежуточные значения — это ровно сглаживание края буквы.
    """
    g = px[1]
    return max(0.0, min(1.0, (g - 20) / (236 - 20)))


def lime_on_transparent(src: pathlib.Path) -> Image.Image:
    """Знак лаймом на прозрачном: чёрное поле уходит, срезы становятся дырами.

    Срез сквозь букву — это чёрная полоса в исходнике, и здесь она честно
    превращается в прозрачную. На тёмной подложке выглядит как в макете, на
    светлой — знак остаётся читаемым, просто срез светлый.
    """
    im = Image.open(src).convert('RGB')
    w, h = im.size
    out = Image.new('RGBA', (w, h))
    sp, op = im.load(), out.load()
    for y in range(h):
        for x in range(w):
            t = coverage(sp[x, y])
            op[x, y] = (*LIME, int(round(t * 255)))
    return trim(out)


def icon_tile(src: pathlib.Path) -> Image.Image:
    """Иконка: чёрная плитка со скруглением остаётся, поле вокруг — прозрачное.

    Цвета снимаются до точных: и плитка, и лайм в растре чуть плывут.
    """
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    out = Image.new('RGBA', (w, h))
    sp, op = im.load(), out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = sp[x, y]
            if a == 0:
                op[x, y] = (0, 0, 0, 0)
                continue
            t = coverage((r, g, b))
            op[x, y] = (
                int(round(INK[0] + t * (LIME[0] - INK[0]))),
                int(round(INK[1] + t * (LIME[1] - INK[1]))),
                int(round(INK[2] + t * (LIME[2] - INK[2]))),
                a,
            )
    return trim(out)


def trim(im: Image.Image) -> Image.Image:
    a = im.split()[-1].point(lambda v: 255 if v >= TRIM_ALPHA else 0)
    box = a.getbbox()
    return im.crop(box) if box else im


def save(im: Image.Image, name: str, width: int | None = None) -> None:
    if width:
        h = max(1, round(im.height * width / im.width))
        im = im.resize((width, h), Image.LANCZOS)
    p = OUT / name
    im.save(p, optimize=True)
    print(f'  {name:28} {im.width}×{im.height}  {p.stat().st_size // 1024} КБ')


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    print('иконка (плитка со знаком):')
    icon = icon_tile(SRC / 'YOOMP-icon-transparent.png')
    for w, n in ((512, 'icon-512.png'), (192, 'icon-192.png'),
                 (180, 'apple-touch-icon.png'), (32, 'icon-32.png')):
        save(icon, n, w)

    # Обратный вариант: лаймовая плитка с чёрным знаком. Нужен на тёмных
    # подложках — шапка лендинга плывёт поверх кадра, и чёрная плитка там
    # просто исчезает. Цвета меняются местами, геометрия та же.
    print('иконка обратная (для тёмных подложек):')
    inv = icon.copy()
    ip = inv.load()
    for y in range(inv.height):
        for x in range(inv.width):
            r, g, b, a = ip[x, y]
            if a == 0:
                continue
            # Насколько пиксель лаймовый — столько же его будет чёрным.
            t = max(0.0, min(1.0, (g - INK[1]) / (LIME[1] - INK[1])))
            ip[x, y] = (
                int(round(LIME[0] + t * (INK[0] - LIME[0]))),
                int(round(LIME[1] + t * (INK[1] - LIME[1]))),
                int(round(LIME[2] + t * (INK[2] - LIME[2]))),
                a,
            )
    save(inv, 'icon-invert-192.png', 192)
    save(inv, 'icon-invert-64.png', 64)

    print('надпись лаймом на прозрачном:')
    word = lime_on_transparent(SRC / 'YOOMP-wordmark-lime-on-black.png')
    save(word, 'wordmark.png', 720)
    save(word, 'wordmark-small.png', 240)

    print('лок-ап:')
    lock = lime_on_transparent(SRC / 'YOOMP-lockup-lime-on-black.png')
    save(lock, 'lockup.png', 960)

    # Карточка для мессенджеров и соцсетей. Фон сплошной: прозрачность там
    # разворачивается в белое, и лаймовый знак на белом теряет весь контраст.
    print('карточка ссылки:')
    og = Image.new('RGBA', (1200, 630), (*INK, 255))
    mark = lock.copy()
    mark.thumbnail((820, 300), Image.LANCZOS)
    og.alpha_composite(mark, ((1200 - mark.width) // 2, (630 - mark.height) // 2))
    save(og.convert('RGB').convert('RGBA'), 'og.png')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
