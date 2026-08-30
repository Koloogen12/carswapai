import './globals.css';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/domain';

/**
 * Иконки и карточка ссылки.
 *
 * metadataBase обязателен: без него Next собирает относительные пути к
 * картинке карточки, а мессенджеры и соцсети относительных путей не
 * разворачивают — ссылка уходит без превью и выглядит как спам. Берётся из
 * окружения, потому что на стенде и в бою домены разные, а картинка
 * запекается в разметку страницы, а не подставляется на лету.
 */
const base = process.env.PUBLIC_BASE_URL ?? 'https://yoomp.io';

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: BRAND, template: `%s · ${BRAND}` },
  description: 'Примерочная плёнок для детейлинг-студий',
  applicationName: BRAND,
  icons: {
    icon: [
      { url: '/brand/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: BRAND,
    title: BRAND,
    description: 'Клиент видит свою машину в плёнке из прайса точки',
    images: [{ url: '/brand/og.png', width: 1200, height: 630, alt: BRAND }],
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND,
    description: 'Клиент видит свою машину в плёнке из прайса точки',
    images: ['/brand/og.png'],
  },
};

/**
 * Цвет адресной строки на телефоне. Чёрный продукта, а не системный белый:
 * иначе шапка браузера спорит с тёмной подложкой всех экранов.
 */
export const viewport = { themeColor: '#111111' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
