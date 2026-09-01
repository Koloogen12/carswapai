-- CarSwap AI · тесты очереди и потолков расхода
--
-- Проверяется не «очередь работает», а то, ради чего она устроена именно так:
-- деньги не утекают, поток менеджера не встаёт за гаражом, и жёсткий стоп
-- не глушит то, что обязано работать всегда.

\set ON_ERROR_STOP on
\pset tuples_only on

begin;

insert into networks (id, name, join_code)
values ('11111111-2222-0000-0000-000000000001','Сеть','Q-2026');
-- Претензия арендатора: без неё RLS не пустит роль приложения никуда.
select act_as('aaaaaaaa-2222-0000-0000-000000000001'::uuid, '11111111-2222-0000-0000-000000000001'::uuid);
insert into points (id, network_id, name, public_slug, soft_cap_kopecks, hard_cap_kopecks)
values ('aaaaaaaa-2222-0000-0000-000000000001','11111111-2222-0000-0000-000000000001',
        'Точка','q-tochka', 90000, 180000);

-- ── Дедупликация ─────────────────────────────────────────────
do $$
declare a uuid; b uuid; n integer;
begin
  a := app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'B',
                          'photo:abc|sku:K75400|light:day', 10::smallint, 850);
  b := app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'B',
                          'photo:abc|sku:K75400|light:day', 10::smallint, 850);
  select count(*) into n from render_jobs where dedupe_key = 'photo:abc|sku:K75400|light:day';
  if a <> b or n <> 1 then
    raise exception 'ПРОВАЛ: та же пара «фото × артикул × свет» поставлена в очередь дважды';
  end if;
  raise notice 'ok  · §4.8: повтор «фото × артикул × свет» не создаёт вторую задачу и не платит дважды';
end $$;

-- ── Приоритет: менеджер выше гаража ──────────────────────────
do $$
declare first_job record;
begin
  perform app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'A',
                             'garage:1', 10::smallint, 10);
  perform app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'A',
                             'manager:1', 0::smallint, 10);
  select * into first_job from app.claim_render_jobs('worker-1', 1);
  if first_job.dedupe_key <> 'manager:1' then
    raise exception 'ПРОВАЛ: гараж забран раньше потока менеджера (%)', first_job.dedupe_key;
  end if;
  raise notice 'ok  · §8.2: поток менеджера забирается раньше потока гаража';
end $$;

-- ── Повтор с растущей паузой, затем отказ ────────────────────
do $$
declare j uuid; st job_status; runs integer;
begin
  j := app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'B',
                          'retry:1', 0::smallint, 850);
  for i in 1..5 loop
    perform app.claim_render_jobs('worker-1', 10);
    st := app.fail_render_job(j, 'модель недоступна');
    update render_jobs set run_after = now() where id = j;   -- перематываем паузу после отказа
  end loop;
  if st <> 'failed' then
    raise exception 'ПРОВАЛ: задача не ушла в failed после исчерпания попыток, статус %', st;
  end if;
  select attempts into runs from render_jobs where id = j;
  if runs <> 5 then
    raise exception 'ПРОВАЛ: попыток засчитано %, ожидалось 5', runs;
  end if;
  raise notice 'ok  · §12: отказ модели уходит в повторы, затем в failed, а не в бесконечный цикл';
end $$;

select expect_fail($$
  select app.fail_render_job(
    (select id from render_jobs where dedupe_key = 'retry:1'), 'повторный отказ')
$$, 'Отказ нельзя засчитать задаче, которая не в работе');

-- ── Жёсткий стоп: класс B встаёт, класс A работает ───────────
insert into generation_usage (point_id, render_class, category, cost_kopecks, model_used)
values ('aaaaaaaa-2222-0000-0000-000000000001','B','film', 180000, 'gemini-3.1-flash-image');

select expect_fail($$
  select app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'B',
                            'over-budget:1', 0::smallint, 850)
$$, '§4.10: класс B встаёт на жёстком стопе по бюджету');

select expect_ok($$
  select app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'A',
                            'floor:1', 0::smallint, 10)
$$, '§8.5: класс A продолжает работать на жёстком стопе — это пол деградации, а не роскошь');

-- ── Снятие стопа сетью ───────────────────────────────────────
update point_budgets set released_at = now()
 where point_id = 'aaaaaaaa-2222-0000-0000-000000000001'
   and period_month = date_trunc('month', now())::date;

select expect_ok($$
  select app.enqueue_render('aaaaaaaa-2222-0000-0000-000000000001', null, 'day', 'B',
                            'after-release:1', 0::smallint, 850)
$$, 'С-5: после снятия стопа сетью класс B продолжает работу');

-- ── Возврат зависших задач ───────────────────────────────────
do $$
declare n integer;
begin
  perform app.claim_render_jobs('worker-dead', 10);
  update render_jobs set locked_at = now() - interval '30 minutes' where status = 'running';
  n := app.requeue_stale_jobs();
  if n = 0 then
    raise exception 'ПРОВАЛ: задачи умершего воркера не вернулись в очередь';
  end if;
  raise notice 'ok  · Задачи умершего воркера возвращаются в очередь, а не теряются';
end $$;

-- ── Отказ, который повтором не исправить (миграция 028) ──────
--
-- Задержки повторов дают около десяти минут, а экран клиента опрашивает
-- готовность две. То есть окончательный отказ он не видел НИКОГДА: примерка
-- просто не появлялась, без результата и без объяснения. Проверяется, что
-- такой отказ засчитывается с ПЕРВОЙ попытки, а обычный по-прежнему
-- возвращается в очередь.
do $$
declare j uuid; st job_status; att int;
begin
  perform app.claim_render_jobs('worker-perm', 1);
  select id into j from render_jobs where status = 'running' limit 1;
  if j is null then raise exception 'ПРОВАЛ: нечего проверять — задача не взята'; end if;

  select attempts into att from render_jobs where id = j;
  st := app.fail_render_job(j, 'RuntimeError: plate_not_found: номера нет', true);
  if st <> 'failed' then
    raise exception 'ПРОВАЛ: окончательный отказ ушёл в повтор (статус %), попытка % из 5', st, att;
  end if;
  raise notice 'ok  · Отказ, который повтором не исправить, засчитывается сразу';

  perform app.claim_render_jobs('worker-retry', 1);
  select id into j from render_jobs where status = 'running' limit 1;
  if j is not null then
    st := app.fail_render_job(j, 'TimeoutError: шлюз не ответил');
    if st <> 'queued' then
      raise exception 'ПРОВАЛ: обрыв связи должен возвращаться в очередь, а не хоронить задание';
    end if;
    raise notice 'ok  · Обрыв связи по-прежнему возвращается в очередь';
  end if;
end $$;

rollback;
