import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/zhangzixuan/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations/container_tools/artifact_tool_utils.mjs';
const cwd='/Users/zhangzixuan/Desktop/hakka-food-linebot';
const skill='/Users/zhangzixuan/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const rows=JSON.parse(await fs.readFile(cwd+'/.ppt-work/rows.json','utf8'));
// Restore visual line breaks within the original text runs.
rows[0].values[1]=rows[0].values[1].replace('啟動儀隊','啟動\n儀隊').replace('口令聲。字幕','口令聲。\n字幕');
rows[1].values[1]=rows[1].values[1].replace('展開鏡頭','展開\n鏡頭').replace('大旗展開。字卡','大旗展開。\n字卡');
rows[4].values[1]=rows[4].values[1].replace('第一棒女生','第一棒\n女生');
const p=Presentation.create({slideSize:{width:1600,height:900}});
const font='PingFang TC';
function text(s,value,x,y,w,h,size,color='#142735',bold=false){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=value;a.text.style={typeface:font,fontSize:size,color,bold,autoFit:'none'};return a;}
for(let i=0;i<7;i++){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 text(s,'115年國慶升旗典禮｜拍攝工作紀錄',50,28,1450,60,40,'#1455B5',true);
 text(s,'前導宣傳影片製作',50,98,850,40,26,'#31465A',true);
 text(s,`${String(i*2+1).padStart(2,'0')}–${String(i*2+2).padStart(2,'0')} 段　／　共 14 段`,1150,103,400,32,22,'#5A6875');
 const values=[['影片時間','畫面腳本與說明','場地','示意圖','預計拍攝時段與拍攝細節']];
 for(let j=0;j<2;j++){const r=rows[i*2+j];values.push([r.values[0].replace(/\s*[-–]\s*/, '–\n'),...r.values.slice(1),'預計時段：\n\n拍攝細節：']);}
 const t=s.tables.add({rows:3,columns:5,left:50,top:162,width:1500,height:640,columnWidths:[145,490,175,340,350],values});
 t.rows[0].height=64;t.rows[1].height=288;t.rows[2].height=288;
 t.borders.assign({fill:'#879AAA',width:1,style:'solid'});
 t.cells.block({row:0,column:0,rowCount:3,columnCount:5}).assign({textStyle:{typeface:font,fontSize:22,color:'#142735'},margins:{left:14,right:14,top:18,bottom:14},anchor:'top'});
 for(let c=0;c<5;c++){let cell=t.getCell(0,c);cell.fill=c===4?'#216F79':'#24578A';cell.text.style={typeface:font,fontSize:24,bold:true,color:'#FFFFFF'};}
 for(let j=0;j<2;j++){
  const rr=j+1;for(let c=0;c<5;c++) t.getCell(rr,c).fill=c===4?'#F2F8F8':(j===0?'#FFFFFF':'#F6F8FA');
  t.getCell(rr,0).text.style={typeface:font,fontSize:22,color:'#24578A',bold:true};
  t.getCell(rr,4).text.style={typeface:font,fontSize:22,color:'#567279'};
  const r=rows[i*2+j];s.images.add({blob:new Uint8Array(await fs.readFile(cwd+'/'+r.image)),contentType:'image/png',alt:`第 ${i*2+j+1} 段原稿示意圖`,fit:'contain',position:{left:876,top:226+j*288+42,width:308,height:204}});
 }
 if(i===6) text(s,'115年新北市\n國慶升旗典禮\n10/10',966,582,205,87,18,'#153D6D',true);
 text(s,'工作日期：________________　　紀錄人員：________________',50,837,1230,35,21,'#5A6875');
 text(s,`${i+1} / 7`,1430,837,120,35,21,'#5A6875');
 s.speakerNotes.textFrame.setText('依使用者提供之「115年國慶升旗典禮執行企畫書（腳本）_示意圖完成版.pptx」重新編排。影片時間為原腳本時間碼。');
}
const candidate=cwd+'/.ppt-work/candidate.pptx';await (await PresentationFile.exportPptx(p)).save(candidate);
for(let i=0;i<7;i++){let b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(cwd+`/.ppt-work/final-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const result=await finalizePresentation({workspaceDir:cwd,candidatePath:candidate,finalPath:cwd+'/output/115年國慶升旗典禮_橫式工作紀錄完成版.pptx',pythonExecutable:'/Users/zhangzixuan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-heading-fit',...Array.from({length:7},(_,i)=>['--require-native-table-slide',String(i+1)]).flat()],requiredNativeTableOwnerSlides:[1,2,3,4,5,6,7],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:cwd+'/.ppt-work/validation.json'});console.log(result);
