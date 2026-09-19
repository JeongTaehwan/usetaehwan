import Link from "next/link";
import { Pixel } from "../Pixel";
import { PRACTICES } from "../../_data/ai-practices";
import { BackToMenu } from "./common";
export function tmNo(i:number){return `TM${String(i+1).padStart(2,"0")}`;}
export function Notes(){return <section data-scene="notes" className="scene">
  <h2 className="list-title">기술머신 <span>AI 노트</span></h2>
  <ol className="selection-list">{PRACTICES.map((p,i)=><li key={p.slug}><Link href={`/ai/${p.slug}`} data-nav data-preview={`notes:${i}`} className="selection-row"><Pixel name="disk"/><span><small>{tmNo(i)}</small><strong>{p.title}</strong><span className="body-kr">{p.tags.join(" · ")}</span></span><b aria-hidden>›</b></Link></li>)}</ol>
  <BackToMenu/></section>;}
