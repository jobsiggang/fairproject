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
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffcc00" />

        {/* iOS 홈 화면 앱 설정 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
