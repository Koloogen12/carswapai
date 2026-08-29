# Воркер примерки: отдельный образ, не тот же, что у приложения.
#
# Почему отдельно. У приложения Node и Next, у воркера Python, torch и
# opencv — это сотни мегабайт, которые приложению не нужны ни разу. Один
# образ на двоих раздул бы выкладку приложения втрое и заставлял бы
# пересобирать его при каждой правке пайплайна.
FROM python:3.11-slim-bookworm

# Веса детектора номера и силуэта скачиваются при сборке, а НЕ при первом
# запуске: на боевом контуре у воркера нет выхода в интернет, и «скачает
# сам при старте» означало бы, что он не стартует вовсе.
ENV TORCH_HOME=/opt/models \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Прогрев весов в слой образа.
RUN python3 -c "\
from torchvision.models.detection import maskrcnn_resnet50_fpn_v2, MaskRCNN_ResNet50_FPN_V2_Weights;\
maskrcnn_resnet50_fpn_v2(weights=MaskRCNN_ResNet50_FPN_V2_Weights.DEFAULT)" \
 && python3 -c "\
from open_image_models import create_detector;\
create_detector('yolo-v9-t-512-license-plate-end2end')"

# Проверка сборки, а не пожелание. Раньше здесь стояло `|| true`, и образ
# собирался с неработающим детектором номера: пакет ставился, функция в нём
# отсутствовала, воркер падал на первом же задании. Пусть лучше не соберётся.
RUN python3 -c "\
from open_image_models import create_detector;\
assert create_detector, 'детектор номера не собрался'" 

COPY . /srv/worker/
ENV PYTHONPATH=/srv/worker

# Не под root: воркер ходит в интернет к шлюзу и работает с чужими файлами.
RUN useradd --system --uid 10001 carswap \
 && mkdir -p /var/lib/carswap/storage \
 && chown -R carswap /var/lib/carswap
USER carswap

CMD ["python3", "/srv/worker/main.py"]
