-- Выборка заданий исполняется правами ВЫЗЫВАЮЩЕГО, а не владельца схемы.
--
-- ЧТО СЛОМАЛОСЬ. Воркеру выдали обход политик (миграция 025), и своей ролью он
-- очередь увидел: `select count(*) from render_jobs` вернул три. А
-- app.claim_render_jobs всё равно возвращала ноль, и задания стояли в очереди
-- с нулём попыток — воркер выглядел живым и ничего не делал.
--
-- Причина. security definer исполняет тело от ВЛАДЕЛЬЦА функции. Владелец —
-- carswap_owner, обхода политик у него нет и не должно быть. То есть внутри
-- функции претензии по-прежнему нет, RLS снова закрывает очередь, и обход,
-- выданный воркеру, до тела не доходит.
--
-- Это третий случай подряд, когда security definer принимают за «работает от
-- имени всесильного». Он меняет РОЛЬ, но не отменяет force row level security
-- и не наследует атрибуты вызывающего.
--
-- ПОЧЕМУ INVOKER БЕЗОПАСЕН ЗДЕСЬ. Функцию зовут ровно двое: воркер и стенд.
--   воркер  — своей ролью с обходом политик, видит очередь всех точек, и это
--             его работа; границу задают гранты, а не эта функция;
--   стенд   — ролью приложения с претензией арендатора, и тогда RLS
--             показывает ровно задания своей точки, как и до правки.
-- Прав сверх собственных функция теперь никому не добавляет — а раньше
-- добавляла права владельца схемы кому угодно, кто мог её вызвать.
create or replace function app.claim_render_jobs(p_worker text, p_limit integer default 4)
returns setof render_jobs
language sql
set search_path to public, app
as $$
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

grant execute on function app.claim_render_jobs(text, integer) to app_tenant;
