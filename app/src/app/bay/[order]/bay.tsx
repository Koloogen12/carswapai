'use client';
import { useState, useTransition } from 'react';
import { Button, Card, Divider, Eyebrow, H, Pill, Price, Row, Stack } from '@/components/ui';
import { LightSwitcher, type LightId } from '@/components/product';
import { verifyRoll, closeWork } from '@/lib/bay';
import type { BayRecord } from '@/lib/bay';

type Roll = { id: string; barcode: string; batch_number: string; meters_left: string;
              sku: string; name: string };

export function BayScreen({ rec, rolls }: { rec: BayRecord; rolls: Roll[] }) {
  const [tab, setTab] = useState<'record' | 'scan' | 'handover'>('record');
  const [light, setLight] = useState<LightId>('day');
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState(rec.status);
  const [batch, setBatch] = useState(rec.batch_number);
  const [pending, start] = useTransition();

  // МС-2: четыре обязательных поля. Отсутствие любого делает запись невалидной,
  // и это видно ДО начала работ, а не на выдаче.
  const fields = [
    { label: 'Артикул', value: `${rec.brand} ${rec.sku}`, ok: !!rec.sku },
    { label: 'Изображение выбранного варианта', value: `${rec.renders.length} из 3 световых условий`,
      ok: rec.renders.length === 3 },
    { label: 'Клиент подтвердил', value: rec.honesty_shown ? 'да, с показанной оговоркой' : 'нет',
      ok: rec.honesty_shown },
    { label: 'Дата подтверждения',
      value: new Date(rec.confirmed_at).toLocaleDateString('ru-RU',
        { day: 'numeric', month: 'long', year: 'numeric' }), ok: !!rec.confirmed_at },
  ];
  const complete = fields.every(f => f.ok);
  const img = rec.renders.find(r => r.variant === light)?.storage_path
    ?? rec.renders[0]?.storage_path;

  const scan = (rollId: string) => start(async () => {
    const r = await verifyRoll(rec.order_id, rollId);
    if (r.ok) {
      setStatus('in_work'); setErr(null);
      setBatch(rolls.find(x => x.id === rollId)?.batch_number ?? null);
    } else {
      setErr(r.error);
    }
  });

  return (
    <div data-surface="bay" style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 16px 60px' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 18 }}>Пост №2</span>
          <Pill tone={status === 'done' ? 'ink' : status === 'in_work' ? 'acid' : 'quiet'}>
            {status === 'done' ? 'Сдано' : status === 'in_work' ? 'В работе' : 'Ожидает сверки'}
          </Pill>
        </Row>

        <div className="seg" style={{ marginBottom: 14 }}>
          {([['record','Запись'],['scan','Сверка рулона'],['handover','Выдача']] as const)
            .map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-selected={tab === id} role="tab"
              style={{ border: 0, borderRadius: 'var(--r-pill)', minHeight: 'var(--tap-bay)',
                padding: '0 14px', cursor: 'pointer', fontSize: 'var(--fs-body)', fontWeight: 500,
                background: tab === id ? 'var(--ink-900)' : 'var(--white)',
                color: tab === id ? '#fff' : 'var(--ink-500)' }}>{label}</button>
          ))}
        </div>

        {/* Экраны 40–41 · запись и её полнота */}
        {tab === 'record' && (
          <Stack gap={14}>
            <Card pad={18}>
              <Eyebrow>Наряд {rec.number}</Eyebrow>
              <H level={2} style={{ marginTop: 6 }}>{rec.client_name}</H>
              <Row gap={8} wrap style={{ marginTop: 8 }}>
                <Pill>{rec.vehicle}</Pill>
                {rec.plate && <Pill>{rec.plate}</Pill>}
                {rec.meters_required && <Pill>{rec.meters_required} м плёнки</Pill>}
              </Row>
            </Card>

            <Card pad={18}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="Вариант, подтверждённый клиентом"
                style={{ width: '100%', borderRadius: 'var(--r-inner)', display: 'block' }} />
              <div style={{ marginTop: 12 }}>
                <LightSwitcher value={light} onChange={setLight} />
              </div>
              <div style={{ marginTop: 12, fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
                Это байт-в-байт то изображение, которое подтвердил клиент. Не перегенерация.
              </div>
            </Card>

            <Card pad={18} style={complete ? undefined : { boxShadow: 'inset 0 0 0 2px var(--alert-500)' }}>
              <Eyebrow>Четыре обязательных поля</Eyebrow>
              <Stack gap={10} style={{ marginTop: 10 }}>
                {fields.map(f => (
                  <Row key={f.label} style={{ justifyContent: 'space-between' }} align="flex-start">
                    <span style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>
                      {f.label}</span>
                    <span style={{ textAlign: 'right', fontWeight: 500,
                      color: f.ok ? 'var(--ink-900)' : 'var(--alert-500)' }}>
                      {f.ok ? f.value : 'не заполнено'}</span>
                  </Row>
                ))}
              </Stack>
              <Divider />
              <Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ color: 'var(--ink-500)' }}>Цена по подтверждению</span>
                <Price kopecks={rec.price_kopecks} size="var(--fs-h2)" />
              </Row>
              {!complete && (
                <div style={{ marginTop: 12, background: 'var(--alert-100)', color: '#8E2429',
                  padding: 14, borderRadius: 'var(--r-inner)', fontSize: 'var(--fs-body-s)' }}>
                  Запись неполная. Начинать оклейку нельзя: на выдаче предъявить будет нечего,
                  а переклейка — это плёнка и неделя занятого поста.
                </div>
              )}
            </Card>
          </Stack>
        )}

        {/* Экраны 42–44 · сканирование рулона, совпало или заблокировано */}
        {tab === 'scan' && (
          <Stack gap={14}>
            <Card pad={18}>
              <Eyebrow>Нужен артикул</Eyebrow>
              <H level={2} style={{ marginTop: 6 }}>{rec.brand} {rec.sku}</H>
              <div style={{ marginTop: 6, color: 'var(--ink-500)' }}>{rec.item_name}</div>
            </Card>

            {batch && status !== 'created' ? (
              <Card pad={18} style={{ background: 'var(--acid-500)' }}>
                <div style={{ fontWeight: 500, fontSize: 'var(--fs-h3)' }}>Артикул сошёлся</div>
                <div style={{ marginTop: 6 }}>Партия {batch} записана в карточку клиента</div>
              </Card>
            ) : (
              <Card pad={18}>
                <Eyebrow>Отсканируйте рулон</Eyebrow>
                {/* Доступность: сканер обязан иметь ручную альтернативу —
                    в боксе камера часто не читает грязный штрихкод. */}
                <Stack gap={10} style={{ marginTop: 12 }}>
                  {rolls.map(r => (
                    <Button key={r.id} kind="secondary" wide disabled={pending}
                      onClick={() => scan(r.id)}
                      style={{ justifyContent: 'space-between', padding: '0 16px' }}>
                      <span>{r.sku} · партия {r.batch_number}</span>
                      <span style={{ color: 'var(--ink-500)',
                        fontVariantNumeric: 'tabular-nums' }}>{r.meters_left} м</span>
                    </Button>
                  ))}
                </Stack>
              </Card>
            )}

            {err && (
              <Card pad={18} style={{ background: 'var(--alert-100)' }}>
                <div style={{ fontWeight: 500, color: '#8E2429', fontSize: 'var(--fs-h3)' }}>
                  Рулон другой — наряд заблокирован
                </div>
                <div style={{ marginTop: 8, color: '#8E2429', fontSize: 'var(--fs-body-s)' }}>
                  Клиент подтвердил {rec.brand} {rec.sku}. Оклейка не начинается,
                  менеджеру уже отправлено уведомление.
                </div>
              </Card>
            )}
          </Stack>
        )}

        {/* Экраны 45–46 · выдача и закрытие работы */}
        {tab === 'handover' && (
          <Stack gap={14}>
            <Card pad={18}>
              <Eyebrow>Показать клиенту</Eyebrow>
              <div className="g3" style={{ marginTop: 12 }}>
                {rec.renders.map(r => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={r.variant} src={r.storage_path} alt=""
                    style={{ width: '100%', borderRadius: 'var(--r-thumb)', display: 'block' }} />
                ))}
              </div>
              <Row gap={8} style={{ marginTop: 8, justifyContent: 'space-between' }}>
                {['День','Пасмурно','Паркинг'].map(l => (
                  <span key={l} style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-500)',
                    flex: 1, textAlign: 'center' }}>{l}</span>
                ))}
              </Row>
              <div style={{ marginTop: 14, background: 'var(--acid-100)', padding: 14,
                borderRadius: 'var(--r-inner)', fontSize: 'var(--fs-body-s)' }}>
                {rec.honesty_line}
              </div>
              <div style={{ marginTop: 14, background: 'var(--acid-500)', padding: 16,
                borderRadius: 'var(--r-inner)' }}>
                <div style={{ fontWeight: 500 }}>Клиент подтвердил выбор сам</div>
                <div style={{ marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(rec.confirmed_at).toLocaleString('ru-RU',
                    { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{rec.brand} {rec.sku}
                </div>
              </div>
            </Card>
            <Button wide disabled={status === 'done' || pending}
              onClick={() => start(async () => { await closeWork(rec.order_id); setStatus('done'); })}>
              {status === 'done' ? 'Работа закрыта' : 'Закрыть работу'}
            </Button>
          </Stack>
        )}
      </div>
    </div>
  );
}
