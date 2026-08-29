'use client';
/**
 * Поле ответа в диалоге.
 *
 * О-8 · отсюда никуда не уходят. «Добрать вариант» не ссылка и не переход:
 * панель примерки стоит на том же экране, кнопка просто ведёт к ней взгляд.
 * Ссылка увела бы менеджера со страницы, на которой он держит клиента.
 *
 * Enter отправляет, Shift+Enter переносит строку — так устроен любой
 * мессенджер, из которого менеджер сюда пришёл. Ломать эту привычку нечем.
 */
import { useRef, useState, useTransition } from 'react';
import { reply } from '@/lib/outreach';
import { dative } from '@/lib/names';

export function Composer({ threadId, name }: { threadId: string; name: string }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const ta = useRef<HTMLTextAreaElement>(null);

  function send() {
    const body = text.trim();
    if (!body || busy) return;
    setErr(null);
    start(async () => {
      const r = await reply(threadId, body);
      if (r.ok) { setText(''); ta.current?.focus(); }
      else setErr(r.error);
    });
  }

  return (
    <div style={{ borderTop: "1px solid #F0F0F0", display: "flex", flexDirection: "column" }}>
      {err && (
        <div style={{ background: "#FBEEEF", padding: "9px 16px", fontSize: "11.5px", lineHeight: "1.4", color: "#8A4448" }}>{err}</div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "9px", padding: "13px 16px" }}>
        <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "9px", background: "#F5F5F5", borderRadius: "999px", padding: "5px 8px 5px 16px" }}>
          <textarea
            ref={ta}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder={`Ответить ${dative(name.split(' ')[0])}…`}
            disabled={busy}
            style={{ flex: "1", border: "none", outline: "none", background: "transparent", resize: "none", fontFamily: "inherit", fontSize: "13px", lineHeight: "1.45", color: "#111111", maxHeight: "96px", padding: "6px 0" }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() || busy}
            aria-label="Отправить"
            style={{ width: "30px", height: "30px", flex: "none", border: "none", borderRadius: "999px", cursor: text.trim() && !busy ? "pointer" : "default", background: text.trim() && !busy ? "#111111" : "#E2E2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={text.trim() && !busy ? "#FFFFFF" : "#9A9A9A"} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            const p = document.getElementById('tryon');
            p?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            p?.querySelector<HTMLElement>('[data-first-sku]')?.focus();
          }}
          style={{ display: "flex", alignItems: "center", gap: "7px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1px #E2E2E2", borderRadius: "999px", padding: "11px 15px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#111111" }}>Добрать вариант</span>
        </button>
      </div>
    </div>
  );
}
