-- Граница роли воркера (миграция 025).
--
-- Воркер получил bypassrls: он обслуживает очередь ВСЕХ точек, и политика
-- «кому из арендаторов что видно» к нему неприменима по смыслу. Значит
-- границей служат права на таблицы, а не политики, — и проверять надо именно
-- их, иначе bypassrls тихо превращается в «видит всё».
--
-- Проверяется не список грантов, а поведение: что воркеру видно и что нет.
\set ON_ERROR_STOP on
\pset tuples_only on

-- ── 1 · роль не суперпользователь и не владелец схемы ─────────
select expect_eq($$select rolsuper::text from pg_roles where rolname='carswap_worker'$$,
  'false', 'Воркер не суперпользователь');

select expect_eq($$select rolbypassrls::text from pg_roles where rolname='carswap_worker'$$,
  'true', 'Воркеру выдан обход политик — осознанно, он не арендатор');

select expect_eq($$
  select count(*)::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname='public' and c.relkind='r'
     and pg_get_userbyid(c.relowner) = 'carswap_worker'
$$, '0', 'Воркер не владеет ни одной таблицей');

-- ── 2 · что воркеру ВИДНО: только очередь и то, что нужно для кадра ──
-- has_table_privilege, а не information_schema: последняя показывает только
-- те гранты, где текущая роль — выдавший или получивший, и от лица роли
-- приложения список выходил пустым. Пустой список прошёл бы как «ничего не
-- выдано», то есть проверка молча одобрила бы что угодно.
select expect_eq($$
  select string_agg(t, ',' order by t) from unnest(array[
    'render_jobs','configuration_items','point_prices','catalog_items',
    'renders','photos','point_budgets']) t
   where has_table_privilege('carswap_worker', t, 'select')
$$, 'catalog_items,configuration_items,photos,point_budgets,point_prices,render_jobs,renders',
  'Читать воркер может ровно семь таблиц');

-- ── 3 · что воркеру НЕ видно: всё, где живут люди ─────────────
-- Это и есть настоящая граница. Обход политик её не открывает, потому что
-- прав на эти таблицы у роли нет вовсе.
select expect_eq($$
  select coalesce(string_agg(t, ',' order by t), 'ничего')
    from unnest(array['clients','threads','messages','consents','orders',
                      'invoices','payments','users','warranties','warranty_claims',
                      'appointments','change_orders','garage_sessions','sessions',
                      'auth_codes','leads','audit_log']) t
   where has_table_privilege('carswap_worker', t, 'select')
$$, 'ничего', 'Переписка, клиенты, наряды и согласия воркеру не видны вовсе');

-- ── 4 · писать может только то, что производит ───────────────
select expect_eq($$
  select coalesce(string_agg(t, ',' order by t), 'ничего')
    from unnest(array['renders','generation_usage','render_jobs','photos',
                      'configuration_items','clients','messages']) t
   where has_table_privilege('carswap_worker', t, 'insert')
      or has_table_privilege('carswap_worker', t, 'update')
      or has_table_privilege('carswap_worker', t, 'delete')
$$, 'generation_usage,renders',
  'Писать воркер может только рендеры и собственный расход');
