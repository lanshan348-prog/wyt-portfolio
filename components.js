import { CareerSections } from './career.js';
import { profile, expertise, categories } from './data.js';

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}
const paths = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Z"/><path d="m2 13 10 6 10-6M2 17l10 6 10-6"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="M21 2v4m-2-2h4"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m16 10 6-4v12l-6-4Z"/>',
  clapperboard: '<path d="m3 8 18-4-1-4L2 4Zm0 0v13h18V8M6 3l3 4m4-6 3 4M3 12h18"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><path d="M7 3a10 10 0 0 1 13 13M4 8a10 10 0 0 0 13 13"/>',
  palette: '<path d="M21 12a9 9 0 1 0-9 9h2a3 3 0 0 0 2-5 2 2 0 0 1 2-3h1a2 2 0 0 0 2-1Z"/><circle cx="7" cy="9" r=".8"/><circle cx="11" cy="6" r=".8"/><circle cx="16" cy="7" r=".8"/><circle cx="6" cy="14" r=".8"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 6 9 7 9-7"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z"/>',
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkles}</svg>`;
}
export function Header(page = 'home') {
  return `<header class="site-header"><a class="brand" href="/" aria-label="王钰桐作品集首页"><strong>WYT<span>.</span></strong><span class="brand-divider"></span><span class="brand-label">PORTFOLIO</span></a>${page === 'home' ? '<div class="header-note"><span class="status-dot"></span>VISUAL DESIGN <span class="multiply">×</span> AIGC CREATION</div>' : `<a class="back-link" href="/">${icon('back')}<span>返回首页</span><small>HOME</small></a>`}</header>`;
}
export function GlowButton(label, english, href = null, secondary = false, iconName = null) {
  const attrs = href ? `href="${href}"` : 'type="button" data-contact';
  const tag = href ? 'a' : 'button';
  return `<${tag} ${attrs} class="glow-button glass-button ${secondary ? 'secondary' : 'primary'}"><span>${label}<small>${english}</small></span>${icon(iconName || (secondary ? 'chat' : 'arrow'))}</${tag}>`;
}
export function HeroVisual() {
  if (profile.heroImage) return `<div class="hero-visual original-visual" data-phase="sleeping"><div class="portrait-halo" aria-hidden="true"></div><div class="scene-decor" aria-hidden="true"><div class="scene-plane plane-one"></div><div class="scene-plane plane-two"></div><div class="scene-orbit"></div><div class="scene-grid"></div><div class="scene-star">✦</div><span class="scene-caption">DESIGN CREATES<br>MORE POSSIBILITIES.</span></div>${profile.heroClosedImage ? `<img class="hero-ip ip-sleep" src="${escapeHTML(profile.heroClosedImage)}" alt="" aria-hidden="true" fetchpriority="high" decoding="async" />` : ''}<img class="hero-ip ip-awake" src="${escapeHTML(profile.heroImage)}" alt="王钰桐的原创霓虹粉 X 装甲少年 IP 形象" fetchpriority="high" decoding="async" /><div class="particle-field" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${12 + (i * 37 % 80)}%;--travel:${7 + i % 6}s;--start:${-(i * 1.7)}s;--drift:${i % 2 ? 12 : -12}px;--size:${i % 4 === 0 ? 3 : 2}px"></i>`).join('')}</div></div>`;
  if (!profile.heroImage && profile.heroReference) return `<div class="hero-visual reference-visual"><div class="visual-coordinate top">ORIGINAL IP / WYT.</div><div class="reference-backdrop" aria-hidden="true"><span></span><span></span><span></span></div><div class="reference-frame"><img src="${escapeHTML(profile.heroReference)}" alt="静态作品集封面中的原创赛博朋克 IP 人物" /></div><div class="visual-side" aria-hidden="true">CREATIVITY WITHOUT LIMITS</div><div class="visual-caption"><span class="tiny-cross">✦</span><span>DESIGN MEETS<br><b>INFINITE POSSIBILITIES.</b></span><span class="caption-line"></span><span class="visual-index">[ WYT / 01 ]</span></div></div>`;
  return `<div class="hero-visual"><div class="visual-coordinate top">CREATIVE SPACE / 01</div><div class="orbital-art" role="img" aria-label="粉紫色抽象轨道装置，待替换为个人 IP 素材"><div class="art-grid"></div><div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div><div class="orbit-ring ring-three"></div><div class="core-glass"><span class="core-star">✦</span></div><div class="orbit-dot dot-one"></div><div class="orbit-dot dot-two"></div><div class="axis axis-one"></div><div class="axis axis-two"></div></div>${profile.heroImage ? `<img class="hero-ip" src="${escapeHTML(profile.heroImage)}" alt="${escapeHTML(profile.name)}的原创 IP 形象" />` : ''}<div class="visual-side" aria-hidden="true">IMAGINATION, IN MOTION</div><div class="visual-caption"><span class="tiny-cross">+</span><span>DESIGN MEETS<br><b>INFINITE POSSIBILITIES.</b></span><span class="caption-line"></span><span class="visual-index">[ WYT / 01 ]</span></div></div>`;
}
export function HeroSection() {
  return `<section class="hero"><div class="hero-light" aria-hidden="true"></div><div class="hero-copy"><div class="eyebrow reveal"><span></span>WANG YUTONG / CREATIVE PORTFOLIO</div><h1 class="reveal delay-1"><span class="name">${escapeHTML(profile.name)}</span><span class="chinese-title">个人作品集<span class="site-suffix">网站</span></span><span class="portfolio-word">PORTFOLIO<i>.</i></span></h1><div class="hero-description reveal delay-2"><p class="role">${escapeHTML(profile.role)}</p><p class="tagline">${escapeHTML(profile.tagline)}</p></div><div class="hero-actions reveal delay-3">${GlowButton('查看作品', 'VIEW WORKS', '/works')}${GlowButton('联系我', 'CONTACT ME', null, true)}${GlowButton('个人简介', 'ABOUT ME', '/about/introduction', true, 'user')}</div></div></section>`;
}
export function ExpertiseCard(item, index) {
  return `<a href="${escapeHTML(item.href)}" class="expertise-card reveal expertise-${index}" style="--delay:${180 + index * 70}ms"><span class="expertise-index">0${index + 1}</span><div class="expertise-icon">${icon(item.icon)}</div><div class="expertise-copy"><h3>${item.title}</h3><span>${item.english}</span><p>${item.text}</p></div><div class="expertise-art" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></a>`;
}
export function HomePage() {
  return `<div class="home-stage"><div class="stage-art">${HeroVisual()}</div>${Header()}<main id="main" tabindex="-1" class="home-page page-enter">${HeroSection()}<section class="expertise-section" aria-labelledby="expertise-title"><div class="section-label"><h2 id="expertise-title">专业能力 <span>PROFESSIONAL EXPERTISE</span></h2><span class="section-counter">01 — 04</span></div><div class="expertise-grid">${expertise.map(ExpertiseCard).join('')}</div></section></main>${Footer('home')}</div>`;
}
export function CategoryItem(item, category, index) {
  return `<a class="category-item" href="${category.path}/${item.slug}"><span class="item-number">${String(index + 1).padStart(2, '0')}</span><span>${item.title}</span>${icon('arrow')}</a>`;
}
export function CategoryColumn(category, index) {
  return `<article class="category-column reveal column-${index}" style="--delay:${index * 100}ms"><a href="${category.path}" class="category-heading"><div class="category-top"><span class="category-icon">${icon(category.icon)}</span><span class="category-count">0${index + 1} / 02</span></div><div class="category-titles"><h2>${category.title}</h2><span>${category.english}</span>${icon('arrow', 'heading-arrow')}</div><p>${category.note}</p></a><div class="category-items">${category.items.map((item, i) => CategoryItem(item, category, i)).join('')}</div><div class="category-base"><span>${String(category.items.length).padStart(2, '0')} CATEGORIES</span><i></i><span>EXPLORE ↗</span></div></article>`;
}
export function WorksPage() {
  return `${Header('works')}<main id="main" tabindex="-1" class="works-page page-enter"><div class="works-scene" aria-hidden="true"><i></i><i></i><i></i></div><div class="works-intro"><h1>探索我的<span>作品</span><i>✦</i></h1><div class="intro-caption"><span>EXPLORE MY WORK</span><b></b><p>设计 · 影像 · 创造力</p></div></div><section class="category-grid" aria-label="设计与视频作品分类">${categories.filter(category => category.path !== '/about').map(CategoryColumn).join('')}</section></main>${Footer()}`;
}
export function PlaceholderPage(route) {
  return `${Header('works')}<main id="main" tabindex="-1" class="placeholder page-enter"><span class="eyebrow">${route ? `${escapeHTML(route.english || '')} / COMING SOON` : 'PAGE NOT FOUND'}</span><div class="placeholder-symbol" aria-hidden="true">✦</div><h1>${route ? escapeHTML(route.title) : '页面暂未找到'}</h1><p>${route ? '内容正在整理中' : '这个地址暂时没有对应的页面'}</p><span class="placeholder-note">${route ? '每一份创作，都值得认真呈现。敬请期待。' : '回到作品导航，继续探索。'}</span>${GlowButton('返回作品导航', 'BACK TO WORKS', '/works')}</main>${Footer()}`;
}
export function ProfilePage() {
  return `${Header('works')}<main id="main" tabindex="-1" class="profile-page page-enter"><div class="profile-intro"><div class="profile-copy"><div class="eyebrow"><span></span>ABOUT THE CREATOR / WYT.</div><h1>个人<span>简介</span><i>.</i></h1><p class="profile-name">${escapeHTML(profile.name)}<small>${escapeHTML(profile.englishName)}</small></p><p class="profile-role">AIGC视觉设计师 <span>视觉设计 / 影像创作</span></p><p class="profile-statement">${escapeHTML(profile.tagline)}</p><dl class="profile-facts">${[['工作经验',profile.experience],['学历',profile.education],['毕业院校',profile.school],['专业',profile.major],['电话',profile.phone],['邮箱',profile.email]].map(([label,value])=>`<div class="profile-fact${label==='毕业院校'?' wide':''}"><dt>${label}</dt><dd>${label==='电话'?`<a href="tel:${escapeHTML(value)}">${escapeHTML(value)}</a>`:label==='邮箱'?`<a href="mailto:${escapeHTML(value)}">${escapeHTML(value)}</a>`:escapeHTML(value)}</dd></div>`).join('')}</dl><div class="profile-actions">${GlowButton('查看作品', 'VIEW WORKS', '/works')}${GlowButton('联系我', 'CONTACT ME', null, true)}</div></div><figure class="profile-visual profile-portrait"><img src="${escapeHTML(profile.portrait)}" alt="王钰桐个人肖像" width="1122" height="1402" decoding="async"/><figcaption><span>王钰桐</span><small>VISUAL DESIGNER / WYT.</small></figcaption></figure></div><section class="profile-directions" aria-labelledby="profile-directions-title"><div class="section-label"><h2 id="profile-directions-title">创作方向 <span>CREATIVE PRACTICE</span></h2><span class="section-counter">01 — 04</span></div><div class="profile-practice-grid">${expertise.map((item, i) => `<article><span class="practice-number">0${i + 1}</span>${icon(item.icon)}<h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.text)}</p></article>`).join('')}</div></section>${CareerSections()}<a class="profile-return" href="/works">${icon('back')}返回作品导航</a></main>${Footer()}`;
}
export function ContactModal() {
  const contacts = [{label:'电话 / 微信',english:'PHONE / WECHAT',icon:'chat',value:profile.phone || profile.wechat,href:'tel:'+profile.phone},{label:'邮箱',english:'EMAIL',icon:'mail',value:profile.email,href:'mailto:'+profile.email}];
  return `<div class="modal-top"><span class="eyebrow">LET’S CONNECT</span><button class="close-dialog" type="button" aria-label="关闭联系方式">${icon('close')}</button></div><h2 id="contact-title">让创意，<span>有个开始。</span></h2><p class="modal-subtitle">联系${escapeHTML(profile.name)}</p>${contacts.map(contact=>`<div class="contact-row">${icon(contact.icon)}<span>${contact.label}<small>${contact.english}</small></span><div class="contact-values"><a href="${escapeHTML(contact.href)}">${escapeHTML(contact.value)}</a><button type="button" class="contact-copy" data-copy-contact="${escapeHTML(contact.value)}" aria-label="复制${contact.label}">复制</button></div></div>`).join('')}<span class="contact-copy-feedback" role="status" aria-live="polite"></span><p class="contact-note">期待与你交流设计与创作。</p>`;
}
export function Footer(page) {
  return `<footer class="site-footer"><span>${page === 'home' ? 'WANG YUTONG / PORTFOLIO' : 'DESIGN · CREATE · INSPIRE'}</span><span class="footer-line"></span><span>${page === 'home' ? '设计，让想象发生。' : 'WYT. / PORTFOLIO'} <span class="footer-star">✦</span></span></footer>`;
}
