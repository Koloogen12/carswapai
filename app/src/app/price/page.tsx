import { AppBar, Frame } from '@/screens/chrome';
import { Card, CardHead, PriceRowView, rub } from '@/screens/cabinet';
import { priceList, budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

const CAT_RU: Record<string, string> = {
  film: 'Плёнка', ppf: 'Защита PPF', tint: 'Тонировка', wheel: 'Диски',
  interior: 'Салон', trim: 'Обвес', starlight: 'Звёздное небо', service: 'Работы',
};
const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-11.png',
  K75400: '/renders/render-12.png', 'ATR-20': '/renders/render-05.png',
};

/** Экран 55 · прайс точки. Сетка 1.35fr / 1fr из макета. */
export default async function PricePage() {
  const [rows, b] = await Promise.all([priceList(), budget()]);
  const groups = rows.reduce<Record<string, typeof rows>>((m, r) => {
    (m[r.category] ??= []).push(r); return m;
  }, {});
  return (
    <Frame pad="26px 28px 30px" gap="16px">
      <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(groups).map(([cat, items]) => (
            <Card key={cat} gap="18px">
              <CardHead title={CAT_RU[cat] ?? cat}
                note={`${items.filter(i => i.in_stock).length} в наличии из ${items.length}`} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((i, n) => (
                  <PriceRowView key={i.point_price_id} img={THUMB[i.sku]} name={i.name}
                    sub={`${i.brand} ${i.sku} · ${i.finish}${i.in_stock ? '' : ' · нет на складе'}`}
                    price={rub(i.price_kopecks)} on={n === 0 && i.in_stock} muted={!i.in_stock} />
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card gap="14px">
            <CardHead title="Откуда берётся цена" />
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Прайс пришёл предзаполненным из каталога сети. Точка меняет цену внутри коридора,
              заданного управляющей компанией: попытка выйти за предел не сохранится —
              это проверка базы, а не подсказка формы.
            </span>
          </Card>
          <Card gap="14px">
            <CardHead title="Что видит клиент" />
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              В примерке и в гараже доступны только позиции этого прайса. Артикул, которого
              здесь нет, не появится ни в карточке, ни в публичной ссылке — ручной ввод
              артикула и цены в продукте отсутствует.
            </span>
          </Card>
        </div>
      </div>
    </Frame>
  );
}
