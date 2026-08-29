/**
 * Шапка кабинета.
 *
 * Разметка перенесена из design/design/02-phase2-manager-inbox-dialog.dc.html,
 * блок 3, дочерний узел 0 — байт в байт, вплоть до 11.5px и borderRadius 13px.
 * Статические строки заменены пропсами, ни одно значение стиля не тронуто.
 */
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/domain';

export function AppBar({ pointName, user, role, spent, cap, active }: {
  pointName: string; user: string; role: string; spent: number; cap: number;
  /**
   * Текущий раздел. Без него подсветка была зашита: первая кнопка всегда
   * чёрная, остальные всегда белые — и на любой странице шапка показывала
   * «вы в инбоксе». Человек нажимает, переходит, а шапка говорит, что он
   * там же: продукт выглядит сломанным ровно в том месте, где им управляют.
   */
  active?: 'inbox' | 'crm' | 'price' | 'channels';
}) {
  const on = (k: string) => (active ?? 'inbox') === k;
  const pct = cap ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const initials = user.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </div>
        <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>{BRAND}</span>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#FFFFFF", borderRadius: "999px", padding: "5px 11px", marginLeft: "4px" }}>{pointName}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <a href="/inbox" aria-current={on('inbox') ? 'page' : undefined} style={{ width: "40px", height: "40px", borderRadius: on('inbox') ? "13px" : "999px", background: on('inbox') ? "#111111" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>
          <span style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B", boxShadow: "0 0 0 2px #111111" }}></span>
        </a>
        <a href="/crm" aria-current={on('crm') ? 'page' : undefined} style={{ width: "40px", height: "40px", borderRadius: on('crm') ? "13px" : "999px", background: on('crm') ? "#111111" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
        </a>
        <a href="/price" aria-current={on('price') ? 'page' : undefined} style={{ width: "40px", height: "40px", borderRadius: on('price') ? "13px" : "999px", background: on('price') ? "#111111" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></svg>
        </a>
        {/* Каналы. Без ссылки экран запуска точки недостижим: владелец
            попадал бы на него только по прямому адресу, а это ровно тот
            шаг, без которого в продукт не приходит ни одного обращения. */}
        <a href="/channels" aria-current={on('channels') ? 'page' : undefined} aria-label="Подключение каналов" style={{ width: "40px", height: "40px", borderRadius: on('channels') ? "13px" : "999px", background: on('channels') ? "#111111" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"><path d="M12 20v-5" /><path d="M8.5 15h7a2 2 0 0 0 2-2V9h-11v4a2 2 0 0 0 2 2z" /><path d="M9 6V3.5M15 6V3.5" /></svg>
        </a>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <a href="/owner" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Генерации</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "62px", height: "5px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "5px", background: pct >= 100 ? "#D93F45" : pct >= 80 ? "#EAF77E" : "#DEF23B" }}></div></div>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "#111111", whiteSpace: "nowrap" }}>{fmt(spent)}<span style={{ color: "#9A9A9A" }}>/{fmt(cap)}</span></span>
          </div>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 13px 6px 6px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>{initials}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>{user}</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.3" }}>{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Рубли без копеек, узкий неразрывный пробел между разрядами — как в макете. */
function fmt(kopecks: number) {
  return Math.round(kopecks / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
}

/**
 * Рамка экрана кабинета.
 *
 * В хендоффе она 1440×1000 фиксированных — это размер макета, не продукта.
 * README отдельно говорит, что брейкпоинтов между фиксированными ширинами нет
 * и это работа на нашей стороне. Поэтому ширина тянется, высота — по вьюпорту;
 * всё остальное (фон, радиус 30, отбивка 18, gap 14) из макета без изменений.
 */
/**
 * fill — оболочка ровно в окно, прокрутка живёт внутри колонок.
 *
 * По умолчанию высота задана через minHeight, и это правильно для экранов,
 * которые растут вниз: список клиентов, сотрудники, каналы. Но для диалога
 * это было дырой. Колонки там объявляют собственную прокрутку, а прокрутка
 * требует определённой высоты у предка — с minHeight её нет, колонки росли
 * под содержимое, оболочка вылезала за окно, а overflow: hidden срезал низ.
 *
 * Стоило это поля ответа: оно приколото к низу колонки диалога и оказывалось
 * ниже сгиба. Менеджер видел переписку и не видел, чем ответить.
 */
export function Frame({ children, pad = "18px", gap = "14px", fill = false }:
  { children: ReactNode; pad?: string; gap?: string; fill?: boolean }) {
  const h = fill
    ? { height: "calc(100vh - 44px)" }
    : { minHeight: "calc(100vh - 44px)" };
  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", ...h, margin: "0 auto", background: "#EFEFEF", borderRadius: "30px", padding: pad, display: "flex", flexDirection: "column", gap, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
