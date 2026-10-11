import Link from "next/link";
import { Pixel } from "../Pixel";
import { TALKS } from "../../_data/talks";
import { BackToMenu } from "./common";
export function talkNo(i:number){return `TALK ${String(i+1).padStart(2,"0")}`;}
export function Caster(){return <section data-scene="caster" className="scene">
  <h2 className="list-title">라이브캐스터 <span>발표</span></h2>
  <ol className="selection-list">{TALKS.map((t,i)=><li key={t.slug}><Link href={`/play/talks/${t.slug}`} data-nav data-preview={`caster:${i}`} className="selection-row"><Pixel name="caster"/><span><small>{talkNo(i)} · {t.date}</small><strong>{t.title}</strong><span className="body-kr">{t.venue}</span></span><b aria-hidden>›</b></Link></li>)}</ol>
  <BackToMenu/></section>;}
