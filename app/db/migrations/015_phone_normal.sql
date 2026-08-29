-- CarSwap AI · один телефон в разных написаниях — это один телефон
--
-- ЗАЧЕМ. Вход ищет сотрудника по телефону, а телефоны в базе записаны как
-- «+79161112233», вводят их как «8 916 111-22-33», а шлюзы присылают
-- «79161112233». Сравнение строк не совпадёт ни разу, и владелец точки просто
-- не войдёт — без единой ошибки на экране, потому что ответ при неудаче
-- намеренно одинаковый.
--
-- Нормализуем при сравнении, а не при записи: переписывать сохранённые номера
-- значит трогать данные, которые уже где-то показаны и на что-то ссылаются.

begin;

create or replace function app.normalize_phone(p text)
returns text language sql immutable as $$
  select case
    when d ~ '^8\d{10}$' then '7' || substr(d, 2)
    when d ~ '^\d{10}$'  then '7' || d
    else d
  end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) x
$$;

create index users_phone_normal on users (app.normalize_phone(phone));

create or replace function app.redeem_auth_code(p_phone text, p_hash text,
                                                p_user_agent text default null,
                                                p_ip inet default null)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  rec auth_codes;
  usr users;
  sid uuid;
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

  -- Сравнение по нормализованному виду: «+7…», «8…» и «7…» — один человек.
  select * into usr from users
   where app.normalize_phone(users.phone) = norm and users.active
   limit 1;
  if usr.id is null then
    return null;
  end if;

  insert into sessions (user_id, expires_at, user_agent, ip)
  values (usr.id, now() + interval '30 days', p_user_agent, p_ip)
  returning id into sid;
  return sid;
end $$;

create or replace function app.issue_auth_code(p_phone text, p_hash text)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare new_id uuid; norm text := app.normalize_phone(p_phone);
begin
  update auth_codes set used_at = now()
   where phone = norm and used_at is null and expires_at > now();
  insert into auth_codes (phone, code_hash, expires_at)
  values (norm, p_hash, now() + interval '10 minutes')
  returning id into new_id;
  return new_id;
end $$;

grant execute on function app.normalize_phone(text) to app_tenant;

commit;
