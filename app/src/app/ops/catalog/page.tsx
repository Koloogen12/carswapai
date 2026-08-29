import { AppBar } from '@/screens/chrome';
import { OpsNav, rub } from '@/screens/ops';
import { networkCatalog } from '@/lib/reports';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png',
};

/**
 * Модули 05–07 захода 3 · сетевой каталог, тарифы и приглашение точки.
 *
 * Разметка из блока 3 — байт в байт: сетка 1.35fr / 1fr, строка каталога
 * колонками 140 / 130, строка тарифа 150 / 130 / 120.
 *
 * Несущая мысль экрана вынесена в чёрную карточку и держит всю конструкцию:
 * контроль сети — над конфигурацией, а не над рабочим потоком менеджера.
 * Ни одно требование сети не превращается в поле, которое он заполняет
 * при живом клиенте.
 */
export default async function CatalogPage() {
  const [n, b] = await Promise.all([networkCatalog(), budget()]);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName="JETCAR · управляющая компания" user="Ольга Титова" role="Сеть"
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/catalog" />

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "14px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
              <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Сетевой каталог</span>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>
                {n.items.length} SKU · управляющая компания JETCAR</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {n.items.map(i => (
                <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 16px" }}>
                  <div style={{ width: "44px", height: "34px", borderRadius: "9px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={THUMB[i.sku] ?? '/renders/render-05.png'} alt=""
                      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{i.brand} {i.sku} · {i.name.toLowerCase()}</span>
                    <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>
                      в каталоге у {i.points} {i.points === 1 ? 'точки' : 'точек'}</span>
                  </div>
                  <div style={{ width: "140px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>база сети</span>
                    <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rub(i.base)} ₽</span>
                  </div>
                  <div style={{ width: "130px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>коридор наценки</span>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>+18…+{i.corridor + 42}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Модуль 06</span>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Тарифы и лимиты по точкам</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {n.tariffs.map(t => {
                const pct = t.hard_cap_kopecks ? Math.min(100, (t.spent / t.hard_cap_kopecks) * 100) : 0;
                const dead = !t.started;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: dead ? "#FBEEEF" : "#F7F7F7", borderRadius: "14px", padding: "12px 15px" }}>
                    <span style={{ flex: "1", minWidth: 0, fontSize: "13px", fontWeight: "500", color: dead ? "#8A4448" : "#111111" }}>{t.name}</span>
                    <span style={{ width: "150px", flex: "none", fontSize: "12px", color: dead ? "#8A4448" : "#6E6E6E" }}>
                      Точка · лимит {rub(t.hard_cap_kopecks)} ₽</span>
                    <div style={{ width: "130px", flex: "none", height: "5px", borderRadius: "999px", background: dead ? "#F0DADB" : "#E2E2E2", overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(3, pct)}%`, height: "5px", background: dead ? "#D93F45" : pct >= 80 ? "#EAF77E" : "#DEF23B" }}></div>
                    </div>
                    <span style={{ width: "120px", flex: "none", textAlign: "right", fontSize: "12px", fontWeight: dead ? "500" : "400", color: dead ? "#D93F45" : t.released ? "#111111" : "#9A9A9A" }}>
                      {dead ? 'не начала' : t.released ? 'стоп снят' : 'жёсткий стоп'}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#111111", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#DDDDDD" }}>
                Контроль сети — над конфигурацией, а не над рабочим потоком менеджера.
                Сеть задаёт каталог, коридор наценки и лимиты. Ни одно требование сети
                не превращается в поле, которое менеджер заполняет при живом клиенте.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Модуль 07</span>
                <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Приглашение точки</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Название точки</span>
                  <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Новая точка сети</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Телефон владельца</span>
                  <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
                    <span style={{ fontSize: "13.5px" }}>+7 903 ··· 40 18</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Тариф</span>
                    <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Точка</span>
                    </div>
                  </div>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Первый месяц</span>
                    <div style={{ background: "#DEF23B", borderRadius: "14px", padding: "13px 15px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: "500" }}>бесплатно</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
                <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                  Точка получит код и запустится сама: каналы, прайс, сотрудники.
                  Ноль обращений в управляющую компанию — критерий, по которому
                  нас будут судить.
                </span>
              </div>

              <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Отправить приглашение</span>
              </div>
            </div>

            {/* Это не фича, а гипотеза, вынесенная на решение основателя:
                первый месяц бесплатно убирает из стопки целое допущение
                про готовность сети платить до того, как она увидела сделки. */}
            <div style={{ background: "#DEF23B", borderRadius: "24px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "9px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(17,17,17,.55)" }}>Гипотеза на решение</span>
              <span style={{ fontSize: "14px", lineHeight: "1.5", fontWeight: "500" }}>
                Первый месяц бесплатно вместо цены пилота: около 540 ₽ себестоимости
                на точку и минус одно фатальное допущение из стопки.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
