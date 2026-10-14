import { filmProjects, filmProjectPath } from './film-projects.js';
import { GalleryPage } from './gallery.js';
import { escapeHTML, icon } from './components.js';

function projectAssets(assets){
 const groups=new Map();let ordinal=0;
 assets.forEach((asset,i)=>{const key=Math.round(asset.width/8)+'x'+Math.round(asset.height/8);if(!groups.has(key))groups.set(key,[]);groups.get(key).push({asset,i});});
 return `<div class="project-asset-groups${assets.length===1?' is-single':''}">${[...groups.values()].map(group=>`<div class="project-assets" data-size-group="${group[0].asset.width}x${group[0].asset.height}" style="--asset-ratio:${group[0].asset.width}/${group[0].asset.height}">${group.map(({asset,i})=>`<figure class="project-asset"><div class="project-asset-image"><img src="${escapeHTML(asset.image)}" width="${asset.width}" height="${asset.height}" alt="${escapeHTML(asset.title)}" loading="lazy" decoding="async"/></div><figcaption><span>${String(++ordinal).padStart(2,'0')}</span><div><h3>${escapeHTML(asset.title)}</h3></div></figcaption></figure>`).join('')}</div>`).join('')}</div>`;
}
function playerUrl(project){return `https://player.bilibili.com/player.html?bvid=${project.bvid}&p=1&autoplay=0`;}
function playerFrame(project){return `<iframe src="${playerUrl(project)}" title="${escapeHTML(project.title)} B站视频播放器" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;}
function sectionNotes(notes){return notes.map(note=>`<h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.text)}</p>`).join('');}
function assetSection(project,type,index,title,english,overview,notes){return `<section class="film-section film-assets-section" id="${type}" aria-labelledby="film-${type}-title"><div class="film-information"><span class="film-overline">${index} / ${english}</span><h2 id="film-${type}-title">${title}</h2><p>${escapeHTML(overview)}</p><div class="film-character-notes">${sectionNotes(notes)}</div><span class="film-asset-count">${String(project[type].length).padStart(2,'0')} 张${title}</span></div>${projectAssets(project[type])}</section>`;}

export function ChiyanPage(context,slug='chiyan'){
 const p=filmProjects.find(project=>project.slug===slug)||filmProjects[0];
 const categoryProjects=filmProjects.filter(project=>project.category===p.category);
 let shell=GalleryPage(context);
 const beginning=shell.indexOf('<div class="gallery-empty">'),ending=shell.lastIndexOf('</main>');
 const tabs=`<nav class="film-project-nav" aria-label="选择${escapeHTML(context.item.title)}作品">${categoryProjects.map((project,i)=>`<a href="${filmProjectPath(project)}" ${project===p?'aria-current="page"':''}><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(project.displayTitle)}</a>`).join('')}</nav>`;
 const chapters=[['characters','人物资产'],['scenes','场景资产'],...(p.props?[['props','道具资产']]:[]),...(p.products?[['products','产品资产']]:[])];
 const content=`<div class="chiyan-content" data-animation-project="${p.slug}">${tabs}<section class="film-section film-intro" aria-labelledby="film-title"><div class="film-information"><span class="film-overline">${context.category.english} / ${String(categoryProjects.indexOf(p)+1).padStart(2,'0')}</span><h2 id="film-title">${escapeHTML(p.displayTitle)}</h2><p class="film-genre">${escapeHTML(p.genre)}</p><div class="film-meta"><span>${p.format}</span><span>${p.duration}</span></div><h3>故事概述</h3><p>${escapeHTML(p.summary)}</p><h3>视觉说明</h3><p>${escapeHTML(p.visual)}</p><nav class="film-section-nav" aria-label="项目内容">${chapters.map(([type,title])=>`<a href="#${type}" data-project-anchor="${type}">${title} ${icon('arrow')}</a>`).join('')}</nav></div><div class="film-video${p.format==='9:16'?' film-video-portrait':''}" style="--film-ratio:${p.format.replace(':','/')}"><div class="film-player" data-bilibili-player><img src="${p.scenes[0].image}" alt="${escapeHTML(p.title)}场景播放封面"/><button type="button" class="film-play" data-film-play aria-label="播放${escapeHTML(p.title)}"><span>▶</span>播放成片<small>哔哩哔哩 · 需联网</small></button></div><div class="film-video-actions"><button type="button" data-film-play>站内播放</button><button type="button" data-film-preview>打开视频预览</button><a href="${p.url}" target="_blank" rel="noopener noreferrer">前往哔哩哔哩观看 ↗</a></div><p class="film-player-note">使用 B站播放器观看；若播放受网络影响，可前往原视频页面。</p></div></section>${assetSection(p,'characters','01','人物资产','CHARACTER ASSETS',p.characterOverview,p.characterNotes)}${assetSection(p,'scenes','02','场景资产','SCENE ASSETS',p.sceneOverview,p.sceneNotes)}${p.props?assetSection(p,'props','03','道具资产','PROP ASSETS',p.propOverview,p.propNotes):''}${p.products?assetSection(p,'products','03','产品资产','PRODUCT ASSETS',p.productOverview,p.productNotes):''}<a class="film-return-top" href="#main" data-project-anchor="main">回到影片 ${icon('back')}</a></div>`;
 shell=shell.slice(0,beginning)+content+shell.slice(ending);
 return shell.replace('class="gallery-main "','class="gallery-main project-gallery"').replace('作品正在整理中',`${escapeHTML(p.displayTitle)} · 成片与资产`);
}

export function initChiyanPlayer(root){
 const main=root.querySelector('.project-gallery');
 if(!main)return()=>{};
 const project=filmProjects.find(p=>p.slug===main.querySelector('[data-animation-project]').dataset.animationProject);
 const controller=new AbortController();let preview=null,trigger=null;
 function closePreview(){if(!preview)return;if(preview.open)preview.close();preview.remove();preview=null;document.body.classList.remove('modal-open');trigger?.focus({preventScroll:true});}
 main.addEventListener('click',event=>{
  if(event.target.closest('[data-film-play]')){
   const host=main.querySelector('[data-bilibili-player]');
   if(!host.querySelector('iframe'))host.innerHTML=playerFrame(project);
   host.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});return;
  }
  const open=event.target.closest('[data-film-preview]');
  if(open){
   if(preview)return;
   trigger=open;preview=document.createElement('dialog');preview.className='bilibili-preview'+(project.format==='9:16'?' bilibili-preview-portrait':'');preview.setAttribute('aria-label',project.title+'视频预览');
   preview.innerHTML=`<header><strong>${escapeHTML(project.displayTitle)}</strong><a href="${project.url}" target="_blank" rel="noopener noreferrer">B站观看 ↗</a><button type="button" aria-label="关闭视频预览">${icon('close')}</button></header><div style="aspect-ratio:${project.format.replace(':','/')}">${playerFrame(project)}</div><p>播放、暂停与进度调整由 B站播放器提供。</p>`;
   document.body.append(preview);preview.showModal();document.body.classList.add('modal-open');preview.querySelector('button').focus();
   preview.querySelector('button').addEventListener('click',closePreview);preview.addEventListener('cancel',e=>{e.preventDefault();closePreview();});return;
  }
  const anchor=event.target.closest('[data-project-anchor]');
  if(anchor){event.preventDefault();const target=anchor.dataset.projectAnchor==='main'?main.querySelector('.film-intro'):main.querySelector('#'+anchor.dataset.projectAnchor);target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
 },{signal:controller.signal});return()=>{closePreview();controller.abort();};
}
