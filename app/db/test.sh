#!/usr/bin/env bash
# Прогон тестов на инварианты на временном кластере Postgres.
#
# ВАЖНО ПРО РОЛИ. Раньше здесь всё шло от postgres, и это делало проверки
# изоляции бессмысленными: суперпользователь обходит RLS всегда, поэтому
# «49 зелёных» доказывали работу схемы, которой в бою не существует.
#
# Теперь стенд повторяет боевую модель из deploy/postgres/initdb:
#   carswap_owner — владелец схемы, НЕ суперпользователь, накатывает миграции;
#   carswap_app   — под ним работает приложение, входит в app_tenant;
#   app_tenant    — nologin, держит гранты.
# Тесты идут под carswap_app. Претензию арендатора они выставляют сами —
# ровно так же, как это делает withTenant() в приложении.
#
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

su_() { psql -h "$S" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1 "$@"; }
su_ -c "create database carswap;"
su_ -d carswap -c "
  create role app_tenant nologin;
  create role carswap_owner login createrole;
  create role carswap_app login in role app_tenant;
  alter database carswap owner to carswap_owner;
  grant all on schema public to carswap_owner;
  create extension if not exists pgcrypto;
  create extension if not exists pg_trgm;"

# Миграции — от владельца схемы, как migrate.sh на сервере.
for m in migrations/*.sql; do
  psql -h "$S" -p "$PORT" -U carswap_owner -d carswap -q -v ON_ERROR_STOP=1 -f "$m"
done

# Стенд обязан идти НЕ от суперпользователя: он обходит RLS всегда, и любая
# проверка изоляции под ним ложно-зелёная. Проверяем это, а не верим на слово —
# именно так стенд однажды уже полгода доказывал схему, которой в бою нет.
psql -h "$S" -p "$PORT" -U carswap_app -d carswap -q -v ON_ERROR_STOP=1 -c "
do \$\$ begin
  if (select rolsuper from pg_roles where rolname = current_user) then
    raise exception 'СТЕНД НЕГОДЕН: тесты идут от суперпользователя, RLS не проверяется';
  end if;
  if (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'
         and c.relrowsecurity and not c.relforcerowsecurity) > 0 then
    raise exception 'СТЕНД НЕГОДЕН: есть таблицы с RLS без force — владелец их обойдёт';
  end if;
end \$\$;"

# Помощники стенда — от владельца: у роли приложения нет create в public.
psql -h "$S" -p "$PORT" -U carswap_owner -d carswap -q -v ON_ERROR_STOP=1 -f tests/_helpers.sql

# Тесты — от роли приложения. Она не суперпользователь и не владелец,
# то есть RLS для неё действует так же, как в бою.
psql -h "$S" -p "$PORT" -U carswap_app -d carswap -v ON_ERROR_STOP=1 \
  -f tests/invariants.sql -f tests/queue.sql -f tests/consent-rolls.sql -f tests/operations.sql -f tests/renders-erasure.sql -f tests/channel-resolver.sql -f tests/offer-consent.sql -f tests/auth.sql \
  -f tests/retention.sql \
  -f tests/client-link.sql 2>&1 \
  | grep -E 'ok  ·|ПРОВАЛ|ERROR'
