import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/output/presentation/看見共好－第5屆新北市議會_影片腳本_16x9.pptx";
const QA_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/presentation/qa";

const C = {
  navy: "#0B1F3A",
  navy2: "#132E4F",
  teal: "#18AFA3",
  tealPale: "#DDF3EF",
  gold: "#E5A93D",
  goldPale: "#F8E9C7",
  coral: "#E96C57",
  coralPale: "#F8DDD7",
  blue: "#3979B8",
  bluePale: "#DCEAF7",
  ink: "#162536",
  muted: "#5C6B78",
  line: "#CFD8DF",
  paper: "#F6F2E9",
  white: "#FFFFFF",
  black: "#05080C",
};

const FONT = "PingFang TC";
const W = 1280;
const H = 720;

function addShape(slide, name, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect",
    name,
    position: { left: x, top: y, width: w, height: h, rotation: opts.rotation || 0 },
    fill,
    line: opts.line || { style: "solid", fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
    shadow: opts.shadow,
  });
}

function addText(slide, name, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill || "none",
    line: opts.line || { style: "solid", fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
  });
  shape.text = text;
  shape.text.style = {
    typeface: opts.typeface || FONT,
    fontSize: opts.fontSize || 22,
    bold: opts.bold || false,
    color: opts.color || C.ink,
    alignment: opts.align || "left",
    verticalAlignment: opts.valign || "top",
    lineSpacing: opts.lineSpacing || 1.15,
    autoFit: opts.autoFit || "none",
    wrap: "square",
    insets: opts.insets || { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function setNotes(slide, notes, sources = []) {
  const src = sources.length
    ? `\n\n[Sources]\n${sources.map((s) => `- ${s}`).join("\n")}\n[/Sources]`
    : "\n\n[Sources]\n- Original creative writing based on the user-provided brief; no external claim or asset on this slide.\n[/Sources]";
  slide.speakerNotes.textFrame.setText(`${notes}${src}`);
  slide.speakerNotes.setVisible(true);
}

function footer(slide, number, section = "影片腳本") {
  addText(slide, `footer-section-${number}`, section, 72, 680, 250, 22, {
    fontSize: 16, bold: true, color: C.muted,
  });
  addText(slide, `footer-page-${number}`, String(number).padStart(2, "0"), 1160, 680, 48, 22, {
    fontSize: 16, bold: true, color: C.muted, align: "right",
  });
}

function topTitle(slide, section, title, subtitle, accent, number) {
  slide.background.fill = C.paper;
  addShape(slide, `top-band-${number}`, 0, 0, W, 112, C.navy);
  addShape(slide, `top-accent-${number}`, 0, 0, 18, 112, accent);
  addText(slide, `top-section-${number}`, section, 70, 24, 260, 24, {
    fontSize: 18, bold: true, color: accent,
  });
  addText(slide, `top-title-${number}`, title, 70, 50, 950, 50, {
    fontSize: 42, bold: true, color: C.white, valign: "middle",
  });
  addText(slide, `top-subtitle-${number}`, subtitle, 1015, 31, 190, 52, {
    fontSize: 18, color: "#CAD6E2", align: "right", valign: "middle",
  });
}

function label(slide, name, text, x, y, w, color) {
  addText(slide, name, text, x, y, w, 28, {
    fontSize: 20, bold: true, color,
  });
}

function scriptSlide(p, cfg) {
  const slide = p.slides.add();
  topTitle(slide, cfg.chapter, cfg.title, cfg.time, cfg.accent, cfg.number);

  addShape(slide, `left-rail-${cfg.number}`, 50, 138, 378, 502, C.white, {
    line: { style: "solid", fill: C.line, width: 1 },
  });
  addShape(slide, `rail-accent-${cfg.number}`, 50, 138, 10, 502, cfg.accent);
  addText(slide, `scene-index-${cfg.number}`, cfg.scene, 80, 160, 300, 38, {
    fontSize: 32, bold: true, color: cfg.accent,
  });
  label(slide, `visual-label-${cfg.number}`, "畫面 / VISUAL", 80, 210, 260, C.navy);
  addText(slide, `visual-copy-${cfg.number}`, cfg.visual, 80, 248, 315, 220, {
    fontSize: 21.5, color: C.ink, lineSpacing: 1.16,
  });
  label(slide, `onscreen-label-${cfg.number}`, "字卡 / ON SCREEN", 80, 484, 260, C.navy);
  addText(slide, `onscreen-copy-${cfg.number}`, cfg.onscreen, 80, 520, 315, 92, {
    fontSize: 21.5, bold: true, color: cfg.accent, lineSpacing: 1.08,
  });

  label(slide, `vo-label-${cfg.number}`, "旁白 / VOICE OVER", 462, 152, 300, C.navy);
  addShape(slide, `vo-rule-${cfg.number}`, 462, 190, 728, 3, cfg.accent);
  addText(slide, `vo-copy-${cfg.number}`, cfg.vo, 462, 214, 728, 318, {
    fontSize: 25, color: C.ink, lineSpacing: 1.22,
  });

  addShape(slide, `sound-bar-${cfg.number}`, 462, 552, 728, 70, cfg.soundFill || C.tealPale);
  addText(slide, `sound-label-${cfg.number}`, "聲音", 486, 570, 70, 28, {
    fontSize: 20, bold: true, color: cfg.accent,
  });
  addText(slide, `sound-copy-${cfg.number}`, cfg.sound, 564, 566, 600, 40, {
    fontSize: 21, color: C.ink, valign: "middle",
  });
  footer(slide, cfg.number, cfg.chapter);
  setNotes(slide, cfg.note || "本頁為可執行分鏡；畫面使用本會提供、委託拍攝或已取得授權之真實素材。", cfg.sources || []);
  return slide;
}

function makePresentation() {
  const p = Presentation.create({ slideSize: { width: W, height: H } });

  // 01 Cover
  {
    const s = p.slides.add();
    s.background.fill = C.navy;
    addShape(s, "cover-teal-field", 820, 0, 460, 720, C.teal);
    addShape(s, "cover-gold-line", 72, 90, 200, 8, C.gold);
    addText(s, "cover-eyebrow", "第5屆新北市議會｜影片分鏡腳本", 72, 132, 560, 32, {
      fontSize: 22, bold: true, color: "#9DDDD6",
    });
    addText(s, "cover-title", "看見．共好", 72, 198, 720, 92, {
      fontSize: 76, bold: true, color: C.white, valign: "middle",
    });
    addText(s, "cover-subtitle", "SEEING TOGETHER, SHAPING TOMORROW", 76, 306, 700, 30, {
      fontSize: 20, bold: true, color: C.gold,
    });
    addText(s, "cover-intro", "從市民的日常出發，\n看見民意如何走進議會，\n讓多元聲音一起走向更好的新北。", 76, 390, 650, 150, {
      fontSize: 32, color: "#DDE6EF", lineSpacing: 1.18,
    });
    addText(s, "cover-big-character", "見", 868, 90, 330, 420, {
      fontSize: 260, bold: true, color: "#0B726E", align: "center", valign: "middle",
    });
    addText(s, "cover-duration", "16:9  |  11:35  |  中・英・日・台・韓五語架構", 76, 624, 700, 28, {
      fontSize: 20, bold: true, color: C.white,
    });
    addText(s, "cover-year", "2026", 1080, 632, 100, 28, {
      fontSize: 20, bold: true, color: C.white, align: "right",
    });
    setNotes(s, "封面。片名依委託需求使用「看見．共好－第5屆新北市議會」。", [
      "/Users/zhangzixuan/Desktop/4.需求書.pdf",
    ]);
  }

  // 02 Creative thesis
  {
    const s = p.slides.add();
    topTitle(s, "創意主軸", "「看見」不是觀看，而是讓民意進入行動", "CORE IDEA", C.teal, 2);
    addText(s, "thesis-number", "01", 70, 156, 120, 72, { fontSize: 54, bold: true, color: C.teal });
    addText(s, "thesis-a", "看見日常", 70, 232, 300, 44, { fontSize: 34, bold: true, color: C.navy });
    addText(s, "thesis-a-copy", "從通勤、就學、照顧、工作與環境切入，讓議會不再是遙遠的建築。", 70, 290, 300, 116, { fontSize: 23, color: C.muted, lineSpacing: 1.2 });
    addText(s, "thesis-number-b", "02", 465, 156, 120, 72, { fontSize: 54, bold: true, color: C.gold });
    addText(s, "thesis-b", "看見過程", 465, 232, 300, 44, { fontSize: 34, bold: true, color: C.navy });
    addText(s, "thesis-b-copy", "用一個問題如何被提出、審議、監督與追蹤，說清楚議會的作用。", 465, 290, 300, 116, { fontSize: 23, color: C.muted, lineSpacing: 1.2 });
    addText(s, "thesis-number-c", "03", 860, 156, 120, 72, { fontSize: 54, bold: true, color: C.coral });
    addText(s, "thesis-c", "看見共好", 860, 232, 300, 44, { fontSize: 34, bold: true, color: C.navy });
    addText(s, "thesis-c-copy", "不以單一成就收尾，而以多元意見找到共同方向，回扣第5屆新承諾。", 860, 290, 300, 116, { fontSize: 23, color: C.muted, lineSpacing: 1.2 });
    addShape(s, "thesis-band", 70, 470, 1090, 126, C.navy);
    addText(s, "thesis-quote", "每一次被看見的需要，都是城市向前的一個起點。", 110, 500, 1010, 64, { fontSize: 38, bold: true, color: C.white, align: "center", valign: "middle" });
    footer(s, 2, "創意主軸");
    setNotes(s, "本案沿用2022企劃書「畫面、旁白、段落時間」的可執行結構，但改寫為市民視角與問題解決敘事。", [
      "/Users/zhangzixuan/Desktop/(OK-列印版)2022新北市議會-企劃書0629(成)B.pdf",
    ]);
  }

  // 03 Requirements
  {
    const s = p.slides.add();
    topTitle(s, "需求對照", "腳本已把硬性規格寫進製作流程", "BRIEF FIT", C.gold, 3);
    const rows = [
      ["片長", "11 分 35 秒", "落在需求的 10 至 12 分鐘內"],
      ["影像", "16:9／2K 以上", "建議 4K 母版拍攝，輸出配合簡報室"],
      ["語言", "中・英・日・台・韓", "短句、可拆字幕、預留雙行安全區"],
      ["關鍵素材", "第5屆就職典禮", "宣誓、議長副議長選舉、大合照完整入鏡"],
      ["交付延伸", "USB 300 個＋藍光片", "片頭片尾與章節點可獨立播放"],
    ];
    rows.forEach((r, i) => {
      const y = 150 + i * 92;
      addText(s, `req-key-${i}`, r[0], 72, y + 12, 145, 34, { fontSize: 24, bold: true, color: C.navy });
      addText(s, `req-value-${i}`, r[1], 235, y + 8, 360, 42, { fontSize: i === 4 ? 27 : 30, bold: true, color: i === 0 ? C.coral : C.teal });
      addText(s, `req-note-${i}`, r[2], 635, y + 13, 535, 42, { fontSize: 23, color: C.muted });
      addShape(s, `req-line-${i}`, 72, y + 66, 1098, 2, i === 4 ? C.gold : C.line);
    });
    footer(s, 3, "需求對照");
    setNotes(s, "規格摘要取自需求書。4K為製作建議，最低合規仍為2K以上。", [
      "/Users/zhangzixuan/Desktop/4.需求書.pdf（第3至4頁）",
    ]);
  }

  // 04 Timing
  {
    const s = p.slides.add();
    topTitle(s, "影片結構", "11 分 35 秒，把故事留給人與過程", "RUNTIME", C.coral, 4);
    const items = [
      ["00:00", "日常", "45秒", 88, C.teal],
      ["00:45", "來路", "45秒", 80, C.gold],
      ["01:30", "託付", "50秒", 90, C.coral],
      ["02:20", "多元", "3分30秒", 360, C.blue],
      ["05:50", "議事", "2分30秒", 270, C.teal],
      ["08:20", "未來", "3分15秒", 270, C.gold],
    ];
    let x = 70;
    items.forEach((it, i) => {
      addText(s, `time-${i}`, it[0], x, 178, it[3], 28, { fontSize: 18, bold: true, color: C.muted });
      addShape(s, `timeline-${i}`, x, 218, it[3] - 8, 72, it[4]);
      addText(s, `timeline-name-${i}`, it[1], x + 10, 228, it[3] - 28, 32, { fontSize: 20, bold: true, color: C.white, valign: "middle", align: "center" });
      addText(s, `timeline-duration-${i}`, it[2], x + 10, 265, it[3] - 28, 20, { fontSize: 15, color: C.white, align: "center" });
      x += it[3];
    });
    addText(s, "timing-thesis", "舊版以選區逐一介紹為最大篇幅；新版把城市群像壓縮成四組生活場景，將更多時間留給「民意如何成為公共行動」。", 88, 360, 1040, 102, { fontSize: 30, bold: true, color: C.navy, lineSpacing: 1.2, align: "center", valign: "middle" });
    addText(s, "timing-note", "章節皆可設播放節點，便於簡報室單一介面快速選段。", 88, 505, 1040, 42, { fontSize: 24, color: C.muted, align: "center" });
    footer(s, 4, "影片結構");
    setNotes(s, "時間配置依需求書10至12分鐘限制重新設計；章節點呼應簡報室快速選段需求。", [
      "/Users/zhangzixuan/Desktop/4.需求書.pdf（第3至4頁）",
      "/Users/zhangzixuan/Desktop/(OK-列印版)2022新北市議會-企劃書0629(成)B.pdf（第2頁）",
    ]);
  }

  // 05 Visual language
  {
    const s = p.slides.add();
    topTitle(s, "視聽語言", "真實、克制、有溫度；讓鏡頭靠近市民", "LOOK & SOUND", C.blue, 5);
    const cols = [
      { x: 72, accent: C.teal, title: "鏡頭", copy: "眼睛高度、真實動線為主\n空拍只用於建立城市尺度\n\n重要時刻採多機紀實\n不重演、不造假" },
      { x: 460, accent: C.gold, title: "剪輯", copy: "日常聲音作為轉場\n列車、海浪、翻頁、議事槌、鍵盤\n\n「看見」字樣只在章節轉折出現" },
      { x: 848, accent: C.coral, title: "音樂", copy: "弦樂與電子脈動由疏到密\n議事段落加入低頻節拍\n\n議長致詞前收斂\n片尾再抬升" },
    ];
    cols.forEach((c, i) => {
      addShape(s, `av-line-${i}`, c.x, 170, 280, 8, c.accent);
      addText(s, `av-title-${i}`, c.title, c.x, 205, 280, 48, { fontSize: 36, bold: true, color: C.navy });
      addText(s, `av-copy-${i}`, c.copy, c.x, 280, 300, 220, { fontSize: 24, color: C.muted, lineSpacing: 1.25 });
    });
    addShape(s, "av-bottom", 72, 545, 1056, 72, C.navy);
    addText(s, "av-bottom-copy", "素材原則：議員、議事、就職、會勘與市民畫面均使用真實拍攝或本會授權素材。", 104, 563, 992, 36, { fontSize: 23, bold: true, color: C.white, align: "center", valign: "middle" });
    footer(s, 5, "視聽語言");
    setNotes(s, "已先查找官方影像來源；本腳本簡報不嵌入授權不明的網路照片，正式成片使用本會或委託拍攝素材。", [
      "https://vod.ntp.gov.tw/VodCloudV2/VOD/Index",
    ]);
  }

  const req = "/Users/zhangzixuan/Desktop/4.需求書.pdf";
  const ref = "/Users/zhangzixuan/Desktop/(OK-列印版)2022新北市議會-企劃書0629(成)B.pdf";
  const history = "https://journal.th.gov.tw/intro.php?council=ntp";
  const law = "https://web.law.ntpc.gov.tw/Scripts/PrintFLAWDAT0202.aspx?fcode=C0000072";
  const vod = "https://vod.ntp.gov.tw/VodCloudV2/VOD/Index";

  scriptSlide(p, {
    number: 6, chapter: "第一章｜看見日常", title: "一座城市，從每一天開始", time: "00:00—00:45", scene: "SC 01", accent: C.teal,
    visual: "晨間城市聲：黑畫面先行\n第一班車／早餐店／學生過馬路\n長者／海岸／工地，接議事廳亮燈",
    onscreen: "看見．共好\n第5屆新北市議會",
    vo: "一座城市，不只被高樓與道路定義。它真正的樣子，藏在每一次出門、每一個等待，也藏在每一聲對未來的期待裡。有人關心上學的路是否安全；有人盼望長輩被好好照顧；有人守著山海與文化；也有人為下一份工作努力。當這些日常被看見，改變，才有開始的地方。看見．共好——第5屆新北市議會。",
    sound: "環境音先行；鋼琴單音與低頻脈動漸入，片名落版時加入明亮和弦。",
    sources: [req],
  });

  scriptSlide(p, {
    number: 7, chapter: "第一章｜看見來路", title: "每一頁議事紀錄，都把民意留在時間裡", time: "00:45—01:30", scene: "SC 02", accent: C.gold, soundFill: C.goldPale,
    visual: "會史館老照片、議事錄、席次牌\n年代光線：民國35／40／99年\n舊議場疊化今日議事廳，停在翻頁",
    onscreen: "參議會 → 縣議會 → 新北市議會",
    vo: "看見，從傾聽開始。民國三十五年，臺北縣參議會成立；其後走過十六屆臺北縣議會，地方自治在一次次討論與選擇中扎根。民國九十九年，新北市改制為直轄市，新北市議會接續啟程。名稱在變、城市在變，但讓人民的聲音進入公共決策，始終是這座議會不變的起點。",
    sound: "紙張、印章與老式快門聲，逐步轉為今日議場的空間殘響。",
    sources: [history, `${ref}（第3頁）`],
  });

  scriptSlide(p, {
    number: 8, chapter: "第二章｜看見託付", title: "一張選票是託付，一聲宣誓是承諾", time: "01:30—02:20", scene: "SC 03", accent: C.coral, soundFill: C.coralPale,
    visual: "第5屆議員報到、胸花與名牌\n宣誓全景／誓詞中近景\n議長副議長選舉、開票與大合照",
    onscreen: "託付｜宣誓｜啟程",
    vo: "新的任期，從市民手中的一張選票開始。第5屆新北市議會正式啟程，每一席都承接著地方的期待，也共同肩負監督市政、審議公共資源、回應人民需要的責任。當宣誓聲在議事廳響起，那不只是一場典禮；更是一份面向所有新北市民、必須被實踐的承諾。",
    sound: "保留報到、宣誓與開票現場原音；宣誓完成後音樂抬升。",
    sources: [req, law],
  });

  scriptSlide(p, {
    number: 9, chapter: "第三章｜看見多元", title: "從海岸出發，城市的每一種距離都值得被理解", time: "02:20—03:15", scene: "SC 04", accent: C.blue, soundFill: C.bluePale,
    visual: "淡水河口日出接北海岸公路\n漁港／溫泉／山城／鐵道／海岸\n地名：淡水、八里、三芝、石門、金山、萬里、瑞芳、貢寮",
    onscreen: "海岸的遠近，也是生活的遠近",
    vo: "沿著淡水河走向海岸，風景遼闊，生活的距離卻很具體。通勤要多一段轉乘，觀光要兼顧居民日常，產業要找到新的機會，山海也需要被長久守護。議會所看見的，不只是地圖上的邊界，而是每一條回家的路、每一個在地生活的選擇。不同地方提出不同需要，也讓城市學會用更多角度思考。",
    sound: "海浪、風聲與列車通過聲交織；節奏由寬廣轉為前進。",
    sources: [`${ref}（第5、9頁，僅作地區內容範圍參考）`],
  });

  scriptSlide(p, {
    number: 10, chapter: "第三章｜看見多元", title: "河流連起城市，也連起彼此的日常", time: "03:15—04:10", scene: "SC 05", accent: C.blue, soundFill: C.bluePale,
    visual: "河流、橋梁與自行車道空拍\n捷運／公車／市場／托育／長照\n地名：板橋、新莊、三重、蘆洲\n五股、泰山、林口、永和、中和",
    onscreen: "移動｜居住｜照顧",
    vo: "河流穿過都會，也把居住、交通與照顧緊緊連在一起。對每天移動的人來說，幾分鐘就是生活品質；對正在養育孩子、陪伴長輩的家庭來說，一個可靠的服務據點，就是安心。面對快速變動的城市，議員走進社區、聽見差異，讓道路、住宅、公共空間與社會照顧，都能回到人的需要。",
    sound: "交通節拍與人群環境音；中段加入孩童笑聲與公園自然音。",
    sources: [`${ref}（第5至7頁，僅作地區內容範圍參考）`],
  });

  scriptSlide(p, {
    number: 11, chapter: "第三章｜看見多元", title: "產業向前，文化與生活也要一起留下", time: "04:10—05:05", scene: "SC 06", accent: C.blue, soundFill: C.bluePale,
    visual: "工業區、商圈、科技辦公與青年\n鶯歌陶作、三峽老街、樹林土城\n地名：土城、樹林、鶯歌、三峽、汐止、新店",
    onscreen: "發展，不必以失去為代價",
    vo: "城市要前進，不代表所有熟悉的事物都必須退場。產業升級帶來新的工作與速度，老街、工藝、聚落記憶，則提醒我們從哪裡走來。議會在發展與保存之間持續提問：資源是否公平？建設是否回應地方？改變能不能讓更多人共享？真正的進步，是讓創新有空間，也讓文化與生活保有位置。",
    sound: "機械節奏、鍵盤聲與陶土摩擦聲混合，形成新舊共存的聲響。",
    sources: [`${ref}（第7至9頁，僅作地區內容範圍參考）`],
  });

  scriptSlide(p, {
    number: 12, chapter: "第三章｜看見多元", title: "山林、聚落與族群，讓新北擁有更寬廣的聲音", time: "05:05—05:50", scene: "SC 07", accent: C.blue, soundFill: C.bluePale,
    visual: "溪流、茶園、山路與聚落晨霧\n原住民族、青年與長者生活\n地名：深坑、石碇、坪林、平溪、雙溪、烏來；29區匯聚",
    onscreen: "多元，不只是並列；是彼此被理解",
    vo: "走進山林與聚落，距離、照顧、文化傳承與安全，都有不同的答案。原住民族的聲音、地方長者的經驗、青年返鄉的選擇，讓新北不只有一種樣貌。議會的責任，是讓少數不被淹沒、讓偏遠不被忽略，也讓每一種生活方式，都能在公共討論中擁有位置。看見差異，才有可能一起走向共好。",
    sound: "溪流、鳥鳴與族群生活環境音；尾端加入溫暖弦樂，帶入議事段落。",
    sources: [`${ref}（第8至10頁，僅作地區與族群內容範圍參考）`],
  });

  scriptSlide(p, {
    number: 13, chapter: "第四章｜看見議事", title: "民意抵達議會之前，先從地方被好好聽見", time: "05:50—06:40", scene: "SC 08", accent: C.teal,
    visual: "服務處接聽、陳情資料與座談\n市場／校園／社區／災害現場\n會勘測量、記錄，便條整理成議題",
    onscreen: "傾聽 → 釐清 → 帶進議會",
    vo: "一個問題走進議會，常常不是從麥克風開始，而是從一通電話、一場座談、一次現場會勘開始。議員在地方傾聽，把分散的感受釐清成具體問題；把個別遭遇放回公共制度中思考。民意不是被收下就結束，而是要被整理、被查證，找到能夠追問、提案與推動改變的方向。",
    sound: "電話鈴聲、街區環境音、筆記聲；音樂轉為清楚而穩定的脈動。",
    sources: [`${ref}（第11頁）`, law],
  });

  scriptSlide(p, {
    number: 14, chapter: "第四章｜看見議事", title: "不同意見進入制度，問題才有被解決的可能", time: "06:40—07:35", scene: "SC 09", accent: C.teal,
    visual: "議程確認、資料送達、幕僚準備\n大會質詢／委員會審查\n局處回應／表決器／議案特寫",
    onscreen: "質詢｜審查｜議決",
    vo: "問題來到議會，不是終點，而是被檢驗的開始。議員在大會與委員會中提出質詢、審查議案，要求市府說明政策的依據、進度與影響。不同立場可以交鋒，資料必須接受檢視，公共資源更需要被仔細衡量。民主不保證每個人立刻得到相同答案，卻讓不同意見都必須被看見、被回應。",
    sound: "保留質詢與回應原音片段；議事槌或表決提示音作節奏切點。",
    sources: [law, vod, `${ref}（第11頁）`],
  });

  scriptSlide(p, {
    number: 15, chapter: "第四章｜看見議事", title: "每一條法規、每一筆預算，都牽動真實生活", time: "07:35—08:20", scene: "SC 10", accent: C.teal,
    visual: "法規條文與預算書近拍\n審查標記／數字核對／提案表決\n數字轉化道路、校園、照顧現場",
    onscreen: "把資源用在真正需要的地方",
    vo: "一條自治法規，可能改變城市運作的規則；一筆預算，可能決定一項服務能不能走進社區。議會審議法規、預算與決算，也議決市府及議員提案，接受人民請願。每一次逐條討論、每一次追問數字，目的都不是讓文件更厚，而是讓公共資源更透明、更合理，真正用在需要的地方。",
    sound: "翻頁、鍵盤與計算機聲；生活畫面出現時，音樂轉為溫暖。",
    sources: [law, `${ref}（第11頁）`],
  });

  scriptSlide(p, {
    number: 16, chapter: "第四章｜看見議事", title: "監督不是一次問答，而是把承諾追到落地", time: "08:20—09:15", scene: "SC 11", accent: C.teal,
    visual: "議場答詢接工程現場會勘\n改善前／施工中／完成後\n議員、局處、居民確認，待辦逐項追蹤",
    onscreen: "提出問題，更要追蹤答案",
    vo: "監督不只發生在議事廳。會議上的一個承諾，還要回到現場，被一次次確認。從工程品質到服務進度，從政策成效到突發事件，議員透過質詢、考察、會勘與持續追蹤，要求問題不能只被回答，更要被處理。當制度願意留下紀錄、接受檢驗，市民才看得見改變走到哪裡。",
    sound: "議場原音切至工地與現場環境音；節奏逐步推進，完成畫面留半秒呼吸。",
    sources: [law, `${ref}（第11頁）`],
  });

  scriptSlide(p, {
    number: 17, chapter: "第五章｜看見專業", title: "議事能穩定運作，背後是一整個團隊的接力", time: "09:15—10:00", scene: "SC 12", accent: C.gold, soundFill: C.goldPale,
    visual: "議事、法制、文書、資訊與行政支援\n會前測試／資料編整／影音上架\n影音隨選系統，議場門準時開啟",
    onscreen: "專業支援，讓民主準時發生",
    vo: "每一次會議準時開始，背後都有一整個團隊的接力。從議事與法制，到文書、資訊、公共關係與行政支援，工作人員整理資料、維護設備、留下紀錄，也讓議事資訊與影音能被查詢。看不見的準備，支撐看得見的民主；穩定、正確與公開，讓市民更容易理解議會正在做什麼。",
    sound: "鍵盤、對講機、設備測試音；議場門開啟時轉為寬廣空間聲。",
    sources: [vod, `${ref}（第11至12頁）`, req],
  });

  scriptSlide(p, {
    number: 18, chapter: "第五章｜看見傳承", title: "保存歷史，不是回頭；是讓下一次選擇更有根據", time: "10:00—10:40", scene: "SC 13", accent: C.gold, soundFill: C.goldPale,
    visual: "增修後會史館與互動媒體\n歷屆照片、議事紀錄、紀念物\n學生、親子、訪賓觀看展覽",
    onscreen: "記得來路，才能看清方向",
    vo: "議會的歷史，不只屬於一棟建築，也屬於每一代參與地方自治的人。會史館保存照片、文件與重要紀錄，透過更新的展示與互動內容，讓過去不只是被陳列，而能被理解。當下一代看見民主如何一步步走來，也更能明白：今天擁有的每一次發言與選擇，都值得珍惜。",
    sound: "空間環境音與輕柔木質打擊；孩子停步觀看時降低音樂。",
    sources: [req, history],
  });

  scriptSlide(p, {
    number: 19, chapter: "第五章｜看見世界", title: "交流讓經驗互相照亮，也讓世界看見新北", time: "10:40—11:00", scene: "SC 14", accent: C.gold, soundFill: C.goldPale,
    visual: "國內外議會交流與外賓參訪\n城市資料／同步口譯／握手合影\n城市風景交錯，回到議會夜景",
    onscreen: "看見世界｜讓世界看見新北",
    vo: "城市面對的交通、環境、照顧與治理課題，從來不只存在於一個地方。透過議會交流與城市對話，我們分享經驗，也學習不同做法。看見世界，是為了把更好的方法帶回新北；讓世界看見新北，則是把地方民主的努力，放進更寬廣的連結裡。",
    sound: "音樂加入明亮弦樂；保留迎賓與交流現場自然聲。",
    sources: [`${ref}（第12頁）`],
  });

  scriptSlide(p, {
    number: 20, chapter: "第六章｜看見未來", title: "議長建議致詞：從市民需要出發，與城市一起前進", time: "11:00—11:20", scene: "SC 15", accent: C.coral, soundFill: C.coralPale,
    visual: "議長自然光中近景面向鏡頭\n穿插議場傾聽、市民互動\n就職後依實際議長身份錄製",
    onscreen: "第5屆新北市議會｜議長（姓名後補）",
    vo: "第5屆新北市議會，將以市民的需要為起點，在多元意見中尋找共識，在監督與合作中推動城市前進。讓每一個聲音被聽見、每一項託付被看見；讓議會成為市民可以理解、可以靠近，也可以共同參與的民主殿堂。未來，我們會和所有新北市民一起，為更好的生活努力。",
    sound: "以同期原音為主，音樂降低；最後一句後留一秒停頓再進片尾。",
    note: "此段為建議致詞稿，不宣稱為既有發言。第5屆議長產生後，可保留語意並依其口吻微調。",
    sources: [req],
  });

  scriptSlide(p, {
    number: 21, chapter: "片尾｜看見共好", title: "看見彼此相連，城市才會一起變好", time: "11:20—11:35", scene: "SC 16", accent: C.coral, soundFill: C.coralPale,
    visual: "市民面孔、議場、29區地景回看\n畫面匯聚成一扇發光的「窗」\n片名與議會識別落版",
    onscreen: "看見．共好\n第5屆新北市議會",
    vo: "看見每一個人，也看見我們彼此相連。讓民意有回聲，讓行動有方向，讓新北在共好中持續前進。看見．共好——第5屆新北市議會。",
    sound: "主題旋律完整收束；片名落版後保留兩秒尾韻。",
    sources: [req],
  });

  // 22 Asset checklist
  {
    const s = p.slides.add();
    topTitle(s, "拍攝清單", "先把不可重來的畫面拍完整，再讓故事成立", "PRODUCTION", C.teal, 22);
    const left = [
      "第5屆議員報到與宣誓",
      "議長、副議長選舉與開票",
      "全體大合照＋個別／分組備份",
      "議事廳空景、席位、議事設備",
      "議長建議致詞（兩機位＋乾淨收音）",
    ];
    const right = [
      "29區地景與市民日常",
      "服務處、座談、會勘與質詢",
      "預算／法規審查與幕後行政",
      "會史館增修後展區與參觀者",
      "國際交流及授權歷史素材",
    ];
    addText(s, "asset-left-title", "A｜典禮與議會核心素材", 72, 160, 500, 42, { fontSize: 30, bold: true, color: C.navy });
    addText(s, "asset-left-copy", left.map((x) => `□  ${x}`).join("\n"), 72, 225, 500, 290, { fontSize: 25, color: C.ink, lineSpacing: 1.35 });
    addShape(s, "asset-divider", 622, 160, 3, 390, C.line);
    addText(s, "asset-right-title", "B｜城市、議事與傳承素材", 680, 160, 500, 42, { fontSize: 30, bold: true, color: C.navy });
    addText(s, "asset-right-copy", right.map((x) => `□  ${x}`).join("\n"), 680, 225, 500, 290, { fontSize: 25, color: C.ink, lineSpacing: 1.35 });
    addShape(s, "asset-bottom", 72, 565, 1108, 62, C.tealPale);
    addText(s, "asset-bottom-copy", "就職典禮素材建議同步備份：主檔、代理檔、照片 RAW、場記與姓名核對表。", 100, 578, 1050, 34, { fontSize: 23, bold: true, color: C.navy, align: "center", valign: "middle" });
    footer(s, 22, "拍攝清單");
    setNotes(s, "就職典禮全程錄影、拍照及大合照為需求書明列項目。", [req]);
  }

  // 23 Localization & delivery
  {
    const s = p.slides.add();
    topTitle(s, "五語與交付", "先鎖定中文母版，再維持五個版本同一個節奏", "LOCALIZATION", C.gold, 23);
    const steps = [
      ["01", "中文定稿", "確認專有名詞、姓名、職稱與地名"],
      ["02", "五語翻譯", "英、日、台、韓採自然口語，不逐字硬譯"],
      ["03", "配音對時", "以段落時間為準，必要時調整句長不改畫面"],
      ["04", "字幕校對", "雙行安全區；台語另確認用字或羅馬字需求"],
      ["05", "母版輸出", "16:9、2K以上；USB與藍光版本逐一驗播"],
    ];
    steps.forEach((r, i) => {
      const y = 150 + i * 94;
      addText(s, `loc-no-${i}`, r[0], 72, y + 4, 70, 46, { fontSize: 34, bold: true, color: i % 2 === 0 ? C.teal : C.gold });
      addText(s, `loc-title-${i}`, r[1], 160, y + 5, 250, 42, { fontSize: 28, bold: true, color: C.navy });
      addText(s, `loc-copy-${i}`, r[2], 430, y + 9, 720, 38, { fontSize: 23, color: C.muted });
      addShape(s, `loc-line-${i}`, 72, y + 64, 1080, 2, C.line);
    });
    footer(s, 23, "五語與交付");
    setNotes(s, "五語版本、USB與藍光交付規格取自需求書；實際編碼與包裝規格由後續製作會議確認。", [req]);
  }

  return p;
}

async function writeBlob(filePath, blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(filePath, bytes);
}

async function main() {
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.mkdir(QA_DIR, { recursive: true });
  const p = makePresentation();

  for (const [i, slide] of p.slides.items.entries()) {
    const n = String(i + 1).padStart(2, "0");
    await writeBlob(path.join(QA_DIR, `slide-${n}.png`), await p.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(QA_DIR, `slide-${n}.layout.json`), await layout.text());
  }

  await writeBlob(path.join(QA_DIR, "montage.webp"), await p.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(OUT);

  const inspection = await p.inspect({ kind: "slide,textbox,shape,notes", maxChars: 200000 });
  await fs.writeFile(path.join(QA_DIR, "deck-inspect.ndjson"), inspection.ndjson);
  console.log(`Wrote ${OUT}`);
  console.log(`Slides: ${p.slides.items.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
