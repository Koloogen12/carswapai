/**
 * Рамка и элементы модулей операционки, заход 2.
 *
 * Разметка из design/design/08-pass2-point-operations.dc.html: общая рамка
 * 1440 · #EFEFEF · радиус 28 · отбивка 24, сетка 1.6fr / 1fr, gap 14;
 * карточка радиус 24, отбивка 24/26.
 */
import type { ReactNode } from 'react';
import { AppBar } from './chrome';

export function OpsFrame({ user, role, spent, cap, children }: {
  user: string; role: string; spent: number; cap: number; children: ReactNode;
}) {
  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName="JETCAR Мытищи" user={user} role={role} spent={spent} cap={cap} />
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px", alignItems: "start" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function OpsCard({ children, gap = "16px" }: { children: ReactNode; gap?: string }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap }}>{children}</div>
  );
}

export function OpsHead({ title, count, note }: { title: string; count?: number; note?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
        <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>{title}</span>
        {count !== undefined && (
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px" }}>{count}</span>
        )}
      </div>
      {note && <span style={{ fontSize: "12px", color: "#6E6E6E", textAlign: "right" }}>{note}</span>}
    </div>
  );
}

export function OpsNav({ active }: { active: string }) {
  const items = [['/ops/followups', 'Дожим'], ['/ops/schedule', 'Посты'],
                 ['/ops/stock', 'Склад'], ['/ops/billing', 'Подписка'],
                 ['/ops/events', 'События'], ['/ops/managers', 'Менеджеры']];
  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {items.map(([href, label]) => (
        <a key={href} href={href}
          style={{ fontSize: "12px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px",
            background: active === href ? "#111111" : "#FFFFFF",
            color: active === href ? "#FFFFFF" : "#6E6E6E" }}>{label}</a>
      ))}
    </div>
  );
}

/** Строка списка с миниатюрой 50×38, как в модуле дожима. */
export function OpsRow({ img, title, sub, tone = 'plain', right }: {
  img?: string; title: ReactNode; sub: ReactNode;
  tone?: 'plain' | 'alert' | 'warm' | 'acid'; right?: ReactNode;
}) {
  const bg = { plain: '#F7F7F7', alert: '#FBEEEF', warm: '#F5FBCB', acid: '#DEF23B' }[tone];
  const fg = tone === 'alert' ? '#8A4448' : '#111111';
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: bg, borderRadius: "18px", padding: "14px 16px" }}>
      {img && (
        <div style={{ width: "50px", height: "38px", borderRadius: "11px", overflow: "hidden", flex: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontSize: "14px", fontWeight: "500", color: fg }}>{title}</span>
        <span style={{ fontSize: "11.5px", color: tone === 'alert' ? '#8A4448' : tone === 'acid' ? 'rgba(17,17,17,.6)' : '#6E6E6E' }}>{sub}</span>
      </div>
      {right && <div style={{ display: "flex", gap: "6px", flex: "none", alignItems: "center" }}>{right}</div>}
    </div>
  );
}

export function OpsBtn({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span style={{ background: dark ? "#111111" : "#FFFFFF", borderRadius: "999px", padding: "9px 14px", cursor: "pointer" }}>
      <span style={{ fontSize: "12px", fontWeight: "500", color: dark ? "#FFFFFF" : "#111111" }}>{children}</span>
    </span>
  );
}

export const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
