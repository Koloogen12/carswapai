"""
Прогон рабочего цикла против настоящей базы с боевой ролевой моделью.

ЗАГЛУШКА ВМЕСТО МОДЕЛИ — сознательно. Сам класс B уже проверен живым запросом
к Gemini: 25 секунд, силуэт совпал, результат товарный. Здесь проверяется
другое и непроверенное: очередь, дедупликация, потолок расхода, запись
результата и поведение при отказе. Гонять на этом настоящую модель значит
платить деньги за проверку кода, который к модели отношения не имеет.

Запуск:  ./e2e/livedb.sh 'python3 worker/test_worker.py'
"""
from __future__ import annotations

import json
import os
import pathlib
import sys
import tempfile
import uuid

import cv2
import numpy as np
import psycopg2
import psycopg2.extras

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from pipeline.batch import LIGHTS  # noqa: E402

fails = 0


def check(name: str, ok: bool, detail: str = '') -> None:
    global fails
    if ok:
        print(f'ok  · {name}')
    else:
        fails += 1
        print(f'ПРОВАЛ · {name}' + (f' — {detail}' if detail else ''))


def main() -> int:
    storage = pathlib.Path(tempfile.mkdtemp(prefix='cswstore-'))
    os.environ['STORAGE_ROOT'] = str(storage)
    os.environ['CSW_B_MODEL'] = 'stub'
    os.environ['CSW_TRANSFER_CLEARED'] = 'yes'

    import main as worker
    worker.STORAGE = storage

    # Заглушка движка: рисует ровный цвет внутри маски. Нам важно, что цикл
    # доносит результат до базы, а не как он выглядит.
    from pipeline import classb

    class Stub(classb.Engine):
        name, cost_kopecks = 'stub', 850
        calls = 0

        @property
        def leaves_contour(self):
            return False          # внутри контура: обезличивание не нужно

        def render(self, req):
            Stub.calls += 1
            out = req.image.copy()
            out[req.mask > 0] = (40, 40, 40)
            return out

    worker.GatewayEngine = lambda *a, **k: Stub()

    # Детектор номера подменяется заглушкой. Он проверен отдельно на реальных
    # кадрах (10 из 12) и здесь ни при чём — а без него цикл честно откажет
    # «номер не найден, не можем поручиться, что он не тронут», и до очереди
    # проверка не дойдёт. Сам этот отказ проверяется ниже отдельным случаем.
    from pipeline import plate as plate_mod
    plate_mod.available = lambda: True
    plate_mod.detect = lambda img: cv2.rectangle(
        np.zeros(img.shape[:2], np.uint8),
        (int(img.shape[1] * 0.10), int(img.shape[0] * 0.62)),
        (int(img.shape[1] * 0.22), int(img.shape[0] * 0.70)), 255, -1)
    worker.plate = plate_mod

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Подготовка данных идёт привилегированно — так же, как установка на
    # сервере. Проверяется не она, а рабочий цикл; сам цикл дальше работает
    # под ролью приложения и под претензией арендатора.
    setup = psycopg2.connect(os.environ['DATABASE_URL'].replace('carswap_app@', 'postgres@'))
    setup.autocommit = True
    scur = setup.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    scur.execute("select id, network_id from points limit 1")
    pt = scur.fetchone()
    if not pt:
        print('в базе нет ни одной точки — посев не прошёл')
        return 1
    point, network = str(pt['id']), str(pt['network_id'])
    worker.as_tenant(cur, point, network)

    scur.execute("""select pp.id, ci.sku, ci.finish, ci.lab_l, ci.lab_a, ci.lab_b
                      from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
                     where pp.point_id = %s and ci.lab_l is not null limit 1""", (point,))
    price = scur.fetchone()
    scur.execute("select enumlabel from pg_enum e join pg_type t on t.oid=e.enumtypid "
                 "where t.typname='render_variant' order by e.enumsortorder")
    db_lights = tuple(r['enumlabel'] for r in scur.fetchall())
    check('света в коде и в базе совпадают', db_lights == LIGHTS,
          f'база {db_lights}, код {LIGHTS}')

    check('в прайсе точки есть артикул с измеренным цветом', price is not None)
    if not price:
        return 1

    # Фотография на диске и в базе. Кадр настоящий: силуэт ищет сеть, и на
    # нарисованном прямоугольнике она честно не находит машину — как и должна.
    src = pathlib.Path(__file__).resolve().parent / 'fixtures/dev-set/05-overcast-side.png'
    img = cv2.imread(str(src))
    img = cv2.resize(img, None, fx=0.25, fy=0.25)
    rel = f'points/{point}/photos/{uuid.uuid4()}.jpg'
    (storage / rel).parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(storage / rel), img)

    scur.execute("select id from clients where point_id = %s limit 1", (point,))
    client = scur.fetchone()
    scur.execute("""insert into consents (point_id, client_id, kind, document_version, granted)
                   values (%s,%s,'photo_processing','v1',true) returning id""",
                (point, client['id'] if client else None))
    consent = scur.fetchone()['id']
    scur.execute("""insert into photos (point_id, client_id, storage_path, sha256,
                                       width, height, consent_id)
                   values (%s,%s,%s,%s,%s,%s,%s) returning id""",
                (point, client['id'] if client else None, '/' + rel,
                 uuid.uuid4().hex, img.shape[1], img.shape[0], consent))
    photo = scur.fetchone()['id']

    scur.execute("""insert into configurations (point_id, created_by, photo_id)
                   select %s, u.id, %s from users u where u.point_id = %s limit 1
                   returning id""", (point, photo, point))
    cfg = scur.fetchone()['id']
    scur.execute("""insert into configuration_items
                     (configuration_id, point_id, point_price_id, category, price_kopecks)
                   values (%s,%s,%s,'film',100000) returning id""",
                (cfg, point, price['id']))
    item = scur.fetchone()['id']

    payload = json.dumps({'photo_path': '/' + rel, 'sku_name': price['sku'],
                          'finish': price['finish'], 'network_id': network,
                          'target_lab': [float(price['lab_l']), float(price['lab_a']),
                                         float(price['lab_b'])]})

    # ── Постановка и дедупликация ────────────────────────────
    ids = []
    for light in LIGHTS:
        cur.execute("""select app.enqueue_render(%s,%s,%s::render_variant,'B',%s,
                                                 0::smallint,850,%s::jsonb) as id""",
                    (point, item, light, f'{photo}:{price["id"]}:{light}', payload))
        ids.append(cur.fetchone()['id'])
    check('поставлено три задания, по одному на свет', len(set(ids)) == 3)

    cur.execute("""select app.enqueue_render(%s,%s,'day'::render_variant,'B',%s,
                                             0::smallint,850,%s::jsonb) as id""",
                (point, item, f'{photo}:{price["id"]}:day', payload))
    again = cur.fetchone()['id']
    check('повторная постановка не создаёт второго задания и не тратит денег',
          str(again) == str(ids[0]), f'{again} против {ids[0]}')

    # ── Исполнение ───────────────────────────────────────────
    cur.execute("select * from app.claim_render_jobs('test', 10)")
    jobs = cur.fetchall()
    check('воркер забрал ровно свои три задания', len(jobs) == 3, f'взято {len(jobs)}')
    for job in jobs:
        worker.handle(cur, job)
    check('модель вызвана по разу на свет', Stub.calls == 3, f'вызовов {Stub.calls}')

    worker.as_tenant(cur, point, network)
    cur.execute("select count(*) n from renders where configuration_item_id = %s", (item,))
    check('три рендера записаны', cur.fetchone()['n'] == 3)
    cur.execute("select storage_path from renders where configuration_item_id = %s", (item,))
    paths = [r['storage_path'] for r in cur.fetchall()]
    check('файлы результата лежат на диске',
          all((storage / p.lstrip('/')).exists() for p in paths))
    check('файлы лежат под своей точкой — иначе удаление ПД их не найдёт',
          all(p.startswith(f'/points/{point}/') for p in paths), str(paths[:1]))

    cur.execute("select count(*) n, sum(cost_kopecks) s from generation_usage where point_id = %s",
                (point,))
    u = cur.fetchone()
    check('расход учтён по каждой генерации', u['n'] >= 3 and u['s'] >= 2550,
          f"записей {u['n']}, сумма {u['s']}")

    cur.execute("select count(*) n from render_jobs where configuration_item_id=%s and status='done'",
                (item,))
    check('задания закрыты как выполненные', cur.fetchone()['n'] == 3)

    # ── Отказ пишется с причиной ─────────────────────────────
    cur.execute("""select app.enqueue_render(%s,%s,'day'::render_variant,'B',%s,
                                             0::smallint,850,%s::jsonb) as id""",
                (point, item, f'{photo}:сломанное:day',
                 json.dumps({'photo_path': '/нет/такого.jpg'})))
    cur.execute("select * from app.claim_render_jobs('test', 1)")
    bad = cur.fetchall()[0]
    try:
        worker.handle(cur, bad)
        check('задание с отсутствующим файлом отклонено', False, 'прошло без ошибки')
    except Exception as e:
        worker.as_tenant(cur, point, network)
        cur.execute('select app.fail_render_job(%s,%s)', (bad['id'], str(e)[:500]))
        cur.execute("select status, last_error from render_jobs where id=%s", (bad['id'],))
        r = cur.fetchone()
        check('отказ записан в задание вместе с причиной',
              r['last_error'] and 'не найден' in r['last_error'],
              str(r['last_error'])[:80])

    # ── Без детектора номера выдачи нет ──────────────────────
    # Это не придирка: без номера кадр нельзя ни выдать клиенту, ни отправить
    # во внешнюю модель — второе было бы трансграничной передачей ПД.
    plate_mod.available = lambda: False
    plate_mod.detect = lambda img: np.zeros(img.shape[:2], np.uint8)
    worker.as_tenant(cur, point, network)
    cur.execute("""select app.enqueue_render(%s,%s,%s::render_variant,'B',%s,
                                            0::smallint,850,%s::jsonb) as id""",
                (point, item, LIGHTS[2], f'{photo}:безномера:{LIGHTS[2]}', payload))
    cur.execute("select * from app.claim_render_jobs('test', 1)")
    noplate = cur.fetchall()[0]
    try:
        worker.handle(cur, noplate)
        check('без найденного номера результат не выдаётся', False, 'прошло')
    except Exception as e:
        check('без найденного номера результат не выдаётся',
              'номер' in str(e).lower(), str(e)[:80])
    plate_mod.available = lambda: True

    # ── Жёсткий потолок расхода ──────────────────────────────
    worker.as_tenant(cur, point, network)
    # Потолок правим НА СТРОКЕ БЮДЖЕТА, а не на точке. С началом месяца
    # действующий предел копируется в point_budgets и дальше живёт там —
    # иначе правка задним числом ломала бы уже посчитанный месяц. Это не
    # обходной путь теста, а то, как система устроена.
    # Предел опускаем НИЖЕ уже израсходованного, но не ниже мягкого порога:
    # ограничение таблицы требует, чтобы жёсткий был не меньше мягкого, и это
    # верно — потолок ниже предупреждения был бы бессмыслицей.
    scur.execute("""update point_budgets
                       set hard_limit_kopecks = greatest(soft_limit_kopecks, 1)
                     where point_id = %s
                       and period_month = date_trunc('month', now())::date""", (point,))
    # Читаем состояние бюджета под претензией: без неё функция вернёт ноль
    # строк, и это уже отдельная проверка ниже.
    worker.as_tenant(cur, point, network)
    cur.execute("select hard_reached from app.budget_state(%s)", (point,))
    check('после правки предела стоп виден в состоянии бюджета',
          bool(cur.fetchone()['hard_reached']))
    try:
        cur.execute("""select app.enqueue_render(%s,%s,%s::render_variant,'B',%s,
                                                 0::smallint,850,%s::jsonb)""",
                    (point, item, LIGHTS[1], f'{photo}:потолок:{LIGHTS[1]}', payload))
        check('жёсткий потолок останавливает постановку задания', False, 'прошло')
    except psycopg2.Error as e:
        check('жёсткий потолок останавливает постановку задания',
              'бюджет' in str(e).lower() or 'стоп' in str(e).lower(), str(e)[:80])

    # ── Потолок нельзя пропустить, потеряв претензию ─────────
    scur.execute("select set_config('request.jwt.claims','',false)")
    try:
        scur.execute("""select app.enqueue_render(%s,%s,%s::render_variant,'B',%s,
                                                  0::smallint,850,%s::jsonb)""",
                     (point, item, LIGHTS[0], f'{photo}:безпретензии:x', payload))
        check('без претензии постановка задания не проходит молча', False,
              'прошло — значит потолок расхода можно обойти')
    except psycopg2.Error as e:
        check('без претензии постановка задания не проходит молча',
              'претензи' in str(e).lower(), str(e)[:90])

    print()
    print('Все проверки пройдены.' if fails == 0 else f'ПРОВАЛОВ: {fails}')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
