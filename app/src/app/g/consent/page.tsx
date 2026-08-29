'use client';
/**
 * Модуль 09 захода 3 · согласие и оферта перед загрузкой фото.
 *
 * Разметка из design/design/09-pass3-management.dc.html, блок 4, рамка 1 —
 * байт в байт: рамка 390×740, чекбоксы 20px с радиусом 6, разделители 1px.
 *
 * §13 · согласие собирается ДО загрузки фото и один раз: дальше в гараже
 * его нет. Третий чекбокс — на публикацию в примерах точки — намеренно
 * не отмечен: согласие по умолчанию «нет», иначе это не согласие.
 *
 * Юридический текст продублирован простым языком не для красоты: клиент,
 * который не понял, на что согласился, — это отзыв согласия задним числом
 * и удаление данных в разгар сделки.
 */
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { giveConsent } from '@/lib/garage';

export default function ConsentPage() {
  // Точка приходит параметром: раньше слаг был вписан в разметку, и согласие
  // любой точки уводило в JETCAR Мытищи.
  const slug = useSearchParams().get('p') ?? '';
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const accept = () => start(async () => {
    setErr(null);
    if (!slug) { setErr('Ссылка неполная — откройте её из сообщения точки'); return; }
    const r = await giveConsent(slug);
    if (!r.ok) { setErr('Не удалось записать согласие. Попробуйте ещё раз'); return; }
    // Возвращаемся в гараж — там теперь появится загрузка фотографии.
    location.href = `/g/${slug}?upload=1`;
  });

  const [processing, setProcessing] = useState(true);
  const [terms, setTerms] = useState(true);
  const [showcase, setShowcase] = useState(false);
  const ready = processing && terms;

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "740px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 16px 18px", gap: "14px" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>Перед загрузкой фото</span>
          <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
            Один экран, один раз. Дальше в гараже его не будет.</span>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Check on={processing} set={setProcessing}>
            Согласен на обработку фотографии автомобиля, включая читаемый
            государственный номер, для показа примерки.{' '}
            <span style={{ borderBottom: "1px solid #C4C4C4" }}>Что это значит</span>
          </Check>
          <div style={{ height: "1px", background: "#F0F0F0" }}></div>
          <Check on={terms} set={setTerms}>
            Принимаю <span style={{ borderBottom: "1px solid #C4C4C4" }}>условия использования</span>
            {' '}и <span style={{ borderBottom: "1px solid #C4C4C4" }}>политику обработки данных</span>
          </Check>
          <div style={{ height: "1px", background: "#F0F0F0" }}></div>
          <Check on={showcase} set={setShowcase} muted>
            Можно показывать мою машину в примерах точки — необязательно
          </Check>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Простым языком</span>
          {['Фото видит только эта точка и вы',
            'Оно не уходит третьим лицам и не используется для обучения моделей',
            'Хранится год с последней активности, удалим раньше по вашей просьбе',
            'Госномер на рендере остаётся вашим — мы его не перерисовываем'].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "999px", background: "#111111", flex: "none", marginTop: "6px" }}></span>
              <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#2E2E2E" }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "9px" }}>
          {err && (
            <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
          )}
          <button onClick={accept} disabled={!ready || pending}
            style={{ background: ready ? "#111111" : "#E2E2E2", borderRadius: "999px", padding: "17px 0", textAlign: "center", border: 0, width: "100%", cursor: ready && !pending ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            <span style={{ fontSize: "15px", fontWeight: "500", color: ready ? "#FFFFFF" : "#9A9A9A" }}>
              {pending ? 'Секунду…' : 'Загрузить фото'}</span>
          </button>
          <a href={slug ? `/g/${slug}` : '/'} style={{ background: "#F5F5F5", borderRadius: "999px", padding: "15px 0", textAlign: "center" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Без фото · по марке и модели</span>
          </a>
          <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
            Отказ ничего не закрывает: примерка на типовом кузове работает без фото.
          </span>
        </div>
      </div>
    </div>
  );
}

function Check({ on, set, muted, children }: {
  on: boolean; set: (v: boolean) => void; muted?: boolean; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "11px", cursor: "pointer" }}>
      <input type="checkbox" checked={on} onChange={e => set(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: "20px", height: "20px", borderRadius: "6px", flex: "none", marginTop: "1px",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...(on ? { background: "#111111" } : { boxShadow: "inset 0 0 0 1.5px #C4C4C4" }) }}>
        {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>}
      </span>
      <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.5", color: muted ? "#6E6E6E" : "#2E2E2E" }}>{children}</span>
    </label>
  );
}
