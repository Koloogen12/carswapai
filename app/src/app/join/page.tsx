'use client';
/**
 * Экраны 02–04 · регистрация точки по приглашению сети.
 *
 * Разметка из блока 3 хендоффа. Три шага в одной колонке 466px:
 * приглашение → подтверждение телефона → точка создана.
 *
 * С-1 · без кода сети точка не заводится. Проверка на уровне базы,
 * форма её только показывает.
 * В-1 · четыре поля. Каталог, прайс и шаблоны документов приезжают
 * из сети готовыми — их точка не заполняет.
 */
import { useState } from 'react';

const NETWORK = 'JETCAR';
const CODE = 'JETCAR-2026';

export default function JoinPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('Пост на Кутузовском');
  const [addr, setAddr] = useState('Кутузовский пр-т, 36, стр. 4');
  const [phone, setPhone] = useState('+7 926 418 55 02');
  const [owner, setOwner] = useState('Дмитрий Кораблёв');

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: "466px", background: "#FFFFFF", borderRadius: "30px", padding: "30px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.4" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Приглашение от «{NETWORK}»</span>
            <span style={{ fontSize: "11px", color: "#6E6E6E" }}>код {CODE} · действует до 4 сентября</span>
          </div>
        </div>

        {step === 1 && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Заведём вашу точку</span>
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Четыре поля. Всё остальное — каталог, прайс, шаблоны документов — приедет из сети готовым.
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Field label="Название точки" value={name} onChange={setName} strong />
            <Field label="Адрес" value={addr} onChange={setAddr} />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}><Field label="Ваш телефон" value={phone} onChange={setPhone} /></div>
              <div style={{ flex: 1 }}><Field label="Ваше имя" value={owner} onChange={setOwner} /></div>
            </div>
          </div>
          <Primary onClick={() => setStep(2)}>Продолжить</Primary>
        </>}

        {step === 2 && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Код из SMS</span>
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Отправили на {phone}. Это и есть ваш вход в дальнейшем — пароля в продукте нет.
            </span>
          </div>
          <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "17px 20px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
            <input aria-label="Код из SMS" inputMode="numeric" placeholder="· · · ·"
              style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "0.32em", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
          </div>
          <Primary onClick={() => setStep(3)}>Подтвердить</Primary>
        </>}

        {step === 3 && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>{name} создан</span>
            <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
              Осталось три шага. Каналы и прайс подключаем мы — от вас нужно только подтверждение доступа.
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {[['Подключить каналы', 'мы · ~30 минут вашего участия', true],
              ['Загрузить прайс', 'мы · из вашего файла в любом виде', false],
              ['Добавить менеджера', 'вы · одна ссылка, без пароля', false]].map(([t, s, done], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "13px", background: done ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "999px", background: done ? "#111111" : "#FFFFFF", color: done ? "#DEF23B" : "#9A9A9A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: "600", flex: "none" }}>{i + 1}</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{t as string}</span>
                  <span style={{ fontSize: "11px", ...(done ? { opacity: ".65" } : { color: "#9A9A9A" }) }}>{s as string}</span>
                </div>
              </div>
            ))}
          </div>
          <a href="/staff" style={{ background: "#111111", borderRadius: "999px", padding: "17px 0", textAlign: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Добавить сотрудников</span>
          </a>
        </>}

        <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.5" }}>
          Точку можно завести только по коду сети. Это условие управляющей компании,
          и оно закрыто на уровне базы, а не формой регистрации.
        </span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, strong }: {
  label: string; value: string; onChange: (v: string) => void; strong?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>{label}</span>
      <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "14px 16px" }}>
        <input value={value} onChange={e => onChange(e.target.value)} aria-label={label}
          style={{ fontSize: "14.5px", fontWeight: strong ? "500" : "400", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
      </div>
    </div>
  );
}

function Primary({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ background: "#111111", borderRadius: "999px", padding: "17px 0", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
      <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>{children}</span>
    </button>
  );
}
