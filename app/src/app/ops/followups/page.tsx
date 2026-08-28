import { OpsFrame, OpsCard, OpsHead, OpsNav, OpsRow, OpsBtn, rub } from '@/screens/ops';
import { followUps } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const THUMB = ['/renders/render-03.png','/renders/render-04.png','/renders/render-11.png','/renders/render-12.png'];

/**
 * Дожим окна 1–7 дней.
 *
 * Самая дорогая потеря продукта стоит ПОСЛЕ момента «ага»: клиент уже
 * подтвердил цвет, но не доехал. Список сортируется по возрасту молчания,
 * а не по сумме: тухнет время, а не деньги.
 */
export default async function FollowUpsPage() {
  const [rows, b] = await Promise.all([followUps(), budget()]);
  const hot = rows.filter(r => r.silent_days >= 5);
  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard>
        <OpsHead title="Подтвердили цвет, но не записаны" count={rows.length}
          note="поднимается наверх само на 2-й, 4-й и 6-й день" />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.length === 0 && (
            <OpsRow title="Никто не подвис" sub="Все подтверждённые выборы дошли до записи на замер" />
          )}
          {rows.map((r, i) => (
            <OpsRow key={r.id} img={THUMB[i % THUMB.length]}
              tone={r.silent_days >= 5 ? 'alert' : r.silent_days >= 2 ? 'warm' : 'plain'}
              title={`${r.name ?? 'Клиент'} · ${r.vehicle || 'авто не указано'}`}
              sub={`подтвердил ${new Date(r.confirmed_at).toLocaleDateString('ru-RU')} · ${r.silent_days}-й день молчания · ${rub(r.price_kopecks)} ₽`}
              right={<>
                <OpsBtn dark>Позвонить</OpsBtn>
                <a href={`/c/${r.configuration_id}`}><OpsBtn>Напомнить в чат</OpsBtn></a>
              </>} />
          ))}
        </div>
      </OpsCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/followups" />
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Почему этот список первый</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Между подтверждением цвета и замером проходит от одного до семи дней, и здесь
            теряется больше сделок, чем на всех остальных узлах вместе. Эмоция остывает,
            конкурент всплывает по ходу, а усилие на момент «ага» уже потрачено.
          </span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Поэтому сортировка по возрасту молчания, а не по сумме: тухнет время,
            а не деньги. Красным — шестой день, дальше вероятность падает резко.
          </span>
        </OpsCard>
        <OpsCard gap="10px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Молчат больше пяти дней</span>
          <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{hot.length}</span>
          <span style={{ fontSize: "12px", color: "#9A9A9A" }}>
            на сумму {rub(hot.reduce((s, r) => s + r.price_kopecks, 0))} ₽</span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
