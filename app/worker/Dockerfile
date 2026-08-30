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
# Оба кэша весов — в общий каталог образа, а не в домашний. Прогрев идёт от
# root, а работает воркер от carswap: с домашним каталогом веса легли бы
# в /root и рабочему пользователю остались недоступны. На боевом контуре
# интернета у воркера нет, и он полез бы качать их заново — то есть не
# запустился бы вовсе.
ENV TORCH_HOME=/opt/models \
    XDG_CACHE_HOME=/opt/models \
    HOME=/opt/models \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv
COPY requirements.txt ./
# Колёса torch берутся из индекса CPU, а не из PyPI по умолчанию.
#
# По умолчанию torch тянет за собой полный набор библиотек CUDA — почти пять
# гигабайт кода для видеокарты. Видеокарты на боевой машине нет и не будет:
# силуэт и детектор номера считаются на процессоре, это измерялось. На общем
# сервере эти пять гигабайт — чужое место на диске и лишние минуты сборки у
# каждого, кто выкатывается после нас.
#
# Индекс указан ТОЛЬКО для torch и torchvision. Остальные пакеты идут с PyPI:
# индекс CPU их не содержит, и общий --index-url сломал бы установку.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu \
        torch==2.8.0 torchvision==0.23.0 \
 && pip install --no-cache-dir -r requirements.txt

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
# uid 1000 — тот же, что у пользователя node в образе приложения.
#
# Приложение и воркер делят ОДИН том с кадрами: приложение кладёт снимок,
# воркер его читает и кладёт рядом рендеры. Docker отдаёт новый том тому
# пользователю, чей контейнер смонтировал его первым, и при разных uid второй
# получает отказ в правах. Ловится это не при сборке и не при старте, а на
# первой загрузке кадра — сообщением «сохранить кадр сейчас не получилось»,
# которое читается как временный сбой.
RUN useradd --system --uid 1000 --shell /usr/sbin/nologin carswap \
 && mkdir -p /var/lib/carswap/storage \
 && chown -R carswap /var/lib/carswap \
 && chown -R carswap /opt/models
USER carswap

CMD ["python3", "/srv/worker/main.py"]
