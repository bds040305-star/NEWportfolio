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

 // The style guide is a live miniature of the real LH controls, not an outline selector.
 // Individual state changes affect the original icon/text/switch/checkbox pixels.
 const register=(element,label,role,handler)=>{
   if(!element||element.dataset.lhGuideAction)return null;
   element.dataset.lhGuideAction=role||'button';
   element.setAttribute('aria-label',label);
   if(element.tagName!=='BUTTON')element.tabIndex=0;
   if(role)element.setAttribute('role',role);
   const invoke=event=>{event?.stopPropagation();handler?.(element);};
   element.addEventListener('click',invoke);
   if(element.tagName!=='BUTTON')element.addEventListener('keydown',event=>{
     if(event.key==='Enter'||event.key===' '){event.preventDefault();invoke(event);}
   });
   return element;
 };
 function pressed(element){
   element.classList.remove('lh-guide-demo-pressed');
   void element.offsetWidth;
   element.classList.add('lh-guide-demo-pressed');
   window.setTimeout(()=>element.classList.remove('lh-guide-demo-pressed'),260);
 }
 // Buttons respond with the actual press animation, without any toast.
 [['1:2362','기본 버튼'],['1:2364','보조 버튼'],['1:2366','비활성 버튼 예시']].forEach(([id,label])=>{
   register(node(guide,id),label,'button',pressed);
 });
 // Segment control — a single selected type (matches the LH mobile app).
 const choiceGroup=node(guide,'124:16587');
 if(choiceGroup){
   choiceGroup.setAttribute('role','radiogroup');
   choiceGroup.setAttribute('aria-label','임대 유형');
   const options=[...choiceGroup.children];
   const choose=index=>options.forEach((option,i)=>{
     const current=i===index;
     option.classList.toggle('is-active',current);
     option.setAttribute('aria-checked',String(current));
   });
   options.forEach((option,i)=>{
     option.classList.add('lh-demo-choice');
     option.setAttribute('aria-checked',String(i===1));
     register(option,['전세임대','매입임대','분양'][i]||'주택 유형','radio',()=>choose(i));
   });
   choose(1);
 }
 // Navigation — change text AND icon colour only for the selected destination.
 const navGroup=node(guide,'1:2338');
 if(navGroup){
   navGroup.setAttribute('role','tablist');
   navGroup.setAttribute('aria-label','청약플러스 하단 메뉴 미리보기');
   const tabs=[...navGroup.children];
   function activate(index){
     tabs.forEach((tab,i)=>{
       const active=i===index;
       tab.classList.toggle('is-active',active);
       tab.setAttribute('aria-selected',String(active));
       tab.tabIndex=active?0:-1;
     });
   }
   tabs.forEach((tab,i)=>{
     tab.classList.add('lh-demo-nav');
     register(tab,['홈','맞춤공고','내 일정','부동산맵','MY'][i]+' 탭','tab',()=>activate(i));
     tab.addEventListener('keydown',event=>{
       if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
       event.preventDefault();
       const next=(i+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;
       activate(next);tabs[next].focus({preventScroll:true});
     });
   });
   activate(0);
 }
 // A filled box empties when clicked; an empty one fills with a white tick.
 [['124:16567',false],['124:16568',true]].forEach(([id,initial])=>{
   const checkbox=node(guide,id);
   if(!checkbox)return;
   checkbox.classList.add('lh-demo-checkbox');
   checkbox.setAttribute('aria-checked',String(initial));
   checkbox.classList.toggle('is-checked',initial);
   register(checkbox,'청약 체크박스','checkbox',el=>{
     const next=el.getAttribute('aria-checked')!=='true';
     el.setAttribute('aria-checked',String(next));
     el.classList.toggle('is-checked',next);
   });
 });
 // Switch — use its original footprint with a moving thumb and blue active track.
 const toggle=node(guide,'124:16597');
 if(toggle){
   toggle.classList.add('lh-demo-switch');
   toggle.setAttribute('aria-checked','false');
   register(toggle,'모름 자동 확인하기','switch',el=>{
     el.setAttribute('aria-checked',String(el.getAttribute('aria-checked')!=='true'));
   });
   const track=node(guide,'124:16594');
   if(track)track.addEventListener('click',event=>{
     if(!event.target.closest('[data-node-id="124:16597"]'))toggle.click();
   });
 }
 // A selected location actually changes the visible label.
 const location=node(guide,'1:2334'),locationText=node(guide,'1:2335');
 if(location&&locationText){
   const values=['경기도 · 수원시','경기도 · 하남시','서울특별시 · 강동구'];
   let current=0;
   register(location,'지역 선택','button',el=>{
     current=(current+1)%values.length;
     locationText.textContent=values[current];
     pressed(el);
   });
 }
 // Badges / input / mini tiles use subtle tactile feedback, never a blue focus box on click.
 ['1:2368','1:2370','1:2372','124:16598','124:16572'].forEach(id=>{
   const el=node(guide,id);
   if(el)register(el,el.dataset.name||'컴포넌트','button',pressed);
 });
 // Live border-radius tokens modify the visible primary button.
 const primary=node(guide,'1:2362');
 [['124:16535',2],['124:16537',4],['124:16539',6],['124:16541',10],['124:16543',12]].forEach(([id,radius])=>{
   register(node(guide,id),'모서리 반경 '+radius+'px','button',el=>{
     if(primary)primary.style.borderRadius=radius+'px';
     pressed(el);
   });
 });
 // Swatches sample the system colours on the button (not an outside outline).
 [['124:16556','#0056b3'],['124:16557','#edf4fc'],['124:16558','#79c000'],['124:16559','#edf6e8']].forEach(([id,color])=>{
   const el=node(guide,id);if(!el)return;
   el.classList.add('lh-guide-swatch');
   register(el,'색상 '+color+' 사용','button',item=>{
     if(primary){
       primary.style.backgroundColor=color;
       const label=primary.querySelector('p');if(label)label.style.color=color==='#edf4fc'||color==='#edf6e8'?'#171717':'#fff';
     }
     pressed(item);
   });
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