/* Independent reference sections. No existing GSAP or Three.js scene is recreated. */
(()=>{
'use strict';if(window.heroAboutMotion)return;
const about=document.getElementById('about'),header=document.getElementById('ds-fixed-nav');
if(!about||!header)return;
const life=new AbortController();
function fit(){
 const width=document.documentElement.clientWidth;
 document.documentElement.style.setProperty('--ha-scale',String(width/1920));
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
const sizes=new ResizeObserver(()=>{fit();observeBoundary()});sizes.observe(header);sizes.observe(document.documentElement);
fit();observeBoundary();document.fonts.ready.then(fit);
window.heroAboutMotion={destroy(){life.abort();cancelAnimationFrame(boundaryFrame);sizes.disconnect()}};
})();
