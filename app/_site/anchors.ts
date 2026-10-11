/**
 * 페이지 안 앵커 id — 단일 소스.
 * 페이지(id 속성)와 챗봇 코퍼스 익스포터(scripts/ask-corpus.ts, 출처 링크)가 같은 함수를 쓴다.
 * 두 곳에서 따로 만들면 언젠가 어긋나고, 깨진 앵커는 에러 없이 페이지 맨 위로만 간다.
 * 순서는 위치 기반(1부터) — 순서를 바꾸면 코퍼스를 다시 인제스트하면 맞춰진다.
 */
export const anchors = {
  home: {
    about: "about",
    experience: (i: number) => `exp-${i + 1}`,
    education: "education",
    contact: "contact",
  },
  project: {
    overview: "overview",
    case: (i: number) => `case-${i + 1}`,
    feature: (i: number) => `feature-${i + 1}`,
  },
  practice: {
    intro: "intro",
    case: (i: number) => `case-${i + 1}`,
    rules: "rules",
  },
  talk: {
    context: "context",
    outline: "outline",
    takeaways: "takeaways",
    numbers: "numbers",
  },
  resume: {
    summary: "summary",
    stack: "stack",
    jobs: "jobs",
    aiTalk: "ai-talk",
    sideProjects: "side-projects",
    education: "education",
    awards: "awards",
    case: (slug: string) => `case-${slug}`,
  },
} as const;
