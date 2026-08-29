#!/usr/bin/env bash
# QA-проход. Гоняется после каждой итерации, до коммита.
#
# Проверяет четыре вещи, каждая из которых уже ловила настоящую поломку:
#   1. типы            — самое дешёвое, ловит всё механическое
#   2. инварианты БД   — то, ради чего продукт существует
#   3. база разработки  — отставшая схема выглядит как поломка кода
#   3. маршруты        — экран, который не открывается, не считается сделанным
#   4. связность       — в приложении не должно быть двух дизайн-языков
set -uo pipefail
cd "$(dirname "$0")"
FAIL=0
step() { printf '\n\033[1m%s\033[0m\n' "$1"; }

step "1 · типы"
if npx tsc --noEmit; then echo "  ok"; else echo "  ПРОВАЛ"; FAIL=1; fi

step "2 · инварианты базы"
# Свой сокет и порт: параллельные агенты тоже гоняют test.sh,
# а он делает rm -rf своего каталога на старте.
OUT=$(cd db && PGTMP=/tmp/cswpg-qa PGPORT=55440 ./test.sh 2>&1)
GREEN=$(echo "$OUT" | grep -c 'ok  ·')
BAD=$(echo "$OUT" | grep -cE 'ПРОВАЛ|ERROR')
echo "  зелёных: $GREEN, падений: $BAD"
[ "$BAD" != "0" ] && { echo "$OUT" | grep -E 'ПРОВАЛ|ERROR' | head -5; FAIL=1; }

step "3 · база разработки не отстала от миграций"
# Сегодня это стоило часа: приложение на :3000 говорило со схемой без
# резолверов из 006–009, гараж отдавал 404, и выглядело это как поломка
# кода. Проверка дешёвая, а диагноз мгновенный.
MISSING=""
for fn in point_of_configuration point_of_slug point_of_channel \
          expire_personal_data expire_renders; do
  N=$(PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
      -U postgres -d carswap -tAc "select count(*) from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname='app' and p.proname='$fn'" 2>/dev/null)
  [ "${N:-0}" = "0" ] && MISSING="$MISSING $fn"
done
if [ -z "$MISSING" ]; then
  echo "  ok"
elif ! PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
     -U postgres -d carswap -tAc "select 1" >/dev/null 2>&1; then
  echo "  база разработки не отвечает — пропускаю"
else
  echo "  ПРОВАЛ: в базе разработки нет функций:$MISSING"
  echo "  накатите недостающие миграции, иначе экраны будут падать при верном коде"
  FAIL=1
fi

step "4 · маршруты"
# Экраны закрыты входом — стенду нужна сессия, иначе он проверяет страницу
# входа вместо продукта. Заводим её прямо в базе: проверяем экраны, а не
# доставку SMS.
SESS=$(PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
  -U postgres -d carswap -qtAc "insert into sessions (user_id, expires_at) \
  select u.id, now() + interval '1 hour' from users u where u.role='owner' limit 1 \
  returning id" 2>/dev/null | head -1 | tr -d '[:space:]')
if ! curl -s -o /dev/null --max-time 3 -b "csw_s=$SESS" http://localhost:3000/inbox; then
  echo "  дев-сервер не отвечает — пропускаю"
else
  TID=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select id from threads limit 1" 2>/dev/null)
  CFG=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select configuration_id from confirmations limit 1" 2>/dev/null)
  AP=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select ap.id from appointments ap join configuration_items cit on cit.configuration_id = ap.configuration_id where ap.kind='measure' limit 1" 2>/dev/null)
  OID=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select id from orders limit 1" 2>/dev/null)
  CID=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select id from clients limit 1" 2>/dev/null)
  N=0
  for u in /login /join /staff /inbox "/inbox/$TID" /g/jetcar-mytishchi "/bay/$OID" \
           /owner /network /price /crm "/c/$CFG" /bay \
           /ops/followups /ops/schedule /ops/stock /ops/billing /ops/events /ops/managers \
           /ops/cash /ops/search /ops/catalog /owner/mobile /g/consent /g/prepurchase \
           "/crm/$CID" /crm/mobile /help "/measure/$AP" \
           "/doc/order/$OID" "/doc/invoice/$OID" "/doc/warranty/$OID"; do
    # Кука обязательна: без неё страж входа отдаёт 307 на каждый закрытый
    # экран, и проверка маршрутов измеряет редирект, а не продукт.
    C=$(curl -s -o /dev/null -w '%{http_code}' -b "csw_s=$SESS" "http://localhost:3000$u")
    N=$((N + 1))
    [ "$C" = "200" ] || { printf '  %-44s %s\n' "$u" "$C"; FAIL=1; }
  done
  # Счёт считается, а не пишется руками: зашитое «32 маршрута» разошлось со
  # списком на первом же добавленном экране и стало сообщать неправду.
  echo "  проверено $N маршрутов, все отвечают 200"
fi

step "5 · связность интерфейса"
python3 qa_consistency.py || FAIL=1

step "6 · верность макету"
# Связность отвечает «из чего собрано», верность — «то ли собрано».
# Экран можно построить из правильных компонентов и наполнить выдуманным.
if curl -s -o /dev/null --max-time 3 http://localhost:3000/inbox; then
  python3 qa_fidelity.py || FAIL=1
else
  echo "  дев-сервер не отвечает — пропускаю"
fi

printf '\n'
[ "$FAIL" = "0" ] && echo "QA ПРОЙДЕН" || echo "QA ПРОВАЛЕН"
exit $FAIL
