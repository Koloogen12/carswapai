"""
Рабочий цикл: берёт задания из очереди и делает примерки.

ПОЧЕМУ ОТДЕЛЬНЫЙ ПРОЦЕСС, А НЕ ДЕЙСТВИЕ В ЗАПРОСЕ. Генерация занимает
25 секунд на кадр — измерено на живом ответе. Держать на этом HTTP-запрос
нельзя: менеджер закроет вкладку, вебхук Авито отвалится по таймауту в две
секунды, а деньги за начатую генерацию всё равно спишутся. Очередь на таблице
с `for update skip locked` уже есть в схеме, здесь только её потребитель.

ЧТО ЭТОТ ЦИКЛ ОБЯЗАН ГАРАНТИРОВАТЬ:

  · Ни одно задание не выполняется дважды. Держит уникальный dedupe_key
    и claim через skip locked — повтор в окне не тратит денег.
  · Арендатор выставляется по КАЖДОМУ заданию. Воркер обслуживает все точки,
    и запись результата обязана идти под претензией той точки, чьё задание.
  · Потолок расхода проверяется перед вызовом модели, а не после. Списывать
    деньги и потом обнаруживать, что лимит исчерпан, — поздно.
  · Отказ пишется в задание с причиной. Молчаливое исчезновение задачи
    неотличимо от «ещё считается», и точка будет ждать вечно.

Запуск:  python3 -m worker.main   (или worker/main.py из app/)
"""
from __future__ import annotations

import json
import os
import pathlib
import signal
import socket
import sys
import time
import traceback

import cv2
import numpy as np
import psycopg2
import psycopg2.extras

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from pipeline import classb, plate, silhouette  # noqa: E402
from pipeline.engines.openrouter import GatewayEngine  # noqa: E402

STORAGE = pathlib.Path(os.environ.get('STORAGE_ROOT', '/var/lib/carswap/storage'))
POLL_SECONDS = float(os.environ.get('CSW_WORKER_POLL', '2.0'))
BATCH = int(os.environ.get('CSW_WORKER_BATCH', '2'))
WORKER_ID = os.environ.get('CSW_WORKER_ID') or f'{socket.gethostname()}:{os.getpid()}'

_stop = False


def _sigterm(*_):
    """Останавливаемся между заданиями, а не посреди генерации: начатый вызов
    к модели уже оплачен, и бросать его — выбрасывать деньги."""
    global _stop
    _stop = True
    print('получен сигнал остановки — доработаю текущие задания', flush=True)


def connect():
    url = os.environ.get('DATABASE_URL')
    if not url:
        raise SystemExit('DATABASE_URL не задан')
    c = psycopg2.connect(url)
    c.autocommit = True
    return c


def as_tenant(cur, point_id: str, network_id: str | None = None):
    """Претензия арендатора на время работы с заданием — как withTenant()."""
    claims = {'app_role': 'worker', 'point_id': point_id}
    if network_id:
        claims['network_id'] = network_id
    cur.execute("select set_config('request.jwt.claims', %s, false)",
                (json.dumps(claims),))


def load_photo(path: str) -> np.ndarray | None:
    p = STORAGE / path.lstrip('/')
    if not p.exists():
        return None
    return cv2.imread(str(p))


def save_render(point_id: str, job_id: str, img: np.ndarray) -> str:
    """
    Кладём под точкой: сквозное удаление персональных данных ходит по точке,
    и файл, лежащий вне её каталога, оно не найдёт.
    """
    rel = f'points/{point_id}/renders/{job_id}.jpg'
    dst = STORAGE / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(dst), img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return '/' + rel


def hard_stop(cur, point_id: str) -> bool:
    """
    Достигнут ли жёсткий потолок расхода точки.

    Спрашиваем app.budget_state — ту же функцию, которой пользуется
    постановка заданий. Свой подсчёт здесь был бы вторым источником правды
    о деньгах: разойтись они могут молча, а расплачиваться будет точка.
    """
    cur.execute('select hard_reached from app.budget_state(%s)', (point_id,))
    row = cur.fetchone()
    return bool(row and (row['hard_reached'] if isinstance(row, dict) else row[0]))


def handle(cur, job) -> None:
    payload = job['payload'] or {}
    point_id = str(job['point_id'])
    as_tenant(cur, point_id, payload.get('network_id'))

    photo_path = payload.get('photo_path')
    if not photo_path:
        raise ValueError('в задании нет пути к фотографии')
    img = load_photo(photo_path)
    if img is None:
        raise ValueError(f'файл фотографии не найден: {photo_path}')

    engine = GatewayEngine()

    # Потолок проверяется ЕЩЁ РАЗ, здесь, а не только при постановке: между
    # постановкой и исполнением проходит время, и за него точка могла
    # исчерпать лимит другими заданиями.
    if hard_stop(cur, point_id):
        # Не ошибка исполнения, а исчерпанный лимит: сообщение должно быть
        # таким, чтобы точка поняла, что делать, — пополнить, а не чинить.
        raise RuntimeError('исчерпан месячный потолок расхода точки')

    car = silhouette.car(img)
    if car is None:
        raise ValueError('на фотографии не найден автомобиль')
    plate_mask = plate.detect(img) if plate.available() else None

    req = classb.Request(
        image=img, mask=car,
        sku_name=payload.get('sku_name', ''),
        target_lab=tuple(payload.get('target_lab', (50.0, 0.0, 0.0))),
        finish=payload.get('finish', 'gloss'),
        keep=(plate_mask,) if plate_mask is not None else (),
    )
    res = classb.run(engine, req, car,
                     lawyer_cleared=os.environ.get('CSW_TRANSFER_CLEARED') == 'yes')
    if not res.ok or res.image is None:
        raise RuntimeError(res.reason or 'генерация не прошла проверку')

    path = save_render(point_id, str(job['id']), res.image)
    cur.execute("""
        insert into renders (configuration_item_id, point_id, variant, storage_path,
                             pipeline, render_class, model_used, provider,
                             cost_kopecks, qa_passed)
        values (%s,%s,%s,%s,%s::jsonb,'B',%s,%s,%s,true)
        returning id""",
        (job['configuration_item_id'], point_id, job['variant'], path,
         json.dumps({'engine': res.engine, 'sku': req.sku_name,
                     'target_lab': list(req.target_lab), 'finish': req.finish},
                    ensure_ascii=False),
         res.engine, 'gateway', res.cost_kopecks))
    render_id = cur.fetchone()['id']

    # Расход привязывается к КОНКРЕТНОМУ рендеру и категории: без этого
    # сверка с счётом вендора превращается в спор об общей сумме, а разбор
    # «на что ушли деньги точки» — в гадание.
    cur.execute("""
        select ci.category from configuration_items ci where ci.id = %s""",
        (job['configuration_item_id'],))
    row = cur.fetchone()
    cur.execute("""
        insert into generation_usage (point_id, render_id, render_class, category,
                                      model_used, provider, cost_kopecks)
        values (%s,%s,'B',%s,%s,'gateway',%s)""",
        (point_id, render_id, row['category'] if row else 'film',
         res.engine, res.cost_kopecks))
    cur.execute('select app.finish_render_job(%s, %s)', (job['id'], res.cost_kopecks))


def main() -> int:
    signal.signal(signal.SIGTERM, _sigterm)
    signal.signal(signal.SIGINT, _sigterm)
    conn = connect()
    print(f'воркер {WORKER_ID} запущен, хранилище {STORAGE}', flush=True)

    idle = 0
    while not _stop:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute('select * from app.claim_render_jobs(%s, %s)',
                        (WORKER_ID, BATCH))
            jobs = cur.fetchall()
        if not jobs:
            idle += 1
            time.sleep(min(POLL_SECONDS * min(idle, 5), 10.0))
            continue
        idle = 0
        for job in jobs:
            t0 = time.time()
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                try:
                    handle(cur, job)
                    print(f'  готово {job["id"]} · {time.time()-t0:.1f} с', flush=True)
                except Exception as e:
                    # Причина обязана попасть в задание: молчаливое исчезновение
                    # неотличимо от «ещё считается», и точка будет ждать вечно.
                    msg = f'{type(e).__name__}: {e}'
                    print(f'  ОТКАЗ {job["id"]}: {msg}', flush=True)
                    traceback.print_exc()
                    try:
                        # Претензия ОБЯЗАТЕЛЬНА и здесь. Без неё функция не
                        # увидит задание, отказ запишется вхолостую, и задание
                        # останется висеть в running навсегда. Точку берём из
                        # самого задания — мы его и забрали.
                        as_tenant(cur, str(job['point_id']))
                        cur.execute('select app.fail_render_job(%s, %s)',
                                    (job['id'], msg[:500]))
                    except Exception:
                        traceback.print_exc()
    print('воркер остановлен', flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
