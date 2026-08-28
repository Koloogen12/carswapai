-- CarSwap AI · миграция 005 · права роли арендатора
--
-- Гранты выдавались один раз после первой миграции, поэтому таблицы из 004
-- оказались без прав, и экраны падали с «permission denied». Права должны
-- ехать вместе со схемой, а не выдаваться руками при разворачивании.
--
-- Роль намеренно НЕ superuser и НЕ владелец таблиц: RLS с force применяется
-- к владельцу тоже, но superuser её обходит — и тогда изоляция точек
-- перестаёт проверяться на живом пути.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'app_tenant') then
    create role app_tenant nologin;
  end if;
end $$;

grant usage on schema public, app to app_tenant;
grant select, insert, update, delete on all tables in schema public to app_tenant;
grant usage, select on all sequences in schema public to app_tenant;
grant execute on all functions in schema app to app_tenant;

-- Всё, что появится дальше, получает права автоматически.
alter default privileges in schema public
  grant select, insert, update, delete on tables to app_tenant;
alter default privileges in schema public
  grant usage, select on sequences to app_tenant;
alter default privileges in schema app
  grant execute on functions to app_tenant;
