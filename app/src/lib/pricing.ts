'use server';
/**
 * Прайс точки: включить артикул, погасить, поправить цену.
 *
 * ЧТО ЗДЕСЬ НЕСЁТ ТУМБЛЕР. О-3 буквально: погашенный артикул не «скрыт в
 * списке», а не возвращается запросом вовсе — ни в панель менеджера, ни в
 * гараж клиента. Поэтому переключатель меняет `in_stock`, а не какое-нибудь
 * поле видимости, и запросы прайса уже отфильтрованы по нему.
 *
 * ЧТО ДЕРЖИТ БАЗА, А НЕ ЭТОТ КОД. Коридор наценки сети (С-4) проверяет
 * триггер `app.enforce_price_corridor()`. Здесь мы только пробуем и
 * показываем причину отказа человеку — дублировать проверку в коде значит
 * однажды разойтись с базой и разрешить то, что она запрещает.
 *
 * КТО МОЖЕТ. Только владелец точки: на экране сотрудников прямо написано
 * «менеджер не меняет прайс». Проверяем на сервере, а не прячем кнопку —
 * спрятанная кнопка не мешает вызвать действие напрямую.
 */
import { revalidatePath } from 'next/cache';
import { withTenant } from './db';
import { requireOwner } from './session';

export async function toggleSku(pointPriceId: string, inStock: boolean) {
  const who = await requireOwner();
  return withTenant(who, async c => {
    try {
      const r = await c.query(
        `update point_prices set in_stock = $2, updated_at = now()
          where id = $1`, [pointPriceId, inStock]);
      if (r.rowCount === 0) {
        // Ноль строк — это не «успешно ничего не сделали»: либо артикул чужой
        // точки, либо его нет. Молчать здесь нельзя, иначе владелец решит,
        // что погасил позицию, а она продолжит уходить клиентам.
        return { ok: false as const, error: 'Артикул не найден в прайсе вашей точки' };
      }
      revalidatePath('/price');
      revalidatePath('/inbox');
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

export async function setPrice(pointPriceId: string, rubles: number) {
  const who = await requireOwner();
  if (!Number.isFinite(rubles) || rubles < 0) {
    return { ok: false as const, error: 'Цена должна быть числом не меньше нуля' };
  }
  return withTenant(who, async c => {
    try {
      const r = await c.query(
        `update point_prices set price_kopecks = $2, updated_at = now()
          where id = $1`, [pointPriceId, Math.round(rubles * 100)]);
      if (r.rowCount === 0) {
        return { ok: false as const, error: 'Артикул не найден в прайсе вашей точки' };
      }
      revalidatePath('/price');
      return { ok: true as const };
    } catch (e) {
      // Сюда приходит и отказ по коридору сети — с текстом, в котором названы
      // и допуск, и база. Показываем его как есть: владелец должен понять,
      // что менять, а не гадать.
      return { ok: false as const, error: (e as Error).message };
    }
  });
}
