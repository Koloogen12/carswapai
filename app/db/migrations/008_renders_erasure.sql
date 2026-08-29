-- CarSwap AI · уничтожение рендеров по сроку
--
-- ЧТО ЗАКРЫВАЕТ. Миграция 007 научилась стирать фотографии клиента, но
-- рендеры — сгенерированные изображения ЕГО ЖЕ машины — переживали
-- уничтожение: триггер app.renders_qa_only() запрещает и удаление строки, и
-- правку storage_path. То есть после «удаления персональных данных» картинки
-- машины клиента продолжали лежать на диске. Это прямое нарушение ст. 21
-- 152-ФЗ и разрыв обещания, данного клиенту в согласии.
--
-- КАК РЕШЕНО, И ПОЧЕМУ НЕ ОТКЛЮЧЕНИЕМ ТРИГГЕРА. Иммутабельность рендера — не
-- прихоть: на него ссылается подтверждение клиента, и спор «что мне показали»
-- разрешается именно этой строкой. Поэтому предмет разграничен так же, как в
-- 007 разграничены подтверждение и его содержимое:
--
--   строка остаётся    — след того, что рендер был и был подтверждён;
--   байты изображения уничтожаются — это и есть персональные данные.
--
-- storage_path сохраняется намеренно: это не персональные данные, а часть
-- рецепта воспроизведения (§ про renders.pipeline). Признаком «файла больше
-- нет» служит erased_at, и он переводится только из null в дату — обратно
-- нельзя, иначе уничтожение стало бы отменяемым.

begin;

alter table renders add column erased_at timestamptz;
comment on column renders.erased_at is
  'Дата уничтожения файла рендера по истечении срока хранения. Строка остаётся '
  'как след подтверждения, изображения на диске больше нет.';

create index renders_erasure_pending on renders (configuration_item_id)
  where erased_at is null;

-- Триггер: разрешаем ровно одно новое действие — проставить erased_at.
create or replace function app.renders_qa_only() returns trigger
  language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Рендер нельзя удалить: на него ссылается подтверждение клиента'
      using errcode = 'restrict_violation';
  end if;

  -- Уничтожение по сроку: только null → дата, и ничего больше в этой же правке.
  if new.erased_at is distinct from old.erased_at then
    if old.erased_at is not null then
      raise exception 'Уничтожение рендера необратимо: erased_at не переписывается'
        using errcode = 'restrict_violation';
    end if;
    if new.erased_at is null then
      raise exception 'Снять отметку уничтожения нельзя'
        using errcode = 'restrict_violation';
    end if;
  end if;

  if new.storage_path is distinct from old.storage_path
     or new.pipeline is distinct from old.pipeline
     or new.configuration_item_id is distinct from old.configuration_item_id
     or new.variant is distinct from old.variant then
    raise exception 'Изменять можно только результат QA-гейта и отметку уничтожения'
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;

-- Рендеры уничтожаются вместе с фотографией, от которой произошли: они
-- показывают ту же машину, и держать их дольше исходника нет основания.
create or replace function app.expire_renders(batch integer default 200)
  returns integer language plpgsql security definer
  set search_path = public, pg_temp as $$
declare
  r_ids uuid[];
  n_files integer := 0;
  n_rows  integer := 0;
begin
  with due as (
    select r.id
      from renders r
      join configuration_items ci on ci.id = r.configuration_item_id
      join configurations cfg     on cfg.id = ci.configuration_id
      join photos p               on p.id = cfg.photo_id
     where r.erased_at is null
       and p.erased_at is not null          -- исходник уже уничтожен
     order by r.id
     for update of r skip locked
     limit batch
  )
  select array_agg(due.id) into r_ids from due;

  if r_ids is null then
    return 0;
  end if;

  -- шаг 1: файлы в очередь; шаг 2: отметка. Порядок тот же, что в 007 —
  -- обрыв посередине оставляет «пометка есть, файл лежит», и следующий
  -- проход это доделывает. Обратный порядок дал бы отметку об уничтожении
  -- при живом файле, то есть ложную запись в журнале.
  insert into file_erasures (point_id, storage_path, origin, basis)
  select distinct on (r.storage_path) cfg.point_id, r.storage_path, 'renders',
         'уничтожен исходный снимок (152-ФЗ ст. 5 ч. 7, ст. 21)'
    from renders r
    join configuration_items ci on ci.id = r.configuration_item_id
    join configurations cfg     on cfg.id = ci.configuration_id
   where r.id = any(r_ids)
   order by r.storage_path
  on conflict (point_id, storage_path) where erased_at is null do nothing;
  get diagnostics n_files = row_count;

  update renders set erased_at = now() where id = any(r_ids);
  get diagnostics n_rows = row_count;

  insert into audit_log (point_id, actor_role, action, entity, detail)
  select distinct cfg.point_id, 'retention', 'erase_renders', 'renders',
         jsonb_build_object('rows', n_rows, 'files', n_files,
                            'basis', '152-ФЗ ст. 5 ч. 7, ст. 21')
    from renders r
    join configuration_items ci on ci.id = r.configuration_item_id
    join configurations cfg     on cfg.id = ci.configuration_id
   where r.id = any(r_ids);

  return n_rows;
end $$;

revoke all on function app.expire_renders(integer) from public;
grant execute on function app.expire_renders(integer) to app_tenant;

commit;
