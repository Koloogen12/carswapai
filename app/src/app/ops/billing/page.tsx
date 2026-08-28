import { OpsFrame, OpsCard, OpsHead, OpsNav, OpsRow, rub } from '@/screens/ops';
import { billing } from '@/lib/ops';

export const dynamic = 'force-dynamic';
const CAT: Record<string, string> = {
  film: 'Плёнка', ppf: 'PPF', tint: 'Тонировка', wheel: 'Диски',
  interior: 'Салон', trim: 'Обвес', starlight: 'Звёздное небо', service: 'Работы',
};

/**
 * Подписка и лимиты.
 *
 * В-5 · неожиданный счёт весит вдвое против положительного события, поэтому
 * расход показан всегда, а не только при превышении. Порог 80% меняет тон
 * на светлую кислоту, а не на красный: лимит не должен выглядеть поломкой,
 * иначе владелец читает его как «сломалось» и звонит в управляющую компанию.
 */
export default async function BillingPage() {
  const { sub, budget: b, byCat } = await billing();
  const pct = b.hard_limit ? Math.round((b.spent_kopecks / b.hard_limit) * 100) : 0;
  const tone = pct >= 100 ? '#D93F45' : pct >= 80 ? '#EAF77E' : '#DEF23B';
  const classA = byCat.filter(x => x.render_class === 'A').reduce((a, x) => a + x.cost, 0);
  const classB = byCat.filter(x => x.render_class === 'B').reduce((a, x) => a + x.cost, 0);

  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard gap="18px">
        <OpsHead title="Подписка точки"
          note={sub ? `активна до ${new Date(sub.period_end).toLocaleDateString('ru-RU')}` : 'не оформлена'} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "12px" }}>
          {[['Тариф', sub?.plan === 'point' ? 'Точка' : sub?.plan ?? '—',
             sub ? `${rub(sub.price_kopecks)} ₽ в месяц` : ''],
            ['Израсходовано на генерации', `${rub(b.spent_kopecks)} ₽`, `${pct}% лимита`],
            ['Остаток до жёсткого стопа', `${rub(Math.max(0, b.hard_limit - b.spent_kopecks))} ₽`,
             b.hard_reached ? 'стоп активен' : 'работает']].map(([l, v, s]) => (
            <div key={l} style={{ background: "#F7F7F7", borderRadius: "18px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>{l}</span>
              <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{v}</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ height: "10px", borderRadius: "999px", background: "#EFEFEF", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: tone }}></div>
          </div>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
            Мягкий потолок {rub(b.soft_limit)} ₽ — предупреждение. Жёсткий {rub(b.hard_limit)} ₽ —
            останавливаются только генерации на внешней модели. Тонировка, окрас дисков и цвет
            кузова считаются у нас и работают всегда: карточка уходит клиенту в любом случае.
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Из чего сложился расход</span>
          {byCat.length === 0
            ? <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>В этом месяце генераций не было</span>
            : byCat.map((x, i) => (
              <OpsRow key={i} tone={x.render_class === 'A' ? 'acid' : 'plain'}
                title={`${CAT[x.category] ?? x.category} · класс ${x.render_class}`}
                sub={x.render_class === 'A' ? 'считается у нас, внешняя модель не вызывается'
                                            : 'внешняя модель, тарифицируется'}
                right={<span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                  {x.n} шт · {rub(x.cost)} ₽</span>} />
            ))}
        </div>
      </OpsCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/billing" />
        <OpsCard gap="10px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Доля класса A в расходе</span>
          <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>
            {classA + classB ? Math.round((classA / (classA + classB)) * 100) : 0}%</span>
          <span style={{ fontSize: "12px", color: "#9A9A9A", lineHeight: "1.5" }}>
            Чем выше доля, тем дешевле обходится точка: класс A стоит доли копейки
            и не зависит от внешнего вендора.
          </span>
        </OpsCard>
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Кто снимает жёсткий стоп</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Управляющая компания, за два действия, с показом влияния на маржу.
            Точка стоп снять не может — иначе потолок перестаёт быть потолком.
          </span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
