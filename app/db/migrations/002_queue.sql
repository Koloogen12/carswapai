-- CarSwap AI · миграция 002 · очередь генераций и потолки расхода
--
-- Спека §14 ставит учёт стоимости и потолки ДО первой генерации, а не после.
-- Поэтому очередь и бюджет живут в одной миграции: поставить задачу в очередь
-- и проверить бюджет — одна транзакция, иначе между проверкой и постановкой
-- есть окно, в которое пролезает перерасход.
--
-- Почему не pgmq, как рекомендует спека §3.2. Нам нужны три вещи, которых
-- очередь общего назначения не даёт:
--   1. Приоритет: поток менеджера всегда выше потока гаража (§8.2). При
--      перегрузке гараж деградирует в кэш, поток менеджера — нет.
--   2. Транзакционная проверка бюджета в момент постановки.
--   3. Дедупликация по ключу «фото × артикул × свет» прямо в очереди (§4.8),
--      иначе один и тот же рендер уезжает в работу дважды.
-- Плюс на self-hosted Selectel меньше расширений — меньше поводов для отказа,
-- а очередь на обычной таблице с SKIP LOCKED поддерживается обычным SQL,
-- что важно для С-3: диагностика идёт внутри продукта, а не в чужой утилите.

create type job_status as enum ('queued','running','done','failed','skipped');

create table render_jobs (
  id                    uuid primary key default gen_random_uuid(),
  point_id              uuid not null references points(id),
  -- Намеренно без внешнего ключа: очередь — операционная запись, а не доменная.
  -- Сквозное удаление фото по §13 не должно упираться в архив выполненных задач.
  configuration_item_id uuid,
  variant               render_variant,
  render_class          render_class not null,
  -- 0 — менеджер (ядро 1), 10 — гараж (ядро 2), 20 — прогрев кэша.
  -- Меньше значение — раньше исполнение.
  priority              smallint not null default 10,
  payload               jsonb not null default '{}'::jsonb,
  -- «фото × артикул × свет». Повтор в пределах окна не создаёт вторую задачу
  -- и не тратит денег: §4.8, М-5.
  dedupe_key            text not null,
  estimated_cost_kopecks integer not null default 0,
  status                job_status not null default 'queued',
  attempts              smallint not null default 0,
  max_attempts          smallint not null default 5,
  run_after             timestamptz not null default now(),
  locked_by             text,
  locked_at             timestamptz,
  last_error            text,
  created_at            timestamptz not null default now(),
  finished_at           timestamptz
);

create unique index render_jobs_dedupe on render_jobs (dedupe_key)
  where status in ('queued','running');
create index render_jobs_pickup on render_jobs (priority, run_after)
  where status = 'queued';
create index render_jobs_point on render_jobs (point_id, created_at desc);

alter table render_jobs enable row level security;
alter table render_jobs force row level security;
create policy render_jobs_tenant on render_jobs
  using (app.point_visible(point_id)) with check (app.point_visible(point_id));

-- ─────────────────────────────────────────────────────────────
-- Состояние бюджета точки
-- ─────────────────────────────────────────────────────────────

create or replace function app.budget_state(p_point uuid)
returns table (spent_kopecks integer, soft_limit integer, hard_limit integer,
               soft_reached boolean, hard_reached boolean)
language sql stable security definer set search_path = public, app as $$
  select
    coalesce(b.spent_kopecks, 0),
    coalesce(b.soft_limit_kopecks, pt.soft_cap_kopecks),
    coalesce(b.hard_limit_kopecks, pt.hard_cap_kopecks),
    coalesce(b.spent_kopecks, 0) >= coalesce(b.soft_limit_kopecks, pt.soft_cap_kopecks),
    coalesce(b.spent_kopecks, 0) >= coalesce(b.hard_limit_kopecks, pt.hard_cap_kopecks)
      and b.released_at is null
  from points pt
  left join point_budgets b
    on b.point_id = pt.id and b.period_month = date_trunc('month', now())::date
  where pt.id = p_point;
$$;

-- ─────────────────────────────────────────────────────────────
-- Постановка задачи
-- ─────────────────────────────────────────────────────────────
--
-- Ключевое решение, которого нет явно ни в спеке, ни в PRD:
-- ЖЁСТКИЙ СТОП ПО БЮДЖЕТУ НЕ РАСПРОСТРАНЯЕТСЯ НА КЛАСС A.
--
-- §8.5: «Ни при каком уровне деградации не отключаются три световых условия,
-- строка про сверку оттенка, артикул и цена точки». Класс A — тонировка,
-- окрас дисков, цвет кузова глянец→глянец, звёздное небо — считается у нас
-- на своём железе и стоит доли копейки. Это и есть пол деградации.
-- Если жёсткий стоп глушит и его, продукт при перерасходе показывает пустой
-- экран вместо карточки — то есть нарушает инвариант ради экономии копеек.
-- Бюджет останавливает только то, что реально стоит денег: класс B.

create or replace function app.enqueue_render(
  p_point uuid,
  p_configuration_item uuid,
  p_variant render_variant,
  p_class render_class,
  p_dedupe_key text,
  p_priority smallint default 10,
  p_estimated_cost_kopecks integer default 0,
  p_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = public, app as $$
declare
  st record;
  existing uuid;
  new_id uuid;
begin
  select * into st from app.budget_state(p_point);

  if p_class = 'B' and st.hard_reached then
    raise exception 'Жёсткий стоп по бюджету точки: израсходовано % коп. из %. Класс A продолжает работать, снятие стопа — на стороне сети (С-5)',
      st.spent_kopecks, st.hard_limit
      using errcode = 'restrict_violation';
  end if;

  -- Дедупликация: тот же рендер уже в работе — возвращаем его, не платим дважды.
  select id into existing from render_jobs
   where dedupe_key = p_dedupe_key and status in ('queued','running');
  if existing is not null then
    return existing;
  end if;

  insert into render_jobs (point_id, configuration_item_id, variant, render_class,
                           priority, dedupe_key, estimated_cost_kopecks, payload)
  values (p_point, p_configuration_item, p_variant, p_class,
          p_priority, p_dedupe_key, p_estimated_cost_kopecks, p_payload)
  returning id into new_id;
  return new_id;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Забор задач воркером
-- ─────────────────────────────────────────────────────────────

create or replace function app.claim_render_jobs(p_worker text, p_limit integer default 4)
returns setof render_jobs
language sql security definer set search_path = public, app as $$
  with picked as (
    select id from render_jobs
     where status = 'queued' and run_after <= now()
     order by priority, run_after
     for update skip locked
     limit p_limit
  )
  update render_jobs j
     set status = 'running', locked_by = p_worker, locked_at = now(),
         attempts = j.attempts + 1
    from picked
   where j.id = picked.id
  returning j.*;
$$;

create or replace function app.finish_render_job(p_job uuid, p_cost_kopecks integer default 0)
returns void
language plpgsql security definer set search_path = public, app as $$
begin
  update render_jobs
     set status = 'done', finished_at = now(), last_error = null
   where id = p_job and status = 'running';
  if not found then
    raise exception 'Задача % не в работе — повторное завершение или чужой воркер', p_job
      using errcode = 'restrict_violation';
  end if;
end $$;

-- Отказ модели не является отказом продукта (§12). Задача уходит на повтор
-- с растущей паузой; когда попытки кончились, она помечается failed, и решение
-- о деградации принимает вызывающий, а не очередь.
create or replace function app.fail_render_job(p_job uuid, p_error text)
returns job_status
language plpgsql security definer set search_path = public, app as $$
declare j render_jobs;
begin
  select * into j from render_jobs where id = p_job for update;
  if j.status <> 'running' then
    raise exception 'Задача % в статусе %, а не running: отказ засчитывается только работающей задаче',
      p_job, j.status using errcode = 'restrict_violation';
  end if;
  if j.attempts >= j.max_attempts then
    update render_jobs set status = 'failed', last_error = p_error, finished_at = now()
     where id = p_job;
    return 'failed';
  end if;
  update render_jobs
     set status = 'queued', last_error = p_error, locked_by = null, locked_at = null,
         run_after = now() + (interval '5 seconds' * power(3, j.attempts))
   where id = p_job;
  return 'queued';
end $$;

-- Зависшие задачи: воркер умер, не сняв блокировку.
create or replace function app.requeue_stale_jobs(p_older_than interval default interval '10 minutes')
returns integer
language sql security definer set search_path = public, app as $$
  with stale as (
    update render_jobs
       set status = 'queued', locked_by = null, locked_at = null,
           run_after = now(), last_error = 'воркер не ответил, задача возвращена в очередь'
     where status = 'running' and locked_at < now() - p_older_than
    returning 1
  ) select count(*)::integer from stale;
$$;
