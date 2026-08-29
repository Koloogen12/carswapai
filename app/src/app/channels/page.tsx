import { whoAmI } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { budget } from '@/lib/data';
import { channelsScreen } from '@/lib/channels';
import { ChannelsView } from './ChannelsView';

export const dynamic = 'force-dynamic';

/**
 * Экран 01 · подключение каналов точки.
 *
 * Четвёртый шаг запуска: точка платит → получает доступ → заводит
 * сотрудников → ПОДКЛЮЧАЕТ КАНАЛЫ → начинает работу. Без него обращения
 * просто не приходят, и запускать у клиента нечего.
 *
 * Страница закрыта входом стражем из src/middleware.ts, а личность берётся
 * из подписанной сессии: whoAmI() бросит без неё. Читать экран может любой
 * сотрудник точки — менеджеру важно видеть возможности канала ДО отправки.
 * Менять каналы может только владелец, и это проверяется в каждом действии
 * (requireOwner) и в базе (ограничительные политики из миграции 018).
 */
export default async function ChannelsPage() {
  const me = await whoAmI();
  const [data, b] = await Promise.all([channelsScreen(), budget()]);

  return (
    <Frame pad="26px 28px 30px" gap="20px">
      <AppBar pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <ChannelsView data={data} pointName={me.point} />
    </Frame>
  );
}
