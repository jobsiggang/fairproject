import './globals.css';
import { ReactNode } from "react";

export const metadata = {
  title: "공정한 Works 현장 관리",
  description: "공정한 Works 현장 관리 앱",
};

export const themeColor = "#ffcc00";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* PWA 관련 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={themeColor} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
