import { Shell, NavLink } from '@/components/shell';
import { Card, Divider, Eyebrow, H, NoData, Pill, Row, Stack } from '@/components/ui';
import { crmClients } from '@/lib/reports';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  created: 'Наряд создан', in_work: 'В работе', done: 'Выдано',
};

/** Экраны 47–48 · учётный слой. Обслуживает примерку и точкой входа не является. */
export default async function CrmPage() {
  const rows = await crmClients();
  return (
    <Shell user="Ирина Ковалёва" role="Менеджер · JETCAR Мытищи"
      nav={<>
        <NavLink href="/inbox">Инбокс</NavLink>
        <NavLink href="/crm" active>Клиенты</NavLink>
        <NavLink href="/price">Прайс</NavLink>
        <NavLink href="/owner">Точка</NavLink>
      </>}>
      <Stack gap={20}>
        <div>
          <Eyebrow>Точка</Eyebrow>
          <H level={1} style={{ marginTop: 4 }}>Клиенты</H>
        </div>
        <Card>
          {rows.length === 0 ? <NoData label="Карточки заводятся сами из диалогов" /> : (
            <Stack gap={0}>
              {rows.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <Divider />}
                  <Row style={{ justifyContent: 'space-between', padding: '14px 0' }}>
                    <Stack gap={4}>
                      <Row gap={8} wrap>
                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                        {(r.vehicle as { plate?: string })?.plate &&
                          <Pill>{(r.vehicle as { plate?: string }).plate}</Pill>}
                      </Row>
                      <span style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
                        {r.phone} · {(r.vehicle as { make?: string }).make}{' '}
                        {(r.vehicle as { model?: string }).model}
                      </span>
                    </Stack>
                    <Row gap={10}>
                      <Pill>{r.tryons} примерок</Pill>
                      {r.confirmed_at && <Pill tone="acid">выбор подтверждён</Pill>}
                      {r.order_status && <Pill tone="ink">{STATUS[r.order_status] ?? r.order_status}</Pill>}
                    </Row>
                  </Row>
                </div>
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    </Shell>
  );
}
