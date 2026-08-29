'use server';
import { claimsFor } from './session';
import { withTenant } from './db';


/**
 * Черновик живой примерки треда.
 *
 * ПОЧЕМУ ОТДЕЛЬНО ОТ actions.ts. Там лежат два уже проверенных действия —
 * постановка заданий и опрос готовности. Обоим нужна конфигурация, в которую
 * складываются позиции, и фотография, на которой они меряются; ни того, ни
 * другого у панели нет. Этот файл добывает ровно это и ничего больше.
 *
 * ПОЧЕМУ ЧЕРНОВИК, А НЕ ЛЮБАЯ КОНФИГУРАЦИЯ ТРЕДА. К конфигурации, по которой
 * уже ушла карточка, привязано то, что клиент видел и мог подтвердить.
 * Дописать в неё новую позицию значит задним числом поменять предложение,
 * на которое клиент ответил. Поэтому берётся только та, по которой карточки
 * ещё не было, а если такой нет — заводится новая.
 */

/** Уже посчитанное в черновике: по одной записи на артикул. */
export type TryonState = {
  pointPriceId: string;
  itemId: string;
  done: { variant: string; storage_path: string }[];
  errors: string[];
};

/**
 * Что в этом треде уже примерено.
 *
 * ЗАЧЕМ. Состояние примерки живёт в базе, а не во вкладке. Без этого чтения
 * перезагрузка страницы стирала бы готовые света с экрана, и менеджеру
 * пришлось бы жать «Примерить» второй раз — на то, что уже посчитано.
 *
 * ПОЧЕМУ БЕРЁТСЯ САМАЯ ПОЛНАЯ ПОЗИЦИЯ. `startTryOn` вставляет позицию через
 * `on conflict do nothing`, но уникального ключа на пару «конфигурация ×
 * артикул» в схеме нет, поэтому конфликту не на чем сработать: повторное
 * нажатие заводит вторую позицию — пустую. Пока ключа нет, на артикул берётся
 * та позиция, у которой светов больше, а при равенстве — та, у которой есть
 * задания; иначе экран показал бы пустой дубль вместо идущей примерки.
 */
export async function tryonExisting(threadId: string): Promise<TryonState[]> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const { rows } = await c.query(`
      select cit.point_price_id, cit.id as item_id,
             coalesce(json_agg(distinct jsonb_build_object(
                        'variant', r.variant, 'storage_path', r.storage_path))
                      filter (where r.id is not null), '[]') as done,
             coalesce(array_agg(distinct rj.last_error)
                      filter (where rj.status = 'failed'
                                and rj.last_error is not null), '{}') as errors,
             count(distinct rj.id) filter (
               where rj.status in ('queued','running')) as pending
        from configurations cfg
        join configuration_items cit on cit.configuration_id = cfg.id
        left join renders r on r.configuration_item_id = cit.id
                           and r.qa_passed and r.erased_at is null
        left join render_jobs rj on rj.configuration_item_id = cit.id
       where cfg.thread_id = $1 and cfg.origin = 'manager'
         and not exists (select 1 from outbound_cards oc
                          where oc.configuration_id = cfg.id)
       group by cit.point_price_id, cit.id`, [threadId]);

    const best = new Map<string, TryonState & { pending: number }>();
    for (const r of rows) {
      const s = {
        pointPriceId: r.point_price_id as string,
        itemId: r.item_id as string,
        done: r.done as TryonState['done'],
        errors: r.errors as string[],
        pending: Number(r.pending),
      };
      // Позиция без светов, без отказов и без живых заданий — это след
      // прерванной попытки, а не идущая примерка. Отдавать её панели значит
      // завести опрос по заданию, которого нет, и держать его до потолка.
      if (!s.done.length && !s.errors.length && !s.pending) continue;
      const was = best.get(s.pointPriceId);
      if (!was || s.done.length > was.done.length
          || (s.done.length === was.done.length && s.pending > was.pending)) {
        best.set(s.pointPriceId, s);
      }
    }
    return [...best.values()].map(({ pending: _p, ...s }) => s);
  });
}

/** Фотография клиента, на которой считается примерка. Только чтение. */
export async function tryonPhoto(threadId: string): Promise<string | null> {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const { rows } = await c.query(
      `select p.storage_path
         from photos p
         join threads t on t.client_id = p.client_id
        where t.id = $1 and p.erased_at is null
        order by p.created_at desc limit 1`, [threadId]);
    return (rows[0]?.storage_path as string) ?? null;
  });
}

/**
 * Черновик под примерку: конфигурация и фотография одним ответом.
 *
 * Запись происходит по нажатию «Примерить», а не при открытии диалога:
 * отрисовка страницы не должна оставлять следов в базе. Повторное нажатие
 * находит уже заведённый черновик и второго не создаёт.
 */
export async function tryonDraft(threadId: string) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      const photo = await c.query(
        `select p.id from photos p
           join threads t on t.client_id = p.client_id
          where t.id = $1 and p.erased_at is null
          order by p.created_at desc limit 1`, [threadId]);
      if (!photo.rows.length) {
        return { ok: false as const,
                 error: 'фото из диалога не подхвачено — мерить не на чем' };
      }
      const photoId = photo.rows[0].id as string;

      const draft = await c.query(
        `select cfg.id from configurations cfg
          where cfg.thread_id = $1 and cfg.origin = 'manager'
            and not exists (select 1 from outbound_cards oc
                             where oc.configuration_id = cfg.id)
          order by cfg.created_at desc limit 1`, [threadId]);
      if (draft.rows.length) {
        return { ok: true as const, configId: draft.rows[0].id as string, photoId };
      }

      const made = await c.query(
        `insert into configurations (point_id, thread_id, photo_id, created_by, origin)
         values ($1,$2,$3,$4,'manager') returning id`,
        [who.point_id, threadId, photoId, who.user_id]);
      return { ok: true as const, configId: made.rows[0].id as string, photoId };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}
