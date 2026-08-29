'use client';
/**
 * Гараж-примерочная, экраны 24–39.
 *
 * Разметка из design/design/03-phase3-client-garage.dc.html — байт в байт.
 * Несущее решение макета: машина занимает весь экран, а управление лежит
 * поверх неё нижней шторкой. Клиент смотрит на свою машину, а не на каталог.
 *
 * Здесь живут состояния, которые остаются на основном экране:
 *   кадр 28/29/30  — категории и три света;
 *   кадр 31        — нет в прайсе, аналог из прайса ЭТОЙ же точки (О-3);
 *   кадр 34        — счётчик у границы;
 *   кадр 37        — машина уже оклеена, снятие в расчёт.
 * Четыре состояния накрывают шторку целиком и лежат в ./states.tsx:
 *   кадр 32 сравнение, кадр 35 потолок, кадр 36 отказ по кадру, кадр 38 сборки.
 *
 * Г-1 · ноль полей до первой примерки. Артикула, которого нет в прайсе точки,
 * не существует: штриховка вместо ложного выбора (О-3).
 */
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { uploadCarPhoto, startGarageTryOn, garageTryOnStatus, contactLink,
         garageLeavePhone, type Quota } from '@/lib/garage';
import { HONESTY_LINE, LIGHTS, type LightId } from '@/lib/domain';
import { measure, verdict } from './gate';
import { Compare, Limit, Reject, Saved } from './states';
import { CATS, CAT_MISSING, THUMB, type Item, type Save,
         analogue, cachedSkus, hasThreeLights, removalItem, rub, short, shot } from './model';

type Sheet = 'shelf' | 'compare' | 'reject' | 'limit' | 'saved';

export function Garage({ pointName, items, plate, slug, consented, photoId, quota, preset }: {
  pointName: string; items: Item[]; plate: string;
  slug: string; consented: boolean; photoId: string | null;
  quota: Quota; preset: string[];
}) {
  const [cat, setCat] = useState<string>('film');
  const [light, setLight] = useState<LightId>('day');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [photo, setPhoto] = useState<string | null>(photoId);
  // Примерка на СВОЁМ кадре. Пока фотографии нет, гараж показывает типовой
  // кузов — это законный режим (О-1), но ради своей машины сюда и приходят.
  const [mine, setMine] = useState<Record<string, Record<string, string>>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [tryErr, setTryErr] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  // Г-9 · счётчик показывает ТУ ЖЕ величину, которой распоряжается
  // app.enqueue_render. Раньше здесь стояла константа «восемь», ни с чем не
  // связанная: экран обещал примерки, которых бюджет точки уже не давал.
  const [left, setLeft] = useState(quota.left);
  const [limitWhy, setLimitWhy] = useState<string | null>(null);

  const [sheet, setSheet] = useState<Sheet>('shelf');
  const [slots, setSlots] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });
  const [fill, setFill] = useState<'a' | 'b'>('a');
  const [reject, setReject] = useState<{ headline: string; hint: string } | null>(null);
  // Кадр 31: клиент нажал на то, чего у точки нет. Держим отдельно от выбора —
  // выбором это не становится, иначе в цену уехал бы отсутствующий артикул.
  const [wanted, setWanted] = useState<Item | null>(null);
  // Кадр 37: машина уже в плёнке. Спрашиваем, а не угадываем: по одному кадру
  // отличить заводскую краску от плёнки нельзя, а ошибка тут стоит денег.
  const [wrapped, setWrapped] = useState(false);
  const [saves, setSaves] = useState<Save[]>([]);
  const [copied, setCopied] = useState(false);

  const byCat = useMemo(() => {
    const m: Record<string, Item[]> = {};
    for (const i of items) {
      const c = i.category === 'ppf' || i.category === 'tint' ? 'film' : i.category;
      // Услуги в шторку не попадают: снятие старой плёнки — это строка
      // расчёта, а не цвет, который можно примерить.
      if (i.category === 'service') continue;
      (m[c] ??= []).push(i);
    }
    return m;
  }, [items]);

  const byId = useCallback((id: string | null) =>
    items.find(i => i.point_price_id === id) ?? null, [items]);

  // Сборка из ссылки: `?set=артикул.артикул`. Артикулы, которых у этой точки
  // нет, просто не находятся — О-3 держится тем, что искать негде.
  useEffect(() => {
    if (!preset.length) return;
    const next: Record<string, string> = {};
    for (const sku of preset) {
      const i = items.find(x => x.sku === sku);
      if (i) next[i.category === 'ppf' || i.category === 'tint' ? 'film' : i.category] = i.point_price_id;
    }
    if (Object.keys(next).length) {
      setPicked(next);
      setSlots({ a: Object.values(next)[0], b: null });
    }
  }, [preset, items]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`csw_saves_${slug}`);
      if (raw) setSaves(JSON.parse(raw) as Save[]);
    } catch { /* приватный режим — списка просто не будет */ }
  }, [slug]);

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

  // Четыре плитки, и отсутствующая позиция среди них обязательна: штриховка
  // вместо ложного выбора — это и есть О-3 на экране. Отсортированный по цене
  // список выталкивал её за четвёртое место, и «нет в наличии» исчезало.
  const all = byCat[cat] ?? [];
  const out = all.filter(i => !i.in_stock);
  const list = out.length ? [...all.filter(i => i.in_stock).slice(0, 3), out[0]]
                          : all.slice(0, 4);
  const chosen = Object.values(picked).map(byId).filter(Boolean) as Item[];
  const lead = chosen[0] ?? byCat.film?.[0];
  const removal = removalItem(items);
  const base = chosen.reduce((s, i) => s + i.price_kopecks, 0) || (lead?.price_kopecks ?? 0);
  const total = base + (wrapped && removal ? removal.price_kopecks : 0);

  /** Кадр артикула: свой, если посчитан на машине клиента, иначе кэш. */
  const pic = useCallback((i: Item | null) => {
    const own = Object.values(mine).find(v => v[light]);
    if (i && i.point_price_id === picked[cat] && own) return own[light];
    return shot(i?.sku, light);
  }, [mine, light, picked, cat]);

  const hero = (running && mine[running]?.[light])
            ?? Object.values(mine)[0]?.[light]
            ?? shot(lead?.sku, light);

  /* ── примерка ────────────────────────────────────────────── */

  const tryOn = (i: Item) => {
    if (!photo) return;          // типовой кузов уже посчитан, генераций не тратит
    setTryErr(null);
    startGarageTryOn(slug, i.point_price_id, photo).then(r => {
      if (!r.ok) {
        // Г-9 · причину отказа называет база. Здесь только выбираем, каким
        // экраном её показать: потолок — это не ошибка, а состояние.
        if (r.reason === 'limit') { setLeft(0); setLimitWhy(r.error); setSheet('limit'); return; }
        setTryErr(r.error);
        return;
      }
      setRunning(r.itemId);
      setLeft(l => Math.max(0, l - 1));
    });
  };

  const choose = (i: Item) => {
    const on = picked[cat] === i.point_price_id;
    setWanted(null);
    setPicked(p => ({ ...p, [cat]: on ? '' : i.point_price_id }));
    if (on) return;
    setSlots(s => fill === 'b'
      ? { a: s.a ?? i.point_price_id, b: i.point_price_id }
      : { a: i.point_price_id, b: s.a && s.a !== i.point_price_id ? s.a : s.b });
    if (fill === 'b') { setFill('a'); setSheet('compare'); }
    tryOn(i);
  };

  /* ── свой кадр ───────────────────────────────────────────── */

  const onFile = (f: File | null) => {
    if (!f) return;
    setUpErr(null);
    startUpload(async () => {
      // §4.3 стадия 1 · гейт качества считается ДО отправки: непригодный
      // кадр не покидает телефон, а значит не заводит ни основания хранения,
      // ни файла на диске, ни расхода на генерацию.
      let g = null;
      try { g = await measure(f); } catch { /* не открылся — пусть решает сервер */ }
      if (g) {
        const v = verdict(g);
        if (!v.ok) { setReject({ headline: v.headline, hint: v.hint }); setSheet('reject'); return; }
      }
      const fd = new FormData();
      fd.set('photo', f);
      if (g) fd.set('gate', JSON.stringify(g));
      const r = await uploadCarPhoto(slug, fd);
      if (!r.ok) { setUpErr(r.error); return; }
      setPhoto(r.photoId);
      setSheet('shelf');
    });
  };

  /* ── сборки и ссылка ─────────────────────────────────────── */

  const skus = chosen.map(i => i.sku);
  const link = typeof location === 'undefined' ? ''
    : `${location.host}/g/${slug}${skus.length ? `?set=${skus.join('.')}` : ''}`;

  const store = (next: Save[]) => {
    setSaves(next);
    try { localStorage.setItem(`csw_saves_${slug}`, JSON.stringify(next.slice(0, 12))); }
    catch { /* приватный режим — сборка останется только в ссылке */ }
  };

  const save = () => {
    if (skus.length) {
      const s: Save = { id: skus.join('.'), skus, total, at: Date.now() };
      store([s, ...saves.filter(x => x.id !== s.id)]);
    }
    setCopied(false);
    setSheet('saved');
  };

  const write = () => {
    const first = chosen[0]?.point_price_id ?? null;
    contactLink(slug, first).then(r => {
      if (!r.ok) { setTryErr(r.error); return; }
      setSent(true);
      window.open(r.url, '_blank', 'noopener');
    });
  };

  /* ── разметка ────────────────────────────────────────────── */

  const missing = list.length === 0;
  const near = wanted ? analogue(items, wanted) : null;
  // Кадр 34 · порог 80% меняет тон на Acid 300, не на красный.
  const edge = left <= 2 || quota.soft_reached;

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex",
      justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "790px", background: "#EFEFEF",
        borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column",
        position: "relative" }}>

        {/* Машина занимает экран */}
        <div style={{ position: "absolute", inset: "0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero}
            alt={`ваша машина в ${lead?.name ?? 'плёнке'}`}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ position: "relative", padding: "26px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "8px 13px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
            <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Ваш автомобиль · {plate}</span>
          </div>
          {/* Нажимается ровно тогда, когда за нажатием что-то есть: при нуле
              счётчик открывает кадр 35. Кнопка, которая молчит, — это та самая
              нарисованная кнопка, из-за которой сюда и пришли. */}
          {left === 0 ? (
            <button onClick={() => setSheet('limit')}
              style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "8px 12px", border: 0, cursor: "pointer", fontFamily: "inherit", background: "#DEF23B" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>0</span>
              <span style={{ fontSize: "10.5px", color: "#111111", opacity: .7 }}>осталось</span>
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "8px 12px",
              background: edge ? "#DEF23B" : "rgba(255,255,255,.94)" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{left}</span>
              <span style={{ fontSize: "10.5px", color: edge ? "#111111" : "#6E6E6E", opacity: edge ? .7 : 1 }}>осталось</span>
            </div>
          )}
        </div>

        <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px", padding: "0 12px 14px" }}>

          {/* Кадр 34 · счётчик у границы. Тон меняется на Acid, не на красный:
              это предупреждение, а не поломка. */}
          {edge && (
            <div style={{ background: "#F5FBCB", borderRadius: "22px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "7px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>
                  {left > 0 ? `Осталось новых примерок: ${left}` : 'Новые примерки на сегодня кончились'}</span>
              </div>
              <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                Дальше покажем уже готовые кадры — они мгновенные, и все три
                света у них на месте.</span>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(17,17,17,.1)", overflow: "hidden", marginTop: "2px" }}>
                <div style={{ width: `${Math.min(100, Math.round(quota.spent / Math.max(1, quota.hard) * 100))}%`, height: "6px", background: "#111111" }}></div>
              </div>
            </div>
          )}

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
                    {uploading ? 'Проверяем кадр…' : 'Выбрать фото'}</span>
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
                <button key={id} onClick={() => { setCat(id); setWanted(null); }} aria-pressed={cat === id}
                  style={{ flex: "1", textAlign: "center", fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "9px 0", border: 0, cursor: "pointer", fontFamily: "inherit",
                    color: cat === id ? "#FFFFFF" : "#6E6E6E",
                    background: cat === id ? "#111111" : "#F5F5F5" }}>{label}</button>
              ))}
            </div>

            {/* Кадр 31 · этого у точки нет. Явный ответ, а не пустой поиск. */}
            {missing ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 15px" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>{CAT_MISSING[cat]} здесь нет</span>
                  <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
                    Это честный ответ, а не пустой поиск: в прайсе {pointName} такой
                    позиции нет. Что есть — уже показано в остальных категориях.</span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                {list.map(i => {
                  const on = picked[cat] === i.point_price_id;
                  if (!i.in_stock) return (
                    <button key={i.point_price_id} onClick={() => setWanted(i)}
                      aria-pressed={wanted?.point_price_id === i.point_price_id}
                      style={{ flex: "1", display: "flex", flexDirection: "column", gap: "6px", border: 0, background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                      <div style={{ height: "58px", width: "100%", borderRadius: "16px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center", ...(wanted?.point_price_id === i.point_price_id ? { boxShadow: "0 0 0 3px #E2E2E2" } : {}) }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
                      </div>
                      <span style={{ fontSize: "9.5px", textAlign: "center", color: "#C4C4C4" }}>{short(i.name)} — нет</span>
                    </button>
                  );
                  return (
                    <button key={i.point_price_id} aria-pressed={on} onClick={() => choose(i)}
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
            )}

            {/* Кадр 31 · «этого нет, а вот похожее». Аналог — из прайса ЭТОЙ
                точки (О-3): соседнюю точку сети гараж не видит и видеть не
                должен, а общий каталог здесь не существует. */}
            {wanted && (near ? (
              <button onClick={() => choose(near)}
                style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "18px", padding: "12px 14px", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>{near.name}</span>
                  <span style={{ fontSize: "10.5px", opacity: ".65" }}>
                    та же фактура, в наличии · {rub(near.price_kopecks)} ₽</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M9 6l6 6-6 6" /></svg>
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 15px" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>{wanted.name} закончился</span>
                  <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
                    Похожего с той же фактурой в прайсе {pointName} сейчас нет.
                    Спросите точку о сроках — привозят под заказ.</span>
                </div>
              </div>
            ))}

            {/* Кадр 37 · машина уже оклеена. Единственное место, где продукт
                сам поднимает цену: спор на выдаче дороже. */}
            <button onClick={() => setWrapped(w => !w)} aria-pressed={wrapped}
              style={{ display: "flex", alignItems: "center", gap: "9px", background: "transparent", border: 0, padding: "0 2px", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ width: "34px", height: "20px", borderRadius: "999px", flex: "none", position: "relative", background: wrapped ? "#111111" : "#E2E2E2" }}>
                <span style={{ position: "absolute", top: "2px", left: wrapped ? "16px" : "2px", width: "16px", height: "16px", borderRadius: "999px", background: "#FFFFFF" }}></span>
              </span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Машина уже в плёнке</span>
            </button>

            {wrapped && (
              <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px 15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
                  <span style={{ fontSize: "14px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ваша машина уже в плёнке</span>
                </div>
                <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                  Покажем новый цвет поверх, но в расчёт добавили снятие старого
                  покрытия — иначе цена на замере вырастет, и это будет
                  неприятный разговор.</span>
                <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#6E6E6E" }}>
                    {removal ? removal.name : 'Снятие старой плёнки'}</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                    {removal ? `+ ${rub(removal.price_kopecks)} ₽` : 'посчитаем на замере'}</span>
                </div>
                {!removal && (
                  <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
                    Цену снятия называет прайс точки, а у {pointName} этой
                    позиции пока нет. Придумывать её здесь нельзя — на замере
                    она окажется другой.</span>
                )}
              </div>
            )}

            {/* О-2 · оговорка внутри шторки, у самой цены, а не мелким шрифтом внизу */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#F5FBCB", borderRadius: "16px", padding: "10px 12px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
              <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
                {HONESTY_LINE} Поэтому показываем три света.
                {!hasThreeLights(lead?.sku) && !Object.keys(mine).length &&
                  ' У этого артикула готов дневной кадр: остальные два посчитаем на вашей машине.'}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: "1", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {wrapped && removal ? 'Итого с учётом снятия'
                    : missing ? `Собрано без ${(CAT_MISSING[cat] ?? '').toLowerCase()}`
                    : chosen.length ? chosen.map(c => c.name).join(' + ') : lead?.name ?? '—'}</span>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "21px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {rub(total)}<span style={{ fontSize: "13px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
              </div>
              <button aria-label="Сравнить рядом"
                onClick={() => { setSlots(s => s.a ? s : { a: picked[cat] || lead?.point_price_id || null, b: s.b }); setSheet('compare'); }}
                style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: 0, cursor: "pointer", padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="5" width="7" height="14" rx="2" /><rect x="14" y="5" width="7" height="14" rx="2" /></svg>
              </button>
              <button aria-label="Сохранить сборку и ссылку" onClick={save}
                style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: 0, cursor: "pointer", padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v16l-6-4-6 4z" /></svg>
              </button>
              <button onClick={write}
                style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 15px", flex: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>{sent ? 'Ушло в точку' : 'Написать точке'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── состояния, накрывающие шторку целиком ───────────── */}

        {sheet === 'compare' && (
          <Compare a={byId(slots.a)} b={byId(slots.b)} pic={pic}
            lightLabel={LIGHTS.find(l => l.id === light)?.label ?? 'День'}
            onBack={() => setSheet('shelf')}
            onReplace={slot => { setFill(slot); setSheet('shelf'); }}
            onTake={i => {
              setPicked(p => ({ ...p, [i.category === 'ppf' || i.category === 'tint' ? 'film' : i.category]: i.point_price_id }));
              setSheet('shelf');
            }} />
        )}

        {sheet === 'reject' && reject && (
          <Reject headline={reject.headline} hint={reject.hint}
            onFile={f => { setSheet('shelf'); onFile(f); }}
            onFallback={() => { setReject(null); setSheet('shelf'); }} />
        )}

        {sheet === 'limit' && (
          <Limit pointName={pointName} hero={hero}
            // Причин две, и выход есть только у одной. Сутки — клиент упёрся
            // сам и может продолжить, оставив номер. Деньги точки — он не
            // может сделать ничего, и звать его что-то делать нельзя.
            kind={quota.hard_reached ? 'budget' : 'day'}
            onPhone={async ph => {
              const r = await garageLeavePhone(slug, ph);
              if (r.ok) setLeft(15 - quota.used);
              return r;
            }}
            reason={limitWhy ?? 'Потолок новых кадров на сегодня выбран.'}
            ready={items.filter(i => i.in_stock && cachedSkus.includes(i.sku))
                        .map(i => ({ item: i, pic: shot(i.sku, light) }))}
            onPick={i => { setSheet('shelf'); setCat('film'); setPicked(p => ({ ...p, film: i.point_price_id })); }}
            onClose={() => setSheet('shelf')}
            onContact={write} />
        )}

        {sheet === 'saved' && (
          <Saved saves={saves} items={items} link={link} copied={copied}
            pic={s => shot(s.skus[0], light)}
            onCopy={() => {
              // Буфера может не быть вовсе (небезопасный контекст, старый
              // браузер) — тогда ссылка остаётся на экране целиком, её видно
              // и её можно выделить руками. Молчаливого «ничего» не бывает.
              const url = `${location.origin}/g/${slug}${skus.length ? `?set=${skus.join('.')}` : ''}`;
              navigator.clipboard?.writeText(url)
                .then(() => setCopied(true))
                .catch(() => setCopied(false));
            }}
            onOpen={s => {
              const next: Record<string, string> = {};
              for (const sku of s.skus) {
                const i = items.find(x => x.sku === sku);
                if (i) next[i.category === 'ppf' || i.category === 'tint' ? 'film' : i.category] = i.point_price_id;
              }
              setPicked(next); setSheet('shelf');
            }}
            onMore={() => setSheet('shelf')}
            onSend={() => { setSheet('shelf'); write(); }}
            onClose={() => setSheet('shelf')} />
        )}
      </div>
    </div>
  );
}
