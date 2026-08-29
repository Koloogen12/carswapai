import { notFound } from 'next/navigation';
import { withGarage, LinkNotFound } from '@/lib/db';
import { Garage } from './Garage';
import { hasConsent } from '@/lib/garage';

export const dynamic = 'force-dynamic';

/**
 * Гараж-примерочная, экраны 24–39.
 *
 * Публичный вход по ссылке точки или сети. Г-1: ноль полей регистрации
 * до первой примерки — поэтому здесь нет ни авторизации, ни сотрудника.
 * Но «нет авторизации» не значит «нет арендаторного контекста»: раньше
 * запросы шли через `sys()`, то есть без претензии вовсе, и на боевой роли
 * вернули бы ноль строк — гараж просто не открылся бы. Теперь контекст
 * ставит `withGarage()`: роль `garage`, точка по публичному слагу, и RLS
 * из миграции 006 не пускает эту роль никуда, кроме самой точки и её
 * прайса. В прайсе по построению только то, что есть у ЭТОЙ точки (О-3).
 */
export default async function GaragePage({ params }: { params: { slug: string } }) {
  const consented = await hasConsent(params.slug);
  type Point = { id: string; name: string; network_id: string; brand: unknown };
  type Item = {
    point_price_id: string; sku: string; name: string; brand: string; category: string;
    finish: string; price_kopecks: number; in_stock: boolean; hex: string | null;
  };

  let data: { point: Point | undefined; items: Item[] };
  try {
    data = await withGarage(params.slug, async c => {
      const point = (await c.query<Point>(
        `select p.id, p.name, p.network_id, coalesce(p.brand_override, n.brand) as brand
           from points p join networks n on n.id = p.network_id
          where p.public_slug = $1 and p.status <> 'archived'`, [params.slug])).rows[0];
      if (!point) return { point, items: [] as Item[] };

      const items = (await c.query<Item>(
        `select pp.id as point_price_id, ci.sku, ci.name, ci.brand, ci.category::text,
                ci.finish::text, pp.price_kopecks, pp.in_stock, ci.attrs->>'hex' as hex
           from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
          where pp.point_id = $1 and pp.zone_code = 'full_body' and ci.active
          order by ci.category, pp.price_kopecks desc`, [point.id])).rows;

      return { point, items };
    });
  } catch (e) {
    if (e instanceof LinkNotFound) notFound();
    throw e;
  }

  if (!data.point) notFound();

  return <Garage pointName={data.point.name} items={data.items} plate="А 432 ОР 77"  slug={params.slug} consented={consented} photoId={null} />;
}
