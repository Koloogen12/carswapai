-- Вход по e-mail вместо телефона.
--
-- ЧТО МЕНЯЕТСЯ. Учётные данные сотрудника — адрес почты. Телефон остаётся
-- как контакт (users.phone), но входа больше не даёт: код уходит письмом, а
-- не SMS. Клиентов это не касается вовсе — у них свой телефон в clients, и
-- в кабинет они не входят.
--
-- ПОЧЕМУ ОТДЕЛЬНЫЙ СТОЛБЕЦ, А НЕ ПЕРЕИМЕНОВАНИЕ phone. Телефон сотрудника
-- нужен точке сам по себе: мастера зовут на пост, менеджеру звонят. Это
-- данные, а не учётные данные, и они переживают смену способа входа.
--
-- Нормализация — в базе, одной функцией, и хеш кода в приложении считается
-- от той же формы. Иначе «Ivan@Mail.ru» и «ivan@mail.ru» были бы двумя
-- людьми при входе и одним при приглашении.
create or replace function app.normalize_email(p text) returns text
language sql immutable as $$
  select nullif(lower(btrim(coalesce(p, ''))), '')
$$;
grant execute on function app.normalize_email(text) to app_tenant;

alter table users add column if not exists email text;

-- Уникальность по нормализованной форме и только среди заполненных: старые
-- строки без почты друг другу не мешают, а две одинаковые почты — ошибка.
create unique index if not exists users_email_norm
  on users (app.normalize_email(email)) where email is not null;

-- Столбец кода входа теперь хранит учётные данные, а не телефон.
alter table auth_codes rename column phone to login;

-- Снимаем старые версии: у них параметр называется p_phone, а Postgres не
-- даёт переименовать входной параметр через create or replace. Права выдаются
-- заново в конце миграции.
drop function if exists app.issue_auth_code(text, text);
drop function if exists app.redeem_auth_code(text, text, text, inet);

create function app.issue_auth_code(p_login text, p_hash text)
returns uuid language plpgsql security definer set search_path = public, pg_temp, app as $$
declare new_id uuid; norm text := app.normalize_email(p_login);
begin
  if norm is null then
    raise exception 'пустые учётные данные' using errcode = 'check_violation';
  end if;
  update auth_codes set used_at = now()
   where login = norm and used_at is null and expires_at > now();
  insert into auth_codes (login, code_hash, expires_at)
  values (norm, p_hash, now() + interval '10 minutes')
  returning id into new_id;
  return new_id;
end $$;

create function app.redeem_auth_code(
  p_login text, p_hash text, p_user_agent text default null, p_ip inet default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp, app as $$
declare
  rec auth_codes;
  usr users;
  sid uuid;
  was text;
  norm text := app.normalize_email(p_login);
begin
  select * into rec from auth_codes
   where login = norm and used_at is null and expires_at > now()
   order by created_at desc limit 1
   for update;
  if rec.id is null then return null; end if;

  if rec.attempts >= 5 then
    update auth_codes set used_at = now() where id = rec.id;
    return null;
  end if;
  if rec.code_hash is distinct from p_hash then
    update auth_codes set attempts = rec.attempts + 1 where id = rec.id;
    return null;
  end if;
  update auth_codes set used_at = now() where id = rec.id;

  -- Поиск человека — под ролью входа (030): у входа нет претензии по
  -- построению. Сравнение по нормализованной почте.
  was := app.act_as_auth();
  select * into usr from users
   where app.normalize_email(users.email) = norm and users.active
   limit 1;
  perform app.restore_claims(was);
  if usr.id is null then return null; end if;

  insert into sessions (user_id, expires_at, user_agent, ip)
  values (usr.id, now() + interval '30 days', p_user_agent, p_ip)
  returning id into sid;
  return sid;
end $$;

-- Регистрация точки по приглашению сети: та же проверка кода, только по
-- почте, и владелец создаётся с почтой как учётными данными.
drop function if exists app.redeem_network_invite(text, text, text, text, text, text);
create function app.redeem_network_invite(
  p_code text, p_email text, p_hash text, p_point_name text, p_address text, p_user_name text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp, app as $$
declare
  rec  auth_codes;
  inv  invites;
  new_point uuid;
  new_user  uuid;
  sid  uuid;
  norm text := app.normalize_email(p_email);
  base text;
  prev text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  select * into rec from auth_codes
   where login = norm and used_at is null and expires_at > now()
   order by created_at desc limit 1
   for update;
  if rec.id is null then return null; end if;
  if rec.attempts >= 5 then
    update auth_codes set used_at = now() where id = rec.id;
    return null;
  end if;
  if rec.code_hash is distinct from p_hash then
    update auth_codes set attempts = rec.attempts + 1 where id = rec.id;
    return null;
  end if;
  update auth_codes set used_at = now() where id = rec.id;

  perform set_config('request.jwt.claims',
    jsonb_build_object('invite_code', p_code)::text, true);
  select * into inv from invites where code = p_code for update;
  if inv.id is null or inv.network_id is null or inv.point_id is not null then
    raise exception 'Приглашение сети не найдено' using errcode = 'restrict_violation';
  end if;

  new_point := gen_random_uuid();
  perform set_config('request.jwt.claims', jsonb_build_object(
    'point_id', new_point, 'network_id', inv.network_id,
    'app_role', 'owner')::text, true);

  base := app.slugify(p_point_name);
  for i in 1..20 loop
    begin
      insert into points (id, network_id, name, address, public_slug)
      values (new_point, inv.network_id, p_point_name, nullif(p_address, ''),
              case when i = 1 then base else base || '-' || i end);
      exit;
    exception when unique_violation then
      if i = 20 then raise; end if;
    end;
  end loop;

  insert into users (point_id, network_id, role, name, email)
  values (new_point, inv.network_id, inv.role, p_user_name, norm)
  returning id into new_user;

  perform app.consume_invite(p_code, new_user);

  insert into sessions (user_id, expires_at)
  values (new_user, now() + interval '30 days')
  returning id into sid;

  perform set_config('request.jwt.claims', prev, true);
  return sid;
end $$;

grant execute on function app.issue_auth_code(text, text) to app_tenant;
grant execute on function app.redeem_auth_code(text, text, text, inet) to app_tenant;
grant execute on function app.redeem_network_invite(text, text, text, text, text, text) to app_tenant;

-- Строки посева и стенда без почты войти не смогут — и правильно: учётные
-- данные заводятся явно, а не выводятся из телефона.
