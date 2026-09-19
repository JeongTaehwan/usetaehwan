"use client";
import { SHELLS,setShell,setSound,useShell,useSound } from "../prefs";
import { playSfx } from "../sfx";
import { BackToMenu } from "./common";
export function Settings(){
 const sound=useSound(),shell=useShell();
 return <section data-scene="settings" className="scene"><h2 className="list-title">설정 <span>소리 · 기기 색</span></h2>
 <fieldset className="settings-group"><legend>효과음</legend><div className="options">
 {[true,false].map(on=><button key={String(on)} type="button" data-nav className="opt" aria-label={on?"효과음 켜기":"효과음 끄기"} aria-pressed={sound===on} onClick={()=>{setSound(on);if(on)playSfx("confirm");}}>{on?"켜기":"끄기"}</button>)}
 </div><p className="body-kr">이동·결정·취소를 짧은 소리로 알려 줍니다.</p></fieldset>
 <fieldset className="settings-group"><legend>기기 색</legend><div className="options">{SHELLS.map(s=><button key={s.id} type="button" data-nav className="opt" data-shell-swatch={s.id} aria-label={s.label+" 기기 색"} aria-pressed={shell===s.id} onClick={()=>setShell(s.id)}><span className="swatch" aria-hidden/>{s.label}</button>)}</div></fieldset><BackToMenu/></section>;
}
