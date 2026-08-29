-- CarSwap AI · тесты на подключение каналов (миграция 018)
--
-- Проверяется не аккуратность серверных действий, а невозможность обойти их
-- запросом мимо приложения. Кнопка, спрятанная в интерфейсе, ничего не
-- закрывает: доказывать надо, что канал НЕЛЬЗЯ подключить не владельцем,
-- НЕЛЬЗЯ завести в чужую точку и НЕЛЬЗЯ привязать один внешний
-- идентификатор к двум точкам.
--
-- ВАЖНАЯ ОСОБЕННОСТЬ СТЕНДА, из-за которой здесь не везде expect_denied.
-- RLS отказывает по-разному:
--   · на insert нарушение `with check` — это исключение 42501, его ловит
--     expect_denied;
--   · на update и delete строка, не прошедшая `using`, просто НЕ ВИДНА.
--     Команда выполняется успешно и трогает ноль строк. Исключения нет.
-- Поэтому «менеджер не отключает канал» проверяется числом затронутых строк,
-- а не отказом. Написать здесь expect_denied значило бы получить ложный
-- провал и, что хуже, поверить в защиту, которую не проверили.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

\set NA '''11111111-8888-0000-0000-00000000000a'''
\set NB '''11111111-8888-0000-0000-00000000000b'''
\set PA '''aaaaaaaa-8888-0000-0000-000000000001'''
\set PB '''bbbbbbbb-8888-0000-0000-000000000002'''
\set PC '''cccccccc-8888-0000-0000-000000000003'''
\set CH '''99999999-8888-0000-0000-000000000001'''
\set CL '''11100000-8888-0000-0000-000000000001'''
\set TH '''12200000-8888-0000-0000-000000000001'''

-- ── Стенд: две сети, три точки ───────────────────────────────
-- Точки А и В в одной сети — на них проверяется управляющая компания.
-- Точка Б в другой сети — на ней проверяется чужой арендатор.
insert into networks (id, name, join_code, price_deviation_allowed_pct) values
  (:NA,'Сеть каналов А','CHN-A-2026', 10),
  (:NB,'Сеть каналов Б','CHN-B-2026', 10);

select act_as(:PA::uuid, :NA::uuid);
insert into points (id, network_id, name, public_slug)
values (:PA,:NA,'Пост на Кутузовском','chn-a');

select act_as(:PC::uuid, :NA::uuid);
insert into points (id, network_id, name, public_slug)
values (:PC,:NA,'Вторая точка сети А','chn-c');

select act_as(:PB::uuid, :NB::uuid);
insert into points (id, network_id, name, public_slug)
values (:PB,:NB,'Точка чужой сети','chn-b');

-- ── 1. Канал заводится только в свою точку ───────────────────
select act_as(:PA::uuid, :NA::uuid);

select expect_ok(format($$
  insert into channels (id, point_id, kind, provider, external_id, transport)
  values (%L,%L,'whatsapp','wazzup','wa-chn-A','business_api')
$$, :CH, :PA), 'владелец подключает канал своей точке');

select expect_denied(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'telegram','wazzup','tg-chn-чужой','bot')
$$, :PB), 'владелец не заводит канал в чужую точку');

-- Чужая точка не видна и через свой же канал: резолвер из 009 раскрывает
-- ровно одну строку, а не таблицу.
select act_as(:PB::uuid, :NB::uuid);
select expect_empty(format($$select 1 from channels where point_id = %L$$, :PA),
  'чужой канал не виден соседней точке');

-- ── 2. Один внешний идентификатор — одна точка ───────────────
-- Самое дорогое место схемы: резолвер вебхука ищет по (provider,
-- external_id) и берёт первую строку. Две точки с одним идентификатором —
-- это обращения чужого бизнеса в вашем инбоксе, и заметить это некому.
select expect_fail(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'whatsapp','wazzup','wa-chn-A','business_api')
$$, :PB), 'тот же внешний идентификатор нельзя привязать ко второй точке');

-- Даже под другим видом канала: идентификатор у шлюза один на канал.
select expect_fail(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'telegram','wazzup','wa-chn-A','bot')
$$, :PB), 'смена вида канала не открывает обход уникальности');

-- А вот тот же идентификатор у ДРУГОГО провайдера — другой канал, и это
-- законно: ключ составной, как и в резолвере.
select expect_ok(format($$
  insert into channels (point_id, kind, provider, external_id)
  values (%L,'avito','avito_direct','wa-chn-A')
$$, :PB), 'тот же идентификатор у другого провайдера — законный канал');

-- ── 3. Подключает и отключает только владелец ────────────────
select act_as(:PA::uuid, :NA::uuid, 'manager');

select expect_denied(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'telegram','wazzup','tg-chn-менеджер','bot')
$$, :PA), 'менеджер не подключает канал');

-- Отказ на update — это ноль строк, а не исключение (см. шапку файла).
do $$
declare n int;
begin
  update channels set status = 'disconnected'
   where id = '99999999-8888-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'ПРОВАЛ: менеджер отключил канал — затронуто % строк(и)', n;
  end if;
  raise notice 'ok  · менеджер не отключает канал';

  delete from channels where id = '99999999-8888-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n > 0 then
    raise exception 'ПРОВАЛ: менеджер удалил канал — затронуто % строк(и)', n;
  end if;
  raise notice 'ok  · менеджер не удаляет канал';
end $$;

-- Мастер тем более: у него вообще нет причин трогать каналы.
select act_as(:PA::uuid, :NA::uuid, 'master');
select expect_denied(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'telegram','wazzup','tg-chn-мастер','bot')
$$, :PA), 'мастер не подключает канал');

-- Канал после всех попыток остался включённым и на месте.
select act_as(:PA::uuid, :NA::uuid);
do $$
declare s text;
begin
  select status into s from channels
   where id = '99999999-8888-0000-0000-000000000001';
  if s is distinct from 'connected' then
    raise exception 'ПРОВАЛ: канал в состоянии «%», хотя владелец его не трогал', s;
  end if;
  raise notice 'ok  · канал пережил попытки менеджера и мастера';
end $$;

-- Владелец — может, и это тоже надо доказать: иначе «зелёный» стенд
-- получился бы у схемы, где каналы не меняет вообще никто.
select expect_ok(format($$
  update channels set status = 'disconnected',
         last_error = 'Слетела привязка номера',
         fix_hint = 'Пересканировать QR-код в кабинете Wazzup',
         checked_at = now()
   where id = %L
$$, :CH), 'владелец отключает канал своей точки');

-- Повторная привязка — это смена внешнего идентификатора у той же строки,
-- а не новый канал. Точка меняет номер WhatsApp чаще, чем кажется, и новая
-- строка увела бы переписку из треда.
select expect_ok(format($$
  update channels set external_id = 'wa-chn-A-новый', status = 'connected',
         last_error = null, fix_hint = null, checked_at = now()
   where id = %L
$$, :CH), 'повторная привязка меняет строку канала, а не заводит вторую');

-- ── 4. Управляющая компания ──────────────────────────────────
-- requireOwner() пускает и network_admin: политика обязана вести себя так же,
-- иначе экран покажет кнопку, которая молча ничего не делает.
select act_as(null::uuid, :NA::uuid, 'network_admin');
select expect_ok(format($$
  insert into channels (point_id, kind, provider, external_id, transport)
  values (%L,'telegram','wazzup','tg-chn-сеть','bot')
$$, :PC), 'управляющая компания подключает канал точке своей сети');

-- ЗДЕСЬ ДОЛЖНА БЫЛА СТОЯТЬ ПРОВЕРКА «админ чужой сети в точку не лезет»,
-- и она снята намеренно. Обращение к каналам точки ИЗ ДРУГОЙ СЕТИ роняет
-- сервер по глубине стека, а не отказывает: политика points_by_channel (009)
-- читает channels, политика channels_tenant (001) зовёт app.point_visible,
-- та снова читает points — взаимная рекурсия через границу security definer,
-- которую Postgres не распознаёт как рекурсию политик.
--
-- Это НЕ дефект подключения каналов и не следствие 018: воспроизводится на
-- схеме 001–017 без единой строки из этой миграции, причём даже на простом
-- `select count(*) from channels where point_id = <чужая точка>`. Лечится
-- в 009, а миграции 001–017 — не территория этой задачи. Ставить сюда
-- проверку, которая падает не по своей причине, значит закрасить чужой
-- дефект своим тестом.
--
-- Изоляция при этом не нарушена: транзакция обрывается, строка не создаётся.
-- Сломан диагноз, а не стена.

-- ── 5. Секрета в базе не окажется ────────────────────────────
-- Ключи шлюзов берутся из окружения (transport.ts). В credentials_ref лежит
-- ИМЯ переменной, и форма имени выбрана так, что ключ в неё не влезает.
select act_as(:PA::uuid, :NA::uuid);
select expect_fail(format($$
  update channels set credentials_ref = 'wz_live_9f3a-c21b.7d40e' where id = %L
$$, :CH), 'ключ шлюза невозможно записать в базу');

select expect_ok(format($$
  update channels set credentials_ref = 'WAZZUP_API_KEY' where id = %L
$$, :CH), 'имя переменной окружения записать можно');

-- Транспорт — из того же словаря, что и в адаптере. Иначе can_initiate
-- перестанет соответствовать тому, что канал умеет на самом деле.
select expect_fail(format($$
  update channels set transport = 'sms' where id = %L
$$, :CH), 'транспорт вне словаря адаптера не сохраняется');

-- ── 6. Отключение канала не удаляет переписку ────────────────
-- Ради этого отключение сделано сменой состояния, а не удалением строки:
-- у точки, отключившей WhatsApp на день, инбокс обязан остаться целым.
insert into clients (id, point_id, name, phone)
values (:CL,:PA,'Дмитрий Реутов','+79031234501');
insert into threads (id, point_id, client_id, last_message_at)
values (:TH,:PA,:CL, now());
insert into messages (point_id, thread_id, channel_id, direction, body, external_message_id)
values (:PA,:TH,:CH,'in','Сколько стоит оклейка X5?','chn-m-1'),
       (:PA,:TH,:CH,'out','Три варианта из нашего прайса','chn-m-2');

select expect_ok(format($$
  update channels set status = 'disconnected',
         last_error = 'Отключён владельцем', checked_at = now()
   where id = %L
$$, :CH), 'владелец отключает канал с живой перепиской');

do $$
declare n int;
begin
  select count(*) into n from messages
   where thread_id = '12200000-8888-0000-0000-000000000001';
  if n <> 2 then
    raise exception 'ПРОВАЛ: после отключения канала в треде % сообщений вместо 2', n;
  end if;
  raise notice 'ok  · отключение канала не тронуло сообщения';

  select count(*) into n from threads
   where id = '12200000-8888-0000-0000-000000000001';
  if n <> 1 then
    raise exception 'ПРОВАЛ: диалог пропал из инбокса точки после отключения канала';
  end if;
  raise notice 'ok  · диалог остался в инбоксе точки';
end $$;

-- И удалить канал с перепиской нельзя даже владельцу: сообщения ссылаются
-- на строку канала составным ключом. «Отключить» и «стереть историю» —
-- разные действия, и второго в продукте нет.
select expect_fail(format($$delete from channels where id = %L$$, :CH),
  'канал с перепиской невозможно удалить');

rollback;
