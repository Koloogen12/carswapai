-- CarSwap AI · тесты уничтожения персональных данных по сроку
--
-- Объявленный срок хранения — это обещание, данное клиенту и записанное
-- в политике обработки ПД. Ниже проверяется, что система его держит:
-- просроченное действительно исчезает, непросроченное действительно живёт,
-- а закрытый наряд с гарантией переживает уничтожение ПД владельца.
--
-- Проверяется не «функция вызывается без ошибки», а результат: чего в базе
-- не стало, что осталось и что записано в журнале. Журнал здесь равноправная
-- проверка: недоказуемое уничтожение перед Роскомнадзором равно
-- неисполненному.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

-- ── стенд ────────────────────────────────────────────────────
insert into zones (code, name) values ('full_body','Кузов целиком') on conflict do nothing;

insert into networks (id, name, join_code)
values ('11111111-7777-0000-0000-000000000001','Сеть Р','R-2026');

select act_as('aaaaaaaa-7777-0000-0000-000000000001'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('aaaaaaaa-7777-0000-0000-000000000001','11111111-7777-0000-0000-000000000001',
        'Точка Р','r-a');

-- Вторая точка той же сети — для проверки, что очередь на удаление файлов
-- не протекает между арендаторами.
select act_as('aaaaaaaa-7777-0000-0000-000000000002'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug)
values ('aaaaaaaa-7777-0000-0000-000000000002','11111111-7777-0000-0000-000000000001',
        'Точка Р2','r-b');

select act_as('aaaaaaaa-7777-0000-0000-000000000001'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);

insert into users (id, point_id, network_id, role, name)
values ('cccccccc-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '11111111-7777-0000-0000-000000000001','owner','Владелец Р');

insert into catalog_items (id, category, brand, sku, name, finish)
values ('dddddddd-7777-0000-0000-000000000001','film','KPMF','K-R','Плёнка Р','gloss');

insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks)
values ('eeeeeeee-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'dddddddd-7777-0000-0000-000000000001','full_body', 20000000);

insert into vehicle_models (id, make, model, body_type)
values ('d1d1d1d1-7777-0000-0000-000000000001','BMW','X5','suv');

-- К1: срок вышел, наряд закрыт, гарантия истекла три года назад.
-- Именно этого клиента система обязана обезличить.
insert into clients (id, point_id, name, phone, vehicle, vehicle_model_id, retain_until)
values ('ffffffff-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'Иван Петров','+79997770001',
        '{"make":"BMW","model":"X5","year":2019,"plate":"А123АА777"}'::jsonb,
        'd1d1d1d1-7777-0000-0000-000000000001', now() - interval '1 day');

-- К2: срок хранения действует. Его трогать нельзя.
insert into clients (id, point_id, name, phone, vehicle, retain_until)
values ('ffffffff-7777-0000-0000-000000000002','aaaaaaaa-7777-0000-0000-000000000001',
        'Пётр Сидоров','+79997770002',
        '{"make":"Audi","model":"Q7","plate":"В456ВВ777"}'::jsonb,
        now() + interval '6 months');

insert into consents (id, point_id, client_id, kind, document_version, granted)
values ('12121212-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000001','photo_processing','v1', true),
       ('12121212-7777-0000-0000-000000000002','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000002','photo_processing','v1', true);

-- P1 — срок вышел, на снимок никто не ссылается: строка обязана исчезнуть.
insert into photos (id, point_id, client_id, storage_path, sha256, width, height,
                    consent_id, retain_until)
values ('14141414-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000001','/storage/aa/p1.jpg','sha-p1', 2400, 1792,
        '12121212-7777-0000-0000-000000000001', now() - interval '1 day');

insert into photo_masks (photo_id, concept, storage_path, area_px, model_version)
values ('14141414-7777-0000-0000-000000000001','plate','/storage/aa/p1-plate.png', 1200,'v1');

-- P2 — срок действует: снимок обязан остаться нетронутым.
insert into photos (id, point_id, client_id, storage_path, sha256, width, height,
                    consent_id, retain_until)
values ('14141414-7777-0000-0000-000000000002','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000002','/storage/bb/p2.jpg','sha-p2', 2400, 1792,
        '12121212-7777-0000-0000-000000000002', now() + interval '6 months');

-- P3 — срок вышел, но на снимке стоит примерка, доехавшая до наряда.
-- Строку удалить нельзя (внешний ключ из иммутабельной конфигурации),
-- значит она обязана остаться обезличенной.
insert into photos (id, point_id, client_id, storage_path, sha256, width, height,
                    consent_id, retain_until)
values ('14141414-7777-0000-0000-000000000003','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000001','/storage/cc/p3.jpg','sha-p3', 2400, 1792,
        '12121212-7777-0000-0000-000000000001', now() - interval '2 days');

insert into channels (id, point_id, kind, provider, external_id)
values ('99999999-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'telegram','wazzup','tg-r1');

insert into threads (id, point_id, client_id)
values ('88888888-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000001');

-- Переписка старше объявленного срока: сама по себе персональные данные.
insert into messages (point_id, thread_id, channel_id, direction, body,
                      external_message_id, attachments, sent_at)
values ('aaaaaaaa-7777-0000-0000-000000000001','88888888-7777-0000-0000-000000000001',
        '99999999-7777-0000-0000-000000000001','in','Иван, +79997770001, X5 белая','tg-r-1',
        '[{"kind":"image","url":"/storage/aa/msg1.jpg"}]'::jsonb, now() - interval '400 days'),
       ('aaaaaaaa-7777-0000-0000-000000000001','88888888-7777-0000-0000-000000000001',
        '99999999-7777-0000-0000-000000000001','out','Пришлём расчёт','tg-r-2',
        '[]'::jsonb, now() - interval '399 days');

-- Примерка → карточка → подтверждение → наряд → гарантия.
-- Это учётная цепочка, которая обязана пережить уничтожение ПД.
insert into configurations (id, point_id, thread_id, photo_id, created_by)
values ('77777777-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '88888888-7777-0000-0000-000000000001','14141414-7777-0000-0000-000000000003',
        'cccccccc-7777-0000-0000-000000000001');

insert into configuration_items (id, configuration_id, point_id, point_price_id,
                                 category, price_kopecks)
values ('66666666-7777-0000-0000-000000000001','77777777-7777-0000-0000-000000000001',
        'aaaaaaaa-7777-0000-0000-000000000001','eeeeeeee-7777-0000-0000-000000000001',
        'film', 20000000);

insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline,
                     render_class, qa_passed)
select '66666666-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001', v,
       '/storage/r/'||v||'.jpg','{}'::jsonb,'B', true
  from unnest(enum_range(null::render_variant)) v;

insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind,
                            rendered_paths)
values ('55555555-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '77777777-7777-0000-0000-000000000001','Оттенок партии сверим на замере','telegram',
        array['/storage/r/day.jpg','/storage/r/overcast.jpg','/storage/r/parking.jpg']);

insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via, ip)
values ('44444444-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '77777777-7777-0000-0000-000000000001','55555555-7777-0000-0000-000000000001',
        'link','203.0.113.7');

insert into orders (id, point_id, confirmation_id, number, status, total_kopecks, created_at)
values ('33333333-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '44444444-7777-0000-0000-000000000001','Р-001','done', 20000000,
        now() - interval '3 years');

insert into warranties (id, point_id, order_id, number, months, issued_at)
values ('22222222-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        '33333333-7777-0000-0000-000000000001','ГТ-001', 12, now() - interval '3 years');

-- Замер и фото ЛКП до работ: те же чужие машины, тот же §13.
insert into appointments (id, point_id, client_id, kind, starts_at)
values ('a7a7a7a7-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'ffffffff-7777-0000-0000-000000000001','measure', now() - interval '3 years');

insert into condition_photos (id, point_id, appointment_id, storage_path, zone_note)
values ('c7c7c7c7-7777-0000-0000-000000000001','aaaaaaaa-7777-0000-0000-000000000001',
        'a7a7a7a7-7777-0000-0000-000000000001','/storage/cond/c1.jpg','скол на капоте');

insert into notifications (point_id, client_id, thread_id, kind, payload)
values ('aaaaaaaa-7777-0000-0000-000000000001','ffffffff-7777-0000-0000-000000000001',
        '88888888-7777-0000-0000-000000000001','reminder',
        '{"text":"Иван, ждём вас в четверг"}'::jsonb);

-- ── проход уничтожения ───────────────────────────────────────
create temporary table retention_pass1 on commit drop as
  select * from app.expire_personal_data(200);

-- ── 1. Просроченный снимок без ссылок из учёта исчезает ───────
select expect_empty($$
  select 1 from photos where id = '14141414-7777-0000-0000-000000000001'
$$, 'Фото с истёкшим retain_until удалено из базы');

-- ── 2. Файл снимка и файлы его масок помечены к удалению ──────
do $$
declare n integer;
begin
  select count(*) into n from file_erasures
   where storage_path in ('/storage/aa/p1.jpg','/storage/aa/p1-plate.png')
     and erased_at is null;
  if n <> 2 then
    raise exception 'ПРОВАЛ: к удалению помечено % файлов вместо 2 — строка ушла, файл остался', n;
  end if;
  select count(*) into n from photo_masks
   where photo_id = '14141414-7777-0000-0000-000000000001';
  if n <> 0 then
    raise exception 'ПРОВАЛ: маски удалённого снимка остались в базе (% строк)', n;
  end if;
  raise notice 'ok  · Файл удалённого фото и файлы его масок помечены к удалению';
end $$;

-- ── 3. Снимок с действующим сроком не тронут ──────────────────
do $$
declare r photos;
begin
  select * into r from photos where id = '14141414-7777-0000-0000-000000000002';
  if r.id is null then
    raise exception 'ПРОВАЛ: удалено фото, срок хранения которого ещё не истёк';
  end if;
  if r.storage_path <> '/storage/bb/p2.jpg' or r.client_id is null or r.erased_at is not null then
    raise exception 'ПРОВАЛ: фото с действующим сроком обезличено раньше времени';
  end if;
  if exists (select 1 from file_erasures where storage_path = '/storage/bb/p2.jpg') then
    raise exception 'ПРОВАЛ: файл непросроченного фото помечен к удалению';
  end if;
  raise notice 'ok  · Фото с действующим сроком хранения не удаляется и не помечается';
end $$;

-- ── 4. Снимок под примеркой обезличен, а не удалён ────────────
do $$
declare r photos;
begin
  select * into r from photos where id = '14141414-7777-0000-0000-000000000003';
  if r.id is null then
    raise exception 'ПРОВАЛ: снимок под подтверждённой примеркой удалён — в учёте дыра';
  end if;
  if r.client_id is not null or r.storage_path <> 'erased:retention'
     or r.sha256 <> 'erased' or r.erased_at is null then
    raise exception 'ПРОВАЛ: снимок под примеркой остался с ПД: путь %, клиент %',
      r.storage_path, r.client_id;
  end if;
  if not exists (select 1 from file_erasures where storage_path = '/storage/cc/p3.jpg') then
    raise exception 'ПРОВАЛ: файл обезличенного снимка не помечен к удалению';
  end if;
  raise notice 'ok  · Снимок под примеркой обезличен, а не удалён: учёт цел, ПД нет';
end $$;

-- ── 5. След в журнале ─────────────────────────────────────────
do $$
declare d jsonb;
begin
  select detail into d from audit_log
   where action = 'erase' and entity = 'photos'
     and point_id = 'aaaaaaaa-7777-0000-0000-000000000001';
  if d is null then
    raise exception 'ПРОВАЛ: удаление не оставило записи в audit_log — доказать его нечем';
  end if;
  if coalesce((d->>'deleted_rows')::int, 0) <> 1
     or coalesce((d->>'anonymized_rows')::int, 0) <> 1 then
    raise exception 'ПРОВАЛ: в журнале неверные числа: удалено %, обезличено %',
      d->>'deleted_rows', d->>'anonymized_rows';
  end if;
  if coalesce(d->>'basis','') = '' then
    raise exception 'ПРОВАЛ: в журнале нет основания уничтожения';
  end if;
  raise notice 'ok  · Удаление оставило запись в audit_log: что, на каком основании, сколько строк';
end $$;

-- ── 6. ПД клиента стёрты, характеристика машины осталась ──────
do $$
declare r clients;
begin
  select * into r from clients where id = 'ffffffff-7777-0000-0000-000000000001';
  if r.id is null then
    raise exception 'ПРОВАЛ: строка клиента удалена — на неё ссылается учёт';
  end if;
  if r.name is not null or r.phone is not null then
    raise exception 'ПРОВАЛ: имя или телефон клиента пережили срок хранения';
  end if;
  if r.vehicle ? 'plate' then
    raise exception 'ПРОВАЛ: госномер остался в карточке клиента: %', r.vehicle->>'plate';
  end if;
  if r.vehicle->>'make' <> 'BMW' then
    raise exception 'ПРОВАЛ: вместе с ПД потеряна марка автомобиля — обезличивание съело учёт';
  end if;
  if r.erased_at is null then
    raise exception 'ПРОВАЛ: обезличивание не отмечено, повторный проход возьмёт клиента снова';
  end if;
  raise notice 'ok  · ПД клиента стёрты, характеристика автомобиля для учёта осталась';
end $$;

-- ── 7. Переписка обезличенного клиента удалена ────────────────
select expect_empty($$
  select 1 from messages where thread_id = '88888888-7777-0000-0000-000000000001'
$$, 'Переписка обезличенного клиента удалена целиком');

-- ── 8. Фото ЛКП удалено вместе с файлом ───────────────────────
do $$
declare n integer;
begin
  select count(*) into n from condition_photos
   where id = 'c7c7c7c7-7777-0000-0000-000000000001';
  if n <> 0 then
    raise exception 'ПРОВАЛ: фото ЛКП чужой машины пережило срок хранения';
  end if;
  if not exists (select 1 from file_erasures where storage_path = '/storage/cond/c1.jpg') then
    raise exception 'ПРОВАЛ: файл фото ЛКП не помечен к удалению';
  end if;
  if not exists (select 1 from file_erasures where storage_path = '/storage/aa/msg1.jpg') then
    raise exception 'ПРОВАЛ: вложение из переписки не помечено к удалению';
  end if;
  if exists (select 1 from notifications where client_id = 'ffffffff-7777-0000-0000-000000000001') then
    raise exception 'ПРОВАЛ: уведомление с текстом для клиента пережило уничтожение';
  end if;
  raise notice 'ok  · Фото ЛКП, вложения и уведомления клиента уничтожены вместе с файлами';
end $$;

-- ── 9. Учёт цел: наряд, гарантия и подтверждение на месте ──────
do $$
declare o orders; w warranties; n integer;
begin
  select * into o from orders where id = '33333333-7777-0000-0000-000000000001';
  if o.id is null then
    raise exception 'ПРОВАЛ: закрытый заказ-наряд исчез вместе с ПД клиента';
  end if;
  if o.total_kopecks <> 20000000 or o.status <> 'done' then
    raise exception 'ПРОВАЛ: наряд повреждён уничтожением ПД: статус %, сумма %',
      o.status, o.total_kopecks;
  end if;
  select * into w from warranties where id = '22222222-7777-0000-0000-000000000001';
  if w.id is null then
    raise exception 'ПРОВАЛ: гарантийный талон исчез вместе с ПД клиента';
  end if;
  select count(*) into n from confirmations
   where id = '44444444-7777-0000-0000-000000000001';
  if n <> 1 then
    raise exception 'ПРОВАЛ: подтверждение клиента исчезло — в споре нечего предъявить';
  end if;
  raise notice 'ok  · Закрытый наряд с гарантией пережил уничтожение ПД: учёт цел, ПД нет';
end $$;

-- ── 10. Клиент с действующим сроком не тронут ─────────────────
do $$
declare r clients;
begin
  select * into r from clients where id = 'ffffffff-7777-0000-0000-000000000002';
  if r.name is null or r.phone is null or not (r.vehicle ? 'plate') or r.erased_at is not null then
    raise exception 'ПРОВАЛ: обезличен клиент, срок хранения данных которого ещё идёт';
  end if;
  raise notice 'ok  · Клиент с действующим сроком хранения не обезличивается';
end $$;

-- ── 11. Повторный проход ничего не ломает и не задваивает ─────
do $$
declare
  before_audit integer; after_audit integer;
  before_files integer; after_files integer;
  rows_second  integer;
begin
  select count(*) into before_audit from audit_log where action = 'erase';
  select count(*) into before_files from file_erasures;

  select count(*) into rows_second from app.expire_personal_data(200);

  select count(*) into after_audit from audit_log where action = 'erase';
  select count(*) into after_files from file_erasures;

  if rows_second <> 0 then
    raise exception 'ПРОВАЛ: повторный проход нашёл % сущностей — функция не идемпотентна', rows_second;
  end if;
  if after_audit <> before_audit then
    raise exception 'ПРОВАЛ: повторный проход задвоил журнал: было %, стало %',
      before_audit, after_audit;
  end if;
  if after_files <> before_files then
    raise exception 'ПРОВАЛ: повторный проход задвоил очередь на удаление файлов: было %, стало %',
      before_files, after_files;
  end if;
  raise notice 'ok  · Повторный проход ничего не меняет и не задваивает записи в журнале';
end $$;

-- ── 12. Второй шаг: файлы физически удалены, пометки закрыты ───
-- Здесь проверяется договор между базой и диском, а не сам rm: воркер
-- получает пометку, сообщает об успехе, пометка закрывается и попадает
-- в журнал. Удаление файла на диске проверяется прогоном deploy/retention.sh.
do $$
declare r record; n integer; done_n integer := 0;
begin
  for r in select * from app.claim_file_erasures('тест-воркер', 100) loop
    perform app.finish_file_erasure(r.erasure_id, r.erasure_point, true, null);
    done_n := done_n + 1;
  end loop;

  if done_n < 5 then
    raise exception 'ПРОВАЛ: воркеру выдано % пометок, ожидалось не меньше 5', done_n;
  end if;
  select count(*) into n from file_erasures where erased_at is null;
  if n <> 0 then
    raise exception 'ПРОВАЛ: % пометок остались незакрытыми после успешного удаления', n;
  end if;
  select count(*) into n from audit_log where action = 'erase' and entity = 'file';
  if n <> done_n then
    raise exception 'ПРОВАЛ: в журнале % записей об удалённых файлах вместо %', n, done_n;
  end if;
  raise notice 'ok  · Файлы забраны воркером, пометки закрыты, каждое удаление в журнале';
end $$;

-- ── 13. Повторное закрытие пометки не задваивает журнал ────────
do $$
declare before_n integer; after_n integer; fid bigint; fpoint uuid;
begin
  select id, point_id into fid, fpoint from file_erasures order by id limit 1;
  select count(*) into before_n from audit_log where action = 'erase' and entity = 'file';
  perform app.finish_file_erasure(fid, fpoint, true, null);
  select count(*) into after_n from audit_log where action = 'erase' and entity = 'file';
  if after_n <> before_n then
    raise exception 'ПРОВАЛ: повторное закрытие пометки добавило запись в журнал: % → %',
      before_n, after_n;
  end if;
  raise notice 'ok  · Повторное закрытие пометки о файле не добавляет вторую запись в журнал';
end $$;

-- ── 14. Очередь на удаление не протекает между арендаторами ────
select act_as('aaaaaaaa-7777-0000-0000-000000000002'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);
select expect_empty($$
  select 1 from file_erasures
$$, '§13: очередь на удаление файлов чужой точки не видна');
select act_as('aaaaaaaa-7777-0000-0000-000000000001'::uuid,
              '11111111-7777-0000-0000-000000000001'::uuid);

rollback;
