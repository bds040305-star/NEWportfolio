/* One lifecycle for the shared page chrome. Existing scene/scroll controllers stay intact. */
(()=>{
'use strict';
if(window.portfolioChrome)return;
const header=document.getElementById('ds-fixed-nav'),hero=document.getElementById('intro'),topButton=document.querySelector('.pc-top');
const dialog=document.getElementById('pc-link-confirm'),yes=dialog.querySelector('[data-pc-confirm]'),no=dialog.querySelector('[data-pc-cancel]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),life=new AbortController();
const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:life.signal});
let heroObserver,previousFocus=null,pending=null,savedScroll=0,outside=false,floating=null,hovered=false;
const controls=[...document.querySelectorAll('[data-pc-action]')];
function syncFloat(){
 const show=outside&&document.body.classList.contains('vertical-ready');
 topButton.classList.toggle('is-visible',show);topButton.tabIndex=show?0:-1;
 const running=show&&!reduced.matches&&!hovered&&!document.hidden&&!dialog.open;
 if(running){if(!floating&&window.gsap)floating=gsap.to(topButton,{y:-5,duration:2.4,ease:'sine.inOut',repeat:-1,yoyo:true});floating?.resume();}
 else floating?.pause();
 if(reduced.matches&&floating){floating.kill();floating=null;gsap.set(topButton,{clearProps:'transform'});}
}
function observeHero(){
 heroObserver?.disconnect();
 heroObserver=new IntersectionObserver(entries=>{
  const entry=entries[0];outside=!entry.isIntersecting&&entry.boundingClientRect.bottom<=header.getBoundingClientRect().height;
  syncFloat(); // Header styling is owned by the ABOUT ME boundary observer.
 },{rootMargin:`-${header.getBoundingClientRect().height}px 0px 0px 0px`,threshold:0});
 heroObserver.observe(hero);
}
function toTop(event){
 event.preventDefault();
 window.dispatchEvent(new CustomEvent('portfolio:nav-target',{detail:{top:0}}));
 window.scrollTo({top:0,left:0,behavior:reduced.matches?'instant':'smooth'});
}
document.querySelectorAll('[data-pc-top]').forEach(button=>listen(button,'click',toTop));
listen(topButton,'pointerenter',()=>{hovered=true;syncFloat()});
listen(topButton,'pointerleave',()=>{hovered=false;syncFloat()});
listen(topButton,'focus',()=>{hovered=true;syncFloat()});
listen(topButton,'blur',()=>{hovered=false;syncFloat()});
listen(document,'visibilitychange',syncFloat);listen(reduced,'change',syncFloat);
const footerObserver=new IntersectionObserver(entries=>topButton.classList.toggle('is-at-footer',entries[0].isIntersecting),{threshold:0});
footerObserver.observe(document.getElementById('contact'));
const readyObserver=new MutationObserver(syncFloat);readyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
const resizeObserver=new ResizeObserver(observeHero);resizeObserver.observe(header);observeHero();
function openLink(event){
 event.preventDefault();pending=event.currentTarget;previousFocus=pending;savedScroll=scrollY;
 const missing=pending.hasAttribute('data-unavailable'),label=pending.dataset.pcAction;
 dialog.querySelector('#pc-confirm-label').textContent=label.toUpperCase();
 dialog.querySelector('#pc-confirm-title').textContent=missing?'연결 준비 중입니다':'해당 페이지로 이동하시겠습니까?';
 dialog.querySelector('#pc-confirm-note').textContent=missing?`${label==='Resume'?'이력서 PDF':'Figma 포트폴리오'}의 실제 주소가 아직 연결되지 않았습니다.`:label==='Email'?'bds040305@gmail.com으로 이메일 앱을 엽니다.':label==='Resume'?'이력서 PDF를 새 탭에서 엽니다.':`${label} 페이지를 새 탭에서 엽니다.`;
 yes.disabled=missing;document.body.classList.add('pc-modal-open');dialog.showModal();no.focus({preventScroll:true});syncFloat();
}
function closeLink(){if(dialog.open)dialog.close();}
controls.forEach(control=>listen(control,'click',openLink));
listen(no,'click',closeLink);
listen(yes,'click',()=>{
 if(!pending||pending.hasAttribute('data-unavailable'))return;
 const url=pending.href;
 if(url.startsWith('mailto:'))location.href=url;
 else window.open(url,'_blank','noopener,noreferrer');
 closeLink();
});
listen(dialog,'click',event=>{
 const rect=dialog.getBoundingClientRect();
 if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))closeLink();
});
listen(dialog,'close',()=>{
 document.body.classList.remove('pc-modal-open');pending=null;
 previousFocus?.focus({preventScroll:true});
 if(Math.abs(scrollY-savedScroll)>1)window.scrollTo({top:savedScroll,behavior:'instant'});
 syncFloat();
});
function toggleDescription(card){
 const open=!card.classList.contains('pc-description-open');
 document.querySelectorAll('.pc-description-open').forEach(other=>{if(other!==card){other.classList.remove('pc-description-open');other.querySelector('.project-info-toggle')?.setAttribute('aria-expanded','false')}});
 card.classList.toggle('pc-description-open',open);
 const button=card.querySelector('.project-info-toggle');button.setAttribute('aria-expanded',String(open));button.textContent=open?'설명 닫기':'설명 보기';
 fitDescriptions();
}
function fitDescriptions(){
 document.querySelectorAll('#works .v-project-card').forEach(card=>{
  card.classList.remove('pc-description-scroll');const overlay=card.querySelector('.project-tile-overlay');
  if(overlay&&overlay.scrollHeight>overlay.clientHeight+1)card.classList.add('pc-description-scroll');
 });
}
listen(document,'pointerdown',event=>{
 if(!event.target.closest('.v-project-card'))document.querySelectorAll('.pc-description-open').forEach(card=>{card.classList.remove('pc-description-open');const b=card.querySelector('.project-info-toggle');b?.setAttribute('aria-expanded','false');if(b)b.textContent='설명 보기'});
});
listen(document,'keydown',event=>{
 if(event.key==='Escape')document.querySelectorAll('.pc-description-open').forEach(card=>{card.classList.remove('pc-description-open');const b=card.querySelector('.project-info-toggle');b?.setAttribute('aria-expanded','false');if(b)b.textContent='설명 보기'});
});
// A keyboard user can scroll a long description while Enter on the card still opens its detail page.
listen(document,'keydown',event=>{
 const card=event.target.closest?.('.v-project-card');if(!card||event.target!==card)return;
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){const panel=card.querySelector('.project-tile-overlay');if(panel.scrollHeight>panel.clientHeight){event.preventDefault();panel.scrollTop+=event.key==='ArrowDown'?48:-48;}}
});
const cardsObserver=new ResizeObserver(fitDescriptions);document.querySelectorAll('#works .v-project-card').forEach(card=>cardsObserver.observe(card));
document.fonts.ready.then(fitDescriptions);
window.portfolioChrome={toggleDescription,get state(){return{outsideHero:outside,floating:!!floating&&!floating.paused(),dialog:dialog.open}},destroy(){life.abort();readyObserver.disconnect();resizeObserver.disconnect();footerObserver.disconnect();heroObserver?.disconnect();cardsObserver.disconnect();floating?.kill()}};
})();
