import { notFound } from 'next/navigation';
import { AppBar, Frame } from '@/screens/chrome';
import { DialogPane } from '@/screens/DialogPane';
import { TryonPanel } from '@/screens/TryonPanel';
import { InboxList } from '../InboxList';
import { thread, priceList, budget, inbox, cardsOf, metersFor } from '@/lib/data';
import { tryonPhoto, tryonExisting } from '@/lib/tryon';

export const dynamic = 'force-dynamic';

/**
 * Экран «инбокс + диалог + панель» — три зоны в одном окне.
 * Список слева остаётся на месте: менеджер не уходит из инбокса, чтобы
 * ответить, и не возвращается в него, чтобы взять следующее обращение.
 */
export default async function ThreadPage({ params }: { params: { id: string } }) {
  const t = await thread(params.id);
  if (!t) notFound();
  const [rows, prices, b, cards, meters, photo, tried] = await Promise.all([
    inbox(), priceList(undefined, 'film'), budget(),
    cardsOf(params.id), metersFor(t.vehicle_model_id), tryonPhoto(params.id),
    tryonExisting(params.id),
  ]);
  const v = t.vehicle ?? {};
  const channel = t.messages.at(-1)?.channel ?? 'web';
  return (
    <Frame>
      <AppBar pointName="JETCAR Мытищи" user="Ирина Ковалёва" role="Менеджер"
        spent={b.spent_kopecks} cap={b.hard_limit} />
      <div style={{ flex: "1", display: "flex", gap: "12px", minHeight: "0" }}>
        <InboxList rows={rows} activeId={params.id} compact />
        <DialogPane name={t.client_name} phone={t.phone} channel={channel}
          note={[v.make ? `${v.make} ${v.model ?? ''} ${v.year ?? ''} · ${v.plate ?? ''}`.replace(/\s+/g, ' ').trim() : 'авто не распознано',
                 (v as { note?: string }).note].filter(Boolean).join(' · ')}
          messages={t.messages} cards={cards} pointName="JETCAR Мытищи" />
        <TryonPanel threadId={params.id} prices={prices} meters={meters}
          blocked={b.hard_reached} photo={photo} existing={tried}
          vehicle={v.make ? `${v.make} ${v.model ?? ''} ${v.year ?? ''}`.replace(/\s+/g, ' ').trim() : 'Кузов не распознан'} />
      </div>
    </Frame>
  );
}
