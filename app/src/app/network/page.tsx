import { networkPanel } from '@/lib/reports';
import { PointControls } from './PointControls';
import { rub } from '@/screens/cabinet';

export const dynamic = 'force-dynamic';

/**
 * Экран 59 · панель сети.
 *
 * Разметка из блока 9 — байт в байт: заголовок 30/500, три показателя
 * по 44px, столбики разброса высотой 44, строки точек с полосой 26px.
 *
 * Несущее решение макета — разброс, а не среднее. Среднее скрыло бы
 * главное: две точки почти не пользуются, и решать надо именно их,
 * а не сеть целиком. Поэтому под каждой цифрой стоит столбик на точку,
 * и провальные покрашены в алерт.
 *
 * §13 · управляющая компания видит срез и не видит переписок клиентов.
 * Это ограничительная политика RLS, а не решение интерфейса.
 */
export default async function NetworkPage() {
  const n = await networkPanel();
  const share = n.points.length ? Math.round((n.withDeals / n.points.length) * 100) : 0;
  const maxBar = Math.max(1, n.maxCoverage);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "30px", padding: "26px 28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Управляющая компания</span>
            <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em" }}>
              Пилот · {n.points.length} точек · 4-я неделя</span>
          </div>
          <span style={{ fontSize: "12.5px", color: "#6E6E6E", maxWidth: "400px", textAlign: "right", lineHeight: "1.45" }}>
            Три цифры, которыми директор франчайзинга защищает решение внутри сети.
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Обращений точек в управляющую компанию</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
              <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{n.escalations}</span>
              <span style={{ fontSize: "13px", color: "#9A9A9A" }}>за первый месяц, на {n.points.length} точек</span>
            </div>
            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "44px" }}>
              {n.points.map(p => (
                <span key={p.id} style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span>
              ))}
            </div>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
              Счётчик ведётся явно. Обращение точки в УК — это не мелочь поддержки,
              а провал главного критерия плательщика.
            </span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Доля входящих с примеркой к 4-й неделе</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
              <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{n.avgCoverage}</span>
              <span style={{ fontSize: "20px", color: "#9A9A9A" }}>%</span>
              <span style={{ fontSize: "13px", color: "#9A9A9A" }}>разброс {n.minCoverage}–{n.maxCoverage}%</span>
            </div>
            <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "44px" }}>
              {n.points.map(p => (
                <span key={p.id} style={{ flex: "1", borderRadius: "2px",
                  height: `${Math.max(9, Math.round((p.coverage / maxBar) * 44))}px`,
                  background: p.coverage < 25 ? "#F0C9CB" : p.coverage < 50 ? "#EAF77E" : "#DEF23B" }}></span>
              ))}
            </div>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
              Среднее скрыло бы главное: часть точек почти не пользуется, и решать
              надо именно их, а не сеть целиком.
            </span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Расход и статус точек</span>
            <PointControls points={n.points} />
          </div>

          <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "13px", opacity: ".7" }}>
              Точек с хотя бы одной сделкой через примерку за квартал</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
              <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{n.withDeals}</span>
              <span style={{ fontSize: "20px", opacity: ".6" }}>из {n.points.length}</span>
            </div>
            <div style={{ height: "34px", borderRadius: "999px", background: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", overflow: "hidden" }}>
              <div style={{ width: `${Math.max(12, share)}%`, height: "34px", borderRadius: "999px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "14px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#DEF23B" }}>{share}%</span>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", lineHeight: "1.45", opacity: ".7" }}>
              Порог сети — 60%. Критерий проверяется на 4-й неделе, не по итогам квартала.
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Точки в одном срезе</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>сортировка по покрытию входящих</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {n.points.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(3, p.coverage)}%`, height: "26px", borderRadius: "999px", background: p.coverage < 25 ? "#F0C9CB" : "#DEF23B" }}></div>
                  </div>
                  <span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>{p.coverage}%</span>
                  <span style={{ width: "88px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>
                    {p.deals} {p.deals === 1 ? 'сделка' : p.deals < 5 ? 'сделки' : 'сделок'}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Краевой случай №2 · точка мертва тихо. Она не пишет и не жалуется,
                поэтому у неё отдельная пометка, а не общий алерт. */}
            <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "11px", background: "#FBEEEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="1.9" strokeLinecap="round"><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
                </div>
                <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Мертвы тихо</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {n.silent.length === 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                    <span style={{ flex: "1", fontSize: "13px", color: "#6E6E6E" }}>Все точки сделали первую отправку</span>
                  </div>
                )}
                {n.silent.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: p.hours >= 72 ? "#FBEEEF" : "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}>
                    <span style={{ flex: "1", minWidth: 0, fontSize: "13px", fontWeight: "500", color: p.hours >= 72 ? "#8A4448" : "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ fontSize: "12px", color: p.hours >= 72 ? "#8A4448" : "#6E6E6E", flex: "none", fontVariantNumeric: "tabular-nums" }}>
                      {p.hours} ч без отправки</span>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
                Точка, не сделавшая первую отправку за 72 часа, не пишет и не жалуется —
                она просто не пользуется. Поэтому у неё отдельная пометка, а не общий алерт.
                Пороги 24 / 48 / 72 часа.
              </span>
            </div>

            <div style={{ background: "#111111", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Контроль сети</span>
              <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.55", color: "#DDDDDD", textWrap: "pretty" }}>
                Сеть задаёт каталог и границы наценки. Над рабочим потоком менеджера
                контроля нет — ни одно требование сети не превращается в поле, которое
                он заполняет при живом клиенте.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                {[`Каталог ${n.net?.skus ?? 0} SKU`,
                  `Наценка до ${n.net?.markup ?? 0}%`,
                  `Стоп по генерациям снят у ${n.net?.released ?? 0} точек`,
                  'Приглашение точки одной ссылкой'].map(t => (
                  <span key={t} style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
