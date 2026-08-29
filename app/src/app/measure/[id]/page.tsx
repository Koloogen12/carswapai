import { notFound } from 'next/navigation';
import { measureView } from '@/lib/measure';
import { MeasureFlow } from './MeasureFlow';

export const dynamic = 'force-dynamic';

export default async function MeasurePage({ params }: { params: { id: string } }) {
  const m = await measureView(params.id);
  if (!m) notFound();
  return <MeasureFlow m={m} />;
}
