"use client";
import { useEffect,useState } from "react";
import { PROJECTS } from "../../_data/projects";
import { EXPERIENCE } from "../../_data/experience";
import { PRACTICES } from "../../_data/ai-practices";
import { TALKS } from "../../_data/talks";
import { Pixel } from "../Pixel";
import { Me } from "../Me";
import { Dialog,TypeChip } from "../ui";
import { PROJECT_SPRITE } from "./common";
import { dexNo } from "./Dex";
import { tmNo } from "./Notes";
export function Previews(){
 const [selected,setSelected]=useState<Record<string,number>>({});
 useEffect(()=>{const h=(e:Event)=>{const value=(e as CustomEvent<HTMLElement>).detail.dataset.preview;if(!value)return;const [scene,index]=value.split(":");setSelected(s=>({...s,[scene]:Number(index)}));};window.addEventListener("console:cursor",h);return ()=>window.removeEventListener("console:cursor",h);},[]);
 const p=PROJECTS[selected.dex??0],ai=PRACTICES[selected.notes??0],talk=TALKS[selected.caster??0],exp=EXPERIENCE[selected.map??0];
 return <>
 <section data-scene="dex" className="scene preview">
  <div className="screen-caption"><span>PROJECT DEX</span><span>{dexNo(selected.dex??0)}</span></div>
  <div className="dex-preview"><div className="preview-sprite"><Pixel name={PROJECT_SPRITE[p.slug]??"blocks"}/><span className="sprite-shadow"/></div><div><small>{p.year} · 프로젝트</small><h2>{p.name}</h2><div className="chips">{p.tags.map(t=><TypeChip key={t}>{t}</TypeChip>)}</div><p className="body-kr">{p.summary}</p></div></div>
  <div className="preview-footer">아래에서 프로젝트를 골라 자세히 볼 수 있어요.</div>
 </section>
 <section data-scene="map" className="scene map-preview">
  <div className="screen-caption"><span>TOWN MAP</span><span>2022 → 2026</span></div>
  <div className="town-map" aria-label="경력 시기 지도">
   <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d={EXPERIENCE.map((_,i)=>{const x=7+i*14,y=(EXPERIENCE.length-1-i)%2===0?28:66;return i===0 ? `M${x} ${y}` : `H${x-7} V${y} H${x}`;}).join(" ")} /></svg>
   {EXPERIENCE.map((e,i)=><div key={e.title} className="town-node" data-active={(selected.map??0)===i} style={{left:`${7+(EXPERIENCE.length-1-i)*14}%`,top:i%2===0?"28%":"66%"}}><span className="town-house"/><small>{e.start}</small></div>)}
  </div>
  <div className="map-caption"><small>{exp.period} · MR {exp.mr}</small><h2>{exp.title}</h2></div>
 </section>
 <section data-scene="notes" className="scene notes-preview">
  <div className="screen-caption"><span>TECHNICAL MACHINE</span><span>{tmNo(selected.notes??0)}</span></div>
  <div className="note-heading"><Pixel name="disk"/><h2>{ai.title}</h2></div>
  <Dialog><p>{ai.keyRule}</p></Dialog><div className="tm-stat"><strong>{ai.stat.value}</strong><span className="body-kr">{ai.stat.label}</span></div>
 </section>
 <section data-scene="caster" className="scene caster-preview">
  <div className="screen-caption"><span>LIVE CASTER</span><span>발표 기록</span></div>
  <div className="call-window"><div className="call-avatar"><Me/></div><div><small>{talk.date}</small><h2>{talk.title}</h2><p className="body-kr">{talk.venue}</p></div><span className="call-corner" aria-hidden>▥</span></div>
  <div className="preview-footer">경험을 정리하고, 팀과 나눕니다.</div>
 </section>
 <section data-scene="link" className="scene link-preview"><div className="screen-caption"><span>WIRELESS COMMUNICATION</span><span>SEOUL</span></div>
 <div className="communication" aria-hidden><span/><span/><Pixel name="letter"/></div>
 <Dialog>함께 만들 게 있다면 편하게 메일 주세요.</Dialog></section>
 <section data-scene="settings" className="scene controls-preview"><div className="screen-caption"><span>CONTROLS</span><span>버튼 안내</span></div>
 <h2>터치하거나, 버튼으로.</h2><dl className="controls-map">{[["↑↓←→","커서 이동"],["A · Z / Enter","결정"],["B · X / Esc","뒤로"],["X · START / S","메뉴"],["Y · M","효과음"],["SELECT · C","기기 색"]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>
 </>;
}
