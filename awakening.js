// One coordinated entrance, using the two supplied character states unchanged.
export function initHeroAwakening(root) {
  const visual = root.querySelector('.original-visual');
  if (!visual) return () => {};
  const awake = visual.querySelector('.ip-awake');
  const sleep = visual.querySelector('.ip-sleep');
  const decoration = visual.querySelector('.scene-decor');
  const halo = visual.querySelector('.portrait-halo');
  const particles = visual.querySelector('.particle-field');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  let disposed = false;
  const animations = [];
  const alive = () => !disposed && visual.isConnected;
  function settle() {
    if (!alive()) return;
    visual.dataset.phase = 'awake';
    for (const animation of animations) animation.cancel();
    if (awake) { awake.style.opacity = '1'; awake.style.filter = 'brightness(1)'; }
    if (sleep) sleep.style.opacity = '0';
    if (decoration) decoration.style.opacity = '.15';
    if (halo) halo.style.opacity = '1';
    if (particles) particles.style.opacity = media.matches ? '0' : '1';
  }
  function visibility() {
    visual.classList.toggle('intro-paused', document.hidden);
    for (const animation of animations) {
      if (animation.playState === 'finished' || animation.playState === 'idle') continue;
      document.hidden ? animation.pause() : animation.play();
    }
  }
  media.addEventListener('change', () => { if (media.matches) settle(); }, { signal: controller.signal });
  document.addEventListener('visibilitychange', visibility, { signal: controller.signal });
  async function start() {
    await Promise.all([awake, sleep].filter(Boolean).map(img => img.decode().catch(() => {})));
    if (!alive()) return;
    // An unavailable sleep asset must never leave a successfully loaded portrait hidden.
    if (media.matches || !sleep?.naturalWidth || !awake?.naturalWidth) { settle(); return; }
    visual.dataset.phase = 'waking';
    const timing = { duration: 2600, delay: 700, easing: 'cubic-bezier(.22,.6,.32,1)', fill: 'both' };
    const animate = (el, frames) => { if (el) animations.push(el.animate(frames, timing)); };
    animate(awake, [{ opacity: 0, filter: 'brightness(.78)' }, { opacity: 1, filter: 'brightness(1)' }]);
    animate(sleep, [{ opacity: 1, filter: 'brightness(.78)' }, { opacity: 0, filter: 'brightness(1)' }]);
    animate(decoration, [{ opacity: .03 }, { opacity: .15 }]);
    animate(halo, [{ opacity: 0 }, { opacity: 1 }]);
    animate(particles, [{ opacity: 0 }, { opacity: 1 }]);
    visibility();
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    if (alive()) settle();
  }
  start();
  return () => {
    disposed = true;
    controller.abort();
    for (const animation of animations) animation.cancel();
  };
}
