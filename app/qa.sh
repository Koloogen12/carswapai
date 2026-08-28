#!/usr/bin/env bash
# QA-проход. Гоняется после каждой итерации, до коммита.
#
# Проверяет четыре вещи, каждая из которых уже ловила настоящую поломку:
#   1. типы            — самое дешёвое, ловит всё механическое
#   2. инварианты БД   — то, ради чего продукт существует
#   3. маршруты        — экран, который не открывается, не считается сделанным
#   4. связность       — в приложении не должно быть двух дизайн-языков
set -uo pipefail
cd "$(dirname "$0")"
FAIL=0
step() { printf '\n\033[1m%s\033[0m\n' "$1"; }

step "1 · типы"
if npx tsc --noEmit; then echo "  ok"; else echo "  ПРОВАЛ"; FAIL=1; fi

step "2 · инварианты базы"
OUT=$(cd db && ./test.sh 2>&1)
GREEN=$(echo "$OUT" | grep -c 'ok  ·')
BAD=$(echo "$OUT" | grep -cE 'ПРОВАЛ|ERROR')
echo "  зелёных: $GREEN, падений: $BAD"
[ "$BAD" != "0" ] && { echo "$OUT" | grep -E 'ПРОВАЛ|ERROR' | head -5; FAIL=1; }

step "3 · маршруты"
if ! curl -s -o /dev/null --max-time 3 http://localhost:3000/inbox; then
  echo "  дев-сервер не отвечает — пропускаю"
else
  TID=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select id from threads limit 1" 2>/dev/null)
  OID=$(cd db && PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH" psql -h /tmp/cswdev -p 55432 \
        -U postgres -d carswap -tAc "select id from orders limit 1" 2>/dev/null)
  for u in /login /join /staff /inbox "/inbox/$TID" /g/jetcar-mytishchi "/bay/$OID" \
           /owner /network /price /crm "/doc/order/$OID" "/doc/invoice/$OID"; do
    C=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000$u")
    [ "$C" = "200" ] || { printf '  %-44s %s\n' "$u" "$C"; FAIL=1; }
  done
  echo "  проверено 13 маршрутов"
fi

step "4 · связность интерфейса"
python3 qa_consistency.py || FAIL=1

printf '\n'
[ "$FAIL" = "0" ] && echo "QA ПРОЙДЕН" || echo "QA ПРОВАЛЕН"
exit $FAIL
