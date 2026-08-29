'use client';
/**
 * Панель примерки, зона 3 из design/design/11-inbox-dialog-detail.dc.html.
 *
 * О-8 · панель — часть экрана диалога. В этом файле нет ни одной ссылки,
 * уводящей со страницы, и её не должно появиться: между открытием диалога
 * и отправленной карточкой не может быть перехода.
 *
 * К-1 · переключатель светов показывает, какой свет смотрит менеджер,
 * но уходят всегда все три. Тумблера «отправить один» здесь нет и быть
 * не может — карточка без трёх светов не собирается в базе.
 */
import { useEffect, useRef, useState, useTransition } from 'react';
import { ImageSlot } from '@/design/ImageSlot';
import { sendCard, startTryOn, tryOnStatus } from '@/lib/actions';
import { tryonDraft, type TryonState } from '@/lib/tryon';
import type { PriceRow } from '@/lib/data';

const LIGHTS = [['day', 'День'], ['overcast', 'Пасмурно'], ['parking', 'Паркинг']] as const;

/**
 * Потолок опроса: 60 попыток по 2 секунды — две минуты.
 *
 * Задание может остаться в очереди навсегда: воркер не поднят, упал или занят
 * чужой точкой. Готовности не будет, отказа тоже — статус «queued» это не
 * ошибка. Без потолка опрос в таком случае живёт вечно и долбит сервер, а
 * менеджер смотрит на три тёмных сегмента и не знает, ждать ему или нет.
 * По исчерпании опрос останавливается, а кислотная таблетка предлагает
 * следующий ход — повторить. Дедупликация в базе делает повтор бесплатным.
 */
const MAX_POLLS = 60;

/** Состояние живой примерки одного артикула. */
type Run = {
  itemId: string;                 // позиция конфигурации, за которой следим
  done: Record<string, string>;   // свет → путь к готовому изображению
  ready: boolean;
  errors: string[];
  polls: number;                  // сколько раз уже спросили
};

const rub = (k: number) => {
  const s = Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
  const i = s.lastIndexOf(' ');
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i)];
};

/** Готовые света и отказы из базы — в состояние панели. */
function hydrate(existing: TryonState[]): Record<string, Run> {
  const out: Record<string, Run> = {};
  for (const e of existing) {
    const done: Record<string, string> = {};
    for (const d of e.done) done[d.variant] = d.storage_path;
    out[e.pointPriceId] = { itemId: e.itemId, done, errors: e.errors,
                            ready: Object.keys(done).length === LIGHTS.length, polls: 0 };
  }
  return out;
}

export function TryonPanel({ threadId, vehicle, prices, meters, blocked, photo, existing }: {
  threadId: string; vehicle: string; prices: PriceRow[]; meters: string | null;
  blocked: boolean;
  /** Фотография клиента, на которой считается примерка. Нет фото — нет примерки. */
  photo: string | null;
  /** Что уже примерено в черновике треда: состояние живёт в базе, не во вкладке. */
  existing: TryonState[];
}) {
  const [picked, setPicked] = useState<string[]>(
    prices.filter(p => p.in_stock).slice(0, 3).map(p => p.point_price_id));
  const [light, setLight] = useState<string>('day');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [runs, setRuns] = useState<Record<string, Run>>(() => hydrate(existing));
  const [busy, setBusy] = useState<string | null>(null);
  // Черновик добывается один раз на всю панель: конфигурация у трёх артикулов
  // общая, и заводить её на каждое нажатие значило бы плодить пустые.
  const draft = useRef<{ configId: string; photoId: string } | null>(null);

  const chosen = picked.map(id => prices.find(p => p.point_price_id === id)!).filter(Boolean);
  const total = chosen.length ? Math.max(...chosen.map(c => c.price_kopecks)) : 0;
  const inStock = prices.filter(p => p.in_stock).length;
  const lightLabel = LIGHTS.find(([id]) => id === light)![1];

  // М-4 · в карточке ровно три артикула. Но «три готовых» — это не «три
  // примеренных»: О-1 разрешает показать типовой кузов до фотографии, и такая
  // карточка законна. Правило в базе (триггер card_completeness) требует у
  // каждой позиции три рендера, прошедших контроль, и ему безразлично,
  // откуда они — из живой примерки или из кэша типовых кузовов.
  //
  // Панель обязана повторять это правило, а не ужесточать. Строже — значит
  // обращения без фотографии вообще лишаются возможности отправить карточку,
  // хотя база её собрала бы.
  const triedOn = picked.filter(id => runs[id]?.ready).length;
  const readyWithoutPhoto = !photo && picked.length === 3;
  const sendable = picked.length === 3 && !blocked
    && (triedOn === 3 || readyWithoutPhoto);

  const toggle = (id: string, ok: boolean) => {
    if (!ok) return;
    setPicked(p => p.includes(id) ? p.filter(x => x !== id)
      : p.length < 3 ? [...p, id] : [p[1], p[2], id]);
  };

  /** Поставить три задания на один артикул. */
  const runTryOn = async (ppid: string) => {
    const cur = runs[ppid];
    // Задание уже стоит и не падало — второго не ставим. Уникального ключа на
    // пару «конфигурация × артикул» в схеме нет, поэтому повторный `startTryOn`
    // завёл бы вторую, пустую позицию, и панель следила бы за ней вместо той,
    // по которой уже считается. Здесь достаточно возобновить опрос.
    if (cur && cur.errors.length === 0) {
      setRuns(p => ({ ...p, [ppid]: { ...cur, polls: 0 } }));
      return;
    }
    setBusy(ppid);
    setErr(null);
    try {
      if (!draft.current) {
        const d = await tryonDraft(threadId);
        if (!d.ok) { setErr(d.error); return; }
        draft.current = { configId: d.configId, photoId: d.photoId };
      }
      const r = await startTryOn(draft.current.configId, ppid, draft.current.photoId);
      if (!r.ok) { setErr(r.error); return; }
      setRuns(p => ({ ...p,
        [ppid]: { itemId: String(r.itemId), done: {}, ready: false, errors: [], polls: 0 } }));
    } finally {
      setBusy(null);
    }
  };

  // Опрашиваются только те позиции, которые ещё считаются. Готовая, упавшая
  // и упёршаяся в потолок из ключа выпадают — ключ меняется, эффект
  // перезаводится уже без них, а когда считать нечего, ключ пуст и таймер
  // не заводится вовсе. Размонтирование гасит и таймер, и ответ на лету.
  const liveKey = Object.values(runs)
    .filter(r => !r.ready && !r.errors.length && r.polls < MAX_POLLS)
    .map(r => r.itemId).sort().join(',');

  useEffect(() => {
    if (!liveKey) return;
    const ids = liveKey.split(',');
    let alive = true;
    const ask = async () => {
      const answers = await Promise.all(
        ids.map(async id => [id, await tryOnStatus(id)] as const));
      if (!alive) return;
      setRuns(prev => {
        const next = { ...prev };
        for (const [itemId, s] of answers) {
          const key = Object.keys(next).find(k => next[k].itemId === itemId);
          if (!key) continue;
          const done: Record<string, string> = {};
          for (const d of s.done) done[d.variant as string] = d.storage_path as string;
          // Счётчик попыток растёт на каждом ответе, даже когда ничего не
          // изменилось: иначе потолок опроса никогда не сработает.
          next[key] = { ...next[key], ready: s.ready, errors: s.errors,
                        polls: next[key].polls + 1, done };
        }
        return next;
      });
    };
    ask();                       // первый ответ сразу, а не через две секунды
    const timer = setInterval(ask, 2000);
    return () => { alive = false; clearInterval(timer); };
  }, [liveKey]);

  const send = () => start(async () => {
    const r = await sendCard(threadId, picked);
    setErr(r.ok ? null : r.error);
  });

  return (
    <div style={{ width: "356px", flex: "none", background: "#FFFFFF", borderRadius: "24px", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "0", overflowY: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Панель примерки</span>
          <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "3px 9px" }}>1 шаг</span>
        </div>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>в этом же диалоге · без перехода</span>
      </div>

      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "12px 13px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{vehicle}</span>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>
          распознано из обращения · правится в один тап</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Из прайса точки</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{inStock} в наличии из {prices.length}</span>
        </div>
        {prices.map(p => {
          const on = picked.includes(p.point_price_id);
          const run = runs[p.point_price_id];
          const [big, tail] = rub(p.price_kopecks);
          if (!p.in_stock) return (
            <div key={p.point_price_id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", borderRadius: "18px", padding: "10px 12px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.8" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg>
              </div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", lineHeight: "1.2", color: "#9A9A9A" }}>{p.name}</span>
                <span style={{ fontSize: "11px", color: "#C4C4C4" }}>нет на складе · не уйдёт клиенту</span>
              </div>
            </div>
          );
          return (
            <div key={p.point_price_id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={() => toggle(p.point_price_id, true)}
              aria-pressed={on}
              style={{ display: "flex", alignItems: "center", gap: "12px", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "11px 13px", border: 0, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", background: on ? "rgba(255,255,255,.45)" : "#EFEFEF", flex: "none" }}>
                <ImageSlot mini src={swatch(p)} shape="rounded" radius={12} />
              </div>
              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500", lineHeight: "1.2" }}>{p.name}</span>
                <span style={{ fontSize: "11px", ...(on ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>{p.brand} {p.sku} · {p.finish}</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500", letterSpacing: "-0.02em", flex: "none", fontVariantNumeric: "tabular-nums" }}>{big}<span style={{ opacity: ".55" }}>{tail}</span></span>
            </button>
            {on && (
              <TryOnStrip name={p.name} light={light} lightLabel={lightLabel}
                run={run} busy={busy === p.point_price_id}
                stopped={!photo || blocked} onRun={() => runTryOn(p.point_price_id)} />
            )}
            {/* Причина отказа показывается целиком: «не получилось» без причины
                менеджер не сможет ни исправить, ни объяснить клиенту. */}
            {on && run && run.errors.length > 0 && (
              <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45", display: "flex", flexDirection: "column", gap: "4px" }}>
                {run.errors.map((e, i) => <span key={i}>{e}</span>)}
              </div>
            )}
            </div>
          );
        })}
        {!photo && (
          <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
            Фото из диалога не подхвачено — примерить не на чем.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Свет</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>уходят все три · К-1</span>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
          {LIGHTS.map(([id, label]) => (
            <button key={id} onClick={() => setLight(id)} aria-pressed={light === id}
              style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", border: 0, cursor: "pointer", fontFamily: "inherit", borderRadius: "999px", padding: "8px 0",
                color: light === id ? "#FFFFFF" : "#6E6E6E",
                background: light === id ? "#111111" : "transparent" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Плёнка</span>
            <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{meters ? `${meters} м` : '—'}</span>
          </div>
          <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "14px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Работа</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>3 дня</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px" }}>
          <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>К отправке</span>
          <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{rub(total)[0]}<span style={{ color: "#9A9A9A" }}>{rub(total)[1]} ₽</span></span>
        </div>
        <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#2E2E2E" }}>
          Оговорка про сверку оттенка уходит с карточкой. Отключить нельзя.
        </div>
        {err && (
          <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "11.5px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
        )}
        {!sendable && !blocked && (
          <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>
            примерено {triedOn} из 3
          </span>
        )}
        {sendable && readyWithoutPhoto && (
          <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>
            типовой кузов · О-1 · с фото будет точнее
          </span>
        )}
        <button onClick={send} disabled={!sendable || pending}
          style={{ background: sendable ? "#111111" : "#E2E2E2", color: sendable ? "#FFFFFF" : "#9A9A9A", borderRadius: "16px", padding: "15px", border: 0, fontSize: "14px", fontWeight: "500", cursor: sendable ? "pointer" : "not-allowed", fontFamily: "inherit", width: "100%" }}>
          {pending ? 'Отправляем…' : blocked ? 'Жёсткий стоп по бюджету' : 'Отправить клиенту'}
        </button>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center" }}>
          3 артикула × 3 света · 9 изображений одним сообщением
        </span>
      </div>
    </div>
  );
}

/**
 * Готовность примерки одного артикула.
 *
 * Приём перенесён из Specimen25 «Незавершённая примерка» (dev-states):
 * тёмная подложка #111111 радиусом 18, три сегмента подряд — посчитанные
 * кислотой #DEF23B, оставшиеся #4A4A4A, и один следующий ход кислотной
 * таблеткой. Ни спиннера, ни процентов здесь нет намеренно: свет считается
 * либо целиком, либо никак, и дробить его на проценты значит показывать
 * менеджеру число, которого в задании не существует.
 */
function TryOnStrip({ name, light, lightLabel, run, busy, stopped, onRun }: {
  name: string; light: string; lightLabel: string;
  run: Run | undefined; busy: boolean; stopped: boolean; onRun: () => void;
}) {
  const done = LIGHTS.filter(([id]) => run?.done[id]).length;
  const shot = run?.done[light];
  const stalled = !!run && !run.ready && run.polls >= MAX_POLLS;
  const sub = run?.ready ? 'три света · готово' : run ? `${done} из 3` : 'Без примерки';
  const can = !busy && !stopped;

  return (
    <div style={{ background: "#111111", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
        <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>{name}</span>
        <span style={{ fontSize: "11px", color: "#9A9A9A", flex: "none" }}>{sub}</span>
      </div>

      {/* К-1 · показывается тот свет, который выбран переключателем панели.
          Уходят всё равно все три — выбрать «отправить один» отсюда нельзя. */}
      {shot && (
        <>
          <div style={{ height: "96px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,.06)" }}>
            <ImageSlot src={shot} shape="rounded" radius={12} alt={`${name} — ${lightLabel}`} />
          </div>
          <span style={{ fontSize: "10.5px", color: "#6E6E6E" }}>
            крупный кадр — {lightLabel.toLowerCase()}</span>
        </>
      )}

      <div style={{ display: "flex", gap: "5px" }}>
        {LIGHTS.map(([id]) => (
          <span key={id} style={{ flex: "1", height: "4px", borderRadius: "999px",
            background: run?.done[id] ? "#DEF23B" : "#4A4A4A" }}></span>
        ))}
      </div>

      {!run?.ready && (
        <button onClick={onRun} disabled={!can}
          style={{ background: can ? "#DEF23B" : "#4A4A4A", color: can ? "#111111" : "#9A9A9A", borderRadius: "999px", padding: "11px 0", textAlign: "center", border: 0, width: "100%", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", cursor: can ? "pointer" : "not-allowed" }}>
          {busy ? 'Ставим в очередь…' : stalled || run?.errors.length ? 'Повторить' : 'Примерить'}
        </button>
      )}
    </div>
  );
}

function swatch(p: PriceRow) {
  const map: Record<string, string> = {
    K75407: '/renders/wrap-02-satin-black.jpg', '970-070': '/renders/wrap-06-anthracite.jpg',
    'HX20-LG': '/renders/wrap-04-lagoon.jpg', 'GAL-OL': '/renders/wrap-03-olive.jpg',
    K75400: '/renders/wrap-02-satin-black.jpg', 'ATR-20': '/renders/wrap-01-silver.jpg',
  };
  return map[p.sku];
}
