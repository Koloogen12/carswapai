/**
 * Строка инбокса.
 *
 * Разметка из design/design/02-phase2-manager-inbox-dialog.dc.html, блок 3,
 * строки списка 0–6 — байт в байт. Шесть состояний примерки различаются
 * ровно теми значениями, что нарисованы в макете, и ничем больше:
 *
 *   состояние          фон строки  аватар    плашка
 *   просит ещё         #111111     #DEF23B   #DEF23B
 *   отправлена         #F7F7F7     #EFEFEF   #FFFFFF
 *   без примерки       #F7F7F7     #EFEFEF   #EFEFEF
 *   выбор подтверждён  #F7F7F7     #EFEFEF   #111111
 *   замер назначен     #F7F7F7     #EFEFEF   #FFFFFF
 *   не доставлено      #F7F7F7     #FBEEEF   #FBEEEF
 *
 * Ни один из этих цветов не выведен из токена: в макете они заданы прямо,
 * и подмена «похожим» токеном — это расхождение, которое потом ищут глазами.
 */
import type { CSSProperties } from 'react';

export type RowState = 'more' | 'sent' | 'none' | 'confirmed' | 'booked' | 'undelivered' | 'cold';

/** Плашка канала: 15px кружок с двухбуквенным кодом. Цвета из макета. */
const CHANNEL: Record<string, { short: string; bg: string; fg: string }> = {
  whatsapp: { short: 'WA',  bg: '#25455B', fg: '#FFFFFF' },
  telegram: { short: 'TG',  bg: '#3A6B8F', fg: '#FFFFFF' },
  avito:    { short: 'AV',  bg: '#7A6A3F', fg: '#FFFFFF' },
  max:      { short: 'MAX', bg: '#4A3F7A', fg: '#FFFFFF' },
  web:      { short: 'ГР',  bg: '#3F5A4A', fg: '#FFFFFF' },
};

const LOOK: Record<RowState, { row: string; avatar: string; pill: string; text: string;
                               pillFg?: string; dim?: boolean }> = {
  more:        { row: '#111111', avatar: '#DEF23B', pill: '#DEF23B', text: 'Просит ещё вариант' },
  sent:        { row: '#F7F7F7', avatar: '#EFEFEF', pill: '#FFFFFF', text: 'Отправлена · ждём' },
  none:        { row: '#F7F7F7', avatar: '#EFEFEF', pill: '#EFEFEF', text: 'Без примерки' },
  confirmed:   { row: '#F7F7F7', avatar: '#EFEFEF', pill: '#111111', text: 'Выбор подтверждён',
                 pillFg: '#FFFFFF' },
  booked:      { row: '#F7F7F7', avatar: '#EFEFEF', pill: '#FFFFFF', text: 'Замер назначен' },
  undelivered: { row: '#F7F7F7', avatar: '#FBEEEF', pill: '#FBEEEF', text: 'Не доставлено · повторить' },
  cold:        { row: '#F7F7F7', avatar: '#EFEFEF', pill: '', text: '', dim: true },
};

export function InboxRow({ href, name, channel, vehicle, ago, preview, state, detail, unread, active }: {
  href: string; name: string; channel?: string; vehicle: string; ago: string;
  preview: string; state: RowState; detail?: string; unread?: boolean; active?: boolean;
}) {
  const L = LOOK[state];
  const hot = state === 'more';
  const ch = channel ? CHANNEL[channel] : undefined;
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');

  const rowStyle: CSSProperties = L.dim
    ? { background: L.row, borderRadius: "18px", padding: "13px 14px", display: "flex", alignItems: "center", gap: "9px", opacity: ".7" }
    : { background: L.row, borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" };

  return (
    <a href={href} style={{ ...rowStyle, textDecoration: 'none', color: 'inherit',
      ...(active ? { boxShadow: 'inset 0 0 0 2px #111111' } : {}) }}>
      <div style={{ display: "flex", alignItems: "center", gap: "9px", ...(L.dim ? { flex: 1, minWidth: 0 } : {}) }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: L.avatar, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none", color: "#111111" }}>{initials}</div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500", color: hot ? "#FFFFFF" : "#111111" }}>{name}</span>
            {ch && <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: ch.bg, color: ch.fg, fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{ch.short}</span>}
          </div>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{vehicle}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flex: "none" }}>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>{ago}</span>
          {unread && <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B" }}></span>}
        </div>
      </div>
      {!L.dim && (
        <span style={{ fontSize: "12px", color: hot ? "#DDDDDD" : "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</span>
      )}
      {!L.dim && L.pill && (
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: L.pill, borderRadius: "999px", padding: "6px 11px", width: "max-content", maxWidth: "100%" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: L.pillFg ?? "#111111" }}></span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: L.pillFg ?? "#111111" }}>{detail ?? L.text}</span>
        </div>
      )}
    </a>
  );
}
