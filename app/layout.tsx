import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '大相撲 - o-sumo',
  description: '令和8年3月場所の番付一覧と星取表',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
