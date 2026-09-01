-- Примерка на кадре клиента из гаража (миграция 024).
--
-- Дыра, которую это закрывает, была самой дорогой в продукте: сценарий,
-- выбранный основателем — «менеджер присылает ссылку, клиент сам перебирает
-- на своей машине», — не работал НИ РАЗУ. Приложение писало в photos,
-- configurations и очередь напрямую от роли гаража, а роль эта закрыта
-- ограничительными политиками. И правильно закрыта: гараж открыт по ссылке
-- кому угодно, без входа и без имени.
--
-- Проверяется поэтому не «функция написана», а два утверждения сразу:
-- примерка проходит через дверь И прямая запись по-прежнему невозможна.
-- Второе важнее первого: если ограничение ослабло, дверь бессмысленна.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-0424-0000-0000-000000000001'''
\set P '''aaaaaaaa-0424-0000-0000-000000000001'''
\set CI '''dddddddd-0424-0000-0000-000000000001'''
\set PP '''eeeeeeee-0424-0000-0000-000000000001'''
\set CO '''cccccccc-0424-0000-0000-000000000001'''

insert into networks (id, name, join_code, price_deviation_allowed_pct)
values (:N,'Сеть гаража','GAR-2026', 10);

select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка Г','gar-a');
insert into point_budgets (point_id, period_month, soft_limit_kopecks, hard_limit_kopecks)
values (:P, date_trunc('month', now())::date, 800000, 1000000);
-- zones — общий справочник, он приходит с посевом, а стенд идёт от миграций.
insert into zones (code, name) values ('full_body','Кузов целиком')
on conflict do nothing;
insert into catalog_items (id, category, brand, sku, name, finish, default_class,
                           lab_l, lab_a, lab_b)
values (:CI,'film','KPMF','K75407','Сатин-хром тёмный','satin','B', 42.1, -1.2, -3.4);
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks, in_stock)
values (:PP,:P,:CI,'full_body', 24840000, true);

-- ── претензия гаража: аноним по ссылке ────────────────────────
select set_config('request.jwt.claims', jsonb_build_object(
  'point_id', app.point_of_slug('gar-a'),
  'app_role','garage',
  'session_id','сессия-гаража')::text, false);

-- ── 1 · кадр без согласия не сохраняется ──────────────────────
-- Основание хранения появляется раньше файла, а не после. Триггер §13 стоит
-- ДО политики доступа, поэтому проверяется он первым — иначе следующая
-- проверка ловила бы его вместо RLS и говорила бы неправду про политику.
select expect_fail($$
  select app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb)
$$, 'Кадр без согласия дверь не принимает');

insert into consents (id, point_id, session_id, kind, document_version, granted)
values (:CO, app.current_point_id(), 'сессия-гаража','photo_processing','v1', true);

-- ── 2 · ограничение НЕ ослабло ────────────────────────────────
-- Согласие есть, триггер §13 пропустит — значит отказывает именно политика.
-- Если эти две перестанут отказывать, дверь ниже не значит ничего.
select expect_denied($$
  insert into photos (point_id, storage_path, sha256, width, height, consent_id)
  select app.current_point_id(), '/x.jpg', repeat('a',64), 100, 100,
         (select id from consents limit 1)
$$, 'Гараж не пишет в photos напрямую');

select expect_denied($$
  insert into configurations (point_id, origin, session_id)
  select app.current_point_id(), 'garage', 'сессия-гаража'
$$, 'Гараж не заводит конфигурацию напрямую');

-- ── 3 · с согласием кадр сохраняется ──────────────────────────

select expect_eq($$
  select (app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200,
          '{"passed":true}'::jsonb) is not null)::text
$$, 'true', 'С согласием кадр сохраняется через дверь');

-- Тот же отпечаток второй раз не заводит второй кадр и второе основание.
-- Тот же отпечаток второй раз обязан вернуть ТОТ ЖЕ кадр. Считать строки в
-- photos отсюда нельзя: гаражу таблица не видна, и count(*) вернул бы ноль
-- независимо от того, сколько строк там на самом деле. Сравниваем то, что
-- дверь вернула, — это и есть наблюдаемое поведение.
select expect_eq($$
  select (app.garage_store_photo('/p.jpg',  repeat('b',64), 1600, 1200, '{}'::jsonb)
        = app.garage_store_photo('/p2.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb))::text
$$, 'true', 'Тот же кадр второй раз возвращает тот же кадр, а не заводит второй');

-- ── 4 · примерка проходит и ставит ТРИ света ──────────────────
-- К-1: света уходят всегда все три, поэтому и заданий ровно три.
-- Идентификатор кадра берём из ответа двери, а не из таблицы: гаражу она не
-- видна, и `select id from photos` вернуло бы NULL — проверка «три света»
-- прошла бы мимо настоящего кадра.
select expect_eq(format($$
  select count(*)::text from app.garage_tryon(
    app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb), %L::uuid)
$$, :PP), '3', 'Примерка ставит в очередь три света');

-- ── 5 · полезную нагрузку собирает база ───────────────────────
-- Аноним передаёт два идентификатора и больше ничего: подставить своё в то,
-- что уйдёт во внешнюю модель, он не может.
-- render_jobs гаражу тоже не видна: смотрим из-под точки, как смотрел бы
-- сотрудник, — то есть проверяем то, что реально уедет во внешнюю модель.
select act_as(:P::uuid, :N::uuid);
select expect_eq($$select payload->>'sku_name' from render_jobs limit 1$$,
  'K75407', 'Артикул в задании взят из прайса, а не от вызывающего');
select expect_eq($$select payload->>'origin' from render_jobs limit 1$$,
  'garage', 'Задание помечено происхождением из гаража');

select set_config('request.jwt.claims', jsonb_build_object(
  'point_id', app.point_of_slug('gar-a'), 'app_role','garage',
  'session_id','сессия-гаража')::text, false);

-- ── 6 · потолок §4.10 · три примерки анониму ──────────────────
-- Прайс заводит точка, не гараж: под гаражной претензией эта вставка
-- отклоняется — и это тоже проверка, только уже пройденная выше.
select act_as(:P::uuid, :N::uuid);
insert into catalog_items (id, category, brand, sku, name, finish, default_class,
                           lab_l, lab_a, lab_b)
values ('dddddddd-0424-0000-0000-000000000002','film','Oracal','970-070','Матовый графит',
        'matte','B', 31.0, 0.4, -1.1),
       ('dddddddd-0424-0000-0000-000000000003','film','Hexis','HX20-LG','Глянец лагуна',
        'gloss','B', 55.2, -8.1, -14.0),
       ('dddddddd-0424-0000-0000-000000000004','film','KPMF','K75400','Чёрный оникс',
        'satin','B', 12.4, 0.2, 0.1);
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks, in_stock) values
  ('eeeeeeee-0424-0000-0000-000000000002', app.current_point_id(),
   'dddddddd-0424-0000-0000-000000000002','full_body', 21490000, true),
  ('eeeeeeee-0424-0000-0000-000000000003', app.current_point_id(),
   'dddddddd-0424-0000-0000-000000000003','full_body', 19900000, true),
  ('eeeeeeee-0424-0000-0000-000000000004', app.current_point_id(),
   'dddddddd-0424-0000-0000-000000000004','full_body', 23600000, true);

select set_config('request.jwt.claims', jsonb_build_object(
  'point_id', app.point_of_slug('gar-a'), 'app_role','garage',
  'session_id','сессия-гаража')::text, false);

select expect_eq($$select used::text||'/'||cap::text from app.garage_day_quota()$$,
  '1/3', 'После первой примерки счёт 1 из 3');

select expect_ok($$
  select * from app.garage_tryon(
    app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb),
    'eeeeeeee-0424-0000-0000-000000000002')
$$, 'Вторая примерка проходит');
select expect_ok($$
  select * from app.garage_tryon(
    app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb),
    'eeeeeeee-0424-0000-0000-000000000003')
$$, 'Третья примерка проходит');

select expect_fail($$
  select * from app.garage_tryon(
    app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb),
    'eeeeeeee-0424-0000-0000-000000000004')
$$, 'Четвёртая примерка анониму отказывается (§4.10)');

-- ── 7 · телефон поднимает потолок · Г-9 мягкий переход ────────
-- Не жёсткий блок: клиент оставляет номер и продолжает, точка получает лид.
select expect_eq($$select cap::text from app.garage_leave_phone('+7 903 123-45-99')$$,
  '15', 'Телефон поднимает потолок до пятнадцати');

select expect_eq($$select used::text||'/'||cap::text from app.garage_day_quota()$$,
  '3/15', 'Счёт сохраняется, потолок вырос');

select expect_ok($$
  select * from app.garage_tryon(
    app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb),
    'eeeeeeee-0424-0000-0000-000000000004')
$$, 'После телефона примерка снова проходит');

-- Точка получила обращение, а не анонимную сессию, которая ушла молча.
select expect_eq($$
  select count(*)::text from garage_sessions where phone is not null
$$, '1', 'Точка получила телефон как лид');

-- ── 8 · готовность примерки видна СВОЕЙ сессии и только ей ────
--
-- Прямой запрос к очереди от роли гаража возвращал пустоту — не отказ, а
-- именно пустоту, — и опрос экрана не мог отличить её от «ещё считается».
-- Клиент не видел ни результата, ни причины отказа ни разу.
select expect_eq($$select count(*)::text from render_jobs$$, '0',
  'Прямой запрос гаража к очереди даёт пустоту — потому и нужна дверь');

select expect_eq($$
  select (pending > 0)::text from app.garage_tryon_status(
    (select item_id from app.garage_tryon(
       app.garage_store_photo('/p.jpg', repeat('b',64), 1600, 1200, '{}'::jsonb),
       'eeeeeeee-0424-0000-0000-000000000002') limit 1))
$$, 'true', 'Дверь показывает, что задания ещё считаются');

-- Чужая позиция не открывается подстановкой идентификатора.
select expect_eq($$
  select coalesce((select count(*)::text from app.garage_tryon_status(
    '00000000-0000-4000-8000-0000000000ff')), '0')
$$, '0', 'Чужую примерку по подставленному идентификатору не опросить');

rollback;
