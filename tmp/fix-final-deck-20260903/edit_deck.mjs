import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/fix-final-deck-20260903";
const INPUT = path.join(ROOT, "template-starter.pptx");
const OUTPUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/看見・共好（腳本＋器材＋人員）_修正版.pptx";
const RENDER_DIR = path.join(ROOT, "final-render");
const LAYOUT_DIR = path.join(ROOT, "final-layout");

const deck = await PresentationFile.importPptx(await FileBlob.load(INPUT));

function slide(n) {
  return deck.slides.getItem(n - 1);
}

function shapeByName(s, name) {
  const item = s.shapes.items.find((x) => x.name === name);
  if (!item) throw new Error(`Missing shape ${name}`);
  return item;
}

function imageByName(s, name) {
  const item = s.images.items.find((x) => x.name === name);
  if (!item) throw new Error(`Missing image ${name}`);
  return item;
}

function setText(item, value) {
  item.text.replace(item.text.toString(), value);
}

function replaceText(item, from, to) {
  const current = item.text.toString();
  if (!current.includes(from)) throw new Error(`Text not found in ${item.name}: ${from}`);
  item.text.replace(from, to);
}

function replaceAfterPrefix(item, prefix, tail) {
  const current = item.text.toString();
  const start = current.indexOf(prefix);
  if (start < 0) throw new Error(`Prefix not found in ${item.name}: ${prefix}`);
  const cut = start + prefix.length;
  item.text.replace(current.slice(cut), tail);
}

function move(item, position) {
  item.position.merge(position);
}

function setTableCell(table, row, col, value) {
  table.cells.set(row, col, value);
}

function appendSources(s, lines) {
  s.speakerNotes.append(`\n[Sources]\n${lines.map((x) => `- ${x}`).join("\n")}`);
}

// Slide 1 — visible narrative overview and a consistent process concept.
{
  const s = slide(1);
  setText(shapeByName(s, "Text 2"), "腳本核心概念：五章結構，一句「看見」貫穿全片");
  const concept = shapeByName(s, "Text 5");
  replaceAfterPrefix(
    concept,
    "片名即敘事",
    "｜第4屆《傾聽．卓越》從機構出發；第5屆《看見．共好》改由城市生活出發。片頭60秒先看人與日常，議會外觀延至最後一鏡；民意被看見、行動被檢驗、承諾被追蹤，最終走向共好。\n三個視覺母題｜眼睛與光・同機位前後對照・環境聲與議事聲接力"
  );
  move(concept, { height: 116 });
  setText(
    shapeByName(s, "Text 57"),
    "第5屆：跟著一件市民關切——受理、查證、現勘、定義問題，再依案件進入質詢／提案／協調，最後追蹤並回到現場。"
  );
  appendSources(s, [
    "/Users/zhangzixuan/Desktop/4.需求書.pdf",
    "https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"
  ]);
}

// Slide 2 — timing table and acceptance-facing compliance summary.
{
  const s = slide(2);
  setText(shapeByName(s, "Text 2"), "分鏡腳本對照總表（總長度約11分10秒）");
  const table = s.tables.items[0];
  if (!table) throw new Error("Missing slide 2 table");
  setTableCell(table, 9, 1, "第三章\n看見民意如何成為行動｜跟著一件市民關切走進議會");
  setTableCell(table, 11, 1, "民意轉化 A｜受理 → 查證 → 現勘 → 定義問題 → 形成處理路徑");
  setTableCell(table, 12, 1, "民意轉化 B｜質詢／提案／協調 → 必要時審查與議決 → 追蹤");
  move(shapeByName(s, "Shape 4"), { top: 858, height: 208 });
  const compliance = shapeByName(s, "Text 5");
  replaceAfterPrefix(
    compliance,
    "需求書合規",
    "｜全片11分10秒，符合10至12分鐘；就職典禮另行全程錄影、同步拍照並完成大合照，成片擷取重點使用。\n4K拍攝與4K主檔輸出，另製作簡報室LED測試版；華語、英語、日語、臺語、韓語五語版本分別校對。\n交付五語合一USB隨身碟300個、藍光光碟1式及完整製作素材；會史館與LED更新成果於4-2段入鏡。"
  );
  move(compliance, { left: 81.6, top: 875, width: 630.72, height: 116 });
  const note = shapeByName(s, "Text 6");
  setText(
    note,
    "註：13選舉區、應選68席（區域62、平地原住民4、山地原住民2）依中選會正式公告；第5屆議員就職日為115年12月25日。實際名單、致詞與議程依本會核定資料修正。"
  );
  move(note, { left: 81.6, top: 1002, width: 630.72, height: 48 });
  appendSources(s, [
    "/Users/zhangzixuan/Desktop/4.需求書.pdf",
    "https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"
  ]);
}

// Slide 4 — history only, with the correct time span.
{
  const s = slide(4);
  setText(shapeByName(s, "scene-title-7"), "看見傳承，讓民意一路被看見");
  const narration = shapeByName(s, "narration-7");
  replaceText(
    narration,
    "時代改變，城市擴大，七十多年來,這道光不曾熄滅。今天它傳到了第5屆——68席民意在四百萬市民的注視下宣誓:看見民意,守護共好。",
    "時代改變，城市擴大。近八十年來，這道光不曾熄滅；今天，它傳到了第5屆——68席民意在四百萬市民的注視下宣誓：看見民意，守護共好。"
  );
  replaceText(narration, "看見傳承.民主如光", "看見傳承．民主如光");
  appendSources(s, ["https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"]);
}

// Slide 5 — explicitly distinguish complete ceremony documentation from the film excerpt.
{
  const s = slide(5);
  const visual = shapeByName(s, "visual-8");
  replaceText(visual, "SHOT 9｜12 月 25 日就職典禮：報到、胸花、宣誓、簽名", "SHOT 09｜12月25日就職典禮全程紀錄：報到、宣誓、簽名");
  replaceText(visual, "SHOT 10｜議長／副議長選舉與握手、大合照", "SHOT 10｜議長／副議長選舉、握手及大合照；同步完成平面攝影");
  const narration = shapeByName(s, "narration-8");
  replaceText(narration, "一席議員，是一個地區、一群人、一種生活的代表。", "一席議員，是一個選舉區、一群人、一種生活的代表。");
  appendSources(s, [
    "/Users/zhangzixuan/Desktop/4.需求書.pdf",
    "https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"
  ]);
}

// Slide 6 — clear the copy first, then place four inherited images in a tidy 2x2 grid.
{
  const s = slide(6);
  setText(shapeByName(s, "scene-title-9"), "看見日常，選區不是地圖上的切線");
  setText(
    shapeByName(s, "visual-9"),
    "第1選舉區｜石門・三芝・淡水・八里\n海岸・漁港・老街・輕軌\n\n第2選舉區｜林口・五股・泰山\n新市鎮・產業・交通節點\n\n第3選舉區｜新莊\n老街・工業脈絡・住宅與副都心\n\n第4選舉區｜蘆洲・三重\n河岸・密集街區・通勤與市場"
  );
  const placements = [
    ["storyboard-6-1", "storyboard-caption-6-1", 72, 545],
    ["storyboard-6-2", "storyboard-caption-6-2", 254, 545],
    ["storyboard-6-3", "storyboard-caption-6-3", 72, 711],
    ["storyboard-6-4", "storyboard-caption-6-4", 254, 711]
  ];
  for (const [imageName, captionName, left, top] of placements) {
    move(imageByName(s, imageName), { left, top, width: 156.21, height: 147.85 });
    move(shapeByName(s, captionName), { left, top: top + 127, width: 155.61, height: 21 });
  }
}

// Slide 8 — punctuation and balanced existing imagery.
{
  const s = slide(8);
  setText(shapeByName(s, "scene-title-11"), "看見地理，多元共榮的日常");
  const pairs = [
    ["Picture 21", "Rectangle 22", "TextBox 23", 70],
    ["Picture 24", "Rectangle 25", "TextBox 26", 270]
  ];
  for (const [imageName, bgName, textName, left] of pairs) {
    move(imageByName(s, imageName), { left, top: 722, width: 180, height: 90 });
    move(shapeByName(s, bgName), { left, top: 812, width: 180, height: 21 });
    move(shapeByName(s, textName), { left: left + 5, top: 812, width: 170, height: 21 });
  }
  appendSources(s, ["https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"]);
}

// Slide 10 — a citizen concern can take more than one procedural route.
{
  const s = slide(10);
  setText(shapeByName(s, "scene-title-13"), "看見問題，跟著一件市民關切走進議會");
  setText(shapeByName(s, "scene-band-label-13"), "民意轉化 A｜受理、查證、現勘、形成處理路徑");
  setText(
    shapeByName(s, "visual-13"),
    "STEP 1｜市民反映：電話、線上、服務處或當面陳情\n\nSTEP 2｜資料整理：遮蔽個資，建立照片、地圖與時間軸\n\nSTEP 3｜現地了解：議員、居民與相關單位共同會勘\n\nSTEP 4｜問題定義：釐清安全、預算、權責與期程\n\nSTEP 5｜形成處理路徑：質詢、提案或行政協調"
  );
  const narration = shapeByName(s, "narration-13");
  replaceText(
    narration,
    "市民看見的每一個改變,在這裡都有一段旅程。一份提案與陳請,從服務處出發,走進委員會,被逐條檢視 。",
    "市民看見的每一個問題，在這裡都有一段旅程。一件市民關切從服務處出發，經過查證、現勘與問題定義，再依案件性質形成處理路徑。"
  );
  replaceText(
    narration,
    "每一年,數千億的市政預算在這裡逐項把關;大會與各委員會分工合力,只為一件事:讓你的聲音,成為城市的決定 。",
    "每一年，龐大的市政預算在這裡逐項把關；大會與各委員會依權責分工，只為讓市民的聲音進入城市的決定。"
  );
  setText(shapeByName(s, "storyboard-caption-10-5"), "形成處理路徑");
  const placements = [
    ["storyboard-10-1", "storyboard-caption-10-1", 72, 610],
    ["storyboard-10-2", "storyboard-caption-10-2", 278, 610],
    ["storyboard-10-3", "storyboard-caption-10-3", 72, 755],
    ["storyboard-10-4", "storyboard-caption-10-4", 278, 755],
    ["storyboard-10-5", "storyboard-caption-10-5", 175, 900]
  ];
  for (const [imageName, captionName, left, top] of placements) {
    move(imageByName(s, imageName), { left, top, width: 160, height: 120 });
    move(shapeByName(s, captionName), { left, top: top + 96, width: 160, height: 24 });
  }
}

// Slide 11 — conditional paths rather than a universal mandatory sequence.
{
  const s = slide(11);
  setText(shapeByName(s, "scene-band-label-14"), "民意轉化 B｜處理路徑、審議與持續追蹤");
  setText(
    shapeByName(s, "visual-14"),
    "STEP 6｜依案件性質進入質詢、提案或行政協調\n\nSTEP 7｜必要時由委員會進行資料比對與專業審查\n\nSTEP 8｜依法案或預算性質進入大會討論與議決\n\nSTEP 9｜列管回覆、工程進度或政策修正\n\nSTEP 10｜回到現場：同機位拍攝改善前後；未完成案件呈現追蹤狀態"
  );
  const narration = shapeByName(s, "narration-14");
  replaceText(
    narration,
    "接著，問題走進質詢與審查。議員要求說明、檢視資料、確認預算與期程；不同意見在會議中被提出，也在公開紀錄中留下軌跡。",
    "接著，案件依其性質，可能進入質詢、提案、行政協調，或在必要時送交委員會與大會審議；不同意見被提出，也在公開紀錄中留下軌跡。"
  );
  replaceText(narration, "質詢 → 審查 → 議決 → 追蹤 → 回到現場", "質詢／提案／協調 → 必要時審查與議決 → 追蹤 → 回到現場");
}

// Slide 12 — bridge the illustrative case to the council's broader statutory work.
{
  const s = slide(12);
  const narration = shapeByName(s, "narration-15");
  replaceText(
    narration,
    "議會，是地方自治中代表市民行使監督與議決權的機關。",
    "這不只是一個案件，也是議會日常運作的縮影。議會，是地方自治中代表市民行使監督與議決權的機關。"
  );
}

// Slides 14-15 — continuous shot numbering and clearer production language.
{
  const s = slide(14);
  setText(shapeByName(s, "scene-band-label-18"), "議長期許｜建議口白供議長核定後錄製");
  setText(
    shapeByName(s, "visual-18"),
    "SHOT 26｜議長於議事廳或自然採光空間受訪；鏡位平視、背景保留議會辨識\nSHOT 27｜致詞間穿插就職合照、議員傾聽、市民互動、現勘與質詢\nSHOT 28｜第5屆全體成員於議場／階梯完成正式群像\nSHOT 29｜鏡頭由群像拉遠，轉入城市夜景與清晨呼應"
  );
  appendSources(s, ["https://web.cec.gov.tw/api/file/45d8e965-f63a-46d5-b636-7d81e47cf4d1.pdf"]);
}
{
  const s = slide(15);
  setText(
    shapeByName(s, "visual-19"),
    "SHOT 30｜清晨，城市走進新的一天：孩子進校門、店家迎客、列車抵站\nSHOT 31｜議場燈光亮起，全體席位空鏡\nSHOT 32｜句點化為節點，多個節點匯成新北輪廓／議會識別\n\nEND CARD｜新北市議會LOGO＋正式片名"
  );
}

// Slide 16 — practical non-PRC drone platform, clearer evidence requirements, and a readable compliance panel.
{
  const s = slide(16);
  setText(shapeByName(s, "Text 15"), "2022年後出廠；檢附型號、年份與原廠規格");
  const table = s.tables.items[0];
  if (!table) throw new Error("Missing slide 16 table");
  setTableCell(table, 1, 3, "議事紀錄、訪談與情境補拍主機");
  setTableCell(table, 4, 1, "Skydio X10（美國製）");
  setTableCell(table, 4, 2, "4K 3,840×2,880；最大起飛重量2.49kg；360°避障");
  setTableCell(table, 4, 3, "城市空景、選區地景、片尾拉升");
  setTableCell(table, 5, 1, "非陸製三軸穩定器、電動滑軌、專業腳架組");
  setTableCell(table, 6, 1, "非陸製LED燈、無線麥克風、指向性麥克風、多軌錄音機");

  const panel = shapeByName(s, "Shape 16");
  move(panel, { left: 294, top: 824, width: 442, height: 218 });
  const panelTitle = shapeByName(s, "Text 17");
  setText(panelTitle, "設備合規與交付原則（對應需求書參、五）");
  move(panelTitle, { left: 315, top: 836, width: 400, height: 28 });
  const panelBody = shapeByName(s, "Text 18");
  setText(
    panelBody,
    "• 實際進場器材須為2022年後出廠，逐項檢附品牌、型號、製造年份與原廠規格。\n• 不使用中國大陸廠牌之資通訊產品；穩定、收音、燈光與儲存設備一併列入清冊。\n• 空拍由持專業操作證人員執行，依地點完成登錄、空域／場地申請及責任保險。\n• 全片採4K拍攝與4K主檔輸出，另依簡報室LED完成實機測試與播放版轉製。"
  );
  move(panelBody, { left: 315, top: 867, width: 400, height: 155 });

  const drone = imageByName(s, "neutral-professional-drone");
  drone.replace({ path: path.join(ROOT, "skydio-x10-crop.png"), alt: "Skydio X10 professional drone in flight", fit: "cover" });
  move(drone, { left: 57.6, top: 850, width: 220, height: 146.67 });
  const brochure = imageByName(s, "圖片 27");
  brochure.delete();

  appendSources(s, [
    "/Users/zhangzixuan/Desktop/4.需求書.pdf",
    "https://www.skydio.com/x10/technical-specs",
    "https://www.caa.gov.tw/Article.aspx?a=3006&lang=1",
    "https://www.caa.gov.tw/Article.aspx?a=2430&lang=1",
    "Image: https://cdn.sanity.io/images/mgxz50fq/production-v3-red/6bc55640edeabf47e5af325d0eb78777e339f6f8-2880x1582.png"
  ]);
}

// Slide 17 — correct credits and prevent the English label from wrapping into the body.
{
  const s = slide(17);
  for (const name of ["profile-bio-label-17-1", "profile-bio-label-17-2", "profile-bio-label-17-3"]) {
    setText(shapeByName(s, name), "SELECTED EXPERIENCE");
  }
  setText(
    shapeByName(s, "profile-bio-17-1"),
    "2024｜新北客家桐花祭、臺北市客家義民嘉年華宣傳影片\n2025｜新北平溪天燈節、新北市國慶宣傳影片\n2026｜新北平溪天燈節、新北市客家美食節宣傳影片\n負責｜腳本企劃・導演・剪輯"
  );
}

// Slide 18 — match role labels to the experience shown on the cards.
{
  const s = slide(18);
  setText(shapeByName(s, "profile-role-18-2"), "製片／現場協調");
  setText(
    shapeByName(s, "profile-bio-18-2"),
    "2019.09–2020.03｜MOMOTV體育賽事部・攝影師\n2020.05–2022.04｜臺北市議員公費助理\n2022.04–2023.07｜壹電視《新聞思想啟》・執行製作\n2023.08–至今｜民視新聞部・攝影記者\n本案負責｜製片協調・現場聯繫"
  );
  setText(shapeByName(s, "profile-role-18-3"), "燈光／攝影協力");
  setText(
    shapeByName(s, "profile-bio-18-3"),
    "2020–2021｜TimmyCall〈遲到王〉、〈Killer Paper〉MV\n2024｜臺北市客家義民嘉年華影片\n本案負責｜攝影協力・燈光"
  );
}

// Delete inherited remnants that sit entirely outside the A4 canvas.
for (const s of deck.slides.items) {
  for (const item of [...s.shapes.items]) {
    const p = item.position.toJSON();
    if (p.left >= 794 || p.top >= 1122.17 || p.left + p.width <= 0 || p.top + p.height <= 0) item.delete();
  }
  for (const item of [...s.images.items]) {
    const p = item.position.toJSON();
    if (p.left >= 794 || p.top >= 1122.17 || p.left + p.width <= 0 || p.top + p.height <= 0) item.delete();
  }
}

await fs.mkdir(RENDER_DIR, { recursive: true });
await fs.mkdir(LAYOUT_DIR, { recursive: true });
for (let i = 0; i < deck.slides.items.length; i += 1) {
  const s = deck.slides.getItem(i);
  const n = String(i + 1).padStart(2, "0");
  const png = await deck.export({ slide: s, format: "png", scale: 1 });
  await fs.writeFile(path.join(RENDER_DIR, `slide-${n}.png`), new Uint8Array(await png.arrayBuffer()));
  const layout = await s.export({ format: "layout" });
  await fs.writeFile(path.join(LAYOUT_DIR, `slide-${n}.layout.json`), await layout.text());
}

const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(ROOT, "final-montage.webp"), new Uint8Array(await montage.arrayBuffer()));

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(OUTPUT);
console.log(OUTPUT);
