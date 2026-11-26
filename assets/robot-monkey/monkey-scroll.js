import { createMonkeyDialogue } from './monkey-dialogue.js';

export function followPortfolioScroll(host) {
  const hero = document.getElementById('intro');
  const contents = document.getElementById('contents');
  const book = contents.querySelector('.portfolio-book');
  const contentsTitle = document.getElementById('contents-title');
  const keywords = document.getElementById('keywords');
  const bridge = document.getElementById('monkeyBridge');
  const works = document.getElementById('works');
  const projectTitle = works.querySelector('.project-title span');
  const playgroundTile = document.querySelector('#playground-monkey-box img');
  const originalParent = host.parentElement;
  const updateDialogue = createMonkeyDialogue(host);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = matchMedia('(max-width: 760px)');

  let frame = 0;
  let previousY = window.scrollY;
  let stopTimer;
  let waitingForBook = false;
  let peekStart = null;
  let blinkTimer;
  let blinked = false;
  let coverPeekStart = null;
  let coverBlinked = false;
  let waitingForExperience = false;
  let experienceStart = null;
  let experiencePosed = false;
  const experiencePause = 300;
  const experienceWalkDuration = 1550;

  function updateCoverGrip(now, active, width) {
    const model = host.robotMonkey;
    if (!active || !model) return null;
    coverPeekStart ??= now;
    const elapsed = now - coverPeekStart;
    const phase = Math.max(0, Math.min(1, (elapsed - 140) / 700));
    const rise = 1 - (1 - phase) ** 3;
    const handLine = model.getBookGripLine();
    if (elapsed < 1310) schedule();
    if (elapsed >= 1010 && !coverBlinked) {
      coverBlinked = true;
      model.setBlink(1);
      blinkTimer = setTimeout(() => model.setBlink(null), 150);
    }
    return { rise, handLine, edgeLift: Math.min(38, width * .085) };
  }

  book.addEventListener('book-turn-start', ({ detail }) => {
    if (reducedMotion.matches) return;
    waitingForBook = detail.from === 'contents' && detail.to === 'about';
    waitingForExperience = detail.from === 'about' && detail.to === 'experience';
    experienceStart = null;
    experiencePosed = false;
    if (waitingForExperience) peekStart ??= performance.now() - 1300;
    else peekStart = null;
    blinked = false;
    clearTimeout(blinkTimer);
    host.robotMonkey?.setBlink(null);
    schedule();
  });
  book.addEventListener('book-turn-finish', () => {
    if (reducedMotion.matches) return;
    if (waitingForBook) {
      waitingForBook = false;
      peekStart = performance.now();
    } else if (waitingForExperience) {
      waitingForExperience = false;
      experienceStart = performance.now();
    } else return;
    schedule();
  });

  host.addEventListener('robot-monkey-ready', schedule);
  function update(now) {
    frame = 0;
    const y = window.scrollY;
    const delta = y - previousY;
    const lastY = previousY;
    previousY = y;
    const vh = window.innerHeight;
    const mobile = smallScreen.matches;
    const top = element => element.getBoundingClientRect().top + y;
    const contentsStart = top(contents);
    const contentsApproach = contentsStart > 0 ? contentsStart - vh * .48 : vh * .24;
    const contentsDock = contentsStart + vh * (contentsStart > 0 ? .14 : .52);
    const bridgeStart = top(bridge);
    const worksStart = top(works);
    const vw = window.innerWidth;
    const bounds = book.getBoundingClientRect();
    const title = projectTitle.getBoundingClientRect();
    const tile = playgroundTile.getBoundingClientRect();
    const canvasWidth = host.clientWidth || (mobile ? vw : Math.min(vw * .58, 810));
    const canvasHeight = host.clientHeight || (mobile ? vh * .65 : Math.min(vh * .83, 790));
    const tileScale = .94 * Math.min(tile.width / canvasWidth, tile.height / canvasHeight);
    const titleGap = mobile ? 5 : 12;
    const titleScale = Math.min(mobile ? .12 : .14, Math.max(.04, (vw - title.right - titleGap * 2) / canvasWidth));
    const titleX = (title.right + titleGap + canvasWidth * titleScale * .5) / vw;
    const titleY = (title.top + title.height * .57) / vh;
    const tileX = (tile.left + tile.width * .5) / vw;
    const tileY = (tile.top + tile.height * .5) / vh;
    const tileTop = tile.top + y;
    const titleDock = worksStart - vh * .18;
    const leaveTitle = Math.max(titleDock + vh * .18, tileTop - vh * .92);
    const enterTile = Math.max(leaveTitle + vh * .20, tileTop + tile.height * .5 - vh * .55);
    const leaveTile = tileTop + tile.height;
    const titleHold = [leaveTitle, titleX, titleY, titleScale, 1];
    // Each pose specifies scroll position, viewport coordinates, scale, and opacity.
    const poses = [
      [0, mobile ? .46 : (bounds.left + bounds.width * .25) / vw, mobile ? .38 : .45, mobile ? .58 : .72, 1],
      [contentsApproach, .66, .47, .51, 1],
      [contentsDock, mobile ? .81 : .87, mobile ? .64 : .72, mobile ? .28 : .32, 1],
      [top(keywords) - vh * .48, .77, .64, .34, 1],
      [bridgeStart - vh * .6, .36, .54, .57, 1],
      [bridgeStart + vh * .22, .50, .53, 1.04, 1],
      [worksStart - vh * .79, .60, .45, .76, 1],
      [worksStart - vh * .50, mobile ? .76 : .79, .33, .39, 1],
      [titleDock, titleX, titleY, titleScale, 1],
      titleHold,
      [enterTile, tileX, tileY, tileScale, 1],
      [leaveTile, tileX, tileY, tileScale, 1]
    ];

    // Short sections can put nearby landmarks at the same scroll position.
    for (let i = 1; i < poses.length; i++) {
      poses[i][0] = Math.max(poses[i][0], poses[i - 1][0] + 1);
    }
    const last = poses.at(-1);
    const inPlayground = y >= enterTile && y < last[0];
    host.toggleAttribute('data-in-playground', inPlayground);
    host.toggleAttribute('data-offstage', y >= last[0]);
    if (y >= last[0]) {
      updateDialogue(null);
      clearTimeout(stopTimer);
      stopTimer = undefined;
      host.robotMonkey?.setGuideMotion();
      return;
    }

    const nextIndex = poses.findIndex(([start], index) => index > 0 && y < start);
    const from = poses[nextIndex - 1];
    const to = poses[nextIndex];
    const t = Math.max(0, (y - from[0]) / (to[0] - from[0]));
    const eased = t * t * (3 - 2 * t);
    const interpolate = index => from[index] + (to[index] - from[index]) * eased;
    let x = interpolate(1);
    // Bring the model back from the top edge as the first tile enters view.
    const sourceY = from === titleHold ? Math.max(from[2], -.12) : from[2];
    let screenY = (sourceY + (to[2] - sourceY) * eased) * vh;
    let scale = interpolate(3);
    let opacity = interpolate(4);
    const bookOnscreen = bounds.bottom > 0 && bounds.top < vh;
    const peeking = peekStart !== null && bookOnscreen;
    const experienceWalking = peeking && experienceStart !== null;
    const experienceTime = experienceWalking ? now - experienceStart : 0;
    const stride = Math.max(0, Math.min(1, (experienceTime - experiencePause) / experienceWalkDuration));
    const stepping = stride > 0 && stride < 1;
    const coverActive = book.dataset.state === 'contents' && !waitingForBook &&
      bounds.top > 58 && bounds.top < vh * .85 && document.body.classList.contains('vertical-ready');
    const model = host.robotMonkey;
    model?.setBookGrip(coverActive);
    host.toggleAttribute('data-cover-grip', coverActive);
    const coverScale = mobile ? .58 : .72;
    const coverWidth = canvasWidth * coverScale;
    const coverHeight = canvasHeight * coverScale;
    const grip = updateCoverGrip(now, coverActive, coverWidth);
    if (grip) {
      scale = coverScale;
      const centerX = bounds.left + bounds.width * .25;
      x = centerX / vw;
      const riseOffset = coverHeight * .54 * (1 - grip.rise);
      screenY = bounds.top + coverHeight * (.5 - grip.handLine) + riseOffset - grip.edgeLift;
      const upper = screenY - coverHeight * .5;
      const cut = Math.max(0, Math.min(100, (upper + coverHeight - bounds.top) / coverHeight * 100));
      const spineCut = Math.max(0, (centerX + coverWidth * .5 - (bounds.left + bounds.width * .50)) / coverWidth * 100);
      host.style.setProperty('--cover-grip-clip', `inset(0 ${spineCut}% ${cut}% 0)`);
      opacity = Math.min(1, grip.rise * 4);
    }
    host.toggleAttribute('data-first-book-peek', peeking);
    if (waitingForBook && bookOnscreen) opacity = 0;
    if (peekStart !== null && bounds.bottom <= 0) opacity *= Math.min(1, -bounds.bottom / (vh * .18));
    if (peeking) {
      const elapsed = Math.max(0, now - peekStart);
      const t = Math.max(0, Math.min(1, (elapsed - 215) / 730));
      const reach = 1 - (1 - t) ** 3 + .055 * Math.sin(Math.PI * t);
      scale = mobile ? .58 : .72;
      const width = canvasWidth * scale;
      const height = canvasHeight * scale;
      const rightMargin = width * .46 + 12;
      const mobileCenter = Math.min(vw - rightMargin, bounds.left + bounds.width * .76);
      const gutterCenter = Math.min((bounds.right + vw) * .5, vw - width * .40 - 12);
      const centerX = mobile ? mobileCenter : gutterCenter - width * .57 * (1 - reach);
      x = centerX / vw;
      screenY = mobile ? bounds.top + height * (.48 - .55 * reach) : bounds.top + bounds.height * .46;
      const release = 1 - Math.min(1, stride * 2.4);
      const percent = (pixels, dimension) => Math.max(0, Math.min(100, 100 * pixels / dimension)) * release;
      const top = screenY - height * .5;
      const clip = mobile
        ? `inset(${percent(contentsTitle.getBoundingClientRect().bottom + 5 - top, height)}% 0 ${percent(top + height - bounds.top, height)}% 0)`
        : `inset(0 0 0 ${percent(bounds.right - centerX + width * .5, width)}%)`;
      const lean = (mobile ? 9 : 13) * reach * release;
      if (experienceWalking) {
        const approach = stride * stride * (3 - 2 * stride);
        const finalScale = scale * 1.12;
        const standingX = mobile ? vw * .72 : bounds.left + bounds.width * .90;
        const standingY = mobile ? bounds.bottom - height * .16 : bounds.top + bounds.height * .68;
        x += (standingX / vw - x) * approach;
        screenY += (standingY - screenY) * approach;
        scale += (finalScale - scale) * approach;
        if (stride < 1) schedule();
      }
      host.style.setProperty('--first-book-peek-clip', clip);
      host.style.setProperty('--first-book-peek-lean', `${lean}deg`);
      opacity = Math.min(1, t * 5);
      if (elapsed < 1080) schedule();
      else if (!waitingForExperience && !experienceWalking && !blinked && host.robotMonkey) {
        blinked = true;
        host.robotMonkey.setBlink(1);
        blinkTimer = setTimeout(() => host.robotMonkey?.setBlink(null), 160);
      }
    }
    host.style.setProperty('--monkey-x', `${x * 100}vw`);
    host.style.setProperty('--monkey-y', `${screenY}px`);
    host.inert = opacity < .9 || (!peeking && scale < .45 && nextIndex < 9);
    host.style.setProperty('--monkey-scale', scale);
    host.style.setProperty('--monkey-opacity', opacity);

    const turnStart = poses[4][0];
    const turnEnd = poses[5][0];
    const turn = Math.max(0, Math.min(1, (y - turnStart) / (turnEnd - turnStart)));
    const turning = turn > 0 && turn < 1;
    const turnHeading = Math.PI * 2 * turn * turn * (3 - 2 * turn);
    const travelHeading = turning ? 0 : Math.sign(to[1] - from[1]) * .5 * Math.sin(Math.PI * t);
    const heading = coverActive || peeking ? 0 : turnHeading + travelHeading;
    const walking = !coverActive && !peeking && Math.abs(delta) > .5 && !turning;
    const greeting = lastY < turnEnd && y >= turnEnd;
    let dialogueScene = null;
    if (model && !coverActive && !peeking && !waitingForBook && document.body.classList.contains('vertical-ready')) {
      if (y < turnStart) {
        if (y < contentsApproach * .8) dialogueScene = 'welcome';
        else if (y < Math.min(poses[3][0], turnStart * .76)) dialogueScene = 'contents';
        else dialogueScene = 'keywords';
      } else if (y > turnEnd + (poses[8][0] - turnEnd) * .38 && y < leaveTitle) {
        dialogueScene = 'projects';
      }
    }
    updateDialogue(dialogueScene, x, screenY, scale);
    if (model && experienceWalking) {
      if (stride === 1 && !experiencePosed) {
        experiencePosed = true;
        model.setGuideMotion();
        model.setExpression('happy', { duration: 1600 });
        model.wave();
      } else if (stride < 1) {
        model.setGuideMotion({ walking: stepping });
      }
    } else if (model && !waitingForExperience && (delta || !stopTimer)) {
      model.setGuideMotion({ heading, walking, greeting });
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        stopTimer = undefined;
        model.setGuideMotion({ heading });
      }, 160);
    }
  }

  function schedule() {
    if (!reducedMotion.matches && !frame) frame = requestAnimationFrame(update);
  }

  function setMotionPreference() {
    const follow = !reducedMotion.matches;
    if (follow) {
      document.body.append(host);
    } else {
      updateDialogue(null);
      originalParent.prepend(host);
      host.removeAttribute('data-offstage');
      host.removeAttribute('data-first-book-peek');
      host.removeAttribute('data-cover-grip');
      host.robotMonkey?.setBookGrip(false);
      waitingForBook = false;
      waitingForExperience = false;
      experienceStart = null;
      peekStart = null;
      clearTimeout(blinkTimer);
      host.robotMonkey?.setBlink(null);
      host.removeAttribute('data-in-playground');
      host.inert = false;
      cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(stopTimer);
      stopTimer = undefined;
      host.robotMonkey?.setGuideMotion();
    }
    previousY = window.scrollY;
    host.classList.toggle('is-scroll-guide', follow);
    schedule();
  }

  const layout = new ResizeObserver(schedule);
  [hero, contents, book, keywords, bridge, works, projectTitle, playgroundTile].forEach(section => layout.observe(section));
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  const titleHeader = projectTitle.closest('.project-marquee-head');
  titleHeader.addEventListener('transitionend', schedule);
  new MutationObserver(schedule).observe(titleHeader, { attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', setMotionPreference);
  setMotionPreference();
}
