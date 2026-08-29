-- CarSwap AI · статус точки начинает что-то значить
--
-- ЧТО БЫЛО. `points.status` с четырьмя значениями существовал в схеме с самого
-- начала и проверялся ровно в одном месте — резолвер гаража отсекал
-- `archived`. То есть отключённая за неуплату точка продолжала работать как
-- ни в чём не бывало: менеджер собирал примерки, генерации тратились, счета
-- росли. Экран 58 карты предлагает «отключение точки», и это отключение
-- ничего не отключало.
--
-- Кнопка, которая ничего не делает, хуже отсутствующей: сеть считает, что
-- точка остановлена, а расход идёт.
--
-- ЧТО ЗНАЧИТ КАЖДЫЙ СТАТУС ТЕПЕРЬ:
--
--   active     — обычная работа.
--   readonly   — подписка на паузе. Новых примерок и карточек нет, но всё уже
--                собранное открывается: клиент, получивший ссылку вчера, не
--                должен упереться в пустой экран из-за долга точки.
--   suspended  — отключена. То же, что readonly, плюс гараж не открывается:
--                снаружи точка перестаёт существовать.
--   archived   — закрыта навсегда.
--
-- ЧЕГО ЗДЕСЬ НЕТ И ПОЧЕМУ. Чтения переписки и нарядов не трогаем ни в одном
-- статусе. Долг точки перед сетью — это спор двух юрлиц, а данные клиентов
-- в него не входят: отнять у точки её же переписку значит наказать не того.

begin;

-- Новые задания на генерацию: остановка расхода.
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
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  st record;
  existing uuid;
  new_id uuid;
  p_status point_status;
begin
  select status into p_status from points where id = p_point;
  if p_status is null then
    raise exception 'Точка % не видна: нет претензии арендатора', p_point
      using errcode = 'insufficient_privilege';
  end if;
  if p_status <> 'active' then
    raise exception 'Точка в статусе «%»: новые примерки не собираются. Снятие — на стороне сети', p_status
      using errcode = 'restrict_violation';
  end if;

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

-- Отправка карточек: остановка работы с клиентом.
create or replace function app.point_active_for_cards() returns trigger
  language plpgsql as $$
declare st point_status;
begin
  select status into st from points where id = new.point_id;
  if st is distinct from 'active' then
    raise exception 'Точка в статусе «%»: карточки клиентам не отправляются. Снятие — на стороне сети', st
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger outbound_cards_point_active before insert on outbound_cards
  for each row execute function app.point_active_for_cards();

-- Гараж отключённой точки снаружи не открывается.
create or replace function app.point_of_slug(slug text) returns uuid
  language plpgsql stable security definer set search_path = public, pg_temp as $fn$
declare saved text; found uuid;
begin
  if slug is null then return null; end if;
  saved := coalesce(current_setting('request.jwt.claims', true), '');
  perform set_config('request.jwt.claims',
    json_build_object('app_role','link_resolver','public_slug', slug)::text, true);
  begin
    select p.id into found from points p
     where p.public_slug = slug and p.status = 'active';
  exception when others then
    perform set_config('request.jwt.claims', saved, true);
    raise;
  end;
  perform set_config('request.jwt.claims', saved, true);
  return found;
end $fn$;

-- ── Действия сети ──────────────────────────────────────────
-- Менять статус точки может только её сеть. Проверка здесь, а не в коде:
-- отключение точки — это остановка чужого бизнеса, и решать, кто вправе,
-- должна база.
create or replace function app.set_point_status(p_point uuid, p_status point_status)
returns void language plpgsql security definer
set search_path = public, pg_temp as $$
declare n int;
begin
  if app.current_role_name() <> 'network_admin' then
    raise exception 'Менять статус точки может только сеть'
      using errcode = 'insufficient_privilege';
  end if;
  update points set status = p_status
   where id = p_point and network_id = app.current_network_id();
  get diagnostics n = row_count;
  if n = 0 then
    -- Ноль строк — это чужая точка либо отсутствие претензии. Молчать нельзя:
    -- сеть решит, что точка остановлена, а она работает.
    raise exception 'Точка % не найдена в вашей сети', p_point
      using errcode = 'restrict_violation';
  end if;

  insert into audit_log (point_id, actor_role, action, entity, entity_id, detail)
  values (p_point, 'network_admin', 'point.status', 'points', p_point,
          jsonb_build_object('status', p_status::text));
end $$;

-- С-5: снятие жёсткого стопа по бюджету — на стороне сети.
create or replace function app.release_budget_stop(p_point uuid)
returns void language plpgsql security definer
set search_path = public, pg_temp as $$
declare n int;
begin
  if app.current_role_name() <> 'network_admin' then
    raise exception 'Снимать стоп по бюджету может только сеть'
      using errcode = 'insufficient_privilege';
  end if;
  update point_budgets b
     set released_at = now()
    from points p
   where b.point_id = p_point and p.id = b.point_id
     and p.network_id = app.current_network_id()
     and b.period_month = date_trunc('month', now())::date
     and b.released_at is null;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'Стоп по бюджету точки % не снят: либо точка не ваша, либо стоп уже снят', p_point
      using errcode = 'restrict_violation';
  end if;

  insert into audit_log (point_id, actor_role, action, entity, entity_id, detail)
  values (p_point, 'network_admin', 'budget.released', 'point_budgets', p_point,
          '{}'::jsonb);
end $$;

revoke all on function app.set_point_status(uuid, point_status) from public;
revoke all on function app.release_budget_stop(uuid) from public;
grant execute on function app.set_point_status(uuid, point_status) to app_tenant;
grant execute on function app.release_budget_stop(uuid) to app_tenant;

commit;
