export const dynamic = 'force-dynamic';

/**
 * Модуль 10 захода 3 · примерка к покупке.
 *
 * Разметка из блока 4, рамка 2 — байт в байт.
 *
 * Краевой случай №64: клиент грузит фото машины, которую ещё не купил.
 * Продукт не делает вид, что это его автомобиль: номер и двор не сохраняем,
 * потому что сохранять чужие персональные данные незачем, а обещание
 * узнаваемости здесь честно не выполняется — и об этом сказано прямо.
 */
export default function PrePurchasePage() {
  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "740px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renders/render-03.png" alt=""
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#111111" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ещё не моя машина</span>
          </div>
        </div>

        <div style={{ position: "relative", marginTop: "auto", padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "18px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.024em", lineHeight: "1.2" }}>Смотрите к покупке</span>
              <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
                Номер и двор не сохраняем — это не ваш автомобиль. Фото из объявления
                подойдёт, но цвет на нём соврёт сильнее.
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                <span style={{ flex: "1", fontSize: "12.5px", fontWeight: "500" }}>BMW X5 2021 · из объявления</span>
                <span style={{ fontSize: "11px", color: "#6E6E6E" }}>типовой кузов</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
                <span style={{ flex: "1", fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                  Купите — пришлите фото своей, пересоберём с номером и двором</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Сатин-хром тёмный · 21,5 м</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  248 400<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ background: "#111111", borderRadius: "999px", padding: "14px 18px", flex: "none" }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Сохранить</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
