'use server';
/**
 * Действия сети над точками.
 *
 * ДО ЭТОГО их не было, а `points.status` был декоративным: отключённая за
 * неуплату точка продолжала собирать примерки и тратить генерации. Сеть
 * считала её остановленной, а расход шёл.
 *
 * Право решать держит база (миграция 020), а не этот файл: отключение точки
 * это остановка чужого бизнеса, и проверка «кто вправе» не должна зависеть
 * от того, какой экран вызвал функцию.
 */
import { revalidatePath } from 'next/cache';
import { withTenant } from './db';
import { claimsFor } from './session';

import type { PointStatus } from './point-status';

export async function setPointStatus(pointId: string, status: PointStatus) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      await c.query('select app.set_point_status($1, $2::point_status)', [pointId, status]);
      revalidatePath('/network');
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

/**
 * С-5 · снятие жёсткого стопа по бюджету — на стороне сети.
 *
 * Точка не может снять его сама: иначе потолок расхода перестаёт быть
 * потолком. Класс A при стопе продолжает работать, поэтому точка не встаёт
 * совсем — останавливается только то, что стоит денег.
 */
export async function releaseBudgetStop(pointId: string) {
  const who = await claimsFor();
  return withTenant(who, async c => {
    try {
      await c.query('select app.release_budget_stop($1)', [pointId]);
      revalidatePath('/network');
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

/**
 * Код присоединения к сети — то, что на самом деле стоит за «пригласить точку».
 *
 * Кнопка «Отправить приглашение» была нарисованной, и подпись под ней врала
 * дважды: отправлять нечем (провайдера рассылки нет) и отправлять нечего
 * (кода на экране не было). Точка присоединяется сама по коду на /join —
 * значит приглашение это код и ссылка, а не письмо от системы.
 *
 * Поэтому экран отдаёт готовый текст, который управляющая компания
 * отправляет своим способом. Это честнее «Отправлено», за которым не
 * происходит ничего, и не ждёт провайдера, которого ещё нет.
 */
export async function inviteText() {
  const who = await claimsFor();
  return withTenant(who, async c => {
    const r = await c.query<{ name: string; join_code: string }>(
      `select n.name, n.join_code from networks n
        join points p on p.network_id = n.id where p.id = $1`, [who.point_id]);
    const row = r.rows[0];
    if (!row) return null;
    const base = process.env.PUBLIC_BASE_URL ?? '';
    return {
      code: row.join_code,
      url: `${base}/join`,
      text: `Приглашаем точку в сеть «${row.name}».\n` +
            `Откройте ${base}/join и введите код ${row.join_code}.\n` +
            `Дальше точка запускается сама: каналы, прайс, сотрудники.`,
    };
  });
}
