'use client';
/**
 * Состояния гаража, которые накрывают шторку целиком: сравнение, тёплый
 * отказ по кадру, исчерпанный потолок и сохранённые сборки.
 *
 * Разметка из design/design/03-phase3-client-garage.dc.html:
 *   кадр 09 «Сравнение рядом»              — строка 440
 *   кадр 12 «Лимит исчерпан»               — строка 561
 *   кадр 13 «Фото непригодно»              — строка 602
 *   кадр 15 «Сохранено · публичная страница» — строка 666
 *
 * Все четыре — накладки поверх той же рамки 390×790, а не отдельные
 * маршруты. Это не экономия файлов: человек не уходит со своей машины и
 * возвращается к ней одним нажатием, а адрес остаётся тем же, что он
 * получил от точки.
 */
import { useState, type ReactNode } from 'react';
import { HONESTY_LINE } from '@/lib/domain';
import { FINISH, FINISH_BETWEEN, type Item, type Save, rub } from './model';

/** Общая рамка накладки: те же 390×790, тот же фон. */
function Sheet({ gap, children }: { gap: string; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: "0", background: "#EFEFEF", zIndex: 5,
      display: "flex", flexDirection: "column", padding: "26px 14px 16px", gap,
      overflowY: "auto" }}>{children}</div>
  );
}

function Back({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} aria-label="Назад"
      style={{ width: "34px", height: "34px", borderRadius: "999px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", border: 0, cursor: "pointer", padding: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6l-6 6 6 6" /></svg>
      <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>{title}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Кадр 32 · сравнение двух вариантов рядом
 * ───────────────────────────────────────────────────────────── */

/**
 * Два варианта в одном экране.
 *
 * Экономический смысл, записанный в подписи к кадру: человек перестаёт
 * крутить каталог и начинает выбирать из двух. Каждый круг каталога — это
 * три генерации; сравнение их не тратит вовсе, потому что оба кадра уже
 * посчитаны.
 *
 * Пустого слота Б в макете нет — там оба варианта уже выбраны. Но кнопка
 * «Сравнить рядом» живёт на основном экране с первого нажатия, и молчать
 * в ответ она не должна: слот Б показывает штриховку и зовёт выбрать
 * второй вариант тем же языком, что и «нет в прайсе».
 */
export function Compare({ a, b, lightLabel, pic, onBack, onReplace, onTake }: {
  a: Item | null; b: Item | null; lightLabel: string;
  pic: (i: Item) => string;
  onBack: () => void; onReplace: (slot: 'a' | 'b') => void; onTake: (i: Item) => void;
}) {
  return (
    <Sheet gap="11px">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <Back onClick={onBack} title="Вернуться к выбору" />
        <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Что взять</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", background: "#FFFFFF", borderRadius: "999px", padding: "7px 11px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ fontSize: "11px", fontWeight: "500" }}>{lightLabel}</span>
        </div>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "10px", minHeight: "0" }}>
        <Side item={a} pic={pic} lead onPick={() => onReplace('a')} />
        <Side item={b} pic={pic} onPick={() => onReplace('b')} />
      </div>

      {/* О-2 · оговорка не отключается и здесь: разница фактур вживую
          сильнее, чем на экране, и именно на сравнении это решает. */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", borderRadius: "20px", padding: "11px 13px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 3l7.5 4v6c0 4.2-3.1 6.9-7.5 8-4.4-1.1-7.5-3.8-7.5-8V7z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></svg>
        <span style={{ fontSize: "10.5px", lineHeight: "1.4", color: "#2E2E2E" }}>
          {a && b && a.finish !== b.finish
            ? `Разница между ${FINISH_BETWEEN[a.finish] ?? a.finish} и ${FINISH_BETWEEN[b.finish] ?? b.finish} вживую сильнее, чем на экране. Сверим с рулоном при вас.`
            : HONESTY_LINE}</span>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => onReplace('b')}
          style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "14px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Заменить Б</span></button>
        <button onClick={() => a && onTake(a)} disabled={!a}
          style={{ flex: "1", background: a ? "#DEF23B" : "#E2E2E2", borderRadius: "999px", padding: "14px 0", textAlign: "center", border: 0, cursor: a ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          <span style={{ fontSize: "13px", fontWeight: "500", color: a ? "#111111" : "#9A9A9A" }}>
            {a ? `Беру ${FINISH[a.finish] ?? 'этот вариант'}` : 'Выберите вариант'}</span></button>
      </div>
    </Sheet>
  );
}

function Side({ item, pic, lead, onPick }: {
  item: Item | null; pic: (i: Item) => string; lead?: boolean; onPick: () => void;
}) {
  if (!item) return (
    <button onClick={onPick}
      style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "0", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <div style={{ flex: "1", borderRadius: "18px", minHeight: "0", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.9" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
        <span style={{ fontSize: "13px", fontWeight: "500", color: "#6E6E6E" }}>Выберите второй вариант</span>
      </div>
    </button>
  );
  return (
    <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", minHeight: "0", ...(lead ? { boxShadow: "0 0 0 3px #DEF23B" } : {}) }}>
      <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pic(item)} alt={lead ? 'вариант А' : 'вариант Б'}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 3px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.name}</span>
          <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>{item.brand} {item.sku} · {item.finish}</span>
        </div>
        <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>{rub(item.price_kopecks)}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Кадр 36 · фото непригодно, тёплый отказ
 * ───────────────────────────────────────────────────────────── */

/**
 * Отказ по кадру.
 *
 * Три обязательных части, и ни одну нельзя убрать: что не так, что снять
 * иначе, и чем заняться прямо сейчас. Отказ без третьей части выгоняет
 * человека с готовым снимком — а «тупика нет ни на одном шаге» записано
 * подписью прямо под этим кадром макета.
 */
export function Reject({ headline, hint, onFile, onFallback }: {
  headline: string; hint: string;
  onFile: (f: File | null) => void; onFallback: () => void;
}) {
  return (
    <Sheet gap="14px">
      <div style={{ height: "190px", flex: "none", borderRadius: "26px", background: "#2E2E2E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "11px" }}>
        <svg width="34px" height="34px" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.5" strokeLinecap="round"><path d="M4 20L20 4" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
        <span style={{ fontSize: "12px", color: "#6E6E6E" }}>ваш кадр</span>
      </div>
      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "13px" }}>
        <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.025em", lineHeight: "1.15" }}>{headline}</span>
        <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>{hint}</span>
        <div style={{ display: "flex", gap: "7px" }}>
          <label style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Снять заново</span>
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
              onChange={e => onFile(e.target.files?.[0] ?? null)} />
          </label>
          <label style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "14px 0", textAlign: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>Галерея</span>
            <input type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => onFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </div>
      {/* Мгновенный фолбэк, а не пустой отказ: типовой кузов уже посчитан. */}
      <button onClick={onFallback}
        style={{ background: "#DEF23B", borderRadius: "26px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <div style={{ width: "74px", height: "56px", borderRadius: "14px", overflow: "hidden", flex: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renders/render-07.png" alt=""
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <span style={{ flex: "1", fontSize: "12px", lineHeight: "1.45" }}>
          А пока смотрите цвета на типовом кузове — уже готово, ничего ждать не нужно</span>
      </button>
      <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
        <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
          Кадр остался у вас: он не ушёл на сервер и не сохранён. Проверка идёт
          прямо в телефоне, до отправки.</span>
      </div>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Кадр 35 · лимит исчерпан, мягкая деградация
 * ───────────────────────────────────────────────────────────── */

/**
 * Потолок генераций пройден.
 *
 * «Исчерпание лимита никогда не выглядит поломкой и не оставляет клиента в
 * тупике — это отдельное требование, а не оптимизация» (подпись к кадру 12
 * макета). Поэтому здесь нет ни одного отключённого элемента: последняя
 * примерка на месте, готовые кадры листаются дальше, разговор с точкой
 * открыт.
 *
 * Поля телефона здесь НЕТ, хотя макет его рисует. Причина — в отчёте:
 * обещание «оставьте номер, откроем ещё десять» этой системой сегодня не
 * обеспечено, потолок стоит на бюджете точки и от контакта клиента не
 * зависит. Поле, которое ничего не открывает, — это то самое поле до
 * первой примерки, которое запрещает Г-1, только в конце пути.
 */
export function Limit({ reason, hero, ready, onPick, onClose, onContact, onPhone,
                       pointName, kind }: {
  reason: string; hero: string; pointName: string;
  kind: 'day' | 'budget';
  ready: { item: Item; pic: string }[];
  onPick: (i: Item) => void; onClose: () => void; onContact: () => void;
  onPhone: (phone: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Sheet gap="14px">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <Back onClick={onClose} title="Вернуться к машине" />
        <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em" }}>Крутить дальше можно</span>
      </div>
      <div style={{ borderRadius: "26px", overflow: "hidden", height: "200px", flex: "none", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="последняя примерка"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: "0", background: "rgba(17,17,17,.1)" }}></div>
        <span style={{ position: "absolute", left: "12px", bottom: "12px", fontSize: "10.5px", fontWeight: "500", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 11px" }}>последняя новая примерка</span>
      </div>

      {/* Деградация в кэш, а не отказ: готовые кадры остаются доступны,
          и все три света у них на месте (О-2). */}
      <div style={{ display: "flex", gap: "7px" }}>
        {ready.map(r => (
          <button key={r.item.point_price_id} onClick={() => onPick(r.item)}
            style={{ flex: "1", height: "58px", borderRadius: "14px", overflow: "hidden", border: 0, padding: 0, cursor: "pointer", background: "transparent" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.pic} alt={r.item.name}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
        <div style={{ flex: "1", height: "58px", borderRadius: "14px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "9.5px", color: "#6E6E6E", textAlign: "center", lineHeight: "1.3" }}>готовое<br />превью</span>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "13px", lineHeight: "1.45", color: "#6E6E6E" }}>
          Новые кадры на вашей машине закончились на сегодня. Готовые остаются:
          их можно листать и сравнивать, они мгновенные.</span>
        {/* Причину отказа называет база, а не этот экран. */}
        <div style={{ background: "#F5F5F5", borderRadius: "16px", padding: "11px 13px" }}>
          <span style={{ fontSize: "11px", lineHeight: "1.45", color: "#6E6E6E" }}>{reason}</span>
        </div>
        {/* Г-9 · мягкий переход, не жёсткий блок. Поле появляется ПОСЛЕ трёх
            примерок, а не до первой, — это не нарушение Г-1, а его обратная
            сторона: сначала показываем, потом просим.

            Спрашиваем только когда выход есть. Если упёрлись в деньги точки,
            телефон не откроет ничего, и предлагать его было бы издевательством:
            клиент оставил бы номер и не получил обещанного. */}
        {kind === 'day' && !said && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#111111" }}>
              Оставьте номер — откроем ещё двенадцать сегодня, а собранное
              сохранится за вами.</span>
            <div style={{ display: "flex", gap: "7px" }}>
              <input value={phone} onChange={e => { setPhone(e.target.value); setErr(null); }}
                inputMode="tel" placeholder="+7 900 000-00-00" aria-label="Ваш телефон"
                style={{ flex: "1", minWidth: 0, border: 0, background: "#F5F5F5", borderRadius: "999px", padding: "14px 16px", fontSize: "13.5px", fontFamily: "inherit", color: "#111111", outline: "none" }} />
              <button type="button" disabled={busy || phone.trim().length < 10}
                onClick={async () => {
                  setBusy(true); setErr(null);
                  const r = await onPhone(phone.trim());
                  setBusy(false);
                  if (r.ok) setSaid('Готово — открыли пятнадцать примерок на сегодня.');
                  else setErr(r.error ?? 'Не получилось');
                }}
                style={{ flex: "none", border: 0, fontFamily: "inherit", cursor: busy || phone.trim().length < 10 ? "default" : "pointer", background: phone.trim().length < 10 ? "#C4C4C4" : "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "14px 18px", fontSize: "13.5px", fontWeight: "500" }}>
                {busy ? '…' : 'Открыть'}
              </button>
            </div>
            {err && <span style={{ fontSize: "11px", color: "#8A4448" }}>{err}</span>}
            <span style={{ fontSize: "10.5px", lineHeight: "1.45", color: "#9A9A9A" }}>
              Номер уходит {pointName}, чтобы ответить вам. Больше ничего с ним
              не делаем.</span>
          </div>
        )}

        {said && (
          <div style={{ background: "#F5FBCB", borderRadius: "16px", padding: "12px 14px", fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>{said}</div>
        )}

        <button onClick={onContact}
          style={{ background: kind === 'day' && !said ? "#FFFFFF" : "#111111", boxShadow: kind === 'day' && !said ? "inset 0 0 0 1px #E2E2E2" : "none", borderRadius: "999px", padding: "16px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: kind === 'day' && !said ? "#111111" : "#FFFFFF" }}>Написать точке</span></button>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
          Собранное не пропадёт, даже если закроете страницу: сборка живёт в
          ссылке, а не в регистрации</span>
      </div>

      <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px" }}>
        <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
          {kind === 'day'
            ? <>Счёт обнуляется завтра. Ни цена, ни артикул, ни три света от
                этого не меняются.</>
            : <>Новые кадры откроются, когда {pointName} продлит запас генераций.
                Ни цена, ни артикул, ни три света от этого не меняются.</>}</span>
      </div>
    </Sheet>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Кадр 38 · сохранённые сборки и ссылка для шеринга
 * ───────────────────────────────────────────────────────────── */

/**
 * Ваши сборки.
 *
 * Сборка живёт в ссылке: `/g/{точка}?set=артикул.артикул`. Ссылка не
 * протухает по построению — за ней нет ни строки, которой можно истечь, —
 * и открывается без регистрации, потому что открывать нечего: цены и
 * наличие перечитываются из прайса ТОЙ ЖЕ точки на каждом открытии (О-3).
 * Подорожала плёнка — ссылка друга покажет новую цену, а не вчерашнюю.
 *
 * Список «ваших сборок» лежит на устройстве человека. Г-1: у нас его ещё
 * нет, и заводить его ради списка — это регистрация с чёрного хода.
 */
export function Saved({ saves, items, link, copied, pic, onCopy, onOpen, onMore, onSend, onClose }: {
  saves: Save[]; items: Item[]; link: string; copied: boolean;
  pic: (s: Save) => string;
  onCopy: () => void; onOpen: (s: Save) => void;
  onMore: () => void; onSend: () => void; onClose: () => void;
}) {
  const name = (s: Save) => s.skus
    .map(sku => items.find(i => i.sku === sku)?.name)
    .filter(Boolean).join(' + ') || 'Пустая сборка';
  const when = (t: number) => new Date(t).toLocaleDateString('ru-RU',
    { day: 'numeric', month: 'long' });
  const top = saves[0];

  return (
    <Sheet gap="13px">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
        <Back onClick={onClose} title="Вернуться к машине" />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "21px", fontWeight: "500", letterSpacing: "-0.025em" }}>Ваши сборки</span>
          <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>Не протухают · открываются без регистрации</span>
        </div>
      </div>

      {top ? (
        <div style={{ position: "relative", height: "210px", flex: "none" }}>
          {saves.length > 2 && <div style={{ position: "absolute", left: "16px", right: "16px", top: "0", height: "18px", background: "#FFFFFF", borderRadius: "16px", opacity: ".5" }}></div>}
          {saves.length > 1 && <div style={{ position: "absolute", left: "8px", right: "8px", top: "8px", height: "22px", background: "#FFFFFF", borderRadius: "18px", opacity: ".75" }}></div>}
          <button onClick={() => onOpen(top)}
            style={{ position: "absolute", left: "0", right: "0", top: "16px", bottom: "0", background: "#FFFFFF", borderRadius: "26px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <div style={{ flex: "1", borderRadius: "18px", overflow: "hidden", minHeight: "0", width: "100%" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pic(top)} alt=""
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 5px 2px", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{name(top)}</span>
                <span style={{ fontSize: "10px", color: "#9A9A9A" }}>сохранено {when(top.at)}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>{rub(top.total)}</span>
            </div>
          </button>
        </div>
      ) : (
        <div style={{ height: "210px", flex: "none", borderRadius: "26px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E6E6E6 0 1px,transparent 1px 6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#6E6E6E" }}>Здесь пока пусто</span>
          <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45", maxWidth: "230px" }}>
            Соберите цвет, диски и салон — и сохраните. Сборка откроется по
            ссылке у кого угодно, без входа.</span>
        </div>
      )}

      <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Ссылка для жены и чата друзей</span>
        <button onClick={onCopy}
          style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "14px", padding: "12px 14px", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
          <span style={{ flex: "1", fontSize: "12px", color: "#6E6E6E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{copied ? 'Ссылка скопирована' : link}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M15 5H6a2 2 0 00-2 2v9" /></svg>
        </button>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
          Цены в ссылке живые: она открывает прайс этой точки, а не слепок
          вчерашнего дня.</span>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
        <button onClick={onMore}
          style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "15px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Собрать ещё</span></button>
        <button onClick={onSend}
          style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "15px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Отправить точке</span></button>
      </div>
    </Sheet>
  );
}
