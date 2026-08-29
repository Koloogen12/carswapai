-- CarSwap AI · опознание канала на входе вебхука
--
-- ЧТО ЗАКРЫВАЕТ. Вебхук приходит снаружи и не знает про арендаторов: в нём
-- есть только провайдер и внешний идентификатор канала. Точку мы узнаём
-- именно из строки channels — то есть до чтения этой строки претензию
-- выставить не из чего. Раньше запрос шёл через sys() без претензии; на
-- боевой роли он молча возвращал ноль строк, и ВЕСЬ входящий поток уходил
-- в unrouted. Молча — потому что «ноль строк» не исключение.
--
-- Решение то же, что для ссылки клиента в 006: узкий резолвер вместо общего
-- обхода RLS. Обоснование раскрытия — такое же, как у public_slug: тот, кто
-- вызывает, внешний идентификатор канала уже знает, он пришёл в вебхуке.
-- Значит резолвер не выдаёт ничего сверх того, что у вызывающего есть.
--
-- Чего здесь СОЗНАТЕЛЬНО нет: выдачи app_tenant права читать channels целиком
-- и роли с BYPASSRLS. И то и другое превратило бы любой вебхук в ключ ко всем
-- каналам всех точек.

begin;

-- Ключ канала из претензии. Три поля, потому что уникальность у канала
-- составная: один и тот же внешний идентификатор бывает у разных провайдеров.
create or replace function app.current_channel_key()
  returns table (provider text, external_id text, kind text)
  language sql stable as $$
  select nullif(app.claims()->>'ch_provider',''),
         nullif(app.claims()->>'ch_external_id',''),
         nullif(app.claims()->>'ch_kind','')
$$;

create policy channels_by_external on channels as permissive for select
  using (
    exists (
      select 1 from app.current_channel_key() k
       where k.provider = channels.provider
         and k.external_id = channels.external_id
         and k.kind = channels.kind::text
    )
  );

-- Точка нужна вместе с каналом: land() пишет и то и другое.
create policy points_by_channel on points as permissive for select
  using (
    exists (
      select 1 from channels ch, app.current_channel_key() k
       where ch.point_id = points.id
         and k.provider = ch.provider
         and k.external_id = ch.external_id
         and k.kind = ch.kind::text
    )
  );

create or replace function app.point_of_channel(p_provider text, p_external text,
                                                p_kind text)
  returns table (channel_id uuid, point_id uuid, network_id uuid,
                 kind text, status text)
  language plpgsql stable security definer
  set search_path = public, pg_temp as $fn$
declare
  saved text;
begin
  if p_provider is null or p_external is null or p_kind is null then
    return;
  end if;
  saved := coalesce(current_setting('request.jwt.claims', true), '');

  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver',
                      'ch_provider', p_provider,
                      'ch_external_id', p_external,
                      'ch_kind', p_kind)::text, true);

  -- Та же страховка, что в 006: SET LOCAL вне транзакции не действует, и
  -- тогда функция читала бы под чужой претензией. Лучше упасть громко.
  if (select k.provider from app.current_channel_key() k) is distinct from p_provider then
    perform set_config('request.jwt.claims', saved, true);
    raise exception 'app.point_of_channel() вызвана вне транзакции: SET LOCAL не действует'
      using errcode = 'invalid_transaction_state';
  end if;

  begin
    return query
      select ch.id, ch.point_id, p.network_id, ch.kind::text, ch.status::text
        from channels ch
        join points p on p.id = ch.point_id
       where ch.provider = p_provider
         and ch.external_id = p_external
         and ch.kind::text = p_kind
       limit 1;
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;

  perform set_config('request.jwt.claims', saved, true);
end $fn$;

revoke execute on function app.point_of_channel(text, text, text) from public;
grant execute on function app.point_of_channel(text, text, text) to app_tenant;
grant execute on function app.current_channel_key() to app_tenant;

commit;
