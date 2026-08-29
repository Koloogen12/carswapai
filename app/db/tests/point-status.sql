-- Статус точки и снятие стопа сетью (миграция 020).
--
-- До неё `points.status` был декоративным: отключённая за неуплату точка
-- продолжала собирать примерки и тратить генерации. Экран предлагал
-- «отключение точки», и оно ничего не отключало — сеть считала точку
-- остановленной, а расход шёл.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-dddd-0000-0000-000000000001'''
\set N2 '''11111111-dddd-0000-0000-000000000002'''
\set P '''aaaaaaaa-dddd-0000-0000-000000000001'''
\set U '''cccccccc-dddd-0000-0000-000000000001'''

insert into networks (id, name, join_code, price_deviation_allowed_pct) values
  (:N,'Сеть статуса','ST-2026', 10), (:N2,'Чужая сеть','ST2-2026', 10);
select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка','st-a');
insert into users (id, point_id, network_id, role, name) values (:U,:P,:N,'owner','Владелец');
insert into catalog_items (id, category, brand, sku, name, finish, light_response,
                           default_class, lab_l, lab_a, lab_b)
  values ('dddddddd-dddd-0000-0000-000000000001','film','KPMF','K1','Плёнка','gloss',
          'solid','B', 30.0, 5.0, -10.0);
-- Зона обязана существовать: прайс ссылается на справочник зон.
insert into zones (code, name) values ('full_body','Кузов целиком')
  on conflict do nothing;
insert into point_prices (id, point_id, catalog_item_id, zone_code, price_kopecks)
  values ('eeeeeeee-dddd-0000-0000-000000000001',:P,
          'dddddddd-dddd-0000-0000-000000000001','full_body', 100000);
insert into configurations (id, point_id, created_by)
  values ('77777777-dddd-0000-0000-000000000001',:P,:U);
insert into configuration_items (id, configuration_id, point_id, point_price_id,
                                 category, price_kopecks)
  values ('66666666-dddd-0000-0000-000000000001','77777777-dddd-0000-0000-000000000001',
          :P,'eeeeeeee-dddd-0000-0000-000000000001','film', 100000);

-- ── Активная точка работает ──────────────────────────────────
select expect_ok($$
  select app.enqueue_render('aaaaaaaa-dddd-0000-0000-000000000001',
    '66666666-dddd-0000-0000-000000000001','day'::render_variant,'B','st:1',
    10::smallint, 850, '{}'::jsonb)
$$, 'Активная точка ставит задания на примерку');

-- ── Отключённая — нет ────────────────────────────────────────
-- Меняем статус напрямую: проверяем последствие статуса, а не право его менять.
update points set status = 'suspended' where id = :P;

select expect_fail($$
  select app.enqueue_render('aaaaaaaa-dddd-0000-0000-000000000001',
    '66666666-dddd-0000-0000-000000000001','overcast'::render_variant,'B','st:2',
    10::smallint, 850, '{}'::jsonb)
$$, 'Отключённая точка новых примерок не собирает — расход останавливается');

select expect_fail($$
  insert into outbound_cards (point_id, configuration_id, honesty_line, channel_kind,
                              rendered_paths)
  values ('aaaaaaaa-dddd-0000-0000-000000000001',
          '77777777-dddd-0000-0000-000000000001','оговорка','telegram','{}')
$$, 'Отключённая точка карточки клиентам не отправляет');

-- ── Но данные точки остаются ей доступны ─────────────────────
-- Долг перед сетью — спор двух юрлиц, данные клиентов в него не входят.
do $$
declare n int;
begin
  select count(*) into n from configuration_items
   where configuration_id = '77777777-dddd-0000-0000-000000000001';
  if n = 0 then
    raise exception 'ПРОВАЛ: отключение отняло у точки её же данные';
  end if;
  raise notice 'ok  · отключение не отнимает у точки переписку и наряды';
end $$;

-- ── Гараж отключённой точки снаружи не открывается ───────────
do $$
begin
  if app.point_of_slug('st-a') is not null then
    raise exception 'ПРОВАЛ: гараж отключённой точки открывается снаружи';
  end if;
  raise notice 'ok  · гараж отключённой точки снаружи не открывается';
end $$;

update points set status = 'active' where id = :P;

-- ── Менять статус может только сеть ──────────────────────────
select expect_denied($$
  select app.set_point_status('aaaaaaaa-dddd-0000-0000-000000000001','suspended')
$$, 'Владелец точки не может отключить сам себя — это решение сети');

select act_as(null, :N::uuid, 'network_admin');
select expect_ok($$
  select app.set_point_status('aaaaaaaa-dddd-0000-0000-000000000001','readonly')
$$, 'Своя сеть отключает точку');

-- ── Чужая сеть — нет ─────────────────────────────────────────
select act_as(null, :N2::uuid, 'network_admin');
select expect_fail($$
  select app.set_point_status('aaaaaaaa-dddd-0000-0000-000000000001','archived')
$$, 'Чужая сеть чужую точку не отключает');

-- ── Отключение оставляет след ────────────────────────────────
select act_as(:P::uuid, :N::uuid);
do $$
declare n int;
begin
  select count(*) into n from audit_log
   where action = 'point.status' and entity_id = 'aaaaaaaa-dddd-0000-0000-000000000001';
  if n = 0 then
    raise exception 'ПРОВАЛ: отключение точки не оставило следа в журнале';
  end if;
  raise notice 'ok  · отключение точки записано в журнал';
end $$;

rollback;
