// 스킬 대시보드 — 두 버전(기본 /dashboard · 게임기 /play/dashboard)이 함께 쓰는 숫자 계산과 라벨
import data from "../_data/dashboard/public.json";
import type { DashboardPublic } from "../_data/dashboard/types";

export const D = data as unknown as DashboardPublic;

export const n = (x: number) => x.toLocaleString("ko-KR");

export const REL: Record<string, string> = {
  about: "다룬다",
  see_instead: "대신 본다",
  opposes: "반대한다",
  supersedes: "대체한다",
  broader: "상위 개념",
};

export const SOURCE: Record<DashboardPublic["usage"]["source"], string> = {
  hook: "훅 기록 기준",
  transcripts: "세션 기록 기준",
  none: "기록 없음",
  demo: "예시 데이터",
};

export const META = {
  title: "스킬 대시보드",
  description: "claude-skills 저장소의 사용 순위·매 턴 실리는 글자·레퍼런스 온톨로지·모델 프로필을 숫자로 봅니다.",
};

/** 화면에 바로 쓰는 합계·최댓값 */
export function summarize(d: DashboardPublic) {
  const { usage, budget, ontology } = d;
  const descTotal = budget.skills.reduce((s, x) => s + x.desc, 0);
  const agentTotal = budget.agents.reduce((s, x) => s + x.desc, 0);
  return {
    descTotal,
    agentTotal,
    perTurn: descTotal + agentTotal + budget.memory,
    relTotal: ontology ? Object.entries(ontology.relations).filter(([k]) => k !== "broader").reduce((s, [, v]) => s + v, 0) : 0,
    hasUsage: usage.source !== "none" && (usage.skills.length > 0 || usage.agents.length > 0),
    usageMax: Math.max(1, ...usage.skills.map((r) => r.count), ...usage.agents.map((r) => r.count)),
    agentModel: new Map(budget.agents.map((a) => [a.name, a.model])),
  };
}

/** 주인 패널 위 한 줄 */
export function ownerSummary(groups: number, requests: number) {
  return groups > 0
    ? `스킬이 안 뜬 반복 요청 ${groups}묶음(${requests}회)의 원문은 주인 키로만 열립니다.`
    : "스킬이 안 뜬 반복 요청의 원문은 주인 키로만 열립니다.";
}
