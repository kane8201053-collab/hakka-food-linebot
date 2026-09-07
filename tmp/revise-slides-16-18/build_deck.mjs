import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/zhangzixuan/Desktop/hakka-food-linebot";
const TMP = `${ROOT}/tmp/revise-slides-16-18`;
const STARTER = `${TMP}/template-starter.pptx`;
const MEDIA = `${TMP}/extracted-source/ppt/media`;
const OUTPUT = `${ROOT}/output/看見共好_影片腳本_A4直式_敘事校正版_16-18頁優化版.pptx`;
const QA_DIR = `${TMP}/final-render`;
const LAYOUT_DIR = `${TMP}/final-layout/final`;

const W = 794;
const H = 1122.17;
const C = {
  navy: "#22313F",
  ink: "#34424D",
  muted: "#687783",
  teal: "#0F8A85",
  tealSoft: "#E8F4F2",
  gold: "#D9A62E",
  goldSoft: "#F9F3DF",
  coral: "#D96B57",
  paper: "#FFFFFF",
  cloud: "#F4F7F7",
  line: "#DCE4E6",
};
const FONT = "Microsoft JhengHei";

async function readBytes(file) {
  const bytes = await fs.readFile(file);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

function clearSlide(slide) {
  slide.shapes.deleteAll();
  for (const item of [...slide.images.items]) slide.images.deleteById(item.id);
  for (const item of [...slide.tables.items]) slide.tables.deleteById(item.id);
  for (const item of [...slide.charts.items]) slide.charts.deleteById(item.id);
}

function addShape(slide, name, position, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry || "rect",
    name,
    position,
    fill: options.fill ?? "none",
    line: options.line || { style: "solid", fill: options.lineColor || "none", width: options.lineWidth || 0 },
    borderRadius: options.borderRadius,
    shadow: options.shadow,
  });
}

function addText(slide, name, text, position, options = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: options.fill ?? "none",
    line: options.line || { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: options.fontSize || 16,
    typeface: options.typeface || FONT,
    color: options.color || C.ink,
    bold: options.bold || false,
    alignment: options.alignment || "left",
    verticalAlignment: options.verticalAlignment || "top",
    autoFit: options.autoFit || "shrinkText",
    lineSpacing: options.lineSpacing || 1.08,
  };
  return box;
}

async function addImage(slide, name, file, position, options = {}) {
  const ext = path.extname(file).toLowerCase();
  const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const image = slide.images.add({
    blob: await readBytes(file),
    contentType,
    alt: options.alt || name,
    prompt: options.prompt,
    fit: options.fit || "cover",
    geometry: options.geometry || "roundRect",
    borderRadius: options.borderRadius ?? 8,
    position,
  });
  image.name = name;
  return image;
}

function addHeader(slide, page, subtitle) {
  addText(slide, `title-${page}`, "工作團隊與執行分工", { left: 54, top: 43, width: 686, height: 48 }, {
    fontSize: 32,
    bold: true,
    color: C.navy,
  });
  addText(slide, `subtitle-${page}`, subtitle, { left: 55, top: 99, width: 560, height: 27 }, {
    fontSize: 15.5,
    bold: true,
    color: C.teal,
  });
  addShape(slide, `header-line-${page}`, { left: 54, top: 138, width: 686, height: 3 }, { fill: C.teal });
  addShape(slide, `header-gold-${page}`, { left: 669, top: 138, width: 71, height: 3 }, { fill: C.gold });
}

function addFooter(slide, page) {
  addShape(slide, `footer-line-${page}`, { left: 54, top: 1055, width: 686, height: 1 }, { fill: C.line });
  addText(slide, `footer-label-${page}`, "看見.共好｜製作團隊", { left: 54, top: 1067, width: 330, height: 22 }, {
    fontSize: 11.5,
    color: C.muted,
  });
  addText(slide, `footer-page-${page}`, `${page} / 18`, { left: 655, top: 1067, width: 85, height: 22 }, {
    fontSize: 11.5,
    color: C.muted,
    alignment: "right",
  });
}

function addSectionLabel(slide, name, text, top, accent = C.teal) {
  addShape(slide, `${name}-bar`, { left: 54, top: top + 3, width: 5, height: 19 }, { fill: accent });
  addText(slide, name, text, { left: 68, top, width: 570, height: 26 }, {
    fontSize: 15.5,
    bold: true,
    color: C.navy,
    verticalAlignment: "middle",
  });
}

function addTag(slide, name, text, position, fill, color = C.paper) {
  addShape(slide, `${name}-bg`, position, { geometry: "roundRect", fill, borderRadius: 8 });
  addText(slide, name, text, {
    left: position.left + 5,
    top: position.top + 3,
    width: position.width - 10,
    height: position.height - 6,
  }, {
    fontSize: 11.5,
    bold: true,
    color,
    alignment: "center",
    verticalAlignment: "middle",
  });
}

function addEquipmentCard(slide, cfg) {
  addShape(slide, `${cfg.name}-card`, cfg.card, {
    geometry: "roundRect",
    fill: cfg.fill,
    borderRadius: 12,
    line: { style: "solid", fill: C.line, width: 1 },
  });
  addShape(slide, `${cfg.name}-accent`, { left: cfg.card.left, top: cfg.card.top, width: 8, height: cfg.card.height }, {
    geometry: "roundRect",
    fill: cfg.accent,
    borderRadius: 10,
  });
  addTag(slide, `${cfg.name}-tag`, cfg.eyebrow, {
    left: cfg.card.left + 25,
    top: cfg.card.top + 18,
    width: 120,
    height: 26,
  }, cfg.accent);
  addText(slide, `${cfg.name}-title`, cfg.title, {
    left: cfg.card.left + 25,
    top: cfg.card.top + 52,
    width: cfg.card.width - 50,
    height: 34,
  }, {
    fontSize: 18.5,
    bold: true,
    color: C.navy,
    verticalAlignment: "middle",
  });
  addShape(slide, `${cfg.name}-image-matte`, {
    left: cfg.card.left + 25,
    top: cfg.card.top + 92,
    width: cfg.card.width - 50,
    height: 127,
  }, {
    geometry: "roundRect",
    fill: C.paper,
    borderRadius: 8,
  });
}

async function buildSlide16(slide) {
  clearSlide(slide);
  addHeader(slide, 16, "影片拍攝陣容與器材配置");

  addSectionLabel(slide, "team-grid-label", "實拍陣容｜跨場域拍攝經驗", 158, C.teal);
  const photos = [61, 62, 63, 64, 65, 66];
  const photoW = 222;
  const photoH = 166.5;
  const xs = [54, 286, 518];
  const ys = [193, 370];
  for (let i = 0; i < photos.length; i += 1) {
    const left = xs[i % 3];
    const top = ys[Math.floor(i / 3)];
    await addImage(slide, `production-photo-${i + 1}`, `${MEDIA}/image${photos[i]}.jpeg`, {
      left,
      top,
      width: photoW,
      height: photoH,
    }, {
      fit: "cover",
      alt: `原始拍攝團隊實拍照片 ${i + 1}`,
    });
    addTag(slide, `production-index-${i + 1}`, String(i + 1).padStart(2, "0"), {
      left: left + 12,
      top: top + photoH - 34,
      width: 46,
      height: 23,
    }, i % 2 === 0 ? C.teal : C.gold);
  }

  addSectionLabel(slide, "equipment-label", "攝／錄影設備配置", 558, C.gold);

  const leftCard = { left: 54, top: 594, width: 333, height: 405 };
  const rightCard = { left: 407, top: 594, width: 333, height: 405 };
  addEquipmentCard(slide, {
    name: "camera-system",
    card: leftCard,
    fill: C.cloud,
    accent: C.teal,
    eyebrow: "主攝系統",
    title: "全片幅電影機配置",
  });
  addEquipmentCard(slide, {
    name: "drone-system",
    card: rightCard,
    fill: C.goldSoft,
    accent: C.gold,
    eyebrow: "空拍系統",
    title: "專業級模組化空拍系統",
  });

  await addImage(slide, "sony-camera-original", `${MEDIA}/image69.png`, {
    left: leftCard.left + 34,
    top: leftCard.top + 101,
    width: leftCard.width - 68,
    height: 111,
  }, {
    fit: "cover",
    borderRadius: 0,
    geometry: "rect",
    alt: "原簡報中的 Sony 電影機器材示意",
  });
  await addImage(slide, "neutral-professional-drone", `${TMP}/assets/neutral-professional-drone.png`, {
    left: rightCard.left + 34,
    top: rightCard.top + 101,
    width: rightCard.width - 68,
    height: 111,
  }, {
    fit: "contain",
    borderRadius: 0,
    geometry: "rect",
    alt: "無品牌識別的專業模組化空拍系統示意圖",
    prompt: "Photorealistic neutral professional modular cinema drone, carbon-fiber quadcopter, integrated gimbal camera, no logos, no text, not resembling a consumer DJI Mavic silhouette.",
  });

  addText(slide, "camera-models", "Sony A7S III｜Sony ILME-FX3A", {
    left: leftCard.left + 25,
    top: leftCard.top + 231,
    width: leftCard.width - 50,
    height: 28,
  }, { fontSize: 14.5, bold: true, color: C.teal });
  addText(slide, "camera-specs", "4K 高畫質最高 120p\n16–35／24–70／70–200 mm 全片幅鏡群\n雙機協作，支援紀錄與電影感畫面", {
    left: leftCard.left + 25,
    top: leftCard.top + 269,
    width: leftCard.width - 50,
    height: 96,
  }, { fontSize: 14.2, color: C.ink, lineSpacing: 1.2 });

  addText(slide, "drone-models", "專業級模組化空拍系統", {
    left: rightCard.left + 25,
    top: rightCard.top + 231,
    width: rightCard.width - 50,
    height: 28,
  }, { fontSize: 14.5, bold: true, color: "#9A7418" });
  addText(slide, "drone-specs", "4K 高畫質拍攝\n模組化雲台與可替換鏡頭配置\n廣角／中長焦視角，依場域安全調度", {
    left: rightCard.left + 25,
    top: rightCard.top + 269,
    width: rightCard.width - 50,
    height: 96,
  }, { fontSize: 14.2, color: C.ink, lineSpacing: 1.2 });

  addShape(slide, "equipment-summary", { left: 54, top: 1013, width: 686, height: 29 }, {
    geometry: "roundRect",
    fill: C.navy,
    borderRadius: 9,
  });
  addText(slide, "equipment-summary-text", "4K 高畫質｜雙機協作｜全片幅鏡群｜空地整合", {
    left: 70,
    top: 1016,
    width: 654,
    height: 23,
  }, {
    fontSize: 12.5,
    bold: true,
    color: C.paper,
    alignment: "center",
    verticalAlignment: "middle",
  });
  addFooter(slide, 16);
  slide.speakerNotes.append("\n\n[Sources]\n- 使用者提供簡報中的拍攝團隊與 Sony 電影機器材照片。\n- OpenAI image generation：無品牌識別的專業模組化空拍系統示意圖；僅供器材等級與構型說明，實際配置依場地、安全與拍攝需求調度。\n- 第 16 頁已移除原有 DJI 品牌與產品型號呈現。");
}

const TEAM17 = [
  {
    number: "01",
    name: "張子軒",
    role: "導演／剪輯",
    image: `${MEDIA}/image71.png`,
    fit: "cover",
    accent: C.teal,
    fill: C.tealSoft,
    bio: "2024｜新北客家桐花祭、臺北市客家義民嘉年華宣傳影片\n2025｜新北平溪天燈節、新北市國慶宣傳影片\n2026｜新北平溪天燈節、新北市客家美食節宣傳影片\n負責｜腳本企劃・導演・剪輯",
  },
  {
    number: "02",
    name: "蔡天與",
    role: "攝影師",
    image: `${MEDIA}/image70.jpg`,
    fit: "cover",
    accent: C.gold,
    fill: C.goldSoft,
    bio: "2020–2021｜TimmyCall〈遲到王〉、〈Killer Paper〉MV\n2024｜新北客家桐花祭、臺北市客家義民嘉年華\n2025｜新北平溪天燈節\n負責｜MV 腳本企劃・導演／節慶影片攝影",
  },
  {
    number: "03",
    name: "Billy 雨利",
    role: "攝影師",
    image: `${MEDIA}/image72.jpg`,
    fit: "cover",
    accent: C.coral,
    fill: "#F9EEEB",
    bio: "2022｜《費叔叔愛相挺》活動紀錄｜攝影・剪輯\n2023｜睡眠廣告｜攝影\n2023｜MCUT Global Image Video｜導演・攝影・剪輯\n2023｜《100種解決打呼的方法》｜攝影・燈光\n2024｜《如何消除背痘？》｜導演・攝影・燈光",
  },
];

const TEAM18 = [
  {
    number: "04",
    name: "廖宗煒",
    role: "導演／攝影",
    image: `${MEDIA}/image75.jpg`,
    fit: "contain",
    accent: C.teal,
    fill: C.tealSoft,
    bio: "煒業影像工作室負責人｜具備無人機操作證照\n政府／觀光｜公館旅遊、五結鄉公所幼兒園、桃園觀光局形象影片\nMV｜四分衛 Quarterback、脫拉庫、何瑞康、廖士賢\n品牌廣告｜宏佳騰、麥卡倫、cama café、台泥\n負責｜導演・攝影",
  },
  {
    number: "05",
    name: "宸洛",
    role: "製片／場務",
    image: `${MEDIA}/image73.png`,
    fit: "cover",
    accent: C.gold,
    fill: C.goldSoft,
    bio: "2019.09–2020.03｜MOMOTV 體育賽事部・攝影師\n2020.05–2022.04｜臺北市議員公費助理\n2022.04–2023.07｜壹電視《新聞思想啟》・執行製作\n2023.08–至今｜民視新聞部・攝影記者",
  },
  {
    number: "06",
    name: "志豪",
    role: "燈光／場務",
    image: `${MEDIA}/image74.png`,
    fit: "cover",
    accent: C.coral,
    fill: "#F9EEEB",
    bio: "2020–2021｜TimmyCall〈遲到王〉、〈Killer Paper〉MV\n負責｜攝助・燈光\n2024｜臺北市客家義民嘉年華影片\n負責｜攝助・燈光",
  },
];

async function addProfileCard(slide, cfg, index, page) {
  const top = 167 + index * 282;
  const card = { left: 54, top, width: 686, height: 258 };
  addShape(slide, `profile-card-${page}-${index + 1}`, card, {
    geometry: "roundRect",
    fill: cfg.fill,
    borderRadius: 14,
    line: { style: "solid", fill: C.line, width: 1 },
  });
  addShape(slide, `profile-accent-${page}-${index + 1}`, { left: card.left, top: card.top, width: 9, height: card.height }, {
    geometry: "roundRect",
    fill: cfg.accent,
    borderRadius: 12,
  });
  addText(slide, `profile-number-${page}-${index + 1}`, cfg.number, {
    left: 73,
    top: top + 20,
    width: 52,
    height: 28,
  }, { fontSize: 13, bold: true, color: cfg.accent });
  addShape(slide, `profile-photo-matte-${page}-${index + 1}`, { left: 73, top: top + 54, width: 164, height: 179 }, {
    geometry: "roundRect",
    fill: C.paper,
    borderRadius: 10,
  });
  await addImage(slide, `profile-photo-${page}-${index + 1}`, cfg.image, {
    left: 78,
    top: top + 59,
    width: 154,
    height: 169,
  }, {
    fit: cfg.fit,
    alt: `${cfg.name} 原始團隊照片`,
  });
  addText(slide, `profile-name-${page}-${index + 1}`, cfg.name, {
    left: 263,
    top: top + 21,
    width: 220,
    height: 37,
  }, { fontSize: 23, bold: true, color: C.navy, verticalAlignment: "middle" });
  addTag(slide, `profile-role-${page}-${index + 1}`, cfg.role, {
    left: 578,
    top: top + 22,
    width: 132,
    height: 30,
  }, cfg.accent);
  addShape(slide, `profile-rule-${page}-${index + 1}`, { left: 263, top: top + 65, width: 447, height: 1 }, { fill: C.line });
  addText(slide, `profile-bio-label-${page}-${index + 1}`, "SELECTED WORKS / EXPERIENCE", {
    left: 263,
    top: top + 78,
    width: 250,
    height: 20,
  }, { fontSize: 10.3, bold: true, color: cfg.accent });
  addText(slide, `profile-bio-${page}-${index + 1}`, cfg.bio, {
    left: 263,
    top: top + 104,
    width: 447,
    height: 129,
  }, { fontSize: 13.2, color: C.ink, lineSpacing: 1.16 });
}

async function buildTeamSlide(slide, page, members) {
  clearSlide(slide);
  addHeader(slide, page, `核心影像團隊｜${page === 17 ? "01" : "02"}`);
  for (let i = 0; i < members.length; i += 1) await addProfileCard(slide, members[i], i, page);
  addFooter(slide, page);
  slide.speakerNotes.append("\n\n[Sources]\n- 人物照片與經歷文字均取自使用者提供的原始簡報；本頁僅重新編排、統整標點與資訊層級。\n- 所有照片均以等比例裁切或完整置入，未做非等比例拉伸。");
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(STARTER));
await buildSlide16(presentation.slides.getItem(15));
await buildTeamSlide(presentation.slides.getItem(16), 17, TEAM17);
await buildTeamSlide(presentation.slides.getItem(17), 18, TEAM18);

await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
await fs.mkdir(QA_DIR, { recursive: true });
await fs.mkdir(LAYOUT_DIR, { recursive: true });

for (const [index, slide] of presentation.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(`${QA_DIR}/${stem}.png`, await presentation.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(`${LAYOUT_DIR}/${stem}.layout.json`, await (await slide.export({ format: "layout" })).text());
}

await writeBlob(`${QA_DIR}/montage.webp`, await presentation.export({ format: "webp", montage: true, scale: 1 }));
const inspect = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,layout",
  include: "id,slide,name,title,text,textPreview,bbox,bboxUnit,rows,cols,isPlaceholder,placeholders,alt",
  maxChars: 220000,
});
await fs.writeFile(`${TMP}/final-inspect.ndjson`, inspect.ndjson);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUTPUT);
console.log(OUTPUT);
