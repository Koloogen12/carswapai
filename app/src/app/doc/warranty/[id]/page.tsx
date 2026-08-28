import { notFound } from 'next/navigation';
import { bayRecord } from '@/lib/bay';
import { sys } from '@/lib/db';
import { rub } from '@/screens/cabinet';

export const dynamic = 'force-dynamic';

/**
 * Гарантийный талон и акт, A4.
 * Разметка из блока 4 хендоффа, страница 794×1123 при 96 dpi — в продакшн
 * геометрия задаётся через @page, пиксели из макета не переносятся.
 */
export default async function WarrantyDoc({ params }: { params: { id: string } }) {
  const r = await bayRecord(params.id);
  if (!r) notFound();
  const w = (await sys<{ number: string; months: number; issued_at: string }>(
    `select number, months, issued_at from warranties where order_id = $1`, [params.id]))[0];

  return (
    <>
      <style>{`@page { size: A4; margin: 16mm } body { background: #fff }`}</style>
      <div style={{ maxWidth: 794, margin: '0 auto', padding: 40, background: '#fff', color: '#2E2E2E' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          borderBottom: '2px solid #111111', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>
              Гарантийный талон{w ? ` ${w.number}` : ''}</div>
            <div style={{ color: '#6E6E6E', fontSize: 13, marginTop: 4 }}>
              JETCAR Мытищи · к наряду {r.number}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#6E6E6E' }}>
            <div>Срок гарантии</div>
            <div style={{ color: '#111111', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {w?.months ?? 12} месяцев</div>
          </div>
        </div>

        <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            {[['Клиент', r.client_name], ['Автомобиль', `${r.vehicle} · ${r.plate ?? '—'}`],
              ['Материал', `${r.brand} ${r.sku} — ${r.item_name}`],
              ['Партия рулона', r.batch_number ?? '—'],
              ['Метраж', r.meters_required ? `${r.meters_required} м` : '—'],
              ['Работа сдана', w ? new Date(w.issued_at).toLocaleDateString('ru-RU') : '—']].map(([k, v]) => (
              <tr key={k as string}>
                <td style={{ padding: '9px 0', color: '#6E6E6E', width: 210 }}>{k}</td>
                <td style={{ padding: '9px 0', fontWeight: 500, color: '#111111' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
          {r.renders.map(x => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={x.variant} src={x.storage_path} alt=""
              style={{ width: '100%', borderRadius: 10, display: 'block' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10,
          marginTop: 6, fontSize: 11, color: '#6E6E6E', textAlign: 'center' }}>
          <span>День</span><span>Пасмурно</span><span>Паркинг</span>
        </div>

        {/* Талон повторяет ту же оговорку: она сопровождает выбор до конца,
            а не только до отправки карточки. */}
        <div style={{ marginTop: 18, background: '#F5FBCB', padding: 14, borderRadius: 12, fontSize: 13 }}>
          {r.honesty_line}
        </div>

        <div style={{ marginTop: 20, fontSize: 12.5, lineHeight: 1.6, color: '#6E6E6E' }}>
          Гарантия распространяется на отслоение, изменение цвета и дефекты нанесения материала
          при соблюдении условий эксплуатации. Гарантия не покрывает механические повреждения,
          воздействие агрессивной химии и последствия ДТП. Цвет партии сверен с клиентом
          на замере до начала работ.
        </div>

        <div style={{ marginTop: 26, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderTop: '1px solid #F0F0F0', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#6E6E6E' }}>
            Вариант подтверждён клиентом{' '}
            {new Date(r.confirmed_at).toLocaleString('ru-RU',
              { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>
          <span style={{ fontSize: '26px', fontWeight: 500, letterSpacing: '-0.035em',
            fontVariantNumeric: 'tabular-nums', color: '#111111' }}>{rub(r.price_kopecks)} ₽</span>
        </div>
      </div>
    </>
  );
}
