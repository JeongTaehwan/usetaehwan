"use client";

import { motion } from "framer-motion";

/**
 * 스크롤 진입 시 은은한 fade + slide-up.
 * 한 번만 재생하고, 뷰포트에 약간 걸치면 시작한다.
 * reduced-motion일 땐 MotionConfig가 y 이동을 제거하고 opacity만 남긴다.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}) {
  const MotionTag = as === "section" ? motion.section : motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
