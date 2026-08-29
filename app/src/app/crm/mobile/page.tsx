import { followUps } from '@/lib/ops';
import { crmClients } from '@/lib/reports';

export const dynamic = 'force-dynamic';

/**
 * Модуль 09 захода 4 · CRM менеджера на телефоне.
 *
 * Разметка из блока 3, рамка 0 — байт в байт: рамка 390×760, отбивка 28/14/0,
 * фильтры-пилюли 8/13, карточка клиента 22 · 15, аватар 38px.
 *
 * Наверху не самый свежий клиент, а самый горячий: тот, кто подтвердил цвет
 * и молчит. Менеджер открывает это между заездами — у него секунды,
 * и порядок списка решает за него.
 */
export default async function CrmMobilePage() {
  const [pending, clients] = await Promise.all([followUps(), crmClients()]);
  const confirmed = clients.filter(c => c.confirmed_at).length;
  const measured = clients.filter(c => c.order_status).length;

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "760px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 14px 0", gap: "13px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            <span style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-0.03em" }}>Клиенты</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>{clients.length}</span>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>ИК</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", borderRadius: "999px", padding: "12px 15px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <span style={{ fontSize: "13.5px", color: "#9A9A9A" }}>Имя, номер или артикул</span>
        </div>

        <div style={{ display: "flex", gap: "6px", overflow: "hidden" }}>
          {[[`Подтвердили · ${confirmed}`, true], [`Замер · ${measured}`, false],
            ['В работе', false]].map(([label, on]) => (
            <span key={label as string} style={{ fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "8px 13px", flex: "none",
              color: on ? "#111111" : "#6E6E6E", background: on ? "#DEF23B" : "#FFFFFF" }}>{label as string}</span>
          ))}
        </div>

        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "8px", overflow: "hidden" }}>
          {pending.map(p => {
            const cold = p.silent_days >= 5;
            return (
              <a key={p.id} href={`/c/${p.configuration_id}`}
                style={{ background: cold ? "#FBEEEF" : "#FFFFFF", borderRadius: "22px", padding: "15px", display: "flex", flexDirection: "column", gap: "10px", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", flex: "none",
                    background: cold ? "#D93F45" : "#EFEFEF", color: cold ? "#FFFFFF" : "#6E6E6E" }}>
                    {(p.name ?? 'К К').split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "500", color: cold ? "#8A4448" : "#111111" }}>{p.name ?? 'Клиент'}</span>
                    <span style={{ fontSize: "11.5px", color: cold ? "#8A4448" : "#6E6E6E" }}>
                      {p.vehicle || 'авто не указано'} · {p.silent_days}-й день молчания</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums", color: cold ? "#8A4448" : "#111111" }}>
                    {Math.round(p.price_kopecks / 100).toLocaleString('ru-RU').replace(/ /g, ' ')}</span>
                </div>
                <div style={{ display: "flex", gap: "7px" }}>
                  <span style={{ flex: "1", textAlign: "center", background: cold ? "#111111" : "#F7F7F7", color: cold ? "#FFFFFF" : "#111111", borderRadius: "999px", padding: "11px 0", fontSize: "12.5px", fontWeight: "500" }}>
                    Позвонить</span>
                  <span style={{ flex: "1", textAlign: "center", background: cold ? "#FFFFFF" : "#111111", color: cold ? "#111111" : "#FFFFFF", borderRadius: "999px", padding: "11px 0", fontSize: "12.5px", fontWeight: "500" }}>
                    Напомнить</span>
                </div>
              </a>
            );
          })}
          {pending.length === 0 && (
            <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "18px", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Никто не подвис: все подтверждённые выборы дошли до записи на замер.
            </div>
          )}

          {clients.filter(c => !pending.some(p => p.name === c.name)).slice(0, 4).map(c => {
            const v = c.vehicle as { make?: string; model?: string };
            const done = c.order_status === 'done';
            return (
              <div key={c.id} style={{ background: "#FFFFFF", borderRadius: "22px", padding: "15px", display: "flex", alignItems: "center", gap: "11px", ...(done ? { opacity: ".7" } : {}) }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#F5F5F5", color: done ? "#9A9A9A" : "#6E6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", flex: "none" }}>
                  {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "500", color: done ? "#6E6E6E" : "#111111" }}>{c.name}</span>
                  <span style={{ fontSize: "11.5px", color: done ? "#9A9A9A" : "#6E6E6E" }}>
                    {v.make} {v.model}
                    {done ? ' · сдан без переклейки'
                      : c.order_status === 'in_work' ? ' · в работе, сдача по графику'
                      : c.measure_at
                        ? ` · замер ${new Date(c.measure_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                        : c.confirmed_at ? ' · выбор подтверждён' : ' · без примерки'}</span>
                </div>
                {!done && c.price_kopecks && (
                  <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(c.price_kopecks / 100).toLocaleString('ru-RU').replace(/ /g, ' ')}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* На мобильном таблица не восстановлена намеренно: список, горячий
            клиент сверху, два действия кнопками, остальное свёрнуто. Колонки
            на 390px не читаются, а менеджер смотрит это между заездами. */}
        <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#9A9A9A", padding: "0 4px" }}>
          На мобильном таблица не восстановлена: список, горячий клиент сверху,
          два действия кнопками, остальное свёрнуто.
        </span>

        {/* Нижняя навигация — три вкладки, как в макете. Больше не нужно:
            менеджер на телефоне работает между заездами, и лишний раздел
            здесь стоит дороже, чем на десктопе. */}
        <div style={{ background: "#FFFFFF", borderRadius: "28px 28px 42px 42px", padding: "14px 20px 26px", margin: "0 -14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {[['Обращения', false], ['Клиенты', true], ['Замеры', false]].map(([label, on], i) => (
            <a key={label as string} href={i === 0 ? '/inbox' : i === 1 ? '/crm/mobile' : '/ops/schedule'}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", opacity: on ? 1 : .4, textDecoration: "none" }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {i === 0 && <path d="M4 5h16v11H8l-4 4z" />}
                {i === 1 && <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-5.4 7-5.4s7 1.8 7 5.4" /></>}
                {i === 2 && <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></>}
              </svg>
              <span style={{ fontSize: "10px", fontWeight: "500" }}>{label as string}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
