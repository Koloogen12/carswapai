'use client';
import { useMemo, useState } from 'react';
import { InboxRow, type RowState } from '@/screens/InboxRow';
import type { InboxRow as Row } from '@/lib/data';

/**
 * Список обращений и правая панель.
 *
 * Разметка из блока 3 фазы 2 хендоффа: колонка 392px, карточки 24px,
 * фильтры «Горячие сверху · Все · Мои». Порядок сортировки — не по свежести,
 * а по горячести: это подпись самого макета («наверх поднимается не свежее,
 * а горячее»), и она означает поведение, а не оформление.
 */

const ORDER: RowState[] = ['more', 'undelivered', 'sent', 'none', 'confirmed', 'booked', 'cold'];

function toState(r: Row): RowState {
  if (r.state === 'undelivered') return 'undelivered';
  if (r.state === 'confirmed') return 'confirmed';
  if (r.state === 'sent') return 'sent';
  const hours = (Date.now() - new Date(r.last_at).getTime()) / 3.6e6;
  return hours > 24 ? 'cold' : 'none';
}

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} ч` : `${Math.round(h / 24)} дн`;
}

export function InboxList({ rows, activeId, compact }: {
  rows: Row[]; activeId?: string; compact?: boolean;
}) {
  const [tab, setTab] = useState<'hot' | 'all' | 'mine'>('hot');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const withState = rows.map(r => ({ ...r, ui: toState(r) }));
    const filtered = withState.filter(r => {
      if (tab === 'mine' && !r.assigned_to) return false;
      if (!q) return true;
      const hay = `${r.client_name} ${r.phone ?? ''} ${r.vehicle?.plate ?? ''} ${r.vehicle?.make ?? ''} ${r.vehicle?.model ?? ''}`;
      return hay.toLowerCase().includes(q.toLowerCase());
    });
    if (tab === 'hot') {
      filtered.sort((a, b) => ORDER.indexOf(a.ui) - ORDER.indexOf(b.ui)
        || +new Date(b.last_at) - +new Date(a.last_at));
    } else {
      filtered.sort((a, b) => +new Date(b.last_at) - +new Date(a.last_at));
    }
    return filtered;
  }, [rows, tab, q]);

  const TABS: [typeof tab, string][] = [['hot', 'Горячие сверху'], ['all', 'Все'], ['mine', 'Мои']];

  const column = (
      <div style={{ width: compact ? "340px" : "392px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 15px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "0 4px" }}>
          <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.025em" }}>Обращения</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>{rows.length}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "10px 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Клиент, номер или артикул"
            aria-label="Поиск по обращениям"
            style={{ fontSize: "13px", color: "#111111", border: 0, background: 'transparent', outline: 'none', flex: 1, minWidth: 0, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
              style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", border: 0, cursor: 'pointer', fontFamily: 'inherit',
                color: tab === id ? "#FFFFFF" : "#6E6E6E",
                background: tab === id ? "#111111" : 'transparent',
                borderRadius: "999px", padding: "8px 0" }}>{label}</button>
          ))}
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px", minHeight: "0", overflowY: 'auto' }}>
          {list.map(r => (
            <InboxRow key={r.thread_id} href={`/inbox/${r.thread_id}`} name={r.client_name}
              channel={r.channel} state={r.ui} unread={r.unread > 0} ago={ago(r.last_at)}
              preview={r.last_text ?? ''}
              active={r.thread_id === activeId}
              vehicle={r.vehicle?.make
                ? `${r.vehicle.make} ${r.vehicle.model ?? ''} ${r.vehicle.year ?? ''} · ${r.vehicle.plate ?? ''}`.replace(/\s+/g, ' ').trim()
                : 'авто не распознано'} />
          ))}
        </div>
      </div>
  );

  if (compact) return column;

  return (
    <div style={{ flex: "1", display: "flex", gap: "12px", minHeight: "0" }}>
      {column}
      <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "40px" }}>
        <div style={{ width: "440px", display: "flex", flexDirection: "column", gap: "9px", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>
          </div>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Выберите диалог</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Наверху — то, что горит: обращения, где клиент только что попросил ещё вариант. Это состояние живёт минуты, поэтому единственное во всём списке выделено акцентом.</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "520px" }}>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Без примерки</span>
          <span style={{ fontSize: "11.5px", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Отправлена · ждём</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "7px 13px" }}>Просит ещё вариант</span>
          <span style={{ fontSize: "11.5px", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "7px 13px" }}>Выбор подтверждён</span>
          <span style={{ fontSize: "11.5px", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Замер назначен</span>
          <span style={{ fontSize: "11.5px", color: "#D93F45", background: "#FBEEEF", borderRadius: "999px", padding: "7px 13px" }}>Не доставлено</span>
        </div>
      </div>
    </div>
  );
}
