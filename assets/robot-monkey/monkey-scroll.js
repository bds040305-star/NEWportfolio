export function followPortfolioScroll(host) {
  const hero = document.getElementById('intro');
  const contents = document.getElementById('contents');
  const keywords = document.getElementById('keywords');
  const bridge = document.getElementById('monkeyBridge');
  const works = document.getElementById('works');
  const originalParent = host.parentElement;
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
      [worksStart - vh * .18, .89, .22, .24, 0]
    ];

    // Short sections can put nearby landmarks at the same scroll position.
    for (let i = 1; i < poses.length; i++) {
      poses[i][0] = Math.max(poses[i][0], poses[i - 1][0] + 1);
    }
    const last = poses.at(-1);
    host.toggleAttribute('data-offstage', y >= last[0]);
    if (y >= last[0]) {
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
    host.style.setProperty('--monkey-x', `${interpolate(1) * 100}vw`);
    host.style.setProperty('--monkey-y', `${interpolate(2) * vh}px`);
    const scale = interpolate(3);
    host.inert = scale < .45;
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
      originalParent.prepend(host);
      host.removeAttribute('data-offstage');
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
  [hero, contents, keywords, bridge, works].forEach(section => layout.observe(section));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', setMotionPreference);
  setMotionPreference();
}
