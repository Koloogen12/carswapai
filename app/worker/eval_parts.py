"""
Проверка обученной сети частей на реальных кадрах.

ЧИСЛО ПОТЕРИ НИЧЕГО НЕ ГОВОРИТ О ТОВАРНОМ ВИДЕ. 0,93 или 0,41 — это среднее
по пикселям на чужом наборе; клиент же смотрит на свою машину и видит либо
ровный кузов, либо крап. Поэтому здесь меряется то, что видно:

  · нашлась ли краска и сколько её — маска меньше 15% габарита означает, что
    сеть выделила кусок вместо кузова;
  · найден ли ГОСНОМЕР. Это блокирующий признак: без него примерка отказывает
    и кадр нельзя отправить наружу;
  · сколько частей вообще нашлось — если сеть видит только краску, значит
    остальные классы недоучены и тонировка работать не будет;
  · и главное — картинка, потому что маску нельзя принять по числу.

Запуск:  python3 eval_parts.py [--weights models/carparts.pt]
"""
from __future__ import annotations

import argparse
import pathlib
import sys
import time

import cv2
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

COLORS = {
    'paint':      (200, 120,   0),
    'glass':      (  0, 220, 220),
    'wheel':      (255,   0, 220),
    'light':      (  0, 165, 255),
    'mirror':     (180,   0, 255),
    'grille':     (120, 120, 120),
    'plate':      (  0,   0, 255),
    'body_other': ( 90, 200,  90),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--weights', default='models/carparts.pt')
    ap.add_argument('--scale', type=float, default=0.5)
    ap.add_argument('--out', default='out/seg/parts-net.png')
    a = ap.parse_args()

    import os
    os.environ['CSW_PARTS_WEIGHTS'] = a.weights
    from pipeline import parts
    if not parts.available():
        print(f'весов нет: {a.weights}')
        return 1

    src = sorted(pathlib.Path('fixtures/dev-set').glob('*.png'))
    rows, plate_found, tot = [], 0, 0
    hdr = f'{"кадр":30s} ' + ' '.join(f'{k[:6]:>7s}' for k in COLORS)
    print(hdr)
    print('-' * len(hdr))

    for p in src:
        img = cv2.imread(str(p))
        img = cv2.resize(img, None, fx=a.scale, fy=a.scale)
        t0 = time.time()
        m = parts.segment(img)
        dt = time.time() - t0
        tot += 1
        if (m['plate'] > 0).any():
            plate_found += 1

        car_area = max(int((m['car'] > 0).sum()), 1)
        cells = ' '.join(f'{100*(m[k]>0).sum()/car_area:6.1f}%' for k in COLORS)
        print(f'{p.stem:30s} {cells}   {dt:.1f}с')

        ov = np.zeros_like(img)
        for k, c in COLORS.items():
            ov[m[k] > 0] = c
        rows.append(np.hstack([img, cv2.addWeighted(img, 0.45, ov, 0.55, 0)]))

    print()
    print(f'госномер найден на {plate_found} кадрах из {tot}')
    if plate_found == 0:
        print('  ЭТО БЛОКИРУЕТ: без номера примерка отказывает, а кадр нельзя '
              'отправить во внешнюю модель')

    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), np.vstack([cv2.resize(r, None, fx=0.5, fy=0.5) for r in rows]))
    print(f'картинка: {out}')
    print('цвета: краска синяя, стёкла голубые, колёса розовые, фары оранжевые, '
          'зеркала фиолетовые, решётка серая, НОМЕР КРАСНЫЙ, прочее зелёное')
    return 0


if __name__ == '__main__':
    sys.exit(main())
