import Link from "next/link";
import { Pixel } from "../Pixel";
import { PRACTICES } from "../../_data/ai-practices";
import { BackToMenu } from "./common";
export function tmNo(i:number){return `TM${String(i+1).padStart(2,"0")}`;}
export function Notes(){return <section data-scene="notes" className="scene">
  <h2 className="list-title">기술머신 <span>AI 노트</span></h2>
  <p className="body-kr list-intro">AI를 통제 대상으로 다룹니다. 코드 생성기가 아니라 절차 안에 두는 것 — 역할을 나누고, 환각을 코드로 막고, 테스트의 정답을 먼저 고정하고, 체감 대신 숫자로 판단하고, 에이전트 팀과 스킬 저장소를 운영한 기록을 {PRACTICES.length}편으로 정리했습니다. 회사 코드베이스와 개인 프로젝트 양쪽에서 실측한 값만 씁니다.</p>
  <ol className="selection-list">{PRACTICES.map((p,i)=><li key={p.slug}><Link href={`/ai/${p.slug}`} data-nav data-preview={`notes:${i}`} className="selection-row"><Pixel name="disk"/><span><small>{tmNo(i)}</small><strong>{p.title}</strong><span className="body-kr">{p.tags.join(" · ")}</span></span><b aria-hidden>›</b></Link></li>)}</ol>
  <ol className="selection-list"><li><Link href="/dashboard" data-nav className="selection-row"><Pixel name="gear"/><span><small>DASHBOARD</small><strong>스킬 저장소 대시보드</strong><span className="body-kr">사용 순위 · 매 턴 글자 · 온톨로지</span></span><b aria-hidden>›</b></Link></li></ol>
  <BackToMenu/></section>;}
