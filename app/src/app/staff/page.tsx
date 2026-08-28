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
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card gap="14px">
            <CardHead title="Пригласить сотрудника" />
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Одна ссылка. Сотрудник открывает её в своём мессенджере и сразу попадает
              в работу — регистрации и пароля нет.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F5F5F5", borderRadius: "999px", padding: "12px 16px" }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: "12.5px", color: "#6E6E6E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                carswap.ru/i/jetcar-myt/mgr-4417</span>
              <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "7px 13px", flex: "none" }}>Копировать</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px" }}>
              <div style={{ width: "84px", height: "84px", borderRadius: "14px", background: "#FFFFFF", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", padding: "8px", flex: "none" }}>
                {Array.from({ length: 49 }).map((_, i) => (
                  <span key={i} style={{ background: [0,1,2,5,6,7,9,13,14,16,20,21,23,27,28,30,34,35,36,37,41,42,43,48].includes(i) ? "#111111" : "transparent", borderRadius: "1px" }}></span>
                ))}
              </div>
              <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#6E6E6E" }}>
                Или QR — для мастера у поста: он открывает камерой и попадает
                сразу в наряды своей смены.
              </span>
            </div>
          </Card>

          <Card gap="14px">
            <CardHead title="Почему без пароля" />
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Доступ привязан к точке, а не к человеку. Уволившийся менеджер не уносит
              лиды: отзыв — один клик, и его ссылка перестаёт работать в тот же момент.
              У мастера руки грязные, и ввод пароля у поста означает, что запись не откроют.
            </span>
          </Card>
        </div>
      </div>
    </Frame>
  );
}
