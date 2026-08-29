"""
Наш словарь частей автомобиля и отображение в него чужих разметок.

ПОЧЕМУ НЕ УЧИМ 23 КЛАССА ИСХОДНОГО НАБОРА. Пайплайну не нужно знать, левая
это задняя дверь или правая: плёнка на них ложится одинаково, цена считается
по зоне из прайса, а не по стороне. Каждый лишний класс дробит и без того
небольшую выборку. Восемь классов вместо двадцати трёх — это втрое больше
примеров на класс при тех же данных.

Словарь выведен из операций, а не из анатомии. Ровно то, что различает
пайплайн:

  paint   — куда ложится плёнка. Перекраска и PPF работают здесь.
  glass   — куда ложится тонировка. Включая БОКОВЫЕ окна, которых в
            carparts-seg нет вовсе, а тонировка без них бессмысленна.
  wheel   — диски: отдельная операция и отдельный артикул.
  light   — фары и фонари. Плёнка на них не клеится, а по цвету они
            неотличимы от светлой краски — отсюда крап на результате.
  mirror  — зеркала: часто оклеиваются отдельно и стоят отдельных денег.
  grille  — решётка: мелкая фактура, перекрашивать нельзя.
  plate   — ГОСНОМЕР. Ради него всё и затевалось: свой детектор дал ложные
            срабатывания на дверных ручках и был снят, из-за чего класс A
            сейчас отказывает на любом кадре с видимым номером.
  body_other — всё прочее на машине: пороги, стойки, уплотнители. Отдельный
            класс, а не фон: иначе сеть учится звать это фоном и рвёт силуэт.

СОВМЕЩЕНИЕ ДВУХ ОНТОЛОГИЙ. Наборы размечены по-разному, и это не мешает —
мешало бы обратное. carparts-seg различает стороны, Humans in the Loop не
различает, зато знает крышу, крыло, четверть, порог, решётку и номер.
Отображение сводит оба к нашему словарю; что не отобразилось — выбрасывается
явным списком, а не молча, иначе чужой класс тихо уехал бы в фон.
"""
from __future__ import annotations

# Порядок фиксирован: индекс класса едет в веса.
NAMES = ['paint', 'glass', 'wheel', 'light', 'mirror', 'grille', 'plate', 'body_other']
NUM_CLASSES = len(NAMES) + 1          # +1 — фон, его требует Mask R-CNN
IDX = {n: i for i, n in enumerate(NAMES)}


# ── carparts-seg (Ultralytics / car-seg, CC BY 4.0) ────────────────────────
# 23 класса. Стёкол здесь только два — лобовое и заднее; боковых нет,
# и это главная причина, по которой одного этого набора мало.
CARPARTS_SEG = {
    'back_bumper': 'paint',      'back_door': 'paint',
    'back_glass': 'glass',       'back_left_door': 'paint',
    'back_left_light': 'light',  'back_light': 'light',
    'back_right_door': 'paint',  'back_right_light': 'light',
    'front_bumper': 'paint',     'front_door': 'paint',
    'front_glass': 'glass',      'front_left_door': 'paint',
    'front_left_light': 'light', 'front_light': 'light',
    'front_right_door': 'paint', 'front_right_light': 'light',
    'hood': 'paint',             'left_mirror': 'mirror',
    'right_mirror': 'mirror',    'tailgate': 'paint',
    'trunk': 'paint',            'wheel': 'wheel',
    # 'object' — служебная метка набора, ни одного экземпляра в разметке.
    'object': None,
}

# ── Humans in the Loop, части (CC0 1.0) ────────────────────────────────────
# Ради этого набора всё и делается: здесь есть госномер и боковые окна.
HUMANS_IN_THE_LOOP = {
    'Windshield': 'glass',       'Back-windshield': 'glass',
    'Front-window': 'glass',     'Back-window': 'glass',
    'Front-door': 'paint',       'Back-door': 'paint',
    'Front-wheel': 'wheel',      'Back-wheel': 'wheel',
    'Front-bumper': 'paint',     'Back-bumper': 'paint',
    'Headlight': 'light',        'Tail-light': 'light',
    'Hood': 'paint',             'Trunk': 'paint',
    'License-plate': 'plate',    'Mirror': 'mirror',
    'Roof': 'paint',             'Grille': 'grille',
    'Rocker-panel': 'body_other', 'Quarter-panel': 'paint',
    'Fender': 'paint',
}

# ── Intelec AI (Kaggle, коммерческое использование разрешено) ──────────────
# Семантические маски, пять меток. 'car' — вся машина целиком, для нашего
# словаря бесполезен: он не различает краску и стекло, а именно это и нужно.
INTELEC_AI = {
    'car': None,
    'wheel': 'wheel',
    'light': 'light',
    'windows': 'glass',
}

SOURCES = {
    'carparts-seg': CARPARTS_SEG,
    'humans-in-the-loop': HUMANS_IN_THE_LOOP,
    'intelec-ai': INTELEC_AI,
}


def to_ours(source: str, label: str) -> int | None:
    """
    Индекс нашего класса, или None — если метку сознательно выбрасываем.

    Незнакомая метка — это ошибка, а не повод промолчать: молчание отправило
    бы чужой класс в фон, и сеть научилась бы не видеть часть машины.
    """
    table = SOURCES[source]
    if label not in table:
        raise KeyError(
            f'{source}: метка «{label}» не отображена в наш словарь. '
            f'Допишите её в vocab.py явно — молча в фон её отправлять нельзя.')
    ours = table[label]
    return None if ours is None else IDX[ours]


def coverage(source: str) -> str:
    """Сводка отображения — чтобы при добавлении набора было видно, что ушло."""
    table = SOURCES[source]
    kept = {}
    for src, dst in table.items():
        if dst is None:
            kept.setdefault('— выброшено —', []).append(src)
        else:
            kept.setdefault(dst, []).append(src)
    return '\n'.join(f'  {k:14s} ← {", ".join(sorted(v))}' for k, v in sorted(kept.items()))
