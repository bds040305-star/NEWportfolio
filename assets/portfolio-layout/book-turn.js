(() => {
  const book = document.querySelector('.portfolio-book');
  if (!book) return;
  const cv = book.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const [left, right] = book.querySelectorAll('.portfolio-book-half');
  const forward = document.getElementById('book-forward');
  const back = document.getElementById('book-back');
  const hotspot = document.getElementById('book-hotspot');
  const experience = document.getElementById('book-experience-next');
  const status = document.getElementById('book-status');
  const imgC = new Image();
  const imgA = new Image();
  imgC.src = book.dataset.contentsImage;
  imgA.src = book.dataset.aboutImage;
  let current = 'contents';
  let turning = false;
  let openAboutWhenSettled = false;
  const turnDuration = 1100;
  const landingDuration = 180;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(book.clientWidth * dpr);
    cv.height = Math.round(book.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function showPage(half, image) {
    half.style.backgroundImage = 'url("' + image.src + '")';
  }

  function clipBookShape(width, height) {
    const center = width / 2;
    const foldWidth = width * .12;
    const foldDepth = Math.min(width * .012, height * .045);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(center - foldWidth, 0);
    ctx.bezierCurveTo(center - foldWidth * .35, 0, center - foldWidth * .12, foldDepth, center, foldDepth);
    ctx.bezierCurveTo(center + foldWidth * .12, foldDepth, center + foldWidth * .35, 0, center + foldWidth, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(center + foldWidth, height);
    ctx.bezierCurveTo(center + foldWidth * .35, height, center + foldWidth * .12, height - foldDepth, center, height - foldDepth);
    ctx.bezierCurveTo(center - foldWidth * .12, height - foldDepth, center - foldWidth * .35, height, center - foldWidth, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();
  }

function drawTurn(p,dir, showPrint){const W=cv.clientWidth,H=cv.clientHeight;ctx.clearRect(0,0,W,H);if(!W||!H)return;const fw=W/2;
  ctx.save();
  clipBookShape(W, H);
  // The lifted page is drawn only on the leaf, leaving blank paper beneath it.
  const liftedSide = dir === 'forward' ? fw : 0;
  const underPage = ctx.createLinearGradient(liftedSide, 0, liftedSide + fw, 0);
  underPage.addColorStop(0, dir === 'forward' ? '#e5dfd5' : '#faf7f1');
  underPage.addColorStop(1, dir === 'forward' ? '#faf7f1' : '#e5dfd5');
  ctx.fillStyle = underPage;
  ctx.fillRect(liftedSide, 0, fw, H);
  const theta=(dir==='forward'?-Math.PI*p:-Math.PI*(1-p));const cvt=Math.cos(theta),wave=Math.sin(Math.PI*p),curv=wave*.12*fw;const n=48;
// Soft contact shadow cast on receiving page by the moving paper.
ctx.save();const intensity=Math.max(0,.65*wave);let grad=ctx.createLinearGradient(fw-90,0,fw+120,0);grad.addColorStop(0,'rgba(28,18,12,0)');grad.addColorStop(.5,'rgba(28,18,12,'+(0.29*intensity)+')');grad.addColorStop(1,'rgba(28,18,12,0)');ctx.fillStyle=grad;ctx.fillRect(fw-100,0,250,H);ctx.restore();
const showingFront=(dir==='forward'?p<.5:p>=.5);const im=dir==='forward'?imgC:imgA;const halfOfImage=im.width/2;function X(u){return fw+fw*u*cvt+curv*Math.sin(Math.PI*u)*(Math.abs(cvt)*.20+ .70)}function Y(u){return -wave*H*.012*Math.sin(Math.PI*u)}function paintStrip(u0,u1){const x0=X(u0),x1=X(u1),y0=Y(u0),y1=Y(u1);if(Math.abs(x1-x0)<.008)return;const s0=showingFront?u0:(1-u1),s1=showingFront?u1:(1-u0);const sx=(dir==='forward'?halfOfImage:0)+s0*halfOfImage;const sw=(s1-s0)*halfOfImage;ctx.save();ctx.translate(x0,y0);ctx.transform((x1-x0)/(sw||1), (y1-y0)/(sw||1),0,1,0,0);if(x1<x0){ctx.translate(sw,0);ctx.scale(-1,1)}const overlap=1.5/Math.max(0.02,Math.abs((x1-x0)/(sw||1)));ctx.drawImage(im,sx,0,sw,im.height,0,0,sw+overlap,H);ctx.restore();}
const showPrintedFace = p < .5;
if (showPrint && showPrintedFace && im.complete && im.naturalWidth) {
  for (let i = 0; i < n; i++) paintStrip(i/n, (i+1)/n);
}
// Variable paper illumination and fiber highlights, rather than a rigid plastic sheen.
ctx.save();const a=X(.01),b=X(.99),lo=Math.min(a,b),hi=Math.max(a,b);ctx.beginPath();ctx.moveTo(X(0),0);for(let i=1;i<=n;i++)ctx.lineTo(X(i/n),Y(i/n));for(let i=n;i>=0;i--)ctx.lineTo(X(i/n),H+Y(i/n));ctx.closePath();ctx.clip();
if (!showPrint || !showPrintedFace) {
  const paper = ctx.createLinearGradient(lo, 0, hi, 0);
  paper.addColorStop(0, '#e9e3d9');
  paper.addColorStop(.55, '#faf7f1');
  paper.addColorStop(1, '#f1ece3');
  ctx.fillStyle = paper;
  ctx.fillRect(lo - 1, -3, hi - lo + 3, H + 9);
}
const shade=ctx.createLinearGradient(lo,0,hi,0);shade.addColorStop(0,'rgba(57,44,30,'+(.20*wave)+')');shade.addColorStop(.3,'rgba(255,253,243,'+(.12*wave)+')');shade.addColorStop(.7,'rgba(255,255,250,'+(.06*wave)+')');shade.addColorStop(1,'rgba(57,38,20,'+(.29*wave)+')');ctx.fillStyle=shade;ctx.fillRect(lo-1,-3,hi-lo+3,H+9);ctx.restore();ctx.beginPath();ctx.moveTo(X(1),Y(1));ctx.lineTo(X(1),H+Y(1));ctx.strokeStyle='rgba(87,70,50,'+(.18+.3*wave)+')';ctx.lineWidth=Math.max(1,2.4*wave);ctx.stroke();
  ctx.restore();
}

  async function turn(to) {
    if (turning || to === current) return;
    turning = true;
    const restoreFocus = [forward, back, hotspot, experience].includes(document.activeElement);
    let showPrint = current !== 'experience' && to !== 'experience';
    if (showPrint) {
      try {
        await Promise.all([imgC.decode(), imgA.decode()]);
      } catch {
        showPrint = false;
      }
    }
    const transition = { from: current, to };
    book.dispatchEvent(new CustomEvent('book-turn-start', { detail: transition }));
    function finish(animateLanding = false) {
      current = to;
      const image = to === 'contents' ? imgC : imgA;
      showPage(left, image);
      showPage(right, image);
      book.dataset.state = to;
      hotspot.hidden = forward.hidden = to !== 'contents';
      if (experience) experience.hidden = to !== 'about';
      back.hidden = to === 'contents';
      back.textContent = to === 'experience' ? '← About Me로 돌아가기' : '← 목차로 돌아가기';
      status.textContent = { contents: '목차 페이지', about: 'About Me 페이지', experience: 'Experience 페이지' }[to];
      function settle() {
        cv.classList.remove('active');
        turning = false;
        book.dispatchEvent(new CustomEvent('book-turn-finish', { detail: transition }));
        if (openAboutWhenSettled) {
          openAboutWhenSettled = false;
          turn('about');
        }
      }
      if (animateLanding) {
        const fade = cv.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: landingDuration, easing: 'ease-out'
        });
        fade.onfinish = fade.oncancel = settle;
      } else {
        settle();
      }
      if (restoreFocus) (to === 'contents' ? forward : back).focus({preventScroll:true});
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    if (current === 'experience' || to === 'experience') {
      const incoming = book.querySelector(to === 'experience'
        ? '.book-experience'
        : '.book-about-live:not(.book-experience)');
      incoming.setAttribute('aria-hidden', 'true');
      incoming.inert = true;
      incoming.classList.add('book-spread-incoming');
      const reveal = incoming.animate([
        { clipPath: to === 'experience' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', opacity: .35 },
        { clipPath: 'inset(0 0 0 0)', opacity: 1 }
      ], { duration: 440, easing: 'cubic-bezier(.35, 0, .2, 1)', fill: 'both' });
      reveal.onfinish = reveal.oncancel = () => {
        reveal.onfinish = reveal.oncancel = null;
        reveal.cancel();
        incoming.classList.remove('book-spread-incoming');
        incoming.removeAttribute('aria-hidden');
        incoming.inert = false;
        finish();
      };
      return;
    }
    if (!ctx) {
      finish();
      return;
    }
    resize();
    const dir = to === 'experience' || current === 'contents' ? 'forward' : 'backward';
    cv.classList.add('active');
    drawTurn(0, dir, showPrint);
    let start;
    function frame(time) {
      start ??= time;
      const progress = Math.min(1, (time - start) / turnDuration);
      if (progress < 1) {
        drawTurn(.5 - .5 * Math.cos(Math.PI * progress), dir, showPrint);
        requestAnimationFrame(frame);
      } else {
        drawTurn(1, dir, showPrint);
        finish(true);
      }
    }
    requestAnimationFrame(frame);
  }
  if (ctx) new ResizeObserver(resize).observe(book);
  book.addEventListener('book-open-about', () => {
    if (turning) openAboutWhenSettled = true;
    else turn('about');
  });
  forward.addEventListener('click', () => turn('about'));
  hotspot.addEventListener('click', () => turn('about'));
  experience?.addEventListener('click', () => turn('experience'));
  back.addEventListener('click', () => turn(current === 'experience' ? 'about' : 'contents'));
})();
