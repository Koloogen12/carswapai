'use client';
/**
 * Панель примерки, зона 3 из design/design/11-inbox-dialog-detail.dc.html.
 *
 * О-8 · панель — часть экрана диалога. В этом файле нет ни одной ссылки,
 * уводящей со страницы, и её не должно появиться: между открытием диалога
 * и отправленной карточкой не может быть перехода.
 *
 * К-1 · переключатель светов показывает, какой свет смотрит менеджер,
 * но уходят всегда все три. Тумблера «отправить один» здесь нет и быть
 * не может — карточка без трёх светов не собирается в базе.
 */
import { useState, useTransition } from 'react';
import { ImageSlot } from '@/design/ImageSlot';
import { sendCard } from '@/lib/actions';
import type { PriceRow } from '@/lib/data';

const LIGHTS = [['day', 'День'], ['overcast', 'Пасмурно'], ['parking', 'Паркинг']] as const;

const rub = (k: number) => {
  const s = Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
  const i = s.lastIndexOf(' ');
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i)];
};

export function TryonPanel({ threadId, vehicle, prices, meters, blocked }: {
  threadId: string; vehicle: string; prices: PriceRow[]; meters: string | null;
  blocked: boolean;
}) {
  const [picked, setPicked] = useState<string[]>(
    prices.filter(p => p.in_stock).slice(0, 3).map(p => p.point_price_id));
  const [light, setLight] = useState<string>('day');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const chosen = picked.map(id => prices.find(p => p.point_price_id === id)!).filter(Boolean);
  const total = chosen.length ? Math.max(...chosen.map(c => c.price_kopecks)) : 0;
  const inStock = prices.filter(p => p.in_stock).length;

  const toggle = (id: string, ok: boolean) => {
    if (!ok) return;
    setPicked(p => p.includes(id) ? p.filter(x => x !== id)
      : p.length < 3 ? [...p, id] : [p[1], p[2], id]);
  };

  const send = () => start(async () => {
    const r = await sendCard(threadId, picked);
    setErr(r.ok ? null : r.error);
  });

  return (
    <div style={{ width: "356px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "0", overflowY: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Панель примерки</span>
          <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 9px" }}>1 шаг</span>
        </div>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>в этом же диалоге · без перехода</span>
      </div>

      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "12px 13px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{vehicle}</span>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
          распознано из обращения · правится в один тап</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Из прайса точки</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{inStock} в наличии из {prices.length}</span>
        </div>
        {prices.map(p => {
          const on = picked.includes(p.point_price_id);
          const [big, tail] = rub(p.price_kopecks);
          if (!p.in_stock) return (
            <div key={p.point_price_id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", borderRadius: "18px", padding: "10px 12px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.8" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
              </div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", lineHeight: "1.2", color: "#9A9A9A" }}>{p.name}</span>
                <span style={{ fontSize: "11px", color: "#C4C4C4" }}>нет на складе · не уйдёт клиенту</span>
              </div>
            </div>
          );
          return (
            <button key={p.point_price_id} onClick={() => toggle(p.point_price_id, true)}
              aria-pressed={on}
              style={{ display: "flex", alignItems: "center", gap: "12px", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "11px 13px", border: 0, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", background: on ? "rgba(255,255,255,.45)" : "#EFEFEF", flex: "none" }}>
                <ImageSlot mini src={swatch(p)} shape="rounded" radius={12} />
              </div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", lineHeight: "1.2" }}>{p.name}</span>
                <span style={{ fontSize: "11px", ...(on ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>{p.brand} {p.sku} · {p.finish}</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", letterSpacing: "-0.02em", flex: "none", fontVariantNumeric: "tabular-nums" }}>{big}<span style={{ opacity: ".55" }}>{tail}</span></span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Свет</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>уходят все три · К-1</span>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          {LIGHTS.map(([id, label]) => (
            <button key={id} onClick={() => setLight(id)} aria-pressed={light === id}
              style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", border: 0, cursor: "pointer", fontFamily: "inherit", borderRadius: "999px", padding: "8px 0",
                color: light === id ? "#FFFFFF" : "#6E6E6E",
                background: light === id ? "#111111" : "transparent" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Плёнка</span>
            <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{meters ? `${meters} м` : '—'}</span>
          </div>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Работа</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>3 дня</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px" }}>
          <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>К отправке</span>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{rub(total)[0]}<span style={{ color: "#9A9A9A" }}>{rub(total)[1]} ₽</span></span>
        </div>
        <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
          Оговорка про сверку оттенка уходит с карточкой. Отключить нельзя.
        </div>
        {err && (
          <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
        )}
        <button onClick={send} disabled={picked.length !== 3 || pending || blocked}
          style={{ background: picked.length === 3 && !blocked ? "#111111" : "#E2E2E2", color: picked.length === 3 && !blocked ? "#FFFFFF" : "#9A9A9A", borderRadius: "16px", padding: "15px", border: 0, fontSize: "14px", fontWeight: "500", cursor: picked.length === 3 && !blocked ? "pointer" : "not-allowed", fontFamily: "inherit", width: "100%" }}>
          {pending ? 'Отправляем…' : blocked ? 'Жёсткий стоп по бюджету' : 'Отправить клиенту'}
        </button>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>
          3 артикула × 3 света · 9 изображений одним сообщением
        </span>
      </div>
    </div>
  );
}

function swatch(p: PriceRow) {
  const map: Record<string, string> = {
    K75407: '/renders/wrap-02-satin-black.jpg', '970-070': '/renders/wrap-06-anthracite.jpg',
    'HX20-LG': '/renders/wrap-04-lagoon.jpg', 'GAL-OL': '/renders/wrap-03-olive.jpg',
    K75400: '/renders/wrap-02-satin-black.jpg', 'ATR-20': '/renders/wrap-01-silver.jpg',
  };
  return map[p.sku];
}
