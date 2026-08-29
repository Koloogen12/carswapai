import { whoAmI } from '@/lib/session';
import { AppBar, Frame } from '@/screens/chrome';
import { inbox, budget } from '@/lib/data';
import { InboxList } from './InboxList';

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const me = await whoAmI();
  const [rows, b] = await Promise.all([inbox(), budget()]);
  return (
    <Frame>
      <AppBar pointName={me.point} user={me.user} role={me.role}
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <InboxList rows={rows} />
    </Frame>
  );
}
