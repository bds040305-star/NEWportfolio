(() => {
  'use strict';
  // These are the original live app routes linked by the portfolio.
  // The portfolio itself must never be embedded in a phone (recursive iframe).
  const APP_BASE = 'https://bds040305-star.github.io/LH/';
  const pages = {
    home: ['index.html', '맞춤 홈'],
    condition: ['custom-conditions.html', '맞춤 조건 설정'],
    list: ['custom-list.html', '맞춤 공고'],
    notice: ['notice-detail.html', '공고 상세'],
    documents: ['document-checklist.html', '서류 준비'],
    schedule: ['schedule.html', '내 청약 일정'],
    family: ['signature-share.html', '가족 서명 요청'],
    signature: ['signature-request.html', '서류 확인 및 서명']
  };
  const surfaces = new Set();
  function fitSurface(viewport) {
    const surface = viewport.querySelector('.live-app-surface');
    const frame = viewport.querySelector('iframe');
    if (!surface || !viewport.clientWidth || !viewport.clientHeight) return;
    const scale = viewport.clientWidth / 390;
    const height = viewport.clientHeight / scale;
    surface.style.transform = `scale(${scale})`;
    surface.style.height = `${height}px`;
    frame.style.height = `${Math.max(100, height - 24)}px`;
  }
  const resizeObserver = new ResizeObserver(entries => entries.forEach(({target}) => fitSurface(target)));
  function liveScreen(key) {
    const [path, title] = pages[key];
    const viewport = document.createElement('div');
    viewport.className = 'live-app-viewport';
    viewport.dataset.liveScreen = key;
    const surface = document.createElement('div');
    surface.className = 'live-app-surface';
    const status = document.createElement('div');
    status.className = 'mockup-status';
    status.setAttribute('aria-hidden', 'true');
    status.innerHTML = '<span>9:41</span><span>▂▃▅ &nbsp; ▰</span>';
    const frame = document.createElement('iframe');
    frame.className = 'live-app-frame';
    frame.title = `LH 청약플러스 실제 앱 · ${title} · 직접 탐색 가능`;
    frame.src = new URL(path, APP_BASE).href;
    frame.loading = 'lazy';
    frame.setAttribute('allow', 'clipboard-write; web-share');
    frame.addEventListener('load', () => { viewport.dataset.loaded = 'true'; });
    surface.append(status, frame);
    viewport.append(surface);
    resizeObserver.observe(viewport);
    surfaces.add(viewport);
    return viewport;
  }
  function beforeScreen() {
    return `<div class="mobile-ui"><div class="statusbar"><span>9:41</span><span>▂▃▅ ▰</span></div><div class="app-header"><img src="assets/lh/logo.png" alt="LH 청약플러스"><span>☰</span></div><div class="app-scroll"><div class="app-pad"><div class="old-app-banner"><div>내 집 마련의 시작<br><b>LH 청약플러스</b></div><img src="assets/lh/robot-wave.png" alt=""></div><div class="old-app-grid">${[['icon-home','임대주택'],['icon-person','분양주택'],['icon-document','토지'],['icon-calendar','청약 일정'],['icon-check','청약 신청'],['icon-schedule','신청 확인']].map(([i,t])=>`<div><img src="assets/lh/${i}.png" alt="">${t}</div>`).join('')}</div><div class="app-subtitle">공지사항 <small>더보기 +</small></div>${['임대주택 입주자 모집 안내','청약 서비스 이용 안내','공공임대주택 공급 공고'].map(t=>`<div class="task-row"><div><b>${t}</b><p>2026.07.01</p></div><span>›</span></div>`).join('')}</div></div></div>`;
  }
  document.querySelectorAll('.phone[data-screen]').forEach(phone => {
    const key = phone.dataset.livePage || phone.dataset.screen;
    phone.innerHTML = '<div class="notch" aria-hidden="true"></div><div class="phone-glass"></div>';
    const glass = phone.querySelector('.phone-glass');
    if (key === 'before') glass.innerHTML = beforeScreen();
    else glass.append(liveScreen(key));
    phone.setAttribute('role', 'group');
    phone.setAttribute('aria-label', key === 'before' ? '리디자인 전 화면 비교' : `${pages[key][1]} 실제 앱 목업`);
  });
  const publishing = [
    ['home','01','맞춤 홈','내 조건을 중심으로 시작하는 청약'],
    ['condition','02','맞춤 조건 설정','내게 맞는 조건을 간편하게'],
    ['list','03','맞춤 공고','필요한 공고만 모아서 확인'],
    ['notice','04','공고 상세','핵심 정보와 준비할 서류'],
    ['documents','05','일정·서류 준비','준비할 서류를 한눈에'],
    ['family','06','가족 서명 요청','링크로 연결하는 서명'],
    ['signature','07','동의 및 서명','휴대폰으로 간편하게 완료']
  ];
  const strip = document.querySelector('.publishing-screens');
  publishing.forEach(([key,index,title,description]) => {
    const card = document.createElement('article');
    card.className = 'publish-card';
    card.dataset.category = ['notice','documents','family','signature'].includes(key) ? 'prepare' : 'browse';
    card.innerHTML = `<div class="screen-sheet"></div><span class="card-index">${index}</span><h3>${title}</h3><p>${description}</p>`;
    card.querySelector('.screen-sheet').append(liveScreen(key));
    strip.append(card);
  });
  requestAnimationFrame(() => surfaces.forEach(fitSurface));
  window.addEventListener('pageshow', () => surfaces.forEach(fitSurface));
  document.querySelectorAll('.mini-days').forEach(grid => {grid.innerHTML=Array.from({length:28},(_,i)=>`<span>${i+1}</span>`).join('');});
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('.publish-filter')) {
      document.querySelectorAll('.publish-filter').forEach(item => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelectorAll('.publish-card').forEach(card => {card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;});
      strip.classList.toggle('filtered', button.dataset.filter !== 'all');
      requestAnimationFrame(() => surfaces.forEach(fitSurface));
    }
    if (button.matches('.back-projects')) {
      if (window.parent !== window) window.parent.postMessage({type:'lh-case-close'}, location.origin);
      else location.href = 'index.html';
    }
    if (button.matches('.to-top')) window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if (button.matches('.demo-button')) button.textContent = '✓ 맞춤 조건이 적용되었어요';
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(window.gsap && window.ScrollTrigger && !reduced){
    gsap.registerPlugin(ScrollTrigger);
    // Animation only changes opacity/transform; the reference composition stays fixed.
    document.querySelectorAll('section:not(.hero)').forEach(section=>{
      const targets=section.querySelectorAll(':scope > h2,:scope > .feature-copy,:scope > .guide-panels,:scope > .comparison,:scope > .strategy-grid,:scope > .sitemap,:scope > .quotes,:scope > .takeaway-copy');
      gsap.from(targets,{y:22,opacity:0,duration:.75,stagger:.08,ease:'power2.out',scrollTrigger:{trigger:section,start:'top 82%',once:true}});
    });
    document.querySelectorAll('.hero-phones,.notice-dialogue>img,.ia-robot').forEach(el=>{
      el.addEventListener('pointermove',event=>{const r=el.getBoundingClientRect();gsap.to(el,{y:(event.clientY-r.top-r.height/2)*.025,duration:.5,overwrite:true});});
      el.addEventListener('pointerleave',()=>gsap.to(el,{y:0,duration:.6,overwrite:true}));
    });
  }

  // Three.js draws the same subdued curved bands behind the strategy cards.
  // The CSS bands remain the fallback if WebGL or the CDN is unavailable.
  const canvas=document.getElementById('direction-canvas');
  if(window.THREE && !reduced){
    let renderer;
    try{
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
      const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.z=5;
      const group=new THREE.Group();scene.add(group);
      [1.2,1.5,1.8].forEach((radius,index)=>{
        const curve=new THREE.EllipseCurve(0,-1.15,radius,radius,0,Math.PI,false,0);
        const points=curve.getPoints(120).map(p=>new THREE.Vector3(p.x,p.y,0));
        const geometry=new THREE.BufferGeometry().setFromPoints(points);
        group.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x8095bc,transparent:true,opacity:.09-index*.015})));
      });
      const render=()=>renderer.render(scene,camera);
      const resize=()=>{renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);render();};
      const observer=new ResizeObserver(resize);observer.observe(canvas);
      canvas.parentElement.addEventListener('pointermove',event=>{
        const bounds=canvas.getBoundingClientRect();group.position.x=((event.clientX-bounds.left)/bounds.width-.5)*.04;render();
      });
      canvas.parentElement.addEventListener('pointerleave',()=>{group.position.x=0;render();});
      canvas.dataset.renderer='three';resize();
      window.addEventListener('pagehide',()=>{observer.disconnect();group.children.forEach(line=>{line.geometry.dispose();line.material.dispose();});renderer.dispose();},{once:true});
    }catch(error){if(renderer)renderer.dispose();canvas.hidden=true;}
  }
})();
