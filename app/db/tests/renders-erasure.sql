-- Уничтожение рендеров по сроку (миграция 008).
--
-- Проверяется главное противоречие: рендер обязан быть неизменяемым, потому
-- что на него ссылается подтверждение клиента, и одновременно обязан
-- уничтожаться, потому что это изображение машины конкретного человека.
-- Разрешено это разграничением предмета: строка остаётся, байты уходят.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-8888-0000-0000-000000000001'''
\set P '''aaaaaaaa-8888-0000-0000-000000000001'''
\set U '''cccccccc-8888-0000-0000-000000000001'''
\set CL '''ffffffff-8888-0000-0000-000000000001'''

-- С-1: точка не существует вне сети, поэтому сеть заводится первой.
insert into networks (id, name, join_code, price_deviation_allowed_pct)
  values (:N,'Сеть приёмки','ERASE-2026', 10);
insert into zones (code, name) values ('full_body','Кузов целиком')
  on conflict do nothing;

select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка','e-a');
insert into users (id, point_id, network_id, role, name)
  values (:U,:P,:N,'manager','Менеджер');
insert into catalog_items (id, category, brand, sku, name, finish, light_response,
                           default_class, lab_l, lab_a, lab_b)
  values ('dddddddd-8888-0000-0000-000000000001','film','KPMF','K75400','Satin Black',
          'satin','satin','B', 22.0, 0.4, -0.6);
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks)
  values ('eeeeeeee-8888-0000-0000-000000000001',:P,
          'dddddddd-8888-0000-0000-000000000001','full_body', 26000000);
insert into clients (id, point_id, name, phone) values (:CL,:P,'Клиент','+79998880001');
insert into consents (id, point_id, client_id, kind, document_version, granted)
  values ('cccccccc-8888-0000-0000-00000000000c',:P,:CL,'photo_processing','v1', true);

-- Два снимка: у одного срок вышел, у другого нет.
insert into photos (id, point_id, client_id, storage_path, sha256, width, height,
                    consent_id, retain_until)
values ('11111111-8888-0000-0000-0000000000f1',:P,:CL,'/p/live.jpg','h1',2400,1792,
        'cccccccc-8888-0000-0000-00000000000c', now() + interval '30 days'),
       ('11111111-8888-0000-0000-0000000000f2',:P,:CL,'/p/dead.jpg','h2',2400,1792,
        'cccccccc-8888-0000-0000-00000000000c', now() - interval '1 day');

insert into configurations (id, point_id, created_by, photo_id) values
  ('77777777-8888-0000-0000-000000000001',:P,:U,'11111111-8888-0000-0000-0000000000f1'),
  ('77777777-8888-0000-0000-000000000002',:P,:U,'11111111-8888-0000-0000-0000000000f2');
insert into configuration_items (id, configuration_id, point_id, point_price_id,
                                 category, price_kopecks) values
  ('66666666-8888-0000-0000-000000000001','77777777-8888-0000-0000-000000000001',:P,
   'eeeeeeee-8888-0000-0000-000000000001','film', 26000000),
  ('66666666-8888-0000-0000-000000000002','77777777-8888-0000-0000-000000000002',:P,
   'eeeeeeee-8888-0000-0000-000000000001','film', 26000000);
insert into renders (id, configuration_item_id, point_id, variant, storage_path,
                     pipeline, render_class, qa_passed) values
  ('55555555-8888-0000-0000-000000000001','66666666-8888-0000-0000-000000000001',:P,'day',
   '/r/live-day.jpg','{}'::jsonb,'A', true),
  ('55555555-8888-0000-0000-000000000002','66666666-8888-0000-0000-000000000002',:P,'day',
   '/r/dead-day.jpg','{}'::jsonb,'A', true);

-- ── Пока исходник жив, рендер не трогаем ─────────────────────
select app.expire_personal_data(200);
do $$
declare n int;
begin
  perform app.expire_renders(200);
  select count(*) into n from renders
   where id = '55555555-8888-0000-0000-000000000001' and erased_at is null;
  if n <> 1 then
    raise exception 'ПРОВАЛ: уничтожен рендер, чей исходный снимок ещё в сроке';
  end if;
  raise notice 'ok  · рендер живого снимка не уничтожается';
end $$;

-- ── Истёкший: файл в очередь, строка на месте ────────────────
do $$
declare n int; sp text;
begin
  perform app.expire_renders(200);
  select count(*) into n from renders
   where id = '55555555-8888-0000-0000-000000000002' and erased_at is not null;
  if n <> 1 then
    raise exception 'ПРОВАЛ: рендер уничтоженного снимка не помечен';
  end if;
  raise notice 'ok  · рендер уничтоженного снимка помечен к удалению';

  -- Строка обязана остаться: на неё ссылается подтверждение клиента.
  select storage_path into sp from renders
   where id = '55555555-8888-0000-0000-000000000002';
  if sp is null then
    raise exception 'ПРОВАЛ: строка рендера исчезла, спор о показанном разрешить нечем';
  end if;
  raise notice 'ok  · строка рендера остаётся как след подтверждения';

  select count(*) into n from file_erasures
   where storage_path = '/r/dead-day.jpg' and erased_at is null;
  if n <> 1 then
    raise exception 'ПРОВАЛ: файл рендера не поставлен в очередь на удаление, получено %', n;
  end if;
  raise notice 'ok  · файл рендера поставлен в очередь на физическое удаление';
end $$;

-- ── Уничтожение необратимо ───────────────────────────────────
select expect_fail($$
  update renders set erased_at = null
   where id = '55555555-8888-0000-0000-000000000002'
$$, 'Снять отметку уничтожения рендера нельзя');

select expect_fail($$
  update renders set erased_at = now() - interval '5 years'
   where id = '55555555-8888-0000-0000-000000000002'
$$, 'Переписать дату уничтожения нельзя: уничтожение необратимо');

-- ── Иммутабельность рендера не ослаблена ─────────────────────
select expect_fail($$
  update renders set storage_path = '/r/подменён.jpg'
   where id = '55555555-8888-0000-0000-000000000001'
$$, 'Путь к рендеру по-прежнему неизменяем');

select expect_fail($$
  delete from renders where id = '55555555-8888-0000-0000-000000000001'
$$, 'Рендер по-прежнему нельзя удалить строкой');

-- ── Повторный проход ничего не задваивает ────────────────────
do $$
declare a int; b int;
begin
  select count(*) into a from file_erasures where origin = 'renders';
  perform app.expire_renders(200);
  select count(*) into b from file_erasures where origin = 'renders';
  if a <> b then
    raise exception 'ПРОВАЛ: повторный проход задвоил очередь на удаление: % → %', a, b;
  end if;
  raise notice 'ok  · повторный проход идемпотентен';
end $$;

-- ── След в журнале ───────────────────────────────────────────
do $$
declare n int;
begin
  select count(*) into n from audit_log
   where action = 'erase_renders' and detail->>'basis' like '%152-ФЗ%';
  if n = 0 then
    raise exception 'ПРОВАЛ: уничтожение рендеров не оставило следа в журнале';
  end if;
  raise notice 'ok  · уничтожение рендеров записано в журнал с основанием';
end $$;

rollback;
