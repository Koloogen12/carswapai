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

/**
 * Что точка может добавить в свой прайс: артикулы каталога сети, которых у
 * неё ещё нет.
 *
 * Каталог сети всегда шире того, что держит отдельная точка: одна работает с
 * матовыми, другая с хромом, третья только с PPF. Поэтому прайс приходит
 * предзаполненным, но это начало, а не окончательный список.
 */
export async function catalogToAdd() {
  const who = await requireOwner();
  return withTenant(who, async c => {
    const { rows } = await c.query(`
      select ci.id, ci.sku, ci.name, ci.brand, ci.finish, ci.category::text,
             np.zone_code, np.price_kopecks as base_kopecks,
             n.price_deviation_allowed_pct as corridor_pct
        from catalog_items ci
        join points p on p.id = $1
        join networks n on n.id = p.network_id
        left join network_prices np
               on np.catalog_item_id = ci.id and np.network_id = n.id
       where not exists (select 1 from point_prices pp
                          where pp.point_id = p.id
                            and pp.catalog_item_id = ci.id
                            and pp.zone_code = coalesce(np.zone_code, 'full_body'))
       order by ci.category, ci.brand, ci.name`, [who.point_id]);
    return rows as {
      id: string; sku: string; name: string; brand: string; finish: string;
      category: string; zone_code: string | null;
      base_kopecks: number | null; corridor_pct: number;
    }[];
  });
}

/**
 * Добавить артикул в прайс точки.
 *
 * Цена по умолчанию — базовая цена сети: так точка получает работающую строку
 * одним нажатием, а не пустую с нулём, которую нельзя отправить клиенту.
 * Поправить её можно тут же, и коридор наценки проверит база (С-4).
 */
export async function addToPrice(catalogItemId: string, zoneCode: string,
                                 rubles?: number) {
  const who = await requireOwner();
  return withTenant(who, async c => {
    try {
      const base = await c.query<{ price_kopecks: number }>(
        `select np.price_kopecks from network_prices np
           join points p on p.id = $1 and p.network_id = np.network_id
          where np.catalog_item_id = $2 and np.zone_code = $3`,
        [who.point_id, catalogItemId, zoneCode]);
      const kopecks = rubles !== undefined
        ? Math.round(rubles * 100)
        : base.rows[0]?.price_kopecks;
      if (kopecks === undefined) {
        // Базы сети нет и цену не назвали — строка была бы с нулём, а её
        // нельзя отправить клиенту. Отказываем внятно, а не заводим брак.
        return { ok: false as const,
                 error: 'У сети нет базовой цены на этот артикул — назовите свою' };
      }
      await c.query(
        `insert into point_prices (point_id, catalog_item_id, zone_code, price_kopecks)
         values ($1,$2,$3,$4)`,
        [who.point_id, catalogItemId, zoneCode, kopecks]);
      revalidatePath('/price');
      revalidatePath('/inbox');
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}

/**
 * Убрать артикул из прайса совсем.
 *
 * Это НЕ то же, что тумблер. Тумблер говорит «сейчас нет на складе» — артикул
 * остаётся в прайсе и вернётся одним касанием. Удаление говорит «мы этого не
 * делаем»: строка уходит, и вместе с ней уходит цена, которую точка когда-то
 * назначила.
 *
 * Поэтому удалять можно только то, по чему ещё не было примерок: иначе
 * позиция в уже отправленной карточке осталась бы без строки прайса, а О-3
 * держится именно на этой связи.
 */
export async function removeFromPrice(pointPriceId: string) {
  const who = await requireOwner();
  return withTenant(who, async c => {
    const used = await c.query(
      `select 1 from configuration_items where point_price_id = $1 limit 1`,
      [pointPriceId]);
    if (used.rows.length) {
      return { ok: false as const,
               error: 'По этому артикулу уже были примерки — его можно только погасить, '
                    + 'иначе отправленные карточки останутся без цены' };
    }
    try {
      const r = await c.query(`delete from point_prices where id = $1`, [pointPriceId]);
      if (r.rowCount === 0) {
        return { ok: false as const, error: 'Артикул не найден в прайсе вашей точки' };
      }
      revalidatePath('/price');
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  });
}
