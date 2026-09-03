-- Вход: поиск пользователя без претензии арендатора.
--
-- ЧТО СЛОМАЛОСЬ. На стенде не мог войти никто. Код совпадал — строка в
-- auth_codes гасилась, — а сессии не появлялось: redeem_auth_code искала
-- пользователя в users, а users закрыта политикой «своя сеть», и у входа нет
-- претензии по построению — человек ещё не вошёл, откуда взяться сети.
-- session_claims ломалась так же: кука есть, претензии нет, кабинет пуст.
--
-- Пятый случай подряд: security definer НЕ отменяет force row level security,
-- политики читают претензию, а не роль базы. На машине разработчика этого
-- не видно, потому что там приложение ходит суперпользователем.
--
-- КАК УСТРОЕНО. Роль 'auth' в претензии — на время одного поиска. Ей видно
-- users только на чтение, и только внутри двух функций входа: вызвать
-- act_as_auth снаружи нельзя, право отозвано у всех. Претензия возвращается
-- сразу после поиска, а не в конце транзакции.
create or replace function app.act_as_auth() returns text
language plpgsql volatile security definer set search_path = public, app as $$
declare was text := current_setting('request.jwt.claims', true);
begin
  perform set_config('request.jwt.claims', '{"app_role":"auth"}', true);
  return coalesce(was, '');
end $$;
revoke execute on function app.act_as_auth() from public;

-- Разрешающая политика ТОЛЬКО на чтение и только для этой роли. Писать в users
-- вход не должен ни при каком исходе.
drop policy if exists users_auth_lookup on users;
create policy users_auth_lookup on users
  for select using (app.current_role_name() = 'auth');

create or replace function app.redeem_auth_code(
  p_phone text, p_hash text, p_user_agent text default null, p_ip inet default null)
returns uuid
language plpgsql security definer set search_path = public, pg_temp, app as $$
declare
  rec auth_codes;
  usr users;
  sid uuid;
  was text;
  norm text := app.normalize_phone(p_phone);
begin
  select * into rec from auth_codes
   where phone = norm and used_at is null and expires_at > now()
   order by created_at desc limit 1
   for update;

  if rec.id is null then
    return null;
  end if;

  if rec.attempts >= 5 then
    update auth_codes set used_at = now() where id = rec.id;
    return null;
  end if;

  if rec.code_hash is distinct from p_hash then
    update auth_codes set attempts = rec.attempts + 1 where id = rec.id;
    return null;
  end if;

  update auth_codes set used_at = now() where id = rec.id;

  -- Поиск человека — под ролью входа. Сравнение по нормализованному виду:
  -- «+7…», «8…» и «7…» — один человек.
  was := app.act_as_auth();
  select * into usr from users
   where app.normalize_phone(users.phone) = norm and users.active
   limit 1;
  perform app.restore_claims(was);

  if usr.id is null then
    return null;
  end if;

  insert into sessions (user_id, expires_at, user_agent, ip)
  values (usr.id, now() + interval '30 days', p_user_agent, p_ip)
  returning id into sid;
  return sid;
end $$;

-- plpgsql и volatile, а не sql stable: подмена претензии — изменяющая
-- операция, внутри stable она не срабатывает (уже ловили на счётчике гаража).
drop function if exists app.session_claims(uuid);
create function app.session_claims(p_session uuid)
returns table (user_id uuid, point_id uuid, network_id uuid, app_role text)
language plpgsql volatile security definer set search_path = public, pg_temp, app as $$
declare was text;
begin
  was := app.act_as_auth();
  return query
    select u.id, u.point_id, u.network_id, u.role::text
      from sessions s join users u on u.id = s.user_id
     where s.id = p_session
       and s.revoked_at is null
       and s.expires_at > now()
       and u.active;
  perform app.restore_claims(was);
end $$;

grant execute on function app.redeem_auth_code(text, text, text, inet) to app_tenant;
grant execute on function app.session_claims(uuid) to app_tenant;
