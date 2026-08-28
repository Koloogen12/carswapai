import { OpsNav, rub } from '@/screens/ops';
import { AppBar } from '@/screens/chrome';
import { billing } from '@/lib/ops';

export const dynamic = 'force-dynamic';

/**
 * Модули 05–06 захода 2 · подписка и настройки точки.
 *
 * Разметка из блока 4: сетка 1fr / 1fr, карточка 24 · 24/26, тарифный блок
 * 20 · 18/20, шкала 8px на #E2E2E2, докупка кислотой.
 *
 * Ключевое здесь — не шкала, а прогноз под ней: «по текущему темпу хватит
 * до такого-то, дальше гараж уйдёт в кэшированные превью». Владелец должен
 * узнать о лимите заранее и понять, что именно случится, а не увидеть
 * неожиданный счёт: проблема весит вдвое против положительного события.
 */
export default async function BillingPage() {
  const { sub, budget: b, byCat } = await billing();
  const pct = b.hard_limit ? Math.round((b.spent_kopecks / b.hard_limit) * 100) : 0;
  const bar = pct >= 100 ? '#D93F45' : pct >= 80 ? '#EAF77E' : '#DEF23B';

  // Прогноз по текущему темпу: сколько дней месяца прошло и хватит ли остатка.
  const now = new Date();
  const dayOfMonth = now.getDate();
  const perDay = b.spent_kopecks / Math.max(1, dayOfMonth);
  const daysLeft = perDay > 0 ? Math.floor((b.hard_limit - b.spent_kopecks) / perDay) : 99;
  const until = new Date(now); until.setDate(now.getDate() + Math.max(0, daysLeft));
  const enough = daysLeft > 31 - dayOfMonth;

  const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля',
                  'августа','сентября','октября','ноября','декабря'];
  const MONTH_OF = ['январь','февраль','март','апрель','май','июнь','июль',
                    'август','сентябрь','октябрь','ноябрь','декабрь'];
  const payments = [0, 1, 2].map(back => {
    const d = new Date(now); d.setMonth(now.getMonth() - back); d.setDate(27);
    const nx = new Date(d); nx.setMonth(d.getMonth() + 1);
    return { when: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
             month: MONTH_OF[nx.getMonth()], kopecks: sub?.price_kopecks ?? 1000000 };
  });

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName="JETCAR Мытищи" user="Артём Лебедев" role="Владелец"
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/billing" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignItems: "start" }}>
          {/* ── Подписка ─────────────────────────────────── */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
              <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em" }}>Подписка точки</span>
              <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "5px 11px" }}>
                {sub ? `активна до ${new Date(sub.period_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}` : 'не оформлена'}
              </span>
            </div>

            <div style={{ background: "#F7F7F7", borderRadius: "20px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>Тариф</span>
                  <span style={{ fontSize: "17px", fontWeight: "500" }}>Точка · лимит {rub(b.hard_limit)} ₽</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: "26px", fontWeight: "500", letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>
                  {rub(sub?.price_kopecks ?? 1000000)}<span style={{ fontSize: "14px", color: "#9A9A9A", marginLeft: "3px" }}>₽/мес</span>
                </div>
              </div>
              <div style={{ height: "1px", background: "#EDEDED" }}></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#6E6E6E" }}>Израсходовано генераций</span>
                  <span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                    {rub(b.spent_kopecks)} / {rub(b.hard_limit)} ₽</span>
                </div>
                <div style={{ height: "8px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, pct)}%`, height: "8px", background: bar }}></div>
                </div>
                <span style={{ fontSize: "11.5px", color: "#2E2E2E", lineHeight: "1.45" }}>
                  {enough
                    ? `По текущему темпу расхода хватит до конца месяца. Гараж и примерки работают в полном режиме.`
                    : `По текущему темпу хватит до ${until.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}. Дальше гараж уйдёт в кэшированные превью — клиенты не встанут в тупик, но новых кадров не будет.`}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: "1", background: "#DEF23B", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "12px", opacity: ".6" }}>+ 1 000 генераций</span>
                <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>4 000 ₽</span>
                <span style={{ fontSize: "11px", opacity: ".65" }}>разово, до конца месяца</span>
              </div>
              <div style={{ flex: "1", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Тариф «Поток»</span>
                <span style={{ fontSize: "19px", fontWeight: "500", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>16 000 ₽/мес</span>
                <span style={{ fontSize: "11px", color: "#6E6E6E" }}>5 000 генераций</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Из чего сложился расход</span>
              {byCat.length === 0 && (
                <div style={{ background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px", fontSize: "12.5px", color: "#9A9A9A" }}>
                  В этом месяце генераций не было</div>
              )}
              {byCat.map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: x.render_class === 'A' ? "#DEF23B" : "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}>
                  <span style={{ flex: "1", fontSize: "12.5px" }}>
                    класс {x.render_class} · {x.n} шт
                    {x.render_class === 'A' ? ' · считается у нас' : ' · внешняя модель'}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rub(x.cost)} ₽</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>История платежей</span>
              {payments.map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}>
                  <span style={{ flex: "1", fontSize: "12.5px" }}>{x.when} · подписка за {x.month}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>{rub(x.kopecks)} ₽</span>
                </div>
              ))}
            </div>

            {/* Режим только для чтения — не техническая деталь, а обещание:
                обрыв доступа посреди сделок означает, что на выдаче нечего
                предъявить, и точка платит за переклейку уже после нас. */}
            <div style={{ background: "#111111", borderRadius: "18px", padding: "15px 17px" }}>
              <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#DDDDDD" }}>
                Платит сеть, биллинг за точку. Если оплата не прошла — кабинет уходит в режим
                только чтения, а подтверждённые выборы клиентов остаются доступны навсегда.
              </span>
            </div>
          </div>

          {/* ── Настройки точки ──────────────────────────── */}
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-0.028em" }}>Настройки точки</span>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "20px", padding: "16px 18px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="2.2" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Логотип точки</span>
                <span style={{ fontSize: "11.5px", color: "#6E6E6E", lineHeight: "1.45" }}>
                  Логотип ложится внутрь изображения карточки, а не в подпись: подпись
                  теряется при пересылке, а картинка уходит к конкурентам без вашего имени.
                  Это сделано сознательно.
                </span>
              </div>
            </div>

            {[['Название', 'JETCAR Мытищи'], ['Адрес', 'Мытищи, Олимпийский пр-т, 29'],
              ['Ссылка гаража', 'carswap.ai/g/jetcar-mytishchi'],
              ['Часы работы', 'пн–сб · 10:00 — 21:00'],
              ['Часовой пояс', 'Europe/Moscow'],
              ['Реквизиты для счетов', 'ИП · ИНН заполнен']].map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#F7F7F7", borderRadius: "16px", padding: "13px 16px" }}>
                <span style={{ flex: "1", fontSize: "12px", color: "#9A9A9A" }}>{k}</span>
                <span style={{ fontSize: "13px", fontWeight: "500", textAlign: "right" }}>{v}</span>
              </div>
            ))}

            <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "15px 17px" }}>
              <span style={{ fontSize: "11.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                Отключить точку можно в один клик, и это обратимо: история, документы,
                талон и подтверждённые выборы никуда не денутся. Владелец не должен
                бояться, что попробовал.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
