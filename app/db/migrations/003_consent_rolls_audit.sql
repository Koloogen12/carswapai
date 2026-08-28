-- CarSwap AI · миграция 003 · согласие, рулоны, аудит
--
-- Три сущности, которых требуют макеты и которых не было в схеме.
-- Взяты именно они, потому что каждая стоит на пути демо-сценария
-- (фаза 2 → 3 → 4), а остальное из заходов 2–4 демо не нужно.

-- ─────────────────────────────────────────────────────────────
-- 1. Согласие на обработку
-- ─────────────────────────────────────────────────────────────
-- §13: согласие собирается в гараже ДО загрузки фото. Отказ — работает
-- сценарий по марке и модели.
--
-- Выражено связью, а не полем: фото физически не существует без строки
-- согласия. Это заставляет продукт иметь ответ на вопрос «на каком основании
-- у вас лежит фото чужой машины с читаемым номером» для каждого файла,
-- а не для тех, где галочку не забыли поставить.

create type consent_kind as enum ('photo_processing','public_offer','marketing');

create table consents (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  client_id         uuid,
  session_id        text,                        -- аноним в гараже до контакта
  kind              consent_kind not null,
  document_version  text not null,               -- какую редакцию текста видели
  granted           boolean not null,
  granted_at        timestamptz not null default now(),
  ip                inet,
  user_agent        text,
  foreign key (client_id, point_id) references clients (id, point_id),
  -- согласие привязано либо к клиенту, либо к анонимной сессии, но к чему-то
  constraint consent_subject check (client_id is not null or session_id is not null)
);
create index consents_client on consents (point_id, client_id, kind);

alter table consents enable row level security;
alter table consents force row level security;
create policy consents_tenant on consents
  using (app.point_visible(point_id)) with check (app.point_visible(point_id));

-- Согласие иммутабельно: отзыв — новая строка с granted = false,
-- а не правка старой. Иначе в споре нечего показать.
create trigger consents_immutable before update or delete on consents
  for each row execute function app.forbid_mutation();

alter table photos add column consent_id uuid references consents(id);

create or replace function app.photo_requires_consent() returns trigger
  language plpgsql as $$
declare ok boolean;
begin
  if new.consent_id is null then
    raise exception 'Фото автомобиля не сохраняется без записанного согласия (§13)'
      using errcode = 'restrict_violation';
  end if;
  select c.granted and c.kind = 'photo_processing' and c.point_id = new.point_id
    into ok from consents c where c.id = new.consent_id;
  if not coalesce(ok, false) then
    raise exception 'Согласие недействительно: не то основание, отозвано или чужая точка'
      using errcode = 'restrict_violation';
  end if;
  return new;
end $$;

create trigger photos_consent_required before insert on photos
  for each row execute function app.photo_requires_consent();

-- ─────────────────────────────────────────────────────────────
-- 2. Рулоны
-- ─────────────────────────────────────────────────────────────
-- МС-3 и краевой случай №4: мастер берёт рулон другой партии или похожий
-- артикул — оклеена не та плёнка, цикл переклейки 50–150 тыс. ₽ и неделя
-- занятого поста. Дороже, чем год подписки точки.

create table film_rolls (
  id                uuid primary key default gen_random_uuid(),
  point_id          uuid not null references points(id),
  catalog_item_id   uuid not null references catalog_items(id),
  batch_number      text not null,
  barcode           text not null,
  meters_initial    numeric(7,2) not null check (meters_initial > 0),
  meters_left       numeric(7,2) not null check (meters_left >= 0),
  received_at       timestamptz not null default now(),
  depleted_at       timestamptz,
  unique (point_id, barcode),
  unique (id, point_id),
  check (meters_left <= meters_initial)
);

alter table film_rolls enable row level security;
alter table film_rolls force row level security;
create policy film_rolls_tenant on film_rolls
  using (app.point_visible(point_id)) with check (app.point_visible(point_id));

alter table orders add column verified_roll_id uuid;
alter table orders add column verified_by uuid references users(id);
alter table orders add constraint orders_roll_fk
  foreign key (verified_roll_id, point_id) references film_rolls (id, point_id);

-- Наряд не переводится в работу, пока артикул рулона не сошёлся с артикулом
-- подтверждённой конфигурации. Проверка здесь, а не на экране сканера:
-- на экране её можно обойти, в базе — нет.
create or replace function app.enforce_roll_match() returns trigger
  language plpgsql as $$
declare
  roll_item uuid;
  matched   boolean;
begin
  if new.status is distinct from 'in_work' then
    return new;
  end if;

  if new.verified_roll_id is null then
    raise exception 'Наряд % не переводится в работу без сверки рулона (МС-3)', new.number
      using errcode = 'restrict_violation';
  end if;

  select r.catalog_item_id into roll_item from film_rolls r where r.id = new.verified_roll_id;

  select exists (
    select 1
      from confirmations cf
      join configuration_items ci on ci.configuration_id = cf.configuration_id
      join point_prices pp on pp.id = ci.point_price_id
     where cf.id = new.confirmation_id
       and pp.catalog_item_id = roll_item
  ) into matched;

  if not matched then
    raise exception 'Артикул рулона не совпадает с подтверждённым клиентом выбором — старт оклейки заблокирован (МС-3)'
      using errcode = 'restrict_violation';
  end if;

  new.batch_verified_at := coalesce(new.batch_verified_at, now());
  new.batch_number := coalesce(new.batch_number,
                               (select batch_number from film_rolls where id = new.verified_roll_id));
  return new;
end $$;

create trigger orders_roll_match before insert or update on orders
  for each row execute function app.enforce_roll_match();

-- ─────────────────────────────────────────────────────────────
-- 3. Аудит-лог
-- ─────────────────────────────────────────────────────────────
-- Спутник иммутабельности: раз подтверждения и конфигурации не правятся,
-- должно быть видно, кто и что пытался сделать. Плюс это ответ на С-3 —
-- поддержка разбирается внутри продукта, а не по логам сервера.

create table audit_log (
  id          bigserial primary key,
  point_id    uuid references points(id),
  actor_id    uuid references users(id),
  actor_role  text,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  detail      jsonb not null default '{}'::jsonb,
  at          timestamptz not null default now()
);
create index audit_log_point on audit_log (point_id, at desc);
create index audit_log_entity on audit_log (entity, entity_id);

alter table audit_log enable row level security;
alter table audit_log force row level security;
create policy audit_log_tenant on audit_log
  using (app.point_visible(point_id)) with check (app.point_visible(point_id));

create trigger audit_log_append_only before update or delete on audit_log
  for each row execute function app.forbid_mutation();

-- ─────────────────────────────────────────────────────────────
-- 4. Услуги в каталоге
-- ─────────────────────────────────────────────────────────────
-- Экран 37 «машина уже оклеена, снятие в расчёт» и краевой случай №65:
-- снятие старой плёнки — платная позиция с метражом, а не примечание.
alter type item_category add value if not exists 'service';
