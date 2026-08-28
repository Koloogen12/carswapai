import { notFound } from 'next/navigation';
import { bayRecord } from '@/lib/bay';
import { rub } from '@/screens/cabinet';

export const dynamic = 'force-dynamic';

/**
 * Экран 51 · заказ-наряд, A4.
 * Геометрия через @page, а не фиксированные 794×1123 из макета: пиксели
 * в печать не переносятся.
 * У-4: собирается из подтверждённой конфигурации, ручного ввода нет.
 */
export default async function OrderDoc({ params }: { params: { id: string } }) {
  const r = await bayRecord(params.id);
  if (!r) notFound();
  return (
    <>
      <style>{`@page { size: A4; margin: 16mm; } body { background: #fff; }`}</style>
      <div style={{ maxWidth: 794, margin: '0 auto', padding: 40, background: '#fff',
        color: '#2E2E2E' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          borderBottom: '2px solid #111111', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>
              Заказ-наряд {r.number}</div>
            <div style={{ color: '#6E6E6E', fontSize: 13, marginTop: 4 }}>
              JETCAR Мытищи · Олимпийский пр-т, 29</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#6E6E6E' }}>
            <div>Дата подтверждения клиентом</div>
            <div style={{ color: '#111111', fontWeight: 500,
              fontVariantNumeric: 'tabular-nums' }}>
              {new Date(r.confirmed_at).toLocaleDateString('ru-RU')}</div>
          </div>
        </div>

        <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            {[['Клиент', r.client_name], ['Автомобиль', `${r.vehicle} · ${r.plate ?? '—'}`],
              ['Артикул', `${r.brand} ${r.sku}`], ['Наименование', r.item_name],
              ['Метраж', r.meters_required ? `${r.meters_required} м` : '—'],
              ['Партия рулона', r.batch_number ?? 'сверяется мастером до старта']].map(([k, v]) => (
              <tr key={k as string}>
                <td style={{ padding: '9px 0', color: '#6E6E6E', width: 200 }}>{k}</td>
                <td style={{ padding: '9px 0', fontWeight: 500 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
          {r.renders.map(x => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={x.variant} src={x.storage_path} alt=""
              style={{ width: '100%', borderRadius: 10, display: 'block' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
          gap: 10, marginTop: 6, fontSize: 11, color: '#6E6E6E', textAlign: 'center' }}>
          <span>День</span><span>Пасмурно</span><span>Паркинг</span>
        </div>

        {/* О-2: оговорка печатается в документе, а не только на экране */}
        <div style={{ marginTop: 18, background: '#F5FBCB', padding: 14,
          borderRadius: 12, fontSize: 13 }}>{r.honesty_line}</div>

        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderTop: '1px solid #F0F0F0', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#6E6E6E' }}>
            Вариант подтверждён клиентом самостоятельно
            {' '}{new Date(r.confirmed_at).toLocaleString('ru-RU',
              { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>
          <span style={{ fontSize: "26px", fontWeight: 500, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>{rub(r.price_kopecks)} ₽</span>
        </div>
      </div>
    </>
  );
}
