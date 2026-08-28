/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/05-phase5-crm-workorder.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function S05Phase5CrmWorkorderBlock0(): ReactElement {
  return (
    <><div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "13px", color: "#FFFFFF" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "5px", padding: "4px 9px", letterSpacing: "0.04em" }}>Фаза 5 · экраны 47–53</span>
    <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>Учётный слой · после подтверждённого выбора</span>
  </div>
  <h1 style={{ margin: "0", fontSize: "44px", fontWeight: "500", letterSpacing: "-0.035em", lineHeight: "1.04" }}>CRM, карточка клиента и заказ-наряд в PDF</h1>
  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#BFBFBF", maxWidth: "780px", textWrap: "pretty" }}>Учётный слой обслуживает примерку, а не наоборот: клиент, авто и документы собираются из объекта, который уже прошёл диалог, гараж и пост. Ноль перенабора полей — заказ-наряд и счёт формируются из подтверждённой конфигурации одним действием.</p>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock1(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>47</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>CRM · клиенты точки</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>один клиент — один диалог, примерки привязаны к автомобилю</span>
  </div>

  <div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
        </div>
        <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>CarSwap</span>
      </div>
      <div style={{ display: "flex", gap: "5px", background: "#FFFFFF", borderRadius: "999px", padding: "5px" }}>
        <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 17px", color: "#6E6E6E" }}>Обращения</span>
        <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 17px", background: "#111111", color: "#FFFFFF" }}>Клиенты</span>
        <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 17px", color: "#6E6E6E" }}>Наряды</span>
        <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 17px", color: "#6E6E6E" }}>Прайс</span>
        <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 17px", color: "#6E6E6E" }}>Сводка</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 13px 6px 6px" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "#6E6E6E" }}>ИК</div>
        <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ирина Ковалёва</span>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em" }}>Клиенты</span>
          <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>148 всего · 23 в работе</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "11px 16px", width: "300px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Имя, номер авто или артикул</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF", background: "#111111", borderRadius: "999px", padding: "9px 15px" }}>Все · 148</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "9px 15px" }}>Подтвердили цвет · 4</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 15px" }}>Записаны на замер · 6</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 15px" }}>В работе · 3</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 15px" }}>Сдано · 41</span>
        <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "9px 15px" }}>Остыли · 94</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 16px 10px" }}>
          <span style={{ width: "230px", flex: "none", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Клиент</span>
          <span style={{ width: "190px", flex: "none", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Автомобиль</span>
          <span style={{ flex: "1", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Выбранный артикул</span>
          <span style={{ width: "150px", flex: "none", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Статус</span>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Сумма</span>
          <span style={{ width: "74px", flex: "none", textAlign: "right", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Наряд</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#DEF23B", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#111111", color: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>АГ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Артём Гусев</span>
              <span style={{ fontSize: "10.5px", opacity: ".6" }}>+7 916 ··· 41 08 · WhatsApp</span>
            </div>
          </div>
          <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>BMW X5 2021</span>
            <span style={{ fontSize: "10.5px", opacity: ".6" }}>А 432 ОР 77 · 2-е обращение</span>
          </div>
          <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "28px", borderRadius: "8px", overflow: "hidden", flex: "none" }}><img src="/renders/render-02.png" alt="" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Матовый хром тёмный</span>
              <span style={{ fontSize: "10.5px", opacity: ".6" }}>KPMF K75491 · партия 24-118</span>
            </div>
          </div>
          <div style={{ width: "150px", flex: "none" }}><span style={{ fontSize: "11.5px", fontWeight: "500", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "6px 12px" }}>Подтвердил цвет</span></div>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>253 900</span>
          <div style={{ width: "74px", flex: "none", display: "flex", justifyContent: "flex-end" }}><span style={{ fontSize: "11.5px", fontWeight: "500", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "6px 11px" }}>4182</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FFFFFF", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#F5F5F5", color: "#6E6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>ЕЛ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Егор Лапин</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>пришёл из гаража по ссылке</span>
            </div>
          </div>
          <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Kia K5 2022</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Т 118 КВ 77</span>
          </div>
          <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "28px", borderRadius: "8px", overflow: "hidden", flex: "none" }}><img src="/renders/render-04.png" alt="" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Сатин хаки + диски</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>SW900-618 · конфигурация из гаража</span>
            </div>
          </div>
          <div style={{ width: "150px", flex: "none" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E", background: "#F5F5F5", borderRadius: "999px", padding: "6px 12px" }}>Замер 30 авг</span></div>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>184 600</span>
          <div style={{ width: "74px", flex: "none", display: "flex", justifyContent: "flex-end" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FFFFFF", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#F5F5F5", color: "#6E6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>СП</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Сергей Пахомов</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>+7 903 ··· 77 21 · MAX</span>
            </div>
          </div>
          <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Toyota Camry 2020</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Е 904 МН 50</span>
          </div>
          <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "28px", borderRadius: "8px", overflow: "hidden", flex: "none" }}><img src="/renders/render-01.png" alt="" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Сатин-хром тёмный</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>KPMF K75407 · партия 24-092</span>
            </div>
          </div>
          <div style={{ width: "150px", flex: "none" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#2E2E2E", background: "#F5F5F5", borderRadius: "999px", padding: "6px 12px" }}>Сдано 26 авг</span></div>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>198 200</span>
          <div style={{ width: "74px", flex: "none", display: "flex", justifyContent: "flex-end" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E", background: "#F5F5F5", borderRadius: "999px", padding: "6px 11px" }}>4176</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FFFFFF", borderRadius: "18px", padding: "13px 16px" }}>
          <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#F5F5F5", color: "#6E6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>МС</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Марина Соловьёва</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Avito · без телефона</span>
            </div>
          </div>
          <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", color: "#9A9A9A" }}>не распознан</span>
          </div>
          <div style={{ flex: "1" }}><span style={{ fontSize: "12.5px", color: "#C4C4C4" }}>примерки не было</span></div>
          <div style={{ width: "150px", flex: "none" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A", background: "#F5F5F5", borderRadius: "999px", padding: "6px 12px" }}>Новое обращение</span></div>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#C4C4C4" }}>—</span>
          <div style={{ width: "74px", flex: "none", display: "flex", justifyContent: "flex-end" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#FFFFFF", borderRadius: "18px", padding: "13px 16px", opacity: ".65" }}>
          <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#F5F5F5", color: "#9A9A9A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>РЕ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#6E6E6E" }}>Роман Ефимов</span>
              <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>последний контакт 26 авг</span>
            </div>
          </div>
          <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#6E6E6E" }}>Mazda CX-5 2019</span>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Х 771 СТ 77</span>
          </div>
          <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "28px", borderRadius: "8px", overflow: "hidden", flex: "none" }}><img src="/renders/render-03.png" alt="" /></div>
            <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Смотрел нардо, не выбрал</span>
          </div>
          <div style={{ width: "150px", flex: "none" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#9A9A9A", background: "#F5F5F5", borderRadius: "999px", padding: "6px 12px" }}>Остыл</span></div>
          <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", color: "#C4C4C4" }}>—</span>
          <div style={{ width: "74px", flex: "none", display: "flex", justifyContent: "flex-end" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
        </div>
      </div>
    </div>
  </div>
  <div style={{ width: "1440px", background: "rgba(255,255,255,.07)", borderRadius: "18px", padding: "16px 19px" }}>
    <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9", textWrap: "pretty" }}><span style={{ color: "#DEF23B", fontWeight: "500" }}>Почему CRM не витрина. </span>Как только продукт предъявляется как CRM, он попадает в сравнение с отраслевыми системами за 1 495 ₽/мес и проигрывает по полноте. Код остаётся, точка входа — примерка: в таблице ведущая колонка — выбранный артикул, а не стадия сделки.</span>
  </div>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock2(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Клик по строке Артёма</span>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock3(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>48</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Карточка клиента · история привязана к автомобилю</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>«в прошлый раз смотрели» для вернувшихся</span>
  </div>

  <div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "22px", display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "14px", alignItems: "start" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", flex: "none" }}>АГ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1" }}>Артём Гусев</span>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "4px 10px 4px 4px" }}>
                  <span style={{ width: "16px", height: "16px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>WA</span>
                  <span style={{ fontSize: "11px", color: "#6E6E6E" }}>+7 916 ··· 41 08</span>
                </span>
                <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>клиент с марта 2026 · 2 обращения</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "7px", flex: "none" }}>
            <div style={{ background: "#111111", borderRadius: "999px", padding: "12px 18px" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Открыть диалог</span></div>
            <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "12px 18px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Наряд 4182</span></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Автомобиль</span>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>BMW X5 2021 · G05</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>А 432 ОР 77 · чёрный сапфир</span>
          </div>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Работы</span>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Оклейка целиком</span>
            <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>18,2 м · 3 дня · пост №2</span>
          </div>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "11px", opacity: ".6" }}>Сумма сделки</span>
            <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>253 900 ₽</span>
            <span style={{ fontSize: "11.5px", opacity: ".65" }}>предоплата 30% получена</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>История примерок этого автомобиля</span>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ width: "200px", flex: "none", background: "#F7F7F7", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 0 0 2.5px #DEF23B" }}>
              <div style={{ height: "112px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px 3px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Матовый хром тёмный</span>
                <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>28 авг · выбран и подтверждён</span>
              </div>
            </div>
            <div style={{ width: "200px", flex: "none", background: "#F7F7F7", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ height: "112px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-01.png" alt="" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px 3px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Сатин-хром тёмный</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>28 авг · смотрел</span>
              </div>
            </div>
            <div style={{ width: "200px", flex: "none", background: "#F7F7F7", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ height: "112px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-03.png" alt="" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px 3px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Глянец «нардо»</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>28 авг · смотрел</span>
              </div>
            </div>
            <div style={{ width: "200px", flex: "none", background: "#F7F7F7", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", opacity: ".7" }}>
              <div style={{ height: "112px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-11.png" alt="" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px 3px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Матовый чёрный</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>14 марта · в прошлый раз</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Хронология</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#DEF23B" }}></span>
              <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Обращение из WhatsApp</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 авг, 13:58 · «сколько будет сатин-хром»</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#DEF23B" }}></span>
              <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Примерка отправлена</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 авг, 14:03 · 3 артикула × 3 света</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#DEF23B" }}></span>
              <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Попросил ещё вариант</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 авг, 14:06 · «но матовый» · домер 14:08</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#111111" }}></span>
              <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Подтвердил выбор сам</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 авг, 14:11 · оговорка про свет показана</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#111111" }}></span>
              <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Замер и наряд 4182</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>29 авг, 11:00 · пост №2, Пётр Салимов</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: "#111111" }}></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Сверка рулона · партия 24-118</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>29 авг, 11:24 · артикул сошёлся</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "13px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Документы</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "16px", padding: "13px 15px" }}>
          <div style={{ width: "32px", height: "38px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ fontSize: "8px", fontWeight: "600", color: "#DEF23B" }}>PDF</span></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Заказ-наряд 4182</span><span style={{ fontSize: "10.5px", opacity: ".65" }}>сформирован 28 авг, 14:13</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 4v12M7 12l5 5 5-5M5 20h14" /></svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
          <div style={{ width: "32px", height: "38px", borderRadius: "6px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ fontSize: "8px", fontWeight: "600", color: "#9A9A9A" }}>PDF</span></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Счёт 4182-1 · предоплата 30%</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>оплачен 28 авг, 18:41</span></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 4v12M7 12l5 5 5-5M5 20h14" /></svg>
        </div>
        <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>Оба документа собраны из подтверждённой конфигурации. Незаполненные реквизиты клиента не блокируют движение.</span>
      </div>
    </div>
  </div>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock4(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Владелец смотрит, где стоят все сделки сразу</span>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock5(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>49</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Воронка · стадии от обращения до сдачи</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>стадия меняется событием, а не рукой менеджера</span>
  </div>

  <div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
      <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em" }}>Сделки недели</span>
      <span style={{ fontSize: "12.5px", color: "#6E6E6E", maxWidth: "520px", textAlign: "right", lineHeight: "1.45" }}>Карточка переезжает сама: отправили примерку — «ждём реакции», клиент нажал «беру» — «выбор подтверждён», мастер сдал — «сдано».</span>
    </div>

    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Обращение</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>11</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Марина Соловьёва</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Avito · авто не распознано</span>
          <span style={{ fontSize: "11px", color: "#C4C4C4" }}>27 минут без ответа</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Игорь Мельник</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Telegram · Audi Q7 2019</span>
        </div>
        <div style={{ borderRadius: "20px", padding: "12px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>+ 9 обращений</span></div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Примерка отправлена</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>6</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ height: "64px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-03.png" alt="" /></div>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Кирилл Дёмин</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Kia K5 · 3 артикула ушли 14 мин назад</span>
        </div>
        <div style={{ borderRadius: "20px", padding: "12px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>+ 5 сделок</span></div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#111111" }}>Просит ещё вариант</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "2px 8px" }}>2</span>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ height: "64px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Артём Гусев</span>
          <span style={{ fontSize: "11px", opacity: ".65" }}>BMW X5 · «но матовый» · 2 минуты назад</span>
          <span style={{ fontSize: "11px", fontWeight: "500" }}>Домер уже отправлен</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Анна Величко</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Mini Countryman · просит «поярче»</span>
        </div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Выбор подтверждён</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>4</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ height: "64px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-04.png" alt="" /></div>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Егор Лапин</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Kia K5 · замер 30 авг, наряда ещё нет</span>
          <div style={{ background: "#111111", borderRadius: "999px", padding: "9px 0", textAlign: "center" }}><span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Сформировать наряд</span></div>
        </div>
        <div style={{ borderRadius: "20px", padding: "12px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>+ 3 сделки</span></div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>В работе</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>3</span>
        </div>
        <div style={{ background: "#111111", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <div style={{ height: "64px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="" /></div>
          <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Артём Гусев · наряд 4182</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>пост №2 · рулон сверен, партия 24-118</span>
          <span style={{ fontSize: "11px", color: "#DEF23B" }}>сдача 1 сентября</span>
        </div>
        <div style={{ borderRadius: "20px", padding: "12px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>+ 2 наряда</span></div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Сдано</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>41</span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Сергей Пахомов</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>26 авг · 198 200 ₽ · без переклейки</span>
        </div>
        <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>За месяц</span>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.028em", fontVariantNumeric: "tabular-nums" }}>7 812 400 ₽</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E" }}>из них 3 сделки через примерку</span>
        </div>
      </div>
    </div>
  </div>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock6(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>Нажали «Сформировать наряд» на подтверждённой сделке</span>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock7(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#111111", color: "#DEF23B", borderRadius: "7px", padding: "6px 11px" }}>50</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Формирование заказ-наряда</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>всё уже заполнено — остаётся проверить и подписать</span>
  </div>

  <div style={{ width: "1440px", background: "#EFEFEF", borderRadius: "30px", padding: "22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignItems: "start" }}>
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em" }}>Наряд 4182</span>
        <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "6px 12px" }}>заполнено автоматически</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", color: "#9A9A9A" }}>Клиент</span>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Артём Гусев · +7 916 ··· 41 08</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M4 20l7.5-7.5M14 4l6 6-8.5 8.5H8v-3.5z" /></svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", color: "#9A9A9A" }}>Автомобиль</span>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>BMW X5 2021 · А 432 ОР 77</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "16px", padding: "13px 15px" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", opacity: ".6" }}>Артикул</span>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500" }}>KPMF K75491 · матовый хром тёмный</span>
            <span style={{ fontSize: "10.5px", opacity: ".6" }}>партия 24-118 · сверена мастером 29 авг, 11:24</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", color: "#9A9A9A" }}>Работы</span>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Оклейка целиком · 18,2 м · 3 дня</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", color: "#9A9A9A" }}>Пост и мастер</span>
          <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Пост №2 · Пётр Салимов</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
          <span style={{ width: "126px", flex: "none", fontSize: "11.5px", color: "#9A9A9A" }}>Реквизиты клиента</span>
          <span style={{ flex: "1", fontSize: "13px", color: "#9A9A9A" }}>не заполнены — движение не блокируют</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", flex: "none" }}>Добавить</span>
        </div>
      </div>

      <div style={{ height: "1px", background: "#F0F0F0" }}></div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Плёнка · 18,2 м × 9 500 ₽</span><span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>172 900</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Работа по оклейке</span><span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>68 000</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Разбор и сборка элементов</span><span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>13 000</span></div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Итого</span>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "28px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>253 900<span style={{ fontSize: "16px", color: "#9A9A9A", marginLeft: "4px" }}>₽</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "9px" }}>
        <div style={{ flex: "1", background: "#111111", borderRadius: "999px", padding: "16px 0", textAlign: "center" }}><span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Сформировать PDF</span></div>
        <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "16px 22px" }}><span style={{ fontSize: "14px", fontWeight: "500" }}>Счёт</span></div>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Что попадёт в документ из примерки</span>
        <div style={{ display: "flex", gap: "9px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "92px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="день" /></div>
            <span style={{ fontSize: "10.5px", textAlign: "center", color: "#6E6E6E" }}>День</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "92px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-11.png" alt="пасмурно" /></div>
            <span style={{ fontSize: "10.5px", textAlign: "center", color: "#6E6E6E" }}>Пасмурно</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: "92px", borderRadius: "14px", overflow: "hidden" }}><img src="/renders/render-12.png" alt="паркинг" /></div>
            <span style={{ fontSize: "10.5px", textAlign: "center", color: "#6E6E6E" }}>Паркинг</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#111111", borderRadius: "18px", padding: "14px 16px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>28 августа, 14:11 · оговорка про свет показана до подтверждения</span>
          </div>
        </div>
        <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Три света и отметка подтверждения печатаются в наряде не для красоты: это документ, который гасит спор на выдаче. Собственная запись мастера в споре не работает.</span>
      </div>

      <div style={{ background: "#F5FBCB", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Ноль перенабора</span>
        <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.015em", lineHeight: "1.35" }}>Ни одно поле наряда не вводится руками: всё пришло из диалога, прайса и сверки рулона.</span>
        <span style={{ fontSize: "12px", color: "#2E2E2E", lineHeight: "1.5" }}>Владелец трижды платил за софт, который никто не заполнял. Здесь заполненность возникает сама, потому что менеджеру инструмент выгоден в его собственную смену.</span>
      </div>
    </div>
  </div>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock8(): ReactElement {
  return (
    <><div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "14px" }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
  <span style={{ fontSize: "13px", color: "#8A8A8A" }}>«Сформировать PDF» · документ готов за секунду</span>
</div></>
  );
}

export function S05Phase5CrmWorkorderBlock9(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "12px", fontWeight: "600", background: "#DEF23B", color: "#111111", borderRadius: "7px", padding: "6px 11px" }}>51</span>
    <span style={{ fontSize: "19px", fontWeight: "500", color: "#FFFFFF", letterSpacing: "-0.02em" }}>Заказ-наряд и счёт в PDF · A4</span>
    <span style={{ fontSize: "12.5px", color: "#8A8A8A" }}>так документ выглядит на печати и в мессенджере клиента</span>
  </div>

  <div style={{ display: "flex", gap: "22px", alignItems: "flex-start" }}>

    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      <span style={{ fontSize: "13px", color: "#8A8A8A" }}>51 · Заказ-наряд 4182 · A4, 794 × 1123</span>
      <div style={{ width: "794px", background: "#FFFFFF", padding: "40px 56px", display: "flex", flexDirection: "column", gap: "17px", boxShadow: "0 26px 60px -26px rgba(0,0,0,.55)" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.4" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em" }}>Пост на Кутузовском</span>
            </div>
            <span style={{ fontSize: "10.5px", lineHeight: "1.5", color: "#6E6E6E" }}>ИП Кораблёв Д. А. · ИНН 771845920133<br />Москва, Кутузовский пр-т, 36, стр. 4 · +7 495 ··· 12 40</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Заказ-наряд</span>
            <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>№ 4182</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>от 28 августа 2026</span>
          </div>
        </div>

        <div style={{ height: "2px", background: "#111111" }}></div>

        <div style={{ display: "flex", gap: "26px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Заказчик</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Гусев Артём Валерьевич</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>+7 916 ··· 41 08 · WhatsApp</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Автомобиль</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>BMW X5 2021, G05</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>Госномер А 432 ОР 77 · заводской цвет: чёрный сапфир</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Исполнение</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Пост № 2 · Салимов П.</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>Приём 29.08 · сдача до 01.09.2026</span>
          </div>
        </div>

        <div style={{ background: "#F5F5F5", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Материал, согласованный заказчиком</span>
              <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.015em", fontVariantNumeric: "tabular-nums" }}>KPMF K75491</span>
              <span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>Матовый хром тёмный · плёнка ПВХ, литая · партия 24-118</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
              <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Расход</span>
              <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.015em", fontVariantNumeric: "tabular-nums" }}>18,2 м</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "9px" }}>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ height: "74px", overflow: "hidden" }}><img src="/renders/render-02.png" alt="день" /></div>
              <span style={{ fontSize: "9.5px", textAlign: "center", color: "#6E6E6E" }}>Прямой солнечный свет</span>
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ height: "74px", overflow: "hidden" }}><img src="/renders/render-11.png" alt="пасмурно" /></div>
              <span style={{ fontSize: "9.5px", textAlign: "center", color: "#6E6E6E" }}>Пасмурно</span>
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ height: "74px", overflow: "hidden" }}><img src="/renders/render-12.png" alt="паркинг" /></div>
              <span style={{ fontSize: "9.5px", textAlign: "center", color: "#6E6E6E" }}>Крытый паркинг</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#FFFFFF", padding: "12px 14px" }}>
            <div style={{ width: "20px", height: "20px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Заказчик подтвердил выбор материала 28.08.2026 в 14:11</span>
              <span style={{ fontSize: "10.5px", color: "#6E6E6E", lineHeight: "1.45" }}>До подтверждения заказчику были показаны изображения во всех трёх световых условиях и предупреждение о сверке оттенка партии.</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "0 0 8px", borderBottom: "1px solid #111111" }}>
            <span style={{ width: "24px", flex: "none", fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>№</span>
            <span style={{ flex: "1", fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Наименование</span>
            <span style={{ width: "86px", flex: "none", textAlign: "right", fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Кол-во</span>
            <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Цена</span>
            <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A" }}>Сумма</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 0", borderBottom: "1px solid #EDEDED" }}>
            <span style={{ width: "24px", flex: "none", fontSize: "11px", color: "#9A9A9A" }}>1</span>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12px", fontWeight: "500" }}>Плёнка KPMF K75491, матовый хром тёмный</span><span style={{ fontSize: "10px", color: "#9A9A9A" }}>партия 24-118</span></div>
            <span style={{ width: "86px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>18,2 м</span>
            <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>9 500</span>
            <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>172 900</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 0", borderBottom: "1px solid #EDEDED" }}>
            <span style={{ width: "24px", flex: "none", fontSize: "11px", color: "#9A9A9A" }}>2</span>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12px", fontWeight: "500" }}>Оклейка кузова целиком</span><span style={{ fontSize: "10px", color: "#9A9A9A" }}>включая подготовку поверхности</span></div>
            <span style={{ width: "86px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>1</span>
            <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>68 000</span>
            <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>68 000</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 0", borderBottom: "1px solid #EDEDED" }}>
            <span style={{ width: "24px", flex: "none", fontSize: "11px", color: "#9A9A9A" }}>3</span>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12px", fontWeight: "500" }}>Разбор и сборка элементов</span><span style={{ fontSize: "10px", color: "#9A9A9A" }}>ручки, фонари, молдинги, зеркала</span></div>
            <span style={{ width: "86px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>1</span>
            <span style={{ width: "96px", flex: "none", textAlign: "right", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>13 000</span>
            <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>13 000</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "340px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Итого</span><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>253 900,00 ₽</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Предоплата 30%</span><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>76 170,00 ₽</span></div>
            <div style={{ height: "1px", background: "#111111" }}></div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: "500" }}>К оплате при выдаче</span>
              <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>177 730,00 ₽</span>
            </div>
            <span style={{ fontSize: "10px", color: "#9A9A9A", lineHeight: "1.45" }}>Без НДС. Сто семьдесят семь тысяч семьсот тридцать рублей 00 копеек.</span>
          </div>
        </div>

        <div style={{ background: "#F5FBCB", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600" }}>Об оттенке партии</span>
          <span style={{ fontSize: "10.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Изображения в заказ-наряде получены цифровым моделированием и переданы заказчику до начала работ. Оттенок конкретной партии материала сверяется с рулоном в присутствии заказчика на замере; образец прикладывается к настоящему наряду. Исполнитель не гарантирует полного совпадения экранного изображения и материала — по этой причине показ выполнялся в трёх световых условиях.</span>
        </div>

        <div style={{ display: "flex", gap: "26px", paddingTop: "4px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>Исполнитель</span>
            <div style={{ height: "1px", background: "#111111" }}></div>
            <span style={{ fontSize: "10px", color: "#9A9A9A", marginTop: "-16px" }}>Салимов П. / подпись</span>
          </div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>Заказчик · с материалом и условиями ознакомлен</span>
            <div style={{ height: "1px", background: "#111111" }}></div>
            <span style={{ fontSize: "10px", color: "#9A9A9A", marginTop: "-16px" }}>Гусев А. В. / подпись</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #EDEDED" }}>
          <span style={{ fontSize: "9.5px", color: "#C4C4C4" }}>Заказ-наряд № 4182 от 28.08.2026 · лист 1 из 1</span>
          <span style={{ fontSize: "9.5px", color: "#C4C4C4" }}>Сформировано в CarSwap AI</span>
        </div>
      </div>
    </div>

    <div style={{ width: "420px", display: "flex", flexDirection: "column", gap: "14px", paddingTop: "30px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "44px", borderRadius: "7px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ fontSize: "9px", fontWeight: "600", color: "#DEF23B" }}>PDF</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>Наряд-4182.pdf</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>A4 · 1 лист · 380 КБ</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}><span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Отправить клиенту в WhatsApp</span></div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Скачать</span></div>
            <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Печать</span></div>
          </div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Экран 52 · счёт</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
            <div style={{ width: "30px", height: "36px", borderRadius: "6px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ fontSize: "8px", fontWeight: "600", color: "#9A9A9A" }}>PDF</span></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Счёт 4182-1 · 76 170 ₽</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>предоплата 30% · QR для оплаты внутри</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
            <div style={{ width: "30px", height: "36px", borderRadius: "6px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><span style={{ fontSize: "8px", fontWeight: "600", color: "#9A9A9A" }}>PDF</span></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Счёт 4182-2 · 177 730 ₽</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>остаток, выставится при выдаче</span></div>
          </div>
          <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>Тот же шаблон и те же данные. Счёт — производная наряда, отдельной формы для него нет.</span>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,.07)", borderRadius: "22px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#DEF23B" }}>Экран 53 · зачем документ такой</span>
        <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Три света и отметка подтверждения внутри наряда — это не оформление, а защита. Одна переклейка стоит точке 50–150 тыс. ₽ плёнки плюс неделю занятого поста, а выплата по гарантии совпадения цвета — от пяти до пятнадцати лет подписки.</p>
        <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.55", color: "#C9C9C9", textWrap: "pretty" }}>Поэтому в документе нет ни слова про гарантию совпадения оттенка — только про сверку с рулоном при заказчике. Это обещание продукт держит.</p>
      </div>
    </div>
  </div>
</div></>
  );
}

export const S05Phase5CrmWorkorderBlocks = [S05Phase5CrmWorkorderBlock0, S05Phase5CrmWorkorderBlock1, S05Phase5CrmWorkorderBlock2, S05Phase5CrmWorkorderBlock3, S05Phase5CrmWorkorderBlock4, S05Phase5CrmWorkorderBlock5, S05Phase5CrmWorkorderBlock6, S05Phase5CrmWorkorderBlock7, S05Phase5CrmWorkorderBlock8, S05Phase5CrmWorkorderBlock9];
export const S05Phase5CrmWorkorderCanvas = { background: "#2A2A2A", padding: "52px 48px 120px", fontFamily: "Onest,system-ui,sans-serif", color: "#111111", display: "flex", flexDirection: "column", gap: "40px", width: "max-content" } as React.CSSProperties;
