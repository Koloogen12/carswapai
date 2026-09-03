-- CarSwap AI · посевные данные для разработки и демо.
-- Проходит все инварианты схемы — это и проверка, что схемой можно
-- пользоваться, а не только защищаться.

insert into zones (code, name, sort_order) values
  ('full_body','Кузов целиком',1), ('front_full','Полный перед',2),
  ('hood','Капот',3), ('roof','Крыша',4), ('mirrors','Зеркала',5)
on conflict do nothing;

insert into networks (id, name, join_code, price_deviation_allowed_pct, brand)
values ('a0000000-0000-4000-8000-000000000001','JETCAR','JETCAR-2026', 15,
        '{"logo":"JETCAR","accent":"#DEF23B"}'::jsonb)
on conflict do nothing;

insert into points (id, network_id, name, address, public_slug) values
  ('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001',
   'JETCAR Мытищи','Мытищи, Олимпийский пр-т, 29','jetcar-mytishchi'),
  ('b0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001',
   'JETCAR Химки','Химки, Ленинградское ш., 5','jetcar-khimki')
on conflict do nothing;

insert into users (id, point_id, network_id, role, name, phone, email) values
  ('c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001','manager','Ирина Ковалёва','+79161112233','manager@jetcar-mytishchi.example'),
  ('c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001','master','Сергей Панов','+79161112244','master@jetcar-mytishchi.example'),
  ('c0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001','owner','Артём Лебедев','+79161112255','owner@jetcar-mytishchi.example'),
  ('c0000000-0000-4000-8000-000000000004', null,
   'a0000000-0000-4000-8000-000000000001','network_admin','Ольга Титова','+79161112266','network@jetcar.example')
on conflict do nothing;

insert into vehicle_models (id, make, model, generation, body_type, year_from, aliases) values
  ('d1000000-0000-4000-8000-000000000001','BMW','X5','G05','suv',2018,'{бмв,х5,x5}'),
  ('d1000000-0000-4000-8000-000000000002','Kia','K5','DL3','sedan',2019,'{киа,к5}'),
  ('d1000000-0000-4000-8000-000000000003','Lada','Vesta','I','sedan',2015,'{лада,веста}'),
  ('d1000000-0000-4000-8000-000000000004','Volkswagen','Polo','VI','sedan',2020,'{фольксваген,поло}')
on conflict do nothing;

insert into vehicle_zone_metrage (vehicle_model_id, zone_code, running_meters, confidence) values
  ('d1000000-0000-4000-8000-000000000001','full_body', 21.5,'measured'),
  ('d1000000-0000-4000-8000-000000000001','front_full', 7.4,'measured'),
  ('d1000000-0000-4000-8000-000000000002','full_body', 18.2,'measured'),
  ('d1000000-0000-4000-8000-000000000003','full_body', 16.8,'estimated'),
  ('d1000000-0000-4000-8000-000000000004','full_body', 17.1,'estimated')
on conflict do nothing;

insert into catalog_items (id, category, brand, sku, name, finish, light_response, default_class,
                           lab_l, lab_a, lab_b, attrs) values
  ('e1000000-0000-4000-8000-000000000001','film','KPMF','K75407','Сатин-хром тёмный','satin','satin','B',
    38.0, -0.8, -1.4, '{"hex":"#43464A"}'),
  ('e1000000-0000-4000-8000-000000000002','film','Oracal','970-070','Матовый графит','matte','solid','B',
    31.0, -0.2, -1.0, '{"hex":"#3B3E42"}'),
  ('e1000000-0000-4000-8000-000000000003','film','Hexis','HX20-LG','Глянец «лагуна»','gloss','solid','A',
    41.0, -18.0, -14.0, '{"hex":"#1F6C80"}'),
  ('e1000000-0000-4000-8000-000000000004','film','TeckWrap','GAL-OL','Глянец «хаки»','gloss','solid','A',
    43.0, -6.0, 18.0, '{"hex":"#6E6E4C"}'),
  ('e1000000-0000-4000-8000-000000000005','film','KPMF','K75400','Чёрный оникс сатин','satin','satin','B',
    18.0, 0.2, -0.4, '{"hex":"#191A1C"}'),
  ('e1000000-0000-4000-8000-000000000006','ppf','SunTek','PPF-PPF','Прозрачная PPF глянец','clear','solid','A',
    null, null, null, '{"clear":true}'),
  ('e1000000-0000-4000-8000-000000000007','ppf','SunTek','PPF-MATTE','PPF матовая','matte','solid','B',
    null, null, null, '{"clear":true}'),
  ('e1000000-0000-4000-8000-000000000008','tint','Llumar','ATR-20','Тонировка 20%','clear','solid','A',
    null, null, null, '{"vlt":20}'),
  ('e1000000-0000-4000-8000-000000000009','service','CarSwap','RM-OLD','Снятие старой плёнки','clear','solid','A',
    null, null, null, '{"labour":true}')
on conflict do nothing;

-- Каталог сети ШИРЕ прайса точки, и так и должно быть: одна точка работает
-- с матовыми, другая с хромом, третья только с PPF. Эти три артикула в прайс
-- точки не заводятся — они и показывают, что добавить есть что.
insert into catalog_items (id, category, brand, sku, name, finish, light_response,
                           default_class, lab_l, lab_a, lab_b) values
  ('dddddddd-0000-4000-8000-00000000000a','film','Avery','SW900-825','Сатин медь',
   'satin','satin','B', 46.0, 24.0, 31.0),
  ('dddddddd-0000-4000-8000-00000000000b','film','3M','2080-M12','Мат бордо',
   'matte','solid','B', 28.0, 33.0, 12.0),
  ('dddddddd-0000-4000-8000-00000000000c','tint','SunTek','CIR-35','Тонировка 35%',
   'gloss','solid','A', null, null, null)
on conflict do nothing;

insert into network_prices (network_id, catalog_item_id, zone_code, price_kopecks) values
  ('a0000000-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-00000000000a','full_body', 21500000),
  ('a0000000-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-00000000000b','full_body', 19800000),
  ('a0000000-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-00000000000c','full_body', 1800000)
on conflict do nothing;

insert into network_prices (network_id, catalog_item_id, zone_code, price_kopecks)
select 'a0000000-0000-4000-8000-000000000001', id, 'full_body',
       case sku when 'K75407' then 24840000 when '970-070' then 21490000
                when 'HX20-LG' then 19900000 when 'GAL-OL' then 19900000
                when 'K75400' then 23600000 when 'PPF-PPF' then 38000000
                when 'PPF-MATTE' then 42000000 when 'ATR-20' then 1200000
                when 'RM-OLD' then 3400000
                else 900000 end
  from catalog_items on conflict do nothing;

insert into point_prices (point_id, catalog_item_id, zone_code, price_kopecks, in_stock)
select 'b0000000-0000-4000-8000-000000000001', id, 'full_body',
       case sku when 'K75407' then 24840000 when '970-070' then 21490000
                when 'HX20-LG' then 19900000 when 'GAL-OL' then 19900000
                when 'K75400' then 23600000 when 'PPF-PPF' then 38000000
                when 'PPF-MATTE' then 42000000 when 'ATR-20' then 1200000
                when 'RM-OLD' then 3400000
                else 900000 end,
       sku <> 'GAL-OL'
  from catalog_items
 -- Только те, для кого здесь названа цена. Прочие артикулы каталога сети
 -- в прайс точки НЕ заводятся: каталог шире того, что держит точка, и
 -- именно на них показывается «добавить из каталога». Прежний `else 900000`
 -- подставлял им цену вне коридора сети и ронял посев.
 --
 -- RM-OLD «снятие старой плёнки» заведён сюда намеренно. Экран 37 «машина
 -- уже оклеена» обязан ПОСЧИТАТЬ снятие, а не упомянуть его, и цену на это
 -- он имеет право взять только из прайса ЭТОЙ точки (О-3). Без строки в
 -- прайсе экран честно говорит «посчитаем на замере» — и весь смысл кадра,
 -- «продукт сам поднимает цену, потому что спор на выдаче дороже», пропадает.
 where sku in ('K75407','970-070','HX20-LG','GAL-OL','K75400',
               'PPF-PPF','PPF-MATTE','ATR-20','RM-OLD')
 on conflict do nothing;

insert into film_rolls (point_id, catalog_item_id, batch_number, barcode, meters_initial, meters_left) values
  ('b0000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001',
   'П-2026-041','4600001234567', 25, 21.5),
  ('b0000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000002',
   'П-2026-077','4600007654321', 25, 9.0)
on conflict do nothing;

insert into channels (id, point_id, kind, provider, external_id, can_send_images, can_initiate) values
  ('f1000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'telegram','wazzup','tg-jetcar-myt', true, true),
  ('f1000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
   'whatsapp','wazzup','wa-79161112233', true, false),
  ('f1000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000001',
   'avito','avito_direct','avito-jetcar', true, false),
  ('f1000000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000001',
   'max','i2crm','max-jetcar', true, false)
on conflict do nothing;

insert into clients (id, point_id, name, phone, vehicle, vehicle_model_id) values
  ('11100000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   'Дмитрий Реутов','+79031234501','{"make":"BMW","model":"X5","year":2021,"plate":"А432ОР77"}',
   'd1000000-0000-4000-8000-000000000001'),
  ('11100000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
   'Наталья Гурьева','+79031234502','{"make":"Kia","model":"K5","year":2022,"plate":"В274КМ750"}',
   'd1000000-0000-4000-8000-000000000002'),
  ('11100000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000001',
   'Игорь Самойлов','+79031234503','{"make":"Volkswagen","model":"Polo","year":2020,"plate":"Е881АТ197"}',
   'd1000000-0000-4000-8000-000000000004'),
  ('11100000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000001',
   'Марина Ветрова','+79031234504','{"make":"Lada","model":"Vesta","year":2019,"plate":"С748МН78"}',
   'd1000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into consents (id, point_id, client_id, kind, document_version, granted) values
  ('12200000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000001','photo_processing','v1', true),
  ('12200000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000002','photo_processing','v1', true)
on conflict do nothing;

-- О-5: у диалога нет канала. Канал — свойство сообщения; иконка в строке
-- инбокса берётся из последнего сообщения треда.
insert into threads (id, point_id, client_id, status, last_message_at, assigned_to) values
  ('13300000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000001','open',
   now() - interval '4 minutes','c0000000-0000-4000-8000-000000000001'),
  ('13300000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000002','open',
   now() - interval '26 minutes','c0000000-0000-4000-8000-000000000001'),
  ('13300000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000003','open',
   now() - interval '2 hours', null),
  ('13300000-0000-4000-8000-000000000004','b0000000-0000-4000-8000-000000000001',
   '11100000-0000-4000-8000-000000000004','open',
   now() - interval '1 day', null)
on conflict do nothing;

insert into messages (point_id, thread_id, channel_id, direction, body, external_message_id, sent_at) values
  ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000001',
   'f1000000-0000-4000-8000-000000000001','in',
   'Добрый день! Сколько будет обклеить X5 в сатин-хром?','tg-1', now() - interval '9 minutes'),
  ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000001',
   'f1000000-0000-4000-8000-000000000001','in','Вот фото','tg-2', now() - interval '4 minutes'),
  ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000002',
   'f1000000-0000-4000-8000-000000000002','in',
   'Здравствуйте, интересует матовый графит на K5','wa-1', now() - interval '26 minutes'),
  ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000003',
   'f1000000-0000-4000-8000-000000000003','in',
   'Здравствуйте, ещё актуально?','av-1', now() - interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000004',
   'f1000000-0000-4000-8000-000000000004','in',
   'А тонировку делаете?','max-1', now() - interval '1 day')
on conflict do nothing;

-- Подтверждённая конфигурация и наряд для экрана мастера (фаза 4).
-- Проходит О-2 и О-3: три света с пройденным QA на каждой позиции,
-- артикул из прайса этой точки.
insert into photos (id, point_id, client_id, storage_path, sha256, width, height, consent_id,
                    vehicle_model_id)
values ('14400000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000001','/renders/input-client-photo.jpg','seed-x5',
        2400, 1792,'12200000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into configurations (id, point_id, thread_id, photo_id, vehicle_model_id, created_by, origin)
values ('15500000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '13300000-0000-4000-8000-000000000001','14400000-0000-4000-8000-000000000001',
        'd1000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','manager')
on conflict do nothing;

insert into configuration_items (id, configuration_id, point_id, point_price_id, category,
                                price_kopecks, meters_required)
select '16600000-0000-4000-8000-000000000001','15500000-0000-4000-8000-000000000001',
       'b0000000-0000-4000-8000-000000000001', pp.id, 'film', pp.price_kopecks, 21.5
  from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
 where pp.point_id = 'b0000000-0000-4000-8000-000000000001' and ci.sku = 'K75407'
on conflict do nothing;

insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline,
                     render_class, qa_passed, cost_kopecks)
select '16600000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001', v,
       '/renders/light-black-'||(case v when 'day' then 'sun' when 'overcast' then 'cloud'
                                       else 'park' end)||'.jpg',
       '{"source":"seed"}'::jsonb,'B', true, 850
  from unnest(enum_range(null::render_variant)) v
on conflict do nothing;

insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('17700000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000001',
        'Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.',
        'telegram', array['/renders/light-black-sun.jpg','/renders/light-black-cloud.jpg',
                          '/renders/light-black-park.jpg'])
on conflict do nothing;

insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via,
                           confirmed_at)
values ('18800000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000001','17700000-0000-4000-8000-000000000001','link',
        now() - interval '3 days')
on conflict do nothing;

insert into orders (id, point_id, confirmation_id, number, status, total_kopecks)
values ('19900000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '18800000-0000-4000-8000-000000000001','ЗН-2026-0148','created', 24840000)
on conflict do nothing;

-- Состояния, которые нарисованы в макетах и без которых половина экранов
-- показывает пустоту: заблокированный наряд, запись через гараж без
-- менеджера, отвалившийся канал, расход у порога.

update channels set status = 'disconnected',
       last_error = 'Слетела привязка номера. Повторная привязка — три действия внутри продукта'
 where kind = 'whatsapp';

insert into bays (id, point_id, name) values
  ('ba100000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','Пост №1'),
  ('ba100000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001','Пост №2')
on conflict do nothing;

insert into subscriptions (point_id, plan, price_kopecks, period_start, period_end)
values ('b0000000-0000-4000-8000-000000000001','point', 1000000,
        date_trunc('month', now())::date, (date_trunc('month', now()) + interval '1 month')::date)
on conflict do nothing;

-- Расход у порога: без него шкала и прогноз показывают ноль.
--
-- «on conflict do nothing» здесь НЕ работает и не работало: у строки расхода
-- нет естественного ключа, id генерируется случайным, конфликтовать не с чем.
-- Каждый повторный прогон посева дописывал ещё 620 строк. На стенде посев
-- отработал пять раз за отладку — точка «потратила» 6 820 ₽ при потолке
-- 3 000 ₽ и встала за жёстким стопом, то есть демо открывалось с серой
-- кнопкой «Примерить».
--
-- Защита — проверкой существования, а не конфликтом: если расход у точки уже
-- есть, второй раз не начисляем.
insert into generation_usage (point_id, render_class, category, cost_kopecks, model_used)
select 'b0000000-0000-4000-8000-000000000001',
       case when g % 4 = 0 then 'B' else 'A' end::render_class,
       'film'::item_category,
       case when g % 4 = 0 then 850 else 10 end,
       case when g % 4 = 0 then 'gemini-3.1-flash-image' else null end
  from generate_series(1, 620) g
 where not exists (select 1 from generation_usage
                    where point_id = 'b0000000-0000-4000-8000-000000000001');

-- Химки держим У ПОРОГА, а Мытищи — здоровыми. Состояние «расход у потолка»
-- нарисовано в макете и должно быть показуемым, но не на той точке, которую
-- показывают клиенту: серая кнопка «Примерить» на демо — худшее, что можно
-- придумать. 300 генераций класса B по 8,5 ₽ дают 2 550 ₽ — это 85% от
-- жёсткого потолка в 3 000 ₽, то есть порог сработал, а работа не встала.
insert into generation_usage (point_id, render_class, category, cost_kopecks, model_used)
select 'b0000000-0000-4000-8000-000000000002', 'B'::render_class,
       'film'::item_category, 850, 'gemini-3.1-flash-image'
  from generate_series(1, 300) g
 where not exists (select 1 from generation_usage
                    where point_id = 'b0000000-0000-4000-8000-000000000002');

-- Гараж привёл клиента сам: конфигурация без треда, запись без менеджера.
insert into clients (id, point_id, name, phone, vehicle, vehicle_model_id)
values ('11100000-0000-4000-8000-000000000005','b0000000-0000-4000-8000-000000000001',
        'Егор Лапин','+79031234505','{"make":"Kia","model":"K5","year":2022,"plate":"Н623ВУ750"}',
        'd1000000-0000-4000-8000-000000000002')
on conflict do nothing;

insert into configurations (id, point_id, vehicle_model_id, origin, session_id)
values ('15500000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
        'd1000000-0000-4000-8000-000000000002','garage','sess-garage-1')
on conflict do nothing;

-- Позиция для этой примерки. Без неё замер повисает в воздухе: мастер
-- приезжает мерить, а мерить нечего — ни артикула, ни зоны, ни цены.
-- Раньше этого не было заметно, потому что мусор от прогонов подставлял
-- лишние позиции и соединение находило хоть что-то. Чистый посев вскрыл.
insert into configuration_items (id, configuration_id, point_id, point_price_id,
                                 category, price_kopecks)
select '16600000-0000-4000-8000-000000000002',
       '15500000-0000-4000-8000-000000000002',
       'b0000000-0000-4000-8000-000000000001',
       pp.id, 'film'::item_category, pp.price_kopecks
  from point_prices pp
 where pp.point_id = 'b0000000-0000-4000-8000-000000000001'
 order by pp.id limit 1
on conflict do nothing;

insert into appointments (id, point_id, client_id, configuration_id, bay_id, kind,
                          starts_at, ends_at)
values ('ab100000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000005',
        '15500000-0000-4000-8000-000000000002','ba100000-0000-4000-8000-000000000002',
        'measure', now() + interval '1 day', now() + interval '1 day 20 minutes')
on conflict do nothing;

-- ЧЕГО ЗДЕСЬ СОЗНАТЕЛЬНО НЕТ: дефектов и замеренного метража.
-- Визит назначен на завтра, то есть ещё не состоялся, и результатов у него
-- быть не может. Экран замера выбирает шаг по данным: есть дефекты — значит
-- осмотр уже прошёл. Записать их заранее означало бы показать мастеру
-- заполненный бланк визита, которого не было.

-- Наряд, заблокированный несовпавшим рулоном: событие и экран мастера.
insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail)
values ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','master',
        'order.roll_mismatch','orders','19900000-0000-4000-8000-000000000001',
        '{"expected":"K75407","scanned":"970-070"}'::jsonb)
on conflict do nothing;

-- Движение склада, чтобы список движений не был пуст.
insert into stock_moves (point_id, roll_id, order_id, reason, delta_meters)
select 'b0000000-0000-4000-8000-000000000001', fr.id,
       '19900000-0000-4000-8000-000000000001','consume', -3.5
  from film_rolls fr
 where fr.point_id = 'b0000000-0000-4000-8000-000000000001'
   and fr.batch_number = 'П-2026-077'
   and not exists (select 1 from stock_moves sm where sm.roll_id = fr.id);

-- Работа занимает пост на три дня — именно из-за этого возникают накладки,
-- ради которых лента постов и нужна. В клетках по дням это не видно.
insert into appointments (id, point_id, client_id, configuration_id, bay_id, kind,
                          status, starts_at, ends_at)
values ('ab100000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000001','15500000-0000-4000-8000-000000000001',
        'ba100000-0000-4000-8000-000000000001','work','planned',
        date_trunc('day', now()) + interval '1 day 10 hours',
        date_trunc('day', now()) + interval '4 days')
on conflict do nothing;

-- Клиент, подтвердивший цвет и ждущий слот: он стоит в свободной части ленты.
insert into clients (id, point_id, name, phone, vehicle, vehicle_model_id)
values ('11100000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        'Анна Величко','+79031234506','{"make":"Mini","model":"Countryman","year":2021,"plate":"К402РС199"}',
        'd1000000-0000-4000-8000-000000000002')
on conflict do nothing;
insert into consents (id, point_id, client_id, kind, document_version, granted)
values ('12200000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000006','photo_processing','v1', true)
on conflict do nothing;
insert into threads (id, point_id, client_id, status, last_message_at)
values ('13300000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000006','open', now() - interval '6 days')
on conflict do nothing;
insert into configurations (id, point_id, thread_id, vehicle_model_id, created_by)
values ('15500000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        '13300000-0000-4000-8000-000000000006','d1000000-0000-4000-8000-000000000002',
        'c0000000-0000-4000-8000-000000000001')
on conflict do nothing;
insert into configuration_items (id, configuration_id, point_id, point_price_id, category,
                                price_kopecks, meters_required)
select '16600000-0000-4000-8000-000000000006','15500000-0000-4000-8000-000000000006',
       'b0000000-0000-4000-8000-000000000001', pp.id, 'film', pp.price_kopecks, 17.4
  from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
 where pp.point_id = 'b0000000-0000-4000-8000-000000000001' and ci.sku = '970-070'
on conflict do nothing;
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline,
                     render_class, qa_passed, cost_kopecks)
select '16600000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001', v,
       '/renders/render-0'||(case v when 'day' then '2' when 'overcast' then '4' else '6' end)||'.png',
       '{"source":"seed"}'::jsonb,'B', true, 850
  from unnest(enum_range(null::render_variant)) v
on conflict do nothing;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('17700000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000006',
        'Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.',
        'telegram', array['/renders/render-02.png','/renders/render-04.png','/renders/render-06.png'])
on conflict do nothing;
insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via, confirmed_at)
values ('18800000-0000-4000-8000-000000000006','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000006','17700000-0000-4000-8000-000000000006','link',
        now() - interval '6 days')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Сделка №7 · сдана, талон выдан
-- ─────────────────────────────────────────────────────────────
-- Третья сделка, а не переезд второй. Без закрытой сделки экран гарантии в
-- клиентской ссылке недостижим: последний шаг пути показывал пустоту, а
-- обращение «плёнка отходит» нельзя было ни открыть, ни проверить.
--
-- Почему не закрыть уже существующую: у сделки №1 наряд стоит на посту, у
-- №6 клиент ещё выбирает время замера. Закрыть любую из них значит опустошить
-- экран мастера или сломать проверку достоверности, привязанную к шагу записи.
-- Точке нужны все три состояния сразу — так она и выглядит в жизни.
insert into clients (id, point_id, name, phone, vehicle, vehicle_model_id)
values ('11100000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        'Сергей Кравцов','+79031234507',
        '{"make":"Audi","model":"Q7","year":2022,"plate":"Териал777"}',
        'd1000000-0000-4000-8000-000000000002')
on conflict do nothing;
insert into consents (id, point_id, client_id, kind, document_version, granted)
values ('12200000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000007','photo_processing','v1', true)
on conflict do nothing;
insert into threads (id, point_id, client_id, status, last_message_at)
values ('13300000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '11100000-0000-4000-8000-000000000007','open', now() - interval '14 days')
on conflict do nothing;
insert into configurations (id, point_id, thread_id, vehicle_model_id, created_by)
values ('15500000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '13300000-0000-4000-8000-000000000007','d1000000-0000-4000-8000-000000000002',
        'c0000000-0000-4000-8000-000000000001')
on conflict do nothing;
insert into configuration_items (id, configuration_id, point_id, point_price_id, category,
                                price_kopecks, meters_required)
select '16600000-0000-4000-8000-000000000007','15500000-0000-4000-8000-000000000007',
       'b0000000-0000-4000-8000-000000000001', pp.id, 'film', pp.price_kopecks, 19.6
  from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
 where pp.point_id = 'b0000000-0000-4000-8000-000000000001' and ci.sku = 'K75400'
on conflict do nothing;
insert into renders (configuration_item_id, point_id, variant, storage_path, pipeline,
                     render_class, qa_passed, cost_kopecks)
select '16600000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001', v,
       '/renders/render-1'||(case v when 'day' then '2' when 'overcast' then '1' else '0' end)||'.png',
       '{"source":"seed"}'::jsonb,'B', true, 850
  from unnest(enum_range(null::render_variant)) v
on conflict do nothing;
insert into outbound_cards (id, point_id, configuration_id, honesty_line, channel_kind, rendered_paths)
values ('17700000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000007',
        'Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.',
        'whatsapp', array['/renders/render-12.png','/renders/render-11.png','/renders/render-10.png'])
on conflict do nothing;
insert into confirmations (id, point_id, configuration_id, outbound_card_id, confirmed_via, confirmed_at)
values ('18800000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '15500000-0000-4000-8000-000000000007','17700000-0000-4000-8000-000000000007','link',
        now() - interval '14 days')
on conflict do nothing;
insert into orders (id, point_id, confirmation_id, number, status, total_kopecks,
                    batch_number, created_at)
values ('19900000-0000-4000-8000-000000000007','b0000000-0000-4000-8000-000000000001',
        '18800000-0000-4000-8000-000000000007','ЗН-2026-0141','done', 21490000,
        'П-2026-0341', now() - interval '12 days')
on conflict do nothing;
insert into warranties (point_id, order_id, number, months, issued_at)
values ('b0000000-0000-4000-8000-000000000001','19900000-0000-4000-8000-000000000007',
        'ГТ-2026-0141', 24, now() - interval '9 days')
on conflict do nothing;

-- Отправленная карточка в ленте диалога: без неё главный компонент продукта
-- на экране не появляется вовсе — ни трёх светов, ни строки честности.
insert into messages (point_id, thread_id, channel_id, direction, body,
                      outbound_card_id, delivery, sent_at)
select 'b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000001',
       'f1000000-0000-4000-8000-000000000001','out',
       'Ваш BMW X5 в трёх плёнках · три света. Оттенок партии сверим с рулоном при вас на замере — образец приложим.',
       '17700000-0000-4000-8000-000000000001','delivered', now() - interval '3 minutes'
 where not exists (select 1 from messages m
                    where m.thread_id = '13300000-0000-4000-8000-000000000001'
                      and m.direction = 'out');

insert into messages (point_id, thread_id, channel_id, direction, body,
                      external_message_id, sent_at)
values ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000001',
        'f1000000-0000-4000-8000-000000000001','in',
        'А можно ещё в этом, но матовый?','tg-3', now() - interval '1 minute')
on conflict do nothing;

-- Фото подхвачено из ленты автоматически: системная отметка в диалоге.
insert into messages (point_id, thread_id, channel_id, direction, body,
                      external_message_id, attachments, sent_at)
values ('b0000000-0000-4000-8000-000000000001','13300000-0000-4000-8000-000000000001',
        'f1000000-0000-4000-8000-000000000001','in',
        'Фото из диалога подхвачено автоматически','tg-photo',
        '[{"kind":"image","url":"/renders/input-client-photo.jpg"}]'::jsonb,
        now() - interval '5 minutes')
on conflict do nothing;

update threads set last_message_at = now() - interval '1 minute'
 where id = '13300000-0000-4000-8000-000000000001';

-- Повторное обращение: клиент был у нас раньше, и это видно в шапке диалога.
update clients set vehicle = vehicle || '{"note":"Второе обращение · в марте смотрели матовый чёрный"}'::jsonb
 where id = '11100000-0000-4000-8000-000000000001';

-- Касса: оплаты и долг. Долг возникает там, где машину отдали до оплаты
-- остатка — только такой случай и считается просроченным.
insert into invoices (id, order_id, number, amount_kopecks, status)
values ('c1c1c1c1-0000-4000-8000-000000000001','19900000-0000-4000-8000-000000000001',
        'СЧ-4182-1', 25390000, 'issued')
on conflict do nothing;

insert into payments (point_id, invoice_id, kind, amount_kopecks, method, external_id)
values ('b0000000-0000-4000-8000-000000000001','c1c1c1c1-0000-4000-8000-000000000001',
        'prepay', 7617000, 'qr', 'pay-4182-1')
on conflict do nothing;

insert into reply_templates (point_id, title, body, sort_order) values
  ('b0000000-0000-4000-8000-000000000001','Сколько по времени',
   'Оклейка целиком — три дня. Замер двадцать минут, можно сегодня.', 1),
  ('b0000000-0000-4000-8000-000000000001','Чем мат отличается от сатина',
   'Сатин даёт мягкий блеск и меньше пачкается, мат — полностью глухой. Покажу оба на вашей машине.', 2),
  ('b0000000-0000-4000-8000-000000000001','Дожим после подтверждения',
   'Держу за вами {артикул} и рулон партии {партия}. Есть окно {слот} — забронировать?', 3),
  ('b0000000-0000-4000-8000-000000000001','Цвета нет в прайсе',
   'Этого артикула у нас нет. Ближайший — {аналог}, {цена}. Показать на вашей машине?', 4)
on conflict do nothing;

-- Аудит-лог: события, которые действительно разбирают. Лог нужен не для
-- контроля людей, а для одного вопроса — почему цена в наряде отличается
-- от той, что видел клиент.
insert into audit_log (point_id, actor_id, actor_role, action, entity, entity_id, detail, at) values
  ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001','manager',
   'order.created','orders','19900000-0000-4000-8000-000000000001',
   '{"text":"Сформировала наряд из подтверждённой конфигурации"}'::jsonb, now() - interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000003','owner',
   'price.markup_changed','point_prices', null,
   '{"text":"Поднял коэффициент наценки с +28% до +32%","from":28,"to":32}'::jsonb, now() - interval '5 hours'),
  ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000003','owner',
   'price.sku_disabled','catalog_items', null,
   '{"text":"Погасил артикул «глянец хаки» · нет на складе"}'::jsonb, now() - interval '6 hours'),
  ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000002','master',
   'order.roll_verified','orders','19900000-0000-4000-8000-000000000001',
   '{"text":"Сверил рулон · партия совпала"}'::jsonb, now() - interval '1 day'),
  ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000003','owner',
   'access.revoked','users', null,
   '{"text":"Отозвал доступ у бывшего менеджера · лиды остались на точке"}'::jsonb, now() - interval '3 days')
on conflict do nothing;
