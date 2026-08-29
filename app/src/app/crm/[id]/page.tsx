import { notFound } from 'next/navigation';
import { whoAmI } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { crmCard, type CrmCard, type TimelineEvent, type TryonShot } from '@/lib/crm';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Экраны 48–49 · карточка клиента, хронология и история примерок автомобиля.
 *
 * Разметка из design/design/05-phase5-crm-workorder.dc.html, блок 3: сетка
 * 1.55fr / 1fr, карточка 26/24·26, аватар 52, плитки 20, лента с точками 11px.
 *
 * Экрана не существовало вовсе: каталог `crm/[id]` был пустым, и прямой адрес
 * отдавал 404 — то есть строка списка была тупиком, а «в прошлый раз
 * смотрели» жило только в макете.
 *
 * §13 · клиент читается под претензией из сессии: чужая точка отдаст 404,
 * а не чужие персональные данные.
 */
export default async function CrmClientPage({ params }: { params: { id: string } }) {
  const me = await whoAmI();
  const [c, b] = await Promise.all([crmCard(params.id), budget()]);
  if (!c) notFound();

  return (
    <Frame pad="22px" gap="14px">
      <AppBar active="crm" pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />

      {/* Возврат к списку. В макете его нет, но без него строка списка ведёт
          в тупик: шапка возвращает в кабинет, а не туда, откуда пришли. */}
      <a href="/crm" style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 6px", fontSize: "12.5px", color: "#6E6E6E" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
        Клиенты точки
      </a>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "14px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <Head c={c} />
            <Tiles c={c} />
            <Shots shots={c.tryons} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={LABEL}>Хронология</span>
            <Timeline events={c.timeline} />
          </div>
          <Docs c={c} />
        </div>
      </div>
    </Frame>
  );
}

const LABEL = {
  fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em",
  textTransform: "uppercase" as const, color: "#9A9A9A",
};

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');

const CHANNEL: Record<string, [string, string]> = {
  whatsapp: ['WA', 'WhatsApp'], telegram: ['TG', 'Telegram'], max: ['MX', 'MAX'],
  avito: ['AV', 'Avito'], web: ['WB', 'Сайт'],
};

function maskPhone(p: string | null) {
  if (!p) return null;
  const d = p.replace(/\D/g, '');
  if (d.length < 11) return p;
  return `+${d[0]} ${d.slice(1, 4)} ··· ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}

/**
 * «29 авг, 16:24» — как в макете. `toLocaleString` ставит точку после
 * сокращённого месяца, и в ленте она читается как конец предложения.
 */
const stamp = (iso: string) => new Date(iso).toLocaleString('ru-RU',
  { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  .replace('.,', ',');
const day = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    .replace(/\.$/, '');

/**
 * «клиент с августа 2026». Родительный падеж руками: `toLocaleDateString`
 * с `month: 'long'` даёт именительный и приписывает «г.» — «клиент с август
 * 2026 г.» выглядит как ошибка ввода, а не как продукт.
 */
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const monthOf = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS_OF[d.getMonth()]} ${d.getFullYear()}`;
};

/** «2 обращения», «5 обращений» — счёт по-русски, а не «2 обращение(й)». */
function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}

function Head({ c }: { c: CrmCard }) {
  const ch = c.channel ? CHANNEL[c.channel] : null;
  const since = monthOf(c.created_at);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "600", flex: "none" }}>
          {c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.1" }}>{c.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
            {c.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "4px 10px 4px 4px" }}>
                {ch && <span style={{ width: "16px", height: "16px", borderRadius: "999px", background: "#111111", color: "#FFFFFF", fontSize: "6.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>{ch[0]}</span>}
                <span style={{ fontSize: "11px", color: "#6E6E6E" }}>{maskPhone(c.phone)}</span>
              </span>
            )}
            <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>
              клиент с {since}{c.threads ? ` · ${plural(c.threads, 'обращение', 'обращения', 'обращений')}` : ''}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "7px", flex: "none" }}>
        {/* Ровно то, чего не было: из карточки в диалог одним щелчком. */}
        {c.thread_id
          ? <a href={`/inbox/${c.thread_id}`} style={{ background: "#111111", borderRadius: "999px", padding: "12px 18px", fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Открыть диалог</a>
          : <span style={{ background: "#F5F5F5", borderRadius: "999px", padding: "12px 18px", fontSize: "13px", fontWeight: "500", color: "#9A9A9A" }}>Диалога ещё не было</span>}
        {c.order_id && (
          <a href={`/doc/order/${c.order_id}`} style={{ background: "#F5F5F5", borderRadius: "999px", padding: "12px 18px", fontSize: "13px", fontWeight: "500" }}>Наряд {c.order_number}</a>
        )}
      </div>
    </div>
  );
}

function Tiles({ c }: { c: CrmCard }) {
  const v = c.vehicle ?? {};
  const paidPct = c.invoice_amount && c.paid_kopecks
    ? Math.round((c.paid_kopecks / c.invoice_amount) * 100) : 0;
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <div style={TILE}>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Автомобиль</span>
        <span style={{ fontSize: "15px", fontWeight: "500" }}>
          {v.make ? [v.make, v.model, v.year].filter(Boolean).join(' ') : 'не распознан'}</span>
        <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
          {[v.plate, v.note].filter(Boolean).join(' · ') || 'номер не указан'}</span>
      </div>

      <div style={TILE}>
        <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Работы</span>
        <span style={{ fontSize: "15px", fontWeight: "500" }}>{c.zone ?? 'ещё не выбраны'}</span>
        <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>
          {[c.meters ? `${Number(c.meters).toLocaleString('ru-RU')} м` : null,
            c.measure_at ? `замер ${day(c.measure_at)}` : null,
            c.measure_bay].filter(Boolean).join(' · ') || 'метраж считается на замере'}</span>
      </div>

      <div style={{ ...TILE, background: "#DEF23B" }}>
        <span style={{ fontSize: "11px", opacity: ".6" }}>Сумма сделки</span>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {c.price_kopecks ? `${rub(c.price_kopecks)} ₽` : '—'}</span>
        <span style={{ fontSize: "11.5px", opacity: ".65" }}>
          {paidPct > 0 ? `предоплата ${paidPct}% получена`
            : c.invoice_number ? 'счёт выставлен, оплаты нет'
            : c.confirmed_at ? 'выбор подтверждён, счёта ещё нет'
            : 'выбор ещё не подтверждён'}</span>
      </div>
    </div>
  );
}

const TILE = {
  flex: "1", minWidth: 0, background: "#F7F7F7", borderRadius: "20px",
  padding: "16px 18px", display: "flex", flexDirection: "column" as const, gap: "3px",
};

/**
 * Экран 49 · история примерок ЭТОГО автомобиля.
 *
 * Всё, что человеку показывали, а не только выбранное: вернувшемуся клиенту
 * это отвечает «в прошлый раз смотрели», а менеджеру — почему он выбрал
 * именно то, что выбрал.
 */
function Shots({ shots }: { shots: TryonShot[] }) {
  if (!shots.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={LABEL}>История примерок этого автомобиля</span>
        <div style={{ borderRadius: "20px", padding: "22px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}>
          <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Примерки ещё не было</span>
        </div>
      </div>
    );
  }
  const newest = +new Date(shots[0].at);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span style={LABEL}>История примерок этого автомобиля</span>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {shots.map(s => {
          // «В прошлый раз» — это про другой заход, а не про другую плитку
          // того же дня. Порог в неделю отделяет одно от другого.
          const old = newest - +new Date(s.at) > 7 * 864e5;
          return (
            <div key={s.id} style={{ width: "200px", flex: "none", background: "#F7F7F7", borderRadius: "20px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", ...(s.confirmed ? { boxShadow: "0 0 0 2.5px #DEF23B" } : {}), ...(old ? { opacity: ".7" } : {}) }}>
              <div style={{ height: "112px", borderRadius: "14px", overflow: "hidden", background: "#EFEFEF" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.thumb && <img src={s.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px 3px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{s.item}</span>
                <span style={{ fontSize: "10.5px", color: s.confirmed ? "#6E6E6E" : "#9A9A9A" }}>
                  {day(s.at)} · {s.confirmed ? 'выбран и подтверждён' : old ? 'в прошлый раз' : 'смотрел'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Хронология одной лентой: обращения, примерки, подтверждения, замеры,
 *  наряды и оплаты стоят в общем порядке времени, а не по разделам. */
function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Событий ещё не было</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <div key={`${e.at}-${i}`} style={{ display: "flex", gap: "13px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "999px", background: e.acid ? "#DEF23B" : "#111111", flex: "none" }}></span>
              {!last && <span style={{ width: "2px", flex: "1", background: "#F0F0F0" }}></span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: last ? "0" : "16px", minWidth: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>{e.title}</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.4" }}>
                {stamp(e.at)}{e.note ? ` · ${e.note}` : ''}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Документы. Оба собраны из подтверждённой конфигурации: перенабора нет. */
function Docs({ c }: { c: CrmCard }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "13px" }}>
      <span style={LABEL}>Документы</span>
      {c.order_id ? (
        <>
          <a href={`/doc/order/${c.order_id}`} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "16px", padding: "13px 15px" }}>
            <div style={{ width: "32px", height: "38px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <span style={{ fontSize: "8px", fontWeight: "600", color: "#DEF23B" }}>PDF</span></div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Заказ-наряд {c.order_number}</span>
              <span style={{ fontSize: "10.5px", opacity: ".65" }}>
                {c.order_at ? `сформирован ${stamp(c.order_at)}` : 'сформирован из подтверждённой конфигурации'}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 4v12M7 12l5 5 5-5M5 20h14" /></svg>
          </a>
          {c.invoice_number && (
            <a href={`/doc/invoice/${c.order_id}`} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
              <div style={{ width: "32px", height: "38px", borderRadius: "6px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <span style={{ fontSize: "8px", fontWeight: "600", color: "#9A9A9A" }}>PDF</span></div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                <span style={{ fontSize: "13px", fontWeight: "500" }}>Счёт {c.invoice_number}</span>
                <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>
                  {c.invoice_at ? `оплачен ${stamp(c.invoice_at)}` : 'выставлен, оплаты нет'}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 4v12M7 12l5 5 5-5M5 20h14" /></svg>
            </a>
          )}
          <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.45" }}>
            Оба документа собраны из подтверждённой конфигурации. Незаполненные реквизиты клиента не блокируют движение.
          </span>
        </>
      ) : (
        // Пояснение про сборку документов держим только там, где документы
        // есть: под пустой штриховкой оно объясняет то, чего не видно.
        <div style={{ borderRadius: "16px", padding: "18px", textAlign: "center", boxShadow: "inset 0 0 0 1px #E2E2E2", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)" }}>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>
            {c.confirmed_at ? 'Выбор подтверждён, наряда ещё нет' : 'Наряд собирается из подтверждённого выбора'}
          </span>
        </div>
      )}
    </div>
  );
}
