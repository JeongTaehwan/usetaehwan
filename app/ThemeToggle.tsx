"use client";

import { useEffect, useState } from "react";
import { Button } from "@/design-system";

/**
 * 라이트/다크 토글. html.dark 클래스를 켜고 끄며 localStorage에 선택을 저장한다.
 * (초기 테마 적용은 layout.tsx의 인라인 스크립트가 담당 — 여기선 현재 상태만 읽는다)
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      aria-pressed={dark}
    >
      {/* SSR/CSR 불일치를 피하려고 마운트 전에는 라벨을 비워둔다 */}
      {mounted ? (dark ? "☀ Light" : "☾ Dark") : "☾ Dark"}
    </Button>
  );
}
