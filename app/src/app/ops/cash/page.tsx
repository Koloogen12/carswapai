import { AppBar } from '@/screens/chrome';
import { OpsNav, rub } from '@/screens/ops';
import { cashbox, replyTemplates } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Модули 01–02 захода 3 · касса и шаблоны ответов.
 *
 * Разметка из design/design/09-pass3-management.dc.html, блок 1 — байт в байт:
 * сетка 1.5fr / 1fr, три показателя 20 · 16/18, таблица колонками 120/120/130.
 *
 * Просроченным считается не «счёт не закрыт», а «машину отдали, а остаток
 * висит». До выдачи неоплаченный остаток — нормальный ход сделки, и красить
 * его в алерт значит приучить владельца не смотреть на красное.
 */
export default async function CashPage() {
  const [cash, tpl, b] = await Promise.all([cashbox(), replyTemplates(), budget()]);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/cash" />

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
              <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Касса и долги по нарядам</span>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>
                {new Date().toLocaleDateString('ru-RU', { month: 'long' })} · роль бухгалтера</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px" }}>
              <div style={{ background: "#DEF23B", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11.5px", opacity: ".6" }}>Получено</span>
                <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.032em", fontVariantNumeric: "tabular-nums" }}>{rub(cash.received)}</span>
                <span style={{ fontSize: "11px", opacity: ".65" }}>
                  {cash.payCount} оплат{cash.qrCount ? ` · из них ${cash.qrCount} по QR` : ''}</span>
              </div>
              <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>Ожидается при выдаче</span>
                <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.032em", fontVariantNumeric: "tabular-nums" }}>{rub(cash.expected)}</span>
                <span style={{ fontSize: "11px", color: "#6E6E6E" }}>{cash.inWorkCount} наряда в работе</span>
              </div>
              <div style={{ background: cash.overdue > 0 ? "#FBEEEF" : "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11.5px", color: cash.overdue > 0 ? "#8A4448" : "#9A9A9A" }}>Просрочено</span>
                <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.032em", color: cash.overdue > 0 ? "#8A4448" : "#111111", fontVariantNumeric: "tabular-nums" }}>{rub(cash.overdue)}</span>
                <span style={{ fontSize: "11px", color: cash.overdue > 0 ? "#8A4448" : "#6E6E6E" }}>
                  {cash.overdueCount ? `${cash.overdueCount} наряд · машина отдана` : 'долгов нет'}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0 16px 9px" }}>
                <span style={{ flex: "1", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Наряд и клиент</span>
                {['Сумма', 'Оплачено', 'Остаток'].map((h, i) => (
                  <span key={h} style={{ width: i === 2 ? "130px" : "120px", flex: "none", textAlign: "right", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>{h}</span>
                ))}
              </div>
              {cash.rows.length === 0 && (
                <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "13px 16px", fontSize: "12.5px", color: "#6E6E6E" }}>
                  Счетов ещё не выставляли.
                </div>
              )}
              {cash.rows.map(r => {
                const left = r.total - r.paid;
                const debt = r.status === 'done' && left > 0;
                const closed = left <= 0;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: debt ? "#FBEEEF" : "#F7F7F7", borderRadius: "16px", padding: "13px 16px" }}>
                    <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: debt ? "#8A4448" : "#111111" }}>
                        {r.number} · {r.client}</span>
                      <span style={{ fontSize: "10.5px", color: debt ? "#8A4448" : "#6E6E6E" }}>
                        {debt ? 'машина отдана без оплаты остатка'
                          : r.status === 'done' ? 'сдан · акт подписан' : 'в работе · выдача по графику'}</span>
                    </div>
                    <span style={{ width: "120px", flex: "none", textAlign: "right", fontSize: "12.5px", color: debt ? "#8A4448" : "#111111", fontVariantNumeric: "tabular-nums" }}>{rub(r.total)}</span>
                    <span style={{ width: "120px", flex: "none", textAlign: "right", fontSize: "12.5px", fontWeight: "500", color: debt ? "#8A4448" : "#111111", fontVariantNumeric: "tabular-nums" }}>{rub(r.paid)}</span>
                    <span style={{ width: "130px", flex: "none", textAlign: "right", fontSize: "12.5px", fontWeight: debt ? "600" : "400", color: debt ? "#D93F45" : closed ? "#C4C4C4" : "#6E6E6E", fontVariantNumeric: "tabular-nums" }}>
                      {closed ? 'закрыт' : rub(left)}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Долг возникает в одном месте — когда машину отдают до оплаты остатка.
                Поэтому кнопка «закрыть работу» у мастера показывает остаток,
                а не только галочку.
              </span>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Модуль 02</span>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Шаблоны ответов</span>
            </div>
            <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Менеджер отвечает на 3–5 однотипных вопросов за смену. Шаблон подставляет
              артикул, цену и слот сам.
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tpl.map(t => {
                const auto = t.body.includes('{');
                return (
                  <div key={t.id} style={{ background: auto ? "#DEF23B" : "#F7F7F7", borderRadius: "16px", padding: "13px 15px", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", ...(auto ? { opacity: ".6" } : { color: "#6E6E6E" }) }}>{t.title}</span>
                    <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>{t.body}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "auto", background: "#F5F5F5", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Добавить шаблон</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
