-- CarSwap AI · миграция 006 · публичные пути по ссылке
--
-- Дыра, которую эта миграция закрывает.
--
-- Клиентский путь (`src/lib/journey.ts`) и гараж-примерочная (`/g/[slug]`)
-- ходили в базу через `sys()` — то есть в пул БЕЗ `request.jwt.claims`.
-- На стенде разработки всё шло от суперпользователя, который RLS обходит,
-- поэтому это «работало». На боевой ролевой модели (роль `carswap_app`,
-- входит в `app_tenant`, не суперпользователь и не владелец) те же запросы
-- вернули бы НОЛЬ строк на чтение и изменили бы НОЛЬ строк на запись —
-- молча, без исключения. Клиент не смог бы ни подтвердить выбор (М-7),
-- ни записаться на замер (М-8), и в логах не осталось бы следа.
--
-- Лечится не выдачей BYPASSRLS приложению — это превратило бы подписанную
-- ссылку клиента в ключ ко всей точке. Лечится собственной ролью для
-- посетителя по ссылке, для которой арендаторная политика закрыта целиком,
-- а нужное выдано поимённо: разрешающей политикой на каждую таблицу
-- и ограничительной поверх неё.
--
-- ВАЖНО ПРО SECURITY DEFINER. В 001 на все таблицы стоит FORCE ROW LEVEL
-- SECURITY, а значит RLS действует и на владельца схемы. Поэтому
-- `security definer` сам по себе RLS НЕ обходит: функция, выполняясь
-- от `carswap_owner`, видит ровно то же, что и приложение. Проверено
-- прогоном. Обе функции-резолвера ниже устроены иначе: они на время
-- своего вызова подставляют собственную претензию и читают строку через
-- узкую политику «по идентификатору, который вызывающий уже знает».
-- Такая брешь не выдаёт ничего сверх того, что уже есть у держателя ссылки.

-- ─────────────────────────────────────────────────────────────
-- 1. Претензии публичных ролей
-- ─────────────────────────────────────────────────────────────
-- Роли две, потому что субъекты разные.
--
--   app_role = 'client' — держатель подписанной ссылки на конфигурацию.
--     Ключ его претензии — configuration_id: сделка уже существует.
--
--   app_role = 'garage' — аноним в примерочной. Конфигурации у него ещё
--     НЕТ и по построению быть не может: Г-1 требует ноль полей до первой
--     примерки, так что на момент открытия страницы существует только точка
--     и анонимная сессия. Ключом претензии служит session_id — ровно тот же
--     субъект, что и в `consents.session_id` из 003 (согласие в гараже
--     собирается до появления клиента). Одной претензии на оба пути
--     не хватило именно поэтому: у гаража нечему быть configuration_id.

create or replace function app.current_configuration_id() returns uuid
  language sql stable as $$ select nullif(app.claims()->>'configuration_id','')::uuid $$;

create or replace function app.current_session_id() returns text
  language sql stable as $$ select nullif(app.claims()->>'session_id','') $$;

grant execute on function app.current_configuration_id() to app_tenant;
grant execute on function app.current_session_id() to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 2. Узкие политики «по известному идентификатору»
-- ─────────────────────────────────────────────────────────────
-- Разрешающие политики, которые выдают РОВНО одну строку — ту, чей
-- неперебираемый идентификатор вызывающий и так держит в руках. Это
-- единственная точка, через которую резолверы ниже узнают точку.
-- Для сотрудника обе политики инертны: в его претензии нет ни
-- configuration_id, ни public_slug, и nullif(...) даёт null.

create policy configurations_by_id on configurations as permissive for select
  using (id = app.current_configuration_id());

-- public_slug — публичный идентификатор по определению (Г-8: это и есть
-- ссылка гаража, её печатают на визитке), поэтому раскрытие точки по слагу
-- не раскрывает ничего нового.
create policy points_by_slug on points as permissive for select
  using (public_slug = nullif(app.claims()->>'public_slug',''));

-- ─────────────────────────────────────────────────────────────
-- 3. Резолверы: единственные места, где контекст создаётся из ничего
-- ─────────────────────────────────────────────────────────────
-- Обе функции подставляют собственную претензию на время своего вызова
-- и восстанавливают прежнюю перед возвратом. Претензия транзакционная
-- (set_config(..., true)), иначе она осталась бы на соединении из пула и
-- утекла бы следующему арендатору. Отсюда требование вызывать резолвер
-- внутри транзакции — и явная проверка этого, чтобы нарушение не проходило
-- молчаливым null'ом, как это было с sys().

create or replace function app.point_of_configuration(cfg uuid) returns uuid
  language plpgsql stable security definer set search_path = public, pg_temp as $fn$
declare
  saved text;
  found uuid;
begin
  if cfg is null then return null; end if;
  saved := coalesce(current_setting('request.jwt.claims', true), '');

  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver','configuration_id', cfg)::text, true);
  if app.current_configuration_id() is distinct from cfg then
    perform set_config('request.jwt.claims', saved, true);
    raise exception 'app.point_of_configuration() вызвана вне транзакции: SET LOCAL не действует'
      using errcode = 'invalid_transaction_state';
  end if;

  begin
    select c.point_id into found from configurations c where c.id = cfg;
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;

  perform set_config('request.jwt.claims', saved, true);
  return found;
end $fn$;

create or replace function app.point_of_slug(slug text) returns uuid
  language plpgsql stable security definer set search_path = public, pg_temp as $fn$
declare
  saved text;
  found uuid;
begin
  if slug is null or slug = '' then return null; end if;
  saved := coalesce(current_setting('request.jwt.claims', true), '');

  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver','public_slug', slug)::text, true);
  if nullif(app.claims()->>'public_slug','') is distinct from slug then
    perform set_config('request.jwt.claims', saved, true);
    raise exception 'app.point_of_slug() вызвана вне транзакции: SET LOCAL не действует'
      using errcode = 'invalid_transaction_state';
  end if;

  begin
    select p.id into found from points p
     where p.public_slug = slug and p.status <> 'archived';
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;

  perform set_config('request.jwt.claims', saved, true);
  return found;
end $fn$;

revoke execute on function app.point_of_configuration(uuid) from public;
revoke execute on function app.point_of_slug(text) from public;
grant execute on function app.point_of_configuration(uuid) to app_tenant;
grant execute on function app.point_of_slug(text) to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 4. Запрет по умолчанию для публичных ролей
-- ─────────────────────────────────────────────────────────────
-- Арендаторные политики из 001/003/004 пускают по всей точке — сотруднику
-- так и надо. Клиент по ссылке сотрудником не является: ему положена ОДНА
-- сделка, а не всё, что происходит на точке.
--
-- Закрыто это НЕ перечнем таблиц, а самой app.point_visible(), через которую
-- ходит почти каждая арендаторная политика в схеме. Перечень протух бы на
-- первой же следующей миграции: таблица, заведённая в общем стиле
-- `using (app.point_visible(point_id))`, попала бы в перечень только если
-- про неё вспомнить. Так — наоборот: она закрыта для ссылки по умолчанию,
-- и открыть её можно только поимённо, разрешающей политикой ниже.
-- (Проверяется прогоном: db/tests/client-link.sql обходит ВСЕ таблицы под
-- RLS и требует нуля строк у всего, что публичной роли не выдано явно.)

create or replace function app.point_visible(p uuid) returns boolean
  language sql stable security definer set search_path = public, app as $$
  select case
    when app.current_role_name() in ('client','garage') then false
    when app.current_role_name() = 'network_admin' then exists (
      select 1 from points x where x.id = p and x.network_id = app.current_network_id())
    else p = app.current_point_id()
  end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Что публичным ролям выдано поимённо
-- ─────────────────────────────────────────────────────────────
-- Для каждой пары «роль × таблица» ниже создаётся ДВЕ политики:
--   разрешающая (permissive)  — выдаёт ровно нужные строки взамен закрытой
--                                арендаторной;
--   ограничительная (restrictive) — режет пересечением поверх всего
--                                остального, включая будущие разрешающие
--                                политики, если их когда-нибудь добавят.
-- Образец ограничительной — master_read_only в 001.
--
-- Список таблиц берётся из самой базы (pg_class.relrowsecurity), а не
-- переписывается руками. Всё, чего нет в перечне исключений, публичным ролям
-- запрещено дважды: и отсутствием разрешающей политики, и запретом
-- в ограничительной.

do $mig$
declare
  r     record;
  guard text;
  mine  text;
  pname text;
begin
  for r in
    with rls_tables as (
      select c.relname::text as tbl
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
    ),
    public_roles as (select unnest(array['client','garage']) as app_role),
    rules as (
      select * from (values
        -- ── клиент по подписанной ссылке ─────────────────────
        -- Точка: название и адрес в шапке — это и так его точка.
        ('client','points',
         'id = app.current_point_id()', 'false', 'false'),
        -- Своя примерка и её позиции.
        ('client','configurations',
         'id = app.current_configuration_id()', 'false', 'false'),
        ('client','configuration_items',
         'configuration_id = app.current_configuration_id()', 'false', 'false'),
        ('client','renders',
         'exists (select 1 from configuration_items ci'
         ' where ci.id = renders.configuration_item_id'
         '   and ci.configuration_id = app.current_configuration_id())', 'false', 'false'),
        -- Прайс точки клиенту не виден: видны только те строки прайса,
        -- на которые ссылается его собственная примерка.
        ('client','point_prices',
         'exists (select 1 from configuration_items ci'
         ' where ci.point_price_id = point_prices.id'
         '   and ci.configuration_id = app.current_configuration_id())', 'false', 'false'),
        -- Своя ветка и свой контакт. Переписка (messages) не видна вовсе.
        ('client','threads',
         'exists (select 1 from configurations cfg'
         ' where cfg.id = app.current_configuration_id() and cfg.thread_id = threads.id)',
         'false', 'false'),
        ('client','clients',
         'exists (select 1 from configurations cfg join threads t on t.id = cfg.thread_id'
         ' where cfg.id = app.current_configuration_id() and t.client_id = clients.id)',
         'false', 'false'),
        ('client','outbound_cards',
         'configuration_id = app.current_configuration_id()', 'false', 'false'),
        -- М-7: подтверждение выбора. Единственная запись, которую клиент
        -- делает сам и которую переписать уже нельзя (триггер из 001).
        ('client','confirmations',
         'configuration_id = app.current_configuration_id()',
         'configuration_id = app.current_configuration_id()'
         ' and point_id = app.current_point_id()', 'false'),
        ('client','orders',
         'exists (select 1 from confirmations cf'
         ' where cf.id = orders.confirmation_id'
         '   and cf.configuration_id = app.current_configuration_id())', 'false', 'false'),
        ('client','invoices',
         'exists (select 1 from orders o join confirmations cf on cf.id = o.confirmation_id'
         ' where o.id = invoices.order_id'
         '   and cf.configuration_id = app.current_configuration_id())', 'false', 'false'),
        -- Предоплата: вносить можно, переписывать внесённое — нет.
        ('client','payments',
         'exists (select 1 from invoices i join orders o on o.id = i.order_id'
         ' join confirmations cf on cf.id = o.confirmation_id'
         ' where i.id = payments.invoice_id'
         '   and cf.configuration_id = app.current_configuration_id())',
         'point_id = app.current_point_id()'
         ' and exists (select 1 from invoices i join orders o on o.id = i.order_id'
         ' join confirmations cf on cf.id = o.confirmation_id'
         ' where i.id = payments.invoice_id'
         '   and cf.configuration_id = app.current_configuration_id())', 'false'),
        -- Доплата: клиент меняет статус своей доработки. Иммутабельность
        -- решённой держит триггер change_orders_freeze из 004.
        ('client','change_orders',
         'exists (select 1 from orders o join confirmations cf on cf.id = o.confirmation_id'
         ' where o.id = change_orders.order_id'
         '   and cf.configuration_id = app.current_configuration_id())', 'false',
         'exists (select 1 from orders o join confirmations cf on cf.id = o.confirmation_id'
         ' where o.id = change_orders.order_id'
         '   and cf.configuration_id = app.current_configuration_id())'),
        -- М-8: клиент выбирает и переносит слот замера сам.
        ('client','appointments',
         'configuration_id = app.current_configuration_id()',
         'configuration_id = app.current_configuration_id()'
         ' and point_id = app.current_point_id()',
         'configuration_id = app.current_configuration_id()'
         ' and point_id = app.current_point_id()'),
        ('client','warranties',
         'exists (select 1 from orders o join confirmations cf on cf.id = o.confirmation_id'
         ' where o.id = warranties.order_id'
         '   and cf.configuration_id = app.current_configuration_id())', 'false', 'false'),
        -- Состояние ЛКП до работ — только по своему визиту. Раньше карточка
        -- доработки подтягивала фото по одной лишь точке, то есть могла
        -- показать клиенту чужую машину.
        ('client','condition_photos',
         'exists (select 1 from appointments a'
         ' where a.id = condition_photos.appointment_id'
         '   and a.configuration_id = app.current_configuration_id())', 'false', 'false'),

        -- ── аноним в гараже-примерочной ──────────────────────
        -- Ему нужны ровно две вещи: точка, на которую он пришёл, и её
        -- прайс — О-3 требует, чтобы в гараже не существовало артикула
        -- вне прайса ЭТОЙ точки. Прайс здесь публичен по замыслу.
        ('garage','points',
         'id = app.current_point_id()', 'false', 'false'),
        ('garage','point_prices',
         'point_id = app.current_point_id()', 'false', 'false'),
        -- §13: согласие собирается в гараже ДО загрузки фото, и субъект
        -- у него — анонимная сессия. Это единственная запись анонима,
        -- и она возможна только под его собственный session_id.
        ('garage','consents',
         'point_id = app.current_point_id()'
         ' and session_id is not null and session_id = app.current_session_id()',
         'point_id = app.current_point_id()'
         ' and session_id is not null and session_id = app.current_session_id()', 'false')
      ) as v(app_role, tbl, sel, ins, upd)
    )
    select t.tbl, pr.app_role,
           coalesce(ru.sel,'false') as sel,
           coalesce(ru.ins,'false') as ins,
           coalesce(ru.upd,'false') as upd
      from rls_tables t
      cross join public_roles pr
      left join rules ru on ru.tbl = t.tbl and ru.app_role = pr.app_role
     order by t.tbl, pr.app_role
  loop
    guard := format('app.current_role_name() <> %L', r.app_role);
    mine  := format('app.current_role_name() = %L', r.app_role);
    pname := r.tbl || '_' || r.app_role;

    if r.sel = 'false' and r.ins = 'false' and r.upd = 'false' then
      -- Таблица публичной роли не положена вовсе — одна политика на всё.
      execute format('create policy %I on %I as restrictive for all using (%s) with check (%s)',
                     pname, r.tbl, guard, guard);
    else
      -- Разрешающая: взамен арендаторной, которая для публичной роли закрыта.
      execute format('create policy %I on %I as permissive for select using (%s and (%s))',
                     pname || '_can_read', r.tbl, mine, r.sel);
      if r.ins <> 'false' then
        execute format('create policy %I on %I as permissive for insert with check (%s and (%s))',
                       pname || '_can_write', r.tbl, mine, r.ins);
      end if;
      if r.upd <> 'false' then
        execute format('create policy %I on %I as permissive for update '
                       'using (%s and (%s)) with check (%s and (%s))',
                       pname || '_can_change', r.tbl, mine, r.upd, mine, r.upd);
      end if;

      -- Ограничительная: то же самое пересечением, поверх всего остального.
      execute format('create policy %I on %I as restrictive for select using (%s or (%s))',
                     pname || '_select', r.tbl, guard, r.sel);
      execute format('create policy %I on %I as restrictive for insert with check (%s or (%s))',
                     pname || '_insert', r.tbl, guard, r.ins);
      execute format('create policy %I on %I as restrictive for update '
                     'using (%s or (%s)) with check (%s or (%s))',
                     pname || '_update', r.tbl, guard, r.upd, guard, r.upd);
      -- Удаление публичной роли не положено нигде и никогда.
      execute format('create policy %I on %I as restrictive for delete using (%s)',
                     pname || '_delete', r.tbl, guard);
    end if;
  end loop;
end $mig$;
