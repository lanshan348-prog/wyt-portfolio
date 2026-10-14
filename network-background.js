// A quiet blue/violet mesh behind the homepage. No raster asset or dependency.
export function initNetworkBackground(root) {
  const stage = root.querySelector('.home-stage');
  if (!stage) return () => {};
  const layer = document.createElement('div');
  layer.className = 'mesh-layer';
  layer.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'mesh-canvas';
  layer.append(canvas);
  stage.prepend(layer);
  const ctx = canvas.getContext('2d');
  if (!ctx) { layer.remove(); return () => {}; }

  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = document.querySelector('#contact-dialog');
  let frame = 0, lastFrame = 0, elapsed = 0, disposed = false, visible = true;
  let width = 0, height = 0;
  let nodes = [], edges = [];
  const target = { x: .5, y: .5, strength: 0 };
  const pointer = { ...target };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function makeMesh() {
    const columns = width < 600 ? 8 : 13;
    const rows = width < 600 ? 10 : 8;
    nodes = [];
    edges = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const u = col / (columns - 1), v = row / (rows - 1);
        const jitter = Math.sin(index * 12.9898 + 4.14);
        nodes.push({ u, v, seed: index * 1.73, jitter, x: 0, y: 0, fade: 0 });
        if (col > 0) edges.push([index, index - 1]);
        if (row > 0) edges.push([index, index - columns]);
        if (row > 0 && col > 0 && (row + col) % 2 === 0) edges.push([index, index - columns - 1]);
        if (row > 0 && col < columns - 1 && (row + col) % 2 !== 0) edges.push([index, index - columns + 1]);
      }
    }
  }

  function draw(time) {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const amplitude = Math.min(width, height) * .058;
    const shiftX = (pointer.x - .5) * 34 * pointer.strength;
    const shiftY = (pointer.y - .5) * 24 * pointer.strength;
    const radius = Math.min(230, width * .35);
    for (const node of nodes) {
      // Two slow waves deform the triangulated surface continuously in idle mode.
      let x = width * (.025 + node.u * .95 + node.jitter * .022);
      let y = height * (.055 + node.v * .89 + Math.cos(node.seed) * .025);
      x += Math.sin(node.v * 7 + time * .24 + node.u * 2) * amplitude;
      y += Math.cos(node.u * 7 - time * .19 + node.v * 2) * amplitude;
      x += Math.cos(time * .17 + node.seed) * amplitude * .24 + shiftX;
      y += Math.sin(time * .21 + node.seed) * amplitude * .24 + shiftY;
      const dx = x - pointer.x * width, dy = y - pointer.y * height;
      const distance = Math.hypot(dx, dy);
      const influence = Math.pow(Math.max(0, 1 - distance / radius), 2) * pointer.strength;
      // Gentle local expansion responds to the pointer without pulling a bright spotlight.
      const push = influence * 24;
      x += dx / Math.max(distance, 1) * push;
      y += dy / Math.max(distance, 1) * push;
      node.x = x; node.y = y;
      const radial = Math.hypot((x / width - .51) / .57, (y / height - .48) / .65);
      node.fade = Math.pow(Math.max(0, 1 - radial), .8);
    }
    ctx.lineWidth = .7;
    for (const [from, to] of edges) {
      const a = nodes[from], b = nodes[to];
      const fade = Math.min(a.fade, b.fade);
      if (fade < .02) continue;
      const hue = 223 + ((a.u + b.u) / 2) * 43;
      ctx.strokeStyle = `hsla(${hue},72%,70%,${.3 * fade})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (const node of nodes) {
      if (node.fade < .025) continue;
      ctx.fillStyle = `hsla(${221 + node.u * 47},76%,75%,${node.fade * .48})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.05 + (node.seed % 2) * .6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const canAnimate = () => !disposed && !motion.matches && !document.hidden && visible && !dialog?.open;
  function tick(timestamp) {
    frame = 0;
    if (!canAnimate()) { lastFrame = 0; return; }
    // Cap at roughly 30 fps. Pause time never causes a catch-up jump.
    const delta = lastFrame ? timestamp - lastFrame : 34;
    if (delta >= 32) {
      elapsed += Math.min(delta, 66) / 1000;
      lastFrame = timestamp;
      for (const key of ['x', 'y', 'strength']) pointer[key] += (target[key] - pointer[key]) * .075;
      draw(elapsed);
    }
    frame = requestAnimationFrame(tick);
  }
  function resetPointer() {
    target.x = .5; target.y = .5; target.strength = 0;
    layer.dataset.mode = 'idle';
  }
  function synchronize() {
    cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
    if (motion.matches || document.hidden || dialog?.open || !finePointer.matches) resetPointer();
    if (motion.matches) {
      pointer.x = .5; pointer.y = .5; pointer.strength = 0;
      draw(0);
      layer.dataset.mode = 'static';
    } else if (canAnimate()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed) return;
    const bounds = layer.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    // Sharp enough for a faint background while keeping large display costs bounded.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeMesh(); draw(motion.matches ? 0 : elapsed);
    synchronize();
  }
  stage.addEventListener('pointermove', event => {
    if (!finePointer.matches || motion.matches || event.pointerType === 'touch' || dialog?.open) return;
    const bounds = layer.getBoundingClientRect();
    target.x = clamp((event.clientX - bounds.left) / width, 0, 1);
    target.y = clamp((event.clientY - bounds.top) / height, 0, 1);
    target.strength = 1;
    layer.dataset.mode = 'pointer';
  }, options);
  stage.addEventListener('pointerleave', resetPointer, options);
  window.addEventListener('blur', resetPointer, options);
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) resetPointer(); }, options);
  document.addEventListener('visibilitychange', synchronize, options);
  motion.addEventListener('change', synchronize, options);
  finePointer.addEventListener('change', synchronize, options);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(layer);
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; synchronize();
  });
  intersection.observe(layer);
  const modalObserver = new MutationObserver(synchronize);
  if (dialog) modalObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  resetPointer(); resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    controller.abort(); resizeObserver.disconnect(); intersection.disconnect(); modalObserver.disconnect();
    layer.remove();
  };
}
