-- Готовность примерки для гаража — через дверь, а не прямым запросом.
--
-- ЧТО СЛОМАЛОСЬ. Экран клиента опрашивал `render_jobs` и `renders` напрямую от
-- роли гаража, а обе таблицы закрыты для неё ограничительной политикой. Запрос
-- возвращал пустоту — не отказ, а именно пустоту. Для опроса это неотличимо от
-- «ещё считается»: он крутился две минуты, потом молча сдавался.
--
-- То есть клиент не видел НИ результата, НИ ошибки. Ни разу, ни при каком
-- исходе. Перевод текста отказа на человеческий, сделанный до этого, лежал
-- мёртвым грузом: до экрана не доходила сама причина.
--
-- Дверь отдаёт ровно три вещи и только по СВОЕЙ позиции конфигурации:
-- готовые кадры, сколько ещё считается, и причины отказа. Принадлежность
-- проверяется по сессии из претензии, а не по переданному идентификатору —
-- иначе чужую примерку можно было бы опросить, подставив чужой id.
create or replace function app.garage_tryon_status(p_item uuid)
returns table (variant text, storage_path text, pending integer, errors text[])
language plpgsql security definer set search_path = public, app as $$
declare
  sid text := app.current_session_id();
  pt  uuid := app.current_point_id();
  was text;
  mine boolean;
begin
  if sid is null or pt is null then
    return;
  end if;

  was := app.act_as_point(pt);

  -- Позиция обязана принадлежать конфигурации ЭТОЙ сессии в ЭТОЙ точке.
  select exists (
    select 1 from configuration_items ci
      join configurations cfg on cfg.id = ci.configuration_id
     where ci.id = p_item and cfg.session_id = sid and cfg.point_id = pt)
    into mine;

  if not mine then
    perform app.restore_claims(was);
    return;
  end if;

  return query
    select r.variant::text, r.storage_path,
           (select count(*)::int from render_jobs j
             where j.configuration_item_id = p_item
               and j.status in ('queued', 'running')),
           (select coalesce(array_agg(j.last_error), '{}')
              from render_jobs j
             where j.configuration_item_id = p_item
               and j.status = 'failed' and j.last_error is not null)
      from renders r
     where r.configuration_item_id = p_item and r.qa_passed and r.erased_at is null;

  -- Готовых кадров может не быть вовсе, а счётчик и причины нужны и тогда:
  -- без этой строки экран во время счёта и при отказе получал пустой ответ.
  if not found then
    return query
      select null::text, null::text,
             (select count(*)::int from render_jobs j
               where j.configuration_item_id = p_item
                 and j.status in ('queued', 'running')),
             (select coalesce(array_agg(j.last_error), '{}')
                from render_jobs j
               where j.configuration_item_id = p_item
                 and j.status = 'failed' and j.last_error is not null);
  end if;

  perform app.restore_claims(was);
end $$;

grant execute on function app.garage_tryon_status(uuid) to app_tenant;
