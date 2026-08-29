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
cd "$(dirname "$0")"

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
  unzip -q /tmp/cp.zip -d datasets/carparts-seg && rm /tmp/cp.zip
fi
find datasets/carparts-seg -name '*.jpg' | wc -l | xargs echo "  кадров:"

echo "── обучение ──"
# batch 8 влезает в 24 ГБ на 640px; на 16 ГБ поставь 4.
BATCH=${BATCH:-8}
EPOCHS=${EPOCHS:-12}
python3 -u parts_train.py --device cuda --batch "$BATCH" --epochs "$EPOCHS" \
        --size 640 --out carparts.pt

echo
echo "готово. забирай веса:"
echo "  scp <этот-сервер>:$(pwd)/carparts.pt app/worker/models/carparts.pt"
