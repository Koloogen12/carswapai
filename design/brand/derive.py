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

from PIL import Image, ImageFilter

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


def wordmark_with_cuts(src: pathlib.Path, close: int = 15,
                       invert: bool = False) -> Image.Image:
    """Надпись лаймом, срезы внутри букв — чёрные, поле вокруг прозрачное.

    Отличить фон от среза по цвету нельзя: и то и другое чёрное. По связности
    тоже нельзя — срез не заперт внутри буквы, он проходит её насквозь и
    хвостами выходит наружу, то есть соединён с фоном. Первая попытка залить
    фон от края съела срезы вместе с полем.

    Работает морфологическое замыкание: лаймовая маска расширяется на радиус
    заведомо больше ширины среза и сжимается обратно. Срез при этом
    затягивается, и получается СИЛУЭТ букв без прорезей. Дальше просто:
    внутри силуэта пиксель либо лайм, либо чёрный срез; снаружи — прозрачно.

    Хвосты срезов, торчащие за буквы, при этом теряются. Это осознанно: на
    кегле шапки они всё равно неразличимы, а тащить их пришлось бы вместе с
    чёрной подложкой под всей надписью.

    Радиус подобран сравнением, а не на глаз: на 31 замыкание затягивает не
    только срез, но и просветы МЕЖДУ буквами, и они заливаются чёрным — «OO»
    слипается в кляксу. На 9 срез почти не закрывается и остаётся дырой. 15
    затягивает срез и оставляет буквы раздельными.
    """
    im = Image.open(src).convert('RGB')
    w, h = im.size
    sp = im.load()

    lime = Image.new('L', (w, h), 0)
    lp = lime.load()
    for y in range(h):
        for x in range(w):
            lp[x, y] = 255 if coverage(sp[x, y]) >= 0.5 else 0

    silhouette = lime.filter(ImageFilter.MaxFilter(close)).filter(ImageFilter.MinFilter(close))

    out = Image.new('RGBA', (w, h))
    op, sq = out.load(), silhouette.load()
    for y in range(h):
        for x in range(w):
            if not sq[x, y]:
                op[x, y] = (0, 0, 0, 0)
                continue
            t = coverage(sp[x, y])
            # invert — для СВЕТЛЫХ подложек. Лайм на белой карточке кабинета
            # даёт контраст около 1.4:1 — имя продукта читается как бледное
            # пятно. Меняем местами: буквы чёрные, срезы лаймовые. Ровно та же
            # логика, что у иконки, которая на светлом чёрная с лаймовым знаком.
            a, b = (LIME, INK) if invert else (INK, LIME)
            op[x, y] = (
                int(round(a[0] + t * (b[0] - a[0]))),
                int(round(a[1] + t * (b[1] - a[1]))),
                int(round(a[2] + t * (b[2] - a[2]))),
                255,
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

    # Надпись со срезами — та, что стоит в шапках. Срезы чёрные, как в макете.
    print('надпись со срезами:')
    cuts = wordmark_with_cuts(SRC / 'YOOMP-wordmark-lime-on-black.png')
    save(cuts, 'wordmark-cuts.png', 720)
    save(cuts, 'wordmark-cuts-240.png', 240)

    print('надпись для светлых подложек:')
    dark = wordmark_with_cuts(SRC / 'YOOMP-wordmark-lime-on-black.png', invert=True)
    save(dark, 'wordmark-dark.png', 720)
    save(dark, 'wordmark-dark-240.png', 240)

    print('лок-ап:')
    lock = lime_on_transparent(SRC / 'YOOMP-lockup-lime-on-black.png')
    save(lock, 'lockup.png', 960)

    # Карточка ссылки и обложка для соцсетей — из готового баннера, если он
    # положен в source. Иначе собирается из лок-апа: без баннера ссылка всё
    # равно не должна уходить без превью.
    #
    # Вписываем целиком, а не обрезаем под пропорцию: у баннера сверху знак, а
    # снизу строка «машина клиента в любом артикуле», и обрезка съедает то или
    # другое. Поля чёрные — тот же фон, что у самого баннера, стыка не видно.
    print('карточка ссылки:')
    cover = SRC / 'YOOMP-cover.png'
    og = Image.new('RGBA', (1200, 630), (*INK, 255))
    if cover.exists():
        art = Image.open(cover).convert('RGBA')
        art.thumbnail((1200, 630), Image.LANCZOS)
        save(art, 'cover.png')          # родная пропорция: обложка сообщества
    else:
        art = lock.copy()
        art.thumbnail((820, 300), Image.LANCZOS)
    og.alpha_composite(art, ((1200 - art.width) // 2, (630 - art.height) // 2))
    save(og.convert('RGB').convert('RGBA'), 'og.png')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
