import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const STARTER = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/first-two-slides-revision/template-starter.pptx";
const OUTPUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/output/看見共好_影片腳本_A4直式_敘事校正版.pptx";
const QA_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/first-two-slides-revision/final-render";
const LAYOUT_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/first-two-slides-revision/final-layout/final";

function mustFind(items, name, kind) {
  const item = items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Missing ${kind}: ${name}`);
  return item;
}

function shape(slide, name) {
  return mustFind(slide.shapes.items, name, "shape");
}

function image(slide, name) {
  return mustFind(slide.images.items, name, "image");
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(STARTER));

// 第 1 頁：以第 3–15 頁實際分鏡重新說明敘事主軸。
const s1 = presentation.slides.getItem(0);
shape(s1, "Text 2").text = "腳本核心概念：看見生活，讓民意走向共好";

shape(s1, "Text 5").text.set([[
  {
    run: "核心推進｜",
    textStyle: { fontSize: "18.67px", typeface: "Microsoft JhengHei", color: "#8A701B", bold: true },
  },
  {
    run: "影片從城市日常與議會沿革建立『看見』，再讓13個選區、68席民意走進議事殿堂；中段跟著一個問題，呈現民意如何被查證、審查與追蹤，最後由第5屆承諾收束成『共好』。",
    textStyle: { fontSize: "18.67px", typeface: "Microsoft JhengHei", color: "#22293A" },
  },
]]);

shape(s1, "Text 6").text = "分鏡腳本的四段敘事推進";

shape(s1, "Text 9").text = "城市與託付";
shape(s1, "Text 10").text = "00:00–02:35｜看見城市、傳承與就職";
shape(s1, "Text 11").text = "以眼睛與光開場，從山海、日常與議會沿革，走到第 5 屆宣誓與每一席託付。";

shape(s1, "Text 14").text = "生活全景";
shape(s1, "Text 15").text = "02:35–04:55｜13 個選區、68 席民意";
shape(s1, "Text 16").text = "分三組呈現第 1 至第 13 選區，讓海岸、都會、山城與原住民族生活都被看見。";

shape(s1, "Text 19").text = "民意行動";
shape(s1, "Text 20").text = "04:55–09:10｜問題走進制度";
shape(s1, "Text 21").text = "由積水、上學路與候車日常切入，完整走過受理、查證、現勘、質詢、審查、議決與追蹤。";

shape(s1, "Text 23").text.set([[
  {
    run: "承諾與回收｜09:10–11:10\n",
    textStyle: { fontSize: "18.67px", typeface: "Microsoft JhengHei", color: "#8A701B", bold: true },
  },
  {
    run: "議長期許承接前段制度與民意，片尾回到清晨人物與正式片名：『看見』是願意靠近每一種生活；『共好』是把不同聲音帶向共同未來。片頭與片尾互相呼應，敘事完成。",
    textStyle: { fontSize: "18.67px", typeface: "Microsoft JhengHei", color: "#22293A" },
  },
]]);

// 第 2 頁：以第 3–15 頁的時間帶與段落逐一對照。
const s2 = presentation.slides.getItem(1);
shape(s2, "Text 2").text = "影片腳本大綱（總長度：11 分 10 秒）";
const table = mustFind(s2.tables.items, "Table 0", "table");
const rows = [
  ["片頭", "看見城市", "眼睛與光、城市群像、片名建立", "1:00", "1:00"],
  ["沿革", "看見傳承", "地方自治沿革與議場光線承接", "0:50", "1:50"],
  ["就職", "每一席的託付", "第 5 屆宣誓、議長選舉、大合照", "0:45", "2:35"],
  ["選區 A", "第 1–4 選區", "海岸、成長、新舊交會、河岸生活", "0:45", "3:20"],
  ["選區 B", "第 5–8 選區", "核心、密度、公共空間、文化產業", "0:45", "4:05"],
  ["選區 C", "第 9–13 選區", "山海、城鄉、族群與文化傳承", "0:50", "4:55"],
  ["轉折", "看見問題", "由三個日常問題帶入議會核心", "0:20", "5:15"],
  ["民意 A", "受理到提案", "受理、查證、現勘、定義問題", "0:50", "6:05"],
  ["民意 B", "議決與追蹤", "質詢、審查、議決、追蹤、回現場", "0:50", "6:55"],
  ["職權", "公開討論", "以真實議事動作說明五項職權", "1:20", "8:15"],
  ["幕後", "民主被保存", "行政協作、典藏、會史館與多語測試", "0:55", "9:10"],
  ["承諾", "第 5 屆期許", "議長原音與全體群像，承接託付", "1:05", "10:15"],
  ["片尾", "看見未來", "清晨回收、光點匯聚、正式片名", "0:55", "11:10"],
  ["總計", "完整片長", "第 3 至第 15 頁分鏡時間帶加總", "11:10", "11:10"],
];

for (let row = 0; row < rows.length; row += 1) {
  for (let column = 0; column < rows[row].length; column += 1) {
    table.getCell(row + 1, column).value = rows[row][column];
  }
}

// 第 3 頁：校正選區數與時間，並排除原圖片遮住 SHOT 04 文字的問題。
const s3 = presentation.slides.getItem(2);
shape(s3, "audio-6").text.replace("12 選區", "13 選區");
shape(s3, "footer-label-6").text = "看見.共好｜第一章｜看見城市｜00:00–01:00";
const s3Visual = shape(s3, "visual-6");
s3Visual.position = { ...s3Visual.position, height: 450 };
const cityImage = image(s3, "Image 0");
cityImage.position = { ...cityImage.position, top: 820 };

// 其餘分鏡僅校正舊數字與頁尾時間，不改寫主要敘事。
const s4 = presentation.slides.getItem(3);
shape(s4, "narration-7").text.replace("66 位議員", "68 席民意");
shape(s4, "narration-7").text.replace("68 席民意", "68席民意");
shape(s4, "narration-7").text.replace("， 七十", "，七十");
shape(s4, "footer-label-7").text = "看見.共好｜第一章｜看見城市｜01:00–01:50";

const s5 = presentation.slides.getItem(4);
shape(s5, "footer-label-8").text = "看見.共好｜第一章｜看見城市｜01:50–02:35";

const s14 = presentation.slides.getItem(13);
shape(s14, "footer-label-18").text = "看見.共好｜第五章｜走向共好｜09:10–10:15";

const s15 = presentation.slides.getItem(14);
shape(s15, "footer-label-19").text = "看見.共好｜片尾｜回到片名｜10:15–11:10";

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
  include: "id,slide,name,title,text,textPreview,bbox,bboxUnit,rows,cols,isPlaceholder,placeholders",
  maxChars: 50000,
});
await fs.writeFile("/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/first-two-slides-revision/final-inspect.ndjson", inspect.ndjson);

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(OUTPUT);
console.log(OUTPUT);
