// src/types/next-pwa.d.ts
declare module 'next-pwa' {
  import { NextConfig } from 'next';
  function withPWA(config: NextConfig): NextConfig;
  export default withPWA;
}
