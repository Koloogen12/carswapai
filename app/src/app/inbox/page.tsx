import { Shell, NavLink } from '@/components/shell';
import { inbox, budget } from '@/lib/data';
import { InboxList } from './inbox-list';

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const [rows, b] = await Promise.all([inbox(), budget()]);
  return (
    <Shell user="Ирина Ковалёва" role="Менеджер · JETCAR Мытищи"
      nav={<>
        <NavLink href="/inbox" active>Инбокс</NavLink>
        <NavLink href="/crm">Клиенты</NavLink>
        <NavLink href="/price">Прайс</NavLink>
        <NavLink href="/owner">Точка</NavLink>
      </>}>
      <InboxList rows={rows} budget={b} />
    </Shell>
  );
}
