import { notFound } from 'next/navigation';
import { journey } from '@/lib/journey';
import { ClientJourney } from './ClientJourney';

export const dynamic = 'force-dynamic';

/**
 * Заход 1 · вторая половина клиентского пути, экраны A2–A11.
 *
 * Одна ссылка на всю сделку. Шаг определяется реальным состоянием заказа,
 * а не навигацией: клиент открывает ту же ссылку из мессенджера и видит,
 * где его машина сейчас. Это и есть «конфигурация напоминает о себе»
 * в окне 1–7 дней до замера — самой дорогой потере после момента «ага».
 */
export default async function ClientPage({ params }: { params: { config: string } }) {
  const j = await journey(params.config);
  if (!j) notFound();
  return <ClientJourney j={j} />;
}
