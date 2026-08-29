#!/usr/bin/env python3
"""
Прогон класса A по набору кадров.

Гейт волны 1: десять реальных фото с разными ракурсами и освещением,
по каждой категории. Смотреть глазами. Не проходит — не идти дальше.
"""
import sys, json, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))

import cv2
import numpy as np
from pipeline import color, composite, qa, route
from experiment_specular import body_mask

SRC = pathlib.Path('fixtures/dev-set')
OUT = pathlib.Path('out'); OUT.mkdir(exist_ok=True)

# Артикулы с ИЗМЕРЕННЫМ цветом свотча, как в каталоге.
SKUS = [
    ('K75407', 'Сатин-хром тёмный', 'satin', (38.0, -0.8, -1.4)),
    ('970-070', 'Матовый графит',   'matte', (31.0, -0.2, -1.0)),
    ('HX20-LG', 'Глянец лагуна',    'gloss', (41.0, -18.0, -14.0)),
    ('GAL-OL',  'Глянец хаки',      'gloss', (43.0, -6.0, 18.0)),
]


def mean_L(img, mask):
    """
    Средняя светлота области в шкале CIELAB 0..100.

    OpenCV на 8-битном входе отдаёт L в 0..255 — сравнивать её напрямую
    с измеренным L свотча (0..100) нельзя. На этом и поймались: чёрная
    машина показывала L=37 и выглядела светлее сатин-хрома с L=38,
    то есть маршрутизация уводила заведомо невозможный случай в класс A.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    sel = mask > 0
    raw = float(lab[..., 0][sel].mean()) if sel.any() else 128.0
    return raw * 100.0 / 255.0


def main(names):
    rows = []
    for name in names:
        img = cv2.imread(str(SRC / f'{name}.png'))
        if img is None:
            continue
        img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        m = body_mask(img)
        srcL = mean_L(img, m)

        for sku, label, finish, lab in SKUS:
            d = route.route('gloss', finish, srcL, lab[0], 'film')
            if d.cls != 'A':
                rows.append(dict(photo=name, sku=sku, cls='B', reason=d.reason,
                                 cost=d.cost_kopecks, qa=None))
                continue
            edited = color.recolor(img, m, lab, keep_specular=True)
            res = composite.composite(img, edited, m)
            r = qa.report(img, res, m)
            rows.append(dict(photo=name, sku=sku, cls='A', reason=d.reason,
                             cost=d.cost_kopecks, qa=r['passed'],
                             changed=r['changed_ratio']))
            for light in color.LIGHTS:
                cv2.imwrite(str(OUT / f'{name}__{sku}__{light}.jpg'),
                            color.relight(res, light),
                            [int(cv2.IMWRITE_JPEG_QUALITY), 88])

    a = [r for r in rows if r['cls'] == 'A']
    b = [r for r in rows if r['cls'] == 'B']
    print(f'{"кадр":32s} {"артикул":10s} {"класс":6s} {"QA":6s} причина')
    for r in rows:
        print(f'{r["photo"]:32s} {r["sku"]:10s} {r["cls"]:6s} '
              f'{str(r["qa"]) if r["qa"] is not None else "—":6s} {r["reason"][:52]}')
    total = len(rows)
    print(f'\nвсего связок: {total} · класс A: {len(a)} ({100*len(a)//max(total,1)}%) · класс B: {len(b)}')
    if a:
        print(f'QA класса A пройден: {sum(1 for r in a if r["qa"])}/{len(a)}')
    cost_a = sum(r['cost'] for r in a) * 3      # три света бесплатны, но считаем проходы
    cost_b = sum(r['cost'] for r in b)
    print(f'себестоимость набора: класс A {cost_a/100:.2f} ₽ · класс B {cost_b/100:.2f} ₽')
    (OUT / 'class_a_report.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main(sys.argv[1:] or ['01-silver-sun-reflections', '05-overcast-side',
                          '11-snow-white-balance', '12-occluded-cluttered',
                          '02-black-crushed-shadows'])
