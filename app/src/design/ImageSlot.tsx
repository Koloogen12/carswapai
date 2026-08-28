/**
 * Соответствие компоненту <image-slot> из прототипа.
 *
 * В хендоффе это заполняемая перетаскиванием заглушка авторского инструмента.
 * В продукте на её месте стоит настоящий рендер из пайплайна, а пустое
 * состояние выглядит ровно так же, как в прототипе: заливка rgba(127,127,127,.08),
 * пунктирное кольцо 1.5px в currentColor и подпись 11px по центру.
 * Значения сняты из design/design/image-slot.js, не придуманы.
 */
import type { CSSProperties, ReactElement } from 'react';

export function ImageSlot({ src, shape = 'rounded', radius = 12, placeholder = 'Drop an image',
                            mini, alt = '', style, id }: {
  src?: string; shape?: 'rect' | 'rounded' | 'circle' | 'pill'; radius?: number | string;
  placeholder?: string; mini?: boolean; alt?: string; style?: CSSProperties;
  /** id слота из прототипа: держим его, чтобы сверка бок о бок находила
   *  тот же слот в обеих версиях по одному имени. */
  id?: string;
}): ReactElement {
  const r = shape === 'circle' ? '50%' : shape === 'pill' ? '999px'
          : shape === 'rect' ? 0 : (typeof radius === 'string' ? `${radius}px` : `${radius}px`);
  const box: CSSProperties = {
    position: 'relative', overflow: 'hidden', borderRadius: r,
    width: '100%', height: '100%', ...style,
  };
  if (src && !src.startsWith('@@DC:')) {
    return (
      <span id={id} style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
    );
  }
  return (
    <span id={id} style={{ ...box, background: 'rgba(127,127,127,.08)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 12 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        border: '1.5px dashed currentColor', opacity: .35 }} />
      {!mini && <span style={{ fontSize: 11, opacity: .55 }}>{placeholder}</span>}
    </span>
  );
}
