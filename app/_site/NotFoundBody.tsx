import Link from "next/link";

/** 404 본문 — (site) 의 not-found 와 global-not-found 가 함께 쓴다 */
export function NotFoundBody() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[46rem] flex-col justify-center px-5 py-24 sm:px-8">
      <p className="font-mono text-[13px] text-mute">404</p>
      <h1 className="mt-2 text-[32px] leading-[1.3] font-bold tracking-[-0.02em]">없는 페이지예요.</h1>
      <p className="mt-4 text-[16px] leading-[1.8] text-ink-2">주소가 바뀌었거나 아직 만들지 않은 페이지입니다. 홈에서 프로젝트·경력·발표를 볼 수 있어요.</p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <Link href="/" className="inline-flex h-10 items-center rounded-lg bg-ink px-4 text-[14px] font-medium text-paper transition-colors hover:bg-ink-2">
          홈으로
        </Link>
        <Link href="/#projects" className="inline-flex h-10 items-center rounded-lg border border-line-2 px-4 text-[14px] font-medium transition-colors hover:bg-hover">
          프로젝트 보기
        </Link>
      </div>
    </main>
  );
}
