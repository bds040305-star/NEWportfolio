import { createMonkeyDialogue } from './monkey-dialogue.js';

export function followPortfolioScroll(host) {
  const hero = document.getElementById('intro');
  const contents = document.getElementById('contents');
  const book = contents.querySelector('.portfolio-book');
  const summon = document.getElementById('book-monkey-trigger');
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
  let summonedAt = null;

  summon.addEventListener('click', () => {
    if (summonedAt !== null) return;
    summonedAt = performance.now();
    summon.hidden = true;
    schedule();
  });

  host.addEventListener('robot-monkey-ready', () => {
    summon.hidden = false;
    schedule();
  });
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
      [0, mobile ? .46 : .31, mobile ? .38 : .45, mobile ? .58 : .72, 1],
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
    const bookRect = book.getBoundingClientRect();
    const bookEnd = bookRect.bottom + y;
    const bookHandoff = Math.min(bookEnd - vh * .14, poses[4][0]);
    const inBook = y < bookHandoff;
    if (reducedMotion.matches && (!inBook || summonedAt === null)) {
      if (host.parentElement !== originalParent) originalParent.prepend(host);
      host.classList.remove('is-scroll-guide');
      host.removeAttribute('data-offstage');
      host.inert = false;
      updateDialogue(null);
      return;
    }
    if (reducedMotion.matches && !host.classList.contains('is-scroll-guide')) {
      document.body.append(host);
      host.classList.add('is-scroll-guide');
    }
    if (inBook && summonedAt === null) {
      host.setAttribute('data-offstage', '');
      updateDialogue(null);
      return;
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
    let bookWalking = false;
    let bookWeight = 0;
    if (inBook) {
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - summonedAt) / 1350);
      const pop = Math.min(1, progress / .24);
      const walk = Math.max(0, (progress - .24) / .76);
      const walkEase = walk * walk * (3 - 2 * walk);
      const originX = bookRect.left + bookRect.width * .25;
      const originY = bookRect.top + bookRect.height * .53;
      const dockX = mobile ? Math.max(37, bookRect.left + 42) : bookRect.left * .50;
      const dockY = mobile ? bookRect.bottom + 34 : originY;
      const dockScale = mobile ? .115 : Math.min(.30, Math.max(.05, (bookRect.left - 18) / canvasWidth));
      const popScale = 1 - Math.pow(1 - pop, 3) + Math.sin(Math.PI * pop) * .16;
      bookWeight = reducedMotion.matches ? 1 : Math.min(1, (bookHandoff - y) / Math.min(vh * .28, Math.max(1, bookHandoff * .45)));
      const bookX = (originX + (dockX - originX) * walkEase) / vw;
      const bookY = originY + (dockY - originY) * walkEase - Math.sin(Math.PI * pop) * 24;
      const bookScale = popScale * (dockScale + (1 - walkEase) * (mobile ? .16 : .20));
      x += (bookX - x) * bookWeight;
      screenY += (bookY - screenY) * bookWeight;
      scale += (bookScale - scale) * bookWeight;
      bookWalking = walk > 0 && walk < 1;
      if (progress < 1) schedule();
    }
    host.style.setProperty('--monkey-x', `${x * 100}vw`);
    host.style.setProperty('--monkey-y', `${screenY}px`);
    host.inert = (inBook && now - summonedAt < 1350 && !reducedMotion.matches)
      || (!inBook && scale < .45 && nextIndex < 9);
    host.style.setProperty('--monkey-scale', scale);
    host.style.setProperty('--monkey-opacity', interpolate(4));

    const turnStart = poses[4][0];
    const turnEnd = poses[5][0];
    const turn = Math.max(0, Math.min(1, (y - turnStart) / (turnEnd - turnStart)));
    const turning = turn > 0 && turn < 1;
    const turnHeading = Math.PI * 2 * turn * turn * (3 - 2 * turn);
    const travelHeading = turning ? 0 : Math.sign(to[1] - from[1]) * .5 * Math.sin(Math.PI * t);
    const heading = turnHeading + travelHeading - (bookWalking ? .98 * bookWeight : 0);
    const walking = bookWalking || (Math.abs(delta) > .5 && !turning);
    const greeting = lastY < turnEnd && y >= turnEnd;
    const model = host.robotMonkey;
    let dialogueScene = null;
    if (model && document.body.classList.contains('vertical-ready')) {
      if (y < turnStart) {
        if (inBook && now - summonedAt < 1350 && !reducedMotion.matches) dialogueScene = null;
        else if (y < contentsApproach * .8) dialogueScene = 'welcome';
        else if (y < Math.min(poses[3][0], turnStart * .76)) dialogueScene = 'contents';
        else dialogueScene = 'keywords';
      } else if (y > turnEnd + (poses[8][0] - turnEnd) * .38 && y < leaveTitle) {
        dialogueScene = 'projects';
      }
    }
    updateDialogue(dialogueScene, x, screenY, scale);
    if (model && (bookWalking || inBook || delta || !stopTimer)) {
      model.setGuideMotion({ heading, walking, greeting });
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        stopTimer = undefined;
        model.setGuideMotion({ heading });
      }, 160);
    }
  }

  function schedule() {
    if ((!reducedMotion.matches || summonedAt !== null) && !frame) frame = requestAnimationFrame(update);
  }

  function setMotionPreference() {
    const follow = !reducedMotion.matches;
    if (follow) {
      document.body.append(host);
    } else {
      updateDialogue(null);
      originalParent.prepend(host);
      host.removeAttribute('data-offstage');
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
