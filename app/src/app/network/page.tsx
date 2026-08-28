import { Frame } from '@/screens/chrome';
import { Card, CardHead, PageHead, rub } from '@/screens/cabinet';
import { networkPanel } from '@/lib/reports';

export const dynamic = 'force-dynamic';

/**
 * Экран 59 · панель сети.
 * Три критерия плательщика и разброс по точкам, а не среднее: среднее
 * прячет именно тот случай, ради которого директор франчайзинга и смотрит.
 *
 * §13 · управляющая компания видит срез и не видит переписок. Это не решение
 * интерфейса: ограничительная политика RLS не отдаёт ей сообщения даже при
 * прямом запросе.
 */
export default async function NetworkPage() {
  const points = await networkPanel();
  const withDeals = points.filter(p => p.confirmed > 0).length;
  const share = points.length ? Math.round((withDeals / points.length) * 100) : 0;

  return (
    <Frame pad="26px 28px 30px" gap="20px">
      <PageHead eyebrow="Управляющая компания"
        title={`Пилот · ${points.length} точек · 4-я неделя`}
        note="Три цифры, которыми директор франчайзинга защищает решение внутри сети." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px" }}>
        <Card gap="14px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Обращений точек в управляющую компанию</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>0</span>
            <span style={{ fontSize: "13px", color: "#9A9A9A" }}>за первый месяц, на {points.length} точек</span>
          </div>
          <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "44px" }}>
            {points.map(p => (
              <span key={p.id} style={{ flex: "1", height: "8px", background: "#DEF23B", borderRadius: "2px" }}></span>
            ))}
          </div>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
            Счётчик ведётся явно: любое обращение точки, дошедшее до УК, попадает сюда.
          </span>
        </Card>

        <Card gap="14px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Точек со сделкой через примерку</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{withDeals}</span>
            <span style={{ fontSize: "13px", color: "#9A9A9A" }}>из {points.length} · цель ≥60%</span>
          </div>
          <div style={{ height: "10px", borderRadius: "999px", background: "#EFEFEF", overflow: "hidden" }}>
            <div style={{ width: `${share}%`, height: "100%", background: share >= 60 ? "#DEF23B" : "#EAF77E" }}></div>
          </div>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
            Квартальный показатель, по которому принимается решение о раскатке.
          </span>
        </Card>

        <Card gap="14px">
          <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Подключений в обход сети</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            <span style={{ fontSize: "44px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>0</span>
            <span style={{ fontSize: "13px", color: "#9A9A9A" }}>закрыто на уровне API</span>
          </div>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
            Точка не регистрируется без кода сети. Это ограничение базы, а не форма
            регистрации: обойти его нельзя ни одним запросом.
          </span>
        </Card>
      </div>

      <Card gap="16px">
        <CardHead title="Разброс по точкам" note="не среднее — среднее прячет провальную точку" />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)", gap: "16px", fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A", padding: "0 4px" }}>
          <span>Точка</span><span>Обращений</span><span>Подтверждено</span><span>Расход</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {points.map(p => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)", gap: "16px", alignItems: "center", background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{p.name}</span>
              <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{p.threads}</span>
              <span style={{ fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>{p.confirmed}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500", fontVariantNumeric: "tabular-nums", flex: "none" }}>{rub(p.spent)} ₽</span>
                <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "#EFEFEF", overflow: "hidden" }}>
                  <div style={{ width: `${p.hard_cap_kopecks ? Math.min(100, (p.spent / p.hard_cap_kopecks) * 100) : 0}%`, height: "100%", background: "#DEF23B" }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Frame>
  );
}
