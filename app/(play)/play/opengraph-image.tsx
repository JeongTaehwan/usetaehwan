import { ImageResponse } from "next/og";
export const alt="useTaehwan() — Two screens, one frontend engineer";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function OpenGraphImage(){
 return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:80,background:"#e3e7e4",color:"#24322f",fontFamily:"sans-serif"}}>
 <div style={{display:"flex",flexDirection:"column",gap:18}}>
 <div style={{fontSize:16,letterSpacing:5,color:"#256e67"}}>FRONTEND ENGINEER</div>
 <div style={{fontSize:61,fontWeight:800,fontStyle:"italic",letterSpacing:-3}}>useTaehwan()</div>
 <div style={{fontSize:24}}>Taehwan Jeong · Seoul</div>
 <div style={{display:"flex",marginTop:22,fontSize:17,color:"#475b55"}}>Projects / Experience / AI notes / Talks</div>
 </div>
 <div style={{display:"flex",flexDirection:"column",width:390,height:536}}>
 <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:250,padding:20,borderRadius:22,background:"#242a2e"}}>
 <div style={{display:"flex",flexDirection:"column",justifyContent:"center",width:290,height:200,padding:22,border:"8px solid #0b1012",background:"#f2f4ed"}}>
 <div style={{fontSize:18,fontWeight:700}}>TAEHWAN · Lv.4</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:15,fontSize:13,color:"#39816b"}}><div>HP</div><div style={{width:155,height:6,borderRadius:3,background:"#39816b"}} /></div><div style={{marginTop:24,fontSize:14}}>Commerce frontend engineer</div>
 </div></div>
 <div style={{display:"flex",height:16,margin:"0 12px",borderRadius:8,background:"#3e464b"}}/>
 <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:270,borderRadius:22,background:"#242a2e",position:"relative"}}>
 <div style={{position:"absolute",left:10,top:112,width:30,height:10,background:"#14191d"}}/><div style={{position:"absolute",left:20,top:102,width:10,height:30,background:"#14191d"}}/>
 <div style={{display:"flex",flexWrap:"wrap",gap:8,width:290,height:213,padding:15,border:"8px solid #0b1012",background:"#172d30"}}>
 {["PROJECTS","ABOUT","CAREER","AI NOTES","TALKS","CONTACT"].map(t=><div key={t} style={{display:"flex",alignItems:"center",justifyContent:"center",width:117,height:46,border:"1px solid #74ded1",borderRadius:4,color:"#f2f4ed",fontSize:12}}>{t}</div>)}
 </div>{[[18,101],[7,112],[29,112],[18,123]].map(([right,top])=><div key={right+"-"+top} style={{position:"absolute",right,top,width:10,height:10,borderRadius:10,background:"#3e464b"}}/>)}
 </div></div></div>,size);
}
