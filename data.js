import { filmProjectForPath } from './film-projects.js';
// All personal information and category routes are managed here.
// Set heroImage to '/wyt-portfolio/images/hero/your-character.webp' when your IP asset is ready.
export const profile = {
  locationIcon: '/wyt-portfolio/images/profile/location.png', portrait: '/wyt-portfolio/images/profile/portrait.png', experience: '6年', education: '全日制本科', school: '长春理工大学光电信息学院', major: '视觉传达设计',
  name: '王钰桐', englishName: 'WANG YUTONG',
  role: '视觉设计师 / AIGC创作者',
  tagline: '以设计构建视觉，以创意探索影像。',
  introduction: '以视觉设计为基础，结合 AIGC 与影像创作，探索品牌与内容的新表达。关注每一次创意，从想法到呈现的过程。',
  heroImage: '/wyt-portfolio/images/hero/ip-awake.png', heroClosedImage: '/wyt-portfolio/images/hero/ip-sleep.png',
  heroReference: '/wyt-portfolio/images/hero/cover-reference.png',
  phone: '15933438618', wechat: '15933438618', email: '373047039@qq.com',
};

export const expertise = [
  { title: '视觉设计', english: 'VISUAL DESIGN', text: '品牌美学 · 视觉表达', icon: 'palette', href: '/design' },
  { title: 'AIGC创作', english: 'AI CREATION', text: '创意驱动 · 智能生成', icon: 'sparkles', href: '/works' },
  { title: '视频制作', english: 'VIDEO PRODUCTION', text: '镜头语言 · 动态叙事', icon: 'video', href: '/video' },
  { title: '项目协作', english: 'PROJECT DELIVERY', text: '创意协同 · 完整交付', icon: 'user', href: '/about/introduction' },
];

export const categories = [
  { title: '视觉设计', english: 'DESIGN', path: '/design', icon: 'palette', note: '让创意成为可见的语言', items: [
    { title: '海报设计', slug: 'posters' }, { title: 'Banner设计', slug: 'banners' },
    { title: 'IP形象及IP延展设计', slug: 'ip-design' },
    { title: '字体设计', slug: 'typography' },
    { title: '插画设计', slug: 'illustrations' },
    { title: 'APP设计', slug: 'app-design' },
  ] },
  { title: '视频创作', english: 'VIDEO', path: '/video', icon: 'clapperboard', note: '在每一帧里，探索想象', items: [
    { title: 'AI漫剧', slug: 'ai-animation' },
    { title: 'TVC广告短片', slug: 'tvc' },
    { title: '音乐MV', slug: 'music-videos' },
    { title: '仿真人漫剧', slug: 'ai-live-action' },
    { title: '影游类短剧', slug: 'gaming' },
  ] },
  { title: '关于我', english: 'ABOUT', path: '/about', icon: 'user', note: '认识作品背后的创作者', items: [
    { title: '个人介绍', slug: 'introduction' }, { title: '工作经历', slug: 'experience' },
    { title: '专业技能', slug: 'skills' }, { title: '个人简历', slug: 'resume' },
    { title: '联系方式', slug: 'contact' },
  ] },
];

export function resolveRoute(path) {
  const film=filmProjectForPath(path);
  if(film)return {title:film.title,english:'VIDEO',parent:'视频创作'};
  for (const category of categories) {
    if (path === category.path) return { ...category, parent: category.title };
    const item = category.items.find(item => path === `${category.path}/${item.slug}`);
    if (item) return { ...item, english: category.english, parent: category.title };
  }
  return null;
}
