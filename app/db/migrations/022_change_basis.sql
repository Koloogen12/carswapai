-- Основание решения по доплате.
--
-- До этой миграции у согласия на доплату не было основания — только «решено».
-- А оснований два, и они не равны:
--
--   client_device — клиент нажал у себя в ссылке. Действие клиента, с датой.
--   verbal_at_bay — клиент стоял у поста и сказал «делайте». Записал сотрудник.
--
-- Второе в споре весит меньше, и точка обязана это видеть, а не узнавать на
-- выдаче. Без разделения любой наряд выглядел бы одинаково подтверждённым, и
-- «клиент подтвердил» означало бы то же самое, что «мастер так запомнил».
--
-- Устное согласие — не обход, а рабочая реальность: клиент физически стоит
-- рядом. Запрещать его значит заставлять мастера врать в интерфейсе.
alter table change_orders
  add column decided_via text,
  add column decided_by  uuid references users(id);

-- Основание появляется ровно тогда, когда появляется решение.
alter table change_orders add constraint change_orders_basis_with_decision
  check ((decided_via is null) = (client_acted_at is null));

alter table change_orders add constraint change_orders_basis_known
  check (decided_via is null or decided_via in ('client_device', 'verbal_at_bay'));

-- Устное согласие обязано иметь того, кто его записал: анонимного «клиент
-- сказал» в наряде быть не может.
alter table change_orders add constraint change_orders_verbal_needs_witness
  check (decided_via is distinct from 'verbal_at_bay' or decided_by is not null);

-- И наоборот: за решением клиента с его устройства сотрудника нет.
alter table change_orders add constraint change_orders_device_has_no_staff
  check (decided_via is distinct from 'client_device' or decided_by is null);

comment on column change_orders.decided_via is
  'Основание решения: client_device — клиент нажал сам; verbal_at_bay — сказал у поста, записал сотрудник.';
