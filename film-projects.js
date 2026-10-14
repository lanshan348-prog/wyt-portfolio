import { chiyanProject } from './chiyan-data.js';
import { feiyueProject } from './feiyue-data.js';
import { gushanProject } from './gushan-data.js';
import { qingProject } from './qing-data.js';
import { shuangProject } from './shuang-data.js';
import { banshanProject } from './banshan-data.js';
import { charunfangProject } from './charunfang-data.js';
import { sonicProject } from './sonic-data.js';
import { houlaiProject } from './houlai-data.js';
import { guijinProject } from './guijin-data.js';
import { deepspaceProject } from './deep-space-data.js';
import { alieneraProject } from './alien-era-data.js';
import { vanguardProject } from './vanguard-data.js';
import { romanceProject } from './romance-data.js';
import { cultivationProject } from './cultivation-data.js';

export const filmProjects=[chiyanProject,feiyueProject,gushanProject,qingProject,shuangProject,banshanProject,charunfangProject,sonicProject,houlaiProject,guijinProject,deepspaceProject,alieneraProject,vanguardProject,romanceProject,cultivationProject].map(p=>({...p,category:p.category||'ai-animation',displayTitle:({banshan:'《半山》山茶油',charunfang:'《茶润方》减糖健康饮品',sonic:'【乐声】-SONIC耳机'})[p.slug]||'《'+p.title+'》'}));
export function filmProjectPath(project){const first=filmProjects.find(p=>p.category===project.category);return '/video/'+project.category+(first===project?'':'/'+project.slug);}
export function filmProjectForPath(path){if(path==='/video')return filmProjects[0];return filmProjects.find(p=>filmProjectPath(p)===path)||null;}
