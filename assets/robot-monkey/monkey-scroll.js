import { createMonkeyDialogue } from './monkey-dialogue.js';

export function followPortfolioScroll(host) {
  const hero = document.getElementById('intro');
  const contents = document.getElementById('contents');
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

  host.addEventListener('robot-monkey-ready', schedule);
  function update() {
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
    const x = interpolate(1);
    // Bring the model back from the top edge as the first tile enters view.
    const sourceY = from === titleHold ? Math.max(from[2], -.12) : from[2];
    const screenY = (sourceY + (to[2] - sourceY) * eased) * vh;
    host.style.setProperty('--monkey-x', `${x * 100}vw`);
    host.style.setProperty('--monkey-y', `${screenY}px`);
    const scale = interpolate(3);
    host.inert = scale < .45 && nextIndex < 9;
    host.style.setProperty('--monkey-scale', scale);
    host.style.setProperty('--monkey-opacity', interpolate(4));

    const turnStart = poses[4][0];
    const turnEnd = poses[5][0];
    const turn = Math.max(0, Math.min(1, (y - turnStart) / (turnEnd - turnStart)));
    const turning = turn > 0 && turn < 1;
    const turnHeading = Math.PI * 2 * turn * turn * (3 - 2 * turn);
    const travelHeading = turning ? 0 : Math.sign(to[1] - from[1]) * .5 * Math.sin(Math.PI * t);
    const heading = turnHeading + travelHeading;
    const walking = Math.abs(delta) > .5 && !turning;
    const greeting = lastY < turnEnd && y >= turnEnd;
    const model = host.robotMonkey;
    let dialogueScene = null;
    if (model && document.body.classList.contains('vertical-ready')) {
      if (y < turnStart) {
        if (y < contentsApproach * .8) dialogueScene = 'welcome';
        else if (y < Math.min(poses[3][0], turnStart * .76)) dialogueScene = 'contents';
        else dialogueScene = 'keywords';
      } else if (y > turnEnd + (poses[8][0] - turnEnd) * .38 && y < leaveTitle) {
        dialogueScene = 'projects';
      }
    }
    updateDialogue(dialogueScene, x, screenY, scale);
    if (model && (delta || !stopTimer)) {
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
  [hero, contents, keywords, bridge, works, projectTitle, playgroundTile].forEach(section => layout.observe(section));
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  const titleHeader = projectTitle.closest('.project-marquee-head');
  titleHeader.addEventListener('transitionend', schedule);
  new MutationObserver(schedule).observe(titleHeader, { attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', setMotionPreference);
  setMotionPreference();
}
