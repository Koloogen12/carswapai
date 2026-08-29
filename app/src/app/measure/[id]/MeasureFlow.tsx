'use client';
/**
 * Экраны 01–04 захода 4 · замер у поста.
 *
 * Разметка из design/design/10-pass4-measure-intake-mobile-crm.dc.html,
 * блок 1, рамки 0–3 — байт в байт: рамка 390×760, отбивка 28/14/18, gap 13,
 * карточка 26 · 18, строка зоны 16 · 13/15, сетка фото 3×2 по 74px.
 *
 * Четыре шага замера — состояния одного экрана, а не четыре страницы:
 * мастер стоит у машины с клиентом, и переключение экранов там стоит
 * дороже, чем кажется за столом.
 */
import { useState, useTransition } from 'react';
import { saveMeasurement, proposeChanges, approveVerbally, type MeasureView } from '@/lib/measure';

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
const ZONES = [
  { code: 'roof', label: 'Крыша и капот', hint: 6.4 },
  { code: 'front_full', label: 'Борта и двери', hint: 8.6 },
  { code: 'mirrors', label: 'Бамперы и зеркала', hint: 3.8 },
];
const SPARE = 1.4;

export function MeasureFlow({ m }: { m: MeasureView }) {
  const [step, setStep] = useState<'arrive' | 'meters' | 'paint' | 'changes'>(
    m.changes.length ? 'changes' : m.photos.length ? 'paint' : m.zones.length ? 'meters' : 'arrive');
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(ZONES.map(z => [z.code,
      Number(m.zones.find(x => x.zone_code === z.code)?.meters ?? z.hint)])));
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  // Что из найденного уходит клиенту. Обязательное отмечено, необязательное
  // нет: полировка под сколы не должна попадать в счёт по умолчанию.
  const [picked, setPicked] = useState<Record<string, boolean>>(
    { meters: true, scratch: true, polish: false });

  const measured = ZONES.reduce((a, z) => a + (vals[z.code] || 0), 0) + SPARE;
  const est = Number(m.estimated_meters ?? 0);
  const diff = measured - est;
  const extra = Math.round(diff * 950000);     // доплата за метраж сверх оценки

  const chosen = EXTRAS(measured, est, extra).filter(x => picked[x.key]);
  const addUp = chosen.reduce((a, x) => a + x.kopecks, 0);

  const at = new Date(m.starts_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div data-surface="bay" style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "760px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 14px 18px", gap: "13px" }}>

        {step === 'arrive' && <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "0 4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-0.03em" }}>Замер {at}</span>
              <span style={{ fontSize: "12px", color: "#5A5A5A" }}>{m.client} · {m.vehicle} · пост №2</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "6px 11px", flex: "none" }}>приехал</span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "13px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#767676" }}>Что клиент уже зафиксировал</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "64px", height: "48px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.thumb && <img src={m.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{m.item_name}</span>
                <span style={{ fontSize: "11px", color: "#5A5A5A" }}>
                  {m.brand} {m.sku}
                  {m.confirmed_at ? ` · подтвердил ${new Date(m.confirmed_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}>
              <span style={{ fontSize: "12px", color: "#5A5A5A" }}>Оценка по наряду</span>
              <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                {est ? `${est} м · ` : ''}{rub(m.price_kopecks)} ₽</span>
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#767676" }}>Порядок замера</span>
            {['Сверить оттенок с рулоном при клиенте',
              'Обмерить кузов, уточнить метраж',
              'Снять состояние ЛКП на фото',
              'Согласовать доработки и подписать акт'].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "999px", fontSize: "10.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
                  ...(i === 0 ? { background: "#111111", color: "#DEF23B" }
                              : { background: "#F5F5F5", color: "#9A9A9A" }) }}>{i + 1}</span>
                <span style={{ flex: "1", fontSize: "13px", fontWeight: i === 0 ? "500" : "400", color: "#2E2E2E" }}>{t}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setStep('meters')}
            style={{ marginTop: "auto", background: "#DEF23B", borderRadius: "999px", padding: "21px 0", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M7 12h10" /></svg>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>Сверить рулон</span>
          </button>

          {/* Тот же экран, что у мастера у поста, но с другим порядком:
              сверка оттенка идёт первой, потому что она может отменить всю
              сделку — и это нормально. Дешевле отменить на замере, чем
              переклеивать после. */}
          <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#767676" }}>
            Сверка оттенка идёт первой, потому что она может отменить сделку —
            и это нормально. Дальше обмер, фото состояния и доработки.
          </span>
        </>}

        {step === 'meters' && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" }}>
            <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>Обмер кузова</span>
            <span style={{ fontSize: "12px", color: "#5A5A5A" }}>
              Оценка была {est || '—'} м · уточняем по факту</span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
            {ZONES.map(z => (
              <label key={z.code} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
                <span style={{ flex: "1", fontSize: "13px" }}>{z.label}</span>
                <input type="number" step="0.1" value={vals[z.code]}
                  onChange={e => setVals(v => ({ ...v, [z.code]: Number(e.target.value) }))}
                  aria-label={z.label}
                  style={{ width: "72px", textAlign: "right", fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums", border: 0, background: "transparent", outline: "none", fontFamily: "inherit" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", flex: "none" }}>м</span>
              </label>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#DEF23B", borderRadius: "16px", padding: "13px 15px" }}>
              <span style={{ flex: "1", fontSize: "13px", fontWeight: "500" }}>Запас на подгиб и брак</span>
              <span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{SPARE} м</span>
            </div>
            <div style={{ height: "1px", background: "#F0F0F0" }}></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "11.5px", color: "#5A5A5A" }}>Итого по факту</span>
                {est > 0 && (
                  <span style={{ fontSize: "10.5px", color: diff > 0 ? "#D93F45" : "#5A5A5A" }}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} м к оценке</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", fontSize: "26px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
                {measured.toFixed(1)}<span style={{ fontSize: "15px", color: "#767676", marginLeft: "3px" }}>м</span></div>
            </div>
          </div>

          {/* Факт вытесняет оценку в справочнике: со временем прикидки уходят
              сами, и следующему клиенту на этой же модели мы называем срок
              по замеренному, а не по среднему. */}
          <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
            <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>
              Замеренный метраж заменит оценку в справочнике этой модели —
              следующему клиенту назовём срок и цену по факту, а не по среднему.
            </span>
          </div>

          {err && <Err text={err} />}
          <button disabled={pending}
            onClick={() => start(async () => {
              for (const z of ZONES) {
                const r = await saveMeasurement(m.appointment_id, m.vehicle_model_id, z.code, vals[z.code]);
                if (!r.ok) { setErr(r.error); return; }
              }
              setErr(null); setStep('paint');
            })}
            style={{ marginTop: "auto", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "20px 0", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "16px", fontWeight: "500", width: "100%" }}>
            {pending ? 'Сохраняем…' : 'Записать обмер'}
          </button>
        </>}

        {step === 'paint' && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" }}>
            <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>Что было до нас</span>
            <span style={{ fontSize: "12px", color: "#5A5A5A" }}>
              Шесть кадров обязательны · попадут в акт приёмки</span>
          </div>

          {[0, 1].map(row => (
            <div key={row} style={{ display: "flex", gap: "7px" }}>
              {[0, 1, 2].map(col => {
                const i = row * 3 + col;
                const p = m.photos[i];
                return p ? (
                  <div key={col} style={{ flex: "1", height: "74px", borderRadius: "13px", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.storage_path} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div key={col} style={{ flex: "1", height: "74px", borderRadius: "13px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#767676" }}>Отмечено на кузове</span>
            {[['Царапина на правой двери', 'под плёнку не уйдёт, нужна подготовка'],
              ['Скол на капоте', 'зафиксирован, на работу не влияет']].map(([t, sub], i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "11px", background: i === 0 ? "#FBEEEF" : "#F7F7F7", borderRadius: "15px", padding: "12px 14px" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "999px", background: i === 0 ? "#D93F45" : "#111111", color: "#FFFFFF", fontSize: "10.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{i + 1}</span>
                <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", color: i === 0 ? "#8A4448" : "#111111" }}>{t}</span>
                  <span style={{ fontSize: "10.5px", color: i === 0 ? "#8A4448" : "#5A5A5A" }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
            <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>
              Кадры до работ закрывают спор «это вы поцарапали» — отдельно
              от спора о цвете. Их видит и клиент в своей ссылке.
            </span>
          </div>

          <button onClick={() => setStep('changes')}
            style={{ marginTop: "auto", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "20px 0", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "16px", fontWeight: "500", width: "100%" }}>
            Дальше · доработки
          </button>
        </>}

        {step === 'changes' && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" }}>
            <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>Нашли на замере</span>
            <span style={{ fontSize: "12px", color: "#5A5A5A" }}>Согласуем с клиентом сейчас, не при выдаче</span>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
            {EXTRAS(measured, est, extra).map(x => (
              <Line key={x.key} on={!!picked[x.key]} title={x.title} sub={x.sub}
                amount={x.kopecks}
                onToggle={() => setPicked(v => ({ ...v, [x.key]: !v[x.key] }))} />
            ))}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#5A5A5A" }}>Было в наряде</span>
              <span style={{ fontSize: "12.5px", fontVariantNumeric: "tabular-nums" }}>{rub(m.price_kopecks)} ₽</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#5A5A5A" }}>Доработки</span>
              <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>+ {rub(addUp)} ₽</span>
            </div>
            <div style={{ height: "1px", background: "#F0F0F0" }}></div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Новая сумма</span>
              <div style={{ display: "flex", alignItems: "baseline", fontSize: "24px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
                {rub(m.price_kopecks + addUp)}<span style={{ fontSize: "14px", color: "#767676", marginLeft: "3px" }}>₽</span></div>
            </div>
          </div>

          {/* Согласие клиента на доплату — такое же событие, как согласие
              на цвет: своим действием и с датой. На выдаче предъявляется
              наравне с первым. */}
          <div style={{ background: "#F5FBCB", borderRadius: "20px", padding: "13px 15px" }}>
            <span style={{ fontSize: "11px", lineHeight: "1.5", color: "#2E2E2E" }}>
              Клиент подтверждает новую сумму со своего телефона — приходит
              уведомлением в его мессенджер. Без подтверждения наряд не уходит в работу.
            </span>
          </div>

          {err && <Err text={err} />}

          {/* Единственное место, где цена растёт. Согласование здесь, а не
              в счёте при выдаче — это разница между «понятно» и скандалом. */}
          {!m.order_id && (
            <div style={{ background: "#FBEEEF", borderRadius: "18px", padding: "12px 15px", fontSize: "12px", lineHeight: "1.45", color: "#8A4448" }}>
              Наряда ещё нет — клиент не подтвердил выбор. Доработку предлагать не к чему.
            </div>
          )}
          {sent && (
            <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "12px 15px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>{sent}</div>
          )}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" disabled={pending || !chosen.length || !m.order_id}
              onClick={() => { setErr(null); setSent(null); start(async () => {
                const r = await proposeChanges(m.appointment_id, m.order_id!, chosen);
                if (r.ok) setSent(`Ушло клиенту на согласование · ${r.count} ${r.count === 1 ? 'доработка' : 'доработки'}. Без его подтверждения наряд в работу не уйдёт.`);
                else setErr(r.error);
              }); }}
              style={{ background: chosen.length && m.order_id ? "#111111" : "#C4C4C4", color: "#FFFFFF", borderRadius: "999px", padding: "19px 0", border: 0, cursor: chosen.length && !pending ? "pointer" : "default", fontFamily: "inherit", fontSize: "15px", fontWeight: "500", width: "100%" }}>
              {pending ? 'Отправляем…' : 'Отправить на согласование'}
            </button>
            <button type="button" disabled={pending || !chosen.length || !m.order_id}
              onClick={() => { setErr(null); setSent(null); start(async () => {
                const r = await approveVerbally(m.appointment_id, m.order_id!, chosen);
                if (r.ok) setSent('Записано как согласие у поста. В наряде видно, что подтверждение устное, а не с телефона клиента.');
                else setErr(r.error);
              }); }}
              style={{ background: "#FFFFFF", borderRadius: "999px", padding: "15px 0", border: 0, cursor: chosen.length && !pending ? "pointer" : "default", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "500", color: "#111111", width: "100%" }}>
              Клиент согласовал голосом
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

function Line({ title, sub, amount, on, onToggle }: {
  title: string; sub: string; amount: number; on?: boolean; onToggle?: () => void;
}) {
  return (
    <div role={onToggle ? 'checkbox' : undefined} aria-checked={onToggle ? !!on : undefined}
      tabIndex={onToggle ? 0 : undefined} onClick={onToggle}
      onKeyDown={onToggle ? e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(); } } : undefined}
      style={{ display: "flex", alignItems: "center", gap: "12px", cursor: onToggle ? "pointer" : "default", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
      <span style={{ width: "20px", height: "20px", borderRadius: "6px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
        ...(on ? { background: "#111111" } : { boxShadow: "inset 0 0 0 1.5px #C4C4C4" }) }}>
        {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>}
      </span>
      <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{title}</span>
        <span style={{ fontSize: "10.5px", ...(on ? { opacity: ".6" } : { color: "#5A5A5A" }) }}>{sub}</span>
      </div>
      <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>
        + {rub(amount)}</span>
    </div>
  );
}

function Err({ text }: { text: string }) {
  return (
    <div style={{ background: "#FBEEEF", borderRadius: "18px", padding: "13px 15px", fontSize: "12px", lineHeight: "1.45", color: "#D93F45" }}>{text}</div>
  );
}


/**
 * Что предъявляется клиенту как доплата.
 *
 * Один список на экран и на отправку: раньше суммы в итоге складывались
 * константами (extra + 850000), а строки рисовались отдельно. Стоило снять
 * отметку — и итог не менялся. Список обязан быть один, иначе экран показывает
 * не то, что уходит.
 */
function EXTRAS(measured: number, est: number, extra: number) {
  return [
    { key: 'meters',  title: `Метраж по факту ${measured.toFixed(1)} м`,
      sub: `было ${est || '—'} м оценочно`, kopecks: extra,
      reason: `Метраж по факту ${measured.toFixed(1)} м против ${est || '—'} м оценочно` },
    { key: 'scratch', title: 'Подготовка царапины на двери',
      sub: 'иначе плёнка ляжет с дефектом', kopecks: 850000,
      reason: 'Подготовка царапины на правой двери' },
    { key: 'polish',  title: 'Полировка капота под сколы',
      sub: 'необязательно · сколы видны на просвет', kopecks: 1400000,
      reason: 'Полировка капота под сколы' },
  ];
}
