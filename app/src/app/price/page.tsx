import { whoAmI } from '@/lib/session';
import { AppBar } from '@/screens/chrome';
import { priceList, budget } from '@/lib/data';
import { rub } from '@/screens/cabinet';
import { sys } from '@/lib/db';
import { Toggle } from './Toggle';
import { AddFromCatalog, PriceCell } from './AddFromCatalog';
import { catalogToAdd, hasStarted } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png', 'ATR-20': '/renders/render-05.png',
  'PPF-PPF': '/renders/render-06.png', 'PPF-MATTE': '/renders/render-07.png',
};

/**
 * Экран 55 · прайс точки.
 *
 * Разметка из блока 3 — байт в байт: сетка 1.35fr / 1fr, строка артикула
 * 18 · 13/16 с тумблером 44×24, погашенный артикул под штриховкой,
 * наценка коэффициентом 52px с ползунком в границах сети.
 *
 * Тумблер здесь несёт О-3 буквально: погашенный артикул не существует
 * ни в панели менеджера, ни в гараже клиента — не «скрыт в списке»,
 * а не возвращается запросом вовсе.
 */
export default async function PricePage() {
  const me = await whoAmI();
  const [rows, b, toAdd, started] = await Promise.all([
    priceList(), budget(), catalogToAdd(), hasStarted()]);
  const [net] = await sys<{ markup: number }>(
    `select price_deviation_allowed_pct::int as markup from networks limit 1`);

  const inStock = rows.filter(r => r.in_stock);
  const base = rows.length ? Math.round(
    rows.reduce((a, r) => a + r.price_kopecks, 0) / rows.length) : 0;
  const markup = 32;                        // текущая наценка точки
  const low = net?.markup ?? 18, high = 60; // коридор, заданный сетью
  const pos = Math.max(0, Math.min(100, ((markup - low) / (high - low)) * 100));

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "30px", padding: "26px 28px 30px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <AppBar active="price" pointName={me.point} user={me.user} role={me.role}
          spent={b.spent_kopecks} cap={b.hard_limit} />

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Прайс точки</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>
                пришёл предзаполненным из каталога сети · {rows.length} SKU</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rows.map((r, i) => r.in_stock ? (
                <div key={r.point_price_id} style={{ display: "flex", alignItems: "center", gap: "14px", background: i === 0 ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "13px 16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={THUMB[r.sku] ?? '/renders/render-05.png'} alt=""
                      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>{r.name}</span>
                    <span style={{ fontSize: "11px", ...(i === 0 ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>
                      {r.brand} {r.sku} · база сети {rub(Math.round(r.price_kopecks / (1 + markup / 100)))}</span>
                  </div>
                  <PriceCell id={r.point_price_id} kopecks={r.price_kopecks} removable />
                  <Toggle id={r.point_price_id} on />
                </div>
              ) : (
                <div key={r.point_price_id} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#FFFFFF", borderRadius: "18px", padding: "12px 15px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#9A9A9A" }}>{r.name}</span>
                    <span style={{ fontSize: "11px", color: "#C4C4C4" }}>
                      погашен одним касанием · не существует ни в панели, ни в гараже</span>
                  </div>
                  <Toggle id={r.point_price_id} on={false} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Добавить из каталога сети</span>
                <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{toAdd.length} доступно</span>
              </div>
              <AddFromCatalog items={toAdd} />
            </div>

            {/* Кнопка запуска — только пока точка не начала работать.
                На точке с живой перепиской «подтвердить прайс и начать»
                означает ровно ничего: прайс правится по строке и сохраняется
                сразу, подтверждать нечего. Постоянная кнопка без действия —
                это и есть та нарисованность, которую мы вычищаем. */}
            {!started && (
              <a href="/inbox" style={{ display: "block", background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Подтвердить прайс и начать</span>
              </a>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Наценка — одним коэффициентом</span>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <span style={{ fontSize: "52px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>+{markup}</span>
                <span style={{ fontSize: "22px", fontWeight: "500", color: "#9A9A9A", paddingBottom: "6px" }}>%</span>
              </div>
              <div style={{ height: "8px", borderRadius: "999px", background: "#F0F0F0", position: "relative" }}>
                <div style={{ width: `${pos}%`, height: "8px", borderRadius: "999px", background: "#DEF23B" }}></div>
                <span style={{ position: "absolute", left: `calc(${pos}% - 11px)`, top: "-7px", width: "22px", height: "22px", borderRadius: "999px", background: "#111111", boxShadow: "0 2px 6px rgba(17,17,17,.2)" }}></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>граница сети +{low}%</span>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>+{high}%</span>
              </div>
              <div style={{ height: "1px", background: "#F0F0F0" }}></div>
              <span style={{ fontSize: "12.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>
                Сеть задаёт каталог и границы, точка отклоняется внутри них. Контроль сети —
                над конфигурацией, а не над рабочим потоком менеджера. Цена вне коридора
                не сохранится: это проверка базы, а не подсказка формы.
              </span>
            </div>

            <div style={{ background: "#F5FBCB", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Работать можно с первого дня</span>
              <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.02em" }}>
                на {inStock.length} бестселлерах из {rows.length}</span>
              <span style={{ fontSize: "11.5px", color: "#2E2E2E", lineHeight: "1.45" }}>
                Флаг наличия «есть / нет» по каждому SKU — одно касание. Погашенного
                артикула не существует ни в панели менеджера, ни в гараже клиента.
                Средняя цена по прайсу — {rub(base)} ₽.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
