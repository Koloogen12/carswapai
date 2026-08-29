import { notFound } from 'next/navigation';
import { bayRecord, rollsFor, masterBoard, warrantyFor } from '@/lib/bay';
import { BayScreen } from './BayScreen';

export const dynamic = 'force-dynamic';

/**
 * Экран мастера у поста, экраны 40–46.
 *
 * МС-1: вход по ссылке из мессенджера, без пароля — руки грязные.
 * Цели нажатия 64px, крупный шрифт, высокий контраст: всё это включается
 * атрибутом data-surface="bay", который переопределяет шкалу токенов.
 *
 * Доска и талон читаются здесь, а не в клиентской части: закрытая работа
 * показывает итог смены и следующий наряд (кадр 07 макета), а талон —
 * то единственное, что мастер отдаёт клиенту в руки. Оба идут через ту же
 * сессию, что и сам наряд.
 */
export default async function BayPage({ params }: { params: { order: string } }) {
  const [rec, rolls, board, warranty] = await Promise.all([
    bayRecord(params.order),
    rollsFor(params.order),
    masterBoard(),
    warrantyFor(params.order),
  ]);
  if (!rec) notFound();
  return <BayScreen rec={rec} rolls={rolls} month={board.month}
                    next={board.upcoming[0] ?? null} warranty={warranty} />;
}
