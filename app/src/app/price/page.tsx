import { Shell, NavLink } from '@/components/shell';
import { Card, Divider, Eyebrow, H, Pill, Price, Row, Sku, Stack } from '@/components/ui';
import { priceList } from '@/lib/data';

export const dynamic = 'force-dynamic';

const CAT_RU: Record<string, string> = {
  film: 'Плёнка', ppf: 'Защита PPF', tint: 'Тонировка', wheel: 'Диски',
  interior: 'Салон', trim: 'Обвес', starlight: 'Звёздное небо', service: 'Работы',
};

/** Экран 55 · прайс точки. У-3, О-3: единственный источник артикулов и цен. */
export default async function PricePage() {
  const rows = await priceList();
  const groups = rows.reduce<Record<string, typeof rows>>((m, r) => {
    (m[r.category] ??= []).push(r); return m;
  }, {});
  return (
    <Shell user="Ирина Ковалёва" role="Менеджер · JETCAR Мытищи"
      nav={<>
        <NavLink href="/inbox">Инбокс</NavLink>
        <NavLink href="/crm">Клиенты</NavLink>
        <NavLink href="/price" active>Прайс</NavLink>
        <NavLink href="/owner">Точка</NavLink>
      </>}>
      <Stack gap={20}>
        <div>
          <Eyebrow>Каталог точки</Eyebrow>
          <H level={1} style={{ marginTop: 4 }}>Прайс</H>
          <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)', marginTop: 8 }}>
            Артикулы и цены отсюда подставляются в примерку автоматически. Цена вне коридора,
            заданного сетью, не сохранится — это проверка базы, а не подсказка формы.
          </p>
        </div>
        {Object.entries(groups).map(([cat, items]) => (
          <Card key={cat}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Eyebrow>{CAT_RU[cat] ?? cat}</Eyebrow>
              <Pill>{items.length}</Pill>
            </Row>
            <Stack gap={0} style={{ marginTop: 10 }}>
              {items.map((i, n) => (
                <div key={i.point_price_id}>
                  {n > 0 && <Divider />}
                  <Row style={{ justifyContent: 'space-between', padding: '12px 0' }}>
                    <Row gap={12} style={{ minWidth: 0 }}>
                      <span aria-hidden style={{ width: 26, height: 26, borderRadius: 999,
                        background: i.hex ?? 'var(--surface)', flex: 'none',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 500 }}>{i.name}</span>
                        <Sku>{i.brand} {i.sku} · {i.finish}</Sku>
                      </Stack>
                    </Row>
                    <Row gap={12}>
                      {!i.in_stock && <Pill tone="alert">нет на складе</Pill>}
                      <Pill>класс {i.render_class}</Pill>
                      <Price kopecks={i.price_kopecks} size="var(--fs-h3)" />
                    </Row>
                  </Row>
                </div>
              ))}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Shell>
  );
}
