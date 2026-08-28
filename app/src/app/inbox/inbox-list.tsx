'use client';
import { useMemo, useState } from 'react';
import { Card, Eyebrow, Field, H, Pill, Row, Stack, Tabs, NoData } from '@/components/ui';
import { ChannelIcon, TryonState, UsageGauge } from '@/components/product';
import type { InboxRow } from '@/lib/data';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'hot', label: 'Горячие' },
  { id: 'none', label: 'Без примерки' },
];

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

export function InboxList({ rows, budget }: {
  rows: InboxRow[];
  budget: { spent_kopecks: number; soft_limit: number; hard_limit: number };
}) {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => rows.filter(r => {
    if (tab === 'hot' && r.state !== 'more' && r.state !== 'sent') return false;
    if (tab === 'none' && r.state !== null) return false;
    if (!q) return true;
    const hay = `${r.client_name} ${r.phone ?? ''} ${r.vehicle?.plate ?? ''} ${r.vehicle?.make ?? ''} ${r.vehicle?.model ?? ''}`;
    return hay.toLowerCase().includes(q.toLowerCase());
  }), [rows, tab, q]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20,
      alignItems: 'start' }}>
      <Stack gap={16}>
        <Row style={{ justifyContent: 'space-between' }} wrap>
          <div>
            <Eyebrow>Входящие</Eyebrow>
            <H level={1} style={{ marginTop: 4 }}>Диалоги точки</H>
          </div>
          <Row gap={10} wrap>
            <Tabs items={FILTERS} value={tab} onChange={setTab} />
          </Row>
        </Row>

        <div style={{ maxWidth: 380 }}>
          <Field placeholder="Клиент, номер или артикул" value={q}
            onChange={e => setQ(e.target.value)} aria-label="Поиск по диалогам" />
        </div>

        {list.length === 0 ? (
          <NoData label="Здесь пока пусто — обращения появятся сами, как только клиент напишет"
            height={160} />
        ) : (
          <Stack gap={10}>
            {list.map(r => (
              <a key={r.thread_id} href={`/inbox/${r.thread_id}`} style={{ display: 'block' }}>
                <Card pad={16} style={{ cursor: 'pointer' }}>
                  <Row style={{ justifyContent: 'space-between' }} align="flex-start">
                    <Row gap={12} align="flex-start" style={{ minWidth: 0 }}>
                      {/* К-7: канал — иконка на сообщении, никогда вкладка */}
                      <ChannelIcon id={r.channel ?? 'web'} />
                      <div style={{ minWidth: 0 }}>
                        <Row gap={8} wrap>
                          <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>
                            {r.client_name}
                          </span>
                          {r.vehicle?.make && (
                            <Pill>{r.vehicle.make} {r.vehicle.model}
                              {r.vehicle.year ? ` · ${r.vehicle.year}` : ''}</Pill>
                          )}
                          {r.vehicle?.plate && <Pill>{r.vehicle.plate}</Pill>}
                        </Row>
                        <div style={{ marginTop: 6, fontSize: 'var(--fs-body-s)',
                          color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', maxWidth: 620 }}>
                          {r.last_text ?? '—'}
                        </div>
                      </div>
                    </Row>
                    <Stack gap={8} style={{ alignItems: 'flex-end', flex: 'none' }}>
                      <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)',
                        fontVariantNumeric: 'tabular-nums' }}>{ago(r.last_at)}</span>
                      {r.state
                        ? <TryonState id={r.state} />
                        : <Pill tone="acid">Нет примерки</Pill>}
                    </Stack>
                  </Row>
                </Card>
              </a>
            ))}
          </Stack>
        )}
      </Stack>

      <Stack gap={14}>
        <UsageGauge spentKopecks={budget.spent_kopecks} capKopecks={budget.hard_limit} />
        <Card>
          <Eyebrow>Смена</Eyebrow>
          <Stack gap={10} style={{ marginTop: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>
                Обращений сегодня</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{rows.length}</span>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>
                Без примерки</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {rows.filter(r => !r.state).length}</span>
            </Row>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
