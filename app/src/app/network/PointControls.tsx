'use client';
/**
 * Управление точками сети · экран 58 карты.
 *
 * До этого статус точки был декоративным: отключённая за неуплату продолжала
 * собирать примерки и тратить генерации. Сеть считала её остановленной, а
 * расход шёл. Здесь появляется само действие — и последствие каждого статуса
 * названо словами, потому что человек отключает чужой бизнес и должен
 * понимать, что делает, до нажатия, а не после.
 *
 * Язык взят с той же страницы: кислота на горячем, красный только на
 * необратимом (архив), розовый на ошибке.
 */
import { useState, useTransition } from 'react';
import { setPointStatus, releaseBudgetStop } from '@/lib/network';
import { STATUS_MEANING, type PointStatus } from '@/lib/point-status';

type P = {
  id: string; name: string; status: string;
  spent: number; hard_cap_kopecks: number;
};

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
const NEXT: { key: PointStatus; label: string }[] = [
  { key: 'active', label: 'Включить' },
  { key: 'readonly', label: 'На паузу' },
  { key: 'suspended', label: 'Отключить' },
];

export function PointControls({ points }: { points: P[] }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    setErr(null);
    const r = await fn();
    if (!r.ok) setErr(r.error ?? 'Не получилось');
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      {err && (
        <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
      )}
      {points.map(p => {
        const over = p.hard_cap_kopecks > 0 && p.spent >= p.hard_cap_kopecks;
        return (
          <div key={p.id} style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{p.name}</span>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                  {STATUS_MEANING[(p.status as PointStatus)] ?? p.status}
                </span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", flex: "none", color: over ? "#D93F45" : "#111111" }}>
                {rub(p.spent)} / {rub(p.hard_cap_kopecks)} ₽
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {NEXT.filter(s => s.key !== p.status).map(s => (
                <button key={s.key} disabled={pending}
                  onClick={() => act(() => setPointStatus(p.id, s.key))}
                  style={{ background: s.key === 'suspended' ? "#FFFFFF" : "#111111",
                           color: s.key === 'suspended' ? "#D93F45" : "#FFFFFF",
                           boxShadow: s.key === 'suspended' ? "inset 0 0 0 1px #F0C9CB" : undefined,
                           borderRadius: "999px", padding: "8px 15px", border: 0,
                           cursor: pending ? "wait" : "pointer", fontFamily: "inherit",
                           fontSize: "12px", fontWeight: 500 }}>
                  {s.label}
                </button>
              ))}
              {over && (
                <button disabled={pending} onClick={() => act(() => releaseBudgetStop(p.id))}
                  style={{ background: "#DEF23B", borderRadius: "999px", padding: "8px 15px", border: 0, cursor: pending ? "wait" : "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: 500 }}>
                  Снять стоп по бюджету
                </button>
              )}
            </div>
          </div>
        );
      })}
      <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>
        Класс A при стопе продолжает работать: останавливается только то, что
        стоит денег. Точка не может снять стоп сама — иначе потолок перестаёт
        быть потолком (С-5).
      </span>
    </div>
  );
}
