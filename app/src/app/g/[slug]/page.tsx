import { notFound } from 'next/navigation';
import { sys } from '@/lib/db';
import { Garage } from './garage';

export const dynamic = 'force-dynamic';

/**
 * Гараж-примерочная, экраны 24–39.
 *
 * Публичный вход по ссылке точки или сети. Г-1: ноль полей регистрации
 * до первой примерки — поэтому здесь нет ни авторизации, ни арендаторного
 * контекста: каталог отдаётся по слагу точки, и в нём по построению только
 * то, что есть в прайсе ЭТОЙ точки (О-3).
 */
export default async function GaragePage({ params }: { params: { slug: string } }) {
  const point = (await sys<{ id: string; name: string; network_id: string; brand: unknown }>(
    `select p.id, p.name, p.network_id, coalesce(p.brand_override, n.brand) as brand
       from points p join networks n on n.id = p.network_id
      where p.public_slug = $1 and p.status <> 'archived'`, [params.slug]))[0];
  if (!point) notFound();

  const items = await sys<{
    point_price_id: string; sku: string; name: string; brand: string; category: string;
    finish: string; price_kopecks: number; in_stock: boolean; hex: string | null;
  }>(`select pp.id as point_price_id, ci.sku, ci.name, ci.brand, ci.category::text,
             ci.finish::text, pp.price_kopecks, pp.in_stock, ci.attrs->>'hex' as hex
        from point_prices pp join catalog_items ci on ci.id = pp.catalog_item_id
       where pp.point_id = $1 and pp.zone_code = 'full_body' and ci.active
       order by ci.category, pp.price_kopecks desc`, [point.id]);

  const models = await sys<{ id: string; make: string; model: string }>(
    `select id, make, model from vehicle_models order by make, model`);

  return <Garage pointName={point.name} slug={params.slug} items={items} models={models} />;
}
