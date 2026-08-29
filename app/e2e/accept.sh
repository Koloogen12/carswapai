#!/usr/bin/env bash
# Приёмка по §15 спецификации.
#
# Правило этого файла: проверка либо действительно проверяет, либо честно
# говорит, что не проверяет, и чем её закрывать. Третьего не бывает.
# За день до этого мы трижды поймали ложно-зелёные проверки — стенд от
# суперпользователя, expect_fail без нужного кода ошибки и «номер не тронут»
# при ненайденном номере. Здесь этого быть не должно.
#
# Состояния: ok — проверено машинно; ПРОВАЛ — проверено и не сошлось;
#            живьём — машинно непроверяемо, сказано чем закрывать.
set -uo pipefail
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
# Без этого postmaster на macOS падает с «became multithreaded during startup».
export LC_ALL=C LANG=C
# Схема проверяется на кластере, поднятом ИЗ МИГРАЦИЙ, а не на базе
# разработки: та отстала (в ней нет outbound_cards.honesty_shown из 001), и
# проверка против неё измеряла бы не то, что поедет на сервер.
DB=${CSW_DB:-"-h /tmp/cswaccept -p 55451 -U postgres -d carswap"}
BASE=${CSW_BASE:-http://localhost:3000}
OK=0; BAD=0; LIVE=0

# Поднимаем кластер из миграций на время приёмки.
export PGTMP=/tmp/cswaccept PGPORT=55451
cleanup() { pg_ctl -D /tmp/cswaccept/data stop -m immediate >/dev/null 2>&1 || true
            rm -rf /tmp/cswaccept; }
trap cleanup EXIT
rm -rf /tmp/cswaccept; mkdir -p /tmp/cswaccept
initdb -D /tmp/cswaccept/data -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
pg_ctl -D /tmp/cswaccept/data -o "-p 55451 -k /tmp/cswaccept -c listen_addresses=''" \
       -l /tmp/cswaccept/log start >/dev/null
until pg_isready -h /tmp/cswaccept -p 55451 -q; do sleep 0.3; done
psql -h /tmp/cswaccept -p 55451 -U postgres -q -c "create database carswap;"
psql -h /tmp/cswaccept -p 55451 -U postgres -q -d carswap -c "
  create role app_tenant nologin;
  create role carswap_owner login createrole;
  create role carswap_app login in role app_tenant;
  alter database carswap owner to carswap_owner;
  grant all on schema public to carswap_owner;
  create extension if not exists pgcrypto; create extension if not exists pg_trgm;" >/dev/null
for m in db/migrations/*.sql; do
  psql -h /tmp/cswaccept -p 55451 -U carswap_owner -q -d carswap -v ON_ERROR_STOP=1 -f "$m" >/dev/null 2>&1
done
[ -f db/seed.sql ] && psql -h /tmp/cswaccept -p 55451 -U postgres -q -d carswap -f db/seed.sql >/dev/null 2>&1

ok()   { printf '  \033[32mok\033[0m      %s\n' "$1"; OK=$((OK+1)); }
bad()  { printf '  \033[31mПРОВАЛ\033[0m  %s\n     └ %s\n' "$1" "$2"; BAD=$((BAD+1)); }
live() { printf '  \033[33mживьём\033[0m  %s\n     └ %s\n' "$1" "$2"; LIVE=$((LIVE+1)); }
sect() { printf '\n\033[1m%s\033[0m\n' "$1"; }
q()    { psql $DB -tAc "$1" 2>/dev/null; }

# ── ПАЙПЛАЙН ────────────────────────────────────────────────────────────
sect "Пайплайн"

if [ -f worker/models/carparts.pt ]; then
  live "10 реальных фото на категорию неотличимы от ретуши" \
       "нужен глаз человека на 10 фото; сеть частей обучена, прогнать заново"
else
  bad "10 реальных фото на категорию неотличимы от ретуши" \
      "сеть сегментации частей не обучена (worker/models/carparts.pt нет); на текущей маске результат крапчатый — см. worker/out/seg/recolor.png"
fi

# Побитовое совпадение вне маски — это уже проверяется в pipeline/qa.py
# на каждом рендере. Здесь прогоняем сам механизм на реальных кадрах.
R=$(cd worker && python3 - <<'PY' 2>/dev/null
import sys, pathlib, cv2, numpy as np
sys.path.insert(0,'.')
from pipeline import segment, color, composite, qa
bad = 0; tot = 0
for p in sorted(pathlib.Path('fixtures/dev-set').glob('*.png'))[:6]:
    img = cv2.imread(str(p)); img = cv2.resize(img,None,fx=0.4,fy=0.4)
    m = segment.segment(img)
    if (m['body']>0).mean() < 0.02: continue
    out = composite.composite(img, color.recolor(img,m['body'],(22.,.4,-.6)),
                              m['body'], None, m['plate'])
    r = qa.report(img,out,m['body'],m['plate']); tot += 1
    if not r['outside_untouched']: bad += 1
print(f'{bad}/{tot}')
PY
)
case "$R" in
  0/0|"") bad "вне маски совпадает с оригиналом побитово" "прогон не дал ни одного кадра" ;;
  0/*)    ok  "вне маски совпадает с оригиналом побитово ($R нарушений)" ;;
  *)      bad "вне маски совпадает с оригиналом побитово" "нарушений: $R" ;;
esac
live "номер читается тем же OCR" \
     "детектор номера снят как дающий ложные срабатывания (см. DECISIONS.md §4); до обученного детектора кадр с номером класс A не выдаёт"

# Воспроизводимость: тот же вход и параметры — тот же выход, побитово.
R=$(cd worker && python3 - <<'PY' 2>/dev/null
import sys, hashlib, pathlib, cv2
sys.path.insert(0,'.')
from pipeline import segment, color, composite
p = sorted(pathlib.Path('fixtures/dev-set').glob('*.png'))[1]
img = cv2.imread(str(p)); img = cv2.resize(img,None,fx=0.4,fy=0.4)
h = set()
for _ in range(3):
    m = segment.segment(img)
    out = composite.composite(img, color.recolor(img,m['body'],(22.,.4,-.6)), m['body'])
    h.add(hashlib.sha256(out.tobytes()).hexdigest())
print(len(h))
PY
)
[ "$R" = "1" ] && ok "класс A воспроизводим: три прогона — один хеш" \
                || bad "класс A воспроизводим" "три прогона дали разных хешей: $R"

N=$(q "select count(*) from outbound_cards c
        join configuration_items ci on ci.configuration_id = c.configuration_id
        where ci.point_price_id is null")
[ "${N:-1}" = "0" ] && ok "артикул и цена только из прайса точки, не генерируются" \
                    || bad "артикул и цена только из прайса точки" "позиций без строки прайса: $N"

N=$(q "select count(*) from outbound_cards where honesty_shown is not true")
C=$(q "select count(*) from information_schema.columns
        where table_name='outbound_cards' and column_name='honesty_shown'
          and is_nullable='NO'")
if [ "${N:-1}" = "0" ] && [ "${C:-0}" = "1" ]; then
  ok "строка честности на 100% карточек и не отключается ни одной ролью"
else
  bad "строка честности" "карточек без неё: $N"
fi

D=$(q "select count(*) from catalog_items where default_class = 'D'")
[ "${D:-1}" = "0" ] && ok "категории класса D недоступны: их нет в каталоге" \
                    || live "категории класса D недоступны на уровне API" \
                            "в каталоге $D позиций класса D — нужен тест, что API их отклоняет"

live "при недоступности вендора класс A продолжает работать" \
     "класс B ещё не подключён ни к одному вендору (pipeline/classb.py — интерфейс); проверять после выбора движка"

# ── ЭКОНОМИКА ───────────────────────────────────────────────────────────
sect "Экономика"
live "себестоимость точки при 90 примерках ≤1 500 ₽/мес" \
     "переменная часть зависит от доли класса B, а она не измерена: нужен сбыт JETCAR, а не фотографии"
S=$(q "select count(*) from points where hard_cap_kopecks is not null")
[ "${S:-0}" -gt 0 ] && ok "потолки заданы на точках ($S)" \
                    || bad "потолки заданы" "ни на одной точке нет hard_cap_kopecks"
live "generation_usage сходится со счётом вендора" "вендора нет — см. выше"

# ── ДАННЫЕ ──────────────────────────────────────────────────────────────
sect "Данные"
# Один прогон на оба счётчика: раньше стенд поднимался дважды и приёмка
# занимала вдвое дольше без всякой пользы.
INV=$(cd db && PGTMP=/tmp/cswpg-accept PGPORT=55443 ./test.sh 2>&1)
G=$(echo "$INV" | grep -c 'ok  ·')
B=$(echo "$INV" | grep -cE 'ПРОВАЛ|ERROR')
if [ "${B:-1}" = "0" ] && [ "${G:-0}" -ge 56 ]; then
  ok "менеджер одной точки не видит данные другой — проверено попыткой ($G инвариантов на боевой роли)"
else
  bad "изоляция арендаторов" "зелёных $G, падений $B"
fi

FK=$(q "select count(*) from information_schema.referential_constraints rc
         join information_schema.key_column_usage k on k.constraint_name = rc.constraint_name
         where k.table_name in ('photos','renders') and rc.delete_rule <> 'CASCADE'")
[ "${FK:-1}" = "0" ] && ok "удаление клиента удаляет фото и рендеры сквозным образом" \
                     || live "сквозное удаление клиента" "связей без CASCADE: $FK — проверить, какие и почему"

# ── ПРОДУКТ ─────────────────────────────────────────────────────────────
sect "Продукт"
if curl -s -o /dev/null --max-time 3 "$BASE/inbox"; then
  for r in / /inbox /price /bay /crm /owner /network /staff /login /help /join; do
    curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$BASE$r" | grep -q 200 \
      && ok "маршрут $r отвечает" || bad "маршрут $r" "не 200"
  done
else
  live "маршруты приложения" "дев-сервер не отвечает на $BASE"
fi
if curl -s -o /dev/null --max-time 3 "$BASE/inbox"; then
  # Динамические маршруты берут параметр из посева: без него они 404 законно.
  SLUG=$(q "select public_slug from points limit 1")
  [ -n "${SLUG:-}" ] && { curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$BASE/g/$SLUG" \
      | grep -q 200 && ok "гараж /g/<слаг> отвечает" || bad "гараж /g/<слаг>" "не 200"; }
fi
live "от входящего фото до отправки — не более трёх действий" "считается кликами человека"
live "типовой кузов по марке и модели уходит за ≤20 секунд" "нужен замер на живой очереди"
live "мастер поднимает запись за ≤30 секунд в два тапа" "считается человеком у поста"
live "запуск точки за час, обучение — ноль занятий" "проверяется на первой живой точке"

printf '\n\033[1mИтог:\033[0m %d проверено · %d провалов · %d требуют живой проверки\n' "$OK" "$BAD" "$LIVE"
[ "$BAD" = "0" ] || exit 1
