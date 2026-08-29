'use client';
/**
 * Приглашение точки в сеть — код, ссылка и готовый текст.
 *
 * Кнопка «Отправить приглашение» ничего не отправляла и отправить не могла:
 * провайдера рассылки нет. Показывать «Отправлено» было бы враньём, которое
 * всплывёт, когда точка не придёт.
 */
import { useState } from 'react';

export function InviteBlock({ code, url, text }: { code: string; url: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
        <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Код сети</span>
          <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>{code}</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "#6E6E6E", textAlign: "right" }}>вводится<br />на {url.replace(/^https?:\/\//, '') || '/join'}</span>
      </div>
      <button type="button" onClick={copy}
        style={{ border: 0, fontFamily: "inherit", cursor: "pointer", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "15px 0", fontSize: "13.5px", fontWeight: "500" }}>
        {copied ? 'Текст приглашения скопирован' : 'Скопировать приглашение'}
      </button>
      <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#9A9A9A" }}>
        Отправляет управляющая компания своим каналом. Система рассылок точкам
        не заводится намеренно: приглашение — разговор двух юрлиц, а не письмо
        от сервиса.
      </span>
    </div>
  );
}
