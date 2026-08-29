'use client';
/**
 * Экран мастера у поста, экраны 40–46.
 *
 * Разметка из design/design/04-phase4-master-at-bay.dc.html, блок 1,
 * рамки 0–6 — байт в байт. Семь экранов макета здесь стали состояниями
 * одного экрана: у поста мастер не «переходит по экранам», он делает
 * два тапа, и ему показывают то, что нужно прямо сейчас.
 *
 * МС-1 · без пароля, ≤2 тапа. Цели нажатия из макета: главная кнопка
 * padding 21px по вертикали, то есть 60+ по высоте, а не 44.
 *
 * МС-3 живёт здесь целиком: «Сверить рулон» → список рулонов → и дальше
 * одна из трёх новостей, а не одна из двух. Сошёлся — кадр 04 с партией,
 * которая ушла в карточку клиента. Не сошёлся — кадр 05, красный, с ценой
 * ошибки и одним действием к менеджеру. Сломалась сама сверка — отдельное
 * состояние без красного: это не необратимое, это «позовите менеджера».
 * Раньше вторые два исхода показывались одинаково, и на верном рулоне
 * мастер видел «Рулон не тот» с двумя одинаковыми артикулами рядом.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { closeWork } from '@/lib/bay';
import type { BayRecord } from '@/lib/bay';
import { verifyRollAtBay, reportMismatch, requestConfirmation } from './actions';

type Roll = { id: string; barcode: string; batch_number: string; meters_left: string;
              sku: string; name: string };

type Month = { done: number; redo: number; verified: number };
type Next = { id: string; number: string | null; client: string; when: string;
              vehicle: string; thumb: string | null };
type Warranty = { number: string; months: number; issued_at: string } | null;

const PHONE = { width: "100%", maxWidth: "390px", minHeight: "820px", borderRadius: "42px",
  overflow: "hidden", display: "flex", flexDirection: "column" as const,
  padding: "26px 14px 16px" };

/** Кнопка-таблетка из макета: padding 21px по вертикали — это 63px цели. */
const PILL = { borderRadius: "999px", padding: "21px 0", border: 0, cursor: "pointer",
  fontFamily: "inherit", fontSize: "16px", fontWeight: "500", width: "100%",
  textAlign: "center" as const };

const money = (kop: number) =>
  `${Math.round(kop / 100).toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`;

const CAPTION = { fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em",
  textTransform: "uppercase" as const, color: "#9A9A9A" };

export function BayScreen({ rec, rolls, month, next, warranty }: {
  rec: BayRecord; rolls: Roll[]; month: Month; next: Next | null; warranty: Warranty;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'record' | 'scan' | 'matched' | 'blocked' | 'broken'
                                 | 'handover' | 'done'>(
    rec.status === 'done' ? 'done' : rec.batch_verified_at ? 'handover' : 'record');
  const [wrong, setWrong] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [asked, setAsked] = useState(false);
  const [batch, setBatch] = useState(rec.batch_number);
  const [pending, start] = useTransition();

  /* Четыре обязательных поля записи. Каждая галочка — настоящая проверка,
     а не пересказ: неполная запись стоит доказательства на выдаче. */
  const hasSku = !!rec.sku;
  const hasImage = rec.renders.length > 0;
  const hasLights = rec.renders.length === 3;
  const confirmed = !!rec.confirmed_at && rec.honesty_shown;
  const complete = hasSku && hasImage && hasLights && confirmed;

  const day = rec.renders.find(r => r.variant === 'day')?.storage_path ?? '';
  const cloud = rec.renders.find(r => r.variant === 'overcast')?.storage_path ?? '';
  const park = rec.renders.find(r => r.variant === 'parking')?.storage_path ?? '';
  const confirmedAt = new Date(rec.confirmed_at).toLocaleString('ru-RU',
    { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  const scan = (roll: Roll) => start(async () => {
    const r = await verifyRollAtBay(rec.order_id, roll.id);
    if (r.ok) {
      setBatch(r.batch ?? roll.batch_number);
      setWrong(null); setReason(null); setStep('matched');
      router.refresh();
      return;
    }
    setReason(r.reason);
    if (r.kind === 'mismatch') {
      setWrong(r.scanned ?? roll.sku);
      setScannedAt(new Date().toLocaleString('ru-RU',
        { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
      setReported(false);
      setStep('blocked');
    } else {
      setStep('broken');
    }
  });

  const wrap = (bg: string, children: React.ReactNode, gap = "12px") => (
    <div data-surface="bay" style={{ background: "#2A2A2A", minHeight: "100vh",
      display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ ...PHONE, background: bg, gap }}>{children}</div>
    </div>
  );

  /* 40–41 · запись и её полнота */
  if (step === 'record') return wrap("#EFEFEF", <>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "0 4px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Наряд {rec.number}</span>
        <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>{rec.client_name} · {rec.vehicle} · пост №2</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", background: complete ? "#DEF23B" : "#FBEEEF", borderRadius: "999px", padding: "8px 12px", flex: "none" }}>
        {complete
          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.6" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="2.2" strokeLinecap="round"><path d="M12 8v4M12 15.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>}
        <span style={{ fontSize: "11.5px", fontWeight: "600", color: complete ? "#111111" : "#D93F45" }}>{complete ? 'Полная' : 'Неполная'}</span>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Артикул</span>
      <span style={{ fontSize: "28px", fontWeight: "500", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{rec.brand} {rec.sku}</span>
      <span style={{ fontSize: "13px", color: "#6E6E6E" }}>{rec.item_name}{rec.meters_required ? ` · ${rec.meters_required} м` : ''}</span>
    </div>

    {complete ? <>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "168px", position: "relative", flex: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={day} alt="картинка, которую видел клиент" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: "12px", top: "12px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "6px 12px" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Это видел клиент</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "7px" }}>
        {[[day, 'День'], [cloud, 'Пасмурно'], [park, 'Паркинг']].map(([src, label]) => (
          <div key={label} style={{ flex: "1", display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ height: "56px", borderRadius: "14px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: "10px", textAlign: "center", color: "#6E6E6E" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#111111", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", gap: "12px" }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>Клиент подтвердил выбор</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>{confirmedAt} · оговорка про свет показана до подтверждения</span>
        </div>
      </div>

      <button onClick={() => setStep('scan')}
        style={{ ...PILL, marginTop: "auto", background: "#DEF23B", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M7 12h10" /></svg>
        <span style={{ fontSize: "16px", fontWeight: "500" }}>Сверить рулон</span>
      </button>
    </> : <>
      {/* 41 · неполная запись. Продукт не блокирует работу, но показывает
          цену решения: блокирует только МС-3, и только несовпавший рулон. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {([['Артикул есть', hasSku], ['Картинка есть', hasImage],
           ['Три света есть', hasLights]] as [string, boolean][]).map(([label, ok]) => (
          <div key={label} style={{ background: ok ? "#FFFFFF" : "#FBEEEF", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ok ? "#111111" : "#D93F45"} strokeWidth="2.4" strokeLinecap="round" style={{ flex: "none" }}>
              {ok ? <path d="M5 13l4.5 4.5L19 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
            </svg>
            <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500", color: ok ? "#111111" : "#8A4448" }}>{label}</span>
          </div>
        ))}
        <div style={{ background: confirmed ? "#FFFFFF" : "#FBEEEF", borderRadius: "20px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={confirmed ? "#111111" : "#D93F45"} strokeWidth="2.4" strokeLinecap="round" style={{ flex: "none" }}>
            {confirmed ? <path d="M5 13l4.5 4.5L19 7" /> : <path d="M6 6l12 12M18 6L6 18" />}
          </svg>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500", color: confirmed ? "#111111" : "#8A4448" }}>
              {confirmed ? 'Клиент подтвердил выбор' : 'Клиент не подтверждал выбор'}</span>
            {!confirmed && (
              <span style={{ fontSize: "11.5px", color: "#8A4448" }}>
                {rec.confirmed_at ? 'Оговорка про свет не показана до подтверждения'
                                  : 'Цвет согласовали голосом'}</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={CAPTION}>Что это значит для вас</span>
        <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>На выдаче доказательства не будет: собственная запись мастера в споре не работает. Попросите менеджера отправить примерку — клиент подтвердит одним касанием.</span>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <button disabled={pending || asked}
          onClick={() => start(async () => { await requestConfirmation(rec.order_id); setAsked(true); })}
          style={{ ...PILL, padding: "20px 0", fontSize: "15px", background: asked ? "#DEF23B" : "#111111", color: asked ? "#111111" : "#FFFFFF", cursor: asked ? "default" : "pointer" }}>
          {asked ? 'Запрос ушёл менеджеру' : 'Запросить подтверждение'}
        </button>
        <button onClick={() => setStep('scan')}
          style={{ ...PILL, padding: "18px 0", fontSize: "14.5px", background: "#F5F5F5", color: "#6E6E6E" }}>
          Всё равно начать · на свой риск
        </button>
      </div>
    </>}
  </>);

  /* 42 · сканирование, тёмный экран */
  if (step === 'scan') return wrap("#1A1A1A", <>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
      <button onClick={() => setStep('record')} aria-label="Назад к наряду" style={{ width: "38px", height: "38px", borderRadius: "999px", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: 0, cursor: "pointer" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
      </button>
      <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Штрихкод на рулоне</span>
    </div>
    <div style={{ flex: "1", borderRadius: "26px", background: "#2A2A2A", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "232px", height: "152px", borderRadius: "18px", boxShadow: "0 0 0 3px #DEF23B", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", padding: "20px" }}>
        {[3, 6, 2, 8, 3, 2, 7, 3, 5, 2].map((w, i) => (
          <span key={i} style={{ width: `${w}px`, height: "70px", background: "#DEF23B" }}></span>
        ))}
      </div>
      <span style={{ position: "absolute", bottom: "24px", fontSize: "12.5px", color: "#9A9A9A" }}>Наведите на этикетку рулона</span>
    </div>
    <div style={{ background: "rgba(255,255,255,.08)", borderRadius: "22px", padding: "15px 17px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <span style={{ ...CAPTION, color: "#6E6E6E" }}>Ожидаем</span>
      <span style={{ fontSize: "20px", fontWeight: "500", color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{rec.brand} {rec.sku}</span>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Артикул на рулоне физически отличается от артикула в голове менеджера — поэтому сверка обязательна до старта.</span>
    </div>
    {/* Доступность: сканер обязан иметь ручную альтернативу — в боксе камера
        часто не читает грязный штрихкод. Здесь это список рулонов точки. */}
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ ...CAPTION, color: "#6E6E6E", padding: "0 4px" }}>Ввести вручную</span>
      {rolls.map(r => (
        <button key={r.id} onClick={() => scan(r)} disabled={pending}
          style={{ background: "rgba(255,255,255,.08)", borderRadius: "18px", padding: "16px 17px", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit", color: "#FFFFFF", width: "100%" }}>
          <span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{r.sku}</span>
          <span style={{ fontSize: "12px", color: "#9A9A9A", fontVariantNumeric: "tabular-nums" }}>партия {r.batch_number} · {r.meters_left} м</span>
        </button>
      ))}
      {!rolls.length && (
        <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#9A9A9A", padding: "0 4px" }}>На складе точки нет ни одного непогашенного рулона — сверять не с чем. Позовите менеджера.</span>
      )}
    </div>
  </>, "14px");

  /* 43 · артикул сошёлся, работы разблокированы */
  if (step === 'matched') return wrap("#EFEFEF", <>
    <div style={{ background: "#DEF23B", borderRadius: "28px", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
        </div>
        <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Артикул сошёлся</span>
      </div>
      <div style={{ display: "flex", gap: "9px" }}>
        <div style={{ flex: "1", background: "rgba(255,255,255,.6)", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "10.5px", opacity: ".6" }}>в записи</span>
          <span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rec.sku}</span>
        </div>
        <div style={{ flex: "1", background: "rgba(255,255,255,.6)", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "10.5px", opacity: ".6" }}>рулон{batch ? ` · партия ${batch}` : ''}</span>
          <span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rec.sku}</span>
        </div>
      </div>
      <span style={{ fontSize: "12px", lineHeight: "1.45", opacity: ".7" }}>
        {batch ? `Партия ${batch} записана в карточку клиента. На выдаче она будет видна.`
               : 'Партия записана в карточку клиента. На выдаче она будет видна.'}</span>
    </div>
    <div style={{ borderRadius: "26px", overflow: "hidden", height: "200px", position: "relative", flex: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={day} alt="цель работы" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: "12px", top: "12px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "6px 12px" }}>
        <span style={{ fontSize: "11.5px", fontWeight: "500" }}>Цель работы</span>
      </div>
    </div>
    <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Метраж</span>
        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rec.meters_required ?? '—'} м</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Партия рулона</span>
        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{batch ?? '—'}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Сумма наряда</span>
        <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{money(rec.price_kopecks)}</span>
      </div>
    </div>
    <button onClick={() => setStep('handover')}
      style={{ ...PILL, marginTop: "auto", padding: "22px 0", background: "#111111", color: "#FFFFFF" }}>
      Начать оклейку
    </button>
  </>, "14px");

  /* 44 · рулон другой, наряд заблокирован */
  if (step === 'blocked') return wrap("#EFEFEF", <>
    <div style={{ background: "#FBEEEF", borderRadius: "28px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#D93F45", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </div>
        <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em", color: "#8A4448" }}>Рулон не тот</span>
      </div>
      <div style={{ display: "flex", gap: "9px" }}>
        <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>в записи клиента</span>
          <span style={{ fontSize: "15px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rec.sku}</span>
        </div>
        <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>скан рулона</span>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#D93F45", fontVariantNumeric: "tabular-nums" }}>{wrong}</span>
        </div>
      </div>
      <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#8A4448" }}>Закрытие наряда заблокировано до сверки. Если поедете дальше — спор на выдаче будет вашим, а переклейка стоит 50–150 тыс. ₽ плёнки и неделю занятого поста.</span>
    </div>
    <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={CAPTION}>Что дальше</span>
      <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Диалог с клиентом уже существует — менеджер объяснит сам, повторно рассказывать не надо. Уведомление уходит одним действием.</span>
    </div>
    {/* Расхождение записано автоматически: доказательство не должно зависеть
        от того, нажал мастер кнопку или нет. Кнопка — только уведомление. */}
    <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
      <span style={CAPTION}>Записано в карточку</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
        <span style={{ fontSize: "12.5px" }}>Скан рулона {wrong}{scannedAt ? `, ${scannedAt}` : ''}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none" }}></span>
        <span style={{ fontSize: "12.5px" }}>Расхождение с подтверждённым выбором</span>
      </div>
    </div>
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
      <button disabled={pending || reported}
        onClick={() => start(async () => { await reportMismatch(rec.order_id); setReported(true); })}
        style={{ ...PILL, fontSize: "15px", background: reported ? "#DEF23B" : "#111111", color: reported ? "#111111" : "#FFFFFF", cursor: reported ? "default" : "pointer" }}>
        {reported ? 'Менеджер уведомлён' : 'Сообщить менеджеру · 1 действие'}
      </button>
      <button onClick={() => setStep('scan')}
        style={{ ...PILL, padding: "18px 0", fontSize: "14.5px", background: "#F5F5F5", color: "#111111" }}>
        Сканировать другой рулон
      </button>
    </div>
  </>, "14px");

  /* Сверка не состоялась. Красного здесь нет: необратимого не случилось,
     наряд просто остался незаверенным. Отказ с подсказкой, а не «упс». */
  if (step === 'broken') return wrap("#EFEFEF", <>
    <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="2.2" strokeLinecap="round"><path d="M12 7v6M12 16.4v.5" /><circle cx="12" cy="12" r="9" /></svg>
        </div>
        <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Сверка не прошла</span>
      </div>
      <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Это не про рулон: он мог быть верным. Не сработала сама сверка, поэтому наряд остался незаверенным и в работу не переведён.</span>
      <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "12px 14px" }}>
        <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#6E6E6E", wordBreak: "break-word" }}>{reason}</span>
      </div>
    </div>
    <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={CAPTION}>Что дальше</span>
      <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Повторите сверку. Если повторится — позовите менеджера и назовите ему текст выше: начинать оклейку без сверки нельзя, это та самая переклейка за счёт точки.</span>
    </div>
    <button onClick={() => setStep('scan')}
      style={{ ...PILL, marginTop: "auto", background: "#111111", color: "#FFFFFF" }}>
      Повторить сверку
    </button>
  </>, "14px");

  /* 45–46 · выдача и закрытие */
  return wrap("#EFEFEF", <>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
      <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.025em" }}>
        {step === 'done' ? 'Сдано с первого раза' : 'Выдача'}</span>
      <span style={{ marginLeft: "auto", fontSize: "11.5px", color: "#6E6E6E" }}>
        {step === 'done' ? `Наряд ${rec.number}` : 'разверните телефон клиенту'}</span>
    </div>
    <div style={{ background: "#111111", borderRadius: "28px", padding: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "2px 4px 0" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#FFFFFF" }}>Вы подтвердили этот выбор</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{confirmedAt} · {rec.brand} {rec.sku}{batch ? ` · партия ${batch}` : ''}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ height: "150px", borderRadius: "16px", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={day} alt="день" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[[cloud, 'пасмурно'], [park, 'паркинг']].map(([src, alt]) => (
            <div key={alt} style={{ flex: "1", height: "84px", borderRadius: "13px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
          {['День', 'Пасмурно', 'Паркинг'].map((l, i) => (
            <span key={l} style={{ fontSize: "10px", fontWeight: "500", borderRadius: "999px", padding: "3px 9px",
              background: i === 0 ? "#DEF23B" : "#3E3E3E", color: i === 0 ? "#111111" : "#9A9A9A" }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "#3E3E3E", borderRadius: "14px", padding: "11px 13px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
        <span style={{ fontSize: "11.5px", lineHeight: "1.45", color: "#C4C4C4" }}>{rec.honesty_line}</span>
      </div>
    </div>

    {step !== 'done' && <>
      <button onClick={() => start(async () => { await closeWork(rec.order_id); setStep('done'); router.refresh(); })}
        disabled={pending}
        style={{ ...PILL, marginTop: "auto", fontSize: "15.5px", background: "#DEF23B", color: "#111111" }}>
        Закрыть работу
      </button>
      <span style={{ fontSize: "10.5px", color: "#6E6E6E", textAlign: "center" }}>Одним действием из наряда у поста · без захода в кабинет, ноль ввода текста</span>
    </>}

    {step === 'done' && <>
      {/* 46 · след возникает сам: мастер не заполняет отчётов. */}
      <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
        <span style={CAPTION}>Ваша смена</span>
        {/* Третья цифра — доля, а не штуки: числа сверенных нарядов доска
            не отдаёт, а выводить его из процента значит выдумывать. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
          {[[String(month.done), 'сдано за месяц'], [String(month.redo), 'переклеек'],
            [`${month.verified}%`, 'со сверкой рулона']].map(([n, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "28px", fontWeight: "500", letterSpacing: "-0.035em", lineHeight: "1" }}>{n}</span>
              <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ height: "36px", borderRadius: "999px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#D6D6D6 0 1px,transparent 1px 5px)", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(month.verified, 22)}%`, height: "36px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "14px" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{month.verified}% со сверкой</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={CAPTION}>Гарантийный талон</span>
        {warranty
          ? <a href={`/doc/warranty/${rec.order_id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: "500" }}>№ {warranty.number} · {warranty.months} мес.</span>
                <span style={{ fontSize: "11px", color: "#6E6E6E" }}>открыть и отдать клиенту</span>
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M10 6l6 6-6 6" /></svg>
            </a>
          : <span style={{ fontSize: "12px", color: "#6E6E6E", lineHeight: "1.45" }}>Ещё не выписан. Талон заводится по закрытому наряду — работа закрыта, дело за менеджером.</span>}
      </div>

      {next && (
        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "18px", display: "flex", flexDirection: "column", gap: "9px" }}>
          <span style={CAPTION}>Следующий наряд</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "56px", height: "42px", borderRadius: "12px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {next.thumb && <img src={next.thumb} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{next.client}{next.vehicle ? ` · ${next.vehicle}` : ''}</span>
              <span style={{ fontSize: "11px", color: "#6E6E6E" }}>замер {next.when}</span>
            </div>
          </div>
        </div>
      )}

      <a href={next ? `/measure/${next.id}` : '/bay'}
        style={{ ...PILL, marginTop: "auto", padding: "20px 0", fontSize: "15px", background: "#111111", color: "#FFFFFF", textDecoration: "none", display: "block" }}>
        {next ? 'Открыть следующий' : 'К моим нарядам'}
      </a>
    </>}
  </>);
}
