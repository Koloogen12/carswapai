-- CarSwap AI · развязка взаимной рекурсии политик
--
-- ЧТО СЛОМАНО. Миграция 009 завела политику `points_by_channel`: точка видна,
-- если у неё есть канал с таким внешним идентификатором. Политика читает
-- `channels`. А на `channels` висит арендаторская политика из 001, которая
-- зовёт `app.point_visible()`, а та читает `points`. Круг замкнулся.
--
-- Наружу это выходит как `stack depth limit exceeded` при обращении к каналам
-- точки из другой сети — вместо честного отказа. Изоляция при этом не
-- нарушена: чужого никто не увидел. Сломан диагноз, а не защита. Но ошибка
-- «переполнение стека» вместо «нет доступа» — это ночь разбирательств у того,
-- кто на неё наткнётся, и подозрение на порчу данных там, где всё цело.
--
-- КАК РАЗВЯЗАНО. Политика на points больше не ходит в channels. Резолвер
-- читает канал (по политике `channels_by_external`, которая смотрит только на
-- претензию и никуда не ходит), узнаёт точку и ДОБАВЛЯЕТ её в претензию —
-- дальше работает обычная `points_tenant` со сравнением идентификаторов.
--
-- Правило на будущее: политика не должна читать таблицу, чья политика читает
-- её собственную. Проверять это надо при каждой новой политике, потому что
-- падает оно не там, где написано, и не сразу.

begin;

drop policy if exists points_by_channel on points;

create or replace function app.point_of_channel(p_provider text, p_external text,
                                                p_kind text)
  returns table (channel_id uuid, point_id uuid, network_id uuid,
                 kind text, status text)
  language plpgsql stable security definer
  set search_path = public, pg_temp as $fn$
declare
  saved text;
  ch_id uuid;
  ch_point uuid;
  ch_kind text;
  ch_status text;
begin
  if p_provider is null or p_external is null or p_kind is null then
    return;
  end if;
  saved := coalesce(current_setting('request.jwt.claims', true), '');

  -- Шаг 1. Только канал. Политика channels_by_external смотрит на претензию
  -- и в другие таблицы не ходит — рекурсии здесь взяться неоткуда.
  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver',
                      'ch_provider', p_provider,
                      'ch_external_id', p_external,
                      'ch_kind', p_kind)::text, true);

  if (select k.provider from app.current_channel_key() k) is distinct from p_provider then
    perform set_config('request.jwt.claims', saved, true);
    raise exception 'app.point_of_channel() вызвана вне транзакции: SET LOCAL не действует'
      using errcode = 'invalid_transaction_state';
  end if;

  begin
    select ch.id, ch.point_id, ch.kind::text, ch.status::text
      into ch_id, ch_point, ch_kind, ch_status
      from channels ch
     where ch.provider = p_provider
       and ch.external_id = p_external
       and ch.kind::text = p_kind
     limit 1;
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;

  if ch_id is null then
    perform set_config('request.jwt.claims', saved, true);
    return;
  end if;

  -- Шаг 2. Точка уже известна — читаем её обычной арендаторской политикой,
  -- добавив идентификатор в претензию. Ни одна политика больше не ходит в
  -- таблицу, которая ходит в неё.
  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver', 'point_id', ch_point)::text, true);

  begin
    return query
      select ch_id, ch_point, p.network_id, ch_kind, ch_status
        from points p where p.id = ch_point;
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;

  perform set_config('request.jwt.claims', saved, true);
end $fn$;

commit;
