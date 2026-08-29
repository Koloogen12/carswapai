-- CarSwap AI · тесты на инварианты
--
-- Хартия §7: «Тесты на инварианты, а не на функции. Проверяй, что невалидную
-- карточку невозможно отправить ни одним путём, что подтверждённый снимок
-- невозможно перезаписать, что артикул вне прайса точки не появляется».
--
-- Эти тесты переживут любой рефакторинг и любую смену агента. Каждый из них
-- бьёт по базе напрямую, в обход приложения: если инвариант держится только
-- в сервисном слое, тест это покажет.

\set ON_ERROR_STOP on
\pset tuples_only on
-- expect_fail/expect_ok создаёт tests/_helpers.sql от имени владельца схемы.



-- ── стенд ────────────────────────────────────────────────────
begin;

insert into zones (code, name) values ('full_body','Кузов целиком'), ('front_full','Полный перед');

insert into networks (id, name, join_code, price_deviation_allowed_pct)
values ('11111111-1111-1111-1111-111111111111','JETCAR','JETCAR-2026', 10);

-- Каждая точка заводится под своей претензией: RLS не даст создать чужую,
-- и приложение в бою делает ровно так же — сначала claim, потом вставка.
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);
insert into points (id, network_id, name, public_slug) values
  ('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Точка А','tochka-a');
select act_as('bbbbbbbb-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);
insert into points (id, network_id, name, public_slug) values
  ('bbbbbbbb-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Точка Б','tochka-b');
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);   -- дальше работаем от точки А

insert into users (id, point_id, network_id, role, name) values
  ('cccccccc-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111','manager','Менеджер А');

insert into catalog_items (id, category, brand, sku, name, finish, light_response, default_class, lab_l, lab_a, lab_b)
values ('dddddddd-0000-0000-0000-000000000001','film','KPMF','K75400','Satin Black','satin','satin','B', 22.0, 0.4, -0.6),
       ('dddddddd-0000-0000-0000-000000000002','film','Hexis','HX20','Gloss Blue','gloss','solid','A', 34.0, 12.0, -41.0);

insert into network_prices (network_id, catalog_item_id, zone_code, price_kopecks)
values ('11111111-1111-1111-1111-111111111111','dddddddd-0000-0000-0000-000000000001','full_body', 25000000);

insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks) values
  ('eeeeeeee-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
   'dddddddd-0000-0000-0000-000000000001','full_body', 26000000);
select act_as('bbbbbbbb-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks) values
  ('eeeeeeee-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000002',
   'dddddddd-0000-0000-0000-000000000001','full_body', 24000000);
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);

insert into clients (id, point_id, name, phone)
values ('ffffffff-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Клиент','+79990000001');

insert into channels (id, point_id, kind, provider, external_id)
values ('99999999-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','telegram','wazzup','tg-1');

insert into threads (id, point_id, client_id)
values ('88888888-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
        'ffffffff-0000-0000-0000-000000000001');

insert into configurations (id, point_id, thread_id, created_by)
values ('77777777-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
        '88888888-0000-0000-0000-000000000001','cccccccc-0000-0000-0000-000000000001');

-- ── О-3. Артикул вне прайса этой точки ───────────────────────
select expect_fail($$
  insert into configuration_items (configuration_id, point_id, point_price_id, category, price_kopecks)
  values ('77777777-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
          'eeeeeeee-0000-0000-0000-000000000002','film', 24000000)
$$, 'О-3: прайс чужой точки не подставляется в примерку');

select expect_ok($$
  insert into configuration_items (id, configuration_id, point_id, point_price_id, category, price_kopecks)
  values ('66666666-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001',
          'aaaaaaaa-0000-0000-0000-000000000001','eeeeeeee-0000-0000-0000-000000000001','film', 26000000)
$$, 'О-3: прайс своей точки подставляется');

-- ── О-2. Карточка без трёх световых условий ──────────────────
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
values ('66666666-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
        'day','/r/1.jpg','{}'::jsonb,'B', true);

select expect_fail($$
  insert into outbound_cards (point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
  values ('aaaaaaaa-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001',
          'Оттенок партии сверим на замере','telegram', array['/r/1.jpg','/r/2.jpg','/r/3.jpg'])
$$, 'О-2: отправка с одним световым условием невозможна');

insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline, render_class, qa_passed)
values ('66666666-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
        'overcast','/r/2.jpg','{}'::jsonb,'B', true),
       ('66666666-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
        'parking','/r/3.jpg','{}'::jsonb,'B', false);   -- третий не прошёл QA

select expect_fail($$
  insert into outbound_cards (point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
  values ('aaaaaaaa-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001',
          'Оттенок партии сверим на замере','telegram', array['/r/1.jpg','/r/2.jpg','/r/3.jpg'])
$$, 'О-2: рендер, не прошедший QA-гейт, не считается световым условием');

update renders set qa_passed = true
  where configuration_item_id = '66666666-0000-0000-0000-000000000001' and variant = 'parking';

select expect_fail($$
  insert into outbound_cards (point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
  values ('aaaaaaaa-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001',
          '   ','telegram', array['/r/1.jpg','/r/2.jpg','/r/3.jpg'])
$$, 'О-2: карточка с пустой строкой честности невозможна');

select expect_ok($$
  insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
  values ('55555555-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
          '77777777-0000-0000-0000-000000000001','Оттенок партии сверим на замере, образец приложим',
          'telegram', array['/r/1.jpg','/r/2.jpg','/r/3.jpg'])
$$, 'О-2: полная карточка отправляется');

-- ── О-2. Подтверждение без показанной оговорки ───────────────
select expect_fail($$
  insert into confirmations (point_id, configuration_id, outbound_card_id, honesty_shown, confirmed_via)
  values ('aaaaaaaa-0000-0000-0000-000000000001','77777777-0000-0000-0000-000000000001',
          '55555555-0000-0000-0000-000000000001', false, 'link')
$$, 'О-2: подтверждение без показанной оговорки невозможно');

select expect_ok($$
  insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via)
  values ('44444444-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',
          '77777777-0000-0000-0000-000000000001','55555555-0000-0000-0000-000000000001','link')
$$, 'О-2: подтверждение с оговоркой фиксируется');

-- ── О-4. Иммутабельность подтверждённого выбора ──────────────
select expect_fail($$
  update confirmations set confirmed_via = 'chat'
   where id = '44444444-0000-0000-0000-000000000001'
$$, 'О-4: подтверждение клиента нельзя переписать');

select expect_fail($$
  delete from confirmations where id = '44444444-0000-0000-0000-000000000001'
$$, 'О-4: подтверждение клиента нельзя удалить');

select expect_fail($$
  update configurations set thread_id = null
   where id = '77777777-0000-0000-0000-000000000001'
$$, 'О-4: конфигурацию нельзя править на месте, только новая версия');

select expect_fail($$
  update renders set storage_path = '/r/подмена.jpg'
   where configuration_item_id = '66666666-0000-0000-0000-000000000001' and variant = 'day'
$$, 'Инвариант 10: файл, который подтвердил клиент, нельзя подменить');

-- ── С-4. Коридор цен сети ────────────────────────────────────
select expect_fail($$
  update point_prices set price_kopecks = 40000000
   where id = 'eeeeeeee-0000-0000-0000-000000000001'
$$, 'С-4: цена вне коридора сети блокируется');

-- ── Идемпотентность входящего потока ─────────────────────────
insert into messages (point_id, thread_id, channel_id, direction, body, external_message_id)
values ('aaaaaaaa-0000-0000-0000-000000000001','88888888-0000-0000-0000-000000000001',
        '99999999-0000-0000-0000-000000000001','in','сколько будет обклеить','ext-1');

select expect_fail($$
  insert into messages (point_id, thread_id, channel_id, direction, body, external_message_id)
  values ('aaaaaaaa-0000-0000-0000-000000000001','88888888-0000-0000-0000-000000000001',
          '99999999-0000-0000-0000-000000000001','in','сколько будет обклеить','ext-1')
$$, 'Повторная доставка вебхука не создаёт второе обращение');

-- ── Артикул с нелинейным откликом на свет ────────────────────
select expect_fail($$
  insert into catalog_items (category, brand, sku, name, finish, light_response, default_class)
  values ('film','TeckWrap','CH01','Хамелеон','metallic','chameleon','B')
$$, 'Хамелеон без измеренного LAB не заводится: три света сдвигом экспозиции соврут');

-- ── Расход считается в копейках и копится по точке ───────────
insert into generation_usage (point_id, render_class, category, cost_kopecks, model_used)
values ('aaaaaaaa-0000-0000-0000-000000000001','B','film', 850, 'gemini-3.1-flash-image'),
       ('aaaaaaaa-0000-0000-0000-000000000001','A','tint', 10, null);

do $$
declare spent integer;
begin
  select spent_kopecks into spent from point_budgets
   where point_id = 'aaaaaaaa-0000-0000-0000-000000000001'
     and period_month = date_trunc('month', now())::date;
  if spent <> 860 then
    raise exception 'ПРОВАЛ: расход по точке посчитан как % вместо 860 коп.', spent;
  end if;
  raise notice 'ok  · Расход копится по точке в копейках, а не в штуках генераций';
end $$;

-- ── §13. Изоляция арендаторов проверяется попыткой ───────────
set local role app_tenant;
set local request.jwt.claims = '{"app_role":"manager","point_id":"bbbbbbbb-0000-0000-0000-000000000002","network_id":"11111111-1111-1111-1111-111111111111"}';

do $$
declare n integer;
begin
  select count(*) into n from configurations;
  if n <> 0 then
    raise exception 'ПРОВАЛ: менеджер точки Б видит % конфигураций точки А', n;
  end if;
  select count(*) into n from messages;
  if n <> 0 then
    raise exception 'ПРОВАЛ: менеджер точки Б видит переписку точки А';
  end if;
  raise notice 'ok  · §13: менеджер чужой точки не видит ни примерок, ни переписки';
end $$;


-- ── RLS на запись ────────────────────────────────────────────
-- Эти проверки невозможно было выполнить, пока стенд шёл от суперпользователя:
-- он обходит RLS всегда, и любой результат здесь был бы ложно-зелёным.
-- Чтение чужого — утечка. Запись в чужого — порча данных у другого бизнеса,
-- и она страшнее, поэтому проверяется отдельно и по каждому направлению.
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);

select expect_denied($$
  insert into clients (point_id, name, phone)
  values ('bbbbbbbb-0000-0000-0000-000000000002','Подсадной','+79990009999')
$$, 'RLS: точка не может завести клиента в чужой точке');

select expect_denied($$
  insert into point_prices (point_id, catalog_item_id, zone_code, price_kopecks)
  values ('bbbbbbbb-0000-0000-0000-000000000002','dddddddd-0000-0000-0000-000000000001','full_body', 1)
$$, 'RLS: точка не может дописать строку в чужой прайс');

select expect_empty($$
  select 1 from point_prices where point_id = 'bbbbbbbb-0000-0000-0000-000000000002'
$$, 'RLS: чужой прайс не виден на чтение');

select expect_empty($$
  select 1 from points where id = 'bbbbbbbb-0000-0000-0000-000000000002'
$$, 'RLS: чужая точка не видна на чтение');

-- Увести свою строку в чужую точку одним update — тот же пробой, другой путь.
select expect_denied($$
  update point_prices set point_id = 'bbbbbbbb-0000-0000-0000-000000000002'
   where id = 'eeeeeeee-0000-0000-0000-000000000001'
$$, 'RLS: свою строку нельзя переписать в чужую точку');

-- Удалить чужое нельзя, но молча «удалить ноль строк» — не доказательство:
-- проверяем, что строка на месте, встав под её арендатора.
do $$
declare n int;
begin
  delete from point_prices where id = 'eeeeeeee-0000-0000-0000-000000000002';
  perform act_as('bbbbbbbb-0000-0000-0000-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);
  select count(*) into n from point_prices where id = 'eeeeeeee-0000-0000-0000-000000000002';
  if n <> 1 then
    raise exception 'ПРОВАЛ: строка чужой точки удалена через RLS';
  end if;
  perform act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);
  raise notice 'ok  · RLS: удаление чужой строки не проходит, строка на месте';
end $$;

-- Мастер у поста: только чтение. Политика master_read_only — restrictive,
-- значит она режет поверх арендаторской, а не вместо неё.
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'master');
select expect_denied($$
  insert into configurations (point_id, thread_id, created_by)
  values ('aaaaaaaa-0000-0000-0000-000000000001','88888888-0000-0000-0000-000000000001',
          'cccccccc-0000-0000-0000-000000000001')
$$, 'RLS: мастер у поста не создаёт примерок, только читает');
select act_as('aaaaaaaa-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid);

set local request.jwt.claims = '{"app_role":"network_admin","network_id":"11111111-1111-1111-1111-111111111111"}';
do $$
declare n integer;
begin
  select count(*) into n from messages;
  if n <> 0 then
    raise exception 'ПРОВАЛ: управляющая компания видит % сообщений клиентов', n;
  end if;
  select count(*) into n from configurations;
  if n = 0 then
    raise exception 'ПРОВАЛ: управляющая компания не видит срез по точкам сети';
  end if;
  raise notice 'ok  · §13: сеть видит срез по точкам, но не переписки клиентов';
end $$;

reset role;
rollback;
