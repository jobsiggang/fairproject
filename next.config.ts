import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // PWA에서 로컬 이미지 경로 문제 방지
  },
};

export default nextConfig;
