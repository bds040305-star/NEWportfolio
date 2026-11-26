import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { DRACOLoader } from './vendor/DRACOLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

export const expressionNames = ['neutral', 'happy', 'sad', 'surprised', 'sleepy', 'love', 'talking', 'angry'];
export const expressionLabels = ['기본', '기쁨', '시무룩', '놀람', '졸림', '애정·만족', '말하기', '화남'];
export const motionNames = {
  idle: 'Character_Idle', wave: 'Character_Greet', legacyWave: 'Character_Arm_Wave',
  walk: 'Character_Walk_InPlace', forward: 'Character_Walk_Forward', eat: 'Character_Eat_Banana', scratch: 'Character_Scratch_Head'
};

/** Self-contained WebGL2 viewer. Asset paths are relative to this module, including on GitHub Pages. */
export async function mountRobotMonkey(host, options = {}) {
  if (!(host instanceof HTMLElement)) throw new TypeError('A character container is required.');
  if (host.robotMonkey) return host.robotMonkey;
  const lifetime = new AbortController();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, options.pixelRatio || 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(options.background || 0x000000, options.background ? 1 : 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;';
  host.appendChild(renderer.domElement);
  host.style.touchAction = 'pan-y';
  host.style.cursor = 'grab';
  host.tabIndex = 0;
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', '반려로봇 원숭이. 드래그로 회전, 클릭 또는 Enter로 랜덤 동작');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .01, 100);
  camera.zoom = options.zoom ?? 1;
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(environment, .04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = .42;
  environment.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-3, 5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -2;
  key.shadow.camera.right = key.shadow.camera.top = 2;
  key.shadow.normalBias = .015;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, .65);
  fill.position.set(4, 2, 3);
  scene.add(fill, new THREE.HemisphereLight(0xffffff, 0xc8c3bb, .5));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: .15 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.003;
  ground.receiveShadow = true;
  scene.add(ground);
  const decoder = new DRACOLoader();
  decoder.setDecoderPath(new URL('./vendor/draco/', import.meta.url).href);
  decoder.setWorkerLimit(1);
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  const textures = new THREE.TextureLoader();
  let gltf, atlas, mask, eating, greeting, eatAtlas, scratching;
  try {
    [gltf, atlas, mask, eating, greeting, eatAtlas, scratching] = await Promise.all([
      loader.loadAsync(new URL('./robot-monkey.glb', import.meta.url).href),
      textures.loadAsync(new URL('./face-atlas.png', import.meta.url).href),
      textures.loadAsync(new URL('./face-mask.png', import.meta.url).href),
      fetch(new URL('./eat-banana.json', import.meta.url)).then(response => {
        if (!response.ok) throw new Error('Eating face schedule is missing.');
        return response.json();
      }),
      fetch(new URL('./greet.json', import.meta.url)).then(response => {
        if (!response.ok) throw new Error('Greeting face schedule is missing.');
        return response.json();
      }),
      textures.loadAsync(new URL('./eat-face-atlas.png', import.meta.url).href),
      fetch(new URL('./scratch-head.json', import.meta.url)).then(response => {
        if (!response.ok) throw new Error('Scratch face schedule is missing.');
        return response.json();
      })
    ]);
  } catch (error) {
    decoder.dispose(); envTarget.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
    host.dataset.error = 'model-load-failed';
    throw error;
  }
  function tintOrangeShell(shader) {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #include <map_fragment>
      vec3 base = diffuseColor.rgb;
      // Target the orange paint while preserving the neutral and cream details.
      float orange = smoothstep(.24, .50, (base.r - base.g) / max(base.r, .05))
        * smoothstep(.06, .18, base.g - base.b);
      diffuseColor.g *= 1.0 - .27 * orange;
    `);
  }

  const pivot = new THREE.Group();
  const model = gltf.scene;
  pivot.add(model);
  scene.add(pivot);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
  const target = new THREE.Vector3(0, size.y * .51, 0);
  let head;
  const bananaMeshes = [];
  model.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = false;
    object.frustumCulled = false;
    if (object.name === 'Character_Head' || object.userData.webFace) head = object;
    if (object.material.name.startsWith('Web_Character_')) object.material.onBeforeCompile = tintOrangeShell;
    if (object.userData.bananaProp || object.name.startsWith('GEO_Banana_')) {
      bananaMeshes.push(object);
      object.visible = false;
    }
  });
  if (!head || !head.material.aoMap || !head.material.map) {
    throw new Error('The model is missing its face UV or baked material.');
  }
  const gripArms = ['L', 'R'].map(side => {
    const shoulder = model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName('upper_arm.' + side));
    const elbow = model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName('forearm.' + side));
    const wrist = model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName('hand.' + side));
    return { shoulder, elbow, wrist, rest: [shoulder.quaternion.clone(), elbow.quaternion.clone()] };
  });
  const jointPosition = new THREE.Vector3();
  const wristPosition = new THREE.Vector3();
  const gripTarget = new THREE.Vector3();
  const fromWrist = new THREE.Vector3();
  const toGrip = new THREE.Vector3();
  const parentRotation = new THREE.Quaternion();
  const adjustment = new THREE.Quaternion();
  let bookGrip = false;
  let gripLine = .57;

  function poseBookGrip() {
    gripLine = 0;
    for (const [index, arm] of gripArms.entries()) {
      const { shoulder, elbow, wrist, rest } = arm;
      shoulder.quaternion.copy(rest[0]);
      elbow.quaternion.copy(rest[1]);
      shoulder.getWorldPosition(gripTarget);
      gripTarget.add(new THREE.Vector3(index === 0 ? .06 : -.06, .16, .24));
      for (let pass = 0; pass < 6; pass++) {
        for (const joint of [elbow, shoulder]) {
          joint.getWorldPosition(jointPosition);
          wrist.getWorldPosition(wristPosition);
          joint.parent.getWorldQuaternion(parentRotation).invert();
          fromWrist.copy(wristPosition).sub(jointPosition).applyQuaternion(parentRotation).normalize();
          toGrip.copy(gripTarget).sub(jointPosition).applyQuaternion(parentRotation).normalize();
          adjustment.setFromUnitVectors(fromWrist, toGrip);
          joint.quaternion.premultiply(adjustment);
        }
      }
      wrist.getWorldPosition(wristPosition).project(camera);
      gripLine += (1 - wristPosition.y) / 4;
    }
  }

  const faceMaterial = head.material;
  const defaultEmission = faceMaterial.emissiveMap;
  const ledChannel = faceMaterial.aoMap.channel;
  atlas.flipY = false;
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.channel = ledChannel;
  atlas.minFilter = THREE.LinearFilter;
  atlas.magFilter = THREE.LinearFilter;
  atlas.generateMipmaps = false;
  atlas.wrapS = atlas.wrapT = THREE.ClampToEdgeWrapping;
  eatAtlas.flipY = false;
  eatAtlas.colorSpace = THREE.SRGBColorSpace;
  eatAtlas.channel = ledChannel;
  eatAtlas.minFilter = eatAtlas.magFilter = THREE.LinearFilter;
  eatAtlas.generateMipmaps = false;
  eatAtlas.wrapS = eatAtlas.wrapT = THREE.ClampToEdgeWrapping;
  mask.flipY = false;
  mask.colorSpace = THREE.NoColorSpace;
  mask.minFilter = THREE.LinearFilter;
  mask.generateMipmaps = false;
  const cellBounds = new THREE.Vector4(0, 0, .125, .125);
  faceMaterial.emissiveMap = atlas;
  faceMaterial.emissive.set(0xffffff);
  faceMaterial.emissiveIntensity = 3;
  faceMaterial.onBeforeCompile = shader => {
    tintOrangeShell(shader);
    shader.uniforms.monkeyScreenMask = { value: mask };
    shader.uniforms.monkeyCellBounds = { value: cellBounds };
    shader.fragmentShader = 'uniform sampler2D monkeyScreenMask;\nuniform vec4 monkeyCellBounds;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
      #include <emissivemap_fragment>
      float monkeyInside = step(monkeyCellBounds.x, vEmissiveMapUv.x)
        * step(monkeyCellBounds.y, vEmissiveMapUv.y)
        * step(vEmissiveMapUv.x, monkeyCellBounds.z)
        * step(vEmissiveMapUv.y, monkeyCellBounds.w);
      totalEmissiveRadiance *= texture2D(monkeyScreenMask, vMapUv).r * monkeyInside;
    `);
  };
  faceMaterial.customProgramCacheKey = () => 'robot-monkey-orange-face-mask';
  faceMaterial.needsUpdate = true;
  const mixer = new THREE.AnimationMixer(model);
  const actions = new Map(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
  for (const clip of Object.values(motionNames)) {
    if (!actions.has(clip)) throw new Error(`Missing animation: ${clip}`);
  }
  let currentAction, actionName = 'idle', expression = 0, manualBlink = null;
  let autoBlink = true, speaking = false, brightness = 1, faceTimer;
  let previousColumn = -1, previousExpression = -1, previousAtlas = null, eatFace = null, blink = 0, talk = 0;
  let guideYaw = 0, guidePitch = 0;
  let yaw = 0, pitch = 0, activePointer = null, lastX = 0, lastY = 0, dragDistance = 0;
  let visible = true, paused = false, disposed = false, elapsed = 0, lastTime = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function updateFace() {
    const b = Math.round(THREE.MathUtils.clamp(blink, 0, 1) * 3);
    const column = b + (talk >= .5 ? 4 : 0);
    const eatingFace = actionName === 'eat' && Number.isInteger(eatFace);
    const texture = eatingFace ? eatAtlas : atlas;
    const row = eatingFace ? eatFace : expression;
    if (column === previousColumn && row === previousExpression && texture === previousAtlas) return;
    // GLTFLoader's UV/image convention is top-left. This crop keeps every lit source pixel.
    texture.repeat.set(1 / 3, 1);
    texture.offset.set((column - 5 / 6) / 8, (row - 3.25) / 8);
    texture.updateMatrix();
    if (faceMaterial.emissiveMap !== texture) { faceMaterial.emissiveMap = texture; faceMaterial.needsUpdate = true; }
    cellBounds.set(column / 8, row / 8, (column + 1) / 8, (row + 1) / 8);
    previousColumn = column;
    previousExpression = row;
    previousAtlas = texture;
  }
  function setExpression(value, config = {}) {
    const index = typeof value === 'number' ? value : expressionNames.indexOf(value);
    if (!Number.isInteger(index) || index < 0 || index > 7) throw new RangeError('Choose one of the 8 expression names or IDs 0–7.');
    clearTimeout(faceTimer);
    expression = index;
    eatFace = null;
    speaking = expression === 6;
    blink = manualBlink ?? 0;
    talk = 0;
    updateFace();
    host.dataset.expression = expressionNames[expression];
    if (config.duration > 0) faceTimer = setTimeout(() => setExpression('neutral'), config.duration);
    return api;
  }
  function play(name = 'idle') {
    const clipName = motionNames[name] || name;
    const next = actions.get(clipName);
    if (!next) throw new RangeError(`Unknown animation: ${name}`);
    if (next === currentAction && next.isRunning()) return api;
    if (currentAction) currentAction.fadeOut(.18);
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
    const once = clipName === motionNames.wave || clipName === motionNames.legacyWave || clipName === motionNames.eat || clipName === motionNames.scratch;
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.fadeIn(.18).play();
    currentAction = next;
    actionName = Object.entries(motionNames).find(([, v]) => v === clipName)?.[0] || clipName;
    const isEating = clipName === motionNames.eat;
    for (const mesh of bananaMeshes) {
      mesh.visible = isEating;
      if (isEating && mesh.morphTargetInfluences) mesh.morphTargetInfluences.fill(0);
    }
    if (isEating || clipName === motionNames.wave || clipName === motionNames.scratch) { clearTimeout(faceTimer); speaking = false; }
    else if (host.dataset.motion === 'eat' || host.dataset.motion === 'wave' || host.dataset.motion === 'scratch') setExpression('neutral');
    host.dataset.motion = actionName;
    return api;
  }
  mixer.addEventListener('finished', event => { if (event.action === currentAction) play('idle'); });
  function greet() { return play('wave'); }
  function eatBanana() { if (actionName !== 'eat') setExpression('neutral'); return play('eat'); }
  const randomMotions = options.randomMotions ?? ['eat', 'scratch'];
  if (!Array.isArray(randomMotions) || !randomMotions.length || randomMotions.some(name => !['eat', 'scratch', 'wave'].includes(name))) {
    throw new RangeError('randomMotions must contain eat, scratch or wave.');
  }
  function scratchHead() { return play('scratch'); }
  function playRandom() {
    if (['eat', 'scratch', 'wave', 'legacyWave'].includes(actionName) && currentAction.isRunning()) return api;
    host.dispatchEvent(new Event('robot-monkey-interact'));
    return play(randomMotions[Math.floor(Math.random() * randomMotions.length)]);
  }
  function applyFaceSequence() {
    const sequence = actionName === 'eat' ? eating : actionName === 'wave' ? greeting : actionName === 'scratch' ? scratching : null;
    if (!sequence) return false;
    const index = Math.min(sequence.face_samples.length - 1, Math.max(0, Math.round(currentAction.time * sequence.fps)));
    const state = sequence.face_samples[index];
    expression = state.expression; blink = state.blink; talk = state.talk;
    eatFace = actionName === 'eat' ? state.eat_face ?? null : null;
    host.dataset.expression = expressionNames[expression];
    return true;
  }
  function resize() {
    const width = host.clientWidth || 600;
    const height = host.clientHeight || 600;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distance = Math.max(size.y / (2 * Math.tan(halfFov)), size.x / (2 * Math.tan(halfFov) * camera.aspect)) * 1.14;
    camera.position.set(0, target.y + size.y * .035, distance);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; lastTime = 0; });
  visibilityObserver.observe(host);
  const eventOptions = { signal: lifetime.signal };
  host.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    activePointer = event.pointerId; lastX = event.clientX; lastY = event.clientY; dragDistance = 0;
    host.setPointerCapture(event.pointerId); host.style.cursor = 'grabbing';
  }, eventOptions);
  host.addEventListener('pointermove', event => {
    if (activePointer !== event.pointerId) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    yaw += dx * .012; pitch = THREE.MathUtils.clamp(pitch + dy * .006, -.7, .7);
    dragDistance += Math.abs(dx) + Math.abs(dy); lastX = event.clientX; lastY = event.clientY;
  }, eventOptions);
  function release(event) {
    if (activePointer !== event.pointerId) return;
    activePointer = null; host.style.cursor = 'grab';
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    if (event.type === 'pointerup' && dragDistance < 6) playRandom();
  }
  host.addEventListener('pointerup', release, eventOptions);
  host.addEventListener('pointercancel', release, eventOptions);
  host.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); playRandom(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); yaw -= .15; }
    else if (event.key === 'ArrowRight') { event.preventDefault(); yaw += .15; }
  }, eventOptions);
  function setView(name) {
    const views = { front: 0, right: -Math.PI / 2, back: Math.PI, left: Math.PI / 2 };
    if (!(name in views)) throw new RangeError('Use front, right, back or left.');
    yaw = views[name]; pitch = 0;
    return api;
  }
  const api = {
    setExpression, play, setView,
    wave: greet,
    setBookGrip(active) {
      if (active && !bookGrip) setView('front');
      bookGrip = active;
    },
    getBookGripLine() { return gripLine; },
    setGuideMotion({ heading = 0, walking = false, greeting = false, careful = false } = {}) {
      guideYaw = heading;
      guidePitch = careful ? .12 : 0;
      if (activePointer !== null || (actionName !== 'idle' && actionName !== 'walk')) return;
      play(greeting ? 'wave' : walking ? 'walk' : 'idle');
      if (actionName === 'walk') currentAction.setEffectiveTimeScale(careful ? .66 : 1);
    },
    eatBanana, scratchHead, playRandom,
    setBlink(value = null) { manualBlink = value === null ? null : THREE.MathUtils.clamp(Number(value), 0, 1); blink = manualBlink ?? 0; updateFace(); return api; },
    setAutoBlink(value) { autoBlink = Boolean(value); if (!autoBlink && manualBlink === null) blink = 0; updateFace(); return api; },
    setTalking(value) { speaking = Boolean(value); return api; },
    setBrightness(value) { brightness = THREE.MathUtils.clamp(Number(value), 0, 2); faceMaterial.emissiveIntensity = 3 * brightness; return api; },
    pause(value = true) { paused = Boolean(value); lastTime = 0; return api; },
    seek(seconds) {
      for (const action of actions.values()) if (action !== currentAction) action.stop();
      currentAction.stopFading().setEffectiveWeight(1);
      currentAction.time = THREE.MathUtils.clamp(Number(seconds), 0, currentAction.getClip().duration - 1e-6);
      mixer.update(0);
      applyFaceSequence();
      updateFace();
      pivot.rotation.set(pitch + guidePitch, yaw + guideYaw, 0);
      renderer.render(scene, camera);
      return api;
    },
    getState() { return { randomMotions: [...randomMotions], expression, name: expressionNames[expression], action: actionName, blink, talk, brightness, paused, yaw, pitch,
      animationTime: currentAction?.time ?? 0, clip: currentAction?.getClip().name, eatFace: actionName === 'eat' ? eatFace : null,
      bananaVisible: bananaMeshes.some(mesh => mesh.visible),
      bananaBites: bananaMeshes.find(mesh => mesh.morphTargetInfluences)?.morphTargetInfluences?.slice(),
      clips: gltf.animations.map(c => c.name), triangles: renderer.info.render.triangles, faceUvChannel: ledChannel, threeVersion: THREE.REVISION }; },
    dispose() {
      if (disposed) return;
      disposed = true; clearTimeout(faceTimer); lifetime.abort(); renderer.setAnimationLoop(null);
      resizeObserver.disconnect(); visibilityObserver.disconnect(); mixer.stopAllAction();
      model.traverse(o => { if (o.isMesh) { o.geometry.dispose(); for (const m of [o.material].flat()) {
        for (const v of Object.values(m)) if (v?.isTexture) v.dispose(); m.dispose();
      } } });
      defaultEmission?.dispose(); atlas.dispose(); eatAtlas.dispose(); mask.dispose(); decoder.dispose(); envTarget.dispose(); pmrem.dispose();
      ground.geometry.dispose(); ground.material.dispose(); renderer.dispose(); renderer.domElement.remove();
      delete host.robotMonkey;
    }
  };
  host.robotMonkey = api;
  setExpression('neutral');
  play('idle');
  resize();
  renderer.setAnimationLoop(time => {
    if (disposed) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
    lastTime = time;
    if (!visible || document.hidden) { lastTime = 0; return; }
    if (!paused && !reduced.matches) { elapsed += dt; mixer.update(dt); }
    const sequencedFace = applyFaceSequence();
    if (sequencedFace) { /* Body and face share the clip clock, including pause/seek. */ }
    else if (manualBlink !== null) blink = manualBlink;
    else if (autoBlink && !paused && !reduced.matches) {
      const phase = elapsed % 3.8;
      blink = phase > 3.48 ? Math.max(0, 1 - Math.abs((phase - 3.62) / .14)) : 0;
      if (expression === 4) blink = Math.max(blink, Math.max(0, Math.sin(elapsed * .8)) * .5);
    } else blink = 0;
    if (!sequencedFace) talk = speaking && !paused && !reduced.matches ? Number(Math.sin(elapsed * 16) > .05) : 0;
    updateFace();
    pivot.rotation.set(pitch + guidePitch, yaw + guideYaw, 0);
    if (bookGrip) poseBookGrip();
    renderer.render(scene, camera);
  });
  host.dataset.loaded = 'true';
  host.classList.add('loaded');
  host.dispatchEvent(new CustomEvent('robot-monkey-ready', { detail: api }));
  return api;
}
