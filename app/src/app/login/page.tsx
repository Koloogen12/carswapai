'use client';
/**
 * Экран 01 · вход для точки.
 *
 * Разметка из design/design/01-phase1-signup-point-staff.dc.html, блок 1.
 * С-1 · функция недоступна точке в обход сети: самостоятельной регистрации
 * без кода приглашения здесь нет, и это не спрятано в UI — вход в сеть
 * с exclusive закрыт на уровне базы.
 *
 * Пароля нет по построению: у поста грязные руки, у менеджера смена.
 */
import { useState, useTransition } from 'react';
import { actionRequestCode, actionVerifyCode } from './actions';

export default function LoginPage() {
  // Пустое поле, а не демонстрационный номер значением: раньше введённый
  // телефон дописывался к нему, и человек видел «Отправили на
  // +7 926 418 55 02+79031234501» — чужой номер рядом со своим.
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  // Код в разработке возвращается в ответе и показывается прямо здесь:
  // провайдера SMS в контуре ещё нет, а войти надо. В бою этого поля нет.
  const [devCode, setDevCode] = useState<string | null>(null);
  // Подсказка от сервера: срок жизни кода или «это стенд, спросите код у того,
  // кто пригласил». Без неё человек на стенде видел пустое поле и не понимал,
  // откуда взять код, — SMS-то не пришло.
  const [hint, setHint] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const go = () => start(async () => {
    setErr(null);
    if (!sent) {
      const r = await actionRequestCode(email);
      if (!r.ok) { setErr(r.error); return; }
      setDevCode(r.devCode ?? null);
      setHint(r.hint ?? null);
      setSent(true);
      return;
    }
    const r = await actionVerifyCode(email, code);
    if (!r.ok) { setErr(r.error); return; }
    // Возвращаем туда, куда человек шёл: менеджер, открывший ссылку на
    // диалог, не должен терять её из-за входа.
    const next = new URLSearchParams(location.search).get('next');
    location.href = next && next.startsWith('/') ? next : '/inbox';
  });

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "1440px", minHeight: "760px", background: "#EFEFEF", borderRadius: "30px", overflow: "hidden", display: "flex" }}>
        <div style={{ width: "620px", flex: "none", background: "#FFFFFF", padding: "52px 56px", display: "flex", flexDirection: "column", gap: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icon-192.png" alt="" width={30} height={30}
              style={{ display: "block", width: "30px", height: "30px", borderRadius: "10px", flex: "none" }} />
            {/* Тёмный вариант: карточка входа светлая, лайм на ней даёт контраст
                около 1.4:1 и читается как бледное пятно. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-dark.png" alt="YOOMP" width={53} height={22}
              style={{ display: "block", height: "22px", width: "auto", flex: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "34px", fontWeight: "500", letterSpacing: "-0.032em", lineHeight: "1.1" }}>
              {sent ? 'Код из письма' : 'Вход для точки'}</span>
            <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#6E6E6E" }}>
              {sent
                ? `Отправили на ${email}. Это единственный способ входа — пароля в продукте нет.`
                : 'Введите почту, на которую управляющая компания выдала доступ. Пароль не нужен — придёт код.'}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>
                {sent ? 'Код' : 'Телефон'}</span>
              <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "17px 20px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
                <input value={sent ? code : email}
                  onChange={e => sent ? setCode(e.target.value) : setEmail(e.target.value)}
                  aria-label={sent ? 'Код из письма' : 'Телефон'}
                  inputMode={sent ? 'numeric' : 'tel'}
                  placeholder={sent ? '' : '+7 926 418 55 02'}
                  onKeyDown={e => { if (e.key === 'Enter') go(); }}
                  style={{ fontSize: "16px", fontWeight: "500", border: 0, background: "transparent", outline: "none", flex: 1, minWidth: 0, fontFamily: "inherit", letterSpacing: sent ? "0.3em" : undefined }} />
              </div>
            </div>
            {err && (
              <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
            )}
            {devCode && (
              <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>
                Отправки писем в контуре ещё нет. Код: <b>{devCode}</b>
              </div>
            )}
            {!devCode && sent && hint && (
              <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>{hint}</div>
            )}
            <button onClick={go} disabled={pending || (!sent && !email.trim()) || (sent && !code.trim())}
              style={{ background: "#111111", borderRadius: "999px", padding: "18px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
              <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>
                {pending ? 'Секунду…' : sent ? 'Войти' : 'Получить код'}</span>
            </button>
          </div>

          <div style={{ height: "1px", background: "#F0F0F0" }}></div>

          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Есть код приглашения от сети?</span>
            <a href="/join" style={{ background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Зарегистрировать точку по приглашению</span>
            </a>
          </div>

          <span style={{ marginTop: "auto", fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.5" }}>
            Сотрудники здесь не регистрируются. Менеджера и мастера добавляет владелец точки — им приходит своя ссылка.
          </span>
        </div>

        <div style={{ flex: "1", position: "relative", minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renders/render-01.png" alt=""
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", left: "44px", bottom: "44px", right: "44px", background: "rgba(255,255,255,.94)", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "9px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Что это за продукт</span>
            <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.022em", lineHeight: "1.25", textWrap: "pretty" }}>
              Клиент видит свою машину в вашей плёнке за минуту — и просит второй вариант вместо «спасибо, подумаю».
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
