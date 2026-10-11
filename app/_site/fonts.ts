import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";

/* v5 서체 — 본문은 Noto Sans KR, 번호·연도·코드 같은 작은 표식은 JetBrains Mono */
export const sans = Noto_Sans_KR({ variable: "--font-sans-next", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
export const mono = JetBrains_Mono({ variable: "--font-mono-next", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

/** html 에 다는 변수 클래스 — @theme 토큰이 var()로 참조한다 */
export const fontVars = `${sans.variable} ${mono.variable}`;
