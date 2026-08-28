/**
 * Карточки кабинета.
 *
 * Разметка из design/design/06-phase6-owner-network.dc.html — блоки прайса,
 * сводки и панели сети. Карточка кабинета: белая, радиус 26, отбивка 26/28.
 * Показатель: подпись 12px #9A9A9A, число 38px/500 с трекингом −0.04em
 * и line-height 1 — цифра должна читаться как цифра, а не как заголовок.
 */
import type { ReactNode } from 'react';

export function Card({ children, acid, pad = "26px 28px", gap = "16px" }:
  { children: ReactNode; acid?: boolean; pad?: string; gap?: string }) {
  return (
    <div style={{ background: acid ? "#DEF23B" : "#FFFFFF", borderRadius: "26px",
      padding: pad, display: "flex", flexDirection: "column", gap }}>{children}</div>
  );
}

export function Kpi({ label, value, sub, acid, big }:
  { label: string; value: string; sub?: string; acid?: boolean; big?: boolean }) {
  return (
    <Card acid={acid} pad="24px 26px" gap="6px">
      <span style={{ fontSize: "12px", ...(acid ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: big ? "44px" : "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {sub && <span style={{ fontSize: "14px", ...(acid ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>{sub}</span>}
      </div>
    </Card>
  );
}

export function CardHead({ title, note }: { title: string; note?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px" }}>
      <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>{title}</span>
      {note && <span style={{ fontSize: "12px", color: "#9A9A9A", textAlign: "right" }}>{note}</span>}
    </div>
  );
}

export function PageHead({ eyebrow, title, note }:
  { eyebrow: string; title: string; note?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>{eyebrow}</span>
        <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em" }}>{title}</span>
      </div>
      {note && <span style={{ fontSize: "12.5px", color: "#6E6E6E", maxWidth: "400px", textAlign: "right", lineHeight: "1.45" }}>{note}</span>}
    </div>
  );
}

/** Строка прайса. Активная — заливка кислотой, тумблер справа чёрный. */
export function PriceRowView({ img, name, sub, price, on, muted }:
  { img?: string; name: string; sub: string; price: string; on?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "13px 16px", opacity: muted ? .55 : 1 }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img && <img src={img} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
      </div>
      <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontSize: "14px", fontWeight: "500" }}>{name}</span>
        <span style={{ fontSize: "11px", ...(on ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>{sub}</span>
      </div>
      <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", flex: "none" }}>{price}</span>
      <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: muted ? "#E2E2E2" : "#111111", position: "relative", flex: "none" }}>
        <span style={{ position: "absolute", right: muted ? "23px" : "3px", top: "3px", width: "18px", height: "18px", borderRadius: "999px", background: muted ? "#FFFFFF" : "#DEF23B" }}></span>
      </div>
    </div>
  );
}

export const rub = (k: number) =>
  Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
