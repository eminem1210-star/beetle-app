import type { Metadata } from 'next';
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'カブトムシ・クワガタ管理',
  description: '個体管理アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-stone-950 text-stone-100">
        {children}
      </body>
    </html>
  );
}