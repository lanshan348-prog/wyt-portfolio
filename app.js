import { AppProjectPage, initAppProject } from './app-project.js';
import { filmProjectForPath } from './film-projects.js';
import { ChiyanPage, initChiyanPlayer } from './chiyan-page.js';
import { initMediaPreview } from './media-preview.js';
import { ResumePage, initResumeView } from './career.js';
import { profile, resolveRoute } from './data.js';
import { HomePage, WorksPage, ProfilePage, PlaceholderPage, ContactModal, HeroVisual } from './components.js';
import { initHomeInteractions } from './interactions.js';
import { initHeroAwakening } from './awakening.js';
import { initNetworkBackground } from './network-background.js';
import { GalleryPage, galleryContext, initGalleryViewer } from './gallery.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#contact-dialog');
let contactTrigger = null;
let cleanupInteractions = () => {};

const basePath = "/wyt-portfolio";
function routePath(path) {
  const clean = path === basePath ? '/' : path.startsWith(basePath + '/') ? path.slice(basePath.length) : path;
  return clean.replace(/\/+$/, '') || '/';
}
function currentPath() {
  return routePath(location.pathname);
}
function render(focus = false) {
  cleanupInteractions();
  const path = currentPath();
  const route = resolveRoute(path);
  const film = filmProjectForPath(path);
  const gallery = galleryContext(film ? '/video/'+film.category : path);
  app.innerHTML = path === '/' ? HomePage() : path === '/works' ? WorksPage() : path === '/about/introduction' ? ProfilePage() : path === '/about/resume' ? ResumePage() : path === '/design/app-design' ? AppProjectPage(gallery) : film ? ChiyanPage(gallery, film.slug) : gallery ? GalleryPage(gallery) : PlaceholderPage(route);
  for (const link of app.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//') && href !== basePath && !href.startsWith(basePath + '/')) link.setAttribute('href', basePath + href);
  }
  document.title = `${path === '/' ? '个人作品集' : path === '/works' ? '探索我的作品' : path === '/about/introduction' ? '个人简介' : film?.title || route?.title || '页面暂未找到'} | ${profile.name}`;
  document.body.dataset.page = path === '/' ? 'home' : gallery ? 'gallery' : 'works';
  const stopPointer = initHomeInteractions(app);
  const stopIntro = initHeroAwakening(app);
  const stopNetwork = initNetworkBackground(app);
  const stopGallery = initGalleryViewer(app);
  const stopResume = initResumeView(app);
  const stopMedia = initMediaPreview(app);
  const stopChiyan = initChiyanPlayer(app);
  const stopAppProject = initAppProject(app);
  cleanupInteractions = () => { stopAppProject(); stopChiyan(); stopMedia(); stopResume(); stopGallery(); stopNetwork(); stopIntro(); stopPointer(); };
  const image = app.querySelector('.ip-awake');
  const reference = app.querySelector('.reference-frame img');
  reference?.addEventListener('error', async () => {
    const { HeroVisual } = await import('./components.js');
    const previous = profile.heroReference;
    profile.heroReference = null;
    app.querySelector('.hero-visual').outerHTML = HeroVisual();
    profile.heroReference = previous;
  }, { once: true });
  if (image) {
    const visual = app.querySelector('.orbital-art');
    const loaded = () => { visual?.setAttribute('aria-hidden', 'true'); image.parentElement.classList.add('has-ip'); };
    image.addEventListener('load', loaded);
    image.addEventListener('error', () => {
      const previous = profile.heroImage;
      profile.heroImage = null;
      image.parentElement.outerHTML = HeroVisual();
      profile.heroImage = previous;
    }, { once: true });
    if (image.complete && image.naturalWidth > 0) loaded();
  }
  if (focus) document.querySelector('#main').focus({ preventScroll: true });
}
function navigate(path) {
  if (currentPath() === path) return;
  if (dialog.open) dialog.close();
  history.pushState({}, '', basePath + path);
  render(true);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
document.addEventListener('click', event => {
  const contact = event.target.closest('[data-contact]');
  if (contact) {
    contactTrigger = contact;
    dialog.innerHTML = ContactModal();
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector('.close-dialog').focus();
    return;
  }
  if (event.target.closest('.close-dialog')) { dialog.close(); return; }
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href);
  if (url.origin === location.origin && !url.hash && url.protocol.startsWith('http')) {
    event.preventDefault();
    navigate(routePath(url.pathname));
  }
});
dialog.addEventListener('click', async event => {
  const copyButton = event.target.closest('[data-copy-contact]');
  if (copyButton) {
    const value = copyButton.dataset.copyContact;
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); copied = true; } } catch {}
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = value; field.setAttribute('aria-label','待复制联系方式');
      field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;width:1px;height:1px';
      dialog.append(field); field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch {}
      field.remove(); if (copyButton.isConnected) copyButton.focus();
    }
    if (copyButton.isConnected) {
      copyButton.textContent = copied ? '已复制' : '请手动复制';
      dialog.querySelector('.contact-copy-feedback').textContent = copied ? '已复制：'+value : '复制未成功，请选中联系方式手动复制。';
      setTimeout(()=>{if(copyButton.isConnected)copyButton.textContent='复制';},1800);
    }
    return;
  }
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (contactTrigger?.isConnected) contactTrigger.focus();
});
window.addEventListener('popstate', () => { if (dialog.open) dialog.close(); render(true); });
document.addEventListener('change', event => {
  if (event.target.matches('.gallery-category-select')) navigate(event.target.value);
});
render();
