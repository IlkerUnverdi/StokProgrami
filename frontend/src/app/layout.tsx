import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/shared/query-provider';

export const metadata: Metadata = {
  title: 'Enes Otomotiv Yönetim Paneli',
  description: 'Stok, satış, teklif ve cari yönetim sistemi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}