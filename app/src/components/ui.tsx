/**
 * Примитивы дизайн-системы.
 *
 * Правила, зашитые здесь, чтобы их нельзя было забыть на новом экране:
 *  · выбранное заливается кислотой, а не обводится — рамки в этой системе
 *    ничего не выделяют;
 *  · штриховка означает «нет данных / остаток» и никогда не серая заливка,
 *    потому что «нет данных» и «ноль» — разные состояния;
 *  · цифры и цены всегда tabular-nums, иначе колонка гуляет при прокрутке.
 */
import type { CSSProperties, ReactNode } from 'react';

export const HATCH: CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(115deg,#C9C9C9 0 1px,transparent 1px 6px)',
  backgroundColor: 'var(--white)',
  boxShadow: 'inset 0 0 0 1px var(--rule-strong)',
};

export function Card({ children, pad = 20, radius = 'var(--r-card)', style, ...rest }:
  { children?: ReactNode; pad?: number; radius?: string; style?: CSSProperties } &
  React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} style={{ background: 'var(--white)', borderRadius: radius, padding: pad, ...style }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      fontSize: 'var(--fs-caption)', fontWeight: 600, letterSpacing: 'var(--ls-caption)',
      textTransform: 'uppercase', color: 'var(--ink-400)', ...style,
    }}>{children}</div>
  );
}

export function H({ level = 2, children, style }:
  { level?: 1 | 2 | 3; children: ReactNode; style?: CSSProperties }) {
  const map = {
    1: { fontSize: 'var(--fs-h1)', letterSpacing: 'var(--ls-h1)' },
    2: { fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-h2)' },
    3: { fontSize: 'var(--fs-h3)', letterSpacing: 'var(--ls-h3)' },
  } as const;
  const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3';
  return <Tag style={{ fontWeight: 500, color: 'var(--ink-900)', ...map[level], ...style }}>{children}</Tag>;
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Button({ kind = 'primary', wide, disabled, children, style, ...rest }:
  { kind?: ButtonKind; wide?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const kinds: Record<ButtonKind, CSSProperties> = {
    primary:   { background: 'var(--ink-900)', color: '#fff' },
    secondary: { background: 'var(--surface)', color: 'var(--ink-900)' },
    ghost:     { background: 'transparent', color: 'var(--ink-500)',
                 boxShadow: 'inset 0 0 0 1px var(--rule-strong)' },
    danger:    { background: 'var(--alert-500)', color: '#fff' },
  };
  return (
    <button {...rest} disabled={disabled} style={{
      minHeight: 'var(--tap)', padding: '0 22px', border: 0, borderRadius: 'var(--r-btn)',
      fontSize: 'var(--fs-body)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      width: wide ? '100%' : undefined, opacity: disabled ? 0.4 : 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...kinds[kind], ...style,
    }}>{children}</button>
  );
}

export function Pill({ children, tone = 'quiet', style }:
  { children: ReactNode; tone?: 'quiet' | 'ink' | 'acid' | 'alert'; style?: CSSProperties }) {
  const tones: Record<string, CSSProperties> = {
    quiet: { background: 'var(--surface)', color: 'var(--ink-700)' },
    ink:   { background: 'var(--ink-900)', color: '#fff' },
    acid:  { background: 'var(--acid-500)', color: 'var(--ink-900)' },
    alert: { background: 'var(--alert-100)', color: '#8E2429' },
  };
  return (
    <span className="fit" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      borderRadius: 'var(--r-pill)', fontSize: 'var(--fs-label)', fontWeight: 500,
      whiteSpace: 'nowrap', ...tones[tone], ...style,
    }}>{children}</span>
  );
}

export function Tabs({ items, value, onChange }:
  { items: { id: string; label: string; count?: number }[]; value: string;
    onChange: (id: string) => void }) {
  return (
    <div className="seg" role="tablist" style={{ background: 'var(--surface)', padding: 5,
      borderRadius: 'var(--r-pill)' }}>
      {items.map(i => {
        const on = i.id === value;
        return (
          <button key={i.id} role="tab" aria-selected={on} onClick={() => onChange(i.id)}
            style={{
              border: 0, borderRadius: 'var(--r-pill)', padding: '9px 16px', cursor: 'pointer',
              fontSize: 'var(--fs-label)', fontWeight: 500,
              background: on ? 'var(--ink-900)' : 'transparent',
              color: on ? '#fff' : 'var(--ink-500)',
            }}>
            {i.label}{i.count !== undefined && <span style={{ opacity: .6, marginLeft: 6 }}>{i.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, ...rest }:
  { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      {label && <div style={{ fontSize: 'var(--fs-label)', color: 'var(--ink-500)', marginBottom: 6 }}>{label}</div>}
      <input {...rest} style={{
        width: '100%', minHeight: 'var(--tap)', padding: '0 16px', borderRadius: 'var(--r-btn)',
        border: 0, boxShadow: 'inset 0 0 0 1px var(--rule-strong)', background: 'var(--white)',
        fontSize: 'var(--fs-body)', fontFamily: 'inherit', color: 'var(--ink-700)',
      }} />
    </label>
  );
}

/** Цена: рубли основным цветом, копейки и знак — Ink 400, всегда tabular-nums. */
export function Price({ kopecks, size = 'var(--fs-price)' }: { kopecks: number; size?: string }) {
  const r = Math.floor(kopecks / 100), k = kopecks % 100;
  return (
    <span style={{ fontSize: size, fontWeight: 500, letterSpacing: 'var(--ls-price)',
      fontVariantNumeric: 'tabular-nums', color: 'var(--ink-700)', whiteSpace: 'nowrap' }}>
      {r.toLocaleString('ru-RU')}
      <span style={{ color: 'var(--ink-400)' }}>{k ? `,${String(k).padStart(2, '0')}` : ''} ₽</span>
    </span>
  );
}

/** Артикул: моноширинные цифры, иначе колонка в списке гуляет. */
export function Sku({ children }: { children: ReactNode }) {
  return <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '.01em',
    color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>{children}</span>;
}

/**
 * Шкала. Заполненная часть — кислота, остаток — штриховка.
 * Серой заливки быть не должно: она читается как «ноль», а не «нет данных».
 */
export function Meter({ pct, tone = 'acid', height = 10 }:
  { pct: number; tone?: 'acid' | 'acid-300' | 'alert'; height?: number }) {
  const fill = tone === 'alert' ? 'var(--alert-100)'
             : tone === 'acid-300' ? 'var(--acid-300)' : 'var(--acid-500)';
  return (
    <div style={{ ...HATCH, height, borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: fill, borderRadius: 'var(--r-pill)' }} />
    </div>
  );
}

export function Row({ children, gap = 10, align = 'center', wrap, style }:
  { children: ReactNode; gap?: number; align?: CSSProperties['alignItems'];
    wrap?: boolean; style?: CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: align, gap,
    flexWrap: wrap ? 'wrap' : 'nowrap', ...style }}>{children}</div>;
}

export function Stack({ children, gap = 12, style }:
  { children: ReactNode; gap?: number; style?: CSSProperties }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--rule)' }} />;
}

/** «Нет данных» с обязательной текстовой подписью: штриховка одна не читается
 *  на монохромном экране, и хендоф отдельно просит дублировать её словами. */
export function NoData({ label, height = 80 }: { label: string; height?: number }) {
  return (
    <div style={{ ...HATCH, height, borderRadius: 'var(--r-inner)', display: 'grid',
      placeItems: 'center', color: 'var(--ink-400)', fontSize: 'var(--fs-body-s)' }}>
      {label}
    </div>
  );
}
