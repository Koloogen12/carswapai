import { Shell, NavLink } from '@/components/shell';
import { Card, Divider, Eyebrow, H, Meter, NoData, Pill, Price, Row, Sku, Stack } from '@/components/ui';
import { UsageGauge } from '@/components/product';
import { ownerSummary } from '@/lib/reports';
import { channelHealth } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Экраны 54, 56–58 · кабинет владельца точки. */
export default async function OwnerPage() {
  const [s, channels] = await Promise.all([ownerSummary(), channelHealth()]);
  const pct = s.cover.threads ? Math.round((s.cover.with_tryon / s.cover.threads) * 100) : 0;

  return (
    <Shell user="Артём Лебедев" role="Владелец · JETCAR Мытищи"
      nav={<>
        <NavLink href="/inbox">Инбокс</NavLink>
        <NavLink href="/crm">Клиенты</NavLink>
        <NavLink href="/price">Прайс</NavLink>
        <NavLink href="/owner" active>Точка</NavLink>
      </>}>
      <Stack gap={20}>
        <div>
          <Eyebrow>Сводка</Eyebrow>
          <H level={1} style={{ marginTop: 4 }}>Неделя 34</H>
        </div>

        <div className="g3">
          <Card>
            <Eyebrow>Покрытие входящих примерками</Eyebrow>
            <div style={{ fontSize: 'var(--fs-price)', fontWeight: 500,
              letterSpacing: 'var(--ls-price)', fontVariantNumeric: 'tabular-nums',
              margin: '8px 0 12px' }}>{pct}%</div>
            <Meter pct={pct} />
            <div style={{ marginTop: 10, fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
              {s.cover.with_tryon} из {s.cover.threads} обращений · цель к 4-й неделе 70%
            </div>
          </Card>

          <UsageGauge spentKopecks={s.usage.spent_kopecks} capKopecks={s.usage.hard_limit} />

          <Card>
            <Eyebrow>Каналы</Eyebrow>
            <Stack gap={10} style={{ marginTop: 10 }}>
              {channels.map(ch => (
                <Row key={ch.kind} style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--fs-body-s)' }}>{ch.kind}</span>
                  <Row gap={6}>
                    {!ch.can_initiate && <Pill>только ответ</Pill>}
                    <Pill tone={ch.status === 'connected' ? 'ink' : 'alert'}>
                      {ch.status === 'connected' ? 'подключён' : 'отвалился'}</Pill>
                  </Row>
                </Row>
              ))}
            </Stack>
          </Card>
        </div>

        {/* В-3 · поимённые сделки с атрибуцией. Атрибуция консервативная:
            без подтверждения клиента сделка сюда не попадает. */}
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Eyebrow>Сделки, где цвет выбран по примерке</Eyebrow>
            <Pill>{s.deals.length}</Pill>
          </Row>
          <div style={{ marginTop: 12 }}>
            {s.deals.length === 0 ? (
              <NoData label="Подтверждённых выборов пока нет — первая сводка со сделками придёт, как только клиент зафиксирует вариант" />
            ) : (
              <Stack gap={0}>
                {s.deals.map((d, i) => (
                  <div key={i}>
                    {i > 0 && <Divider />}
                    <Row style={{ justifyContent: 'space-between', padding: '12px 0' }}>
                      <Stack gap={2}>
                        <span style={{ fontWeight: 500 }}>{d.name as string}</span>
                        <Sku>{d.sku as string} · {d.item as string}</Sku>
                      </Stack>
                      <Row gap={14}>
                        <span style={{ color: 'var(--ink-400)', fontSize: 'var(--fs-body-s)',
                          fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(d.confirmed_at as string).toLocaleDateString('ru-RU')}
                        </span>
                        <Price kopecks={d.price_kopecks as number} size="var(--fs-h3)" />
                      </Row>
                    </Row>
                  </div>
                ))}
              </Stack>
            )}
          </div>
        </Card>

        <Card>
          <Eyebrow>Сотрудники</Eyebrow>
          <Stack gap={0} style={{ marginTop: 8 }}>
            {s.staff.map((u, i) => (
              <div key={i}>
                {i > 0 && <Divider />}
                <Row style={{ justifyContent: 'space-between', padding: '10px 0' }}>
                  <span>{u.name as string}</span>
                  <Row gap={8}>
                    <Pill>{({ manager: 'Менеджер', master: 'Мастер', owner: 'Владелец',
                              network_admin: 'Сеть' } as Record<string, string>)[u.role as string]}</Pill>
                    <Pill tone={u.active ? 'quiet' : 'alert'}>
                      {u.active ? 'доступ есть' : 'отозван'}</Pill>
                  </Row>
                </Row>
              </div>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Shell>
  );
}
