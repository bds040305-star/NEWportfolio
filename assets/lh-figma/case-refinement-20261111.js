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
  el.style.setProperty('--lh-card-speed',(5.6+i*.62)+'s');
  el.style.setProperty('--lh-card-delay',(-i*1.41)+'s');
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
  targets.forEach((group,i)=>{
   window.setTimeout(()=>{
    group.forEach((el,j)=>{
     el.style.transitionDelay=(j*.10)+'s';
     el.classList.add('lh-case-visible');
     el.style.setProperty('--lh-illustration-delay',(-i*1.7-j*.45)+'s');
    });
    // Let the illustration land before beginning its independent slow floating.
    if(!reduce.matches)window.setTimeout(()=>group.forEach(el=>{
     el.style.transitionDelay='0s';el.classList.add('lh-case-drift');
    }),1550);
   },reduce.matches?0:i*520);
  });
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

 // The component showcase demonstrates real selected/pressed/toggled states.
 // No temporary explanation text appears under the buttons.
 const register=(el,label,mode='momentary',groupName='')=>{
  if(!el || el.dataset.lhGuideAction)return;
  el.dataset.lhGuideAction=mode;
  if(groupName)el.dataset.lhGuideGroup=groupName;
  if(el.tagName!=='BUTTON'){el.setAttribute('role',mode==='radio'?'radio':'button');el.tabIndex=0;}
  el.setAttribute('aria-label',label);
  if(mode==='radio')el.setAttribute('aria-checked','false');
  else if(mode==='toggle')el.setAttribute('aria-pressed','false');
  const run=()=>{
   if(mode==='radio'){
    guide.querySelectorAll('[data-lh-guide-group="'+groupName+'"]').forEach(other=>{
     other.classList.remove('lh-guide-selected');
     other.setAttribute('aria-checked','false');
    });
    el.classList.add('lh-guide-selected');el.setAttribute('aria-checked','true');
   }else if(mode==='toggle'){
    const value=el.getAttribute('aria-pressed')!=='true';
    el.setAttribute('aria-pressed',String(value));el.classList.toggle('lh-guide-selected',value);
   }else{
    el.classList.add('lh-guide-tapped');
    window.setTimeout(()=>el.classList.remove('lh-guide-tapped'),550);
   }
  };
  el.addEventListener('click',event=>{
   if(event.target.closest('a[href]'))return;
   event.stopPropagation();run();
  });
  if(el.tagName!=='BUTTON')el.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();run();}
  });
 };
 // Three button states: every one gives tangible press feedback without text.
 [['1:2362','기본 버튼'],['1:2364','보조 버튼'],['1:2366','비활성 디자인 버튼 체험']].forEach(([id,label])=>register(node(guide,id),label));
 // Horizontal rental type options are mutually exclusive.
 const choices=node(guide,'124:16587');
 if(choices)[...choices.children].forEach((el,i)=>{
  register(el,['전세임대','매입임대','분양'][i]||'임대 유형','radio','rental-type');
 });
 // Status badges, location and settings are clickable, not static mock buttons.
 ['1:2368','1:2370','1:2372'].forEach((id,i)=>
  register(node(guide,id),['안내','성공','주의'][i]+' 상태','toggle'));
 register(node(guide,'124:16597'),'모름 자동 확인하기','toggle');
 register(node(guide,'124:16598'),'경기도 지역 선택','toggle');
 register(node(guide,'124:16572'),'맞춤 조건 설정','toggle');
 // The style guide's navigation icons use the same single-choice visual pattern.
 const nav=guide.querySelectorAll('[data-name*="→"]');
 nav.forEach(el=>{
  if(el.closest('a[href]')||el.dataset.lhGuideAction)return;
  if(el.getBoundingClientRect().width>110)return;
  register(el,(el.dataset.name||'메뉴')+' 탭','radio','bottom-navigation');
 });
 // Radius samples are live: clicking changes the real primary button's corner radius.
 const primary=node(guide,'1:2362');
 [['124:16535',2],['124:16537',4],['124:16539',6],['124:16541',10],['124:16543',12]].forEach(([id,radius])=>{
  const el=node(guide,id);
  register(el,'반경 '+radius+'픽셀','radio','radius');
  el?.addEventListener('click',()=>{if(primary)primary.style.borderRadius=radius+'px';});
 });
 // Colour chips are selectable states too; no explanatory overlay.
 [['124:16556','#0056b3'],['124:16557','#edf4fc'],['124:16558','#79c000'],['124:16559','#edf6e8']].forEach(([id,color])=>{
  register(node(guide,id),'컬러 샘플 '+color,'radio','guide-color');
 });
 // The sample checkbox is a genuine toggle.
 guide.querySelectorAll('[data-name="Checkbox"]').forEach(el=>
  register(el,'체크박스 선택','toggle'));

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