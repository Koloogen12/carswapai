import { channelHealth, budget } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * Модуль 10 захода 4 · помощь внутри продукта.
 *
 * Разметка из блока 3, рамка 1 — байт в байт: рамка 390×760, отбивка 28/16/18,
 * поле поиска пилюлей 13/16, карточка ситуаций 26 · 20.
 *
 * С-3 · ноль обращений точки в управляющую компанию — главный критерий
 * плательщика. Поэтому наверху не FAQ, а конкретная ситуация, которая
 * прямо сейчас есть у этой точки: отвалившийся канал, кончившиеся генерации.
 * Общий список — ниже.
 */
export default async function HelpPage() {
  const [channels, b] = await Promise.all([channelHealth(), budget()]);
  const down = channels.find(c => c.status !== 'connected');
  const usage = b.hard_limit ? Math.round((b.spent_kopecks / b.hard_limit) * 100) : 0;

  const cases: { title: string; sub?: string; hot?: boolean }[] = [];
  if (down) cases.push({ title: `${cap(down.kind)} отвалился`,
    sub: 'привязать заново · 40 секунд', hot: true });
  if (usage >= 80) cases.push({ title: 'Кончаются генерации',
    sub: 'поднять лимит или дождаться месяца', hot: !down });
  cases.push({ title: 'Avito не даёт подключиться' });
  if (usage < 80) cases.push({ title: 'Кончились генерации' });
  cases.push({ title: 'Клиент не получил карточку' });
  cases.push({ title: 'Артикула нет в прайсе' });
  cases.push({ title: 'Рулон не сошёлся с записью' });

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "390px", minHeight: "760px", background: "#EFEFEF", borderRadius: "42px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "28px 16px 18px", gap: "14px" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em", lineHeight: "1.2" }}>Помощь</span>
          <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>
            Всё решается здесь. Звонить в управляющую компанию не нужно —
            и это наш главный критерий.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "9px", background: "#FFFFFF", borderRadius: "999px", padding: "13px 16px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
          <span style={{ fontSize: "14px", color: "#9A9A9A" }}>В чём проблема</span>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Частые ситуации</span>
          {cases.map(c => (
            <div key={c.title} style={{ display: "flex", alignItems: "center", gap: "11px", background: c.hot ? "#DEF23B" : "#F7F7F7", borderRadius: "15px", padding: "13px 15px" }}>
              <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: c.hot ? "500" : "400" }}>{c.title}</span>
                {c.sub && <span style={{ fontSize: "10.5px", ...(c.hot ? { opacity: ".6" } : { color: "#6E6E6E" }) }}>{c.sub}</span>}
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M9 6l6 6-6 6" /></svg>
            </div>
          ))}
        </div>

        <div style={{ background: "#111111", borderRadius: "26px", padding: "20px", display: "flex", flexDirection: "column", gap: "11px" }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>Не нашли ответ</span>
          <span style={{ fontSize: "12px", lineHeight: "1.5", color: "#DDDDDD" }}>
            Напишите нам в чат. Отвечаем в рабочие часы за 12 минут в среднем.
            Управляющая компания не участвует.
          </span>
          <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Написать в поддержку</span>
          </div>
        </div>

        {/* Счётчик показывает точке, что она справляется сама. Это же —
            главный критерий, по которому сеть решает про раскатку. */}
        <div style={{ marginTop: "auto", background: "#FFFFFF", borderRadius: "22px", padding: "15px 17px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "11px", color: "#9A9A9A" }}>Обращений в УК с вашей точки</span>
            <span style={{ fontSize: "15px", fontWeight: "500" }}>0 за месяц</span>
          </div>
          <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "6px 11px", flex: "none" }}>норма</span>
        </div>
      </div>
    </div>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
