import { AppBar, Frame } from '@/screens/chrome';
import { Card, CardHead, Kpi, rub } from '@/screens/cabinet';
import { ownerSummary } from '@/lib/reports';
import { channelHealth } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Экраны 56–58 · сводка владельца. Четыре показателя, затем сделки поимённо. */
export default async function OwnerPage() {
  const [s, channels] = await Promise.all([ownerSummary(), channelHealth()]);
  const pct = s.cover.threads ? Math.round((s.cover.with_tryon / s.cover.threads) * 100) : 0;
  const sum = s.deals.reduce((a, d) => a + (d.price_kopecks as number), 0);
  const empty = s.deals.length === 0;

  return (
    <Frame pad="26px 28px 30px" gap="16px">
      <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
        spent={s.usage.spent_kopecks} cap={s.usage.hard_limit} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px" }}>
        <Kpi label="Входящих за неделю" value={String(s.cover.threads)} />
        <Kpi label="С примеркой" value={String(s.cover.with_tryon)} sub={`${pct}%`} />
        <Kpi acid label="Сделок, где цвет выбран по картинке" value={String(s.deals.length)}
          sub={empty ? undefined : `${rub(sum)} ₽`} />
        <Kpi label="Генерации за месяц" value={rub(s.usage.spent_kopecks)} sub="₽" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
        <Card gap="16px">
          <CardHead title="Сделки, где выбрали цвет по картинке"
            note="без единого напоминания менеджерам" />
          {empty ? (
            /* Экран 56 · сделок ещё нет. Пустой экран не молчит: он называет
               следующий ход, иначе владелец решает «опять не работает». */
            <div style={{ display: "flex", flexDirection: "column", gap: "10px",
              background: "#F7F7F7", borderRadius: "18px", padding: "22px 24px" }}>
              <span style={{ fontSize: "15px", fontWeight: "500" }}>Пока пусто, и это нормально</span>
              <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
                Сделка попадает сюда только после того, как клиент сам зафиксировал выбор.
                Атрибуция консервативная: без подтверждения строки не будет, даже если сделка
                состоялась. Первая сводка со сделками приходит на седьмой день.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {s.deals.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{d.name as string}</span>
                    <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{d.sku as string} · {d.item as string}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums", flex: "none" }}>
                    {new Date(d.confirmed_at as string).toLocaleDateString('ru-RU')}</span>
                  <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", flex: "none" }}>
                    {rub(d.price_kopecks as number)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card gap="14px">
            <CardHead title="Каналы" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {channels.map(ch => (
                <div key={ch.kind} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", textTransform: "capitalize" }}>{ch.kind}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    {!ch.can_initiate && <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>только ответ</span>}
                    <span style={{ fontSize: "11px", fontWeight: "500", borderRadius: "999px", padding: "4px 10px",
                      background: ch.status === 'connected' ? "#DEF23B" : "#FBEEEF",
                      color: ch.status === 'connected' ? "#111111" : "#D93F45" }}>
                      {ch.status === 'connected' ? 'подключён' : 'отвалился'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card gap="14px">
            <CardHead title="Сотрудники" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {s.staff.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "13.5px" }}>{u.name as string}</span>
                  <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                    {({ manager: 'Менеджер', master: 'Мастер', owner: 'Владелец',
                        network_admin: 'Сеть' } as Record<string, string>)[u.role as string]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Frame>
  );
}
