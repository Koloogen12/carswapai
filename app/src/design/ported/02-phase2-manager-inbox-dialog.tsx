/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/02-phase2-manager-inbox-dialog.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function S02Phase2ManagerInboxDialogBlock0(): ReactElement {
  return (
    <><div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "13px", color: "#FFFFFF" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "4px 9px", letterSpacing: "0.04em" }}>Сценарий 1 из 5</span>
    <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>Менеджер · кабинет точки · десктоп</span>
  </div>
  <h1 style={{ margin: "0", fontSize: "44px", fontWeight: "500", letterSpacing: "-0.035em", lineHeight: "1.04" }}>Инбокс и диалог — 15 экранов по порядку</h1>
  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#BFBFBF", maxWidth: "780px", textWrap: "pretty" }}>Слева направо и сверху вниз — весь путь смены менеджера: от пустого инбокса в первый день до назначенного замера, вместе со всеми отказными развилками. Первые два экрана — целиком, дальше меняются только две зоны, поэтому показаны они в натуральную величину: лента диалога и панель примерки.</p>
  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginTop: "4px" }}>
    <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Экраны 1–2 · оболочка целиком, 1440</span>
    <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Экраны 3–15 · зоны в натуральную величину</span>
    <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Рендеры настоящие</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock1(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px", letterSpacing: "0.03em" }}>01</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Первый день точки · инбокс пуст</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>не пустой экран, а один конкретный следующий ход</span>
  </div>

  <div style={{ width: "1440px", height: "1000px", background: "#EFEFEF", borderRadius: "30px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </div>
        <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>CarSwap</span>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#FFFFFF", borderRadius: "999px", padding: "5px 11px", marginLeft: "4px" }}>Пост на Кутузовском · день 1</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Генерации</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "62px", height: "5px", borderRadius: "999px", background: "#E2E2E2" }}></div>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>0<span style={{ color: "#9A9A9A" }}>/2 000</span></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 13px 6px 6px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>ИК</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Ирина Ковалёва</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.3" }}>Менеджер</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ flex: "1", display: "flex", gap: "12px", minHeight: "0" }}>
      <div style={{ width: "340px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 15px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "0 4px" }}>
          <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.025em" }}>Обращения</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A", background: "#F5F5F5", borderRadius: "999px", padding: "3px 8px" }}>0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "10px 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Клиент, номер или артикул</span>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", textAlign: "center", padding: "20px 10px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "19px", background: "#F5FBCB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /><path d="M9 10.5h6" /></svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "15.5px", fontWeight: "500" }}>WhatsApp подключён, тихо</span>
            <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Первое обращение придёт сюда само — пересылать ничего не нужно.</span>
          </div>
        </div>
      </div>

      <div style={{ flex: "1", minWidth: "0", background: "#FFFFFF", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "22px", padding: "40px" }}>
        <div style={{ width: "520px", display: "flex", flexDirection: "column", gap: "9px", alignItems: "center", textAlign: "center" }}>
          <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1", textWrap: "pretty" }}>Проверьте, что увидит клиент</span>
          <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Отправьте примерку себе в WhatsApp — за минуту увидите карточку ровно в том виде, в котором её получит человек. Так первая настоящая отправка не будет первой попыткой.</span>
        </div>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div style={{ width: "214px", background: "#111111", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ height: "118px", borderRadius: "13px", overflow: "hidden" }}><img src="/renders/render-07.png" alt="демо-карточка" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "0 3px 2px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Демо · типовой X5</span>
              <span style={{ fontSize: "10px", color: "#9A9A9A" }}>три света и оговорка внутри</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px", paddingTop: "6px" }}>
            <div style={{ background: "#111111", borderRadius: "999px", padding: "14px 22px" }}><span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Отправить примерку себе</span></div>
            <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "14px 22px", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500" }}>Подключить ещё канал</span></div>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45", maxWidth: "200px" }}>Обучающих туров нет: первый сценарий проходится без инструкции.</span>
          </div>
        </div>
      </div>

      <div style={{ width: "368px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em" }}>Панель примерки</span>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", textAlign: "center", padding: "20px 6px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.6" strokeLinecap="round"><path d="M4 17V8a2 2 0 012-2h2l1.5-2h5L16 6h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.4" /></svg>
          </div>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#9A9A9A", maxWidth: "250px" }}>Панель включится, когда откроете диалог. Артикулы подтянутся из прайса точки — вводить руками ничего не нужно.</span>
        </div>
        <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>Прайс точки</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>214 SKU · наценка +32%</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Пришёл предзаполненным из каталога сети</span>
        </div>
      </div>
    </div>
  </div>

  <div style={{ width: "1440px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px", display: "flex", gap: "26px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Зачем экран. </span>Окно первых трёх дней решает судьбу точки. Пустой инбокс — самое опасное место: если менеджеру нечего нажать, точка умирает тихо, не написав ни одной жалобы.</span>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Что дальше. </span>Пришло первое обращение из WhatsApp — инбокс наполняется сам, без жеста пересылки.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock2(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Артём написал в WhatsApp · через 40 минут после запуска</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock3(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px", letterSpacing: "0.03em" }}>02</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Инбокс в работе · шесть состояний примерки в одном списке</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>наверх поднимается не свежее, а горячее</span>
  </div>

  <div style={{ width: "1440px", height: "1000px", background: "#EFEFEF", borderRadius: "30px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </div>
        <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>CarSwap</span>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#FFFFFF", borderRadius: "999px", padding: "5px 11px", marginLeft: "4px" }}>Пост на Кутузовском</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "13px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>
          <span style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B", boxShadow: "0 0 0 2px #111111" }}></span>
        </div>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
        </div>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Генерации</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{ width: "62px", height: "5px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}><div style={{ width: "62%", height: "5px", background: "#DEF23B" }}></div></div>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>1 240<span style={{ color: "#9A9A9A" }}>/2 000</span></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 13px 6px 6px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", color: "#6E6E6E" }}>ИК</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Ирина Ковалёва</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.3" }}>Менеджер</span>
          </div>
        </div>
      </div>
    </div>

    <div style={{ flex: "1", display: "flex", gap: "12px", minHeight: "0" }}>
      <div style={{ width: "392px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 15px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", padding: "0 4px" }}>
          <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.025em" }}>Обращения</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>7</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "10px 14px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Клиент, номер или артикул</span>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "8px 0" }}>Горячие сверху</span>
          <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#6E6E6E", padding: "8px 0" }}>Все</span>
          <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#6E6E6E", padding: "8px 0" }}>Мои</span>
        </div>

        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px", minHeight: "0" }}>
          <div style={{ background: "#111111", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>АГ</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Артём Гусев</span>
                  <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
                </div>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>BMW X5 2021 · А 432 ОР 77</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flex: "none" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>2 мин</span>
                <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B" }}></span>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#DDDDDD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>А можно ещё в этом, но матовый?</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#DEF23B", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#111111" }}></span>
              <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Просит ещё вариант</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", flex: "none" }}>КД</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Кирилл Дёмин</span>
                  <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: "#3A6B8F", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>TG</span>
                </div>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Kia K5 2022</span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>14 мин</span>
            </div>
            <span style={{ fontSize: "12px", color: "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Отправил фото, посмотрите пожалуйста</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="2.2" strokeLinecap="round"><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E" }}>Отправлена · ждём</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", flex: "none" }}>МС</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Марина Соловьёва</span>
                  <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
                </div>
                <span style={{ fontSize: "11px", color: "#C4C4C4" }}>авто не распознано</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flex: "none" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>27 мин</span>
                <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#111111" }}></span>
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#2E2E2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Сколько выйдет обклеить целиком?</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#EFEFEF", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A" }}>Без примерки</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", flex: "none" }}>СП</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Сергей Пахомов</span>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Toyota Camry 2020</span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>1 ч</span>
            </div>
            <span style={{ fontSize: "12px", color: "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Беру сатин-хром. Когда можно на замер?</span>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#111111", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.6" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Выбор подтверждён</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", flex: "none" }}>ОК</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Ольга Ким</span>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Volvo XC60 2020</span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>3 ч</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E" }}>Замер 29 авг, 11:00</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#FBEEEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#D93F45", flex: "none" }}>ДР</div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Данил Рощин</span>
                <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Mazda 6 2019</span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>5 ч</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#FBEEEF", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#D93F45" }}>Не доставлено · повторить</span>
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px", display: "flex", alignItems: "center", gap: "9px", opacity: ".7" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A", flex: "none" }}>РЕ</div>
            <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Роман Ефимов</span>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Спасибо, подумаю</span>
            </div>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", flex: "none" }}>2 дн</span>
          </div>
        </div>
      </div>

      <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "40px" }}>
        <div style={{ width: "440px", display: "flex", flexDirection: "column", gap: "9px", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>
          </div>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Выберите диалог</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Наверху — Артём: он только что попросил ещё вариант. Это состояние живёт минуты, поэтому единственное во всём списке выделено акцентом.</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "520px" }}>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Без примерки</span>
          <span style={{ fontSize: "11.5px", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Отправлена · ждём</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "7px 13px" }}>Просит ещё вариант</span>
          <span style={{ fontSize: "11.5px", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "7px 13px" }}>Выбор подтверждён</span>
          <span style={{ fontSize: "11.5px", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "7px 13px" }}>Замер назначен</span>
          <span style={{ fontSize: "11.5px", color: "#D93F45", background: "#FBEEEF", borderRadius: "999px", padding: "7px 13px" }}>Не доставлено</span>
        </div>
      </div>
    </div>
  </div>

  <div style={{ width: "1440px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px", display: "flex", gap: "26px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Зачем экран. </span>Менеджер после перерыва должен за секунды понять, куда вернуться, не открывая диалоги по одному. Состояние примерки в строке отвечает на вопрос «где я его бросил».</span>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Что дальше. </span>Открываем Артёма — дальше меняются только лента диалога и панель примерки, поэтому показываю их в натуральную величину.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock4(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Клик по строке Артёма</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock5(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>03</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Диалог открыт · примерка ещё не собрана</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>до отправки остаётся один шаг</span>
  </div>
  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
    <div style={{ width: "640px", background: "#FFFFFF", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px 13px", display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid #F2F2F2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", flex: "none" }}>АГ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Артём Гусев</span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "3px 8px 3px 3px" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "6px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>WA</span>
                <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>+7 916 ··· 41 08</span>
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Второе обращение · в марте смотрели матовый чёрный</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>BMW X5 2021 · G05</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>А 432 ОР 77</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>Оклейка целиком · 18,2 м</span>
        </div>
      </div>
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px", background: "#FBFBFB", height: "300px", justifyContent: "flex-end" }}>
        <div style={{ alignSelf: "flex-start", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E", boxShadow: "0 1px 2px rgba(17,17,17,.04)" }}>Здравствуйте! Сколько будет обклеить X5 в сатин-хром?</div>
          <span style={{ fontSize: "10px", color: "#C4C4C4", paddingLeft: "6px" }}>13:58</span>
        </div>
        <div style={{ alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", padding: "14px 0" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.6" strokeLinecap="round"><path d="M14 6l6 6-6 6" /><path d="M4 12h15" /></svg>
          <span style={{ fontSize: "12.5px", color: "#9A9A9A", textAlign: "center", maxWidth: "300px", lineHeight: "1.45" }}>Соберите примерку в панели справа — карточка появится здесь и уйдёт в WhatsApp одним действием</span>
        </div>
      </div>
      <div style={{ padding: "12px 18px 16px", display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </div>
        <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "13px 18px", fontSize: "13.5px", color: "#9A9A9A" }}>Ответить Артёму…</div>
      </div>
    </div>

    <div style={{ width: "380px", background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em" }}>Панель примерки</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>часть диалога · без перехода</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 11px", flex: "none" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ fontSize: "11px", fontWeight: "500" }}>1 шаг</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "10px 12px" }}>
        <div style={{ width: "46px", height: "34px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="/renders/render-08.png" alt="фото клиента" /></div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>BMW X5 2021 · G05</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>распознано из фото · правится в один тап</span>
        </div>
        <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l7.5-7.5M14 4l6 6-8.5 8.5H8v-3.5z" /></svg>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Из прайса точки</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E" }}>4 в наличии из 6</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#DEF23B", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="/renders/render-01.png" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Сатин-хром тёмный</span>
            <span style={{ fontSize: "10.5px", opacity: ".6" }}>KPMF K75407 · сатин</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>248 400</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="/renders/render-02.png" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Матовый графит</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Oracal 970-070 · мат</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>214 900</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="/renders/render-03.png" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Глянец «серый нардо»</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Avery SW900-193 · глянец</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>231 500</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "16px", padding: "8px 10px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
          </div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#9A9A9A" }}>Зелёный британский</span>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4" }}>нет на складе · не уйдёт клиенту</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Свет</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>уходят все три · тумблера нет</span>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 0" }}>День</span>
          <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", padding: "9px 0" }}>Пасмурно</span>
          <span style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", padding: "9px 0" }}>Паркинг</span>
        </div>
      </div>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "12px 14px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>К отправке</span>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: "24px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>248 400<span style={{ fontSize: "15px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "11px 13px" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
        <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#2E2E2E" }}>Оговорка про сверку оттенка уходит с карточкой. Отключить нельзя.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", background: "#111111", borderRadius: "999px", padding: "15px 22px" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Отправить в WhatsApp</span>
      </div>
      <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>3 артикула × 3 света · 9 генераций · 54 ₽</span>
    </div>
  </div>
  <div style={{ width: "1034px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Приёмка. </span>От открытия диалога до отправки — два действия: выбрать артикул и нажать «Отправить». Третье остаётся в запасе на правку модели. Ноль ручного ввода артикула и цены, ноль переходов в другой раздел.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock6(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Развилка А · фото клиент ещё не прислал</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock7(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>04</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Типовой кузов за 18 секунд · до всякого фото</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>фото не является условием получения первой карточки</span>
  </div>
  <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ alignSelf: "flex-end", maxWidth: "96%", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
      <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", width: "340px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 0" }}>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF" }}>X5 в сатин-хроме</span>
          <span style={{ fontSize: "9.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>типовой кузов</span>
        </div>
        <div style={{ height: "150px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-07.png" alt="типовой X5" /></div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 3px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>KPMF K75407</span>
            <span style={{ fontSize: "10px", color: "#9A9A9A" }}>18,2 м · 3 дня работы</span>
          </div>
          <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.02em", color: "#DEF23B", fontVariantNumeric: "tabular-nums" }}>248 400</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#3E3E3E", borderRadius: "13px", padding: "10px 12px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#DDDDDD" }}>Это кузов вашей модели, не ваша машина. Пришлите фото — соберём на вашей за минуту, с номером и двором.</span>
        </div>
      </div>
      <span style={{ fontSize: "10px", color: "#C4C4C4", paddingRight: "6px" }}>13:59 · 18 секунд от обращения</span>
    </div>
  </div>
  <div style={{ width: "640px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Зачем экран. </span>Ожидание фото — самое медленное звено: разброс от пяти минут до двух суток. Типовой кузов сдвигает момент «ага» левее самого массового разрыва. Пометка не выглядит извинением — это полноценный первый результат.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock8(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Через 2 минуты Артём прислал фото · подхватилось из ленты автоматически</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock9(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>05</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Апгрейд на реальном авто</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>одна примерка, две версии — новой сущности не появляется</span>
  </div>
  <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "center", background: "#F5FBCB", borderRadius: "999px", padding: "6px 13px" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17V8a2 2 0 012-2h2l1.5-2h5L16 6h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.2" /></svg>
      <span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>Фото из диалога подхвачено автоматически · 14:01</span>
    </div>
    <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", gap: "8px", width: "420px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#FFFFFF", borderRadius: "16px", padding: "10px 12px", opacity: ".6" }}>
        <div style={{ width: "52px", height: "38px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="/renders/render-07.png" alt="" /></div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Версия 1 · типовой кузов</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>13:59</span></div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg></div>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#DEF23B", borderRadius: "16px", padding: "10px 12px" }}>
        <div style={{ width: "52px", height: "38px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="/renders/render-01.png" alt="" /></div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Версия 2 · ваша машина, А 432 ОР 77</span><span style={{ fontSize: "10.5px", opacity: ".65" }}>14:02 · апгрейд той же примерки</span></div>
      </div>
    </div>
  </div>
  <div style={{ width: "640px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Приёмка. </span>В результате сохраняются признаки узнавания — номер, диски, окружение. Это и есть момент «ага» клиента. Апгрейд помечен как апгрейд, а не как новая примерка, иначе история клиента распухает.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock10(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Менеджер нажал «Отправить в WhatsApp»</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock11(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "7px", padding: "6px 11px" }}>06</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Карточка ушла · 3 артикула × 3 света в одном сообщении</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>главный компонент продукта</span>
  </div>
  <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
      <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", width: "568px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 0" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Ваш X5 в трёх плёнках · три света</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Пост на Кутузовском</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "17px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "100px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-01.png" alt="сатин-хром день" /></div>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-09.png" alt="пасмурно" /></div>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-10.png" alt="паркинг" /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "2px 3px 2px" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Сатин-хром тёмный</span>
              <span style={{ fontSize: "10px", opacity: ".6" }}>KPMF K75407</span>
              <span style={{ fontSize: "14.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>248<span style={{ opacity: ".55" }}> 400 ₽</span></span>
            </div>
          </div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "17px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "100px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="мат графит день" /></div>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-11.png" alt="пасмурно" /></div>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-12.png" alt="паркинг" /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "2px 3px 2px" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2", color: "#FFFFFF" }}>Матовый графит</span>
              <span style={{ fontSize: "10px", color: "#9A9A9A" }}>Oracal 970-070</span>
              <span style={{ fontSize: "14.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>214<span style={{ color: "#9A9A9A" }}> 900 ₽</span></span>
            </div>
          </div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "17px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "100px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-03.png" alt="нардо день" /></div>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-13.png" alt="пасмурно" /></div>
              <div style={{ flex: "1", height: "54px", borderRadius: "9px", overflow: "hidden" }}><img src="/renders/render-14.png" alt="паркинг" /></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "2px 3px 2px" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2", color: "#FFFFFF" }}>Глянец «серый нардо»</span>
              <span style={{ fontSize: "10px", color: "#9A9A9A" }}>Avery SW900-193</span>
              <span style={{ fontSize: "14.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>231<span style={{ color: "#9A9A9A" }}> 500 ₽</span></span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "0 4px" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <span style={{ fontSize: "10px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>День</span>
            <span style={{ fontSize: "10px", fontWeight: "500", color: "#9A9A9A", background: "#3E3E3E", borderRadius: "999px", padding: "3px 8px" }}>Пасмурно</span>
            <span style={{ fontSize: "10px", fontWeight: "500", color: "#9A9A9A", background: "#3E3E3E", borderRadius: "999px", padding: "3px 8px" }}>Паркинг</span>
          </div>
          <span style={{ fontSize: "10.5px", color: "#6E6E6E", marginLeft: "auto" }}>крупный кадр — день</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#3E3E3E", borderRadius: "14px", padding: "11px 13px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#DDDDDD" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим. На экране цвет всегда немного другой, поэтому и показываем три света.</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingRight: "6px" }}>
        <span style={{ fontSize: "10px", color: "#C4C4C4" }}>14:03 · доставлено в WhatsApp</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2.2" strokeLinecap="round"><path d="M2 13l3.5 3.5L13 9" /><path d="M11 13l3.5 3.5L22 9" /></svg>
      </div>
    </div>
  </div>
  <div style={{ width: "640px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px", display: "flex", flexDirection: "column", gap: "8px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Почему подложка тёмная. </span>Девять рендеров на белом сливаются в кашу. Тёмная плашка отделяет их друг от друга, переживает сжатие мессенджера и делает выбранный артикул очевидным без рамок.</span>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Что внутри изображения. </span>Артикул, цена точки и логотип впечатаны в сам кадр — иначе картинка уходит к соседям-конкурентам анонимной.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock12(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Развилка Б · генератор не уложился в три минуты</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock13(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>07</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Частичная выдача · уходит готовая часть</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>а не сообщение об ожидании</span>
  </div>
  <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
    <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
      <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", width: "420px" }}>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Первое готово, остальные догоняют</span>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "14px", padding: "6px" }}>
            <div style={{ height: "78px", borderRadius: "10px", overflow: "hidden" }}><img src="/renders/render-01.png" alt="" /></div>
          </div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "14px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "repeating-linear-gradient(115deg,#3E3E3E 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "10px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.35" }}>через<br />~40 сек</span></div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "14px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "repeating-linear-gradient(115deg,#3E3E3E 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "10px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.35" }}>через<br />~55 сек</span></div>
        </div>
        <span style={{ fontSize: "11px", color: "#DDDDDD", lineHeight: "1.45" }}>Сатин-хром готов — смотрите. Матовый и глянец дособерём и допришлём в этот же диалог, ничего делать не нужно.</span>
      </div>
      <span style={{ fontSize: "10px", color: "#C4C4C4", paddingRight: "6px" }}>14:03 · доставлено</span>
    </div>
  </div>
  <div style={{ width: "640px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Правило. </span>Клиент получает результат сразу, дополнение приходит само — без второго действия менеджера. Штриховка здесь та же, что и в «нет данных»: нового визуального языка для ожидания не заводим.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock14(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Через 3 минуты · тот момент, ради которого всё построено</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock15(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "7px", padding: "6px 11px" }}>08 · 09</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>«А можно ещё в этом, но матовый?» и домер варианта</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>нужный цикл — он должен быть дешёвым</span>
  </div>
  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
    <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ alignSelf: "flex-start", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#111111", boxShadow: "0 0 0 2px #DEF23B" }}>А можно ещё в этом, но матовый?</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "6px" }}>
          <span style={{ fontSize: "10px", color: "#C4C4C4" }}>14:06</span>
          <span style={{ fontSize: "10px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "2px 7px" }}>момент «ага» · через 3 минуты после отправки</span>
        </div>
      </div>
      <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
        <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "9px", width: "300px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Добрали: матовый хром тёмный</span>
          <div style={{ background: "#DEF23B", borderRadius: "14px", padding: "6px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ height: "82px", borderRadius: "10px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="матовый хром день" /></div>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="/renders/render-11.png" alt="пасмурно" /></div>
              <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="/renders/render-12.png" alt="паркинг" /></div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "1px 3px 2px" }}>
              <span style={{ fontSize: "9.5px", opacity: ".65" }}>KPMF K75491</span>
              <span style={{ fontSize: "14px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>253<span style={{ opacity: ".55" }}> 900 ₽</span></span>
            </div>
          </div>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.4" }}>Та же оговорка про сверку оттенка ушла вместе с кадром.</span>
        </div>
        <span style={{ fontSize: "10px", color: "#C4C4C4", paddingRight: "6px" }}>14:08 · доставлено · это та же примерка, не новая</span>
      </div>
    </div>
    <div style={{ width: "380px", background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Домер варианта</span>
        <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 10px" }}>в том же диалоге</span>
      </div>
      <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Запрос клиента распознан</span>
        <span style={{ fontSize: "13px", fontWeight: "500", lineHeight: "1.4" }}>«в этом, но матовый» → сатин-хром в матовом финише</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#DEF23B", borderRadius: "16px", padding: "9px 11px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="/renders/render-02.png" alt="" /></div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Матовый хром тёмный</span>
          <span style={{ fontSize: "10.5px", opacity: ".6" }}>KPMF K75491 · есть на складе</span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>253 900</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "9px 11px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="/renders/render-11.png" alt="" /></div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2" }}>Матовый чёрный</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>смотрели в марте</span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>206 700</span>
      </div>
      <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "11px 13px" }}>
        <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#2E2E2E" }}>Домер — 3 генерации вместо 9. Новую примерку не заводим: у клиента остаётся один объект с историей.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", background: "#111111", borderRadius: "999px", padding: "15px 22px", marginTop: "auto" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Добрать и отправить</span>
      </div>
      <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>3 генерации · 18 ₽</span>
    </div>
  </div>
  <div style={{ width: "1034px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Это и есть доказательство продукта. </span>Наблюдаемый прокси — повторная отправка в тот же тред в течение десяти минут. Не оценка рендера менеджером, а реакция его собственного клиента.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock16(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Артём нажал «беру этот» в самом сообщении</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock17(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>10 · 11</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Подтверждение выбора и замер прямо из диалога</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>событие, а не реплика в ленте</span>
  </div>
  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
    <div style={{ width: "640px", background: "#FBFBFB", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "#111111", borderRadius: "16px", padding: "12px 16px" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Артём подтвердил выбор: матовый хром тёмный</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>28 августа, 14:11 · KPMF K75491 · оговорка показана до подтверждения</span>
        </div>
      </div>
      <div style={{ alignSelf: "flex-start", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E", boxShadow: "0 1px 2px rgba(17,17,17,.04)" }}>Беру матовый. Когда можно на замер?</div>
        <span style={{ fontSize: "10px", color: "#C4C4C4", paddingLeft: "6px" }}>14:12</span>
      </div>
      <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "#DEF23B", borderRadius: "16px", padding: "12px 16px" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
        <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Замер: 29 августа, 11:00 · Пост №2 · наряд 4182 создан</span>
      </div>
      <div style={{ alignSelf: "flex-end", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
        <div style={{ background: "#111111", borderRadius: "18px 18px 5px 18px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#FFFFFF" }}>Записал вас на 29 августа, 11:00. Возьмём рулон и сверим оттенок при вас — это пять минут.</div>
        <span style={{ fontSize: "10px", color: "#C4C4C4", paddingRight: "6px" }}>14:13 · доставлено</span>
      </div>
    </div>
    <div style={{ width: "380px", background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Замер</span>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10px", color: "#9A9A9A" }}>чт</span><span style={{ fontSize: "15px", fontWeight: "500" }}>28</span></div>
        <div style={{ flex: "1", background: "#111111", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10px", color: "#9A9A9A" }}>пт</span><span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>29</span></div>
        <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10px", color: "#9A9A9A" }}>сб</span><span style={{ fontSize: "15px", fontWeight: "500" }}>30</span></div>
        <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10px", color: "#C4C4C4" }}>вс</span><span style={{ fontSize: "15px", fontWeight: "500", color: "#C4C4C4" }}>31</span></div>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#C4C4C4", background: "#F7F7F7", borderRadius: "999px", padding: "8px 13px" }}>09:00</span>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "8px 13px" }}>11:00</span>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 13px" }}>13:30</span>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 13px" }}>16:00</span>
      </div>
      <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Пост</span><span style={{ fontSize: "12px", fontWeight: "500" }}>№2 · Пётр Салимов</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Артикул</span><span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>KPMF K75491</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Сумма</span><span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>253 900 ₽</span></div>
      </div>
      <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "11px 13px" }}>
        <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#2E2E2E" }}>Заказ-наряд и счёт соберутся сами из подтверждённой конфигурации. Незаполненные реквизиты не блокируют движение.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#111111", borderRadius: "999px", padding: "15px 22px", marginTop: "auto" }}>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Записать и сообщить клиенту</span>
      </div>
    </div>
  </div>
  <div style={{ width: "1034px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Что здесь родилось. </span>Один объект — фото, артикул, цена, отметка показа оговорки, дата подтверждения — который дальше проходит все контуры без перенабора полей: мастера у поста, выдачу и сводку владельца.</span>
  </div>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock18(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Отказные развилки того же диалога · половина ценности живёт здесь</span>
</div></>
  );
}

export function S02Phase2ManagerInboxDialogBlock19(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#D93F45", color: "#FFFFFF", borderRadius: "7px", padding: "6px 11px" }}>12–15</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Что видит менеджер, когда что-то пошло не так</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>у каждого отказа в том же блоке есть следующий ход</span>
  </div>

  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flexWrap: "wrap", maxWidth: "1450px" }}>

    <div style={{ width: "352px", background: "#FFFFFF", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 7px" }}>12</span>
        <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Фото непригодно</span>
      </div>
      <div style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
        <div style={{ width: "88px", height: "66px", borderRadius: "13px", background: "#2E2E2E", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round"><path d="M4 20L20 4" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Темно — цвет соврёт</span>
          <span style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#6E6E6E" }}>Попросите снять днём или под навесом, машина целиком, сбоку.</span>
        </div>
      </div>
      <div style={{ background: "#DEF23B", borderRadius: "16px", padding: "11px 13px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "50px", height: "36px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="/renders/render-07.png" alt="" /></div>
        <span style={{ flex: "1", fontSize: "11.5px", lineHeight: "1.4" }}>Уже ушло на типовом X5 — клиент не остался ни с чем</span>
      </div>
      <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>Ночь, подземный паркинг, против солнца, фото из объявления — один сценарий, одна подсказка, мгновенный фолбэк.</span>
    </div>

    <div style={{ width: "352px", background: "#FFFFFF", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 7px" }}>13</span>
        <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Не доставлено и лимиты канала</span>
      </div>
      <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end", width: "100%" }}>
        <div style={{ background: "#F7F7F7", borderRadius: "16px 16px 5px 16px", padding: "10px 13px", display: "flex", alignItems: "center", gap: "9px", alignSelf: "flex-end" }}>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Карточка с тремя плёнками</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
        </div>
        <span style={{ fontSize: "10px", color: "#D93F45", alignSelf: "flex-end" }}>не доставлено · Avito не принимает изображения</span>
      </div>
      <div style={{ background: "#DEF23B", borderRadius: "16px", padding: "11px 13px", display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{ fontSize: "12px", fontWeight: "500" }}>Ушло вместо картинки</span>
        <span style={{ fontSize: "11px", lineHeight: "1.4" }}>Текст с тремя артикулами и ценами плюс ссылка на страницу с девятью кадрами. Видно, что именно ушло.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
        <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "8px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
        <span style={{ flex: "1", fontSize: "11.5px", lineHeight: "1.4" }}>Канал отвалился 12 минут назад · входящие копятся</span>
      </div>
      <div style={{ background: "#111111", borderRadius: "999px", padding: "12px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Привязать заново · 40 секунд</span></div>
    </div>

    <div style={{ width: "352px", background: "#FFFFFF", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 7px" }}>14</span>
        <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Два менеджера в одном диалоге</span>
      </div>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", flex: "none" }}>ИК</div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ирина взяла диалог</span><span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>14:02 · собирает примерку</span></div>
        </div>
        <div style={{ height: "1px", background: "#EDEDED" }}></div>
        <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Вы можете читать. Чтобы ответить — заберите диалог, Ирина увидит это сразу.</span>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", background: "#111111", borderRadius: "999px", padding: "10px 0", textAlign: "center" }}><span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF" }}>Забрать</span></div>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "10px 0", textAlign: "center" }}><span style={{ fontSize: "12px", fontWeight: "500" }}>Только читать</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>Дубли генераций в этой ситуации не тарифицируются: точка не платит за конфликт смены. Клиент и менеджер меняют конфигурацию одновременно — выбор клиента всегда старше черновика.</span>
    </div>

    <div style={{ width: "352px", background: "#FFFFFF", borderRadius: "24px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", background: "#F5F5F5", borderRadius: "5px", padding: "3px 7px" }}>15</span>
        <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Лид из гаража в инбоксе</span>
      </div>
      <div style={{ background: "#DEF23B", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#111111", color: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>ЕЛ</div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Егор Лапин</span>
            <span style={{ fontSize: "11px", opacity: ".65" }}>Kia K5 · конфигурация из гаража</span>
          </div>
          <span style={{ fontSize: "10.5px", opacity: ".65", flex: "none" }}>только что</span>
        </div>
        <span style={{ fontSize: "12px", lineHeight: "1.35" }}>Собрал в гараже: сатин хаки + диски. Посчитайте?</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
        <div style={{ width: "50px", height: "36px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="/renders/render-04.png" alt="" /></div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12px", fontWeight: "500" }}>Сборка уже готова</span>
          <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>артикулы, цена, три света — пересказывать нечего</span>
        </div>
      </div>
      <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>Конфигурация из публичного гаража приходит как новое обращение в тот же инбокс — отдельного раздела «заявки с сайта» нет.</span>
    </div>
  </div>

  <div style={{ width: "1450px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px", display: "flex", gap: "26px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Правило системы. </span>Красный — только необратимое: не доставлено, рулон не сошёлся. Пороги и лимиты — Acid 300 и штриховка, никогда не красный. Порог не должен выглядеть поломкой.</span>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", flex: "1", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Сценарий 1 закрыт. </span>Дальше — сценарий 2: тот же продукт со стороны клиента, гараж-примерочная, 12 экранов.</span>
  </div>
</div></>
  );
}

export const S02Phase2ManagerInboxDialogBlocks = [S02Phase2ManagerInboxDialogBlock0, S02Phase2ManagerInboxDialogBlock1, S02Phase2ManagerInboxDialogBlock2, S02Phase2ManagerInboxDialogBlock3, S02Phase2ManagerInboxDialogBlock4, S02Phase2ManagerInboxDialogBlock5, S02Phase2ManagerInboxDialogBlock6, S02Phase2ManagerInboxDialogBlock7, S02Phase2ManagerInboxDialogBlock8, S02Phase2ManagerInboxDialogBlock9, S02Phase2ManagerInboxDialogBlock10, S02Phase2ManagerInboxDialogBlock11, S02Phase2ManagerInboxDialogBlock12, S02Phase2ManagerInboxDialogBlock13, S02Phase2ManagerInboxDialogBlock14, S02Phase2ManagerInboxDialogBlock15, S02Phase2ManagerInboxDialogBlock16, S02Phase2ManagerInboxDialogBlock17, S02Phase2ManagerInboxDialogBlock18, S02Phase2ManagerInboxDialogBlock19];
export const S02Phase2ManagerInboxDialogCanvas = { background: "#2A2A2A", padding: "52px 48px 120px", fontFamily: "Onest,system-ui,sans-serif", color: "#111111", display: "flex", flexDirection: "column", gap: "44px", width: "max-content" } as React.CSSProperties;
