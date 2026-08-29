'use client';
/**
 * Добавление артикула в прайс точки и правка цены.
 *
 * Прайс приходит предзаполненным из каталога сети — но это начало, а не
 * окончательный список: каталог сети всегда шире того, что держит отдельная
 * точка. Одна работает с матовыми, другая с хромом, третья только с PPF.
 * Раньше изменить это было нечем вовсе.
 *
 * Язык взят с той же страницы: строка артикула, тумблер, кислота на горячем,
 * ошибка на розовом. Новых значений нет.
 */
import { useState, useTransition } from 'react';
import { addToPrice, removeFromPrice, setPrice } from '@/lib/pricing';

type Item = {
  id: string; sku: string; name: string; brand: string; finish: string;
  category: string; zone_code: string | null;
  base_kopecks: number | null; corridor_pct: number;
};

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');

export function AddFromCatalog({ items }: { items: Item[] }) {
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, true>>({});
  const [pending, start] = useTransition();

  if (!items.length) {
    return (
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
        Весь каталог сети уже в вашем прайсе. Новые артикулы появятся здесь,
        как только сеть их заведёт.
      </span>
    );
  }

  const add = (it: Item) => start(async () => {
    setErr(null);
    const r = await addToPrice(it.id, it.zone_code ?? 'full_body');
    if (!r.ok) { setErr(r.error); return; }
    setDone(d => ({ ...d, [it.id]: true }));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {err && (
        <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
      )}
      {items.map(it => (
        <div key={it.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#FFFFFF", borderRadius: "18px", padding: "12px 15px", boxShadow: "inset 0 0 0 1px #EDEDED" }}>
          <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>{it.name}</span>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
              {it.brand} {it.sku} · {it.finish}
              {it.base_kopecks !== null && ` · база сети ${rub(it.base_kopecks)} ₽`}
              {it.corridor_pct > 0 && ` · коридор ±${it.corridor_pct}%`}
            </span>
          </div>
          <button onClick={() => add(it)} disabled={pending || !!done[it.id]}
            style={{ background: done[it.id] ? "#F5F5F5" : "#DEF23B", borderRadius: "999px", padding: "9px 16px", border: 0, flex: "none", cursor: done[it.id] ? "default" : "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: done[it.id] ? "#9A9A9A" : "#111111" }}>
              {done[it.id] ? 'В прайсе' : 'Добавить'}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Цена артикула. Правится на месте, потому что владелец меняет её чаще, чем
 * что-либо ещё на этом экране, и уводить его ради этого на отдельную форму
 * незачем.
 *
 * Коридор наценки сети проверяет база. Отказ показываем целиком: в нём
 * названы и допуск, и базовая цена, чтобы было понятно, что менять.
 */
export function PriceCell({ id, kopecks, removable }: {
  id: string; kopecks: number; removable: boolean;
}) {
  const [value, setValue] = useState(String(Math.round(kopecks / 100)));
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () => {
    const n = Number(value.replace(/\s/g, ''));
    if (!Number.isFinite(n) || n * 100 === kopecks) return;
    start(async () => {
      const r = await setPrice(id, n);
      setErr(r.ok ? null : r.error);
      if (!r.ok) setValue(String(Math.round(kopecks / 100)));
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flex: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input value={value} inputMode="numeric" aria-label="Цена, ₽"
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          disabled={pending}
          style={{ width: "86px", textAlign: "right", fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", border: 0, borderBottom: err ? "1.5px solid #D93F45" : "1.5px solid transparent", background: "transparent", outline: "none", fontFamily: "inherit", padding: "1px 0" }} />
        {removable && (
          <button onClick={() => start(async () => {
              const r = await removeFromPrice(id);
              setErr(r.ok ? null : r.error);
            })}
            aria-label="Убрать артикул из прайса" disabled={pending}
            style={{ width: "22px", height: "22px", borderRadius: "999px", background: "transparent", border: 0, cursor: "pointer", color: "#C4C4C4", fontSize: "15px", lineHeight: 1, padding: 0, flex: "none" }}>×</button>
        )}
      </div>
      {err && (
        <span style={{ fontSize: "10.5px", color: "#D93F45", maxWidth: "220px", textAlign: "right", lineHeight: "1.35" }}>{err}</span>
      )}
    </div>
  );
}
