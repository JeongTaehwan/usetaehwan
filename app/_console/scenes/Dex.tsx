import Link from "next/link";
import { Pixel } from "../Pixel";
import { PROJECTS } from "../../_data/projects";
import { BackToMenu, PROJECT_SPRITE } from "./common";
export function dexNo(i:number){return `No.${String(i+1).padStart(3,"0")}`;}
export function Dex(){return <section data-scene="dex" className="scene">
  <h2 className="list-title">도감 <span>프로젝트 · {PROJECTS.length}</span></h2>
  <ol className="selection-list">{PROJECTS.map((p,i)=><li key={p.slug}>
    <Link href={p.detail?`/play/projects/${p.slug}`:"#dex"} data-nav data-preview={`dex:${i}`} className="selection-row">
      <Pixel name={PROJECT_SPRITE[p.slug]??"blocks"}/><span><small>{dexNo(i)} · {p.year}</small><strong>{p.name}</strong><span className="body-kr">{p.tags.join(" · ")}</span></span><b aria-hidden>›</b>
    </Link>
  </li>)}</ol><BackToMenu/></section>;}
