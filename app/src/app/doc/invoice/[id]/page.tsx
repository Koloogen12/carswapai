import { notFound } from 'next/navigation';
import { bayRecord } from '@/lib/bay';
import { rub } from '@/screens/cabinet';

export const dynamic = 'force-dynamic';

/** Экран 52 · счёт с предоплатой и остатком, A4. */
export default async function InvoiceDoc({ params }: { params: { id: string } }) {
  const r = await bayRecord(params.id);
  if (!r) notFound();
  const prepay = Math.round(r.price_kopecks * 0.3);
  return (
    <>
      <style>{`@page { size: A4; margin: 16mm; } body { background: #fff; }`}</style>
      <div style={{ maxWidth: 794, margin: '0 auto', padding: 40, background: '#fff' }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>
          Счёт к наряду {r.number}</div>
        <div style={{ color: '#6E6E6E', fontSize: 13, marginTop: 4 }}>
          JETCAR Мытищи · {r.client_name} · {r.plate ?? ''}</div>
        <table style={{ width: '100%', marginTop: 26, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E2E2' }}>
              {['Позиция', 'Артикул', 'Метраж', 'Сумма'].map(h => (
                <th key={h} style={{ textAlign: h === 'Сумма' ? 'right' : 'left',
                  padding: '0 0 10px', fontSize: 11, textTransform: 'uppercase',
                  letterSpacing: '.07em', color: '#9A9A9A', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '14px 0' }}>{r.item_name}</td>
              <td style={{ padding: '14px 0', fontVariantNumeric: 'tabular-nums' }}>
                {r.brand} {r.sku}</td>
              <td style={{ padding: '14px 0', fontVariantNumeric: 'tabular-nums' }}>
                {r.meters_required ?? '—'} м</td>
              <td style={{ padding: '14px 0', textAlign: 'right' }}>
                <span style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{rub(r.price_kopecks)} ₽</span></td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: 24, marginLeft: 'auto', width: 300 }}>
          {[['Предоплата 30%', prepay], ['Остаток при выдаче', r.price_kopecks - prepay],
            ['Итого', r.price_kopecks]].map(([k, v], i) => (
            <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderTop: i === 2 ? '2px solid #111111' : '1px solid #F0F0F0' }}>
              <span style={{ color: i === 2 ? '#111111' : '#6E6E6E',
                fontWeight: i === 2 ? 500 : 400 }}>{k}</span>
              <span style={{ fontSize: i === 2 ? '20px' : '15px', fontWeight: 500, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{rub(v as number)} ₽</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
