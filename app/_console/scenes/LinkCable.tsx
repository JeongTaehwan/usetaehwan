import { BackToMenu,BLOG_URL,GITHUB_URL,GMAIL_COMPOSE } from "./common";
export function LinkCable(){return <section data-scene="link" className="scene"><h2 className="list-title">통신 <span>연락</span></h2>
<div className="contact-options"><a href={GMAIL_COMPOSE} target="_blank" rel="noreferrer" data-nav className="pbtn pbtn-solid">메일 보내기 ↗</a><a href={GITHUB_URL} target="_blank" rel="noreferrer" data-nav className="pbtn">GitHub ↗</a><a href={BLOG_URL} target="_blank" rel="noreferrer" data-nav className="pbtn">블로그 ↗</a></div><p className="body-kr">제안이나 협업 이야기를 기다립니다.</p><BackToMenu/></section>;}
