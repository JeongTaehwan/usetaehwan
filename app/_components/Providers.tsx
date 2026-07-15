"use client";

import { MotionConfig } from "framer-motion";

/**
 * 모션 전역 설정. reducedMotion="user"면 OS의 "동작 줄이기" 설정 시
 * transform 계열 애니메이션을 자동으로 끄고 opacity만 남긴다.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
