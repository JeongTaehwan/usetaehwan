"use client";

import { motion } from "framer-motion";

/**
 * 스크롤 진입 시 fade + 아주 짧은 slide-up. 한 번만 재생.
 * reduced-motion이면 MotionConfig가 y 이동을 제거하고 opacity만 남긴다.
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
  as?: "div" | "section" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}

/** 뷰포트에 들어오면 왼쪽에서 오른쪽으로 그어지는 선 */
export function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`rule ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    />
  );
}
