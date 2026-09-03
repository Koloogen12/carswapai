-- Вход по коду и сессии (миграция 014).
--
-- Закрывает дыру, найденную живым прогоном: телефон, которого нет в базе, и
-- произвольный код открывали инбокс точки со всеми клиентами, их телефонами,
-- перепиской и выручкой. Здесь доказывается, что так больше нельзя.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-cccc-0000-0000-000000000001'''
\set P '''aaaaaaaa-cccc-0000-0000-000000000001'''
\set U '''cccccccc-cccc-0000-0000-000000000001'''
\set U2 '''cccccccc-cccc-0000-0000-000000000002'''

insert into networks (id, name, join_code, price_deviation_allowed_pct)
  values (:N,'Сеть входа','AUTH-2026', 10);
select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка','auth-a');
insert into users (id, point_id, network_id, role, name, phone) values
  (:U,:P,:N,'manager','Менеджер','79991110001'),
  (:U2,:P,:N,'owner','Владелец','79991110002');

-- ── Неизвестный телефон входа не даёт ────────────────────────
do $$
declare sid uuid;
begin
  perform app.issue_auth_code('79990000000', 'хеш-чужого');
  sid := app.redeem_auth_code('79990000000', 'хеш-чужого');
  if sid is not null then
    raise exception 'ПРОВАЛ: телефон, которого нет среди сотрудников, получил сессию';
  end if;
  raise notice 'ok  · телефон вне списка сотрудников сессии не получает';
end $$;

-- ── Неверный код не пускает ──────────────────────────────────
-- Счётчик попыток НЕ читаем полем: приложение не имеет доступа к таблице, и
-- это осознанно. Проверяем поведение — оно и есть инвариант, а поле лишь
-- способ его добиться.
do $$
declare sid uuid;
begin
  perform app.issue_auth_code('79991110001', 'правильный');
  sid := app.redeem_auth_code('79991110001', 'неправильный');
  if sid is not null then
    raise exception 'ПРОВАЛ: неверный код открыл сессию';
  end if;
  raise notice 'ok  · неверный код не пускает';
end $$;

-- ── Перебор упирается в пять попыток ─────────────────────────
do $$
declare sid uuid;
begin
  for i in 1..5 loop
    perform app.redeem_auth_code('79991110001', 'мимо' || i);
  end loop;
  -- Даже ПРАВИЛЬНЫЙ код после исчерпания попыток уже не работает: иначе
  -- ограничение считало бы попытки, но ничего не ограничивало.
  sid := app.redeem_auth_code('79991110001', 'правильный');
  if sid is not null then
    raise exception 'ПРОВАЛ: код пережил перебор — четыре цифры подберут за секунды';
  end if;
  raise notice 'ok  · после пяти промахов код мёртв, даже если угадали';
end $$;

-- ── Правильный код открывает сессию ──────────────────────────
do $$
declare sid uuid; r record;
begin
  perform app.issue_auth_code('79991110001', 'верный-хеш');
  sid := app.redeem_auth_code('79991110001', 'верный-хеш');
  if sid is null then
    raise exception 'ПРОВАЛ: верный код сессию не открыл';
  end if;
  raise notice 'ok  · верный код открывает сессию';

  select * into r from app.session_claims(sid);
  if r.user_id is distinct from 'cccccccc-cccc-0000-0000-000000000001'::uuid then
    raise exception 'ПРОВАЛ: сессия выдана не тому пользователю';
  end if;
  if r.app_role <> 'manager' then
    raise exception 'ПРОВАЛ: роль пришла не из базы, а откуда-то ещё: %', r.app_role;
  end if;
  raise notice 'ok  · роль и точка читаются из базы, а не из куки';
end $$;

-- ── Код одноразовый ──────────────────────────────────────────
do $$
declare sid uuid;
begin
  perform app.issue_auth_code('79991110002', 'одноразовый');
  sid := app.redeem_auth_code('79991110002', 'одноразовый');
  if sid is null then raise exception 'ПРОВАЛ: подготовка не удалась'; end if;
  sid := app.redeem_auth_code('79991110002', 'одноразовый');
  if sid is not null then
    raise exception 'ПРОВАЛ: код сработал второй раз';
  end if;
  raise notice 'ok  · код одноразовый';
end $$;

-- ── Отзыв доступа действует НЕМЕДЛЕННО ───────────────────────
-- На экране сотрудников написано «отзыв — один клик». Если бы претензии
-- лежали в куке, уволенный менеджер работал бы до конца своей сессии.
do $$
declare sid uuid; n int;
begin
  perform app.issue_auth_code('79991110001', 'ещё-один');
  sid := app.redeem_auth_code('79991110001', 'ещё-один');
  update users set active = false where id = 'cccccccc-cccc-0000-0000-000000000001';
  select count(*) into n from app.session_claims(sid);
  if n <> 0 then
    raise exception 'ПРОВАЛ: отозванный сотрудник продолжает работать по старой сессии';
  end if;
  raise notice 'ok  · отзыв доступа действует немедленно, а не после сессии';
  update users set active = true where id = 'cccccccc-cccc-0000-0000-000000000001';
end $$;

-- ── Отозванная сессия мертва ─────────────────────────────────
do $$
declare sid uuid; n int;
begin
  perform app.issue_auth_code('79991110001', 'для-выхода');
  sid := app.redeem_auth_code('79991110001', 'для-выхода');
  perform app.revoke_session(sid);
  select count(*) into n from app.session_claims(sid);
  if n <> 0 then
    raise exception 'ПРОВАЛ: сессия жива после выхода';
  end if;
  raise notice 'ok  · выход действительно закрывает сессию';
end $$;

-- ── Один телефон в разных написаниях — один человек ──────────
-- В базе номера с плюсом, вводят их с восьмёркой и пробелами, шлюзы шлют
-- голыми цифрами. Без приведения владелец точки просто не войдёт — и не
-- узнает почему, потому что ответ при неудаче намеренно одинаковый.
do $$
declare sid uuid;
begin
  perform app.issue_auth_code('8 (999) 111-00-01', 'разное-написание');
  sid := app.redeem_auth_code('+7 999 111 00 01', 'разное-написание');
  if sid is null then
    raise exception 'ПРОВАЛ: «8 999…» и «+7 999…» приняты за разные телефоны';
  end if;
  raise notice 'ok  · телефон узнаётся в любом написании';
end $$;

-- ── Приложение не читает коды и сессии напрямую ──────────────
-- Это сильнее RLS: там роль видит свои строки, здесь — ни одной.
select expect_denied($$ select 1 from auth_codes $$,
  'Приложение не может читать коды входа даже своей точки');
select expect_denied($$ select 1 from sessions $$,
  'Приложение не может читать таблицу сессий');

-- ── Вход без претензии арендатора (миграция 030) ──────────────
-- На стенде не мог войти никто: код совпадал, а пользователь не находился —
-- users закрыта политикой «своя сеть», а у входа претензии нет по построению.
-- Проверяется от роли приложения БЕЗ претензии — ровно так, как зовёт сервер.
select set_config('request.jwt.claims', '', false);
select app.issue_auth_code('79991110002', 'стенд-хеш');

-- Идентификатор сессии берём из ответа функции, а не из таблицы: sessions
-- закрыта для роли приложения, и стенд выше этого требует. Читать её отсюда
-- значило бы проверять вход в обход того самого запрета.
select app.redeem_auth_code('+7 999 111-00-02', 'стенд-хеш') as sid \gset
-- format() снаружи долларовых кавычек: внутри $$…$$ psql переменные не
-- подставляет, и :'sid' остался бы двоеточием в тексте запроса.
select expect_eq(format($$select (%L <> '')::text$$, :'sid'), 'true',
  'Код принимается и сессия выдаётся без претензии арендатора');

select expect_eq(format($$select app_role from app.session_claims(%L)$$, :'sid'),
  'owner', 'Претензии по сессии читаются без претензии арендатора');

-- Роль входа не течёт наружу: после вызова претензии снова нет, а users
-- по-прежнему закрыта для роли приложения.
select expect_eq($$select coalesce(current_setting('request.jwt.claims', true), '')$$, '',
  'После входа претензия возвращена, роль auth наружу не утекла');
select expect_eq($$select count(*)::text from users$$, '0',
  'Без претензии users по-прежнему пуста для роли приложения');

rollback;
