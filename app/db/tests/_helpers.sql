-- Помощники стенда. Создаются ВЛАДЕЛЬЦЕМ схемы, а не ролью приложения:
-- в бою у приложения нет права создавать объекты в public, и стенд обязан
-- это повторять, иначе он проверяет не ту конфигурацию.
--
-- Функции намеренно security invoker (по умолчанию): тело обязано выполняться
-- от роли, которая их вызвала, — иначе RLS проверялся бы не для той роли.
\set ON_ERROR_STOP on

create or replace function expect_fail(stmt text, what text) returns void
  language plpgsql as $$
begin
  execute stmt;
  raise exception 'ПРОВАЛ: % — операция прошла, хотя обязана быть невозможной', what;
exception
  when restrict_violation or foreign_key_violation or check_violation
     or unique_violation or not_null_violation or raise_exception then
    raise notice 'ok  · %', what;
end $$;

create or replace function expect_ok(stmt text, what text) returns void
  language plpgsql as $$
begin
  execute stmt;
  raise notice 'ok  · %', what;
exception when others then
  raise exception 'ПРОВАЛ: % — операция не прошла: %', what, sqlerrm;
end $$;

grant execute on function expect_fail(text, text) to app_tenant;
grant execute on function expect_ok(text, text) to app_tenant;

-- Претензия арендатора. Ровно то, что делает withTenant() в приложении:
-- ставит request.jwt.claims, из которого политики RLS читают точку и роль.
-- Без этого роль приложения не может ни прочитать, ни вставить ничего —
-- и это правильно, так же будет в бою.
create or replace function act_as(point uuid, network uuid, app_role text default 'owner')
  returns void language sql as $$
  select set_config('request.jwt.claims',
    jsonb_build_object('point_id', point, 'network_id', network, 'app_role', app_role)::text,
    false)::void
$$;

-- Проверка, которой раньше не могло существовать: под суперпользователем
-- RLS не действует, поэтому «чужая точка не видна» было непроверяемым.
create or replace function expect_empty(q text, what text) returns void
  language plpgsql as $$
declare n int;
begin
  execute 'select count(*) from (' || q || ') t' into n;
  if n > 0 then
    raise exception 'ПРОВАЛ: % — видно % строк(и) чужого арендатора', what, n;
  end if;
  raise notice 'ok  · %', what;
end $$;

grant execute on function act_as(uuid, uuid, text) to app_tenant;
grant execute on function expect_empty(text, text) to app_tenant;

-- Отказ по RLS — отдельная проверка, а НЕ расширение expect_fail.
--
-- Соблазн был дописать insufficient_privilege в обработчик expect_fail, но это
-- превратило бы забытый grant в зелёный инвариант: любая проверка ограничения
-- падала бы по правам и засчитывалась как «операция невозможна». Ровно так уже
-- один раз молча ломался expect_fail, когда не ловил raise_exception.
create or replace function expect_denied(stmt text, what text) returns void
  language plpgsql as $$
begin
  execute stmt;
  raise exception 'ПРОВАЛ: % — операция прошла, хотя RLS обязан её отклонить', what;
exception
  when insufficient_privilege then
    raise notice 'ok  · %', what;
  when others then
    raise exception 'ПРОВАЛ: % — отклонено, но не политикой RLS: % (%)',
      what, sqlerrm, sqlstate;
end $$;

grant execute on function expect_denied(text, text) to app_tenant;
