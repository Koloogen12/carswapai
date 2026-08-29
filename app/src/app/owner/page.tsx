import { whoAmI } from '@/lib/session';
import { AppBar } from '@/screens/chrome';
import { ownerSummary } from '@/lib/reports';
import { rub } from '@/screens/cabinet';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Экран 57 · сводка на 7-й день.
 *
 * Разметка из design/design/06-phase6-owner-network.dc.html, блок 7 —
 * байт в байт: четыре показателя сверху, сетка 1.5fr / 1fr снизу,
 * карточка 26 · 26/28, строка сделки 20 · 14/16 с миниатюрой 52×40.
 *
 * Момент «ага» владельца — не проценты активации, а поимённая сделка.
 * Поэтому список именной, суммы в строке, и рядом стоит фраза о том,
 * что заполненность возникла без его напоминаний: это и есть превышение
 * прогноза «третий софт, который никто не заполняет».
 */
export default async function OwnerPage() {
  const me = await whoAmI();
  const [s, b] = await Promise.all([ownerSummary(), budget()]);
  const pct = s.cover.threads ? Math.round((s.cover.with_tryon / s.cover.threads) * 100) : 0;
  const sum = s.deals.reduce((a, d) => a + (d.price_kopecks as number), 0);
  const maxN = Math.max(1, ...s.byActor.map(a => a.n as number));
  const anomaly = s.byActor.find(a => (a.n as number) > 100 &&
    String(a.actor).startsWith('Гараж'));

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "30px", padding: "26px 28px 30px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <AppBar pointName={me.point} user={me.user} role={me.role}
          spent={b.spent_kopecks} cap={b.hard_limit} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px" }}>
          <Kpi label="Входящих за неделю" value={String(s.cover.threads)} />
          <Kpi label="С примеркой" value={String(s.cover.with_tryon)} sub={`${pct}%`} />
          <Kpi acid label="Сделок, где цвет выбран по картинке"
            value={String(s.deals.length)} sub={s.deals.length ? `${rub(sum)} ₽` : undefined} />
          <Kpi label="Генерации за месяц" value={rub(b.spent_kopecks)} sub="₽" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>
                Сделки, где выбрали цвет по картинке</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>без единого напоминания менеджерам</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {s.deals.length === 0 && (
                <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "18px 20px", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
                  Пока пусто, и это нормально. Сделка попадает сюда только после того,
                  как клиент сам зафиксировал выбор.
                </div>
              )}
              {s.deals.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px" }}>
                  <div style={{ width: "52px", height: "40px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {d.thumb as string && <img src={d.thumb as string} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "14.5px", fontWeight: "500" }}>
                      {d.name as string} · {d.vehicle as string}</span>
                    <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
                      {d.item as string} · подтвердил{' '}
                      {new Date(d.confirmed_at as string).toLocaleString('ru-RU',
                        { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {d.order_status === 'done' ? ' · сдан без переклейки'
                        : d.origin === 'garage' ? ' · пришёл из гаража по ссылке'
                        : d.measure_at ? ` · замер ${new Date(d.measure_at as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
                        : ' · ждёт слот замера'}
                    </span>
                  </div>
                  <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", flex: "none", fontVariantNumeric: "tabular-nums" }}>
                    {rub(d.price_kopecks as number)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
              <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Заполненность возникла сама: инструмент выгоден менеджеру в его собственную
                смену. Прогноз владельца на входе был «третий софт, который никто не заполняет».
              </span>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Расход генераций</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>поимённо</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {s.byActor.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ flex: "1", minWidth: 0, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.actor as string}</span>
                  <div style={{ width: "72px", height: "4px", flex: "none", backgroundImage: "repeating-linear-gradient(90deg,#D6D6D6 0 2px,transparent 2px 4px)" }}>
                    <div style={{ width: `${Math.round(((a.n as number) / maxN) * 100)}%`, height: "4px", background: (a.n as number) > 100 ? "#EAF77E" : "#DEF23B" }}></div>
                  </div>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", flex: "none" }}>{a.n as number}</span>
                </div>
              ))}
            </div>

            {anomaly && (
              <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "13px 15px" }}>
                <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                  Аномалия подсвечена до конца месяца: {anomaly.n as number} примерок —
                  это трафик из канала, а не работа менеджеров. Успех гаража способен
                  съесть подписку точки, поэтому расход показан поимённо, а не одной цифрой.
                </span>
              </div>
            )}

            <div style={{ height: "1px", background: "#F0F0F0" }}></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Карточка клиента и история</span>
              <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Примерки привязаны к автомобилю, а не только к клиенту: вернувшемуся
                через год покажем «в прошлый раз смотрели».
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, acid }: {
  label: string; value: string; sub?: string; acid?: boolean;
}) {
  return (
    <div style={{ background: acid ? "#DEF23B" : "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ fontSize: "12px", ...(acid ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: sub ? "9px" : "0" }}>
        <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {sub && <span style={{ fontSize: "14px", ...(acid ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>{sub}</span>}
      </div>
    </div>
  );
}
