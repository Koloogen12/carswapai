-- Канал для исходящего сообщения (О-5).
--
-- До этой миграции резолвер жил в приложении и читал threads.channel_id —
-- столбец, которого нет и не должно быть. Ошибка приходила только в момент
-- нажатия, а нажимать было некому: ни одна кнопка эти действия не вызывала.
-- Поэтому «попросить фото» и «прислать ссылку на гараж» не отработали НИ РАЗУ
-- с момента, как были написаны.
--
-- Резолвер переезжает в базу по той же причине, что и app.point_of_channel:
-- правило, которое проверяет стенд, обязано быть тем же кодом, который
-- выполняется в бою. Копия в приложении расходится молча.
--
-- ПОЧЕМУ ПОСЛЕДНЕЕ ВХОДЯЩЕЕ, А НЕ ПОСЛЕДНЕЕ ЛЮБОЕ. Клиент пишет откуда ему
-- удобно, и канал у обращения не один. Отвечать надо туда, где клиент сейчас,
-- а не туда, куда мы писали в прошлый раз: иначе после нашей рассылки в
-- WhatsApp ответ на телеграм-вопрос уйдёт в WhatsApp и не будет прочитан.
-- Если входящих нет вовсе (переписку начали мы) — берём последнее исходящее.
--
-- security invoker намеренно: функция обязана видеть ровно то, что видит
-- арендатор. Definer здесь открыл бы чужую переписку через подставленный id.
create or replace function app.thread_channel(p_thread uuid)
returns table (channel_id uuid, kind text, provider text,
               external_id text, can_initiate boolean)
language sql stable as $$
  select ch.id, ch.kind::text, ch.provider, ch.external_id,
         coalesce(ch.can_initiate, false)
    from messages m
    join channels ch on ch.id = m.channel_id
   where m.thread_id = p_thread
   order by (m.direction = 'in') desc, m.sent_at desc
   limit 1
$$;

grant execute on function app.thread_channel(uuid) to app_tenant;

comment on function app.thread_channel(uuid) is
  'О-5 · канал — свойство сообщения. Ответ уходит туда, откуда пришло последнее входящее.';
