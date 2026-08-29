-- Примерка на кадре клиента из гаража — единственная дверь.
--
-- ЧТО БЫЛО. Роль garage закрыта ограничительными политиками на photos,
-- configurations, configuration_items и render_jobs — и это правильно: гараж
-- открыт по ссылке кому угодно, без входа и без имени. Но приложение писало
-- в эти таблицы напрямую от роли гаража, то есть примерка на собственной
-- фотографии клиента не проходила НИ РАЗУ с момента, как была написана.
-- Экран показывал тёплый отказ, и отказ читался как временная неполадка.
--
-- Единственная конфигурация origin='garage' в базе разработки — из посева,
-- заведена суперпользователем. Через продукт этот путь не проходил.
--
-- ЧТО РЕШАЕТ ОСНОВАТЕЛЬ, А ЧТО СПЕКА. Пускать ли аноним тратить деньги точки
-- — решено спекой §4.10 и инвариантом Г-9: анонимному гаражу положено три
-- генерации в сутки, дальше мягкий переход «оставьте телефон» и пятнадцать.
-- Здесь реализуется ровно это, не шире.
--
-- ПОЧЕМУ ДВЕРЬ ПРИНИМАЕТ ДВА ИДЕНТИФИКАТОРА И БОЛЬШЕ НИЧЕГО. Полезную нагрузку
-- для внешней модели собирает база, а не вызывающий. Приложение раньше
-- передавало её само — а значит анонимный посетитель мог влиять на то, что
-- уходит в чужую модель. Артикул, фактура, цвет и путь к кадру выводятся здесь
-- из идентификаторов, и подставить туда своё нельзя.
--
-- Ограничительные политики НЕ ослабляются: прямая запись роли garage
-- по-прежнему невозможна, и db/tests/client-link.sql это по-прежнему требует.

-- ─────────────────────────────────────────────────────────────
-- 1. Подъём прав внутри двери
-- ─────────────────────────────────────────────────────────────
--
-- `security definer` здесь не помогает и не может: у таблиц включён
-- `force row level security`, а политики читают не роль базы, а претензию из
-- request.jwt.claims. Внутри функции претензия остаётся гаражной — значит
-- ограничительная политика отклоняет и чтение, и запись.
--
-- Читать тоже: это стоило отдельной ошибки. Дедупликация кадра и счётчик
-- примерок стояли ДО подъёма прав и молча возвращали пустоту — дверь завела бы
-- второй кадр на тот же отпечаток и не заметила бы израсходованный потолок.
-- Поэтому права поднимаются один раз, до всех обращений к таблицам точки, а
-- личность вызывающего (сессия и точка) снимается с претензии ДО подъёма.
--
-- Роль в подменённой претензии — 'system', а не 'manager'. Журнал и любые
-- будущие политики обязаны видеть, что писал не человек, а дверь.
--
-- Ограничительные политики НЕ ослабляются: прямая запись роли garage
-- по-прежнему невозможна, и стенд требует этого отдельной проверкой рядом.
drop function if exists app.act_as_point(uuid);

create function app.act_as_point(p_point uuid) returns text
language plpgsql volatile security definer set search_path = public, app as $$
declare was text := current_setting('request.jwt.claims', true);
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('point_id', p_point, 'app_role', 'system')::text, true);
  return coalesce(was, '');
end $$;

-- Возврат обязателен и не откладывается до конца транзакции: в одном
-- соединении за дверью может идти ещё один запрос гаража, и он оказался бы
-- системным. Права подняты на время нескольких обращений, а не сеанса.
create or replace function app.restore_claims(p_was text) returns void
language sql volatile security definer set search_path = public, app as $$
  select set_config('request.jwt.claims', coalesce(p_was, ''), true)::void
$$;

revoke execute on function app.act_as_point(uuid) from public;
revoke execute on function app.restore_claims(text) from public;

-- ─────────────────────────────────────────────────────────────
-- 2. Сессия гаража: телефон как основание поднять потолок
-- ─────────────────────────────────────────────────────────────
-- Г-9 говорит «мягкий переход, не жёсткий блок»: после третьей генерации
-- клиент оставляет телефон и продолжает. Телефон при этом не регистрация:
-- он появляется ПОСЛЕ трёх примерок, а не до первой (Г-1), и нужен точке как
-- обращение, а не нам как учётная запись.
create table if not exists garage_sessions (
  session_id text primary key,
  point_id   uuid not null references points(id),
  phone      text,
  client_id  uuid,
  created_at timestamptz not null default now(),
  phone_at   timestamptz,
  constraint garage_sessions_phone_together
    check ((phone is null) = (phone_at is null)),
  foreign key (client_id, point_id) references clients(id, point_id)
);

alter table garage_sessions enable row level security;
alter table garage_sessions force  row level security;

drop policy if exists garage_sessions_own on garage_sessions;
drop policy if exists garage_sessions_by_door on garage_sessions;
drop policy if exists garage_sessions_touch on garage_sessions;
create policy garage_sessions_own on garage_sessions
  for select using (
    session_id = app.current_session_id()
    or app.point_visible(point_id)
  );

-- Писать сессию может только дверь: под её подменённой претензией роль
-- системная, и точка «видна». Гараж своей претензией сюда не запишет —
-- app.point_visible() для роли garage ложна по построению (006).
create policy garage_sessions_by_door on garage_sessions
  for insert with check (app.point_visible(point_id));
create policy garage_sessions_touch on garage_sessions
  for update using (app.point_visible(point_id))
  with check (app.point_visible(point_id));

grant select, insert, update on garage_sessions to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 3. Сколько генераций осталось этой сессии сегодня
-- ─────────────────────────────────────────────────────────────
-- Считаем позиции конфигурации, а не строки очереди: одна примерка это три
-- света, они уходят всегда все три (К-1), и для человека это ОДНА генерация.
-- Считать рендеры значило бы обещать три примерки и давать одну.
-- volatile, а не stable, и это не оговорка: функция подменяет претензию, чтобы
-- вообще увидеть свои же строки. Внутри stable подмена не срабатывает, счётчик
-- молча возвращал ноль — то есть потолок §4.10 не наступал никогда, сколько бы
-- примерок ни было сделано.
create or replace function app.garage_day_quota()
returns table (used integer, cap integer, has_phone boolean)
language plpgsql volatile security definer set search_path = public, app as $$
declare
  sid text := app.current_session_id();
  pt  uuid := app.current_point_id();
  was text;
begin
  if sid is null or pt is null then
    used := 0; cap := 3; has_phone := false; return next; return;
  end if;
  was := app.act_as_point(pt);

  select count(distinct rj.configuration_item_id)::int into used
    from render_jobs rj
    join configuration_items ci on ci.id = rj.configuration_item_id
    join configurations cfg on cfg.id = ci.configuration_id
   where cfg.session_id = sid and rj.created_at >= date_trunc('day', now());

  has_phone := exists (select 1 from garage_sessions gs
                        where gs.session_id = sid and gs.phone is not null);
  cap := case when has_phone then 15 else 3 end;

  perform app.restore_claims(was);
  return next;
end $$;

grant execute on function app.garage_day_quota() to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 4. Дверь примерки
-- ─────────────────────────────────────────────────────────────
create or replace function app.garage_tryon(p_photo uuid, p_point_price uuid)
returns table (item_id uuid, job_id uuid, job_variant render_variant)
language plpgsql security definer set search_path = public, app as $$
declare
  sid  text := app.current_session_id();
  pt   uuid := app.current_point_id();
  was  text;
  ph   record;
  pr   record;
  cfg  uuid;
  it   uuid;
  used int;
  cap  int;
  v    render_variant;
  jid  uuid;
begin
  -- Личность вызывающего снимается ДО подъёма прав. После подъёма претензия
  -- системная, и спросить «кто это был» уже не у кого.
  if sid is null or pt is null then
    raise exception 'примерка в гараже доступна только по ссылке точки'
      using errcode = 'insufficient_privilege';
  end if;

  select q.used, q.cap into used, cap from app.garage_day_quota() q;
  if used >= cap then
    raise exception 'на сегодня примерок больше нет: % из %', used, cap
      using errcode = 'restrict_violation';
  end if;

  was := app.act_as_point(pt);

  select p.id, p.point_id, p.storage_path, p.consent_id
    into ph
    from photos p where p.id = p_photo and p.erased_at is null;
  -- Кадр обязан принадлежать ТОЙ ЖЕ точке, по ссылке которой пришёл клиент.
  -- Иначе примерку чужого кадра можно было бы заказать в свою точку.
  if ph.id is null or ph.point_id <> pt then
    perform app.restore_claims(was);
    raise exception 'кадр не найден' using errcode = 'check_violation';
  end if;

  -- Согласие проверяется здесь, а не только при загрузке: между загрузкой и
  -- примеркой согласие могло быть отозвано, и тогда кадр обрабатывать нельзя.
  if not exists (
    select 1 from consents c
     where c.id = ph.consent_id and c.granted
       and c.session_id = sid and c.point_id = pt
       and c.kind = 'photo_processing') then
    perform app.restore_claims(was);
    raise exception 'нет действующего согласия на обработку кадра'
      using errcode = 'check_violation';
  end if;

  select pp.id, pp.price_kopecks, ci.category, ci.sku, ci.finish,
         ci.lab_l, ci.lab_a, ci.lab_b
    into pr
    from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
   where pp.id = p_point_price and pp.point_id = pt;
  if pr.id is null then
    perform app.restore_claims(was);
    raise exception 'этого артикула нет в прайсе точки' using errcode = 'check_violation';
  end if;
  if pr.lab_l is null then
    perform app.restore_claims(was);
    raise exception 'у артикула не измерен цвет — примерка невозможна'
      using errcode = 'check_violation';
  end if;

  insert into garage_sessions (session_id, point_id)
  values (sid, pt) on conflict (session_id) do nothing;

  select cfg2.id into cfg from configurations cfg2
   where cfg2.point_id = pt and cfg2.session_id = sid
   order by cfg2.created_at desc limit 1;
  if cfg is null then
    insert into configurations (point_id, origin, session_id, photo_id)
    values (pt, 'garage', sid, p_photo) returning id into cfg;
  end if;

  select ci2.id into it from configuration_items ci2
   where ci2.configuration_id = cfg and ci2.point_price_id = p_point_price;
  if it is null then
    insert into configuration_items
      (configuration_id, point_id, point_price_id, category, price_kopecks)
    values (cfg, pt, p_point_price, pr.category, pr.price_kopecks)
    returning id into it;
  end if;

  -- Приоритет 10 — гараж: менеджер в диалоге ждёт клиента, а клиент в гараже
  -- ждёт себя. Очередь это различает.
  foreach v in array enum_range(null::render_variant) loop
    jid := app.enqueue_render(
      pt, it, v, 'B',
      p_photo::text || ':' || p_point_price::text || ':' || v::text,
      10::smallint, 850,
      jsonb_build_object(
        'photo_path', ph.storage_path,
        'sku_name',   pr.sku,
        'finish',     pr.finish,
        'target_lab', jsonb_build_array(pr.lab_l, pr.lab_a, pr.lab_b),
        'light',      v::text,
        'origin',     'garage'));
    item_id := it; job_id := jid; job_variant := v;
    return next;
  end loop;

  perform app.restore_claims(was);
end $$;

grant execute on function app.garage_tryon(uuid, uuid) to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 5. Кадр клиента — тем же приёмом
-- ─────────────────────────────────────────────────────────────
create or replace function app.garage_store_photo(
  p_path text, p_sha text, p_width int, p_height int, p_gate jsonb)
returns uuid
language plpgsql security definer set search_path = public, app as $$
declare
  sid text := app.current_session_id();
  pt  uuid := app.current_point_id();
  con uuid;
  ex  uuid;
  was text;
  new_id uuid;
begin
  if sid is null or pt is null then
    raise exception 'загрузка доступна только по ссылке точки'
      using errcode = 'insufficient_privilege';
  end if;

  -- consents гаражу видны: это его собственное согласие, выданное поимённо
  -- в 006. Проверяем до подъёма прав, пока претензия ещё гаражная.
  select c.id into con from consents c
   where c.session_id = sid and c.point_id = pt
     and c.kind = 'photo_processing' and c.granted
   order by c.granted_at desc limit 1;
  if con is null then
    raise exception 'кадр без согласия не сохраняется'
      using errcode = 'check_violation';
  end if;

  was := app.act_as_point(pt);

  -- Тот же кадр второй раз не заводит вторую строку и второе основание.
  -- Проверка обязана стоять ПОСЛЕ подъёма прав: гаражу таблица photos не
  -- видна, и до подъёма она молча возвращала «такого кадра нет».
  select p.id into ex from photos p
   where p.point_id = pt and p.sha256 = p_sha and p.erased_at is null;
  if ex is not null then
    perform app.restore_claims(was);
    return ex;
  end if;

  insert into photos (point_id, storage_path, sha256, width, height,
                      consent_id, quality_gate)
  values (pt, p_path, p_sha, p_width, p_height, con, p_gate)
  returning id into new_id;

  perform app.restore_claims(was);
  return new_id;
end $$;

grant execute on function app.garage_store_photo(text, text, int, int, jsonb) to app_tenant;

-- ─────────────────────────────────────────────────────────────
-- 6. Телефон: мягкий переход после третьей генерации (Г-9)
-- ─────────────────────────────────────────────────────────────
-- Не регистрация и не вход. Телефон появляется ПОСЛЕ трёх примерок, поднимает
-- потолок до пятнадцати и заводит точке обращение — клиент получает
-- продолжение, точка получает лид. Одно действие, обе стороны в плюсе.
create or replace function app.garage_leave_phone(p_phone text)
returns table (cap integer, client_id uuid)
language plpgsql security definer set search_path = public, app as $$
declare
  sid   text := app.current_session_id();
  pt    uuid := app.current_point_id();
  norm  text;
  cl    uuid;
  was   text;
begin
  if sid is null or pt is null then
    raise exception 'доступно только по ссылке точки' using errcode = 'insufficient_privilege';
  end if;

  norm := app.normalize_phone(p_phone);
  if norm is null then
    raise exception 'телефон не разобран' using errcode = 'check_violation';
  end if;

  was := app.act_as_point(pt);

  select c.id into cl from clients c where c.point_id = pt and c.phone = norm limit 1;
  if cl is null then
    insert into clients (point_id, name, phone) values (pt, 'Из гаража', norm)
    returning id into cl;
  end if;

  insert into garage_sessions (session_id, point_id, phone, phone_at, client_id)
  values (sid, pt, norm, now(), cl)
  on conflict (session_id) do update
    set phone = excluded.phone, phone_at = now(), client_id = excluded.client_id;

  perform app.restore_claims(was);
  return query select 15, cl;
end $$;

grant execute on function app.garage_leave_phone(text) to app_tenant;

comment on function app.garage_tryon(uuid, uuid) is
  'Единственная дверь примерки из гаража. Потолок §4.10, полезная нагрузка собирается базой.';
