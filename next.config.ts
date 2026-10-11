import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 루트 레이아웃이 둘 — 어느 그룹에도 맞지 않는 주소의 404 (app/global-not-found.tsx)
    globalNotFound: true,
  },
};

export default nextConfig;
