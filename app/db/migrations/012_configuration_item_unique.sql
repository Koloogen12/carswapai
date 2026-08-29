-- CarSwap AI · один артикул в примерке — одна позиция
--
-- НАЙДЕНО ПРИ СБОРКЕ ПАНЕЛИ. В startTryOn стоит `on conflict do nothing`, но
-- уникального ключа на пару «конфигурация × артикул» не было — значит
-- конфликту не на чем возникнуть, и защита не срабатывала НИ РАЗУ. Каждое
-- нажатие «Примерить» заводило новую пустую позицию, а панель начинала
-- следить за ней вместо той, по которой уже посчитано.
--
-- Снаружи это выглядело как «примерка зависла»: рендеры есть, но привязаны
-- к предыдущей позиции. Молча, без единой ошибки.
--
-- Ключ здесь уместен и сам по себе, безотносительно той ошибки: один и тот же
-- артикул дважды в одной примерке — это не сценарий, а опечатка. Цена у него
-- берётся из прайса на момент добавления, и две строки с разной ценой на один
-- артикул сделали бы карточку неоднозначной.

begin;

-- Дубликаты, если они накопились, схлопываем. Столбца времени у позиции нет,
-- поэтому оставляем ту, к которой привязаны рендеры, а при равенстве — с
-- меньшим идентификатором: любой устойчивый порядок годится, лишь бы он был
-- один и тот же при повторном накате.
delete from configuration_items ci
 where exists (
   select 1 from configuration_items keep
    where keep.configuration_id = ci.configuration_id
      and keep.point_price_id = ci.point_price_id
      and keep.id <> ci.id
      and (
        (exists (select 1 from renders r where r.configuration_item_id = keep.id)
         and not exists (select 1 from renders r where r.configuration_item_id = ci.id))
        or (
          (exists (select 1 from renders r where r.configuration_item_id = keep.id))
            = (exists (select 1 from renders r where r.configuration_item_id = ci.id))
          and keep.id < ci.id)
      ))
   and not exists (select 1 from renders r where r.configuration_item_id = ci.id);

create unique index configuration_items_one_per_sku
  on configuration_items (configuration_id, point_price_id);

commit;
