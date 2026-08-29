#!/bin/bash
# Инициализация кластера: роли и расширения.
#
# Отрабатывает ровно один раз — официальный образ postgres запускает
# /docker-entrypoint-initdb.d/* только при пустом каталоге данных. Повторный
# `docker compose up` сюда не заходит. Если понадобилось переиграть роли на
# живом кластере — руками через psql, а не удалением тома.
#
# Ролевая модель. Три роли и ни одной лишней:
#
#   app_tenant     живой путь. NOLOGIN, не superuser, не владелец таблиц.
#                  Изоляция точек держится RLS, а RLS с force применяется
#                  и к владельцу — но superuser её обходит. Поэтому роль,
#                  под которой идут запросы экранов, не должна быть ни тем
#                  ни другим: иначе §13 перестаёт проверяться на живом пути,
#                  и точка увидит чужих клиентов.
#
#   carswap_owner  владелец схемы, под ним едут миграции. Не superuser.
#                  Владелец один и тот же всегда: alter default privileges
#                  в 005_grants.sql действует от имени того, кто его
#                  выполнил, и сменившийся владелец молча оставит таблицы
#                  следующих миграций без прав арендатора.
#
#   carswap_app    роль подключения приложения. Своих прав не имеет,
#                  входит в app_tenant — этого хватает, чтобы сработал
#                  `set local role app_tenant` из app/src/lib/db.ts.
set -euo pipefail

: "${CARSWAP_OWNER_PASSWORD:?не задан CARSWAP_OWNER_PASSWORD}"
: "${CARSWAP_APP_PASSWORD:?не задан CARSWAP_APP_PASSWORD}"

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
     -v owner_pw="$CARSWAP_OWNER_PASSWORD" \
     -v app_pw="$CARSWAP_APP_PASSWORD" \
     -v dbname="$POSTGRES_DB" <<-'SQL'

	create role app_tenant nologin;

	create role carswap_owner login password :'owner_pw'
	  nosuperuser nocreatedb nocreaterole nobypassrls;

	create role carswap_app login password :'app_pw'
	  nosuperuser nocreatedb nocreaterole nobypassrls in role app_tenant;

	-- Владение и право создавать объекты — только у владельца схемы.
	alter database :"dbname" owner to carswap_owner;
	alter schema public owner to carswap_owner;

	-- Подключаться к базе может только тот, кому это нужно.
	revoke connect on database :"dbname" from public;
	grant  connect on database :"dbname" to carswap_owner, carswap_app;

	-- Расширения ставит суперпользователь при инициализации.
	-- Миграция 001 создаёт их же через `if not exists`, так что накат
	-- на чужой кластер (управляемый Postgres, куда init-скриптов не
	-- положить) тоже пройдёт: pgcrypto и pg_trgm с PG13 доверенные,
	-- их поставит и владелец базы без прав суперпользователя.
	create extension if not exists pgcrypto;
	create extension if not exists pg_trgm;

SQL

echo "роли app_tenant / carswap_owner / carswap_app и расширения созданы"
