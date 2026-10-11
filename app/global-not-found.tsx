import type { Metadata } from "next";
import "./(site)/site.css";
import { fontVars } from "./_site/fonts";
import { NotFoundBody } from "./_site/NotFoundBody";

/* 루트 레이아웃이 둘((site) · (play))이라 어느 쪽에도 맞지 않는 주소는 여기서 받는다 */
export const metadata: Metadata = {
  title: "404 — Taehwan Jeong",
  description: "없는 페이지예요.",
};

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={fontVars}>
      <body className="font-sans">
        <NotFoundBody />
      </body>
    </html>
  );
}
