/**
 * Реестр провайдеров: сегмент пути вебхука → разборщик.
 *
 * Один список на продукт. Добавление шлюза — строка здесь и новый файл рядом,
 * а не ещё один обработчик со своей идемпотентностью.
 */

import type { ProviderPlug } from './ingest';
import { wazzupPlug } from './wazzup';
import { avitoPlug } from './avito';

const PLUGS: readonly ProviderPlug[] = [wazzupPlug, avitoPlug];

export const PROVIDER_SLUGS: readonly string[] = PLUGS.map(p => p.slug);

export function plugFor(slug: string): ProviderPlug | null {
  return PLUGS.find(p => p.slug === slug) ?? null;
}
