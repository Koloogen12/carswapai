'use client';

/* Блок 1 хендоффа — герой с фоновым видео.
 *
 * Видео: muted + loop + playsinline + autoplay И принудительный play() из
 * эффекта. Атрибута autoplay недостаточно — часть браузеров стартует только
 * у muted-элемента и только после явного вызова. Промис play() обязательно
 * с .catch(): без него Safari бросает необработанное отклонение.
 *
 * Разметка — из design/design/landing.dc.html, пиксели править нельзя.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { posterOnly, showPilotBadge } from './films';

export function Hero(): ReactElement {
  const video = useRef<HTMLVideoElement>(null);
  /* Уважаем prefers-reduced-motion: там герой остаётся постером. */
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    if (posterOnly || reduced) {
      v.pause();
      v.currentTime = 0;
      return;
    }
    const p = v.play();
    /* .catch() обязателен, см. шапку файла. */
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [reduced]);

  return (
    <>
      <div className="cs-hero" data-screen-label="Герой" style={{ position: "relative", height: "100vh", background: "#0B0B0C", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: "0", overflow: "hidden", background: "#0B0B0C" }}>

          <video ref={video} aria-hidden="true" data-hero-video="1" src="/renders/hero-pov.mp4" poster="/renders/hero-poster.jpg" autoPlay={true} muted={true} loop={true} playsInline={true} preload="auto" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }}></video>

          <div className="cs-hero-shade" style={{ position: "absolute", inset: "0", background: "linear-gradient(90deg,rgba(11,11,12,.96) 0%,rgba(11,11,12,.9) 27%,rgba(11,11,12,.42) 58%,rgba(11,11,12,.05) 80%)" }}></div>
          <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(11,11,12,.72) 0%,rgba(11,11,12,0) 20%,rgba(11,11,12,0) 60%,rgba(11,11,12,.76) 100%)" }}></div>

          <div className="cs-hero-pad" style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", padding: "100px 40px 96px" }}>
            <div className="cs-hero-col" style={{ maxWidth: "min(47vw,640px)", maxHeight: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "clamp(9px,1.8vh,26px)" }}>

              {/* Плашка пилотов выключена флагом: точек-пилотов пока нет. */}
              {showPilotBadge && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,.08)", borderRadius: "999px", padding: "6px 16px 6px 6px", width: "fit-content", maxWidth: "100%" }}>
                  <div style={{ display: "flex" }}>
                    <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#DEF23B", boxShadow: "0 0 0 2px #0B0B0C" }}></span>
                    <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#6E6E4C", boxShadow: "0 0 0 2px #0B0B0C", marginLeft: "-9px" }}></span>
                    <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#1F6C80", boxShadow: "0 0 0 2px #0B0B0C", marginLeft: "-9px" }}></span>
                  </div>
                  <span style={{ fontSize: "12.5px", color: "#E8E8E8" }}>Три точки-пилота уже в работе</span>
                </div>
              )}

              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.14em", textTransform: "uppercase", color: "#DEF23B", textWrap: "balance" }}>Для студий, где цветную оклейку продают в переписке</span>

              <h1 style={{ margin: "0", fontSize: "clamp(30px,calc(2vw + 2.1vh),76px)", lineHeight: ".98", fontWeight: "500", letterSpacing: "-0.045em", textWrap: "balance", color: "#FFFFFF" }}>Покажи цвет на его машине, <span style={{ color: "#DEF23B" }}>пока он ещё в диалоге</span></h1>

              <p style={{ margin: "0", maxWidth: "470px", fontSize: "clamp(12.5px,1.6vh,16px)", lineHeight: "1.45", color: "#B4B4B4", textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical", overflow: "hidden" }}>Заявки из WhatsApp, Telegram, MAX и Авито приходят в один список. Открываешь диалог, собираешь примерку прямо в нём и отправляешь одним действием: его машина, артикул из твоего прайса, твоя цена. Три минуты вместо получаса объяснений словами.</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <a className="cs-btn-primary" href="#demo-form" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "clamp(12px,1.7vh,15px) 28px", fontSize: "14px", fontWeight: "500" }}>Записаться на демо · 15 минут</a>
                <a className="cs-btn-ghost" href="#try" style={{ background: "rgba(255,255,255,.1)", color: "#FFFFFF", borderRadius: "999px", padding: "clamp(12px,1.7vh,15px) 28px", fontSize: "14px", fontWeight: "500" }}>Померить на своей машине</a>
              </div>
            </div>
          </div>

          <div className="cs-hero-foot" style={{ position: "absolute", left: "40px", bottom: "30px", right: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12.5px", color: "#8E8E8E", textWrap: "pretty" }}>Один кадр, без монтажа. Плёнка — из прайса точки, а не из палитры нейросети.</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,.08)", borderRadius: "999px", padding: "8px 16px 8px 10px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
              <span style={{ fontSize: "12px", color: "#C4C4C4", whiteSpace: "nowrap" }}>Porsche 911 · фото клиента из двора</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
