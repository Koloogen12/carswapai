"""
Класс A на реальных кадрах — с обученной сетью вместо эвристик.

ЧТО ИМЕННО ПРОВЕРЯЕТСЯ. До обучения перекраска давала крап: маска краски
строилась кластеризацией цвета, решала по каждому пикселю отдельно и
промахивалась на бликах и в тенях. Сеть выделяет краску как поверхность.
Вопрос ровно один — исчез ли крап.

Второй вопрос, не менее важный: остался ли ГОСНОМЕР нетронутым. Своего
детектора номера нет, но сеть не относит номер к краске — значит перекраска
по маске краски его не задевает. Здесь это проверяется измерением, а не
рассуждением: сравниваем пиксели в области, которую сеть назвала номером.

Запуск на поде:  python3 eval_classa.py
"""
from __future__ import annotations

import argparse
import pathlib
import sys

import cv2
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

SKUS = [
    ('KPMF K75400 сатин чёрный', (22.0, 0.4, -0.6)),
    ('Hexis HX20 глянец синий',  (34.0, 12.0, -41.0)),
    ('Avery SW900 сатин медь',   (46.0, 24.0, 31.0)),
]


def speckle(mask: np.ndarray) -> float:
    """
    Насколько маска дырявая.

    Крап — это множество мелких дыр внутри поверхности. Меряем как долю
    площади, которая закрывается смыканием: у сплошной маски она близка к
    нулю, у крапчатой заметна. Число сравнимо между прогонами, и именно оно
    отличает «поверхность» от «облака точек».
    """
    if (mask > 0).sum() == 0:
        return 0.0
    k = np.ones((9, 9), np.uint8)
    closed = cv2.morphologyEx((mask > 0).astype(np.uint8), cv2.MORPH_CLOSE, k)
    holes = int(closed.sum()) - int((mask > 0).sum())
    return holes / max(int(closed.sum()), 1)


def coverage(m: dict) -> float:
    """
    Какую долю машины мы вообще объяснили.

    Дырявость меряет дыры ВНУТРИ маски и молчит о главном: покрывает ли маска
    весь кузов. На реальных кадрах вышло, что нет — перекрашивался перёд, а
    зад оставался прежнего цвета, и машина выглядела двухцветной. Числом это
    не ловилось, поймалось глазами.

    Считаем так: сколько площади силуэта закрыто хоть каким-нибудь классом.
    Всё, что не закрыто, — это кузов, который сеть не увидела, и он останется
    исходного цвета.
    """
    # Знаменатель — НЕЗАВИСИМЫЙ силуэт от другой сети. Считать по своему же
    # объединению частей бессмысленно: доля всегда выйдет стопроцентной,
    # какого бы качества части ни были. Первая версия этой мерки именно так
    # и врала — показывала 98–99% на кадрах, где полмашины не покрашено.
    car = m.get('car_ref')
    if car is None or (car > 0).sum() == 0:
        return float('nan')
    known = np.zeros_like(car)
    for k in ('paint', 'glass', 'wheel', 'light', 'mirror', 'grille',
              'plate', 'body_other'):
        if k in m:
            known[m[k] > 0] = 255
    return float(((known > 0) & (car > 0)).sum()) / max(int((car > 0).sum()), 1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--scale', type=float, default=0.4)
    ap.add_argument('--out', default='out/seg/classa-net.png')
    a = ap.parse_args()

    from pipeline import segment, color, composite, qa, parts
    print('сеть частей:', 'есть' if parts.available() else 'НЕТ — идут эвристики')

    rows = []
    print(f'\n{"кадр":30s} {"краска":>7s} {"дырявость":>10s} {"покрытие":>9s} '
          f'{"вне маски":>10s} {"номер цел":>10s}')
    print('-' * 82)

    for p in sorted(pathlib.Path('fixtures/dev-set').glob('*.png')):
        img = cv2.imread(str(p))
        img = cv2.resize(img, None, fx=a.scale, fy=a.scale)
        m = segment.segment(img)
        body = m['body']
        if (body > 0).mean() < 0.02:
            print(f'{p.stem:30s} краски не найдено')
            continue

        tiles = [img]
        outside_ok, plate_ok = True, '—'
        for _, lab in SKUS:
            edited = color.recolor(img, body, lab)
            out = composite.composite(img, edited, body, None, m.get('plate'))
            r = qa.report(img, out, body, m.get('plate'))
            outside_ok &= bool(r['outside_untouched'])
            # Номер: сеть его выделила — сравниваем пиксели напрямую.
            pl = m.get('plate')
            if pl is not None and (pl > 0).any():
                same = bool((img[pl > 0] == out[pl > 0]).all())
                plate_ok = 'да' if same else 'НЕТ'
            tiles.append(out)

        cov = coverage(m)
        cov_s = '   н/д' if cov != cov else f'{100*cov:7.1f}%'
        print(f'{p.stem:30s} {100*(body>0).mean():6.1f}% {speckle(body):9.3f} '
              f'{cov_s:>9s} {"ок" if outside_ok else "ПРОВАЛ":>10s} {plate_ok:>10s}')
        rows.append(np.hstack(tiles))

    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), np.vstack([cv2.resize(r, None, fx=0.34, fy=0.34) for r in rows]))
    print(f'\nкартинка: {out}')
    print('оригинал | сатин чёрный | глянец синий | сатин медь')
    print('\nДырявость: 0,000 — сплошная поверхность; больше 0,05 — крап.')
    print('Покрытие: доля силуэта, объяснённая хоть каким-то классом. Меньше 95% '
          'означает, что часть кузова останется исходного цвета — и машина выйдет '
          'двухцветной.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
