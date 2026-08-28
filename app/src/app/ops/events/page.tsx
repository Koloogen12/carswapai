import { OpsFrame, OpsCard, OpsHead, OpsNav, OpsRow } from '@/screens/ops';
import { events } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

const HUMAN: Record<string, { title: string; tone: 'plain' | 'alert' | 'warm' | 'acid' }> = {
  'order.roll_verified': { title: 'Рулон сверен с выбором клиента', tone: 'acid' },
  'order.roll_mismatch': { title: 'Рулон не сошёлся — наряд заблокирован', tone: 'alert' },
  'channel.down':        { title: 'Канал отвалился', tone: 'alert' },
  'budget.soft':         { title: 'Расход дошёл до мягкого потолка', tone: 'warm' },
};

/**
 * Центр событий.
 *
 * Сюда попадает только то, что требует человека. Событие, на которое никто
 * не может отреагировать, — это шум, из-за которого перестают смотреть
 * и на настоящие.
 */
export default async function EventsPage() {
  const [rows, b] = await Promise.all([events(), budget()]);
  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard gap="18px">
        <OpsHead title="События" count={rows.length}
          note="только то, на что можно ответить действием" />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rows.length === 0 && (
            <OpsRow title="Ничего не требует вас" sub="События появятся, когда что-то пойдёт не так или потребует решения" />
          )}
          {rows.map((e, i) => {
            const h = HUMAN[e.action] ?? { title: e.action, tone: 'plain' as const };
            return (
              <OpsRow key={i} tone={h.tone} title={h.title}
                sub={`${new Date(e.at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}${e.actor ? ` · ${e.actor}` : ''} · ${e.entity}`} />
            );
          })}
        </div>
      </OpsCard>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/events" />
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Зачем это владельцу</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Лента — обратная сторона иммутабельности. Раз подтверждения и конфигурации
            не переписываются, должно быть видно, кто и что пытался сделать. Это же
            и первая линия поддержки: точка разбирается внутри продукта, не звоня
            в управляющую компанию.
          </span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
