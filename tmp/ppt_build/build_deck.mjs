import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const BUILD_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/ppt_build";
const RENDER_DIR = path.join(BUILD_DIR, "rendered");
const LAYOUT_DIR = path.join(BUILD_DIR, "layouts");
const FINAL_PPTX = "/Users/zhangzixuan/Desktop/hakka-food-linebot/output/115年新北市國慶_前導影片腳本_安心元素優化提案.pptx";
const SOURCE_PAGE_1 = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/pdfs/source_render/page-1.png";

const FONT = "PingFang TC";
const BLACK = "#101114";
const MUTED = "#5D6572";
const LIGHT = "#F1F2F4";
const RULE = "#B8BCC4";
const BLUE = "#2F80ED";
const PALE_BLUE = "#EAF4FF";
const WHITE = "#FFFFFF";

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function readBytes(filePath) {
  const bytes = await fs.readFile(filePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function addShape(slide, position, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry || "rect",
    name: options.name,
    position,
    fill: options.fill ?? "none",
    line: options.line || { style: "solid", fill: "none", width: 0 },
    borderRadius: options.borderRadius,
    shadow: options.shadow,
  });
}

function addText(slide, text, position, options = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    name: options.name,
    position,
    fill: options.fill ?? "none",
    line: options.line || { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize: options.fontSize || 20,
    typeface: options.typeface || FONT,
    color: options.color || BLACK,
    bold: options.bold || false,
    alignment: options.alignment || "left",
    verticalAlignment: options.verticalAlignment || "top",
    autoFit: options.autoFit || "shrinkText",
  };
  return box;
}

function addFooter(slide, n) {
  addText(slide, "115年新北市國慶｜前導影片腳本優化", { left: 54, top: 676, width: 420, height: 18 }, {
    fontSize: 12,
    color: MUTED,
    name: `footer-label-${n}`,
  });
  addText(slide, String(n).padStart(2, "0"), { left: 1190, top: 674, width: 36, height: 20 }, {
    fontSize: 12,
    color: MUTED,
    alignment: "right",
    name: `footer-page-${n}`,
  });
}

function addTitle(slide, title, n, options = {}) {
  addText(slide, title, { left: 54, top: 42, width: options.width || 1172, height: 72 }, {
    fontSize: options.fontSize || 40,
    bold: true,
    color: BLACK,
    name: `slide-${n}-title`,
  });
  addShape(slide, { left: 54, top: 124, width: 1172, height: 2 }, {
    fill: options.ruleColor || RULE,
    name: `slide-${n}-title-rule`,
  });
  addFooter(slide, n);
}

function addNotes(slide, extra = []) {
  const lines = [
    "[Sources]",
    "- 使用者提供：115年新北市國慶_兩款前導影片腳本提案_細緻版.pdf（附件原腳本）",
    "- 使用者提供：客戶回饋文字（本次需求）",
    ...extra,
  ];
  slide.speakerNotes.textFrame.setText(lines);
}

function addPill(slide, text, position, options = {}) {
  addShape(slide, position, {
    geometry: "roundRect",
    fill: options.fill || PALE_BLUE,
    line: options.line || { style: "solid", fill: "none", width: 0 },
    name: options.name,
  });
  addText(slide, text, {
    left: position.left + 14,
    top: position.top + 7,
    width: position.width - 28,
    height: position.height - 12,
  }, {
    fontSize: options.fontSize || 16,
    bold: options.bold ?? true,
    color: options.color || BLUE,
    alignment: options.alignment || "center",
    verticalAlignment: "middle",
    name: options.textName,
  });
}

function addTimeline(slide, items, options = {}) {
  const left = 54;
  const colW = 350;
  const gap = 61;
  const lineY = options.lineY || 334;
  addShape(slide, { left, top: lineY, width: 1172, height: 2 }, {
    fill: RULE,
    name: options.lineName || "timeline-rule",
  });
  items.forEach((item, index) => {
    const x = left + index * (colW + gap);
    addText(slide, item.label, { left: x, top: lineY - 52, width: 210, height: 28 }, {
      fontSize: 17,
      color: item.accent ? BLUE : MUTED,
      bold: true,
      name: `${options.prefix || "timeline"}-label-${index + 1}`,
    });
    addShape(slide, { left: x, top: lineY - 6, width: 14, height: 14 }, {
      geometry: "ellipse",
      fill: item.accent ? BLUE : BLACK,
      name: `${options.prefix || "timeline"}-dot-${index + 1}`,
    });
    addText(slide, item.title, { left: x, top: lineY + 40, width: colW, height: 54 }, {
      fontSize: 23,
      bold: true,
      color: BLACK,
      name: `${options.prefix || "timeline"}-title-${index + 1}`,
    });
    addText(slide, item.body, { left: x, top: lineY + 100, width: colW, height: options.bodyHeight || 174 }, {
      fontSize: options.bodyFontSize || 18,
      color: MUTED,
      name: `${options.prefix || "timeline"}-body-${index + 1}`,
    });
  });
}

function addComparisonPanel(slide, side, heading, kicker, body, details, options = {}) {
  const x = side === "left" ? 54 : 665;
  const w = 561;
  addShape(slide, { left: x, top: 326, width: w, height: 150 }, {
    geometry: "roundRect",
    fill: options.fill || LIGHT,
    name: `${options.prefix || "compare"}-${side}-panel`,
  });
  addText(slide, kicker, { left: x + 28, top: 346, width: w - 56, height: 25 }, {
    fontSize: 15,
    color: options.accent ? BLUE : MUTED,
    bold: true,
    name: `${options.prefix || "compare"}-${side}-kicker`,
  });
  addText(slide, heading, { left: x + 28, top: 382, width: w - 56, height: 70 }, {
    fontSize: 27,
    color: BLACK,
    bold: true,
    name: `${options.prefix || "compare"}-${side}-heading`,
  });
  addText(slide, body, { left: x + 28, top: 500, width: w - 56, height: 55 }, {
    fontSize: 18,
    color: BLACK,
    bold: true,
    name: `${options.prefix || "compare"}-${side}-body`,
  });
  addText(slide, details, { left: x + 28, top: 562, width: w - 56, height: 74 }, {
    fontSize: 16.5,
    color: MUTED,
    name: `${options.prefix || "compare"}-${side}-details`,
  });
}

async function main() {
  await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
  await fs.mkdir(RENDER_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

  // 01 - Cover, Codex Grid slide-01 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addText(slide, "115年新北市國慶升旗典禮｜前導影片腳本優化提案", { left: 54, top: 48, width: 720, height: 34 }, {
      fontSize: 18,
      color: BLUE,
      bold: true,
      name: "cover-supertitle",
    });
    addText(slide, "向前傳遞，\n安心同行", { left: 54, top: 174, width: 900, height: 220 }, {
      fontSize: 68,
      bold: true,
      color: BLACK,
      name: "cover-title",
    });
    addText(slide, "在原有接力敘事上，加入第二行政中心作為\n「城市安全智慧中心」的安心落點", { left: 54, top: 500, width: 790, height: 92 }, {
      fontSize: 25,
      color: MUTED,
      name: "cover-subtitle",
    });
    addShape(slide, { left: 1045, top: 0, width: 235, height: 720 }, {
      fill: PALE_BLUE,
      name: "cover-accent-field",
    });
    addShape(slide, { left: 1045, top: 0, width: 12, height: 720 }, {
      fill: BLUE,
      name: "cover-accent-rule",
    });
    addText(slide, "SCRIPT\nREVISION", { left: 1082, top: 535, width: 155, height: 86 }, {
      fontSize: 18,
      bold: true,
      color: BLUE,
      alignment: "right",
      name: "cover-tag",
    });
    addNotes(slide);
  }

  // 02 - Client request translated, Codex Grid slide-08 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "這次修改，不是多加一段介紹，而是補上「守護」的意義", 2, { width: 1172, fontSize: 38 });
    addText(slide, "客戶希望觀眾理解", { left: 54, top: 176, width: 420, height: 30 }, {
      fontSize: 19,
      color: BLUE,
      bold: true,
      name: "brief-kicker",
    });
    addText(slide, "第二行政中心\n不只是政府辦公大樓", { left: 54, top: 220, width: 520, height: 104 }, {
      fontSize: 32,
      bold: true,
      color: BLACK,
      name: "brief-main",
    });
    addText(slide, "它也是守護市民生活、整合治安、防災、交通、食安與資訊系統的城市安全智慧中心。", { left: 54, top: 356, width: 520, height: 116 }, {
      fontSize: 22,
      color: MUTED,
      name: "brief-body",
    });
    addPill(slide, "原接力故事保留｜新增「安心」敘事層", { left: 54, top: 520, width: 452, height: 50 }, {
      name: "brief-pill",
      textName: "brief-pill-text",
    });
    const pageBytes = await readBytes(SOURCE_PAGE_1);
    slide.images.add({
      blob: pageBytes,
      contentType: "image/png",
      alt: "原腳本提案第一頁：《新北國慶・向前傳遞！》概念總覽",
      fit: "contain",
      geometry: "roundRect",
      borderRadius: "rounded-xl",
      position: { left: 650, top: 156, width: 576, height: 432 },
      name: "source-pdf-page-1",
    });
    addText(slide, "原腳本核心：接力棒傳遞城市精神、建設與下一代", { left: 650, top: 606, width: 576, height: 30 }, {
      fontSize: 14,
      color: MUTED,
      name: "source-caption",
    });
    addNotes(slide, ["- 視覺資產：附件 PDF 第 1 頁渲染圖"]);
  }

  // 03 - Comparison, Codex Grid slide-11 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "原有的速度感保留，新增一條貫穿全片的「安心接力」", 3);
    addText(slide, "不另開支線介紹大樓；把安全治理藏進既有的跑動、交棒與抵達，最後才完整揭示第二行政中心。", { left: 54, top: 158, width: 1172, height: 70 }, {
      fontSize: 21,
      color: MUTED,
      name: "core-intro",
    });
    addComparisonPanel(slide, "left", "接力棒＝城市精神與國慶祝福", "原核心｜向前傳遞", "城市建設 → 青年 → 活動 → 下一代", "強項是節奏明確、角色互動自然；但第二行政中心目前只作為活動場地出現。", {
      prefix: "core",
    });
    addComparisonPanel(slide, "right", "接力棒＝城市持續在線的守護", "修訂核心｜安心同行", "城市建設 → 系統連線 → 安心 → 下一代", "讓每一次交棒都多一層意義：城市向前的同時，守護也沒有中斷。", {
      prefix: "core",
      accent: true,
      fill: PALE_BLUE,
    });
    addNotes(slide);
  }

  // 04 - Narrative grammar, Codex Grid slide-17 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "安心元素用三步出現：先感覺、再理解、最後記住", 4);
    addTimeline(slide, [
      {
        label: "01｜沿途提示",
        title: "安心正在運作",
        body: "接力棒出現微弱藍白光點；三鶯線、淡江大橋的交通畫面搭配極輕量資訊連線效果。",
      },
      {
        label: "02｜活動快剪",
        title: "守護來自系統整合",
        body: "只在這一段完整說明一次：治安、防災、交通、食安與資訊系統同步守護。",
        accent: true,
      },
      {
        label: "03｜抵達場地",
        title: "第二行政中心是安心落點",
        body: "所有光線與資訊匯聚建築；用一句定位字卡完成城市安全智慧中心的揭示。",
      },
    ], { prefix: "grammar", lineY: 324, bodyHeight: 184, bodyFontSize: 18 });
    addNotes(slide);
  }

  // 05 - Three insertion points.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "推薦只改三個關鍵節點，避免 90 秒影片變成設施介紹", 5);
    addTimeline(slide, [
      {
        label: "0:15-0:23",
        title: "第一次提示｜交通安心",
        body: "三鶯線字卡保留重大建設資訊，再補上「交通資訊即時整合」，讓安心先被觀眾感覺到。",
      },
      {
        label: "0:43-0:59",
        title: "一次說清｜五大系統",
        body: "活動快剪加入值勤、監控與稽核畫面；完整列出治安、防災、交通、食安與資訊系統。",
        accent: true,
      },
      {
        label: "1:04-1:27",
        title: "最後揭示｜安心落點",
        body: "孩子跑入第二行政中心前廣場，建築與系統連線同框；收在「新北向前，安心一直都在」。",
      },
    ], { prefix: "insert", lineY: 324, bodyHeight: 184, bodyFontSize: 18 });
    addNotes(slide);
  }

  // 06 - Detailed storyboard part 1.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "分鏡修訂①｜第一棒起跑：先埋下「安心訊號」", 6, { fontSize: 36 });
    addText(slide, "前段儀式感與 Match Cut 全數保留，安心元素只以聲音與光點進場。", { left: 54, top: 154, width: 1000, height: 44 }, {
      fontSize: 19,
      color: MUTED,
      name: "story-1-intro",
    });
    addTimeline(slide, [
      {
        label: "0:00-0:15｜保留",
        title: "眼神、國旗、第一棒",
        body: "畫面：維持眼部特寫、儀隊進場、國旗遮鏡轉龍埔站。\n新增：接力棒尾端亮起一次微弱藍白光點。\n聲音：低頻呼吸中加入一次短促電子提示音。",
      },
      {
        label: "0:15-0:23｜修改",
        title: "三鶯線＝交通安心",
        body: "畫面：空拍與跑動間，疊入極淡交通資訊線。\n字卡：2026 三鶯線，串連三峽、鶯歌與雙北生活圈；交通資訊即時整合，把便利與安心帶進每一天。",
        accent: true,
      },
      {
        label: "0:24-0:29｜保留",
        title: "儀隊節奏插入",
        body: "畫面：踏步、轉槍、隊形變化不變。\n新增：在動作落點讓同一個藍白光點閃現一次，延續母題。\n原則：此處不加新字卡，讓節奏呼吸。",
      },
    ], { prefix: "story1", lineY: 302, bodyHeight: 226, bodyFontSize: 17 });
    addNotes(slide);
  }

  // 07 - Detailed storyboard part 2.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "分鏡修訂②｜交棒淡江：把熱鬧背後的守護說清楚", 7, { fontSize: 36 });
    addText(slide, "中段是唯一完整列出五大系統的段落；前後都回到人物與動作。", { left: 54, top: 154, width: 1000, height: 44 }, {
      fontSize: 19,
      color: MUTED,
      name: "story-2-intro",
    });
    addTimeline(slide, [
      {
        label: "0:29-0:43｜微調",
        title: "淡江大橋＝連線守護",
        body: "畫面：交棒後，安心光點沿橋塔與車流前進。\n字卡：2026 淡江大橋，串聯淡水、八里；橋梁、交通與防災資訊同步連線，守護每一次出發與抵達。",
      },
      {
        label: "0:43-0:59｜重點修改",
        title: "活動快剪＝五大系統",
        body: "畫面：在表演、市集、AR 之間插入 3-4 個值勤／監控／稽核快切。\n字卡：活動的熱鬧背後，治安、防災、交通、食安與資訊系統同步守護。",
        accent: true,
      },
      {
        label: "0:59-1:03｜保留",
        title: "第三棒交給孩子",
        body: "畫面：女生蹲低交棒，孩子立刻往前跑。\n新增：接棒瞬間，光點由冷藍轉為較溫暖、穩定的光。\n原則：不再重複五大系統，讓情緒回到人物。",
      },
    ], { prefix: "story2", lineY: 302, bodyHeight: 226, bodyFontSize: 17 });
    addNotes(slide);
  }

  // 08 - Detailed storyboard part 3.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "分鏡修訂③｜抵達現場：揭示安心落點", 8, { fontSize: 36 });
    addText(slide, "收尾仍然熱血溫暖，但必須讓建築、系統與下一代在同一個情緒上落地。", { left: 54, top: 154, width: 1080, height: 44 }, {
      fontSize: 19,
      color: MUTED,
      name: "story-3-intro",
    });
    addTimeline(slide, [
      {
        label: "1:04-1:11｜核心修改",
        title: "建築＝城市安全智慧中心",
        body: "畫面：孩子跑進前廣場，廣角完整帶出第二行政中心；五道細線匯聚建築。\n字卡：不只是辦公大樓，更是整合治安、防災、交通、食安與資訊系統的城市安全智慧中心。",
        accent: true,
      },
      {
        label: "1:11-1:17｜微調",
        title: "儀隊高潮＋守護快切",
        body: "畫面：儀隊最後一段演出中，穿插 2-3 個指揮／監控畫面，單格或雙格即可。\n聲音：安心提示音與音樂最高點合拍。\n原則：不追加說明台詞。",
      },
      {
        label: "1:17-1:27｜修改收束",
        title: "把安心交給下一代",
        body: "畫面：全員面向場地，構圖保留第二行政中心。\n情緒字卡：把每一份安心，交給下一代。\nCTA：115年新北市國慶升旗典禮｜10/10；新北向前，安心一直都在。",
      },
    ], { prefix: "story3", lineY: 302, bodyHeight: 226, bodyFontSize: 17 });
    addNotes(slide);
  }

  // 09 - Ready-to-use copy, Codex Grid slide-11 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "建議字卡可直接採用：前段輕、中央說清、最後留下記憶", 9, { fontSize: 38 });
    addText(slide, "字卡避免每段都列系統名稱；資訊層級由「路線」逐步走向「城市安全智慧中心」。", { left: 54, top: 154, width: 1172, height: 50 }, {
      fontSize: 20,
      color: MUTED,
      name: "copy-intro",
    });
    addComparisonPanel(slide, "left", "路線與活動段｜鋪陳安心", "0:15-0:59", "① 交通資訊即時整合，把便利與安心帶進每一天。", "② 橋梁、交通與防災資訊同步連線，守護每一次出發與抵達。\n③ 活動的熱鬧背後，五大系統同步守護。", {
      prefix: "copy",
    });
    addComparisonPanel(slide, "right", "抵達與收尾｜完整定位", "1:04-1:27", "① 不只是辦公大樓，更是城市安全智慧中心。", "② 把每一份安心，交給下一代。\n③ 新北向前，安心一直都在。", {
      prefix: "copy",
      accent: true,
      fill: PALE_BLUE,
    });
    addNotes(slide);
  }

  // 10 - Production guidance.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addTitle(slide, "拍攝與後期只要抓住三個原則，安全元素就不會顯得生硬", 10, { fontSize: 38 });
    addText(slide, "拍攝素材", { left: 54, top: 174, width: 520, height: 36 }, {
      fontSize: 23,
      bold: true,
      color: BLUE,
      name: "production-left-head",
    });
    addText(slide, "• 第二行政中心完整建築與前廣場廣角\n• 真實值勤／監控／指揮畫面\n• 治安、防災、交通、食安中選 3-4 個代表快切\n• 每個系統畫面控制在 0.5-1 秒，保留社群節奏", { left: 54, top: 232, width: 520, height: 204 }, {
      fontSize: 19,
      color: BLACK,
      name: "production-left-body",
    });
    addShape(slide, { left: 636, top: 162, width: 2, height: 442 }, { fill: RULE, name: "production-divider" });
    addText(slide, "後期語言", { left: 690, top: 174, width: 520, height: 36 }, {
      fontSize: 23,
      bold: true,
      color: BLUE,
      name: "production-right-head",
    });
    addText(slide, "• 全片只用一種藍白「安心訊號」\n• 線條在沿途只輕描，結尾才匯聚建築\n• 五大系統只完整出現一次\n• 避免滿畫面 HUD、漂浮圖示與長時間辦公室導覽", { left: 690, top: 232, width: 520, height: 204 }, {
      fontSize: 19,
      color: BLACK,
      name: "production-right-body",
    });
    addShape(slide, { left: 54, top: 494, width: 1156, height: 104 }, {
      geometry: "roundRect",
      fill: PALE_BLUE,
      name: "production-bottom-callout",
    });
    addText(slide, "判斷標準｜觀眾先覺得「這座城市有人在守護」，最後才知道這份守護匯聚在第二行政中心。", { left: 82, top: 527, width: 1100, height: 48 }, {
      fontSize: 21,
      bold: true,
      color: BLACK,
      alignment: "center",
      name: "production-bottom-text",
    });
    addNotes(slide);
  }

  // 11 - Closing, Codex Grid slide-01 hierarchy.
  {
    const slide = presentation.slides.add();
    slide.background.fill = WHITE;
    addText(slide, "最終建議", { left: 54, top: 56, width: 300, height: 34 }, {
      fontSize: 18,
      color: BLUE,
      bold: true,
      name: "closing-kicker",
    });
    addText(slide, "讓第二行政中心，\n成為這支影片的「安心落點」", { left: 54, top: 182, width: 1080, height: 196 }, {
      fontSize: 58,
      bold: true,
      color: BLACK,
      name: "closing-title",
    });
    addText(slide, "保留向前的速度，也讓市民感受到：\n熱鬧與建設的背後，一直有人把城市照顧好。", { left: 54, top: 482, width: 790, height: 102 }, {
      fontSize: 25,
      color: MUTED,
      name: "closing-subtitle",
    });
    addShape(slide, { left: 54, top: 632, width: 610, height: 4 }, { fill: BLUE, name: "closing-rule" });
    addText(slide, "新北向前，安心一直都在。", { left: 854, top: 612, width: 372, height: 38 }, {
      fontSize: 20,
      bold: true,
      color: BLUE,
      alignment: "right",
      name: "closing-signoff",
    });
    addNotes(slide);
  }

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1.5 });
    await writeBlob(path.join(RENDER_DIR, `${stem}.png`), png);
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await layout.text());
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(path.join(BUILD_DIR, "deck-montage.webp"), montage);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  console.log(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
