'use client';
import { useState, useTransition } from 'react';
import { Button, Card, Divider, Eyebrow, H, Pill, Price, Row, Sku, Stack } from '@/components/ui';
import { ChannelIcon, ConfirmationStamp, HonestyLine, LightSwitcher, RenderSlot,
         type LightId } from '@/components/product';
import { sendCard } from '@/lib/actions';
import type { PriceRow, ThreadView } from '@/lib/data';

/**
 * Диалог и панель примерки — экраны 11–21.
 *
 * О-8: панель это часть экрана диалога, а не отдельная страница. Между
 * открытием диалога и отправленной карточкой нет ни одного перехода —
 * поэтому здесь нет ни одной ссылки, уводящей со страницы, и не должно
 * появиться.
 */
export function Dialog({ thread, prices, budget }: {
  thread: ThreadView; prices: PriceRow[];
  budget: { hard_reached: boolean; spent_kopecks: number; hard_limit: number };
}) {
  const films = prices.filter(p => p.category === 'film');
  const [picked, setPicked] = useState<string[]>(films.slice(0, 3).map(p => p.point_price_id));
  const [light, setLight] = useState<LightId>('day');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const toggle = (id: string) => setPicked(p =>
    p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : [p[1], p[2], id]);

  const chosen = picked.map(id => films.find(f => f.point_price_id === id)!).filter(Boolean);
  const total = chosen.reduce((s, f) => s + f.price_kopecks, 0);

  const send = () => start(async () => {
    const r = await sendCard(thread.thread_id, picked);
    setResult(r.ok ? null : r.error);
    setSent(r.ok);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 460px', gap: 20,
      alignItems: 'start' }}>

      {/* ── Лента диалога ─────────────────────────────────── */}
      <Stack gap={14}>
        <Row style={{ justifyContent: 'space-between' }} wrap>
          <Stack gap={6}>
            <Row gap={10} wrap>
              <H level={1}>{thread.client_name}</H>
              {thread.vehicle?.plate && <Pill>{thread.vehicle.plate}</Pill>}
            </Row>
            <Row gap={8} wrap>
              {thread.vehicle?.make &&
                <Pill>{thread.vehicle.make} {thread.vehicle.model} · {thread.vehicle.year}</Pill>}
              <span style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
                {thread.phone}</span>
            </Row>
          </Stack>
          <a href="/inbox" style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
            ← Ко всем диалогам</a>
        </Row>

        <Card pad={18}>
          <Stack gap={14}>
            {thread.messages.map(m => (
              <Row key={m.id} align="flex-start" gap={10}
                style={{ justifyContent: m.direction === 'in' ? 'flex-start' : 'flex-end' }}>
                {m.direction === 'in' && <ChannelIcon id={m.channel} />}
                <div style={{
                  maxWidth: 560, padding: '12px 16px', borderRadius: 'var(--r-inner)',
                  background: m.direction === 'in' ? 'var(--surface)' : 'var(--ink-900)',
                  color: m.direction === 'in' ? 'var(--ink-700)' : '#fff',
                  fontSize: 'var(--fs-body-s)',
                }}>
                  {m.body}
                  <div style={{ marginTop: 4, fontSize: 'var(--fs-caption)', opacity: .6,
                    fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(m.sent_at).toLocaleTimeString('ru-RU',
                      { hour: '2-digit', minute: '2-digit' })}
                    {m.direction === 'out' && ` · ${m.delivery === 'delivered'
                      ? 'доставлено' : m.delivery === 'failed' ? 'не доставлено' : 'отправляется'}`}
                  </div>
                </div>
              </Row>
            ))}
            {sent && (
              <Row style={{ justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: 560 }}>
                  <Card pad={14} style={{ background: 'var(--surface)' }}>
                    <Eyebrow>Отправлено клиенту</Eyebrow>
                    <div className="g3" style={{ marginTop: 10 }}>
                      {chosen.map(f => (
                        <RenderSlot key={f.point_price_id}
                          state={{ kind: 'ready', src: renderFor(f.sku, light) }} />
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}><HonestyLine /></div>
                  </Card>
                </div>
              </Row>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* ── Панель примерки ───────────────────────────────── */}
      <Card pad={18}>
        <Stack gap={14}>
          <Row style={{ justifyContent: 'space-between' }} wrap>
            <Eyebrow>Панель примерки</Eyebrow>
            <Pill tone="quiet">
              {thread.vehicle_model_id ? 'Кузов распознан' : 'Кузов не распознан'}
            </Pill>
          </Row>

          {/* К-3: типовой кузов доступен без фото. Ни один экран не блокирует
              движение до загрузки фотографии. */}
          <Row gap={8} wrap>
            <Pill tone="ink">Типовой кузов · 18 сек</Pill>
            <Pill>Фото клиента — апгрейд</Pill>
          </Row>

          <LightSwitcher value={light} onChange={setLight} />

          <div className="g3">
            {chosen.map(f => (
              <RenderSlot key={f.point_price_id}
                state={{ kind: 'ready', src: renderFor(f.sku, light) }} />
            ))}
            {Array.from({ length: Math.max(0, 3 - chosen.length) }).map((_, i) => (
              <RenderSlot key={`e${i}`} state={{ kind: 'working', eta: 'выберите артикул' }} />
            ))}
          </div>

          <Divider />
          <Eyebrow>Артикулы из прайса точки · выбрано {picked.length} из 3</Eyebrow>
          <Stack gap={8} style={{ maxHeight: 260, overflowY: 'auto' }}>
            {films.map(f => {
              const on = picked.includes(f.point_price_id);
              return (
                <button key={f.point_price_id} onClick={() => toggle(f.point_price_id)}
                  aria-pressed={on}
                  style={{
                    border: 0, borderRadius: 'var(--r-inner)', padding: 12, cursor: 'pointer',
                    textAlign: 'left', minHeight: 'var(--tap)',
                    background: on ? 'var(--acid-500)' : 'var(--surface)',
                    opacity: f.in_stock ? 1 : .55,
                  }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row gap={10} style={{ minWidth: 0 }}>
                      <span aria-hidden style={{ width: 22, height: 22, borderRadius: 999,
                        background: f.hex ?? '#999', flex: 'none',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 'var(--fs-body-s)',
                          fontWeight: 500, color: 'var(--ink-900)' }}>{f.name}</span>
                        <Sku>{f.brand} {f.sku}{!f.in_stock ? ' · нет на складе' : ''}</Sku>
                      </span>
                    </Row>
                    <Price kopecks={f.price_kopecks} size="var(--fs-body)" />
                  </Row>
                </button>
              );
            })}
          </Stack>

          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>
              Диапазон цен</span>
            <Price kopecks={Math.round(total / Math.max(1, chosen.length))}
              size="var(--fs-h2)" />
          </Row>

          <HonestyLine />

          {result && (
            <div style={{ background: 'var(--alert-100)', color: '#8E2429', padding: 12,
              borderRadius: 'var(--r-inner)', fontSize: 'var(--fs-body-s)' }}>{result}</div>
          )}

          {sent ? (
            <ConfirmationStamp
              at={new Date().toLocaleString('ru-RU',
                { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              sku={chosen.map(c => c.sku).join(' · ')} />
          ) : (
            <Button wide onClick={send} disabled={picked.length !== 3 || pending}>
              {pending ? 'Отправляем…' : 'Отправить клиенту'}
            </Button>
          )}
          <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)',
            textAlign: 'center' }}>
            Уходит комплектом: 3 артикула × 3 света, артикул, цена и строка про оттенок
          </div>
        </Stack>
      </Card>
    </div>
  );
}

function renderFor(sku: string, light: LightId) {
  const byLight: Record<string, Record<string, string>> = {
    K75400: { day: 'light-black-sun.jpg', overcast: 'light-black-cloud.jpg',
              parking: 'light-black-park.jpg' },
    'HX20-LG': { day: 'light-lagoon-sun.jpg', overcast: 'light-lagoon-cloud.jpg',
                 parking: 'light-lagoon-park.jpg' },
    'GAL-OL': { day: 'light-olive-sun.jpg', overcast: 'light-olive-cloud.jpg',
                parking: 'light-olive-park.jpg' },
  };
  const flat: Record<string, string> = {
    K75407: 'wrap-02-satin-black.jpg', '970-070': 'wrap-06-anthracite.jpg',
    'HX20-LG': 'wrap-04-lagoon.jpg', 'GAL-OL': 'wrap-03-olive.jpg',
    K75400: 'wrap-02-satin-black.jpg', 'ATR-20': 'wrap-01-silver.jpg',
  };
  return `/renders/${byLight[sku]?.[light] ?? flat[sku] ?? 'wrap-01-silver.jpg'}`;
}
