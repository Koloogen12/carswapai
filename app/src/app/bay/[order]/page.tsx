import { notFound } from 'next/navigation';
import { bayRecord, rollsFor } from '@/lib/bay';
import { BayScreen } from './BayScreen';

export const dynamic = 'force-dynamic';

/**
 * Экран мастера у поста, экраны 40–46.
 *
 * МС-1: вход по ссылке из мессенджера, без пароля — руки грязные.
 * Цели нажатия 64px, крупный шрифт, высокий контраст: всё это включается
 * атрибутом data-surface="bay", который переопределяет шкалу токенов.
 */
export default async function BayPage({ params }: { params: { order: string } }) {
  const [rec, rolls] = await Promise.all([bayRecord(params.order), rollsFor(params.order)]);
  if (!rec) notFound();
  return <BayScreen rec={rec} rolls={rolls} />;
}
