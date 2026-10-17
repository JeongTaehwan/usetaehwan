"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../_ui/cn";
import { type AskAnswer, type Citation, readSSE } from "./sse";

const MAX_CHARS = 300;
const EXAMPLES = ["결제 연동 경험이 있나요?", "Gak에서 LLM 응답을 어떻게 검증했나요?", "Neon Postgres를 쓴 프로젝트는?"];
const STAGES = [
  { id: "classify", label: "질문 분류" },
  { id: "retrieve", label: "자료 검색" },
  { id: "grade", label: "관련성 확인" },
  { id: "generate", label: "답변 작성" },
  { id: "verify", label: "인용 검증" },
] as const;
const ERRORS: Record<string, string> = {
  per_minute: "잠깐만요. 1분에 5번까지 물어볼 수 있어요.",
  per_ip_day: "오늘 질문할 수 있는 횟수를 다 썼어요. 내일 다시 와 주세요.",
  daily_cap: "오늘 챗봇이 받을 수 있는 질문을 모두 받았어요. 내일 다시 열려요.",
  too_long: `${MAX_CHARS}자 이내로 물어봐 주세요.`,
};
/** 입력칸 아래 안내 — Gemini 무료 등급으로 운영하므로 전송 사실을 밝힌다 (decisions D-39). 페이지 언어(html lang)를 따른다 */
const PRIVACY_NOTICE = {
  ko: "질문은 답변 생성을 위해 외부 AI 서비스(Google, Anthropic)로 전송되며, 서비스 개선에 활용될 수 있습니다. 개인정보는 입력하지 마세요.",
  en: "Questions are sent to external AI services (Google, Anthropic) to generate answers and may be used to improve their services. Please don't enter personal information.",
} as const;
const NOTE: Partial<Record<AskAnswer["outcome"], string>> = {
  answered: "인용 검증 통과",
  fallback: "검증된 문장만 남김",
};

type Turn = { id: number; question: string; stage?: string; result?: AskAnswer; error?: string };

/** 도착한 섹션을 잠깐 강조한다. Next의 해시 이동은 pushState라 :target이 갱신되지 않아서 JS로 한다. */
function flash(hash: string) {
  const el = hash && document.getElementById(decodeURIComponent(hash.replace(/^#/, "")));
  if (!el) return;
  el.removeAttribute("data-flash");
  void el.offsetWidth; // 같은 곳을 다시 눌러도 애니메이션이 다시 돈다
  el.setAttribute("data-flash", "");
  window.setTimeout(() => el.removeAttribute("data-flash"), 1800);
}

/** 답변 문자열의 [n]을 원문 섹션 링크로 바꾼다 */
function AnswerText({ text, citations, onCite }: { text: string; citations: Citation[]; onCite: (e: React.MouseEvent, c: Citation) => void }) {
  const byN = new Map(citations.map((c) => [c.n, c]));
  const parts = text.split(/(\[\d+(?:\s*,\s*\d+)*\])/g);
  return (
    <p className="text-[14.5px] leading-[1.8] whitespace-pre-line text-ink">
      {parts.map((part, i) => {
        const m = part.match(/^\[(.+)\]$/);
        if (!m) return <Fragment key={i}>{part}</Fragment>;
        return (
          <Fragment key={i}>
            {m[1].split(",").map((s) => {
              const c = byN.get(Number(s.trim()));
              if (!c) return null;
              return (
                <sup key={s} className="mx-px">
                  <Link
                    href={c.href}
                    onClick={(e) => onCite(e, c)}
                    title={`${c.title} › ${c.section}`}
                    className="rounded px-0.5 font-mono text-[11px] font-medium text-accent hover:bg-accent-soft"
                  >
                    [{c.n}]
                  </Link>
                </sup>
              );
            })}
          </Fragment>
        );
      })}
    </p>
  );
}

/** 정태환에게 물어보기 — 오른쪽 아래 런처 + 패널. (site) 레이아웃에 붙고, /resume(인쇄)에서는 숨긴다. */
export function AskPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  // 패널은 열린 뒤(클라이언트)에만 그려지므로 서버 렌더와 어긋나지 않는다
  const lang = open && typeof document !== "undefined" && document.documentElement.lang.startsWith("en") ? "en" : "ko";
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const seq = useRef(0);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  // 다른 페이지로 이동해 오면 해시 섹션을 강조한다
  useEffect(() => {
    flash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    fetch("/api/ask", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { remaining?: number } | null) => setRemaining(s?.remaining ?? null))
      .catch(() => setRemaining(null));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      launcherRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  const update = (id: number, patch: Partial<Turn>) => setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy || q.length > MAX_CHARS) return;
    const id = ++seq.current;
    setTurns((ts) => [...ts, { id, question: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }) });
      if (!r.ok || !r.body) {
        const { code } = await r.json().catch(() => ({ code: "unavailable" }));
        update(id, { error: ERRORS[code] ?? "지금은 답할 수 없어요. 잠시 후 다시 시도해 주세요." });
        if (code === "daily_cap") setRemaining(0);
        return;
      }
      for await (const ev of readSSE(r.body)) {
        if (ev.event === "stage") update(id, { stage: ev.data.stage });
        else if (ev.event === "answer") update(id, { result: ev.data, stage: undefined });
        else update(id, { error: "답을 만드는 중에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.", stage: undefined });
      }
      setRemaining((n) => (n === null ? n : Math.max(0, n - 1)));
    } catch {
      update(id, { error: "연결이 끊겼어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusy(false);
    }
  }

  function onCite(e: React.MouseEvent, c: Citation) {
    const url = new URL(c.href, window.location.href);
    if (url.pathname === window.location.pathname) {
      // 같은 페이지 — URL을 바꾸면 App Router의 내비게이션 처리와 엮여 스크롤이 되돌아가서, 스크롤만 직접 한다
      e.preventDefault();
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ block: "start" });
      flash(url.hash);
    }
    // 패널(420px)이 본문과 겹치는 폭에서는 닫아서 원문을 보여준다. 대화는 남아 있어 다시 열면 이어진다.
    // 1440px에서도 본문 오른쪽 끝(약 1080px)이 패널과 겹쳐서, 기준을 2xl(1536px)로 둔다.
    if (window.matchMedia("(max-width: 1535px)").matches) setOpen(false);
  }

  if (pathname === "/resume") return null;
  const closed = remaining === 0;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="ask-panel"
        className={cn(
          "fixed right-4 bottom-4 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-line-2 bg-card px-4 text-[14px] font-medium text-ink shadow-[0_4px_16px_rgb(0_0_0/0.08)] transition-colors hover:bg-hover sm:right-6 sm:bottom-6",
          open && "hidden",
        )}
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
        정태환에게 물어보기
      </button>

      {open && (
        <section
          id="ask-panel"
          role="dialog"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col bg-paper md:inset-auto md:top-0 md:right-0 md:bottom-0 md:w-[420px] md:border-l md:border-line md:shadow-[-8px_0_24px_rgb(0_0_0/0.06)]"
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id={titleId} className="text-[16px] font-bold">
                정태환에게 물어보기
              </h2>
              <p className="mt-1 text-[12.5px] leading-[1.6] text-mute">
                이 사이트의 자료로만 답하고, 문장마다 출처 번호를 답니다. 질문은 하나씩 따로 답해요.
              </p>
            </div>
            <button type="button" onClick={close} className="-mr-1 rounded-md p-1.5 text-mute transition-colors hover:bg-hover hover:text-ink" aria-label="닫기">
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </header>

          <div ref={logRef} className="flex-1 overflow-y-auto px-5 py-5" aria-live="polite">
            {turns.length === 0 && (
              <div>
                <p className="text-[13px] text-mute">이렇게 물어볼 수 있어요</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {EXAMPLES.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        disabled={busy || closed}
                        onClick={() => ask(q)}
                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-left text-[14px] text-ink-2 transition-colors hover:border-line-2 hover:bg-hover disabled:opacity-50"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ol className="flex flex-col gap-6">
              {turns.map((t) => (
                <li key={t.id} className="flex flex-col gap-3">
                  <p className="self-end rounded-xl rounded-br-sm bg-ink px-3.5 py-2 text-[14px] leading-[1.6] text-paper">{t.question}</p>

                  {!t.result && !t.error && (
                    <ol className="flex flex-wrap gap-x-3 gap-y-1 text-[12px]" aria-label="진행 단계">
                      {STAGES.map((s, i) => {
                        const at = STAGES.findIndex((x) => x.id === t.stage);
                        const state = at < 0 ? (i === 0 ? "now" : "todo") : i <= at ? "done" : i === at + 1 ? "now" : "todo";
                        return (
                          <li key={s.id} className={cn(state === "done" ? "text-ink-2" : state === "now" ? "font-medium text-accent" : "text-mute/60")}>
                            {state === "done" ? "✓ " : ""}
                            {s.label}
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {t.error && <p className="text-[14px] leading-[1.7] text-mute">{t.error}</p>}

                  {t.result && (
                    <div className="rounded-xl border border-line bg-card p-4">
                      <AnswerText text={t.result.answer} citations={t.result.citations} onCite={onCite} />
                      {t.result.citations.length > 0 && (
                        <ol className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
                          {t.result.citations.map((c) => (
                            <li key={c.n} className="flex gap-2 text-[12.5px] leading-[1.5]">
                              <span className="shrink-0 font-mono text-accent">[{c.n}]</span>
                              <Link href={c.href} onClick={(e) => onCite(e, c)} className="text-ink-2 underline decoration-line-2 underline-offset-2 hover:text-ink">
                                {c.title} › {c.section}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                      {NOTE[t.result.outcome] && <p className="mt-3 font-mono text-[11px] text-mute">{NOTE[t.result.outcome]}</p>}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <form
            className="border-t border-line px-5 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            {closed ? (
              <p className="text-[13.5px] text-mute">오늘 받을 수 있는 질문을 모두 받았어요. 내일 다시 열려요.</p>
            ) : (
              <>
                <label htmlFor="ask-input" className="sr-only">
                  질문
                </label>
                <textarea
                  id="ask-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      ask(input);
                    }
                  }}
                  rows={2}
                  maxLength={MAX_CHARS}
                  placeholder="경력·프로젝트에 대해 물어보세요"
                  aria-describedby="ask-count ask-notice"
                  className="w-full resize-none rounded-lg border border-line-2 bg-card px-3 py-2.5 text-[14.5px] leading-[1.6] text-ink placeholder:text-mute focus-visible:outline-2"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span id="ask-count" className="font-mono text-[11.5px] text-mute">
                    {input.length} / {MAX_CHARS}
                    {remaining !== null && ` · 오늘 남은 질문 ${remaining}`}
                  </span>
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="inline-flex h-9 items-center rounded-lg bg-ink px-4 text-[13.5px] font-medium text-paper transition-colors hover:bg-ink-2 disabled:opacity-40"
                  >
                    {busy ? "답하는 중" : "묻기"}
                  </button>
                </div>
                <p id="ask-notice" className="mt-2 text-[11.5px] leading-[1.5] text-mute [word-break:keep-all]">
                  {PRIVACY_NOTICE[lang]}
                </p>
              </>
            )}
          </form>
        </section>
      )}
    </>
  );
}
