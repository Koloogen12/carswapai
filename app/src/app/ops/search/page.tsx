import { AppBar } from '@/screens/chrome';
import { OpsNav } from '@/screens/ops';
import { globalSearch, auditTrail } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

const ACTION: Record<string, string> = {
  'order.created': 'Сформировала наряд из подтверждённой конфигурации',
  'price.markup_changed': 'Изменил коэффициент наценки',
  'price.sku_disabled': 'Погасил артикул',
  'order.roll_verified': 'Сверил рулон по наряду',
  'order.roll_mismatch': 'Рулон не сошёлся · наряд заблокирован',
  'access.revoked': 'Отозвал доступ сотруднику',
};

/**
 * Модули 03–04 захода 3 · глобальный поиск и аудит-лог.
 *
 * Разметка из блока 2 — байт в байт: сетка 1fr / 1.2fr, поле поиска
 * с обводкой inset 1.5px, строка результата с меткой типа шириной 66px,
 * строка лога колонками 96 / 120 / остальное.
 *
 * Лог нужен не для контроля людей, а для разбора одного вопроса: почему
 * цена в наряде отличается от той, что видел клиент. Поэтому подсвечены
 * именно те действия, которые могут её изменить.
 */
export default async function SearchPage({ searchParams }: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? 'K75407';
  const [hits, log, b] = await Promise.all([globalSearch(q), auditTrail(), budget()]);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/search" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Поиск по кабинету</span>

            <form style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F5F5F5", borderRadius: "16px", padding: "14px 16px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
              <input name="q" defaultValue={q} aria-label="Поиск по кабинету"
                style={{ flex: "1", minWidth: 0, fontSize: "14.5px", fontWeight: "500", border: 0, background: "transparent", outline: "none", fontFamily: "inherit" }} />
              <span style={{ fontSize: "11px", color: "#9A9A9A", flex: "none" }}>
                {hits.length} совпадени{hits.length === 1 ? 'е' : hits.length < 5 ? 'я' : 'й'}</span>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {hits.length === 0 && (
                <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px", fontSize: "12.5px", color: "#6E6E6E" }}>
                  Ничего не нашлось. Ищется артикул, клиент, номер наряда и партия рулона.
                </div>
              )}
              {hits.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", color: "#9A9A9A", width: "66px", flex: "none" }}>{h.kind}</span>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{h.title}</span>
                    <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>{h.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
              Один запрос находит артикул, клиента, наряд и рулон. Это и есть проверка,
              что учётный слой действительно связан, а не четыре отдельные таблицы.
            </span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Аудит-лог</span>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>кто, что и когда · хранится 12 месяцев</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {log.map((e, i) => {
                const money = e.action === 'price.markup_changed';
                const bad = e.action === 'order.roll_mismatch';
                const text = (e.detail as { text?: string })?.text ?? ACTION[e.action] ?? e.action;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: bad ? "#FBEEEF" : money ? "#DEF23B" : "#F7F7F7", borderRadius: "14px", padding: "11px 14px" }}>
                    <span style={{ width: "96px", flex: "none", fontSize: "11px", fontVariantNumeric: "tabular-nums", ...(bad ? { color: "#8A4448" } : money ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>
                      {new Date(e.at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</span>
                    <span style={{ width: "120px", flex: "none", fontSize: "12px", fontWeight: "500", ...(bad ? { color: "#8A4448" } : {}) }}>
                      {shortName(e.actor)}</span>
                    <span style={{ flex: "1", minWidth: 0, fontSize: "12px", color: bad ? "#8A4448" : "#2E2E2E" }}>{text}</span>
                  </div>
                );
              })}
            </div>

            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
              Лог не для контроля людей, а для разбора одного вопроса: почему цена
              в наряде отличается от той, что видел клиент. Без него это спор
              без доказательств.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function shortName(n: string) {
  const p = n.split(' ');
  return p.length > 1 ? `${p[0]} ${p[1][0]}.` : n;
}
