-- CarSwap AI · миграция 007 · уничтожение персональных данных по сроку
--
-- Схема с самого начала объявляла срок хранения (photos.retain_until,
-- «§13: срок хранения задаётся при записи, а не „когда-нибудь настроим“»),
-- но задания, которое этот срок исполняет, в контуре не было вовсе.
-- Объявленный и неисполняемый срок хуже отсутствующего: он превращает
-- политику обработки ПД в обещание, которое система не держит, а перед
-- Роскомнадзором предъявляется не намерение, а факт уничтожения.
--
-- Основание: 152-ФЗ ст. 5 ч. 7 — данные уничтожаются по достижении целей
-- обработки; ст. 21 ч. 3–4 — по достижении цели или по истечении срока
-- хранения оператор обязан уничтожить их и подтвердить уничтожение.
--
-- ─────────────────────────────────────────────────────────────
-- ЧТО УДАЛЯЕТСЯ, А ЧТО ОБЕЗЛИЧИВАЕТСЯ, И ПОЧЕМУ
-- ─────────────────────────────────────────────────────────────
--
-- Соблазн «удалить всё, что связано с клиентом» ломает учёт: закрытый
-- наряд на 150 тыс. ₽ с выданной гарантией — это не персональные данные,
-- это бухгалтерия и обязательство перед клиентом. Дыра в учёте на месте
-- удалённого клиента дороже и незаконнее, чем обезличенная строка.
--
-- Поэтому обезличивание ведётся ПО СУБЪЕКТУ, а не построчно:
-- снимаются идентификаторы (имя, телефон, госномер, файл фотографии),
-- а учётный скелет — наряд, счёт, гарантия, подтверждённый выбор — остаётся.
-- Строка без идентификаторов перестаёт быть персональными данными:
-- сопоставить её с человеком без несоразмерных усилий уже нельзя.
--
--   photos              срок вышел → файл в очередь на удаление;
--                       строка удаляется, если на неё никто не ссылается,
--                       и обезличивается, если на ней стоит примерка
--                       (configurations.photo_id — внешний ключ без каскада,
--                       а configurations иммутабельны: обнулить ссылку
--                       физически невозможно, значит строка обязана остаться)
--   photo_masks         производные от фото, учётной ценности нет → удаляются
--   clients             цель достигнута → имя, телефон и госномер стираются,
--                       строка остаётся: на неё ссылаются треды, сделки, визиты
--   messages            переписка — ПД, на неё учёт не ссылается → удаляется
--   condition_photos    фото ЛКП чужой машины → удаляются вместе с файлами
--   notifications       payload содержит текст для клиента → удаляются
--
-- ─────────────────────────────────────────────────────────────
-- ИММУТАБЛЬНОСТЬ ПРОТИВ ОБЯЗАННОСТИ УДАЛИТЬ
-- ─────────────────────────────────────────────────────────────
--
-- confirmations, configurations, configuration_items, outbound_cards и
-- consents закрыты триггером app.forbid_mutation: ни update, ни delete.
-- Формально это выглядит как прямой конфликт с обязанностью уничтожить.
-- Разрешается он не отключением триггера, а разграничением предмета:
--
-- 1. Удалить подтверждение нельзя не только из-за триггера. На нём висит
--    orders.confirmation_id NOT NULL — учёт. Триггер здесь не препятствие,
--    а вторая стена за первой; убрав триггер, мы упрёмся во внешний ключ.
--
-- 2. Само подтверждение — это не данные о человеке, а запись действия:
--    что выбрано, когда, каким способом. Персональные данные в нём —
--    только ip и user_agent. После того как у субъекта стёрты имя,
--    телефон, госномер и фотография, эти следы не привязываются к
--    субъекту: идентификаторов, по которым их можно соотнести с
--    человеком, в системе больше нет.
--
-- 3. Пока цель обработки не достигнута — идёт гарантия, не закрыт наряд —
--    хранение прямо разрешено ст. 5 ч. 7: уничтожение наступает ПО
--    достижении цели. Функция ниже и не трогает клиента, у которого
--    жива гарантия или открыт наряд.
--
-- НАМЕРЕННЫЙ ОСТАТОК, о котором надо знать честно:
--   · ip и user_agent в consents и confirmations физически остаются;
--   · renders — сгенерированные изображения машины клиента — тоже
--     остаются: app.renders_qa_only запрещает и удаление, и правку пути.
-- И то и другое лечится отдельной миграцией, снимающей иммутабельность
-- при достигнутой учётной цели. Здесь этого нет намеренно: ослабление
-- инварианта О-4 — отдельное решение с отдельным обоснованием, а не
-- побочный эффект задания на удаление. Записано в deploy/README.md.

-- ─────────────────────────────────────────────────────────────
-- 1. Отметки об уничтожении на самих таблицах с ПД
-- ─────────────────────────────────────────────────────────────
-- Отметка нужна ради идемпотентности: у обезличенной строки, которая
-- остаётся жить, нет другого способа отличить «ещё не обработана» от
-- «уже обработана». У удалённой строки идемпотентность бесплатна —
-- её просто нет.

alter table photos  add column erased_at timestamptz;
comment on column photos.erased_at is
  'Когда снимок обезличен по истечении retain_until. null — ещё не обработан.';

-- Срок хранения субъекта. Симметрично photos.retain_until: тот же смысл,
-- то же имя, то же значение по умолчанию. Клиенту объявляется один срок,
-- и он обязан быть записан там же, где данные, а не в тексте политики.
--
-- ВАЖНО: приложение пока не двигает этот срок при новом обращении клиента.
-- Поэтому одного retain_until мало, и функция ниже дополнительно требует,
-- чтобы не было свежей переписки, живой гарантии и открытого наряда —
-- иначе активного клиента обезличило бы посреди работы с ним.
alter table clients add column retain_until timestamptz not null
  default now() + interval '12 months';
alter table clients add column erased_at timestamptz;
comment on column clients.retain_until is
  'Объявленный срок хранения ПД клиента (152-ФЗ ст. 5 ч. 7).';

create index photos_retention_pending  on photos  (retain_until) where erased_at is null;
create index clients_retention_pending on clients (retain_until) where erased_at is null;

-- ─────────────────────────────────────────────────────────────
-- 2. Очередь на физическое удаление файлов
-- ─────────────────────────────────────────────────────────────
-- Строку в базе удалить мало: сам снимок лежит в томе carswap_storage и
-- отдаётся прокси по /storage/. Файл и строка живут в разных системах,
-- атомарной транзакции поверх них нет, поэтому порядок выбран так, чтобы
-- любой обрыв посередине оставлял систему в состоянии, из которого
-- повторный запуск доделывает работу.
--
-- ПОРЯДОК: пометить → удалить файл → закрыть пометку.
--
--   шаг 1 (одна транзакция БД): путь файла попадает сюда со статусом
--          «ждёт», строка с ПД в тот же момент стирается или
--          обезличивается, в audit_log ложится запись. Всё или ничего.
--   шаг 2 (отдельный проход): воркер забирает пометки, удаляет файлы
--          с диска и закрывает пометку erased_at.
--
-- Обрыв между шагами: строки ПД уже нет, файл ещё лежит, пометка жива —
-- следующий проход её доделает. Состояние заметное и самозалечивающееся.
--
-- Обратный порядок (сначала файл) даёт худший исход: файла нет, а запись
-- в базе продолжает утверждать, что снимок есть, и ссылается в пустоту.
-- Это тихая порча данных, которую никто не найдёт, — в отличие от
-- «файл прожил лишние десять минут и об этом есть запись в очереди».
--
-- Пропавший файл (ENOENT) считается успехом: цель — чтобы файла не было,
-- а не чтобы его удалили именно мы. Отсюда идемпотентность шага 2.

create table file_erasures (
  id            bigserial primary key,
  point_id      uuid not null references points(id),
  storage_path  text not null,
  origin        text not null,          -- photos | photo_masks | messages | condition_photos
  basis         text not null,          -- основание уничтожения, человеческим языком
  marked_at     timestamptz not null default now(),
  erased_at     timestamptz,
  attempts      smallint not null default 0,
  locked_by     text,
  locked_at     timestamptz,
  last_error    text
);

-- Повторная пометка того же файла не создаёт второй строки: очередь
-- идемпотентна по построению, а не по аккуратности вызывающего.
create unique index file_erasures_pending on file_erasures (point_id, storage_path)
  where erased_at is null;
create index file_erasures_pickup on file_erasures (marked_at) where erased_at is null;

alter table file_erasures enable row level security;
alter table file_erasures force row level security;
create policy file_erasures_tenant on file_erasures
  using (app.point_visible(point_id)) with check (app.point_visible(point_id));

-- ─────────────────────────────────────────────────────────────
-- 3. Обход точек под ролевой моделью, а не в обход неё
-- ─────────────────────────────────────────────────────────────
-- Уничтожение — сквозная по арендаторам операция, а RLS с force не даёт
-- увидеть чужую точку никому, включая владельца схемы. Соблазн выдать
-- заданию BYPASSRLS отменил бы всё, ради чего RLS ставили (deploy/README,
-- «Роли в базе»), поэтому задание ходит по точкам ТЕМ ЖЕ путём, что и
-- приложение: выставляет претензию арендатора и работает внутри неё.
--
-- networks единственная таблица без RLS — по ней и строится обход:
-- претензия network_admin показывает точки своей сети (политика
-- points_tenant), дальше по каждой точке ставится претензия владельца.
-- Владельца, а не network_admin: на messages висит ограничительная
-- политика messages_no_network_admin, и под сетевой претензией переписку
-- не видно — то есть не удалить.

create or replace function app.retention_points() returns setof uuid
  language plpgsql security definer set search_path = public, app as $$
declare
  saved text := coalesce(current_setting('request.jwt.claims', true), '');
  n     record;
begin
  for n in select id from networks order by id loop
    perform set_config('request.jwt.claims',
      jsonb_build_object('network_id', n.id, 'app_role', 'network_admin')::text, true);
    return query select p.id from points p where p.network_id = n.id order by p.id;
  end loop;
  perform set_config('request.jwt.claims', saved, true);
  return;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 4. Когда цель обработки данных клиента достигнута
-- ─────────────────────────────────────────────────────────────
-- Каждое условие — не «на всякий случай», а отдельное основание хранить
-- дальше по ст. 5 ч. 7: цель ещё не достигнута.

create or replace function app.client_retention_due(p_client uuid) returns boolean
  language sql stable security definer set search_path = public, app as $$
  select c.erased_at is null
     -- объявленный клиенту срок вышел
     and c.retain_until <= now()
     -- цель не достигнута, пока действует гарантия: по ней придётся
     -- вызвать этого человека и предъявить, что именно ему делали
     and not exists (
       select 1 from warranties w
         join orders o          on o.id  = w.order_id
         join confirmations cf  on cf.id = o.confirmation_id
         join configurations cn on cn.id = cf.configuration_id
         join threads t         on t.id  = cn.thread_id
        where t.client_id = c.id
          and w.issued_at + make_interval(months => w.months::int) > now())
     -- и пока не закрыт наряд: работа идёт, договор исполняется
     and not exists (
       select 1 from orders o
         join confirmations cf  on cf.id = o.confirmation_id
         join configurations cn on cn.id = cf.configuration_id
         join threads t         on t.id  = cn.thread_id
        where t.client_id = c.id
          and o.status not in ('done','cancelled'))
     -- и пока лежит хоть одно его фото с неистёкшим сроком: иначе вышло бы,
     -- что снимок машины есть, а владелец у него уже обезличен
     and not exists (
       select 1 from photos p
        where p.client_id = c.id and p.erased_at is null and p.retain_until > now())
     -- и пока переписка свежее объявленного срока: срок отсчитывается от
     -- последнего обращения, а не от первого. Приложение пока не двигает
     -- retain_until при новом сообщении, и это условие закрывает пробел.
     and not exists (
       select 1 from messages m
         join threads t on t.id = m.thread_id
        where t.client_id = c.id and m.sent_at > c.retain_until)
    from clients c where c.id = p_client;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Проход уничтожения
-- ─────────────────────────────────────────────────────────────
-- Порциями (batch) — чтобы не держать долгую транзакцию и длинные списки
-- блокировок на живой базе. Через `for update skip locked`, как очередь
-- рендеров в 002: два одновременных прохода не подерутся за одни строки,
-- а разберут разные. Идемпотентно: отметка erased_at и отсутствие строки
-- дают одинаковый результат при любом числе повторов.
--
-- Возвращает разбивку по сущностям. Пустой результат = чистить нечего;
-- вызывающий гоняет функцию, пока она не вернёт пусто.

create or replace function app.expire_personal_data(batch integer default 200)
returns table (entity text, affected integer)
language plpgsql security definer set search_path = public, app as $$
#variable_conflict use_column
declare
  saved     text := coalesce(current_setting('request.jwt.claims', true), '');
  pts       uuid[];
  pt        uuid;
  remaining integer := greatest(coalesce(batch, 200), 1);
  acc       jsonb := '{}'::jsonb;
  ph_ids    uuid[];
  cl_ids    uuid[];
  n_del     integer;
  n_anon    integer;
  n_files   integer;
  n_msg     integer;
  n_cond    integer;
  n_notif   integer;
begin
  -- Два прохода одновременно допустимы (skip locked разведёт их по строкам),
  -- но смысла в этом нет, а нагрузку они удваивают. Блокировка транзакционная:
  -- снимется сама при любом исходе, включая падение.
  if not pg_try_advisory_xact_lock(4919, 7) then
    raise notice 'expire_personal_data: проход уже идёт в другой сессии, пропущено';
    return;
  end if;

  select array_agg(x) into pts from app.retention_points() x;

  foreach pt in array coalesce(pts, '{}'::uuid[]) loop
    exit when remaining <= 0;

    -- Претензия владельца точки: ровно то, что делает withTenant() в бою.
    perform set_config('request.jwt.claims',
      jsonb_build_object('point_id', pt, 'app_role', 'owner')::text, true);

    -- ── фотографии с истёкшим сроком ─────────────────────────
    with due as (
      select p.id
        from photos p
       where p.retain_until <= now()
         and p.erased_at is null
       order by p.retain_until
       for update skip locked
       limit remaining
    )
    select array_agg(due.id) into ph_ids from due;

    if ph_ids is not null then
      -- шаг 1: файлы (сам снимок и все его маски) — в очередь на удаление
      insert into file_erasures (point_id, storage_path, origin, basis)
      select distinct on (s.storage_path) pt, s.storage_path, s.origin,
             'истёк photos.retain_until (152-ФЗ ст. 5 ч. 7, ст. 21)'
        from (
          select p.storage_path, 'photos'::text as origin
            from photos p where p.id = any(ph_ids)
          union all
          select m.storage_path, 'photo_masks'::text
            from photo_masks m where m.photo_id = any(ph_ids)
        ) s
       order by s.storage_path
      on conflict (point_id, storage_path) where erased_at is null do nothing;
      get diagnostics n_files = row_count;

      -- маски производны от снимка, отдельной ценности не имеют
      delete from photo_masks where photo_id = any(ph_ids);

      -- на снимке стоит примерка: строку убрать нельзя (внешний ключ
      -- configurations.photo_id, а configurations иммутабельны) — обезличиваем
      update photos p
         set client_id    = null,
             storage_path = 'erased:retention',
             sha256       = 'erased',          -- отпечаток содержимого тоже след
             quality_gate = '{}'::jsonb,
             erased_at    = now()
       where p.id = any(ph_ids)
         and exists (select 1 from configurations c where c.photo_id = p.id);
      get diagnostics n_anon = row_count;

      -- на снимок никто не ссылается — удаляем целиком
      delete from photos p
       where p.id = any(ph_ids)
         and not exists (select 1 from configurations c where c.photo_id = p.id);
      get diagnostics n_del = row_count;

      if n_del + n_anon > 0 then
        insert into audit_log (point_id, actor_id, actor_role, action, entity, detail)
        values (pt, null, 'retention', 'erase', 'photos',
          jsonb_build_object(
            'basis',           'истёк объявленный срок хранения (152-ФЗ ст. 5 ч. 7, ст. 21)',
            'deleted_rows',    n_del,
            'anonymized_rows', n_anon,
            'files_marked',    n_files,
            'ids',             to_jsonb(ph_ids)));
        acc := jsonb_set(acc, array['photos'],
                 to_jsonb(coalesce((acc->>'photos')::integer, 0) + n_del + n_anon));
        acc := jsonb_set(acc, array['files_marked'],
                 to_jsonb(coalesce((acc->>'files_marked')::integer, 0) + n_files));
        remaining := remaining - (n_del + n_anon);
      end if;
    end if;

    exit when remaining <= 0;

    -- ── клиенты, у которых цель обработки достигнута ──────────
    with due as (
      select c.id
        from clients c
       where c.erased_at is null
         and c.retain_until <= now()          -- дешёвый предфильтр по индексу
         and app.client_retention_due(c.id)
       order by c.retain_until
       for update skip locked
       limit remaining
    )
    select array_agg(due.id) into cl_ids from due;

    if cl_ids is not null then
      n_files := 0;

      -- вложения переписки. Только пути внутри контура: ссылка на файл в
      -- хранилище мессенджера нам не принадлежит, и удалить её мы не можем —
      -- об этом честно сказано в deploy/README.md.
      insert into file_erasures (point_id, storage_path, origin, basis)
      select distinct on (a.url) pt, a.url, 'messages',
             'достигнута цель обработки данных клиента (152-ФЗ ст. 5 ч. 7)'
        from messages m
        join threads t on t.id = m.thread_id
       cross join lateral jsonb_array_elements(m.attachments) att
        cross join lateral (select att->>'url' as url) a
       where t.client_id = any(cl_ids)
         and jsonb_typeof(m.attachments) = 'array'
         and a.url is not null
       order by a.url
      on conflict (point_id, storage_path) where erased_at is null do nothing;
      get diagnostics n_msg = row_count;
      n_files := n_files + n_msg;

      -- фотографии ЛКП до работ — те же чужие машины, тот же §13
      insert into file_erasures (point_id, storage_path, origin, basis)
      select distinct on (cp.storage_path) pt, cp.storage_path, 'condition_photos',
             'достигнута цель обработки данных клиента (152-ФЗ ст. 5 ч. 7)'
        from condition_photos cp
        join appointments a on a.id = cp.appointment_id
       where a.client_id = any(cl_ids)
       order by cp.storage_path
      on conflict (point_id, storage_path) where erased_at is null do nothing;
      get diagnostics n_cond = row_count;
      n_files := n_files + n_cond;

      delete from condition_photos cp
       using appointments a
       where a.id = cp.appointment_id and a.client_id = any(cl_ids);
      get diagnostics n_cond = row_count;

      -- переписка: на неё учёт не ссылается, поэтому удаляется целиком,
      -- а не обезличивается. Обезличенная переписка бессмысленна: текст
      -- сообщения сам по себе персональные данные.
      delete from messages m
       using threads t
       where t.id = m.thread_id and t.client_id = any(cl_ids);
      get diagnostics n_msg = row_count;

      delete from notifications where client_id = any(cl_ids);
      get diagnostics n_notif = row_count;

      -- сам субъект: снимаем идентификаторы, оставляем учётный скелет.
      -- Марку и модель оставляем намеренно — это характеристика автомобиля,
      -- а не человека, и по ней живёт статистика точки. Госномер снимаем:
      -- он идентифицирует владельца и ради него весь этот механизм.
      update clients c
         set name       = null,
             phone      = null,
             vehicle    = (c.vehicle - 'plate' - 'vin'),
             erased_at  = now()
       where c.id = any(cl_ids);
      get diagnostics n_anon = row_count;

      insert into audit_log (point_id, actor_id, actor_role, action, entity, detail)
      values (pt, null, 'retention', 'erase', 'clients',
        jsonb_build_object(
          'basis',            'достигнута цель обработки: гарантия истекла, наряды закрыты, срок вышел (152-ФЗ ст. 5 ч. 7)',
          'anonymized_rows',  n_anon,
          'messages_deleted', n_msg,
          'condition_photos_deleted', n_cond,
          'notifications_deleted',    n_notif,
          'files_marked',     n_files,
          'ids',              to_jsonb(cl_ids)));

      acc := jsonb_set(acc, array['clients'],
               to_jsonb(coalesce((acc->>'clients')::integer, 0) + n_anon));
      if n_msg > 0 then
        acc := jsonb_set(acc, array['messages'],
                 to_jsonb(coalesce((acc->>'messages')::integer, 0) + n_msg));
      end if;
      if n_cond > 0 then
        acc := jsonb_set(acc, array['condition_photos'],
                 to_jsonb(coalesce((acc->>'condition_photos')::integer, 0) + n_cond));
      end if;
      if n_files > 0 then
        acc := jsonb_set(acc, array['files_marked'],
                 to_jsonb(coalesce((acc->>'files_marked')::integer, 0) + n_files));
      end if;
      remaining := remaining - n_anon;
    end if;
  end loop;

  perform set_config('request.jwt.claims', saved, true);

  return query
    select e.key, e.value::integer
      from jsonb_each_text(acc) e
     where e.value::integer > 0
     order by e.key;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Шаг 2: физическое удаление файлов
-- ─────────────────────────────────────────────────────────────
-- Забор пометок тем же приёмом, что и очередь рендеров: `for update skip
-- locked` плюс возврат зависших через locked_at. Воркер, умерший с
-- невыполненной пометкой, не блокирует файл навсегда.

create or replace function app.claim_file_erasures(p_worker text, p_limit integer default 200)
returns table (erasure_id bigint, erasure_point uuid, erasure_path text)
language plpgsql security definer set search_path = public, app as $$
declare
  saved     text := coalesce(current_setting('request.jwt.claims', true), '');
  pts       uuid[];
  pt        uuid;
  remaining integer := greatest(coalesce(p_limit, 200), 1);
  got       integer;
begin
  select array_agg(x) into pts from app.retention_points() x;

  foreach pt in array coalesce(pts, '{}'::uuid[]) loop
    exit when remaining <= 0;
    perform set_config('request.jwt.claims',
      jsonb_build_object('point_id', pt, 'app_role', 'owner')::text, true);

    return query
      with picked as (
        select f.id from file_erasures f
         where f.point_id = pt
           and f.erased_at is null
           and (f.locked_at is null or f.locked_at < now() - interval '10 minutes')
         order by f.marked_at
         for update skip locked
         limit remaining
      )
      update file_erasures f
         set locked_by = p_worker, locked_at = now(), attempts = f.attempts + 1
        from picked
       where f.id = picked.id
      returning f.id, f.point_id, f.storage_path;

    get diagnostics got = row_count;
    remaining := remaining - got;
  end loop;

  perform set_config('request.jwt.claims', saved, true);
  return;
end $$;

-- Закрытие пометки. Точка передаётся вызывающим, а не ищется по всем
-- арендаторам: так функция остаётся внутри одной претензии и не делает
-- сквозного прохода ради одной строки.
--
-- Запись в журнал и закрытие пометки — один оператор с CTE: журнал
-- пополняется ровно тогда, когда update реально закрыл строку. Повторный
-- вызов на уже закрытой пометке не находит строку и не пишет ничего —
-- отсюда «повторный запуск не задваивает записи в журнале».
create or replace function app.finish_file_erasure(
  p_erasure bigint, p_point uuid, p_ok boolean, p_note text default null
) returns void
language plpgsql security definer set search_path = public, app as $$
declare
  saved text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('point_id', p_point, 'app_role', 'owner')::text, true);

  if p_ok then
    with done as (
      update file_erasures f
         set erased_at = now(), locked_by = null, locked_at = null, last_error = p_note
       where f.id = p_erasure and f.erased_at is null
      returning f.point_id, f.storage_path, f.origin, f.basis
    )
    insert into audit_log (point_id, actor_id, actor_role, action, entity, detail)
    select d.point_id, null, 'retention', 'erase', 'file',
           jsonb_build_object('basis', d.basis, 'path', d.storage_path, 'origin', d.origin)
      from done d;
  else
    -- Неудача не закрывает пометку: файл остаётся в очереди и будет
    -- взят следующим проходом. Молча забыть про него нельзя.
    update file_erasures f
       set locked_by = null, locked_at = null, last_error = coalesce(p_note, 'без описания')
     where f.id = p_erasure and f.erased_at is null;
  end if;

  perform set_config('request.jwt.claims', saved, true);
end $$;

-- ─────────────────────────────────────────────────────────────
-- 7. Диагностика: чем отвечать на вопрос «а вы точно удаляете»
-- ─────────────────────────────────────────────────────────────

create or replace function app.retention_status()
returns table (overdue_photos bigint, overdue_clients bigint,
               files_pending bigint, files_erased bigint)
language plpgsql security definer set search_path = public, app as $$
declare
  saved text := coalesce(current_setting('request.jwt.claims', true), '');
  pts   uuid[];
  pt    uuid;
  a bigint := 0; b bigint := 0; c bigint := 0; d bigint := 0;
  n bigint;
begin
  select array_agg(x) into pts from app.retention_points() x;

  foreach pt in array coalesce(pts, '{}'::uuid[]) loop
    perform set_config('request.jwt.claims',
      jsonb_build_object('point_id', pt, 'app_role', 'owner')::text, true);

    select count(*) into n from photos p
      where p.retain_until <= now() and p.erased_at is null;                a := a + n;
    select count(*) into n from clients cl
      where cl.erased_at is null and cl.retain_until <= now()
        and app.client_retention_due(cl.id);                                b := b + n;
    select count(*) into n from file_erasures f where f.erased_at is null;  c := c + n;
    select count(*) into n from file_erasures f where f.erased_at is not null; d := d + n;
  end loop;

  perform set_config('request.jwt.claims', saved, true);
  return query select a, b, c, d;
end $$;
