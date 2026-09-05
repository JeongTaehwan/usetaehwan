import Link from "next/link";
import { Button, Container } from "@usetaehwan/ui";
import { ThemeToggle } from "../ThemeToggle";

/** 상세 페이지 공용 경량 헤더 — 워드마크 + 홈 섹션으로 돌아가는 버튼 + 테마 토글 */
export function SubpageHeader({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg text-fg">
            <span className="font-serif">useTaehwan</span>
            <span className="font-mono text-brand">()</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={backHref}>
              <Button variant="ghost" size="sm">
                ← {backLabel}
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
