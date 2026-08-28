-- CarSwap AI · миграция 004 · операционка точки, деньги, гарантии
--
-- Под заходы 1–4 аудита: вторая половина клиентского пути, операционка,
-- управление, замер и приёмка. Каждая таблица здесь появилась потому, что
-- её требует нарисованный экран, а не потому что «в CRM так принято».
--
-- Инварианты, выраженные структурой:
--   · согласованная доплата иммутабельна — это второе подтверждение клиента
--   · списание метража не уводит остаток рулона ниже нуля
--   · гарантийный талон существует только у закрытого наряда
--   · приглашение одноразовое и с сроком

-- ─────────────────────────────────────────────────────────────
-- 1. Посты, смены, расписание
-- ─────────────────────────────────────────────────────────────

create table bays (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid not null references points(id),
  name       text not null,
  active     boolean not null default true,
  unique (point_id, name),
  unique (id, point_id)
);

create type shift_kind as enum ('work','vacation','sick');

create table shifts (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid not null references points(id),
  user_id    uuid not null references users(id),
  kind       shift_kind not null default 'work',
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  check (ends_at > starts_at)
);
create index shifts_point_time on shifts (point_id, starts_at);

create type appointment_kind as enum ('measure','work','handover');
create type appointment_status as enum ('planned','arrived','done','moved','cancelled');

-- Заход 4 нашёл обрыв в середине пути: между «записался» и «в работе»
-- было пусто. Визит и есть тот недостающий узел.
create table appointments (
  id               uuid primary key default gen_random_uuid(),
  point_id         uuid not null references points(id),
  client_id        uuid,
  configuration_id uuid,
  bay_id           uuid,
  kind             appointment_kind not null,
  status           appointment_status not null default 'planned',
  starts_at        timestamptz not null,
  ends_at          timestamptz,
  moved_from       uuid references appointments(id),
  created_at       timestamptz not null default now(),
  foreign key (client_id, point_id)        references clients (id, point_id),
  foreign key (configuration_id, point_id) references configurations (id, point_id),
  foreign key (bay_id, point_id)           references bays (id, point_id),
  unique (id, point_id)
);
create index appointments_point_time on appointments (point_id, starts_at);

-- ─────────────────────────────────────────────────────────────
-- 2. Замер: обмер кузова и состояние ЛКП до работ
-- ─────────────────────────────────────────────────────────────
-- М-9: метраж по справочнику — оценка, замер даёт факт. Замер обновляет
-- справочник, и со временем оценки вытесняются измеренным.

create table measurements (
  id             uuid primary key default gen_random_uuid(),
  point_id       uuid not null references points(id),
  appointment_id uuid,
  vehicle_model_id uuid references vehicle_models(id),
  zone_code      text not null references zones(code),
  measured_meters numeric(5,2) not null check (measured_meters > 0),
  measured_by    uuid references users(id),
  at             timestamptz not null default now(),
  foreign key (appointment_id, point_id) references appointments (id, point_id)
);

create or replace function app.promote_measurement() returns trigger
  language plpgsql security definer set search_path = public, app as $$
begin
  if new.vehicle_model_id is null then return new; end if;
  insert into vehicle_zone_metrage (vehicle_model_id, zone_code, running_meters, confidence)
  values (new.vehicle_model_id, new.zone_code, new.measured_meters, 'measured')
  on conflict (vehicle_model_id, zone_code) do update
    set running_meters = excluded.running_meters, confidence = 'measured';
  return new;
end $$;
create trigger measurements_promote after insert on measurements
  for each row execute function app.promote_measurement();

-- Состояние лакокрасочного покрытия до работ. Снимается на замере и
-- закрывает спор «это вы поцарапали» отдельно от спора о цвете.
create table condition_photos (
  id             uuid primary key default gen_random_uuid(),
  point_id       uuid not null references points(id),
  appointment_id uuid,
  storage_path   text not null,
  zone_note      text,
  taken_at       timestamptz not null default now(),
  foreign key (appointment_id, point_id) references appointments (id, point_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. Доработки и доплата
-- ─────────────────────────────────────────────────────────────
-- Клиент согласует доплату так же, как согласовывал цвет: своим действием,
-- с датой. Поэтому согласованная доработка иммутабельна — это второе
-- подтверждение, и на выдаче оно предъявляется наравне с первым.

create type change_status as enum ('proposed','approved','declined');

create table change_orders (
  id             uuid primary key default gen_random_uuid(),
  point_id       uuid not null references points(id),
  order_id       uuid not null references orders(id),
  reason         text not null,
  amount_kopecks integer not null check (amount_kopecks <> 0),
  status         change_status not null default 'proposed',
  proposed_by    uuid references users(id),
  proposed_at    timestamptz not null default now(),
  client_acted_at timestamptz,
  check ((status = 'proposed') = (client_acted_at is null))
);

create or replace function app.freeze_settled_change() returns trigger
  language plpgsql as $$
begin
  if old.status <> 'proposed' then
    raise exception 'Решение клиента по доплате не переписывается: новая доработка — новая строка'
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger change_orders_freeze before update or delete on change_orders
  for each row execute function app.freeze_settled_change();

-- ─────────────────────────────────────────────────────────────
-- 4. Деньги: платежи и долг по наряду
-- ─────────────────────────────────────────────────────────────

create type payment_kind as enum ('prepay','final','refund');

create table payments (
  id             uuid primary key default gen_random_uuid(),
  point_id       uuid not null references points(id),
  invoice_id     uuid not null references invoices(id),
  kind           payment_kind not null,
  amount_kopecks integer not null check (amount_kopecks > 0),
  method         text not null default 'cash',
  external_id    text,
  paid_at        timestamptz not null default now(),
  unique (point_id, external_id)
);
create index payments_invoice on payments (invoice_id);

-- Долг по наряду — вычисляется, а не хранится. Отдельная колонка разошлась бы
-- с платежами на первом же возврате.
create or replace function app.invoice_balance(p_invoice uuid) returns integer
  language sql stable as $$
  select i.amount_kopecks - coalesce(sum(
           case when p.kind = 'refund' then -p.amount_kopecks else p.amount_kopecks end), 0)::integer
    from invoices i left join payments p on p.invoice_id = i.id
   where i.id = p_invoice
   group by i.amount_kopecks;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Склад: движения метража и заявки
-- ─────────────────────────────────────────────────────────────

create type move_reason as enum ('receipt','consume','writeoff','return');

create table stock_moves (
  id           uuid primary key default gen_random_uuid(),
  point_id     uuid not null references points(id),
  roll_id      uuid not null,
  order_id     uuid references orders(id),
  reason       move_reason not null,
  delta_meters numeric(6,2) not null check (delta_meters <> 0),
  at           timestamptz not null default now(),
  actor_id     uuid references users(id),
  foreign key (roll_id, point_id) references film_rolls (id, point_id)
);

-- Остаток рулона ведёт движение, а не ручная правка. Уйти в минус нельзя:
-- отрицательный остаток означает, что метраж списан дважды, и обнаружится
-- это на складе, а не в базе.
create or replace function app.apply_stock_move() returns trigger
  language plpgsql as $$
declare left_m numeric;
begin
  update film_rolls set meters_left = meters_left + new.delta_meters
   where id = new.roll_id returning meters_left into left_m;
  if left_m is null then
    raise exception 'Рулон % не найден', new.roll_id using errcode = 'restrict_violation';
  end if;
  if left_m < 0 then
    raise exception 'Списание уводит остаток рулона в минус (% м): метраж уже списан'
      , left_m using errcode = 'restrict_violation';
  end if;
  update film_rolls set depleted_at = now() where id = new.roll_id and left_m = 0;
  return new;
end $$;
create trigger stock_moves_apply after insert on stock_moves
  for each row execute function app.apply_stock_move();

create table material_requests (
  id              uuid primary key default gen_random_uuid(),
  point_id        uuid not null references points(id),
  catalog_item_id uuid not null references catalog_items(id),
  meters          numeric(6,2) not null check (meters > 0),
  status          text not null default 'open',
  created_by      uuid references users(id),
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 6. Гарантия
-- ─────────────────────────────────────────────────────────────

create table warranties (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid not null references points(id),
  order_id   uuid not null unique references orders(id),
  number     text not null,
  months     smallint not null default 12,
  issued_at  timestamptz not null default now(),
  pdf_path   text,
  unique (point_id, number)
);

-- Талон выдаётся по закрытой работе. Талон на незакрытый наряд — это обещание
-- по работе, которой не было.
create or replace function app.warranty_needs_done_order() returns trigger
  language plpgsql as $$
declare st text;
begin
  select status into st from orders where id = new.order_id;
  if st <> 'done' then
    raise exception 'Гарантийный талон выдаётся по закрытому наряду, текущий статус %', st
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger warranties_order_done before insert on warranties
  for each row execute function app.warranty_needs_done_order();

create table warranty_claims (
  id           uuid primary key default gen_random_uuid(),
  point_id     uuid not null references points(id),
  warranty_id  uuid not null references warranties(id),
  opened_at    timestamptz not null default now(),
  reason       text not null,
  status       text not null default 'open',
  resolution   text,
  closed_at    timestamptz
);

-- ─────────────────────────────────────────────────────────────
-- 7. Обвязка: приглашения, шаблоны, уведомления, подписка
-- ─────────────────────────────────────────────────────────────

create table invites (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid references points(id),
  network_id uuid references networks(id),
  code       text not null unique,
  role       user_role not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  used_by    uuid references users(id),
  created_at timestamptz not null default now(),
  check (point_id is not null or network_id is not null)
);

-- Приглашение одноразовое и срочное: ссылка, живущая вечно и работающая
-- дважды, — это доступ, который невозможно отозвать.
create or replace function app.consume_invite(p_code text, p_user uuid) returns uuid
  language plpgsql security definer set search_path = public, app as $$
declare inv invites;
begin
  select * into inv from invites where code = p_code for update;
  if inv is null then
    raise exception 'Приглашение не найдено' using errcode = 'restrict_violation';
  end if;
  if inv.used_at is not null then
    raise exception 'Приглашение уже использовано %', inv.used_at using errcode = 'restrict_violation';
  end if;
  if inv.expires_at < now() then
    raise exception 'Срок приглашения истёк %', inv.expires_at using errcode = 'restrict_violation';
  end if;
  update invites set used_at = now(), used_by = p_user where id = inv.id;
  return inv.id;
end $$;

create table reply_templates (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid not null references points(id),
  title      text not null,
  body       text not null,
  sort_order smallint not null default 0
);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  point_id   uuid not null references points(id),
  client_id  uuid,
  thread_id  uuid,
  kind       text not null,
  payload    jsonb not null default '{}'::jsonb,
  channel    channel_kind,
  send_after timestamptz not null default now(),
  sent_at    timestamptz,
  foreign key (client_id, point_id) references clients (id, point_id),
  foreign key (thread_id, point_id) references threads (id, point_id)
);
create index notifications_due on notifications (send_after) where sent_at is null;

create table subscriptions (
  id             uuid primary key default gen_random_uuid(),
  point_id       uuid not null references points(id),
  plan           text not null default 'point',
  price_kopecks  integer not null default 1000000,
  period_start   date not null,
  period_end     date not null,
  status         text not null default 'active',
  check (period_end > period_start)
);

-- ─────────────────────────────────────────────────────────────
-- 8. RLS для всего нового
-- ─────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'bays','shifts','appointments','measurements','condition_photos','change_orders',
    'payments','stock_moves','material_requests','warranties','warranty_claims',
    'reply_templates','notifications','subscriptions'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format(
      'create policy %I_tenant on %I using (app.point_visible(point_id)) '
      'with check (app.point_visible(point_id))', t, t);
  end loop;
end $$;

alter table invites enable row level security;
alter table invites force row level security;
create policy invites_tenant on invites
  using (point_id is null or app.point_visible(point_id));
