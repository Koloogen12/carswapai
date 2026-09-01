-- Отказ, который повтором не исправить, засчитывается сразу.
--
-- ЧТО БЫЛО. Любой отказ уходил в повтор: пять попыток с задержкой
-- 5·3^n секунд — это 5, 15, 45, 135, 405, суммарно около десяти минут. Экран
-- клиента опрашивает готовность две минуты и закрывает опрос. То есть
-- окончательный отказ он не видел НИКОГДА: примерка просто не появлялась, без
-- результата и без объяснения.
--
-- И повторять было нечего. «На кадре не виден госномер» — свойство самого
-- кадра: ни пятая попытка, ни пятидесятая его не изменят. Десять минут работы
-- воркера тратились на то, чтобы прийти к тому же ответу, и всё это время
-- человек смотрел в пустоту.
--
-- ЧТО ПОВТОРЯТЬ ВСЁ-ТАКИ НАДО. Обрыв связи со шлюзом, таймаут, пятисотка —
-- это состояние мира, а не кадра, и оно меняется само. Различает их вызывающий:
-- он знает, что именно упало. Здесь только исполнение решения.
-- Старую двухаргументную снимаем: рядом с новой, у которой третий аргумент
-- со значением по умолчанию, вызов с двумя аргументами становится
-- неоднозначным, и Postgres отказывается его разрешать. Все вызывающие
-- переходят на новую сигнатуру автоматически — умолчание сохраняет поведение.
drop function if exists app.fail_render_job(uuid, text);

create or replace function app.fail_render_job(
  p_job uuid, p_error text, p_permanent boolean default false)
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
  if p_permanent or j.attempts >= j.max_attempts then
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

grant execute on function app.fail_render_job(uuid, text, boolean) to app_tenant;
grant execute on function app.fail_render_job(uuid, text, boolean) to carswap_worker;
