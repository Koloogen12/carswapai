'use client';
/**
 * Экран 01 хендоффа — «Подключение каналов, самый опасный экран продукта».
 *
 * Разметка перенесена из design/design/06-phase6-owner-network.dc.html,
 * блок 1: строка канала — фон #F7F7F7, радиус 20, отбивка 16/18, кружок 34px,
 * название 15/500, пояснение 11.5 #6E6E6E, кнопка-таблетка 11/17 и 12.5/500.
 * Отказ — фон #FBEEEF и текст #8A4448. Подсказка — #F5FBCB, радиус 20.
 * Ни одно значение стиля не тронуто; статические строки заменены данными.
 *
 * ЧТО В ЭТОМ ЭКРАНЕ ПРОДУКТОВОГО, А НЕ ВЁРСТОЧНОГО:
 *
 *   · «1 из 3» — это НЕ ошибка и не блокировка. В хендоффе прямо сказано:
 *     точка рабочая уже на одном канале, остальные — список на потом.
 *     Поэтому неподключённые каналы не красные и ничего не перекрывают.
 *
 *   · У отказа всегда есть причина И следующее действие. «Не работает» без
 *     причины — ровно тот случай, ради которого точка звонит в управляющую
 *     компанию, а обещано обратное.
 *
 *   · Возможности канала показаны ДО отправки и взяты у адаптера. Менеджер
 *     обязан узнать «писать первым нельзя» от нас, а не от молчащего
 *     клиента.
 *
 *   · Кнопки не прячутся от менеджера. Прятать нечего: проверка стоит на
 *     сервере и в базе, а спрятанная кнопка только скрывает правило вместо
 *     того, чтобы его объяснить.
 */
import { useState, useTransition } from 'react';
import {
  connectChannel, disconnectChannel, rebindChannel, recheckChannel,
} from '@/lib/channels';
import type { ChannelOffer, ChannelView, ChannelsScreen } from '@/lib/channels';
import { Card, CardHead } from '@/screens/cabinet';

type Banner = { tone: 'ok' | 'bad'; text: string } | null;

export function ChannelsView({ data, pointName }: { data: ChannelsScreen; pointName: string }) {
  const [pending, start] = useTransition();
  const [banner, setBanner] = useState<Banner>(null);
  // Какой канал сейчас перепривязывают и какой канал добавляют. Раскрытая
  // форма — состояние экрана, а не отдельная страница: повторная привязка
  // должна занимать секунды, а не переход и возврат.
  const [rebinding, setRebinding] = useState<string | null>(null);
  const [rebindId, setRebindId] = useState('');
  const [offer, setOffer] = useState<ChannelOffer | null>(null);
  const [newId, setNewId] = useState('');

  const run = (fn: () => Promise<{ ok: boolean; note?: string; error?: string }>) =>
    start(async () => {
      setBanner(null);
      const r = await fn();
      setBanner(r.ok
        ? { tone: 'ok', text: r.note ?? 'Готово' }
        : { tone: 'bad', text: r.error ?? 'Не удалось' });
      if (r.ok) { setRebinding(null); setRebindId(''); setOffer(null); setNewId(''); }
    });

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>Запуск точки · день 1</span>
          <span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.03em" }}>{pointName}</span>
        </div>
        <div style={{ display: "flex", gap: "5px", background: "#FFFFFF", borderRadius: "999px", padding: "5px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", background: "#111111", color: "#FFFFFF" }}>Запуск</span>
          <a href="/price" style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", color: "#6E6E6E" }}>Прайс</a>
          <a href="/owner" style={{ fontSize: "12.5px", fontWeight: "500", borderRadius: "999px", padding: "10px 18px", color: "#6E6E6E" }}>Сводка</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "16px", alignItems: "start" }}>
        <Card gap="18px">
          <CardHead title="Подключение каналов"
            note={`${data.connected} из ${data.total || 1} · ни одного звонка в УК`} />

          {banner && (
            <div style={{ background: banner.tone === 'ok' ? "#F5FBCB" : "#FBEEEF", borderRadius: "20px", padding: "15px 17px", display: "flex", alignItems: "flex-start", gap: "11px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke={banner.tone === 'ok' ? "#111111" : "#8A4448"} strokeWidth="1.7"
                strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}>
                <circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
              <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: banner.tone === 'ok' ? "#2E2E2E" : "#8A4448" }}>{banner.text}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {data.channels.map(ch => (
              <ChannelRow key={ch.id} ch={ch} pending={pending}
                rebinding={rebinding === ch.id} rebindId={rebindId}
                onRebindId={setRebindId}
                onOpenRebind={() => { setRebinding(rebinding === ch.id ? null : ch.id); setRebindId(''); }}
                onRecheck={() => run(() => recheckChannel(ch.id))}
                onDisconnect={() => run(() => disconnectChannel(ch.id))}
                onRebind={() => run(() => rebindChannel(ch.id, rebindId))} />
            ))}
            {data.channels.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
                <span style={{ fontSize: "13.5px", color: "#6E6E6E" }}>
                  Каналов пока нет. Точка станет рабочей на первом же — остальные можно оставить на потом.
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", background: "#F5FBCB", borderRadius: "20px", padding: "15px 17px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v.5M12 11.5v4.5" /></svg>
            <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>Точка рабочая уже на одном канале. Остальные — список на потом, а не блокирующая ошибка. Каждый тупик решается внутри продукта, а не звонком в управляющую компанию — это главный критерий плательщика.</span>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Подключение нового канала. Поле здесь ровно одно, и это
              идентификатор канала, а не ключ доступа: ключи берутся из
              переменных окружения и в базу не попадают. */}
          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Подключить канал</span>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.offers.map(o => {
                const on = offer?.title === o.title;
                return (
                  <button key={o.title} type="button"
                    onClick={() => { setOffer(on ? null : o); setNewId(''); setBanner(null); }}
                    style={{ display: "flex", flexDirection: "column", gap: "8px", background: on ? "#DEF23B" : "#F7F7F7", borderRadius: "18px", padding: "13px 15px", border: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                      <span style={{ width: "28px", height: "28px", borderRadius: "999px", background: o.badgeBg, color: "#FFFFFF", fontSize: "9.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{o.badge}</span>
                      <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                        <span style={{ fontSize: "13.5px", fontWeight: "500" }}>{o.title}</span>
                        <span style={{ fontSize: "11px", ...(on ? { opacity: ".65" } : { color: "#6E6E6E" }) }}>{o.note}</span>
                      </span>
                    </span>
                    <Caps caps={o.caps} muted={!on} />
                  </button>
                );
              })}
            </div>

            {offer && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#6E6E6E" }}>{offer.idLabel}</span>
                  <div style={{ background: "#F5F5F5", borderRadius: "14px", padding: "13px 15px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
                    <input value={newId} onChange={e => setNewId(e.target.value)}
                      aria-label={offer.idLabel} placeholder={offer.idExample}
                      style={{ fontSize: "14px", fontWeight: "500", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
                  </div>
                </div>

                {/* Ключи шлюза — из окружения. Видно только имя переменной
                    и заведена ли она; значение сюда не приходит никогда. */}
                <div style={{ background: offer.envReady ? "#F7F7F7" : "#FBEEEF", borderRadius: "14px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", color: offer.envReady ? "#2E2E2E" : "#8A4448" }}>
                    {offer.envReady ? 'Ключ шлюза найден в окружении' : 'Ключ шлюза в окружении не задан'}
                  </span>
                  <span style={{ fontSize: "11px", lineHeight: "1.45", color: offer.envReady ? "#6E6E6E" : "#8A4448" }}>
                    {offer.envNames.join(', ')} — ключ вводится в окружение сервера, а не сюда.
                    В базе его нет и не будет. События шлюз шлёт на {offer.webhookPath}.
                  </span>
                </div>

                <button type="button" disabled={pending || !newId.trim()}
                  onClick={() => run(() => connectChannel(offer.slug, offer.kind, offer.transport, newId))}
                  style={{ background: "#111111", borderRadius: "999px", padding: "15px 0", textAlign: "center", border: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>
                    {pending ? 'Проверяем связь…' : 'Подключить и проверить связь'}</span>
                </button>
              </div>
            )}

            {!data.canManage && (
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
                Подключает и отключает каналы владелец точки. Кнопки не спрятаны нарочно:
                правило держат сервер и база, и отказ придёт с объяснением, а не молча.
              </span>
            )}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{ fontSize: "17px", fontWeight: "500", letterSpacing: "-0.02em" }}>Три шага до первой отправки</span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F5FBCB", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#111111", color: "#DEF23B", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>1</span>
              <span style={{ flex: "1", fontSize: "13.5px", fontWeight: "500" }}>Подключить каналы</span>
              <span style={{ fontSize: "11.5px", color: "#6E6E6E" }}>{data.connected}/{data.total || 1}</span>
            </div>
            <a href="/price" style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>2</span>
              <span style={{ flex: "1", fontSize: "13.5px", color: "#2E2E2E" }}>Подтвердить прайс — хватит пяти бестселлеров</span>
            </a>
            <a href="/staff" style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>3</span>
              <span style={{ flex: "1", fontSize: "13.5px", color: "#2E2E2E" }}>Добавить менеджеров</span>
            </a>
            <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Запуск ≤1 часа, без обучения и миграции. Обучающих туров и онбординг-карусели нет.</span>
          </div>

          {/* Строка из хендоффа «Почему через шлюз». Это не пояснение к
              макету, а ответ на вопрос владельца, который иначе станет
              звонком в управляющую компанию. */}
          <div style={{ background: "#111111", borderRadius: "26px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "11px" }}>
            <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Почему через шлюз</span>
            <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#C9C9C9" }}>
              Провайдер держит на себе авторизацию, повторные привязки и изменения лимитов
              площадок — иначе каждый такой отказ превращается в обращение точки
              в управляющую компанию.
            </span>
            <span style={{ fontSize: "11.5px", color: "#8A8A8A", lineHeight: "1.5" }}>
              Один аккаунт шлюза принадлежит одной точке. Привязать его ко второй нельзя:
              иначе обращения чужого бизнеса пришли бы в ваш инбокс.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Строка канала ───────────────────────────────────────────────────────── */

function ChannelRow({ ch, pending, rebinding, rebindId, onRebindId, onOpenRebind,
                      onRecheck, onDisconnect, onRebind }: {
  ch: ChannelView; pending: boolean; rebinding: boolean; rebindId: string;
  onRebindId: (v: string) => void; onOpenRebind: () => void;
  onRecheck: () => void; onDisconnect: () => void; onRebind: () => void;
}) {
  const broken = ch.status === 'error' || ch.status === 'disconnected';
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: broken ? "#FBEEEF" : "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ width: "34px", height: "34px", borderRadius: "999px", background: ch.badgeBg, color: "#FFFFFF", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{ch.badge}</span>
        <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
          {/* «Отвалился» и «не завёлся» — разные беды, и лечатся они разным.
              Первое — истёкшая авторизация у провайдера, второе — канал,
              который ни разу не отвечал. Одна формулировка на оба случая
              отправила бы владельца чинить не то. */}
          <span style={{ fontSize: "15px", fontWeight: "500", ...(broken ? { color: "#8A4448" } : {}) }}>
            {ch.title}
            {ch.status === 'disconnected' ? ' · требует повторной привязки'
              : ch.status === 'error' ? ' · связь не установлена'
              : ch.status === 'pending' ? ' · связь ещё не проверяли' : ''}
          </span>
          <span style={{ fontSize: "11.5px", color: broken ? "#8A4448" : "#6E6E6E" }}>
            {ch.externalId} · {ch.lastError ?? 'через шлюз, авторизация на нашей стороне'}
            {ch.fixHint ? ` — ${ch.fixHint}` : ''}
          </span>
        </div>
        {ch.status === 'connected' ? (
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flex: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
            <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Работает</span>
          </div>
        ) : (
          <button type="button" onClick={onOpenRebind} disabled={pending}
            style={{ background: "#111111", borderRadius: "999px", padding: "11px 17px", flex: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>
              {rebinding ? 'Свернуть' : 'Привязать заново'}</span>
          </button>
        )}
      </div>

      {/* Возможности канала — из capabilities() адаптера. Менеджер видит
          «писать первым нельзя» до того, как напишет и будет ждать ответа. */}
      {ch.caps
        ? <Caps caps={ch.caps} />
        : <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>
            Провайдера «{ch.provider}» нет в реестре адаптеров — возможности канала неизвестны
          </span>}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button type="button" onClick={onRecheck} disabled={pending}
          style={{ fontSize: "11.5px", color: "#6E6E6E", background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
          Проверить связь</button>
        {ch.status === 'connected' && (
          <button type="button" onClick={onDisconnect} disabled={pending}
            style={{ fontSize: "11.5px", color: "#9A9A9A", background: "transparent", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
            Отключить</button>
        )}
        <span style={{ flex: "1" }}></span>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>
          {ch.checkedAt
            ? `проверено ${new Date(ch.checkedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
            : 'связь ещё не проверяли'}
        </span>
      </div>

      {rebinding && (
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "14px", padding: "12px 14px", boxShadow: "inset 0 0 0 1.5px #111111" }}>
            <input value={rebindId} onChange={e => onRebindId(e.target.value)}
              aria-label="Новый идентификатор канала"
              placeholder="новый идентификатор канала в кабинете шлюза"
              style={{ fontSize: "13px", fontWeight: "500", border: 0, background: "transparent", outline: "none", width: "100%", fontFamily: "inherit" }} />
          </div>
          <button type="button" onClick={onRebind} disabled={pending || !rebindId.trim()}
            style={{ background: "#111111", borderRadius: "999px", padding: "12px 18px", flex: "none", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>
              {pending ? 'Секунду…' : 'Привязать · 40 секунд'}</span>
          </button>
        </div>
      )}
      {rebinding && (
        <span style={{ fontSize: "11px", color: "#8A4448", lineHeight: "1.4" }}>
          Обычно это истёкшая авторизация у провайдера. Переписка останется на месте:
          привязка меняет тот же канал, а не заводит второй. Звонить в управляющую компанию не нужно.
        </span>
      )}
    </div>
  );
}

/**
 * Возможности канала. Ни одна строка здесь не решает, что канал умеет, —
 * все читаются из capabilities(). Второй источник правды разошёлся бы
 * с первым и соврал менеджеру ровно в тот момент, когда это дороже всего.
 */
function Caps({ caps, muted }: {
  caps: NonNullable<ChannelView['caps']>; muted?: boolean;
}) {
  const items: { text: string; can: boolean }[] = [
    { text: caps.initiate ? 'пишет первым' : 'первым писать нельзя', can: caps.initiate },
    { text: caps.images ? 'картинки' : 'без картинок', can: caps.images },
    { text: caps.allowsLinks ? 'ссылки' : 'ссылки режет модерация', can: caps.allowsLinks },
    { text: `до ${caps.maxTextLength} символов`, can: true },
  ];
  return (
    <span style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {items.map(i => (
        <span key={i.text} style={{ fontSize: "10.5px", fontWeight: "500", borderRadius: "999px", padding: "5px 10px", whiteSpace: "nowrap", background: muted ? "#FFFFFF" : "rgba(255,255,255,.75)", color: i.can ? "#111111" : "#8A4448" }}>{i.text}</span>
      ))}
    </span>
  );
}
