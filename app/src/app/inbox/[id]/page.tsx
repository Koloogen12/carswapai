import { notFound } from 'next/navigation';
import { Shell, NavLink } from '@/components/shell';
import { thread, priceList, budget } from '@/lib/data';
import { Dialog } from './dialog';

export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const [t, prices, b] = await Promise.all([thread(params.id), priceList(), budget()]);
  if (!t) notFound();
  return (
    <Shell user="Ирина Ковалёва" role="Менеджер · JETCAR Мытищи"
      nav={<>
        <NavLink href="/inbox" active>Инбокс</NavLink>
        <NavLink href="/crm">Клиенты</NavLink>
        <NavLink href="/price">Прайс</NavLink>
        <NavLink href="/owner">Точка</NavLink>
      </>}>
      <Dialog thread={t} prices={prices} budget={b} />
    </Shell>
  );
}
