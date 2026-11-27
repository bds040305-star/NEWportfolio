import { createMonkeyDialogue } from './monkey-dialogue.js?v=skills-careful';

export function followPortfolioScroll(host) {
  const hero = document.getElementById('intro');
  const contents = document.getElementById('contents');
  const book = contents.querySelector('.portfolio-book');
  const experienceLanding = contents.querySelector('.experience-monkey-landing');
  const bookControls = contents.querySelector('.portfolio-book-controls');
  const contentsTitle = document.getElementById('contents-title');
  const keywords = document.getElementById('keywords');
  const skillsTitle = keywords.querySelector('h2 span');
  const keywordCloud = keywords.querySelector('.keyword-cloud');
  const restSpace = keywords.querySelector('.skills-monkey-rest');
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
  let experienceFrameTime = null;
  let experienceElapsed = 0;
  let experienceSnackStarted = false;
  let replayBookOnScroll = false;
  const experiencePause = 300;
  const experienceWalkDuration = 1550;
  const frontStep = .38;

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
    experienceFrameTime = null;
    experienceElapsed = 0;
    replayBookOnScroll = false;
    if (experienceSnackStarted && host.dataset.motion === 'eat') host.robotMonkey?.play('idle');
    experienceSnackStarted = false;
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
      experienceFrameTime = performance.now();
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
      book.removeAttribute('data-monkey-behind');
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
    const turnStart = poses[4][0];
    const skillsBounds = skillsTitle.getBoundingClientRect();
    const skillsScale = Math.min(mobile ? .24 : .28, (vw - skillsBounds.right - 14) / canvasWidth);
    const skillsX = (skillsBounds.right + 8 + canvasWidth * skillsScale * .5) / vw;
    const skillsY = skillsBounds.top + skillsBounds.height * .5;
    const restAt = turnStart - vh * .17;
    const dockAt = Math.min(skillsBounds.top + y - vh * .39, restAt - vh * .72);
    const leaveSkills = dockAt + vh * .18;
    const laneAt = leaveSkills + vh * .15;
    const floorAt = restAt - vh * .17;
    const progressBetween = (start, end, value = y) => {
      const phase = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return phase * phase * (3 - 2 * phase);
    };
    const bookOnscreen = bounds.bottom > 0 && bounds.top < vh;
    const landing = experienceLanding.getBoundingClientRect();
    const landingOnscreen = experienceFrameTime !== null && landing.bottom > 0 && landing.top < vh;
    const landingScale = mobile ? .58 * 1.12 : .72 * 1.12;
    const landingHeight = canvasHeight * landingScale;
    const lift = Math.min(landingHeight * .10, Math.max(0, landing.top - bookControls.getBoundingClientRect().bottom - 6));
    const landingY = landing.top + landingHeight * .5 - lift;
    const landingX = Math.min(vw - canvasWidth * landingScale * .5, bounds.left + bounds.width * .83) / vw;
    const hasExperience = experienceFrameTime !== null;
    const departure = Math.min(landingY + y - vh * .43, dockAt - vh * .18);
    const arrivedAtLanding = experienceElapsed >= experiencePause + experienceWalkDuration;
    const returnFrom = hasExperience ? departure : bounds.bottom + y - vh * .22;
    if (!waitingForBook && !waitingForExperience && delta < 0 && lastY >= returnFrom) {
      replayBookOnScroll = true;
    }
    // On a return visit, scrolling controls the same poses in either direction.
    const replayWalkStart = Math.max(0, Math.min(departure - vh * .24, bounds.bottom + y - vh * .68));
    const peekScroll = 1 - Math.max(0, Math.min(1, (bounds.top / vh - .43) / .38));
    const crossingToSkills = y < turnStart && (hasExperience
      ? y >= departure && (replayBookOnScroll || arrivedAtLanding || y >= dockAt)
      : y >= dockAt && !bookOnscreen);
    const peeking = peekStart !== null && (bookOnscreen || landingOnscreen) && !crossingToSkills;
    const experienceWalking = peeking && experienceFrameTime !== null;
    if (experienceFrameTime !== null) {
      // Keep the steps visible even when rendering drops a frame.
      if (experienceWalking && !replayBookOnScroll) experienceElapsed += Math.max(0, Math.min(190, now - experienceFrameTime));
      experienceFrameTime = now;
    }
    const stride = !experienceWalking ? 0 : replayBookOnScroll
      ? Math.max(0, Math.min(1, (y - replayWalkStart) / Math.max(1, departure - replayWalkStart)))
      : Math.max(0, Math.min(1, (experienceElapsed - experiencePause) / experienceWalkDuration));
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
      const rise = replayBookOnScroll ? Math.min(grip.rise, 1 - (1 - peekScroll) ** 3) : grip.rise;
      const riseOffset = coverHeight * .54 * (1 - rise);
      screenY = bounds.top + coverHeight * (.5 - grip.handLine) + riseOffset - grip.edgeLift;
      const upper = screenY - coverHeight * .5;
      const cut = Math.max(0, Math.min(100, (upper + coverHeight - bounds.top) / coverHeight * 100));
      const spineCut = Math.max(0, (centerX + coverWidth * .5 - (bounds.left + bounds.width * .50)) / coverWidth * 100);
      host.style.setProperty('--cover-grip-clip', `inset(0 ${spineCut}% ${cut}% 0)`);
      opacity = Math.min(1, rise * 4);
    }
    host.toggleAttribute('data-first-book-peek', peeking);
    book.toggleAttribute('data-monkey-behind', peeking && !mobile && stride < frontStep);
    if (waitingForBook && bookOnscreen) opacity = 0;
    if (peekStart !== null && bounds.bottom <= 0) opacity *= Math.min(1, -bounds.bottom / (vh * .18));
    if (peeking) {
      const elapsed = Math.max(0, now - peekStart);
      const t = replayBookOnScroll && !waitingForExperience
        ? Math.max(stride, peekScroll)
        : Math.max(0, Math.min(1, (elapsed - 215) / 730));
      const reach = 1 - (1 - t) ** 3 + .055 * Math.sin(Math.PI * t);
      scale = mobile ? .58 : .72;
      const width = canvasWidth * scale;
      const height = canvasHeight * scale;
      const rightMargin = width * .46 + 12;
      const mobileCenter = Math.min(vw - rightMargin, bounds.left + bounds.width * .76);
      // Keep the book edge near the torso center at full extension, allowing for the lean.
      const edgeCenter = bounds.right + width * .04;
      const centerX = mobile ? mobileCenter : edgeCenter - width * .57 * (1 - Math.min(1, reach));
      x = centerX / vw;
      screenY = mobile ? bounds.top + height * (.48 - .55 * reach) : bounds.top + bounds.height * .46;
      const release = 1 - progressBetween(0, frontStep, stride);
      const percent = (pixels, dimension) => Math.max(0, Math.min(100, 100 * pixels / dimension));
      const peekTop = screenY - height * .5;
      const lean = (mobile ? 9 : 13) * reach * release;
      if (experienceWalking) {
        const approach = stride * stride * (3 - 2 * stride);
        if (mobile) {
          x += (landingX - x) * approach;
        } else {
          const sideX = Math.max(centerX, Math.min(bounds.right + width * .13, vw - width * .42)) / vw;
          x += (sideX - x) * progressBetween(0, frontStep, stride);
          x += (landingX - x) * progressBetween(frontStep, 1, stride);
        }
        screenY += (landingY - screenY) * approach;
        scale += (landingScale - scale) * approach;
        if (!replayBookOnScroll && stride < 1) schedule();
      }
      // On wide screens the actual book silhouette occludes the monkey.
      const clip = mobile
        ? `inset(${percent(contentsTitle.getBoundingClientRect().bottom + 5 - peekTop, height) * release}% 0 ${percent(peekTop + height - bounds.top, height) * release}% 0)`
        : 'none';
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
    const settledBySkills = crossingToSkills && y >= dockAt && y <= leaveSkills;
    const carefulDescent = crossingToSkills && y > leaveSkills && y < restAt;
    const relieved = crossingToSkills && y >= restAt && y < turnStart - vh * .035;
    if (crossingToSkills) {
      const cloud = keywordCloud.getBoundingClientRect();
      const rest = restSpace.getBoundingClientRect();
      const laneWidth = Math.max(108, Math.min(vw * .24, 290));
      const laneScale = mobile ? .40 : .45;
      const laneCenter = vw - Math.max(laneWidth * .5, canvasWidth * laneScale * .5 + 12);
      const laneTop = Math.min(skillsY, cloud.top - laneScale * canvasHeight * .5 - 8);
      const laneBottom = cloud.bottom + laneScale * canvasHeight * .5 + 8;
      const restScale = mobile ? .54 : .56;
      const restY = rest.top + canvasHeight * restScale * .5;
      let targetX = skillsX;
      let targetY = skillsY;
      let targetScale = skillsScale;
      if (y >= leaveSkills && y < laneAt) {
        const move = progressBetween(leaveSkills, laneAt);
        targetX += (laneCenter / vw - targetX) * move;
        targetY += (laneTop - targetY) * move;
        targetScale += (laneScale - targetScale) * move;
      } else if (y >= laneAt && y < floorAt) {
        const move = progressBetween(laneAt, floorAt);
        targetX = (laneCenter + Math.sin(move * Math.PI * 3) * (mobile ? 3 : 6)) / vw;
        targetY = laneTop + (laneBottom - laneTop) * move;
        targetScale = laneScale;
      } else if (y >= floorAt) {
        const move = progressBetween(floorAt, restAt);
        targetScale = laneScale + (restScale - laneScale) * move;
        targetX = laneCenter / vw + (.50 - laneCenter / vw) * move;
        targetY = Math.max(laneBottom + (restY - laneBottom) * move, cloud.bottom + targetScale * canvasHeight * .5 + 8);
      }
      const enter = hasExperience ? progressBetween(departure, dockAt) : 1;
      const exit = progressBetween(restAt + vh * .085, turnStart);
      if (enter < 1) {
        x = landingX;
        screenY = landingY;
        scale = landingScale;
      }
      const weight = enter * (1 - exit);
      x += (targetX - x) * weight;
      screenY += (targetY - screenY) * weight;
      scale += (targetScale - scale) * weight;
      opacity = 1;
      if (host.dataset.motion === 'eat') model?.play('idle');
    }
    host.style.setProperty('--monkey-x', `${x * 100}vw`);
    host.style.setProperty('--monkey-y', `${screenY}px`);
    host.inert = opacity < .9 || (!peeking && !settledBySkills && !relieved && scale < .45 && nextIndex < 9);
    host.style.setProperty('--monkey-scale', scale);
    host.style.setProperty('--monkey-opacity', opacity);

    const turnEnd = poses[5][0];
    const turn = Math.max(0, Math.min(1, (y - turnStart) / (turnEnd - turnStart)));
    const turning = turn > 0 && turn < 1;
    const turnHeading = Math.PI * 2 * turn * turn * (3 - 2 * turn);
    const travelHeading = turning ? 0 : Math.sign(to[1] - from[1]) * .5 * Math.sin(Math.PI * t);
    const heading = coverActive || peeking || relieved || settledBySkills ? 0 : carefulDescent ? -.20 : turnHeading + travelHeading;
    const walking = !coverActive && !peeking && !settledBySkills && !relieved && Math.abs(delta) > .5 && !turning;
    const greeting = lastY < turnEnd && y >= turnEnd;
    let dialogueScene = relieved ? 'skillsRelief' : settledBySkills ? 'keywords' : null;
    if (model && !crossingToSkills && !coverActive && !peeking && !waitingForBook && document.body.classList.contains('vertical-ready')) {
      if (y < turnStart) {
        if (y < contentsApproach * .8) dialogueScene = 'welcome';
        else if (y < Math.min(poses[3][0], turnStart * .76)) dialogueScene = 'contents';
        else if (!hasExperience) dialogueScene = 'keywords';
      } else if (y > turnEnd + (poses[8][0] - turnEnd) * .38 && y < leaveTitle) {
        dialogueScene = 'projects';
      }
    }
    updateDialogue(dialogueScene, x, screenY, scale);
    const cornerHeading = mobile ? 0 : Math.sin(stride * Math.PI * 2) * .32;
    if (model && experienceWalking && replayBookOnScroll) {
      if (host.dataset.motion === 'eat') model.play('idle');
      model.setGuideMotion({ walking: stepping && Math.abs(delta) > .5, heading: stepping ? cornerHeading + (delta < 0 ? -.35 : 0) : 0 });
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        stopTimer = undefined;
        model.setGuideMotion();
      }, 160);
    } else if (model && experienceWalking) {
      const snackVisible = screenY > canvasHeight * scale * .28 &&
        screenY < vh - canvasHeight * scale * .28;
      if (stride === 1 && snackVisible && !experienceSnackStarted) {
        experienceSnackStarted = true;
        model.setGuideMotion();
        model.eatBanana();
      } else if (!experienceSnackStarted) {
        model.setGuideMotion({ walking: stepping, heading: cornerHeading });
      }
    } else if (model && !waitingForExperience && (delta || !stopTimer)) {
      model.setGuideMotion({ heading, walking, greeting, careful: carefulDescent });
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        stopTimer = undefined;
        model.setGuideMotion({ heading, careful: carefulDescent });
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
      book.removeAttribute('data-monkey-behind');
      host.removeAttribute('data-cover-grip');
      host.robotMonkey?.setBookGrip(false);
      waitingForBook = false;
      waitingForExperience = false;
      experienceFrameTime = null;
      experienceElapsed = 0;
      replayBookOnScroll = false;
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
  [hero, contents, book, experienceLanding, keywords, bridge, works, projectTitle, playgroundTile].forEach(section => layout.observe(section));
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  const titleHeader = projectTitle.closest('.project-marquee-head');
  titleHeader.addEventListener('transitionend', schedule);
  new MutationObserver(schedule).observe(titleHeader, { attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', setMotionPreference);
  setMotionPreference();
}
