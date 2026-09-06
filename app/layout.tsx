import type { Metadata } from "next";
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./_components/Providers";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const SITE_URL = "https://usetaehwan.page";
const SITE_TITLE = "useTaehwan() — A frontend engineer, documented.";
const SITE_DESCRIPTION =
  "커머스 프론트엔드 3년 10개월 — 결제·정산·쿠폰 등 금액 도메인과 외부 시스템 연동. AI는 역할을 나누고 코드로 검증하고 숫자로 판단하는 통제 대상으로 다룹니다. 직접 만든 디자인 시스템 @usetaehwan/ui로 구축.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — useTaehwan()",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "useTaehwan()",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// 페인트 전에 테마를 결정해 FOUC(잘못된 테마 깜빡임)를 막는다.
// 저장된 값 우선, 없으면 OS 설정을 따른다.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${hankenGrotesk.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
