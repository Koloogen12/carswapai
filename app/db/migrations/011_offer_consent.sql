-- CarSwap AI · согласие на обработку фото по оферте при первом контакте
--
-- РЕШЕНИЕ ОСНОВАТЕЛЯ, и оно про трение: спрашивать «да» отдельным сообщением
-- значит терять часть клиентов на ровном месте. Основание — оферта: клиент
-- получает уведомление с текстом и ссылкой, и присылает фотографию уже после.
--
-- ЧТО ЗДЕСЬ ДОБАВЛЕНО И ЗАЧЕМ. Само по себе «продолжая переписку, вы
-- соглашаетесь» ничем не подтверждается: в базе была бы строка granted=true
-- без единого доказательства. Поэтому согласие по оферте обязано хранить
-- ПОСЛЕДОВАТЕЛЬНОСТЬ, которую можно предъявить:
--
--   notice_message_id  — наше сообщение с текстом оферты, с временем доставки;
--   evidence_message_id — входящее сообщение клиента, пришедшее ПОСЛЕ него.
--
-- Тогда основание выглядит так: «уведомление доставлено в 14:02, фотография
-- получена в 14:05, оба сообщения в переписке». Это проверяемо. Строка
-- granted=true без этой пары — не проверяемо ничем.
--
-- Запись согласия по оферте БЕЗ доказательств запрещена ограничением ниже,
-- а не соглашением между разработчиками.

begin;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'consent_basis') then
    create type consent_basis as enum ('explicit', 'offer_notice');
  end if;
end $$;

alter table consents add column basis consent_basis not null default 'explicit';
alter table consents add column notice_message_id uuid references messages(id);
alter table consents add column evidence_message_id uuid references messages(id);

comment on column consents.basis is
  'Как получено согласие: explicit — клиент явно ответил; offer_notice — '
  'оферта при первом контакте, и тогда обязательны оба сообщения-доказательства.';

-- Согласие по оферте без пары сообщений не существует. Это ограничение, а не
-- договорённость: обойти его нельзя ни из сервисного слоя, ни вставкой напрямую.
alter table consents add constraint consent_offer_needs_evidence check (
  basis <> 'offer_notice'
  or (notice_message_id is not null and evidence_message_id is not null)
);

commit;
