(()=>{'use strict';
if(window.__wellsDetail)return;window.__wellsDetail=true;
const page=document.getElementById('wf-page'),abort=new AbortController(),signal=abort.signal;
const node=id=>page.querySelector('[data-node-id="'+id+'"]');
function fit(){page.style.zoom=Math.min(1,innerWidth/1920);window.ScrollTrigger?.refresh();}fit();window.addEventListener('resize',fit,{signal});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,design=new URLSearchParams(location.search).has('design');
const liveBase='https://bds040305-star.github.io/wells/';let currentLive=null;
const on=(el,event,fn)=>el?.addEventListener(event,fn,{signal});
function action(el,label,fn){if(!el)return;el.classList.add('wf-action');if(el.tagName!=='BUTTON'&&el.tagName!=='A'){el.setAttribute('role','button');el.tabIndex=0;on(el,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e)}});}el.setAttribute('aria-label',label);on(el,'click',fn);}
function back(){if(parent!==window)parent.postMessage({type:'wells-case-close'},location.origin);else location.href='index.html#works';}
action(node('113:11848'),'전체 프로젝트로 돌아가기',back);action(node('113:8859'),'전체 프로젝트로 돌아가기',back);
action(node('113:11829'),'웰스팜 라이브 사이트 새 창으로 열기',()=>window.open(liveBase,'_blank','noopener'));
action(node('113:11835'),'웰스팜 GitHub 새 창으로 열기',()=>window.open('https://github.com/bds040305-star/wells','_blank','noopener'));
for(const id of ['113:8876','113:9299'])action(node(id),'웰스팜 기존 퍼블리싱 사이트 새 창으로 열기',()=>window.open(liveBase,'_blank','noopener'));
action(node('113:11851'),'다음 프로젝트 Apple TV',()=>{location.href='apple-detail.html?v=20261106-1'});
const slots=[];
function live(id,route,label){const host=node(id);if(!host)return;const layer=document.createElement('div');layer.className='wf-live';layer.dataset.route=route;const button=document.createElement('button');button.type='button';button.className='wf-launch';button.textContent='직접 체험';button.setAttribute('aria-label',label+' 직접 체험');layer.append(button);host.append(layer);
const item={host,layer,button,route,label,frame:null,timer:0,close(){clearTimeout(this.timer);this.frame?.remove();this.frame=null;layer.querySelector('.wf-fallback')?.remove();layer.classList.remove('is-active');button.textContent='직접 체험';button.setAttribute('aria-label',label+' 직접 체험');if(currentLive===item)currentLive=null;},open(){currentLive?.close();currentLive=item;layer.classList.add('is-active');button.textContent='체험 닫기';button.setAttribute('aria-label',label+' 체험 닫기');const frame=document.createElement('iframe');frame.title=label+' — 기존 퍼블리싱 사이트';frame.setAttribute('allow','fullscreen');frame.referrerPolicy='strict-origin-when-cross-origin';const w=host.clientWidth,h=host.clientHeight,scale=w/390;frame.style.height=h/scale+'px';frame.style.transform='scale('+scale+')';frame.src=liveBase+'#'+route;frame.addEventListener('load',()=>{clearTimeout(item.timer);layer.dataset.loaded='true';},{once:true});frame.addEventListener('error',failed,{once:true});item.frame=frame;layer.prepend(frame);item.timer=setTimeout(failed,20000);function failed(){if(!item.frame)return;item.frame.remove();const notice=document.createElement('div');notice.className='wf-fallback';notice.textContent='목업 내부 연결을 확인할 수 없습니다.';const link=document.createElement('a');link.href=liveBase+'#'+route;link.target='_blank';link.rel='noopener';link.textContent='사이트 직접 체험하기 ↗';notice.append(link);layer.append(notice);}}};on(button,'click',e=>{e.stopPropagation();item.frame?item.close():item.open()});slots.push(item);return item;}
// Only published screens are embedded. Daily care, diary, My Page and photo-record
// screens remain the native Figma prototypes below; their unpublished routes are not invented.
const structure=live('113:9316','/structure','제품 구조'),control=live('113:9579','/control?tab=temperature','스마트 제어'),login=live('113:10166','/login','로그인'),chat=live('113:10455','/chat','팜이 상담');
const scrollToNode=id=>node(id)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
for(const section of page.querySelectorAll('.wf-section')){const s=getComputedStyle(section.firstElementChild);section.style.setProperty('--wf-edge-background',s.backgroundImage==='none'?s.backgroundColor:s.backgroundImage);}
function pressed(el){if(!el)return;el.classList.add('wf-pressed');el.setAttribute('aria-pressed','true');setTimeout(()=>{el.classList.remove('wf-pressed');el.setAttribute('aria-pressed','false')},650);}
for(const id of ['113:11762','113:11763','113:11764'])action(node(id),node(id)?.textContent.trim()||'버튼 체험',()=>pressed(node(id)));
action(node('113:11765'),'가상 재배 화면 체험',()=>scrollToNode('113:10685'));
action(node('113:11767'),'제품 구조 보기',()=>{scrollToNode('113:9300');structure?.open()});
for(const id of ['113:11769','113:11771','113:11773'])action(node(id),node(id)?.textContent.trim()+' 색상 선택',()=>{for(const n of ['113:11769','113:11771','113:11773']){node(n)?.classList.toggle('wf-pressed',n===id);node(n)?.setAttribute('aria-pressed',String(n===id));}});
// Preserve the authored sample swatches. Clicking copies their actual color token.
for(const el of page.querySelectorAll('[data-node-id]')){if(el.childElementCount===0&&/^#[0-9A-F]{6}$/i.test(el.textContent.trim()))action(el,el.textContent.trim()+' 색상 복사',()=>{navigator.clipboard?.writeText(el.textContent.trim()).then(()=>pressed(el)).catch(()=>{});});}
for(const el of page.querySelectorAll('button'))if(!el.hasAttribute('type'))el.type='button';
function editable(id,kind,label,max){const host=node(id);if(!host)return;const old=host.firstElementChild;if(!old)return;const input=document.createElement(kind==='textarea'?'textarea':'input');if(kind!=='textarea')input.type=kind;input.setAttribute('aria-label',label);if(max)input.maxLength=max;input.value=old.textContent.trim();input.className='wf-input';input.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;color:inherit;padding:12px;font:inherit;resize:none;outline-offset:-3px';input.style.font=getComputedStyle(old).font;input.style.color=getComputedStyle(old).color;old.style.visibility='hidden';host.append(input);return input;}
// Native local prototype: photo and diary input is kept in this page only.
const diary=editable('113:10752','textarea','성장 일지 한 줄 일기',200);
const photoName=editable('113:13940','text','채소 이름',40),record=editable('113:13944','textarea','나의 한 줄 기록',200);
const recordAfter=editable('113:13969','textarea','첨부 후 나의 한 줄 기록',200);
on(record,'input',()=>{const c=node('113:13946');if(c)c.textContent=record.value.length+' / 200';});
if(record){record.placeholder=record.value;record.value='';}
const file=document.createElement('input');file.type='file';file.accept='image/*';file.hidden=true;file.setAttribute('aria-label','직접 키운 채소 사진 선택');page.append(file);let photoURL='';
action(node('113:13934'),'직접 키운 채소 사진 추가',()=>file.click());
on(file,'change',()=>{if(!file.files?.[0])return;if(photoURL)URL.revokeObjectURL(photoURL);photoURL=URL.createObjectURL(file.files[0]);const img=node('113:13961')?.querySelector('img');if(img)img.src=photoURL;const caption=node('113:13962');if(caption)caption.textContent=file.files[0].name+' · 교체';scrollToNode('113:13951');});
action(node('113:13960'),'첨부 사진 교체',()=>file.click());
for(const id of ['113:13947','113:13972'])action(node(id),'재배 기록 저장 체험',()=>{if(recordAfter&&record)recordAfter.value=record.value;const a=node('113:13948'),b=node('113:13973');if(a)a.textContent='재배 기록 저장 완료';if(b)b.textContent='재배 기록 저장 완료';setTimeout(()=>{if(a)a.textContent='재배 기록 저장';if(b)b.textContent='재배 기록 저장'},1600);});
for(const id of ['113:13949','113:13974'])action(node(id),'재배 기록 내용 복사',()=>{navigator.clipboard?.writeText((photoName?.value||'')+'\n'+(record?.value||'')).then(()=>pressed(node(id))).catch(()=>{});});
// Step controls authored in the growth diary switch the selected original date.
const dates=['113:10732','113:10734','113:10736','113:10738','113:10740'].map(node).filter(Boolean);for(const [i,el] of dates.entries())action(el,(i+1)+'일차 성장 기록',()=>{for(const x of dates){x.classList.toggle('wf-pressed',x===el);x.setAttribute('aria-pressed',String(x===el));}const title=node('113:10743');if(title)title.textContent='재배 '+(i+1)+'일차 · 새싹이 보여요';});
on(diary,'input',()=>{const c=node('113:10754');if(c)c.textContent=diary.value.length+' / 200';});
action(node('113:10755'),'오늘의 일기 저장',()=>{const text=node('113:10756');if(text){text.textContent='오늘의 일기 저장 완료';setTimeout(()=>text.textContent='오늘의 일기 저장',1400)}});
action(node('113:10448'),'스마트 제어 직접 체험',()=>{scrollToNode('113:9300');control?.open()});
for(const [id,tab,label] of [['113:9632','power','전원'],['113:9635','mode','모드'],['113:9638','light','조명'],['113:9641','lock','잠금'],['113:9646','timer','예약']])action(node(id),label+' 스마트 제어 체험',()=>{if(control){control.route='/control?tab='+tab;control.open();}});
for(const [id,check,label] of [['113:10762','113:10765','빛 상태 확인'],['113:10767','113:10770','물 상태 확인']]){const e=node(id);if(e){e.setAttribute('aria-checked','true');action(e,label,()=>{const checked=e.getAttribute('aria-checked')!=='true';e.setAttribute('aria-checked',String(checked));const mark=node(check);if(mark)mark.style.opacity=checked?'1':'0';});e.setAttribute('role','checkbox');}}
action(node('113:10722'),'오늘의 관리 완료',()=>{const e=node('113:10723');if(e){e.textContent='오늘의 관리 완료 ✓';setTimeout(()=>e.textContent='오늘의 관리 완료',1500)}});
for(const [id,dest,label] of [['113:10373','113:13916','재배 기록'],['113:10376','113:11550','수확 도감'],['113:10370','113:9300','내 기기 관리']])action(node(id),label+' 확인',()=>scrollToNode(dest));
action(node('113:10109'),'기존 사이트 회원가입 안내 열기',()=>window.open(liveBase+'#/signup','_blank','noopener'));
action(node('113:10210'),'기존 사이트 비밀번호 안내 열기',()=>window.open(liveBase+'#/reset-password','_blank','noopener'));
// The source drawing is one PNG, not separated CAD parts. These presentation masks
// move portions of that exact image, then restore the complete unmasked Figma layer.
const product=node('113:9569'),productImage=product?.querySelector('img');let productTimeline=null,productState=null;
if(product&&productImage){product.classList.add('wf-product-shell');const parts=[
 {name:'조작부',clip:'polygon(0 0,100% 0,100% 22%,0 22%)',x:0,y:19},
 {name:'본체',clip:'polygon(0 22%,100% 22%,100% 68%,0 68%)',x:0,y:0},
 {name:'재배 트레이',clip:'polygon(0 68%,100% 68%,100% 100%,0 100%)',x:0,y:-18}
].map(data=>{const el=document.createElement('div');el.className='wf-product-part';el.style.clipPath=data.clip;el.hidden=true;el.append(productImage.cloneNode());product.append(el);return {...data,el}});
const controls=document.createElement('div');controls.className='wf-product-control';const state=document.createElement('output');state.textContent='구조 보기';const range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.value='0';range.setAttribute('aria-label','제품 분해 조립 진행');const play=document.createElement('button');play.textContent='재생';play.type='button';play.setAttribute('aria-label','제품 분해 후 조립 재생');controls.append(state,range,play);product.append(controls);
function show(progress){const cycle=progress<=.5?progress*2:(1-progress)*2;const amount=1-cycle;product.dataset.productProgress=progress.toFixed(3);state.textContent=progress<.12?'조립':progress<.5?'분해':progress<.9?'조립':'구조 보기';range.value=String(Math.round(progress*100));const active=progress>.001&&progress<.999;productImage.style.opacity=active?'0':'';for(const part of parts){part.el.hidden=!active;part.el.style.transform=active?'translate('+part.x*amount+'px,'+part.y*amount+'px)':'none';}}
productState={progress:1};if(window.gsap&&!design&&!reduced){productTimeline=gsap.timeline({paused:true,onUpdate:()=>show(productState.progress)}).fromTo(productState,{progress:0},{progress:1,duration:3.8,ease:'none'});productTimeline.progress(1);on(play,'click',()=>productTimeline.restart());on(range,'input',()=>{productTimeline.pause();productState.progress=Number(range.value)/100;show(productState.progress)});}else{on(play,'click',()=>{show(1)});on(range,'input',()=>show(Number(range.value)/100));}
window.__wellsProduct={parts,show,state:productState,timeline:productTimeline};}
let ctx=null,pinMedia=null;
if(!design&&!reduced&&window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);ctx=gsap.context(()=>{
 const titles=['113:8937','113:8993','113:9050','113:9184','113:9286','113:9302','113:11626','113:10690','113:10701','113:13918','113:10165','113:10340','113:10415','113:11827'];
 for(const id of titles){const e=node(id);if(!e)continue;gsap.fromTo(e,{clipPath:'inset(0 0 100% 0)',y:24},{clipPath:'inset(0 0 0% 0)',y:0,duration:.85,ease:'power3.out',clearProps:'clipPath,transform',scrollTrigger:{trigger:e,start:'top 94%',once:true}});}
 for(const id of ['113:9052','113:9084','113:9143','113:9149','113:9157','113:9285','113:10106','113:10158','113:10161']){const e=node(id);if(!e)continue;gsap.from(e,{opacity:0,y:38,duration:.75,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:e,start:'top 94%',once:true}});}
 for(const id of ['113:9090','113:11792','113:11796','113:9304','113:9655','113:10777','113:13976','113:10451']){const e=node(id);if(!e)continue;e.classList.add('wf-pami');gsap.from(e,{y:22,rotation:-3,opacity:.35,duration:1,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:e,start:'top 96%',once:true}});on(e,'pointerenter',()=>gsap.to(e,{rotation:2,y:-6,duration:.3}));on(e,'pointerleave',()=>gsap.to(e,{rotation:0,y:0,duration:.45,clearProps:'transform'}));on(e,'pointermove',ev=>{const r=e.getBoundingClientRect();gsap.to(e,{rotation:(ev.clientX-r.left-r.width/2)/r.width*4,duration:.35,overwrite:'auto'})});}
 for(const id of ['113:9316','113:9579','113:10703','113:10726','113:10348','113:10455']){const e=node(id);if(e)gsap.from(e,{y:35,opacity:.5,duration:.9,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:e,start:'top 98%',once:true}});}
 const background=node('113:10341')?.querySelector('img');if(background)gsap.fromTo(background,{y:18},{y:0,ease:'none',scrollTrigger:{trigger:node('113:10338'),start:'top bottom',end:'bottom bottom',scrub:.5},onComplete:()=>gsap.set(background,{clearProps:'transform'})});
 if(productTimeline)ScrollTrigger.create({trigger:node('113:9300'),start:'top 75%',end:'bottom 25%',onUpdate:s=>{productTimeline.pause();productTimeline.progress(s.progress)}});
 const scene=node('113:9294');if(scene){pinMedia=gsap.matchMedia();pinMedia.add('(min-width:1200px)',()=>{ScrollTrigger.create({trigger:scene,start:'top top',end:'+=140',pin:true,pinSpacing:false,anticipatePin:1});});}
},page);}
for(const id of ['113:9052','113:9143','113:9149','113:9157']){const e=node(id);if(e)e.classList.add('wf-card');}
on(window,'keydown',e=>{if(e.key==='Escape')currentLive?.close()});
on(window,'pagehide',()=>{currentLive?.close();pinMedia?.revert();ctx?.revert();productTimeline?.kill();if(photoURL)URL.revokeObjectURL(photoURL);abort.abort();});
window.__wells={node,abort,slots,ctx,reduced,design};
})();
