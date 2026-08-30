#!/bin/bash
# Роли и расширения. Выполняется ОДИН раз, при первичной инициализации
# кластера, от суперпользователя postgres.
#
# Почему postgres остаётся суперпользователем базы, хотя приложение под ним не
# работает: общий ночной бэкап сервера делает `pg_dumpall -U postgres`. Роль с
# другим именем означала бы, что дамп падает, а в папку бэкапа ложится пустой
# файл, который выглядит как настоящая копия (см. 3.4 спеки переезда).
#
# Три роли повторяют стенд один в один — иначе стенд проверял бы не ту
# конфигурацию, что работает в бою:
#   carswap_owner — владелец схемы, НЕ суперпользователь, накатывает миграции;
#   carswap_app   — под ним работает приложение, входит в app_tenant;
#   carswap_worker — под ним работает воркер примерки, обходит политики;
#   app_tenant    — nologin, держит гранты; заводится миграцией 005.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
  create role carswap_owner login createrole password '${OWNER_PASSWORD}';
  create role carswap_app   login password '${APP_PASSWORD}';
  -- Воркер: не арендатор. Обслуживает очередь всех точек, поэтому обходит
  -- политики — их выдаёт суперпользователь и только здесь. Границу задают
  -- гранты в миграции 025, и проверяет её db/tests/worker-role.sql.
  create role carswap_worker login bypassrls password '${WORKER_PASSWORD}';
  alter database "$POSTGRES_DB" owner to carswap_owner;
  grant all on schema public to carswap_owner;
  create extension if not exists pgcrypto;
  create extension if not exists pg_trgm;
SQL

# app_tenant заводит миграция 005, и carswap_app входит в неё после наката.
# Здесь этого сделать нельзя: роли ещё нет.
echo "роли carswap_owner и carswap_app созданы"
