-- Гарантийное обращение со стороны клиента.
--
-- «Записаться на осмотр» на экране гарантии была нарисованной кнопкой, и три
-- варианта проблемы над ней — нарисованными переключателями: первый всегда
-- отмечен, нажатие не меняет ничего. Клиент, у которого отходит плёнка,
-- нажимал и оставался наедине с проблемой, считая, что обращение ушло.
--
-- Писать в warranty_claims клиентской роли нельзя и не будет можно:
-- ограничительная политика закрывает ей таблицу целиком. Поэтому обращение
-- заводится узкой функцией — тем же приёмом, что и остальные действия по
-- ссылке: клиент не получает доступа к таблице, он получает право на одно
-- действие со своей гарантией.
--
-- ЧТО ФУНКЦИЯ НЕ ДЕЛАЕТ. Она не назначает осмотр. Слотов гарантийного осмотра
-- в расписании нет, и придумывать их здесь значило бы обещать клиенту время,
-- которого никто не подтверждал. Обращение открыто — точка перезванивает и
-- ставит время сама. Кнопка на экране названа по тому, что происходит.
-- ─────────────────────────────────────────────────────────────
-- Резолвер гарантии по конфигурации клиента
-- ─────────────────────────────────────────────────────────────
--
-- Политика выше сначала искала гарантию подзапросом по orders и confirmations.
-- Это не работает и не должно: подзапрос внутри политики выполняется от того
-- же вызывающего и сам подчинён RLS, а клиенту эти таблицы не видны. Проверка
-- молча давала «не нашлось», и вставка отклонялась.
--
-- Тот же приём, что и app.point_of_configuration: узкая функция, которая
-- отдаёт РОВНО один идентификатор по неперебираемому ключу, который клиент и
-- так держит в руках. Доступа к таблицам она не открывает.
create or replace function app.warranty_head(p_cfg uuid)
returns table (warranty_id uuid, warranty_point_id uuid, point_name text)
language sql stable security definer set search_path = public, app as $$
  select wr.id, wr.point_id, p.name
    from warranties wr
    join orders o        on o.id = wr.order_id
    join confirmations cf on cf.id = o.confirmation_id
    join points p        on p.id = wr.point_id
   where cf.configuration_id = p_cfg
   limit 1
$$;

-- Точка отдаётся тем же резолвером не для удобства. Функция обращения —
-- invoker, и warranties с points клиенту не видны: собственный select вернул
-- бы пустоту, point_id ушёл бы NULL, а point_visible(NULL) читается как отказ
-- RLS. Симптом при этом — «нарушает политику», хотя политика ни при чём.
create or replace function app.warranty_of_configuration(p_cfg uuid)
returns uuid language sql stable as $$
  select warranty_id from app.warranty_head(p_cfg)
$$;

grant execute on function app.warranty_head(uuid) to app_tenant;
grant execute on function app.warranty_of_configuration(uuid) to app_tenant;

-- Соглашение из 006: для публичной роли заводятся ДВЕ политики — разрешающая
-- взамен закрытой арендаторной и ограничительная поверх всего остального.
--
-- Одних ограничительных мало, и это стоило часа отладки. app.point_visible()
-- для роли client ложна ПО ПОСТРОЕНИЮ: клиенту положена одна сделка, а не всё,
-- что происходит на точке. Значит единственная разрешающая политика таблицы —
-- арендаторная — для клиента не срабатывает никогда, и вставка отклоняется,
-- сколько ограничительных ни ослабляй. Симптом при этом один и тот же —
-- «нарушает политику RLS», без указания, какая именно.
drop policy if exists warranty_claims_client on warranty_claims;

-- Разрешающая: ровно обращение по своей гарантии, взамен закрытой арендаторной.
create policy warranty_claims_client_can_read on warranty_claims
  for select using (
    app.current_role_name() = 'client'
    and warranty_id = app.warranty_of_configuration(app.current_configuration_id())
  );

create policy warranty_claims_client_can_write on warranty_claims
  for insert with check (
    app.current_role_name() = 'client'
    and point_id = app.current_point_id()
    and warranty_id = app.warranty_of_configuration(app.current_configuration_id())
  );

-- Ограничительная: режет пересечением поверх всего, включая будущие
-- разрешающие политики, если их когда-нибудь добавят.
create policy warranty_claims_client_own on warranty_claims
  as restrictive
  using (
    app.current_role_name() <> 'client'
    or warranty_id = app.warranty_of_configuration(app.current_configuration_id())
  )
  with check (
    app.current_role_name() <> 'client'
    or (point_id = app.current_point_id()
        and warranty_id = app.warranty_of_configuration(app.current_configuration_id()))
  );

-- Закрывает обращение точка, не клиент: «решено» — её слово, и клиент не
-- закрывает спор о качестве ни за неё, ни вместо неё.
create policy warranty_claims_client_change on warranty_claims
  as restrictive for update using (app.current_role_name() <> 'client');
create policy warranty_claims_client_delete on warranty_claims
  as restrictive for delete using (app.current_role_name() <> 'client');

-- Функция обращения тоже читает гарантию через резолвер: сама она invoker,
-- и цепочку orders → confirmations клиенту не видно точно так же.
create or replace function app.open_warranty_claim(p_reason text)
returns table (claim_id uuid, point_name text)
language plpgsql set search_path = public, app as $$
declare
  cfg uuid := app.current_configuration_id();
  wid uuid;
  wpoint uuid;
  pname text;
  existing uuid;
  new_id uuid;
begin
  if cfg is null then
    raise exception 'обращение доступно только по ссылке клиента'
      using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'причина обращения обязательна' using errcode = 'check_violation';
  end if;

  select h.warranty_id, h.warranty_point_id, h.point_name into wid, wpoint, pname
    from app.warranty_head(cfg) h;

  if wid is null then
    raise exception 'по этой сделке гарантия ещё не выдана'
      using errcode = 'check_violation';
  end if;

  select c.id into existing from warranty_claims c
   where c.warranty_id = wid and c.status = 'open' limit 1;

  if existing is not null then
    return query select existing, pname;
    return;
  end if;

  insert into warranty_claims (point_id, warranty_id, reason)
  values (wpoint, wid, btrim(p_reason))
  returning id into new_id;

  return query select new_id, pname;
end $$;

grant execute on function app.open_warranty_claim(text) to app_tenant;
