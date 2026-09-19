/** First-paint preferences and a session boot that also accepts input before hydration. */
export const INIT_SCRIPT = `(function(){
 var d=document.documentElement;
 try {
  var shell=localStorage.getItem('shell');
  d.dataset.shell=['black','white','red','blue','turf'].indexOf(shell)>=0?shell:'black';
  d.dataset.sound=localStorage.getItem('sound')==='on'?'on':'off';
  if(sessionStorage.getItem('booted')||location.hash.length>1||location.pathname!=='/'||matchMedia('(prefers-reduced-motion: reduce)').matches){
   d.dataset.booted='1';return;
  }
  sessionStorage.setItem('booted','1');
  var timer;
  function skip(e){
   if(e){e.preventDefault();e.stopImmediatePropagation();}
   d.dataset.booted='1';
   clearTimeout(timer);
   window.removeEventListener('keydown',skip,true);
   window.removeEventListener('pointerdown',skip,true);
  }
  window.addEventListener('keydown',skip,true);
  window.addEventListener('pointerdown',skip,true);
  timer=setTimeout(skip,2600);
 }catch(e){d.dataset.booted='1';}
})();`;
