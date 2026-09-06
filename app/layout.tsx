import type { Metadata } from "next";
import { Karla, Libre_Caslon_Text, Nanum_Myeongjo, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/Providers";

/* v3 · 로프트 서체 — Caslon(영문 제목) · 나눔명조(한글 제목) · Karla(라벨) · Noto Sans KR(본문) */
const caslon = Libre_Caslon_Text({ variable: "--font-caslon-next", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const myeongjo = Nanum_Myeongjo({ variable: "--font-myeongjo-next", subsets: ["latin"], weight: ["400", "700", "800"] });
const karla = Karla({ variable: "--font-karla-next", subsets: ["latin"], weight: ["400", "500", "600"] });
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

// 페인트 전에 테마를 결정해 FOUC를 막는다. 저장된 값 우선, 없으면 OS 설정.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      // next/font 변수는 여기(:root)에 둔다 — @theme 토큰이 var()로 참조하므로 루트에 있어야 계산이 유효하다
      className={`${caslon.variable} ${myeongjo.variable} ${karla.variable} ${noto.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
