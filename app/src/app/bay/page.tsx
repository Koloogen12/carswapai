import { myOrders } from '@/lib/bay';

export const dynamic = 'force-dynamic';

/**
 * Наряды мастера, модули 08–09 захода 2.
 *
 * Вход по ссылке из мессенджера, без пароля. Цели нажатия 64px и крупный
 * шрифт включаются атрибутом data-surface="bay" — у поста читают на солнце
 * и работают в перчатках, это не «покрупнее для красоты».
 */
const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  in_work: { label: 'В работе', bg: '#DEF23B', fg: '#111111' },
  created: { label: 'Ждёт сверки рулона', bg: '#FBEEEF', fg: '#8A4448' },
  done:    { label: 'Сдано', bg: '#111111', fg: '#FFFFFF' },
};

export default async function BayListPage() {
  const orders = await myOrders();
  const active = orders.filter(o => o.status !== 'done');

  return (
    <div data-surface="bay" style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "820px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "0 4px" }}>
          <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Мои наряды</span>
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>
            Пост №2 · Сергей Панов · {active.length} в работе</span>
        </div>

        {orders.length === 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: "500" }}>Пока пусто</span>
            <span style={{ fontSize: "15px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Наряд появится здесь, когда менеджер закроет замер. Ссылка придёт
              вам в мессенджер — пароля не нужно.
            </span>
          </div>
        )}

        {orders.map(o => {
          const s = STATUS[o.status] ?? STATUS.created;
          return (
            <a key={o.id} href={`/bay/${o.id}`}
              style={{ background: "#FFFFFF", borderRadius: "26px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                <div style={{ width: "64px", height: "48px", borderRadius: "14px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {o.thumb && <img src={o.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.02em" }}>Наряд {o.number}</span>
                  <span style={{ fontSize: "14px", color: "#5A5A5A" }}>
                    {o.client_name ?? '—'} · {o.vehicle}</span>
                </div>
              </div>
              <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13px", color: "#767676" }}>Артикул</span>
                <span style={{ fontSize: "20px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{o.brand} {o.sku}</span>
                <span style={{ fontSize: "14px", color: "#5A5A5A" }}>
                  {o.item_name}{o.meters ? ` · ${o.meters} м` : ''}
                  {o.batch_verified_at ? ' · рулон сверен' : ''}</span>
              </div>
              <div style={{ background: s.bg, color: s.fg, borderRadius: "999px", padding: "13px 0", textAlign: "center", fontSize: "15px", fontWeight: "500" }}>
                {s.label}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
