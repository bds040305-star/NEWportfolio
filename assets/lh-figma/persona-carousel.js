/* Persona carousel: no GSAP or viewport observer dependency. */
(()=>{
'use strict';
function init(){
 const section=document.querySelector('[data-frame-id="124:16332"]');
 const root=section?.querySelector('[data-node-id="124:16332"]');
 if(!root||root.querySelector('#lh-persona-carousel-layer'))return;
 const ids=['124:16365','124:16373','124:16381','124:16337','124:16345','124:16354'];
 const names=['박민정','김도윤','최은정','이수진','이준호','정지훈'];
 const cards=ids.map(id=>root.querySelector('[data-node-id="'+id+'"]'));
 if(cards.some(el=>!el))return;
 const layer=document.createElement('div');layer.id='lh-persona-carousel-layer';layer.setAttribute('aria-label','페르소나 자동 카드 순환');root.append(layer);
 const spots=[{x:56,y:327},{x:653,y:327},{x:1250,y:327},{x:200,y:525},{x:797,y:525},{x:1394,y:525}];
 const cardsUI=cards.map((card,i)=>{
   // Legacy reveal on these cards can leave them invisible after reparenting.
   card.classList.remove('lh-motion-target');card.style.removeProperty('opacity');
   const w=document.createElement('div');w.className='lh-persona-slide';w.dataset.persona=names[i];w.append(card);layer.append(w);return w;
 });
 const position=(el,p)=>{el.style.transform='translate3d('+p.x+'px,'+p.y+'px,0)'};
 cardsUI.forEach((w,i)=>{position(w,spots[i]);w.style.opacity='1'});
 let order=cardsUI.slice(),busy=false,timer=null;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const animate=(el,frames,options)=>el.animate(frames,{fill:'forwards',...options}).finished.catch(()=>{});
 async function move(){
   if(busy||document.hidden||reduce.matches)return;
   busy=true;
   const before=order.slice(),after=before.slice(1).concat(before[0]);
   const tasks=before.map(async (el,i)=>{
     const from=spots[i],dest=spots[(i+5)%6];
     if(i!==0&&i!==3){
       await animate(el,[{transform:'translate3d('+from.x+'px,'+from.y+'px,0)'},{transform:'translate3d('+dest.x+'px,'+dest.y+'px,0)'}],{duration:1550,delay:i*140,easing:'cubic-bezier(.42,0,.2,1)'});
     }else{
       await animate(el,[{transform:'translate3d('+from.x+'px,'+from.y+'px,0)',opacity:1},{transform:'translate3d(-550px,'+from.y+'px,0)',opacity:0}],{duration:1070,delay:i===3?180:0,easing:'ease-in-out'});
       el.style.opacity='0';position(el,{x:2020,y:dest.y});
       await animate(el,[{transform:'translate3d(2020px,'+dest.y+'px,0)',opacity:0},{transform:'translate3d('+dest.x+'px,'+dest.y+'px,0)',opacity:1}],{duration:1250,easing:'ease-out'});
     }
   });
   await Promise.all(tasks);
   order=after;
   order.forEach((el,i)=>{position(el,spots[i]);el.style.opacity='1'});
   busy=false;
 }
 async function loop(){
   clearTimeout(timer);
   if(document.hidden||reduce.matches)return;
   timer=setTimeout(async()=>{await move();loop()},2400);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else loop()});
 reduce.addEventListener?.('change',()=>{clearTimeout(timer);if(!reduce.matches)loop()});
 window.__lhPersonaCarousel={next:move,getNames:()=>order.map(w=>w.dataset.persona),getStatus:()=>({busy,scheduled:!!timer})};
 loop();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();