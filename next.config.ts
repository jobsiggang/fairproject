import { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
  images: {
    unoptimized: true, // PWA에서 로컬 이미지 문제 방지
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development", // 개발 중에는 PWA 비활성화
  },
});

export default nextConfig;
