import './globals.css'
import { ReactNode } from 'react'
import Head from 'next/head'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <Head>
        {/* 기본 메타 */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffcc00" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* 아이콘 */}
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="icon" href="/icons/icon-512.png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* iOS 용 런치스크린 색상 */}
        <meta name="apple-mobile-web-app-title" content="공정한 Works" />
      </Head>
      <body>{children}</body>
    </html>
  )
}
