'use client';

/* Блок 6 хендоффа — «Узнаёшь себя?», чек-лист на 12 пунктов.
 *
 * Механика: change на чекбоксе меняет счётчик на ±1; заголовок и строка под
 * ним пересобираются от числа отметок. Счётчик не уходит ниже нуля.
 *
 * Разметка — из design/design/landing.dc.html, пиксели править нельзя.
 */
import { useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

const TOTAL = 12;

function tickLabel(n: number): string {
  return n === 0 ? 'Чек-лист' : `Отмечено ${n} из ${TOTAL}`;
}

/* Пороги и формулировки — дословно из хендоффа. */
function tickLine(n: number): string {
  if (n === 0) return 'Отметьте то, что про вас — посчитаем, во сколько это обходится.';
  if (n < 3) return `${n} из ${TOTAL} — уже повод посмотреть, где обрываются переписки.`;
  if (n < 6) return `${n} из ${TOTAL} — это примерно 2–3 потерянные сделки в месяц.`;
  return `${n} из ${TOTAL} — счёт идёт на сделки, а не на неудобства.`;
}

export function Checklist(): ReactElement {
  const [ticks, setTicks] = useState(0);

  function tick(e: ChangeEvent<HTMLInputElement>) {
    const delta = e.target.checked ? 1 : -1;
    setTicks((n) => Math.max(0, n + delta));
  }

  return (
    <>
      <div style={{ padding: "96px 22px 0", background: "#EFEFEF" }}>
        <div style={{ maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
            <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,50px)", lineHeight: "1.02", fontWeight: "500", letterSpacing: "-0.04em" }}>Узнаёшь себя?</h2>
            <p style={{ margin: "0", maxWidth: "400px", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Если хотя бы две строки из твоей колонки — про тебя, дальше можно не читать, а померить.</p>
          </div>

          <div className="cs-g3" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты владелец точки?</span>
              <label className="cs-check" htmlFor="cs-tick-0" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-0" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Свёл месяц: обращений сорок, сделок четыре, реклама шестьдесят тысяч</span></label>
              <label className="cs-check" htmlFor="cs-tick-1" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-1" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Знаешь, что менеджеры отвечают «от 200 тысяч, приезжайте на замер» — и на этом всё</span></label>
              <label className="cs-check" htmlFor="cs-tick-2" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-2" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Платишь за CRM, в которой поле «источник» заполнено дай бог в половине сделок</span></label>
              <label className="cs-check" htmlFor="cs-tick-3" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-3" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Считал, во сколько тебе обошлась последняя переклейка, и решил больше не считать</span></label>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты за приёмкой?</span>
              <label className="cs-check" htmlFor="cs-tick-4" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-4" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Третий раз за смену объясняешь словами разницу между сатином и матом</span></label>
              <label className="cs-check" htmlFor="cs-tick-5" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-5" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Видишь «прочитано» и понимаешь, что он сейчас пишет в соседний центр</span></label>
              <label className="cs-check" htmlFor="cs-tick-6" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-6" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Отправляешь фото чужой машины из папки «примеры работ» и надеешься, что похоже</span></label>
              <label className="cs-check" htmlFor="cs-tick-7" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-7" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Просишь фото — и клиент пропадает на два дня</span></label>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "32px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>Ты у поста?</span>
              <label className="cs-check" htmlFor="cs-tick-8" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-8" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Слышал «на картинке было ярче» и не смог ничего ответить</span></label>
              <label className="cs-check" htmlFor="cs-tick-9" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-9" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Начинал оклейку и на середине понял, что артикул на рулоне не тот, что назвали клиенту</span></label>
              <label className="cs-check" htmlFor="cs-tick-10" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-10" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Переклеивал за свой счёт то, что сдал нормально</span></label>
              <label className="cs-check" htmlFor="cs-tick-11" style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}><input id="cs-tick-11" type="checkbox" onChange={tick} /><span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#2E2E2E" }}>Держишь в голове, какая партия чуть темнее, и никому не можешь этого показать</span></label>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "#111111", borderRadius: "32px", padding: "26px 30px", flexWrap: "wrap" }}>
            <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>{tickLabel(ticks)}</span>
              <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em", color: "#FFFFFF", textWrap: "pretty" }}>{tickLine(ticks)}</span>
            </div>
            <a href="#demo" style={{ background: "#DEF23B", color: "#111111", borderRadius: "999px", padding: "15px 28px", fontSize: "14px", fontWeight: "500", flex: "none" }}>Посмотрим на вашей точке · 15 минут</a>
          </div>
        </div>
      </div>
    </>
  );
}
