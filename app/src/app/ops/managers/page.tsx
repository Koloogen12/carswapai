import { OpsFrame, OpsCard, OpsHead, OpsNav } from '@/screens/ops';
import { managerReport } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Отчёт по менеджерам · кто доводит.
 *
 * Меряется не активность, а доведение: подтверждённый клиентом выбор.
 * Число отправленных примерок само по себе ничего не значит — менеджер,
 * отправивший тридцать карточек без единого подтверждения, работал вхолостую.
 */
export default async function ManagersPage() {
  const [rows, b] = await Promise.all([managerReport(), budget()]);
  const max = Math.max(1, ...rows.map(r => r.tryons));
  return (
    <OpsFrame user="Артём Лебедев" role="Владелец" spent={b.spent_kopecks} cap={b.hard_limit}>
      <OpsCard gap="18px">
        <OpsHead title="Кто доводит" note="считается подтверждённый выбор, а не активность" />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rows.map(r => {
            const rate = r.tryons ? Math.round((r.confirmed / r.tryons) * 100) : 0;
            return (
              <div key={r.id} style={{ background: "#F7F7F7", borderRadius: "18px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "999px", background: "#EFEFEF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: "600", color: "#6E6E6E", flex: "none" }}>
                    {r.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <span style={{ flex: 1, fontSize: "15px", fontWeight: "500" }}>{r.name}</span>
                  <span style={{ fontSize: "11.5px", fontWeight: "500", background: rate >= 40 ? "#DEF23B" : "#FFFFFF", borderRadius: "999px", padding: "5px 11px", fontVariantNumeric: "tabular-nums" }}>
                    {rate}% доведено</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "10px" }}>
                  {[['Диалогов', r.threads], ['Примерок', r.tryons], ['Подтверждено', r.confirmed]].map(([l, v]) => (
                    <div key={l as string} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "11px", color: "#9A9A9A" }}>{l as string}</span>
                      <span style={{ fontSize: "20px", fontWeight: "500", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{v as number}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: "6px", borderRadius: "999px", background: "#EFEFEF", overflow: "hidden" }}>
                  <div style={{ width: `${(r.tryons / max) * 100}%`, height: "100%", background: "#111111" }}></div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Менеджеров пока нет</span>
          )}
        </div>
      </OpsCard>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <OpsNav active="/ops/managers" />
        <OpsCard gap="12px">
          <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.02em" }}>
            Почему не считаем отправки</span>
          <span style={{ fontSize: "13px", lineHeight: "1.5", color: "#6E6E6E" }}>
            Тридцать карточек без единого подтверждения — это работа вхолостую,
            а в отчёте по активности она выглядит лучше всех. Поэтому здесь
            доля доведённых до подтверждённого выбора, и отправки видны рядом
            только чтобы понимать, где искать причину.
          </span>
        </OpsCard>
      </div>
    </OpsFrame>
  );
}
