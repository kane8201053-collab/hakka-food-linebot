import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/zhangzixuan/Desktop/hakka-food-linebot";
const TMP = `${ROOT}/tmp/storyboard-images-0903`;
const STARTER = `${TMP}/template-starter.pptx`;
const OUTPUT = `${ROOT}/output/看見共好_影片腳本0903_分鏡示意圖版.pptx`;
const QA_DIR = `${TMP}/final-render`;
const LAYOUT_DIR = `${TMP}/final-layout/final`;

const storyboard = {
  3: { color: "#0E7C79", labels: ["01｜晨光穿雲・河岸山稜", "02｜四百萬雙眼睛", "03｜光點匯聚片名", "04｜山海到城市"] },
  4: { color: "#0E7C79", labels: ["05｜舊照與議事物件", "06｜歷屆議會沿革", "07｜改制・新北市議會", "08｜現代議場亮燈"] },
  5: { color: "#0E7C79", labels: ["09｜就職・宣誓・簽名", "10｜議長選舉與合照", "11｜選票化為節點", "TITLE｜看見．共好"] },
  6: { color: "#D78A16", labels: ["第1選區｜海岸・漁港・輕軌", "第2選區｜新市鎮・產業・交通", "第3選區｜老街・工業・副都心", "第4選區｜河岸・市場・通勤"] },
  7: { color: "#D78A16", labels: ["第5選區｜議會・市府・車站", "第6選區｜住宅・產業・通勤", "第7選區｜巷弄・公園・橋梁", "第8選區｜陶瓷・老街・山景"] },
  8: { color: "#D78A16", labels: ["第9選區｜溪谷・茶鄉・部落", "第10選區｜山城・鐵道・海岸", "第11選區｜漁港・溫泉・科技", "第12選區｜平地原民生活", "第13選區｜部落・語言・土地"] },
  9: { color: "#3E6F8E", labels: ["13｜三個日常問題", "14｜手機陳情資料", "15｜受理與服務處筆記"] },
  10: { color: "#3E6F8E", labels: ["STEP 1｜市民陳情", "STEP 2｜資料整理", "STEP 3｜共同會勘", "STEP 4｜定義問題", "STEP 5｜形成提案／質詢"] },
  11: { color: "#3E6F8E", labels: ["STEP 6｜口頭／書面質詢", "STEP 7｜委員會審查", "STEP 8｜大會議決", "STEP 9｜後續追蹤", "STEP 10｜回到現場"] },
  12: { color: "#244F66", labels: ["16｜大會全景", "17｜程序與委員會", "18｜市政／業務質詢", "19｜預決算與條例", "20｜影音・表決・紀錄"] },
  13: { color: "#244F66", labels: ["21｜會前準備", "22｜跨處室協作", "23｜紀錄與典藏", "24｜展示與多語測試", "25｜參訪與導覽"] },
  14: { color: "#C85B4B", labels: ["1｜議長自然訪談", "2｜致詞交叉畫面", "3｜第5屆正式群像", "4｜群像轉城市晨夜"] },
  15: { color: "#C85B4B", labels: ["5｜清晨人物回收", "6｜議場燈光亮起", "7｜節點匯成新北意象", "END｜LOGO＋正式片名"] },
};

const visualNames = {
  3: "visual-6", 4: "visual-7", 5: "visual-8", 6: "visual-9", 7: "visual-10",
  8: "visual-11", 9: "visual-12", 10: "visual-13", 11: "visual-14",
  12: "visual-15", 13: "visual-16", 14: "visual-18", 15: "visual-19",
};

function mustFind(items, name, kind) {
  const item = items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Missing ${kind}: ${name}`);
  return item;
}

function shape(slide, name) {
  return mustFind(slide.shapes.items, name, "shape");
}

async function readBytes(file) {
  const bytes = await fs.readFile(file);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

const crops = JSON.parse(await fs.readFile(`${TMP}/panel-crops.json`, "utf8"));
const presentation = await PresentationFile.importPptx(await FileBlob.load(STARTER));

const frame = { left: 60.25, top: 259.81, width: 200.85, height: 781.42 };
for (const [slideNumberText, config] of Object.entries(storyboard)) {
  const slideNumber = Number(slideNumberText);
  const slide = presentation.slides.getItem(slideNumber - 1);
  const visual = shape(slide, visualNames[slideNumber]);
  const layout = JSON.parse(await fs.readFile(`${TMP}/template-inspect/layouts/source-slide-${String(slideNumber).padStart(2, "0")}.layout.json`, "utf8"));
  const originalText = layout.elements.find((element) => element.name === visualNames[slideNumber])?.text || "";
  visual.text = "";

  if (slideNumber === 3 && slide.images.items.length > 0) {
    slide.images.items[0].delete();
  }

  const panelData = crops[String(slideNumber)].panels;
  if (panelData.length !== config.labels.length) {
    throw new Error(`Panel count mismatch on slide ${slideNumber}`);
  }

  const gap = 7;
  const cellHeight = (frame.height - gap * (config.labels.length - 1)) / config.labels.length;
  const captionHeight = config.labels.length === 3 ? 31 : 27;
  for (let index = 0; index < config.labels.length; index += 1) {
    const top = frame.top + index * (cellHeight + gap);
    const panelPath = `${TMP}/assets/panels/slide-${String(slideNumber).padStart(2, "0")}-panel-${String(index + 1).padStart(2, "0")}.png`;
    const panelBytes = await readBytes(panelPath);
    const image = slide.images.add({
      blob: panelBytes,
      contentType: "image/png",
      alt: `AI 示意分鏡：${config.labels[index]}`,
      prompt: "Photorealistic Taiwanese civic documentary storyboard; AI-generated illustration, not documentary evidence.",
      fit: "cover",
      geometry: "roundRect",
      borderRadius: 5,
      position: { left: frame.left, top, width: frame.width, height: cellHeight },
    });
    image.name = `storyboard-${slideNumber}-${index + 1}`;

    const caption = slide.shapes.add({
      geometry: "rect",
      name: `storyboard-caption-${slideNumber}-${index + 1}`,
      position: { left: frame.left, top: top + cellHeight - captionHeight, width: frame.width, height: captionHeight },
      fill: config.color,
      line: { style: "solid", fill: config.color, width: 0 },
    });
    caption.text = config.labels[index];
    caption.text.style = {
      fontSize: config.labels.length === 5 ? 11.2 : 12.2,
      typeface: "PingFang TC",
      color: "#FFFFFF",
      bold: true,
      alignment: "left",
      verticalAlignment: "middle",
    };
  }

  slide.speakerNotes.append(`\n\n[完整畫面設計]\n${originalText}\n\n[Sources]\n- OpenAI image generation; AI-generated illustrative storyboard imagery for this page. Conceptual only; not documentary evidence or an official record.`);
}

const summary = presentation.slides.getItem(15);
const summaryText = {
  "Text 0": "HIGHLIGHTS",
  "Text 1": "看見.共好 － 第5屆新北市議會｜腳本亮點",
  "Text 2": "整體腳本亮點與核心",
  "Text 5": "核心一句話｜以「看見」作為敘事方法，從城市生活出發，讓民意走過查證、審議與追蹤，最後把不同聲音帶向可被共同感受的「共好」。",
  "Text 6": "五個最重要的腳本亮點",
  "Text 9": "亮點一",
  "Text 10": "片名就是敘事方法",
  "Text 11": "看見→行動→共好",
  "Text 12": "全片主軸",
  "Text 13": "高辨識",
  "Text 16": "亮點二",
  "Text 17": "56 個鏡位都有生活感",
  "Text 18": "城市・選區・民意",
  "Text 19": "真實感",
  "Text 20": "有畫面",
  "Text 23": "亮點三",
  "Text 24": "一份陳情走完十步",
  "Text 25": "受理→追蹤→回到現場",
  "Text 26": "制度化",
  "Text 27": "可理解",
  "Text 30": "亮點四",
  "Text 31": "不只成果，也呈現追蹤",
  "Text 32": "誠實保留未完成狀態",
  "Text 33": "可信度",
  "Text 34": "不粉飾",
  "Text 37": "亮點五",
  "Text 38": "片頭片尾形成完整回環",
  "Text 39": "清晨・眼睛・光點回環",
  "Text 40": "完整性",
  "Text 41": "有餘韻",
  "Text 42": "整體核心：讓制度被看見，讓共好能被相信",
  "Text 45": "敘事核心",
  "Text 46": "以生活帶出制度",
  "Text 47": "先看見人與日常，再看見問題如何被議會接住；制度因此不是條文，而是能回應生活的行動路徑。",
  "Text 50": "視覺核心",
  "Text 51": "眼睛、光與同機位",
  "Text 52": "眼神建立連結，光點串起城市；同機位前後對照讓改變可被驗證，未完成也能誠實追蹤。",
  "Text 55": "價值核心",
  "Text 56": "多元被看見，承諾被追蹤",
  "Text 57": "十三個選舉區與不同生活被公平呈現；每一席民意都進入公開討論，讓共好落在具體進度。",
};
for (const [name, text] of Object.entries(summaryText)) shape(summary, name).text = text;

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
  maxChars: 160000,
});
await fs.writeFile(`${TMP}/final-inspect.ndjson`, inspect.ndjson);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUTPUT);
console.log(OUTPUT);
