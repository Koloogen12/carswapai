import { ownerSummary } from '@/lib/reports';
import { cashbox, stock } from '@/lib/ops';
import { budget } from '@/lib/data';
import { rub } from '@/screens/ops';

export const dynamic = 'force-dynamic';

/**
 * Модуль 08 захода 3 · сводка владельца с телефона.
 *
 * Разметка из блока 4, рамка 0 — байт в байт: рамка 390×740, отбивка 28/14/18,
 * акцентная карточка сделок 26 · 20, два показателя 20 · 15/16,
 * блок «требует вас» со стрелками 15px.
 *
 * Владелец открывает это в субботу утром с телефона. Поэтому наверху не
 * дашборд, а одна цифра, ради которой он платит, и сразу под ней — список
 * того, что требует именно его: долг, лимит, нехватка материала. Всё
 * остальное живёт в десктопном кабинете.
 */
export default async function OwnerMobilePage() {
  const [s, cash, st, b] = await Promise.all([ownerSummary(), cashbox(), stock(), budget()]);
  const pct = s.cover.threads ? Math.round((s.cover.with_tryon / s.cover.threads) * 100) : 0;
  const sum = s.deals.reduce((a, d) => a + (d.price_kopecks as number), 0);
  const usage = b.hard_limit ? Math.round((b.spent_kopecks / b.hard_limit) * 100) : 0;
  const short = st.rolls.find(r => Number(r.booked_meters) > Number(r.meters_left));

  const now = new Date();
  const week = Math.ceil(((+now - +new Date(now.getFullYear(), 0, 1)) / 86400000
    + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "740px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 14px 18px", gap: "13px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-0.03em" }}>JETCAR Мытищи</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
              неделя {week} · {now.toLocaleString('ru-RU', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>АЛ</div>
        </div>

        <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "11.5px", opacity: ".6" }}>Сделок, где цвет выбран по картинке</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{s.deals.length}</span>
            <span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rub(sum)} ₽</span>
          </div>
          <span style={{ fontSize: "11.5px", lineHeight: "1.45", opacity: ".7" }}>Без единого напоминания менеджерам</span>
        </div>

        <div style={{ display: "flex", gap: "9px" }}>
          {[['Входящих', String(s.cover.threads)], ['С примеркой', `${pct}%`]].map(([l, v]) => (
            <div key={l} style={{ flex: "1", background: "#FFFFFF", borderRadius: "20px", padding: "15px 16px", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{l}</span>
              <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Требует вас</span>

          {cash.overdue > 0 && (
            <Need tone="alert" href="/ops/cash"
              title={`Долг ${rub(cash.overdue)} ₽`}
              sub={`${cash.overdueCount} наряд · машина отдана без оплаты остатка`} />
          )}
          {usage >= 60 && (
            <Need tone="warm" href="/ops/billing"
              title={`Генерации на ${usage}%`} sub="поднять лимит за 4 000 ₽" />
          )}
          {short && (
            <Need tone="plain" href="/ops/stock"
              title={`${short.sku} не хватит на подтверждённый заказ`}
              sub="заявка на 25 м готова к отправке" />
          )}
          {cash.overdue === 0 && usage < 60 && !short && (
            <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px", fontSize: "12.5px", color: "#6E6E6E" }}>
              Ничего не требует вас. Точка работает сама.
            </div>
          )}
        </div>

        <a href="/owner" style={{ background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Кабинет целиком</span>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>прайс, касса, сеть</span>
          </div>
          <span style={{ background: "#111111", borderRadius: "999px", padding: "10px 16px", flex: "none" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Открыть</span>
          </span>
        </a>

        {/* Владелец не пользователь ядра, он потребитель следа: смотрит
            результат, а не работает в продукте. Отсюда и состав экрана. */}
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
            Владелец не пользователь ядра, он потребитель следа. В телефоне ему нужны
            три цифры и список того, что требует именно его решения.
          </span>
        </div>
      </div>
    </div>
  );
}

function Need({ tone, title, sub, href }: {
  tone: 'alert' | 'warm' | 'plain'; title: string; sub: string; href: string;
}) {
  const bg = { alert: '#FBEEEF', warm: '#F5FBCB', plain: '#F7F7F7' }[tone];
  const fg = tone === 'alert' ? '#8A4448' : '#111111';
  return (
    <a href={href} style={{ display: "flex", alignItems: "center", gap: "11px", background: bg, borderRadius: "16px", padding: "12px 14px", textDecoration: "none" }}>
      <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontSize: "12.5px", fontWeight: "500", color: fg }}>{title}</span>
        <span style={{ fontSize: "10.5px", color: tone === 'alert' ? '#8A4448' : tone === 'warm' ? '#2E2E2E' : '#6E6E6E' }}>{sub}</span>
      </div>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M9 6l6 6-6 6" /></svg>
    </a>
  );
}
