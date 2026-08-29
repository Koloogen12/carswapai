'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
// Только типы: рабочий импорт из lib/crm утащил бы в браузер драйвер базы.
import type { CrmRow, Stage } from '@/lib/crm';

/**
 * Экраны 47 и 50 · клиенты точки и воронка сделок.
 *
 * Разметка перенесена из design/design/05-phase5-crm-workorder.dc.html,
 * блоки 1 и 5 (рамки «47 CRM · клиенты точки» и «49 Воронка» по нумерации
 * самого макета — в карте экранов это 47 и 50). Кегли, отбивки, радиусы
 * и ширины колонок 230/190/…/150/110 взяты байт в байт.
 *
 * ЧТО ДОБАВЛЕНО СВЕРХ МАКЕТА И ЗАЧЕМ. Макет решает ВИД списка, но не работу
 * с ним: поле поиска и пилюли статусов там нарисованы, но ничего не делают,
 * а строки не ведут никуда. Здесь они живые, и это единственное отличие:
 * поиск фильтрует, пилюли переключают, строка открывает карточку, значок
 * справа — диалог. Ни одной новой колонки не добавлено: пустая колонка
 * хуже отсутствующей.
 *
 * ПОЧЕМУ ФИЛЬТР НА КЛИЕНТЕ, А НЕ ЧЕРЕЗ `globalSearch`. Глобальный поиск в
 * ops.ts отвечает на другой вопрос — «где во всей точке лежит эта строка»,
 * и возвращает разнородные находки: артикул, наряд, рулон. Здесь нужен не
 * поиск по точке, а сужение ЭТОГО списка, и сужать его надо без похода на
 * сервер: менеджер печатает между заездами, и задержка в полсекунды на
 * букву превращает поиск в мучение.
 */

/**
 * Строка «остывает» после трёх суток молчания. Порог один на экран: список и
 * воронка считают температуру одинаково, иначе они начнут спорить.
 */
const COLD_DAYS = 3;

/** Стадию задаёт СОБЫТИЕ, а не рука менеджера. Тумблера «поставить стадию»
 *  нет и не будет: ровно он превращает учёт в фантазию. */
function stageOf(r: CrmRow): Stage {
  if (r.order_status === 'done') return 'done';
  if (r.order_status) return 'in_work';
  if (r.measure_at) return 'measure';
  if (r.confirmed_at) return 'confirmed';
  if (r.sent_at) return 'sent';
  return 'new';
}

/** Молчание поверх стадии. После замера тишина уже ничего не значит: там
 *  движение обеспечивает пост, а не переписка. */
function isCold(r: CrmRow, stage: Stage, now: number): boolean {
  if (stage === 'measure' || stage === 'in_work' || stage === 'done') return false;
  const at = r.last_at ?? r.sent_at;
  if (!at) return false;
  return (now - new Date(at).getTime()) / 864e5 > COLD_DAYS;
}

/** Лестница по порядку — она же порядок колонок воронки экрана 50. */
const STAGES: Stage[] = ['new', 'sent', 'confirmed', 'measure', 'in_work', 'done'];

const STAGE_LABEL: Record<Stage, string> = {
  new: 'Новое обращение',
  sent: 'Примерка отправлена',
  confirmed: 'Подтвердил цвет',
  measure: 'Записан на замер',
  in_work: 'В работе',
  done: 'Сдано',
};

/**
 * Порядок горячести — то же правило, что в инбоксе: наверх поднимается не
 * свежее, а то, что требует действия.
 *
 * Первым стоит подтверждённый выбор: человек уже сказал «беру», и с каждым
 * днём молчания сделка тает — это самая дорогая потеря продукта, и стоит она
 * ПОСЛЕ момента «ага». Дальше — обращение, на которое ещё не ответили.
 * Сданное внизу: с ним делать нечего.
 */
const HOT: Stage[] = ['confirmed', 'new', 'sent', 'measure', 'in_work', 'done'];
const hotRank = (s: Stage) => HOT.indexOf(s);

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');

const CHANNEL: Record<string, string> = {
  whatsapp: 'WhatsApp', telegram: 'Telegram', max: 'MAX', avito: 'Avito', web: 'Сайт',
};

/** Телефон показывается неполным — как в макете. Ищется при этом целиком. */
function maskPhone(p: string | null) {
  if (!p) return null;
  const d = p.replace(/\D/g, '');
  if (d.length < 11) return p;
  return `+${d[0]} ${d.slice(1, 4)} ··· ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}

/** «26 авг» — как в макете. toLocaleDateString ставит точку после месяца,
 *  и в строке списка она читается как конец предложения. */
const day = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    .replace(/\.$/, '');

/** Подписи в строке не переносятся: одна строка списка — одна высота.
 *  Разъехавшаяся по высоте таблица перестаёт читаться взглядом. */
const ONE_LINE = {
  whiteSpace: "nowrap" as const, overflow: "hidden",
  textOverflow: "ellipsis", minWidth: 0,
};

const initials = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('');

/** «1 сделка», «2 сделки», «5 сделок» — счёт по-русски, а не «2 сделка(ок)». */
function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

type Row = CrmRow & { stage: Stage; cold: boolean };

/** Шесть пилюль экрана 47. «Остыли» ищет по температуре, остальные — по стадии. */
type FilterId = 'all' | 'confirmed' | 'measure' | 'in_work' | 'done' | 'cold';
const FILTERS: [FilterId, string][] = [
  ['all', 'Все'], ['confirmed', 'Подтвердили цвет'], ['measure', 'Записаны на замер'],
  ['in_work', 'В работе'], ['done', 'Сдано'], ['cold', 'Остыли'],
];

function passes(r: Row, f: FilterId) {
  return f === 'all' ? true : f === 'cold' ? r.cold : r.stage === f;
}

export function CrmDesk({ rows }: { rows: CrmRow[] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const box = useRef<HTMLInputElement>(null);

  /**
   * Косая черта ставит курсор в поиск, Esc очищает. Мышью до поля тоже можно,
   * но менеджер держит руки на клавиатуре, и это разница между «нашёл за
   * секунду» и «искал глазами».
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = (e.target as HTMLElement)?.tagName === 'INPUT';
      if (e.key === '/' && !inField) { e.preventDefault(); box.current?.focus(); }
      if (e.key === 'Escape' && inField) { setQ(''); box.current?.blur(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const all: Row[] = useMemo(() => {
    const now = Date.now();
    return rows.map(r => {
      const stage = stageOf(r);
      return { ...r, stage, cold: isCold(r, stage, now) };
    });
  }, [rows]);

  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(r => {
      const v = r.vehicle ?? {};
      // Имя, телефон, номер машины и артикул — четыре ключа, по которым
      // менеджера спрашивают по телефону.
      const hay = [r.name, r.phone, v.make, v.model, v.year, v.plate,
        r.brand, r.sku, r.item, r.order_number].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(s);
    });
  }, [all, q]);

  const list = useMemo(() => {
    const out = found.filter(r => passes(r, filter));
    // Наверх поднимается не свежее, а то, что требует действия: сначала
    // стадия, внутри стадии — остывшие, и только потом свежесть.
    out.sort((a, b) => hotRank(a.stage) - hotRank(b.stage)
      || Number(b.cold) - Number(a.cold)
      || +new Date(b.last_at ?? 0) - +new Date(a.last_at ?? 0));
    return out;
  }, [found, filter]);

  const count = (f: FilterId) => found.filter(r => passes(r, f)).length;
  const inWork = count('in_work');

  return (
    <>
      {/* Единственная неинлайновая мелочь на экране — наведение. Инлайновым
          стилем его не выразить, а без него кликабельная строка ничем не
          отличается от нарисованной. Карточки воронки поднимаются, а не
          светлеют: они бывают белыми, кислотными и чёрными, и подсветка
          фоном сломала бы две трети из них. */}
      <style>{`
        .crm-row { transition: background .12s }
        .crm-row:hover { background: #F2F2F2 }
        .crm-row.on:hover { background: #D6EB2E }
        .crm-card { transition: transform .12s }
        .crm-card:hover { transform: translateY(-2px) }
        .crm-chat:hover { background: #111111 }
        .crm-chat:hover svg { stroke: #FFFFFF }
      `}</style>

      <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em" }}>Клиенты</span>
            <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>{all.length} всего · {inWork} в работе</span>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "11px 16px", width: "300px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
            <input ref={box} value={q} onChange={e => setQ(e.target.value)}
              placeholder="Имя, номер авто или артикул" aria-label="Поиск по клиентам точки"
              style={{ fontSize: "13px", color: "#111111", border: 0, background: 'transparent', outline: 'none', flex: 1, minWidth: 0, fontFamily: 'inherit' }} />
            {q && (
              <button onClick={() => setQ('')} aria-label="Очистить поиск"
                style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flex: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            )}
          </label>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FILTERS.map(([id, label]) => {
            const on = filter === id;
            // Кислота — метка горячего, а не «выбранного»: подтверждённый цвет
            // без замера это самая дорогая потеря продукта, и пилюля светится
            // даже когда фильтр стоит на другом.
            const hot = id === 'confirmed';
            return (
              <button key={id} onClick={() => setFilter(id)} aria-pressed={on}
                style={{
                  fontSize: "12px", fontWeight: "500", borderRadius: "999px", padding: "9px 15px",
                  border: 0, cursor: 'pointer', fontFamily: 'inherit',
                  color: on ? "#FFFFFF" : hot ? "#111111" : "#6E6E6E",
                  background: on ? "#111111" : hot ? "#DEF23B" : "#F5F5F5",
                }}>{label} · {count(id)}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 16px 10px" }}>
            <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
              <span style={HEAD(230)}>Клиент</span>
              <span style={HEAD(190)}>Автомобиль</span>
              <span style={{ ...HEAD(), flex: "1" }}>Выбранный артикул</span>
              <span style={HEAD(150)}>Статус</span>
              <span style={{ ...HEAD(110), textAlign: "right" }}>Сумма</span>
            </div>
            <span style={{ ...HEAD(118), textAlign: "right" }}>Наряд</span>
            <span style={{ width: "36px", flex: "none" }} />
          </div>

          {list.map(r => <Line key={r.id} r={r} />)}

          {list.length === 0 && (
            <div style={{ borderRadius: "18px", padding: "22px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}>
              <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>
                {q ? 'По этому запросу никого нет' : 'В этом статусе никого нет'}
              </span>
            </div>
          )}
        </div>
      </div>

      <Funnel rows={found} />
    </>
  );
}

const HEAD = (w?: number) => ({
  ...(w ? { width: `${w}px`, flex: "none" } : {}),
  fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.06em",
  textTransform: "uppercase" as const, color: "#9A9A9A",
});

/**
 * Строка списка. Кликается вся: это ровно то, чего не было — карточка
 * клиента существовала только в макете. Наряд и диалог вынесены отдельными
 * ссылками рядом, потому что ссылку в ссылку вложить нельзя, а оба перехода
 * нужны с одного взгляда.
 */
function Line({ r }: { r: Row }) {
  const v = r.vehicle ?? {};
  const acid = r.stage === 'confirmed';   // подтвердил цвет и ещё не записан
  const dim = r.stage === 'done';
  const badge = r.cold ? 'Остыл' : STAGE_LABEL[r.stage];
  const chan = r.channel ? CHANNEL[r.channel] ?? r.channel : null;

  // Откуда человек взялся, важнее его телефона ровно в одном случае: он
  // собрал примерку сам в гараже, диалога с точкой не было, и менеджер
  // видит имя, которого никогда не слышал.
  const sub = r.cold && r.last_at ? `последний контакт ${day(r.last_at)}`
    : !r.thread_id && r.origin === 'garage' ? 'пришёл из гаража по ссылке'
    : !r.phone ? `${chan ?? 'Без канала'} · без телефона`
    : `${maskPhone(r.phone)}${chan ? ` · ${chan}` : ''}`;

  // Колонка называется «выбранный артикул», и пока выбор не подтверждён,
  // называть его выбранным — врать. Клиент смотрел, а не выбрал.
  //
  // Про гараж говорим ОДИН раз в строке: если диалога не было, это уже
  // сказано в колонке клиента, и повторять здесь — тратить ширину.
  const itemSub = [
    `${r.brand} ${r.sku}`,
    r.batch_number ? `партия ${r.batch_number}`
      : r.origin === 'garage' && r.thread_id ? 'конфигурация из гаража' : null,
    r.confirmed_at ? null : 'смотрел, не выбрал',
  ].filter(Boolean).join(' · ');

  return (
    <div className={`crm-row${acid ? ' on' : ''}`}
      style={{ display: "flex", alignItems: "center", gap: "16px", background: acid ? "#DEF23B" : "#FFFFFF", borderRadius: "18px", padding: "13px 16px", opacity: dim ? .65 : 1 }}>
      <a href={`/crm/${r.id}`} style={{ flex: "1", display: "flex", alignItems: "center", gap: "16px", minWidth: 0, color: "inherit" }}>
        <div style={{ width: "230px", flex: "none", display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: acid ? "#111111" : "#F5F5F5", color: acid ? "#DEF23B" : "#6E6E6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>{initials(r.name)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500", ...ONE_LINE }}>{r.name}</span>
            <span style={{ fontSize: "10.5px", ...ONE_LINE, ...(acid ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>{sub}</span>
          </div>
        </div>

        <div style={{ width: "190px", flex: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
          {v.make
            ? <>
                <span style={{ fontSize: "13px", fontWeight: "500", ...ONE_LINE }}>{[v.make, v.model, v.year].filter(Boolean).join(' ')}</span>
                <span style={{ fontSize: "10.5px", ...ONE_LINE, ...(acid ? { opacity: ".6" } : { color: "#9A9A9A" }) }}>
                  {v.plate ?? 'номер не указан'}{r.threads > 1 ? ` · ${r.threads}-е обращение` : ''}</span>
              </>
            : <span style={{ fontSize: "13px", color: "#9A9A9A" }}>не распознан</span>}
        </div>

        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {r.item ? <>
            <div style={{ width: "38px", height: "28px", borderRadius: "8px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.thumb && <img src={r.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
              <span style={{ fontSize: "12.5px", fontWeight: "500", ...ONE_LINE }}>{r.item}</span>
              <span style={{ fontSize: "10.5px", ...ONE_LINE, ...(acid ? { opacity: ".6" } : { color: "#9A9A9A" }) }} title={itemSub}>{itemSub}</span>
            </div>
          </> : <span style={{ fontSize: "12.5px", color: "#C4C4C4" }}>примерки не было</span>}
        </div>

        <div style={{ width: "150px", flex: "none" }}>
          <span style={{
            fontSize: "11.5px", fontWeight: "500", borderRadius: "999px", padding: "6px 12px",
            ...(acid ? { background: "#111111", color: "#FFFFFF" }
              : r.cold ? { background: "#F5F5F5", color: "#9A9A9A" }
              : { background: "#F5F5F5", color: "#2E2E2E" }),
          }}>{badge}</span>
        </div>

        <span style={{ width: "110px", flex: "none", textAlign: "right", fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums", ...(r.price_kopecks ? {} : { color: "#C4C4C4" }) }}>
          {r.price_kopecks ? rub(r.price_kopecks) : '—'}</span>
      </a>

      <div style={{ width: "118px", flex: "none", display: "flex", justifyContent: "flex-end" }}>
        {r.order_id
          ? <a href={`/doc/order/${r.order_id}`} style={{ fontSize: "11.5px", fontWeight: "500", background: acid ? "#111111" : "#F5F5F5", color: acid ? "#FFFFFF" : "#6E6E6E", borderRadius: "999px", padding: "6px 11px", whiteSpace: "nowrap" }}>{r.order_number}</a>
          : <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#C4C4C4" }}>—</span>}
      </div>

      {/* Переход в диалог — то, на что жалуются в первую очередь. Из списка
          он должен быть в один щелчок, а не через карточку. */}
      {r.thread_id
        ? <a className="crm-chat" href={`/inbox/${r.thread_id}`} aria-label={`Открыть диалог · ${r.name}`}
            style={{ width: "36px", height: "36px", borderRadius: "999px", background: acid ? "rgba(17,17,17,.08)" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>
          </a>
        : <span style={{ width: "36px", flex: "none" }} />}
    </div>
  );
}

/**
 * Экран 50 · воронка. Колонки — та же лестница, по которой список считает
 * статус, и в том же порядке. Двух разных лестниц на одном экране быть не
 * должно: тогда фильтр и доска начинают спорить друг с другом.
 *
 * Карточки показывают по две на колонку, остаток — штриховкой. Штриховка
 * в этой системе значит «остаток / нет данных», и это НЕ ноль: пустая
 * колонка остаётся пустой, а не получает заглушку.
 */
function Funnel({ rows }: { rows: Row[] }) {
  const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
  const deals = rows.filter(r => r.confirmed_at && new Date(r.confirmed_at) >= month);
  const revenue = deals.reduce((s, r) => s + (r.price_kopecks ?? 0), 0);
  const viaTryon = deals.filter(r => r.sent_at).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", padding: "0 6px" }}>
        <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em" }}>Сделки недели</span>
        <span style={{ fontSize: "12.5px", color: "#6E6E6E", maxWidth: "520px", textAlign: "right", lineHeight: "1.45" }}>
          Карточка переезжает сама: отправили примерку — «ждём реакции», клиент нажал «беру» — «выбор подтверждён», мастер сдал — «сдано».</span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {STAGES.map(s => {
          const col = rows.filter(r => r.stage === s);
          const shown = col.slice(0, 2);
          const rest = col.length - shown.length;
          const hot = s === 'confirmed';
          return (
            <div key={s} style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "0 6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>{STAGE_LABEL[s]}</span>
                <span style={{ fontSize: "11.5px", flex: "none", ...(hot && col.length
                  ? { fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "2px 8px" }
                  : { color: "#9A9A9A" }) }}>{col.length}</span>
              </div>

              {shown.map(r => (
                <a key={r.id} href={`/crm/${r.id}`} className="crm-card"
                  style={{ background: hot ? "#DEF23B" : s === 'in_work' ? "#111111" : "#FFFFFF", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px", color: s === 'in_work' ? "#FFFFFF" : "#111111" }}>
                  {r.thumb && (
                    <div style={{ height: "64px", borderRadius: "12px", overflow: "hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <span style={{ fontSize: "13.5px", fontWeight: "500" }}>
                    {r.name}{r.order_number ? ` · наряд ${r.order_number}` : ''}</span>
                  <span style={{ fontSize: "11px", ...(hot ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>
                    {[
                      r.vehicle?.make ? `${r.vehicle.make} ${r.vehicle.model ?? ''}`.trim() : 'авто не распознано',
                      r.cold && r.last_at ? `молчит с ${day(r.last_at)}`
                        : s === 'measure' && r.measure_at ? `замер ${day(r.measure_at)}`
                        : s === 'confirmed' ? 'наряда ещё нет'
                        : s === 'in_work' && r.batch_number ? `рулон сверен, партия ${r.batch_number}`
                        : s === 'done' && r.price_kopecks ? `${rub(r.price_kopecks)} ₽`
                        : r.item ?? null,
                    ].filter(Boolean).join(' · ')}</span>
                </a>
              ))}

              {rest > 0 && (
                <div style={{ borderRadius: "20px", padding: "12px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}>
                  <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>+ {rest} в этой стадии</span>
                </div>
              )}

              {s === 'done' && (
                <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "14px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontSize: "11px", color: "#9A9A9A" }}>За месяц</span>
                  <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.028em", fontVariantNumeric: "tabular-nums" }}>{rub(revenue)} ₽</span>
                  <span style={{ fontSize: "11px", color: "#6E6E6E" }}>
                    из них {viaTryon} {plural(viaTryon, 'сделка', 'сделки', 'сделок')} через примерку</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
