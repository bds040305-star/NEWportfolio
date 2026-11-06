(() => {
  'use strict';
  const asset = name => `assets/lh/${name}.png`;
  const screens = {
    home: '홈', notice: '공고 상세', documents: '내 일정', family: '가족 서명 요청', signature: '동의 및 서명', condition: '맞춤 조건 설정', list: '맞춤공고', before: 'LH 청약플러스'
  };
  const icon = (name, alt = '') => `<img src="${asset(name)}" alt="${alt}" loading="lazy">`;
  const listing = (title = '서울 강동구 고덕강일 행복주택', date = '07.15 ~ 07.26', index = 0) => `<article class="listing-card"><span class="listing-tag">${index ? '모집 예정' : '모집 중'}</span><button class="heart" aria-label="${title} 관심 공고 저장" aria-pressed="false">♡</button><h4>${title}<br>입주자 모집공고</h4><p>서울특별시 · 행복주택 · 청년 / 신혼부부</p><div class="listing-data"><span>전용면적 <b>26 ~ 44㎡</b></span><span>모집 <b>${index ? '85' : '120'}세대</b></span></div><p>신청기간 &nbsp; ${date}</p></article>`;
  const task = (symbol, title, subtitle) => `<div class="task-row"><i>${symbol}</i><div><b>${title}</b><p>${subtitle}</p></div><span>›</span></div>`;
  const quickMenu = () => `<div class="quick-menu">${[['icon-home','맞춤 공고'],['icon-calendar','청약 일정'],['icon-check','서류 준비'],['icon-person','신청 현황']].map(([i,t])=>`<div>${icon(i)}${t}</div>`).join('')}</div>`;
  const tabBar = () => '<div class="app-tabs"><button class="selected" data-app-tab="전체">전체</button><button data-app-tab="모집 중">모집 중</button><button data-app-tab="모집 예정">모집 예정</button></div>';
  const checklist = () => `<div class="app-section-label">서류 준비 <small class="check-count">2 / 5</small></div><div class="doc-progress"><i></i></div>${['주민등록표등본','가족관계증명서','개인정보 수집·이용 동의서','금융정보 제공 동의서','자산 보유 사실 확인서'].map((t,i)=>`<div class="document-row"><label><input type="checkbox" aria-label="${t} 준비 완료" ${i<2?'checked':''}><span>${t}<small>${i<2?'준비 완료':'발급 및 제출이 필요해요'}</small></span></label></div>`).join('')}`;
  const calendar = () => `<div class="app-calendar"><header><span>2026년 7월</span><span>‹ &nbsp; ›</span></header><div class="calendar-grid">${['일','월','화','수','목','금','토'].map(d=>`<span class="day-label">${d}</span>`).join('')}${Array.from({length:3},()=>'<span></span>').join('')}${Array.from({length:31},(_,i)=>`<button aria-label="7월 ${i+1}일 일정" aria-pressed="${i===14}" class="${i===14?'today ':''}${[14,19,25].includes(i)?'has-event':''}" data-day="${i+1}">${i+1}</button>`).join('')}</div></div><p class="selected-date">7월 15일 · 청약 신청 시작</p>`;
  const templates = {
    home: () => `<div class="app-pad"><div class="app-greeting">내 조건에 맞는 집을<br><em>찾고 계신가요?</em></div><div class="condition-banner"><b>내 조건에 맞는 공고를 확인해 보세요</b><p>서울 · 청년 · 행복주택 &nbsp; 조건 변경 ›</p></div>${tabBar()}${listing()}<div class="app-subtitle">오늘 해야 할 일 <small>전체보기 ›</small></div>${task('✓','제출할 서류를 확인해 주세요','고덕강일 행복주택 · D-7')}${task('▦','다가오는 신청 일정이 있어요','7월 15일 · 청약 신청 시작')}<div class="app-subtitle">빠른 메뉴</div>${quickMenu()}</div>`,
    notice: () => `<div class="app-pad"><span class="listing-tag">모집 중 · 행복주택</span><div class="app-greeting" style="font-size:1.65em">서울 강동구 고덕강일<br>행복주택 입주자 모집공고</div><p style="color:#9aa8b3">공고일 2026.07.01 &nbsp; 조회수 1,204</p><div class="app-tabs"><span class="selected">공고 요약</span><span>모집 정보</span><span>준비 서류</span></div><div class="app-section-label">내 조건으로 확인했어요</div><div class="condition-banner"><b>✓ 신청 가능한 공고예요</b><p>설정한 조건을 기준으로 확인한 결과입니다.</p></div><div class="app-section-label">주요 일정</div><div class="listing-data"><span>청약 신청</span><b>07.15 (수) ~ 07.26 (일)</b></div><div class="listing-data"><span>서류 제출</span><b>08.03 (월) ~ 08.10 (월)</b></div>${checklist()}<div class="app-note"><b>서류 준비가 처음이신가요?</b>필요한 서류부터 발급 방법까지<br>하나씩 확인하며 준비해 보세요.</div><button class="app-primary" data-action="prepare">서류 준비 시작하기</button></div>`,
    documents: () => `<div class="app-pad"><div class="app-greeting">준비할 일도, 일정도<br><em>한눈에 확인해요</em></div><div class="app-document-banner">이번 달에 준비할 일정이 있어요</div>${calendar()}${task('▦','고덕강일 행복주택','청약 신청 · 07.15 ~ 07.26')}${checklist()}<div class="app-note"><b>다가오는 마감일을 확인하세요</b>놓치지 않도록 미리 준비해 보세요.</div><button class="app-primary" data-action="notify">일정 알림 받기</button></div>`,
    family: () => `<div class="app-pad"><div class="app-greeting">가족에게 필요한 서명을<br><em>간편하게 요청해요</em></div><p style="color:#9da9b3">서명할 가족의 정보를 확인해 주세요.</p><div class="app-section-label">서명 요청 정보</div><div class="app-field">요청 서류 <b>개인정보 수집·이용 동의서</b></div><div class="app-field">서명 대상 <b>가족 구성원</b></div><div class="app-field">관계 <b>부모님 &nbsp; ⌄</b></div><div class="app-field">연락처 <b>010-****-1234</b></div><div class="app-note"><b>링크 하나로 서명할 수 있어요</b>앱 설치나 회원가입 없이<br>내용을 확인하고 서명할 수 있습니다.</div><button class="app-primary" data-action="send-link">서명 요청 링크 보내기</button><div class="app-section-label">서명 진행 상황</div>${task('✓','김○○ 님','서명 요청 전')}${task('✓','이○○ 님','서명 완료')}</div>`,
    signature: () => `<div class="app-pad"><span class="listing-tag">LH 청약플러스</span><div class="app-greeting">서명 요청이 도착했어요</div><p style="color:#8797a4">김○○ 님이 동의서 서명을 요청했어요.<br>아래 내용을 확인하고 서명해 주세요.</p><div class="app-section-label">개인정보 수집·이용 동의서</div><div class="app-note" style="background:#f3f6f8;color:#718190">본인은 공공주택 입주자 자격 확인을 위해 필요한 개인정보 수집 및 이용에 동의합니다.<br><br>수집 목적 · 공공주택 신청 자격 확인<br>보유 기간 · 관련 법령에 따름</div><div class="document-row"><label><input class="signature-consent" type="checkbox" aria-label="개인정보 수집 및 이용 동의"><span>위 내용을 확인하고 동의합니다.</span></label></div><div class="app-section-label">직접 서명하기</div><canvas class="signature-pad" tabindex="0" aria-label="마우스나 손가락으로 서명을 그리는 영역"></canvas><div class="signature-toolbar"><span>화면에 서명해 주세요</span><button class="signature-clear">다시 쓰기</button></div><button class="app-primary" data-action="submit-signature">서명 완료하기</button><p class="signature-placeholder" role="status"></p></div>`,
    condition: () => `<div class="app-pad"><div class="app-greeting">어떤 집을<br><em>찾고 계신가요?</em></div><p style="color:#96a3ad">나에게 맞는 조건을 선택해 주세요.</p>${[['관심 지역',['서울','경기','인천']],['임대 유형',['행복주택','국민임대','공공임대']],['신청 유형',['청년','신혼부부','일반']],['세대 구성',['1인 가구','2인 가구','3인 이상']]].map(([t,opts])=>`<div class="app-section-label">${t}</div><div class="app-select-row">${opts.map((o,i)=>`<button class="${i===0?'chosen':''}" aria-pressed="${i===0}">${o}</button>`).join('')}</div>`).join('')}<div class="condition-banner">설정한 조건은 언제든 변경할 수 있어요.</div><button class="app-primary" data-action="conditions">맞춤 공고 확인하기</button></div>`,
    list: () => `<div class="app-pad"><div class="condition-banner"><b>나에게 맞는 공고</b><p>서울 · 청년 · 행복주택 &nbsp; 조건 변경 ›</p></div>${tabBar()}<div class="app-subtitle">총 <em>12</em>개의 공고 <small>최신순 ⌄</small></div>${listing()}${listing('서울 마포구 공덕 행복주택','07.20 ~ 07.31',1)}${listing('서울 강서구 마곡 행복주택','07.15 ~ 07.28')}</div>`,
    before: () => `<div class="app-pad"><div class="old-app-banner"><div>내 집 마련의 시작<br><b>LH 청약플러스</b></div>${icon('robot-wave')}</div><div class="old-app-grid">${[['icon-home','임대주택'],['icon-person','분양주택'],['icon-document','토지'],['icon-calendar','청약 일정'],['icon-check','청약 신청'],['icon-schedule','신청 확인']].map(([i,t])=>`<div>${icon(i)}${t}</div>`).join('')}</div><div class="app-subtitle">공지사항 <small>더보기 +</small></div>${task('·','임대주택 입주자 모집 안내','2026.07.01')}${task('·','청약 서비스 이용 안내','2026.06.28')}${task('·','공공임대주택 공급 공고','2026.06.25')}<div class="app-subtitle">자주 찾는 서비스</div>${quickMenu()}</div>`
  };
  function screenMarkup(type) {
    const special = !['home','before'].includes(type);
    return `<div class="mobile-ui" data-app-screen="${type}"><div class="statusbar"><span>9:41</span><span>▂▃▅ ▰</span></div><div class="app-header">${special?`<span>‹</span><b class="app-title">${screens[type]}</b><span>⌕</span>`:`${icon('logo','LH 청약플러스')}<span>♧ ≡</span>`}</div><div class="app-scroll">${templates[type]()}</div><nav class="app-bottom" aria-label="앱 목업 메뉴">${[['⌂','홈','home'],['▤','맞춤공고','list'],['▦','내 일정','documents'],['⌖','조건 설정','condition'],['♙','MY','family']].map(([i,t,key])=>`<button data-nav="${key}" class="${key===type?'active':''}"><span>${i}</span>${t}</button>`).join('')}</nav></div>`;
  }
  document.querySelectorAll('.phone[data-screen]').forEach(phone => {
    phone.innerHTML = `<div class="notch" aria-hidden="true"></div><div class="phone-glass">${screenMarkup(phone.dataset.screen)}</div>`;
    phone.setAttribute('role','group');
    phone.setAttribute('aria-label',`${screens[phone.dataset.screen]} 인터랙티브 휴대폰 목업`);
  });
  const publishing = [['home','01','맞춤 홈','내 조건을 중심으로 시작하는 청약'],['condition','02','맞춤 조건 설정','내게 맞는 조건을 간편하게'],['list','03','맞춤 공고','필요한 공고만 모아서 확인'],['notice','04','공고 상세','핵심 정보와 준비할 서류'],['documents','05','일정·서류 준비','다가오는 일정을 한눈에'],['family','06','가족 서명 요청','링크로 연결하는 서명'],['signature','07','동의 및 서명','휴대폰으로 간편하게 완료']];
  document.querySelector('.publishing-screens').innerHTML = publishing.map(([type,i,title,desc])=>`<article class="publish-card" data-category="${['notice','documents','family','signature'].includes(type)?'prepare':'browse'}"><div class="screen-sheet">${screenMarkup(type)}</div><span class="card-index">${i}</span><h3>${title}</h3><p>${desc}</p></article>`).join('');
  document.querySelectorAll('.mini-days').forEach(grid=>{grid.innerHTML=Array.from({length:28},(_,i)=>`<span>${i+1}</span>`).join('')});

  // Each mockup owns its state; repeated screens do not share IDs or checkboxes.
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const app = button.closest('.mobile-ui');
    if (button.matches('.heart')) {
      const saved = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed',String(saved));button.classList.toggle('saved',saved);button.textContent=saved?'♥':'♡';
    }
    if(button.dataset.nav && app){app.outerHTML=screenMarkup(button.dataset.nav);initializePads();}
    if(button.dataset.appTab && app){
      app.querySelectorAll('[data-app-tab]').forEach(tab=>{tab.classList.toggle('selected',tab===button);tab.setAttribute('aria-pressed',String(tab===button));});
      app.querySelectorAll('.listing-card').forEach(card=>{card.hidden=button.dataset.appTab!=='전체' && card.querySelector('.listing-tag').textContent!==button.dataset.appTab;});
    }
    if(button.dataset.day && app){
      app.querySelectorAll('[data-day]').forEach(day=>{day.classList.toggle('today',day===button);day.setAttribute('aria-pressed',String(day===button));});
      const day=Number(button.dataset.day); app.querySelector('.selected-date').textContent=`7월 ${day}일 · ${day===15?'청약 신청 시작':day===20?'서류 준비 확인':day===26?'청약 신청 마감':'등록된 청약 일정이 없어요'}`;
    }
    if(button.closest('.app-select-row'))button.closest('.app-select-row').querySelectorAll('button').forEach(b=>{b.classList.toggle('chosen',b===button);b.setAttribute('aria-pressed',String(b===button));});
    if(button.dataset.action && app){
      switch(button.dataset.action){
        case 'prepare': app.outerHTML=screenMarkup('documents');break;
        case 'conditions': app.outerHTML=screenMarkup('list');break;
        case 'notify': button.textContent='✓ 일정 알림이 설정되었어요';button.disabled=true;break;
        case 'send-link': button.textContent='✓ 서명 요청 미리보기 완료';app.querySelector('.task-row p').textContent='요청 완료 예시 · 실제 메시지는 전송되지 않습니다';break;
        case 'submit-signature':{
          const status=app.querySelector('.signature-placeholder');
          if(!app.querySelector('.signature-consent').checked){status.textContent='동의 내용을 확인하고 체크해 주세요.';break;}
          if(!app.querySelector('.signature-pad').dataset.signed){status.textContent='서명 영역에 직접 서명해 주세요.';break;}
          status.textContent='✓ 서명이 완료되었습니다.';status.classList.add('app-success');button.textContent='서명 완료';button.disabled=true;break;
        }
      }
    }
    if(button.matches('.publish-filter')){
      document.querySelectorAll('.publish-filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
      document.querySelectorAll('.publish-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;});
      document.querySelector('.publishing-screens').classList.toggle('filtered',button.dataset.filter!=='all');
    }
    if(button.matches('.back-projects')){if(window.parent!==window)window.parent.postMessage({type:'lh-case-close'},location.origin);else location.href='index.html';}
    if(button.matches('.to-top'))window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    if(button.matches('.demo-button')){button.textContent='✓ 맞춤 조건이 적용되었어요';}
  });
  document.addEventListener('change',event=>{
    const input=event.target;
    if(!input.matches('.document-row input') || input.matches('.signature-consent'))return;
    const app=input.closest('.mobile-ui'),inputs=[...app.querySelectorAll('.document-row input')],count=inputs.filter(i=>i.checked).length;
    app.querySelector('.check-count').textContent=`${count} / ${inputs.length}`;
    app.querySelector('.doc-progress i').style.width=`${count/inputs.length*100}%`;
    input.closest('label').querySelector('small').textContent=input.checked?'준비 완료':'발급 및 제출이 필요해요';
  });
  function initializePads(){
    document.querySelectorAll('.signature-pad:not([data-initialized])').forEach(canvas=>{
      canvas.dataset.initialized='true';canvas.width=640;canvas.height=240;
      const ctx=canvas.getContext('2d');let drawing=false;
      const point=event=>{const r=canvas.getBoundingClientRect();return [(event.clientX-r.left)*canvas.width/r.width,(event.clientY-r.top)*canvas.height/r.height];};
      canvas.addEventListener('pointerdown',event=>{drawing=true;canvas.setPointerCapture(event.pointerId);ctx.beginPath();ctx.moveTo(...point(event));ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#213b58';});
      canvas.addEventListener('pointermove',event=>{if(!drawing)return;ctx.lineTo(...point(event));ctx.stroke();canvas.dataset.signed='true';});
      const end=()=>drawing=false;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
      canvas.closest('.mobile-ui').querySelector('.signature-clear').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);delete canvas.dataset.signed;const status=canvas.closest('.mobile-ui').querySelector('.signature-placeholder');status.textContent='';});
    });
  }
  initializePads();

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
