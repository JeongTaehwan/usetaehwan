/** 셀메이트 입사월 — 경력 기간 표기의 기준 */
export const CAREER_START = "2022-11";

/** 입사월부터 now가 속한 달까지의 기간 · "N년 M개월" (서울 기준 달) */
export function careerLength(now: Date = new Date()): string {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" })
    .format(now)
    .split("-")
    .map(Number);
  const [sy, sm] = CAREER_START.split("-").map(Number);
  const months = (y - sy) * 12 + (m - sm);
  return `${Math.floor(months / 12)}년 ${months % 12}개월`;
}

/** 정적 페이지는 빌드 시점에 한 번 계산된다 */
export const CAREER_LENGTH = careerLength();
