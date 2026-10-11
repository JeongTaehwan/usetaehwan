"use client";

import { Chibi } from "../Chibi";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pixel, type SpriteName } from "../Pixel";
import { SegBar, TypeChip } from "../ui";

const PAGES = [
  "안녕하세요! 프론트엔드 개발자 정태환입니다.",
  "잘 만든 코드는 잘 쓴 문서와 닮았다고 생각해요. 그래서 구조를 먼저 그리고, 숫자로 확인하고, 문서로 남깁니다.",
  "AI도 절차 안에 두고 씁니다. 역할을 나누고, 결과를 코드로 검증하고, 체감 대신 숫자로 판단해요.",
  "아래 화면에서 어디부터 볼지 골라 주세요.",
];
const ITEMS: {id: string; label: string; sub: string; sprite: SpriteName}[] = [
  {id:"dex",label:"도감",sub:"프로젝트",sprite:"dex"},
  {id:"trainer",label:"트레이너 카드",sub:"소개",sprite:"trainer"},
  {id:"map",label:"타운맵",sub:"경력",sprite:"map"},
  {id:"notes",label:"기술머신",sub:"AI 노트",sprite:"disk"},
  {id:"caster",label:"라이브캐스터",sub:"발표",sprite:"caster"},
  {id:"link",label:"통신",sub:"연락",sprite:"letter"},
];
function subscribeBoot(cb:()=>void) {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement,{attributes:true,attributeFilter:["data-booted"]});
  return ()=>o.disconnect();
}
export function MenuTop() {
  const booted = useSyncExternalStore(subscribeBoot,()=>!!document.documentElement.dataset.booted,()=>false);
  const [page,setPage]=useState(0);
  const [n,setN]=useState(0);
  const text=PAGES[page];
  useEffect(()=>{
    if (!booted) return;
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t=setTimeout(()=>setN(text.length),0); return ()=>clearTimeout(t);
    }
    const t=setInterval(()=>setN(v=>Math.min(v+1,text.length)),28);
    return ()=>clearInterval(t);
  },[text,booted]);
  const advance=()=>{
    if(n<text.length) setN(text.length);
    else {setPage(v=>(v+1)%PAGES.length);setN(0);}
  };
  useEffect(()=>{
    window.addEventListener("console:dialog",advance);
    return ()=>window.removeEventListener("console:dialog",advance);
  });
  return <section data-scene="menu" className="scene menu-top" aria-label="인사">
    <div className="screen-caption"><span>FRONTEND ENGINEER</span><span>SEOUL, KR</span></div>
    <div className="battle">
      <div className="battle-plate">
        <div className="battle-name"><h1>정태환</h1><span>Lv.4</span></div>
        <div className="chips"><TypeChip>프론트엔드</TypeChip><TypeChip>커머스</TypeChip></div>
        <div className="hp"><span>HP</span><SegBar value={1} max={1} label="체력 가득" /></div>
        <p>Vue 3 / React · TypeScript</p>
      </div>
      <div className="battle-stage"><span className="battle-ground"/><Chibi className="battle-trainer battle-me"/></div>
      <span className="battle-orbit" aria-hidden/>
    </div>
    <button className="pbox greeting" type="button" aria-label="인사 대화 다음 페이지" onClick={advance}>
      <span className="sr-only">{PAGES.join(" ")}</span>
      <span aria-hidden>{text.slice(0,n)}<span className="invisible">{text.slice(n)}</span></span>
      <span className="dialog-more" aria-hidden>▼</span>
    </button>
  </section>;
}
export function Menu() {
  return <section data-scene="menu" className="scene menu-bottom">
    <div className="menu-heading"><span>어디부터 볼까요?</span><span className="touch-label">TOUCH MENU</span></div>
    <nav aria-label="메뉴"><ul className="menu-grid">{ITEMS.map(it=><li key={it.id}>
      <a href={"#"+it.id} data-nav className="pitem" aria-label={it.label+" · "+it.sub}>
        <Pixel name={it.sprite}/><span><strong>{it.label}</strong><small>{it.sub}</small></span><span className="menu-arrow" aria-hidden>›</span>
      </a>
    </li>)}</ul></nav>
    <div className="menu-footer"><p className="keys-hint">↑↓←→ 이동 · Z 결정 · X 뒤로</p>
      <div className="flex items-center gap-1">
        {/* 다른 루트 레이아웃이라 전체 이동 — 단정한 기본 버전으로 */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" data-nav className="settings-link">기본 버전 ↗</a>
        <a href="#settings" data-nav className="settings-link" aria-label="설정"><Pixel name="gear"/>설정</a>
      </div>
    </div>
  </section>;
}
