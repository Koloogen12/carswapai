import './globals.css';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/domain';

export const metadata: Metadata = {
  title: BRAND,
  description: 'Примерочная плёнок для детейлинг-студий',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
