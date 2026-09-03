import { whoAmI, currentUser } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { Card, CardHead } from '@/screens/cabinet';
import { staffList } from '@/lib/reports';
import { budget } from '@/lib/data';
import { pendingInvites } from '@/lib/staff';
import { AddStaffRow, InviteForm, RevokeButton } from './parts';

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
 *
 * ЧТО ЗДЕСЬ ЖИВОЕ. «Добавить сотрудника», «Отправить приглашение» и
 * «Отозвать» были подписями без единого поля и без единой кнопки: владелец
 * точки не мог завести менеджера, то есть второй шаг запуска у клиента не
 * работал вовсе. Теперь это действия; проверка прав стоит на сервере и в
 * политиках базы, а не в том, показана кнопка или нет.
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
  const me = await whoAmI();
  const claims = await currentUser();
  const owner = claims?.app_role === 'owner' || claims?.app_role === 'network_admin';
  const [staff, b] = await Promise.all([staffList(), budget()]);
  // Живые приглашения нужны только владельцу — их и спрашиваем только у него:
  // pendingInvites() сама требует владельца, и для менеджера это была бы
  // ошибка на ровном месте.
  const invites = owner ? await pendingInvites() : {};
  // «Это вы» определяется по идентификатору из сессии, а не по имени и не по
  // первой строке списка: раньше владельцем себя видел кто угодно, открывший
  // экран, а тёзка забрал бы чужую строку.
  const self = staff.find(s => s.id === claims?.user_id);

  return (
    <Frame pad="26px 28px 30px" gap="16px">
      <AppBar pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", alignItems: "start" }}>
        <Card gap="18px">
          <CardHead title="Сотрудники точки" note={`${staff.length} ${people(staff.length)} · 2 поста`} />
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {staff.map(u => {
              const mine = u.id === self?.id;
              const rights = RIGHTS[u.role] ?? [];
              const invited = invites[u.id];
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: mine ? "#DEF23B" : "#F7F7F7", borderRadius: "20px", padding: "15px 17px", opacity: u.active ? 1 : .6 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", flex: "none",
                    background: mine ? "#111111" : "#EFEFEF", color: mine ? "#DEF23B" : "#6E6E6E" }}>
                    {u.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "500" }}>{u.name}{mine ? ' · это вы' : ''}</span>
                    <span style={{ fontSize: "11.5px", ...(mine ? { opacity: ".65" } : { color: "#6E6E6E" }) }}>
                      {u.email ?? u.phone ?? '—'} · {ROLE_RU[u.role] ?? u.role}
                      {u.active ? '' : ' · доступ отозван'}
                      {u.active && invited ? ' · ссылка выписана, ещё не открыта' : ''}</span>
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
                  {!mine && owner && <RevokeButton userId={u.id} active={u.active} />}
                </div>
              );
            })}
          </div>

            {owner && <AddStaffRow />}

            <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Доступ привязан к точке, а не к человеку: уволившийся менеджер не уносит
                лиды и переписки. Отзыв — один клик, диалоги остаются в инбоксе точки.
              </span>
            </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <InviteForm canInvite={owner} />

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

/** «3 человека», но «5 человек»: подпись читают, и она не должна хромать. */
function people(n: number): string {
  const t = n % 100;
  if (t >= 11 && t <= 14) return 'человек';
  return n % 10 >= 2 && n % 10 <= 4 ? 'человека' : n % 10 === 1 ? 'человек' : 'человек';
}
