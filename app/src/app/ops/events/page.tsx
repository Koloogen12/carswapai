import { OpsFrame, OpsCard, OpsNav } from '@/screens/ops';
import { events, type PointEvent } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Центр событий, модуль 07 захода 2.
 * Разметка из блока 5, рамка 1.0: карточка 24/22×24, событие радиус 16,
 * отбивка 13/15, иконка на тип, фон по серьёзности, прочитанные — opacity .65.
 */
const TONE = { alert: '#FBEEEF', warm: '#F5FBCB', plain: '#F7F7F7' } as const;
const FG = { alert: '#8A4448', warm: '#2E2E2E', plain: '#6E6E6E' } as const;

function Icon({ e }: { e: PointEvent }) {
  const st = { flex: 'none' as const, marginTop: '1px' };
  if (e.kind === 'roll_mismatch' || e.kind === 'channel') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="2" strokeLinecap="round" style={st}><path d="M6 6l12 12M18 6L6 18" /></svg>
  );
  if (e.kind === 'budget') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" style={st}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
  );
  if (e.kind === 'self_booked') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.9" strokeLinecap="round" style={st}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={st}><path d="M5 13l4.5 4.5L19 7" /></svg>
  );
}

export default async function EventsPage() {
  const [list, b] = await Promise.all([events(), budget()]);
  const fresh = list.filter(e => !e.read).length;

  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>События</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px" }}>{fresh} новых</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {list.length === 0 && (
            <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px", fontSize: "12.5px", color: "#6E6E6E" }}>
              Ничего не требует вас прямо сейчас.
            </div>
          )}
          {list.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: TONE[e.tone], borderRadius: "16px", padding: "13px 15px", ...(e.read ? { opacity: ".65" } : {}) }}>
              <Icon e={e} />
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", color: e.tone === 'alert' ? "#8A4448" : e.read ? "#6E6E6E" : "#111111" }}>{e.title}</span>
                <span style={{ fontSize: "11px", color: FG[e.tone], lineHeight: "1.4" }}>{e.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/events" />
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Почему здесь не аудит-лог</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Лог отвечает на вопрос «что произошло». Владельцу нужен другой:
            «что требует меня прямо сейчас». Поэтому сюда попадают только те
            состояния, на которые можно ответить действием — заблокированный
            наряд, аномалия расхода, запись через гараж без менеджера.
            Событие, на которое нельзя ответить, — это шум, из-за которого
            перестают смотреть и на настоящие.
          </span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
