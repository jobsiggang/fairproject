import './globals.css';
import { ReactNode } from "react";

export const metadata = {
  title: "공정한 Works 현장 관리",
  description: "공정한 Works 현장 관리 앱",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
  },
  themeColor: "#ffcc00",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* PWA 관련 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffcc00" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
