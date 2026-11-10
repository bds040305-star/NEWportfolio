/* Independent reference sections. No existing GSAP or Three.js scene is recreated. */
(()=>{
'use strict';if(window.heroAboutMotion)return;
const about=document.getElementById('about'),bar=document.getElementById('dasomLogoBar'),header=document.getElementById('ds-fixed-nav');
if(!about||!bar||!header)return;
const life=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const track=bar.querySelector('.ha-logo-track'),group=track.firstElementChild,source=[...group.children];
let visible=false,lastWidth=0;
function setRunning(){bar.classList.toggle('is-running',visible&&!document.hidden&&!reduced.matches)}
function fit(){
 const width=document.documentElement.clientWidth;
 document.documentElement.style.setProperty('--ha-scale',String(width/1920));
 if(width===lastWidth)return;lastWidth=width;
 // One complete unit includes its trailing gap, making both joins identical.
 const count=Math.max(6,Math.ceil(width/346.5));
 group.replaceChildren(...Array.from({length:count},(_,i)=>source[i%source.length].cloneNode(true)));
 track.querySelectorAll('[data-ha-copy]').forEach(copy=>copy.remove());
 const copy=group.cloneNode(true);copy.dataset.haCopy='';copy.setAttribute('aria-hidden','true');copy.inert=true;track.append(copy);
 const span=group.getBoundingClientRect().width;
 bar.style.setProperty('--ha-loop-width',span+'px');bar.style.setProperty('--ha-loop-duration',span/26+'s');
}
let boundaryFrame=0;
function updateBoundary(){
 boundaryFrame=0;
 const rect=about.getBoundingClientRect(),height=header.getBoundingClientRect().height;
 const past=rect.top<=height+18;
 if(header.classList.contains('is-scrolled')!==past)header.classList.toggle('is-scrolled',past);
 const firstScenes=rect.bottom>height;
 if(document.documentElement.classList.contains('ha-first-scenes')!==firstScenes)document.documentElement.classList.toggle('ha-first-scenes',firstScenes);
}
function observeBoundary(){updateBoundary()}
window.addEventListener('scroll',()=>{if(!boundaryFrame)boundaryFrame=requestAnimationFrame(updateBoundary)},{passive:true,signal:life.signal});
const viewportObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;setRunning()});viewportObserver.observe(bar);
const sizes=new ResizeObserver(()=>{fit();observeBoundary()});sizes.observe(header);sizes.observe(document.documentElement);
document.addEventListener('visibilitychange',setRunning,{signal:life.signal});reduced.addEventListener('change',setRunning,{signal:life.signal});
fit();observeBoundary();document.fonts.ready.then(fit);
window.heroAboutMotion={get state(){return{visible,reduced:reduced.matches,width:parseFloat(bar.style.getPropertyValue('--ha-loop-width')),duration:parseFloat(bar.style.getPropertyValue('--ha-loop-duration')),playState:getComputedStyle(track).animationPlayState}},destroy(){life.abort();cancelAnimationFrame(boundaryFrame);sizes.disconnect();viewportObserver.disconnect()}};
})();
