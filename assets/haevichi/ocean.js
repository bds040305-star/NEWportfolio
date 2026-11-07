(function () {
  'use strict';
  if (window.HaevichiOcean) return;
  let renderer, material, geometry, texture, canvas, root, observer, raf = 0;
  let strength = 0, target = 0, visible = true, last = 0, frames = 0, disposed = false, idleTimer = 0;
  const pointer = { x: .5, y: .5 };
  function stop() {
    target = 0; strength = 0; clearTimeout(idleTimer); cancelAnimationFrame(raf); raf = 0;
    if (canvas) canvas.style.opacity = '0';
    if (root) root.dataset.oceanState = 'idle';
  }
  function draw(time) {
    raf = 0;
    if (disposed || !visible || document.hidden || !renderer) return;
    strength += (target - strength) * .13;
    if (time - last >= 32) {
      material.uniforms.amount.value = strength;
      material.uniforms.time.value = time / 1000;
      material.uniforms.pointer.value.set(pointer.x, pointer.y);
      canvas.style.opacity = String(strength * .08);
      renderer.render(material.userData.scene, material.userData.camera);
      last = time; root.dataset.oceanFrames = String(++frames);
    }
    if (Math.abs(target - strength) > .001) raf = requestAnimationFrame(draw);
    else if (target === 0) stop();
    else root.dataset.oceanState = 'resting';
  }
  function wake() { if (!raf && visible && !document.hidden && !disposed) raf = requestAnimationFrame(draw); }
  function move(event) {
    const r = root.getBoundingClientRect();
    pointer.x = (event.clientX - r.left) / r.width; pointer.y = 1 - (event.clientY - r.top) / r.height;
    target = 1; root.dataset.oceanState = 'responding'; strength *= .85; wake();
    clearTimeout(idleTimer); idleTimer = setTimeout(leave, 220);
  }
  function leave() { target = 0; wake(); }
  function dispose() {
    if (disposed) return; disposed = true; stop(); observer?.disconnect();
    root?.removeEventListener('pointermove', move); root?.removeEventListener('pointerleave', leave);
    texture?.dispose(); geometry?.dispose(); material?.dispose(); renderer?.dispose(); canvas?.remove();
  }
  async function mount(element) {
    if (!element || renderer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root = element;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(1); renderer.setSize(960, 753);
      canvas = renderer.domElement; canvas.className = 'hae-ocean'; canvas.setAttribute('aria-hidden', 'true');
      root.prepend(canvas);
      texture = await new THREE.TextureLoader().loadAsync('assets/haevichi/images/hero-ocean.png');
      material = new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: {
        image: { value: texture }, time: { value: 0 }, amount: { value: 0 }, pointer: { value: new THREE.Vector2(.5, .5) }
      }, vertexShader: 'varying vec2 uvImage;void main(){uvImage=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader: `
        uniform sampler2D image; uniform float time; uniform float amount; uniform vec2 pointer; varying vec2 uvImage;
        void main(){vec2 uv=uvImage;float d=distance(uv,pointer);float ripple=sin(d*22.-time*1.2)*.0015*amount;
        vec3 sea=texture2D(image,clamp(uv+vec2(ripple,ripple*.4),.001,.999)).rgb;
        gl_FragColor=vec4(mix(sea,vec3(1.),.76),1.);}` });
      geometry = new THREE.PlaneGeometry(2, 2);
      const scene = new THREE.Scene(), camera = new THREE.Camera(); scene.add(new THREE.Mesh(geometry, material));
      material.userData = { scene, camera }; canvas.style.opacity = '0'; root.dataset.oceanState = 'idle';
      root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', leave, { passive: true });
      observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) stop(); }); observer.observe(root);
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
      window.addEventListener('pagehide', dispose, { once: true });
    } catch (_) { dispose(); root.dataset.oceanState = 'css-fallback'; }
  }
  window.HaevichiOcean = { mount, stop, dispose, get frames() { return frames; } };
})();
