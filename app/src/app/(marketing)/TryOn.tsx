'use client';

/* Блок 4 хендоффа — «03 · Живое демо», примерочная.
 *
 * Механика: девять чипов плёнок, тап меняет изображение машины и карточку
 * артикула. Изображения лежат стопкой с абсолютным позиционированием, у
 * выбранного opacity:1, у остальных 0 — так переключение мгновенное и без
 * мигания, как в прототипе. Хендоф допускает замену стопки на один <img>
 * со сменой src; тогда переход по opacity из спецификации теряется, поэтому
 * стопку оставили. Цена этого решения — девять картинок ниже первого экрана.
 *
 * FILMS — демо-данные лендинга. В продукте прайс и наличие приходят от точки.
 *
 * Разметка — из design/design/landing.dc.html, пиксели править нельзя.
 */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { FILMS, FILM_START } from './films';

export function TryOn(): ReactElement {
  const [film, setFilm] = useState(FILM_START);
  const f = FILMS[film] ?? FILMS[FILM_START];

  /* Отложенная предзагрузка из хендоффа: 900 мс после монтирования, чтобы
   * первое переключение было мгновенным и не мешало первой отрисовке. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      FILMS.forEach((c) => {
        const img = new Image();
        img.src = c.img;
        if (img.decode) img.decode().catch(() => {});
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <div id="try" style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "660px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>03 · Живое демо</span>
              <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em", textWrap: "balance" }}>Померь на своей машине. Прямо здесь, без регистрации.</h2>
            </div>
            <p style={{ margin: "0", maxWidth: "420px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Это та же примерочная, которую ваши точки дают клиентам по своей ссылке. Клиент собирает конфигурацию сам, а в чат точки она приходит уже с артикулами и ценой.</p>
          </div>

          <div className="cs-g2" style={{ background: "#FFFFFF", borderRadius: "32px", padding: "26px", display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(280px,.7fr)", gap: "20px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "0" }}>
              <div style={{ position: "relative", borderRadius: "26px", overflow: "hidden", background: "#111111", aspectRatio: "16/9" }}>
                <img src="/renders/wrap-01-silver.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }} />
                <img className="cs-film-layer" src="/renders/wrap-02-satin-black.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 1 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-06-anthracite.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 2 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-03-olive.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 3 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-04-lagoon.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 4 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-05-burgundy.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 5 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-07-copper.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 6 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-08-acid.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 7 ? 1 : 0 }} />
                <img className="cs-film-layer" src="/renders/wrap-09-pearl.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: film === 8 ? 1 : 0 }} />
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
                {FILMS.map((c, i) => (
                  <div
                    key={c.sku}
                    className="cs-chip"
                    role="button"
                    aria-pressed={i === film}
                    aria-label={`Плёнка: ${c.name}`}
                    tabIndex={0}
                    onClick={() => setFilm(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFilm(i);
                      }
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "999px", padding: "7px 15px 7px 7px", cursor: "pointer", boxShadow: i === film ? "inset 0 0 0 1.5px #111111" : "none" }}
                  >
                    <span style={{ width: "24px", height: "24px", borderRadius: "999px", flex: "none", background: c.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }}></span>
                    <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#2E2E2E", whiteSpace: "nowrap" }}>{c.short}</span>
                  </div>
                ))}
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
                <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>{f.name}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{ fontSize: "12.5px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>{f.sku}</span>
                  <span style={{ fontSize: "12px", color: "#9A9A9A" }}>{f.finish}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "26px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", marginTop: "2px" }}>
                  <span>{f.price}</span><span style={{ fontSize: "16px", marginLeft: "6px", color: "#9A9A9A" }}>{f.cur}</span>
                </div>
                <span style={{ fontSize: "12px", color: "#6E6E6E" }}>под ключ, кузов без разбора · {f.stock}</span>
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
      </div>
    </>
  );
}
