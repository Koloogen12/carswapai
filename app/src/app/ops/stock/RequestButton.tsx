'use client';
/**
 * Отправка заявки на материал.
 *
 * Кнопка знает ровно то, что видно на экране: какие артикулы не покрыты и
 * сколько метров не хватает. Поля «сколько заказать» нет намеренно — заявка
 * собирается из подтверждённых выборов, а не из ощущения владельца.
 */
import { useState, useTransition } from 'react';
import { requestMaterial } from '@/lib/material';

export function RequestButton({ items, waiting }: {
  items: { itemId: string; meters: number; title: string }[];
  waiting: number;
}) {
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();

  if (!items.length) return (
    <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
      Материала хватает на все подтверждённые выборы. Заявка не нужна.
    </span>
  );

  return (
    <>
      <button type="button" disabled={busy}
        onClick={() => start(async () => {
          const r = await requestMaterial(items.map(({ itemId, meters }) => ({ itemId, meters })));
          setState(r.ok
            ? { ok: true, text: `Заявка ушла в сеть · ${r.count} ${r.count === 1 ? 'артикул' : 'артикула'}. Сумму и срок сеть подтвердит отдельно.` }
            : { ok: false, text: r.error });
        })}
        style={{ border: 0, fontFamily: "inherit", cursor: busy ? "default" : "pointer", background: "#111111", color: "#FFFFFF", borderRadius: "999px", padding: "15px 0", fontSize: "13.5px", fontWeight: "500", width: "100%" }}>
        {busy ? 'Отправляем…' : waiting ? 'Обновить заявку в сети' : 'Отправить заявку в сеть'}
      </button>
      {state && (
        <div style={{ background: state.ok ? "#F5FBCB" : "#FBEEEF", borderRadius: "16px", padding: "11px 14px", fontSize: "11.5px", lineHeight: "1.45", color: state.ok ? "#2E2E2E" : "#8A4448" }}>
          {state.text}
        </div>
      )}
      <span style={{ fontSize: "11px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.45" }}>
        {waiting
          ? `${waiting} ${waiting === 1 ? 'артикул уже ждёт' : 'артикула уже ждут'} поставки — повтор не создаёт вторую.`
          : 'Заявка собирается из подтверждённых выборов, а не из ощущения владельца, что плёнка заканчивается.'}
      </span>
    </>
  );
}
