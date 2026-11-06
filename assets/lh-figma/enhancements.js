(() => {
  'use strict';
  const root = document.getElementById('view-lh');
  if (!root || root.dataset.lhEnhanced === 'true') return;
  root.dataset.lhEnhanced = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = window.gsap;
  const APP_BASE = 'https://bds040305-star.github.io/LH/';
  const routes = {
    '01': ['index.html', '홈'],
    '03': ['custom-conditions.html', '맞춤 조건 설정'],
    '05': ['custom-list.html', '맞춤 공고'],
    '06': ['notice-detail.html', '공고 상세'],
    '07': ['document-checklist.html', '서류 준비'],
    '08': ['signature-share.html', '가족에게 서명 요청'],
    '11': ['signature-request.html', '서류 내용 확인'],
    '15': ['signature-opened.html', '서명 진행 현황'],
    '16': ['document-signed.html', '서명이 도착한 서류 준비'],
    '19': ['schedule.html', '내 일정']
  };
  // Only background layers are continued outside the frame. Their coordinates,
  // sizes and assets are copied unchanged; foreground circles are never cloned.
  const backgroundNodes = new Set([
    '124:17449','124:17450','124:16296','124:16298','124:16333','124:16499','124:17683',
    '124:17685','124:17686','124:17688','124:16419','124:16420',
    '124:16500','124:16501','124:17730','124:17731','124:17732',
    '124:17735','124:17736','124:16713','124:16745'
  ]);
  const sections = [...root.querySelectorAll('.figma-section')];
  const edgeArtwork = [];
  for (const section of sections) {
    const designRoot = section.querySelector(`[data-node-id="${section.dataset.frameId}"]`);
    const originalHeight = parseFloat(section.style.height);
    const paint = getComputedStyle(designRoot);
    const backdrop = document.createElement('div');
    backdrop.className = 'lh-section-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    for (const property of ['backgroundColor','backgroundImage','backgroundPosition','backgroundSize','backgroundRepeat']) {
      backdrop.style[property] = paint[property];
    }
    const plane = document.createElement('div');
    plane.className = 'lh-background-plane';
    for (const child of designRoot.children) {
      if (!backgroundNodes.has(child.dataset.nodeId)) continue;
      const copy = child.cloneNode(true);
      for (const node of [copy, ...copy.querySelectorAll('*')]) {
        node.removeAttribute('id');
        node.removeAttribute('data-node-id');
        node.removeAttribute('data-name');
        node.removeAttribute('tabindex');
        if (node.tagName === 'IMG') node.alt = '';
      }
      plane.append(copy);
    }
    backdrop.append(plane);
    const frame = document.createElement('div');
    frame.className = 'lh-design-frame';
    frame.append(...section.childNodes);
    section.style.setProperty('--lh-design-height', `${originalHeight}px`);
    section.dataset.designHeight = String(originalHeight);
    section.append(backdrop, frame);
    for (const id of ['124:16333','124:16499','124:17683']) {
      const artwork = designRoot.querySelector(`[data-node-id="${id}"] img`);
      if (artwork) edgeArtwork.push({artwork,frame,backdrop,plane});
    }
    const lowerBackground = designRoot.querySelector('[data-node-id="124:16302"]');
    if (lowerBackground) {
      const band = document.createElement('div');
      const fill = getComputedStyle(lowerBackground);
      band.className = 'lh-background-band';
      band.style.setProperty('--lh-art-top', fill.top);
      band.style.setProperty('--lh-art-height', fill.height);
      band.style.backgroundColor = fill.backgroundColor;
      band.style.backgroundImage = fill.backgroundImage;
      backdrop.append(band);
    }
  }
  const fitPage = () => {
    const scale = Math.min(1, document.documentElement.clientWidth / 1920);
    root.style.setProperty('--lh-layout-scale', String(scale));
    for (const section of sections) section.style.height = `${Number(section.dataset.designHeight) * scale}px`;
  };
  fitPage();
  // Continue only the boundary colours of the source background illustration.
  // The 1px strips are sampled from the original image, never from a screenshot;
  // no text, character, building or phone in the 1920px plane is resized or copied.
  for (const {artwork,frame,backdrop,plane} of edgeArtwork) {
    artwork.decode().then(() => {
      const fr = frame.getBoundingClientRect(), r = artwork.getBoundingClientRect();
      const scale = fr.width / 1920;
      const x = (r.left-fr.left)/scale, y = (r.top-fr.top)/scale;
      const width = r.width/scale, height = r.height/scale;
      const cover = Math.max(width/artwork.naturalWidth,height/artwork.naturalHeight);
      const cropX = (width-artwork.naturalWidth*cover)/2;
      const cropY = (height-artwork.naturalHeight*cover)/2;
      for (const [side,boundary] of [['left',0],['right',1919.99]]) {
        const sourceX = (boundary-x-cropX)/cover;
        if (sourceX<0 || sourceX>=artwork.naturalWidth) continue;
        const strip = document.createElement('canvas');
        strip.width=1; strip.height=Math.ceil(height);
        strip.getContext('2d').drawImage(artwork,Math.floor(sourceX),0,1,artwork.naturalHeight,0,cropY,1,artwork.naturalHeight*cover);
        const tone = document.createElement('div');
        tone.className=`lh-edge-tone lh-edge-tone--${side}`;
        tone.style.setProperty('--lh-art-top',`${y}px`);
        tone.style.setProperty('--lh-art-height',`${height}px`);
        tone.style.backgroundImage=`url("${strip.toDataURL('image/png')}")`;
        backdrop.insertBefore(tone,plane);
      }
    }).catch(() => { /* The original section colour remains the background fallback. */ });
  }
  let resizeTask = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeTask);
    resizeTask = requestAnimationFrame(fitPage);
  }, {passive:true});

  const pending = new WeakMap();
  const sizes = new ResizeObserver(entries => {
    for (const {target} of entries) fitScreen(target);
  });
  function fitScreen(viewport) {
    const frame = viewport.querySelector('iframe');
    const surface = viewport.querySelector('.lh-live-surface');
    if (!frame || !viewport.clientWidth || !viewport.clientHeight) return;
    const scale = viewport.clientWidth / 390;
    const height = `${viewport.clientHeight / scale}px`;
    frame.style.height = height;
    surface.style.height = height;
    surface.style.transform = `scale(${scale})`;
    surface.dataset.screenScale = String(scale);
    viewport.dataset.screenScale = String(scale);
  }
  function mountScreen(glass, route, statusHeight) {
    if (glass.dataset.livePage) return;
    if (getComputedStyle(glass).position === 'static') glass.style.position = 'relative';
    glass.classList.add('lh-live-mockup');
    glass.dataset.livePage = route[0];
    glass.dataset.liveState = 'idle';
    const viewport = document.createElement('div');
    viewport.className = 'lh-live-viewport';
    viewport.style.top = `${statusHeight}px`;
    viewport.dataset.state = 'idle';
    const frame = document.createElement('iframe');
    frame.className = 'lh-live-iframe';
    frame.title = `LH 청약플러스 · ${route[1]} · 목업 안에서 직접 탐색`;
    frame.loading = 'lazy';
    frame.setAttribute('allow', 'clipboard-write; web-share');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const url = new URL(route[0], APP_BASE).href;
    const fallback = document.createElement('a');
    fallback.className = 'lh-live-retry';
    fallback.href = url;
    fallback.target = '_blank';
    fallback.rel = 'noopener';
    fallback.textContent = '실제 화면 새 탭에서 열기 ↗';
    const surface = document.createElement('div');
    surface.className = 'lh-live-surface';
    surface.append(frame);
    viewport.append(surface);
    glass.append(viewport, fallback);
    sizes.observe(viewport);
    fitScreen(viewport);
    let timeout;
    frame.addEventListener('load', () => {
      if (!frame.hasAttribute('src')) return;
      try { if (frame.contentDocument?.URL === 'about:blank') return; } catch (_) { /* Loaded cross-origin app. */ }
      clearTimeout(timeout);
      fitScreen(viewport);
      viewport.dataset.state = 'ready';
      glass.dataset.liveState = 'ready';
      if (motion && !reduced) motion.fromTo(viewport, {opacity:0}, {opacity:1,duration:.35,ease:'power1.out'});
    });
    frame.addEventListener('error', () => {
      viewport.dataset.state = 'unavailable';
      glass.dataset.liveState = 'unavailable';
    });
    const load = () => {
      if (frame.hasAttribute('src')) return;
      viewport.dataset.state = 'loading';
      glass.dataset.liveState = 'loading';
      frame.src = url;
      timeout = setTimeout(() => {
        if (viewport.dataset.state !== 'ready') glass.dataset.liveState = 'unavailable';
      }, 18000);
    };
    pending.set(viewport, load);
    screenObserver.observe(viewport);
  }
  const screenObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      pending.get(entry.target)?.();
      screenObserver.unobserve(entry.target);
    }
  }, {rootMargin:'450px 0px'});
  for (const status of root.querySelectorAll('.lh-design-frame [data-name="Status bar"]')) {
    // Family Signature uses the original shared Canvas state, never independent app pages.
    if (status.closest('[data-frame-id="124:16712"]')) continue;
    const glass = status.parentElement;
    const number = glass.dataset.name?.match(/^\d+/)?.[0];
    if (!routes[number]) continue;
    mountScreen(glass, routes[number], status.offsetTop + status.offsetHeight);
  }
  // Existing off-screen gallery cards 8 and 9 remain at their original positions.
  for (const card of root.querySelectorAll('#lhStrip a[data-page]')) {
    const image = card.querySelector('.lh-strip-view img');
    if (!image) continue;
    const glass = image.parentElement;
    glass.style.width = '208px';
    glass.style.height = '457px';
    mountScreen(glass, [card.dataset.page, card.getAttribute('aria-label') || card.dataset.page], 0);
  }
  // Existing transparent card links covered the complete thumbnail. Keep their
  // caption hit areas, leaving the embedded screen free for touch and scrolling.
  for (const link of root.querySelectorAll('#lhStrip a.lh-strip-item')) {
    if (link.children.length || !link.style.height) continue;
    link.style.top = '488px';
    link.style.height = '153px';
    link.classList.add('lh-caption-link');
  }
  // The historical Before screen has no separate glass layer in the source;
  // preserve its reference bitmap and link to the real service without redrawing it.
  const before = root.querySelector('[data-frame-id="124:16603"] img[src$="e0d9735da77c900611ef274e60452c168ad9f33b.png"]');
  if (before) {
    const link = document.createElement('a');
    link.className = 'lh-historical-link';
    link.href = 'https://apply.lh.or.kr/lhapply/main.do';
    link.target = '_blank'; link.rel = 'noopener';
    link.setAttribute('aria-label', '리디자인 전 비교 화면 · 실제 LH 청약플러스 새 탭에서 열기');
    link.title = '실제 LH 청약플러스 열기';
    before.parentElement.append(link);
  }

  // No scale/rotation/parallax is applied to the original elements. Reveals and
  // focus/hover feedback use paint-only opacity, filter and outline changes.
  const targets = new Set();
  for (const section of sections) {
    const designRoot = section.querySelector(`[data-node-id="${section.dataset.frameId}"]`);
    for (const el of designRoot.children) {
      if (el.tagName === 'P' && parseFloat(getComputedStyle(el).fontSize) >= 25) targets.add(el);
    }
  }
  const cardIds = ['124:16337','124:16345','124:16354','124:16365','124:16373','124:16381','124:17691','124:17697','124:17705'];
  for (const id of cardIds) {
    const card = root.querySelector(`[data-node-id="${id}"]`);
    if (!card) continue;
    card.classList.add('lh-interaction-card');
    card.tabIndex = 0;
    card.setAttribute('role','group');
    targets.add(card);
  }
  for (const glass of root.querySelectorAll('.lh-design-frame .lh-live-mockup')) targets.add(glass);
  if (!reduced) {
    const reveal = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) if (entry.isIntersecting) {
        const el = entry.target;
        if (motion) motion.to(el, {opacity:1,duration:.7,delay:Math.min(order++,3)*.07,ease:'power2.out',onComplete:() => {el.style.willChange='auto';}});
        else {el.style.transition='opacity .7s ease';el.style.opacity='1';}
        el.dataset.revealed = 'true';
        reveal.unobserve(el);
      }
    }, {threshold:.12});
    for (const el of targets) {
      el.classList.add('lh-motion-target');
      if (motion) motion.set(el, {opacity:0}); else el.style.opacity='0';
      reveal.observe(el);
    }
    root.dataset.motionEngine = motion ? 'gsap' : 'css';
  } else root.dataset.motionEngine = 'reduced';
  root.addEventListener('click', event => {
    if (!motion || reduced || !event.target.closest('.signature-hotspot')) return;
    const dialog = document.getElementById('signatureDemo');
    if (dialog?.open) motion.fromTo(dialog,{opacity:0},{opacity:1,duration:.25,ease:'power1.out',overwrite:true});
  });
  // Observe the existing prototype state; its drawing, consent and submit logic
  // stays unchanged. Only the newly visible phone panel fades between steps.
  const familyPhone = document.getElementById('phoneB');
  if (familyPhone && motion && !reduced) {
    let screen = familyPhone.getAttribute('data-screen');
    const originalTransitions = new WeakMap();
    const steps = new MutationObserver(() => {
      const next = familyPhone.getAttribute('data-screen');
      if (next === screen) return;
      screen = next;
      const panel = familyPhone.querySelector(`[data-s="${next}"]`);
      if (panel) {
        if (!originalTransitions.has(panel)) originalTransitions.set(panel,panel.style.transition);
        motion.killTweensOf(panel,'opacity');
        panel.style.transition = 'none';
        motion.fromTo(panel,{opacity:0},{opacity:1,duration:.24,ease:'power1.out',clearProps:'opacity',overwrite:true,
          onComplete:() => { panel.style.transition=originalTransitions.get(panel); }});
      }
    });
    steps.observe(familyPhone,{attributes:true,attributeFilter:['data-screen']});
    window.addEventListener('pagehide',event => { if (!event.persisted) steps.disconnect(); });
  }
  const signatureSection = root.querySelector('[data-frame-id="124:16712"]');
  const signature = window.lhSignature;
  if (signatureSection && signature) {
    signatureSection.id='family-signature-demo';
    const node = id => signatureSection.querySelector(`[data-node-id="${id}"]`);
    const setText = (id,text) => { const el=node(id); if(el && el.textContent!==text) el.textContent=text; };
    const dialog=document.getElementById('signatureDemo');
    const showDemo=() => {
      if(!dialog.open) dialog.showModal();
      signature.refresh();
      requestAnimationFrame(() => document.getElementById('signStage').scrollIntoView({block:'nearest'}));
    };
    const control=(id,label,action) => {
      const el=node(id); if(!el) return;
      el.setAttribute('role','button'); el.setAttribute('aria-label',label); el.tabIndex=0;
      el.classList.add('lh-sign-control');
      el.addEventListener('click',action);
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});
    };
    let channel='카카오톡';
    control('124:16826','카카오톡 선택',()=>{channel='카카오톡';setText('I124:16833;538:7106','카카오톡으로 보내기');});
    control('124:16828','문자 선택',()=>{channel='문자';setText('I124:16833;538:7106','문자로 보내기');});
    control('124:16833','신청자 서명 요청 보내기',()=>signature.request(channel));
    control('124:16834','신청자 서명 요청 링크 복사하기',async()=>{
      const url=new URL(location.href);url.hash='family-signature-demo';
      signature.request(channel);
      try { await navigator.clipboard.writeText(url.href); }
      catch { const input=document.createElement('textarea');input.value=url.href;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove(); }
    });
    control('124:16807','신청자 서명 진행 현황',()=>{if(signature.state().sent) showDemo();else {node('124:16816').style.visibility='visible';node('124:16817').style.visibility='visible';}});
    control('124:16893','가족 서명 요청 확인 및 서명하기',()=>{
      if(!signature.state().sent) return;
      signature.open(); showDemo();
    });
    control('124:16741','내 서명 이미지 저장',()=>{if(signature.state().signed)document.getElementById('signSave').click();});
    setText('124:16836','신청자');
    setText('124:16838','가족');
    const hint=node('124:16914');hint?.setAttribute('aria-live','polite');
    let previous=signature.state();
    function sync(st) {
      signatureSection.dataset.signatureState=st.signed?'complete':st.sent?'waiting':'request';
      node('124:16816').style.visibility=st.sent?'hidden':'visible';
      node('124:16817').style.visibility=st.sent?'hidden':'visible';
      setText('I124:16804;538:7116',st.signed?'✓ 서명 완료':st.sent?'◷ 서명 대기':'! 가족 서명 필요');
      setText('124:16806',st.signed?'가족의 서명이 도착했어요.':st.sent?'가족의 서명을 기다리고 있어요.':'가족에게 링크를 보내 서명을 받아 주세요.');
      setText('I124:16807;538:7106',st.signed?'가족 서명 완료 확인':st.sent?'서명 진행 현황 확인':'가족에게 서명 요청');
      setText('124:16780',st.signed?'4 / 5 준비 완료':'3 / 5 준비 완료');
      setText('I124:16871;538:7112',st.signed?'✓ 서명 완료':st.sent?'◷ 서명 요청 도착':'◷ 요청 대기');
      const heading=node('124:16872');
      const lines=st.signed?['서명이 신청자에게','전달됐어요']:st.sent?['서명 요청이','도착했어요']:['신청자의 요청을','기다려 주세요'];
      heading.querySelectorAll('p').forEach((p,i)=>{p.textContent=lines[i];});
      setText('124:16879',st.sent?'임시 링크 전송 완료':'아직 요청이 없어요.');
      setText('124:16885',st.opened?'서류 내용을 확인했어요.':'요청 링크에서 서류를 확인해 주세요.');
      setText('124:16891',st.signed?'서명 완료':'서명 대기');
      setText('124:16892',st.signed?'신청자에게 서명이 전달됐어요.':'가족만 직접 서명할 수 있어요.');
      setText('I124:16893;538:7106',st.signed?'완료한 서명 확인':st.sent?'요청 확인하고 서명하기':'신청자 요청 후 서명 가능');
      node('124:16893').setAttribute('aria-disabled',String(!st.sent));
      if(hint) hint.textContent=document.getElementById('signHint').textContent;
      ['124:16716','124:16721','124:16722','124:16723'].forEach((id,index)=>{
        node(id).style.backgroundColor=index===st.step?'#fff':'#0f2339';
      });
      ['124:16717','124:16733','124:16734','124:16735'].forEach((id,index)=>{
        node(id).style.color=index===st.step?'#171717':'#fff';
      });
      node('124:16736').style.color=st.step===0?'#171717':'#fff';
      ['124:16720','124:16726','124:16729','124:16732'].forEach((id,index)=>{
        node(id).style.color=index===st.step&&index!==0?'#0056b3':'#fff';
      });
      const save=node('124:16741');if(save){save.setAttribute('aria-disabled',String(!st.signed));save.style.opacity=st.signed?'1':'.24';}
      for(const b of signatureSection.querySelectorAll('.signature-hotspot')) {
        b.removeAttribute('onclick');
        if(!b.dataset.signatureBound){
          b.dataset.signatureBound='true';
          const index=Array.from(signatureSection.querySelectorAll('.signature-hotspot')).indexOf(b);
          b.addEventListener('click',()=>{
            if(index>=4){signature.reset();return;}
            document.querySelector(`#signSteps [data-step="${index}"]`).click();
            if(index>0 && !signature.state().sent) return;
            showDemo();
          });
        }
      }
      if(motion && !reduced && (st.sent!==previous.sent || st.signed!==previous.signed)) {
        motion.fromTo(node('124:16845'),{opacity:.55},{opacity:1,duration:.45,overwrite:true});
        motion.fromTo(node('124:16749'),{opacity:.7},{opacity:1,duration:.45,overwrite:true});
      }
      previous=st;
    }
    window.addEventListener('lh:signature-state',event=>sync(event.detail));
    sync(signature.state());
  }
})();
