"use client";
import { useEffect,useSyncExternalStore } from "react";
import { Console } from "./Console";
import { Menu,MenuTop } from "./scenes/Menu";
import { Dex } from "./scenes/Dex";
import { Trainer,TrainerTop } from "./scenes/Trainer";
import { TownMap } from "./scenes/TownMap";
import { Notes } from "./scenes/Notes";
import { Caster } from "./scenes/Caster";
import { LinkCable } from "./scenes/LinkCable";
import { Settings } from "./scenes/Settings";
import { Previews } from "./scenes/Previews";
import { LEGACY_HASH,SCENE_IDS,SCENE_LABEL,toScene } from "./scenes/common";
function subscribe(cb:()=>void){window.addEventListener("hashchange",cb);return ()=>window.removeEventListener("hashchange",cb);}
export function HomeGame(){
 const scene=useSyncExternalStore(subscribe,()=>toScene(location.hash),()=>"menu" as const);
 useEffect(()=>{
  const legacy=()=>{const h=location.hash.slice(1);if(LEGACY_HASH[h])location.replace("#"+LEGACY_HASH[h]);};
  const remember=(e:HashChangeEvent)=>{
   const from=toScene(new URL(e.oldURL).hash);
   if(toScene(location.hash)!=="menu"||from==="menu")return;
   document.querySelectorAll('[data-scene="menu"] [data-nav-default]').forEach(el=>el.removeAttribute("data-nav-default"));
   document.querySelector(`[data-scene="menu"] a[href="#${from}"]`)?.setAttribute("data-nav-default","");
  };
  legacy();window.addEventListener("hashchange",legacy);window.addEventListener("hashchange",remember);
  return ()=>{window.removeEventListener("hashchange",legacy);window.removeEventListener("hashchange",remember);};
 },[]);
 const menu=()=>{location.hash="menu";};
 return <Console label={SCENE_LABEL[scene]} onBack={menu} onMenu={menu}
 top={<><MenuTop/><TrainerTop/><Previews/></>}
 bootTop={<div className="boot" aria-hidden><div className="boot-logo">useTaehwan()</div><p>FRONTEND ENGINEER</p></div>}
 bootBottom={<div className="boot boot-warning"><div className="warning-symbol" aria-hidden>△</div><p>이 사이트는 두 화면으로 봅니다.<br/>아래 화면을 터치하면 시작합니다.</p><small>TOUCH TO START</small></div>}>
  {SCENE_IDS.map(id=><span key={id} id={id} className="scene-anchor" aria-hidden/>)}
  <Menu/><Dex/><Trainer/><TownMap/><Notes/><Caster/><LinkCable/><Settings/>
 </Console>;
}
