import { whoAmI } from '@/lib/session';
import { AppBar } from '@/screens/chrome';
import { OpsNav, rub } from '@/screens/ops';
import { followUps, schedule } from '@/lib/ops';
import { budget } from '@/lib/data';

export const dynamic = 'force-dynamic';
const THUMB = ['/renders/render-03.png','/renders/render-04.png','/renders/render-02.png','/renders/render-11.png'];

/**
 * Модуль 01 захода 2 · дожим окна 1–7 дней.
 *
 * Разметка из блока 1 — байт в байт: сетка 1.6fr / 1fr, строка 18 · 14/16
 * с миниатюрой 50×38, задачи со скруглённым чекбоксом 19px, справа чёрная
 * карточка «почему это дыра P0» и шаблон напоминания.
 *
 * Действие в строке зависит от возраста молчания, а не одно на всех:
 * шестой день — звонить, второй — предложить слот, сегодняшний — не трогать.
 * Одинаковая кнопка на всех строках означала бы, что список не думает
 * за менеджера, а он для того и сделан.
 */
export default async function FollowUpsPage() {
  const me = await whoAmI();
  const [rows, b, sch] = await Promise.all([followUps(), budget(), schedule()]);
  const hot = rows.filter(r => r.silent_days >= 5);
  const lead = rows[0];
  const slot = sch.appts.find(a => a.kind === 'measure');

  return (
    <div style={{ background: "#2A2A2A", minHeight: "100vh", padding: "22px" }}>
      <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", background: "#EFEFEF", borderRadius: "28px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <AppBar pointName={me.point} user={me.user} role={me.role}
          spent={b.spent_kopecks} cap={b.hard_limit} />
        <OpsNav active="/ops/followups" />

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "14px", alignItems: "start" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "24px", fontWeight: "500", letterSpacing: "-0.03em" }}>Подтвердили цвет, но не записаны</span>
                <span style={{ fontSize: "11.5px", fontWeight: "500", background: "#DEF23B", borderRadius: "999px", padding: "4px 10px" }}>{rows.length}</span>
              </div>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>поднимается наверх само на 2-й, 4-й и 6-й день</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {rows.length === 0 && (
                <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px 16px", fontSize: "13px", color: "#6E6E6E" }}>
                  Никто не подвис: все подтверждённые выборы дошли до записи на замер.
                </div>
              )}
              {rows.map((r, i) => {
                const cold = r.silent_days >= 5, warm = r.silent_days >= 2;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "14px", background: cold ? "#FBEEEF" : warm ? "#F5FBCB" : "#F7F7F7", borderRadius: "18px", padding: "14px 16px" }}>
                    <div style={{ width: "50px", height: "38px", borderRadius: "11px", overflow: "hidden", flex: "none", background: "#EFEFEF" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={THUMB[i % THUMB.length]} alt=""
                        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "500", color: cold ? "#8A4448" : "#111111" }}>
                        {r.name ?? 'Клиент'} · {r.vehicle || 'авто не указано'}</span>
                      <span style={{ fontSize: "11.5px", color: cold ? "#8A4448" : "#6E6E6E" }}>
                        подтвердил {new Date(r.confirmed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        {r.silent_days >= 1 ? ` · ${r.silent_days}-й день${cold ? ' молчания' : ''}` : ' сегодня · ждём до завтра, не трогаем'}
                        {' · '}{rub(r.price_kopecks)} ₽</span>
                    </div>
                    {r.silent_days >= 1 ? (
                      <div style={{ display: "flex", gap: "6px", flex: "none" }}>
                        {/* Телефонии у нас нет и не будет: звонит менеджер со
                            своего аппарата. tel: открывает набор на телефоне и
                            софтфон на десктопе — это настоящее действие, а не
                            нарисованная кнопка. Без номера ссылки нет: пустой
                            tel: молча ничего не делает, и менеджер решит, что
                            сломано приложение, а не что телефон не оставили. */}
                        {cold && (r.phone ? (
                          <a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}
                            style={{ background: "#111111", borderRadius: "999px", padding: "9px 14px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "500", color: "#FFFFFF" }}>Позвонить</span>
                          </a>
                        ) : (
                          <span style={{ background: "#F0F0F0", borderRadius: "999px", padding: "9px 14px", fontSize: "12px", fontWeight: "500", color: "#9A9A9A" }}
                            title="Клиент писал из мессенджера и телефон не оставлял">
                            Телефона нет
                          </span>
                        ))}
                        <a href={`/c/${r.configuration_id}`} style={{ background: cold ? "#FFFFFF" : "#111111", borderRadius: "999px", padding: "9px 14px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "500", color: cold ? "#111111" : "#FFFFFF" }}>
                            {cold ? 'Напомнить в чат' : 'Предложить слот'}</span>
                        </a>
                      </div>
                    ) : (
                      <span style={{ fontSize: "11.5px", color: "#9A9A9A", flex: "none" }}>без действия</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ height: "1px", background: "#F0F0F0" }}></div>

            {/* Задачи создаются событием, а не рукой: список, который надо
                заполнять, не заполняется — это третий софт владельца. */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.018em" }}>Задачи на смену</span>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>создаются событием, не рукой</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {hot.map(r => (
                <div key={`t${r.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <div style={{ width: "19px", height: "19px", borderRadius: "6px", boxShadow: "inset 0 0 0 1.5px #C4C4C4", flex: "none" }}></div>
                  <span style={{ flex: "1", fontSize: "13px" }}>
                    Перезвонить {(r.name ?? 'клиенту').split(' ')[0]} — {r.silent_days}-й день без записи</span>
                  <span style={{ fontSize: "11px", color: "#D93F45" }}>просрочено</span>
                </div>
              ))}
              {slot && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
                  <div style={{ width: "19px", height: "19px", borderRadius: "6px", boxShadow: "inset 0 0 0 1.5px #C4C4C4", flex: "none" }}></div>
                  <span style={{ flex: "1", fontSize: "13px" }}>
                    Напомнить {(slot.client_name ?? 'клиенту').split(' ')[0]} про замер{' '}
                    {new Date(slot.starts_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ fontSize: "11px", color: "#6E6E6E" }}>сегодня 18:00</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px", opacity: ".6" }}>
                <div style={{ width: "19px", height: "19px", borderRadius: "6px", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DEF23B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4.5 4.5L19 7" /></svg>
                </div>
                <span style={{ flex: "1", fontSize: "13px", color: "#6E6E6E", textDecoration: "line-through" }}>
                  Ответить по обращению из Avito</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <OpsNav active="/ops/followups" />
            <div style={{ background: "#111111", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#6E6E6E" }}>Почему это дыра P0</span>
              <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.55", color: "#DDDDDD", textWrap: "pretty" }}>
                Момент «ага» уже случился, усилие уже потрачено, клиент уже сказал «беру».
                Дальше он молчит от одного до семи дней — и это самая дорогая потеря
                продукта, потому что она происходит после того, как всё оплачено работой
                менеджера.
              </p>
              <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.55", color: "#DDDDDD", textWrap: "pretty" }}>
                До этого экрана в продукте не было ни одного места, где такой клиент виден.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "13px" }}>
              <span style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "-0.018em" }}>Шаблон напоминания</span>
              <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "13px 15px" }}>
                <span style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#2E2E2E" }}>
                  {lead
                    ? `${(lead.name ?? 'Здравствуйте').split(' ')[0]}, добрый день! Держу за вами ${lead.brand} ${lead.sku}. Есть свободное окно на замер — забронировать?`
                    : 'Добрый день! Держу за вами выбранный артикул и рулон нужной партии. Есть свободное окно на замер — забронировать?'}
                </span>
              </div>
              <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>
                Подставляет артикул, партию и свободный слот сам. Менеджер правит одно
                слово и отправляет.
              </span>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "#9A9A9A" }}>Молчат больше пяти дней</span>
              <span style={{ fontSize: "38px", fontWeight: "500", letterSpacing: "-0.04em", lineHeight: "1", fontVariantNumeric: "tabular-nums" }}>{hot.length}</span>
              <span style={{ fontSize: "12px", color: "#6E6E6E" }}>
                на сумму {rub(hot.reduce((s, r) => s + r.price_kopecks, 0))} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
