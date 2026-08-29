'use client';
/**
 * Разметка из design/design/07-pass1-client-second-half.dc.html — байт в байт.
 * Мобильная рамка 390, шторка снизу с ручкой 38×4, тень 0 −22px 44px −26px.
 */
import { useState, useTransition } from 'react';
import { bookSlot, confirmChoice, payPrepay, decideChange, reschedule,
         type Journey } from '@/lib/journey';

const rub = (k: number) => Math.round(k / 100).toLocaleString('ru-RU').replace(/ /g, ' ');
const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function ClientJourney({ j }: { j: Journey }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  // Слот держим индексами, а не ISO-строкой: строку пришлось бы собирать
  // в рендере и сравнивать с собой же, а на сервере и в браузере она
  // получалась разной. Индекс одинаков всюду, ISO собирается в момент клика.
  const [dayIdx, setDayIdx] = useState(0);
  // По макету время выбрано заранее — экран открывается готовым к записи,
  // а не с выключенной кнопкой. Это и есть смысл шага: закрыть окно между
  // подтверждением цвета и замером в одно нажатие.
  const [timeIdx, setTimeIdx] = useState(0);

  const renders = j.renders ?? [];
  const img = (v: string) => renders.find(r => r.variant === v)?.storage_path ?? '';
  const paid = j.paid_kopecks ?? 0;
  const prepay = Math.round((j.invoice_amount ?? j.price_kopecks) * 0.3);
  const days = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); d.setHours(11, 0, 0, 0); return d;
  });
  const times = TIMES;
  /** ISO выбранного слота собирается в момент нажатия, а не в рендере. */
  const isoOf = (di: number, ti: number) => {
    const d = new Date(days[di]); const [h, m] = times[ti].split(':');
    d.setHours(+h, +m, 0, 0); return d.toISOString();
  };
  /** Машина, как её можно назвать по имеющимся данным. В посеве бывает,
   *  что ни марки, ни номера ещё нет — тогда честнее прочерк, чем « · ». */
  const car = [j.vehicle, j.plate].filter(Boolean).join(' · ') || '—';

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => { const r = await fn(); setErr(r.ok ? null : r.error ?? null); });

  const pendingChange = (j.changes ?? []).find(c => c.status === 'proposed');
  const approved = (j.changes ?? []).filter(c => c.status === 'approved');
  const extra = approved.reduce((a, c) => a + c.amount_kopecks, 0);

  /* Какой шаг показать — решает состояние заказа, а не история навигации.
     Согласование доплаты вклинивается вперёд всего: пока клиент не ответил,
     работа не идёт, и показывать ему ход работ нечестно. */
  const stage: 'confirm' | 'slot' | 'visit' | 'pay' | 'paid' | 'work' | 'accept' | 'done'
             | 'approve' =
      pendingChange ? 'approve'
    : j.warranty_number ? 'done'
    : j.order_status === 'done' ? 'accept'
    : j.order_status === 'in_work' ? 'work'
    : paid > 0 ? 'paid'
    : j.invoice_id ? 'pay'
    : j.appointment_at ? 'visit'
    : j.confirmed_at ? 'slot'
    : 'confirm';

  return (
    <Phone bg="#EFEFEF">
      {stage === 'confirm' && <>
        <Hero src={img('day')} dim />
        <Sheet>
          <Grip />
          <Head title={`Фиксируем ${j.item_name.toLowerCase()}?`}
            note="Это не оплата и не обязательство. Мы запишем ваш выбор с датой, чтобы на выдаче никто не спорил, что было на картинке." />
          <div style={{ display: "flex", gap: "7px" }}>
            {['day', 'overcast', 'parking'].map(v => (
              <div key={v} style={{ flex: "1", height: "64px", borderRadius: "14px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(v)} alt={v} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <Rows rows={[['Артикул', `${j.brand} ${j.sku}`], ['Цена', `${rub(j.price_kopecks)} ₽`],
                       ['Дата фиксации', new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })]]} />
          {/* О-2 · согласие с оговоркой — часть фиксации, а не отдельная галочка */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#F5FBCB", borderRadius: "18px", padding: "13px 15px" }}>
            <div style={{ width: "19px", height: "19px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", marginTop: "1px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
            </div>
            <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
              Я видел эту плёнку в трёх световых условиях и понимаю, что оттенок конкретной
              партии сверяется с рулоном при мне на замере.
            </span>
          </div>
          {err && <Err text={err} />}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Primary onClick={() => act(() => confirmChoice(j.configuration_id))} busy={pending}>
              Да, беру этот</Primary>
            <Secondary>Хочу ещё вариант</Secondary>
          </div>
        </Sheet>
      </>}

      {stage === 'approve' && pendingChange && <Pad>
        <Head title="Мастер обмерил вашу машину"
          note="Плёнки нужно больше, чем по оценке, и есть царапина, которую надо подготовить. Иначе плёнка ляжет с дефектом." small />
        {pendingChange.photo && (
          <div style={{ borderRadius: "24px", overflow: "hidden", height: "150px", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingChange.photo} alt="фото с замера"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            <span style={{ position: "absolute", left: "12px", bottom: "12px", fontSize: "10.5px", fontWeight: "500", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 11px" }}>
              {pendingChange.reason}</span>
          </div>
        )}
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "11px" }}>
          <Line k="Было согласовано" v={`${rub(j.price_kopecks)} ₽`} />
          {approved.map(c => (
            <Line key={c.id} k={c.reason} v={`+ ${rub(c.amount_kopecks)} ₽`} bold />
          ))}
          <Line k={pendingChange.reason} v={`+ ${rub(pendingChange.amount_kopecks)} ₽`} bold />
          <div style={{ height: "1px", background: "#F0F0F0" }}></div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Итого</span>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: "24px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
              {rub(j.price_kopecks + extra + pendingChange.amount_kopecks)}
              <span style={{ fontSize: "14px", color: "#9A9A9A", marginLeft: "3px" }}>₽</span></div>
          </div>
          <span style={{ fontSize: "11px", color: "#6E6E6E", lineHeight: "1.45" }}>
            {paid > 0 ? `Предоплата ${rub(paid)} ₽ уже получена. Доплата — при выдаче.`
                      : 'Доплата — при выдаче, предоплата не меняется.'}
          </span>
        </div>
        <div style={{ background: "#F5FBCB", borderRadius: "20px", padding: "13px 15px" }}>
          <span style={{ fontSize: "11px", lineHeight: "1.5", color: "#2E2E2E" }}>
            От подготовки можно отказаться — сколы будут видны на просвет,
            но плёнка ляжет нормально. Решать вам.
          </span>
        </div>

        {err && <Err text={err} />}

        {/* Отказ виден и не спрятан. Клиент, который передумал на замере,
            дешевле клиента, который узнал о доплате при выдаче. */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => act(() => decideChange(j.configuration_id, pendingChange.id, true))}
            disabled={pending}
            style={{ background: "#DEF23B", borderRadius: "999px", padding: "18px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>
              {pending ? 'Секунду…' : 'Согласен, начинайте'}</span>
          </button>
          <div style={{ background: "#FFFFFF", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Обсудить с менеджером</span>
          </div>
          <button onClick={() => act(() => decideChange(j.configuration_id, pendingChange.id, false))}
            disabled={pending}
            style={{ padding: "6px 0", textAlign: "center", border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
            <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Отказаться и вернуть предоплату</span>
          </button>
        </div>
        <Note>Решение фиксируется с датой и не переписывается: на выдаче
          оно предъявляется наравне с выбором цвета.</Note>
      </Pad>}

      {stage === 'visit' && j.appointment_at && (
        <div style={{ display: "none" }} />
      )}

      {stage === 'slot' && <Pad>
        <Head title="Когда вам удобно на замер"
          note="Двадцать минут: сверим оттенок с рулоном, обмерим кузов, назовём точный срок." small />
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {days.map((d, i) => (
              <button key={i} onClick={() => setDay(i)}
                style={{ flex: "1", background: day === i ? "#111111" : "#F7F7F7", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: "10px", color: "#9A9A9A" }}>{DOW[d.getDay()]}</span>
                <span style={{ fontSize: "16px", fontWeight: "500", color: day === i ? "#FFFFFF" : "#111111" }}>{d.getDate()}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            {times.map(t => {
              const iso = (() => { const d = new Date(days[day]);
                const [h, m] = t.split(':'); d.setHours(+h, +m, 0, 0); return d.toISOString(); })();
              const on = slot === iso;
              return (
                <button key={t} onClick={() => setSlot(iso)}
                  style={{ background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "999px", padding: "11px 18px", border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "500" }}>{t}</button>
              );
            })}
          </div>
        </div>
        <Note>Слот бронируется сейчас, пока вы ещё смотрите на свою машину. Перенести можно
          в один тап — но окно между решением и замером и есть то место, где сделки теряются чаще всего.</Note>
        {err && <Err text={err} />}
        <Primary onClick={() => slot && act(() => bookSlot(j.configuration_id, slot))}
          busy={pending} disabled={!slot}>Записаться на замер</Primary>
      </Pad>}

      {stage === 'visit' && <Pad>
        <Head title={new Date(j.appointment_at!).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          note={`${DOW[new Date(j.appointment_at!).getDay()]} · замер займёт 20 минут`} small />
        <Card>
          <Rows rows={[['Точка', j.point_name], ['Адрес', j.point_address ?? '—'],
                       ['Артикул', `${j.brand} ${j.sku}`], ['Ваш автомобиль', `${j.vehicle} · ${j.plate ?? ''}`]]} />
        </Card>
        <div style={{ display: "flex", gap: "7px" }}>
          {['day', 'overcast', 'parking'].map(v => (
            <div key={v} style={{ flex: "1", height: "64px", borderRadius: "14px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(v)} alt={v} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <Honesty text={j.honesty_line} />
        <Note>Ваш выбор зафиксирован {new Date(j.confirmed_at!).toLocaleDateString('ru-RU')}.
          На замере мы приложим к нему образец рулона — сверите сами.</Note>

        {/* Перенос — не «удалить визит». Отказ и возврат живут рядом, но
            отдельной веткой: клиент, который переносит, и клиент, который
            отказывается, находятся в разных состояниях сделки. */}
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.024em", lineHeight: "1.2" }}>Перенести замер</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {days.map((d, i) => (
              <button key={i} onClick={() => setDay(i)}
                style={{ flex: "1", background: day === i ? "#111111" : "#F7F7F7", borderRadius: "14px", padding: "11px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: "10px", color: "#9A9A9A" }}>{DOW[d.getDay()]}</span>
                <span style={{ fontSize: "16px", fontWeight: "500", color: day === i ? "#FFFFFF" : "#111111" }}>{d.getDate()}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            {times.map(t => {
              const iso = (() => { const d = new Date(days[day]);
                const [h, m] = t.split(':'); d.setHours(+h, +m, 0, 0); return d.toISOString(); })();
              const on = slot === iso;
              return (
                <button key={t} onClick={() => setSlot(iso)}
                  style={{ fontSize: "12px", fontWeight: "500", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "999px", padding: "9px 14px", border: 0, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
              );
            })}
          </div>
          <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}>
            <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#2E2E2E" }}>
              Перенос бесплатный. Рулон под ваш артикул остаётся забронированным —
              на новую дату цвет тот же.
            </span>
          </div>
          <Primary busy={pending} disabled={!slot}
            onClick={() => slot && act(() => reschedule(j.configuration_id, j.appointment_id!, slot))}>
            Перенести</Primary>
          <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
            Нужен возврат предоплаты — напишите в чат точки, вернём на ту же карту.
          </span>
        </div>
      </Pad>}

      {(stage === 'pay' || stage === 'paid') && <Pad>
        <Head title={stage === 'pay' ? 'Предоплата 30%' : `${rub(paid)} ₽ получены`}
          note={stage === 'pay'
            ? 'Мы закупим рулон под ваш артикул и займём пост. Остаток — при выдаче.'
            : `Рулон ${j.brand} ${j.sku} забронирован под вашу машину.`} small />
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "38px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <span style={{ fontSize: "8px", fontWeight: "600", color: "#DEF23B" }}>PDF</span>
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Счёт {j.invoice_number}</span>
              <span style={{ fontSize: "11px", color: "#6E6E6E" }}>к наряду {j.order_number}</span>
            </div>
            <a href={`/doc/invoice/${j.order_id}`} aria-label="Скачать счёт">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M12 4v12M7 12l5 5 5-5M5 20h14" /></svg>
            </a>
          </div>
          <div style={{ height: "1px", background: "#F0F0F0" }}></div>
          <Rows rows={[['Работы по наряду', `${rub(j.invoice_amount ?? j.price_kopecks)} ₽`],
                       ['Предоплата 30%', `${rub(prepay)} ₽`],
                       ['Оплачено', `${rub(paid)} ₽`],
                       ['Остаток при выдаче', `${rub((j.invoice_amount ?? j.price_kopecks) - paid)} ₽`]]} />
        </div>
        {err && <Err text={err} />}
        {stage === 'pay'
          ? <Primary busy={pending}
              onClick={() => act(() => payPrepay(j.configuration_id, j.invoice_id!, prepay, j.point_id))}>
              Оплатить {rub(prepay)} ₽</Primary>
          : <Note>Что дальше: {new Date(j.appointment_at ?? Date.now()).toLocaleDateString('ru-RU')} —
              замер и сверка рулона, затем три дня работы. Даты придут в этот же чат.</Note>}
      </Pad>}

      {stage === 'work' && <Pad>
        <Head title={`Ваш ${j.vehicle} на посту №2`} note="День 2 из 3 · сдача завтра вечером" small />
        <div style={{ height: "180px", borderRadius: "26px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img('day')} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <Card>
          {['Приняли машину', 'Сверили рулон с вашим выбором', 'Оклейка кузова', 'Выдача'].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 0" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "999px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
                background: i < 2 ? "#DEF23B" : i === 2 ? "#111111" : "#F0F0F0" }}>
                {i < 2 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>}
                {i === 2 && <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }} />}
              </div>
              <span style={{ fontSize: "13.5px", fontWeight: i === 2 ? "500" : "400", color: i > 2 ? "#9A9A9A" : "#111111" }}>{t}</span>
            </div>
          ))}
        </Card>
        <Honesty text={j.honesty_line} />
      </Pad>}

      {stage === 'accept' && <Pad>
        <Head title="Принимаем работу"
          note="Осмотрите на свету, потом здесь подтвердите. Ваш выбор — рядом, для сверки." small />
        <div style={{ display: "flex", gap: "7px" }}>
          {['day', 'overcast', 'parking'].map(v => (
            <div key={v} style={{ flex: "1", height: "78px", borderRadius: "14px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(v)} alt={v} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <Card>
          <Rows rows={[['Наряд', j.order_number ?? '—'], ['Артикул', `${j.brand} ${j.sku}`],
                       ['Вы подтвердили', new Date(j.confirmed_at!).toLocaleDateString('ru-RU')],
                       ['К оплате при выдаче', `${rub((j.invoice_amount ?? j.price_kopecks) - paid)} ₽`]]} />
        </Card>
        <Honesty text={j.honesty_line} />
        <Primary onClick={() => {}}>Принимаю работу</Primary>
      </Pad>}

      {stage === 'done' && <Pad>
        <Head title="Мой гараж" note={`${j.vehicle} · ${j.plate ?? ''}`} small />
        <div style={{ height: "180px", borderRadius: "26px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img('day')} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <Card>
          <Rows rows={[['Работа сдана', new Date().toLocaleDateString('ru-RU')],
                       ['Артикул', `${j.brand} ${j.sku}`],
                       ['Гарантийный талон', j.warranty_number ?? '—']]} />
        </Card>
        <a href={`/doc/warranty/${j.order_id}`} style={{ background: "#111111", borderRadius: "999px", padding: "17px 0", textAlign: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Открыть талон и акт</span>
        </a>
        <Note>Сборка остаётся у вас: через год захотите другой цвет — откроете эту же ссылку,
          и точка увидит всю историю без пересказа.</Note>

        {/* Гарантийное обращение — не форма поддержки, а продолжение той же
            записи: материал, партия и дата сдачи уже известны, клиенту
            остаётся сказать, что случилось. */}
        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "11px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
            </div>
            <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "15px", fontWeight: "500" }}>Гарантия активна</span>
              <span style={{ fontSize: "11px", color: "#6E6E6E" }}>
                {j.warranty_issued && j.warranty_months
                  ? `до ${new Date(new Date(j.warranty_issued).setMonth(new Date(j.warranty_issued).getMonth() + j.warranty_months)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} · `
                  : ''}талон {j.warranty_number}</span>
            </div>
          </div>
          <div style={{ background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <Line k="Материал" v={`${j.brand} ${j.sku}`} bold />
            {j.batch_number && <Line k="Партия" v={j.batch_number} bold />}
            {j.warranty_issued && (
              <Line k="Работы сданы" v={new Date(j.warranty_issued).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} bold />
            )}
          </div>
          <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.024em", lineHeight: "1.2", marginTop: "2px" }}>Что случилось</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {['Плёнка отходит по кромке', 'Появились пузыри', 'Изменился оттенок'].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "11px", background: i === 0 ? "#DEF23B" : "#F7F7F7", borderRadius: "15px", padding: "12px 14px" }}>
                <span style={{ width: "19px", height: "19px", borderRadius: "999px", flex: "none",
                  ...(i === 0 ? { background: "#111111" } : { boxShadow: "inset 0 0 0 1.5px #C4C4C4" }) }}></span>
                <span style={{ flex: "1", fontSize: "12.5px", fontWeight: i === 0 ? "500" : "400", color: i === 0 ? "#111111" : "#6E6E6E" }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center", marginTop: "2px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Записаться на осмотр</span>
          </div>
        </div>
      </Pad>}
    </Phone>
  );
}

/* ── примитивы разметки хендоффа ───────────────────────────── */
function Phone({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "790px", background: bg, borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
const Pad = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "28px 16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>{children}</div>
);
const Hero = ({ src, dim }: { src: string; dim?: boolean }) => (
  <div style={{ position: "absolute", inset: "0", opacity: dim ? .35 : 1 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);
const Sheet = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: "absolute", left: "0", right: "0", bottom: "0", background: "#FFFFFF", borderRadius: "32px 32px 42px 42px", padding: "14px 18px 26px", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 -22px 44px -26px rgba(17,17,17,.4)" }}>{children}</div>
);
const Grip = () => (
  <div style={{ width: "38px", height: "4px", borderRadius: "999px", background: "#E2E2E2", alignSelf: "center" }}></div>
);
const Head = ({ title, note, small }: { title: string; note: string; small?: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <span style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>{title}</span>
    <span style={{ fontSize: small ? "12.5px" : "13px", lineHeight: small ? "1.45" : "1.5", color: "#6E6E6E" }}>{note}</span>
  </div>
);
const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px 20px", display: "flex", flexDirection: "column" }}>{children}</div>
);
const Rows = ({ rows }: { rows: [string, string][] }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
    {rows.map(([k, v]) => (
      <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>{k}</span>
        <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}</span>
      </div>
    ))}
  </div>
);
const Honesty = ({ text }: { text: string | null }) => (
  <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "13px 15px", fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
    {text ?? 'Оттенок партии сверяется с рулоном при вас на замере.'}
  </div>
);
const Line = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
    <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>{k}</span>
    <span style={{ fontSize: bold ? "12px" : "13px", fontWeight: bold ? "500" : "400", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}</span>
  </div>
);
const Note = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#9A9A9A" }}>{children}</span>
);
const Err = ({ text }: { text: string }) => (
  <div style={{ background: "#FBEEEF", borderRadius: "18px", padding: "13px 15px", fontSize: "11.5px", lineHeight: "1.5", color: "#D93F45" }}>{text}</div>
);
const Primary = ({ children, onClick, busy, disabled }: {
  children: React.ReactNode; onClick: () => void; busy?: boolean; disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={busy || disabled}
    style={{ background: disabled ? "#E2E2E2" : "#111111", borderRadius: "999px", padding: "18px 0", textAlign: "center", border: 0, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", width: "100%" }}>
    <span style={{ fontSize: "15px", fontWeight: "500", color: disabled ? "#9A9A9A" : "#FFFFFF" }}>
      {busy ? 'Секунду…' : children}</span>
  </button>
);
const Secondary = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
    <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{children}</span>
  </div>
);
