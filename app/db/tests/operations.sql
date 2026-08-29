-- CarSwap AI · тесты операционного слоя
--
-- Проверяется не «таблицы создались», а то, что каждая из них не даёт
-- сделать дорогую ошибку: переписать согласие клиента на доплату, списать
-- метраж дважды, выдать гарантию на несделанную работу, пустить по одной
-- ссылке двоих.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

insert into zones (code, name) values ('full_body','Кузов целиком') on conflict do nothing;
insert into networks (id, name, join_code)
values ('11111111-4444-0000-0000-000000000001','Сеть','O-2026');
-- Претензия арендатора: без неё RLS не пустит роль приложения никуда.
select act_as('aaaaaaaa-4444-0000-0000-000000000001'::uuid, '11111111-4444-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('aaaaaaaa-4444-0000-0000-000000000001','11111111-4444-0000-0000-000000000001','Точка','o-a');
insert into users (id, point_id, network_id, role, name)
values ('cccccccc-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        '11111111-4444-0000-0000-000000000001','owner','Владелец');
insert into catalog_items (id, category, brand, sku, name, finish)
values ('dddddddd-4444-0000-0000-000000000001','film','KPMF','K-OP','Плёнка','gloss');
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks)
values ('eeeeeeee-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        'dddddddd-4444-0000-0000-000000000001','full_body', 20000000);
insert into clients (id, point_id, name, phone)
values ('ffffffff-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001','К','+79994440001');
insert into consents (id, point_id, client_id, kind, document_version, granted)
values ('12200000-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        'ffffffff-4444-0000-0000-000000000001','photo_processing','v1', true);
insert into configurations (id, point_id)
values ('77777777-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001');
insert into configuration_items (id, configuration_id, point_id, point_price_id, category, price_kopecks)
values ('66666666-4444-0000-0000-000000000001','77777777-4444-0000-0000-000000000001',
        'aaaaaaaa-4444-0000-0000-000000000001','eeeeeeee-4444-0000-0000-000000000001','film', 20000000);
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
select '66666666-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001', v,
       '/r/'||v, '{}'::jsonb, 'A', true from unnest(enum_range(null::render_variant)) v;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('55555555-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        '77777777-4444-0000-0000-000000000001','сверим на замере','telegram',
        array['/r/day','/r/overcast','/r/parking']);
insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via)
values ('44444444-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        '77777777-4444-0000-0000-000000000001','55555555-4444-0000-0000-000000000001','link');
insert into orders (id, point_id, confirmation_id, number, status, total_kopecks)
values ('22222222-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        '44444444-4444-0000-0000-000000000001','ЗН-О-1','created', 20000000);
insert into film_rolls (id, point_id, catalog_item_id, batch_number, barcode, meters_initial, meters_left)
values ('33333333-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        'dddddddd-4444-0000-0000-000000000001','П-О-1','460OP0001', 20, 20);

-- ── Доплата ──────────────────────────────────────────────────
insert into change_orders (id, point_id, order_id, reason, amount_kopecks)
values ('a1a1a1a1-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
        '22222222-4444-0000-0000-000000000001','нужна подготовка кузова', 1800000);

select expect_ok($$
  update change_orders set status = 'approved', client_acted_at = now()
   where id = 'a1a1a1a1-4444-0000-0000-000000000001'
$$, 'Клиент согласует доплату — предложение переходит в согласованное');

select expect_fail($$
  update change_orders set amount_kopecks = 5000000
   where id = 'a1a1a1a1-4444-0000-0000-000000000001'
$$, 'Согласованная доплата не переписывается: это второе подтверждение клиента');

select expect_fail($$
  insert into change_orders (point_id, order_id, reason, amount_kopecks, status)
  values ('aaaaaaaa-4444-0000-0000-000000000001','22222222-4444-0000-0000-000000000001',
          'задним числом', 100000, 'approved')
$$, 'Согласованная доплата не заводится без отметки времени решения клиента');

-- ── Склад ────────────────────────────────────────────────────
insert into stock_moves (point_id, roll_id, reason, delta_meters)
values ('aaaaaaaa-4444-0000-0000-000000000001','33333333-4444-0000-0000-000000000001',
        'consume', -18.2);

do $$
declare m numeric;
begin
  select meters_left into m from film_rolls where id = '33333333-4444-0000-0000-000000000001';
  if m <> 1.8 then raise exception 'ПРОВАЛ: остаток рулона % вместо 1.8', m; end if;
  raise notice 'ok  · Списание метража ведёт остаток рулона, а не ручная правка';
end $$;

select expect_fail($$
  insert into stock_moves (point_id, roll_id, reason, delta_meters)
  values ('aaaaaaaa-4444-0000-0000-000000000001','33333333-4444-0000-0000-000000000001',
          'consume', -5)
$$, 'Повторное списание не уводит остаток рулона в минус');

-- ── Гарантия ─────────────────────────────────────────────────
select expect_fail($$
  insert into warranties (point_id, order_id, number)
  values ('aaaaaaaa-4444-0000-0000-000000000001','22222222-4444-0000-0000-000000000001','ГТ-1')
$$, 'Гарантийный талон не выдаётся по незакрытому наряду');

update orders set status = 'done', verified_roll_id = '33333333-4444-0000-0000-000000000001'
 where id = '22222222-4444-0000-0000-000000000001';

select expect_ok($$
  insert into warranties (point_id, order_id, number)
  values ('aaaaaaaa-4444-0000-0000-000000000001','22222222-4444-0000-0000-000000000001','ГТ-1')
$$, 'По закрытому наряду талон выдаётся');

-- ── Приглашения ──────────────────────────────────────────────
insert into invites (id, point_id, code, role, expires_at) values
  ('b1b1b1b1-4444-0000-0000-000000000001','aaaaaaaa-4444-0000-0000-000000000001',
   'INV-OK','manager', now() + interval '3 days'),
  ('b1b1b1b1-4444-0000-0000-000000000002','aaaaaaaa-4444-0000-0000-000000000001',
   'INV-OLD','master', now() - interval '1 day');

select expect_ok($$
  select app.consume_invite('INV-OK','cccccccc-4444-0000-0000-000000000001')
$$, 'Приглашение срабатывает один раз');

select expect_fail($$
  select app.consume_invite('INV-OK','cccccccc-4444-0000-0000-000000000001')
$$, 'Повторный переход по той же ссылке не даёт доступ');

select expect_fail($$
  select app.consume_invite('INV-OLD','cccccccc-4444-0000-0000-000000000001')
$$, 'Просроченное приглашение не срабатывает');

-- ── Замер вытесняет оценку ───────────────────────────────────
insert into vehicle_models (id, make, model, body_type)
values ('d1d1d1d1-4444-0000-0000-000000000001','Test','Model','sedan');
insert into vehicle_zone_metrage (vehicle_model_id, zone_code, running_meters, confidence)
values ('d1d1d1d1-4444-0000-0000-000000000001','full_body', 17.0, 'estimated');

insert into measurements (point_id, vehicle_model_id, zone_code, measured_meters)
values ('aaaaaaaa-4444-0000-0000-000000000001','d1d1d1d1-4444-0000-0000-000000000001',
        'full_body', 18.4);

do $$
declare m numeric; c text;
begin
  select running_meters, confidence into m, c from vehicle_zone_metrage
   where vehicle_model_id = 'd1d1d1d1-4444-0000-0000-000000000001' and zone_code = 'full_body';
  if m <> 18.4 or c <> 'measured' then
    raise exception 'ПРОВАЛ: справочник метража не обновился (% м, %)', m, c;
  end if;
  raise notice 'ok  · М-9: замер вытесняет оценку в справочнике метража';
end $$;

-- ── Долг по наряду считается, а не хранится ──────────────────
insert into invoices (id, order_id, number, amount_kopecks)
values ('c1c1c1c1-4444-0000-0000-000000000001','22222222-4444-0000-0000-000000000001',
        'СЧ-1', 20000000);
insert into payments (point_id, invoice_id, kind, amount_kopecks) values
  ('aaaaaaaa-4444-0000-0000-000000000001','c1c1c1c1-4444-0000-0000-000000000001','prepay', 6000000),
  ('aaaaaaaa-4444-0000-0000-000000000001','c1c1c1c1-4444-0000-0000-000000000001','final', 14000000),
  ('aaaaaaaa-4444-0000-0000-000000000001','c1c1c1c1-4444-0000-0000-000000000001','refund', 1500000);

do $$
declare b integer;
begin
  b := app.invoice_balance('c1c1c1c1-4444-0000-0000-000000000001');
  if b <> 1500000 then
    raise exception 'ПРОВАЛ: долг по счёту % коп. вместо 1500000 (возврат не учтён)', b;
  end if;
  raise notice 'ok  · Долг по наряду вычисляется с учётом возврата, а не хранится колонкой';
end $$;

rollback;
