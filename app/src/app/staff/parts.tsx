'use client';
/**
 * Живые части экрана сотрудников: форма приглашения и отзыв доступа.
 *
 * Разметка перенесена из design/design/01-phase1-signup-point-staff.dc.html,
 * блок 5 — вплоть до радиуса 14 и размера 11.5px. Добавлено ровно одно поле,
 * которого в макете нет: телефон. Без него человека не завести — вход в
 * продукте идёт по телефону, пароля нет.
 *
 * Кнопки видны только владельцу. Это удобство, а не защита: заводить и
 * отзывать сотрудников не даёт политика в базе, и она сработает даже если
 * запрос придёт мимо этого экрана.
 */
import { useState, useTransition } from 'react';
import { actionAddStaff, actionSetStaffActive } from './actions';
import type { StaffRole } from '@/lib/staff';

type Issued = { code: string; link: string; qr: string[] };

export function InviteForm({ canInvite }: { canInvite: boolean }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('manager');
  const [phone, setPhone] = useState('');
  const [issued, setIssued] = useState<Issued | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const send = () => start(async () => {
    setErr(null); setCopied(false);
    const r = await actionAddStaff(name, role, phone);
    if (!r.ok) { setErr(r.error); return; }
    setIssued({ code: r.code, link: r.link, qr: r.qr });
    setName(''); setPhone('');
  });

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "26px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Экран 06</span>
        <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Приглашение сотруднику</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Имя</span>
          <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
            <input id="invite-name" value={name} onChange={e => setName(e.target.value)}
              aria-label="Имя" placeholder="Пётр Салимов" disabled={!canInvite}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              style={{ fontSize: "14px", fontWeight: "500", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Роль</span>
          <div style={{ display: "flex", gap: "5px", background: "#F5F5F5", borderRadius: "999px", padding: "4px" }}>
            {([['manager', 'Менеджер'], ['master', 'Мастер']] as const).map(([id, label]) => {
              const on = role === id;
              return (
                <button key={id} type="button" onClick={() => setRole(id)} disabled={!canInvite}
                  style={{ flex: "1", textAlign: "center", fontSize: "12px", fontWeight: "500", padding: "9px 0", border: 0, cursor: canInvite ? "pointer" : "default", fontFamily: "inherit",
                    color: on ? "#FFFFFF" : "#6E6E6E", background: on ? "#111111" : "transparent", borderRadius: "999px" }}>
                  {label}</button>
              );
            })}
          </div>
        </div>

        {/* Поля телефона в макете нет. Оно здесь потому, что вход в продукте
            идёт по телефону: без него приглашение открыло бы сессию человеку,
            который потом не сможет войти во второй раз. */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>Телефон</span>
          <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px" }}>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              aria-label="Телефон" placeholder="+7 926 418 55 02" inputMode="tel" disabled={!canInvite}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              style={{ fontSize: "14px", fontWeight: "500", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
          </div>
        </div>
      </div>

      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "15px 17px", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "66px", height: "66px", borderRadius: "14px", background: "#FFFFFF", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
          {issued && issued.qr.length ? <Qr rows={issued.qr} /> : <QrPlaceholder />}
        </div>
        <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ссылка или QR</span>
          {issued ? (
            <>
              <span style={{ fontSize: "11px", color: "#111111", lineHeight: "1.4", wordBreak: "break-all", fontVariantNumeric: "tabular-nums" }}>{issued.link}</span>
              <button type="button" onClick={() => {
                navigator.clipboard?.writeText(issued.link).then(() => setCopied(true), () => setCopied(false));
              }} style={{ alignSelf: "flex-start", fontSize: "11px", fontWeight: "500", color: "#6E6E6E", background: "#FFFFFF", borderRadius: "999px", padding: "6px 11px", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</button>
            </>
          ) : (
            <span style={{ fontSize: "11px", color: "#6E6E6E", lineHeight: "1.4" }}>
              Мастеру достаточно QR у поста: откроет камерой, пароль не нужен.</span>
          )}
        </div>
      </div>

      {err && (
        <div style={{ background: "#FBEEEF", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#D93F45" }}>{err}</div>
      )}
      {issued && (
        <div style={{ background: "#F5FBCB", borderRadius: "14px", padding: "11px 13px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>
          Ссылка одноразовая и живёт неделю. Второй раз по ней не войдут — это
          и делает отзыв доступа осмысленным.
        </div>
      )}

      <button type="button" onClick={send} disabled={!canInvite || pending || !name.trim() || !phone.trim()}
        style={{ background: canInvite ? "#111111" : "#E2E2E2", borderRadius: "999px", padding: "15px 0", textAlign: "center", border: 0, width: "100%", fontFamily: "inherit", cursor: canInvite ? "pointer" : "default" }}>
        <span style={{ fontSize: "14px", fontWeight: "500", color: canInvite ? "#FFFFFF" : "#9A9A9A" }}>
          {pending ? 'Секунду…' : canInvite ? 'Отправить приглашение' : 'Приглашает владелец точки'}</span>
      </button>
    </div>
  );
}

/** Настоящий QR: матрицу собрал сервер, здесь только прямоугольники. */
function Qr({ rows }: { rows: string[] }) {
  const n = rows.length;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" role="img" aria-label="QR приглашения">
      <rect width={n} height={n} fill="#FFFFFF" />
      <g fill="#111111">
        {rows.flatMap((row, r) => [...row].map((v, c) =>
          v === '1' ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" /> : null))}
      </g>
    </svg>
  );
}

/**
 * До выписанной ссылки кодировать нечего. В макете здесь нарисован узор,
 * похожий на QR; оставить его чёрным значило бы предложить мастеру навести
 * камеру на картинку. Поэтому тот же узор, но серым: место занято, кода ещё
 * нет.
 */
function QrPlaceholder() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="21" height="21" fill="#FFFFFF" />
      <g fill="#E2E2E2">
        <rect x="0" y="0" width="7" height="1" /><rect x="0" y="0" width="1" height="7" />
        <rect x="6" y="0" width="1" height="7" /><rect x="0" y="6" width="7" height="1" />
        <rect x="2" y="2" width="3" height="3" />
        <rect x="14" y="0" width="7" height="1" /><rect x="14" y="0" width="1" height="7" />
        <rect x="20" y="0" width="1" height="7" /><rect x="14" y="6" width="7" height="1" />
        <rect x="16" y="2" width="3" height="3" />
        <rect x="0" y="14" width="7" height="1" /><rect x="0" y="14" width="1" height="7" />
        <rect x="6" y="14" width="1" height="7" /><rect x="0" y="20" width="7" height="1" />
        <rect x="2" y="16" width="3" height="3" />
        <rect x="9" y="1" width="1" height="1" /><rect x="11" y="2" width="1" height="1" />
        <rect x="9" y="4" width="1" height="1" /><rect x="11" y="5" width="1" height="1" />
        <rect x="8" y="8" width="1" height="1" /><rect x="10" y="9" width="1" height="1" />
        <rect x="12" y="8" width="1" height="1" /><rect x="9" y="11" width="1" height="1" />
        <rect x="11" y="12" width="1" height="1" /><rect x="14" y="9" width="1" height="1" />
        <rect x="16" y="10" width="1" height="1" /><rect x="18" y="9" width="1" height="1" />
        <rect x="15" y="12" width="1" height="1" /><rect x="17" y="13" width="1" height="1" />
        <rect x="19" y="11" width="1" height="1" /><rect x="9" y="15" width="1" height="1" />
        <rect x="11" y="16" width="1" height="1" /><rect x="13" y="15" width="1" height="1" />
        <rect x="15" y="17" width="1" height="1" /><rect x="17" y="16" width="1" height="1" />
        <rect x="19" y="18" width="1" height="1" /><rect x="10" y="19" width="1" height="1" />
        <rect x="12" y="18" width="1" height="1" /><rect x="14" y="20" width="1" height="1" />
        <rect x="16" y="19" width="1" height="1" />
      </g>
    </svg>
  );
}

/** Строка «Добавить сотрудника» из макета: ведёт в форму справа. */
export function AddStaffRow() {
  return (
    <button type="button"
      onClick={() => {
        const el = document.getElementById('invite-name');
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el?.focus();
      }}
      style={{ display: "flex", alignItems: "center", gap: "13px", background: "#F7F7F7", borderRadius: "20px", padding: "15px 17px", border: 0, width: "100%", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.9" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </div>
      <span style={{ flex: "1", fontSize: "14.5px", color: "#6E6E6E" }}>Добавить сотрудника</span>
    </button>
  );
}

/**
 * «Отозвать» одним нажатием, как обещано рядом на этом же экране.
 * Подтверждения нет намеренно: отзыв обратим кнопкой «Вернуть», а лишний
 * диалог на живой смене — это ещё одно окно, которое закроют не глядя.
 */
export function RevokeButton({ userId, active }: {
  userId: string; active: boolean;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const go = () => start(async () => {
    setErr(null);
    const r = await actionSetStaffActive(userId, !active);
    if (!r.ok) setErr(r.error);
  });
  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flex: "none" }}>
      <button type="button" onClick={go} disabled={pending}
        title={err ?? undefined}
        style={{ fontSize: "11.5px", color: err ? "#D93F45" : "#9A9A9A", background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
        {pending ? '…' : active ? 'Отозвать' : 'Вернуть'}</button>
      {err && <span style={{ fontSize: "10px", color: "#D93F45", maxWidth: "150px", textAlign: "right", lineHeight: "1.3" }}>{err}</span>}
    </span>
  );
}
