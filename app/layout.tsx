import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { INIT_SCRIPT } from "./_console/init-script";

/* v4 · 게임기 서체 — Galmuri11(픽셀, 화면 UI·제목·대화창) · Noto Sans KR(긴 본문) */
const galmuri = localFont({
  variable: "--font-galmuri-next",
  src: [
    { path: "./_fonts/Galmuri11.woff2", weight: "400", style: "normal" },
    { path: "./_fonts/Galmuri11-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});
const noto = Noto_Sans_KR({ variable: "--font-noto-next", subsets: ["latin"], weight: ["400", "500"] });

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
  themeColor: "#17181c",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      // next/font 변수는 루트에 둔다 — @theme 토큰이 var()로 참조한다
      className={`${galmuri.variable} ${noto.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
