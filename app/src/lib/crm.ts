import { claimsFor } from './session';
import { withTenant } from './db';
import type { ChannelId } from './domain';

/**
 * Учётный слой точки: список клиентов, карточка клиента, воронка.
 *
 * §16 — этот слой ОБСЛУЖИВАЕТ примерку и точкой входа не является. Поэтому
 * здесь нет ни одного действия, заводящего сущность руками: всё, что видно на
 * экране, уже случилось в диалоге, в гараже или на посту. CRM показывает
 * состояние, а меняют его события.
 *
 * §13 — границы держит претензия из сессии и RLS, а не фильтр `where`.
 * Ни одного `point_id` в аргументах: менеджер физически не может спросить
 * чужую точку, даже подставив идентификатор в адрес.
 *
 * О-3 — артикул и цена приходят ТОЛЬКО через `point_prices`. Соединение
 * везде идёт от прайса точки к каталогу, а не наоборот, поэтому строка с
 * артикулом, которого в прайсе этой точки нет, не может появиться в принципе.
 */

/**
 * Связь «клиент → конфигурация» идёт ДВУМЯ путями, и оба настоящие.
 *
 * Через диалог — обычный случай: менеджер собрал примерку в треде.
 * Через визит — случай гаража: клиент собрал конфигурацию сам по публичной
 * ссылке, треда у неё нет, и с человеком её связывает только запись на замер.
 * Пока связь считалась одним лишь тредом, такие клиенты выглядели как «без
 * примерки» — то есть продукт терял ровно тех, кто пришёл сам.
 */
const LINK = `
  link as (
    select t.client_id, cfg.id as configuration_id, cfg.origin::text as origin
      from configurations cfg
      join threads t on t.id = cfg.thread_id
    union
    select ap.client_id, cfg.id, cfg.origin::text
      from appointments ap
      join configurations cfg on cfg.id = ap.configuration_id
     where ap.client_id is not null
  )`;

/**
 * Шесть статусов экрана 47. Стадию задаёт СОБЫТИЕ, а не рука менеджера:
 * отправили примерку — «ждём реакции», клиент нажал «беру» — «подтвердил
 * цвет», мастер сдал — «сдано». Тумблера «поставить стадию» нет и не будет:
 * ровно он превращает учёт в фантазию.
 *
 * «Остыл» сюда не входит намеренно. Это не место на лестнице, а ТЕМПЕРАТУРА:
 * молчание поверх любой стадии. В макете он стоит в одном ряду со стадиями, и
 * от этого лестница получалась семиступенчатой и противоречивой — клиент,
 * подтвердивший цвет и замолчавший, попадал сразу в две ячейки. Здесь стадия
 * и температура разведены, а фильтр «Остыли» ищет по температуре.
 */
export type Stage = 'new' | 'sent' | 'confirmed' | 'measure' | 'in_work' | 'done';

export type CrmRow = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: { make?: string; model?: string; year?: number; plate?: string; note?: string };
  /** Диалог, в который ведёт строка. null — обращения ещё не было. */
  thread_id: string | null;
  channel: ChannelId | null;
  /** Сколько раз этот человек обращался: «2-е обращение» в макете. */
  threads: number;
  /** Сколько примерок собрано на его автомобиль. */
  tryons: number;
  origin: string | null;
  brand: string | null;
  sku: string | null;
  item: string | null;
  price_kopecks: number | null;
  thumb: string | null;
  confirmed_at: string | null;
  /** Когда клиенту ушла карточка примерки. null — ещё ничего не показывали. */
  sent_at: string | null;
  measure_at: string | null;
  order_id: string | null;
  order_number: string | null;
  order_status: string | null;
  batch_number: string | null;
  last_at: string | null;
};

/**
 * Сама лестница — правила `stageOf`, `isCold`, порядок горячести — живёт в
 * `app/crm/CrmDesk.tsx`, а не здесь. Причина механическая: этот модуль тянет
 * `db.ts`, а тот — драйвер `pg` с обращением к `fs`. Экран со списком
 * интерактивный, то есть клиентский, и любой РАБОЧИЙ импорт отсюда утаскивал
 * бы драйвер базы в браузерную сборку — она падала с «Can't resolve 'fs'».
 * Типы через `import type` стираются и такого следа не оставляют.
 */

/**
 * Экран 47 · клиенты точки.
 *
 * Один запрос отдаёт всё, что рисует строка: человек, автомобиль, ВЕДУЩИЙ
 * артикул с миниатюрой, стадия, сумма и наряд. Ведущий — подтверждённый,
 * а если подтверждения нет, самый дорогой из показанных: именно его человек
 * и обсуждает.
 */
export async function crmList(): Promise<CrmRow[]> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const { rows } = await c.query(`
      with ${LINK},
      item as (
        select l.client_id, cit.id as item_id, l.origin,
               ci.brand, ci.sku, ci.name as item, cit.price_kopecks,
               row_number() over (partition by l.client_id
                 order by (cf.id is not null) desc, cit.price_kopecks desc) as rn
          from link l
          join configuration_items cit on cit.configuration_id = l.configuration_id
          join point_prices pp on pp.id = cit.point_price_id
          join catalog_items ci on ci.id = pp.catalog_item_id
          left join confirmations cf on cf.configuration_id = l.configuration_id
      ),
      ord as (
        select l.client_id, o.id, o.number, o.status, o.batch_number,
               row_number() over (partition by l.client_id order by o.created_at desc) as rn
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
          join orders o on o.confirmation_id = cf.id
      )
      select cl.id, cl.name, cl.phone, cl.vehicle,
             (select t.id from threads t where t.client_id = cl.id
               order by t.last_message_at desc nulls last limit 1) as thread_id,
             (select max(t.last_message_at) from threads t where t.client_id = cl.id) as last_at,
             (select ch.kind from messages m
                join channels ch on ch.id = m.channel_id
                join threads t on t.id = m.thread_id
               where t.client_id = cl.id order by m.sent_at desc limit 1) as channel,
             (select count(*) from threads t where t.client_id = cl.id)::int as threads,
             (select count(*) from link l where l.client_id = cl.id)::int as tryons,
             i.origin, i.brand, i.sku, i.item, i.price_kopecks,
             (select r.storage_path from renders r
               where r.configuration_item_id = i.item_id and r.variant = 'day') as thumb,
             (select max(cf.confirmed_at) from link l
                join confirmations cf on cf.configuration_id = l.configuration_id
               where l.client_id = cl.id) as confirmed_at,
             (select max(oc.created_at) from link l
                join outbound_cards oc on oc.configuration_id = l.configuration_id
               where l.client_id = cl.id) as sent_at,
             (select min(ap.starts_at) from appointments ap
               where ap.client_id = cl.id and ap.kind = 'measure'
                 and ap.status <> 'cancelled') as measure_at,
             o.id as order_id, o.number as order_number, o.status as order_status,
             o.batch_number
        from clients cl
        left join item i on i.client_id = cl.id and i.rn = 1
        left join ord  o on o.client_id = cl.id and o.rn = 1
       order by cl.created_at desc`);
    return rows as CrmRow[];
  });
}

export type TimelineEvent = { at: string; title: string; note: string | null; acid: boolean };

export type TryonShot = {
  id: string; item: string; brand: string; sku: string;
  thumb: string | null; at: string; confirmed: boolean;
};

export type CrmCard = {
  id: string; name: string; phone: string | null; created_at: string;
  vehicle: { make?: string; model?: string; year?: number; plate?: string; note?: string };
  channel: ChannelId | null;
  thread_id: string | null;
  threads: number;
  /** Работы: зона из прайса точки и метраж, если он посчитан на замере. */
  zone: string | null;
  meters: string | null;
  price_kopecks: number | null;
  paid_kopecks: number;
  invoice_amount: number | null;
  invoice_number: string | null;
  order_id: string | null;
  order_number: string | null;
  order_status: string | null;
  order_at: string | null;
  batch_number: string | null;
  invoice_at: string | null;
  measure_at: string | null;
  measure_bay: string | null;
  confirmed_at: string | null;
  tryons: TryonShot[];
  timeline: TimelineEvent[];
};

/**
 * Экраны 48–49 · карточка клиента, история примерок его автомобиля
 * и хронология одной лентой.
 *
 * Хронология собирается из ФАКТОВ, а не из отдельной таблицы событий:
 * сообщение, отправленная карточка, подтверждение, визит, наряд, сверка
 * рулона, оплата. Заводить рядом журнал «что произошло» значит завести
 * второй источник правды, который однажды разойдётся с первым.
 */
export async function crmCard(id: string): Promise<CrmCard | null> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const head = await c.query(`
      with ${LINK},
      item as (
        select l.client_id, cit.id as item_id, cit.meters_required, cit.price_kopecks,
               z.name as zone,
               row_number() over (partition by l.client_id
                 order by (cf.id is not null) desc, cit.price_kopecks desc) as rn
          from link l
          join configuration_items cit on cit.configuration_id = l.configuration_id
          join point_prices pp on pp.id = cit.point_price_id
          join zones z on z.code = pp.zone_code
          left join confirmations cf on cf.configuration_id = l.configuration_id
         where l.client_id = $1
      ),
      ord as (
        select o.id, o.number, o.status, o.batch_number, o.created_at,
               row_number() over (order by o.created_at desc) as rn
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
          join orders o on o.confirmation_id = cf.id
         where l.client_id = $1
      )
      select cl.id, cl.name, cl.phone, cl.vehicle, cl.created_at,
             (select t.id from threads t where t.client_id = cl.id
               order by t.last_message_at desc nulls last limit 1) as thread_id,
             (select count(*) from threads t where t.client_id = cl.id)::int as threads,
             (select ch.kind from messages m
                join channels ch on ch.id = m.channel_id
                join threads t on t.id = m.thread_id
               where t.client_id = cl.id order by m.sent_at desc limit 1) as channel,
             i.zone, i.meters_required::text as meters, i.price_kopecks,
             o.id as order_id, o.number as order_number, o.status as order_status,
             o.batch_number, o.created_at as order_at,
             inv.number as invoice_number, inv.amount_kopecks as invoice_amount,
             coalesce((select sum(case when p.kind = 'refund' then -p.amount_kopecks
                                       else p.amount_kopecks end)
                         from payments p where p.invoice_id = inv.id), 0)::int as paid_kopecks,
             (select max(p.paid_at) from payments p where p.invoice_id = inv.id) as invoice_at,
             (select min(ap.starts_at) from appointments ap
               where ap.client_id = cl.id and ap.kind = 'measure'
                 and ap.status <> 'cancelled') as measure_at,
             (select b.name from appointments ap
                join bays b on b.id = ap.bay_id
               where ap.client_id = cl.id and ap.status <> 'cancelled'
               order by ap.starts_at limit 1) as measure_bay,
             (select max(cf.confirmed_at) from link l
                join confirmations cf on cf.configuration_id = l.configuration_id
               where l.client_id = cl.id) as confirmed_at
        from clients cl
        left join item i on i.rn = 1
        left join ord  o on o.rn = 1
        left join invoices inv on inv.order_id = o.id
       where cl.id = $1`, [id]);
    if (!head.rows.length) return null;

    // История примерок ЭТОГО автомобиля: всё, что человеку показывали, в
    // обратном порядке. Подтверждённая обведена — «в прошлый раз смотрели»
    // работает только когда старые примерки не выброшены.
    const shots = await c.query(`
      with ${LINK}
      select cit.id, ci.name as item, ci.brand, ci.sku,
             (select r.storage_path from renders r
               where r.configuration_item_id = cit.id and r.variant = 'day') as thumb,
             cfg.created_at as at,
             (cf.id is not null) as confirmed
        from link l
        join configurations cfg on cfg.id = l.configuration_id
        join configuration_items cit on cit.configuration_id = cfg.id
        join point_prices pp on pp.id = cit.point_price_id
        join catalog_items ci on ci.id = pp.catalog_item_id
        left join confirmations cf on cf.configuration_id = cfg.id
       where l.client_id = $1
       order by cfg.created_at desc, cit.price_kopecks desc`, [id]);

    const line = await c.query(`
      with ${LINK}
      select * from (
        select m.sent_at as at,
               case when m.direction = 'in' then 'Обращение от клиента'
                    else 'Ответ точки' end as title,
               left(m.body, 90) as note, false as acid
          from messages m join threads t on t.id = m.thread_id
         where t.client_id = $1
        union all
        -- Одна отправка — ОДНО событие. Соединение с позициями конфигурации
        -- размножало строку по числу артикулов: карточка с тремя плёнками
        -- давала в ленте три одинаковых «примерка отправлена». Артикулы
        -- считаются подзапросом, а не джойном.
        select oc.created_at, 'Примерка отправлена',
               case when k.n = 1 then '1 артикул × три света'
                    when k.n % 10 between 2 and 4 and k.n % 100 not between 12 and 14
                         then k.n || ' артикула × три света'
                    else k.n || ' артикулов × три света' end, true
          from link l
          join outbound_cards oc on oc.configuration_id = l.configuration_id
          cross join lateral (select count(*)::int as n from configuration_items cit
                               where cit.configuration_id = l.configuration_id) k
         where l.client_id = $1
        union all
        select cf.confirmed_at, 'Подтвердил выбор сам', 'оговорка про свет показана', true
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
         where l.client_id = $1
        union all
        select ap.starts_at,
               case ap.kind::text when 'measure' then 'Замер' else 'Работы на посту' end,
               coalesce(b.name, 'пост назначается на месте'), false
          from appointments ap
          left join bays b on b.id = ap.bay_id
         where ap.client_id = $1 and ap.status <> 'cancelled'
        union all
        select o.created_at, 'Заказ-наряд ' || o.number,
               'собран из подтверждённой конфигурации', true
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
          join orders o on o.confirmation_id = cf.id
         where l.client_id = $1
        union all
        select o.batch_verified_at, 'Сверка рулона',
               'партия ' || coalesce(o.batch_number, '—') || ' · артикул сошёлся', true
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
          join orders o on o.confirmation_id = cf.id
         where l.client_id = $1 and o.batch_verified_at is not null
        union all
        select p.paid_at,
               case p.kind::text when 'refund' then 'Возврат' else 'Оплата' end,
               inv.number, true
          from link l
          join confirmations cf on cf.configuration_id = l.configuration_id
          join orders o on o.confirmation_id = cf.id
          join invoices inv on inv.order_id = o.id
          join payments p on p.invoice_id = inv.id
         where l.client_id = $1
      ) e
       where e.at is not null
       order by e.at`, [id]);

    return {
      ...head.rows[0],
      tryons: shots.rows as TryonShot[],
      timeline: line.rows as TimelineEvent[],
    } as CrmCard;
  });
}
