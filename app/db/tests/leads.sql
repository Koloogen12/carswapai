-- CarSwap AI · тесты на заявку с лендинга (миграция 017)
--
-- Инварианты, а не функции. Проверяется не то, что app.submit_lead
-- аккуратно написана, а то, что заявку без согласия НЕВОЗМОЖНО положить в
-- базу ни одним путём, что повтор НЕ создаёт вторую строку и что телефон
-- живого человека не виден ни одному арендатору.
--
-- Особенность этого стенда: leads закрыта от роли приложения правами.
-- Значит проверить содержимое обычным select нельзя — и это не помеха
-- тесту, а как раз то, что он доказывает. Всё, что нужно знать о записи,
-- функция приёма возвращает сама: идентификатор, признак «создана впервые»
-- и срок хранения.
--
-- expect_denied ловит только отказ по правам (insufficient_privilege),
-- expect_fail — нарушение ограничения. Смешивать их нельзя: тогда забытый
-- grant засчитывался бы как работающий инвариант.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

-- ── стенд: две точки одной сети ──────────────────────────────
-- Нужны не заявке (у неё арендатора нет), а проверке «не видна никому»:
-- претензию надо от кого-то выставить.
insert into networks (id, name, join_code)
values ('11111111-7777-0000-0000-000000000001', 'Сеть заявок', 'LEADS-2026');

select act_as('aaaaaaaa-7777-0000-0000-000000000001'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('aaaaaaaa-7777-0000-0000-000000000001','11111111-7777-0000-0000-000000000001',
        'Точка А','leads-a');

select act_as('bbbbbbbb-7777-0000-0000-000000000002'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('bbbbbbbb-7777-0000-0000-000000000002','11111111-7777-0000-0000-000000000001',
        'Точка Б','leads-b');

-- ── З-1. Согласие ────────────────────────────────────────────
-- Стена — ограничение таблицы, а не вежливость функции: p_consent
-- передаётся в insert как есть и упирается в leads_consent_required.
select expect_fail($$
  select * from app.submit_lead('Пётр','+7 916 000 00 01','Детейлинг на Мира',
                                false,'landing-2026-08-1')
$$, 'З-1: заявка без согласия не сохраняется');

select expect_ok($$
  select * from app.submit_lead('Пётр','+7 916 000 00 01','Детейлинг на Мира',
                                true,'landing-2026-08-1')
$$, 'З-1: заявка с согласием сохраняется');

-- ── З-2. Повтор не задваивает ────────────────────────────────
-- Тот же человек, тот же телефон, но набранный иначе, и название точки
-- с опечаткой — для базы это одна заявка. Звонить ему будут один раз.
do $$
declare
  a record;
  b record;
begin
  select * into a from app.submit_lead('Иван','+7 916 111 22 33','Гараж №7',
                                       true,'landing-2026-08-1');
  select * into b from app.submit_lead('Иван','8 (916) 111-22-33','Гараж 7',
                                       true,'landing-2026-08-1');
  if not a.was_created then
    raise exception 'ПРОВАЛ: З-2 — первая заявка не была создана';
  end if;
  if b.was_created then
    raise exception 'ПРОВАЛ: З-2 — повтор создал вторую заявку';
  end if;
  if b.lead_id is distinct from a.lead_id then
    raise exception 'ПРОВАЛ: З-2 — повтор вернул другую заявку (% против %)',
      b.lead_id, a.lead_id;
  end if;
  raise notice 'ok  · З-2: повтор той же заявки не создаёт вторую';
end $$;

-- Второй нажавший — не тот же человек. Разные телефоны на одной точке
-- обязаны разъезжаться, иначе владелец и его управляющий не смогут
-- оставить заявку оба.
do $$
declare
  a record;
  b record;
begin
  select * into a from app.submit_lead('Владелец','+7 916 555 00 01','Одна и та же точка',
                                       true,'landing-2026-08-1');
  select * into b from app.submit_lead('Управляющий','+7 916 555 00 02','Одна и та же точка',
                                       true,'landing-2026-08-1');
  if not (a.was_created and b.was_created) then
    raise exception 'ПРОВАЛ: З-2 — разные телефоны склеились в одну заявку';
  end if;
  raise notice 'ok  · З-2: разные телефоны с одной точки — разные заявки';
end $$;

-- Обработанная заявка перестаёт держать ключ: человек, которому звонили
-- полгода назад, обязан иметь возможность прийти снова.
do $$
declare a record; b record;
begin
  select * into a from app.submit_lead('Сергей','+7 916 777 88 99','Точка возврата',
                                       true,'landing-2026-08-1');
  if not app.mark_lead(a.lead_id, 'contacted') then
    raise exception 'ПРОВАЛ: З-2 — отметка о работе с заявкой не проставилась';
  end if;
  select * into b from app.submit_lead('Сергей','+7 916 777 88 99','Точка возврата',
                                       true,'landing-2026-08-1');
  if not b.was_created or b.lead_id = a.lead_id then
    raise exception 'ПРОВАЛ: З-2 — после обработки заявку нельзя оставить повторно';
  end if;
  raise notice 'ok  · З-2: после обработки та же точка может подать заявку снова';
end $$;

-- ── З-3. Заявка не видна ни одному арендатору ────────────────
-- Не «не видна чужой точке», а не видна НИКОМУ: у заявки нет point_id,
-- потому что на момент подачи точки не существует.
--
-- На чтении стена — политика: право select у роли приложения есть, а строк
-- политика не отдаёт ни одной, поэтому expect_empty. На записи стена —
-- права: insert, update и delete отозваны, отказ приходит до политик,
-- поэтому expect_denied. Смешивать эти два помощника нельзя, иначе забытый
-- grant засчитается как работающий инвариант.
--
-- К этому моменту в базе уже лежит несколько заявок, заведённых выше через
-- функцию приёма, — то есть проверка не «пусто, потому что пусто».
select act_as('aaaaaaaa-7777-0000-0000-000000000001'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
select expect_empty($$ select id, phone from leads $$,
  'З-3: точка А не видит заявок с лендинга');
select expect_denied($$ update leads set status = 'archived' $$,
  'З-3: точка А не может править заявки');
select expect_denied($$ delete from leads $$,
  'З-3: точка А не может удалять заявки');

select act_as('bbbbbbbb-7777-0000-0000-000000000002'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
select expect_empty($$ select id, phone from leads $$,
  'З-3: точка Б не видит заявок с лендинга');
select expect_denied($$
  insert into leads (name, phone, point_name, consent_granted, consent_document_version)
  values ('Подстава','+79160000009','Чужая точка',true,'x')
$$, 'З-3: заявка не заводится в обход функции приёма');

-- Разница между «пусто, потому что нечего показывать» и «пусто, хотя строки
-- есть» — это и есть весь смысл проверки выше. Доказываем вторую: заявка,
-- поданная в самом начале прогона, всё ещё лежит в базе — функция приёма
-- узнаёт её как повтор, — и при этом ни одна точка её не видит.
do $$
declare a record;
begin
  select * into a from app.submit_lead('Пётр','+7 916 000 00 01','Детейлинг на Мира',
                                       true,'landing-2026-08-1');
  if a.was_created then
    raise exception 'ПРОВАЛ: З-3 — заявок в базе нет, значит пустой select ничего не доказал';
  end if;
  raise notice 'ok  · З-3: заявки в базе есть, и всё равно не видны ни одной точке';
end $$;

-- Пустота обязана держаться политикой, а не только правами: RLS включён
-- с force, поэтому её не снимет ни возвращённый grant, ни владелец схемы.
do $$
declare rls boolean; frc boolean;
begin
  select c.relrowsecurity, c.relforcerowsecurity into rls, frc
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'leads';
  if not coalesce(rls, false) or not coalesce(frc, false) then
    raise exception 'ПРОВАЛ: З-3 — на leads нет RLS с force (rls=%, force=%)', rls, frc;
  end if;
  raise notice 'ok  · З-3: на leads стоит RLS с force, а не одни только права';
end $$;

-- ── З-4. Срок хранения задаётся при записи ───────────────────
-- Телефон в заявке — персональные данные. Срок обязан быть проставлен
-- в момент записи, как у photos.retain_until, а не назначаться потом.
do $$
declare a record;
begin
  select * into a from app.submit_lead('Никита','+7 916 300 40 50','Точка со сроком',
                                       true,'landing-2026-08-1');
  if a.keep_until is null then
    raise exception 'ПРОВАЛ: З-4 — срок хранения заявки не задан';
  end if;
  if a.keep_until <= now() + interval '11 months'
     or a.keep_until > now() + interval '13 months' then
    raise exception 'ПРОВАЛ: З-4 — срок хранения % не равен объявленному году', a.keep_until;
  end if;
  raise notice 'ok  · З-4: срок хранения заявки задан при записи (год)';
end $$;

-- Отказ от заявки укорачивает срок: держать телефон человека, которому мы
-- уже решили не звонить, оснований нет (152-ФЗ ст. 5 ч. 7).
do $$
declare a record; n integer;
begin
  select * into a from app.submit_lead('Отказной','+7 916 900 90 90','Старая заявка',
                                       true,'landing-2026-08-1');
  perform app.mark_lead(a.lead_id, 'archived');

  n := app.expire_leads(100);
  if n <> 1 then
    raise exception 'ПРОВАЛ: З-4 — по сроку удалено % строк вместо одной', n;
  end if;
  -- Второй проход по тем же данным обязан не найти ничего. Если бы строка
  -- осталась, она была бы просрочена и снова попала в выборку — это и есть
  -- доказательство удаления в обход закрытого для чтения select.
  n := app.expire_leads(100);
  if n <> 0 then
    raise exception 'ПРОВАЛ: З-4 — просроченная заявка осталась в базе (ещё % строк)', n;
  end if;
  raise notice 'ok  · З-4: заявка с истёкшим сроком удаляется целиком';
end $$;

-- ── З-5. Мусор вместо контакта ───────────────────────────────
-- Заявка, по которой некому позвонить, — это не заявка.
select expect_fail($$
  select * from app.submit_lead('Пётр','телефон будет позже','Точка',
                                true,'landing-2026-08-1')
$$, 'З-5: заявка без пригодного телефона не сохраняется');
select expect_fail($$
  select * from app.submit_lead('П','+7 916 000 00 77','Точка',
                                true,'landing-2026-08-1')
$$, 'З-5: заявка без имени не сохраняется');
select expect_fail($$
  select * from app.submit_lead('Пётр','+7 916 000 00 78','',
                                true,'landing-2026-08-1')
$$, 'З-5: заявка без названия точки не сохраняется');

rollback;
