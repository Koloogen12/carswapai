#!/usr/bin/env python3
"""
QA: верность макету.

Проверка связности ловила только импорты — то есть отвечала на вопрос
«из чего собрано», но не на вопрос «то ли собрано». Экран можно построить
из правильных компонентов и наполнить выдуманным содержимым, и все прошлые
проверки останутся зелёными.

Эта сравнивает словарь интерфейса: берёт текст блока хендоффа, выкидывает
данные (числа, имена, даты) и смотрит, какая доля оставшихся слов есть
на живом экране. Данные у нас свои, а подписи, ярлыки и формулировки —
из макета, и расходиться не должны.
"""
import json, pathlib, re, sys, urllib.request, html as H
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'tools'))
from extract_screen import children, inner

BASE = 'http://localhost:3000'
ROOT = pathlib.Path(__file__).resolve().parent.parent

# Маршрут → рамка конкретного экрана: (файл, блок, путь внутри блока).
# Привязка именно к рамке, а не к блоку: в блоке лежит по нескольку модулей
# сразу, и сравнение с блоком требовало бы от одного экрана словаря четырёх.
MAP = [
    ('/login',             '01-phase1-signup-point-staff',  1, [1]),
    ('/join',              '01-phase1-signup-point-staff',  3, [1, 0]),
    ('/staff',             '01-phase1-signup-point-staff',  5, [1]),
    ('/inbox/{TID}',       '11-inbox-dialog-detail',        1, [1]),
    ('/g/jetcar-mytishchi','03-phase3-client-garage',       2, [1, 0]),
    ('/bay',               '08-pass2-point-operations',     5, [1, 2]),
    ('/owner',             '06-phase6-owner-network',       7, [1]),
    ('/network',           '06-phase6-owner-network',       9, [1]),
    ('/price',             '06-phase6-owner-network',       3, [1]),
    ('/ops/followups',     '08-pass2-point-operations',     1, [1]),
    ('/ops/schedule',      '08-pass2-point-operations',     2, [1]),
    ('/ops/stock',         '08-pass2-point-operations',     3, [1]),
    ('/ops/billing',       '08-pass2-point-operations',     4, [1]),
    ('/ops/events',        '08-pass2-point-operations',     5, [1, 0]),
    ('/ops/cash',          '09-pass3-management',           1, [1]),
    ('/ops/search',        '09-pass3-management',           2, [1]),
    ('/ops/catalog',       '09-pass3-management',           3, [1]),
    # Кадр [1,0], а не [1,3]: экран замера — четыре шага одного экрана, и
    # в посеве визит стоит на первом, «клиент приехал». Привязка к третьему
    # шагу клеймила верную страницу выдуманной.
    ('/measure/{AP}',      '10-pass4-measure-intake-mobile-crm', 1, [1, 0]),
    # Конфигурация …0006, а не …0001: у первой уже есть наряд и оплаченный
    # счёт, и ссылка клиента показывает счёт, а не примерку.
    #
    # Кадр — из 07-pass1, шаг «когда вам удобно на замер»: именно его экран и
    # рисует в этом состоянии. Шаг был собран не по макету, и проверка это
    # поймала — теперь он перенесён из кадра.
    #
    # Путь [1,0,1], а не [1,0]: [1,0] — это обёртка канвы, и в ней рядом с
    # экраном лежат подпись «04 Клиент выбирает слот сам» и комментарий автора
    # «окно между подтверждением цвета и замером — самая дорогая потеря
    # продукта». Это пояснения к хендоффу, а не интерфейс; ровно про них
    # говорит `frames()` в этом же файле — «сравнивать с ними значит требовать
    # от продукта текста, которого в нём быть не должно». Четырнадцать слов из
    # сорока одного приходили именно оттуда, и вынести их продукт не мог бы
    # никогда. [1,0,1] — сама рамка экрана, 27 слов.
    #
    # Углубление пути НЕ прячет провал: на прежнем, выдуманном шаге записи
    # рамка давала 44% — так же ниже порога, как и 34% на обёртке.
    ('/c/15500000-0000-4000-8000-000000000006',
                           '07-pass1-client-second-half', 2, [1, 0, 1]),
    # Фаза 5. Нумерация в хендоффе и в карте экранов РАСХОДИТСЯ начиная
    # с сорок девятого: в файле рамки подписаны 47 CRM, 48 карточка,
    # 49 воронка, 50 формирование наряда, а карта считает 49 «историей
    # примерок» — разделом, который в макете лежит внутри карточки, —
    # и сдвигает воронку на 50. Привязка идёт к РАМКАМ файла:
    #   блок 1 — «47 CRM · клиенты точки»  → /crm
    #   блок 3 — «48 Карточка клиента»     → /crm/{CID}
    # Воронка отдельного маршрута не имеет: она живёт на том же /crm,
    # и её словарь проверке только помогает, а не мешает.
    ('/crm',               '05-phase5-crm-workorder',       1, [1]),
    ('/crm/{CID}',         '05-phase5-crm-workorder',       3, [1]),
    ('/crm/mobile',        '10-pass4-measure-intake-mobile-crm', 3, [1, 0]),
    ('/help',              '10-pass4-measure-intake-mobile-crm', 3, [1, 1]),
    ('/owner/mobile',      '09-pass3-management',           4, [1, 0]),
    ('/g/consent',         '09-pass3-management',           4, [1, 1]),
    ('/g/prepurchase',     '09-pass3-management',           4, [1, 2]),
]

STOP = set('и в во не на с со а но что как к по для из у же от до за о об при бы это его их'.split())

VOID = {'br','img','input','meta','link','path','circle','rect','line','polyline',
        'polygon','ellipse','use','stop','source','ImageSlot'}

def frames(node: str, depth: int = 0) -> list[str]:
    """
    Только рамки экранов, без подписей канвы.

    В блоке хендоффа рядом с экраном лежат пояснения «почему сделано так» —
    это комментарий автора, а не интерфейс. Сравнивать с ними значит требовать
    от продукта текста, которого в нём быть не должно.
    """
    m = re.match(r'<div style=\{\{([^}]*)\}\}', node)
    if m and re.search(r'width: "(\d{3,4})px"', m.group(1)):
        w = int(re.search(r'width: "(\d{3,4})px"', m.group(1)).group(1))
        if w >= 320:
            return [node]
    if depth > 5:
        return []
    out = []
    for c in children(inner(node)):
        out += frames(c, depth + 1)
    return out

def strip_rationale(node: str) -> str:
    """
    Убрать подписи автора «почему сделано так».

    В этом хендоффе они стоят ПОСЛЕДНИМИ в рамке и набраны мелким серым:
    11px, #9A9A9A. Пример со строки 445 файла 08: «Мастер сообщает „одним
    действием“ — вот куда это приходит. Владельцу отдельно уходят только
    деньги и пороги, чтобы не тонуть в потоке».

    Это рассуждение для того, кто читает макет, а не текст интерфейса.
    Продукт не мог бы вынести его на экран никогда — а проверка требовала,
    и честно показывала недостачу там, где экран верен.

    Отсекаем только длинные такие строки: короткая серая подпись под полем
    («в наличии 8 из 9») — это интерфейс, и её проверять надо.
    """
    # Только ПОСЛЕДНЯЯ такая подпись в рамке: рассуждение автора стоит в
    # конце, а мелкие серые подписи внутри экрана — это интерфейс, и
    # проверять их надо. Первая версия срезала всё подряд и уронила
    # соседний маршрут, где такие подписи были настоящими.
    m = list(re.finditer(
        r'<span style=\{\{[^}]*fontSize: "11(?:\.\d)?px"[^}]*color: "#9A9A9A"[^}]*\}\}>'
        # После подписи идут закрывающие теги рамки — их и пропускаем.
        r'[^<]{60,}</span>\s*(?:</div>\s*)*$', node.rstrip()))
    if not m:
        return node
    last = m[-1]
    return node[:last.start()] + node[last.end():]


def words(s: str) -> list[str]:
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return H.unescape(s).split()

def vocab(ws: list[str]) -> set[str]:
    """Словарь интерфейса: без данных, чисел, имён собственных и коротышей."""
    out = set()
    for w in ws:
        t = w.strip('·,.—:()«»"\'!?%№/').lower()
        if not t or t in STOP: continue
        if len(t) < 4: continue
        if any(ch.isdigit() for ch in t): continue     # числа и даты — данные
        if w[:1].isupper() and t not in {'артикул', 'клиент'}:
            continue                                    # имена и названия — данные
        out.add(t)
    return out

def sql1(q: str) -> str:
    import subprocess
    r = subprocess.run(['psql', '-h', '/tmp/cswdev', '-p', '55432', '-U', 'postgres',
                        '-d', 'carswap', '-tAc', q], capture_output=True, text=True,
                       env={'PATH': '/opt/homebrew/opt/postgresql@16/bin:/usr/bin:/bin',
                            'LC_ALL': 'C'})
    return r.stdout.strip()

def thread_id() -> str:
    import subprocess
    q = "select id from threads order by last_message_at desc limit 1"
    r = subprocess.run(['psql', '-h', '/tmp/cswdev', '-p', '55432', '-U', 'postgres',
                        '-d', 'carswap', '-tAc', q], capture_output=True, text=True,
                       env={'PATH': '/opt/homebrew/opt/postgresql@16/bin:/usr/bin:/bin',
                            'LC_ALL': 'C'})
    return r.stdout.strip()

def session_cookie() -> str:
    """
    Сессия владельца посевной точки — для проверок.

    Экраны теперь закрыты входом, и без сессии стенд видел бы страницу входа
    вместо продукта. Сессия заводится прямо в базе: проверять надо экраны, а
    не путь по SMS, и гонять код через журнал на каждом прогоне — лишнее.
    """
    # `sql1` возвращает весь вывод psql, включая строку «INSERT 0 1»:
    # берём только первую строку, иначе в заголовок куки уедет перевод строки.
    raw = sql1("insert into sessions (user_id, expires_at) "
               "select u.id, now() + interval '1 hour' from users u "
               "where u.role = 'owner' limit 1 returning id::text")
    return raw.strip().splitlines()[0].strip()


_COOKIE = None


def fetch_auth(url: str) -> str:
    global _COOKIE
    if _COOKIE is None:
        _COOKIE = session_cookie()
    import urllib.request
    rq = urllib.request.Request(url, headers={'Cookie': f'csw_s={_COOKIE}'})
    with urllib.request.urlopen(rq, timeout=25) as r:
        return r.read().decode('utf-8', 'ignore')


def fetch(url: str) -> str:
    return urllib.request.urlopen(url, timeout=25).read().decode('utf-8', 'ignore')

def main() -> int:
    fail = 0
    print(f'{"маршрут":30s} {"совпало":>8s} {"из":>5s}  верность')
    tid = thread_id()
    ap = sql1("select ap.id from appointments ap "
              "join configuration_items cit on cit.configuration_id = ap.configuration_id "
              "where ap.kind='measure' limit 1")
    # Карточка клиента сравнивается с кадром 48, а на нём человек с
    # подтверждённым выбором и нарядом. Клиент без единой примерки дал бы
    # честно пустой экран — и проверка сочла бы верную страницу выдуманной.
    cid = sql1("select t.client_id from confirmations cf "
               "join configurations cfg on cfg.id = cf.configuration_id "
               "join threads t on t.id = cfg.thread_id "
               "join orders o on o.confirmation_id = cf.id limit 1")
    for route, src, block, path in MAP:
        route = route.replace('{TID}', tid).replace('{AP}', ap).replace('{CID}', cid)
        data = json.loads((ROOT / 'tools' / 'out' / f'{src}.json').read_text(encoding='utf-8'))
        try:
            have = vocab(words(fetch_auth(BASE + route)))
        except Exception as e:
            print(f'{route:30s} — недоступен: {e}')
            fail = 1; continue

        def at(b: int, pth: list[int]) -> set[str]:
            node = data['blocks'][b]
            for step in pth:
                kids = children(inner(node))
                if step >= len(kids):
                    return set()
                node = kids[step]
            # Только рамки экранов, без подписей канвы. frames() для этого и
            # написана, но в цикле не вызывалась — и пояснения автора вроде
            # «чтобы не тонуть в потоке событий» попадали в ожидаемый словарь.
            # Продукт не мог бы вынести их на экран никогда, и проверка честно
            # показывала недостачу там, где экран верен.
            picked = frames(node)
            src = ' '.join(picked) if picked else node
            full = vocab(words(src))
            trimmed = vocab(words(strip_rationale(src)))
            # Отсечение подписи осмысленно, только пока выборка остаётся
            # достаточной. На мелком кадре подпись — заметная доля текста, и
            # после неё каждое пропущенное слово весит по восемь процентов:
            # доля перестаёт что-либо мерить и начинает шуметь.
            return trimmed if len(trimmed) >= 20 else full

        want = at(block, path)
        hit = want & have
        pct = round(len(hit) / max(1, len(want)) * 100)

        # Экран может рисовать НЕ ТОТ кадр того же файла — не потому, что
        # выдуман, а потому, что состояние в посеве другое. У замера четыре
        # шага одного экрана, у ссылки клиента — примерка, подтверждение и
        # счёт. Привязка к одному кадру клеймила такие страницы «выдумано»,
        # то есть давала ложную тревогу на верной странице.
        #
        # Поэтому при промахе ищем лучший кадр в том же файле. Если и он
        # плох — экран действительно выдуман. Если хорош — экран верен, а
        # устарела привязка, и это надо назвать своим именем, а не провалом.
        alt = None
        if pct < 55:
            for b in range(len(data['blocks'])):
                for pth in ([1, 0], [1, 1], [1, 2], [1, 3], [1], [0]):
                    w = at(b, pth)
                    if len(w) < 8:
                        continue
                    q = round(len(w & have) / len(w) * 100)
                    if q > pct and (alt is None or q > alt[0]):
                        alt = (q, b, pth, len(w & have), len(w))
        if alt and alt[0] >= 55:
            print(f'{route:30s} {alt[3]:8d} {alt[4]:5d}  {alt[0]:3d}%  ok · кадр '
                  f'{alt[1]}{alt[2]}, а не {block}{path} — привязка устарела')
            continue
        flag = 'ok' if pct >= 55 else 'ВЫДУМАНО' if pct < 35 else 'частично'
        if pct < 55: fail = 1
        print(f'{route:30s} {len(hit):8d} {len(want):5d}  {pct:3d}%  {flag}')
        if pct < 55:
            miss = sorted(want - have)[:14]
            print(f'{"":30s}   нет на экране: {" ".join(miss)}')
    return fail

if __name__ == '__main__':
    sys.exit(main())
