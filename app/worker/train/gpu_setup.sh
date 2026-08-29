#!/usr/bin/env bash
# Обучение сегментации частей на арендованном GPU.
#
# Ставится на чистую машину с Ubuntu и драйвером NVIDIA. Всё, что нужно —
# запустить этот файл; он сам поставит зависимости, заберёт датасет, обучит
# и сложит веса в carparts.pt рядом с собой.
#
# ЧТО УЕЗЖАЕТ ЗА КОНТУР: только публичный размеченный датасет чужих машин.
# Ни одной фотографии клиента здесь нет и быть не должно — эта машина
# арендована у иностранного провайдера, и ПД туда не отправляются.
set -euo pipefail
# В app/worker, а не в train/: parts_train.py ищет датасет по ROOT.parent,
# то есть в app/worker/datasets. Из-за cd в собственный каталог скрипт
# распаковывал в train/datasets, а обучение смотрело в другое место.
cd "$(dirname "$0")/.."

echo "── зависимости ──"
pip install -q --upgrade pip
pip install -q torch torchvision numpy pillow

python3 - <<'PY'
import torch
assert torch.cuda.is_available(), 'CUDA не видна — проверь драйвер и образ'
print('GPU:', torch.cuda.get_device_name(0),
      f'{torch.cuda.get_device_properties(0).total_memory/2**30:.0f} ГБ')
PY

echo "── датасет ──"
if [ ! -d datasets/carparts-seg ]; then
  mkdir -p datasets
  curl -L -o /tmp/cp.zip \
    https://github.com/ultralytics/assets/releases/download/v0.0.0/carparts-seg.zip
  # Через python, а не unzip: в образах runpod его нет, а python есть всегда —
  # он и так нужен для обучения.
  # Архив несёт верхний каталог, и он бывает разным; python extractall его,
  # в отличие от unzip у ultralytics, не срезает — нормализуем сами.
  python3 - <<'EOF'
import zipfile, os, glob, shutil
zipfile.ZipFile('/tmp/cp.zip').extractall('datasets/_x')
inner = glob.glob('datasets/_x/*/images') or glob.glob('datasets/_x/images')
shutil.rmtree('datasets/carparts-seg', ignore_errors=True)
shutil.move(os.path.dirname(inner[0]), 'datasets/carparts-seg')
shutil.rmtree('datasets/_x', ignore_errors=True)
EOF
  rm -f /tmp/cp.zip
  # Конфиг из архива несёт заголовок AGPL-3.0 и нам не нужен: список классов
  # и раскладка каталогов зашиты в parts_train.py. Сами данные под CC BY 4.0,
  # это разные лицензии — см. DATASETS.md.
  rm -f datasets/carparts-seg/carparts-seg.yaml
fi
find datasets/carparts-seg -name '*.jpg' | wc -l | xargs echo "  кадров:"

echo "── обучение ──"
# batch 8 влезает в 24 ГБ на 640px; на 16 ГБ поставь 4.
BATCH=${BATCH:-8}
EPOCHS=${EPOCHS:-12}
python3 -u train/parts_train.py --device cuda --batch "$BATCH" --epochs "$EPOCHS" \
        --size 640 --out models/carparts.pt

echo
echo "готово. забирай веса:"
echo "  scp <этот-сервер>:$(pwd)/models/carparts.pt app/worker/models/carparts.pt"
