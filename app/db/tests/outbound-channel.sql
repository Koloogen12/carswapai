-- Канал исходящего сообщения (миграция 021, инвариант О-5).
--
-- Дыра, которую это закрывает, прожила незамеченной весь срок: резолвер читал
-- threads.channel_id — столбец, которого в схеме нет. Ошибка приходила только
-- при нажатии, а кнопок, вызывающих эти действия, в интерфейсе не было вовсе.
-- Три исходящих действия числились готовыми и не отработали ни разу.
--
-- Поэтому проверяется не «функция аккуратно написана», а поведение: куда
-- уйдёт ответ, если клиент писал из двух мессенджеров, и что бывает, когда
-- канала нет.
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

\set N '''11111111-a1a1-0000-0000-000000000001'''
\set P '''aaaaaaaa-a1a1-0000-0000-000000000001'''
\set Q '''bbbbbbbb-a1a1-0000-0000-000000000002'''
\set CW '''cccccccc-a1a1-0000-0000-000000000001'''
\set CT '''cccccccc-a1a1-0000-0000-000000000002'''
\set CL '''cccccccc-a1a1-0000-0000-000000000003'''
\set CLI '''dddddddd-a1a1-0000-0000-000000000001'''
\set TH '''eeeeeeee-a1a1-0000-0000-000000000001'''
\set TQ '''eeeeeeee-a1a1-0000-0000-000000000009'''

insert into networks (id, name, join_code) values (:N,'Сеть исходящих','OUT-2026');

select act_as(:P::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:P,:N,'Точка П','out-p');
insert into channels (id, point_id, kind, provider, external_id) values
  (:CW,:P,'whatsapp','wazzup','wa-P'),
  (:CT,:P,'telegram','wazzup','tg-P');
insert into clients (id, point_id, name) values (:CLI,:P,'Клиент');
insert into threads (id, point_id, client_id) values (:TH,:P,:CLI), (:TQ,:P,:CLI);

-- ── 1 · обращение без единого сообщения не даёт канала ────────
-- Приложение обязано отказать честно, а не отправить «куда-нибудь».
select expect_eq(format('select kind from app.thread_channel(%L)', :TH), null,
                 'обращение без сообщений канала не даёт');

-- ── 2 · единственное входящее задаёт канал ────────────────────
insert into messages (point_id, thread_id, channel_id, direction, body, sent_at)
values (:P,:TH,:CW,'in','привет из ватсапа', now() - interval '3 hours');

select expect_eq(format('select kind from app.thread_channel(%L)', :TH), 'whatsapp',
                 'канал берётся из входящего сообщения');

-- ── 3 · наш ответ НЕ переводит переписку в свой канал ─────────
-- Мы ответили в whatsapp, клиент потом написал в телеграм. Следующий ответ
-- обязан уйти в телеграм: клиент сейчас там, а не там, где удобно нам.
insert into messages (point_id, thread_id, channel_id, direction, body, sent_at)
values (:P,:TH,:CW,'out','ответили в ватсап', now() - interval '2 hours'),
       (:P,:TH,:CT,'in','а можно тут?',       now() - interval '1 hour');

select expect_eq(format('select kind from app.thread_channel(%L)', :TH), 'telegram',
                 'ответ идёт за клиентом, а не за нашим прошлым ответом');

-- ── 4 · без входящих берём последнее исходящее ────────────────
-- Переписку начали мы (рассылка). Канала «откуда пришло» нет, но продолжать
-- разговор всё равно надо — в том же месте, где начали.
insert into messages (point_id, thread_id, channel_id, direction, body, sent_at)
values (:P,:TQ,:CT,'out','первое касание', now() - interval '5 hours');

select expect_eq(format('select kind from app.thread_channel(%L)', :TQ), 'telegram',
                 'переписку, начатую нами, продолжаем в том же канале');

-- ── 5 · исходящее нельзя записать в канал чужой точки ─────────
-- Составной внешний ключ (channel_id, point_id) — единственное, что стоит
-- между ошибкой в коде и сообщением, ушедшим клиенту другой точки.
select act_as(:Q::uuid, :N::uuid);
insert into points (id, network_id, name, public_slug) values (:Q,:N,'Точка К','out-q');
insert into channels (id, point_id, kind, provider, external_id)
  values (:CL,:Q,'telegram','wazzup','tg-Q');

select act_as(:P::uuid, :N::uuid);
select expect_fail(
  format('insert into messages (point_id, thread_id, channel_id, direction, body)
          values (%L,%L,%L,''out'',''чужой канал'')', :P, :TH, :CL),
  'исходящее в канал чужой точки невозможно');

-- ── 6 · чужая точка не видит канал этого обращения ────────────
-- Резолвер намеренно security invoker: подставленный id обращения не должен
-- открывать переписку соседа.
select act_as(:Q::uuid, :N::uuid);
select expect_eq(format('select kind from app.thread_channel(%L)', :TH), null,
                 'соседняя точка канала чужого обращения не видит');

rollback;
