-- CarSwap AI · очередь обязана падать громко, а не молчать
--
-- ЧТО НАЙДЕНО ПРОГОНОМ. app.fail_render_job и app.finish_render_job объявлены
-- security definer, но `force row level security` действует и на владельца
-- схемы. Если вызвать их без претензии арендатора, происходит вот что:
--
--   select * into j from render_jobs where id = p_job;   -- ноль строк
--   if j.status <> 'running' then ...                    -- NULL, не срабатывает
--   update render_jobs ... where id = p_job;             -- ноль строк
--   return 'queued';                                     -- выглядит как успех
--
-- Снаружи — успешный вызов. На деле причина отказа не записана, задание
-- навсегда остаётся в состоянии «выполняется», повтор не случится, и точка
-- ждёт вечно. Ровно тот случай, ради которого запись причины и заводилась.
--
-- КАК ИСПРАВЛЕНО. Не расширением прав и не отключением RLS: функции теперь
-- проверяют, что строку вообще видно, и падают с внятной причиной, если нет.
-- Вызывающий обязан держать претензию точки — он её и так знает, потому что
-- сам забрал задание.
--
-- Ошибка «не вижу задание» лучше тишины ровно тем, что её видно.

begin;

create or replace function app.fail_render_job(p_job uuid, p_error text)
returns job_status
language plpgsql security definer set search_path = public, app as $$
declare j render_jobs;
begin
  select * into j from render_jobs where id = p_job for update;
  if j.id is null then
    raise exception 'Задание % не видно: нет претензии арендатора. Без неё отказ записался бы вхолостую, а задание осталось бы висеть в running навсегда', p_job
      using errcode = 'insufficient_privilege';
  end if;
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

create or replace function app.finish_render_job(p_job uuid, p_cost_kopecks integer default 0)
returns void
language plpgsql security definer set search_path = public, app as $$
declare n integer;
begin
  update render_jobs
     set status = 'done', finished_at = now(), last_error = null,
         locked_by = null, locked_at = null
   where id = p_job and status = 'running';
  get diagnostics n = row_count;
  if n = 0 then
    -- Ноль строк здесь означает одно из двух, и оба — ошибка вызывающего:
    -- либо нет претензии арендатора, либо задание уже не в работе.
    -- Промолчать нельзя: снаружи это выглядело бы как успешно закрытое
    -- задание, а на деле оно осталось бы висеть.
    raise exception 'Задание % не закрыто: либо нет претензии арендатора, либо оно уже не в статусе running', p_job
      using errcode = 'restrict_violation';
  end if;
end $$;

-- ── То же самое на денежном пути ─────────────────────────────
-- app.budget_state без претензии возвращает НОЛЬ СТРОК: она security definer,
-- но force RLS действует и на владельца, а points без претензии не видны.
-- app.enqueue_render читает её результат в переменную — та выходит вся NULL,
-- условие `if p_class = 'B' and st.hard_reached` не срабатывает, и жёсткий
-- стоп по бюджету ПРОСТО ПРОПУСКАЕТСЯ. Молча, с успешной постановкой задания.
--
-- В приложении претензия есть всегда, поэтому вживую это не стреляло. Но
-- пропуск потолка расхода — не та мина, которую оставляют лежать.
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
  if st is null or st.hard_limit is null and st.soft_limit is null
     and st.spent_kopecks is null then
    raise exception 'Состояние бюджета точки % не читается: нет претензии арендатора. Без неё потолок расхода был бы молча пропущен', p_point
      using errcode = 'insufficient_privilege';
  end if;

  if p_class = 'B' and st.hard_reached then
    raise exception 'Жёсткий стоп по бюджету точки: израсходовано % коп. из %. Класс A продолжает работать, снятие стопа — на стороне сети (С-5)',
      st.spent_kopecks, st.hard_limit
      using errcode = 'restrict_violation';
  end if;

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

commit;
