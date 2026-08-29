'use client';
/**
 * Гараж-примерочная, экраны 24–39.
 *
 * Разметка из design/design/03-phase3-client-garage.dc.html — байт в байт.
 * Несущее решение макета: машина занимает весь экран, а управление лежит
 * поверх неё нижней шторкой. Клиент смотрит на свою машину, а не на каталог.
 *
 * Г-1 · ноль полей до первой примерки. Артикула, которого нет в прайсе точки,
 * не существует: штриховка вместо ложного выбора (О-3).
 */
import { useEffect, useMemo, useState, useTransition } from 'react';
import { uploadCarPhoto, startGarageTryOn, garageTryOnStatus } from '@/lib/garage';
import { HONESTY_LINE, LIGHTS, type LightId } from '@/lib/domain';

type Item = {
  point_price_id: string; sku: string; name: string; brand: string; category: string;
  finish: string; price_kopecks: number; in_stock: boolean; hex: string | null;
};

const CATS = [['film', 'Плёнка'], ['wheel', 'Диски'], ['interior', 'Салон'], ['trim', 'Обвес']] as const;
const FREE = 8;

const THUMB: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png', 'ATR-20': '/renders/render-05.png',
  'PPF-PPF': '/renders/render-06.png', 'PPF-MATTE': '/renders/render-07.png',
};
const HERO: Record<string, string> = {
  K75407: '/renders/render-01.png', '970-070': '/renders/render-02.png',
  'HX20-LG': '/renders/render-04.png', 'GAL-OL': '/renders/render-03.png',
  K75400: '/renders/render-12.png',
};
const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');

export function Garage({ pointName, items, plate, slug, consented, photoId }: {
  pointName: string; items: Item[]; plate: string;
  slug: string; consented: boolean; photoId: string | null;
}) {
  const [cat, setCat] = useState<string>('film');
  const [light, setLight] = useState<LightId>('day');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [used, setUsed] = useState(1);
  const [sent, setSent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(photoId);
  // Примерка на СВОЁМ кадре. Пока фотографии нет, гараж показывает типовой
  // кузов — это законный режим (О-1), но ради своей машины сюда и приходят.
  const [mine, setMine] = useState<Record<string, Record<string, string>>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [tryErr, setTryErr] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  // Загрузка своей машины. Без неё гараж показывает типовой кузов, и это
  // законный режим (О-1), но ради своей машины сюда и приходят.
  const onFile = (f: File | null) => {
    if (!f) return;
    setUpErr(null);
    startUpload(async () => {
      const fd = new FormData();
      fd.set('photo', f);
      const r = await uploadCarPhoto(slug, fd);
      if (!r.ok) { setUpErr(r.error); return; }
      setPhoto(r.photoId);
    });
  };

  // Опрос идёт, только пока есть что ждать, и останавливается по готовности,
  // по ошибке и при уходе со страницы. Незакрытый опрос живёт вечно и долбит
  // сервер — это уже ловили на панели примерки в диалоге.
  useEffect(() => {
    if (!running || !photo) return;
    let alive = true;
    let tries = 0;
    const tick = async () => {
      if (!alive) return;
      const st = await garageTryOnStatus(slug, running);
      if (!alive) return;
      if (st.errors.length) { setTryErr(st.errors[0]); setRunning(null); return; }
      if (st.done.length) {
        const bySku: Record<string, string> = {};
        for (const d of st.done) bySku[d.variant] = d.storage_path;
        setMine(m => ({ ...m, [running]: bySku }));
      }
      if (st.ready || ++tries > 60) { setRunning(null); return; }
      setTimeout(tick, 2000);
    };
    const t = setTimeout(tick, 1500);
    return () => { alive = false; clearTimeout(t); };
  }, [running, photo, slug]);

  const byCat = useMemo(() => {
    const m: Record<string, Item[]> = {};
    for (const i of items) (m[i.category === 'ppf' || i.category === 'tint' ? 'film' : i.category] ??= []).push(i);
    return m;
  }, [items]);

  const list = (byCat[cat] ?? []).slice(0, 4);
  const chosen = Object.values(picked).map(id => items.find(i => i.point_price_id === id))
    .filter(Boolean) as Item[];
  const lead = chosen[0] ?? byCat.film?.[0];
  const total = chosen.reduce((s, i) => s + i.price_kopecks, 0) || (lead?.price_kopecks ?? 0);
  const left = Math.max(0, FREE - used);

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex",
      justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "790px", background: "#EFEFEF",
        borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column",
        position: "relative" }}>

        {/* Машина занимает экран */}
        <div style={{ position: "absolute", inset: "0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(running && mine[running]?.[light])
                    ?? Object.values(mine)[0]?.[light]
                    ?? HERO[lead?.sku ?? ''] ?? '/renders/render-01.png'}
            alt={`ваша машина в ${lead?.name ?? 'плёнке'}`}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ваш автомобиль · {plate}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 12px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{left}</span>
            <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>осталось</span>
          </div>
        </div>

        <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px", padding: "0 12px 14px" }}>

          {/* Своя машина. Согласие собирается ДО загрузки и один раз (§13):
              без него снимок не заведётся — это инвариант базы, а не проверка
              в коде. Поэтому здесь либо поле файла, либо переход к согласию. */}
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "13px 15px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>
              {photo ? 'Ваша машина загружена' : 'Показать на своей машине'}</span>
            {photo ? (
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
                Дальше примерка идёт на вашем кадре, а не на типовом кузове.
              </span>
            ) : consented ? (
              <>
                <label style={{ background: "#DEF23B", borderRadius: "999px", padding: "13px 0", textAlign: "center", cursor: uploading ? "wait" : "pointer" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>
                    {uploading ? 'Загружаем…' : 'Выбрать фото'}</span>
                  <input type="file" accept="image/*" disabled={uploading}
                    onChange={e => onFile(e.target.files?.[0] ?? null)}
                    style={{ display: "none" }} />
                </label>
                <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
                  Один кадр сбоку или в три четверти. Номер останется вашим.
                </span>
              </>
            ) : (
              <a href={`/g/consent?p=${encodeURIComponent(slug)}`}
                 style={{ background: "#DEF23B", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Загрузить своё фото</span>
              </a>
            )}
            {tryErr && (
              <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "10px 12px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{tryErr}</div>
            )}
            {running && (
              <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center" }}>
                Примеряем на вашей машине · три света
              </span>
            )}
            {upErr && (
              <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "10px 12px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{upErr}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "4px", alignSelf: "center" }}>
            {LIGHTS.map(l => (
              <button key={l.id} onClick={() => setLight(l.id)} aria-pressed={light === l.id}
                style={{ fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "8px 14px", border: 0, cursor: "pointer", fontFamily: "inherit",
                  color: light === l.id ? "#FFFFFF" : "#6E6E6E",
                  background: light === l.id ? "#111111" : "transparent" }}>{l.label}</button>
            ))}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "14px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              {CATS.map(([id, label]) => (
                <button key={id} onClick={() => setCat(id)} aria-pressed={cat === id}
                  style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", border: 0, cursor: "pointer", fontFamily: "inherit",
                    color: cat === id ? "#FFFFFF" : "#6E6E6E",
                    background: cat === id ? "#111111" : "#F5F5F5" }}>{label}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {list.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ height: "58px", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                  </div>
                  <span style={{ fontSize: "9.5px", textAlign: "center", color: "#C4C4C4" }}>
                    В прайсе {pointName} этой категории нет</span>
                </div>
              )}
              {list.map(i => {
                const on = picked[cat] === i.point_price_id;
                if (!i.in_stock) return (
                  <div key={i.point_price_id} style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ height: "58px", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                    </div>
                    <span style={{ fontSize: "9.5px", textAlign: "center", color: "#C4C4C4" }}>{short(i.name)} — нет</span>
                  </div>
                );
                return (
                  <button key={i.point_price_id} aria-pressed={on}
                    onClick={() => {
                      setPicked(p => ({ ...p, [cat]: on ? '' : i.point_price_id }));
                      if (on) return;
                      setUsed(u => u + 1);
                      // Есть своя фотография — примеряем на ней, а не листаем
                      // заготовки. Нет — остаётся типовой кузов.
                      if (!photo) return;
                      setTryErr(null);
                      startGarageTryOn(slug, i.point_price_id, photo).then(r => {
                        if (!r.ok) { setTryErr(r.error); return; }
                        setRunning(r.itemId);
                      });
                    }}
                    style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px", border: 0, background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                    <div style={{ height: "58px", borderRadius: "16px", overflow: "hidden", ...(on ? { boxShadow: "0 0 0 3px #DEF23B" } : {}) }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={THUMB[i.sku] ?? '/renders/render-05.png'} alt=""
                        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span style={{ fontSize: "9.5px", textAlign: "center", ...(on ? { fontWeight: "500" } : { color: "#6E6E6E" }) }}>{short(i.name)}</span>
                  </button>
                );
              })}
            </div>

            {/* О-2 · оговорка внутри шторки, у самой цены, а не мелким шрифтом внизу */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "10px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
              <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                {HONESTY_LINE} Поэтому показываем три света.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {chosen.length ? chosen.map(c => c.name).join(' + ') : lead?.name ?? '—'}</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                  {rub(total)}<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <button aria-label="Сравнить рядом"
                style={{ width: "44px", height: "44px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: 0, cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="5" width="7" height="14" rx="2" /></svg>
              </button>
              <button onClick={() => { setSent(true); }}
                style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 18px", flex: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>{sent ? 'Ушло в точку' : 'Написать точке'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function short(name: string) {
  return name.length > 12 ? name.split(' ').slice(0, 2).join(' ') : name;
}
