(function () {
  'use strict';
  if (window.__haevichiDetail) return;
  const page = document.getElementById('hae-page');
  if (!page) return;
  const abort = new AbortController(), signal = abort.signal;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const designMode = new URLSearchParams(location.search).has('haevichi-design');
  const base = 'https://hellolucy0901.github.io/team-haevichi/';
  const node = id => page.querySelector('[data-node-id="' + id + '"]');
  const on = (el, type, fn, options) => el.addEventListener(type, fn, { ...options, signal });
  const live = [], selectedRooms = new Set(), disposers = [];
  let active = null, motion = null, inspector = null, lastFocus = null, resizeFrame = 0;
  function resize() { page.style.zoom = String(Math.min(innerWidth / 1920, 1)); page.style.marginInline = 'auto'; }
  resize();
  // Coordinate-only groups span the design canvas. Their transparent extent
  // must not intercept clicks intended for a neighbouring mockup.
  page.querySelectorAll('.hae-layer > div').forEach(el => {
    if (el.style.position === 'relative' && el.style.transform.includes('translate(')) el.classList.add('hae-coordinate-group');
  });
  on(window, 'resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => { resize(); window.ScrollTrigger?.refresh(); }); }, { passive: true });
  function button(label, action, cls) {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = label;
    el.dataset.haeAction = action; el.className = cls || ''; return el;
  }
  function closeLive() {
    if (!active) return;
    clearTimeout(active.timer); active.iframe?.remove(); active.iframe = null;
    active.host.dataset.liveState = 'idle'; active.start.hidden = false; active.tools.hidden = true;
    active.start.focus({ preventScroll: true }); active = null;
  }
  function openLive(item) {
    closeLive(); active = item;
    const iframe = document.createElement('iframe'); item.iframe = iframe;
    iframe.className = 'hae-live-frame'; iframe.title = item.label + ' — 실제 퍼블리싱 사이트';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.allow = 'fullscreen';
    const ratio = item.host.clientWidth / item.width;
    Object.assign(iframe.style, { width: item.width + 'px', height: item.host.clientHeight / ratio + 'px', transform: 'scale(' + ratio + ')' });
    item.host.dataset.liveState = 'loading'; item.start.hidden = true; item.tools.hidden = false;
    const fail = () => {
      if (active !== item) return;
      clearTimeout(item.timer); iframe.remove(); item.iframe = null;
      item.host.dataset.liveState = 'fallback'; item.start.hidden = false;
      item.start.querySelector('span').textContent = '사이트 직접 체험하기 ↗';
      item.start.dataset.haeAction = 'external'; item.start.dataset.url = item.url;
    };
    iframe.addEventListener('load', () => {
      if (active !== item || !item.iframe) return;
      clearTimeout(item.timer); item.host.dataset.liveState = 'ready'; iframe.focus({ preventScroll: true });
    }, { once: true });
    iframe.addEventListener('error', fail, { once: true });
    // Set src before insertion: an initial about:blank load must not consume
    // the one-shot load listener and leave a live screen's timeout running.
    item.timer = setTimeout(fail, 18000);
    iframe.src = item.url; item.host.insertBefore(iframe, item.tools);
  }
  // Only verified, corresponding published screens are embedded. The initial
  // Figma view and every original frame remain intact until the user opts in.
  function addLive(target, label, path, width, region) {
    if (!target) return;
    const host = document.createElement('div'); host.className = 'hae-live'; host.dataset.liveState = 'idle'; host.dataset.liveLabel = label; host.dataset.nativeWidth = String(width);
    if (region) Object.assign(host.style, region);
    const start = button('', 'live', 'hae-live-start'), span = document.createElement('span');
    span.textContent = '사이트 직접 체험하기'; start.append(span); start.setAttribute('aria-label', label + ' 목업 안에서 실제 사이트 탐색');
    const tools = document.createElement('div'); tools.className = 'hae-live-tools'; tools.hidden = true;
    const external = document.createElement('a'); external.href = base + path; external.target = '_blank'; external.rel = 'noopener'; external.textContent = '새 창 ↗';
    tools.append(external, button('시안으로 돌아가기', 'stop-live')); host.append(start, tools); target.append(host);
    host.dataset.liveIndex = String(live.length); live.push({ host, start, tools, label, width, url: base + path, iframe: null });
  }
  addLive(document.querySelector('.hae-hero-preview'), '메인 · 호텔/리조트 · 예약바', '', 1920);
  addLive(node('113:9728'), '웨딩', 'wedding_business.html#wedding', 1920);
  addLive(node('113:9782'), '멤버십', 'membership.html', 1920);
  addLive(node('113:10253'), 'Facility · 시설 탐색', 'facility.html#fitness', 1920);
  addLive(node('113:10337'), 'Facility · Twin Pool 상세', 'facility-ss.html#Twin%20Pool', 1920);
  addLive(node('113:10411')?.querySelector('[data-name="image 313"]'), '다이닝 태블릿', 'dining.html', 1920);
  addLive(node('113:13915'), '스페셜 오퍼', 'offers.html', 1920);
  addLive(node('113:9833'), '모바일 메인 · 예약바', '', 390);
  // The same phone shell occurs three times; reuse its measured first-screen
  // inset for the third phone without stretching or replacing the shell.
  addLive(node('113:10045'), '모바일 Facility 상세', 'facility-ss.html#Twin%20Pool', 390,
    { left: '62px', top: '19px', right: 'auto', bottom: 'auto', width: '225px', height: '489px', borderRadius: '30px' });

  function inspect(source, comparison) {
    lastFocus = document.activeElement;
    if (!inspector) {
      inspector = document.createElement('dialog'); inspector.className = 'hae-inspector';
      const close = button('×', 'close-inspector', 'hae-inspector-close'); close.setAttribute('aria-label', '확대 화면 닫기');
      const content = document.createElement('div'); content.className = 'hae-inspector-content';
      inspector.append(close, content); document.body.append(inspector);
      on(inspector, 'click', e => { if (e.target === inspector) inspector.close(); });
      on(inspector, 'close', () => { content.replaceChildren(); lastFocus?.focus({ preventScroll: true }); });
    }
    const content = inspector.querySelector('.hae-inspector-content'); content.replaceChildren();
    if (comparison) {
      const stage = document.createElement('div'); stage.className = 'hae-compare-inspect';
      const copy = (source.closest('.hae-layer') || source).cloneNode(true);
      Object.assign(copy.style, { position: 'relative', left: '0', top: '0', margin: '0' });
      stage.append(copy); content.append(stage); inspector.setAttribute('aria-label', 'Figma 객실 비교 시안 · ' + [...selectedRooms].join(', '));
    } else {
      const image = document.createElement('img'); image.src = source.currentSrc || source.src;
      image.alt = source.alt || source.closest('.hae-section')?.getAttribute('aria-label') || '해비치 디자인 상세';
      content.append(image); inspector.setAttribute('aria-label', '이미지 상세 보기');
    }
    inspector.showModal(); inspector.querySelector('button').focus();
  }
  function mockupButton(text) {
    let parent = text.parentElement;
    while (parent && parent !== page) {
      const r = parent.getBoundingClientRect();
      if (r.width >= 24 && r.width <= 180 && r.height >= 10 && r.height <= 45) return parent;
      parent = parent.parentElement;
    }
    return text.parentElement;
  }
  const compareIds = ['113:13465', '113:13501', '113:13535', '113:13664', '113:13690', '113:13677'];
  const roomNames = ['수페리어', '디럭스', '이그제큐티브'];
  compareIds.forEach((id, index) => {
    const text = node(id); if (!text) return;
    const el = mockupButton(text); el.dataset.haeAction = 'select-room'; el.dataset.room = roomNames[index % 3];
    el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-pressed', 'false');
    el.setAttribute('aria-label', roomNames[index % 3] + ' 비교 목록에 담기 — Figma 시안');
  });
  ['113:13633', '113:13788'].forEach(id => {
    const text = node(id); if (!text) return;
    const el = mockupButton(text); el.dataset.haeAction = 'compare'; el.setAttribute('role', 'button'); el.tabIndex = 0;
    el.setAttribute('aria-label', '선택 객실 비교 시안 확대');
  });
  const status = document.createElement('span'); status.className = 'hae-sr-only'; status.setAttribute('aria-live', 'polite'); page.append(status);
  ['113:12067', '113:12073', '113:12081'].forEach(id => {
    const el = node(id); if (!el) return;
    el.dataset.haeAction = 'demo-button'; el.setAttribute('role', 'button'); el.tabIndex = 0;
    el.setAttribute('aria-pressed', 'false');
  });

  // In-place design prototypes, not a claim of a published room-booking route.
  function gallery(id) {
    const root = node(id); if (!root) return;
    const images = [...root.querySelectorAll('img')].filter(img => {
      const r = img.getBoundingClientRect();
      return !/\.svg(?:$|\?)/.test(img.src) && r.width > 60 && r.height > 20 && r.width / r.height > 1.15;
    });
    const main = images.reduce((best, img) => {
      const r = img.getBoundingClientRect(), old = best?.getBoundingClientRect();
      return !old || r.width * r.height >= old.width * old.height - 1 ? img : best;
    }, null); if (!main) return;
    const sources = [...new Set(images.map(img => img.getAttribute('src')))]; if (sources.length < 2) return;
    let current = Math.max(0, sources.indexOf(main.getAttribute('src'))), pointerX = 0;
    function change(step) {
      current = (current + step + sources.length) % sources.length; main.src = sources[current]; root.dataset.galleryIndex = String(current);
      if (!reduced && window.gsap) gsap.fromTo(main, { opacity: .45 }, { opacity: 1, duration: .35, clearProps: 'opacity' });
    }
    root.dataset.gallery = id; root.setAttribute('aria-label', '객실 사진 슬라이더 — Figma 시안'); root.tabIndex = 0;
    on(root, 'keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); change(e.key === 'ArrowRight' ? 1 : -1); } });
    on(root, 'pointerdown', e => { pointerX = e.clientX; });
    on(root, 'pointerup', e => { if (Math.abs(e.clientX - pointerX) > 25) change(e.clientX < pointerX ? 1 : -1); });
    images.forEach(image => { if (image !== main) { image.style.pointerEvents = 'auto'; image.style.cursor = 'pointer'; on(image, 'click', () => { current = Math.max(0, sources.indexOf(image.getAttribute('src'))); change(0); }); } });
    root.dataset.galleryIndex = String(current);
  }
  ['113:13371', '113:12168', '113:8523'].forEach(gallery);

  function link(id, url, label) {
    const el = node(id); if (!el) return;
    el.dataset.haeAction = 'external'; el.dataset.url = url; el.setAttribute('role', 'link'); el.tabIndex = 0;
    if (label) el.setAttribute('aria-label', label);
  }
  link('113:8804', base, '실제 메인 사이트 새 창에서 열기');
  node('113:11797')?.querySelectorAll('p').forEach(text => {
    const name = text.textContent.trim().toLowerCase();
    const compact = name.replace(/\s/g, '');
    const parentBounds = text.parentElement.getBoundingClientRect();
    const target = parentBounds.width <= 600 && parentBounds.height <= 140 ? text.parentElement : text;
    if (name === 'github' || compact === 'livesite' || compact === '라이브사이트') {
      const el = target; el.dataset.haeAction = 'external';
      el.dataset.url = name === 'github' ? 'https://github.com/hellolucy0901/team-haevichi' : base;
      el.setAttribute('role', 'link'); el.tabIndex = 0;
    }
    if (compact === '전체프로젝트로돌아가기' || compact === '다음프로젝트') {
      const el = target;
      el.dataset.haeAction = compact === '다음프로젝트' ? 'next-project' : 'back';
      el.setAttribute('role', 'link'); el.tabIndex = 0;
    }
  });
  page.querySelectorAll('.hae-section img').forEach(img => {
    if (img.closest('[data-gallery],.hae-hero-preview')) return;
    const r = img.getBoundingClientRect();
    if (r.width >= 180 && r.height >= 90 && !/\.svg$/.test(img.getAttribute('src') || '')) { img.dataset.haeZoom = 'true'; img.style.pointerEvents = 'auto'; }
  });
  function action(el, event) {
    switch (el.dataset.haeAction) {
      case 'back': goBack(event); break;
      case 'next-project': location.href = new URL('lh.html', document.baseURI).href; break;
      case 'demo-button': el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')); break;
      case 'live': openLive(live[+el.closest('.hae-live').dataset.liveIndex]); break;
      case 'stop-live': closeLive(); break;
      case 'external': window.open(el.dataset.url, '_blank', 'noopener'); break;
      case 'close-inspector': inspector?.close(); break;
      case 'select-room': {
        const room = el.dataset.room; selectedRooms.has(room) ? selectedRooms.delete(room) : selectedRooms.add(room);
        page.querySelectorAll('[data-room="' + room + '"]').forEach(e => e.setAttribute('aria-pressed', String(selectedRooms.has(room))));
        status.textContent = 'Figma 비교 시안: ' + [...selectedRooms].join(', '); break;
      }
      case 'compare': if (node('113:13422')) inspect(node('113:13422'), true); break;
    }
  }
  on(document, 'click', e => {
    const target = e.target.closest('[data-hae-action]');
    if (target) { e.preventDefault(); action(target, e); return; }
    const image = e.target.closest('img[data-hae-zoom]');
    if (image && !image.closest('.hae-live') && !image.parentElement.querySelector('.hae-live')) inspect(image);
  });
  on(document, 'keydown', e => {
    const target = e.target.closest('[data-hae-action]');
    if (target && e.target.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); action(target, e); }
    if (e.key === 'Escape') closeLive();
  });
  let back = document.getElementById('hae-back');
  if (back?.classList.contains('hae-coordinate-group')) {
    const visibleLogo = back.querySelector('img')?.parentElement;
    if (visibleLogo) {
      ['id', 'role', 'tabindex', 'aria-label'].forEach(name => back.removeAttribute(name));
      visibleLogo.id = 'hae-back'; visibleLogo.setAttribute('role', 'link'); visibleLogo.tabIndex = 0;
      visibleLogo.setAttribute('aria-label', '프로젝트로 돌아가기'); back = visibleLogo;
    }
  }
  function goBack(e) {
    e.preventDefault(); closeLive();
    if (parent !== window) parent.postMessage({ type: 'haevichi-case-close' }, location.origin);
    else location.href = 'index.html#works';
  }
  if (back) { on(back, 'click', goBack); on(back, 'keydown', e => { if (e.key === 'Enter') goBack(e); }); }

  function initMotion() {
    if (reduced || designMode || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    motion = gsap.context(() => {
      gsap.fromTo(document.querySelector('.hae-hero-preview'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'power3.inOut', clearProps: 'clipPath' });
      page.querySelectorAll('.hae-section').forEach((section, index) => {
        if (!index) return;
        const titles = [...section.querySelectorAll('[data-node-id]')].filter(el => parseFloat(getComputedStyle(el).fontSize) >= 40 && el.getBoundingClientRect().height > 0 && el.textContent.trim() && !el.querySelector('[data-node-id]'));
        if (titles.length) gsap.fromTo(titles, { clipPath: 'inset(0 0 100% 0)', opacity: .25 }, {
          clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.05, stagger: .13, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 78%', once: true }, clearProps: 'clipPath,opacity'
        });
        const pictures = [...section.querySelectorAll('img')].filter(img => {
          const r = img.getBoundingClientRect(); return r.width > 240 && r.height > 160 && !/\.svg$/.test(img.getAttribute('src') || '');
        }).slice(0, index === 15 ? 2 : 4);
        if (pictures.length) gsap.fromTo(pictures, { opacity: .2, clipPath: index % 2 ? 'inset(0 8% 0 8%)' : 'inset(12% 0 0 0)' }, {
          opacity: 1, clipPath: 'inset(0 0 0 0)', duration: 1.3, stagger: .12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 72%', once: true }, clearProps: 'opacity,clipPath'
        });
      });
      const journey = document.getElementById('haevichi-section-7');
      const line = [...journey.querySelectorAll('img')].find(e => { const r = e.getBoundingClientRect(); return r.width > 800 && r.height < 300; });
      if (line) gsap.fromTo(line, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: journey, start: 'top 70%', end: 'top 20%', scrub: .65 } });
      const facility = node('113:10253');
      if (facility) gsap.fromTo(facility, { y: 44 }, { y: 0, ease: 'none', scrollTrigger: { trigger: facility, start: 'top bottom', end: 'top 40%', scrub: .8 } });
      if (innerWidth >= 1600 && node('113:9293')) ScrollTrigger.create({ trigger: '#haevichi-section-11', start: 'top top', end: '+=150', pin: node('113:9293'), pinSpacing: false, pinType: 'transform', onLeave: self => self.kill(true) });
    }, page);
    page.dataset.motionReady = 'true';
  }
  initMotion();
  if (!reduced && !designMode && window.gsap) ['113:9006', '113:9013', '113:9020', '113:9728', '113:9782', '113:10411'].forEach(id => {
    const root = node(id), image = root?.querySelector('img'); if (!root || !image) return;
    let raf = 0;
    on(root, 'pointermove', e => {
      if (e.pointerType === 'touch' || active?.host.parentElement === root) return;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect(); gsap.to(image, { x: ((e.clientX - r.x) / r.width - .5) * 5, y: ((e.clientY - r.y) / r.height - .5) * 5, scale: 1.012, duration: .55, overwrite: 'auto' });
      });
    });
    on(root, 'pointerleave', () => { cancelAnimationFrame(raf); gsap.to(image, { x: 0, y: 0, scale: 1, duration: .6, overwrite: 'auto', clearProps: 'transform' }); });
    disposers.push(() => cancelAnimationFrame(raf));
  });
  let oceanRequested = false;
  const load = src => new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.append(s); });
  const hero = document.getElementById('haevichi-section-0');
  if (!reduced && !designMode) on(hero, 'pointerenter', async () => {
    if (oceanRequested) return; oceanRequested = true;
    try { if (!window.THREE) await load('assets/vendor/three-r128.min.js'); await load('assets/haevichi/ocean.js'); window.HaevichiOcean?.mount(node('113:8623')); }
    catch (_) { hero.dataset.oceanState = 'css-fallback'; }
  }, { once: true });
  function settle() { motion?.revert(); motion = null; page.dataset.motionReady = 'settled'; window.HaevichiOcean?.stop(); }
  const api = { live, selectedRooms, settle, closeLive, get active() { return active; }, destroy() { closeLive(); inspector?.close(); settle(); abort.abort(); cancelAnimationFrame(resizeFrame); disposers.forEach(fn => fn()); } };
  window.__haevichiDetail = api;
  on(window, 'pagehide', () => api.destroy(), { once: true });
})();
