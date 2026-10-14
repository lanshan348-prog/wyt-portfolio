import { categories, profile } from './data.js';
import { artworks } from './works-data.js';
import { escapeHTML, icon } from './components.js';

export function galleryContext(path) {
  const category = categories.find(c => ['/design','/video'].includes(c.path) && (path === c.path || c.items.some(item => path === `${c.path}/${item.slug}`)));
  if (!category) return null;
  const item = category.items.find(item => path === `${category.path}/${item.slug}`) || category.items[0];
  const activePath = `${category.path}/${item.slug}`;
  return { category, item, activePath, items:artworks.filter(art => art.category === activePath) };
}

export function GalleryPage(context) {
  const { category, item, activePath, items } = context;
  const single = ['/design/banners','/design/ip-design','/design/illustrations','/design/typography'].includes(activePath);
  const markup = items.map((art, i) => `<figure class="artwork${art.spanScreens===2?' artwork-tall':''}" id="${art.id}" data-artwork-index="${i}">${art.type==='video'?`<video src="${escapeHTML(art.video || art.image)}" poster="${escapeHTML(art.poster || '')}" preload="metadata" muted playsinline width="${art.width}" height="${art.height}" aria-label="${escapeHTML(art.title)}"></video>`:`<img src="${escapeHTML(art.image)}" alt="${escapeHTML(art.title)}设计作品" width="${art.width}" height="${art.height}" loading="${i ? 'lazy' : 'eager'}" decoding="async" ${i ? '' : 'fetchpriority="high"'} />`}<figcaption><span>${String(i + 1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}</span><h2>${escapeHTML(art.title)}</h2></figcaption></figure>`).join('');
  const rendered = markup;
  const options = category.items.map(choice => `<option value="${category.path}/${choice.slug}" ${choice.slug === item.slug ? 'selected' : ''}>${escapeHTML(choice.title)}</option>`).join('');
  return `<div class="gallery-shell"><aside class="gallery-sidebar" aria-label="${escapeHTML(category.title)}分类信息"><a href="/" class="brand gallery-brand" aria-label="王钰桐作品集首页"><strong>WYT<span>.</span></strong></a><div class="gallery-identity"><h2>${escapeHTML(profile.name)}</h2><p>个人作品集</p><small>DESIGN · CREATE · INSPIRE</small></div><div class="gallery-section-label">${icon(category.icon)}<span>${escapeHTML(category.title)}<small>${category.english}</small></span></div><nav class="gallery-category-nav" aria-label="同一主题的其他分类">${category.items.map((choice, i) => `<a href="${category.path}/${choice.slug}" ${`${category.path}/${choice.slug}` === activePath ? 'aria-current="page"' : ''}><span>${String(i + 1).padStart(2,'0')}</span>${escapeHTML(choice.title)}${icon('arrow')}</a>`).join('')}</nav><label class="gallery-mobile-select"><span>切换分类</span><select class="gallery-category-select" aria-label="选择同一主题中的分类">${options}</select></label><div class="gallery-sidebar-bottom"><a href="/works">${icon('back')}返回作品导航</a><button type="button" data-contact>${icon('chat')}联系我</button></div></aside><main id="main" tabindex="-1" class="gallery-main ${single ? 'single-gallery' : ''}" aria-label="${escapeHTML(item.title)}作品浏览"><header class="gallery-toolbar"><div class="gallery-toolbar-title"><h1>${escapeHTML(item.title)}</h1><span>${items.length ? `${String(items.length).padStart(2,'0')} 件作品 · 上下滑动浏览` : '作品正在整理中'}</span></div>${items.length ? `<div class="gallery-pager"><button type="button" data-gallery-prev aria-label="上一件作品">${icon('back')}</button><output class="gallery-counter" aria-live="polite">1 / ${items.length}</output><button type="button" data-gallery-next aria-label="下一件作品">${icon('arrow')}</button></div><div class="gallery-tools"><button type="button" data-gallery-zoom="out" aria-label="缩小作品">−</button><button type="button" data-gallery-fit>适应宽度</button><button type="button" data-gallery-zoom="in" aria-label="放大作品">＋</button><button type="button" data-gallery-fullscreen>全屏</button></div>` : ''}</header>${items.length ? `<div class="gallery-content"><div class="gallery-stack">${rendered}</div><div class="gallery-end"><span>已浏览全部 ${items.length} 件作品</span><button type="button" data-gallery-start>回到第一件 ${icon('back')}</button></div></div>` : `<div class="gallery-empty"><span>${category.english} / ${escapeHTML(item.title)}</span>${icon(category.icon)}<h2>作品正在整理中</h2><p>可以从左侧选择其他${category.path === '/design' ? '设计' : '视频'}分类。</p><a href="/works">返回作品导航 ${icon('arrow')}</a></div>`}</main></div>`;
}

export function initGalleryViewer(root) {
  const main = root.querySelector('.gallery-main');
  if (!main) return () => {};
  const controller = new AbortController();
  const options = { signal:controller.signal, passive:true };
  const figures = [...main.querySelectorAll('.artwork')];
  const toolbar = main.querySelector('.gallery-toolbar');
  const counter = main.querySelector('.gallery-counter');
  const previous = main.querySelector('[data-gallery-prev]');
  const next = main.querySelector('[data-gallery-next]');
  const fullscreen = main.querySelector('[data-gallery-fullscreen]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const paired = matchMedia('(min-width:768px) and (orientation:landscape)');
  for (const figure of figures) {
    const img = figure.querySelector('img,video');
    figure.style.setProperty('--art-ratio', Number(img.getAttribute('width')) / Number(img.getAttribute('height')));
  }
  const pageSize = () => main.classList.contains('single-gallery') ? 1 : paired.matches ? 2 : 1;
  let current = 0, zoom = 1, frame = 0;
  function update() {
    frame = 0;
    if (!figures.length) return;
    const paneHeight = matchMedia('(min-width:1101px)').matches || document.fullscreenElement === main ? main.clientHeight : innerHeight;
    main.style.setProperty('--poster-fit-height', `${Math.max(100,paneHeight - toolbar.offsetHeight - 90)}px`);
    const singleHeight = Math.max(200,paneHeight - toolbar.offsetHeight);
    main.style.setProperty('--single-height',singleHeight+'px');
    main.style.setProperty('--toolbar-height',toolbar.offsetHeight+'px');
    const top = toolbar.getBoundingClientRect().bottom + 45;
    let active = 0;
    figures.forEach((figure, i) => { if ((i % pageSize() === 0) && figure.getBoundingClientRect().top <= top) active = i; });
    current = active;
    counter.textContent = `${current + 1} / ${figures.length}`;
    previous.disabled = current === 0;
    next.disabled = current >= figures.length - pageSize();
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const goTo = index => {
    if (!figures.length) return;
    figures[Math.min(figures.length - 1, Math.max(0,index))].scrollIntoView({block:'start',behavior:reduce.matches ? 'instant' : 'smooth'});
  };
  function setZoom(value) {
    zoom = Math.min(1.5,Math.max(.6,value));
    main.style.setProperty('--gallery-zoom',zoom.toFixed(2));
    main.querySelector('[data-gallery-zoom="out"]').disabled = zoom <= .6;
    main.querySelector('[data-gallery-zoom="in"]').disabled = zoom >= 1.5;
    const fit = main.querySelector('[data-gallery-fit]');
    fit.textContent = Math.abs(zoom - 1) < .01 ? '适应宽度' : `${Math.round(zoom * 100)}% · 适应宽度`;
    fit.setAttribute('aria-label','恢复适应宽度');
    schedule();
  }
  main.addEventListener('click', async event => {
    if (event.target.closest('[data-gallery-prev]')) goTo(current - pageSize());
    if (event.target.closest('[data-gallery-next]')) goTo(current + pageSize());
    if (event.target.closest('[data-gallery-start]')) goTo(0);
    const zoomButton = event.target.closest('[data-gallery-zoom]');
    if (zoomButton) setZoom(zoom + (zoomButton.dataset.galleryZoom === 'in' ? .1 : -.1));
    if (event.target.closest('[data-gallery-fit]')) { setZoom(1); main.scrollLeft = 0; }
    if (event.target.closest('[data-gallery-fullscreen]')) {
      try { document.fullscreenElement ? await document.exitFullscreen() : await main.requestFullscreen(); }
      catch { fullscreen.textContent = '全屏不可用'; fullscreen.disabled = true; }
    }
  }, { signal:controller.signal });
  main.addEventListener('scroll',schedule,options);
  window.addEventListener('scroll',schedule,options);
  window.addEventListener('resize',schedule,options);
  document.addEventListener('fullscreenchange',() => { if (fullscreen) fullscreen.textContent = document.fullscreenElement ? '退出全屏' : '全屏'; schedule(); },options);
  for (const image of main.querySelectorAll('.artwork img')) {
    image.addEventListener('error',() => {
      const notice = document.createElement('div');
      notice.className = 'artwork-unavailable';
      notice.textContent = '这件作品暂时无法加载，请刷新后重试。';
      image.hidden = true; image.after(notice);
    },{ once:true,signal:controller.signal });
  }
  if (fullscreen && (!document.fullscreenEnabled || !main.requestFullscreen)) fullscreen.hidden = true;
  update();
  return () => {
    cancelAnimationFrame(frame); controller.abort();
    if (document.fullscreenElement === main) document.exitFullscreen().catch(() => {});
  };
}
