import { whoAmI } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { Card, CardHead } from '@/screens/cabinet';
import { crmClients } from '@/lib/reports';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  created: 'Наряд создан', in_work: 'В работе', done: 'Выдано',
};

/**
 * Экраны 47–48 · карточки клиентов.
 * Учётный слой обслуживает примерку и точкой входа не является: сюда попадают
 * из диалога, а не наоборот.
 */
export default async function CrmPage() {
  const me = await whoAmI();
  const [rows, b] = await Promise.all([crmClients(), budget()]);
  return (
    <Frame pad="26px 28px 30px" gap="16px">
      <AppBar active="crm" pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <Card gap="16px">
        <CardHead title="Клиенты точки"
          note="карточки заводятся сами из диалогов · ручного ввода нет" />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.map(r => {
            const v = r.vehicle as { make?: string; model?: string; year?: number; plate?: string };
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#6E6E6E", flex: "none" }}>
                  {r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{r.name}</span>
                  <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                    {r.phone} · {v.make} {v.model} {v.year} · {v.plate}</span>
                </div>
                <span style={{ fontSize: "11.5px", color: "#6E6E6E", flex: "none" }}>{r.tryons} примерок</span>
                {r.confirmed_at && (
                  <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 11px", flex: "none" }}>выбор подтверждён</span>
                )}
                {r.order_status && (
                  <span style={{ fontSize: "11px", fontWeight: "500", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "5px 11px", flex: "none" }}>
                    {STATUS[r.order_status] ?? r.order_status}</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </Frame>
  );
}
