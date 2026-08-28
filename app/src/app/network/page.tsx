import { Shell, NavLink } from '@/components/shell';
import { Card, Eyebrow, H, Meter, Pill, Price, Row, Stack } from '@/components/ui';
import { networkPanel } from '@/lib/reports';

export const dynamic = 'force-dynamic';

/**
 * Экран 59 · панель сети.
 * §13: управляющая компания видит срез по точкам и не видит переписок клиентов.
 * Это не решение интерфейса — ограничительная политика RLS не отдаёт ей
 * сообщения даже при прямом запросе.
 */
export default async function NetworkPage() {
  const points = await networkPanel();
  return (
    <Shell user="Ольга Титова" role="Управляющая компания · JETCAR"
      nav={<NavLink href="/network" active>Точки сети</NavLink>}>
      <Stack gap={20}>
        <div>
          <Eyebrow>Пилот</Eyebrow>
          <H level={1} style={{ marginTop: 4 }}>Разброс по точкам</H>
        </div>
        <Card>
          <div style={{ display: 'grid',
            gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)',
            gap: 16, padding: '0 0 12px', fontSize: 'var(--fs-caption)', fontWeight: 600,
            letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-400)' }}>
            <span>Точка</span><span>Обращений</span><span>Подтверждено</span><span>Расход</span>
          </div>
          {points.map(p => (
            <div key={p.id} style={{ display: 'grid',
              gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)',
              gap: 16, padding: '14px 0', borderTop: '1px solid var(--rule)',
              alignItems: 'center' }}>
              <Row gap={8}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                {p.status !== 'active' && <Pill tone="alert">{p.status}</Pill>}
              </Row>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.threads}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.confirmed}</span>
              <Stack gap={6}>
                <Price kopecks={p.spent} size="var(--fs-body)" />
                <Meter pct={p.hard_cap_kopecks ? (p.spent / p.hard_cap_kopecks) * 100 : 0}
                  height={6} />
              </Stack>
            </div>
          ))}
        </Card>
        <Card>
          <Eyebrow>Критерии, которыми решение защищается на комитете</Eyebrow>
          <div className="g3" style={{ marginTop: 12 }}>
            {[['Обращений точек в УК','0','за первый месяц'],
              ['Точек со сделкой через примерку',
               `${points.filter(p => p.confirmed > 0).length} из ${points.length}`,'цель ≥60%'],
              ['Подключений мимо сети','0','закрыто на уровне API']].map(([t, v, s]) => (
              <Stack key={t} gap={4}>
                <span style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>{t}</span>
                <span style={{ fontSize: 'var(--fs-h1)', fontWeight: 500,
                  letterSpacing: 'var(--ls-h1)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)' }}>{s}</span>
              </Stack>
            ))}
          </div>
        </Card>
      </Stack>
    </Shell>
  );
}
