(() => {
  const book = document.querySelector('.portfolio-book');
  if (!book) return;
  const cv = book.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const [left, right] = book.querySelectorAll('.portfolio-book-half');
  const forward = document.getElementById('book-forward');
  const back = document.getElementById('book-back');
  const hotspot = document.getElementById('book-hotspot');
  const status = document.getElementById('book-status');
  const imgC = new Image();
  const imgA = new Image();
  imgC.src = book.dataset.contentsImage;
  imgA.src = book.dataset.aboutImage;
  let current = 'contents';
  let turning = false;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(book.clientWidth * dpr);
    cv.height = Math.round(book.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function showPage(half, image) {
    half.style.backgroundImage = 'url("' + image.src + '")';
  }

function drawTurn(p,dir){const W=cv.clientWidth,H=cv.clientHeight;ctx.clearRect(0,0,W,H);if(!W||!H)return;const fw=W/2,theta=(dir==='forward'?-Math.PI*p:-Math.PI*(1-p));const cvt=Math.cos(theta),wave=Math.sin(Math.PI*p),curv=wave*.12*fw;const n=48;
// Soft contact shadow cast on receiving page by the moving paper.
ctx.save();const intensity=Math.max(0,.65*wave);let grad=ctx.createLinearGradient(fw-90,0,fw+120,0);grad.addColorStop(0,'rgba(28,18,12,0)');grad.addColorStop(.5,'rgba(28,18,12,'+(0.29*intensity)+')');grad.addColorStop(1,'rgba(28,18,12,0)');ctx.fillStyle=grad;ctx.fillRect(fw-100,0,250,H);ctx.restore();
const showingFront=(dir==='forward'?p<.5:p>=.5);const im=dir==='forward'?imgC:imgA;const halfOfImage=im.width/2;function X(u){return fw+fw*u*cvt+curv*Math.sin(Math.PI*u)*(Math.abs(cvt)*.20+ .70)}function Y(u){return -wave*H*.012*Math.sin(Math.PI*u)}function paintStrip(u0,u1){const x0=X(u0),x1=X(u1),y0=Y(u0),y1=Y(u1);if(Math.abs(x1-x0)<.008)return;const s0=showingFront?u0:(1-u1),s1=showingFront?u1:(1-u0);const sx=(dir==='forward'?halfOfImage:0)+s0*halfOfImage;const sw=(s1-s0)*halfOfImage;ctx.save();ctx.translate(x0,y0);ctx.transform((x1-x0)/(sw||1), (y1-y0)/(sw||1),0,1,0,0);if(x1<x0){ctx.translate(sw,0);ctx.scale(-1,1)}const overlap=1.5/Math.max(0.02,Math.abs((x1-x0)/(sw||1)));ctx.drawImage(im,sx,0,sw,im.height,0,0,sw+overlap,H);ctx.restore();}
if(im.complete&&im.naturalWidth){for(let i=0;i<n;i++)paintStrip(i/n,(i+1)/n)}
// Variable paper illumination and fiber highlights, rather than a rigid plastic sheen.
ctx.save();const a=X(.01),b=X(.99),lo=Math.min(a,b),hi=Math.max(a,b);ctx.beginPath();ctx.moveTo(X(0),0);for(let i=1;i<=n;i++)ctx.lineTo(X(i/n),Y(i/n));for(let i=n;i>=0;i--)ctx.lineTo(X(i/n),H+Y(i/n));ctx.closePath();ctx.clip();const shade=ctx.createLinearGradient(lo,0,hi,0);shade.addColorStop(0,'rgba(57,44,30,'+(.20*wave)+')');shade.addColorStop(.3,'rgba(255,253,243,'+(.12*wave)+')');shade.addColorStop(.7,'rgba(255,255,250,'+(.06*wave)+')');shade.addColorStop(1,'rgba(57,38,20,'+(.29*wave)+')');ctx.fillStyle=shade;ctx.fillRect(lo-1,-3,hi-lo+3,H+9);ctx.restore();ctx.beginPath();ctx.moveTo(X(1),Y(1));ctx.lineTo(X(1),H+Y(1));ctx.strokeStyle='rgba(87,70,50,'+(.18+.3*wave)+')';ctx.lineWidth=Math.max(1,2.4*wave);ctx.stroke();}

  async function turn(to) {
    if (turning || to === current) return;
    turning = true;
    const restoreFocus = [forward, back, hotspot].includes(document.activeElement);
    try {
      await Promise.all([imgC.decode(), imgA.decode()]);
    } catch {
      turning = false;
      if (to === 'about') document.getElementById('profile-dialog').showModal();
      return;
    }
    function finish() {
      current = to;
      const image = to === 'about' ? imgA : imgC;
      showPage(left, image);
      showPage(right, image);
      book.dataset.state = to;
      cv.classList.remove('active');
      hotspot.hidden = forward.hidden = to === 'about';
      back.hidden = to === 'contents';
      status.textContent = to === 'about' ? 'About Me 페이지' : '목차 페이지';
      turning = false;
      if (restoreFocus) (to === 'about' ? back : forward).focus({preventScroll:true});
    }
    if (!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    resize();
    const dir = to === 'about' ? 'forward' : 'backward';
    drawTurn(0, dir);
    cv.classList.add('active');
    let start;
    function frame(time) {
      start ??= time;
      const progress = Math.min(1, (time - start) / 1850);
      if (progress < 1) {
        drawTurn(.5 - .5 * Math.cos(Math.PI * progress), dir);
        requestAnimationFrame(frame);
      } else {
        finish();
      }
    }
    requestAnimationFrame(frame);
  }
  if (ctx) new ResizeObserver(resize).observe(book);
  forward.addEventListener('click', () => turn('about'));
  hotspot.addEventListener('click', () => turn('about'));
  back.addEventListener('click', () => turn('contents'));
})();
