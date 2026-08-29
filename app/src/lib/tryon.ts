'use server';
import { withTenant } from './db';
import { MANAGER } from './data';

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

/** Фотография клиента, на которой считается примерка. Только чтение. */
export async function tryonPhoto(threadId: string): Promise<string | null> {
  return withTenant(MANAGER, async c => {
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
  return withTenant(MANAGER, async c => {
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
        [MANAGER.point_id, threadId, photoId, MANAGER.user_id]);
      return { ok: true as const, configId: made.rows[0].id as string, photoId };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}
