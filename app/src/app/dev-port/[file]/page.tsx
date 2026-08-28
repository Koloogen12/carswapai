import { notFound } from 'next/navigation';
import { PORTED, CANVAS } from '@/design/ported';

/**
 * ВРЕМЕННАЯ страница сверки переноса. Удалить вместе с .next/types/app/dev-port.
 *
 * Воспроизводит окружение прототипа целиком, иначе сверка врёт:
 *  · собственный стиль канвы — отбивка 52/48/120, flex-колонка, gap 40,
 *    width:max-content. Без него рамки растягиваются, и object-fit:cover
 *    показывает другой кусок той же картинки — выглядит как «не та картинка»;
 *  · глобальные правила из <helmet> прототипа: сброс полей и правило для img.
 */
export default function DevPort({ params }: { params: { file: string } }) {
  const key = decodeURIComponent(params.file);
  const blocks = PORTED[key];
  if (!blocks) notFound();
  return (
    <>
      <style>{`
        .dc-canvas img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .dc-canvas a { color: #DEF23B; text-decoration: none; }
        .dc-canvas a:hover { color: #FFFFFF; }
        .dc-canvas * { box-sizing: border-box; }
      `}</style>
      <div className="dc-canvas" style={CANVAS[key]}>
        {blocks.map((B, i) => <B key={i} />)}
      </div>
    </>
  );
}

export function generateStaticParams() {
  return Object.keys(PORTED).map(file => ({ file }));
}
