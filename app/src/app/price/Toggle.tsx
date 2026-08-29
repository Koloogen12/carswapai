'use client';
/**
 * Тумблер артикула в прайсе точки.
 *
 * Разметка — та же, что была в макете: 44×24, кружок 18px, кислота на
 * включённом. Изменилось одно: он теперь работает.
 *
 * О-3 буквально: погашенный артикул не существует ни в панели менеджера, ни
 * в гараже клиента. Поэтому после переключения обновляются оба экрана, а не
 * только этот, — иначе менеджер продолжит отправлять то, чего в прайсе уже
 * нет, и узнает об этом от клиента.
 */
import { useState, useTransition } from 'react';
import { toggleSku } from '@/lib/pricing';

export function Toggle({ id, on }: { id: string; on: boolean }) {
  const [state, setState] = useState(on);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const flip = () => start(async () => {
    const next = !state;
    setState(next);                       // отзывчиво: палец уже нажал
    const r = await toggleSku(id, next);
    if (!r.ok) {
      setState(!next);                    // не вышло — возвращаем как было
      setErr(r.error);
    } else {
      setErr(null);
    }
  });

  return (
    <button onClick={flip} disabled={pending} aria-pressed={state}
      aria-label={state ? 'Погасить артикул' : 'Вернуть артикул в прайс'}
      title={err ?? undefined}
      style={{ width: "44px", height: "24px", borderRadius: "999px",
               background: err ? "#D93F45" : state ? "#111111" : "#E2E2E2",
               position: "relative", flex: "none", border: 0,
               cursor: pending ? "wait" : "pointer", padding: 0 }}>
      <span style={{ position: "absolute", top: "3px",
                     ...(state ? { right: "3px" } : { left: "3px" }),
                     width: "18px", height: "18px", borderRadius: "999px",
                     background: state ? "#DEF23B" : "#FFFFFF" }}></span>
    </button>
  );
}
