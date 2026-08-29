"""
Забрать дополнительные размеченные наборы и свести их в наш словарь.

ЗАЧЕМ. carparts-seg (3156 кадров) не знает ни госномера, ни боковых стёкол.
Из-за первого класс A отказывает на любом кадре с видимым номером, а класс B
нельзя отправлять наружу — обезличивание не может закрасить то, чего не
находит. Из-за второго невозможна тонировка боковых окон.

ЧТО БЕРЁМ И НА КАКОМ ОСНОВАНИИ — лицензии проверены поимённо, разбор в
datasets/DATASETS.md:

  humans-in-the-loop   998 кадров, CC0 1.0 (общественное достояние).
                       Есть License-plate, Front-window, Back-window, Roof,
                       Grille, Fender, Quarter-panel. Ради него всё и делается.
  intelec-ai           211 кадров, своя лицензия, коммерческое использование
                       разрешено дословно. Уличная съёмка сбоку — ракурс, где
                       боковое стекло видно целиком.

АТРИБУЦИЯ обязательна для обоих и записана в train/parts_train.py.

Ключи — только из окружения:
  ROBOFLOW_API_KEY      — Settings → API Keys → Private API Key
  ~/.kaggle/access_token — Settings → API → Create New Token
"""
from __future__ import annotations

import argparse
import json
import os
import pathlib
import shutil
import sys
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATASETS = ROOT / 'datasets'

# Проект на Roboflow — зеркало набора Humans in the Loop в формате YOLO.
# Первоисточник под CC0 такую перезаливку разрешает, но атрибутировать надо
# Humans in the Loop, а не загрузившего.
RF_WORKSPACE = 'car-segmentation-iq9jj'
RF_PROJECT = 'car-parts-9vig8'


def _get(url: str, timeout: float = 60.0) -> bytes:
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return r.read()


def fetch_roboflow(out: pathlib.Path) -> pathlib.Path | None:
    key = os.environ.get('ROBOFLOW_API_KEY')
    if not key:
        print('  ROBOFLOW_API_KEY не задан — набор пропущен', flush=True)
        return None

    # Версию не зашиваем: у проекта их несколько, и брать «последнюю» надо
    # по факту, а не по памяти. Заодно это проверяет, что ключ рабочий.
    meta_url = (f'https://api.roboflow.com/{RF_WORKSPACE}/{RF_PROJECT}'
                f'?api_key={key}')
    try:
        meta = json.loads(_get(meta_url))
    except Exception as e:
        print(f'  Roboflow не ответил: {e}', flush=True)
        return None

    versions = (meta.get('project') or {}).get('versions')
    if isinstance(versions, int):
        version = versions
    else:
        vs = [v.get('id', '').rsplit('/', 1)[-1] for v in (versions or [])]
        vs = [int(v) for v in vs if str(v).isdigit()]
        if not vs:
            print('  у проекта нет ни одной версии — нечего скачивать', flush=True)
            return None
        version = max(vs)
    print(f'  версия {version}', flush=True)

    dl = (f'https://api.roboflow.com/{RF_WORKSPACE}/{RF_PROJECT}/{version}'
          f'/coco-segmentation?api_key={key}')
    link = json.loads(_get(dl)).get('export', {}).get('link')
    if not link:
        print('  ссылка на выгрузку не получена', flush=True)
        return None

    dest = out / 'humans-in-the-loop'
    shutil.rmtree(dest, ignore_errors=True)
    dest.mkdir(parents=True, exist_ok=True)
    tmp = out / '_hitl.zip'
    tmp.write_bytes(_get(link, timeout=600))
    with zipfile.ZipFile(tmp) as z:
        z.extractall(dest)
    tmp.unlink()
    n = len(list(dest.rglob('*.jpg'))) + len(list(dest.rglob('*.png')))
    print(f'  кадров: {n}', flush=True)
    return dest


def fetch_kaggle(out: pathlib.Path) -> pathlib.Path | None:
    token = pathlib.Path.home() / '.kaggle' / 'access_token'
    if not token.exists() and not os.environ.get('KAGGLE_API_TOKEN'):
        print('  токен Kaggle не найден — набор пропущен', flush=True)
        return None
    dest = out / 'intelec-ai'
    shutil.rmtree(dest, ignore_errors=True)
    dest.mkdir(parents=True, exist_ok=True)
    rc = os.system(
        f'kaggle datasets download -d intelecai/car-segmentation '
        f'-p {dest} --unzip 2>&1 | tail -3')
    if rc != 0:
        print('  kaggle-клиент не отработал (поставьте: pip install kaggle)', flush=True)
        return None
    n = len(list(dest.rglob('*.png'))) + len(list(dest.rglob('*.jpg')))
    print(f'  файлов: {n}', flush=True)
    return dest


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(DATASETS))
    a = ap.parse_args()
    out = pathlib.Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    print('── Humans in the Loop (CC0, есть госномер и боковые стёкла) ──', flush=True)
    hitl = fetch_roboflow(out)
    print('── Intelec AI (Kaggle) ──', flush=True)
    kg = fetch_kaggle(out)

    got = [p.name for p in (hitl, kg) if p]
    if not got:
        print('\nНи один набор не забран. Без госномера обучать заново незачем: '
              'ровно он и есть причина второго захода.', flush=True)
        return 1
    print(f'\nЗабрано: {", ".join(got)}', flush=True)
    print('Дальше: python3 train/merge_datasets.py', flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
