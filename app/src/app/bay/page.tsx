import { masterBoard, bayRecord } from '@/lib/bay';

export const dynamic = 'force-dynamic';

/**
 * Модуль 09 захода 2 · наряды мастера.
 *
 * Разметка из design/design/08-pass2-point-operations.dc.html, блок 5,
 * рамка 1.2 — байт в байт: рамка 390×700, отбивка 28/14/18, gap 13,
 * активный наряд чёрной карточкой, заблокированный на #FBEEEF,
 * итог месяца прижат книзу через marginTop:auto.
 *
 * Порядок карточек — по цене ошибки, а не по дате: сначала то, что идёт
 * прямо сейчас, потом то, что встало и ждёт человека, и только потом
 * будущее. У поста смотрят одну секунду.
 */
export default async function BayListPage() {
  const b = await masterBoard();
  const initials = b.master.split(' ').map(w => w[0]).slice(0, 2).join('');

  /**
   * Расхождение — факт прошлого, сверка — факт настоящего.
   *
   * `masterBoard()` считает заблокированным любой наряд, у которого КОГДА-ТО
   * была запись о несовпавшем рулоне. После успешной сверки такая запись
   * никуда не девается, и доска показывала «рулон не сошёлся» на наряде,
   * который в эту секунду клеят. Смотрим на отметку сверки: она новее.
   */
  const checked = await Promise.all(
    b.blocked.map(async o => [o, await bayRecord(o.id)] as const));
  const blocked = checked.filter(([, r]) => !r?.batch_verified_at).map(([o]) => o);
  const cleared = checked.filter(([, r]) => !!r?.batch_verified_at).map(([o]) => o);
  const actives = [...(b.active ? [b.active] : []), ...cleared]
    .filter((o, i, a) => a.findIndex(x => x.id === o.id) === i);

  return (
    <div data-surface="bay" style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "700px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 14px 18px", gap: "13px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-0.03em" }}>Мои наряды</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{b.bay} · {b.master}</span>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>{initials}</div>
        </div>

        {actives.map(a => (
          <a key={a.id} href={`/bay/${a.id}`} style={{ background: "#111111", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "11px", textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px", color: "#111111" }}>сейчас в работе</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
                день {a.day_of ?? 1} из {a.days_total}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "64px", height: "48px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#2E2E2E" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.thumb && <img src={a.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>
                  Наряд {a.number} · {a.client.split(' ')[0]}</span>
                <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>
                  {a.brand} {a.sku}
                  {a.batch ? ` · партия ${a.batch}` : ''}
                  {a.meters ? ` · ${a.meters} м` : ''}</span>
              </div>
            </div>
            <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#111111" }}>Открыть</span>
            </div>
          </a>
        ))}

        {blocked.map(o => (
          <a key={o.id} href={`/bay/${o.id}`} style={{ background: "#FBEEEF", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "9px", textDecoration: "none" }}>
            <span style={{ fontSize: "11px", fontWeight: "500", color: "#D93F45" }}>
              заблокирован · рулон не сошёлся</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "64px", height: "48px", borderRadius: "12px", background: "#F0DADB", flex: "none" }}></div>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14.5px", fontWeight: "500", color: "#8A4448" }}>
                  Наряд {o.number} · {o.client.split(' ')[0]}</span>
                <span style={{ fontSize: "11.5px", color: "#8A4448" }}>ждём ответа менеджера</span>
              </div>
            </div>
            {/* Карточка и в макете ведёт в наряд, но там это было неочевидно:
                у поста цель нажатия должна быть видна, а не угадываться. */}
            <div style={{ background: "#FFFFFF", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#8A4448" }}>Открыть</span>
            </div>
          </a>
        ))}

        {/* Замер — тоже работа мастера, и открывается он с той же доски:
            карточка ведёт на приёмку, а не остаётся напоминалкой. */}
        {b.upcoming.map(u => (
          <a key={u.id} href={`/measure/${u.id}`} style={{ background: "#FFFFFF", borderRadius: "24px", padding: "16px", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
            <div style={{ width: "64px", height: "48px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {u.thumb && <img src={u.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14.5px", fontWeight: "500" }}>
                {u.number ? `Наряд ${u.number} · ` : ''}{u.client.split(' ')[0]}</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
                замер {u.when}{u.vehicle ? ` · ${u.vehicle}` : ''}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M10 6l6 6-6 6" /></svg>
          </a>
        ))}

        {!actives.length && blocked.length === 0 && b.upcoming.length === 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>Пока пусто</span>
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#5A5A5A" }}>
              Наряд появится, когда менеджер закроет замер. Ссылка придёт вам
              в мессенджер — пароля не нужно.</span>
          </div>
        )}

        {/* Мастера меряют себя не числом нарядов, а числом переклеек.
            Поэтому итог месяца — «сдано и переклеек», и он прижат книзу:
            смотрят его в конце смены, а не в начале. */}
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>За месяц</span>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>
              {b.month.done} сдано · {b.month.redo} переклеек</span>
          </div>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "6px 11px", flex: "none" }}>
            {b.month.verified}% со сверкой</span>
        </div>
      </div>
    </div>
  );
}
