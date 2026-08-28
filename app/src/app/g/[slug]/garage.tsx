'use client';
import { useMemo, useState } from 'react';
import { Button, Card, Divider, Eyebrow, H, NoData, Pill, Price, Row, Sku, Stack } from '@/components/ui';
import { HonestyLine, LightSwitcher, RenderSlot, type LightId } from '@/components/product';

type Item = {
  point_price_id: string; sku: string; name: string; brand: string; category: string;
  finish: string; price_kopecks: number; in_stock: boolean; hex: string | null;
};

const CATS = [
  { id: 'film', label: 'Плёнка' },
  { id: 'ppf', label: 'Защита PPF' },
  { id: 'tint', label: 'Тонировка' },
  { id: 'wheel', label: 'Диски' },
  { id: 'interior', label: 'Салон' },
];

const FREE_PHOTO_RENDERS = 8;   // Г-9: квота расходуется только на фото клиента

export function Garage({ pointName, slug, items, models }: {
  pointName: string; slug: string; items: Item[];
  models: { id: string; make: string; model: string }[];
}) {
  const [step, setStep] = useState<'enter' | 'tryon' | 'sent'>('enter');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoBad, setPhotoBad] = useState(false);
  const [alreadyWrapped, setAlreadyWrapped] = useState(false);
  const [model, setModel] = useState<string>('');
  const [cat, setCat] = useState('film');
  const [light, setLight] = useState<LightId>('day');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [compare, setCompare] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [used, setUsed] = useState(0);
  const [consent, setConsent] = useState(false);

  const byCat = useMemo(() => {
    const m: Record<string, Item[]> = {};
    for (const i of items) (m[i.category] ??= []).push(i);
    return m;
  }, [items]);

  const chosen = Object.values(picked)
    .map(id => items.find(i => i.point_price_id === id)).filter(Boolean) as Item[];
  const total = chosen.reduce((s, i) => s + i.price_kopecks, 0)
    + (alreadyWrapped ? (items.find(i => i.category === 'service')?.price_kopecks ?? 0) : 0);

  const overLimit = used >= FREE_PHOTO_RENDERS;

  /* Экран 24–26 · вход. Г-1: ноль полей до первой примерки. Фото — не гейт. */
  if (step === 'enter') {
    return (
      <Frame point={pointName}>
        <Stack gap={16}>
          <Stack gap={6}>
            <Eyebrow>{pointName}</Eyebrow>
            <H level={1}>Посмотрите свою машину в новом цвете</H>
            <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>
              Ничего заполнять не нужно. Выберите модель — покажем за 20 секунд,
              а фото пришлёте потом, если захотите точнее.
            </p>
          </Stack>

          <RenderSlot state={{ kind: 'ready', src: '/renders/wrap-04-lagoon.jpg' }} />

          <Card pad={14}>
            <Eyebrow>Марка и модель</Eyebrow>
            <select value={model} onChange={e => setModel(e.target.value)}
              aria-label="Марка и модель"
              style={{ width: '100%', minHeight: 'var(--tap)', marginTop: 8, borderRadius: 'var(--r-btn)',
                border: 0, boxShadow: 'inset 0 0 0 1px var(--rule-strong)', padding: '0 14px',
                fontSize: 'var(--fs-body)', fontFamily: 'inherit', background: 'var(--white)' }}>
              <option value="">Выберите модель</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.make} {m.model}</option>)}
            </select>
            <Button wide style={{ marginTop: 10 }} disabled={!model}
              onClick={() => setStep('tryon')}>Показать за 20 секунд</Button>
          </Card>

          <Divider />

          <Card pad={14}>
            <Eyebrow>Или пришлите фото своей машины</Eyebrow>
            <p style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)', marginTop: 6 }}>
              Тогда увидите именно свой автомобиль — свой номер, свои диски, свой двор.
            </p>
            {/* §13: согласие собирается ДО загрузки фото. Отказ не блокирует
                продукт — работает ветка по марке и модели. */}
            <label style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'flex-start',
              fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: 3, width: 18, height: 18 }} />
              <span>Согласен на обработку фотографии автомобиля для примерки.
                Фото хранится в карточке этой точки и не передаётся третьим лицам.</span>
            </label>
            <Button wide kind="secondary" style={{ marginTop: 12 }} disabled={!consent}
              onClick={() => { setHasPhoto(true); setStep('tryon'); }}>
              Загрузить фото
            </Button>
          </Card>
        </Stack>
      </Frame>
    );
  }

  /* Экран 39 · конфигурация ушла в точку */
  if (step === 'sent') {
    return (
      <Frame point={pointName}>
        <Stack gap={16}>
          <Card pad={18}>
            <Eyebrow>Готово</Eyebrow>
            <H level={2} style={{ marginTop: 6 }}>Ваша сборка ушла в {pointName}</H>
            <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)', marginTop: 8 }}>
              Менеджер увидит её вместе с артикулами и ценой и напишет вам.
              Ссылка на сборку останется у вас — можно показать близким.
            </p>
            <div className="g3" style={{ marginTop: 14 }}>
              {chosen.slice(0, 3).map(i => (
                <RenderSlot key={i.point_price_id}
                  state={{ kind: 'ready', src: renderFor(i.sku, light) }} />
              ))}
            </div>
            <div style={{ marginTop: 14 }}><HonestyLine /></div>
          </Card>
          <Button wide kind="secondary" onClick={() => setStep('tryon')}>Вернуться к примерке</Button>
        </Stack>
      </Frame>
    );
  }

  /* Экраны 27–38 · примерка */
  return (
    <Frame point={pointName}>
      <Stack gap={14}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Eyebrow>{pointName}</Eyebrow>
          <Pill tone={overLimit ? 'alert' : used >= FREE_PHOTO_RENDERS - 2 ? 'acid' : 'quiet'}>
            {hasPhoto ? `${used} из ${FREE_PHOTO_RENDERS} на вашем фото` : 'типовой кузов · без ограничений'}
          </Pill>
        </Row>

        {/* Экран 36 · фото непригодно, тёплый отказ с фолбэком, не стена */}
        {photoBad ? (
          <Card pad={14}>
            <RenderSlot state={{ kind: 'rejected',
              reason: 'нужен вид сбоку или три четверти целиком' }} />
            <p style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)', marginTop: 10 }}>
              Кадр не подошёл — машина обрезана. Пока показываем типовой кузов вашей модели,
              пришлите другой кадр, и пересоберём на нём.
            </p>
            <Button wide kind="secondary" style={{ marginTop: 10 }}
              onClick={() => setPhotoBad(false)}>Показать типовой кузов</Button>
          </Card>
        ) : compare ? (
          /* Экран 32 · сравнение двух вариантов рядом, без перелистывания */
          <Card pad={14}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Eyebrow>Сравнение</Eyebrow>
              <button onClick={() => setCompare(false)} style={{ border: 0, background: 'none',
                color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)', cursor: 'pointer' }}>
                Закрыть</button>
            </Row>
            <div className="g2" style={{ marginTop: 10 }}>
              {chosen.slice(0, 2).map(i => (
                <Stack key={i.point_price_id} gap={6}>
                  <RenderSlot state={{ kind: 'ready', src: renderFor(i.sku, light) }} ratio="3 / 4" />
                  <div style={{ fontSize: 'var(--fs-body-s)', fontWeight: 500 }}>{i.name}</div>
                  <Price kopecks={i.price_kopecks} size="var(--fs-body)" />
                </Stack>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              {/* Свет применяется сразу к обоим сравниваемым вариантам */}
              <LightSwitcher value={light} onChange={setLight} />
            </div>
          </Card>
        ) : (
          <Stack gap={10}>
            <RenderSlot state={overLimit && hasPhoto
              ? { kind: 'partial', src: renderFor(chosen[0]?.sku ?? '', light) }
              : { kind: 'ready', src: renderFor(chosen[0]?.sku ?? '', light) }} />
            {/* Экран 33 · три света на одном артикуле */}
            <LightSwitcher value={light} onChange={setLight} />
          </Stack>
        )}

        {/* Экран 35 · лимит исчерпан: мягкая деградация, не стена */}
        {overLimit && hasPhoto && (
          <Card pad={14} style={{ background: 'var(--acid-100)' }}>
            <div style={{ fontSize: 'var(--fs-body-s)', color: 'var(--ink-700)' }}>
              Восемь примерок на вашем фото готовы. Дальше можно бесконечно крутить
              на типовом кузове вашей модели, а на своём фото — как только отправите
              сборку в {pointName}.
            </div>
          </Card>
        )}

        {/* Г-3, Г-4 · четыре категории, комбинируются в одной конфигурации */}
        <div className="seg" role="tablist">
          {CATS.filter(c => (byCat[c.id]?.length ?? 0) > 0).map(c => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
              style={{ border: 0, borderRadius: 'var(--r-pill)', padding: '10px 14px',
                minHeight: 44, cursor: 'pointer', fontSize: 'var(--fs-label)', fontWeight: 500,
                background: cat === c.id ? 'var(--ink-900)' : 'var(--white)',
                color: cat === c.id ? '#fff' : 'var(--ink-500)' }}>{c.label}</button>
          ))}
        </div>

        {/* Экран 31 · категории без позиций в прайсе точки просто нет (О-3) */}
        {(byCat[cat]?.length ?? 0) === 0 ? (
          <NoData label={`В прайсе ${pointName} этой категории нет`} />
        ) : (
          <Stack gap={8}>
            {byCat[cat]!.map(i => {
              const on = picked[cat] === i.point_price_id;
              return (
                <button key={i.point_price_id} aria-pressed={on}
                  onClick={() => {
                    setPicked(p => ({ ...p, [cat]: on ? '' : i.point_price_id }));
                    if (hasPhoto && !on) setUsed(u => u + 1);
                  }}
                  style={{ border: 0, borderRadius: 'var(--r-inner)', padding: 12, minHeight: 44,
                    cursor: 'pointer', textAlign: 'left',
                    background: on ? 'var(--acid-500)' : 'var(--white)',
                    opacity: i.in_stock ? 1 : .55 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row gap={10} style={{ minWidth: 0 }}>
                      <span aria-hidden style={{ width: 24, height: 24, borderRadius: 999,
                        background: i.hex ?? '#B9BDC0', flex: 'none',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 'var(--fs-body-s)',
                          fontWeight: 500, color: 'var(--ink-900)' }}>{i.name}</span>
                        <Sku>{i.brand} {i.sku}{!i.in_stock && ' · под заказ'}</Sku>
                      </span>
                    </Row>
                    <Price kopecks={i.price_kopecks} size="var(--fs-body)" />
                  </Row>
                </button>
              );
            })}
          </Stack>
        )}

        {/* Экран 37 · машина уже оклеена — снятие входит в расчёт позицией */}
        <label style={{ display: 'flex', gap: 10, alignItems: 'center',
          fontSize: 'var(--fs-body-s)', color: 'var(--ink-500)' }}>
          <input type="checkbox" checked={alreadyWrapped}
            onChange={e => setAlreadyWrapped(e.target.checked)}
            style={{ width: 18, height: 18 }} />
          Машина уже оклеена — добавить снятие старой плёнки
        </label>

        <Card pad={14}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Eyebrow>Ваша сборка · {chosen.length} из 4 категорий</Eyebrow>
          </Row>
          <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-body-s)' }}>Итого</span>
            <Price kopecks={total} size="var(--fs-h1)" />
          </Row>
          <div style={{ marginTop: 12 }}><HonestyLine /></div>
          <Stack gap={8} style={{ marginTop: 12 }}>
            <Button wide disabled={chosen.length === 0} onClick={() => setStep('sent')}>
              Отправить сборку в {pointName}
            </Button>
            <Row gap={8}>
              <Button kind="secondary" style={{ flex: 1 }} disabled={chosen.length < 2}
                onClick={() => setCompare(true)}>Сравнить рядом</Button>
              <Button kind="secondary" style={{ flex: 1 }}
                onClick={() => setSaved(s => [...s, chosen.map(c => c.sku).join('+')])}>
                Сохранить{saved.length ? ` · ${saved.length}` : ''}</Button>
            </Row>
            <Button kind="ghost" wide
              onClick={() => navigator.clipboard?.writeText(
                `${location.origin}/g/${slug}?c=${chosen.map(c => c.sku).join('-')}`)}>
              Скопировать ссылку на сборку
            </Button>
          </Stack>
        </Card>

        {hasPhoto && (
          <Button kind="ghost" wide onClick={() => setPhotoBad(true)}>
            Показать состояние «фото не подошло»
          </Button>
        )}
      </Stack>
    </Frame>
  );
}

function Frame({ point, children }: { point: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex',
      justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, padding: '20px 16px 60px' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 600, letterSpacing: '-0.03em' }}>CarSwap</span>
          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ink-400)' }}>{point}</span>
        </Row>
        {children}
      </div>
    </div>
  );
}

function renderFor(sku: string, light: LightId) {
  const byLight: Record<string, Record<string, string>> = {
    K75400: { day: 'light-black-sun.jpg', overcast: 'light-black-cloud.jpg', parking: 'light-black-park.jpg' },
    'HX20-LG': { day: 'light-lagoon-sun.jpg', overcast: 'light-lagoon-cloud.jpg', parking: 'light-lagoon-park.jpg' },
    'GAL-OL': { day: 'light-olive-sun.jpg', overcast: 'light-olive-cloud.jpg', parking: 'light-olive-park.jpg' },
  };
  const flat: Record<string, string> = {
    K75407: 'wrap-02-satin-black.jpg', '970-070': 'wrap-06-anthracite.jpg',
    'HX20-LG': 'wrap-04-lagoon.jpg', 'GAL-OL': 'wrap-03-olive.jpg',
    K75400: 'wrap-02-satin-black.jpg', 'ATR-20': 'wrap-01-silver.jpg',
    'PPF-PPF': 'wrap-01-silver.jpg', 'PPF-MATTE': 'wrap-06-anthracite.jpg',
  };
  return `/renders/${byLight[sku]?.[light] ?? flat[sku] ?? 'wrap-04-lagoon.jpg'}`;
}
