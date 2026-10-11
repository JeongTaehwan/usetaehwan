import type { Metadata, Viewport } from "next";
import "./site.css";
import { fontVars } from "../_site/fonts";

const SITE_URL = "https://usetaehwan.page";
const SITE_TITLE = "Taehwan Jeong — Frontend engineer";
const SITE_DESCRIPTION =
  "커머스 프론트엔드 3년 10개월 — 결제·정산·쿠폰 등 금액 도메인과 외부 시스템 연동. AI는 역할을 나누고 코드로 검증하고 숫자로 판단하는 통제 대상으로 다룹니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — Taehwan Jeong",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "Taehwan Jeong",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121314" },
  ],
};

/** v5 · 기본 버전의 루트 레이아웃. 게임기 버전(/play)은 (play) 그룹의 별도 루트 레이아웃을 쓴다. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={fontVars}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
