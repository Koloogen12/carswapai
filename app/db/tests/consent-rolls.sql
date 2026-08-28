-- CarSwap AI · тесты согласия и сверки рулона
--
-- Оба инварианта стоят на деньгах: без согласия фото чужой машины с читаемым
-- номером лежит у нас без основания, а несовпавший рулон — это переклейка
-- за 50–150 тыс. ₽ и неделя занятого поста.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

insert into zones (code, name) values ('full_body','Кузов целиком');
insert into networks (id, name, join_code)
values ('11111111-3333-0000-0000-000000000001','Сеть','R-2026');
insert into points (id, network_id, name, public_slug) values
  ('aaaaaaaa-3333-0000-0000-000000000001','11111111-3333-0000-0000-000000000001','Точка А','r-a'),
  ('bbbbbbbb-3333-0000-0000-000000000002','11111111-3333-0000-0000-000000000001','Точка Б','r-b');
insert into catalog_items (id, category, brand, sku, name, finish) values
  ('dddddddd-3333-0000-0000-000000000001','film','KPMF','K75401','Gloss Black','gloss'),
  ('dddddddd-3333-0000-0000-000000000002','film','Hexis','HX21','Gloss Red','gloss');
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks) values
  ('eeeeeeee-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
   'dddddddd-3333-0000-0000-000000000001','full_body', 26000000);
insert into clients (id, point_id, name, phone)
values ('ffffffff-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001','Клиент','+79993330001');

-- ── Согласие ─────────────────────────────────────────────────
select expect_fail($$
  insert into photos (point_id, client_id, storage_path, sha256, width, height)
  values ('aaaaaaaa-3333-0000-0000-000000000001','ffffffff-3333-0000-0000-000000000001',
          '/p/1.jpg','abc', 2400, 1792)
$$, '§13: фото чужой машины не сохраняется без записанного согласия');

insert into consents (id, point_id, client_id, session_id, kind, document_version, granted) values
  ('cccccccc-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
   'ffffffff-3333-0000-0000-000000000001', null,'photo_processing','v1', false),
  ('cccccccc-3333-0000-0000-000000000002','aaaaaaaa-3333-0000-0000-000000000001',
   'ffffffff-3333-0000-0000-000000000001', null,'photo_processing','v1', true),
  -- согласие анонима в гараже другой точки: субъект — сессия, клиента ещё нет
  ('cccccccc-3333-0000-0000-000000000003','bbbbbbbb-3333-0000-0000-000000000002',
   null,'sess-b','photo_processing','v1', true);

select expect_fail($$
  insert into consents (point_id, kind, document_version, granted)
  values ('aaaaaaaa-3333-0000-0000-000000000001','photo_processing','v1', true)
$$, '§13: согласие без субъекта — ни клиента, ни сессии — не записывается');

select expect_fail($$
  insert into photos (point_id, client_id, storage_path, sha256, width, height, consent_id)
  values ('aaaaaaaa-3333-0000-0000-000000000001','ffffffff-3333-0000-0000-000000000001',
          '/p/2.jpg','abc2', 2400, 1792, 'cccccccc-3333-0000-0000-000000000001')
$$, '§13: согласие с отказом не является основанием');

select expect_fail($$
  insert into photos (point_id, client_id, storage_path, sha256, width, height, consent_id)
  values ('aaaaaaaa-3333-0000-0000-000000000001','ffffffff-3333-0000-0000-000000000001',
          '/p/3.jpg','abc3', 2400, 1792, 'cccccccc-3333-0000-0000-000000000003')
$$, '§13: согласие, данное другой точке, не переносится');

select expect_ok($$
  insert into photos (id, point_id, client_id, storage_path, sha256, width, height, consent_id)
  values ('00000000-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
          'ffffffff-3333-0000-0000-000000000001','/p/4.jpg','abc4', 2400, 1792,
          'cccccccc-3333-0000-0000-000000000002')
$$, '§13: фото с действительным согласием сохраняется');

select expect_fail($$
  update consents set granted = false where id = 'cccccccc-3333-0000-0000-000000000002'
$$, 'Согласие иммутабельно: отзыв — новая строка, а не правка старой');

-- ── Сверка рулона ────────────────────────────────────────────
insert into configurations (id, point_id, photo_id)
values ('77777777-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
        '00000000-3333-0000-0000-000000000001');
insert into configuration_items (id, configuration_id, point_id, point_price_id, category, price_kopecks)
values ('66666666-3333-0000-0000-000000000001','77777777-3333-0000-0000-000000000001',
        'aaaaaaaa-3333-0000-0000-000000000001','eeeeeeee-3333-0000-0000-000000000001','film', 26000000);
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
select '66666666-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
       v, '/r/'||v||'.jpg','{}'::jsonb,'A', true
  from unnest(enum_range(null::render_variant)) v;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('55555555-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
        '77777777-3333-0000-0000-000000000001','Оттенок партии сверим на замере','telegram',
        array['/r/day.jpg','/r/overcast.jpg','/r/parking.jpg']);
insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via)
values ('44444444-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
        '77777777-3333-0000-0000-000000000001','55555555-3333-0000-0000-000000000001','link');

insert into film_rolls (id, point_id, catalog_item_id, batch_number, barcode, meters_initial, meters_left) values
  ('33333333-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
   'dddddddd-3333-0000-0000-000000000001','П-2026-041','4600001234567', 25, 25),
  ('33333333-3333-0000-0000-000000000002','aaaaaaaa-3333-0000-0000-000000000001',
   'dddddddd-3333-0000-0000-000000000002','П-2026-077','4600007654321', 25, 25);

select expect_fail($$
  insert into orders (point_id, confirmation_id, number, status, total_kopecks)
  values ('aaaaaaaa-3333-0000-0000-000000000001','44444444-3333-0000-0000-000000000001',
          'ЗН-001','in_work', 26000000)
$$, 'МС-3: наряд не уходит в работу без сверки рулона');

select expect_fail($$
  insert into orders (point_id, confirmation_id, number, status, total_kopecks, verified_roll_id)
  values ('aaaaaaaa-3333-0000-0000-000000000001','44444444-3333-0000-0000-000000000001',
          'ЗН-002','in_work', 26000000, '33333333-3333-0000-0000-000000000002')
$$, 'МС-3: рулон другого артикула блокирует старт оклейки');

select expect_ok($$
  insert into orders (id, point_id, confirmation_id, number, status, total_kopecks, verified_roll_id)
  values ('22222222-3333-0000-0000-000000000001','aaaaaaaa-3333-0000-0000-000000000001',
          '44444444-3333-0000-0000-000000000001','ЗН-003','in_work', 26000000,
          '33333333-3333-0000-0000-000000000001')
$$, 'МС-3: совпавший рулон пропускает наряд в работу');

do $$
declare b text; t timestamptz;
begin
  select batch_number, batch_verified_at into b, t
    from orders where id = '22222222-3333-0000-0000-000000000001';
  if b <> 'П-2026-041' or t is null then
    raise exception 'ПРОВАЛ: партия рулона не попала в наряд (партия %, время сверки %)', b, t;
  end if;
  raise notice 'ok  · Краевой №4: номер партии проставляется в наряд автоматически';
end $$;

-- ── Аудит ────────────────────────────────────────────────────
insert into audit_log (id, point_id, action, entity, entity_id)
values (1,'aaaaaaaa-3333-0000-0000-000000000001','order.start','orders',
        '22222222-3333-0000-0000-000000000001');

select expect_fail($$ update audit_log set action = 'подчищено' where id = 1 $$,
                   'Аудит-лог только на добавление');

rollback;
