-- CarSwap AI · вход по коду и сессии
--
-- ЧТО ЗАКРЫВАЕТ. Авторизации не было вовсе: `MANAGER` был константой в коде с
-- комментарием «в проде придут из сессии». Проверено вживую — телефон, которого
-- нет в базе, и произвольный код открывали инбокс точки со всеми клиентами,
-- их телефонами, перепиской, прайсом и выручкой. Для юрлица, зарегистрированного
-- оператором персональных данных, это инцидент неправомерного доступа.
--
-- ПОЧЕМУ КОД, А НЕ ПАРОЛЬ. Решение продукта, и оно записано на экране входа:
-- «пароля в продукте нет». Пароль у точки с тремя сотрудниками живёт на
-- стикере под клавиатурой; телефон уже есть и уже проверен при выдаче доступа.
--
-- ЧТО ЗДЕСЬ ВАЖНО И ПОЧЕМУ ИМЕННО ТАК:
--
--   код хранится хешем, а не текстом. Утечка таблицы не даёт войти.
--   попытки считаются. Четырёхзначный код перебирается за секунды, если не
--     считать: пять попыток — и код мёртв.
--   код одноразовый и живёт 10 минут.
--   претензии НЕ хранятся в сессии. Роль, точка и признак active читаются из
--     users при КАЖДОМ запросе: иначе отзыв доступа уволенному менеджеру не
--     действовал бы до истечения его сессии, а на экране сотрудников написано
--     «отзыв — один клик, диалоги остаются в инбоксе точки».

begin;

create table auth_codes (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null,
  code_hash     text not null,
  expires_at    timestamptz not null,
  attempts      smallint not null default 0,
  used_at       timestamptz,
  created_at    timestamptz not null default now(),
  check (attempts >= 0 and attempts <= 5)
);
create index auth_codes_phone on auth_codes (phone, created_at desc);

-- Кода вне RLS: он выдаётся ДО того, как известен арендатор — по телефону.
-- Персональных данных сверх самого телефона в нём нет, а телефон здесь
-- ключ входа, а не сведение о человеке.

create table sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id),
  issued_at     timestamptz not null default now(),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  user_agent    text,
  ip            inet
);
create index sessions_user on sessions (user_id) where revoked_at is null;

-- ── Выдача кода ────────────────────────────────────────────
-- Возвращает id записи. Сам код знает только вызывающий: он его и породил.
-- Функция security definer, потому что вызывается ДО входа, когда претензий
-- нет ни у кого.
create or replace function app.issue_auth_code(p_phone text, p_hash text)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare new_id uuid;
begin
  -- Прежние коды этого телефона гасим: два живых кода означают, что перебор
  -- получает два шанса вместо одного.
  update auth_codes set used_at = now()
   where phone = p_phone and used_at is null and expires_at > now();

  insert into auth_codes (phone, code_hash, expires_at)
  values (p_phone, p_hash, now() + interval '10 minutes')
  returning id into new_id;
  return new_id;
end $$;

-- ── Проверка кода и выдача сессии ──────────────────────────
-- Возвращает id сессии или null. Причину неудачи наружу НЕ отдаём подробно:
-- «нет такого телефона» и «неверный код» — разные ответы, и по разнице между
-- ними перебирают базу сотрудников.
create or replace function app.redeem_auth_code(p_phone text, p_hash text,
                                                p_user_agent text default null,
                                                p_ip inet default null)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  rec auth_codes;
  usr users;
  sid uuid;
begin
  select * into rec from auth_codes
   where phone = p_phone and used_at is null and expires_at > now()
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

  -- Пользователь ищется ПОСЛЕ проверки кода: иначе по времени ответа можно
  -- узнать, есть ли такой телефон в системе.
  select * into usr from users
   where users.phone = p_phone and users.active
   limit 1;
  if usr.id is null then
    return null;
  end if;

  insert into sessions (user_id, expires_at, user_agent, ip)
  values (usr.id, now() + interval '30 days', p_user_agent, p_ip)
  returning id into sid;
  return sid;
end $$;

-- ── Претензии по сессии ────────────────────────────────────
-- Роль и точка читаются ИЗ БАЗЫ при каждом запросе, а не из куки. Подделав
-- куку, нельзя стать владельцем: там только идентификатор сессии.
create or replace function app.session_claims(p_session uuid)
returns table (user_id uuid, point_id uuid, network_id uuid, app_role text)
language sql stable security definer set search_path = public, pg_temp as $$
  select u.id, u.point_id, u.network_id, u.role::text
    from sessions s join users u on u.id = s.user_id
   where s.id = p_session
     and s.revoked_at is null
     and s.expires_at > now()
     and u.active
$$;

-- ── Выход ──────────────────────────────────────────────────
-- Отдельной функцией по той же причине, что и всё остальное здесь: прямого
-- доступа к таблице сессий у приложения нет. Отзыв идёт по идентификатору,
-- который у вызывающего и так в куке, — ничего сверх уже известного он не
-- узнаёт.
create or replace function app.revoke_session(p_session uuid)
returns void language sql security definer set search_path = public, pg_temp as $$
  update sessions set revoked_at = now()
   where id = p_session and revoked_at is null
$$;

-- ── Доступ к самим таблицам закрыт правами, а не политиками ──
-- RLS здесь не работает по построению: и код, и сессия нужны ДО того, как
-- арендатор известен — политике не на что опереться. Поэтому таблицы
-- закрываются жёстче: приложение не может читать их вовсе, ни запросом, ни
-- через sys(). Единственный путь — три функции ниже, и каждая делает ровно
-- одно действие.
--
-- Это сильнее RLS, а не слабее: там роль видит свои строки, здесь — ни одной.
revoke all on table auth_codes from app_tenant, public;
revoke all on table sessions   from app_tenant, public;

revoke all on function app.issue_auth_code(text, text) from public;
revoke all on function app.redeem_auth_code(text, text, text, inet) from public;
revoke all on function app.session_claims(uuid) from public;
grant execute on function app.issue_auth_code(text, text) to app_tenant;
grant execute on function app.redeem_auth_code(text, text, text, inet) to app_tenant;
grant execute on function app.session_claims(uuid) to app_tenant;
revoke all on function app.revoke_session(uuid) from public;
grant execute on function app.revoke_session(uuid) to app_tenant;

commit;
