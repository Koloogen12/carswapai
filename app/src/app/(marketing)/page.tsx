/* Маршрут «/» — лендинг CarSwap AI.
 *
 * Порядок блоков — из design/README-landing.md. Статика лежит в sections.tsx
 * и рендерится на сервере; в клиент уезжают только четыре блока, у которых
 * есть состояние: герой (видео), вкладки источника заявки, примерочная,
 * чек-лист.
 *
 * Чего на странице сознательно нет: цифр эффекта, отзывов и логотипов
 * клиентов. Это решение хендоффа, а не пропуск, — заглушек здесь быть
 * не должно.
 */
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import './landing.css';
import { Checklist } from './Checklist';
import { Hero } from './Hero';
import { SourceTabs } from './SourceTabs';
import { TryOn } from './TryOn';
import {
  AlsoValuable,
  Audience,
  ChatVsCarswap,
  Claim,
  Faq,
  Features,
  FinalCta,
  Footer,
  How,
  Nav,
  Network,
  Pricing,
  WhatChanges,
  WhatIf,
  WhyUs,
} from './sections';

export const metadata: Metadata = {
  title: 'CarSwap AI — примерочная плёнок для детейлинг-студий',
  description:
    'Заявки из WhatsApp, Telegram, MAX и Авито в одном списке. Примерка на машине клиента прямо в диалоге: его фото, артикул из вашего прайса, ваша цена.',
};

export default function LandingPage(): ReactElement {
  return (
    <div className="cs-landing">
      <Nav />
      <Hero />
      <Claim />
      <Audience />
      <AlsoValuable />
      <SourceTabs />
      <TryOn />
      <ChatVsCarswap />
      <Checklist />
      <Features />
      <How />
      <WhatChanges />
      <WhatIf />
      <WhyUs />
      <Network />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
