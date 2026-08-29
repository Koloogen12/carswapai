-- Согласие по оферте при первом контакте (миграция 011).
--
-- Проверяется главное: «продолжая переписку, вы соглашаетесь» не может быть
-- записано как голое granted=true. У такого основания обязана быть пара
-- сообщений — доставленное уведомление и пришедшая после него фотография.
-- Иначе предъявить в споре нечего.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-aaaa-0000-0000-000000000001'''
\set P '''aaaaaaaa-aaaa-0000-0000-000000000001'''
\set CL '''ffffffff-aaaa-0000-0000-000000000001'''
\set CH '''99999999-aaaa-0000-0000-000000000001'''
\set TH '''88888888-aaaa-0000-0000-000000000001'''

insert into networks (id, name, join_code, price_deviation_allowed_pct)
  values (:N,'Сеть оферты','OFFER-2026', 10);
select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка','of-a');
insert into clients (id, point_id, name, phone) values (:CL,:P,'Клиент','+79997770001');
insert into channels (id, point_id, kind, provider, external_id)
  values (:CH,:P,'whatsapp','wazzup','wa-of');
insert into threads (id, point_id, client_id) values (:TH,:P,:CL);

-- Уведомление с офертой (исходящее) и фотография клиента (входящее).
insert into messages (id, point_id, thread_id, channel_id, direction, body,
                      external_message_id, sent_at)
values ('aaaa0000-0000-4000-8000-000000000001',:P,:TH,:CH,'out',
        'Продолжая переписку, вы соглашаетесь на обработку фото автомобиля','m-1',
        now() - interval '3 minutes'),
       ('aaaa0000-0000-4000-8000-000000000002',:P,:TH,:CH,'in',
        'фото машины','m-2', now());

-- ── Голое согласие по оферте не записывается ─────────────────
select expect_fail($$
  insert into consents (point_id, client_id, kind, document_version, granted, basis)
  values ('aaaaaaaa-aaaa-0000-0000-000000000001','ffffffff-aaaa-0000-0000-000000000001',
          'photo_processing','offer-v1', true, 'offer_notice')
$$, 'Оферта: согласие без пары сообщений-доказательств не записывается');

select expect_fail($$
  insert into consents (point_id, client_id, kind, document_version, granted, basis,
                        notice_message_id)
  values ('aaaaaaaa-aaaa-0000-0000-000000000001','ffffffff-aaaa-0000-0000-000000000001',
          'photo_processing','offer-v1', true, 'offer_notice',
          'aaaa0000-0000-4000-8000-000000000001')
$$, 'Оферта: одного уведомления мало — нужно и действие клиента после него');

-- ── С доказательствами — записывается ────────────────────────
select expect_ok($$
  insert into consents (id, point_id, client_id, kind, document_version, granted,
                        basis, notice_message_id, evidence_message_id)
  values ('cccc0000-0000-4000-8000-000000000001',
          'aaaaaaaa-aaaa-0000-0000-000000000001','ffffffff-aaaa-0000-0000-000000000001',
          'photo_processing','offer-v1', true, 'offer_notice',
          'aaaa0000-0000-4000-8000-000000000001','aaaa0000-0000-4000-8000-000000000002')
$$, 'Оферта: с доставленным уведомлением и действием клиента — согласие есть');

-- ── Явное согласие доказательств не требует ──────────────────
select expect_ok($$
  insert into consents (point_id, client_id, kind, document_version, granted, basis)
  values ('aaaaaaaa-aaaa-0000-0000-000000000001','ffffffff-aaaa-0000-0000-000000000001',
          'photo_processing','v1', true, 'explicit')
$$, 'Явное согласие клиента доказательств в виде сообщений не требует');

-- ── Порядок сообщений: действие ПОСЛЕ уведомления ────────────
-- Проверяем не ограничением, а прямым сравнением: строка есть, и в ней
-- фотография пришла позже оферты. Обратный порядок означал бы, что клиент
-- прислал фото до того, как его уведомили, и основание рассыпается.
do $$
declare ok boolean;
begin
  select mi.sent_at > mo.sent_at into ok
    from consents c
    join messages mo on mo.id = c.notice_message_id
    join messages mi on mi.id = c.evidence_message_id
   where c.id = 'cccc0000-0000-4000-8000-000000000001';
  if not ok then
    raise exception 'ПРОВАЛ: фотография пришла раньше уведомления — основание не работает';
  end if;
  raise notice 'ok  · Оферта: действие клиента зафиксировано ПОСЛЕ уведомления';
end $$;

-- ── Согласие по-прежнему неизменяемо ─────────────────────────
select expect_fail($$
  update consents set granted = false
   where id = 'cccc0000-0000-4000-8000-000000000001'
$$, 'Согласие остаётся неизменяемым: отзыв — новая запись, не правка старой');

-- ── Согласие чужой точки основанием не является ──────────────
-- Согласие даётся конкретному оператору. Взять чужое и приложить к своему
-- снимку — это обработка без основания, чем бы оно ни выглядело в базе.
\set P2 '''bbbbbbbb-aaaa-0000-0000-000000000002'''
insert into networks (id, name, join_code, price_deviation_allowed_pct)
  values ('11111111-aaaa-0000-0000-000000000002','Сеть Б','OFFER-B-2026', 10);
select act_as(:P2::uuid, '11111111-aaaa-0000-0000-000000000002'::uuid);
insert into points (id, network_id, name, public_slug)
  values (:P2,'11111111-aaaa-0000-0000-000000000002','Точка Б','of-b');
insert into consents (id, point_id, session_id, kind, document_version, granted, basis)
  values ('cccc0000-0000-4000-8000-000000000009',:P2,'sess-b','photo_processing',
          'garage-v1', true, 'explicit');

select act_as(:P::uuid, :N::uuid);
select expect_fail($$
  insert into photos (point_id, storage_path, sha256, width, height, consent_id)
  values ('aaaaaaaa-aaaa-0000-0000-000000000001','/p/чужое.jpg','h-чужое',100,100,
          'cccc0000-0000-4000-8000-000000000009')
$$, 'Согласие, данное другой точке, основанием для её снимка не является');

rollback;
