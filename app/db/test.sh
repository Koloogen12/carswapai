#!/usr/bin/env bash
# Прогон тестов на инварианты на временном кластере Postgres.
# Ничего не оставляет после себя: кластер поднимается и гасится.
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export LC_ALL=C LANG=C
S=${PGTMP:-/tmp/cswpg}; D=$S/data; PORT=${PGPORT:-55432}

rm -rf "$S"; mkdir -p "$S"
initdb -D "$D" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
pg_ctl -D "$D" -o "-p $PORT -k $S -c listen_addresses=''" -l "$S/log" start >/dev/null
trap 'pg_ctl -D "$D" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$S"' EXIT
until pg_isready -h "$S" -p "$PORT" -q; do sleep 0.3; done

psql -h "$S" -p "$PORT" -U postgres -q -c "create database carswap;"
for m in migrations/*.sql; do
  psql -h "$S" -p "$PORT" -U postgres -d carswap -q -v ON_ERROR_STOP=1 -f "$m"
done
psql -h "$S" -p "$PORT" -U postgres -d carswap -v ON_ERROR_STOP=1 -f tests/invariants.sql -f tests/queue.sql -f tests/consent-rolls.sql 2>&1 \
  | grep -E 'ok  ·|ПРОВАЛ|ERROR'
