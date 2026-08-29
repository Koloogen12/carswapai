-- CarSwap AI · тесты публичных путей по ссылке
--
-- Проверяется не «политики создались», а то, что подписанная ссылка клиента
-- даёт ровно одну сделку и ни строкой больше, а гараж-примерочная — ровно
-- одну точку с её прайсом. До миграции 006 оба пути ходили в базу без
-- претензии арендатора (`sys()`), и на боевой ролевой модели вернули бы ноль
-- строк на чтение и изменили бы ноль строк на запись — молча. Здесь это
-- проверяется прогоном под ролью приложения, а не рассуждением.
--
-- Разделение помощников важно и здесь: expect_denied ловит только отказ RLS
-- (insufficient_privilege), expect_fail — нарушение ограничения. Там, где
-- первым срабатывает триггер, а не политика, стоит expect_fail и сказано,
-- какая именно стена сработала.

\set ON_ERROR_STOP on
\pset tuples_only on

-- Список таблиц вне RLS читается прямо из константы в src/lib/db.ts, чтобы
-- сверка была с исходником, а не с его копией в этом файле.
\set rls_free `awk '/rls-free:begin/,/rls-free:end/' ../src/lib/db.ts | grep -oE "'[a-z_]+'" | tr -d "'" | sort | paste -sd, -`

begin;

-- ── стенд ────────────────────────────────────────────────────
insert into zones (code, name) values ('full_body','Кузов целиком') on conflict do nothing;
insert into networks (id, name, join_code)
values ('11111111-6666-0000-0000-000000000001','Сеть','LINK-2026');

insert into catalog_items (id, category, brand, sku, name, finish)
values ('dddddddd-6666-0000-0000-000000000001','film','KPMF','K-L1','Плёнка один','gloss'),
       ('dddddddd-6666-0000-0000-000000000002','film','Hexis','K-L2','Плёнка два','satin');

-- Точка А: наш клиент и ещё один, чужой.
select act_as('aaaaaaaa-6666-0000-0000-000000000001'::uuid,
              '11111111-6666-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, address, public_slug)
values ('aaaaaaaa-6666-0000-0000-000000000001','11111111-6666-0000-0000-000000000001',
        'Точка А','Мытищи, Олимпийский 10','link-a');
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks) values
  ('eeeeeeee-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
   'dddddddd-6666-0000-0000-000000000001','full_body', 20000000),
  ('eeeeeeee-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
   'dddddddd-6666-0000-0000-000000000002','full_body', 31000000);
insert into clients (id, point_id, name, phone, vehicle) values
  ('ffffffff-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
   'Наш клиент','+79996660001','{"make":"BMW","model":"X5","plate":"А 432 ОР 77"}'::jsonb),
  ('ffffffff-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
   'Чужой клиент','+79996660002','{"make":"Audi","model":"Q7"}'::jsonb);
insert into threads (id, point_id, client_id) values
  ('88888888-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
   'ffffffff-6666-0000-0000-000000000001'),
  ('88888888-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
   'ffffffff-6666-0000-0000-000000000002');
insert into channels (id, point_id, kind, provider, external_id)
values ('99999999-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
        'telegram','wazzup','tg-link-1');
insert into messages (point_id, thread_id, channel_id, direction, body, external_message_id) values
  ('aaaaaaaa-6666-0000-0000-000000000001','88888888-6666-0000-0000-000000000001',
   '99999999-6666-0000-0000-000000000001','in','сколько будет обклеить','ml-1'),
  ('aaaaaaaa-6666-0000-0000-000000000001','88888888-6666-0000-0000-000000000002',
   '99999999-6666-0000-0000-000000000001','in','а мне в матовый','ml-2');

insert into configurations (id, point_id, thread_id) values
  ('77777777-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
   '88888888-6666-0000-0000-000000000001'),
  ('77777777-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
   '88888888-6666-0000-0000-000000000002');
insert into configuration_items (id, configuration_id, point_id, point_price_id, category, price_kopecks) values
  ('66666666-6666-0000-0000-000000000001','77777777-6666-0000-0000-000000000001',
   'aaaaaaaa-6666-0000-0000-000000000001','eeeeeeee-6666-0000-0000-000000000001','film', 20000000),
  ('66666666-6666-0000-0000-000000000002','77777777-6666-0000-0000-000000000002',
   'aaaaaaaa-6666-0000-0000-000000000001','eeeeeeee-6666-0000-0000-000000000002','film', 31000000);
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
select ci, 'aaaaaaaa-6666-0000-0000-000000000001', v, '/r/'||ci||'/'||v, '{}'::jsonb, 'A', true
  from unnest(array['66666666-6666-0000-0000-000000000001'::uuid,
                    '66666666-6666-0000-0000-000000000002'::uuid]) ci,
       unnest(enum_range(null::render_variant)) v;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths) values
  ('55555555-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
   '77777777-6666-0000-0000-000000000001','оттенок партии сверим на замере','telegram',
   array['/r/1','/r/2','/r/3']),
  ('55555555-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
   '77777777-6666-0000-0000-000000000002','оттенок партии сверим на замере','telegram',
   array['/r/4','/r/5','/r/6']);

-- Сделка чужого клиента той же точки: наряд, счёт, доплата, визит.
insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via)
values ('44444444-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
        '77777777-6666-0000-0000-000000000002','55555555-6666-0000-0000-000000000002','link');
insert into orders (id, point_id, confirmation_id, number, total_kopecks)
values ('22222222-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
        '44444444-6666-0000-0000-000000000002','ЗН-Ч-1', 31000000);
insert into invoices (id, order_id, number, amount_kopecks)
values ('bbbb0000-6666-0000-0000-000000000002','22222222-6666-0000-0000-000000000002','СЧ-Ч-1', 31000000);
insert into change_orders (id, point_id, order_id, reason, amount_kopecks)
values ('a1a1a1a1-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
        '22222222-6666-0000-0000-000000000002','чужая подготовка кузова', 900000);
insert into appointments (id, point_id, client_id, configuration_id, kind, starts_at)
values ('cccc0000-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
        'ffffffff-6666-0000-0000-000000000002','77777777-6666-0000-0000-000000000002',
        'measure', now() + interval '2 days');
-- Согласие чужой анонимной сессии в гараже той же точки.
insert into consents (id, point_id, session_id, kind, document_version, granted)
values ('12200000-6666-0000-0000-000000000002','aaaaaaaa-6666-0000-0000-000000000001',
        'сессия-чужая','photo_processing','v1', true);
insert into film_rolls (id, point_id, catalog_item_id, batch_number, barcode, meters_initial, meters_left)
values ('33333333-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
        'dddddddd-6666-0000-0000-000000000001','П-Л-1','660L0001', 20, 20);

-- Точка Б: та же сеть, другой арендатор.
select act_as('bbbbbbbb-6666-0000-0000-000000000002'::uuid,
              '11111111-6666-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('bbbbbbbb-6666-0000-0000-000000000002','11111111-6666-0000-0000-000000000001','Точка Б','link-b');
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks)
values ('eeeeeeee-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002',
        'dddddddd-6666-0000-0000-000000000001','full_body', 21000000);
insert into clients (id, point_id, name, phone)
values ('ffffffff-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002',
        'Клиент точки Б','+79996660003');
insert into threads (id, point_id, client_id)
values ('88888888-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002',
        'ffffffff-6666-0000-0000-000000000003');
insert into configurations (id, point_id, thread_id)
values ('77777777-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002',
        '88888888-6666-0000-0000-000000000003');
insert into configuration_items (id, configuration_id, point_id, point_price_id, category, price_kopecks)
values ('66666666-6666-0000-0000-000000000003','77777777-6666-0000-0000-000000000003',
        'bbbbbbbb-6666-0000-0000-000000000002','eeeeeeee-6666-0000-0000-000000000003','film', 21000000);
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
select '66666666-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002', v,
       '/r/b/'||v, '{}'::jsonb, 'A', true from unnest(enum_range(null::render_variant)) v;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('55555555-6666-0000-0000-000000000003','bbbbbbbb-6666-0000-0000-000000000002',
        '77777777-6666-0000-0000-000000000003','оттенок партии сверим на замере','telegram',
        array['/r/b1','/r/b2','/r/b3']);

-- ═════════════════════════════════════════════════════════════
-- Клиент по подписанной ссылке
-- ═════════════════════════════════════════════════════════════
-- Претензия ставится ровно так же, как её ставит withClient() в приложении:
-- роль client, точка из резолвера, идентификатор ЭТОЙ конфигурации.

-- ── резолвер ─────────────────────────────────────────────────
do $$
declare p uuid;
begin
  perform set_config('request.jwt.claims','',false);   -- контекста нет вовсе
  select app.point_of_configuration('77777777-6666-0000-0000-000000000001') into p;
  if p is distinct from 'aaaaaaaa-6666-0000-0000-000000000001'::uuid then
    raise exception 'ПРОВАЛ: резолвер вернул % вместо точки А', p;
  end if;
  raise notice 'ok  · Резолвер отдаёт точку конфигурации без всякой претензии на входе';
end $$;

do $$
declare p uuid;
begin
  select app.point_of_configuration('00000000-0000-0000-0000-0000000000ff') into p;
  if p is not null then
    raise exception 'ПРОВАЛ: резолвер вернул % для несуществующей конфигурации', p;
  end if;
  select app.point_of_configuration(null) into p;
  if p is not null then
    raise exception 'ПРОВАЛ: резолвер вернул % для null', p;
  end if;
  raise notice 'ok  · Резолвер для несуществующей конфигурации возвращает null и не роняет';
end $$;

do $$
declare left_over text;
begin
  left_over := coalesce(current_setting('request.jwt.claims', true), '');
  if left_over <> '' then
    raise exception 'ПРОВАЛ: резолвер оставил после себя претензию %', left_over;
  end if;
  raise notice 'ok  · Резолвер возвращает прежнюю претензию и не оставляет своей';
end $$;

-- ── претензия клиента ────────────────────────────────────────
select set_config('request.jwt.claims', jsonb_build_object(
  'point_id', app.point_of_configuration('77777777-6666-0000-0000-000000000001'),
  'app_role','client',
  'configuration_id','77777777-6666-0000-0000-000000000001')::text, false);

do $$
declare n int;
begin
  select count(*) into n from configurations;
  if n <> 1 then
    raise exception 'ПРОВАЛ: клиенту видно % конфигураций вместо своей одной', n;
  end if;
  raise notice 'ok  · Клиент по ссылке видит свою конфигурацию';
end $$;

select expect_empty($$select 1 from configurations
                       where id <> '77777777-6666-0000-0000-000000000001'$$,
  'Клиент не видит другие примерки той же точки');
select expect_empty($$select 1 from messages$$,
  'Клиент не видит переписку — ни свою ветку, ни чужую');
select expect_empty($$select 1 from point_prices
                       where id <> 'eeeeeeee-6666-0000-0000-000000000001'$$,
  'Клиент не видит прайс точки — только строку своей примерки');
select expect_empty($$select 1 from clients
                       where id <> 'ffffffff-6666-0000-0000-000000000001'$$,
  'Клиент не видит других клиентов точки');
select expect_empty($$select 1 from orders$$,
  'Клиент не видит чужие заказ-наряды точки');
select expect_empty($$select 1 from invoices$$,
  'Клиент не видит чужие счета точки');
select expect_empty($$select 1 from change_orders$$,
  'Клиент не видит чужие доработки точки');
select expect_empty($$select 1 from appointments$$,
  'Клиент не видит чужие визиты точки');
select expect_empty($$select 1 from outbound_cards
                       where id <> '55555555-6666-0000-0000-000000000001'$$,
  'Клиент не видит карточки, отправленные другим');
select expect_empty($$select 1 from film_rolls$$,
  'Клиент не видит склад точки');
select expect_empty($$select 1 from consents$$,
  'Клиент не видит согласия, собранные точкой');

do $$
declare n int;
begin
  select count(*) into n from clients where phone = '+79996660001';
  if n <> 1 then
    raise exception 'ПРОВАЛ: клиент не видит собственный контакт (строк %)', n;
  end if;
  select count(*) into n from point_prices;
  if n <> 1 then
    raise exception 'ПРОВАЛ: клиенту видно % строк прайса вместо одной своей', n;
  end if;
  select count(*) into n from renders;
  if n <> 3 then
    raise exception 'ПРОВАЛ: клиенту видно % рендеров вместо трёх своих', n;
  end if;
  raise notice 'ok  · Клиент видит свой контакт, свою цену и свои три света';
end $$;

-- ── М-7: подтверждение ───────────────────────────────────────
select expect_ok($$
  insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via)
  values ('44444444-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
          '77777777-6666-0000-0000-000000000001','55555555-6666-0000-0000-000000000001','link')
$$, 'М-7: клиент по ссылке подтверждает выбор своей конфигурации');

-- Чужую конфигурацию первой останавливает не политика, а триггер
-- confirmations_match: чужая карточка клиенту не видна, и подтверждение
-- просто не из чего собрать. Поэтому здесь expect_fail, а чистый отказ
-- RLS изолирован ниже на appointments, где триггера перед ним нет.
select expect_fail($$
  insert into confirmations (point_id, configuration_id, outbound_card_id, confirmed_via)
  values ('aaaaaaaa-6666-0000-0000-000000000001','77777777-6666-0000-0000-000000000002',
          '55555555-6666-0000-0000-000000000002','link')
$$, 'Клиент не подтверждает чужую конфигурацию той же точки: её карточка ему не видна');

select expect_fail($$
  insert into confirmations (point_id, configuration_id, outbound_card_id, confirmed_via)
  values ('bbbbbbbb-6666-0000-0000-000000000002','77777777-6666-0000-0000-000000000003',
          '55555555-6666-0000-0000-000000000003','link')
$$, 'Клиент не подтверждает конфигурацию другой точки: её карточка ему не видна');

-- ── М-8: запись на замер, чистый отказ RLS ───────────────────
select expect_ok($$
  insert into appointments (id, point_id, client_id, configuration_id, kind, starts_at)
  values ('cccc0000-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
          'ffffffff-6666-0000-0000-000000000001','77777777-6666-0000-0000-000000000001',
          'measure', now() + interval '3 days')
$$, 'М-8: клиент по ссылке записывается на замер своей примерки');

select expect_denied($$
  insert into appointments (point_id, configuration_id, kind, starts_at)
  values ('aaaaaaaa-6666-0000-0000-000000000001','77777777-6666-0000-0000-000000000002',
          'measure', now() + interval '3 days')
$$, 'RLS: клиент не записывает на замер чужую конфигурацию той же точки');

select expect_denied($$
  insert into appointments (point_id, configuration_id, kind, starts_at)
  values ('bbbbbbbb-6666-0000-0000-000000000002','77777777-6666-0000-0000-000000000003',
          'measure', now() + interval '3 days')
$$, 'RLS: клиент не записывает на замер конфигурацию другой точки');

select expect_denied($$
  insert into configuration_items (configuration_id, point_id, point_price_id, category, price_kopecks)
  values ('77777777-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
          'eeeeeeee-6666-0000-0000-000000000001','film', 1)
$$, 'RLS: клиент не дописывает позицию в собственную примерку');

select expect_denied($$
  insert into configurations (point_id) values ('aaaaaaaa-6666-0000-0000-000000000001')
$$, 'RLS: клиент не заводит новых примерок на точке');

select expect_denied($$
  insert into messages (point_id, thread_id, channel_id, direction, body)
  values ('aaaaaaaa-6666-0000-0000-000000000001','88888888-6666-0000-0000-000000000001',
          '99999999-6666-0000-0000-000000000001','in','пишу от имени клиента')
$$, 'RLS: клиент не пишет в переписку точки');

-- ── менеджер доводит сделку до денег ─────────────────────────
select act_as('aaaaaaaa-6666-0000-0000-000000000001'::uuid,
              '11111111-6666-0000-0000-000000000001'::uuid);
insert into orders (id, point_id, confirmation_id, number, total_kopecks)
values ('22222222-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
        '44444444-6666-0000-0000-000000000001','ЗН-Л-1', 20000000);
insert into invoices (id, order_id, number, amount_kopecks)
values ('bbbb0000-6666-0000-0000-000000000001','22222222-6666-0000-0000-000000000001','СЧ-Л-1', 20000000);
insert into change_orders (id, point_id, order_id, reason, amount_kopecks)
values ('a1a1a1a1-6666-0000-0000-000000000001','aaaaaaaa-6666-0000-0000-000000000001',
        '22222222-6666-0000-0000-000000000001','нужна подготовка кузова', 1800000);

select set_config('request.jwt.claims', jsonb_build_object(
  'point_id','aaaaaaaa-6666-0000-0000-000000000001',
  'app_role','client',
  'configuration_id','77777777-6666-0000-0000-000000000001')::text, false);

-- ── доплата и деньги ─────────────────────────────────────────
do $$
declare n int;
begin
  update change_orders set status = 'approved', client_acted_at = now()
   where id = 'a1a1a1a1-6666-0000-0000-000000000001' and status = 'proposed';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ПРОВАЛ: клиент согласовал свою доплату, а изменено % строк', n;
  end if;
  raise notice 'ok  · Клиент по ссылке согласует доплату своей сделки';
end $$;

-- Чужую доплату политика не «запрещает», она её не показывает: update
-- проходит без ошибки и меняет ноль строк. Поэтому проверяется не исключение,
-- а то, что чужая строка осталась нетронутой.
do $$
declare n int; st text;
begin
  update change_orders set status = 'approved', client_acted_at = now()
   where id = 'a1a1a1a1-6666-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'ПРОВАЛ: клиент изменил % строк чужой доработки', n;
  end if;
  perform act_as('aaaaaaaa-6666-0000-0000-000000000001'::uuid,
                 '11111111-6666-0000-0000-000000000001'::uuid);
  select status::text into st from change_orders where id = 'a1a1a1a1-6666-0000-0000-000000000002';
  if st <> 'proposed' then
    raise exception 'ПРОВАЛ: чужая доработка получила статус % — решение подменено', st;
  end if;
  perform set_config('request.jwt.claims', jsonb_build_object(
    'point_id','aaaaaaaa-6666-0000-0000-000000000001',
    'app_role','client',
    'configuration_id','77777777-6666-0000-0000-000000000001')::text, false);
  raise notice 'ok  · Клиент не согласует чужую доплату: строка осталась предложенной';
end $$;

select expect_ok($$
  insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
  values ('aaaaaaaa-6666-0000-0000-000000000001','bbbb0000-6666-0000-0000-000000000001',
          'prepay', 6000000, 'card')
$$, 'Клиент по ссылке вносит предоплату по своему счёту');

select expect_denied($$
  insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
  values ('aaaaaaaa-6666-0000-0000-000000000001','bbbb0000-6666-0000-0000-000000000002',
          'prepay', 100, 'card')
$$, 'RLS: клиент не вносит платёж по чужому счёту той же точки');

select expect_empty($$select 1 from payments
                       where invoice_id = 'bbbb0000-6666-0000-0000-000000000002'$$,
  'Клиент не видит платежи по чужому счёту');

-- ── сквозной прогон запроса экрана ───────────────────────────
-- Повторяет запрос journey() из src/lib/journey.ts: он идёт по всей цепочке
-- джойнов через полтора десятка таблиц под RLS, и вложенные политики обязаны
-- его пропустить целиком. Именно этот запрос на боевой роли возвращал ноль
-- строк — то есть клиент видел 404 вместо своей машины.
do $$
declare
  n int; paid int; ch json; who text;
begin
  select count(*), max(paid_kopecks), max(changes::text)::json, max(client_name)
    into n, paid, ch, who
    from (
      select cl.name as client_name,
             coalesce((select sum(case when pay.kind = 'refund' then -pay.amount_kopecks
                                       else pay.amount_kopecks end)
                         from payments pay where pay.invoice_id = inv.id), 0)::int as paid_kopecks,
             coalesce((select json_agg(json_build_object(
                         'id', co.id, 'status', co.status,
                         'photo', (select cp.storage_path from condition_photos cp
                                     join appointments cpa on cpa.id = cp.appointment_id
                                    where cpa.configuration_id = cfg.id
                                    order by cp.taken_at limit 1))
                         order by co.proposed_at)
                        from change_orders co where co.order_id = o.id), '[]'::json) as changes
        from configurations cfg
        join points p on p.id = cfg.point_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
        left join threads t on t.id = cfg.thread_id
        left join clients cl on cl.id = t.client_id
        left join outbound_cards oc on oc.configuration_id = cfg.id
        left join confirmations cf on cf.configuration_id = cfg.id
        left join appointments ap on ap.configuration_id = cfg.id and ap.kind = 'measure'
                                  and ap.status = 'planned'
        left join orders o on o.confirmation_id = cf.id
        left join invoices inv on inv.order_id = o.id
        left join warranties w on w.order_id = o.id
       where cfg.id = '77777777-6666-0000-0000-000000000001'
       order by cit.price_kopecks desc limit 1) j;
  if n <> 1 then
    raise exception 'ПРОВАЛ: запрос клиентского экрана вернул % строк вместо одной', n;
  end if;
  if who <> 'Наш клиент' then
    raise exception 'ПРОВАЛ: экран показал клиента «%» вместо своего', who;
  end if;
  if paid <> 6000000 then
    raise exception 'ПРОВАЛ: экран насчитал % коп. оплаты вместо 6000000', paid;
  end if;
  if json_array_length(ch) <> 1 then
    raise exception 'ПРОВАЛ: экран показал % доработок вместо одной своей', json_array_length(ch);
  end if;
  raise notice 'ok  · Запрос клиентского экрана целиком проходит под претензией клиента';
end $$;

-- Записи клиента в journey.ts сделаны в форме insert … select: точка и контакт
-- берутся из самой сделки, а не из аргументов страницы. Если политика спрячет
-- строку-источник, такой insert вставит НОЛЬ строк и не упадёт — ровно та
-- немота, из-за которой дыру не видели. Проверяется поэтому число строк.
do $$
declare n int;
begin
  -- bookSlot()
  insert into appointments (point_id, client_id, configuration_id, kind, starts_at, ends_at)
  select cfg.point_id, t.client_id, cfg.id, 'measure',
         now() + interval '5 days', now() + interval '5 days' + interval '20 minutes'
    from configurations cfg
    left join threads t on t.id = cfg.thread_id
   where cfg.id = '77777777-6666-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ПРОВАЛ: bookSlot() вставил % визитов вместо одного', n;
  end if;

  -- reschedule(): перенос от исходного визита
  update appointments set status = 'moved' where id = 'cccc0000-6666-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ПРОВАЛ: reschedule() перевёл % визитов в moved вместо одного', n;
  end if;
  insert into appointments (point_id, client_id, configuration_id, kind, starts_at,
                            ends_at, moved_from)
  select a.point_id, a.client_id, a.configuration_id, 'measure',
         now() + interval '6 days', now() + interval '6 days' + interval '20 minutes', a.id
    from appointments a where a.id = 'cccc0000-6666-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ПРОВАЛ: reschedule() вставил % новых визитов вместо одного', n;
  end if;

  -- payPrepay(): точка выводится из счёта, а не приходит со страницы
  insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
  select o.point_id, i.id, 'prepay', 100000, 'card'
    from invoices i join orders o on o.id = i.order_id
   where i.id = 'bbbb0000-6666-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'ПРОВАЛ: payPrepay() внёс % платежей вместо одного', n;
  end if;

  -- то же по чужому счёту обязано дать честный ноль, а не тихую вставку
  insert into payments (point_id, invoice_id, kind, amount_kopecks, method)
  select o.point_id, i.id, 'prepay', 100000, 'card'
    from invoices i join orders o on o.id = i.order_id
   where i.id = 'bbbb0000-6666-0000-0000-000000000002';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'ПРОВАЛ: клиент внёс % платежей по чужому счёту', n;
  end if;

  raise notice 'ok  · Записи клиента (замер, перенос, предоплата) идут своей сделкой, чужой — ноль строк';
end $$;

-- ── сплошной обход всех таблиц под RLS ───────────────────────
-- Проверка не по списку, который надо помнить, а по самой базе: берётся
-- КАЖДАЯ таблица под RLS, и всё, что клиенту не выдано поимённо, обязано
-- отдавать ноль строк. Именно так ловится таблица, заведённая следующей
-- миграцией: перечень в 006 про неё не знает, а этот прогон знает.
do $$
declare
  t text;
  n int;
  allowed constant text[] := array[
    'points','configurations','configuration_items','renders','point_prices',
    'threads','clients','outbound_cards','confirmations','orders','invoices',
    'payments','change_orders','appointments','warranties','condition_photos'];
  leaked text[] := '{}';
begin
  for t in
    select c.relname::text from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
       and not (c.relname::text = any(allowed))
     order by 1
  loop
    execute format('select count(*) from %I', t) into n;
    if n > 0 then
      leaked := leaked || format('%s(%s)', t, n);
    end if;
  end loop;
  if array_length(leaked, 1) is not null then
    raise exception 'ПРОВАЛ: ссылке клиента видны таблицы, которые ей не выдавали: %',
      array_to_string(leaked, ', ');
  end if;
  raise notice 'ok  · Сплошной обход: клиенту не видна ни одна таблица сверх выданных поимённо';
end $$;

-- ═════════════════════════════════════════════════════════════
-- Аноним в гараже-примерочной
-- ═════════════════════════════════════════════════════════════
-- Конфигурации у него нет и быть не может (Г-1), поэтому субъект —
-- анонимная сессия, как в consents.session_id.

do $$
declare p uuid;
begin
  perform set_config('request.jwt.claims','',false);
  select app.point_of_slug('link-a') into p;
  if p is distinct from 'aaaaaaaa-6666-0000-0000-000000000001'::uuid then
    raise exception 'ПРОВАЛ: резолвер слага вернул % вместо точки А', p;
  end if;
  select app.point_of_slug('такого-слага-нет') into p;
  if p is not null then
    raise exception 'ПРОВАЛ: резолвер слага вернул % для неизвестной ссылки', p;
  end if;
  select app.point_of_slug(null) into p;
  if p is not null then
    raise exception 'ПРОВАЛ: резолвер слага вернул % для null', p;
  end if;
  raise notice 'ok  · Резолвер отдаёт точку по публичному слагу, для неизвестного — null';
end $$;

select set_config('request.jwt.claims', jsonb_build_object(
  'point_id', app.point_of_slug('link-a'),
  'app_role','garage',
  'session_id','сессия-моя')::text, false);

do $$
declare n int;
begin
  select count(*) into n from points;
  if n <> 1 then
    raise exception 'ПРОВАЛ: гаражу видно % точек вместо одной', n;
  end if;
  select count(*) into n from point_prices;
  if n <> 2 then
    raise exception 'ПРОВАЛ: гаражу видно % строк прайса своей точки вместо двух', n;
  end if;
  raise notice 'ok  · Гараж по анонимной сессии видит свою точку и её прайс (О-3)';
end $$;

select expect_empty($$select 1 from point_prices
                       where point_id <> 'aaaaaaaa-6666-0000-0000-000000000001'$$,
  'Гараж не видит прайс чужой точки');
select expect_empty($$select 1 from clients$$,
  'Гараж не видит клиентов точки');
select expect_empty($$select 1 from messages$$,
  'Гараж не видит переписку точки');
select expect_empty($$select 1 from configurations$$,
  'Гараж не видит примерки точки');
select expect_empty($$select 1 from orders$$,
  'Гараж не видит заказ-наряды точки');
select expect_empty($$select 1 from consents$$,
  'Гараж не видит согласия чужих сессий');

select expect_ok($$
  insert into consents (point_id, session_id, kind, document_version, granted)
  values ('aaaaaaaa-6666-0000-0000-000000000001','сессия-моя','photo_processing','v1', true)
$$, '§13: гараж записывает согласие своей анонимной сессии');

do $$
declare n int;
begin
  select count(*) into n from consents;
  if n <> 1 then
    raise exception 'ПРОВАЛ: гаражу видно % согласий вместо своего одного', n;
  end if;
  raise notice 'ok  · Гараж видит только собственное согласие, чужое остаётся скрытым';
end $$;

select expect_denied($$
  insert into consents (point_id, session_id, kind, document_version, granted)
  values ('aaaaaaaa-6666-0000-0000-000000000001','сессия-чужая','photo_processing','v1', true)
$$, 'RLS: гараж не записывает согласие от чужой сессии');

select expect_denied($$
  insert into consents (point_id, session_id, kind, document_version, granted)
  values ('bbbbbbbb-6666-0000-0000-000000000002','сессия-моя','photo_processing','v1', true)
$$, 'RLS: гараж не записывает согласие в чужую точку');

select expect_denied($$
  insert into configurations (point_id, origin, session_id)
  values ('aaaaaaaa-6666-0000-0000-000000000001','garage','сессия-моя')
$$, 'RLS: гараж не заводит примерок в базе точки');

-- Сквозной прогон запроса гаража: повторяет каталог из src/app/g/[slug]/page.tsx.
do $$
declare n int;
begin
  select count(*) into n from (
    select pp.id as point_price_id, ci.sku, pp.price_kopecks, pp.in_stock
      from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
     where pp.point_id = app.current_point_id() and pp.zone_code = 'full_body' and ci.active
     order by ci.category, pp.price_kopecks desc) g;
  if n <> 2 then
    raise exception 'ПРОВАЛ: каталог гаража вернул % артикулов вместо двух', n;
  end if;
  raise notice 'ok  · Запрос каталога гаража проходит под претензией анонимной сессии';
end $$;

-- Тот же сплошной обход для анонима: ему положены только точка, её прайс
-- и собственное согласие.
do $$
declare
  t text;
  n int;
  allowed constant text[] := array['points','point_prices','consents'];
  leaked text[] := '{}';
begin
  for t in
    select c.relname::text from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
       and not (c.relname::text = any(allowed))
     order by 1
  loop
    execute format('select count(*) from %I', t) into n;
    if n > 0 then
      leaked := leaked || format('%s(%s)', t, n);
    end if;
  end loop;
  if array_length(leaked, 1) is not null then
    raise exception 'ПРОВАЛ: гаражу видны таблицы, которые ему не выдавали: %',
      array_to_string(leaked, ', ');
  end if;
  raise notice 'ok  · Сплошной обход: гаражу не видна ни одна таблица сверх выданных поимённо';
end $$;

-- Правку прайса политика тоже не «запрещает», а прячет: строка не попадает
-- под USING, update меняет ноль строк и не падает. Проверяется поэтому цена,
-- а не исключение.
do $$
declare n int; p int;
begin
  update point_prices set price_kopecks = 1
   where id = 'eeeeeeee-6666-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'ПРОВАЛ: гараж изменил % строк прайса', n;
  end if;
  perform act_as('aaaaaaaa-6666-0000-0000-000000000001'::uuid,
                 '11111111-6666-0000-0000-000000000001'::uuid);
  select price_kopecks into p from point_prices where id = 'eeeeeeee-6666-0000-0000-000000000001';
  if p <> 20000000 then
    raise exception 'ПРОВАЛ: цена в прайсе стала % — гараж переписал прайс точки', p;
  end if;
  raise notice 'ok  · Гараж не правит прайс точки: цена на месте';
end $$;

-- ═════════════════════════════════════════════════════════════
-- Регресс: ограничительные политики не задели сотрудника
-- ═════════════════════════════════════════════════════════════
select act_as('aaaaaaaa-6666-0000-0000-000000000001'::uuid,
              '11111111-6666-0000-0000-000000000001'::uuid);
do $$
declare n int;
begin
  select count(*) into n from configurations;
  if n <> 2 then
    raise exception 'ПРОВАЛ: менеджеру точки видно % примерок вместо двух', n;
  end if;
  select count(*) into n from messages;
  if n <> 2 then
    raise exception 'ПРОВАЛ: менеджеру точки видно % сообщений вместо двух', n;
  end if;
  select count(*) into n from point_prices;
  if n <> 2 then
    raise exception 'ПРОВАЛ: менеджеру точки видно % строк прайса вместо двух', n;
  end if;
  raise notice 'ok  · Сотрудник точки по-прежнему видит всю точку: ссылка ему не мешает';
end $$;

-- ═════════════════════════════════════════════════════════════
-- Список таблиц вне RLS в sys()
-- ═════════════════════════════════════════════════════════════
-- Константа RLS_FREE_TABLES в src/lib/db.ts решает, какой запрос `sys()`
-- пропустит. Если следующая миграция заведёт таблицу под RLS, а константа
-- останется прежней, список протухнет молча — вот сверка, чтобы не протух.

select set_config('app.rls_free_from_ts', :'rls_free', false);

do $$
declare
  fact  text[];
  konst text[] := string_to_array(nullif(current_setting('app.rls_free_from_ts', true), ''), ',');
begin
  if konst is null or array_length(konst, 1) is null then
    raise exception 'ПРОВАЛ: не удалось прочитать RLS_FREE_TABLES из ../src/lib/db.ts';
  end if;
  select array_agg(tablename::text order by tablename) into fact
    from pg_tables where schemaname = 'public' and not rowsecurity;
  if fact is distinct from konst then
    raise exception 'ПРОВАЛ: список таблиц вне RLS разошёлся. В базе: %; в src/lib/db.ts: %',
      fact, konst;
  end if;
  raise notice 'ok  · Список таблиц вне RLS в sys() совпадает с pg_tables.rowsecurity';
end $$;

rollback;
