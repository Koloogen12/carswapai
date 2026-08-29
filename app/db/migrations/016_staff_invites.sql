-- CarSwap AI · миграция 016 · сотрудники точки и вход по приглашению
--
-- ЧТО ЗАКРЫВАЕТ. Экран сотрудников был картинкой: «Добавить сотрудника»,
-- «Отправить приглашение» и «Отозвать» — просто текст. Владелец точки не мог
-- завести менеджера, то есть второй шаг запуска у клиента не работал вовсе.
--
-- Но дописать кнопки мало. Под ними в базе лежали две дыры:
--
--   1. Политика users_tenant из 001 пускает в таблицу сотрудников ЛЮБОГО
--      человека сети: `network_id = app.current_network_id()` без роли и без
--      точки. То есть менеджер мог завести себе владельца, отозвать доступ
--      владельцу и добавить человека в чужую точку той же сети. Проверка
--      «только владелец» в коде приложения от этого не спасает: политика — то
--      единственное место, которое нельзя обойти запросом мимо приложения.
--
--   2. Погасить приглашение мог только тот, у кого УЖЕ есть претензия этой
--      точки. Но по ссылке приходит человек без сессии — у него претензий нет
--      по построению. app.consume_invite из 004 для приглашения сотрудника
--      просто не находил строку: RLS с force действует и на security definer,
--      потому что carswap_owner создан nobypassrls. Приглашения сотруднику
--      физически не могло существовать.
--
-- ЧТО ЗДЕСЬ ВАЖНО И ПОЧЕМУ ИМЕННО ТАК:
--
--   · список сотрудников МЕНЯЕТ только владелец и только у себя. Это
--     ограничительная политика, а не проверка в коде: спрятанная кнопка
--     ничего не закрывает, а запрос мимо приложения проверку в коде не
--     видит;
--   · чтение оставлено как было — по сети. Сужать его здесь значит трогать
--     чужие экраны (журнал действий, расход по людям) ради задачи, которая
--     про запись; отдельный разговор и отдельная миграция;
--   · приглашение раскрывается по СВОЕМУ коду и только по нему. Это тот же
--     приём, что и у ссылки клиента в 006: неперебираемый ключ на входе →
--     узкая претензия → политика ровно на одну строку. Держатель кода не
--     узнаёт ничего сверх того, что у него уже есть;
--   · приглашение сотруднику зовёт человека, который УЖЕ заведён в точке, и
--     составной внешний ключ (user_id, point_id) не даёт позвать чужого;
--   · одноразовость и срок не переписаны заново: гасит по-прежнему
--     app.consume_invite из 004. Точка и сотрудник заводятся в той же
--     транзакции, поэтому «второй раз по той же ссылке» не создаёт ничего.

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. Список сотрудников меняет только владелец и только у себя
-- ─────────────────────────────────────────────────────────────

-- Отдельной функцией, а не выражением в трёх политиках: одно правило в одном
-- месте. Разъехавшиеся копии условия — это дыра, которую никто не заметит.
create or replace function app.staff_writable(p_point uuid, p_network uuid)
returns boolean language sql stable as $$
  select case app.current_role_name()
    -- Управляющая компания заводит владельцев точек своей сети.
    when 'network_admin' then p_network = app.current_network_id()
    -- Владелец точки — только свою точку и только внутри своей сети.
    when 'owner'         then p_point = app.current_point_id()
                              and p_network = app.current_network_id()
    -- Менеджер и мастер список сотрудников не меняют. Никак.
    else false
  end
$$;

-- Политики отдельно на каждую команду, а не одна `for all`: `using` у `for
-- all` действует и на select, и тогда журнал действий и расход по людям
-- перестанут показывать админа сети (у него нет точки). Задача про запись —
-- ограничиваем запись.
create policy users_insert_owner on users as restrictive for insert
  with check (app.staff_writable(point_id, network_id));

create policy users_update_owner on users as restrictive for update
  using (app.staff_writable(point_id, network_id))
  with check (app.staff_writable(point_id, network_id));

create policy users_delete_owner on users as restrictive for delete
  using (app.staff_writable(point_id, network_id));

-- ─────────────────────────────────────────────────────────────
-- 2. Приглашение сотруднику знает, кого зовёт
-- ─────────────────────────────────────────────────────────────

-- Человек заводится сразу, при нажатии «Добавить сотрудника»: владелец должен
-- видеть его в списке и иметь возможность отозвать доступ ещё до того, как тот
-- перешёл по ссылке. Приглашение — это его первый вход без пароля, а не
-- заявка на создание.
alter table invites add column user_id uuid;

-- Составной ключ, а не просто references users(id): он не даёт позвать в свою
-- точку человека из чужой. Для приглашения точке (point_id и user_id пустые)
-- ключ не проверяется — так и задумано, там человека ещё нет.
alter table invites add constraint invites_user_in_point
  foreign key (user_id, point_id) references users (id, point_id);

-- ─────────────────────────────────────────────────────────────
-- 3. Приглашение раскрывается по своему коду
-- ─────────────────────────────────────────────────────────────
--
-- Политика видит РОВНО ОДНУ строку — ту, чей неперебираемый код предъявлен в
-- претензии. Претензию ставят только функции ниже и только из кода, который им
-- передал вызывающий: держатель ссылки не получает ничего, чего у него ещё
-- нет.
create policy invites_by_code on invites
  using (code = nullif(app.claims()->>'invite_code',''))
  with check (code = nullif(app.claims()->>'invite_code',''));

-- ─────────────────────────────────────────────────────────────
-- 4. Слаг публичной ссылки новой точки
-- ─────────────────────────────────────────────────────────────
--
-- Г-8: слаг это адрес гаража-примерочной, его читают люди. Поэтому не
-- случайные буквы, а название точки латиницей.
--
-- ПОЧЕМУ ОБЕ РЕГИСТРА РАСПИСАНЫ РУКАМИ. Соблазн был привести название к
-- нижнему регистру и разбирать только строчные. Но lower() зависит от локали
-- кластера, а стенд и официальный образ Postgres поднимаются с locale=C: там
-- lower('Пост') возвращает «Пост», прописные кириллические буквы остаются, и
-- регулярное выражение вычищает их вместе с пробелами. Слаг «Пост на
-- Кутузовском» превращался в ost-na-utuzovskom — молча, без единой ошибки.
-- Поэтому кириллица разбирается в обоих регистрах, а lower() применяется
-- ПОСЛЕ перевода, когда в строке осталась только латиница.
--
-- Длины наборов translate обязаны совпадать: лишние буквы в первом наборе не
-- игнорируются, а сдвигают соответствие. Мягкий и твёрдый знаки поэтому не
-- перечислены — их и так снимает регулярное выражение.
create or replace function app.slugify(p text) returns text
language sql immutable as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(
    translate(
      replace(replace(replace(replace(replace(replace(replace(replace(replace(
      replace(replace(replace(replace(replace(replace(replace(replace(replace(
        coalesce(p, ''),
        'ж','zh'),'Ж','Zh'),'ч','ch'),'Ч','Ch'),'ш','sh'),'Ш','Sh'),
        'щ','sch'),'Щ','Sch'),'ю','yu'),'Ю','Yu'),'я','ya'),'Я','Ya'),
        'ё','e'),'Ё','E'),'э','e'),'Э','E'),'ц','ts'),'Ц','Ts'),
      'абвгдезийклмнопрстуфхыАБВГДЕЗИЙКЛМНОПРСТУФХЫ',
      'abvgdezijklmnoprstufhyABVGDEZIJKLMNOPRSTUFHY')),
    '[^a-z0-9]+', '-', 'g')), ''), 'tochka')
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Что за приглашение — до того, как по нему войдут
-- ─────────────────────────────────────────────────────────────
--
-- Экран /join показывает человеку, куда его зовут, ещё до нажатия кнопки.
-- Отдаёт ровно то, что и так написано в ссылке, которую ему прислали.
create or replace function app.invite_preview(p_code text)
returns table (kind text, invite_role text, point_name text, network_name text,
               person_name text, expires_at timestamptz, state text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare inv invites; prev text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('invite_code', p_code)::text, true);
  select * into inv from invites where code = p_code;
  if inv.id is null then
    perform set_config('request.jwt.claims', prev, true);
    return;                       -- ноль строк: ссылка не ведёт никуда
  end if;

  -- Дальше читаем точку и человека — под претензией той точки, куда зовут.
  perform set_config('request.jwt.claims', jsonb_build_object(
    'point_id', inv.point_id, 'network_id', inv.network_id,
    'app_role', 'owner')::text, true);

  return query
  select case when inv.point_id is null then 'point' else 'staff' end,
         inv.role::text,
         (select p.name from points p where p.id = inv.point_id),
         (select n.name from networks n where n.id = inv.network_id),
         (select u.name from users u where u.id = inv.user_id),
         inv.expires_at,
         case when inv.used_at is not null then 'used'
              when inv.expires_at < now() then 'expired'
              else 'ok' end;

  -- Претензия ставится транзакционно и снимается концом запроса, но функцию
  -- могут позвать и изнутри чужой транзакции: тогда вызывающий доработал бы
  -- её с претензией приглашения вместо своей. Возвращаем как было.
  perform set_config('request.jwt.claims', prev, true);
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Вход сотрудника по ссылке
-- ─────────────────────────────────────────────────────────────
--
-- ПОЧЕМУ БЕЗ КОДА ИЗ SMS. На экране написано: «Мастеру достаточно QR у поста:
-- откроет камерой, пароль не нужен». Секрет здесь — сама ссылка, и ровно
-- поэтому 004 требует от неё одноразовости и срока: ссылка, живущая вечно и
-- работающая дважды, — это доступ, который невозможно отозвать.
create or replace function app.redeem_staff_invite(p_code text)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare inv invites; sid uuid;
        prev text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('invite_code', p_code)::text, true);

  select * into inv from invites where code = p_code for update;
  -- Приглашение точке сюда не годится: там человека ещё нет, там другой путь.
  if inv.id is null or inv.user_id is null then
    perform set_config('request.jwt.claims', prev, true);
    return null;
  end if;

  perform set_config('request.jwt.claims', jsonb_build_object(
    'point_id', inv.point_id, 'network_id', inv.network_id,
    'app_role', 'owner')::text, true);

  -- Гасим ДО выдачи сессии. Одноразовость и срок — инвариант 004, и он обязан
  -- отработать раньше, чем появится доступ, а не после.
  perform app.consume_invite(p_code, inv.user_id);

  -- Отозванный доступ не воскрешает и своя же ссылка: иначе «отозвать» было бы
  -- обещанием, а не действием.
  if not exists (select 1 from users u where u.id = inv.user_id and u.active) then
    raise exception 'Доступ отозван' using errcode = 'restrict_violation';
  end if;

  insert into sessions (user_id, expires_at)
  values (inv.user_id, now() + interval '30 days')
  returning id into sid;

  -- Возвращаем претензию вызывающего: см. пояснение в app.invite_preview.
  perform set_config('request.jwt.claims', prev, true);
  return sid;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 7. Регистрация точки по приглашению сети
-- ─────────────────────────────────────────────────────────────
--
-- С-1: точка заводится только по коду сети. Здесь это не форма, а функция:
-- без живого приглашения ни точки, ни владельца не появится.
--
-- Телефон подтверждается кодом из SMS — тем же механизмом, что и вход
-- (миграция 014). Своего пользователя у будущего владельца ещё нет, поэтому
-- app.redeem_auth_code не годится: он ищет сотрудника, а сотрудник и создаётся
-- этим вызовом. Проверка кода повторена здесь дословно — пять попыток, десять
-- минут, гашение при успехе.
create or replace function app.redeem_network_invite(
  p_code text, p_phone text, p_hash text,
  p_point_name text, p_address text, p_user_name text)
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  rec  auth_codes;
  inv  invites;
  new_point uuid;
  new_user  uuid;
  sid  uuid;
  norm text := app.normalize_phone(p_phone);
  base text;
  prev text := coalesce(current_setting('request.jwt.claims', true), '');
begin
  select * into rec from auth_codes
   where phone = norm and used_at is null and expires_at > now()
   order by created_at desc limit 1
   for update;
  if rec.id is null then
    return null;
  end if;
  if rec.attempts >= 5 then
    update auth_codes set used_at = now() where id = rec.id;
    return null;
  end if;
  if rec.code_hash is distinct from p_hash then
    update auth_codes set attempts = rec.attempts + 1 where id = rec.id;
    return null;
  end if;
  update auth_codes set used_at = now() where id = rec.id;

  perform set_config('request.jwt.claims',
    jsonb_build_object('invite_code', p_code)::text, true);
  select * into inv from invites where code = p_code for update;
  if inv.id is null or inv.network_id is null or inv.point_id is not null then
    raise exception 'Приглашение сети не найдено' using errcode = 'restrict_violation';
  end if;

  -- Идентификатор точки известен ДО вставки: политика points_tenant пускает
  -- только в свою точку, а «своя» берётся из претензии. Тот же порядок, что и
  -- у стенда: сначала претензия, потом вставка.
  new_point := gen_random_uuid();
  perform set_config('request.jwt.claims', jsonb_build_object(
    'point_id', new_point, 'network_id', inv.network_id,
    'app_role', 'owner')::text, true);

  base := app.slugify(p_point_name);
  for i in 1..20 loop
    begin
      insert into points (id, network_id, name, address, public_slug)
      values (new_point, inv.network_id, p_point_name, nullif(p_address, ''),
              case when i = 1 then base else base || '-' || i end);
      exit;
    exception when unique_violation then
      -- Занят слаг: у соседней точки такое же название. Свободного слага не
      -- подобрать запросом — чужие точки не видны политике, и это правильно.
      if i = 20 then raise; end if;
    end;
  end loop;

  insert into users (point_id, network_id, role, name, phone)
  values (new_point, inv.network_id, inv.role, p_user_name, '+' || norm)
  returning id into new_user;

  -- Гашение последним: если приглашение уже использовано или истекло, вся
  -- транзакция откатится и точки не останется.
  perform app.consume_invite(p_code, new_user);

  insert into sessions (user_id, expires_at)
  values (new_user, now() + interval '30 days')
  returning id into sid;

  perform set_config('request.jwt.claims', prev, true);
  return sid;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 8. Права
-- ─────────────────────────────────────────────────────────────
-- Явно, а не в надежде на alter default privileges: 005 действует от имени
-- того, кто его выполнил, и молчаливое расхождение владельцев уже один раз
-- оставляло таблицы без прав.
revoke all on function app.redeem_staff_invite(text) from public;
revoke all on function app.redeem_network_invite(text, text, text, text, text, text) from public;
revoke all on function app.invite_preview(text) from public;
grant execute on function app.staff_writable(uuid, uuid) to app_tenant;
grant execute on function app.slugify(text) to app_tenant;
grant execute on function app.invite_preview(text) to app_tenant;
grant execute on function app.redeem_staff_invite(text) to app_tenant;
grant execute on function app.redeem_network_invite(text, text, text, text, text, text) to app_tenant;

commit;
