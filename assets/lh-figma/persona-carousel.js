/* LH persona: sequential two-row six-card loop with individual fades.
   Does not change headline, backgrounds, portrait assets or signature interactions. */
(function(){
 'use strict';
 function initialize(){
  const section=document.querySelector('[data-frame-id="124:16332"]');
  const design=section?.querySelector('[data-node-id="124:16332"]');
  const gs=window.gsap;
  if(!design||!gs||design.querySelector('#lh-persona-carousel-layer'))return;
  const names=['박민정','김도윤','최은정','이수진','이준호','정지훈'];
  const ids=['124:16365','124:16373','124:16381','124:16337','124:16345','124:16354'];
  const cards=ids.map(id=>design.querySelector('[data-node-id="'+id+'"]'));
  if(cards.some(card=>!card))return;
  const layer=document.createElement('div');
  layer.id='lh-persona-carousel-layer';
  layer.setAttribute('aria-label','페르소나 6명 자동 순환');
  layer.setAttribute('role','group');
  design.append(layer);
  // Top is slightly offset from bottom, following the original Figma design.
  const slots=[
   {x:56,y:327},{x:653,y:327},{x:1250,y:327},
   {x:200,y:525},{x:797,y:525},{x:1394,y:525}
  ];
  const wrappers=cards.map((card,i)=>{
   const wrap=document.createElement('div');
   wrap.className='lh-persona-slide';
   wrap.dataset.persona=names[i];
   wrap.setAttribute('aria-label',names[i]);
   wrap.appendChild(card);layer.appendChild(wrap);
   gs.set(wrap,{x:slots[i].x,y:slots[i].y,opacity:1,force3D:true});
   return wrap;
  });
  let current=wrappers.slice(),active=false,visible=false,scheduled=null,timeline=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cancel=()=>{scheduled?.kill();scheduled=null};
  const schedule=()=>{
    cancel();if(active||!visible||document.hidden||reduced.matches)return;
    scheduled=gs.delayedCall(1.4,step);
  };
  const step=()=>{
    scheduled=null;
    if(active||!visible||document.hidden||reduced.matches)return;
    active=true;
    const prior=current.slice(),next=prior.slice(1).concat(prior[0]);
    const tl=gs.timeline({paused:true,onComplete:()=>{
       current=next;active=false;timeline=null;schedule();
    }});
    // Four visible leftward movements: staggered so they do not all start at once.
    // Prior top-left and bottom-left exit softly and re-enter in the opposite row.
    const internal=[1,2,4,5]; // remaining four cards travel one visible slot
    internal.forEach((oldIndex,j)=>{
      let destinationIndex;
      if(oldIndex===1)destinationIndex=0;
      if(oldIndex===2)destinationIndex=1;
      if(oldIndex===4)destinationIndex=3;
      if(oldIndex===5)destinationIndex=4;
      tl.to(prior[oldIndex],{x:slots[destinationIndex].x,y:slots[destinationIndex].y,duration:1.45,ease:'power2.inOut',force3D:true},j*.20);
    });
    // Bottom left becomes top right; upper left becomes bottom right.
    // Each disappears before the physical boundary and reappears from beyond the right edge.
    const wraps=[
      {item:prior[3],from:slots[3],target:slots[2],delay:.12},
      {item:prior[0],from:slots[0],target:slots[5],delay:0}
    ];
    wraps.forEach(({item,from,target,delay})=>{
      tl.to(item,{x:-570,duration:1.47,ease:'power4.in'},delay)
        .to(item,{opacity:0,duration:.72,ease:'sine.inOut'},delay+.10)
        .set(item,{x:2020,y:target.y,opacity:0},delay+1.51)
        .to(item,{x:target.x,duration:1.38,ease:'power2.out'},delay+1.54)
        .to(item,{opacity:1,duration:.92,ease:'sine.inOut'},delay+1.97);
    });
    timeline=tl;tl.play();
  };
  // Viewport detection works with the 1920px Figma canvas and CSS zoom.
  // Hover does NOT freeze automatic movement (a stationary cursor caused the bug).
  // First step is scheduled as soon as the section visibly enters the screen.
  const updateVisibility=()=>{
    const rect=section.getBoundingClientRect();
    const inView=rect.top<innerHeight*.94&&rect.bottom>innerHeight*.06;
    if(inView===visible)return;
    visible=inView;
    if(!visible){cancel();timeline?.pause();}
    else if(timeline)timeline.resume();
    else schedule();
  };
  const io=new IntersectionObserver(updateVisibility,{threshold:0,rootMargin:'15% 0px'});
  io.observe(section);
  window.addEventListener('scroll',updateVisibility,{passive:true});
  window.addEventListener('resize',updateVisibility,{passive:true});
  requestAnimationFrame(updateVisibility);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancel();timeline?.pause();}
    else {updateVisibility();if(visible){if(timeline)timeline.resume();else schedule();}}
  });
  reduced.addEventListener('change',()=>{
    if(reduced.matches){cancel();timeline?.pause();}
    else {updateVisibility();if(visible){if(timeline)timeline.resume();else schedule();}}
  });
  window.__lhPersonaCarousel={
    getNames:()=>current.map(el=>el.dataset.persona),
    getStatus:()=>({visible,active,scheduled:!!scheduled,progress:timeline?.progress()??null}),
    pause:()=>{cancel();timeline?.pause()},
    resume:()=>{updateVisibility();if(timeline)timeline.resume();else if(visible)schedule()},
    next:()=>{cancel();if(!active){visible=true;step()}}
  };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
})();
