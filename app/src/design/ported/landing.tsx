/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/landing.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function LandingBlock0(): ReactElement {
  return (
    <><div style={{ position: "fixed", top: "14px", left: "50%", transform: "translateX(-50%)", zIndex: "90", width: "calc(100% - 28px)", maxWidth: "1360px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "rgba(17,17,17,.76)", backdropFilter: "blur(16px)", borderRadius: "999px", padding: "8px 8px 8px 22px", boxShadow: "0 20px 44px -24px rgba(0,0,0,.6)" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "11px", flex: "none" }}>
    <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="4.2" /></svg>
    </div>
    <span style={{ fontSize: "16.5px", fontWeight: "600", letterSpacing: "-0.025em", color: "#FFFFFF" }}>CarSwap AI</span>
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
    <a href="#how" style={{ fontSize: "13.5px", color: "#C4C4C4" }}>Как работает</a>
    <a href="#card" style={{ fontSize: "13.5px", color: "#C4C4C4" }}>Что уходит клиенту</a>
    <a href="#features" style={{ fontSize: "13.5px", color: "#C4C4C4" }}>Возможности</a>
    <a href="#network" style={{ fontSize: "13.5px", color: "#C4C4C4" }}>Для сетей</a>
    <a href="#pricing" style={{ fontSize: "13.5px", color: "#C4C4C4" }}>Тарифы</a>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "12px 22px", fontSize: "13.5px", fontWeight: "500" }}>Записаться на демо</a>
      <div style={{ width: "42px", height: "42px", borderRadius: "999px", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0113 0" /></svg>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock1(): ReactElement {
  return (
    <><div data-screen-label="Герой" style={{ position: "relative", height: "100vh", background: "#0B0B0C", overflow: "hidden" }}>
  <div style={{ position: "absolute", inset: "0", overflow: "hidden", background: "#0B0B0C" }}>

    <video data-hero-video="1" src="/renders/hero-pov.mp4" poster="/renders/hero-poster.jpg" autoPlay={true} muted={true} loop={true} playsInline={true} preload="auto" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }}></video>

    <div style={{ position: "absolute", inset: "0", background: "linear-gradient(90deg,rgba(11,11,12,.96) 0%,rgba(11,11,12,.9) 27%,rgba(11,11,12,.42) 58%,rgba(11,11,12,.05) 80%)" }}></div>
    <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(11,11,12,.72) 0%,rgba(11,11,12,0) 20%,rgba(11,11,12,0) 60%,rgba(11,11,12,.76) 100%)" }}></div>

    <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", padding: "100px 40px 96px" }}>
      <div style={{ maxWidth: "min(47vw,640px)", maxHeight: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "clamp(9px,1.8vh,26px)" }}>

        &#123;/* sc-if: showPilotBadge */&#125;
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,.08)", borderRadius: "999px", padding: "6px 16px 6px 6px", width: "fit-content", maxWidth: "100%" }}>
            <div style={{ display: "flex" }}>
              <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#DEF23B", boxShadow: "0 0 0 2px #0B0B0C" }}></span>
              <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#6E6E4C", boxShadow: "0 0 0 2px #0B0B0C", marginLeft: "-9px" }}></span>
              <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#1F6C80", boxShadow: "0 0 0 2px #0B0B0C", marginLeft: "-9px" }}></span>
            </div>
            <span style={{ fontSize: "12.5px", color: "#E8E8E8" }}>Три точки-пилота уже в работе</span>
          </div>
        

        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#DEF23B", textWrap: "balance" }}>Для студий, где цветную оклейку продают в переписке</span>

        <h1 style={{ margin: "0", fontSize: "clamp(30px,calc(2vw + 2.1vh),76px)", lineHeight: ".98", fontWeight: "500", letterSpacing: "-0.045em", textWrap: "balance", color: "#FFFFFF" }}>Покажи цвет на его машине, <span style={{ color: "#DEF23B" }}>пока он ещё в диалоге</span></h1>

        <p style={{ margin: "0", maxWidth: "470px", fontSize: "clamp(12.5px,1.6vh,16px)", lineHeight: "1.45", color: "#B4B4B4", textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical", overflow: "hidden" }}>Заявки из WhatsApp, Telegram, MAX и Авито приходят в один список. Открываешь диалог, собираешь примерку прямо в нём и отправляешь одним действием: его машина, артикул из твоего прайса, твоя цена. Три минуты вместо получаса объяснений словами.</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "clamp(12px,1.7vh,15px) 28px", fontSize: "14px", fontWeight: "500" }}>Записаться на демо · 15 минут</a>
          <a href="#try" style={{ background: "rgba(255,255,255,.1)", color: "#FFFFFF", borderRadius: "999px", padding: "clamp(12px,1.7vh,15px) 28px", fontSize: "14px", fontWeight: "500" }}>Померить на своей машине</a>
        </div>
      </div>
    </div>

    <div style={{ position: "absolute", left: "40px", bottom: "30px", right: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12.5px", color: "#8E8E8E", textWrap: "pretty" }}>Один кадр, без монтажа. Плёнка — из прайса точки, а не из палитры нейросети.</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,.08)", borderRadius: "999px", padding: "8px 16px 8px 10px" }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
        <span style={{ fontSize: "12px", color: "#C4C4C4", whiteSpace: "nowrap" }}>Porsche 911 · фото клиента из двора</span>
      </div>
    </div>

  </div>
</div></>
  );
}

export function LandingBlock2(): ReactElement {
  return (
    <><div style={{ background: "#0B0B0C", padding: "0 40px 64px" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "26px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "14px" }}>
      <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Одно окно</span>
        <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>WhatsApp, Telegram, MAX и Авито в одном списке. Не нужно каждый раз заходить на Авито, чтобы ответить.</span>
      </div>
      <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Его машина</span>
        <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Не студийный рендер на белом фоне. Его номер, его диски, его двор — он узнаёт её как свою.</span>
      </div>
      <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Твой прайс</span>
        <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Артикул и цена вшиты в картинку на уровне генерации. Руками не набираются и отвязаться не могут.</span>
      </div>
    </div>
    <p style={{ margin: "0", fontSize: "clamp(17px,1.5vw,22px)", lineHeight: "1.35", fontWeight: "500", letterSpacing: "-0.02em", color: "#FFFFFF", maxWidth: "680px", textWrap: "balance" }}>Всё, чтобы заявка, за которую вы уже заплатили, доехала до замера.</p>
  </div>
</div></>
  );
}

export function LandingBlock3(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "36px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "660px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>01 · Для кого это</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Три ситуации, в которых CarSwap забирает работу целиком</h2>
      </div>
      <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Найди свою — дальше страница будет говорить с тобой.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px 30px 26px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>01</span>
        <h3 style={{ margin: "0", fontSize: "22px", lineHeight: "1.14", fontWeight: "500", letterSpacing: "-0.03em", textWrap: "pretty" }}>Ты платишь за заявки, а до замера доезжает каждый десятый?</h3>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>«Сорок пять обращений за месяц. Четыре сделки. Реклама съела шестьдесят тысяч. Половина переписок кончается на "спасибо, я подумаю" — и я даже не знаю, о чём он думал. Он спросил про сатин-хром, менеджер объяснил словами, клиент ушёл. А он в этот момент писал ещё в два центра.»</p>
        <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
            <span style={{ fontSize: "12.5px", fontWeight: "500", flex: "1" }}>Артём · Porsche 911</span>
            <span style={{ fontSize: "11px", color: "#D93F45", fontVariantNumeric: "tabular-nums" }}>14 мин</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
            <span style={{ fontSize: "12.5px", fontWeight: "500", flex: "1" }}>Без имени · «Актуально?»</span>
            <span style={{ fontSize: "11px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>2 мин</span>
          </div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5" }}><span style={{ fontWeight: "500" }}>Задача:</span> <span style={{ color: "#6E6E6E" }}>довести до записи на замер сегодня тех, кто написал сегодня — показав цвет, а не описав его.</span></p>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px 30px 26px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>02</span>
        <h3 style={{ margin: "0", fontSize: "22px", lineHeight: "1.14", fontWeight: "500", letterSpacing: "-0.03em", textWrap: "pretty" }}>Ты третий раз платишь за софт, который никто не заполняет?</h3>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>«Первую CRM внедряли месяц, вторую я бросил на переносе данных — половина истории клиентов не доехала. Сейчас плачу за третью, и менеджеры ведут её ровно тогда, когда я стою рядом. Ходить и напоминать я больше не буду. Мне нужно, чтобы заполнялось само.»</p>
        <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Неделя 34</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>покрытие входящих</span>
          </div>
          <div style={{ height: "36px", borderRadius: "999px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#D6D6D6 0 1px,transparent 1px 5px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div style={{ width: "68%", height: "36px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "14px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>68%</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <span style={{ fontSize: "12px", color: "#2E2E2E", flex: "1" }}>Артём Л. · 268 300 ₽</span>
            <span style={{ fontSize: "10.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 10px" }}>цвет по примерке</span>
          </div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5" }}><span style={{ fontWeight: "500" }}>Задача:</span> <span style={{ color: "#6E6E6E" }}>получить инструмент, который заполняется без твоего участия — потому что менеджеру он выгоден в его собственной смене.</span></p>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px 30px 26px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>03</span>
        <h3 style={{ margin: "0", fontSize: "22px", lineHeight: "1.14", fontWeight: "500", letterSpacing: "-0.03em", textWrap: "pretty" }}>Сдал работу — и споришь на выдаче за свой счёт?</h3>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>«"На картинке было ярче" — и всё, дальше это моё слово против его. Переклейка — это полтораста тысяч плёнки и неделя занятого поста. Плёнка от партии к партии играет, я это знаю, клиент — нет. Доказать нечем: переписку у поста не поднимешь.»</p>
        <div style={{ background: "#111111", borderRadius: "20px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "13px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>26 августа, 14:32 · KPMF K75427</span>
          </div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5" }}><span style={{ fontWeight: "500" }}>Задача:</span> <span style={{ color: "#6E6E6E" }}>иметь выбор артикула, зафиксированный самим клиентом с датой — и закрывать спор за тридцать секунд, не запуская переклейку.</span></p>
      </div>

    </div>
  </div>
</div></>
  );
}

export function LandingBlock4(): ReactElement {
  return (
    <><div style={{ padding: "64px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
    <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Также будет ценно</span>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "18px 0", borderTop: "1px solid #DCDCDC" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", transform: "translateY(2px)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em", flex: "none" }}>Студиям на прозрачной защите, которые пробуют цветную</span>
        <span style={{ fontSize: "14px", color: "#6E6E6E", textWrap: "pretty" }}>показать клиенту вариант, который сегодня даже не предлагают, потому что нечем показать</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "18px 0", borderTop: "1px solid #DCDCDC" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", transform: "translateY(2px)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em", flex: "none" }}>Тюнинг-ателье с дисками, салоном и обвесом</span>
        <span style={{ fontSize: "14px", color: "#6E6E6E", textWrap: "pretty" }}>примерить четыре категории на одной машине и продать конфигурацией, а не позициями</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "18px 0", borderTop: "1px solid #DCDCDC" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", transform: "translateY(2px)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em", flex: "none" }}>Поставщикам и дистрибьюторам плёнки</span>
        <span style={{ fontSize: "14px", color: "#6E6E6E", textWrap: "pretty" }}>дать своим точкам примерочную со своим каталогом артикулов</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "18px 0", borderTop: "1px solid #DCDCDC" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", transform: "translateY(2px)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em", flex: "none" }}>Автоподборщикам и перекупам</span>
        <span style={{ fontSize: "14px", color: "#6E6E6E", textWrap: "pretty" }}>показать покупателю машину в другом цвете до сделки</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "18px 0", borderTop: "1px solid #DCDCDC", borderBottom: "1px solid #DCDCDC" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", transform: "translateY(2px)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em", flex: "none" }}>Салонам с трейд-ином</span>
        <span style={{ fontSize: "14px", color: "#6E6E6E", textWrap: "pretty" }}>оживить машину, которая стоит месяц из-за цвета</span>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock5(): ReactElement {
  return (
    <><div id="card" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "680px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>02 · Вот что уходит клиенту</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Ни одной правки руками</h2>
      </div>
      <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Решай сам, отправил бы ты такое своему клиенту. Четыре разных входа — от нормального фото до «сколько стоит» без единой детали.</p>
    </div>

    <div style={{ display: "flex", gap: "6px", background: "#FFFFFF", borderRadius: "999px", padding: "5px", width: "fit-content", maxWidth: "100%", flexWrap: "wrap" }}>
      <div style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: "@@DC:t0fg@@", background: "@@DC:t0bg@@" }}>Фото от клиента</div>
      <div style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: "@@DC:t1fg@@", background: "@@DC:t1bg@@" }}>Фото нет, только марка</div>
      <div style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: "@@DC:t2fg@@", background: "@@DC:t2bg@@" }}>Клиент собрал сам</div>
      <div style={{ fontSize: "13px", fontWeight: "500", borderRadius: "999px", padding: "11px 20px", cursor: "pointer", color: "@@DC:t3fg@@", background: "@@DC:t3bg@@" }}>Холодный Авито</div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "minmax(300px,.72fr) 1.28fr", gap: "16px", alignItems: "start" }}>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Что пришло</span>

        <div style={{ display: "@@DC:d0@@", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "22px", overflow: "hidden", background: "#F5F5F5" }}><img src="/renders/input-client-photo.jpg" alt="" style={{ width: "100%", height: "230px", objectFit: "cover" }} /></div>
          <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "13px 16px", alignSelf: "flex-start", maxWidth: "88%" }}>
            <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.4", color: "#2E2E2E" }}>Здравствуйте! Porsche 911, хочу что-то тёмное матовое. Сколько выйдет?</p>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Одно фото с телефона: вечер, двор, машина под углом, половину кадра занимает соседняя. Номер, диски и фон сохранены — он узнаёт свою машину.</p>
        </div>

        <div style={{ display: "@@DC:d1@@", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "15px 18px", alignSelf: "flex-start", maxWidth: "92%" }}>
            <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.4", color: "#2E2E2E" }}>Сколько будет обтянуть 911 в сатин-хром</p>
          </div>
          <div style={{ borderRadius: "22px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", height: "172px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "9px", textAlign: "center", padding: "20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.6" strokeLinecap="round"><path d="M4 20l16-16" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
            <span style={{ fontSize: "12.5px", color: "#6E6E6E", lineHeight: "1.4" }}>Фото нет<br />берём типовой кузов по марке и модели</span>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Типовой кузов ушёл через 20 секунд — до того, как он успел уйти в другой центр. Своё фото он прислал уже потом, посмотрев.</p>
        </div>

        <div style={{ display: "@@DC:d2@@", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#9A9A9A" }}>клиент открыл вашу ссылку</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              <span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "7px 13px", fontWeight: "500" }}>Сатин лагуна</span>
              <span style={{ fontSize: "12px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 13px", color: "#2E2E2E" }}>Диски чёрный мат</span>
              <span style={{ fontSize: "12px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 13px", color: "#2E2E2E" }}>Салон карбон</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round"><path d="M4 12l16-8-6 16-2.5-6z" /></svg>
              <span style={{ fontSize: "12.5px", color: "#2E2E2E" }}>Отправил в студию · +7 916 ···</span>
            </div>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Клиент пришёл в диалог уже с готовой конфигурацией и артикулами. Менеджеру осталось назвать срок.</p>
        </div>

        <div style={{ display: "@@DC:d3@@", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#F7F7F7", borderRadius: "18px 18px 18px 6px", padding: "15px 18px", alignSelf: "flex-start" }}>
            <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.4", color: "#2E2E2E" }}>Актуально?</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
            <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "9.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
            <span style={{ fontSize: "12.5px", color: "#2E2E2E" }}>Авито · объявление «Оклейка премиум»</span>
          </div>
          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Обращение с Авито в том же списке. Ответ ушёл в Авито, менеджер не выходил из кабинета.</p>
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

          <div style={{ display: "grid", gridTemplateColumns: "118px 1fr 1fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
            <span></span>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>День</span>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Пасмурно</span>
            <span style={{ fontSize: "9.5px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9A9A", textAlign: "center" }}>Паркинг</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "118px 1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Сатин чёрный оникс</span>
                <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>KPMF K75403</span>
                <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "3px" }}>286 400 ₽</span>
              </div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-sun.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-cloud.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-black-park.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "118px 1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                <span style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.2" }}>Матовый хаки</span>
                <span style={{ fontSize: "10px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>Avery SW-900 682</span>
                <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", marginTop: "3px" }}>254 700 ₽</span>
              </div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-sun.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-cloud.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
              <div style={{ borderRadius: "12px", overflow: "hidden", background: "#F0F0F0" }}><img src="/renders/light-olive-park.jpg" alt="" style={{ width: "100%", height: "82px", objectFit: "cover" }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "118px 1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
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
</div></>
  );
}

export function LandingBlock6(): ReactElement {
  return (
    <><div id="try" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "660px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>03 · Живое демо</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Померь на своей машине. Прямо здесь, без регистрации.</h2>
      </div>
      <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Это та же примерочная, которую ваши точки дают клиентам по своей ссылке. Клиент собирает конфигурацию сам, а в чат точки она приходит уже с артикулами и ценой.</p>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "26px", display: "grid", gridTemplateColumns: "1.5fr minmax(280px,.7fr)", gap: "20px" }}>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "0" }}>
        <div style={{ position: "relative", borderRadius: "26px", overflow: "hidden", background: "#111111", aspectRatio: "16/9" }}>
          <img src="/renders/wrap-01-silver.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }} />
          <img src="/renders/wrap-02-satin-black.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op1@@" }} />
          <img src="/renders/wrap-06-anthracite.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op2@@" }} />
          <img src="/renders/wrap-03-olive.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op3@@" }} />
          <img src="/renders/wrap-04-lagoon.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op4@@" }} />
          <img src="/renders/wrap-05-burgundy.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op5@@" }} />
          <img src="/renders/wrap-07-copper.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op6@@" }} />
          <img src="/renders/wrap-08-acid.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op7@@" }} />
          <img src="/renders/wrap-09-pearl.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: "@@DC:op8@@" }} />
          <div style={{ position: "absolute", left: "16px", right: "16px", top: "16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", gap: "6px", background: "rgba(17,17,17,.7)", backdropFilter: "blur(8px)", borderRadius: "999px", padding: "5px" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "8px 15px" }}>Плёнка</span>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#C4C4C4", padding: "8px 15px" }}>Диски</span>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#C4C4C4", padding: "8px 15px" }}>Салон</span>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#C4C4C4", padding: "8px 15px" }}>Обвес</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", borderRadius: "999px", padding: "8px 15px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#111111", whiteSpace: "nowrap" }}>3 бесплатные примерки в сутки</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
          &#123;/* sc-for */&#125;
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "999px", padding: "7px 15px 7px 7px", cursor: "pointer", boxShadow: "@@DC:c.ring@@" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "999px", flex: "none", background: "@@DC:c.hex@@", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }}></span>
              <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#2E2E2E", whiteSpace: "nowrap" }}>@@DC:c.short@@</span>
            </div>
          
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Ваша машина</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "999px", padding: "14px 18px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
            <span style={{ fontSize: "14px", color: "#2E2E2E", flex: "1" }}>Porsche 911 Carrera, 2021</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "20px", padding: "14px 16px", border: "1px dashed #D6D6D6" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M12 17V7M8 11l4-4 4 4" /><path d="M4 19h16" /></svg>
            <span style={{ fontSize: "13px", color: "#6E6E6E", lineHeight: "1.4" }}>или загрузите своё фото — можно вечернее и под углом</span>
          </div>
        </div>

        <div style={{ height: "1px", background: "#F0F0F0" }}></div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>@@DC:tryName@@</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "12.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>@@DC:trySku@@</span>
            <span style={{ fontSize: "12px", color: "#9A9A9A" }}>@@DC:tryFinish@@</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "26px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>
            <span>@@DC:tryPrice@@</span><span style={{ fontSize: "16px", marginLeft: "6px", color: "#9A9A9A" }}>@@DC:tryCur@@</span>
          </div>
          <span style={{ fontSize: "12px", color: "#6E6E6E" }}>под ключ, кузов без разбора · @@DC:tryStock@@</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#F5FBCB", borderRadius: "18px", padding: "13px 15px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
          <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Оттенок партии сверим с рулоном при вас на замере — образец приложим.</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
          <div style={{ background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "15px", textAlign: "center", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Отправить в студию</div>
          <a href="#card" style={{ display: "block", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "14px", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>Так это приходит в диалог точки</a>
        </div>
      </div>

    </div>
  </div>
</div></>
  );
}

export function LandingBlock7(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <h2 style={{ margin: "0", maxWidth: "680px", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Чат рисует похожую машину. CarSwap перекрашивает его.</h2>
      <p style={{ margin: "0", maxWidth: "430px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Загрузите одно и то же фото в бесплатный чат и сюда. В чате получится другая машина: пропадёт номер, изменятся диски, поедет форма фар — он рисует заново по описанию. У нас меняется только покрытие. Клиент должен узнать свою машину, иначе доказательства не существует.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ borderRadius: "22px", overflow: "hidden", background: "#F5F5F5" }}><img src="/renders/input-client-photo.jpg" alt="" style={{ width: "100%", height: "250px", objectFit: "cover" }} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "0 6px 6px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Исходное фото клиента</span>
          <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#2E2E2E" }}>Вечер, двор, машина под углом. Ровно то, что реально присылают.</span>
        </div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ borderRadius: "22px", overflow: "hidden", background: "#F5F5F5", position: "relative" }}>
          <img src="/renders/out-chat.jpg" alt="" style={{ width: "100%", height: "250px", objectFit: "cover" }} />
          <span style={{ position: "absolute", left: "14px", top: "14px", fontSize: "11px", fontWeight: "500", background: "#FBEEEF", color: "#8A4448", borderRadius: "999px", padding: "7px 13px" }}>другая машина</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "0 6px 6px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Бесплатный чат</span>
          <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#2E2E2E" }}>Номер пропал, диски дженерик, двор перерисован. Красиво — и отправить нельзя.</span>
        </div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ borderRadius: "22px", overflow: "hidden", background: "#F5F5F5", position: "relative" }}>
          <img src="/renders/out-carswap.jpg" alt="" style={{ width: "100%", height: "250px", objectFit: "cover" }} />
          <span style={{ position: "absolute", left: "14px", top: "14px", fontSize: "11px", fontWeight: "500", background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "7px 13px" }}>его машина</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "0 6px 6px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>CarSwap AI</span>
          <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#2E2E2E" }}>Номер, диски и двор те же. Изменено только покрытие — плюс артикул и ваша цена.</span>
        </div>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "8px 30px 26px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", padding: "22px 0", borderBottom: "1px solid #F0F0F0" }}>
        <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Другой номер · диски заменены на дженерик · форма зеркал изменилась · фон перерисован</span>
        <span style={{ fontSize: "14px", lineHeight: "1.5", textWrap: "pretty" }}>Номер тот же · диски те же · двор тот же · изменено только покрытие</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", padding: "22px 0", borderBottom: "1px solid #F0F0F0" }}>
        <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Оттенок «похожий зелёный» — артикула не существует</span>
        <span style={{ fontSize: "14px", lineHeight: "1.5", textWrap: "pretty" }}>Артикул KPMF K75427, есть на складе точки, 268 300 ₽ по её прайсу</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", padding: "22px 0", borderBottom: "1px solid #F0F0F0" }}>
        <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Один вариант за запрос, 5–8 действий, надо выйти из мессенджера</span>
        <span style={{ fontSize: "14px", lineHeight: "1.5", textWrap: "pretty" }}>Три артикула × три световых условия за одну отправку, не выходя из диалога</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", padding: "22px 0" }}>
        <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Оговорку про свет надо написать самому — и никто её не пишет</span>
        <span style={{ fontSize: "14px", lineHeight: "1.5", textWrap: "pretty" }}>Оговорка уходит всегда и отключить её нельзя</span>
      </div>
    </div>

    <p style={{ margin: "0", fontSize: "clamp(17px,1.5vw,22px)", lineHeight: "1.35", fontWeight: "500", letterSpacing: "-0.02em", maxWidth: "620px", textWrap: "balance" }}>Оба изображения красивые. Отправить клиенту можно только одно.</p>
  </div>
</div></>
  );
}

export function LandingBlock8(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Узнаёшь себя?</h2>
      <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Если хотя бы две строки из твоей колонки — про тебя, дальше можно не читать, а померить.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты владелец точки?</span>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Свёл месяц: обращений сорок, сделок четыре, реклама шестьдесят тысяч</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Знаешь, что менеджеры отвечают «от 200 тысяч, приезжайте на замер» — и на этом всё</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Платишь за CRM, в которой поле «источник» заполнено дай бог в половине сделок</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Считал, во сколько тебе обошлась последняя переклейка, и решил больше не считать</span></label>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты за приёмкой?</span>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Третий раз за смену объясняешь словами разницу между сатином и матом</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Видишь «прочитано» и понимаешь, что он сейчас пишет в соседний центр</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Отправляешь фото чужой машины из папки «примеры работ» и надеешься, что похоже</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Просишь фото — и клиент пропадает на два дня</span></label>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты у поста?</span>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Слышал «на картинке было ярче» и не смог ничего ответить</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Начинал оклейку и на середине понял, что артикул на рулоне не тот, что назвали клиенту</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Переклеивал за свой счёт то, что сдал нормально</span></label>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input type="checkbox" /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Держишь в голове, какая партия чуть темнее, и никому не можешь этого показать</span></label>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "#111111", borderRadius: "32px", padding: "26px 30px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>@@DC:tickLabel@@</span>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", color: "#FFFFFF", textWrap: "pretty" }}>@@DC:tickLine@@</span>
      </div>
      <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "15px 28px", fontSize: "14px", fontWeight: "500", flex: "none" }}>Посмотрим на вашей точке · 15 минут</a>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock9(): ReactElement {
  return (
    <><div id="features" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "640px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>04 · Возможности</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Что вы получаете</h2>
      </div>
      <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Каждая строка привязана к работе и к измеримому уровню. Прилагательных здесь нет.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Все каналы в одном списке</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 13px 6px 6px" }}><span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>WA</span><span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>WhatsApp</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 13px 6px 6px" }}><span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#3A6B8F", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>TG</span><span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>Telegram</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 13px 6px 6px" }}><span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#5B4B8A", color: "#FFFFFF", fontSize: "8px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>MAX</span><span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>MAX</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#F5F5F5", borderRadius: "999px", padding: "6px 13px 6px 6px" }}><span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>AV</span><span style={{ fontSize: "11.5px", color: "#2E2E2E" }}>Авито</span></div>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Обращение приходит само, менеджер не заходит на Авито отвечать.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>Ответ уходит в тот канал, откуда пришёл</span>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Примерка прямо в диалоге</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", background: "#F5F5F5", borderRadius: "999px", padding: "5px" }}>
          <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#111111", borderRadius: "999px", padding: "10px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="4.2" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" /></svg>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF" }}>День</span>
          </div>
          <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M6.5 18h11a4 4 0 000-8 6 6 0 00-11.6 1.6A3.2 3.2 0 006.5 18z" /></svg>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E" }}>Пасмурно</span>
          </div>
          <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M4 9l8-5 8 5" /><path d="M12 11v9" /><path d="M8 20h8" /></svg>
            <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E" }}>Паркинг</span>
          </div>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Три артикула, три световых условия, одна отправка. Порядок фиксирован, тумблера отключения нет.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>≤3 минуты · ≤3 действия · 0 выходов из диалога</span>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Артикул и цена вшиты в картинку</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
          <div style={{ background: "#DEF23B", borderRadius: "18px", padding: "11px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ height: "56px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/light-lagoon-sun.jpg" alt="" style={{ width: "100%", height: "56px", objectFit: "cover" }} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Сатин лагуна</span>
              <span style={{ fontSize: "10px", opacity: ".6" }}>K75427</span>
              <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px" }}>268<span style={{ opacity: ".55" }}> 300 ₽</span></span>
            </div>
          </div>
          <div style={{ background: "#F5F5F5", borderRadius: "18px", padding: "11px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ height: "56px", borderRadius: "12px", overflow: "hidden" }}><img src="/renders/light-olive-sun.jpg" alt="" style={{ width: "100%", height: "56px", objectFit: "cover" }} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", lineHeight: "1.2" }}>Матовый хаки</span>
              <span style={{ fontSize: "10px", color: "#9A9A9A" }}>SW-900 682</span>
              <span style={{ fontSize: "13.5px", fontWeight: "500", letterSpacing: "-0.02em", marginTop: "2px" }}>254<span style={{ color: "#9A9A9A" }}> 700 ₽</span></span>
            </div>
          </div>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Из прайса вашей точки, на уровне генерации.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>0 символов ручного ввода</span>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Примерочная по вашей ссылке</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F5F5F5", borderRadius: "999px", padding: "12px 16px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M9 15l6-6" /><path d="M11 6l1.5-1.5a4 4 0 015.7 5.7L16.5 12" /><path d="M13 18l-1.5 1.5a4 4 0 01-5.7-5.7L7.5 12" /></svg>
          <span style={{ fontSize: "13px", color: "#2E2E2E", flex: "1", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>carswap.ai/az-detailing</span>
          <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 10px" }}>ваш логотип</span>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Клиент сам меряет плёнку, диски, салон и обвес и присылает готовую конфигурацию.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>0 полей регистрации до первой примерки</span>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Подтверждение выбора для поста</span>
        <div style={{ display: "flex", alignItems: "center", gap: "13px", background: "#111111", borderRadius: "20px", padding: "16px 18px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>26 августа, 14:32 · KPMF K75427</span>
          </div>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Артикул, картинка и отметка с датой — его выбор, не наша запись.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>≤30 секунд с телефона у поста, два тапа</span>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <span style={{ fontSize: "16.5px", fontWeight: "500", letterSpacing: "-0.02em" }}>Недельная сводка владельцу</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", width: "9px" }}>1</span>
            <span style={{ fontSize: "13px", flex: "1" }}>Артём Л.</span>
            <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>268 300 ₽</span>
            <span style={{ width: "9px", height: "9px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", width: "9px" }}>2</span>
            <span style={{ fontSize: "13px", flex: "1" }}>Сергей П.</span>
            <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>286 400 ₽</span>
            <span style={{ width: "9px", height: "9px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10.5px", color: "#C4C4C4", width: "9px" }}>3</span>
            <span style={{ fontSize: "13px", flex: "1", color: "#6E6E6E" }}>Марина К.</span>
            <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "#6E6E6E" }}>254 700 ₽</span>
            <span style={{ width: "9px", height: "9px", borderRadius: "999px", background: "#EFEFEF", flex: "none" }}></span>
          </div>
        </div>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Поимённые сделки с признаком «цвет выбран по примерке». Список с суммами, а не дашборд с графиками.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F5FBCB", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%" }}>первая сводка — на 7-й день</span>
      </div>

    </div>
  </div>
</div></>
  );
}

export function LandingBlock10(): ReactElement {
  return (
    <><div id="how" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "640px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>05 · Как это работает</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Четыре шага. Первые два делаем мы, на третьем менеджер уже отправляет.</h2>
      </div>
      <p style={{ margin: "0", maxWidth: "380px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Это включение, а не внедрение: ни прайс-листов, ни шаблонов документов, ни схем лояльности настраивать не нужно.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>01</span>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", textWrap: "pretty" }}>Подключаем каналы</span>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>WhatsApp, Telegram, MAX и Авито заводим мы, на нашей стороне.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%", marginTop: "auto" }}>~30 минут · от вас доступ</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>02</span>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", textWrap: "pretty" }}>Загружаем ваш прайс</span>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Присылаете прайс в любом виде, артикулы и цены заводим мы.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%", marginTop: "auto" }}>в тот же день · 0 ручного ввода</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>03</span>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", textWrap: "pretty" }}>Менеджер открывает диалог и отправляет</span>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Без обучения, без инструкции, первая отправка вместе с нами.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%", marginTop: "auto" }}>первая примерка — в первые сутки</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", color: "#9A9A9A" }}>04</span>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", textWrap: "pretty" }}>На седьмой день приходит сводка</span>
        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Сколько примерок ушло, сколько клиентов ответили, какие сделки закрылись.</p>
        <span style={{ fontSize: "12.5px", fontWeight: "500", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", width: "fit-content", maxWidth: "100%", marginTop: "auto" }}>0 занятий · 0 обязательных импортов</span>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>Что делаете вы</span>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#111111", flex: "none" }}></span><span style={{ fontSize: "14px" }}>Даёте доступ к каналам</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#111111", flex: "none" }}></span><span style={{ fontSize: "14px" }}>Присылаете прайс в любом виде</span></div>
        <div style={{ height: "78px", borderRadius: "20px", background: "#F7F7F7", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>дальше пусто</span>
        </div>
      </div>
      <div style={{ background: "#111111", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>Что делаем мы</span>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "14px", color: "#FFFFFF" }}>Подключение WhatsApp, Telegram, MAX и Авито</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "14px", color: "#FFFFFF" }}>Заводим артикулы и цены из вашего прайса</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "14px", color: "#FFFFFF" }}>Ведём первую отправку вместе с менеджером</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "14px", color: "#FFFFFF" }}>Настраиваем брендирование карточек</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span><span style={{ fontSize: "14px", color: "#FFFFFF" }}>Присылаем сводку на 7-й день</span></div>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock11(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Что изменится</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", color: "#6E6E6E" }}>Ты перестанешь</span>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>объяснять словами разницу оттенков по третьему разу за смену</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>отправлять фото чужой машины и надеяться, что похоже</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>заходить на Авито отдельно, чтобы ответить</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>узнавать на выдаче, что клиент представлял себе другое</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>платить за переклейку, которую сдал нормально</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: "3px" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5", color: "#6E6E6E" }}>ходить и напоминать менеджерам, чтобы вели заявки</span></div>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты начнёшь</span>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>отвечать картинкой его машины через три минуты после «сколько стоит»</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>видеть, кто из написавших вернулся с вопросом «а можно ещё в этом?»</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>закрывать спор у поста за тридцать секунд, а не переклейкой</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>знать поимённо, какие сделки пришли через примерку</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>показывать клиенту три варианта там, где раньше показывал один</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "3px" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "14.5px", lineHeight: "1.5" }}>считать конверсию входящего в замер, а не «сколько-то там»</span></div>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock12(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>А если…</h2>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "12px 30px 18px", display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A", padding: "18px 0 6px" }}>Про вашу работу</span>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если цвет на выдаче окажется не тот?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Строка про сверку оттенка на замере уходит с каждой карточкой, отключить её нельзя ни менеджеру, ни вам, ни сети. Мы не обещаем совпадение цвета — плёнка играет от партии к партии, и веер в этом честнее любого экрана. Мы делаем так, чтобы клиент знал это до того, как согласился, и подтвердил выбор сам, с датой.</p>
        </details>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если менеджер начнёт отправлять что попало?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Отправить примерку без артикула из вашего прайса и без вашей цены нельзя технически: они впечатаны на уровне генерации.</p>
        </details>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если клиенты станут ходить мерить и не покупать?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Примерка приходит к вам в диалог вместе с телефоном и конфигурацией. Это не потерянный клиент, а заявка, которая пришла с готовым выбором.</p>
        </details>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "12px 30px 18px", display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A", padding: "18px 0 6px" }}>Про нас</span>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если это опять внедрение на месяц?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Каналы и прайс заводим мы. Обучения нет, миграции нет: ноль обязательных импортов, чтобы начать. Если через час после старта у вас не ушла первая примерка — это наша недоработка, а не ваша.</p>
        </details>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если менеджеры не будут этим пользоваться?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Они не заполняют CRM, потому что она нужна вам, а не им. Примерку они отправляют, потому что она закрывает их собственную боль — им нечем показать цвет прямо сейчас. Если на четвёртой неделе меньше 70% входящих получили примерку без ваших напоминаний, инструмент не сработал, и это видно в сводке, а не через полгода.</p>
        </details>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если я перестану платить — что с данными?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>История клиентов, примерок и подтверждений выгружается целиком, в открытом формате.</p>
        </details>
        <details style={{ borderTop: "1px solid #F0F0F0" }}>
          <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>«А если сломается посреди смены?»</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
          <p style={{ margin: "0", padding: "0 0 20px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Обращения продолжают приходить и на них можно отвечать текстом, даже когда генерация недоступна: примерка деградирует до «сейчас пришлю», а не до пустого экрана.</p>
        </details>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock13(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Почему мы, а не…</h2>
      <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Ваш реальный набор сравнения состоит не из конкурентов-визуализаторов, а из «ничего не делать» и «сделать бесплатно». Разбираем именно его.</p>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "8px 30px 18px", display: "flex", flexDirection: "column" }}>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>01</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«Ничего не менять, у нас и так продаётся»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>0 ₽ · клиент ушёл</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Продаётся. Вопрос в том, какой ценой: заявка стоит вам 67–162 ₽, а половина переписок кончается на «я подумаю» — и вы даже не знаете, о чём. Мы не про новые заявки. Мы про те, за которые вы уже заплатили.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>02</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«Отправим фото чужой машины из папки "примеры работ"»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>0 ₽ · чужая машина</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Так и делают все. Клиент смотрит на чужой Мерседес и додумывает свою машину — а на выдаче выясняется, что додумал он не то. Плюс он видел ровно этот же приём в двух соседних студиях сегодня.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>03</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«Попрошу нейросеть перекрасить, это бесплатно»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>2 ₽ · не отправишь</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Пробовали — получается другая машина: пропадает номер, меняются диски. Оттенок называется «похожий зелёный», артикула у него нет, цены вашей нет. Пять-восемь действий, выход из мессенджера, и оговорку про свет вы напишете сами ровно никогда. Отправлять клиенту это нельзя — и вы это знаете, поэтому и не отправляете.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>04</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«У нас есть веер и демо-панели»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>есть · только на замере</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>И правильно, что есть — веер честнее любого экрана, и мы его не заменяем. Только веер работает, когда клиент уже приехал. А теряете вы его в переписке, за два дня до приезда.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>05</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«У нас уже CRM за полторы тысячи»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>1 495 ₽/мес · другая работа</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>И пусть остаётся: заказ-наряды, склад и зарплата — её работа, мы туда не лезем. Ни одна CRM для автосервиса не показывает клиенту его машину в вашем артикуле. Это разные строки расхода, а не выбор из двух.</p>
      </details>
      <details>
        <summary style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px 0" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#9A9A9A", width: "20px", flex: "none" }}>06</span>
          <span style={{ fontSize: "clamp(17px,1.5vw,21px)", fontWeight: "500", letterSpacing: "-0.025em", flex: "1", textWrap: "pretty" }}>«Возьму фрилансера, он отрисует в фотошопе»</span>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#6E6E6E", background: "#F7F7F7", borderRadius: "999px", padding: "8px 14px", flex: "none", whiteSpace: "nowrap" }}>от 1 000 ₽ · часы</span>
          <svg className="csChev" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg>
        </summary>
        <p style={{ margin: "0", padding: "0 0 24px 40px", maxWidth: "820px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>От тысячи за картинку и от нескольких часов ожидания. Клиент в переписке живёт минуты, не часы. И артикул фрилансер поставит тот, который вы ему продиктуете — то есть руками.</p>
      </details>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock14(): ReactElement {
  return (
    <><div id="network" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
    <div style={{ background: "#0B0B0C", borderRadius: "40px", padding: "52px", display: "flex", flexDirection: "column", gap: "36px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>06 · Для сетей и франшиз</span>
          <h2 style={{ margin: "0", fontSize: "clamp(26px,3.1vw,46px)", lineHeight: "1.03", fontWeight: "500", letterSpacing: "-0.04em", color: "#FFFFFF", textWrap: "balance" }}>Точке — инструмент. Сети — то, чего нет у конкурирующих франшиз.</h2>
        </div>
        <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#9A9A9A", textWrap: "pretty" }}>Ваши точки конкурируют за один и тот же поток входящих. Ваши рычаги влияния на конверсию точки заканчиваются на регламенте. Это рычаг, который работает внутри смены менеджера, а не в отчёте.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "26px", padding: "26px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", color: "#FFFFFF" }}>Точка не купит это мимо вас</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Примерочная привязана к сети: артикулы, цены и брендирование — ваши. Отдельной подписки для точки не существует.</span>
        </div>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "26px", padding: "26px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", color: "#FFFFFF" }}>Ноль обращений в управляющую компанию</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Каналы и прайс заводим мы. Обучения нет. Поддержка идёт напрямую к нам, а не через вашего менеджера — считаем обращения на точку за первый месяц и показываем вам счёт.</span>
        </div>
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "26px", padding: "26px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", color: "#FFFFFF" }}>На комитете вы показываете сделки, а не «активацию»</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#9A9A9A", textWrap: "pretty" }}>Поимённый список: клиент, точка, артикул, дата, сумма, признак «цвет выбран по примерке».</span>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "26px", padding: "26px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", color: "#111111" }}>Пилот — пять точек, первый месяц бесплатно</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#111111", opacity: ".72", textWrap: "pretty" }}>Условие успеха фиксируем заранее: ≥60% точек имеют хотя бы одну сделку через примерку за квартал. Не вышло — расходимся, вы ничего не объясняете партнёрам.</span>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Кабинет сети · неделя 34</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>312</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>примерок</span></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>96</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>ответов клиентов</span></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>14</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>сделок по примерке</span></div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "12px 0", borderBottom: "1px solid #F0F0F0" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Точка</span>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Примерки</span>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Ответы</span>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Сделки по примерке</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "14px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Автозаводская</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>84</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>31</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>5</span><span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px", fontWeight: "500" }}>1 342 000 ₽</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "14px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Сколково</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>71</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>24</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>4</span><span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px", fontWeight: "500" }}>1 074 000 ₽</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "14px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Химки</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>63</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>19</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>3</span><span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px", fontWeight: "500" }}>793 000 ₽</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "14px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>Казань</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>58</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>15</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>2</span><span style={{ fontSize: "12px", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px", fontWeight: "500" }}>521 000 ₽</span></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "16px", padding: "14px 0", alignItems: "center" }}>
            <span style={{ fontSize: "14px", color: "#6E6E6E" }}>Екатеринбург</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums", color: "#6E6E6E" }}>36</span>
            <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums", color: "#6E6E6E" }}>7</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums", color: "#6E6E6E" }}>0</span><span style={{ fontSize: "12px", color: "#9A9A9A", background: "#F7F7F7", borderRadius: "999px", padding: "4px 10px", backgroundImage: "repeating-linear-gradient(115deg,#E8E8E8 0 1px,transparent 1px 5px)" }}>нет данных</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
        <p style={{ margin: "0", maxWidth: "620px", fontSize: "14px", lineHeight: "1.55", color: "#9A9A9A", textWrap: "pretty" }}>Референсов в вашей отрасли у нас пока нет — и мы это проговариваем вслух, а не подставляем «студию из Москвы» без названия.</p>
        <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500", flex: "none" }}>Обсудить пилот на 5 точках</a>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock15(): ReactElement {
  return (
    <><div id="pricing" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>07 · Тарифы</span>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Первый месяц бесплатно. Карту не спрашиваем.</h2>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px", alignItems: "start" }}>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", gap: "22px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Примерочная</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em" }}>0</span><span style={{ fontSize: "17px", color: "#9A9A9A" }}>₽</span></div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Публичная примерка по вашей ссылке</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Плёнка, диски, салон, обвес</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Ваш логотип на карточках</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Конфигурация приходит вам в чат</span>
        </div>
        <a href="#try" style={{ display: "block", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "14px", textAlign: "center", fontSize: "14px", fontWeight: "500", marginTop: "auto" }}>Забрать ссылку</a>
      </div>

      <div style={{ background: "#111111", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", gap: "22px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", color: "#FFFFFF" }}>Точка</span>
            <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "6px 12px" }}>первый месяц 0 ₽</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", color: "#FFFFFF" }}>10 000</span><span style={{ fontSize: "17px", color: "#8E8E8E" }}>₽/мес</span></div>
        </div>
        <div style={{ height: "1px", background: "rgba(255,255,255,.12)" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#DEF23B" }}>Всё из примерочной</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Все каналы в одном списке</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Примерка в диалоге, артикул и цена из прайса</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Подтверждение выбора для поста</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Недельная сводка владельцу</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Столько менеджеров, сколько нужно</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#E8E8E8" }}>Подключение и загрузка прайса — наша работа</span>
        </div>
        <a href="#demo" style={{ display: "block", background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "15px", textAlign: "center", fontSize: "14px", fontWeight: "500", marginTop: "auto" }}>Подключить точку</a>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "32px", display: "flex", flexDirection: "column", gap: "22px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Сеть</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}><span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em" }}>по договору</span></div>
        </div>
        <div style={{ height: "1px", background: "#F0F0F0" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Всё из «Точки» на каждой точке</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Кабинет сети со сводкой по всем точкам</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Единый каталог артикулов и цен сети</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Невозможность подключения точки мимо сети</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Пилот 5 точек, первый месяц бесплатно</span>
          <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Выделенный канал поддержки</span>
        </div>
        <a href="#demo" style={{ display: "block", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "14px", textAlign: "center", fontSize: "14px", fontWeight: "500", marginTop: "auto" }}>Обсудить пилот</a>
      </div>

    </div>

    <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", maxWidth: "900px", textWrap: "pretty" }}>Без доплаты за второго менеджера, за чат-бота и за подключение. Единственное, что считается отдельно — подключение WhatsApp через шлюз оператора, если он вам нужен; Telegram, MAX и Авито входят в тариф.</p>
  </div>
</div></>
  );
}

export function LandingBlock16(): ReactElement {
  return (
    <><div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(240px,.5fr) 1.5fr", gap: "40px" }}>
    <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Вопросы</h2>
    <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "8px 30px 18px", display: "flex", flexDirection: "column" }}>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>У нас в основном прозрачная защита, цветной оклейки мало</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Тогда пока не берите. Инструмент окупается там, где клиенту нужно выбрать из чего-то — на прозрачной плёнке выбирать нечего.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Сколько времени от решения до первой отправленной примерки?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Час, включая загрузку прайса. Каналы и прайс заводим мы.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Надо ли учить менеджеров?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Нет. Первый успешный сценарий менеджер проходит без инструкции — если не проходит, это наша ошибка в интерфейсе.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Что с фотографиями клиентов?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Фото клиента используется только для его примерки и хранится в карточке этого клиента у вашей точки. Мы не публикуем и не передаём их.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Вы гарантируете, что цвет совпадёт?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Нет, и никто не гарантирует. Оттенок партии сверяется на замере — это написано в каждой карточке, которую получает ваш клиент.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Мы уже платим за CRM. Придётся переезжать?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Нет. Ничего переносить не нужно, ноль обязательных импортов.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>А если мы хотим только примерочную для клиентов?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Берите её отдельно, она бесплатна. Обращения будут приходить туда, куда приходят сейчас.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Работает на Авито?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Обращения приходят и ответ уходит обратно в Авито.</p>
      </details>
      <details style={{ borderBottom: "1px solid #F0F0F0" }}>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Сколько машин можно померить?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>В тарифе «Точка» — без ограничения по числу примерок.</p>
      </details>
      <details>
        <summary style={{ display: "flex", alignItems: "center", gap: "16px", padding: "22px 0" }}><span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em", flex: "1", textWrap: "pretty" }}>Мы сеть. Можно посмотреть на одной точке?</span><svg className="csChev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", transition: "transform .22s" }}><path d="M7 10l5 5 5-5" /></svg></summary>
        <p style={{ margin: "0", padding: "0 0 22px", fontSize: "14px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Да, пилот на пяти точках, первый месяц бесплатно, условие успеха фиксируем заранее.</p>
      </details>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock17(): ReactElement {
  return (
    <><div id="demo" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
    <div style={{ background: "#0B0B0C", borderRadius: "40px", padding: "56px", display: "grid", gridTemplateColumns: "1.25fr minmax(300px,.75fr)", gap: "44px", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <h2 style={{ margin: "0", fontSize: "clamp(28px,3.3vw,48px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", color: "#FFFFFF", textWrap: "balance" }}>Покажем на вашей точке. Пришлите прайс — соберём примерку на вашей машине.</h2>
        <p style={{ margin: "0", maxWidth: "540px", fontSize: "15px", lineHeight: "1.55", color: "#9A9A9A", textWrap: "pretty" }}>Пятнадцать минут, без презентации. Показываем инбокс, собираем одну примерку из вашего прайса и отправляем в ваш же WhatsApp — дальше решаете сами.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500" }}>Записаться на демо</a>
          <a href="#try" style={{ background: "rgba(255,255,255,.1)", color: "#FFFFFF", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500" }}>Сначала померить самому</a>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>Что будет на демо</span>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "7px" }}></span><span style={{ fontSize: "14px", lineHeight: "1.5", color: "#E8E8E8" }}>Смотрим ваш последний месяц: обращений, сделок, где обрываются переписки</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "7px" }}></span><span style={{ fontSize: "14px", lineHeight: "1.5", color: "#E8E8E8" }}>Собираем одну примерку из вашего прайса, на вашей машине</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px" }}><span style={{ width: "7px", height: "7px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "7px" }}></span><span style={{ fontSize: "14px", lineHeight: "1.5", color: "#E8E8E8" }}>Считаем порог: сколько сделок в квартал окупают подписку у вас</span></div>
      </div>
    </div>
  </div>
</div></>
  );
}

export function LandingBlock18(): ReactElement {
  return (
    <><div style={{ padding: "80px 22px 40px", background: "#EFEFEF" }}>
  <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "44px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1.4fr", gap: "32px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "10px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="4.2" /></svg>
          </div>
          <span style={{ fontSize: "16.5px", fontWeight: "600", letterSpacing: "-0.025em" }}>CarSwap AI</span>
        </div>
        <p style={{ margin: "0", maxWidth: "280px", fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E", textWrap: "pretty" }}>Рабочее место точки детейлинга: заявки из всех каналов в одном списке, примерка на машине клиента прямо в диалоге.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A", marginBottom: "3px" }}>Продукт</span>
        <a href="#features" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Инбокс</a>
        <a href="#card" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Примерка в диалоге</a>
        <a href="#try" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Примерочная</a>
        <a href="#features" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Подтверждение выбора</a>
        <a href="#features" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Сводка владельцу</a>
        <a href="#network" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Кабинет сети</a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A", marginBottom: "3px" }}>Материалы</span>
        <a href="#" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Как считать потерю заявок</a>
        <a href="#" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Гайд по подбору оттенка</a>
        <a href="#" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Changelog</a>
        <a href="#" style={{ fontSize: "13.5px", color: "#2E2E2E" }}>Вопросы</a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A", marginBottom: "3px" }}>Если пока не готовы говорить</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", borderRadius: "999px", padding: "6px 6px 6px 20px" }}>
          <span style={{ fontSize: "14px", color: "#9A9A9A", flex: "1" }}>Почта</span>
          <div style={{ background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "12px 22px", fontSize: "13.5px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }}>Оставить</div>
        </div>
        <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#9A9A9A" }}>Пришлём разбор «куда уходят заявки в детейлинге» — на одной реальной точке, с цифрами.</span>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", borderTop: "1px solid #DCDCDC", paddingTop: "22px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", color: "#9A9A9A" }}>© 2026 CarSwap AI</span>
      <div style={{ display: "flex", gap: "24px" }}>
        <a href="#" style={{ fontSize: "12px", color: "#9A9A9A" }}>О нас</a>
        <a href="#" style={{ fontSize: "12px", color: "#9A9A9A" }}>Контакты</a>
        <a href="#" style={{ fontSize: "12px", color: "#9A9A9A" }}>Обработка данных</a>
        <a href="#" style={{ fontSize: "12px", color: "#9A9A9A" }}>Условия</a>
      </div>
    </div>
  </div>
</div></>
  );
}

export const LandingBlocks = [LandingBlock0, LandingBlock1, LandingBlock2, LandingBlock3, LandingBlock4, LandingBlock5, LandingBlock6, LandingBlock7, LandingBlock8, LandingBlock9, LandingBlock10, LandingBlock11, LandingBlock12, LandingBlock13, LandingBlock14, LandingBlock15, LandingBlock16, LandingBlock17, LandingBlock18];
export const LandingCanvas = { fontFamily: "Onest,system-ui,sans-serif", color: "#111111", background: "#EFEFEF" } as React.CSSProperties;
