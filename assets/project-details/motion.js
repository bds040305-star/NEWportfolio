/* Shared progressive enhancement for the three detail pages only. No main-page hooks. */
(()=>{'use strict';
if(window.__portfolioDetailMotion)return;
const gs=window.gsap,ST=window.ScrollTrigger;
if(!gs)return;
const q=new URLSearchParams(location.search);
const project=document.getElementById('view-lh')?'lh':document.getElementById('hae-page')?'haevichi':document.getElementById('wf-page')?'wells':null;
if(!project)return;
const root=document.getElementById({lh:'view-lh',haevichi:'hae-page',wells:'wf-page'}[project]);
const preference=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController();
const excluded=el=>!el||!!el.closest(project==='lh'?'[data-frame-id="124:17447"],[data-frame-id="124:16712"],#signatureDemo,#phoneB,.lh-inline-signature':'.wf-live,.hae-live,.hae-live-viewport,dialog');
const node=id=>root.querySelector('[data-node-id="'+id+'"]');
const config={
 lh:{amp:2.3,duration:7.6,reveal:14,hover:.009,marquee:[['124:17692',-1,4.2]],float:[],cards:['124:17691','124:17697','124:17705','124:16337','124:16365'],sequence:['124:16603','124:16388','124:16498']},
 haevichi:{amp:3.6,duration:12.4,reveal:18,hover:.012,marquee:[['113:8985',1,2.8]],float:['113:9293','113:9728','113:9782'],cards:['113:9728','113:9782'],sequence:[]},
 wells:{amp:3,duration:8.9,reveal:16,hover:.011,marquee:[['113:8996',-1,3.7]],float:['113:8876','113:9299','113:9312','113:9576'],cards:['113:9143','113:9149','113:9157'],sequence:['113:9052','113:9084','113:10760']}
}[project];
let dispose=()=>{},serial=0;
const api={project,enabled:false,items:[],triggers:[],counts:{},generation:0,destroy(){dispose();abort.abort();window.removeEventListener('pagehide',api.destroy);},pause(){for(const item of api.items)item.tween.pause();},resume(){for(const item of api.items)if(item.inView&&!item.hover&&!document.hidden)item.tween.resume();}};
window.__portfolioDetailMotion=api;
function enable(){
 dispose();api.items=[];api.triggers=[];api.counts={float:0,marquee:0,reveal:0,parallax:0,hover:0,zoom:0};api.enabled=false;
 if(preference.matches||q.has('detail-motion')&&q.get('detail-motion')==='off'||q.has('design')||q.has('haevichi-design'))return;
 api.enabled=true;api.generation=++serial;
 const cleanup=[],prepared=new Set(),floating=new Set(),transient=new Set(),events=new AbortController();let active=true;
 const listen=(el,type,fn)=>el?.addEventListener(type,fn,{signal:events.signal});
 const save=el=>{const original=new Map([...el.style].filter(k=>k.startsWith('--pm-')).map(k=>[k,el.style.getPropertyValue(k)]));const flags=['pm-motion','pm-marquee','pm-hover-surface','pm-decoration','pm-cta'].filter(k=>el.classList.contains(k));cleanup.push(()=>{for(const k of [...el.style])if(k.startsWith('--pm-'))el.style.removeProperty(k);for(const [k,v]of original)el.style.setProperty(k,v);for(const k of ['pm-motion','pm-marquee','pm-hover-surface','pm-decoration','pm-cta'])if(!flags.includes(k))el.classList.remove(k);});};
 const to=(target,vars)=>{let t;t=gs.to(target,{...vars,onComplete:()=>transient.delete(t),onInterrupt:()=>transient.delete(t)});transient.add(t);return t;};
 function prepare(el){if(excluded(el))return false;if(prepared.has(el))return true;const s=getComputedStyle(el);if(s.display==='contents'||s.display==='none')return false;
  // Individual transforms compose with each page's existing GSAP transform.
  const t=s.translate==='none'?['0px','0px']:s.translate.split(/\s+/),r=s.rotate==='none'?'0deg':s.rotate,scale=s.scale==='none'?'1':s.scale;
  if(t.length>2||!/^-?[\d.]+(?:deg|rad|turn)$/.test(r)||!/^[\d.]+$/.test(scale))return false;
  save(el);el.style.setProperty('--pm-base-x',t[0]||'0px');el.style.setProperty('--pm-base-y',t[1]||'0px');el.style.setProperty('--pm-base-angle',r);el.style.setProperty('--pm-base-scale',scale);el.classList.add('pm-motion');prepared.add(el);return true;
 }
 const observed=new Map();
 const observer=new IntersectionObserver(entries=>{for(const e of entries)for(const item of observed.get(e.target)||[]){item.inView=e.isIntersecting;if(item.inView&&!document.hidden&&!item.hover)item.tween.resume();else item.tween.pause();}},{threshold:0,rootMargin:'24px'});
 function idle(target,tween,kind){const item={target,tween,kind,inView:false,hover:false};api.items.push(item);const list=observed.get(target)||[];list.push(item);observed.set(target,list);observer.observe(target);api.counts[kind]++;return item;}
 const ctx=gs.context(()=>{
  function float(elements,index,rotation=0){const targets=elements.filter(el=>!floating.has(el)&&prepare(el));if(!targets.length)return;targets.forEach(el=>floating.add(el));const a=config.amp*(.8+(index%3)*.13),duration=config.duration+index*1.17;
   gs.set(targets,{'--pm-float-y':'0px','--pm-float-angle':'0deg'});const angle=parseFloat(rotation)||0;
   const tween=gs.timeline({paused:true,repeat:-1}).to(targets,{'--pm-float-y':(-a)+'px','--pm-float-angle':angle+'deg',duration:duration*.5,ease:'sine.inOut'}).to(targets,{'--pm-float-y':(a*.35)+'px','--pm-float-angle':(-angle*.3)+'deg',duration:duration*.5,ease:'sine.inOut'}).to(targets,{'--pm-float-y':'0px','--pm-float-angle':'0deg',duration:duration*.4,ease:'sine.inOut'});
   const item=idle(targets[0],tween,'float');const hold=()=>{item.hover=targets.some(el=>el.matches(':hover,:focus-within'));if(item.hover)tween.pause();else if(item.inView&&!document.hidden)tween.resume();};
   for(const target of targets)for(const type of ['pointerenter','pointerleave','focusin','focusout'])listen(target,type,hold);
  }
  function topBoxes(el){if(!el||excluded(el))return[];const s=getComputedStyle(el);if(s.display==='contents')return [...el.children].flatMap(topBoxes);return [el];}
  const ids=config.float.map(node).filter(Boolean);
  if(project==='lh'){
   // Move each phone frame and its live screen together; never include signing phones.
   [['124:16611','124:16612'],['124:17626','124:17629'],['124:17754','124:17758']].forEach((pair,i)=>float(pair.map(node).filter(Boolean),i));
  }else ids.forEach((el,i)=>float(topBoxes(el),i,project==='wells'&&i===0?'.16deg':'0deg'));
  if(project==='wells'){
   ['113:11792','113:9090','113:9655','113:13976','113:10744'].forEach((id,i)=>{const img=node(id)?.querySelector('img');if(img)float([img],i+3,i===0?'.24deg':'0deg');});
  }
  if(project==='haevichi'){
   // Blurred background ellipses are paint only. Making a phone a transform
   // context must not put these transparent SVG bounds over its live controls.
   for(const id of ['113:9658','113:9815']){const decor=node(id)?.closest('.hae-layer');if(decor){save(decor);decor.classList.add('pm-decoration');}}
   const hero=node('113:8623'),s=hero&&getComputedStyle(hero);
   if(s?.backgroundImage.includes('url(')){const ocean=document.createElement('div');ocean.className='pm-ocean-backdrop';ocean.setAttribute('aria-hidden','true');ocean.style.backgroundImage=s.backgroundImage;hero.prepend(ocean);cleanup.push(()=>ocean.remove());
    const tween=gs.fromTo(ocean,{scale:1.006,y:-2},{scale:1.018,y:2,duration:29,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true});idle(ocean,tween,'zoom');
    if(ST){const t=gs.fromTo(ocean,{'--pm-scroll-y':'0px'},{'--pm-scroll-y':'5px',ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1.4}});prepare(ocean);api.triggers.push(t.scrollTrigger);api.counts.parallax++;}
   }
  }
  for(const [id,direction,speed] of config.marquee){const el=node(id);if(excluded(el)||!el||el.querySelector('[data-node-id],br')||!el.textContent.trim())continue;
   const original=[...el.childNodes],text=el.textContent.trim(),height=parseFloat(getComputedStyle(el).height)||el.offsetHeight,width=parseFloat(getComputedStyle(el).width)||el.offsetWidth;
   save(el);el.classList.add('pm-marquee');const oldHeight=el.style.height,oldWidth=el.style.width;el.style.width=width+'px';cleanup.push(()=>el.style.width=oldWidth);if(!oldHeight){el.style.height=height+'px';cleanup.push(()=>el.style.height=oldHeight);}
   const track=document.createElement('span');track.className='pm-marquee-track';const tile=document.createElement('span');tile.className='pm-marquee-tile';tile.textContent=text;track.append(tile);el.replaceChildren(track);
   const period=parseFloat(getComputedStyle(tile).width)||tile.offsetWidth;if(!period){el.replaceChildren(...original);continue;}const number=Math.min(8,Math.ceil(el.clientWidth/period)+2);
   for(let i=1;i<number;i++){const copy=tile.cloneNode(true);copy.setAttribute('aria-hidden','true');copy.inert=true;track.append(copy);}
   cleanup.push(()=>el.replaceChildren(...original));
   const tween=gs.fromTo(track,{x:direction>0?-period:0},{x:direction>0?0:-period,duration:period/speed,ease:'none',repeat:-1,paused:true});const item=idle(el,tween,'marquee');
   listen(el,'pointerenter',()=>{item.hover=true;tween.pause()});listen(el,'pointerleave',()=>{item.hover=false;if(item.inView&&!document.hidden)tween.resume()});
  }
  const reveal=(elements,trigger)=>{const targets=elements.filter(prepare);if(!targets.length||!ST)return;
   const tween=gs.fromTo(targets,{'--pm-reveal-y':config.reveal+'px'},{'--pm-reveal-y':'0px',duration:project==='haevichi'?1.25:.85,stagger:.11,ease:'power3.out',scrollTrigger:{trigger,start:'top 91%',once:true}});api.triggers.push(tween.scrollTrigger);api.counts.reveal+=targets.length;
  };
  // Existing page engines own title/image opacity and clipping. This layer only
  // sequences the selected card positions, avoiding a second opacity controller.
  const cards=config.cards.map(node).filter(Boolean);for(const card of cards)reveal([card],card);
  for(const id of config.sequence){const group=node(id)||root.querySelector('[data-frame-id="'+id+'"]');if(!group||excluded(group))continue;const design=group.matches('section')?group.firstElementChild:group;
   const backgrounds=new Set(['124:16419','124:16420','124:16499','124:16500','124:16501']);
   const targets=[...design.children].filter(el=>el.hasAttribute('data-node-id')&&!excluded(el)&&!backgrounds.has(el.dataset.nodeId)).slice(0,project==='lh'?12:5);reveal(targets,group);
  }
  if(project==='lh'){
   const flow=root.querySelector('[data-frame-id="124:16388"]');if(flow&&ST){const lines=[...flow.querySelectorAll('img[src$=".svg"]')].filter(el=>{const r=el.getBoundingClientRect();return !excluded(el)&&r.height<700&&r.width<1400&&getComputedStyle(el).clipPath==='none';}).sort((a,b)=>{const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return Math.abs(ar.top-br.top)>18?ar.top-br.top:ar.left-br.left;}).slice(0,32);
    const t=gs.fromTo(lines,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.8,stagger:.075,ease:'power2.out',clearProps:'clipPath',scrollTrigger:{trigger:flow,start:'top 75%',once:true}});api.triggers.push(t.scrollTrigger);api.counts.reveal+=lines.length;}
  }
  const parallaxIds=project==='haevichi'?['113:9045','113:10411']:project==='wells'?['113:11553','113:11627']:[];
  if(ST)for(const id of parallaxIds){const el=node(id)?.querySelector('img');if(!el||!prepare(el))continue;const t=gs.fromTo(el,{'--pm-scroll-y':'-5px'},{'--pm-scroll-y':'5px',ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:project==='haevichi'?1.4:.9}});api.triggers.push(t.scrollTrigger);api.counts.parallax++;}
  const hoverTargets=[...new Set(cards.concat(project==='haevichi'?['113:10411'].map(node):[]).filter(Boolean))];
  for(const el of hoverTargets){if(excluded(el)||!prepare(el))continue;const image=project==='haevichi'?null:el.querySelector('img'),label=[...el.querySelectorAll('p')].find(e=>!e.closest('[role=button],button'));if(image)prepare(image);if(label)prepare(label);el.classList.add('pm-hover-surface');
   const enter=()=>{to(el,{'--pm-hover-y':'-3px',duration:.55,ease:'power2.out',overwrite:'auto'});if(image)to(image,{'--pm-hover-scale':config.hover,duration:project==='haevichi'?1:.65,overwrite:'auto'});if(label)to(label,{'--pm-hover-y':'-1px',duration:.8,overwrite:'auto'});};
   const leave=()=>{to([el,image,label].filter(Boolean),{'--pm-hover-y':'0px','--pm-hover-scale':0,duration:.7,ease:'power2.out',overwrite:'auto'});};
   listen(el,'pointerenter',enter);listen(el,'pointerleave',leave);listen(el,'focusin',enter);listen(el,'focusout',leave);api.counts.hover++;
  }
  const buttons=[...root.querySelectorAll('a,button,[role=button]')].filter(el=>!excluded(el)&&!el.closest('.wf-live,.hae-live,.hae-live-viewport,.lh-live-screen,.lh-live-mockup')).slice(0,45);
  for(const el of buttons){const paint=getComputedStyle(el),r=el.getBoundingClientRect();if(r.width>0&&r.width<420&&r.height>0&&r.height<100&&paint.transitionDuration.split(',').every(t=>parseFloat(t)===0)){save(el);el.classList.add('pm-cta');}
   const arrow=[...el.querySelectorAll('img,[data-node-id],span')].find(n=>/arrow|화살표/i.test(n.getAttribute('data-name')||n.getAttribute('alt')||'')||/^[↗→]$/.test(n.textContent.trim()));if(!arrow||!prepare(arrow))continue;
   listen(el,'pointerenter',()=>to(arrow,{'--pm-hover-y':'-1px','--pm-scroll-x':'2px',duration:.35,overwrite:'auto'}));listen(el,'pointerleave',()=>to(arrow,{'--pm-hover-y':'0px','--pm-scroll-x':'0px',duration:.4,overwrite:'auto'}));api.counts.hover++;
  }
 },root);
 dispose=()=>{if(!active)return;active=false;observer.disconnect();events.abort();for(const item of api.items)item.tween.kill();for(const t of transient)t.kill();for(const t of api.triggers)t?.kill();ctx.revert();for(const fn of cleanup.reverse())fn();api.enabled=false;};
}
function ready(){if(ST)gs.registerPlugin(ST);enable();}
preference.addEventListener('change',enable,{signal:abort.signal});
document.addEventListener('visibilitychange',()=>document.hidden?api.pause():api.resume(),{signal:abort.signal});
window.addEventListener('pagehide',api.destroy,{once:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>document.fonts.ready.then(ready),{once:true,signal:abort.signal});else document.fonts.ready.then(ready);
})();
