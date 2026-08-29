import { whoAmI } from '@/lib/session';
import { OpsNav } from '@/screens/ops';
import { AppBar } from '@/screens/chrome';
import { schedule } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const DOW = ['вс','пн','вт','ср','чт','пт','сб'];

/**
 * Модуль 02 захода 2 · расписание постов.
 *
 * Это лента ресурсов, а не календарь: строка на пост, работа растянута
 * полосой на все свои дни, свободное — штриховка. Разница не косметическая:
 * оклейка занимает пост на три дня, и в клетках по дням этого не видно —
 * а именно из-за этого возникают накладки, ради которых экран и нужен.
 *
 * Ждущие слот стоят в свободной части ленты: свободный пост и ждущий клиент
 * рядом, чтобы накладку было видно раньше, чем она случится.
 */
export default async function SchedulePage() {
  const me = await whoAmI();
  const [s, b] = await Promise.all([schedule(), budget()]);
  const DAYS = 7;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
  const dayIndex = (iso: string) =>
    Math.floor((+new Date(iso) - +start) / 86400000);

  const bays = s.bays.length ? s.bays : [{ id: 'x', name: 'Пост №1', master: null }];
  let busy = 0;

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName={me.point} user={me.user} role={me.role}
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/schedule" />

        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Неделя</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>
                {bays.length} поста · загрузка {Math.round((s.appts.length / (bays.length * DAYS)) * 100)}%</span>
            </div>
            <div style={{ display: "flex", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "8px 15px" }}>Неделя</span>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", padding: "8px 15px" }}>Месяц</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ width: "120px", flex: "none" }}></span>
              {days.map((d, i) => (
                <span key={i} style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>
                  {DOW[d.getDay()]} {d.getDate()}</span>
              ))}
            </div>

            {bays.map(bay => {
              const mine = s.appts.filter(a => a.bay_id === bay.id)
                .map(a => ({ ...a, from: Math.max(0, dayIndex(a.starts_at)),
                             span: a.kind === 'measure' ? 1 : 3 }))
                .filter(a => a.from < DAYS);
              const cells: React.ReactNode[] = [];
              let cursor = 0;
              for (const a of mine) {
                if (a.from > cursor) {
                  cells.push(<Free key={`f${cursor}`} span={a.from - cursor} />);
                  cursor = a.from;
                }
                const span = Math.min(a.span, DAYS - cursor);
                busy += span;
                cells.push(
                  <div key={a.id} style={{ flex: String(span), background: a.kind === 'measure' ? "#DEF23B" : "#111111", borderRadius: "14px", height: "96px", padding: "11px 13px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: a.kind === 'measure' ? "#111111" : "#FFFFFF" }}>
                      {a.client_name ?? 'Клиент'}
                      {a.kind === 'measure'
                        ? ` · замер ${new Date(a.starts_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
                        : `${a.model ? ` · ${a.model}` : ''}${a.item_name ? ` · ${a.item_name.toLowerCase()}` : ''}`}
                    </span>
                    <span style={{ fontSize: "10.5px", ...(a.kind === 'measure' ? { opacity: ".65" } : { color: "#DEF23B" }) }}>
                      {a.kind === 'measure' ? '20 минут'
                        : `${a.order_number ? `наряд ${a.order_number}` : 'наряд не создан'}${a.batch_number ? ` · рулон ${a.batch_number} забронирован` : ''}`}
                    </span>
                  </div>
                );
                cursor += span;
              }
              if (cursor < DAYS) {
                const w = s.waiting[0];
                cells.push(
                  <div key="tail" style={{ flex: String(DAYS - cursor), background: "#F5F5F5", borderRadius: "14px", height: "96px", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                      {w ? `${w.name ?? 'Клиент'} · ждёт слот` : `свободно ${DAYS - cursor} дня`}</span>
                  </div>
                );
              }
              return (
                <div key={bay.id} style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                  <div style={{ width: "120px", flex: "none", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{bay.name}</span>
                    <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{bay.master ?? 'смена не назначена'}</span>
                  </div>
                  {cells}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                Три дня работ и два поста — накладка неизбежна без этой сетки.
                Слоты, которые видит клиент, берутся отсюда.
              </span>
            </div>
            <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
              <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                {s.waiting[0]
                  ? `${s.waiting[0].name ?? 'Клиент'} подтвердил цвет и ждёт слот. Свободные дни на посту — предложить ему в один клик.`
                  : 'Все, кто подтвердил цвет, уже записаны на замер. Свободные дни можно отдать под новые обращения.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Free({ span }: { span: number }) {
  return <div style={{ flex: String(span), background: "#F5F5F5", borderRadius: "14px", height: "96px" }}></div>;
}
