/* Persona marquee — same continuous, linear loop as the main Keyword section.
   Separate lanes with identical repeated sequences. No step/timer/tween or edge overlay. */
(()=>{
'use strict';
function start(){
  const section=document.querySelector('[data-frame-id="124:16332"]');
  const root=section?.querySelector('[data-node-id="124:16332"]');
  if(!root||root.querySelector('#lh-persona-carousel-layer'))return;
  const ids=['124:16365','124:16373','124:16381','124:16337','124:16345','124:16354'];
  const originals=ids.map(id=>root.querySelector('[data-node-id="'+id+'"]'));
  if(originals.some(el=>!el))return;
  const layer=document.createElement('div');layer.id='lh-persona-carousel-layer';layer.setAttribute('aria-label','페르소나 카드 자동 가로 흐름');
  function cloneCard(source){
    const copy=source.cloneNode(true);
    copy.querySelectorAll('[id],[data-node-id],[data-frame-id]').forEach(el=>{
      el.removeAttribute('id');el.removeAttribute('data-node-id');el.removeAttribute('data-frame-id');
    });
    copy.removeAttribute('id');copy.removeAttribute('data-node-id');
    copy.classList.remove('lh-motion-target');copy.removeAttribute('tabindex');
    copy.removeAttribute('role');
    copy.style.removeProperty('transform');copy.style.removeProperty('opacity');
    copy.style.removeProperty('visibility');copy.style.removeProperty('filter');
    return copy;
  }
  function lane(name,offset,makeOriginals){
    const viewport=document.createElement('div');viewport.className='lh-persona-lane';viewport.dataset.lane=name;viewport.style.top=offset+'px';
    const track=document.createElement('div');track.className='lh-persona-track';
    for(let duplicate=0;duplicate<2;duplicate++){
      const group=document.createElement('div');group.className='lh-persona-group';
      originals.forEach((original,i)=>{
        const outer=document.createElement('div');outer.className='lh-persona-card';
        const card=(makeOriginals && duplicate===0)?original:cloneCard(original);
        if(!(makeOriginals && duplicate===0)){outer.setAttribute('aria-hidden','true');outer.inert=true;}
        card.classList.remove('lh-motion-target');
        card.style.setProperty('opacity','1','important');
        card.style.setProperty('visibility','visible','important');
        card.style.removeProperty('transform');
        card.style.removeProperty('translate');
        outer.append(card);group.append(outer);
      });
      track.append(group);
    }
    viewport.append(track);layer.append(viewport);
  }
  // Each row is its own endless strip; bottom starts halfway through the cycle.
  // The two tracks travel left at the same linear speed with no jump at wrap.
  lane('top',327,true);
  lane('bottom',525,false);
  root.append(layer);
  window.__lhPersonaCarousel={mode:'continuous-keyword-marquee',running:()=>getComputedStyle(layer.querySelector('.lh-persona-track')).animationPlayState};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();