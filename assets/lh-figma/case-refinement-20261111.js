/* LH case study 7-point enhancement: no hero or family-signature changes. */
(()=>{
'use strict';
const root=document.getElementById('view-lh');
if(!root||window.__lhCaseRevision20261111)return;
const section=id=>root.querySelector('.figma-section[data-frame-id="'+id+'"]');
const node=(scope,id)=>scope?.querySelector('[data-node-id="'+id+'"]');
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const problem=section('124:16295');
if(problem){
 ['124:16303','124:16305','124:16307','124:16309','124:16311','124:16313'].forEach((id,i)=>{
  const el=node(problem,id);if(!el)return;
  el.style.setProperty('--lh-card-speed',(6.1+i*.57)+'s');
  el.style.setProperty('--lh-card-delay',(-i*1.13)+'s');
 });
 // Each illustration and its corresponding label enter together, at offset times.
 const groups=[
 ['124:16321','124:16320','124:16322'],
 ['124:16316','124:16317','124:16318'],
 ['124:16326','124:16324','124:16325'],
 ['124:16330','124:16328','124:16329']
 ];
 const targets=groups.map(ids=>ids.map(id=>node(problem,id)).filter(Boolean));
 targets.flat().forEach(el=>el.classList.add('lh-case-reveal'));
 const enter=()=>{
  targets.forEach((group,i)=>group.forEach(el=>{
   el.style.transitionDelay=(i*.22)+'s';
   el.classList.add('lh-case-visible');
   el.style.setProperty('--lh-illustration-delay',(-i*1.55)+'s');
  }));
  // Begin the subtle secondary movement after the entrance has settled.
  if(!reduce.matches)window.setTimeout(()=>targets.forEach(group=>group.forEach(el=>{
   el.style.transitionDelay='0s';el.classList.add('lh-case-drift');
  })),1950);
 };
 if(reduce.matches)enter();
 else{
  const o=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){enter();o.disconnect();}},{threshold:.13,rootMargin:'0px 0px -10% 0px'});
  // Only animate as the lower problem illustration cluster approaches.
  o.observe(node(problem,'124:16321')||problem);
 }
}
// Convert the two preexisting persona lanes to true full-bleed without
// changing their card data or rebuilding the original sequence.
const persona=section('124:16332'),layer=persona?.querySelector('#lh-persona-carousel-layer');
if(persona&&layer){
 persona.appendChild(layer);
 const positionLanes=()=>{
  const scale=parseFloat(getComputedStyle(root).getPropertyValue('--lh-layout-scale'))||Math.min(1,document.documentElement.clientWidth/1920);
  layer.querySelectorAll('.lh-persona-lane').forEach(lane=>{
   lane.style.top=((lane.dataset.lane==='top'?327:525)*scale)+'px';
  });
 };
 positionLanes();window.addEventListener('resize',positionLanes,{passive:true});
}
// Group the existing style-guide cards in their original 1920px
// coordinate space, so card backgrounds, labels and controls float together.
const guide=section('124:16498');
if(guide){
 const plans=[
  {id:'124:16503',duration:9.2,delay:-1.1,extra:['124:16584']},
  {id:'124:16552',duration:10.8,delay:-3.3,extra:['124:16555','124:16560','124:16561','124:16562','124:16563']},
  {id:'124:16580',duration:9.7,delay:-4.6,extra:[]},
  {id:'124:16532',duration:11.1,delay:-2.5,extra:['124:16545','124:16550','124:16551']},
  {id:'124:16564',duration:10.4,delay:-6.2,extra:['124:16571','124:16586','124:16594','124:16598','124:16602']}
 ];
 plans.forEach(plan=>{
  const group=node(guide,plan.id);if(!group)return;
  plan.extra.forEach(id=>{const el=node(guide,id);if(el&&!group.contains(el))group.appendChild(el);});
  group.classList.add('lh-guide-card-float');
  group.style.setProperty('--lh-guide-duration',plan.duration+'s');
  group.style.setProperty('--lh-guide-delay',plan.delay+'s');
 });
 const toast=document.createElement('div');toast.className='lh-guide-toast';toast.setAttribute('aria-live','polite');
 const design=node(guide,'124:16498');design?.appendChild(toast);
 let toastTimeout=0;
 const show=label=>{
  toast.textContent=label;toast.classList.add('is-on');clearTimeout(toastTimeout);
  toastTimeout=window.setTimeout(()=>toast.classList.remove('is-on'),2400);
 };
 const act=(el,label,kind='momentary')=>{
  if(!el||el.dataset.lhGuideAction)return;
  el.dataset.lhGuideAction=kind;el.setAttribute('role','button');el.tabIndex=0;
  el.setAttribute('aria-label',label);
  if(kind==='toggle'||kind==='single')el.setAttribute('aria-pressed','false');
  const run=()=>{
   if(kind==='toggle'){
    const next=el.getAttribute('aria-pressed')!=='true';
    el.setAttribute('aria-pressed',String(next));el.classList.toggle('lh-guide-selected',next);
    show(label+(next?' 켜짐':' 꺼짐'));return;
   }
   if(kind==='single'){
    guide.querySelectorAll('[data-lh-guide-action="single"]').forEach(other=>{
     other.classList.remove('lh-guide-selected');other.setAttribute('aria-pressed','false');
    });
    el.classList.add('lh-guide-selected');el.setAttribute('aria-pressed','true');show(label+' 선택');return;
   }
   show(label);
  };
  el.addEventListener('click',e=>{if(e.target.closest('a[href]'))return;e.stopPropagation();run();});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();run();}});
 };
 [['1:2362','기본 버튼을 눌렀습니다'],['1:2364','보조 버튼을 눌렀습니다'],['1:2366','비활성 버튼 디자인 예시입니다']].forEach(([id,label])=>act(node(guide,id),label));
 const choices=node(guide,'124:16587');
 if(choices){
  [...choices.children].forEach((el,i)=>act(el,['전세임대','매입임대','분양'][i]||'임대 유형','single'));
 }
 ['1:2368','1:2370','1:2372'].forEach((id,i)=>act(node(guide,id),['안내','성공','주의'][i]+' 상태 표시'));
 act(node(guide,'124:16597'),'모름 자동 확인하기','toggle');
 act(node(guide,'124:16594'),'자동 확인 설정','toggle');
 act(node(guide,'124:16598'),'지역: 경기도');
 act(node(guide,'124:16572'),'맞춤 조건 설정');
 // Styleguide navigation controls are previews, not real page navigation.
 guide.querySelectorAll('[data-name*="→"]').forEach(el=>{
  if(el.closest('.lh-live-mockup')||el.dataset.lhGuideAction)return;
  if(el.getBoundingClientRect().width>100) return;
  act(el,(el.dataset.name||'메뉴')+' 선택');
 });
}
// Remove the permanent blue frame and keep hover lift independent per phone.
const publishing=section('124:16915'),strip=publishing?.querySelector('#lhStrip');
if(strip){
 const phones=[...strip.querySelectorAll('[data-name]')].filter(el=>/^\d{2}\s*·/.test(el.dataset.name||'') && el.closest('#lhStrip')===strip);
 phones.forEach(phone=>{phone.classList.add('lh-publish-phone');phone.style.borderColor='transparent';phone.style.outline='none';});
 const links=[...strip.querySelectorAll('a.lh-strip-item')];
 links.forEach((link,i)=>{
  const phone=phones[i];if(!phone)return;
  const on=()=>phone.classList.add('lh-publish-hover');
  const off=()=>phone.classList.remove('lh-publish-hover');
  link.addEventListener('pointerenter',on);link.addEventListener('pointerleave',off);
  link.addEventListener('focus',on);link.addEventListener('blur',off);
 });
}
window.__lhCaseRevision20261111={problemCards:6,revealCount:12,personaFullBleed:!!layer,styleGuide:!!guide,publishingCards:strip?.querySelectorAll('.lh-publish-phone').length||0};
})();