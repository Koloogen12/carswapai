/**
 * Колонка диалога: карточка клиента, лента, поле ответа.
 *
 * Разметка из design/design/11-inbox-dialog-detail.dc.html, блок 1, зона 1 —
 * байт в байт. Скругления пузырей асимметричные и разные у входящего
 * (20 20 20 6) и у карточки (24 24 8 24); это не декор, а различение
 * «его реплика» и «наш ответ» без подписи.
 */
import { ImageSlot } from '@/design/ImageSlot';
import type { ThreadMessage } from '@/lib/data';

const CHANNEL: Record<string, { short: string; bg: string }> = {
  whatsapp: { short: 'WA', bg: '#25455B' }, telegram: { short: 'TG', bg: '#3A6B8F' },
  avito: { short: 'AV', bg: '#7A6A3F' }, max: { short: 'MAX', bg: '#4A3F7A' },
  web: { short: 'ГР', bg: '#3F5A4A' },
};

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function DialogPane({ name, phone, note, channel, messages, cards, pointName }: {
  name: string; phone: string | null; note: string; channel: string;
  messages: ThreadMessage[]; pointName: string;
  cards: Record<string, { title: string; variants: { name: string; sku: string;
    price: string; day: string; overcast: string; parking: string }[] }>;
}) {
  const ch = CHANNEL[channel] ?? CHANNEL.web;
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "24px", display: "flex", flexDirection: "column", minHeight: "0", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "16px 18px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", color: "#6E6E6E", flex: "none" }}>{initials}</div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.02em" }}>{name}</span>
            <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: ch.bg, color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{ch.short}</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>{phone}</span>
          </div>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{note}</span>
        </div>
      </div>

      <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px", background: "#F7F7F7" }}>
        {messages.map(m => m.body === 'Фото из диалога подхвачено автоматически' ? (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "9px", alignSelf: "center", background: "#FFFFFF", borderRadius: "999px", padding: "7px 14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.9" strokeLinecap="round"><rect x="3" y="5" width="18" height="15" rx="3" /><circle cx="12" cy="12" r="3.5" /></svg>
            <span style={{ fontSize: "11px", color: "#6E6E6E" }}>
              Фото из диалога подхвачено автоматически · {hhmm(m.sent_at)}</span>
          </div>
        ) : m.direction === 'in' ? (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start", maxWidth: "74%" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "20px 20px 20px 6px", padding: "13px 17px", fontSize: "14px", lineHeight: "1.45", color: "#2E2E2E", boxShadow: "0 1px 2px rgba(17,17,17,.04)" }}>{m.body}</div>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", paddingLeft: "6px" }}>{hhmm(m.sent_at)}</span>
          </div>
        ) : m.card_id && cards[m.card_id] ? (
          <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "98%", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
            <div style={{ background: "#111111", borderRadius: "24px 24px 8px 24px", padding: "14px", display: "flex", flexDirection: "column", gap: "11px", width: "530px", maxWidth: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 0" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>{cards[m.card_id].title}</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>{pointName}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {cards[m.card_id].variants.map((v, i) => (
                  <div key={v.sku} style={{ flex: "1", background: i === 0 ? "#DEF23B" : "#1C1C1E", borderRadius: "18px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ height: "96px", borderRadius: "12px", overflow: "hidden", background: i === 0 ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.06)" }}>
                      <ImageSlot src={v.day} shape="rounded" radius={12} />
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <div style={{ flex: "1", height: "52px", borderRadius: "9px", overflow: "hidden", background: i === 0 ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.06)" }}>
                        <ImageSlot mini src={v.overcast} shape="rounded" radius={9} />
                      </div>
                      <div style={{ flex: "1", height: "52px", borderRadius: "9px", overflow: "hidden", background: i === 0 ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.06)" }}>
                        <ImageSlot mini src={v.parking} shape="rounded" radius={9} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "0 3px 2px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "500", color: i === 0 ? "#111111" : "#FFFFFF", lineHeight: "1.2" }}>{v.name}</span>
                      <span style={{ fontSize: "9.5px", color: i === 0 ? "rgba(17,17,17,.6)" : "#9A9A9A" }}>{v.sku}</span>
                      <span style={{ fontSize: "12px", fontWeight: "500", color: i === 0 ? "#111111" : "#FFFFFF", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>{v.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* О-2 · строка честности внутри самой карточки, не подписью к ней */}
              <div style={{ background: "rgba(222,242,59,.14)", borderRadius: "14px", padding: "10px 12px", fontSize: "11.5px", lineHeight: "1.45", color: "#DEF23B" }}>
                Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.
              </div>
            </div>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", paddingRight: "6px" }}>
              {hhmm(m.sent_at)} · {m.delivery === 'delivered' ? 'доставлено' : m.delivery === 'failed' ? 'не доставлено' : 'отправляется'}
            </span>
          </div>
        ) : (
          <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
            <div style={{ background: "#111111", borderRadius: "20px 20px 6px 20px", padding: "13px 17px", fontSize: "14px", lineHeight: "1.45", color: "#FFFFFF" }}>{m.body}</div>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", paddingRight: "6px" }}>{hhmm(m.sent_at)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "13px 16px", borderTop: "1px solid #F0F0F0" }}>
        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "11px 16px" }}>
          <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Ответить {name.split(' ')[0]}…</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "11px 15px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Добрать вариант</span>
        </div>
      </div>
    </div>
  );
}
