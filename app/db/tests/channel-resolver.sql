-- Опознание канала на входе вебхука (миграция 009).
--
-- Поломка, которую это закрывает, была тихой: запрос шёл без претензии
-- арендатора, на боевой роли возвращал ноль строк — не исключение, а
-- пустоту, — и весь входящий поток уходил в unrouted без единой жалобы.
-- Поэтому здесь проверяется не только «находит», но и «не находит чужое».
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set NA '''11111111-9999-0000-0000-00000000000a'''
\set NB '''11111111-9999-0000-0000-00000000000b'''
\set PA '''aaaaaaaa-9999-0000-0000-000000000001'''
\set PB '''bbbbbbbb-9999-0000-0000-000000000002'''

insert into networks (id, name, join_code, price_deviation_allowed_pct) values
  (:NA,'Сеть А','CH-A-2026', 10), (:NB,'Сеть Б','CH-B-2026', 10);

select act_as(:PA::uuid, :NA::uuid);
insert into points (id, network_id, name, public_slug) values (:PA,:NA,'Точка А','ch-a');
insert into channels (id, point_id, kind, provider, external_id)
  values ('99999999-9999-0000-0000-000000000001',:PA,'telegram','wazzup','tg-A');

select act_as(:PB::uuid, :NB::uuid);
insert into points (id, network_id, name, public_slug) values (:PB,:NB,'Точка Б','ch-b');
insert into channels (id, point_id, kind, provider, external_id)
  values ('99999999-9999-0000-0000-000000000002',:PB,'telegram','wazzup','tg-B');

-- Вебхук приходит снаружи: претензии нет вовсе. Это и есть боевое положение.
select set_config('request.jwt.claims','',false);

do $$
declare r record; n int;
begin
  select * into r from app.point_of_channel('wazzup','tg-A','telegram');
  if r.point_id is null then
    raise exception 'ПРОВАЛ: канал не опознан — весь входящий поток ушёл бы в unrouted';
  end if;
  if r.point_id <> 'aaaaaaaa-9999-0000-0000-000000000001' then
    raise exception 'ПРОВАЛ: канал опознан не в ту точку: %', r.point_id;
  end if;
  raise notice 'ok  · вебхук без претензии опознаёт свой канал и его точку';

  select count(*) into n from app.point_of_channel('wazzup','tg-НЕТ-ТАКОГО','telegram');
  if n <> 0 then
    raise exception 'ПРОВАЛ: несуществующий канал опознан';
  end if;
  raise notice 'ok  · несуществующий канал не опознаётся и не роняет приём';

  -- Тот же внешний идентификатор у другого провайдера — другой канал.
  select count(*) into n from app.point_of_channel('avito','tg-A','telegram');
  if n <> 0 then
    raise exception 'ПРОВАЛ: канал опознан по идентификатору чужого провайдера';
  end if;
  raise notice 'ok  · ключ канала составной: провайдер отдельно от идентификатора';
end $$;

-- ── Резолвер не должен открывать таблицу каналов целиком ─────
do $$
declare n int;
begin
  perform app.point_of_channel('wazzup','tg-A','telegram');
  -- Претензия резолвера транзакционная и обязана сняться после вызова.
  select count(*) into n from channels;
  if n <> 0 then
    raise exception 'ПРОВАЛ: после резолвера видно % каналов — претензия не снялась', n;
  end if;
  raise notice 'ok  · после резолвера чужие каналы по-прежнему не видны';
end $$;

-- Точка А не должна опознавать канал точки Б через резолвер и увидеть больше,
-- чем ей положено: резолвер отдаёт ровно строку канала, и ничего сверх неё.
select act_as(:PA::uuid, :NA::uuid);
do $$
declare r record; n int;
begin
  select * into r from app.point_of_channel('wazzup','tg-B','telegram');
  if r.point_id is null then
    raise exception 'ПРОВАЛ: резолвер обязан работать по внешнему идентификатору всегда';
  end if;
  -- Но саму чужую точку и её данные это не открывает.
  select count(*) into n from points where id = 'bbbbbbbb-9999-0000-0000-000000000002';
  if n <> 0 then
    raise exception 'ПРОВАЛ: через резолвер стала видна чужая точка';
  end if;
  select count(*) into n from clients where point_id = 'bbbbbbbb-9999-0000-0000-000000000002';
  if n <> 0 then
    raise exception 'ПРОВАЛ: через резолвер стали видны клиенты чужой точки';
  end if;
  raise notice 'ok  · резолвер отдаёт строку канала и не открывает чужую точку';
end $$;

-- ── Политики не должны звать друг друга по кругу ─────────────
-- Миграция 009 завела политику на points, читавшую channels, а политика
-- channels читала points. Обращение к каналу чужой сети падало с
-- «stack depth limit exceeded» вместо отказа: изоляция цела, но диагноз
-- сломан, а это ночь разбирательств у того, кто наткнётся.
--
-- Проверяем не текстом ошибки, а тем, что запрос ВООБЩЕ завершается и
-- возвращает пусто. Переполнение стека завершиться не даёт.
select act_as(:PB::uuid, :NB::uuid);
do $$
declare n int;
begin
  select count(*) into n from channels;      -- чужие не видны, свой один
  if n > 1 then
    raise exception 'ПРОВАЛ: видно % каналов вместо своего одного', n;
  end if;
  raise notice 'ok  · чтение каналов завершается, а не уходит в рекурсию';
end $$;

do $$
declare r record;
begin
  -- Резолвер по чужому каналу обязан ОТВЕТИТЬ, а не упасть.
  select * into r from app.point_of_channel('wazzup','tg-A','telegram');
  if r.point_id is null then
    raise exception 'ПРОВАЛ: резолвер ничего не вернул по существующему каналу';
  end if;
  raise notice 'ok  · резолвер по чужому каналу отвечает, а не переполняет стек';
end $$;

rollback;
