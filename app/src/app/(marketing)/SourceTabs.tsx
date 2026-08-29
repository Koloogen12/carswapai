'use client';

/* Блок 3 хендоффа — «02 · Вот что уходит клиенту» и вкладки источника заявки.
 *
 * Механика: четыре входа — фото от клиента, только марка, клиент собрал сам,
 * холодный Авито. Переключение меняет левую панель «что пришло»; правая
 * исходящая карточка одна и та же для всех четырёх. В этом весь смысл блока:
 * вход разный, выход всегда одинаковый. Без анимации, как в прототипе.
 *
 * Разметка — из design/design/landing.dc.html, пиксели править нельзя.
 */
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';

const TABS = 4;

export function SourceTabs(): ReactElement {
  const [tab, setTab] = useState(0);

  /* Хендоф просит управление вкладками стрелками. */
  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = (tab + (e.key === 'ArrowRight' ? 1 : TABS - 1)) % TABS;
      setTab(next);
      document.getElementById(`cs-src-tab-${next}`)?.focus();
    }
  }

  return (
    <>
      <div id="card" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "680px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>02 · Вот что уходит клиенту</span>
              <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Ни одной правки руками</h2>
            </div>
            <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Решай сам, отправил бы ты такое своему клиенту. Четыре разных входа — от нормального фото до «сколько стоит» без единой детали.</p>
          </div>

          <div role="tablist" aria-label="Источник заявки" style={{ display: "flex", gap: "6px", background: "#FFFFFF", borderRadius: "999px", padding: "5px", width: "fit-content", maxWidth: "100%", flexWrap: "wrap" }}>
            <div id="cs-src-tab-0" role="tab" aria-selected={tab === 0} aria-controls="cs-src-panel-0" tabIndex={tab === 0 ? 0 : -1} onClick={() => setTab(0)} onKeyDown={onTabKey} style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: tab === 0 ? "#FFFFFF" : "#6E6E6E", background: tab === 0 ? "#111111" : "transparent" }}>Фото от клиента</div>
            <div id="cs-src-tab-1" role="tab" aria-selected={tab === 1} aria-controls="cs-src-panel-1" tabIndex={tab === 1 ? 0 : -1} onClick={() => setTab(1)} onKeyDown={onTabKey} style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: tab === 1 ? "#FFFFFF" : "#6E6E6E", background: tab === 1 ? "#111111" : "transparent" }}>Фото нет, только марка</div>
            <div id="cs-src-tab-2" role="tab" aria-selected={tab === 2} aria-controls="cs-src-panel-2" tabIndex={tab === 2 ? 0 : -1} onClick={() => setTab(2)} onKeyDown={onTabKey} style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: tab === 2 ? "#FFFFFF" : "#6E6E6E", background: tab === 2 ? "#111111" : "transparent" }}>Клиент собрал сам</div>
            <div id="cs-src-tab-3" role="tab" aria-selected={tab === 3} aria-controls="cs-src-panel-3" tabIndex={tab === 3 ? 0 : -1} onClick={() => setTab(3)} onKeyDown={onTabKey} style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: tab === 3 ? "#FFFFFF" : "#6E6E6E", background: tab === 3 ? "#111111" : "transparent" }}>Холодный Авито</div>
          </div>

          <div className="cs-g2" style={{ display: "grid", gridTemplateColumns: "minmax(300px,.72fr) minmax(0,1.28fr)", gap: "16px", alignItems: "start" }}>

            <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "26px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Что пришло</span>

              <div id="cs-src-panel-0" role="tabpanel" aria-labelledby="cs-src-tab-0" style={{ display: tab === 0 ? "flex" : "none", flexDirection: "column", gap: "14px" }}>
                <div style={{ borderRadius: "22px", overflow: "hidden", background: "#F5F5F5" }}><img src="/renders/input-client-photo.jpg" alt="" style={{ width: "100%", height: "230px", objectFit: "cover" }} /></div>
                <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "13px 16px", alignSelf: "flex-start", maxWidth: "88%" }}>
                  <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.4", color: "#2E2E2E" }}>Здравствуйте! Porsche 911, хочу что-то тёмное матовое. Сколько выйдет?</p>
                </div>
                <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Одно фото с телефона: вечер, двор, машина под углом, половину кадра занимает соседняя. Номер, диски и фон сохранены — он узнаёт свою машину.</p>
              </div>

              <div id="cs-src-panel-1" role="tabpanel" aria-labelledby="cs-src-tab-1" style={{ display: tab === 1 ? "flex" : "none", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "15px 18px", alignSelf: "flex-start", maxWidth: "92%" }}>
                  <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.4", color: "#2E2E2E" }}>Сколько будет обтянуть 911 в сатин-хром</p>
                </div>
                <div style={{ borderRadius: "22px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", height: "172px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "9px", textAlign: "center", padding: "20px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.6" strokeLinecap="round" style={{ flex: "none" }}><path d="M4 20l16-16" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
                  <span style={{ fontSize: "12.5px", color: "#6E6E6E", lineHeight: "1.4" }}>Фото нет<br />берём типовой кузов по марке и модели</span>
                </div>
                <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Типовой кузов ушёл через 20 секунд — до того, как он успел уйти в другой центр. Своё фото он прислал уже потом, посмотрев.</p>
              </div>

              <div id="cs-src-panel-2" role="tabpanel" aria-labelledby="cs-src-tab-2" style={{ display: tab === 2 ? "flex" : "none", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#9A9A9A" }}>клиент открыл вашу ссылку</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    <span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "7px 13px", fontWeight: "500" }}>Сатин лагуна</span>
                    <span style={{ fontSize: "12px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 13px", color: "#2E2E2E" }}>Диски чёрный мат</span>
                    <span style={{ fontSize: "12px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 13px", color: "#2E2E2E" }}>Салон карбон</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
                    <span style={{ fontSize: "12.5px", color: "#2E2E2E" }}>Отправил в студию · +7 916 ···</span>
                  </div>
                </div>
                <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Клиент пришёл в диалог уже с готовой конфигурацией и артикулами. Менеджеру осталось назвать срок.</p>
              </div>

              <div id="cs-src-panel-3" role="tabpanel" aria-labelledby="cs-src-tab-3" style={{ display: tab === 3 ? "flex" : "none", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "15px 18px", alignSelf: "flex-start" }}>
                  <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.4", color: "#2E2E2E" }}>Актуально?</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
                  <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "9.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
                  <span style={{ fontSize: "12.5px", color: "#2E2E2E" }}>Авито · объявление «Оклейка премиум»</span>
                </div>
                <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Обращение с Авито в том же списке. Ответ с примеркой ушёл обратно в Авито, менеджер не выходил из кабинета.</p>
              </div>
            </div>

            <div style={{ background: "#0B0B0C", borderRadius: "32px", padding: "26px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>WA</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Артём</span>
                    <span style={{ fontSize: "11px", color: "#8E8E8E" }}>WhatsApp · сегодня</span>
                  </div>
                </div>
                <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#8E8E8E" }}>Что ушло в тот же тред</span>
              </div>

              <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#111111", color: "#DEF23B", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>АЗ</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: "500", letterSpacing: "-0.01em" }}>Porsche 911 Carrera · ваша машина</span>
                      <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Ателье на Автозаводской · по вашему фото</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>3 из 214 SKU</span>
                </div>

                <div className="cs-scrollx">
                  <div className="cs-lightrow" style={{ display: "grid", gridTemplateColumns: "118px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <span></span>
                    <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>День</span>
                    <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Пасмурно</span>
                    <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Паркинг</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="cs-lightrow" style={{ display: "grid", gridTemplateColumns: "118px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: "8px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                        <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Сатин чёрный оникс</span>
                        <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>KPMF K75403</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "3px" }}>286 400 ₽</span>
                      </div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-sun.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-cloud.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-park.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                    </div>
                    <div className="cs-lightrow" style={{ display: "grid", gridTemplateColumns: "118px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: "8px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                        <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Матовый хаки</span>
                        <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>Avery SW-900 682</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "3px" }}>254 700 ₽</span>
                      </div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-sun.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-cloud.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-park.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                    </div>
                    <div className="cs-lightrow" style={{ display: "grid", gridTemplateColumns: "118px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: "8px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                        <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Сатин лагуна</span>
                        <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>KPMF K75427</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "3px" }}>268 300 ₽</span>
                      </div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-lagoon-sun.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-lagoon-cloud.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                      <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-lagoon-park.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#F5FBCB", borderRadius: "16px", padding: "13px 15px", marginTop: "14px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
                  <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — приложим настоящий образец к вашему кузову. Замер бесплатный, 40 минут.</span>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "13px", textAlign: "center", fontSize: "13px", fontWeight: "500" }}>Записаться на замер</div>
                  <div style={{ flex: "1", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "500" }}>Ещё вариант</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "#DEF23B", borderRadius: "18px 18px 18px 6px", padding: "12px 16px" }}>
                  <p style={{ margin: "0", fontSize: "14.5px", fontWeight: "500", lineHeight: "1.3", color: "#111111" }}>а можно ещё в этом?</p>
                </div>
                <span style={{ fontSize: "11.5px", color: "#8E8E8E" }}>через 4 минуты</span>
              </div>
              <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "1.5", color: "#8E8E8E", textWrap: "pretty" }}>Эта реплика — единственная, которая приносит деньги. Диалог с ней поднимается наверх инбокса, даже если писали два дня назад.</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
