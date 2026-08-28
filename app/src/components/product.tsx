/**
 * Компоненты ядра продукта — те, которых нет в референсе дизайн-системы
 * и в которых живут инварианты.
 *
 * Здесь намеренно нет ни одного пропса, который выключал бы механику
 * честности, менял порядок световых условий или позволял показать артикул
 * без цены. Если такой пропс появится, инвариант станет настройкой.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Card, HATCH, Pill, Price, Row, Sku, Stack } from './ui';

/* ─── О-2 · три световых условия ──────────────────────────────
 * Порядок фиксирован и задан здесь константой, а не приходит извне:
 * порядок — часть механики, а не оформление. Тумблера отключения нет,
 * и его нельзя добавить пропсом. */
export const LIGHTS = [
  { id: 'day',      label: 'День' },
  { id: 'overcast', label: 'Пасмурно' },
  { id: 'parking',  label: 'Паркинг' },
] as const;
export type LightId = typeof LIGHTS[number]['id'];

export const HONESTY_LINE =
  'Оттенок партии сверим с рулоном при вас на замере — образец приложим к записи.';

export function LightSwitcher({ value, onChange }:
  { value: LightId; onChange: (v: LightId) => void }) {
  return (
    <div className="seg" role="tablist"
      style={{ background: 'var(--surface)', padding: 5, borderRadius: 'var(--r-pill)' }}>
      {LIGHTS.map(l => {
        const on = l.id === value;
        return (
          <button key={l.id} role="tab" aria-selected={on} onClick={() => onChange(l.id)}
            style={{
              border: 0, borderRadius: 'var(--r-pill)', padding: '10px 14px', cursor: 'pointer',
              fontSize: 'var(--fs-label)', fontWeight: 500, minHeight: 'var(--tap)',
              background: on ? 'var(--ink-900)' : 'transparent',
              color: on ? '#fff' : 'var(--ink-500)',
            }}>{l.label}</button>
        );
      })}
    </div>
  );
}

/**
 * Строка честности. Без пропсов вообще: текст, фон и факт присутствия
 * не настраиваются. Читается как снятие тревоги — «сверим при вас», —
 * а не как юридический дисклеймер: дисклеймер усиливает страх, ради
 * снятия которого поставлен.
 */
export function HonestyLine() {
  return (
    <div style={{
      background: 'var(--acid-100)', borderRadius: 'var(--r-inner)', padding: '12px 16px',
      fontSize: 'var(--fs-body-s)', lineHeight: 'var(--lh-body-s)', color: 'var(--ink-700)',
    }}>{HONESTY_LINE}</div>
  );
}

/* ─── К-7 · канал как свойство сообщения, никогда вкладкой ───── */
export const CHANNELS = {
  whatsapp: { short: 'WA',  label: 'WhatsApp', bg: '#25D366' },
  telegram: { short: 'TG',  label: 'Telegram', bg: '#2AABEE' },
  max:      { short: 'MAX', label: 'MAX',      bg: '#6E56F8' },
  avito:    { short: 'AV',  label: 'Avito',    bg: '#00AAFF' },
  web:      { short: 'ГР',  label: 'Гараж',    bg: 'var(--ink-900)' },
} as const;
export type ChannelId = keyof typeof CHANNELS;

export function ChannelIcon({ id, withLabel }: { id: ChannelId; withLabel?: boolean }) {
  const c = CHANNELS[id];
  return (
    <Row gap={8}>
      <span aria-hidden style={{
        width: 22, height: 22, borderRadius: 7, background: c.bg, color: '#fff',
        fontSize: 9, fontWeight: 600, display: 'grid', placeItems: 'center', flex: 'none',
      }}>{c.short}</span>
      {withLabel && <span style={{ fontSize: 'var(--fs-label)', color: 'var(--ink-500)' }}>{c.label}</span>}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {c.label}
      </span>
    </Row>
  );
}

/* ─── МС-1 · штамп подтверждения. Его выбор, его дата ────────── */
export function ConfirmationStamp({ at, sku }: { at: string; sku: string }) {
  return (
    <div style={{
      background: 'var(--acid-500)', borderRadius: 'var(--r-inner)', padding: '14px 16px',
    }}>
      <div style={{ fontWeight: 500, color: 'var(--ink-900)', fontSize: 'var(--fs-body)' }}>
        Клиент подтвердил выбор
      </div>
      <div style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-700)',
        fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
        {at} · {sku}
      </div>
    </div>
  );
}

/* ─── §3.1 · состояние примерки в строке инбокса ─────────────
 * Отвечает на «где я его бросил» без открытия диалога. */
export const TRYON_STATES = {
  sent:       { label: 'Отправлена · ждём',  tone: 'quiet' },
  more:       { label: 'Просит ещё вариант', tone: 'acid'  },
  confirmed:  { label: 'Выбор подтверждён',  tone: 'ink'   },
  booked:     { label: 'Замер назначен',     tone: 'ink'   },
  undelivered:{ label: 'Не доставлено',      tone: 'alert' },
  channel_off:{ label: 'Канал отвалился',    tone: 'alert' },
} as const;
export type TryonStateId = keyof typeof TRYON_STATES;

export function TryonState({ id, detail }: { id: TryonStateId; detail?: string }) {
  const s = TRYON_STATES[id];
  return <Pill tone={s.tone}>{detail ? `${s.label.split(' · ')[0]} ${detail}` : s.label}</Pill>;
}

/* ─── К-2 · плитка артикула. Артикул и цена только из прайса точки ───
 * Цена обязательна в типе: плитки без цены не существует. */
export type SkuTileData = {
  id: string; name: string; sku: string; finish: string;
  priceKopecks: number; hex: string; inStock: boolean;
};

export function SkuTile({ item, selected, onSelect }:
  { item: SkuTileData; selected?: boolean; onSelect?: (id: string) => void }) {
  return (
    <button onClick={() => onSelect?.(item.id)} aria-pressed={!!selected}
      style={{
        // Выбранная плитка — заливка кислотой, не рамка: рамки в этой системе
        // ничего не выделяют.
        background: selected ? 'var(--acid-500)' : 'var(--white)',
        border: 0, borderRadius: 'var(--r-inner)', padding: 14, cursor: 'pointer',
        textAlign: 'left', width: '100%', minHeight: 'var(--tap)',
        opacity: item.inStock ? 1 : .55,
      }}>
      <Row gap={10}>
        <span aria-hidden style={{ width: 26, height: 26, borderRadius: 999, background: item.hex,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)', flex: 'none' }} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--fs-body-s)', fontWeight: 500,
            color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' }}>{item.name}</span>
          <Sku>{item.sku}</Sku>
        </span>
      </Row>
      <Row gap={8} style={{ marginTop: 10, justifyContent: 'space-between' }}>
        <Price kopecks={item.priceKopecks} size="var(--fs-h3)" />
        {!item.inStock && <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-500)' }}>
          нет на складе</span>}
      </Row>
    </button>
  );
}

/* ─── Слот рендера и его отказные виды ───────────────────────
 * Отказ всегда с фолбэком в той же плитке. Пустого отказа в системе нет —
 * это правило дизайн-системы и одновременно требование §8.5. */
export type RenderSlotState =
  | { kind: 'ready'; src: string }
  | { kind: 'working'; eta: string }
  | { kind: 'partial'; src: string }
  | { kind: 'rejected'; reason: string }
  | { kind: 'unusable'; reason: string };

export function RenderSlot({ state, ratio = '4 / 3' }:
  { state: RenderSlotState; ratio?: string }) {
  const frame: CSSProperties = {
    aspectRatio: ratio, borderRadius: 'var(--r-inner)', overflow: 'hidden',
    display: 'grid', placeItems: 'center', textAlign: 'center', padding: 14,
  };
  if (state.kind === 'ready' || state.kind === 'partial') {
    return (
      <div style={{ ...frame, background: 'var(--surface)', position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={state.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {state.kind === 'partial' && (
          <span style={{ position: 'absolute', left: 10, bottom: 10 }}>
            <Pill tone="quiet">Частичная выдача</Pill>
          </span>
        )}
      </div>
    );
  }
  if (state.kind === 'working') {
    return (
      <div style={{ ...frame, ...HATCH }}>
        <Stack gap={4}>
          <span style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-700)' }}>Готовим</span>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)' }}>{state.eta}</span>
        </Stack>
      </div>
    );
  }
  return (
    <div style={{ ...frame, ...HATCH }}>
      <Stack gap={4}>
        <span style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-700)' }}>
          {state.kind === 'rejected' ? 'Фото не подошло' : 'Отбраковка'}
        </span>
        <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)' }}>{state.reason}</span>
      </Stack>
    </div>
  );
}

/* ─── В-5 · расход генераций ─────────────────────────────────
 * Порог 80% меняет тон на Acid 300, а не на красный: лимит не должен
 * выглядеть поломкой, иначе владелец читает его как «сломалось» и звонит
 * в управляющую компанию — то есть валит С-3. */
export function UsageGauge({ spentKopecks, capKopecks }:
  { spentKopecks: number; capKopecks: number }) {
  const pct = capKopecks ? (spentKopecks / capKopecks) * 100 : 0;
  const tone = pct >= 100 ? 'alert' : pct >= 80 ? 'acid-300' : 'acid';
  const left = Math.max(0, capKopecks - spentKopecks);
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--ink-500)' }}>Израсходовано</div>
          <Price kopecks={spentKopecks} size="var(--fs-h2)" />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--ink-500)' }}>Остаток</div>
          <Price kopecks={left} size="var(--fs-h2)" />
        </div>
      </Row>
      <div style={{ marginTop: 12 }}>
        <MeterInline pct={pct} tone={tone} />
      </div>
    </Card>
  );
}

function MeterInline({ pct, tone }: { pct: number; tone: 'acid' | 'acid-300' | 'alert' }) {
  const fill = tone === 'alert' ? 'var(--alert-100)'
             : tone === 'acid-300' ? 'var(--acid-300)' : 'var(--acid-500)';
  return (
    <div style={{ ...HATCH, height: 10, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: fill,
        borderRadius: 999 }} />
    </div>
  );
}

/* ─── Карточка 3 артикула × 3 света ──────────────────────────
 * Тип принимает ровно три артикула и ровно три света на каждый.
 * Частичной карточки не существует на уровне типа — это О-2, выраженное
 * так, что оно не собирается, а не проверяется в рантайме. */
export type CardVariant = {
  item: SkuTileData;
  renders: Record<LightId, RenderSlotState>;
};

export function TryonCard({ variants, light, onLight, footer }:
  { variants: [CardVariant, CardVariant, CardVariant]; light: LightId;
    onLight: (l: LightId) => void; footer?: ReactNode }) {
  return (
    <Card pad={18}>
      <Row style={{ justifyContent: 'space-between' }} wrap>
        <div style={{ fontSize: 'var(--fs-h3)', fontWeight: 500, color: 'var(--ink-900)' }}>
          Три варианта из вашего прайса
        </div>
        <LightSwitcher value={light} onChange={onLight} />
      </Row>
      <div className="g3" style={{ marginTop: 14 }}>
        {variants.map(v => (
          <Stack key={v.item.id} gap={8}>
            <RenderSlot state={v.renders[light]} />
            <div style={{ fontSize: 'var(--fs-body-s)', fontWeight: 500, color: 'var(--ink-900)' }}>
              {v.item.name}
            </div>
            <Row style={{ justifyContent: 'space-between' }}>
              <Sku>{v.item.sku}</Sku>
              <Price kopecks={v.item.priceKopecks} size="var(--fs-h3)" />
            </Row>
          </Stack>
        ))}
      </div>
      <div style={{ marginTop: 14 }}><HonestyLine /></div>
      {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
    </Card>
  );
}
