/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/03-phase3-client-garage.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function S03Phase3ClientGarageBlock0(): ReactElement {
  return (
    <><div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "13px", color: "#FFFFFF" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "4px 9px", letterSpacing: "0.04em" }}>Сценарий 2 из 5</span>
    <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>Клиент-автовладелец · публичный веб · мобильный</span>
  </div>
  <h1 style={{ margin: "0", fontSize: "44px", fontWeight: "500", letterSpacing: "-0.035em", lineHeight: "1.04" }}>Гараж-примерочная — 16 экранов по порядку</h1>
  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#BFBFBF", maxWidth: "780px", textWrap: "pretty" }}>Вход по ссылке точки, без регистрации до самого конца. Ряд 1 — вход и загрузка фото, ряд 2 — четыре категории, ряд 3 — сравнение и экономика генераций, ряд 4 — отказные состояния и шеринг. Читать слева направо, строку за строкой.</p>
</div></>
  );
}

export function S03Phase3ClientGarageBlock1(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>Ряд 1</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Вход и фото · ноль полей до результата</span>
  </div>

  <div style={{ display: "flex", gap: "22px", alignItems: "flex-start" }}>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "3px 8px" }}>01</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>По ссылке точки</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}><img src="/renders/render-04.png" alt="демо-машина уже перекрашена" /></div>
        <div style={{ position: "relative", padding: "26px 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "500" }}>Пост на Кутузовском</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", padding: "0 14px 16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "25px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1", textWrap: "pretty" }}>Посмотрите свою машину в другом цвете</span>
              <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>Это чужая — уже перекрашена. Загрузите фото своей, и через минуту увидите её же: свой номер, свои диски, свой двор.</span>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500" }}>Снять</span></div>
              <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500" }}>Галерея</span></div>
              <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Нет фото</span></div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
              <div style={{ width: "17px", height: "17px", borderRadius: "5px", background: "#F5F5F5", flex: "none", marginTop: "1px" }}></div>
              <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#9A9A9A" }}>Согласен на обработку фото автомобиля, включая читаемый госномер, для показа примерки. Фото не публикуется без моего действия.</span>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Результат показан до любого действия. Ноль полей, ноль регистрации. Место под юридическое согласие заложено сразу.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>02</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>По ссылке сети · выбор точки</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "0 6px" }}>
          <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Где вам удобно</span>
          <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Прайс и наличие плёнок у точек разные — покажем цены выбранной.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: "#DEF23B", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "15px", fontWeight: "500" }}>Кутузовский проспект</span>
              <span style={{ fontSize: "11.5px", opacity: ".65" }}>4,2 км · ближайший замер завтра 11:00</span>
            </div>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Ленинградское шоссе</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>11,8 км · есть обвес под X5</span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Варшавское шоссе</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>16,3 км · ближайший замер 2 сентября</span>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Важно</span>
          <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Этот шаг есть только при входе по ссылке сети. По ссылке точки его нет — он бы стал полем перед результатом.</span>
        </div>
        <div style={{ marginTop: "auto", background: "#111111", borderRadius: "999px", padding: "17px 0", textAlign: "center" }}><span style={{ fontSize: "14.5px", fontWeight: "500", color: "#FFFFFF" }}>Дальше</span></div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Единственный экран-развилка во всём гараже. Сеть даёт одну ссылку на все точки, клиент выбирает свою.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>03</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Ветка «нет фото»</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
          </div>
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Покажем на типовом кузове</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em", lineHeight: "1.15" }}>Какая у вас машина</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>BMW</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round"><path d="M7 10l5 5 5-5" /></svg>
            </div>
            <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>X5 · G05</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round"><path d="M7 10l5 5 5-5" /></svg>
            </div>
            <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#9A9A9A" }}>Год · необязательно</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round"><path d="M7 10l5 5 5-5" /></svg>
            </div>
          </div>
          <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14.5px", fontWeight: "500" }}>Показать за 20 секунд</span></div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Фото можно прислать потом — примерка пересоберётся на вашей машине и станет апгрейдом, а не новой попыткой.</span>
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "11px", background: "#FFFFFF", borderRadius: "22px", padding: "14px 16px" }}>
          <div style={{ width: "56px", height: "42px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="/renders/render-07.png" alt="" /></div>
          <span style={{ flex: "1", fontSize: "11.5px", lineHeight: "1.4", color: "#6E6E6E" }}>Так выглядит типовой кузов X5 — цвета настоящие, машина обобщённая</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Ни одного экрана, блокирующего движение до загрузки фото. Ожидание фото — самый массовый разрыв цепочки.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>04</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Фото загружено · сборка</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
          </div>
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Собираем на вашей машине</span>
        </div>
        <div style={{ borderRadius: "26px", overflow: "hidden", height: "220px", position: "relative" }}>
          <img src="/renders/render-08.png" alt="фото клиента" />
          <div style={{ position: "absolute", left: "12px", bottom: "12px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "6px 12px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>BMW X5 · А 432 ОР 77</span>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
            <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Машина распознана — BMW X5, 2021</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
            <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Прайс Кутузовского подтянут</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "17px", height: "17px", borderRadius: "999px", boxShadow: "inset 0 0 0 2px #DEF23B", flex: "none" }}></div>
            <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Первый цвет · осталось ~14 секунд</span>
          </div>
          <div style={{ height: "6px", borderRadius: "999px", background: "#F0F0F0", overflow: "hidden" }}><div style={{ width: "62%", height: "6px", background: "#DEF23B" }}></div></div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px" }}>
          <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#6E6E6E" }}>Номер, диски и двор сохраняются специально — иначе это будет «очередной конфигуратор со студийной машиной на белом фоне».</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Прокси момента «ага» у клиента — вторая примерка в той же сессии в течение 60 секунд после первой.</span>
    </div>
  </div>
</div></>
  );
}

export function S03Phase3ClientGarageBlock2(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>Ряд 2</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Четыре категории · переключение не теряет конфигурацию</span>
  </div>

  <div style={{ display: "flex", gap: "22px", alignItems: "flex-start" }}>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "3px 8px" }}>05</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Плёнка · основной экран</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}><img src="/renders/render-01.png" alt="ваша машина в сатин-хроме" /></div>
        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ваш X5 · А 432 ОР 77</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 12px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>7</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>осталось</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px", padding: "0 12px 14px" }}>
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "4px", alignSelf: "center" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "8px 14px" }}>День</span>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", padding: "8px 14px" }}>Пасмурно</span>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", padding: "8px 14px" }}>Паркинг</span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>Плёнка</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Диски</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Салон</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Обвес</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 0 3px #DEF23B" }}><img src="/renders/render-01.png" alt="" /></div>
                <span style={{ fontSize: "9.5px", textAlign: "center", fontWeight: "500" }}>Сатин-хром</span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
                <span style={{ fontSize: "9.5px", textAlign: "center", color: "#6E6E6E" }}>Мат графит</span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden" }}><img src="/renders/render-03.png" alt="" /></div>
                <span style={{ fontSize: "9.5px", textAlign: "center", color: "#6E6E6E" }}>Нардо</span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ height: "58px", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                </div>
                <span style={{ fontSize: "9.5px", textAlign: "center", color: "#C4C4C4" }}>Хаки — нет</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "10px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
              <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим. Поэтому показываем три света.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Сатин-хром тёмный · 18,2 м</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>248 400<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ width: "44px", height: "44px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="5" width="7" height="14" rx="2" /></svg>
              </div>
              <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Написать точке</span></div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Машина занимает экран. Артикула нет в прайсе точки — его не существует: штриховка вместо ложного выбора.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>06</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Диски</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}><img src="/renders/render-01.png" alt="" /></div>
        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Сатин-хром + диски</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", padding: "0 12px 14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Плёнка</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>Диски</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Салон</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Обвес</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "18px", padding: "10px 12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", overflow: "hidden", flex: "none" }}><img src="/renders/render-05.png" alt="диски" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Глянцевый чёрный</span>
                <span style={{ fontSize: "10.5px", opacity: ".6" }}>Порошок · 21" · 4 диска</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>46 000</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "10px 12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#EFEFEF", flex: "none" }}></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Тёмный графит, мат</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Порошок · 21" · 4 диска</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>46 000</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Сатин-хром + диски</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>294 400<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Написать точке</span></div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Комбинирование категорий: плёнка остаётся выбранной, сумма пересчитывается. Ничего не сбрасывается.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>07</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Салон</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}><img src="/renders/render-06.png" alt="салон" /></div>
        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Салон вашего X5</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", padding: "0 12px 14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Плёнка</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Диски</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>Салон</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Обвес</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "18px", padding: "10px 12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", overflow: "hidden", flex: "none" }}><img src="/renders/render-06.png" alt="" /></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Алькантара, тёмно-серая</span>
                <span style={{ fontSize: "10.5px", opacity: ".6" }}>Сиденья и карты дверей</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>88 000</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "10px 12px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#EFEFEF", flex: "none" }}></div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Наппа, чёрная с отстрочкой</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Полный перешив</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>164 000</span>
            </div>
            <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "10px 12px" }}>
              <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Салон — единственная категория, где оговорка про свет не про экран, а про фактуру: ворс алькантары вживую другой.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Плёнка + диски + салон</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>382 400<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Написать точке</span></div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Категория меняет и герой-кадр: для салона показывать кузов бессмысленно.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>08</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Обвес · нет в прайсе точки</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0", opacity: ".4" }}><img src="/renders/render-01.png" alt="" /></div>
        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Обвес</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", padding: "0 12px 14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Плёнка</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Диски</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 0" }}>Салон</span>
              <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>Обвес</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 15px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Обвеса под X5 G05 здесь нет</span>
                <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Это честный ответ, а не пустой поиск: в прайсе Кутузовского такой позиции нет.</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "18px", padding: "12px 14px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Ленинградское шоссе · 11,8 км</span>
                <span style={{ fontSize: "10.5px", opacity: ".65" }}>обвес под X5 в наличии, от 219 000 ₽</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M9 6l6 6-6 6" /></svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Собрано без обвеса</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>382 400<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ background: "#111111", borderRadius: "999px", padding: "14px 18px", flex: "none" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Написать точке</span></div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Клиент просит отсутствующую позицию — явный ответ плюс ближайший аналог с ценой сразу, не молчание.</span>
    </div>
  </div>
</div></>
  );
}

export function S03Phase3ClientGarageBlock3(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>Ряд 3</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Сравнение, свет и экономика генераций</span>
  </div>

  <div style={{ display: "flex", gap: "22px", alignItems: "flex-start" }}>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "3px 8px" }}>09</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Сравнение рядом</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
          </div>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Что взять</span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 11px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11px", fontWeight: "500" }}>День</span>
          </div>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px", minHeight: "0" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 0 0 3px #DEF23B" }}>
            <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}><img src="/renders/render-01.png" alt="вариант А" /></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Сатин-хром тёмный</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>KPMF K75407 · сатин</span></div>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>248 400</span>
            </div>
          </div>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}><img src="/renders/render-02.png" alt="вариант Б" /></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Матовый графит</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Oracal 970-070 · мат</span></div>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>214 900</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", borderRadius: "20px", padding: "11px 13px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#2E2E2E" }}>Разница между сатином и матом вживую сильнее, чем на экране. Сверим с рулоном при вас.</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Заменить Б</span></div>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Беру сатин</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Клиент не крутит бесконечно, а выбирает между двумя — это ещё и режет расход генераций. Экономически самый выгодный режим.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>10</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Три света · пасмурно и паркинг</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "11px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 6px" }}>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Один артикул, три света</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Переключатель всегда доступен, всегда все три</span>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "9px", minHeight: "0" }}>
          <div style={{ flex: "1", borderRadius: "22px", overflow: "hidden", position: "relative", minHeight: "0" }}>
            <img src="/renders/render-01.png" alt="день" />
            <span style={{ position: "absolute", left: "11px", top: "11px", fontSize: "10.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 11px" }}>День</span>
          </div>
          <div style={{ flex: "1", borderRadius: "22px", overflow: "hidden", position: "relative", minHeight: "0" }}>
            <img src="/renders/render-09.png" alt="пасмурно" />
            <span style={{ position: "absolute", left: "11px", top: "11px", fontSize: "10.5px", fontWeight: "500", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 11px" }}>Пасмурно</span>
          </div>
          <div style={{ flex: "1", borderRadius: "22px", overflow: "hidden", position: "relative", minHeight: "0" }}>
            <img src="/renders/render-10.png" alt="паркинг" />
            <span style={{ position: "absolute", left: "11px", top: "11px", fontSize: "10.5px", fontWeight: "500", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 11px" }}>Крытый паркинг</span>
          </div>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "20px", padding: "13px 15px" }}>
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#111111" }}>Разница между этими тремя кадрами — это и есть настоящая плёнка. Вееры дают её честно, поэтому и мы показываем все три и сверяем оттенок с рулоном при вас.</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Тумблера отключения нет ни у одной роли. Строка про сверку партии видна постоянно.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>11</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Счётчик у границы</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", inset: "0" }}><img src="/renders/render-03.png" alt="" /></div>
        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ваш X5</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#DEF23B", borderRadius: "999px", padding: "8px 12px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>2</span>
            <span style={{ fontSize: "10.5px", opacity: ".7" }}>примерки осталось</span>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: "auto", padding: "0 12px 14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ background: "#F5FBCB", borderRadius: "22px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Осталось две примерки</span>
            </div>
            <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Дальше покажем уже готовые кадры — они мгновенные. Оставите номер — откроем ещё десять.</span>
            <div style={{ height: "6px", borderRadius: "999px", background: "rgba(17,17,17,.1)", overflow: "hidden", marginTop: "2px" }}><div style={{ width: "80%", height: "6px", background: "#111111" }}></div></div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: "1", height: "58px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 0 0 3px #DEF23B" }}><img src="/renders/render-03.png" alt="" /></div>
              <div style={{ flex: "1", height: "58px", borderRadius: "16px", overflow: "hidden" }}><img src="/renders/render-01.png" alt="" /></div>
              <div style={{ flex: "1", height: "58px", borderRadius: "16px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
              <div style={{ flex: "1", height: "58px", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Глянец «серый нардо»</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>231 500<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Написать точке</span></div>
            </div>
          </div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Порог 80% меняет тон на Acid 300, не на красный. При 5–15 примерках за визит и 6 ₽ за кадр это условие положительной маржи точки.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>12</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Лимит исчерпан · мягкая деградация</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ borderRadius: "26px", overflow: "hidden", height: "200px", position: "relative" }}>
          <img src="/renders/render-03.png" alt="последняя примерка" />
          <div style={{ position: "absolute", inset: "0", background: "rgba(17,17,17,.1)" }}></div>
          <span style={{ position: "absolute", left: "12px", bottom: "12px", fontSize: "10.5px", fontWeight: "500", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 11px" }}>последняя новая примерка</span>
        </div>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", height: "58px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-01.png" alt="" /></div>
          <div style={{ flex: "1", height: "58px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
          <div style={{ flex: "1", height: "58px", borderRadius: "14px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "9.5px", color: "#6E6E6E", textAlign: "center", lineHeight: "1.3" }}>готовое<br />превью</span></div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em", lineHeight: "1.15" }}>Крутить дальше можно</span>
          <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>Новые кадры на вашей машине закончились на сегодня. Оставьте номер — откроем ещё десять и сохраним всё, что вы собрали.</span>
          <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "14px 18px", fontSize: "14px", color: "#9A9A9A" }}>+7 ···  ··· ·· ··</div>
          <div style={{ background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Продолжить</span></div>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>Собранное не пропадёт, даже если закроете страницу</span>
        </div>
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Исчерпание лимита никогда не выглядит поломкой и не оставляет клиента в тупике — это отдельное требование, а не оптимизация.</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Разные лимиты до контакта и после. Деградация в кэш, а не отказ.</span>
    </div>
  </div>
</div></>
  );
}

export function S03Phase3ClientGarageBlock4(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#D93F45", color: "#FFFFFF", borderRadius: "7px", padding: "6px 11px" }}>Ряд 4</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Отказные состояния, шеринг и отправка в точку</span>
  </div>

  <div style={{ display: "flex", gap: "22px", alignItems: "flex-start" }}>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>13</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Фото непригодно</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ height: "190px", borderRadius: "26px", background: "#2E2E2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "11px" }}>
          <svg width="34px" height="34px" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.5" strokeLinecap="round"><path d="M4 20L20 4" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
          <span style={{ fontSize: "12px", color: "#6E6E6E" }}>ваш кадр</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em", lineHeight: "1.15" }}>Темно — цвет соврёт</span>
          <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>Снимите днём или под навесом: машина целиком в кадре, сбоку, без контрового света. Так плёнка на рендере будет похожа на настоящую.</span>
          <div style={{ display: "flex", gap: "7px" }}>
            <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Снять заново</span></div>
            <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Галерея</span></div>
          </div>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "74px", height: "56px", borderRadius: "14px", overflow: "hidden", flex: "none" }}><img src="/renders/render-07.png" alt="" /></div>
          <span style={{ flex: "1", fontSize: "12px", lineHeight: "1.45" }}>А пока смотрите цвета на типовом X5 — уже готово, ничего ждать не нужно</span>
        </div>
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Ночь, подземный паркинг, против солнца, не автомобиль, фото из объявления — отказ за секунды с конкретной подсказкой и мгновенным фолбэком, не пустым отказом.</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Тупика нет ни на одном шаге: клиент всегда остаётся с результатом на руках.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>14</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Машина уже оклеена</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ borderRadius: "26px", overflow: "hidden", height: "200px", position: "relative" }}>
          <img src="/renders/render-04.png" alt="уже оклеенная машина" />
          <span style={{ position: "absolute", left: "12px", top: "12px", fontSize: "10.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 11px" }}>уже в плёнке</span>
        </div>
        <div style={{ background: "#F5FBCB", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ваша машина уже в плёнке</span>
          </div>
          <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Покажем новый цвет поверх, но в расчёт добавили снятие старого покрытия — иначе цена на замере вырастет, и это будет неприятный разговор.</span>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Снятие старой плёнки</span>
            <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>+ 34 000 ₽</span>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Итого с учётом снятия</span>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: "24px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>282 400<span style={{ fontSize: "14px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
          </div>
          <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Написать точке</span></div>
        </div>
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Единственное место, где продукт сам поднимает цену. Это дешевле спора на выдаче.</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Плюс развилка «моя машина / примеряю к покупке» — во втором случае номер и двор не сохраняются.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 8px" }}>15</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Сохранено · публичная страница</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "13px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 6px" }}>
          <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Ваши сборки</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Не протухают · открываются без регистрации</span>
        </div>
        <div style={{ position: "relative", height: "210px" }}>
          <div style={{ position: "absolute", left: "16px", right: "16px", top: "0", height: "18px", background: "#FFFFFF", borderRadius: "16px", opacity: ".5" }}></div>
          <div style={{ position: "absolute", left: "8px", right: "8px", top: "8px", height: "22px", background: "#FFFFFF", borderRadius: "18px", opacity: ".75" }}></div>
          <div style={{ position: "absolute", left: "0", right: "0", top: "16px", bottom: "0", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}><img src="/renders/render-01.png" alt="" /></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 2px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Сатин-хром + диски</span><span style={{ fontSize: "10px", color: "#9A9A9A" }}>сохранено 28 августа</span></div>
              <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>294 400</span>
            </div>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Ссылка для жены и чата друзей</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "14px", padding: "12px 14px" }}>
            <span style={{ flex: "1", fontSize: "12px", color: "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>carswap.ai/g/x5-satin-a432or</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M15 5H6a2 2 0 00-2 2v9" /></svg>
          </div>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Логотип точки внутри самого изображения — страница сама является входом в гараж.</span>
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Собрать ещё</span></div>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Отправить точке</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Виральный вход: конфигурация открывается без регистрации и сама ведёт в гараж.</span>
    </div>

    <div style={{ width: "390px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "3px 8px" }}>16</span>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Ушло в точку</span>
      </div>
      <div style={{ width: "390px", height: "790px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
        <div style={{ borderRadius: "26px", overflow: "hidden", height: "210px" }}><img src="/renders/render-01.png" alt="выбранная конфигурация" /></div>
        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ушло на Кутузовский</span>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>Сатин-хром + диски · 294 400 ₽</span>
            </div>
          </div>
          <div style={{ height: "1px", background: "#F0F0F0" }}></div>
          <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#2E2E2E" }}>Менеджер увидит вашу сборку целиком — с артикулами и ценой, пересказывать ничего не надо. Обычно отвечают в течение десяти минут.</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Что дальше</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "12.5px" }}>Менеджер посчитает работы и предложит замер</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#E2E2E2", flex: "none" }}></span><span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>На замере сверим оттенок с рулоном при вас</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#E2E2E2", flex: "none" }}></span><span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Ваш выбор зафиксирован — на выдаче спорить не придётся</span></div>
        </div>
        <div style={{ marginTop: "auto", background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Открыть диалог с точкой</span></div>
      </div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Отправка только по явному действию клиента. Приходит менеджеру в тот же инбокс как новое обращение с уже собранной конфигурацией.</span>
    </div>
  </div>

  <div style={{ width: "1656px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px", display: "flex", gap: "26px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Сценарий 2 закрыт. </span>Регистрации до первой примерки нет ни на одном экране. Артикула нет в прайсе точки — его не существует в гараже.</span>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Дальше. </span>Сценарий 3 — мастер у поста: запись, сверка рулона и экран выдачи, который гасит спор за 15 секунд.</span>
  </div>
</div></>
  );
}

export const S03Phase3ClientGarageBlocks = [S03Phase3ClientGarageBlock0, S03Phase3ClientGarageBlock1, S03Phase3ClientGarageBlock2, S03Phase3ClientGarageBlock3, S03Phase3ClientGarageBlock4];
export const S03Phase3ClientGarageCanvas = { background: "#2A2A2A", padding: "52px 48px 120px", fontFamily: "Onest,system-ui,sans-serif", color: "#111111", display: "flex", flexDirection: "column", gap: "40px", width: "max-content" } as React.CSSProperties;
