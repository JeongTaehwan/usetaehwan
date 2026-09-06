"use client";

import { useState } from "react";
import { ContactShadow, Plant, RoomCaption, RoomLabel, SceneFinish, Skyline as SkylineSvg } from "../scene/primitives";

const EMAIL = "kt26625417@gmail.com";
const REPO_URL = "https://github.com/JeongTaehwan";
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent("usetaehwan.page 문의")}`;

/** 창가 — Contact. 큰 창과 창턱, 왼쪽에 인사와 버튼, 아래에 메모 카드(제출하면 메일 작성창이 열린다). */
export function WindowRoom() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${f.message}\n\n— ${f.name} (${f.email})`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("usetaehwan.page 메모")}&body=${encodeURIComponent(body)}`;
  };
  return (
    <section id="contact" className="relative isolate overflow-hidden bg-wall pt-24 sm:pt-28 lg:min-h-[100svh]">
      <div className="brick absolute inset-0" />
      <div className="floor absolute inset-x-0 bottom-0 h-[16%]" />
      {/* 큰 창 */}
      <div className="absolute right-0 top-[11%] hidden h-[62%] w-[61%] bg-wood-3 shadow-[inset_0_0_60px_rgba(0,0,0,0.25)] md:block" aria-hidden>
        <div className="absolute inset-[10px] grid grid-cols-3 grid-rows-2 gap-[10px]">
          {Array.from({ length: 6 }, (_, k) => (
            <div key={k} className="glass relative overflow-hidden">
              {k >= 3 && <SkylineSvg className="absolute inset-x-0 bottom-0 h-[60%] blur-[1.6px]" />}
            </div>
          ))}
        </div>
        <div className="wood absolute -left-5 -right-5 -bottom-2 h-[22px] shadow-[0_20px_30px_-14px_var(--shadow)]" />
      </div>
      <Plant className="absolute right-[6%] top-[calc(11%+62%-150px)] hidden h-[150px] w-[120px] md:block" />
      <div className="sunbeam left-[44%] top-[-10%] h-[120%] w-[62%]" />
      <div className="lampglow" style={{ ["--lamp-x" as string]: "18%", ["--lamp-y" as string]: "82%" }} />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-[26%] sm:px-8 lg:px-14 lg:pb-[20%]">
        <div className="max-w-[420px]">
          <RoomLabel>Contact · By the window</RoomLabel>
          <h2 className="myeongjo mt-5 text-[34px] leading-[1.2] text-ink sm:text-[48px]">함께 만들 게<br />있다면.</h2>
          <p className="prose-kr mt-5 text-ink-2">제안, 협업, 혹은 그냥 인사도 좋아요. 편하게 메일 주시면 빠르게 회신드리겠습니다.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={GMAIL_COMPOSE} target="_blank" rel="noreferrer" className="btn btn-solid">메일 보내기</a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-outline">GitHub ↗</a>
          </div>
          <div className="caps mt-5 text-muted">{EMAIL} · Seoul, KR</div>
        </div>
        {/* 메모 카드 */}
        <form onSubmit={submit} className="paper relative mt-10 max-w-[380px] p-6">
          <ContactShadow className="-bottom-4 left-4 right-4 h-6" />
          <div className="caps text-accent">Leave a note</div>
          <div className="mt-4 flex flex-col gap-4">
            {([["name", "Name", "text"], ["email", "Email", "email"]] as const).map(([k, label, type]) => (
              <label key={k} className="block">
                <span className="caps text-[9px] text-[#8b7f72]">{label}</span>
                <input type={type} required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full border-b border-[rgba(43,38,34,0.25)] bg-transparent py-1.5 text-[14px] text-[#2b2622] outline-none focus:border-accent" />
              </label>
            ))}
            <label className="block">
              <span className="caps text-[9px] text-[#8b7f72]">Message</span>
              <textarea required rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="mt-1 w-full resize-none border-b border-[rgba(43,38,34,0.25)] bg-transparent py-1.5 text-[14px] text-[#2b2622] outline-none focus:border-accent" />
            </label>
          </div>
          <div className="mt-4 flex justify-end"><button type="submit" className="caps rounded-full bg-brass px-4 py-2.5 text-[#2b2622] hover:bg-brass-2">Send</button></div>
        </form>
      </div>
      <RoomCaption name="Window" note="Contact · 메모는 메일 작성창으로 이어진다" />
      <SceneFinish />
    </section>
  );
}
