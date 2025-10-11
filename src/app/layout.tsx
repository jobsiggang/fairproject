import "./globals.css";
import { ReactNode } from "react";
import Head from "next/head";

export const metadata = {
  title: "공정한 Works",
  description: "현장에서 빠르게 사진 기록하고, 관리자도 쉽게 확인",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
<Head>
  {/* iOS 홈 화면용 아이콘 */}
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192.png" />
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-192.png" />
  <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-192.png" />

  {/* 일반 브라우저용 */}
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192.png" />

  {/* PWA manifest */}
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#ffcc00" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</Head>
      <body>{children}</body>
    </html>
  );
}
