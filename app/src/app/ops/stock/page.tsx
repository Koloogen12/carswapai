import { whoAmI } from '@/lib/session';
import { AppBar } from '@/screens/chrome';
import { OpsNav, rub } from '@/screens/ops';
import { stock } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png',
};

/**
 * Модули 03–04 захода 2 · рулоны и заявка на материал.
 *
 * Разметка из блока 3 — байт в байт: колонки 150 / 170 / 96, строка 16 · 11–12/15–16,
 * миниатюра 44×34, отсутствующий артикул под штриховкой.
 *
 * Ключевой столбец — «забронировано». Остаток сам по себе ничего не значит:
 * 9,6 м это много, пока под них не подтверждено 15,4 м. Именно из-за этого
 * столбца статус читается как «не хватит», а не как «есть».
 *
 * Флаг наличия не ручной: артикул без рулона гаснет в панели менеджера
 * и в гараже клиента сам.
 */
export default async function StockPage() {
  const me = await whoAmI();
  const [s, b] = await Promise.all([stock(), budget()]);
  const total = s.rolls.filter(r => !r.depleted_at)
    .reduce((a, r) => a + Number(r.meters_left), 0);
  const shortages = s.rolls.filter(r => Number(r.booked_meters) > Number(r.meters_left));
  const order = [...shortages.map(r => ({
    title: `${r.brand} ${r.sku} · ${r.name.toLowerCase()}`,
    sub: `нужно ${Number(r.booked_meters).toFixed(1)} м · есть ${Number(r.meters_left).toFixed(1)} м` })),
    ...s.missing.filter(m => Number(m.need) > 0).map(m => ({
      title: `${m.brand} ${m.sku} · ${m.name.toLowerCase()}`,
      sub: `нужно ${Number(m.need).toFixed(1)} м · нет на точке` }))];

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName={me.point} user={me.user} role={me.role}
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/stock" />

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Рулоны на точке</span>
                <span style={{ fontSize: "12px", color: "#9A9A9A" }}>
                  {s.rolls.length} артикулов · {total.toFixed(1)} м</span>
              </div>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>списание метража идёт из наряда автоматически</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0 16px 9px" }}>
                <span style={{ width: "44px", flex: "none" }}></span>
                <span style={{ flex: "1", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Артикул и партия</span>
                <span style={{ width: "150px", flex: "none", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Остаток</span>
                <span style={{ width: "170px", flex: "none", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Забронировано</span>
                <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Статус</span>
              </div>

              {s.rolls.map(r => {
                const left = Number(r.meters_left), init = Number(r.meters_initial);
                const booked = Number(r.booked_meters);
                const short = booked > left;
                const pct = init ? (left / init) * 100 : 0;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: short ? "#FBEEEF" : booked > 0 ? "#DEF23B" : "#F7F7F7", borderRadius: "16px", padding: "12px 16px" }}>
                    <div style={{ width: "44px", height: "34px", borderRadius: "9px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={THUMB[r.sku] ?? '/renders/render-05.png'} alt=""
                        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: short ? "#8A4448" : "#111111" }}>
                        {r.brand} {r.sku} · {r.name.toLowerCase()}</span>
                      <span style={{ fontSize: "10.5px", ...(short ? { color: "#8A4448" } : booked > 0 ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>
                        партия {r.batch_number} · пришла {new Date(r.received_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div style={{ width: "150px", flex: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: short ? "#8A4448" : "#111111", fontVariantNumeric: "tabular-nums" }}>
                        {left.toFixed(1)} м</span>
                      <div style={{ height: "4px", borderRadius: "999px", background: short ? "#F0DADB" : "rgba(255,255,255,.5)", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "4px", background: short ? "#D93F45" : "#111111" }}></div>
                      </div>
                    </div>
                    <span style={{ width: "170px", flex: "none", fontSize: "12px", color: short ? "#8A4448" : booked > 0 ? "rgba(17,17,17,.7)" : "#9A9A9A" }}>
                      {booked > 0 ? `${booked.toFixed(1)} м${r.booked_for ? ` · ${r.booked_for.split(' ')[0]}` : ''}` : '—'}</span>
                    <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "11.5px", fontWeight: short ? "600" : "500", color: short ? "#D93F45" : r.depleted_at ? "#9A9A9A" : "#111111" }}>
                      {short ? 'не хватит' : r.depleted_at ? 'кончился' : 'хватает'}</span>
                  </div>
                );
              })}

              {s.missing.map(m => (
                <div key={m.sku} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#FFFFFF", borderRadius: "16px", padding: "11px 15px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
                  <div style={{ width: "44px", height: "34px", borderRadius: "9px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#9A9A9A" }}>{m.brand} {m.sku} · {m.name.toLowerCase()}</span>
                    <span style={{ fontSize: "10.5px", color: "#C4C4C4" }}>нет на точке · автоматически скрыт в прайсе и в гараже</span>
                  </div>
                  <span style={{ width: "150px", flex: "none", fontSize: "13px", color: "#C4C4C4" }}>0 м</span>
                  <span style={{ width: "170px", flex: "none", fontSize: "12px", color: "#C4C4C4" }}>
                    {Number(m.need) > 0 ? `ждёт · ${Number(m.need).toFixed(1)} м` : '—'}</span>
                  <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A" }}>заказать</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                Флаг наличия в прайсе теперь не ручной: артикул гаснет в панели менеджера
                и в гараже клиента сам, когда рулона нет. Мастер сверяет рулон с записью —
                а система знает, что рулон вообще есть и метража хватит.
              </span>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Модуль 04</span>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Заявка на материал</span>
            </div>

            {order.length > 0 ? (
              <div style={{ background: "#FBEEEF", borderRadius: "18px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#8A4448" }}>
                  {order.length} подтверждённых {order.length === 1 ? 'выбор' : 'выбора'} без материала</span>
                <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#8A4448" }}>
                  Клиенты уже сказали «беру». Если материал не придёт до слота — переносим
                  замер, а это потеря на пустом месте.
                </span>
              </div>
            ) : (
              <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px", fontSize: "12.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                Материала хватает на все подтверждённые выборы. Заявка не нужна.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {order.map((o, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{o.title}</span>
                    <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>{o.sub}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", flex: "none" }}>+ 25 м</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[['Поставщик сети', 'Каталог JETCAR'], ['Срок поставки', '2 рабочих дня'],
                ['Сумма закупки', `${rub(order.length * 12000000)} ₽`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#6E6E6E" }}>{k}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Отправить заявку в сеть</span>
              </div>
              <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
                Заявка собирается из подтверждённых выборов, а не из ощущения владельца,
                что «плёнка заканчивается».
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "20px 26px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Движения метража</span>
          {s.moves.length === 0
            ? <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Списаний ещё не было</span>
            : s.moves.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}>
                <span style={{ flex: "1", fontSize: "12.5px" }}>
                  {m.sku} · {m.reason === 'consume' ? 'списание в наряд' : m.reason === 'receipt' ? 'приход' : m.reason}
                  {m.order_number ? ` · наряд ${m.order_number}` : ''}</span>
                <span style={{ fontSize: "12px", color: "#9A9A9A", flex: "none" }}>
                  {new Date(m.at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", flex: "none", color: Number(m.delta_meters) < 0 ? "#D93F45" : "#111111" }}>
                  {Number(m.delta_meters) > 0 ? '+' : ''}{Number(m.delta_meters).toFixed(1)} м</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
