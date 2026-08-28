import { OpsFrame, OpsCard, OpsHead, OpsNav, OpsRow } from '@/screens/ops';
import { schedule } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const DOW = ['вс','пн','вт','ср','чт','пт','сб'];
const KIND: Record<string, string> = { measure: 'Замер', work: 'Работа', handover: 'Выдача' };

/** Расписание постов. Загрузка считается по занятым часам, а не по числу записей. */
export default async function SchedulePage() {
  const [s, b] = await Promise.all([schedule(), budget()]);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0); return d;
  });
  const inDay = (d: Date, iso: string) => {
    const t = new Date(iso); return t.toDateString() === d.toDateString();
  };
  const busyHours = s.appts.reduce((a, x) => a +
    (x.ends_at ? (+new Date(x.ends_at) - +new Date(x.starts_at)) / 3.6e6 : 0.33), 0);
  const capacity = Math.max(1, s.bays.length) * 7 * 9;
  const load = Math.round((busyHours / capacity) * 100);

  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard gap="18px">
        <OpsHead title="Неделя" note={`${s.bays.length || 2} поста · загрузка ${load}%`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: "8px" }}>
          {days.map((d, i) => {
            const items = s.appts.filter(a => inDay(d, a.starts_at));
            return (
              <div key={i} style={{ background: "#F7F7F7", borderRadius: "16px", padding: "12px 10px", minHeight: "170px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#9A9A9A" }}>{DOW[d.getDay()]}</span>
                  <span style={{ fontSize: "16px", fontWeight: "500" }}>{d.getDate()}</span>
                </div>
                {items.map(a => (
                  <div key={a.id} style={{ background: a.kind === 'measure' ? "#DEF23B" : "#111111", borderRadius: "11px", padding: "8px 9px", display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: "500", color: a.kind === 'measure' ? "#111111" : "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>
                      {new Date(a.starts_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {KIND[a.kind]}</span>
                    <span style={{ fontSize: "9.5px", color: a.kind === 'measure' ? "rgba(17,17,17,.6)" : "#9A9A9A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.client_name ?? (a.vehicle || "—")}</span>
                  </div>
                ))}
                {items.length === 0 && (
                  <span style={{ marginTop: "auto", fontSize: "10px", color: "#C4C4C4", textAlign: "center" }}>свободно</span>
                )}
              </div>
            );
          })}
        </div>
      </OpsCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/schedule" />
        <OpsCard gap="10px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Загрузка постов на неделю</span>
          <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{load}%</span>
          <div style={{ height: "8px", borderRadius: "999px", background: "#EFEFEF", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, load)}%`, height: "100%", background: "#DEF23B" }}></div>
          </div>
          <span style={{ fontSize: "12px", color: "#9A9A9A" }}>
            Пустой пост — прямой убыток. Ради этой цифры владелец и смотрит сводку.</span>
        </OpsCard>
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ближайшие</span>
          {s.appts.slice(0, 5).map(a => (
            <OpsRow key={a.id} tone={a.kind === 'measure' ? 'warm' : 'plain'}
              title={`${KIND[a.kind]} · ${a.client_name ?? '—'}`}
              sub={`${new Date(a.starts_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}${a.vehicle ? ` · ${a.vehicle}` : ''}`} />
          ))}
          {s.appts.length === 0 && (
            <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Записей пока нет</span>
          )}
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
