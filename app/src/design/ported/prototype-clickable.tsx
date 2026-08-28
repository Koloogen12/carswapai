/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/prototype-clickable.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function PrototypeClickableBlock0(): ReactElement {
  return (
    <><div style={{ width: "100%", maxWidth: "1460px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
      </div>
      <span style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF", letterSpacing: "-0.02em" }}>CarSwap AI</span>
    </div>
    <span style={{ fontSize: "12px", color: "#8A8A8A" }}>кликабельный прототип · сквозной сценарий</span>
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "@@DC:tabManagerBg@@", color: "@@DC:tabManagerFg@@" }}>Менеджер</div>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "@@DC:tabClientBg@@", color: "@@DC:tabClientFg@@" }}>Клиент · гараж</div>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "@@DC:tabMasterBg@@", color: "@@DC:tabMasterFg@@" }}>Мастер</div>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "@@DC:tabOwnerBg@@", color: "@@DC:tabOwnerFg@@" }}>Владелец</div>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "@@DC:tabNetworkBg@@", color: "@@DC:tabNetworkFg@@" }}>Сеть</div>
    <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px", background: "rgba(255,255,255,.1)", color: "#DDDDDD", marginLeft: "6px" }}>Сброс</div>
  </div>
</div></>
  );
}

export function PrototypeClickableBlock1(): ReactElement {
  return (
    <><div style={{ width: "100%", maxWidth: "1460px", display: "flex", alignItems: "center", gap: "10px", padding: "0 2px" }}>
  <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Сейчас</span>
  <span style={{ fontSize: "12.5px", color: "#C9C9C9" }}>@@DC:hint@@</span>
</div></>
  );
}

export function PrototypeClickableBlock2(): ReactElement {
  return (
    <>&#123;/* sc-if: isManager */&#125;
<div style={{ width: "1440px", height: "920px", background: "#EFEFEF", borderRadius: "30px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>

  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
      </div>
      <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>CarSwap</span>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", background: "#FFFFFF", borderRadius: "999px", padding: "5px 11px", marginLeft: "4px" }}>Пост на Кутузовском</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Генерации</span>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "62px", height: "5px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}><div style={{ width: "@@DC:genPct@@", height: "5px", background: "#DEF23B" }}></div></div>
          <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>@@DC:genUsed@@<span style={{ color: "#9A9A9A" }}>/2 000</span></span>
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

    
    <div style={{ width: "340px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 15px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: "500", letterSpacing: "-0.025em" }}>Обращения</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>@@DC:inboxCount@@</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "10px 14px" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
        <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Клиент, номер или артикул</span>
      </div>
      <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
        <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "8px 0" }}>Горячие сверху</span>
        <span style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", color: "#6E6E6E", padding: "8px 0" }}>Все</span>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px", minHeight: "0", overflow: "hidden" }}>

        &#123;/* sc-if: fromGarage */&#125;
        <div style={{ cursor: "pointer", background: "#DEF23B", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px", animation: "slidein .35s ease" }}>
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
        

        <div style={{ cursor: "pointer", background: "@@DC:rowArtemBg@@", borderRadius: "18px", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>АГ</div>
            <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", color: "@@DC:rowArtemFg@@" }}>Артём Гусев</span>
                <span style={{ width: "15px", height: "15px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
              </div>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>BMW X5 2021 · А 432 ОР 77</span>
            </div>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>@@DC:artemTime@@</span>
          </div>
          <span style={{ fontSize: "12px", lineHeight: "1.35", color: "@@DC:rowArtemMsgFg@@", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@@DC:artemLast@@</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "@@DC:artemChipBg@@", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "@@DC:artemChipFg@@" }}>@@DC:artemState@@</span>
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
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", flex: "none" }}>27 мин</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#EFEFEF", borderRadius: "999px", padding: "6px 11px", width: "max-content" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A" }}>Без примерки</span>
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
      </div>
    </div>

    
    <div style={{ flex: "1", minWidth: "0", background: "#FFFFFF", borderRadius: "24px", display: "flex", flexDirection: "column", minHeight: "0", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 13px", display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid #F2F2F2" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
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
          <div style={{ display: "flex", gap: "6px", flex: "none" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.6" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15V5a2 2 0 012-2h9l5 5v7a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M8 19h10" /></svg>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>BMW X5 2021 · G05</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>А 432 ОР 77</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "5px 11px" }}>Оклейка целиком · 18,2 м</span>
        </div>
      </div>

      <div style={{ flex: "1", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "flex-end", background: "#FBFBFB", minHeight: "0", overflow: "hidden" }}>

        <div style={{ alignSelf: "flex-start", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E", boxShadow: "0 1px 2px rgba(17,17,17,.04)" }}>Здравствуйте! Сколько будет обклеить X5 в сатин-хром?</div>
          <span style={{ fontSize: "10px", color: "#C4C4C4", paddingLeft: "6px" }}>13:58</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "center", background: "#F5FBCB", borderRadius: "999px", padding: "6px 13px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17V8a2 2 0 012-2h2l1.5-2h5L16 6h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><circle cx="12" cy="12.5" r="3.2" /></svg>
          <span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>Фото из диалога подхвачено автоматически · 14:01</span>
        </div>

        &#123;/* sc-if: notSent */&#125;
        <div style={{ alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", padding: "18px 0" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.6" strokeLinecap="round"><path d="M14 6l6 6-6 6" /><path d="M4 12h15" /></svg>
          <span style={{ fontSize: "12.5px", color: "#9A9A9A", textAlign: "center", maxWidth: "280px", lineHeight: "1.45" }}>Соберите примерку в панели справа и отправьте — карточка появится здесь и уйдёт в WhatsApp</span>
        </div>
        

        &#123;/* sc-if: sent */&#125;
        <div style={{ alignSelf: "flex-end", maxWidth: "98%", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end", animation: "slidein .3s ease" }}>
          <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", width: "520px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 0" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF" }}>Ваш X5 · @@DC:cardCount@@ плёнки × три света</span>
              <span style={{ fontSize: "10px", color: "#9A9A9A" }}>Пост на Кутузовском</span>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              <div style={{ flex: "1", background: "#DEF23B", borderRadius: "16px", padding: "7px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ height: "84px", borderRadius: "11px", overflow: "hidden" }}><img src="@@DC:scDay@@" alt="сатин-хром, день" /></div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:scCloud@@" alt="пасмурно" /></div>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:scPark@@" alt="паркинг" /></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "1px 3px 2px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Сатин-хром тёмный</span>
                  <span style={{ fontSize: "9.5px", opacity: ".6" }}>KPMF K75407</span>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>248<span style={{ opacity: ".55" }}> 400 ₽</span></span>
                </div>
              </div>
              <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "16px", padding: "7px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ height: "84px", borderRadius: "11px", overflow: "hidden" }}><img src="@@DC:mgDay@@" alt="матовый графит, день" /></div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:mgCloud@@" alt="пасмурно" /></div>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:mgPark@@" alt="паркинг" /></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "1px 3px 2px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2", color: "#FFFFFF" }}>Матовый графит</span>
                  <span style={{ fontSize: "9.5px", color: "#9A9A9A" }}>Oracal 970-070</span>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>214<span style={{ color: "#9A9A9A" }}> 900 ₽</span></span>
                </div>
              </div>
              <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "16px", padding: "7px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ height: "84px", borderRadius: "11px", overflow: "hidden" }}><img src="@@DC:ngDay@@" alt="нардо, день" /></div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:ngCloud@@" alt="пасмурно" /></div>
                  <div style={{ flex: "1", height: "44px", borderRadius: "8px", overflow: "hidden" }}><img src="@@DC:ngPark@@" alt="паркинг" /></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "1px 3px 2px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2", color: "#FFFFFF" }}>Глянец «серый нардо»</span>
                  <span style={{ fontSize: "9.5px", color: "#9A9A9A" }}>Avery SW900-193</span>
                  <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>231<span style={{ color: "#9A9A9A" }}> 500 ₽</span></span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#3E3E3E", borderRadius: "13px", padding: "10px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
              <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#DDDDDD" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим. На экране цвет всегда немного другой, поэтому и показываем три света.</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingRight: "6px" }}>
            <span style={{ fontSize: "10px", color: "#C4C4C4" }}>14:03 · доставлено в WhatsApp</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2.2" strokeLinecap="round"><path d="M2 13l3.5 3.5L13 9" /><path d="M11 13l3.5 3.5L22 9" /></svg>
          </div>
        </div>
        

        &#123;/* sc-if: asked */&#125;
        <div style={{ alignSelf: "flex-start", maxWidth: "74%", display: "flex", flexDirection: "column", gap: "3px", animation: "slidein .3s ease" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "18px 18px 18px 5px", padding: "12px 16px", fontSize: "13.5px", lineHeight: "1.45", color: "#111111", boxShadow: "0 0 0 2px #DEF23B" }}>А можно ещё в этом, но матовый?</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "6px" }}>
            <span style={{ fontSize: "10px", color: "#C4C4C4" }}>14:06</span>
            <span style={{ fontSize: "10px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "2px 7px" }}>момент «ага»</span>
          </div>
        </div>
        

        &#123;/* sc-if: added */&#125;
        <div style={{ alignSelf: "flex-end", maxWidth: "98%", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end", animation: "slidein .3s ease" }}>
          <div style={{ background: "#111111", borderRadius: "22px 22px 7px 22px", padding: "12px", display: "flex", flexDirection: "column", gap: "9px", width: "300px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Добрали: матовый хром тёмный</span>
            <div style={{ background: "#DEF23B", borderRadius: "14px", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ height: "78px", borderRadius: "10px", overflow: "hidden" }}><img src="@@DC:mgDay@@" alt="матовый хром, день" /></div>
              <div style={{ display: "flex", gap: "4px" }}>
                <div style={{ flex: "1", height: "40px", borderRadius: "7px", overflow: "hidden" }}><img src="@@DC:mgCloud@@" alt="пасмурно" /></div>
                <div style={{ flex: "1", height: "40px", borderRadius: "7px", overflow: "hidden" }}><img src="@@DC:mgPark@@" alt="паркинг" /></div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "1px 3px 2px" }}>
                <span style={{ fontSize: "9.5px", opacity: ".65" }}>KPMF K75491</span>
                <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>253<span style={{ opacity: ".55" }}> 900 ₽</span></span>
              </div>
            </div>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.4" }}>Та же оговорка про сверку оттенка ушла вместе с кадром.</span>
          </div>
          <span style={{ fontSize: "10px", color: "#C4C4C4", paddingRight: "6px" }}>14:08 · доставлено</span>
        </div>
        

        &#123;/* sc-if: confirmed */&#125;
        <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "#111111", borderRadius: "16px", padding: "12px 16px", animation: "slidein .3s ease" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Артём подтвердил выбор: матовый хром тёмный</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>28 августа, 14:11 · KPMF K75491 · оговорка показана до подтверждения</span>
          </div>
        </div>
        

        &#123;/* sc-if: booked */&#125;
        <div style={{ alignSelf: "center", display: "flex", alignItems: "center", gap: "10px", background: "#DEF23B", borderRadius: "16px", padding: "12px 16px", animation: "slidein .3s ease" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Замер: 29 августа, 11:00 · Пост №2 · наряд создан</span>
        </div>
        
      </div>

      <div style={{ padding: "12px 18px 16px", display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </div>
        <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "13px 18px", fontSize: "13.5px", color: "#9A9A9A" }}>Ответить Артёму…</div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: "@@DC:ctaBg@@", borderRadius: "999px", padding: "12px 19px", flex: "none" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500", color: "@@DC:ctaFg@@" }}>@@DC:ctaLabel@@</span>
        </div>
      </div>
    </div>

    
    <div style={{ width: "368px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "0", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em" }}>Панель примерки</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>в этом же диалоге · без перехода</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 11px", flex: "none" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ fontSize: "11px", fontWeight: "500" }}>@@DC:stepsLeft@@</span>
        </div>
      </div>

      <div style={{ borderRadius: "18px", overflow: "hidden", background: "#F7F7F7", height: "158px", position: "relative" }}>
        <img src="@@DC:heroImg@@" alt="примерка" />
        <div style={{ position: "absolute", left: "10px", top: "10px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,.92)", borderRadius: "999px", padding: "5px 10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ fontSize: "10.5px", fontWeight: "500" }}>@@DC:heroLabel@@</span>
        </div>
        <div style={{ position: "absolute", right: "10px", bottom: "10px", background: "rgba(17,17,17,.78)", borderRadius: "999px", padding: "5px 10px" }}>
          <span style={{ fontSize: "10px", fontWeight: "500", color: "#FFFFFF" }}>@@DC:heroLight@@</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "10px 12px" }}>
        <div style={{ width: "46px", height: "34px", borderRadius: "10px", overflow: "hidden", flex: "none" }}><img src="@@DC:basePhoto@@" alt="фото клиента" /></div>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>BMW X5 2021 · G05</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>распознано из фото · номер и двор сохранены</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Из прайса точки</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E" }}>4 в наличии из 6</span>
        </div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: "@@DC:skuScBg@@", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="@@DC:scDay@@" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2", color: "@@DC:skuScFg@@" }}>Сатин-хром тёмный</span>
            <span style={{ fontSize: "10.5px", color: "@@DC:skuScSub@@" }}>KPMF K75407 · сатин</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", color: "@@DC:skuScFg@@", fontVariantNumeric: "tabular-nums" }}>248 400</span>
        </div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: "@@DC:skuMgBg@@", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="@@DC:mgDay@@" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2", color: "@@DC:skuMgFg@@" }}>Матовый графит</span>
            <span style={{ fontSize: "10.5px", color: "@@DC:skuMgSub@@" }}>Oracal 970-070 · мат</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", color: "@@DC:skuMgFg@@", fontVariantNumeric: "tabular-nums" }}>214 900</span>
        </div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: "@@DC:skuNgBg@@", borderRadius: "16px", padding: "9px 11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", overflow: "hidden", flex: "none" }}><img src="@@DC:ngDay@@" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2", color: "@@DC:skuNgFg@@" }}>Глянец «серый нардо»</span>
            <span style={{ fontSize: "10.5px", color: "@@DC:skuNgSub@@" }}>Avery SW900-193 · глянец</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", color: "@@DC:skuNgFg@@", fontVariantNumeric: "tabular-nums" }}>231 500</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "16px", padding: "8px 10px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
          </div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", lineHeight: "1.2", color: "#9A9A9A" }}>Зелёный британский</span>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4" }}>нет на складе · не уйдёт клиенту</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Свет</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>уходят все три · К-1</span>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "@@DC:lDayBg@@", borderRadius: "999px", padding: "9px 0" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "@@DC:lDayFg@@" }}>День</span>
          </div>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "@@DC:lCloudBg@@", borderRadius: "999px", padding: "9px 0" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "@@DC:lCloudFg@@" }}>Пасмурно</span>
          </div>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "@@DC:lParkBg@@", borderRadius: "999px", padding: "9px 0" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", color: "@@DC:lParkFg@@" }}>Паркинг</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "12px 14px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#6E6E6E" }}>К отправке</span>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "24px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>@@DC:price@@<span style={{ fontSize: "15px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#2E2E2E" }}>Оговорка про сверку оттенка уходит с карточкой. Отключить нельзя.</span>
        </div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", background: "@@DC:ctaBg@@", borderRadius: "999px", padding: "15px 22px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="@@DC:ctaIcon@@" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "@@DC:ctaFg@@" }}>@@DC:ctaLabel@@</span>
        </div>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>@@DC:genNote@@</span>
      </div>
    </div>
  </div>
</div>
</>
  );
}

export function PrototypeClickableBlock3(): ReactElement {
  return (
    <>&#123;/* sc-if: isClient */&#125;
<div style={{ display: "flex", gap: "26px", alignItems: "flex-start" }}>

  
  <div style={{ width: "390px", height: "844px", background: "#EFEFEF", borderRadius: "44px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", flex: "none" }}>

    &#123;/* sc-if: gLanding */&#125;
    <div style={{ position: "absolute", inset: "0" }}><img src="@@DC:demoImg@@" alt="демо-машина в плёнке" /></div>
    <div style={{ position: "relative", padding: "26px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "500" }}>Пост на Кутузовском</span>
      </div>
    </div>
    <div style={{ position: "relative", marginTop: "auto", padding: "0 14px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "25px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1", textWrap: "pretty" }}>Посмотрите свою машину в другом цвете</span>
          <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>Это чужая — уже перекрашена. Загрузите фото своей, и через минуту увидите её же: свой номер, свои диски, свой двор.</span>
        </div>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ cursor: "pointer", flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500" }}>Снять</span></div>
          <div style={{ cursor: "pointer", flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500" }}>Галерея</span></div>
          <div style={{ cursor: "pointer", flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Нет фото</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
          <div style={{ width: "17px", height: "17px", borderRadius: "5px", background: "#F5F5F5", flex: "none", marginTop: "1px" }}></div>
          <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#9A9A9A" }}>Согласен на обработку фото автомобиля, включая читаемый госномер, для показа примерки. Фото не публикуется без моего действия.</span>
        </div>
      </div>
    </div>
    

    &#123;/* sc-if: gUpload */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 18px 18px", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ cursor: "pointer", width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        </div>
        <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Собираем на вашей машине</span>
      </div>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "210px", position: "relative" }}>
        <img src="@@DC:basePhoto@@" alt="фото клиента" />
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
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Прайс Поста на Кутузовском подтянут</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "17px", height: "17px", borderRadius: "999px", boxShadow: "inset 0 0 0 2px #DEF23B", flex: "none", animation: "pulse 1.1s infinite" }}></div>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Первый цвет · осталось ~14 секунд</span>
        </div>
        <div style={{ height: "6px", borderRadius: "999px", background: "#F0F0F0", overflow: "hidden" }}><div style={{ width: "62%", height: "6px", background: "#DEF23B" }}></div></div>
      </div>
      <div style={{ cursor: "pointer", marginTop: "auto", background: "#111111", borderRadius: "999px", padding: "17px 0", textAlign: "center" }}><span style={{ fontSize: "14.5px", fontWeight: "500", color: "#FFFFFF" }}>Готово — показать</span></div>
    </div>
    

    &#123;/* sc-if: gMain */&#125;
    <div style={{ position: "absolute", inset: "0" }}><img src="@@DC:gHero@@" alt="ваша машина в плёнке" /></div>
    <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
        <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ваш X5 · А 432 ОР 77</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 12px" }}>
        <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>@@DC:gLeft@@</span>
        <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>примерок осталось</span>
      </div>
    </div>
    <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px", padding: "0 12px 14px" }}>
      <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "4px", alignSelf: "center" }}>
        <div style={{ cursor: "pointer", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "8px 14px", background: "@@DC:gLDayBg@@", color: "@@DC:gLDayFg@@" }}>День</div>
        <div style={{ cursor: "pointer", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "8px 14px", background: "@@DC:gLCloudBg@@", color: "@@DC:gLCloudFg@@" }}>Пасмурно</div>
        <div style={{ cursor: "pointer", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "8px 14px", background: "@@DC:gLParkBg@@", color: "@@DC:gLParkFg@@" }}>Паркинг</div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
        <div style={{ display: "flex", gap: "5px" }}>
          <div style={{ cursor: "pointer", flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", background: "@@DC:gCatFilmBg@@", color: "@@DC:gCatFilmFg@@" }}>Плёнка</div>
          <div style={{ cursor: "pointer", flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", background: "@@DC:gCatWheelBg@@", color: "@@DC:gCatWheelFg@@" }}>Диски</div>
          <div style={{ cursor: "pointer", flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", background: "@@DC:gCatTrimBg@@", color: "@@DC:gCatTrimFg@@" }}>Салон</div>
          <div style={{ cursor: "pointer", flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", background: "@@DC:gCatKitBg@@", color: "@@DC:gCatKitFg@@" }}>Обвес</div>
        </div>

        &#123;/* sc-if: gIsFilm */&#125;
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden", boxShadow: "@@DC:gScRing@@" }}><img src="@@DC:scDay@@" alt="" /></div>
            <span style={{ fontSize: "9.5px", textAlign: "center", fontWeight: "500", color: "@@DC:gScFg@@" }}>Сатин-хром</span>
          </div>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden", boxShadow: "@@DC:gMgRing@@" }}><img src="@@DC:mgDay@@" alt="" /></div>
            <span style={{ fontSize: "9.5px", textAlign: "center", fontWeight: "500", color: "@@DC:gMgFg@@" }}>Мат графит</span>
          </div>
          <div style={{ cursor: "pointer", flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden", boxShadow: "@@DC:gNgRing@@" }}><img src="@@DC:ngDay@@" alt="" /></div>
            <span style={{ fontSize: "9.5px", textAlign: "center", fontWeight: "500", color: "@@DC:gNgFg@@" }}>Нардо</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "58px", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
            </div>
            <span style={{ fontSize: "9.5px", textAlign: "center", color: "#C4C4C4" }}>Хаки — нет</span>
          </div>
        </div>
        

        &#123;/* sc-if: gIsWheel */&#125;
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: "@@DC:gWheelBg@@", borderRadius: "18px", padding: "10px 12px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", overflow: "hidden", flex: "none" }}><img src="@@DC:wheelImg@@" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Диски в глянцевом чёрном</span>
            <span style={{ fontSize: "10.5px", color: "@@DC:gWheelSub@@" }}>Порошок · 21" · 4 диска</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>46 000</span>
        </div>
        

        &#123;/* sc-if: gIsTrim */&#125;
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: "@@DC:gTrimBg@@", borderRadius: "18px", padding: "10px 12px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", overflow: "hidden", flex: "none" }}><img src="@@DC:trimImg@@" alt="" /></div>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Алькантара, тёмно-серая</span>
            <span style={{ fontSize: "10.5px", color: "@@DC:gTrimSub@@" }}>Сиденья и карты дверей</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>88 000</span>
        </div>
        

        &#123;/* sc-if: gIsKit */&#125;
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "18px", padding: "13px 14px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4", color: "#2E2E2E" }}>Обвеса под X5 G05 в прайсе этой точки нет. Ближайшая точка с обвесом — Ленинградское шоссе.</span>
        </div>
        

        <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "10px 12px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим. Поэтому показываем три света.</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>@@DC:gSummary@@</span>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>@@DC:gTotal@@<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
          </div>
          <div style={{ cursor: "pointer", width: "44px", height: "44px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="5" width="7" height="14" rx="2" /></svg>
          </div>
          <div style={{ cursor: "pointer", background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Написать точке</span>
          </div>
        </div>
      </div>
    </div>
    

    &#123;/* sc-if: gCompare */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <div style={{ cursor: "pointer", width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        </div>
        <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Что взять</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 11px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ fontSize: "11px", fontWeight: "500" }}>@@DC:gLightLabel@@</span>
        </div>
      </div>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px", minHeight: "0" }}>
        <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 0 0 3px #DEF23B" }}>
          <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}><img src="@@DC:gHero@@" alt="вариант А" /></div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>@@DC:gSkuName@@</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>@@DC:gSkuCode@@</span></div>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>@@DC:gSkuPrice@@</span>
          </div>
        </div>
        <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}><img src="@@DC:gHeroAlt@@" alt="вариант Б" /></div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>@@DC:gAltName@@</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>@@DC:gAltCode@@</span></div>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>@@DC:gAltPrice@@</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", borderRadius: "20px", padding: "11px 13px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
        <span style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#2E2E2E" }}>Разница между сатином и матом вживую сильнее, чем на экране. Сверим с рулоном при вас.</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ cursor: "pointer", flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Заменить Б</span></div>
        <div style={{ cursor: "pointer", flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Беру @@DC:gSkuShort@@</span></div>
      </div>
    </div>
    

    &#123;/* sc-if: gLimit */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "190px", position: "relative" }}>
        <img src="@@DC:gHero@@" alt="последняя примерка" />
        <div style={{ position: "absolute", inset: "0", background: "rgba(17,17,17,.12)" }}></div>
      </div>
      <div style={{ display: "flex", gap: "7px" }}>
        <div style={{ flex: "1", height: "58px", borderRadius: "14px", overflow: "hidden" }}><img src="@@DC:scDay@@" alt="" /></div>
        <div style={{ flex: "1", height: "58px", borderRadius: "14px", overflow: "hidden" }}><img src="@@DC:mgDay@@" alt="" /></div>
        <div style={{ flex: "1", height: "58px", borderRadius: "14px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "9.5px", color: "#6E6E6E", textAlign: "center", lineHeight: "1.3" }}>готовое<br />превью</span></div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em", lineHeight: "1.15" }}>Крутить дальше можно</span>
        <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>Новые кадры на вашей машине закончились на сегодня. Оставьте номер — откроем ещё десять и сохраним всё, что вы собрали.</span>
        <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "14px 18px", fontSize: "14px", color: "#9A9A9A" }}>+7 ···  ··· ·· ··</div>
        <div style={{ cursor: "pointer", background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Продолжить</span></div>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>Собранное не пропадёт, даже если закроете страницу</span>
      </div>
    </div>
    

    &#123;/* sc-if: gSent */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "200px" }}><img src="@@DC:gHero@@" alt="выбранная конфигурация" /></div>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ушло в Пост на Кутузовском</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>@@DC:gSummary@@ · @@DC:gTotal@@ ₽</span>
          </div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#2E2E2E" }}>Менеджер увидит вашу сборку целиком — с артикулами и ценой, ничего не надо пересказывать. Обычно отвечают в течение десяти минут.</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ cursor: "pointer", flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Собрать ещё</span></div>
          <div style={{ cursor: "pointer", flex: "1", background: "#111111", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Открыть у точки</span></div>
        </div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Ссылка на конфигурацию</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}>
          <span style={{ flex: "1", fontSize: "12px", color: "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>carswap.ai/g/x5-satin-a432or</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M15 5H6a2 2 0 00-2 2v9" /></svg>
        </div>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.4" }}>Открывается без регистрации и не протухает. Логотип точки внутри самого изображения.</span>
      </div>
    </div>
    
  </div>

  <div style={{ width: "330px", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "6px" }}>
    <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "17px 19px", display: "flex", flexDirection: "column", gap: "7px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Что проверить в этом потоке</span>
      <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Результат показан до любого действия — на первом экране чужая машина уже перекрашена. Регистрации нет до самого конца. Переключайте свет и категории: конфигурация не теряется.</p>
    </div>
    <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "17px 19px", display: "flex", flexDirection: "column", gap: "7px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Экономика</span>
      <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Счётчик остатка виден сверху. Смените плёнку или свет @@DC:gLeft@@ раз — гараж перейдёт в кэшированные превью и попросит контакт вместо отказа.</p>
    </div>
    <div style={{ cursor: "pointer", background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "15px 19px", display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M14 6l6 6-6 6" /><path d="M4 12h15" /></svg>
      <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Показать экран исчерпанного лимита</span>
    </div>
    <div style={{ cursor: "pointer", background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "15px 19px", display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M14 6l6 6-6 6" /><path d="M4 12h15" /></svg>
      <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Отправить конфигурацию в точку</span>
    </div>
  </div>
</div>
</>
  );
}

export function PrototypeClickableBlock4(): ReactElement {
  return (
    <>&#123;/* sc-if: isMaster */&#125;
<div style={{ display: "flex", gap: "26px", alignItems: "flex-start" }}>
  <div style={{ width: "390px", height: "844px", background: "#EFEFEF", borderRadius: "44px", overflow: "hidden", display: "flex", flexDirection: "column", flex: "none" }}>

    &#123;/* sc-if: mRecord */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "12px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Наряд 4182</span>
          <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Артём Гусев · BMW X5 · пост №2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#DEF23B", borderRadius: "999px", padding: "8px 12px", flex: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.6" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
          <span style={{ fontSize: "11.5px", fontWeight: "600" }}>Полная</span>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Артикул</span>
        <span style={{ fontSize: "27px", fontWeight: "500", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>KPMF K75491</span>
        <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Матовый хром тёмный · 18,2 м</span>
      </div>

      <div style={{ borderRadius: "26px", overflow: "hidden", height: "172px", position: "relative", flex: "none" }}>
        <img src="@@DC:mgDay@@" alt="картинка, которую видел клиент" />
        <div style={{ position: "absolute", left: "12px", top: "12px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "6px 12px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Это видел клиент</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "7px" }}>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ height: "56px", borderRadius: "14px", overflow: "hidden" }}><img src="@@DC:mgDay@@" alt="день" /></div>
          <span style={{ fontSize: "10px", textAlign: "center", color: "#6E6E6E" }}>День</span>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ height: "56px", borderRadius: "14px", overflow: "hidden" }}><img src="@@DC:mgCloud@@" alt="пасмурно" /></div>
          <span style={{ fontSize: "10px", textAlign: "center", color: "#6E6E6E" }}>Пасмурно</span>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ height: "56px", borderRadius: "14px", overflow: "hidden" }}><img src="@@DC:mgPark@@" alt="паркинг" /></div>
          <span style={{ fontSize: "10px", textAlign: "center", color: "#6E6E6E" }}>Паркинг</span>
        </div>
      </div>

      <div style={{ background: "#111111", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", gap: "12px" }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>28 августа, 14:11 · оговорка про свет показана до подтверждения</span>
        </div>
      </div>

      <div style={{ cursor: "pointer", marginTop: "auto", background: "#DEF23B", borderRadius: "999px", padding: "21px 0", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M7 12h10" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500" }}>Сверить рулон</span>
      </div>
    </div>
    

    &#123;/* sc-if: mScan */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", background: "#1A1A1A", padding: "26px 14px 16px", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <div style={{ cursor: "pointer", width: "38px", height: "38px", borderRadius: "999px", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        </div>
        <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Штрихкод на рулоне</span>
      </div>
      <div style={{ flex: "1", borderRadius: "26px", background: "#2A2A2A", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "230px", height: "150px", borderRadius: "18px", boxShadow: "0 0 0 3px #DEF23B", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", padding: "20px" }}>
          <span style={{ width: "3px", height: "70px", background: "#DEF23B" }}></span><span style={{ width: "6px", height: "70px", background: "#DEF23B" }}></span>
          <span style={{ width: "2px", height: "70px", background: "#DEF23B" }}></span><span style={{ width: "8px", height: "70px", background: "#DEF23B" }}></span>
          <span style={{ width: "3px", height: "70px", background: "#DEF23B" }}></span><span style={{ width: "2px", height: "70px", background: "#DEF23B" }}></span>
          <span style={{ width: "7px", height: "70px", background: "#DEF23B" }}></span><span style={{ width: "3px", height: "70px", background: "#DEF23B" }}></span>
          <span style={{ width: "5px", height: "70px", background: "#DEF23B" }}></span><span style={{ width: "2px", height: "70px", background: "#DEF23B" }}></span>
        </div>
        <span style={{ position: "absolute", bottom: "22px", fontSize: "12.5px", color: "#9A9A9A" }}>Наведите на этикетку рулона</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ cursor: "pointer", background: "#DEF23B", borderRadius: "999px", padding: "19px 0", textAlign: "center" }}><span style={{ fontSize: "15px", fontWeight: "500" }}>Демо: артикул совпал</span></div>
        <div style={{ cursor: "pointer", background: "rgba(255,255,255,.12)", borderRadius: "999px", padding: "19px 0", textAlign: "center" }}><span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Демо: рулон другой</span></div>
      </div>
    </div>
    

    &#123;/* sc-if: mMismatch */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
      <div style={{ background: "#FBEEEF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#D93F45", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </div>
          <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em", color: "#8A4448" }}>Рулон не тот</span>
        </div>
        <div style={{ display: "flex", gap: "9px" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>в записи клиента</span><span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>K75491</span></div>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>скан рулона</span><span style={{ fontSize: "15px", fontWeight: "500", color: "#D93F45", fontVariantNumeric: "tabular-nums" }}>K75427</span></div>
        </div>
        <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#8A4448" }}>Закрытие наряда заблокировано до сверки. Номер партии уже записан в карточку клиента — если поедете дальше, спор на выдаче будет вашим.</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Что дальше</span>
        <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#2E2E2E" }}>Диалог с Артёмом уже существует — менеджер объяснит сам, повторно рассказывать не надо.</span>
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ cursor: "pointer", background: "#111111", borderRadius: "999px", padding: "20px 0", textAlign: "center" }}><span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Сообщить менеджеру · 1 действие</span></div>
        <div style={{ cursor: "pointer", background: "#F5F5F5", borderRadius: "999px", padding: "18px 0", textAlign: "center" }}><span style={{ fontSize: "14.5px", fontWeight: "500" }}>Сканировать другой рулон</span></div>
      </div>
    </div>
    

    &#123;/* sc-if: mOk */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "14px" }}>
      <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
          </div>
          <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Артикул сошёлся</span>
        </div>
        <div style={{ display: "flex", gap: "9px" }}>
          <div style={{ flex: "1", background: "rgba(255,255,255,.6)", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10.5px", opacity: ".6" }}>в записи</span><span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>K75491</span></div>
          <div style={{ flex: "1", background: "rgba(255,255,255,.6)", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "10.5px", opacity: ".6" }}>рулон · партия 24-118</span><span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>K75491</span></div>
        </div>
        <span style={{ fontSize: "12px", lineHeight: "1.45", opacity: ".7" }}>Партия 24-118 записана в карточку клиента. На выдаче она будет видна.</span>
      </div>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "190px" }}><img src="@@DC:mgDay@@" alt="цель работы" /></div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ cursor: "pointer", background: "#111111", borderRadius: "999px", padding: "21px 0", textAlign: "center" }}><span style={{ fontSize: "16px", fontWeight: "500", color: "#FFFFFF" }}>Начать оклейку</span></div>
        <div style={{ cursor: "pointer", background: "#F5F5F5", borderRadius: "999px", padding: "18px 0", textAlign: "center" }}><span style={{ fontSize: "14.5px", fontWeight: "500" }}>Перейти к выдаче</span></div>
      </div>
    </div>
    

    &#123;/* sc-if: mHandover */&#125;
    <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <div style={{ cursor: "pointer", width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        </div>
        <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Выдача</span>
        <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "#6E6E6E" }}>разверните телефон клиенту</span>
      </div>
      <div style={{ background: "#111111", borderRadius: "28px", padding: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "2px 4px 0" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Вы подтвердили этот выбор</span>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 августа, 14:11 · KPMF K75491 · партия 24-118</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: "126px", borderRadius: "16px", overflow: "hidden" }}><img src="@@DC:mgDay@@" alt="день" /></div>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ flex: "1", height: "72px", borderRadius: "13px", overflow: "hidden" }}><img src="@@DC:mgCloud@@" alt="пасмурно" /></div>
            <div style={{ flex: "1", height: "72px", borderRadius: "13px", overflow: "hidden" }}><img src="@@DC:mgPark@@" alt="паркинг" /></div>
          </div>
          <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 9px" }}>День</span>
            <span style={{ fontSize: "10px", fontWeight: "500", color: "#9A9A9A", background: "#3E3E3E", borderRadius: "999px", padding: "3px 9px" }}>Пасмурно</span>
            <span style={{ fontSize: "10px", fontWeight: "500", color: "#9A9A9A", background: "#3E3E3E", borderRadius: "999px", padding: "3px 9px" }}>Паркинг</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#3E3E3E", borderRadius: "14px", padding: "11px 13px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#DDDDDD" }}>Мы предупреждали, что оттенок партии сверяется на замере — вы видели все три света до подтверждения.</span>
        </div>
      </div>
      <div style={{ cursor: "pointer", marginTop: "auto", background: "#DEF23B", borderRadius: "999px", padding: "20px 0", textAlign: "center" }}><span style={{ fontSize: "15.5px", fontWeight: "500" }}>Закрыть работу</span></div>
      <span style={{ fontSize: "10.5px", color: "#6E6E6E", textAlign: "center" }}>Одним действием из наряда у поста · без захода в кабинет</span>
    </div>
    
  </div>

  <div style={{ width: "330px", display: "flex", flexDirection: "column", gap: "12px", paddingTop: "6px" }}>
    <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "17px 19px", display: "flex", flexDirection: "column", gap: "7px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Контур 3 · запись у поста</span>
      <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Открывается по ссылке из мессенджера мастера, без пароля. Четыре обязательных поля видны сразу, цели нажатия 64px, крупные цифры артикула читаются на солнце.</p>
    </div>
    <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "20px", padding: "17px 19px", display: "flex", flexDirection: "column", gap: "7px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Ради чего экран</span>
      <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Одна переклейка — 50–150 тыс. ₽ плёнки и неделя занятого поста. Сверка рулона блокирует закрытие наряда, а экран выдачи гасит спор за 15 секунд подтверждением, которое поставил сам клиент.</p>
    </div>
  </div>
</div>
</>
  );
}

export function PrototypeClickableBlock5(): ReactElement {
  return (
    <>&#123;/* sc-if: isOwner */&#125;
<div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "26px 28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>

  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Контур 4 · управление точкой</span>
      <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em" }}>Пост на Кутузовском</span>
    </div>
    <div style={{ display: "flex", gap: "5px", background: "#FFFFFF", borderRadius: "999px", padding: "5px" }}>
      <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", background: "@@DC:oSetupBg@@", color: "@@DC:oSetupFg@@" }}>Запуск</div>
      <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", background: "@@DC:oPriceBg@@", color: "@@DC:oPriceFg@@" }}>Прайс</div>
      <div style={{ cursor: "pointer", fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", background: "@@DC:oSummaryBg@@", color: "@@DC:oSummaryFg@@" }}>Сводка · 7-й день</div>
    </div>
  </div>

  &#123;/* sc-if: oSetup */&#125;
  <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Подключение каналов</span>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>@@DC:chDone@@ из 3 · ни одного звонка в УК</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>WhatsApp Business</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>+7 495 ··· 12 40 · через шлюз, авторизация на нашей стороне</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flex: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Работает</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#3A6B8F", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>TG</span>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", color: "@@DC:tgFg@@" }}>Telegram</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>@@DC:tgNote@@</span>
          </div>
          <div style={{ cursor: "pointer", background: "@@DC:tgBtnBg@@", borderRadius: "999px", padding: "11px 17px", flex: "none" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "@@DC:tgBtnFg@@" }}>@@DC:tgBtn@@</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", color: "@@DC:avFg@@" }}>Avito</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>@@DC:avNote@@</span>
          </div>
          <div style={{ cursor: "pointer", background: "@@DC:avBtnBg@@", borderRadius: "999px", padding: "11px 17px", flex: "none" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "@@DC:avBtnFg@@" }}>@@DC:avBtn@@</span></div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
        <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Точка рабочая уже на одном канале. Остальные — список на потом, а не блокирующая ошибка: это единственный экран, где проваливается критерий «ноль обращений в управляющую компанию».</span>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Три шага до первой отправки</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "@@DC:step1Bg@@", borderRadius: "18px", padding: "14px 16px" }}>
          <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#111111", color: "#DEF23B", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>1</span>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Подключить каналы</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>@@DC:chDone@@/3</span>
        </div>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
          <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>2</span>
          <span style={{ flex: "1", fontSize: "13.5px", color: "#2E2E2E" }}>Подтвердить прайс — хватит пяти бестселлеров</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
          <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>3</span>
          <span style={{ flex: "1", fontSize: "13.5px", color: "#2E2E2E" }}>Добавить менеджеров</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Ни один шаг не требует третьей стороны. Обучения и онбординг-карусели нет — первый сценарий проходится без инструкции.</span>
      </div>

      <div style={{ background: "#111111", borderRadius: "26px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "11px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Отключение</span>
        <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#DDDDDD", textWrap: "pretty" }}>Отключить точку — один клик. Подтверждённые выборы клиентов останутся доступны на чтение навсегда: данные клиента не заложник биллинга.</p>
        <div style={{ background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "12px 18px", alignSelf: "flex-start" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Отключить точку</span></div>
      </div>
    </div>
  </div>
  

  &#123;/* sc-if: oPrice */&#125;
  <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Прайс точки</span>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>пришёл предзаполненным из каталога сети · 214 SKU</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#DEF23B", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:scDay@@" alt="" /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>Сатин-хром тёмный</span><span style={{ fontSize: "11px", opacity: ".6" }}>KPMF K75407 · база сети 188 000</span></div>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>248 400</span>
          <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: "#111111", position: "relative", flex: "none" }}><span style={{ position: "absolute", right: "3px", top: "3px", width: "18px", height: "18px", borderRadius: "999px", background: "#DEF23B" }}></span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:mgDay@@" alt="" /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>Матовый графит</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>Oracal 970-070 · база сети 162 800</span></div>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>214 900</span>
          <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: "#111111", position: "relative", flex: "none" }}><span style={{ position: "absolute", right: "3px", top: "3px", width: "18px", height: "18px", borderRadius: "999px", background: "#DEF23B" }}></span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:ngDay@@" alt="" /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>Глянец «серый нардо»</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>Avery SW900-193 · база сети 175 400</span></div>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>231 500</span>
          <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: "#111111", position: "relative", flex: "none" }}><span style={{ position: "absolute", right: "3px", top: "3px", width: "18px", height: "18px", borderRadius: "999px", background: "#DEF23B" }}></span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#FFFFFF", borderRadius: "18px", padding: "12px 15px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#9A9A9A" }}>Зелёный британский</span><span style={{ fontSize: "11px", color: "#C4C4C4" }}>погашен одним касанием · не существует ни в панели, ни в гараже</span></div>
          <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: "#E2E2E2", position: "relative", flex: "none" }}><span style={{ position: "absolute", left: "3px", top: "3px", width: "18px", height: "18px", borderRadius: "999px", background: "#FFFFFF" }}></span></div>
        </div>
      </div>
      <div style={{ cursor: "pointer", background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Подтвердить прайс и начать</span></div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Наценка — одним коэффициентом</span>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
        <span style={{ fontSize: "52px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>+32</span>
        <span style={{ fontSize: "22px", fontWeight: "500", color: "#9A9A9A", paddingBottom: "6px" }}>%</span>
      </div>
      <div style={{ height: "8px", borderRadius: "999px", background: "#F0F0F0", position: "relative" }}>
        <div style={{ width: "64%", height: "8px", borderRadius: "999px", background: "#DEF23B" }}></div>
        <span style={{ position: "absolute", left: "calc(64% - 11px)", top: "-7px", width: "22px", height: "22px", borderRadius: "999px", background: "#111111", boxShadow: "0 2px 6px rgba(17,17,17,.2)" }}></span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11px", color: "#9A9A9A" }}>граница сети +18%</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>+60%</span></div>
      <div style={{ height: "1px", background: "#F0F0F0" }}></div>
      <span style={{ fontSize: "12.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Не двести строк, а один коэффициент поверх каталога сети. Сеть задаёт границы, точка отклоняется внутри них — и ни одно требование сети не превращается в поле, которое менеджер заполняет при живом клиенте.</span>
      <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Работать можно с первого дня</span>
        <span style={{ fontSize: "14px", fontWeight: "500" }}>на пяти бестселлерах из 214</span>
      </div>
    </div>
  </div>
  

  &#123;/* sc-if: oSummary */&#125;
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Входящих за неделю</span>
        <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>34</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>С примеркой</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>23</span><span style={{ fontSize: "14px", color: "#9A9A9A" }}>68%</span></div>
      </div>
      <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", opacity: ".65" }}>Сделок, где цвет выбран по картинке</span>
        <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>3</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Генерации за месяц</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>7 440</span><span style={{ fontSize: "14px", color: "#9A9A9A" }}>₽</span></div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Сделки, где выбрали цвет по картинке</span>
          <span style={{ fontSize: "12px", color: "#9A9A9A" }}>это список, а не дашборд</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px" }}>
            <div style={{ width: "52px", height: "40px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:mgDay@@" alt="" /></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Артём Гусев · BMW X5 2021</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Матовый хром тёмный · подтвердил 28 авг, 14:11 · замер 29 авг</span>
            </div>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", flex: "none", fontVariantNumeric: "tabular-nums" }}>253 900</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px" }}>
            <div style={{ width: "52px", height: "40px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:scDay@@" alt="" /></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Сергей Пахомов · Toyota Camry 2020</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Сатин-хром тёмный · сдан 26 авг · без переклейки</span>
            </div>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", flex: "none", fontVariantNumeric: "tabular-nums" }}>198 200</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px" }}>
            <div style={{ width: "52px", height: "40px", borderRadius: "12px", overflow: "hidden", flex: "none" }}><img src="@@DC:demoImg@@" alt="" /></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "14.5px", fontWeight: "500" }}>Егор Лапин · Kia K5 2022</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Сатин хаки + диски · пришёл из гаража по ссылке · замер 30 авг</span>
            </div>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", flex: "none", fontVariantNumeric: "tabular-nums" }}>184 600</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Ни одного напоминания менеджерам не потребовалось. Заполненность возникла сама — инструмент выгоден Ирине в её собственную смену.</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Покрытие входящих</span>
          <div style={{ height: "40px", borderRadius: "999px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#D6D6D6 0 1px,transparent 1px 5px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ width: "68%", height: "40px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "15px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>68%</span></div>
          </div>
          <span style={{ fontSize: "12px", color: "#9A9A9A", lineHeight: "1.45" }}>Одиннадцать входящих ушли без примерки — девять из них Avito, где канал подключён только вчера.</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Расход генераций</span>
            <span style={{ fontSize: "12px", color: "#9A9A9A" }}>поимённо</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ flex: "1", fontSize: "13px" }}>Гараж по ссылке из TG-канала</span><div style={{ width: "70px", height: "4px", backgroundImage: "repeating-linear-gradient(90deg,#D6D6D6 0 2px,transparent 2px 4px)" }}><div style={{ width: "82%", height: "4px", background: "#EAF77E" }}></div></div><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>310</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ flex: "1", fontSize: "13px" }}>Ирина Ковалёва</span><div style={{ width: "70px", height: "4px", backgroundImage: "repeating-linear-gradient(90deg,#D6D6D6 0 2px,transparent 2px 4px)" }}><div style={{ width: "44%", height: "4px", background: "#DEF23B" }}></div></div><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>168</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ flex: "1", fontSize: "13px" }}>Пётр Салимов</span><div style={{ width: "70px", height: "4px", backgroundImage: "repeating-linear-gradient(90deg,#D6D6D6 0 2px,transparent 2px 4px)" }}><div style={{ width: "21%", height: "4px", background: "#DEF23B" }}></div></div><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>81</span></div>
          </div>
          <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}><span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Аномалия подсвечена до конца месяца: 310 примерок за сутки — это трафик из канала, а не работа менеджеров.</span></div>
        </div>
      </div>
    </div>
  </div>
  
</div>
</>
  );
}

export function PrototypeClickableBlock6(): ReactElement {
  return (
    <>&#123;/* sc-if: isNetwork */&#125;
<div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "26px 28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Контур 5 · панель сети</span>
      <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em" }}>Пилот · 8 точек · 4-я неделя</span>
    </div>
    <span style={{ fontSize: "12.5px", color: "#6E6E6E", maxWidth: "380px", textAlign: "right", lineHeight: "1.45" }}>Три цифры, которыми директор франчайзинга защищает решение внутри сети. Показан разброс по точкам, а не среднее.</span>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Обращений точек в управляющую компанию</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}><span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>2</span><span style={{ fontSize: "13px", color: "#9A9A9A" }}>за первый месяц, на 8 точек</span></div>
      <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "44px" }}>
        <span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "26px", background: "#EAF77E", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "44px", background: "#F0C9CB", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Оба обращения — с одной точки, оба про повторную привязку WhatsApp после смены номера.</span>
    </div>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Доля входящих с примеркой к 4-й неделе</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}><span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>61</span><span style={{ fontSize: "20px", color: "#9A9A9A" }}>%</span><span style={{ fontSize: "13px", color: "#9A9A9A" }}>разброс 18–84%</span></div>
      <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "44px" }}>
        <span style={{ flex: "1", height: "37px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "31px", background: "#DEF23B", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "41px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "26px", background: "#DEF23B", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "34px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "9px", background: "#F0C9CB", borderRadius: "2px" }}></span>
        <span style={{ flex: "1", height: "44px", background: "#DEF23B", borderRadius: "2px" }}></span><span style={{ flex: "1", height: "14px", background: "#EAF77E", borderRadius: "2px" }}></span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Среднее скрыло бы главное: две точки почти не пользуются, и решать надо именно их, а не сеть целиком.</span>
    </div>
    <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <span style={{ fontSize: "13px", opacity: ".7" }}>Точек с хотя бы одной сделкой через примерку за квартал</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}><span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1" }}>6</span><span style={{ fontSize: "20px", opacity: ".6" }}>из 8</span></div>
      <div style={{ height: "34px", borderRadius: "999px", background: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", overflow: "hidden" }}><div style={{ width: "75%", height: "34px", borderRadius: "999px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "14px" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#DEF23B" }}>75%</span></div></div>
      <span style={{ fontSize: "11.5px", lineHeight: "1.45", opacity: ".7" }}>Порог сети — 60%. Критерий выполнен на 4-й неделе, не по итогам квартала.</span>
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em" }}>Точки в одном срезе</span>
        <span style={{ fontSize: "12px", color: "#9A9A9A" }}>сортировка по покрытию входящих</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Кутузовский</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "84%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>84%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>3 сделки</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Ленинградское шоссе</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "79%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>79%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>4 сделки</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Казань, Вахитова</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "71%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>71%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>2 сделки</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Екатеринбург, Щорса</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "64%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>64%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>1 сделка</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Новосибирск, Гоголя</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "58%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>58%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>2 сделки</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none" }}>Сочи, Донская</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "44%", height: "26px", borderRadius: "999px", background: "#DEF23B" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>44%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#6E6E6E", flex: "none" }}>1 сделка</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none", color: "#8A4448" }}>Краснодар, Северная</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", overflow: "hidden" }}><div style={{ width: "22%", height: "26px", borderRadius: "999px", background: "#EAF77E" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>22%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#8A4448", flex: "none" }}>0 сделок</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "190px", fontSize: "13.5px", fontWeight: "500", flex: "none", color: "#8A4448" }}>Самара, Мичурина</span><div style={{ flex: "1", height: "26px", borderRadius: "999px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", overflow: "hidden" }}><div style={{ width: "18%", height: "26px", borderRadius: "999px", background: "#F0C9CB" }}></div></div><span style={{ width: "48px", textAlign: "right", fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>18%</span><span style={{ width: "78px", textAlign: "right", fontSize: "12px", color: "#8A4448", flex: "none" }}>0 сделок</span></div>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "11px", background: "#FBEEEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="1.9" strokeLinecap="round"><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
          </div>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Мертвы тихо</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FBEEEF", borderRadius: "16px", padding: "12px 14px" }}><span style={{ flex: "1", fontSize: "13px", fontWeight: "500", color: "#8A4448" }}>Самара, Мичурина</span><span style={{ fontSize: "12px", color: "#8A4448" }}>96 ч без отправки</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}><span style={{ flex: "1", fontSize: "13px", fontWeight: "500" }}>Краснодар, Северная</span><span style={{ fontSize: "12px", color: "#6E6E6E" }}>52 ч без отправки</span></div>
        </div>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Точка, не сделавшая первую отправку за 72 часа, не пишет и не жалуется — она просто не пользуется. Поэтому у неё отдельная пометка, а не общий алерт.</span>
      </div>
      <div style={{ background: "#111111", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Контроль сети</span>
        <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.55", color: "#DDDDDD", textWrap: "pretty" }}>Сеть задаёт каталог и границы наценки. Над рабочим потоком менеджера контроля нет — ни одно требование сети не превращается в поле, которое он заполняет при живом клиенте.</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
          <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Каталог 214 SKU</span>
          <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Наценка 18–60%</span>
          <span style={{ fontSize: "11.5px", color: "#DDDDDD", background: "rgba(255,255,255,.1)", borderRadius: "999px", padding: "7px 13px" }}>Стоп по генерациям снят у 2 точек</span>
        </div>
      </div>
    </div>
  </div>
</div>
</>
  );
}

export const PrototypeClickableBlocks = [PrototypeClickableBlock0, PrototypeClickableBlock1, PrototypeClickableBlock2, PrototypeClickableBlock3, PrototypeClickableBlock4, PrototypeClickableBlock5, PrototypeClickableBlock6];
export const PrototypeClickableCanvas = { minHeight: "100vh", background: "#2A2A2A", fontFamily: "Onest,system-ui,sans-serif", color: "#111111", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "22px", padding: "22px 22px 60px", width: "max-content", minWidth: "100%" } as React.CSSProperties;
