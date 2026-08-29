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

export type PointStatus = 'active' | 'readonly' | 'suspended' | 'archived';

/**
 * Что значит каждый статус — словами, которые видит человек. Он отключает
 * чужой бизнес и должен понимать последствие до нажатия, а не после.
 */
export const STATUS_MEANING: Record<PointStatus, string> = {
  active: 'Работает как обычно',
  readonly: 'Подписка на паузе: новых примерок нет, уже отправленное открывается',
  suspended: 'Отключена: новых примерок нет, гараж снаружи не открывается',
  archived: 'Закрыта навсегда',
};

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
