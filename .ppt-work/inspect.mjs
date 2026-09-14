import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/zhangzixuan/Desktop/115年國慶升旗典禮執行企畫書（腳本）_示意圖完成版.pptx'));
for(let i=0;i<p.slides.items.length;i++) {let b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(`.ppt-work/source-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
