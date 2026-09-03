-- Сотрудники точки и вход по приглашению (миграции 004 и 016).
--
-- Второй шаг запуска у клиента: точка оплатила, получила доступ и заводит
-- сотрудников. Пока этого нет, продукт нельзя запустить вообще, а «отзыв
-- доступа — один клик» на экране остаётся обещанием.
--
-- Здесь доказывается ровно то, что обещано человеку на экране, и ровно то,
-- что нельзя проверить кодом приложения: запрос мимо приложения проверок
-- приложения не видит.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N  '''11111111-5555-0000-0000-000000000001'''
\set P  '''aaaaaaaa-5555-0000-0000-000000000001'''
\set P2 '''aaaaaaaa-5555-0000-0000-000000000002'''
\set OW '''cccccccc-5555-0000-0000-000000000001'''
\set MG '''cccccccc-5555-0000-0000-000000000002'''
\set MS '''cccccccc-5555-0000-0000-000000000003'''
\set OW2 '''cccccccc-5555-0000-0000-000000000004'''

insert into networks (id, name, join_code, price_deviation_allowed_pct)
values (:N, 'Сеть С', 'STAFF-2026', 10);

select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug)
values (:P, :N, 'Точка С', 'staff-a');
insert into users (id, point_id, network_id, role, name, phone, email) values
  (:OW, :P, :N, 'owner',   'Владелец С', '+79995550001', 'owner@s.example'),
  (:MG, :P, :N, 'manager', 'Менеджер С', '+79995550002', 'manager@s.example');

-- Соседняя точка той же сети. Она здесь не для полноты: политика users_tenant
-- из 001 пускала в таблицу сотрудников любого человека СЕТИ, и без второй
-- точки «чужая точка» была бы непроверяемой.
select act_as(:P2::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug)
values (:P2, :N, 'Точка С2', 'staff-b');
insert into users (id, point_id, network_id, role, name, phone)
values (:OW2, :P2, :N, 'owner', 'Владелец С2', '+79995550004');

select act_as(:P::uuid, :N::uuid);

-- ═════════════════════════════════════════════════════════════
-- Кто может менять список сотрудников
-- ═════════════════════════════════════════════════════════════

select expect_ok(format($$
  insert into users (id, point_id, network_id, role, name, phone)
  values (%L, %L, %L, 'master', 'Мастер С', '+79995550003')
$$, :MS, :P, :N), 'Владелец заводит сотрудника в свою точку');

-- ── Только в СВОЮ точку ──────────────────────────────────────
-- Точка та же сеть, значит users_tenant из 001 пропускает. Отклоняет только
-- ограничительная политика 016 — и проверяется здесь именно она.
select expect_denied(format($$
  insert into users (point_id, network_id, role, name, phone)
  values (%L, %L, 'manager', 'Чужак', '+79995559999')
$$, :P2, :N), 'Владелец не заводит человека в чужую точку своей сети');

-- ── Менеджер список сотрудников не меняет ────────────────────
select act_as(:P::uuid, :N::uuid, 'manager');

select expect_denied(format($$
  insert into users (point_id, network_id, role, name, phone)
  values (%L, %L, 'manager', 'Свой человек', '+79995558888')
$$, :P, :N), 'Менеджер не заводит сотрудника');

-- Отзыв менеджером не падает с ошибкой — он просто НЕ ПРОИСХОДИТ: строка
-- ограничительной политике не видна, и update меняет ноль строк. Проверять
-- надо результат, а не исключение, иначе тест доказывал бы не то.
do $$
declare still boolean;
begin
  update users set active = false
   where id = 'cccccccc-5555-0000-0000-000000000003';
  perform act_as('aaaaaaaa-5555-0000-0000-000000000001'::uuid,
                 '11111111-5555-0000-0000-000000000001'::uuid);
  select active into still from users
   where id = 'cccccccc-5555-0000-0000-000000000003';
  if still is not true then
    raise exception 'ПРОВАЛ: менеджер отозвал доступ сотруднику';
  end if;
  raise notice 'ok  · Менеджер не отзывает доступ: доступ на месте';
end $$;

-- Мастер тем более.
select act_as(:P::uuid, :N::uuid, 'master');
select expect_denied(format($$
  insert into users (point_id, network_id, role, name, phone)
  values (%L, %L, 'master', 'Ещё мастер', '+79995557777')
$$, :P, :N), 'Мастер не заводит сотрудника');

select act_as(:P::uuid, :N::uuid);

-- ═════════════════════════════════════════════════════════════
-- Приглашение сотруднику
-- ═════════════════════════════════════════════════════════════

-- ── Приглашение зовёт только своего ──────────────────────────
-- Составной ключ (user_id, point_id) — не украшение: без него владелец мог бы
-- выписать ссылку на человека чужой точки и получить его сессию у себя.
select expect_fail(format($$
  insert into invites (point_id, network_id, code, role, expires_at, user_id)
  values (%L, %L, 'ST-CHUZHOY', 'owner', now() + interval '7 days', %L)
$$, :P, :N, :OW2), 'Приглашение не зовёт человека из чужой точки');

insert into invites (point_id, network_id, code, role, expires_at, user_id) values
  (:P, :N, 'ST-OK',      'master',  now() + interval '7 days', :MS),
  (:P, :N, 'ST-OLD',     'master',  now() - interval '1 day',  :MS),
  (:P, :N, 'ST-REVOKED', 'manager', now() + interval '7 days', :MG);

-- ── Ссылка открывает сессию тому, кого позвали ───────────────
do $$
declare sid uuid; r record;
begin
  sid := app.redeem_staff_invite('ST-OK');
  if sid is null then
    raise exception 'ПРОВАЛ: приглашение сотруднику не открыло сессию';
  end if;
  select * into r from app.session_claims(sid);
  if r.user_id is distinct from 'cccccccc-5555-0000-0000-000000000003'::uuid then
    raise exception 'ПРОВАЛ: сессия выдана не тому, кого звали';
  end if;
  if r.app_role <> 'master' or
     r.point_id is distinct from 'aaaaaaaa-5555-0000-0000-000000000001'::uuid then
    raise exception 'ПРОВАЛ: роль или точка пришли не из базы: % / %',
      r.app_role, r.point_id;
  end if;
  raise notice 'ok  · Ссылка приглашения открывает сессию: пароль не нужен';
end $$;

-- ── Одноразовость ────────────────────────────────────────────
select expect_fail($$ select app.redeem_staff_invite('ST-OK') $$,
  'Второй переход по той же ссылке сессии не даёт');

-- ── Срок ─────────────────────────────────────────────────────
select expect_fail($$ select app.redeem_staff_invite('ST-OLD') $$,
  'Истёкшее приглашение сотрудника не срабатывает');

-- ── Несуществующий код ───────────────────────────────────────
do $$
begin
  if app.redeem_staff_invite('ST-NETU') is not null then
    raise exception 'ПРОВАЛ: выдуманный код открыл сессию';
  end if;
  raise notice 'ok  · Выдуманный код ссылки сессии не открывает';
end $$;

-- ── Отзыв доступа закрывает и ссылку ─────────────────────────
select act_as(:P::uuid, :N::uuid);
update users set active = false where id = :MG;
select expect_fail($$ select app.redeem_staff_invite('ST-REVOKED') $$,
  'Отозванный сотрудник не входит по своей ссылке');
update users set active = true where id = :MG;

-- ═════════════════════════════════════════════════════════════
-- Отзыв доступа действует немедленно
-- ═════════════════════════════════════════════════════════════
-- На экране сотрудников написано «отзыв — один клик». Претензии читаются из
-- базы при каждом запросе (014), и здесь доказывается, что этого достаточно:
-- живая сессия отозванного умирает без правки таблицы сессий.
do $$
declare sid uuid; n int;
begin
  perform app.issue_auth_code('manager@s.example', 'хеш-менеджера');
  sid := app.redeem_auth_code('manager@s.example', 'хеш-менеджера');
  if sid is null then
    raise exception 'ПРОВАЛ: подготовка не удалась — менеджер не вошёл';
  end if;

  select count(*) into n from app.session_claims(sid);
  if n <> 1 then
    raise exception 'ПРОВАЛ: живая сессия менеджера не читается';
  end if;

  perform act_as('aaaaaaaa-5555-0000-0000-000000000001'::uuid,
                 '11111111-5555-0000-0000-000000000001'::uuid);
  update users set active = false
   where id = 'cccccccc-5555-0000-0000-000000000002';

  select count(*) into n from app.session_claims(sid);
  if n <> 0 then
    raise exception 'ПРОВАЛ: отозванный работает по старой сессии';
  end if;
  raise notice 'ok  · Отзыв владельцем закрывает живую сессию сотрудника сразу';

  update users set active = true
   where id = 'cccccccc-5555-0000-0000-000000000002';
end $$;

-- ═════════════════════════════════════════════════════════════
-- Приглашение сети: регистрация точки
-- ═════════════════════════════════════════════════════════════
-- С-1 · точка заводится только по коду сети, и «второй раз по той же ссылке»
-- не должно оставлять после себя ни точки, ни владельца.

insert into invites (network_id, code, role, expires_at) values
  (:N, 'NET-OK',  'owner', now() + interval '7 days'),
  (:N, 'NET-OLD', 'owner', now() - interval '1 day');

-- ── Без кода из письма точка не заводится ───────────────────────
do $$
declare sid uuid; n int;
begin
  sid := app.redeem_network_invite('NET-OK', 'new-owner@s.example', 'какой-то-хеш',
                                   'Точка без кода', 'Адрес', 'Никто');
  if sid is not null then
    raise exception 'ПРОВАЛ: точка завелась без подтверждения почты';
  end if;
  perform act_as('aaaaaaaa-5555-0000-0000-000000000001'::uuid,
                 '11111111-5555-0000-0000-000000000001'::uuid);
  select count(*) into n from points where name = 'Точка без кода';
  if n <> 0 then
    raise exception 'ПРОВАЛ: осталась половина точки после неудачи';
  end if;
  raise notice 'ok  · Без подтверждённой почты точка не заводится';
end $$;

-- ── Точка заводится и владелец входит ────────────────────────
do $$
declare sid uuid; r record; nm text;
begin
  perform app.issue_auth_code('new-owner@s.example', 'хеш-новой-точки');
  sid := app.redeem_network_invite('NET-OK', 'New-Owner@S.example', 'хеш-новой-точки',
                                   'Пост на Кутузовском', 'Кутузовский, 36', 'Дмитрий К.');
  if sid is null then
    raise exception 'ПРОВАЛ: по живому приглашению сети точка не завелась';
  end if;
  select * into r from app.session_claims(sid);
  if r.app_role <> 'owner' then
    raise exception 'ПРОВАЛ: создатель точки не владелец, а %', r.app_role;
  end if;

  perform act_as(r.point_id, r.network_id);
  select public_slug into nm from points where id = r.point_id;
  if nm is distinct from 'post-na-kutuzovskom' then
    raise exception 'ПРОВАЛ: публичный слаг не из названия точки: %', nm;
  end if;
  raise notice 'ok  · Приглашение сети заводит точку, владельца и его сессию';
end $$;

select act_as(:P::uuid, :N::uuid);

-- ── Одноразовость: второй раз точка НЕ заводится ─────────────
select expect_fail($$
  select app.redeem_network_invite('NET-OK', 'user2222@s.example', 'второй-заход',
                                   'Вторая по той же ссылке', null, 'Кто-то')
$$, 'Второй переход по той же ссылке сети точку не заводит');

do $$
declare n int;
begin
  perform act_as('aaaaaaaa-5555-0000-0000-000000000001'::uuid,
                 '11111111-5555-0000-0000-000000000001'::uuid);
  select count(*) into n from points where name = 'Вторая по той же ссылке';
  if n <> 0 then
    raise exception 'ПРОВАЛ: повторный переход всё-таки создал точку';
  end if;
  raise notice 'ok  · После отказа не осталось ни точки, ни половины точки';
end $$;

-- ── Истёкшее приглашение сети ────────────────────────────────
do $$
begin
  perform app.issue_auth_code('user3333@s.example', 'хеш-для-старого');
end $$;
select expect_fail($$
  select app.redeem_network_invite('NET-OLD', 'user3333@s.example', 'хеш-для-старого',
                                   'Точка по старому коду', null, 'Опоздавший')
$$, 'Истёкшее приглашение сети точку не заводит');

-- ── Приглашение сотруднику не годится для регистрации точки ──
do $$
begin
  perform app.issue_auth_code('user4444@s.example', 'хеш-подмены');
end $$;
select expect_fail($$
  select app.redeem_network_invite('ST-REVOKED', 'user4444@s.example', 'хеш-подмены',
                                   'Точка через чужое приглашение', null, 'Ловкач')
$$, 'Приглашением сотруднику точку не завести');

-- ═════════════════════════════════════════════════════════════
-- Приглашение раскрывается только по своему коду
-- ═════════════════════════════════════════════════════════════
-- Претензия invite_code — ключ ровно к одной строке. Сама по себе, без кода,
-- она не открывает ничего: иначе владелец соседней точки читал бы чужие
-- ссылки и заходил бы чужими сотрудниками.
select act_as(:P2::uuid, :N::uuid);
select expect_empty($$
  select 1 from invites where code = 'ST-REVOKED'
$$, 'Соседняя точка не видит приглашений чужой точки');

select act_as(:P::uuid, :N::uuid);

rollback;
