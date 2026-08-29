'use client';
/* Форма заявки в блоке #demo.
 *
 * В МАКЕТЕ ЭТОЙ ФОРМЫ НЕТ. В design/design/landing.dc.html двенадцать полей
 * ввода, и все двенадцать — чекбоксы чек-листа блока 6; ни одного текстового
 * поля и ни одной формы на странице нет. Поэтому форма собрана из уже
 * существующих кусков той же страницы, а не придумана заново:
 *
 *   поле            — «пилюля» из подвала («Почта · Оставить»): белая
 *                     плашка с радиусом 999px, внутри текст и кнопка.
 *                     На тёмной карточке блока #demo вместо белого взята
 *                     та же подложка, что у карточек блока «обещание»
 *                     и у карточки «Что будет на демо» — rgba(255,255,255,.06);
 *   надпись к полю  — «глазок» разделов: 10.5px, 600, 0.09em, uppercase,
 *                     #9A9A9A (в блоке #demo такой же, только кислотный);
 *   галочка         — строка чек-листа блока 6: нативный чекбокс с
 *                     accent-color #DEF23B из landing.css плюс текст
 *                     13.5px / 1.45;
 *   кнопка          — кнопка «Записаться на демо» этого же блока, байт в
 *                     байт: #DEF23B, 999px, 16px 30px, 14.5px, 500;
 *   «спасибо»       — карточка «Что будет на демо» справа: rgba(255,255,255,.06),
 *                     радиус 28px, отступ 28px, шаг 14px;
 *   ошибка          — красный #D93F45 из карточки «14 мин» блока 01.
 *
 * Новых значений не введено. Единственное, чего в макете нет ни в каком
 * виде, — состояние фокуса поля; оно решено кислотной обводкой 1.5px,
 * то есть тем же цветом на горячем, что и везде на странице (landing.css).
 *
 * Согласие не отмечено по умолчанию: иначе это не согласие, а оформление.
 * Тот же принцип, что на экране /g/consent, и по той же причине — заявка
 * содержит имя и телефон живого человека.
 *
 * Спиннера нет намеренно (и в макете его нет ни на одном экране): кнопка
 * гаснет и меняет надпись.
 */
import { useId, useState, useTransition } from 'react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import { submitLead } from '@/lib/leads';

export function LeadForm(): ReactElement {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [point, setPoint] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<'new' | 'again' | null>(null);
  const [pending, start] = useTransition();
  const uid = useId();

  function send(e: FormEvent) {
    e.preventDefault();
    // Первая защита от второго нажатия — здесь, вторая в базе. Одной формы
    // мало: кнопку жмут и из другой вкладки, и после перезагрузки страницы.
    if (pending || done) return;
    start(async () => {
      setError(null);
      const r = await submitLead({ name, phone, pointName: point, consent });
      if (!r.ok) { setError(r.error); return; }
      setDone(r.duplicate ? 'again' : 'new');
    });
  }

  if (done) {
    return (
      <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "28px", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#DEF23B" }}>
          {done === 'again' ? 'Заявка уже у нас' : 'Заявка принята'}</span>
        <span style={{ fontSize: "15px", lineHeight: "1.5", color: "#E8E8E8", textWrap: "pretty" }}>
          {done === 'again'
            ? 'Эта заявка уже лежит у нас — второй раз отправлять не нужно. Позвоним по тому же номеру в рабочее время.'
            : 'Позвоним в рабочее время и договоримся о пятнадцати минутах. Прайс можно прислать заранее — соберём примерку к разговору.'}
        </span>
        <a className="cs-btn-ghost" href="#try" style={{ background: "rgba(255,255,255,.1)", color: "#FFFFFF", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500", textAlign: "center" }}>Пока ждёте — померьте сами</a>
      </div>
    );
  }

  return (
    <form id="demo-form" onSubmit={send} noValidate
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      <div className="cs-g2" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>
        <Field id={`${uid}-name`} label="Как вас зовут" value={name} onChange={setName}
          placeholder="Артём" autoComplete="name" />
        <Field id={`${uid}-phone`} label="Телефон" value={phone} onChange={setPhone}
          placeholder="+7 926 418 55 02" autoComplete="tel" inputMode="tel" type="tel" />
      </div>
      <Field id={`${uid}-point`} label="Название точки" value={point} onChange={setPoint}
        placeholder="Детейлинг на Олимпийском" autoComplete="organization" />

      <label className="cs-check" htmlFor={`${uid}-consent`}
        style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
        <input id={`${uid}-consent`} type="checkbox" checked={consent}
          onChange={e => setConsent(e.target.checked)} />
        <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#9A9A9A", textWrap: "pretty" }}>
          Согласен на обработку имени и телефона, чтобы со мной связались по этой
          заявке. Данные не уходят третьим лицам, хранятся год и удаляются раньше
          по просьбе — <span style={{ borderBottom: "1px solid #6E6E6E" }}>политика обработки данных</span>.
        </span>
      </label>

      {error && (
        <span role="alert" style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#D93F45" }}>{error}</span>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button type="submit" className={consent && !pending ? 'cs-btn-primary' : undefined}
          disabled={!consent || pending}
          style={{ background: consent && !pending ? "#DEF23B" : "rgba(255,255,255,.1)", color: consent && !pending ? "#111111" : "#9A9A9A", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500", border: 0, fontFamily: "inherit", cursor: consent && !pending ? "pointer" : "not-allowed" }}>
          {pending ? 'Отправляем…' : 'Записаться на демо'}</button>
        <a className="cs-btn-ghost" href="#try" style={{ background: "rgba(255,255,255,.1)", color: "#FFFFFF", borderRadius: "999px", padding: "16px 30px", fontSize: "14.5px", fontWeight: "500" }}>Сначала померить самому</a>
      </div>
    </form>
  );
}

function Field({ id, label, value, onChange, placeholder, autoComplete, inputMode, type }: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  inputMode?: 'tel';
  type?: 'tel';
}): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.09em", textTransform: "uppercase", color: "#9A9A9A" }}>{label}</label>
      <div className="cs-field" style={{ background: "rgba(255,255,255,.06)", borderRadius: "999px", padding: "15px 22px", display: "flex", alignItems: "center" }}>
        <input id={id} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          inputMode={inputMode} type={type ?? 'text'}
          style={{ fontSize: "14.5px", fontWeight: "500", color: "#FFFFFF", border: 0, background: "transparent", outline: "none", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
      </div>
    </div>
  );
}
