#!/usr/bin/env bash
# Поднять кластер с БОЕВОЙ ролевой моделью и выполнить в нём команду.
#
# Зачем отдельно от db/test.sh: тот гоняет SQL и гасит кластер сразу. Здесь
# нужен живой сервер на время прогона кода приложения — иначе сквозные
# проверки идут против базы разработки, а она отстала от миграций.
#
#   ./e2e/livedb.sh 'команда'    — $DATABASE_URL уже выставлен для команды
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
export LC_ALL=C LANG=C
S=${PGTMP:-/tmp/cswlive}; D=$S/data; PORT=${PGPORT:-55450}
cd "$(dirname "$0")/.."

rm -rf "$S"; mkdir -p "$S"
initdb -D "$D" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
pg_ctl -D "$D" -o "-p $PORT -k $S -c listen_addresses=''" -l "$S/log" start >/dev/null
trap 'pg_ctl -D "$D" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$S"' EXIT
until pg_isready -h "$S" -p "$PORT" -q; do sleep 0.3; done

psql -h "$S" -p "$PORT" -U postgres -q -c "create database carswap;"
psql -h "$S" -p "$PORT" -U postgres -q -d carswap -c "
  create role app_tenant nologin;
  create role carswap_owner login createrole;
  create role carswap_app login in role app_tenant;
  alter database carswap owner to carswap_owner;
  grant all on schema public to carswap_owner;
  create extension if not exists pgcrypto;
  create extension if not exists pg_trgm;"
for m in db/migrations/*.sql; do
  psql -h "$S" -p "$PORT" -U carswap_owner -q -d carswap -v ON_ERROR_STOP=1 -f "$m"
done
# Посев идёт суперпользователем: force RLS действует и на владельца схемы,
# поэтому иначе он не пройдёт. В бою это тоже отдельный шаг установки.
[ -f db/seed.sql ] && psql -h "$S" -p "$PORT" -U postgres -q -d carswap -f db/seed.sql >/dev/null 2>&1

export DATABASE_URL="postgresql://carswap_app@/carswap?host=$S&port=$PORT"
eval "$@"
