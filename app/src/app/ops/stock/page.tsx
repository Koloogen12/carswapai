import { OpsFrame, OpsCard, OpsHead, OpsNav, OpsRow, rub } from '@/screens/ops';
import { stock } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

const REASON: Record<string, string> = {
  receipt: 'приход', consume: 'списание в наряд', writeoff: 'списание в брак', return: 'возврат',
};

/**
 * Рулоны и списание метража.
 *
 * Списание идёт из наряда автоматически, руками остаток не правится:
 * ручная правка расходится с фактом на складе в первый же месяц, а на
 * несовпадении метража стоит сверка рулона (МС-3).
 */
export default async function StockPage() {
  const [s, b] = await Promise.all([stock(), budget()]);
  const total = s.rolls.reduce((a, r) => a + Number(r.meters_left), 0);
  const live = s.rolls.filter(r => !r.depleted_at);
  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard gap="18px">
        <OpsHead title="Рулоны на точке"
          note="списание метража идёт из наряда автоматически" />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0 16px 4px" }}>
          <span style={{ flex: "1", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Артикул и партия</span>
          <span style={{ width: "180px", flex: "none", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Остаток</span>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Статус</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {s.rolls.map(r => {
            const left = Number(r.meters_left), init = Number(r.meters_initial);
            const pct = init ? (left / init) * 100 : 0;
            const dead = !!r.depleted_at;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: r.booked > 0 ? "#DEF23B" : dead ? "#F7F7F7" : "#F7F7F7", borderRadius: "16px", padding: "12px 16px", opacity: dead ? .55 : 1 }}>
                <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>{r.brand} {r.sku} · {r.name}</span>
                  <span style={{ fontSize: "10.5px", ...(r.booked > 0 ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>
                    партия {r.batch_number} · пришла {new Date(r.received_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div style={{ width: "180px", flex: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                    {left.toFixed(1)} м из {init.toFixed(0)}</span>
                  <div style={{ height: "6px", borderRadius: "999px", background: r.booked > 0 ? "rgba(255,255,255,.5)" : "#EFEFEF", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct < 15 ? "#D93F45" : "#111111" }}></div>
                  </div>
                </div>
                <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "11.5px", fontWeight: "500" }}>
                  {dead ? 'кончился' : r.booked > 0 ? 'в работе' : pct < 15 ? 'на исходе' : 'свободен'}</span>
              </div>
            );
          })}
        </div>
      </OpsCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/stock" />
        <OpsCard gap="10px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Метража на точке</span>
          <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{total.toFixed(1)} м</span>
          <span style={{ fontSize: "12px", color: "#9A9A9A" }}>{live.length} рулонов в обороте</span>
        </OpsCard>
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Движения</span>
          {s.moves.length === 0
            ? <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Списаний ещё не было</span>
            : s.moves.map((m, i) => (
              <OpsRow key={i} title={`${m.sku} · ${REASON[m.reason] ?? m.reason}`}
                sub={`${new Date(m.at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${m.order_number ? ` · наряд ${m.order_number}` : ''}`}
                right={<span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: Number(m.delta_meters) < 0 ? "#D93F45" : "#111111" }}>
                  {Number(m.delta_meters) > 0 ? '+' : ''}{Number(m.delta_meters).toFixed(1)} м</span>} />
            ))}
        </OpsCard>
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Почему остаток не правится руками</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Остаток ведут движения, а не поле ввода. Ручная правка расходится с фактом
            на складе в первый же месяц, а на несовпадении метража стоит сверка рулона:
            мастер увидит расхождение уже после того, как оно стало переклейкой.
            Списать в минус база не даст.
          </span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
