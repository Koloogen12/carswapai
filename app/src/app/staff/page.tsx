import { AppBar, Frame } from '@/screens/chrome';
import { Card, CardHead } from '@/screens/cabinet';
import { staffList } from '@/lib/reports';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Экраны 05–06 · сотрудники точки и приглашение.
 *
 * Разметка из блока 5 хендоффа: сетка 1.4fr / 1fr, строка сотрудника
 * радиус 20, отбивка 15/17; свой — заливкой кислотой.
 *
 * Права привязаны к точке, а не к человеку: уволившийся менеджер не уносит
 * лиды, отзыв доступа — один клик владельца. Поэтому «Отозвать» стоит
 * прямо в строке, а не спрятано в карточке сотрудника.
 */
const RIGHTS: Record<string, string[]> = {
  owner: ['инбокс', 'CRM', 'прайс', 'деньги'],
  manager: ['инбокс', 'CRM'],
  master: ['наряды'],
};
const ROLE_RU: Record<string, string> = {
  owner: 'владелец точки', manager: 'менеджер', master: 'мастер',
};
const ALL = ['инбокс', 'CRM', 'прайс', 'деньги'];

export default async function StaffPage() {
  const [staff, b] = await Promise.all([staffList(), budget()]);
  const me = staff[0];

  return (
    <Frame pad="26px 28px 30px" gap="16px">
      <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
        spent={b.spent_kopecks} cap={b.hard_limit} />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", alignItems: "start" }}>
        <Card gap="18px">
          <CardHead title="Сотрудники точки" note={`${staff.length} человека · 2 поста`} />
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {staff.map(u => {
              const mine = u.id === me?.id;
              const rights = RIGHTS[u.role] ?? [];
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: mine ? "#DEF23B" : "#F7F7F7", borderRadius: "20px", padding: "15px 17px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", flex: "none",
                    background: mine ? "#111111" : "#EFEFEF", color: mine ? "#DEF23B" : "#6E6E6E" }}>
                    {u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "500" }}>{u.name}{mine ? ' · это вы' : ''}</span>
                    <span style={{ fontSize: "11.5px", ...(mine ? { opacity: ".65" } : { color: "#6E6E6E" }) }}>
                      {u.phone} · {ROLE_RU[u.role] ?? u.role}
                      {u.active ? '' : ' · доступ отозван'}</span>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flex: "none" }}>
                    {ALL.map(r => {
                      const has = rights.includes(r);
                      return (
                        <span key={r} style={{ fontSize: "10.5px", fontWeight: "500", borderRadius: "999px", padding: "5px 10px",
                          background: mine ? "rgba(255,255,255,.55)" : "#FFFFFF",
                          color: has ? "#111111" : "#C4C4C4" }}>{r}</span>
                      );
                    })}
                  </div>
                  {!mine && (
                    <span style={{ fontSize: "11.5px", color: "#9A9A9A", flex: "none", cursor: "pointer" }}>
                      {u.active ? 'Отозвать' : 'Вернуть'}</span>
                  )}
                </div>
              );
            })}
          </div>

            <div style={{ display: "flex", alignItems: "center", gap: "13px", background: "#F7F7F7", borderRadius: "20px", padding: "15px 17px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <span style={{ flex: "1", fontSize: "14.5px", color: "#6E6E6E" }}>Добавить сотрудника</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Доступ привязан к точке, а не к человеку: уволившийся менеджер не уносит
                лиды и переписки. Отзыв — один клик, диалоги остаются в инбоксе точки.
              </span>
            </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Экран 06</span>
              <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Приглашение сотруднику</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Имя</span>
                <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>Новый сотрудник</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Роль</span>
                <div style={{ display: "flex", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
                  <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#6E6E6E", padding: "9px 0" }}>Менеджер</span>
                  <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>Мастер</span>
                </div>
              </div>
            </div>

            <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "15px 17px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "66px", height: "66px", borderRadius: "14px", background: "#FFFFFF", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
                <svg width="100%" height="100%" viewBox="0 0 21 21" shapeRendering="crispEdges">
                  <rect width="21" height="21" fill="#FFFFFF" />
                  <g fill="#111111">
                    <rect x="0" y="0" width="7" height="1" /><rect x="0" y="0" width="1" height="7" />
                    <rect x="6" y="0" width="1" height="7" /><rect x="0" y="6" width="7" height="1" />
                    <rect x="2" y="2" width="3" height="3" />
                    <rect x="14" y="0" width="7" height="1" /><rect x="14" y="0" width="1" height="7" />
                    <rect x="20" y="0" width="1" height="7" /><rect x="14" y="6" width="7" height="1" />
                    <rect x="16" y="2" width="3" height="3" />
                    <rect x="0" y="14" width="7" height="1" /><rect x="0" y="14" width="1" height="7" />
                    <rect x="6" y="14" width="1" height="7" /><rect x="0" y="20" width="7" height="1" />
                    <rect x="2" y="16" width="3" height="3" />
                    <rect x="9" y="1" width="1" height="1" /><rect x="11" y="2" width="1" height="1" />
                    <rect x="9" y="4" width="1" height="1" /><rect x="11" y="5" width="1" height="1" />
                    <rect x="8" y="8" width="1" height="1" /><rect x="10" y="9" width="1" height="1" />
                    <rect x="12" y="8" width="1" height="1" /><rect x="9" y="11" width="1" height="1" />
                    <rect x="11" y="12" width="1" height="1" /><rect x="14" y="9" width="1" height="1" />
                    <rect x="16" y="10" width="1" height="1" /><rect x="18" y="9" width="1" height="1" />
                    <rect x="15" y="12" width="1" height="1" /><rect x="17" y="13" width="1" height="1" />
                    <rect x="19" y="11" width="1" height="1" /><rect x="9" y="15" width="1" height="1" />
                    <rect x="11" y="16" width="1" height="1" /><rect x="13" y="15" width="1" height="1" />
                    <rect x="15" y="17" width="1" height="1" /><rect x="17" y="16" width="1" height="1" />
                    <rect x="19" y="18" width="1" height="1" /><rect x="10" y="19" width="1" height="1" />
                    <rect x="12" y="18" width="1" height="1" /><rect x="14" y="20" width="1" height="1" />
                    <rect x="16" y="19" width="1" height="1" />
                  </g>
                </svg>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ссылка или QR</span>
                <span style={{ fontSize: "11px", color: "#6E6E6E", lineHeight: "1.4" }}>
                  Мастеру достаточно QR у поста: откроет камерой, пароль не нужен.</span>
              </div>
            </div>

            <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Отправить приглашение</span>
            </div>
          </div>

          {/* Разграничение ролей — ровно три. Больше продукту не нужно:
              каждая лишняя роль это настройка, которую кто-то должен
              поддерживать, а точка настраивать не будет. */}
          <div style={{ background: "#111111", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "11px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Права по ролям</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[['Менеджер', 'инбокс, диалоги, CRM, замеры'],
                ['Мастер', 'только наряды своего поста'],
                ['Владелец', 'всё плюс прайс, счёта, отключение']].map(([r, v]) => (
                <div key={r} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ fontSize: "12.5px", color: "#DDDDDD" }}>{r}</span>
                  <span style={{ fontSize: "12px", color: "#9A9A9A", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: "11.5px", color: "#8A8A8A", lineHeight: "1.5", marginTop: "2px" }}>
              Мастер не видит цен закупки и переписок. Менеджер не меняет прайс.
              Это единственное разграничение — больше ролей продукту не нужно.
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}
