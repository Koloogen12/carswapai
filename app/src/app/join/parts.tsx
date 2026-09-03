'use client';
/**
 * Живая часть экрана приглашения.
 *
 * Разметка перенесена из design/design/01-phase1-signup-point-staff.dc.html,
 * блок 3: карточка 466px, радиус 30, отбивка 30/28, кислотная шапка с кодом
 * сети. Шаги оставлены те же, что в макете; изменилось одно — они теперь
 * что-то делают.
 */
import { useState, useTransition } from 'react';
import {
  actionJoinPoint, actionJoinSendCode, actionJoinStaff,
} from './actions';
import type { InvitePreview } from '@/lib/staff';

const ROLE_RU: Record<string, string> = {
  manager: 'менеджером', master: 'мастером', owner: 'владельцем точки',
};

export function JoinFlow({ code, preview, until }: {
  code: string; preview: InvitePreview | null; until: string;
}) {
  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: "466px", background: "#FFFFFF", borderRadius: "30px", padding: "30px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {!code && <NoCode />}
        {code && !preview && <Dead title="Ссылка не ведёт ни к какому приглашению"
          note="Похоже, код набран с ошибкой. Попросите ссылку заново — старая уже ничего не откроет." />}
        {code && preview?.state === 'used' && <Dead title="По этой ссылке уже вошли"
          note="Приглашение одноразовое. Это не строгость: ссылка, работающая дважды, — это доступ, который невозможно отозвать." />}
        {code && preview?.state === 'expired' && <Dead title="Срок приглашения истёк"
          note={`Ссылка действовала до ${until}. Попросите новую — её выпишут за несколько секунд.`} />}
        {code && preview?.state === 'ok' && (
          <>
            <Banner preview={preview} until={until} />
            {preview.kind === 'staff'
              ? <StaffJoin code={code} preview={preview} />
              : <PointJoin code={code} />}
          </>
        )}

        {/* Оговорка из макета относится к регистрации точки. Мастеру, который
            открыл ссылку у поста, она ничего не объясняет, поэтому у
            приглашения сотруднику стоит своя. */}
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.5" }}>
          {preview?.state === 'ok' && preview.kind === 'staff'
            ? 'Доступ привязан к точке, а не к человеку. Владелец точки отзывает его одним нажатием, и эта ссылка перестаёт работать сразу.'
            : 'Точку можно завести только по коду сети. Это условие управляющей компании, и оно закрыто на уровне базы, а не формой регистрации.'}
        </span>
      </div>
    </div>
  );
}

/** Кислотная шапка из макета: от кого приглашение, код и срок. */
function Banner({ preview, until }: { preview: InvitePreview; until: string }) {
  const from = preview.kind === 'staff'
    ? (preview.pointName ?? 'точки')
    : (preview.networkName ?? 'сети');
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.4" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Приглашение от «{from}»</span>
        <span style={{ fontSize: "11px", color: "#6E6E6E" }}>действует до {until}</span>
      </div>
    </div>
  );
}

/** Приглашение сотруднику: одно нажатие, пароля нет. */
function StaffJoin({ code, preview }: { code: string; preview: InvitePreview }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const go = () => start(async () => {
    setErr(null);
    const r = await actionJoinStaff(code);
    if (!r.ok) { setErr(r.error); return; }
    // Мастер идёт к постам, менеджер — в инбокс: каждому туда, где он работает.
    location.href = preview.role === 'master' ? '/bay' : '/inbox';
  });
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>
          {preview.personName ?? 'Вы'} в команде</span>
        <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
          Вас добавили {ROLE_RU[preview.role] ?? preview.role} точки «{preview.pointName}».
          Пароля в продукте нет: эта ссылка и есть вход, и работает она один раз.
        </span>
      </div>
      {err && <Err text={err} />}
      <Primary onClick={go} disabled={pending}>{pending ? 'Секунду…' : 'Войти'}</Primary>
    </>
  );
}

/** Приглашение сети: три шага регистрации точки, как в макете. */
function PointJoin({ code }: { code: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [email, setEmail] = useState('');
  const [owner, setOwner] = useState('');
  const [mailCode, setMailCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const next = () => start(async () => {
    setErr(null);
    if (step === 1) {
      if (name.trim().length < 2) { setErr('Как называется точка?'); return; }
      if (owner.trim().length < 2) { setErr('Как вас зовут?'); return; }
      const r = await actionJoinSendCode(email);
      if (!r.ok) { setErr(r.error); return; }
      setDevCode(r.devCode ?? null);
      setStep(2);
      return;
    }
    const r = await actionJoinPoint({
      code, email, mailCode, pointName: name, address: addr, ownerName: owner,
    });
    if (!r.ok) { setErr(r.error); return; }
    setStep(3);
  });

  return (
    <>
      {step === 1 && <>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Заведём вашу точку</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Четыре поля. Всё остальное — каталог, прайс, шаблоны документов — приедет из сети готовым.
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Field label="Название точки" value={name} onChange={setName} strong placeholder="Пост на Кутузовском" />
          <Field label="Адрес" value={addr} onChange={setAddr} placeholder="Кутузовский пр-т, 36, стр. 4" />
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}><Field label="Ваша почта" value={email} onChange={setEmail} placeholder="owner@studio.ru" /></div>
            <div style={{ flex: 1 }}><Field label="Ваше имя" value={owner} onChange={setOwner} placeholder="Дмитрий Кораблёв" /></div>
          </div>
        </div>
        {err && <Err text={err} />}
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          <Primary onClick={next} disabled={pending}>{pending ? 'Секунду…' : 'Создать точку'}</Primary>
          <Consent />
        </div>
      </>}

      {step === 2 && <>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Код из письма</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Отправили на {email}. Это и есть ваш вход в дальнейшем — пароля в продукте нет.
          </span>
        </div>
        <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "17px 20px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
          <input aria-label="Код из письма" inputMode="numeric" placeholder="· · · ·"
            value={mailCode} onChange={e => setMailCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') next(); }}
            style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "0.32em", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
        </div>
        {/* Провайдера SMS в контуре ещё нет — и это названо честно, а не
            замаскировано «код отправлен». В бою этого блока нет. */}
        {devCode && (
          <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>
            Отправки SMS в контуре ещё нет. Код: <b>{devCode}</b>
          </div>
        )}
        {err && <Err text={err} />}
        <Primary onClick={next} disabled={pending}>{pending ? 'Секунду…' : 'Подтвердить'}</Primary>
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
    </>
  );
}

/**
 * Пришли на /join без ссылки.
 *
 * Показан тот же экран регистрации, что и в макете, но поля точки закрыты:
 * пока не известна сеть, заполнять их не в чем — и обещать, что заполненное
 * сохранится, было бы враньём. Открыто ровно одно поле, которого не хватает.
 */
function NoCode() {
  const [code, setCode] = useState('');
  const ready = code.trim().length >= 4;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5F5F5", borderRadius: "16px", padding: "12px 14px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "#E2E2E2", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"><path d="M12 7v6M12 16v.5" /><circle cx="12" cy="12" r="9" /></svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Приглашение не открыто</span>
          <span style={{ fontSize: "11px", color: "#6E6E6E" }}>код выдаёт сеть, а сотруднику — владелец точки</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>Заведём вашу точку</span>
        <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
          Четыре поля. Всё остальное — каталог, прайс, шаблоны документов — приедет из сети готовым.
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Field label="Код приглашения" value={code} onChange={setCode} strong placeholder="XXXX-XXXX-XXXX-XXXX" />
        <Field label="Название точки" value="" onChange={() => {}} disabled placeholder="откроется после кода" />
        <Field label="Адрес" value="" onChange={() => {}} disabled placeholder="откроется после кода" />
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}><Field label="Ваша почта" value="" onChange={() => {}} disabled placeholder="" /></div>
          <div style={{ flex: 1 }}><Field label="Ваше имя" value="" onChange={() => {}} disabled placeholder="" /></div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <a href={`/join?i=${encodeURIComponent(code.trim())}`}
          style={{ background: ready ? "#111111" : "#E2E2E2", borderRadius: "999px", padding: "17px 0", textAlign: "center", pointerEvents: ready ? "auto" : "none" }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: ready ? "#FFFFFF" : "#9A9A9A" }}>Создать точку</span>
        </a>
        <Consent />
      </div>
    </>
  );
}

/**
 * Строка согласия из макета. Не украшение: юрлицо зарегистрировано оператором
 * персональных данных, и момент, когда человек оставляет свой телефон, — это
 * ровно тот момент, когда согласие должно быть названо.
 */
function Consent() {
  return (
    <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
      Продолжая, вы принимаете условия использования и согласие на обработку данных
    </span>
  );
}

/** Ссылка мертва. Говорим прямо, почему, и что делать. */
function Dead({ title, note }: { title: string; note: string }) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "26px", fontWeight: "500", letterSpacing: "-0.03em", lineHeight: "1.15" }}>{title}</span>
        <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>{note}</span>
      </div>
      <a href="/login" style={{ background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: "500" }}>Войти по телефону</span>
      </a>
    </>
  );
}

function Err({ text }: { text: string }) {
  return (
    <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#D93F45" }}>{text}</div>
  );
}

function Field({ label, value, onChange, strong, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  strong?: boolean; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", opacity: disabled ? .5 : 1 }}>
      <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>{label}</span>
      <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "14px 16px" }}>
        <input value={value} onChange={e => onChange(e.target.value)} aria-label={label}
          placeholder={placeholder} disabled={disabled}
          style={{ fontSize: "14.5px", fontWeight: strong ? "500" : "400", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
      </div>
    </div>
  );
}

function Primary({ onClick, disabled, children }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: "#111111", borderRadius: "999px", padding: "17px 0", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
      <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>{children}</span>
    </button>
  );
}
