"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pixel, type SpriteName } from "../Pixel";
import { SegBar, TypeChip } from "../ui";

const PAGES = [
  "안녕하세요! 커머스 프론트엔드를 3년 10개월째 만들고 있는 정태환입니다.",
  "결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 화면을 주로 다뤄요.",
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
      <div className="battle-stage"><span className="battle-ground"/><Image src="/pixel-me.gif" alt="맨유 홈 유니폼을 입은 정태환의 픽셀 캐릭터" width={190} height={489} unoptimized priority className="battle-trainer battle-me"/></div>
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
      <a href="#settings" data-nav className="settings-link" aria-label="설정"><Pixel name="gear"/>설정</a>
    </div>
  </section>;
}
