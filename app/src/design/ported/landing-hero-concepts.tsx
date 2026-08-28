/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/landing-hero-concepts.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function LandingHeroConceptsBlock0(): ReactElement {
  return (
    <><div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: "80", display: "flex", alignItems: "center", gap: "0", background: "rgba(17,17,17,.74)", backdropFilter: "blur(14px)", borderRadius: "999px", padding: "4px", boxShadow: "0 18px 40px -20px rgba(0,0,0,.8)" }}>
  <div style={{ position: "absolute", top: "4px", left: "4px", width: "128px", height: "calc(100% - 8px)", borderRadius: "999px", background: "rgba(222,242,59,.14)", boxShadow: "inset 0 0 0 1px #DEF23B", transition: "transform .34s cubic-bezier(.4,0,.2,1)", transform: "translateX(@@DC:indicatorX@@)" }}></div>
  <div style={{ position: "relative", width: "128px", textAlign: "center", padding: "10px 0", fontSize: "12.5px", fontWeight: "500", color: "#F2F2F2", cursor: "pointer", letterSpacing: "-0.01em" }}><span style={{ color: "#DEF23B", marginRight: "6px" }}>A</span>Тёмный зал</div>
  <div style={{ position: "relative", width: "128px", textAlign: "center", padding: "10px 0", fontSize: "12.5px", fontWeight: "500", color: "#F2F2F2", cursor: "pointer", letterSpacing: "-0.01em" }}><span style={{ color: "#DEF23B", marginRight: "6px" }}>B</span>Прайс</div>
  <div style={{ position: "relative", width: "128px", textAlign: "center", padding: "10px 0", fontSize: "12.5px", fontWeight: "500", color: "#F2F2F2", cursor: "pointer", letterSpacing: "-0.01em" }}><span style={{ color: "#DEF23B", marginRight: "6px" }}>C</span>Девять кадров</div>
</div></>
  );
}

export function LandingHeroConceptsBlock1(): ReactElement {
  return (
    <>&#123;/* sc-if: isA */&#125;
<div data-screen-label="A · Тёмный зал" style={{ background: "#0B0B0C" }}>

  <div data-scene="a" style={{ position: "relative", height: "@@DC:paceA@@", viewTimelineName: "--heroA", viewTimelineAxis: "block" }}>
    <div style={{ position: "sticky", top: "0", height: "100vh", overflow: "hidden", background: "#0B0B0C" }}>

      <div data-stack="a" style={{ position: "absolute", inset: "0" }}>
        <div style={{ position: "absolute", inset: "0", backgroundImage: "url(/renders/wrap-01-silver.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        &#123;/* sc-for */&#125;
          <div data-lyr="1" style={{ position: "absolute", inset: "0", backgroundImage: "url(@@DC:f.img@@)", backgroundSize: "cover", backgroundPosition: "center", opacity: "0", willChange: "opacity", animation: "csRise 1s linear both", animationTimeline: "--heroA", animationRange: "@@DC:f.rise@@" }}></div>
        
      </div>

      <div style={{ position: "absolute", inset: "0", background: "linear-gradient(90deg,rgba(11,11,12,.95) 0%,rgba(11,11,12,.86) 26%,rgba(11,11,12,.35) 58%,rgba(11,11,12,0) 78%)" }}></div>
      <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(11,11,12,.7) 0%,rgba(11,11,12,0) 22%,rgba(11,11,12,0) 62%,rgba(11,11,12,.72) 100%)" }}></div>

      <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", padding: "26px 40px 116px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M12 4v16M4 12h16" /><circle cx="12" cy="12" r="4" /></svg>
          </div>
          <span style={{ fontSize: "17px", fontWeight: "600", letterSpacing: "-0.025em" }}>CarSwap AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "34px" }}>
          <span style={{ fontSize: "13.5px", color: "#9A9A9A" }}>Как это работает</span>
          <span style={{ fontSize: "13.5px", color: "#9A9A9A" }}>Для сети</span>
          <span style={{ fontSize: "13.5px", color: "#9A9A9A" }}>Тарифы</span>
          <div style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "12px 24px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer" }}>Подключить точку</div>
        </div>
      </div>

      <div style={{ flex: "1", display: "flex", alignItems: "center", minHeight: "0" }}>
      <div style={{ maxWidth: "min(46vw,620px)", display: "flex", flexDirection: "column", gap: "clamp(11px,2.1vh,24px)" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#DEF23B" }}>Одно фото клиента · девять вариантов из вашего прайса</span>
        <h1 style={{ margin: "0", fontSize: "clamp(32px,calc(2.4vw + 2.3vh),78px)", lineHeight: ".98", fontWeight: "500", letterSpacing: "-0.045em", textWrap: "balance" }}>Пока вы печатаете ответ, он уже выбрал цвет</h1>
        <p style={{ margin: "0", maxWidth: "440px", fontSize: "clamp(13px,1.75vh,16px)", lineHeight: "1.5", color: "#B4B4B4", textWrap: "pretty" }}>Обращение из WhatsApp, Telegram, MAX и Avito приходит в кабинет точки. Через двадцать секунд клиент видит свою машину в плёнках, которые лежат у вас на складе — с вашим артикулом и вашей ценой.</p>

        <div style={{ position: "relative", height: "clamp(76px,13.5vh,112px)" }}>
          &#123;/* sc-for */&#125;
            <div data-ro="1" style={{ position: "absolute", left: "0", top: "0", display: "flex", flexDirection: "column", gap: "7px", opacity: "0", animation: "@@DC:f.holdName@@ 1s linear both", animationTimeline: "--heroA", animationRange: "@@DC:f.hold@@" }}>
              <span style={{ fontSize: "clamp(18px,2.7vh,26px)", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1" }}>@@DC:f.name@@</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                <span style={{ fontSize: "13px", color: "#7E7E7E", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>@@DC:f.sku@@</span>
                <span style={{ fontSize: "12px", color: "#7E7E7E" }}>@@DC:f.finish@@</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", fontSize: "clamp(21px,3.1vh,30px)", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
                <span>@@DC:f.price@@</span><span style={{ fontSize: "19px", marginLeft: "7px", color: "#7E7E7E" }}>@@DC:f.cur@@</span>
              </div>
            </div>
          
        </div>
      </div>
      </div>
      </div>

      <div style={{ position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "clamp(6px,1.4vh,14px)", alignItems: "flex-end" }}>
        &#123;/* sc-for */&#125;
          <div data-chip="1" style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF", opacity: "0", whiteSpace: "nowrap", animation: "@@DC:f.holdName@@ 1s linear both", animationTimeline: "--heroA", animationRange: "@@DC:f.hold@@" }}>@@DC:f.short@@</span>
            <div style={{ width: "clamp(22px,3.3vh,34px)", height: "clamp(22px,3.3vh,34px)", borderRadius: "999px", flex: "none", background: "@@DC:f.hex@@", boxShadow: "0 0 0 1px rgba(255,255,255,.22)", animation: "@@DC:f.chipName@@ 1s linear both", animationTimeline: "--heroA", animationRange: "@@DC:f.hold@@" }}></div>
          </div>
        
      </div>

      <div style={{ position: "absolute", left: "40px", bottom: "36px", right: "150px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1", maxWidth: "560px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ position: "relative", width: "20px", height: "18px", flex: "none" }}>
              &#123;/* sc-for */&#125;
                <span data-num="1" style={{ position: "absolute", left: "0", top: "0", fontSize: "15px", fontWeight: "500", opacity: "0", animation: "@@DC:f.holdName@@ 1s linear both", animationTimeline: "--heroA", animationRange: "@@DC:f.hold@@" }}>@@DC:f.num@@</span>
              
            </span>
            <span style={{ fontSize: "13px", color: "#6E6E6E", whiteSpace: "nowrap" }}>/ 09 плёнок прайса</span>
          </div>
          <div style={{ height: "2px", background: "rgba(255,255,255,.14)", borderRadius: "2px", overflow: "hidden" }}>
            <div data-role="a-bar" style={{ height: "2px", width: "0%", background: "#DEF23B", animation: "csGrow 1s linear both", animationTimeline: "--heroA", animationRange: "contain 0% contain 100%" }}></div>
          </div>
        </div>
        <div data-role="a-hint" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8E8E8E", fontSize: "12.5px", animation: "csFadeOut 1s linear both", animationTimeline: "--heroA", animationRange: "contain 0% contain 3%" }}>
          <span>Крутите</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8E8E8E" strokeWidth="1.8" strokeLinecap="round" style={{ animation: "nudge 1.9s ease-in-out infinite" }}><path d="M12 4v14M6 13l6 6 6-6" /></svg>
        </div>
      </div>

    </div>
  </div>

  <div style={{ padding: "120px 40px 130px", background: "#0B0B0C" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "52px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "640px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#DEF23B" }}>Механика честности</span>
          <h2 style={{ margin: "0", fontSize: "clamp(30px,3.6vw,54px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Один артикул. Три света. Всегда все три.</h2>
        </div>
        <p style={{ margin: "0", maxWidth: "430px", fontSize: "15px", lineHeight: "1.55", color: "#9A9A9A", textWrap: "pretty" }}>Клиент видит лагуну на солнце, в пасмурный день и в крытом паркинге — до того, как вы отрежете первый метр. Тумблера, который это отключает, в продукте нет.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "24px", overflow: "hidden", background: "#141416" }}><img src="/renders/light-lagoon-sun.jpg" alt="" style={{ width: "100%", height: "340px", objectFit: "cover" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" /></svg>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Прямое солнце</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "24px", overflow: "hidden", background: "#141416" }}><img src="/renders/light-lagoon-cloud.jpg" alt="" style={{ width: "100%", height: "340px", objectFit: "cover" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 18h11a4 4 0 000-8 6 6 0 00-11.6 1.6A3.2 3.2 0 006.5 18z" /></svg>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Пасмурно</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "24px", overflow: "hidden", background: "#141416" }}><img src="/renders/light-lagoon-park.jpg" alt="" style={{ width: "100%", height: "340px", objectFit: "cover" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9l8-5 8 5" /><path d="M12 11v9" /><path d="M8 20h8" /></svg>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>Крытый паркинг</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(222,242,59,.09)", borderRadius: "20px", padding: "20px 24px", maxWidth: "820px" }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
        <span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#E8E8E8" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.</span>
      </div>
    </div>
  </div>

  &#123;/* sc-if: notes */&#125;
  <div style={{ padding: "0 40px 90px", background: "#0B0B0C" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "16px", borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: "26px" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", color: "#DEF23B", flex: "none", marginTop: "3px" }}>Ставка A</span>
      <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#8E8E8E", maxWidth: "760px", textWrap: "pretty" }}>Кино. Первые две секунды продают перевоплощение, прайс приходит вторым слоем. Сильнее всего работает на владельце, который сам приехал с личной машиной — но дальше страницу придётся вытягивать цифрами, потому что герой ничего не обещает про деньги.</p>
    </div>
  </div>
  

</div>
</>
  );
}

export function LandingHeroConceptsBlock2(): ReactElement {
  return (
    <>&#123;/* sc-if: isB */&#125;
<div data-screen-label="B · Прайс" style={{ background: "#EFEFEF", color: "#111111" }}>

  <div data-scene="b" style={{ position: "relative", height: "@@DC:paceB@@", viewTimelineName: "--heroB", viewTimelineAxis: "block" }}>
    <div style={{ position: "sticky", top: "0", height: "100vh", padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "#FFFFFF", borderRadius: "999px", padding: "12px 14px 12px 22px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.9" strokeLinecap="round"><path d="M12 4v16M4 12h16" /><circle cx="12" cy="12" r="4" /></svg>
          </div>
          <span style={{ fontSize: "16.5px", fontWeight: "600", letterSpacing: "-0.025em" }}>CarSwap AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <span style={{ fontSize: "13.5px", color: "#6E6E6E" }}>Как это работает</span>
          <span style={{ fontSize: "13.5px", color: "#6E6E6E" }}>Для сети</span>
          <span style={{ fontSize: "13.5px", color: "#6E6E6E" }}>Тарифы</span>
          <div style={{ background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "12px 24px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer" }}>Подключить точку</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px,.62fr) 1.38fr", gap: "16px", flex: "1", minHeight: "0" }}>

        <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px 30px 24px", display: "flex", flexDirection: "column", gap: "22px", minHeight: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: "none" }}>
            <h1 style={{ margin: "0", fontSize: "clamp(26px,2.5vw,38px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Витрина — примерка. Цена и артикул — ваши.</h1>
            <p style={{ margin: "0", fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Клиент собирает вариант из прайса точки. Того, чего нет на складе, для него не существует — ни в кабинете, ни в гараже.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flex: "none" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Прайс точки · Автозаводская</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>9 из 214 SKU</span>
          </div>

          <div style={{ position: "relative", flex: "1", minHeight: "0", overflow: "hidden", maskImage: "linear-gradient(180deg,transparent 0,#000 12%,#000 74%,transparent 100%)", WebkitMaskImage: "linear-gradient(180deg,transparent 0,#000 12%,#000 74%,transparent 100%)" }}>
            <div data-role="b-rows" style={{ position: "absolute", left: "0", right: "0", top: "38%", willChange: "transform", animation: "csRowSlide 1s linear both", animationTimeline: "--heroB", animationRange: "contain 0% contain 100%" }}>
              &#123;/* sc-for */&#125;
                <div data-row="1" style={{ height: "66px", display: "flex", alignItems: "center", gap: "14px", padding: "0 16px", borderRadius: "18px", opacity: ".45", animation: "@@DC:f.rowName@@ 1s linear both", animationTimeline: "--heroB", animationRange: "@@DC:f.hold@@" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "10px", flex: "none", background: "@@DC:f.hex@@", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }}></div>
                  <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@@DC:f.name@@</span>
                    <span style={{ fontSize: "11.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>@@DC:f.sku@@ · @@DC:f.finish@@</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flex: "none" }}>
                    <span style={{ fontSize: "14.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>@@DC:f.price@@</span>
                    <span style={{ fontSize: "11px", color: "#9A9A9A" }}>@@DC:f.stock@@</span>
                  </div>
                </div>
              
            </div>
            <div style={{ position: "absolute", left: "0", right: "0", top: "38%", height: "66px", borderRadius: "18px", boxShadow: "inset 0 0 0 1.5px #111111", pointerEvents: "none" }}></div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px", flex: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
            <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим.</span>
          </div>
        </div>

        <div style={{ position: "relative", borderRadius: "32px", overflow: "hidden", background: "#111111", minHeight: "0" }}>
          <div data-stack="b" style={{ position: "absolute", inset: "0" }}>
            <div style={{ position: "absolute", inset: "0", backgroundImage: "url(/renders/wrap-01-silver.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            &#123;/* sc-for */&#125;
              <div data-lyr="1" style={{ position: "absolute", inset: "0", backgroundImage: "url(@@DC:f.img@@)", backgroundSize: "cover", backgroundPosition: "center", opacity: "0", willChange: "opacity", animation: "csRise 1s linear both", animationTimeline: "--heroB", animationRange: "@@DC:f.rise@@" }}></div>
            
          </div>

          <div style={{ position: "absolute", top: "22px", left: "22px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderRadius: "999px", padding: "8px 16px 8px 10px" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#111111", color: "#DEF23B", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>АЗ</span>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#111111" }}>Ателье на Автозаводской</span>
          </div>

          <div style={{ position: "absolute", right: "22px", top: "22px", display: "flex", gap: "6px", background: "rgba(17,17,17,.72)", backdropFilter: "blur(8px)", borderRadius: "999px", padding: "5px" }}>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "8px 15px" }}>День</span>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#C4C4C4", padding: "8px 15px" }}>Пасмурно</span>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#C4C4C4", padding: "8px 15px" }}>Паркинг</span>
          </div>

          <div style={{ position: "absolute", left: "22px", bottom: "22px", maxWidth: "340px", background: "#FFFFFF", borderRadius: "24px", padding: "18px 20px", boxShadow: "0 24px 44px -22px rgba(0,0,0,.55)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>WA</span>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Артём, 14:32 · WhatsApp</span>
            </div>
            <div style={{ background: "#DEF23B", borderRadius: "16px 16px 16px 5px", padding: "13px 16px", fontSize: "14.5px", fontWeight: "500", color: "#111111", alignSelf: "flex-start" }}>а можно ещё в этом?</div>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.4" }}>Диалог поднимается наверх инбокса. Домер варианта — в той же переписке, без новой примерки.</span>
          </div>

          <div style={{ position: "absolute", right: "22px", bottom: "22px", display: "flex", alignItems: "center", gap: "12px", background: "rgba(17,17,17,.72)", backdropFilter: "blur(8px)", borderRadius: "999px", padding: "10px 18px" }}>
            <span style={{ position: "relative", width: "18px", height: "16px", flex: "none", fontVariantNumeric: "tabular-nums" }}>
              &#123;/* sc-for */&#125;
                <span data-num="1" style={{ position: "absolute", left: "0", top: "0", fontSize: "13px", fontWeight: "500", color: "#FFFFFF", opacity: "0", animation: "@@DC:f.holdName@@ 1s linear both", animationTimeline: "--heroB", animationRange: "@@DC:f.hold@@" }}>@@DC:f.num@@</span>
              
            </span>
            <span style={{ fontSize: "12px", color: "#9A9A9A" }}>/ 09</span>
            <div style={{ width: "74px", height: "2px", background: "rgba(255,255,255,.2)", borderRadius: "2px", overflow: "hidden" }}><div data-role="b-bar" style={{ height: "2px", width: "0%", background: "#DEF23B", animation: "csGrow 1s linear both", animationTimeline: "--heroB", animationRange: "contain 0% contain 100%" }}></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style={{ padding: "110px 22px 120px", background: "#EFEFEF" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
        <h2 style={{ margin: "0", maxWidth: "640px", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.03", fontWeight: "500", letterSpacing: "-0.04em" }}>След от каждой примерки остаётся в трёх местах</h2>
        <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Одна конфигурация проходит все контуры без перенабора полей: диалог менеджера, пост мастера, сводка владельца.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Пост мастера</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#111111", borderRadius: "18px", padding: "14px 18px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>26 августа, 14:32 · KPMF K75427</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>На выдаче клиент говорит «на картинке было ярче» — мастер разворачивает телефон. Его выбор, его дата, те же три света. Спор закрывается за 15 секунд.</p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Сводка на 7-й день</span>
          <div style={{ height: "42px", borderRadius: "999px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#D6D6D6 0 1px,transparent 1px 5px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ width: "68%", height: "42px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "16px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>68%</span></div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Покрытие входящих примерками и поимённо сделки, где клиент выбрал цвет по картинке. Это список с суммами, а не дашборд с графиками.</p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Расход генераций</span>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "88px", height: "88px", borderRadius: "999px", flex: "none", background: "conic-gradient(#DEF23B 0 62%,#EFEFEF 62% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>1 240</span>
                <span style={{ fontSize: "9.5px", color: "#9A9A9A" }}>из 2 000</span>
              </div>
            </div>
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>7 440 ₽ до конца месяца, поимённо по клиентам</span>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Клиент крутит 5–15 примерок за визит. Порог 80% меняет тон на Acid 300, а не на красный: лимит не должен выглядеть поломкой.</p>
        </div>
      </div>
    </div>
  </div>

  &#123;/* sc-if: notes */&#125;
  <div style={{ padding: "0 22px 90px", background: "#EFEFEF" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "16px", borderTop: "1px solid #DCDCDC", paddingTop: "26px" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", color: "#111111", flex: "none", marginTop: "3px" }}>Ставка B</span>
      <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", maxWidth: "760px", textWrap: "pretty" }}>Плательщик. ВАУ здесь не в машине, а в том, что машина прибита к прайсу и складу точки: владелец видит свою экономику в первом экране. Слабее как зрелище, сильнее как аргумент — и ближе всего к самому продукту.</p>
    </div>
  </div>
  

</div>
</>
  );
}

export function LandingHeroConceptsBlock3(): ReactElement {
  return (
    <>&#123;/* sc-if: isC */&#125;
<div data-screen-label="C · Девять кадров" style={{ background: "#0B0B0C" }}>

  <div data-scene="c" style={{ position: "relative", height: "@@DC:paceC@@", viewTimelineName: "--heroC", viewTimelineAxis: "block" }}>
    <div style={{ position: "sticky", top: "0", height: "100vh", overflow: "hidden", background: "#0B0B0C" }}>

      <div data-role="c-hero" style={{ position: "absolute", inset: "0", animation: "csHeroOut 1s linear both", animationTimeline: "--heroC", animationRange: "contain 3% contain 29%" }}>
        <img src="/renders/wrap-04-lagoon.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(11,11,12,.82) 0%,rgba(11,11,12,.25) 34%,rgba(11,11,12,.1) 60%,rgba(11,11,12,.86) 100%)" }}></div>
        <div style={{ position: "absolute", left: "0", right: "0", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "0 40px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#DEF23B" }}>Три артикула · три света · одно сообщение</span>
          <h1 style={{ margin: "0", maxWidth: "900px", fontSize: "clamp(38px,5.2vw,82px)", lineHeight: ".98", fontWeight: "500", letterSpacing: "-0.045em", textWrap: "balance" }}>Девять кадров, которые переживут сжатие мессенджера</h1>
          <p style={{ margin: "0", maxWidth: "560px", fontSize: "16px", lineHeight: "1.5", color: "#B4B4B4", textWrap: "pretty" }}>Карточка уходит в WhatsApp клиента с логотипом точки внутри изображения. Читается с телефона одним взглядом.</p>
        </div>
      </div>

      <div data-role="c-chat" style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", padding: "70px 20px 24px", opacity: "0", animation: "csFadeIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 4% contain 30%" }}>
        <div style={{ width: "100%", maxWidth: "520px", display: "flex", flexDirection: "column", gap: "12px" }}>

          <div data-role="c-in" style={{ alignSelf: "flex-start", maxWidth: "78%", background: "#1C1C1F", borderRadius: "18px 18px 18px 5px", padding: "13px 17px", opacity: "0", animation: "csBubbleUp 1s linear both", animationTimeline: "--heroC", animationRange: "contain 72% contain 92%" }}>
            <p style={{ margin: "0", fontSize: "14.5px", lineHeight: "1.4", color: "#F2F2F2" }}>Здравствуйте! Porsche 911, хочу что-то тёмное матовое. Сколько выйдет?</p>
            <span style={{ fontSize: "11px", color: "#7E7E7E" }}>Артём · 14:26</span>
          </div>

          <div data-role="c-card" style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", color: "#111111", boxShadow: "0 40px 80px -30px rgba(0,0,0,.85)", willChange: "transform", transform: "scale(1.2)", animation: "csCardScale 1s linear both", animationTimeline: "--heroC", animationRange: "contain 72% contain 96%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: "#111111", color: "#DEF23B", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>АЗ</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500", letterSpacing: "-0.01em" }}>Porsche 911 Carrera · А 432 ОР 77</span>
                  <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Ателье на Автозаводской · по вашему фото</span>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>3 из 214 SKU</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "104px 1fr 1fr 1fr", gap: "7px", alignItems: "center", marginBottom: "8px" }}>
              <span></span>
              <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>День</span>
              <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Пасмурно</span>
              <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Паркинг</span>
            </div>

            <div data-role="c-grid" style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "104px 1fr 1fr 1fr", gap: "7px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Сатин чёрный</span>
                  <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>K75403</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>286 400 ₽</span>
                </div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 30% contain 58%" }}><img src="/renders/light-black-sun.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 33% contain 61%" }}><img src="/renders/light-black-cloud.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 36% contain 64%" }}><img src="/renders/light-black-park.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "104px 1fr 1fr 1fr", gap: "7px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Матовый хаки</span>
                  <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>SW-900 682</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>254 700 ₽</span>
                </div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 39% contain 67%" }}><img src="/renders/light-olive-sun.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 42% contain 70%" }}><img src="/renders/light-olive-cloud.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 45% contain 73%" }}><img src="/renders/light-olive-park.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "104px 1fr 1fr 1fr", gap: "7px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Сатин лагуна</span>
                  <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>K75427</span>
                  <span style={{ fontSize: "12px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>268 300 ₽</span>
                </div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 48% contain 76%" }}><img src="/renders/light-lagoon-sun.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 51% contain 79%" }}><img src="/renders/light-lagoon-cloud.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
                <div data-cell="1" style={{ borderRadius: "10px", overflow: "hidden", background: "#F0F0F0", opacity: "0", animation: "csCellIn 1s linear both", animationTimeline: "--heroC", animationRange: "contain 54% contain 82%" }}><img src="/renders/light-lagoon-park.jpg" alt="" style={{ width: "100%", height: "66px", objectFit: "cover" }} /></div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", marginTop: "14px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
              <span style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим.</span>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "500" }}>Записать на замер</div>
              <div style={{ flex: "1", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "11px", textAlign: "center", fontSize: "13px", fontWeight: "500" }}>Ещё вариант</div>
            </div>
          </div>

          <div data-role="c-out" style={{ alignSelf: "flex-start", background: "#DEF23B", borderRadius: "18px 18px 18px 5px", padding: "13px 17px", opacity: "0", animation: "csBubbleDown 1s linear both", animationTimeline: "--heroC", animationRange: "contain 76% contain 96%" }}>
            <p style={{ margin: "0", fontSize: "14.5px", fontWeight: "500", lineHeight: "1.4", color: "#111111" }}>а можно ещё в этом?</p>
            <span style={{ fontSize: "11px", color: "rgba(17,17,17,.5)" }}>Артём · 14:32</span>
          </div>

        </div>
      </div>

      <div style={{ position: "absolute", left: "40px", bottom: "30px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12.5px", color: "#8E8E8E" }}>Одна конфигурация · пять контуров</span>
        <div style={{ width: "120px", height: "2px", background: "rgba(255,255,255,.14)", borderRadius: "2px", overflow: "hidden" }}><div data-role="c-bar" style={{ height: "2px", width: "0%", background: "#DEF23B", animation: "csGrow 1s linear both", animationTimeline: "--heroC", animationRange: "contain 0% contain 100%" }}></div></div>
      </div>

    </div>
  </div>

  <div style={{ padding: "120px 40px 130px", background: "#0B0B0C" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "44px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
        <h2 style={{ margin: "0", maxWidth: "660px", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Момент, ради которого всё построено, живёт минуты</h2>
        <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#9A9A9A", textWrap: "pretty" }}>«А можно ещё в этом?» — единственная реплика, которая приносит деньги. Такой диалог поднимается наверх инбокса, даже если писали два дня назад.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
        <div style={{ background: "#141416", borderRadius: "24px", padding: "26px 26px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "34px", fontWeight: "500", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>18 сек</span>
          <span style={{ fontSize: "13px", color: "#9A9A9A", lineHeight: "1.45" }}>до первой карточки по марке и модели, без фото</span>
        </div>
        <div style={{ background: "#141416", borderRadius: "24px", padding: "26px 26px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "34px", fontWeight: "500", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>3</span>
          <span style={{ fontSize: "13px", color: "#9A9A9A", lineHeight: "1.45" }}>действия менеджера: открыл диалог, выбрал, отправил</span>
        </div>
        <div style={{ background: "#141416", borderRadius: "24px", padding: "26px 26px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "34px", fontWeight: "500", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>0</span>
          <span style={{ fontSize: "13px", color: "#9A9A9A", lineHeight: "1.45" }}>ручного ввода артикула и цены — всё из прайса точки</span>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "24px", padding: "26px 26px 24px", display: "flex", flexDirection: "column", gap: "10px", color: "#111111" }}>
          <span style={{ fontSize: "34px", fontWeight: "500", letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>1 час</span>
          <span style={{ fontSize: "13px", lineHeight: "1.45", opacity: ".72" }}>на запуск точки: каналы, прайс, менеджеры. Без миграции и обучения</span>
        </div>
      </div>
    </div>
  </div>

  &#123;/* sc-if: notes */&#125;
  <div style={{ padding: "0 40px 90px", background: "#0B0B0C" }}>
    <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "16px", borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: "26px" }}>
      <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", color: "#DEF23B", flex: "none", marginTop: "3px" }}>Ставка C</span>
      <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#8E8E8E", maxWidth: "760px", textWrap: "pretty" }}>Артефакт. Продаём не экран, а сообщение, которое уходит клиенту и потом защищает точку от переклейки. Самый честный первый экран и самый сложный: ВАУ приходит не сразу, а на второй секунде сборки.</p>
    </div>
  </div>
  

</div>
</>
  );
}

export const LandingHeroConceptsBlocks = [LandingHeroConceptsBlock0, LandingHeroConceptsBlock1, LandingHeroConceptsBlock2, LandingHeroConceptsBlock3];
export const LandingHeroConceptsCanvas = { fontFamily: "Onest,system-ui,sans-serif", color: "#FFFFFF", background: "#0B0B0C" } as React.CSSProperties;
