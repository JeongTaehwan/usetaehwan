import { EXPERIENCE, COMPANY } from "../../_data/experience";
import { SegBar } from "../ui";
import { BackToMenu } from "./common";
export function TownMap(){return <section data-scene="map" className="scene">
  <h2 className="list-title">타운맵 <span>경력</span></h2><p className="company body-kr">{COMPANY}</p>
  <ol className="selection-list">{EXPERIENCE.map((e,i)=><li key={e.start+e.title}><details className="pbox experience">
    <summary data-nav data-preview={`map:${i}`}><small>{e.period}</small><strong>{e.title}</strong><div className="exp"><span>EXP</span><SegBar value={e.mr} max={Math.max(...EXPERIENCE.map(e=>e.mr))} label={`머지된 MR ${e.mr}건`}/><span>{e.mr} MR</span></div><span className="expand-hint">내용 펼치기 ＋</span></summary>
    <div className="experience-body"><p className="body-kr">{e.summary}</p><div className="chips">{e.dims.map(d=><span className="stat-chip" key={d}>{d}</span>)}</div></div>
  </details></li>)}</ol><BackToMenu/></section>;}
