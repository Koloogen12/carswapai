"""
Свести разные наборы в один, в нашем словаре из восьми классов.

ЗАЧЕМ СВОДИТЬ, А НЕ УЧИТЬ ПО ОЧЕРЕДИ. Онтологии у наборов разные: один
различает левую и правую дверь, другой не различает, зато знает крышу, крыло
и госномер. Учить на объединении можно только приведя всё к одному словарю —
иначе сеть получает противоречивые метки на одинаковых пикселях.

ВЫХОД. Тот же формат, что у carparts-seg: YOLO-полигоны, `images/<split>` и
`labels/<split>`. Так обучение читает объединение тем же кодом, что и
исходный набор, и не появляется второй загрузчик, который надо отдельно
отлаживать.

ЧТО ЗДЕСЬ СОЗНАТЕЛЬНО НЕ ДЕЛАЕТСЯ. Кадры не перемешиваются между train и val
случайно: разбиение берётся из исходных наборов. Иначе один и тот же
автомобиль мог бы попасть и в обучение, и в проверку — и валидация показала
бы качество выше настоящего.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import vocab  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATASETS = ROOT / 'datasets'


def base_name(stem: str) -> str:
    """
    Имя ИСХОДНОГО снимка, без следов размножения.

    Roboflow называет копии `Снимок_png.rf.<хеш>`: один и тот же кадр в
    нескольких поворотах. Обычно он размножает уже ПОСЛЕ разбиения, и тогда
    всё честно — но проверено, что не всегда: на 998 снимках один разъехался
    между обучением и проверкой. Такой кадр валидацию завышает, потому что
    сеть видела его же в обучении, пусть и повёрнутым.
    """
    for marker in ('_png.rf.', '_jpg.rf.', '_jpeg.rf.', '.rf.'):
        if marker in stem:
            return stem.split(marker, 1)[0]
    return stem


def regroup(out: pathlib.Path, val_frac: float = 0.15, test_frac: float = 0.10
            ) -> dict[str, int]:
    """
    Переразбить набор по ИСХОДНЫМ снимкам, а не по файлам.

    ЗАЧЕМ. Измерено на carparts-seg: 3156 файлов обучения — это всего 579
    уникальных фотографий, остальное их повороты. А в проверке из 295
    уникальных 290 есть и в обучении. То есть валидация на 98% шла по кадрам,
    которые сеть уже видела, и её число не измеряло ничего.

    Разбиение авторов набора здесь не сохраняем — именно оно и сломано.
    Группируем все копии одного снимка и отправляем группу целиком в один
    срез. Срез выбирается хешем имени, а не случайно: тот же набор обязан
    давать то же разбиение, иначе два прогона несравнимы.
    """
    import hashlib
    groups: dict[str, list[tuple[pathlib.Path, pathlib.Path]]] = {}
    for split in ('train', 'val', 'test'):
        d = out / 'images' / split
        if not d.exists():
            continue
        for f in d.iterdir():
            lbl = out / 'labels' / split / (f.stem + '.txt')
            groups.setdefault(base_name(f.stem), []).append((f, lbl))

    def where(name: str) -> str:
        h = int(hashlib.sha256(name.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
        if h < test_frac:
            return 'test'
        if h < test_frac + val_frac:
            return 'val'
        return 'train'

    tmp = out.parent / (out.name + '_regroup')
    shutil.rmtree(tmp, ignore_errors=True)
    counts = {'train': 0, 'val': 0, 'test': 0}
    uniq = {'train': 0, 'val': 0, 'test': 0}
    for name, files in groups.items():
        split = where(name)
        uniq[split] += 1
        (tmp / 'images' / split).mkdir(parents=True, exist_ok=True)
        (tmp / 'labels' / split).mkdir(parents=True, exist_ok=True)
        for img, lbl in files:
            shutil.move(str(img), tmp / 'images' / split / img.name)
            if lbl.exists():
                shutil.move(str(lbl), tmp / 'labels' / split / lbl.name)
            counts[split] += 1
    shutil.rmtree(out, ignore_errors=True)
    shutil.move(str(tmp), out)
    print('  уникальных снимков: ' + ', '.join(f'{k}: {v}' for k, v in uniq.items()),
          flush=True)
    return counts


def leaked(out: pathlib.Path) -> dict[str, set[str]]:
    """
    Какие исходные снимки попали и в обучение, и в проверку.

    Возвращает, что выбросить из val и test. Выбрасываем именно оттуда, а не
    из train: обучение переживёт потерю кадра, а испорченная валидация врёт
    в нашу пользу — и мы этого не заметим.
    """
    def bases(split: str) -> set[str]:
        d = out / 'images' / split
        return {base_name(f.stem) for f in d.iterdir()} if d.exists() else set()

    train = bases('train')
    drop = {}
    for split in ('val', 'test'):
        common = train & bases(split)
        if common:
            drop[split] = common
    return drop


def drop_leaked(out: pathlib.Path) -> int:
    """Убрать пересечение. Возвращает число удалённых кадров."""
    n = 0
    for split, names in leaked(out).items():
        d = out / 'images' / split
        for f in list(d.iterdir()):
            if base_name(f.stem) in names:
                f.unlink()
                lbl = out / 'labels' / split / (f.stem + '.txt')
                lbl.unlink(missing_ok=True)
                n += 1
    return n


def _poly_line(cls: int, xy: list[float], w: int, h: int) -> str | None:
    """Полигон в строку YOLO: класс и нормированные координаты."""
    if len(xy) < 6:
        return None
    parts = []
    for i in range(0, len(xy) - 1, 2):
        x = min(max(xy[i] / w, 0.0), 1.0)
        y = min(max(xy[i + 1] / h, 0.0), 1.0)
        parts.append(f'{x:.6f} {y:.6f}')
    return f'{cls} ' + ' '.join(parts)


def from_coco(src: pathlib.Path, source: str, out: pathlib.Path,
              prefix: str) -> dict[str, int]:
    """Roboflow отдаёт COCO: по подкаталогу на срез, аннотации в _annotations.coco.json."""
    stats: dict[str, int] = {}
    for ann_file in sorted(src.rglob('_annotations.coco.json')):
        split = ann_file.parent.name
        split = {'valid': 'val', 'validation': 'val'}.get(split, split)
        if split not in ('train', 'val', 'test'):
            continue
        data = json.loads(ann_file.read_text())
        cats = {c['id']: c['name'] for c in data.get('categories', [])}
        imgs = {i['id']: i for i in data.get('images', [])}
        by_img: dict[int, list[str]] = {}

        for a in data.get('annotations', []):
            name = cats.get(a['category_id'])
            if name is None:
                continue
            try:
                cls = vocab.to_ours(source, name)
            except KeyError as e:
                # Незнакомая метка — остановка, а не пропуск: молча она уехала
                # бы в фон, и сеть научилась бы не видеть часть машины.
                raise SystemExit(str(e))
            if cls is None:
                continue
            im = imgs.get(a['image_id'])
            if not im:
                continue
            for seg in (a.get('segmentation') or []):
                if not isinstance(seg, list):
                    continue                     # RLE не разбираем
                line = _poly_line(cls, seg, im['width'], im['height'])
                if line:
                    by_img.setdefault(a['image_id'], []).append(line)

        (out / 'images' / split).mkdir(parents=True, exist_ok=True)
        (out / 'labels' / split).mkdir(parents=True, exist_ok=True)
        for img_id, lines in by_img.items():
            im = imgs[img_id]
            srcf = ann_file.parent / im['file_name']
            if not srcf.exists():
                continue
            stem = f'{prefix}_{pathlib.Path(im["file_name"]).stem}'
            shutil.copy2(srcf, out / 'images' / split / (stem + srcf.suffix))
            (out / 'labels' / split / (stem + '.txt')).write_text('\n'.join(lines))
            stats[split] = stats.get(split, 0) + 1
    return stats


def from_yolo(src: pathlib.Path, source: str, names: list[str],
              out: pathlib.Path, prefix: str) -> dict[str, int]:
    """carparts-seg уже в YOLO — переносим, переставляя индексы в наш словарь."""
    stats: dict[str, int] = {}
    for split in ('train', 'val', 'test'):
        imgs = src / 'images' / split
        lbls = src / 'labels' / split
        if not imgs.exists():
            continue
        (out / 'images' / split).mkdir(parents=True, exist_ok=True)
        (out / 'labels' / split).mkdir(parents=True, exist_ok=True)
        for ip in sorted(imgs.iterdir()):
            lp = lbls / (ip.stem + '.txt')
            if not lp.exists():
                continue
            kept = []
            for line in lp.read_text().splitlines():
                p = line.split()
                if len(p) < 7:
                    continue
                try:
                    cls = vocab.to_ours(source, names[int(p[0])])
                except (KeyError, IndexError) as e:
                    raise SystemExit(f'{source}: {e}')
                if cls is None:
                    continue
                kept.append(f'{cls} ' + ' '.join(p[1:]))
            if not kept:
                continue
            stem = f'{prefix}_{ip.stem}'
            shutil.copy2(ip, out / 'images' / split / (stem + ip.suffix))
            (out / 'labels' / split / (stem + '.txt')).write_text('\n'.join(kept))
            stats[split] = stats.get(split, 0) + 1
    return stats


CARPARTS_ORDER = [
    'back_bumper', 'back_door', 'back_glass', 'back_left_door', 'back_left_light',
    'back_light', 'back_right_door', 'back_right_light', 'front_bumper',
    'front_door', 'front_glass', 'front_left_door', 'front_left_light',
    'front_light', 'front_right_door', 'front_right_light', 'hood',
    'left_mirror', 'object', 'right_mirror', 'tailgate', 'trunk', 'wheel']


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(DATASETS / 'merged'))
    a = ap.parse_args()
    out = pathlib.Path(a.out)
    shutil.rmtree(out, ignore_errors=True)

    total: dict[str, int] = {}
    def add(name: str, st: dict[str, int]):
        for k, v in st.items():
            total[k] = total.get(k, 0) + v
        print(f'  {name:22s} ' + ', '.join(f'{k}: {v}' for k, v in sorted(st.items()))
              or f'  {name:22s} пусто', flush=True)

    cp = DATASETS / 'carparts-seg'
    if cp.exists():
        add('carparts-seg', from_yolo(cp, 'carparts-seg', CARPARTS_ORDER, out, 'cp'))

    hitl = DATASETS / 'humans-in-the-loop'
    if hitl.exists():
        add('humans-in-the-loop', from_coco(hitl, 'humans-in-the-loop', out, 'hl'))
    else:
        print('  humans-in-the-loop     НЕТ — без него нет госномера, а он и есть '
              'причина второго захода', flush=True)

    if not total:
        print('\nНечего сводить.', flush=True)
        return 1

    # Переразбиение по исходным снимкам. Делается ВСЕГДА, а не когда вспомнили:
    # разбиение из наборов проверено и оказалось сломанным.
    print('\n── переразбиение по исходным снимкам ──', flush=True)
    total = regroup(out)
    assert not leaked(out), 'после переразбиения утечка невозможна — это ошибка в коде'
    print('  файлов: ' + ', '.join(f'{k}: {v}' for k, v in total.items()), flush=True)
    print(f'\nИтого: ' + ', '.join(f'{k}: {v}' for k, v in sorted(total.items())), flush=True)
    print(f'Словарь: {vocab.NAMES}', flush=True)
    print(f'Дальше: python3 train/parts_train.py --data {out} --vocab ours '
          f'--device cuda --batch 8 --epochs 12', flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
