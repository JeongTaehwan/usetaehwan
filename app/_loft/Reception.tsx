"use client";

import { motion, type Variants } from "framer-motion";
import { ArchWindow, BrassPlate, ContactShadow, FloorLamp, Plant, SceneFinish } from "./scene/primitives";
import { CursorLight, Parallax } from "./Ambient";
import { useDark, useMounted } from "../_ui/palette";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

/** 리셉션 — 로프트의 첫 방. 시간대는 html.dark 로 갈리고 색은 토큰이 바꾼다. 여기서는 인사말만 바꾼다. */
export function Reception() {
  const dark = useDark();
  const mounted = useMounted();
  const evening = mounted && dark;

  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden bg-wall">
      <div className="brick absolute inset-y-0 left-0 w-full md:w-[53%]" />
      <div className="plaster absolute inset-y-0 right-0 hidden w-[47%] md:block" />
      <div className="floor absolute inset-x-0 bottom-0 h-[21%]" />

      <div className="absolute bottom-[21%] right-[4%] hidden h-[62%] md:flex lg:right-[6%]">
        <Parallax speed={-0.06} className="flex h-full gap-[2.2vw]">
          <ArchWindow className="h-full w-[13.2vw] max-w-[190px]" />
          <ArchWindow className="h-full w-[13.2vw] max-w-[190px]" />
          <ArchWindow className="h-full w-[13.2vw] max-w-[190px]" />
        </Parallax>
      </div>
      <div className="absolute bottom-[21%] right-[6%] h-[38%] w-[112px] md:hidden">
        <ArchWindow className="h-full w-full" />
      </div>

      <div className="sunbeam left-[26%] top-[-10%] h-[120%] w-[80%]" />
      <div className="lampglow" />
      <FloorLamp className="absolute left-[1.2%] top-[26%] hidden h-[40%] md:block" />
      <CursorLight />

      {/* 리셉션 데스크 */}
      <div className="absolute bottom-[17%] left-[6%] h-[14%] w-[68%] max-w-[600px] md:left-[8.3%] md:h-[16%] md:w-[42%]">
        <ContactShadow className="-bottom-3 left-0 h-6 w-full" />
        <div className="wood-dark absolute inset-0 shadow-[0_30px_40px_-20px_var(--shadow)]" />
        <div className="wood absolute -left-[3.5%] -top-[12%] h-[12%] w-[107%]" />
        <BrassPlate className="absolute -top-[42%] left-[5%] w-[min(300px,72%)]">
          <span className="md:hidden">Taehwan Jeong</span>
          <span className="hidden md:inline">Taehwan Jeong · Frontend</span>
        </BrassPlate>
        <ContactShadow className="-top-[16%] right-[8%] h-2 w-[90px]" />
        <Plant className="absolute -top-[70%] right-[4%] h-[100px] w-[80px] md:-top-[95%] md:h-[150px] md:w-[120px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 mx-auto max-w-[1440px] px-5 pt-28 sm:px-8 sm:pt-32 lg:px-14 lg:pt-36">
        <div className="max-w-[600px] lg:ml-[4.5%]">
          <motion.h1 variants={item} className="caslon text-[62px] leading-[0.98] tracking-[-0.02em] text-ink sm:text-[84px] lg:text-[96px]">
            {evening ? "Good evening." : "Good morning."}
          </motion.h1>
          <motion.p variants={item} className="mt-5 max-w-[520px] text-[15px] leading-[1.75] text-ink-2 [word-break:keep-all] sm:text-[19px]">
            프론트엔드 개발자 정태환의 사무실입니다.
            <br className="hidden sm:block" /> 구조를 먼저 그리고, 숫자로 확인하고, 문서로 남깁니다.
          </motion.p>
          <motion.div variants={item} className="mt-7 flex items-center gap-4">
            <a href="#about" className="btn btn-solid">
              Come in
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <a href="#contact" className="karla border-b border-line text-[14px] text-muted transition-colors hover:text-ink">Leave a note</a>
          </motion.div>
        </div>
      </motion.div>

      <div className="caps absolute bottom-6 left-5 z-10 flex gap-6 text-[#fbf6ec]/85 sm:left-8 lg:left-14">
        <span>Seoul, KR</span><span>{evening ? "19:48" : "09:12"}</span><span className="hidden sm:inline">3 yrs 10 mo · commerce frontend</span>
      </div>
      <SceneFinish />
    </section>
  );
}
