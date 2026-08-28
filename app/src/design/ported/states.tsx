/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/states.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type { ReactElement } from 'react';
import { ImageSlot } from '../ImageSlot';

export function StatesBlock0(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "840px" }}>
  <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9A9A" }}>§9 хендоффа · 24 состояния</span>
  <h1 style={{ margin: "0", fontSize: "38px", fontWeight: "500", letterSpacing: "-0.035em", lineHeight: "1.05" }}>Отказные и пороговые состояния</h1>
  <p style={{ margin: "0", fontSize: "14.5px", lineHeight: "1.55", color: "#6E6E6E", textWrap: "pretty" }}>Половина ценности продукта живёт здесь. Правило системы: у каждого отказа есть следующий ход в том же блоке — пустого «что-то пошло не так» нет ни в одном состоянии. Тон: для точки — сухой, для клиента — тёплый.</p>
</div></>
  );
}

export function StatesBlock1(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#111111", color: "#FFFFFF", borderRadius: "5px", padding: "4px 8px" }}>Пустые</span>
    <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Не пустой экран, а один конкретный следующий ход</span>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,382px)", gap: "18px" }}>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "280px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Инбокс без обращений</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", textAlign: "center", padding: "10px 0" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#F5FBCB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /><path d="M9 10.5h6" /></svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "16px", fontWeight: "500" }}>Каналы подключены, тихо</span>
          <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Первое обращение придёт сюда само. Пока можно проверить, как выглядит карточка глазами клиента.</span>
        </div>
        <div style={{ background: "#111111", borderRadius: "999px", padding: "12px 20px" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Отправить примерку себе</span></div>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "280px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Точка в первый день</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "16px", fontWeight: "500", letterSpacing: "-0.015em" }}>Три шага до первой отправки</span>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#DEF23B", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#111111", color: "#DEF23B", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>1</span>
          <span style={{ flex: "1", fontSize: "13px", fontWeight: "500" }}>Подключить WhatsApp</span>
          <span style={{ fontSize: "11px", opacity: ".6" }}>~8 мин</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>2</span>
          <span style={{ flex: "1", fontSize: "13px", color: "#6E6E6E" }}>Подтвердить прайс — 5 бестселлеров хватит</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "22px", height: "22px", borderRadius: "999px", background: "#EFEFEF", color: "#9A9A9A", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>3</span>
          <span style={{ flex: "1", fontSize: "13px", color: "#6E6E6E" }}>Добавить менеджеров</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45", marginTop: "auto" }}>Ни один шаг не требует звонка в управляющую компанию.</span>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "280px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Сводка владельца без сделок</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.035em" }}>14</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>входящих</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.035em" }}>9</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>с примеркой</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "30px", fontWeight: "500", letterSpacing: "-0.035em", color: "#C4C4C4" }}>0</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>сделок</span></div>
        </div>
        <div style={{ height: "38px", borderRadius: "999px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#D6D6D6 0 1px,transparent 1px 5px)", display: "flex", alignItems: "center", overflow: "hidden" }}><div style={{ width: "64%", height: "38px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "14px" }}><span style={{ fontSize: "12px", fontWeight: "500" }}>64% покрытие</span></div></div>
        <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Сделок пока нет — это нормально на 7-й день</span>
          <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#6E6E6E" }}>Средний срок от примерки до замера — 1–7 дней. Четыре клиента подтвердили цвет и ждут записи.</span>
          <span style={{ fontSize: "12.5px", fontWeight: "500", marginTop: "4px" }}>Посмотреть четверых →</span>
        </div>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "280px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Панель сети до пилота</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "11px" }}>
        <span style={{ fontSize: "15.5px", fontWeight: "500", letterSpacing: "-0.015em" }}>Пилот не начат</span>
        <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Отчёт соберётся сам после первой отправки на любой точке. Разброс по точкам — не среднее.</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}><span style={{ flex: "1", fontSize: "12.5px", color: "#6E6E6E" }}>Обращений точек в УК</span><span style={{ fontSize: "13px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}><span style={{ flex: "1", fontSize: "12.5px", color: "#6E6E6E" }}>Входящих с примеркой</span><span style={{ fontSize: "13px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "14px", padding: "11px 13px" }}><span style={{ flex: "1", fontSize: "12.5px", color: "#6E6E6E" }}>Точек со сделкой</span><span style={{ fontSize: "13px", fontWeight: "500", color: "#C4C4C4" }}>—</span></div>
        </div>
        <div style={{ background: "#111111", borderRadius: "999px", padding: "12px 18px", alignSelf: "flex-start", marginTop: "auto" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Пригласить первые точки</span></div>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "280px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Гараж до загрузки фото · Г-1</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "11px" }}>
        <div style={{ height: "112px", borderRadius: "20px", overflow: "hidden", background: "#F5F5F5", position: "relative" }}>
          <ImageSlot id="s-garage-demo" shape="rounded" radius="20" placeholder="демо-машина, уже перекрашена" />
        </div>
        <span style={{ fontSize: "15.5px", fontWeight: "500", letterSpacing: "-0.015em", lineHeight: "1.25" }}>Так будет выглядеть ваша машина</span>
        <span style={{ fontSize: "12.5px", lineHeight: "1.45", color: "#6E6E6E" }}>Результат показан до любого действия. Загрузите фото — покажем на вашей, с номером и двором.</span>
        <div style={{ display: "flex", gap: "7px", marginTop: "auto" }}>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Снять</span></div>
          <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>Галерея</span></div>
          <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "13px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#6E6E6E" }}>Нет фото</span></div>
        </div>
        <span style={{ fontSize: "10.5px", color: "#9A9A9A", lineHeight: "1.4" }}>Место под согласие на обработку фото с госномером — §11</span>
      </div>
    </div>
  </div>
</div></>
  );
}

export function StatesBlock2(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#111111", color: "#FFFFFF", borderRadius: "5px", padding: "4px 8px" }}>Частичные и деградированные</span>
    <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Уходит готовая часть, а не сообщение об ожидании</span>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,382px)", gap: "18px" }}>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Не уложились в три минуты · М-2</span>
      <div style={{ background: "#111111", borderRadius: "20px", padding: "12px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>Первое — уже готово</span>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", background: "#DEF23B", borderRadius: "14px", padding: "6px" }}><div style={{ height: "56px", borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,.4)" }}><ImageSlot mini={true} id="s-part-1" shape="rounded" radius="10" placeholder=" " /></div></div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "14px", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", height: "68px", backgroundImage: "repeating-linear-gradient(115deg,#3E3E3E 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "10px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.3" }}>через<br />~40 сек</span></div>
          <div style={{ flex: "1", background: "#2E2E2E", borderRadius: "14px", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", height: "68px", backgroundImage: "repeating-linear-gradient(115deg,#3E3E3E 0 1px,transparent 1px 6px)" }}><span style={{ fontSize: "10px", color: "#9A9A9A", textAlign: "center", lineHeight: "1.3" }}>через<br />~55 сек</span></div>
        </div>
        <span style={{ fontSize: "11px", color: "#DDDDDD", lineHeight: "1.4" }}>Сатин-хром готов, остальные два дособерём и допришлём в этот же диалог.</span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Клиент получает результат сразу. Дополнение приходит само, без действия менеджера.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Типовой кузов до фото · О-1</span>
      <div style={{ background: "#111111", borderRadius: "20px", padding: "12px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#FFFFFF" }}>BMW X5 2021</span>
          <span style={{ fontSize: "9.5px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "3px 8px" }}>типовой кузов</span>
        </div>
        <div style={{ height: "88px", borderRadius: "14px", overflow: "hidden", background: "#3E3E3E" }}><ImageSlot id="s-typical" shape="rounded" radius="14" placeholder="типовой X5" /></div>
        <span style={{ fontSize: "11px", color: "#DDDDDD", lineHeight: "1.4" }}>Это кузов вашей модели, не ваша машина. Пришлите фото — соберём на вашей за минуту, с номером и двором.</span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Пометка не извинение: это полноценный первый результат за 18 секунд. Фото — апгрейд.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Апгрейд после прихода фото</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "10px 12px", opacity: ".6" }}>
          <div style={{ width: "44px", height: "34px", borderRadius: "10px", overflow: "hidden", background: "#EFEFEF", flex: "none" }}><ImageSlot mini={true} id="s-upg-old" shape="rounded" radius="10" placeholder=" " /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Типовой кузов</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>14:03</span></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg></div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#DEF23B", borderRadius: "16px", padding: "10px 12px" }}>
          <div style={{ width: "44px", height: "34px", borderRadius: "10px", overflow: "hidden", background: "rgba(255,255,255,.45)", flex: "none" }}><ImageSlot mini={true} id="s-upg-new" shape="rounded" radius="10" placeholder=" " /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ваша машина · А 432 ОР 77</span><span style={{ fontSize: "10.5px", opacity: ".6" }}>14:07 · апгрейд той же примерки</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Одна примерка, две версии. Новой сущности не появляется — иначе история клиента распухает.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Подключён один канал из трёх</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
          <span style={{ flex: "1", fontSize: "13px", fontWeight: "500" }}>WhatsApp</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.4" strokeLinecap="round"><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "11.5px", fontWeight: "500" }}>работает</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#3A6B8F", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>TG</span>
          <span style={{ flex: "1", fontSize: "13px", fontWeight: "500", color: "#6E6E6E" }}>Telegram</span>
          <span style={{ fontSize: "11.5px", fontWeight: "500", color: "#111111", background: "#DEF23B", borderRadius: "999px", padding: "5px 11px" }}>Продолжить · 2 мин</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "12px 14px" }}>
          <span style={{ width: "26px", height: "26px", borderRadius: "999px", background: "#7A6A3F", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>AV</span>
          <span style={{ flex: "1", fontSize: "13px", fontWeight: "500", color: "#6E6E6E" }}>Avito</span>
          <span style={{ fontSize: "11.5px", color: "#9A9A9A" }}>не начат</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Точка уже рабочая на одном канале. Незакрытые каналы — не блокирующая ошибка, а список на потом.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Гараж после исчерпания лимита · Г-9</span>
      <div style={{ display: "flex", gap: "7px" }}>
        <div style={{ flex: "1", height: "64px", borderRadius: "14px", overflow: "hidden", boxShadow: "0 0 0 2px #DEF23B" }}><ImageSlot mini={true} id="s-lim-1" shape="rounded" radius="14" placeholder=" " /></div>
        <div style={{ flex: "1", height: "64px", borderRadius: "14px", overflow: "hidden", background: "#F5F5F5" }}><ImageSlot mini={true} id="s-lim-2" shape="rounded" radius="14" placeholder=" " /></div>
        <div style={{ flex: "1", height: "64px", borderRadius: "14px", background: "#F5F5F5", backgroundImage: "repeating-linear-gradient(115deg,#E2E2E2 0 1px,transparent 1px 6px)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "9.5px", color: "#6E6E6E", textAlign: "center", lineHeight: "1.3" }}>готовое<br />превью</span></div>
      </div>
      <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "13px 15px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: "500" }}>Крутить дальше можно</span>
        <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Новые кадры на вашей машине закончились на сегодня. Оставьте номер — откроем ещё десять и сохраним всё, что вы собрали.</span>
        <div style={{ background: "#111111", borderRadius: "999px", padding: "11px 18px", alignSelf: "flex-start", marginTop: "4px" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Оставить номер</span></div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Мягкая деградация в кэш, а не отказ. Тупика нет ни на одном шаге.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "250px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Медленная сеть и модель недоступна · Г-10</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M4 19V9M10 19v-6M16 19v-3" /><path d="M20 5v14" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4" }}>Экономный режим: показываем в одном свете, три собираются в фоне</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5l3 2" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4" }}>Генератор занят — очередь 2 из 5, держим место</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F5FBCB", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4" }}>Готовые примерки этой точки открываются мгновенно</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Старый Android и 4G: тяжёлого в критическом пути нет, деградация объявлена словами.</span>
    </div>
  </div>
</div></>
  );
}

export function StatesBlock3(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#D93F45", color: "#FFFFFF", borderRadius: "5px", padding: "4px 8px" }}>Отказные</span>
    <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Отказ за секунды, с конкретной подсказкой и фолбэком</span>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,382px)", gap: "18px" }}>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Непригодное фото</span>
      <div style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
        <div style={{ width: "96px", height: "72px", borderRadius: "14px", background: "#2E2E2E", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round"><path d="M4 20L20 4" /><rect x="4" y="6" width="16" height="12" rx="3" /></svg>
        </div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Темно — цвет соврёт</span>
          <span style={{ fontSize: "12px", lineHeight: "1.4", color: "#6E6E6E" }}>Снимите днём или под навесом, машина целиком в кадре, сбоку.</span>
        </div>
      </div>
      <div style={{ background: "#DEF23B", borderRadius: "18px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "11px" }}>
        <div style={{ width: "52px", height: "38px", borderRadius: "11px", overflow: "hidden", background: "rgba(255,255,255,.45)", flex: "none" }}><ImageSlot mini={true} id="s-bad-fallback" shape="rounded" radius="11" placeholder=" " /></div>
        <span style={{ flex: "1", fontSize: "12px", lineHeight: "1.4" }}>Пока показали на типовом X5 — уже можно смотреть цвета</span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Ночь, подземный паркинг, против солнца — один сценарий, одна подсказка, мгновенный фолбэк.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Это не автомобиль · фото из объявления</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FBEEEF", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4", color: "#8A4448" }}>На фото не видно машину</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6E6E" strokeWidth="1.7" strokeLinecap="round" style={{ flex: "none" }}><rect x="4" y="6" width="16" height="12" rx="3" /><path d="M9 12h6" /></svg>
          <span style={{ flex: "1", fontSize: "12.5px", lineHeight: "1.4", color: "#6E6E6E" }}>Похоже на кадр из объявления — водяной знак и студийный фон. Оклейка на нём не считается.</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "7px" }}>
        <div style={{ flex: "1", background: "#111111", borderRadius: "999px", padding: "12px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Снять свою</span></div>
        <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "12px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Взять типовой кузов</span></div>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Артикула нет в прайсе точки · К-2</span>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <span style={{ fontSize: "13px", fontWeight: "500" }}>«Зелёный британский» — не в прайсе этой точки</span>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#FFFFFF", borderRadius: "14px", padding: "10px 12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", overflow: "hidden", background: "#EFEFEF", flex: "none" }}><ImageSlot mini={true} id="s-nosku-alt" shape="rounded" radius="11" placeholder=" " /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ближайший: хаки-мат</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>Avery SW900-618 · в наличии</span></div>
          <span style={{ fontSize: "13px", fontWeight: "500", flex: "none", fontVariantNumeric: "tabular-nums" }}>262<span style={{ color: "#9A9A9A" }}> 100</span></span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Не молчание и не пустой поиск: ответ и аналог с ценой сразу, в одном блоке.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Артикула нет на складе</span>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#FFFFFF", borderRadius: "18px", padding: "11px 13px", boxShadow: "inset 0 0 0 1px #EDEDED", backgroundImage: "repeating-linear-gradient(115deg,#F4F4F4 0 1px,transparent 1px 6px)" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "#F7F7F7", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="1.8" strokeLinecap="round"><path d="M5 19L19 5" /><circle cx="12" cy="12" r="8.5" /></svg></div>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#9A9A9A" }}>Зелёный британский</span><span style={{ fontSize: "11px", color: "#C4C4C4" }}>нет на складе · клиенту не показан</span></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
        <span style={{ width: "34px", height: "20px", borderRadius: "999px", background: "#DEF23B", flex: "none", position: "relative" }}><span style={{ position: "absolute", right: "2px", top: "2px", width: "16px", height: "16px", borderRadius: "999px", background: "#FFFFFF" }}></span></span>
        <span style={{ flex: "1", fontSize: "12.5px" }}>Флаг наличия — одно касание в прайсе</span>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Владелец гасит SKU за секунду. Погашенный не существует ни в панели, ни в гараже.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Артикул не сошёлся с рулоном · МС-3</span>
      <div style={{ background: "#FBEEEF", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M6 6l12 12M18 6L6 18" /></svg>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#8A4448" }}>Рулон не тот</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "12px", padding: "9px 11px", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "10px", color: "#9A9A9A" }}>в записи</span><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>K75407</span></div>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "12px", padding: "9px 11px", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "10px", color: "#9A9A9A" }}>скан рулона</span><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#D93F45", fontVariantNumeric: "tabular-nums" }}>K75427</span></div>
        </div>
        <span style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#8A4448" }}>Закрытие наряда заблокировано до сверки. Номер партии уже записан в карточку клиента.</span>
      </div>
      <div style={{ background: "#111111", borderRadius: "999px", padding: "14px 0", textAlign: "center" }}><span style={{ fontSize: "13px", fontWeight: "500", color: "#FFFFFF" }}>Сообщить менеджеру · 1 действие</span></div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Не доставлено · ограничение канала</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ alignSelf: "flex-end", maxWidth: "88%", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
          <div style={{ background: "#F7F7F7", borderRadius: "16px 16px 6px 16px", padding: "11px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12.5px", color: "#6E6E6E" }}>Карточка с тремя плёнками</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D93F45" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
          </div>
          <span style={{ fontSize: "10.5px", color: "#D93F45" }}>не доставлено · Avito не принимает изображения</span>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "16px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ушло вместо картинки</span>
          <span style={{ fontSize: "11.5px", lineHeight: "1.4" }}>Текст с тремя артикулами и ценами + ссылка на страницу с девятью кадрами. Менеджер видит, что именно ушло.</span>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Плюс состояния «канал отвалился» и «окно ответа истекло» — с кнопкой повторной привязки, без загадок.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Канал требует повторной привязки</span>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <span style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#25455B", color: "#FFFFFF", fontSize: "9px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>WA</span>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "13px", fontWeight: "500" }}>WhatsApp отвалился 12 минут назад</span><span style={{ fontSize: "11px", color: "#6E6E6E" }}>входящие копятся, ничего не потеряно</span></div>
        </div>
        <div style={{ height: "5px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}><div style={{ width: "100%", height: "5px", backgroundImage: "repeating-linear-gradient(115deg,#C4C4C4 0 1px,transparent 1px 5px)" }}></div></div>
        <div style={{ background: "#111111", borderRadius: "999px", padding: "12px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Привязать заново · 40 секунд</span></div>
        <span style={{ fontSize: "11px", color: "#9A9A9A", lineHeight: "1.4" }}>Обычно это истёкшая авторизация у провайдера. Звонить в управляющую компанию не нужно.</span>
      </div>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Подписка приостановлена</span>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <span style={{ fontSize: "13.5px", fontWeight: "500" }}>Режим только чтения</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "12.5px" }}>Подтверждённые выборы клиентов — доступны всегда</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" style={{ flex: "none" }}><path d="M5 13l4.5 4.5L19 7" /></svg><span style={{ fontSize: "12.5px" }}>Записи у поста и наряды открываются</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" style={{ flex: "none" }}><path d="M6 6l12 12M18 6L6 18" /></svg><span style={{ fontSize: "12.5px", color: "#9A9A9A" }}>Новые примерки не собираются</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Данные клиента никогда не становятся заложником биллинга — это условие доверия точки.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "236px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Фото уже оклеенной машины · §4.14</span>
      <div style={{ background: "#F5FBCB", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" style={{ flex: "none" }}><path d="M12 8v5M12 16.4v.5" /><circle cx="12" cy="12" r="8.5" /></svg>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>Машина уже в плёнке</span>
        </div>
        <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Показываем новый цвет поверх, но в расчёт добавили снятие старого покрытия — иначе цена на замере вырастет и это будет неприятно.</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF", borderRadius: "12px", padding: "9px 12px" }}><span style={{ fontSize: "12px", color: "#6E6E6E" }}>Снятие старой плёнки</span><span style={{ fontSize: "12.5px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>+ 34 000 ₽</span></div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Единственное место, где продукт сам поднимает цену. Это дешевле спора на выдаче.</span>
    </div>
  </div>
</div></>
  );
}

export function StatesBlock4(): ReactElement {
  return (
    <><div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontSize: "11px", fontWeight: "600", background: "#111111", color: "#FFFFFF", borderRadius: "5px", padding: "4px 8px" }}>Конфликтные и пороговые</span>
    <span style={{ fontSize: "13px", color: "#6E6E6E" }}>Два человека на одном объекте и подходы к границам</span>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,382px)", gap: "18px" }}>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Два менеджера в одном диалоге</span>
      <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", flex: "none" }}>ИК</div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Ирина взяла диалог</span><span style={{ fontSize: "11px", color: "#6E6E6E" }}>14:02 · собирает примерку</span></div>
        </div>
        <div style={{ height: "1px", background: "#EDEDED" }}></div>
        <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Вы можете читать. Чтобы ответить, забери́те диалог — Ирина увидит это сразу.</span>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", background: "#111111", borderRadius: "999px", padding: "11px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Забрать</span></div>
          <div style={{ flex: "1", background: "#FFFFFF", borderRadius: "999px", padding: "11px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Только читать</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Дубли генераций в такой ситуации не тарифицируются — точка не платит за конфликт смены.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Клиент и менеджер меняют конфигурацию разом</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#DEF23B", borderRadius: "16px", padding: "11px 13px" }}>
          <div style={{ width: "36px", height: "28px", borderRadius: "9px", overflow: "hidden", background: "rgba(255,255,255,.45)", flex: "none" }}><ImageSlot mini={true} id="s-conf-client" shape="rounded" radius="9" placeholder=" " /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Клиент выбрал мат графит</span><span style={{ fontSize: "10.5px", opacity: ".6" }}>14:06 · из гаража</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "16px", padding: "11px 13px" }}>
          <div style={{ width: "36px", height: "28px", borderRadius: "9px", overflow: "hidden", background: "#EFEFEF", flex: "none" }}><ImageSlot mini={true} id="s-conf-mgr" shape="rounded" radius="9" placeholder=" " /></div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#6E6E6E" }}>Вы добирали нардо</span><span style={{ fontSize: "10.5px", color: "#9A9A9A" }}>14:06 · черновик не отправлен</span></div>
        </div>
      </div>
      <span style={{ fontSize: "12px", lineHeight: "1.45", color: "#2E2E2E" }}>Выбор клиента всегда старше черновика менеджера. Ваш вариант сохранён и уйдёт как дополнение.</span>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Правило одно и не настраивается: спор на выдаче гасит только то, что клиент поставил сам.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Счётчик генераций у лимита</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ background: "#F7F7F7", borderRadius: "18px", padding: "13px 15px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ fontSize: "12px", color: "#6E6E6E" }}>Порог 80%</span><span style={{ fontSize: "13px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>1 640 / 2 000</span></div>
          <div style={{ height: "8px", borderRadius: "999px", background: "#E2E2E2", overflow: "hidden" }}><div style={{ width: "82%", height: "8px", background: "#EAF77E" }}></div></div>
          <span style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#2E2E2E" }}>По текущему темпу хватит до 30 августа. Аномалия: гараж по ссылке из Telegram-канала — 310 примерок за сутки.</span>
        </div>
        <div style={{ display: "flex", gap: "7px" }}>
          <div style={{ flex: "1", background: "#111111", borderRadius: "999px", padding: "11px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Поднять лимит</span></div>
          <div style={{ flex: "1", background: "#F5F5F5", borderRadius: "999px", padding: "11px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Смотреть расход</span></div>
        </div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Тон меняется на Acid 300, не на красный. Порог — не поломка.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Точка без первой отправки · 24 / 48 / 72 ч</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F7F7F7", borderRadius: "14px", padding: "10px 13px" }}><span style={{ width: "44px", fontSize: "12px", fontWeight: "500", flex: "none" }}>24 ч</span><span style={{ flex: "1", fontSize: "12px", color: "#6E6E6E" }}>Подсказка внутри кабинета</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#F5FBCB", borderRadius: "14px", padding: "10px 13px" }}><span style={{ width: "44px", fontSize: "12px", fontWeight: "500", flex: "none" }}>48 ч</span><span style={{ flex: "1", fontSize: "12px", color: "#2E2E2E" }}>Письмо владельцу с одним ходом</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: "11px", background: "#FBEEEF", borderRadius: "14px", padding: "10px 13px" }}><span style={{ width: "44px", fontSize: "12px", fontWeight: "500", color: "#8A4448", flex: "none" }}>72 ч</span><span style={{ flex: "1", fontSize: "12px", color: "#8A4448" }}>Пометка в панели сети: точка мертва тихо</span></div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Окно первых трёх дней решает судьбу точки — поэтому у него собственная шкала, а не общий алерт.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Незавершённая примерка</span>
      <div style={{ background: "#111111", borderRadius: "18px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", background: "#DEF23B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", flex: "none" }}>АГ</div>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}><span style={{ fontSize: "12.5px", fontWeight: "500", color: "#FFFFFF" }}>Черновик сохранён</span><span style={{ fontSize: "11px", color: "#9A9A9A" }}>2 артикула из 3 · 14:02</span></div>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <span style={{ flex: "1", height: "4px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ flex: "1", height: "4px", borderRadius: "999px", background: "#DEF23B" }}></span>
          <span style={{ flex: "1", height: "4px", borderRadius: "999px", background: "#4A4A4A" }}></span>
        </div>
        <div style={{ background: "#DEF23B", borderRadius: "999px", padding: "11px 0", textAlign: "center" }}><span style={{ fontSize: "12.5px", fontWeight: "500" }}>Продолжить с третьего</span></div>
      </div>
      <span style={{ fontSize: "11.5px", color: "#9A9A9A", lineHeight: "1.45" }}>Диалог поднимается в списке сам. Менеджер не помнит — помнит инбокс.</span>
    </div>

    <div style={{ background: "#FFFFFF", borderRadius: "26px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "230px" }}>
      <span style={{ fontSize: "10.5px", fontWeight: "600", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9A9A9A" }}>Правило системы</span>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "6px" }}></span><span style={{ fontSize: "13px", lineHeight: "1.5" }}>У каждого отказа в том же блоке есть следующий ход</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "6px" }}></span><span style={{ fontSize: "13px", lineHeight: "1.5" }}>Красный — только необратимое: не доставлено, рулон не сошёлся</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "6px" }}></span><span style={{ fontSize: "13px", lineHeight: "1.5" }}>Пороги и лимиты — Acid 300 и штриховка, никогда не красный</span></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}><span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#DEF23B", flex: "none", marginTop: "6px" }}></span><span style={{ fontSize: "13px", lineHeight: "1.5" }}>Клиенту — тепло и без вины; точке — сухо, цифрой и сроком</span></div>
      </div>
    </div>
  </div>
</div></>
  );
}

export const StatesBlocks = [StatesBlock0, StatesBlock1, StatesBlock2, StatesBlock3, StatesBlock4];
export const StatesCanvas = { padding: "48px 44px 70px", fontFamily: "Onest,system-ui,sans-serif", color: "#111111", width: "max-content", display: "flex", flexDirection: "column", gap: "42px" } as React.CSSProperties;
