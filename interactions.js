// Fine-pointer interaction only. Animation frames stop once movement settles.
export function initHomeInteractions(root) {
  const hero = root.querySelector('.hero');
  if (!hero) return () => {};
  const stage = root.querySelector('.home-stage') || hero;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  const buttons = [...hero.querySelectorAll('.glow-button')];
  const cards = [...root.querySelectorAll('.expertise-card')];
  let frame = 0;
  let target = { x: 0, y: 0, sx: 65, sy: 45, opacity: 0 };
  let current = { ...target };
  let activeButton = null;
  let targetMagnet = { x: 0, y: 0 };
  let magnet = { x: 0, y: 0 };
  const enabled = () => finePointer.matches && !motion.matches && !document.querySelector('dialog[open]') && !document.hidden;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  function tick() {
    frame = 0;
    if (!enabled()) { reset(); return; }
    let difference = 0;
    for (const key of Object.keys(current)) {
      current[key] += (target[key] - current[key]) * .12;
      difference += Math.abs(target[key] - current[key]);
    }
    hero.style.setProperty('--pointer-x', current.x.toFixed(4));
    hero.style.setProperty('--pointer-y', current.y.toFixed(4));
    hero.style.setProperty('--spot-x', `${current.sx.toFixed(2)}%`);
    hero.style.setProperty('--spot-y', `${current.sy.toFixed(2)}%`);
    hero.style.setProperty('--spot-opacity', current.opacity.toFixed(3));
    stage.style.setProperty('--pointer-x', current.x.toFixed(4));
    stage.style.setProperty('--pointer-y', current.y.toFixed(4));
    if (activeButton) {
      magnet.x += (targetMagnet.x - magnet.x) * .17;
      magnet.y += (targetMagnet.y - magnet.y) * .17;
      activeButton.style.setProperty('--magnet-x', `${magnet.x.toFixed(2)}px`);
      activeButton.style.setProperty('--magnet-y', `${magnet.y.toFixed(2)}px`);
      difference += Math.abs(targetMagnet.x - magnet.x) + Math.abs(targetMagnet.y - magnet.y);
    }
    if (difference > .012) frame = requestAnimationFrame(tick);
  }
  const schedule = () => { if (!frame && enabled()) frame = requestAnimationFrame(tick); };
  function reset() {
    cancelAnimationFrame(frame); frame = 0;
    current = target = { x: 0, y: 0, sx: 65, sy: 45, opacity: 0 };
    for (const prop of ['--pointer-x','--pointer-y','--spot-x','--spot-y','--spot-opacity']) hero.style.removeProperty(prop);
    stage.style.removeProperty('--pointer-x'); stage.style.removeProperty('--pointer-y');
    for (const button of buttons) { button.style.removeProperty('--magnet-x'); button.style.removeProperty('--magnet-y'); }
    for (const card of cards) card.style.removeProperty('--card-glow');
    activeButton = null; magnet = { x: 0, y: 0 };
  }
  hero.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    target = { x: x * 2 - 1, y: y * 2 - 1, sx: x * 100, sy: y * 100, opacity: 1 };
    schedule();
  }, options);
  hero.addEventListener('pointerleave', () => { target = { ...target, x: 0, y: 0, opacity: 0 }; schedule(); }, options);
  for (const button of buttons) {
    button.addEventListener('pointermove', event => {
      if (!enabled() || event.pointerType === 'touch') return;
      const rect = button.getBoundingClientRect();
      if (activeButton !== button) {
        activeButton?.style.removeProperty('--magnet-x'); activeButton?.style.removeProperty('--magnet-y');
        activeButton = button; magnet = { x: 0, y: 0 };
      }
      targetMagnet = { x: clamp((event.clientX - rect.left - rect.width / 2) * .09, -6, 6), y: clamp((event.clientY - rect.top - rect.height / 2) * .14, -4, 4) };
      schedule();
    }, options);
    button.addEventListener('pointerleave', () => { targetMagnet = { x: 0, y: 0 }; schedule(); }, options);
  }
  for (const card of cards) {
    card.addEventListener('pointermove', event => {
      if (!enabled() || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      card.style.setProperty('--card-glow', '1');
    }, options);
    card.addEventListener('pointerleave', () => card.style.removeProperty('--card-glow'), options);
  }
  motion.addEventListener('change', reset, options);
  finePointer.addEventListener('change', reset, options);
  document.addEventListener('visibilitychange', reset, options);
  document.querySelector('#contact-dialog')?.addEventListener('close', reset, options);
  hero.addEventListener('click', event => { if (event.target.closest('[data-contact]')) reset(); }, options);
  return () => { reset(); controller.abort(); };
}
