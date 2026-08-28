-- CarSwap AI · миграция 001 · ядро схемы
--
-- Принцип: инварианты продукта выражены структурой БД, а не кодом приложения.
-- Хартия СТО §3: «технически не должно существовать пути» — значит проверка в БД,
-- а не в UI и не в сервисном слое.
--
-- Что здесь принудительно невозможно:
--   О-2  отправить карточку без трёх световых условий и без строки честности
--   О-2  создать подтверждение клиента без показанной оговорки
--   О-3  собрать примерку на артикуле, которого нет в прайсе ЭТОЙ точки
--   О-4  перезаписать подтверждённую конфигурацию
--   §13  увидеть данные чужой точки

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────────
-- 0. Контекст арендатора для RLS
-- ─────────────────────────────────────────────────────────────
-- Читаем из JWT-претензий. Слой авторизации намеренно тонкий: если Supabase Auth
-- когда-нибудь заменится, меняются эти три функции, а не сотня политик.

create schema if not exists app;

create or replace function app.claims() returns jsonb
  language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function app.current_point_id() returns uuid
  language sql stable as $$ select nullif(app.claims()->>'point_id','')::uuid $$;

create or replace function app.current_network_id() returns uuid
  language sql stable as $$ select nullif(app.claims()->>'network_id','')::uuid $$;

create or replace function app.current_role_name() returns text
  language sql stable as $$ select coalesce(app.claims()->>'app_role','anon') $$;

-- ─────────────────────────────────────────────────────────────
-- 1. Арендаторы и люди
-- ─────────────────────────────────────────────────────────────

create type user_role as enum ('manager','master','owner','network_admin');
create type point_status as enum ('active','suspended','readonly','archived');

create table networks (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  brand           jsonb not null default '{}'::jsonb,      -- лого, цвета
  exclusive       boolean not null default true,           -- С-1: точка не подключится мимо сети
  join_code       text unique not null,
  price_deviation_allowed_pct numeric(5,2) not null default 0,  -- С-4
  monthly_cap_kopecks integer,                             -- потолок по умолчанию для точек
  created_at      timestamptz not null default now()
);

create table points (
  id              uuid primary key default gen_random_uuid(),
  network_id      uuid not null references networks(id),
  name            text not null,
  address         text,
  timezone        text not null default 'Europe/Moscow',
  brand_override  jsonb,
  public_slug     text unique not null,                    -- Г-8: ссылка гаража
  status          point_status not null default 'active',
  soft_cap_kopecks integer not null default 90000,         -- 900 ₽, см. §4.9
  hard_cap_kopecks integer not null default 180000,        -- 1 800 ₽
  created_at      timestamptz not null default now(),
  -- составной ключ для арендаторо-безопасных внешних ключей ниже
  unique (id, network_id)
);

create table users (
  id              uuid primary key default gen_random_uuid(),
  auth_id         uuid unique,                             -- ссылка на контур авторизации
  point_id        uuid references points(id),
  network_id      uuid not null references networks(id),
  role            user_role not null,
  name            text not null,
  phone           text,
  active          boolean not null default true,           -- отзыв доступа = один клик владельца
  created_at      timestamptz not null default now(),
  -- мастер и менеджер обязаны принадлежать точке, админ сети — нет
  constraint role_scope check (
    (role in ('manager','master','owner') and point_id is not null)
    or (role = 'network_admin' and point_id is null)
  ),
  unique (id, point_id)
);

-- ─────────────────────────────────────────────────────────────
-- 2. Автомобили, каталог, прайс, метраж
-- ─────────────────────────────────────────────────────────────

create table vehicle_models (
  id              uuid primary key default gen_random_uuid(),
  make            text not null,
  model           text not null,
  generation      text,
  body_type       text not null,                 -- sedan|suv|hatch|wagon|coupe|pickup|van
  year_from       smallint,
  year_to         smallint,
  aliases         text[] not null default '{}',  -- распознавание из текста обращения (М-1)
  unique (make, model, generation)
);
create index vehicle_models_search on vehicle_models using gin ((make || ' ' || model) gin_trgm_ops);

-- Зоны оклейки. Нужны и цветному винилу, и прозрачной PPF: и то и другое
-- продаётся зонами, а не «машина целиком». PRD М-9, краевой случай №8.
create table zones (
  code            text primary key,              -- full_body|front_full|hood|mirrors|...
  name            text not null,
  sort_order      smallint not null default 0
);

create type item_category as enum ('film','ppf','wheel','interior','trim','tint','starlight');
create type item_finish   as enum ('gloss','satin','matte','chrome','carbon','metallic','clear');
-- Как артикул ведёт себя при смене освещения. Определяет, можно ли получить
-- три световых условия сдвигом тон-кривой (0 ₽) или нужны три отдельных прохода.
create type light_response as enum ('solid','metallic','satin','chameleon');
create type render_class   as enum ('A','B');    -- A — детерминированный, B — генеративный

create table catalog_items (
  id              uuid primary key default gen_random_uuid(),
  category        item_category not null,
  brand           text not null,
  sku             text not null,
  name            text not null,
  finish          item_finish not null,
  light_response  light_response not null default 'solid',
  default_class   render_class not null default 'B',
  swatch_url      text,
  reference_urls  text[] not null default '{}',
  lab_l           numeric(6,3),                  -- измеренный цвет свотча, CIELAB
  lab_a           numeric(6,3),
  lab_b           numeric(6,3),
  attrs           jsonb not null default '{}'::jsonb,
  active          boolean not null default true,
  unique (brand, sku)
);

-- Артикул с нелинейным откликом на свет нельзя показывать сдвигом экспозиции:
-- получатся три яркости одного цвета, а на замере клиент увидит другое.
-- Это ровно тот случай, ради которого механика честности и существует.
alter table catalog_items add constraint metallic_needs_measured_lab
  check (light_response = 'solid' or lab_l is not null);

create table network_prices (
  id                uuid primary key default gen_random_uuid(),
  network_id        uuid not null references networks(id),
  catalog_item_id   uuid not null references catalog_items(id),
  zone_code         text not null references zones(code),
  price_kopecks     integer not null check (price_kopecks >= 0),
  unique (network_id, catalog_item_id, zone_code)
);

create table point_prices (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  catalog_item_id   uuid not null references catalog_items(id),
  zone_code         text not null references zones(code),
  price_kopecks     integer not null check (price_kopecks >= 0),
  in_stock          boolean not null default true,
  lead_time_days    smallint,
  updated_at        timestamptz not null default now(),
  unique (point_id, catalog_item_id, zone_code),
  unique (id, point_id)                          -- для арендаторо-безопасного FK
);

-- Метраж плёнки по кузову и зоне. Открытых данных не существует, справочник
-- наполняем сами; confidence отличает замеренное от прикинутого (М-9, краевой 35).
create table vehicle_zone_metrage (
  vehicle_model_id  uuid not null references vehicle_models(id),
  zone_code         text not null references zones(code),
  running_meters    numeric(5,2) not null check (running_meters > 0),
  film_width_cm     smallint not null default 152,
  confidence        text not null default 'estimated' check (confidence in ('measured','estimated')),
  primary key (vehicle_model_id, zone_code)
);

create table point_stock (
  point_id          uuid not null references points(id),
  catalog_item_id   uuid not null references catalog_items(id),
  meters_available  numeric(7,2) not null default 0,
  batch_number      text,                        -- краевой 4: партия попадает в карточку
  updated_at        timestamptz not null default now(),
  primary key (point_id, catalog_item_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. Каналы, обращения, диалоги
-- ─────────────────────────────────────────────────────────────

create type channel_kind as enum ('whatsapp','telegram','max','avito','web');
create type msg_direction as enum ('in','out');
create type delivery_status as enum ('queued','sent','delivered','failed');

create table channels (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  kind              channel_kind not null,
  provider          text not null,               -- wazzup|radist|i2crm|avito_direct|internal
  external_id       text not null,
  credentials_ref   text,                        -- ключ в секретнице, не сам секрет
  can_send_images   boolean not null default true,   -- О-5: честные возможности канала
  can_initiate      boolean not null default false,  -- О-7: писать первым можно не везде
  status            text not null default 'connected',
  last_error        text,
  created_at        timestamptz not null default now(),
  unique (point_id, kind, external_id),
  unique (id, point_id)
);

create table clients (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  name              text,
  phone             text,
  vehicle           jsonb not null default '{}'::jsonb,   -- make, model, year, plate
  vehicle_model_id  uuid references vehicle_models(id),
  source            text,
  created_at        timestamptz not null default now(),
  unique (id, point_id)
);
-- М-10: один клиент — один тред поверх каналов. Склейка идёт по телефону.
create unique index clients_point_phone on clients (point_id, phone) where phone is not null;

create table threads (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  client_id         uuid not null,
  status            text not null default 'open',
  assigned_to       uuid references users(id),
  last_message_at   timestamptz,
  created_at        timestamptz not null default now(),
  foreign key (client_id, point_id) references clients (id, point_id),
  unique (id, point_id)
);

-- Сырой приём вебхуков. Шлюзы доставляют повторно и всплесками; дедупликация
-- обязана стоять до всякой бизнес-логики, иначе один клиент получит две карточки.
create table webhook_events (
  id                uuid primary key default gen_random_uuid(),
  provider          text not null,
  external_event_id text not null,
  payload           jsonb not null,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  unique (provider, external_event_id)
);

create table messages (
  id                  uuid primary key default gen_random_uuid(),
  point_id            uuid not null references points(id),
  thread_id           uuid not null,
  channel_id          uuid not null,
  direction           msg_direction not null,
  body                text,
  attachments         jsonb not null default '[]'::jsonb,
  external_message_id text,
  outbound_card_id    uuid,                      -- заполняется ниже внешним ключом
  delivery            delivery_status not null default 'queued',
  delivery_error      text,
  sent_at             timestamptz not null default now(),
  foreign key (thread_id, point_id) references threads (id, point_id),
  foreign key (channel_id, point_id) references channels (id, point_id)
);
-- Идемпотентность входящих: повтор доставки не создаёт второе сообщение.
create unique index messages_channel_external on messages (channel_id, external_message_id)
  where external_message_id is not null;
create index messages_thread on messages (thread_id, sent_at desc);

-- ─────────────────────────────────────────────────────────────
-- 4. Фото и маски
-- ─────────────────────────────────────────────────────────────

create table photos (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  client_id         uuid,
  storage_path      text not null,
  sha256            text not null,               -- ключ дедупликации и кэша масок
  width             integer not null,
  height            integer not null,
  quality_gate      jsonb not null default '{}'::jsonb,  -- §4.3 стадия 1
  vehicle_model_id  uuid references vehicle_models(id),
  -- §13: срок хранения задаётся при записи, а не «когда-нибудь настроим»
  retain_until      timestamptz not null default now() + interval '12 months',
  created_at        timestamptz not null default now(),
  foreign key (client_id, point_id) references clients (id, point_id),
  unique (id, point_id)
);
create index photos_retention on photos (retain_until);

-- Маски считаются один раз на фото и переиспользуются всеми категориями.
-- Это главная экономия и по времени, и по деньгам (§4.3).
create table photo_masks (
  photo_id          uuid not null references photos(id) on delete cascade,
  concept           text not null,               -- body|glass_side|wheel_fl|plate|...
  storage_path      text not null,
  area_px           integer not null,
  model_version     text not null,
  created_at        timestamptz not null default now(),
  primary key (photo_id, concept)
);

-- ─────────────────────────────────────────────────────────────
-- 5. Примерки: событийная и иммутабельная модель
-- ─────────────────────────────────────────────────────────────

create type render_variant as enum ('day','overcast','parking');   -- О-2, порядок фиксирован

create table configurations (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  thread_id         uuid,
  photo_id          uuid,                        -- null = типовой кузов (К-3)
  vehicle_model_id  uuid references vehicle_models(id),
  parent_id         uuid references configurations(id),   -- домер (М-6)
  origin            text not null default 'manager' check (origin in ('manager','garage')),
  created_by        uuid references users(id),
  session_id        text,                        -- анонимная сессия гаража
  created_at        timestamptz not null default now(),
  foreign key (thread_id, point_id) references threads (id, point_id),
  foreign key (photo_id, point_id)  references photos  (id, point_id),
  unique (id, point_id)
);

-- О-3, выраженное структурой: позиция примерки физически не существует без
-- строки прайса ЭТОЙ точки. Составной внешний ключ не даёт подставить
-- прайс соседней точки — это невозможно, а не «проверяется в сервисе».
create table configuration_items (
  id                uuid primary key default gen_random_uuid(),
  configuration_id  uuid not null,
  point_id          uuid not null,
  point_price_id    uuid not null,
  category          item_category not null,
  params            jsonb not null default '{}'::jsonb,   -- VLT тонировки, число волокон и т.п.
  price_kopecks     integer not null check (price_kopecks >= 0),  -- снимок цены на момент сборки
  meters_required   numeric(5,2),
  foreign key (configuration_id, point_id) references configurations (id, point_id),
  foreign key (point_price_id, point_id)   references point_prices   (id, point_id),
  unique (id, point_id)
);
create index configuration_items_config on configuration_items (configuration_id);

create table renders (
  id                    uuid primary key default gen_random_uuid(),
  configuration_item_id uuid not null,
  point_id              uuid not null references points(id),
  variant               render_variant not null,
  storage_path          text not null,
  pipeline              jsonb not null,          -- полный рецепт: маски, операции, версии
  render_class          render_class not null,
  model_used            text,                    -- null для класса A
  provider              text,
  cost_kopecks          integer not null default 0,
  qa_result             jsonb not null default '{}'::jsonb,
  qa_passed             boolean not null default false,
  created_at            timestamptz not null default now(),
  foreign key (configuration_item_id, point_id) references configuration_items (id, point_id),
  unique (configuration_item_id, variant)        -- три света, ровно по одному каждого
);

-- Библиотека типовых кузовов. Общая на систему, персональных данных не содержит
-- по построению: это модель авто, а не автомобиль клиента (§4.8, §13).
create table typical_renders (
  vehicle_model_id  uuid not null references vehicle_models(id),
  catalog_item_id   uuid not null references catalog_items(id),
  variant           render_variant not null,
  storage_path      text not null,
  pipeline          jsonb not null,
  created_at        timestamptz not null default now(),
  primary key (vehicle_model_id, catalog_item_id, variant)
);

-- Отправляемая карточка. Единственная дверь наружу: сообщение с изображениями
-- ссылается сюда, а вставка сюда проверяется триггером ниже.
create table outbound_cards (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  configuration_id  uuid not null,
  honesty_line      text not null check (length(btrim(honesty_line)) > 0),   -- О-2
  channel_kind      channel_kind not null,
  rendered_paths    text[] not null check (array_length(rendered_paths, 1) >= 3),
  created_at        timestamptz not null default now(),
  foreign key (configuration_id, point_id) references configurations (id, point_id),
  unique (id, point_id)
);

alter table messages
  add constraint messages_card_fk foreign key (outbound_card_id) references outbound_cards(id);

create table confirmations (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  configuration_id  uuid not null,
  outbound_card_id  uuid not null references outbound_cards(id),
  -- Не флаг, а условие существования: строка без показанной оговорки
  -- не может быть записана в принципе. Тумблера нет, потому что нет столбца,
  -- который можно выставить в false.
  honesty_shown     boolean not null default true check (honesty_shown),
  confirmed_at      timestamptz not null default now(),
  confirmed_via     text not null check (confirmed_via in ('link','chat','garage')),
  ip                inet,
  user_agent        text,
  foreign key (configuration_id, point_id) references configurations (id, point_id),
  unique (id, point_id)
);

-- ─────────────────────────────────────────────────────────────
-- 6. Учётный слой и деньги
-- ─────────────────────────────────────────────────────────────

create table orders (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  confirmation_id   uuid not null references confirmations(id),   -- У-4: только из подтверждённого
  number            text not null,
  status            text not null default 'created',
  batch_verified_at timestamptz,                 -- МС-3: сверка с рулоном
  batch_number      text,
  total_kopecks     integer not null,
  created_at        timestamptz not null default now(),
  unique (point_id, number)
);

create table invoices (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders(id),
  number            text not null,
  amount_kopecks    integer not null,
  status            text not null default 'draft',
  pdf_path          text
);

create table deals (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  client_id         uuid,
  confirmation_id   uuid references confirmations(id),
  amount_kopecks    integer not null,
  closed_at         timestamptz,
  -- В-3: атрибуция консервативная — «по примерке» только при наличии подтверждения
  attribution       text generated always as (
                      case when confirmation_id is not null then 'configurator'::text else 'other'::text end
                    ) stored,
  foreign key (client_id, point_id) references clients (id, point_id)
);

create table generation_usage (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  user_id           uuid references users(id),
  session_id        text,
  render_id         uuid references renders(id),
  render_class      render_class not null,
  category          item_category not null,
  model_used        text,
  provider          text,
  cost_kopecks      integer not null check (cost_kopecks >= 0),
  created_at        timestamptz not null default now()
);
create index generation_usage_point_month on generation_usage (point_id, created_at);

-- Потолок в рублях, а не в штуках. Себестоимость отправки разбегается
-- от ~0,7 ₽ (винил глянец→глянец, класс A) до ~26 ₽ (глянец→мат, класс B):
-- лимит, посчитанный в генерациях, маржу не защищает.
create table point_budgets (
  point_id          uuid not null references points(id),
  period_month      date not null,
  soft_limit_kopecks integer not null,
  hard_limit_kopecks integer not null,
  spent_kopecks     integer not null default 0,
  soft_notified_at  timestamptz,
  hard_stopped_at   timestamptz,
  released_by       uuid references users(id),   -- С-5: снимает только сеть
  released_at       timestamptz,
  primary key (point_id, period_month),
  check (hard_limit_kopecks >= soft_limit_kopecks)
);

create or replace function app.accrue_budget() returns trigger
  language plpgsql as $$
declare
  m date := date_trunc('month', new.created_at)::date;
begin
  insert into point_budgets (point_id, period_month, soft_limit_kopecks, hard_limit_kopecks, spent_kopecks)
  select new.point_id, m, p.soft_cap_kopecks, p.hard_cap_kopecks, new.cost_kopecks
    from points p where p.id = new.point_id
  on conflict (point_id, period_month)
    do update set spent_kopecks = point_budgets.spent_kopecks + excluded.spent_kopecks;
  return new;
end $$;

create trigger generation_usage_accrue after insert on generation_usage
  for each row execute function app.accrue_budget();

-- ─────────────────────────────────────────────────────────────
-- 7. Инварианты
-- ─────────────────────────────────────────────────────────────

-- О-4: подтверждённый выбор — доказательство в споре на выдаче ценой 50–150 тыс. ₽.
-- Изменение конфигурации = новая запись с parent_id. Правка на месте запрещена
-- на уровне БД, чтобы её нельзя было сделать ни через API, ни через админку.
create or replace function app.forbid_mutation() returns trigger
  language plpgsql as $$
begin
  raise exception 'Запись % иммутабельна: изменение = новая версия через parent_id', tg_table_name
    using errcode = 'restrict_violation';
end $$;

create trigger configurations_immutable       before update or delete on configurations
  for each row execute function app.forbid_mutation();
create trigger configuration_items_immutable  before update or delete on configuration_items
  for each row execute function app.forbid_mutation();
create trigger confirmations_immutable        before update or delete on confirmations
  for each row execute function app.forbid_mutation();
create trigger outbound_cards_immutable       before update or delete on outbound_cards
  for each row execute function app.forbid_mutation();
-- renders: правим только результат QA, всё остальное неизменно
create or replace function app.renders_qa_only() returns trigger
  language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Рендер нельзя удалить: на него ссылается подтверждение клиента'
      using errcode = 'restrict_violation';
  end if;
  if new.storage_path is distinct from old.storage_path
     or new.pipeline is distinct from old.pipeline
     or new.configuration_item_id is distinct from old.configuration_item_id
     or new.variant is distinct from old.variant then
    raise exception 'Изменять можно только результат QA-гейта'
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger renders_qa_only before update or delete on renders
  for each row execute function app.renders_qa_only();

-- О-2: карточка без трёх световых условий на каждой позиции — невалидный объект.
-- Проверка стоит на единственной двери наружу, поэтому обойти её нельзя
-- ни через сервисный слой, ни вставкой напрямую в базу.
create or replace function app.card_completeness() returns trigger
  language plpgsql as $$
declare
  incomplete integer;
  items      integer;
begin
  select count(*) into items
    from configuration_items ci where ci.configuration_id = new.configuration_id;
  if items = 0 then
    raise exception 'Карточка без позиций: артикул и цена обязательны (О-3)'
      using errcode = 'restrict_violation';
  end if;

  select count(*) into incomplete
    from configuration_items ci
    where ci.configuration_id = new.configuration_id
      and (select count(distinct r.variant) from renders r
            where r.configuration_item_id = ci.id and r.qa_passed) <> 3;

  if incomplete > 0 then
    raise exception
      'Отправка запрещена: % позиций не имеют всех трёх световых условий, прошедших QA (О-2)', incomplete
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;

create trigger outbound_cards_complete before insert on outbound_cards
  for each row execute function app.card_completeness();

-- Подтверждение может ссылаться только на ту конфигурацию, которая была отправлена.
create or replace function app.confirmation_matches_card() returns trigger
  language plpgsql as $$
begin
  if not exists (select 1 from outbound_cards c
                  where c.id = new.outbound_card_id
                    and c.configuration_id = new.configuration_id) then
    raise exception 'Подтверждение ссылается на карточку другой конфигурации'
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger confirmations_match before insert on confirmations
  for each row execute function app.confirmation_matches_card();

-- С-4: отклонение цены точки от сетевой — в границах, заданных сетью.
create or replace function app.enforce_price_corridor() returns trigger
  language plpgsql as $$
declare
  base   integer;
  pct    numeric;
begin
  select np.price_kopecks, n.price_deviation_allowed_pct into base, pct
    from points p
    join networks n on n.id = p.network_id
    join network_prices np on np.network_id = n.id
     and np.catalog_item_id = new.catalog_item_id
     and np.zone_code = new.zone_code
   where p.id = new.point_id;

  if base is not null and pct is not null and base > 0 then
    if abs(new.price_kopecks - base)::numeric / base * 100 > pct then
      raise exception 'Цена вне коридора сети: допустимо ±% %%, база % коп.', pct, base
        using errcode = 'restrict_violation';
    end if;
  end if;
  return new;
end $$;
create trigger point_prices_corridor before insert or update on point_prices
  for each row execute function app.enforce_price_corridor();

-- С-1: точка не подключается в сеть с exclusive = true иначе как по коду сети.
-- Проверка на уровне БД, а не формы регистрации.
create or replace function app.enforce_network_join() returns trigger
  language plpgsql as $$
begin
  if not exists (select 1 from networks n where n.id = new.network_id) then
    raise exception 'Точка обязана принадлежать сети (С-1)' using errcode = 'restrict_violation';
  end if;
  return new;
end $$;
create trigger points_network_required before insert on points
  for each row execute function app.enforce_network_join();

-- ─────────────────────────────────────────────────────────────
-- 8. RLS
-- ─────────────────────────────────────────────────────────────
-- Изоляция арендаторов структурой, а не фильтрами в запросах.
-- Режим только для чтения: при неоплате отключаются генерации, но история
-- и подтверждённые выборы остаются доступны бессрочно — иначе на выдаче
-- нечего предъявить, и точка платит за переклейку уже после расставания с нами.

do $$
declare t text;
begin
  foreach t in array array[
    'points','users','channels','clients','threads','messages','photos',
    'configurations','configuration_items','renders','outbound_cards','confirmations',
    'orders','invoices','deals','generation_usage','point_budgets',
    'point_prices','point_stock','photo_masks'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

create or replace function app.point_visible(p uuid) returns boolean
  language sql stable security definer set search_path = public, app as $$
  select case app.current_role_name()
    when 'network_admin' then exists (select 1 from points x
                                       where x.id = p and x.network_id = app.current_network_id())
    else p = app.current_point_id()
  end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'channels','clients','threads','messages','photos','configurations',
    'configuration_items','renders','outbound_cards','confirmations','orders','deals',
    'generation_usage','point_budgets','point_prices','point_stock'
  ] loop
    execute format(
      'create policy %I_tenant on %I using (app.point_visible(point_id)) '
      'with check (app.point_visible(point_id))', t, t);
  end loop;
end $$;

-- Условие развёрнуто вместо вызова app.point_visible(): функция читает points,
-- а политика на points, вызывающая её, замкнула бы саму себя.
create policy points_tenant on points
  using (
    id = app.current_point_id()
    or (app.current_role_name() = 'network_admin' and network_id = app.current_network_id())
  )
  with check (
    id = app.current_point_id()
    or (app.current_role_name() = 'network_admin' and network_id = app.current_network_id())
  );
create policy users_tenant on users
  using (network_id = app.current_network_id()) with check (network_id = app.current_network_id());
create policy photo_masks_tenant on photo_masks
  using (exists (select 1 from photos p where p.id = photo_id and app.point_visible(p.point_id)));
create policy invoices_tenant on invoices
  using (exists (select 1 from orders o where o.id = order_id and app.point_visible(o.point_id)));

-- Управляющая компания видит срез по точкам, но не переписки клиентов.
create policy messages_no_network_admin on messages as restrictive
  using (app.current_role_name() <> 'network_admin');

-- Мастер у поста: только чтение, только своей точки. Пишет он через
-- подписанную ссылку и отдельную функцию, а не прямым доступом к таблицам.
create policy master_read_only on configurations as restrictive
  for all using (true)
  with check (app.current_role_name() <> 'master');
