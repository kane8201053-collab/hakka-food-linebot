import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/output/看見共好_第5屆新北市議會_影片腳本_A4直式.pptx";
const RENDER_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/presentation_build/rendered";

const W = 794;
const H = 1123;
const M = 48;
const FONT = "PingFang TC";
const SERIF = "Songti TC";

const C = {
  paper: "#F7F3EA",
  white: "#FFFDFC",
  ink: "#142B34",
  muted: "#60727A",
  line: "#D9D5CB",
  navy: "#0E2B3A",
  teal: "#147A78",
  tealSoft: "#DDEDEA",
  coral: "#C85B4B",
  coralSoft: "#F4E1DC",
  amber: "#D9962C",
  amberSoft: "#F4E7C9",
  blue: "#416E8A",
  blueSoft: "#DEE8EE",
  green: "#5D7E55",
  greenSoft: "#E2EADB",
  violet: "#715B7A",
  violetSoft: "#E9E0EC",
};

function addShape(slide, name, geometry, position, fill = "none", line = "none", radius = 0) {
  const config = {
    geometry,
    name,
    position,
    fill,
    line: line === "none" ? { style: "solid", fill: "none", width: 0 } : line,
  };
  if (radius && ["rect", "textbox", "roundRect"].includes(geometry)) config.borderRadius = radius;
  return slide.shapes.add(config);
}

function addText(slide, name, text, position, style = {}) {
  const box = addShape(slide, name, "textbox", position, style.fill || "none");
  box.text = text;
  box.text.style = {
    typeface: style.typeface || FONT,
    fontSize: style.fontSize || 20,
    bold: style.bold || false,
    color: style.color || C.ink,
    alignment: style.alignment || "left",
    verticalAlignment: style.verticalAlignment || "top",
    lineSpacing: style.lineSpacing || 1.18,
    autoFit: style.autoFit || "none",
    wrap: style.wrap || "square",
    insets: style.insets || { top: 4, right: 4, bottom: 4, left: 4 },
  };
  return box;
}

function addRichText(slide, name, paragraphs, position, style = {}) {
  const box = addShape(slide, name, "textbox", position, style.fill || "none");
  box.text = paragraphs;
  box.text.style = {
    typeface: style.typeface || FONT,
    fontSize: style.fontSize || 20,
    color: style.color || C.ink,
    alignment: style.alignment || "left",
    verticalAlignment: style.verticalAlignment || "top",
    lineSpacing: style.lineSpacing || 1.18,
    autoFit: style.autoFit || "none",
    wrap: "square",
    insets: style.insets || { top: 4, right: 4, bottom: 4, left: 4 },
  };
  return box;
}

function addLine(slide, name, x, y, width, color = C.line, weight = 1) {
  return addShape(slide, name, "line", { left: x, top: y, width, height: 0 }, "none", {
    style: "solid",
    fill: color,
    width: weight,
  });
}

function addFooter(slide, page, label = "看見.共好｜第5屆新北市議會影片腳本") {
  addLine(slide, `footer-line-${page}`, M, H - 48, W - M * 2, C.line, 1);
  addText(slide, `footer-label-${page}`, label, { left: M, top: H - 43, width: 570, height: 26 }, {
    fontSize: 12,
    color: C.muted,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, `footer-page-${page}`, String(page).padStart(2, "0"), { left: W - M - 60, top: H - 43, width: 60, height: 26 }, {
    fontSize: 13,
    color: C.ink,
    bold: true,
    alignment: "right",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

function addDocTitle(slide, page, kicker, title, subtitle = "", accent = C.teal) {
  slide.background.fill = C.paper;
  addText(slide, `kicker-${page}`, kicker, { left: M, top: 45, width: 530, height: 30 }, {
    fontSize: 14,
    bold: true,
    color: accent,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, `title-${page}`, title, { left: M, top: 82, width: W - M * 2, height: 70 }, {
    fontSize: 36,
    bold: true,
    color: C.ink,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addLine(slide, `title-rule-${page}`, M, 162, W - M * 2, accent, 3);
  if (subtitle) {
    addText(slide, `subtitle-${page}`, subtitle, { left: M, top: 171, width: W - M * 2, height: 38 }, {
      fontSize: 16,
      color: C.muted,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  }
  addFooter(slide, page);
}

function notes(slide, extra = []) {
  const lines = [
    "[Sources]",
    "- /Users/zhangzixuan/Desktop/4.需求書.pdf",
    "- /Users/zhangzixuan/Desktop/(OK-列印版)2022新北市議會-企劃書0629(成)B.pdf",
    ...extra.map((x) => `- ${x}`),
    "[/Sources]",
  ];
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
}

function addPill(slide, name, text, x, y, w, fill, color = C.ink) {
  const p = addShape(slide, name, "roundRect", { left: x, top: y, width: w, height: 32 }, fill, "none", 16);
  p.text = text;
  p.text.style = {
    typeface: FONT,
    fontSize: 14,
    bold: true,
    color,
    alignment: "center",
    verticalAlignment: "middle",
    autoFit: "none",
    insets: { top: 0, right: 8, bottom: 0, left: 8 },
  };
  return p;
}

function addSceneSlide(presentation, page, scene) {
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;

  addText(slide, `scene-kicker-${page}`, `分鏡腳本｜${scene.chapter}`, { left: M, top: 36, width: 360, height: 28 }, {
    fontSize: 14,
    bold: true,
    color: scene.accent,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, `scene-title-${page}`, scene.title, { left: M, top: 70, width: W - M * 2, height: 60 }, {
    fontSize: 28,
    bold: true,
    color: C.ink,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  const top = 148;
  const bandH = 48;
  addShape(slide, `scene-band-${page}`, "rect", { left: M, top, width: W - M * 2, height: bandH }, scene.soft);
  addText(slide, `scene-band-label-${page}`, scene.label, { left: M + 14, top: top + 4, width: 380, height: 40 }, {
    fontSize: 14,
    bold: true,
    color: scene.accent,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, `scene-duration-${page}`, `${scene.range}｜${scene.duration}｜累計 ${scene.cumulative}`, { left: W - M - 292, top: top + 4, width: 276, height: 40 }, {
    fontSize: 12,
    color: C.ink,
    bold: true,
    alignment: "right",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  const headY = 208;
  const headH = 38;
  const contentY = 246;
  const contentH = 810;
  const x0 = M;
  const w1 = 225;
  const w2 = 184;
  const w3 = W - M * 2 - w1 - w2;
  const cols = [
    { x: x0, w: w1, title: "畫面設計" },
    { x: x0 + w1, w: w2, title: "剪輯／聲音" },
    { x: x0 + w1 + w2, w: w3, title: "旁白／字卡" },
  ];
  cols.forEach((col, i) => {
    addShape(slide, `col-head-${page}-${i}`, "rect", { left: col.x, top: headY, width: col.w, height: headH }, C.white, {
      style: "solid",
      fill: C.line,
      width: 1,
    });
    addText(slide, `col-head-text-${page}-${i}`, col.title, { left: col.x + 4, top: headY + 2, width: col.w - 8, height: headH - 4 }, {
      fontSize: 16,
      bold: true,
      alignment: "center",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addShape(slide, `col-body-${page}-${i}`, "rect", { left: col.x, top: contentY, width: col.w, height: contentH }, i === 2 ? C.white : "#FCFAF5", {
      style: "solid",
      fill: C.line,
      width: 1,
    });
  });

  addText(slide, `visual-${page}`, scene.visual, { left: x0 + 12, top: contentY + 14, width: w1 - 24, height: contentH - 28 }, {
    fontSize: scene.visualFont || 17,
    color: C.ink,
    lineSpacing: 1.22,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, `audio-${page}`, scene.audio, { left: x0 + w1 + 12, top: contentY + 14, width: w2 - 24, height: contentH - 28 }, {
    fontSize: scene.audioFont || 16,
    color: C.muted,
    lineSpacing: 1.22,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addRichText(slide, `narration-${page}`, scene.narration, { left: x0 + w1 + w2 + 14, top: contentY + 12, width: w3 - 28, height: contentH - 24 }, {
    fontSize: scene.narrationFont || 18,
    color: C.ink,
    lineSpacing: 1.24,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  addFooter(slide, page, `看見.共好｜${scene.chapter}｜${scene.range}`);
  notes(slide, scene.sources || []);
  return slide;
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// 01 Cover
{
  const slide = presentation.slides.add();
  slide.background.fill = C.navy;
  addText(slide, "cover-ghost", "見", { left: 392, top: 52, width: 370, height: 440 }, {
    fontSize: 300,
    bold: true,
    color: "#214654",
    typeface: SERIF,
    alignment: "center",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, "cover-kicker", "第 5 屆新北市議會｜簡介影片分鏡腳本", { left: 62, top: 82, width: 560, height: 34 }, {
    fontSize: 15,
    bold: true,
    color: "#9FD2CE",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, "cover-main", "看見.共好", { left: 62, top: 274, width: 610, height: 100 }, {
    fontSize: 62,
    bold: true,
    color: C.white,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, "cover-sub", "－ 第5屆新北市議會", { left: 66, top: 388, width: 560, height: 55 }, {
    fontSize: 30,
    color: "#F1D39A",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addShape(slide, "cover-accent", "rect", { left: 62, top: 470, width: 108, height: 7 }, C.coral);
  addText(slide, "cover-thesis", "看見每一種生活，\n讓每一個聲音走向共好。", { left: 62, top: 535, width: 520, height: 118 }, {
    fontSize: 27,
    bold: true,
    color: "#DCECE9",
    lineSpacing: 1.28,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, "cover-meta", "A4 直式提案版｜建議成片 11 分 50 秒｜2026.09", { left: 62, top: 1008, width: 620, height: 32 }, {
    fontSize: 14,
    color: "#9FB2BA",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  notes(slide);
}

// 02 Concept
{
  const page = 2;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "創意主張", "片名就是整支影片的敘事方法", "不是把資訊排進影片，而是帶觀眾一步步看見：城市、民意、行動與共同未來。", C.teal);

  const items = [
    { n: "01", title: "看見城市", body: "從清晨、通勤、海岸、山城與街區日常出發，先讓觀眾感受到新北是一座由不同生活共同組成的城市。", c: C.teal, soft: C.tealSoft },
    { n: "02", title: "看見民意", body: "讓鏡頭跟著一個聲音走進議會：陳情、現勘、質詢、審查、議決與追蹤，理解代議民主如何運作。", c: C.coral, soft: C.coralSoft },
    { n: "03", title: "走向共好", body: "差異不必被抹平；議會的價值，是讓不同地區、世代與族群都能被聽見，透過制度找到公共利益。", c: C.amber, soft: C.amberSoft },
  ];
  items.forEach((it, i) => {
    const y = 250 + i * 245;
    addShape(slide, `concept-bg-${i}`, "roundRect", { left: M, top: y, width: W - M * 2, height: 205 }, it.soft, "none", 18);
    addText(slide, `concept-num-${i}`, it.n, { left: 68, top: y + 30, width: 80, height: 50 }, {
      fontSize: 28,
      bold: true,
      color: it.c,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `concept-title-${i}`, it.title, { left: 160, top: y + 25, width: 480, height: 54 }, {
      fontSize: 28,
      bold: true,
      color: C.ink,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `concept-body-${i}`, it.body, { left: 160, top: y + 84, width: 520, height: 90 }, {
      fontSize: 19,
      color: C.ink,
      lineSpacing: 1.24,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  notes(slide);
}

// 03 Requirements mapping
{
  const page = 3;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "需求對照", "規格要求已直接寫進腳本", "製作條件會成為拍攝、後製與交付檢核點，不只停留在文字說明。", C.coral);

  const rows = [
    ["片長", "11 分 50 秒", "落在需求書 10 至 12 分鐘範圍內"],
    ["拍攝", "2K 以上規格", "就職典禮全程錄影、拍照與大合照；重要畫面預留多機位"],
    ["版本", "5 種語言", "中、英、日、台、韓；旁白、字幕與字卡分軌管理"],
    ["代表性", "13 選區／68 席", "依 115 年正式公告更新，所有選區均有公平露出"],
    ["敘事", "看見 → 共好", "以民意如何被看見、被討論、被追蹤為主線，不複製 2022 舊稿"],
    ["播放", "簡報室／USB／藍光", "畫面構圖兼顧大銀幕與多語字幕安全框"],
  ];
  const y0 = 240;
  const col = [112, 190, 396];
  ["項目", "本稿設定", "對應方式"].forEach((t, i) => {
    const x = M + col.slice(0, i).reduce((a, b) => a + b, 0);
    addShape(slide, `req-head-${i}`, "rect", { left: x, top: y0, width: col[i], height: 46 }, C.coralSoft, { style: "solid", fill: C.line, width: 1 });
    addText(slide, `req-head-text-${i}`, t, { left: x + 4, top: y0 + 3, width: col[i] - 8, height: 40 }, {
      fontSize: 16,
      bold: true,
      color: C.coral,
      alignment: "center",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  rows.forEach((row, r) => {
    const y = y0 + 46 + r * 118;
    row.forEach((t, i) => {
      const x = M + col.slice(0, i).reduce((a, b) => a + b, 0);
      addShape(slide, `req-cell-${r}-${i}`, "rect", { left: x, top: y, width: col[i], height: 118 }, i === 1 ? "#FCF3F0" : C.white, { style: "solid", fill: C.line, width: 1 });
      addText(slide, `req-cell-text-${r}-${i}`, t, { left: x + 10, top: y + 9, width: col[i] - 20, height: 100 }, {
        fontSize: i === 0 ? 17 : 16,
        bold: i < 2,
        color: i === 1 ? C.coral : C.ink,
        alignment: i === 0 ? "center" : "left",
        verticalAlignment: i === 0 ? "middle" : "top",
        lineSpacing: 1.18,
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    });
  });
  addText(slide, "req-note", "終校提醒｜第 5 屆當選名單、議長／副議長姓名與正式致詞，於選舉及就職後置換確認。", { left: M, top: 1013, width: W - M * 2, height: 34 }, {
    fontSize: 14,
    bold: true,
    color: C.coral,
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  notes(slide, [
    "https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032154%2Fch02%2Ftype3%2Fgov15%2Fnum2%2FEg.htm&metaid=167808",
    "https://web.cec.gov.tw/api/file/49859749-3bbe-444c-b516-a4fc724d7e94.pdf",
  ]);
}

// 04 Runtime
{
  const page = 4;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "全片節奏", "11 分 50 秒，從看見走到共好", "前半段建立城市與代表性，中段把民意運作拍清楚，後半段收束為第 5 屆共同承諾。", C.amber);
  const rows = [
    ["01", "城市先醒來", "00:00–00:45", "0:45"],
    ["02", "民主走過的路", "00:45–01:35", "0:50"],
    ["03", "每一席都有來處", "01:35–02:15", "0:40"],
    ["04", "片名亮相", "02:15–02:35", "0:20"],
    ["05", "看見 13 個選區", "02:35–04:55", "2:20"],
    ["06", "問題被看見", "04:55–05:15", "0:20"],
    ["07", "一個聲音成為行動", "05:15–06:55", "1:40"],
    ["08", "議會如何運作", "06:55–08:15", "1:20"],
    ["09", "讓民主被理解與保存", "08:15–09:10", "0:55"],
    ["10", "差異走向共識", "09:10–10:15", "1:05"],
    ["11", "第 5 屆共同承諾", "10:15–11:25", "1:10"],
    ["12", "看見未來，共好新北", "11:25–11:50", "0:25"],
  ];
  const y0 = 228;
  const rowH = 64;
  rows.forEach((row, i) => {
    const y = y0 + i * rowH;
    const fill = i < 4 ? C.tealSoft : i < 6 ? C.amberSoft : i < 9 ? C.blueSoft : C.coralSoft;
    addText(slide, `runtime-num-${i}`, row[0], { left: M, top: y, width: 48, height: 48 }, {
      fontSize: 15,
      bold: true,
      color: C.muted,
      alignment: "center",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addShape(slide, `runtime-bar-${i}`, "roundRect", { left: M + 58, top: y, width: 640, height: 48 }, fill, "none", 10);
    addText(slide, `runtime-title-${i}`, row[1], { left: M + 76, top: y + 2, width: 320, height: 44 }, {
      fontSize: 17,
      bold: true,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `runtime-range-${i}`, row[2], { left: 420, top: y + 2, width: 170, height: 44 }, {
      fontSize: 15,
      color: C.muted,
      alignment: "right",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `runtime-dur-${i}`, row[3], { left: 610, top: y + 2, width: 70, height: 44 }, {
      fontSize: 16,
      bold: true,
      color: C.ink,
      alignment: "right",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  addPill(slide, "runtime-total", "總長 11:50", W - M - 150, 996, 150, C.ink, C.white);
  notes(slide);
}

// 05 Audiovisual language
{
  const page = 5;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "影像與聲音", "用「看見」建立記憶，用「共好」推進情緒", "調性穩重但不制式；保留議會可信度，也讓市民能在畫面裡認出自己的日常。", C.blue);
  const blocks = [
    { y: 240, title: "鏡頭語言", c: C.teal, soft: C.tealSoft, body: "近景看人｜手、眼神、腳步與互動\n中景看行動｜會勘、陳情、討論、質詢\n遠景看城市｜海岸、河川、山城、都會與議會建築" },
    { y: 500, title: "聲音設計", c: C.blue, soft: C.blueSoft, body: "城市環境音先行，讓觀眾「聽見」生活\n弦樂與木質打擊由收斂漸向開闊\n保留宣誓、議事槌、翻頁、現勘與市民原音" },
    { y: 760, title: "文字與動態", c: C.coral, soft: C.coralSoft, body: "「看見」以聚焦、拉近、點亮的動態呈現\n句點化為節點，串起民意、議會與城市\n「共好」以多點匯聚為同一條前進路徑" },
  ];
  blocks.forEach((b, i) => {
    addShape(slide, `av-bg-${i}`, "roundRect", { left: M, top: b.y, width: W - M * 2, height: 210 }, b.soft, "none", 18);
    addText(slide, `av-title-${i}`, b.title, { left: 72, top: b.y + 26, width: 160, height: 42 }, {
      fontSize: 25,
      bold: true,
      color: b.c,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `av-body-${i}`, b.body, { left: 238, top: b.y + 25, width: 468, height: 160 }, {
      fontSize: 19,
      color: C.ink,
      lineSpacing: 1.35,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  notes(slide);
}

const S = {
  city: { accent: C.teal, soft: C.tealSoft },
  voice: { accent: C.amber, soft: C.amberSoft },
  action: { accent: C.blue, soft: C.blueSoft },
  together: { accent: C.coral, soft: C.coralSoft },
};

addSceneSlide(presentation, 6, {
  chapter: "第一章｜看見城市",
  title: "城市先醒來",
  label: "片頭｜先看見生活，再看見機關",
  range: "00:00–00:45",
  duration: "45 秒",
  cumulative: "00:45",
  ...S.city,
  visual: "SHOT 01｜黑畫面，先有聲音\n\nSHOT 02｜天色未亮：漁港、早餐店開門、清潔隊、第一班車\n\nSHOT 03｜孩子整理書包、照顧者扶長者出門、產線亮燈\n\nSHOT 04｜空拍由海岸、河川、山城推進都會；最後看見議會外觀",
  audio: "0–4 秒僅留環境音\n\n海浪、鐵門、鍋鏟、列車、腳步依次進場\n\n音樂從單一鋼琴音開始，弦樂慢慢展開\n\n鏡頭切換不追求快，讓每個日常停留 2–3 秒",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.teal } }, "天還沒全亮，新北已經開始。\n\n海岸邊，有人迎著第一道浪；街角裡，有人為一家人的早晨點起燈。列車駛過河岸，孩子背起書包，照顧者牽起一雙手，工作者走進一天的現場。\n\n一座城市，不只由道路與建築組成。它由一個個被珍惜的日常，慢慢成為我們共同生活的地方。\n\n而議會要做的第一件事，就是看見。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "一座城市，從每一個日常開始。"],
  ],
});

addSceneSlide(presentation, 7, {
  chapter: "第一章｜看見城市",
  title: "看見，也要記得我們走過的路",
  label: "議會沿革｜讓歷史成為民意的來路",
  range: "00:45–01:35",
  duration: "50 秒",
  cumulative: "01:35",
  ...S.city,
  visual: "SHOT 05｜舊照片細節：會議桌、名牌、議事槌、手寫文件\n\nSHOT 06｜臺北縣參議會、歷屆臺北縣議會影像，採疊化與推鏡\n\nSHOT 07｜民國 99 年改制畫面，舊門牌過渡至「新北市議會」\n\nSHOT 08｜現代議場空鏡，座位燈逐排亮起",
  audio: "老照片以紙張翻頁聲串接\n\n年份出現時，不使用強烈倒數音效\n\n音樂加入低音弦樂，維持莊重、清楚\n\n最後一排座位亮起時，接入輕微議場空間聲",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.teal } }, "看見，也要記得我們走過的路。\n\n民國三十五年，臺北縣參議會開啟地方自治的篇章；歷經十六屆臺北縣議會，地方的聲音在一次次討論、提案與監督中累積。\n\n民國九十九年，臺北縣改制為新北市，議會也以新的名稱，承接不變的責任。\n\n時代改變，城市擴大，但民主始終從同一件事開始：有人願意說，也有人願意聽。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "從地方自治出發，讓民意一路被看見。"],
  ],
});

addSceneSlide(presentation, 8, {
  chapter: "第一章｜看見城市",
  title: "每一席，都有一個清楚的來處",
  label: "就職與片名｜從選票走進議事殿堂",
  range: "01:35–02:35",
  duration: "60 秒",
  cumulative: "02:35",
  ...S.city,
  visual: "SHOT 09｜115 年選舉投票：手持通知單、排隊、蓋章、票匭\n\nSHOT 10｜12 月 25 日就職典禮：報到、胸花、宣誓、簽名\n\nSHOT 11｜議長／副議長選舉與握手、大合照\n\nSHOT 12｜句點由選票印記化為節點，連成片名\n\nTITLE｜看見.共好 － 第5屆新北市議會",
  audio: "宣誓段落保留現場原音 8–10 秒\n\n快門聲只保留一次，避免過度煽情\n\n片名出現時音樂第一次完整展開\n\n畫面節奏：個人近景 → 群體全景 → 片名",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.teal } }, "一張選票，是一次託付；一席議員，是一個地區、一群人、一種生活的代表。\n\n民國一百一十五年十二月二十五日，第五屆新北市議會宣誓就職。六十八席民意，從十三個選舉區走進同一座議事殿堂。\n\n在這裡，不同立場將彼此相遇；共同的目標，是讓每一份託付都被認真回應。"],
    [{ run: "【現場原音】\n", textStyle: { bold: true, color: C.blue } }, "擷取宣誓誓詞重點與全體回應。"],
    [{ run: "【動畫字卡】\n", textStyle: { bold: true, color: C.coral } }, "看見.共好 － 第5屆新北市議會"],
  ],
  sources: [
    "https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032154%2Fch02%2Ftype3%2Fgov15%2Fnum2%2FEg.htm&metaid=167808",
  ],
});

addSceneSlide(presentation, 9, {
  chapter: "第二章｜看見每一種生活",
  title: "十三個選區，不是地圖上的切線",
  label: "選區群像 A｜第 1 至第 4 選舉區",
  range: "02:35–03:20",
  duration: "45 秒",
  cumulative: "03:20",
  ...S.voice,
  visual: "第 1 選區｜石門、三芝、淡水、八里：海岸、漁港、老街、輕軌\n\n第 2 選區｜林口、五股、泰山：新市鎮、產業、交通節點\n\n第 3 選區｜新莊：老街、工業脈絡、住宅與副都心\n\n第 4 選區｜蘆洲、三重：河岸、密集街區、通勤與市場\n\n每區採「人 3 秒＋地景 3 秒＋公共服務 3 秒」公平配置",
  audio: "以列車行進節奏串連選區\n\n每個選區保留一個辨識度高的環境音\n\n區名採固定位置出現，避免像觀光廣告\n\n地圖只做定位，不做主畫面",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.amber } }, "十三個選舉區，不只是地圖上的切線，而是十三種觀看城市的角度。\n\n從石門、三芝、淡水與八里的海風吹進城市；到林口、五股、泰山快速成長的新生活；新莊在產業記憶與新都心之間持續前進；蘆洲、三重沿著河岸與街巷，承接最密集也最真切的日常。\n\n地方不同，關心的事不同；每一種生活，都應該有被理解的位置。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "第 1–4 選舉區｜海岸．成長．新舊交會．河岸生活"],
  ],
  sources: ["https://web.cec.gov.tw/api/file/49859749-3bbe-444c-b516-a4fc724d7e94.pdf"],
});

addSceneSlide(presentation, 10, {
  chapter: "第二章｜看見每一種生活",
  title: "城市的尺度不同，生活的重量相同",
  label: "選區群像 B｜第 5 至第 8 選舉區",
  range: "03:20–04:05",
  duration: "45 秒",
  cumulative: "04:05",
  ...S.voice,
  visual: "第 5 選區｜板橋：議會、市府、車站、文化街區\n\n第 6 選區｜中和：住宅、產業園區、通勤節點\n\n第 7 選區｜永和：巷弄、公園、橋梁與高密度生活\n\n第 8 選區｜樹林、鶯歌、土城、三峽：陶瓷、老街、產業、校園、山景\n\n畫面避開單一建設政績，聚焦人在空間裡的使用",
  audio: "聲音由都會節奏轉入陶土、樹葉與校園環境音\n\n切換速度略加快，再於三峽河岸停留\n\n不使用口號式配樂；以生活感維持可信度",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.amber } }, "板橋是行政與交通交會的核心；中和在居住、產業與通勤之間尋找更好的平衡；永和以緊密的城市尺度，讓每一寸公共空間都格外重要。\n\n再往西南，樹林、鶯歌、土城與三峽，把產業、工藝、校園、河川與山景放進同一幅生活圖像。\n\n有的需求來自快速成長，有的來自老城更新；城市的尺度不同，生活的重量相同。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "第 5–8 選舉區｜核心．密度．公共空間．文化與產業"],
  ],
  sources: ["https://web.cec.gov.tw/api/file/49859749-3bbe-444c-b516-a4fc724d7e94.pdf"],
});

addSceneSlide(presentation, 11, {
  chapter: "第二章｜看見每一種生活",
  title: "看見地理，也看見跨界文化",
  label: "選區群像 C｜第 9 至第 13 選舉區",
  range: "04:05–04:55",
  duration: "50 秒",
  cumulative: "04:55",
  ...S.voice,
  visual: "第 9 選區｜新店、深坑、石碇、坪林、烏來：溪谷、茶鄉、山路、部落\n\n第 10 選區｜平溪、瑞芳、雙溪、貢寮：山城、鐵道、海岸\n\n第 11 選區｜金山、萬里、汐止：漁港、溫泉、科技與通勤\n\n第 12 選區｜平地原住民：跨行政區的族人生活與文化\n\n第 13 選區｜山地原住民：部落、語言、工藝、土地連結",
  audio: "溪流與鐵道聲串起山海\n\n進入原住民選區時，採現場族語問候或經授權歌聲\n\n音樂不挪用儀式性歌謠；文化素材先取得族群同意",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.amber } }, "新店、深坑、石碇、坪林與烏來，沿著溪谷連結都會、茶鄉與部落；平溪、瑞芳、雙溪、貢寮，讓山城、鐵道與海岸彼此相望；金山、萬里、汐止，則把海洋、溫泉、科技與通勤生活連成一線。\n\n還有跨越行政邊界的平地與山地原住民選區，讓族人的生活、語言與文化，在城市裡持續被看見。\n\n十三個選區，六十八席民意；每一席，都連著一群人的現在與未來。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "第 9–13 選舉區｜山海．城鄉．族群．文化傳承"],
  ],
  sources: [
    "https://web.cec.gov.tw/api/file/49859749-3bbe-444c-b516-a4fc724d7e94.pdf",
    "https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032154%2Fch02%2Ftype3%2Fgov15%2Fnum2%2FEg.htm&metaid=167808",
  ],
});

addSceneSlide(presentation, 12, {
  chapter: "第三章｜看見民意如何成為行動",
  title: "風景被看見還不夠，問題也要被看見",
  label: "轉折｜從城市群像走入議會核心",
  range: "04:55–05:15",
  duration: "20 秒",
  cumulative: "05:15",
  ...S.action,
  visual: "SHOT 13｜快速收斂三個日常細節\n• 雨天積水停在鞋尖\n• 家長牽孩子穿越路口\n• 長者在候車亭等待\n\nSHOT 14｜市民手機畫面／陳情資料／照片\n\nSHOT 15｜畫面停在「已受理」或服務處筆記，不呈現個資",
  audio: "音樂突然收斂，只留下雨聲、號誌聲、紙張聲\n\n三個問題各 3 秒，不交代答案\n\n最後以一聲訊息提示，帶入下一段",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "但風景被看見，還不夠。\n\n一場雨後的積水、一條不安心的上學路、一段等不到車的日常，都可能是城市下一步要回答的問題。\n\n當一個聲音走進議會，它會怎麼成為改變的開始？"],
    [{ run: "【動畫字卡】\n", textStyle: { bold: true, color: C.coral } }, "看見問題｜不是終點，是行動的起點。"],
  ],
});

addSceneSlide(presentation, 13, {
  chapter: "第三章｜看見民意如何成為行動",
  title: "先理解問題，再替人民把問題說清楚",
  label: "民意轉化 A｜受理、查證、現勘、提案",
  range: "05:15–06:05",
  duration: "50 秒",
  cumulative: "06:05",
  ...S.action,
  visual: "STEP 1｜市民陳情：電話、線上、服務處與當面反映\n\nSTEP 2｜資料整理：遮蔽個資後呈現案件照片、地圖、時間軸\n\nSTEP 3｜現地了解：議員、居民與相關單位共同會勘\n\nSTEP 4｜問題定義：把個案拆成安全、預算、權責與期程\n\nSTEP 5｜形成提案或質詢重點",
  audio: "節奏由單點訊息逐步堆疊\n\n保留市民一句原音：\n「我們希望有人把這件事說清楚。」\n\n會勘現場以同期聲為主，不另配過度情緒化音樂",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "看見問題，不是立刻給出漂亮答案，而是先把事情弄清楚。\n\n市民的陳情被記錄，現場的情況被查證；議員走進街區，聽居民怎麼說，也請相關單位說明。\n\n一個看似單純的困難，可能牽涉安全、預算、法規與不同機關的權責。議會的工作，是把零散感受整理成可以討論的問題，把個人的不方便，轉化為公共議題。\n\n唯有說清楚，行動才有方向。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "受理 → 查證 → 現勘 → 定義問題"],
  ],
});

addSceneSlide(presentation, 14, {
  chapter: "第三章｜看見民意如何成為行動",
  title: "讓承諾有進度，讓改變能被追蹤",
  label: "民意轉化 B｜質詢、審查、議決、追蹤",
  range: "06:05–06:55",
  duration: "50 秒",
  cumulative: "06:55",
  ...S.action,
  visual: "STEP 6｜議事殿堂：口頭／書面質詢\n\nSTEP 7｜委員會：資料比對、專業審查、意見交換\n\nSTEP 8｜大會：討論、議決與公開紀錄\n\nSTEP 9｜後續追蹤：列管回覆、工程進度、政策修正\n\nSTEP 10｜回到現場：同一機位拍攝改善前後，未完成案件則呈現追蹤狀態",
  audio: "議事槌、麥克風開啟、翻頁與鍵盤聲形成節拍\n\n重要數據以簡潔動態字卡同步\n\n不以「完工」作為唯一結局；誠實呈現持續追蹤",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "接著，問題走進質詢與審查。議員要求說明、檢視資料、確認預算與期程；不同意見在會議中被提出，也在公開紀錄中留下軌跡。\n\n有些事情能很快改善，有些需要跨局處協調，有些必須經過法規與預算程序。重要的不是一句承諾，而是每一步都有依據、每一個進度都能被追蹤。\n\n從人民的聲音，到制度的行動，再回到生活的現場——這就是監督的意義，也是民主看得見的方式。"],
    [{ run: "【動畫字卡】\n", textStyle: { bold: true, color: C.coral } }, "質詢 → 審查 → 議決 → 追蹤 → 回到現場"],
  ],
});

addSceneSlide(presentation, 15, {
  chapter: "第四章｜看見議會如何運作",
  title: "每一項決定，都必須經得起公開討論",
  label: "議會職權｜把制度拍成看得懂的流程",
  range: "06:55–08:15",
  duration: "80 秒",
  cumulative: "08:15",
  ...S.action,
  visual: "SHOT 16｜大會全景＋議程字幕\n\nSHOT 17｜程序會、各審查委員會、法規審查、聯席會議\n\nSHOT 18｜市政總質詢、業務質詢、書面資料特寫\n\nSHOT 19｜預算書、決算審核報告、自治條例三讀畫面\n\nSHOT 20｜議事影音平台、表決與會議紀錄\n\n畫面圖解：民意 → 提案／市府提案 → 審查 → 大會 → 執行與監督",
  audio: "旁白講職權時，每項搭配真實會議動作\n\n避免長時間停留在組織圖\n\n音樂降低，讓質詢原音穿插 2–3 句，每句不超過 4 秒\n\n字幕標示「實際議事畫面」與議程名稱",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "議會，是地方自治中代表市民行使監督與議決權的機關。\n\n從城市的法規、年度預算與決算，到市稅、公共財產、市府組織與各項提案，都必須透過議會的程序接受檢視。人民的請願，也能在這裡進入正式的制度。\n\n議案依性質進入程序與各審查委員會，經資料審閱、詢答、討論，再送交大會議決；議員也透過市政總質詢、業務質詢、現勘與書面建議，要求行政部門說明並改善。\n\n監督不是阻擋前進，而是讓每一筆公共資源用得更負責；討論也不是拖延，而是讓不同影響被充分看見。\n\n每一項決定，都必須留下紀錄，也必須經得起公開討論。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "議決｜審查｜質詢｜請願｜監督"],
  ],
  narrationFont: 17,
  sources: ["https://bms1.ntp.gov.tw/billsystem/mam/ScheduleAnnex/0407T/f0b20b98-9369-4730-9423-bc95900d22c4.pdf"],
});

addSceneSlide(presentation, 16, {
  chapter: "第四章｜看見議會如何運作",
  title: "讓民主被理解，也被完整保存",
  label: "行政團隊｜讓每一場會議可信、可查",
  range: "08:15–09:10",
  duration: "55 秒",
  cumulative: "09:10",
  ...S.action,
  visual: "SHOT 21｜開會前：議程、席次、麥克風、文件與系統測試\n\nSHOT 22｜會議中：議事、法制、文書、資訊與影音人員協作\n\nSHOT 23｜會議後：紀錄整理、議案上網、影音典藏\n\nSHOT 24｜會史館展示更新、簡報室新 LED 與多語播放測試\n\nSHOT 25｜國內外訪賓參訪、公共關係與導覽服務",
  audio: "以開會前倒數聲建立秩序感\n\n不同處室動作採聲音接力：翻頁、插線、測麥、鍵盤、快門\n\n音樂重新加入溫度，節奏穩定向前",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "一場會議能順利進行，背後有許多看不見的準備。\n\n從議程安排、法制研析、文書與會議紀錄，到資訊系統、影音轉播、公共關係與行政支援，議會團隊讓每一場討論有秩序、有依據，也有可以查詢的紀錄。\n\n會史館保存地方自治走過的路；更新後的簡報室，則讓議會的故事以更清楚、更友善的方式被看見。\n\n當資料可以查找、影像可以回看、內容可以用不同語言理解，民主就不只發生在會議當下，也能被認識、被保存、被傳承。"],
    [{ run: "【字卡】\n", textStyle: { bold: true, color: C.coral } }, "準備每一場會議｜保存每一段民主紀錄"],
  ],
});

addSceneSlide(presentation, 17, {
  chapter: "第五章｜走向共好",
  title: "共好，不是所有人都說一樣的話",
  label: "價值收束｜讓差異走向公共利益",
  range: "09:10–10:15",
  duration: "65 秒",
  cumulative: "10:15",
  ...S.together,
  visual: "SHOT 26｜不同世代：兒童、青年、家長、長者\n\nSHOT 27｜不同生活：勞工、店家、農漁民、科技工作者、身障者、新住民\n\nSHOT 28｜族群文化與語言活動，先取得拍攝及使用同意\n\nSHOT 29｜公聽會、座談、服務處、會勘與議場的眼神交會\n\nSHOT 30｜議員跨席討論、握手、共同看向資料／現場，不刻意安排政黨符號",
  audio: "穿插 4 位市民極短原音：\n「希望更安全」\n「希望孩子留下來」\n「希望長輩被照顧」\n「希望文化繼續傳下去」\n\n原音最後匯入同一段配樂",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.coral } }, "共好，不是所有人都說一樣的話。\n\n沿海與山區、老社區與新市鎮，年輕家庭與高齡照顧，產業發展與環境永續——城市的選擇，往往沒有只有一種答案。\n\n議會存在的價值，是讓差異有位置，讓意見能交會，讓資源分配接受檢驗。\n\n當我們願意多看見一個人的處境，就多一種理解；多一次理解，就多一點形成共識的可能。\n\n共好，不是誰退到看不見的地方，而是每一個人都能在城市前進時，被一起帶上。"],
    [{ run: "【動畫字卡】\n", textStyle: { bold: true, color: C.coral } }, "看見差異｜理解彼此｜走向共好"],
  ],
});

addSceneSlide(presentation, 18, {
  chapter: "第五章｜走向共好",
  title: "第 5 屆的承諾，是讓每一份託付持續被看見",
  label: "議長期許｜建議口白可直接送審錄製",
  range: "10:15–11:25",
  duration: "70 秒",
  cumulative: "11:25",
  ...S.together,
  visual: "SHOT 31｜議長於議事廳或自然採光空間受訪；鏡位平視、背景保留議會辨識\n\nSHOT 32｜致詞間穿插：就職合照、議員傾聽、市民互動、現勘與質詢\n\nSHOT 33｜第 5 屆全體成員在議場／階梯完成正式群像\n\nSHOT 34｜鏡頭由群像拉遠，轉入城市夜景與清晨呼應",
  audio: "議長原音建議 28–32 秒\n\n不使用提詞感過重的正面背稿；採兩段訪談剪接\n\n背景音樂降至 25%，保留自然呼吸與停頓\n\n末句後停 1 秒再進旁白",
  narration: [
    [{ run: "【議長建議原音】\n", textStyle: { bold: true, color: C.coral } }, "第五屆新北市議會，承接的是六十八席民意，更是市民對這座城市的期待。\n\n我們會尊重不同聲音，善盡審議與監督責任，讓公共資源回應真正的需要；也會持續走進地方、傾聽市民，讓每一項承諾都有進度、每一個問題都有回應。\n\n新北的未來，需要市民、議會與市府一起努力。看見彼此，我們就能一起把城市變得更好。"],
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.blue } }, "每一屆議會，都站在前人走過的路上，也面向尚未完成的未來。第 5 屆的承諾，是讓每一份託付持續被看見，讓每一次討論，都更接近公共利益。"],
  ],
  narrationFont: 17,
  sources: ["https://gazette.nat.gov.tw/egFront/eguploadpubWrapper?file=%2FEG_FileManager%2Feguploadpub%2Feg032154%2Fch02%2Ftype3%2Fgov15%2Fnum2%2FEg.htm&metaid=167808"],
});

addSceneSlide(presentation, 19, {
  chapter: "片尾｜回到片名",
  title: "看見未來，共好新北",
  label: "結尾｜回收清晨，讓片名成為記憶",
  range: "11:25–11:50",
  duration: "25 秒",
  cumulative: "11:50",
  ...S.together,
  visual: "SHOT 35｜清晨同一組人物，此刻進入一天：孩子走進校門、店家迎客、列車抵站\n\nSHOT 36｜議場燈光亮起，全體席位空鏡\n\nSHOT 37｜句點化為節點，多個節點匯成新北輪廓／議會識別\n\nEND CARD｜新北市議會 LOGO＋正式片名",
  audio: "音樂回到片頭鋼琴主題，再加入完整弦樂\n\n最後一句旁白後留 2 秒畫面呼吸\n\nLOGO 動畫結束保留 3 秒，便於簡報室播放銜接",
  narration: [
    [{ run: "【旁白】\n", textStyle: { bold: true, color: C.coral } }, "看見，是願意靠近每一種生活；共好，是把不同的聲音，帶向共同的未來。\n\n當民意被聽見、行動被檢驗、承諾被追蹤，城市就能一步一步，走得更穩、更遠。\n\n看見每一個聲音，共好每一個日常。"],
    [{ run: "【片名字卡】\n", textStyle: { bold: true, color: C.teal } }, "看見.共好 － 第5屆新北市議會"],
  ],
});

// 20 Inauguration capture plan
{
  const page = 20;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "拍攝清單", "就職典禮素材，是全片最不能補拍的一天", "以「完整紀錄＋可剪成故事」雙軌思考，確保儀式、人物、關係與情緒都有素材。", C.violet);
  const cols = [
    { x: M, w: 215, title: "必錄儀式", body: "• 報到與進場\n• 全體宣誓\n• 議員逐一簽名\n• 議長、副議長選舉\n• 當選宣告與致詞\n• 正式大合照\n• 完整現場收音", c: C.violet, soft: C.violetSoft },
    { x: M + 235, w: 215, title: "人物細節", body: "• 胸花、名牌、選票與手部\n• 家屬與團隊互動\n• 議員互相致意\n• 宣誓時的眼神\n• 握手、擁抱與祝賀\n• 座位第一次坐定\n• 議場外自然訪談", c: C.teal, soft: C.tealSoft },
    { x: M + 470, w: 228, title: "技術保障", body: "• 主機位完整不中斷\n• 側機位捕捉表情\n• 游動機位補近景\n• 獨立錄音與備援\n• 大合照高畫素 RAW\n• 當日雙備份與校驗\n• 名單與座次同步", c: C.coral, soft: C.coralSoft },
  ];
  cols.forEach((b, i) => {
    addShape(slide, `capture-bg-${i}`, "roundRect", { left: b.x, top: 245, width: b.w, height: 560 }, b.soft, "none", 18);
    addText(slide, `capture-title-${i}`, b.title, { left: b.x + 18, top: 272, width: b.w - 36, height: 50 }, {
      fontSize: 23,
      bold: true,
      color: b.c,
      alignment: "center",
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addLine(slide, `capture-line-${i}`, b.x + 25, 338, b.w - 50, b.c, 2);
    addText(slide, `capture-body-${i}`, b.body, { left: b.x + 22, top: 365, width: b.w - 44, height: 405 }, {
      fontSize: 18,
      color: C.ink,
      lineSpacing: 1.42,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  addShape(slide, "capture-note-bg", "roundRect", { left: M, top: 850, width: W - M * 2, height: 142 }, C.white, { style: "solid", fill: C.line, width: 1 }, 14);
  addText(slide, "capture-note", "當日採訪建議｜每位議員以同一題收音：「您最希望第 5 屆議會，讓市民看見什麼？」回答控制在 8–12 秒，可作為多語版片頭／社群短版延伸素材。", { left: 70, top: 878, width: 654, height: 90 }, {
    fontSize: 18,
    bold: true,
    color: C.ink,
    lineSpacing: 1.25,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  notes(slide);
}

// 21 Multilingual and finalization
{
  const page = 21;
  const slide = presentation.slides.add();
  addDocTitle(slide, page, "多語版本與終校", "五種語言共用同一個故事，但不硬套同一個句長", "中文定稿後再做語意轉譯、畫面安全框與配音節奏微調，維持各版本自然可聽。", C.green);
  const items = [
    ["中文", "主版本；確認機關名稱、選區、席次、職權與議長致詞。"],
    ["英文", "職稱與制度詞彙先建立官方譯名表；避免逐字直譯。"],
    ["日文", "調整長句與敬語層級，旁白節奏較中文略放慢。"],
    ["台語", "先以口語自然為準，再統一字幕用字；專有名詞另列讀音。"],
    ["韓文", "確認地名音譯與議會制度詞彙，保留畫面字卡停留時間。"],
  ];
  items.forEach((it, i) => {
    const y = 240 + i * 122;
    addText(slide, `lang-name-${i}`, it[0], { left: M, top: y, width: 90, height: 76 }, {
      fontSize: 22,
      bold: true,
      color: C.green,
      alignment: "center",
      verticalAlignment: "middle",
      fill: C.greenSoft,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addText(slide, `lang-body-${i}`, it[1], { left: M + 112, top: y, width: 586, height: 76 }, {
      fontSize: 18,
      color: C.ink,
      verticalAlignment: "middle",
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    addLine(slide, `lang-rule-${i}`, M + 112, y + 84, 586, C.line, 1);
  });
  addShape(slide, "final-check-bg", "roundRect", { left: M, top: 870, width: W - M * 2, height: 150 }, C.navy, "none", 18);
  addText(slide, "final-check-title", "上線前四項必核", { left: 74, top: 892, width: 170, height: 34 }, {
    fontSize: 19,
    bold: true,
    color: "#9FD2CE",
    verticalAlignment: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  addText(slide, "final-check-body", "當選名單與席次｜議長／副議長職稱姓名｜就職日期與現場原音｜所有人物、音樂、族群文化素材授權", { left: 74, top: 936, width: 646, height: 58 }, {
    fontSize: 17,
    bold: true,
    color: C.white,
    lineSpacing: 1.25,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  notes(slide);
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(RENDER_DIR, { recursive: true });
for (const [i, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(i + 1).padStart(2, "0")}`;
  await writeBlob(`${RENDER_DIR}/${stem}.png`, await presentation.export({ slide, format: "png", scale: 1.35 }));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(`${RENDER_DIR}/${stem}.layout.json`, await layout.text());
}
await writeBlob(`${RENDER_DIR}/montage.webp`, await presentation.export({ format: "webp", montage: true, scale: 0.7 }));
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUT);
console.log(`Wrote ${OUT}`);
