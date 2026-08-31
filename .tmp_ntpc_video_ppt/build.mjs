import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const STARTER = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_video_ppt/template-starter.pptx";
const OUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/新北市議會_第5屆簡介影片_詳細腳本_A4直式.pptx";
const RENDER_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_video_ppt/final-render";
const LAYOUT_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_video_ppt/final-layout";

const SOURCE_DECK = "/Users/zhangzixuan/Desktop/新北市議會案_服務建議書_A4直式_1.pptx";
const LAW_ORG = "https://web.law.ntpc.gov.tw/Scripts/PrintFLAWDAT0202.aspx?fcode=C0000072";
const LAW_POWERS = "https://web.law.ntpc.gov.tw/Scripts/PrintFLAWDOC01.aspx?fcode=B0040002&flno=36";
const VOD = "https://vod.ntp.gov.tw/VodCloudV2/VOD/Index";
const HISTORY = "https://journal.th.gov.tw/intro.php?council=ntp";

function shape(slide, name) {
  const found = slide.shapes.items.find((item) => item.name === name);
  if (!found) throw new Error(`Missing shape ${name} on slide ${slide.index + 1}`);
  return found;
}

function setText(slide, name, value) {
  const target = shape(slide, name);
  target.text = value;
}

function setTable(table, values) {
  for (let r = 0; r < values.length; r += 1) {
    for (let c = 0; c < values[r].length; c += 1) {
      table.cells.set(r, c, values[r][c]);
    }
  }
}

function chrome(slide, page, rail, title) {
  setText(slide, "Text 0", rail);
  setText(slide, "Text 1", "新北市議會｜簡介影片腳本");
  setText(slide, "Text 3", String(page));
  setText(slide, "Text 4", title);
}

function addNotes(slide, productionNote, sources = []) {
  const lines = [];
  if (productionNote) lines.push(productionNote, "");
  lines.push("[Sources]");
  for (const item of sources) lines.push(`- ${item}`);
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
  slide.speakerNotes.setVisible(true);
}

function setScene(slide, page, scene) {
  chrome(slide, page, `分鏡腳本｜${scene.no} ${scene.rail}`, scene.title);
  setText(slide, "Text 6", `◆ ${scene.time}｜${scene.callout}`);
  const headingNames = ["Text 7", "Text 9", "Text 11", "Text 13", "Text 15"];
  const bodyNames = ["Text 8", "Text 10", "Text 12", "Text 14", "Text 16"];
  for (let i = 0; i < 5; i += 1) {
    setText(slide, headingNames[i], scene.blocks[i][0]);
    setText(slide, bodyNames[i], scene.blocks[i][1]);
  }
  addNotes(slide, scene.note, scene.sources);
}

const scenes = [
  {
    no: "01", rail: "城市開場", title: "場景一｜城市醒來，問題正在發生", time: "00:00–00:40",
    callout: "先拍生活、再進議會；讓觀眾先看見自己，建立『民主就在日常』的情感入口。",
    blocks: [
      ["一、內容與旁白", "清晨列車、校門、市場、河岸與工地交錯。旁白：『每一天，新北都有新的期待——更安全的路、更安心的照顧、更宜居的城市。』"],
      ["二、核心意義", "議會不是建築或會議的集合，而是市民日常需求進入公共制度的入口。"],
      ["三、畫面與鏡位", "高點／空拍建立城市尺度；35mm 中景跟拍通勤；85mm 捕捉手、眼神與生活細節。25–30 個短鏡頭，由快轉穩。"],
      ["四、聲音與圖像", "先以環境音開場，約 8 秒後進音樂；『安全、照顧、交通、環境』以低調動態字浮現。"],
      ["五、轉場與拍攝提醒", "市民抬頭望向道路資訊，Match Cut 至議會外觀。旁白問：『這些聲音，如何被聽見？』\n拍攝提醒：避免可辨識車牌、未授權兒童正面與商標；空拍須依核准範圍執行。"]
    ],
    note: "導演節奏：前 12 秒使用聲音抓住注意力；第 30 秒第一次出現議會建築。",
    sources: [SOURCE_DECK]
  },
  {
    no: "02", rail: "議會沿革", title: "場景二｜一段會史，承接地方自治的選擇", time: "00:40–01:35",
    callout: "不是年代羅列，而是用三個轉折說明：地方聲音如何逐步制度化、被保存並持續傳承。",
    blocks: [
      ["一、內容與旁白", "旁白：『從縣參議會、臺北縣議會，到升格後的新北市議會，名稱與城市改變了，讓地方聲音進入公共決策的使命始終延續。』"],
      ["二、核心意義", "把會史從『歷任名錄』轉成『民主制度的累積』，為第5屆登場建立承先啟後的重量。"],
      ["三、畫面與鏡位", "歷史照片以慢推、局部放大與紙張紋理呈現；實拍會史館展板、舊議事錄、建築細節，搭配同角度今昔疊化。"],
      ["四、圖像與字幕", "時間軸只保留 3 個節點：參議會起點／縣議會發展／新北市議會。年份與名稱均由議會核定後上線。"],
      ["五、轉場與拍攝提醒", "從舊議事錄翻頁切到今日議程文件，接下一段『議會現在做什麼』。\n素材規格：紙本文物建議 600dpi 掃描；原件拍攝採無反光柔光並由館方監看。"]
    ],
    note: "史料不得用生成式圖片補造；影像使用範圍、年代、人物與權利狀態逐件建表確認。",
    sources: [HISTORY, SOURCE_DECK]
  },
  {
    no: "03", rail: "議會職權", title: "場景三｜把制度說清楚，讓職權看得見", time: "01:35–02:25",
    callout: "以『一張城市的共同帳本與規則』解釋職權，避免法條朗讀，讓國內外觀眾迅速理解。",
    blocks: [
      ["一、內容與旁白", "旁白：『市民選出的議員，在議會審議地方規章與預算、檢視決算、討論提案，也接受人民請願；每一次發言，都連結城市資源與生活選擇。』"],
      ["二、核心意義", "用清楚、非黨派的制度解說，建立議會作為地方立法與監督機關的專業形象。"],
      ["三、畫面與鏡位", "議場空鏡→議程文件→會議進行；24mm 對稱廣角建立秩序，50mm 肩上鏡頭拍閱讀文件，特寫議事槌與表決設備。"],
      ["四、動態圖像", "以『規章／預算／決算／提案／請願』五個關鍵詞沿圓形議場展開；每項只配一個生活例子，不放抽象圖示堆疊。"],
      ["五、轉場與拍攝提醒", "最後停在『請願／市民聲音』，圖像線條延伸成一條路，帶往下一幕的市民情境。\n所有職權文字以最新法規與議會核定版本為準。"]
    ],
    note: "法規型旁白需由議會法制／議事單位複核；若版面需列舉，完整清單放手冊，影片保留五項核心。",
    sources: [LAW_ORG, LAW_POWERS]
  },
  {
    no: "04", rail: "市民聲音", title: "場景四｜一個問題，如何走進議會視野", time: "02:25–03:20",
    callout: "採『複合情境』而非虛構政績：不同市民提出生活問題，呈現多元入口與共同關注。",
    blocks: [
      ["一、內容與旁白", "旁白：『一個問題，可能從陳情、請願、議員服務、會勘或公開參與被看見。重要的不是聲音大小，而是能否被記錄、理解與追蹤。』"],
      ["二、核心意義", "把議會拉近市民，呈現『有入口、有紀錄、有回應』的民主參與感，同時不承諾個案必然結果。"],
      ["三、畫面與鏡位", "三組生活情境交叉：交通、照顧、環境。手機只拍手部與訊息介面背面；服務場景用中近景與文件特寫，避免演員直視鏡頭表演。"],
      ["四、訪談與字幕", "可用 2–3 句匿名市民短語：『我希望有人聽見……』；若為真實個案，須取得書面同意並刪除個資。"],
      ["五、轉場與拍攝提醒", "紙本陳情／會勘筆記放上桌面，鏡頭沿文字移動至『待研議』標記。\n情境只作流程示意；不得把未結案個案剪成已獲解決的成果故事。"]
    ],
    note: "人物使用原則：優先真實受訪者；如需情境重現，畫面註明『情境示意』且不使用可識別真實案件資料。",
    sources: [LAW_POWERS, SOURCE_DECK]
  },
  {
    no: "05", rail: "成案研議", title: "場景五｜從生活語言，整理成可討論的議題", time: "03:20–04:20",
    callout: "呈現幕後工作：蒐集資料、現場會勘、法規與預算檢視，讓觀眾理解議事並非只發生在鏡頭前。",
    blocks: [
      ["一、內容與旁白", "旁白：『被聽見只是第一步。現場狀況、法規依據、預算來源與不同立場，都必須被放在同一張桌上，問題才有機會成為可討論的方案。』"],
      ["二、核心意義", "建立專業可信度：民主不是一句口號，而是把經驗轉成證據、把意見轉成議題的過程。"],
      ["三、畫面與鏡位", "會勘採手持穩定器跟拍；室內會議以俯拍文件、側逆光人物輪廓及白板焦點切換；補拍地圖、法規、預算表細節。"],
      ["四、圖像與節奏", "畫面疊加四層資訊：現場／資料／法規／預算；每層 3–4 秒，最後合併為『議題』標題卡。"],
      ["五、轉場與拍攝提醒", "文件被夾入議程資料夾，切到審查會門牌。\n議案名稱與文件內容只拍已公開或經核准版本；機敏資料以景深與遮罩處理。"]
    ],
    note: "此段避免過度擺拍；先取得實際作業流程，再設計不干擾公務的補拍動作。",
    sources: [SOURCE_DECK]
  },
  {
    no: "06", rail: "委員會審查", title: "場景六｜在細節裡，讓不同意見被檢驗", time: "04:20–05:35",
    callout: "全片第一個高密度議事段落；用問答、文件與反應鏡頭呈現審查，而不是只剪激烈發言。",
    blocks: [
      ["一、內容與旁白", "旁白：『進入審查，不同問題被逐項提出：必要嗎？可行嗎？預算合理嗎？影響誰？每一次追問，都是讓決策更完整的檢驗。』"],
      ["二、核心意義", "表現多元意見與制度化辯證；讓觀眾理解委員會是深入拆解議題的重要場域。"],
      ["三、畫面與鏡位", "三機建議：A 機全景安全鏡、B 機發言者中近景、C 機官員／資料／反應特寫；先收完整段落，再取得剪輯所需 cutaway。"],
      ["四、收音與字幕", "接議事系統 clean feed，另錄環境聲備援；發言字幕保留完整語意，不以斷句製造衝突。必要時以圖卡補充名詞。"],
      ["五、轉場與拍攝提醒", "以『問題被拆開』的文件標記轉為下一幕質詢。\n政治中立：不同黨團、性別、選區的可用畫面比例由議會確認；不得只剪單一立場。"]
    ],
    note: "實際議事畫面以議會核准的會議與座位區域為準；攝影機不阻擋議事動線。",
    sources: [VOD, LAW_POWERS]
  },
  {
    no: "07", rail: "質詢監督", title: "場景七｜追問，是把承諾帶回公共檢驗", time: "05:35–06:55",
    callout: "用『問題—回應—追蹤』三拍結構，強調責任與資訊公開，不把影片剪成個人英雄敘事。",
    blocks: [
      ["一、內容與旁白", "旁白：『監督，不只是在議場提出問題；更重要的是要求說明、確認進度，並讓公共資源的使用接受檢驗。』"],
      ["二、核心意義", "呈現議員監督市政與行政部門說明責任；焦點放在制度、資料與後續追蹤。"],
      ["三、畫面與鏡位", "以議員提問、官員回應、資料畫面三角剪輯；長焦拍表情但不捕捉失態；畫面至少保留一次完整問答的連續性。"],
      ["四、圖像與聲音", "螢幕側欄顯示『問題／回應／追蹤』，搭配日期與公開資料來源；音樂降至最低，保留現場原音的真實感。"],
      ["五、轉場與拍攝提醒", "追蹤清單上的一項被勾選，轉為預算與議案文件。\n剪輯守則：不得跨議題拼接問答；字幕、時間與發言者身分須二次校對。"]
    ],
    note: "建議挑選議會核定、上下文完整且能代表制度運作的公開片段，避免以聲量或戲劇性作為唯一選片標準。",
    sources: [VOD, LAW_POWERS]
  },
  {
    no: "08", rail: "預算議決", title: "場景八｜每一筆資源，都要回答公共價值", time: "06:55–08:05",
    callout: "用『共同帳本』解釋預算與議決，把複雜程序轉成市民能感受的選擇與取捨。",
    blocks: [
      ["一、內容與旁白", "旁白：『城市的預算，是大家共同的帳本。從建設、教育到社會照顧，每一筆資源的安排，都必須被討論、比較與負責。』"],
      ["二、核心意義", "讓觀眾理解議會議決預算、審議決算與處理提案的公共責任，而非只看表決瞬間。"],
      ["三、畫面與鏡位", "預算書翻頁、重點標註、會議發言、表決程序；俯拍建立文件秩序，50mm 捕捉閱讀與交換意見，表決畫面以核准素材為準。"],
      ["四、動態圖像", "一元硬幣化成『公共資源』流向三個生活場景，再回到議場；避免呈現未核定金額與政績式比較。"],
      ["五、轉場與拍攝提醒", "文件蓋章／收合，畫面切至公開議事平台。\n所有議案狀態須標示『提案、審議、通過或執行』的正確階段，不以動畫暗示既定成果。"]
    ],
    note: "若要使用實際預算案例，須由議會指定已公開且適合國內外觀眾理解的案例，並以正式資料核對數字。",
    sources: [LAW_POWERS, VOD]
  },
  {
    no: "09", rail: "透明與教育", title: "場景九｜看得懂，民主才真正靠近", time: "08:05–09:00",
    callout: "把直播、議事影音、會史館與參訪串在一起，從『公開』推進到『可理解、可參與』。",
    blocks: [
      ["一、內容與旁白", "旁白：『會議公開，是透明的起點；讓市民看得懂議程、找到影像、走進會史館，才讓民主從制度走進學習與生活。』"],
      ["二、核心意義", "回扣本案會史館、簡報室、影片與手冊的整合價值：不同媒介共同完成公民教育。"],
      ["三、畫面與鏡位", "螢幕錄影呈現 VOD 查詢→學生／訪賓觀看 LED→會史館導覽；以肩後鏡頭帶觀眾一起閱讀，不拍假操作。"],
      ["四、圖像與聲音", "搜尋、播放、參訪三個動作以同一金色路徑連接；加入學生提問原音或導覽員一句短解說。"],
      ["五、轉場與拍攝提醒", "年輕觀眾在會史館看見『第5屆』區域，畫面切入就職典禮準備。\n網站畫面拍攝前確認個資、通知與介面版本；後製保留可更新畫面層。"]
    ],
    note: "網站與系統畫面以實際可用介面拍攝；若上線前改版，保留一次更新補拍。",
    sources: [VOD, SOURCE_DECK]
  },
  {
    no: "10", rail: "第5屆登場", title: "場景十｜新的任期，從公開承諾開始", time: "09:00–10:05",
    callout: "以就職典禮現場原音作情緒高點；名單、職銜與席次在議會正式確認後才鎖定。",
    blocks: [
      ["一、內容與旁白", "典禮原音先行。旁白：『新的任期，從一份公開承諾開始。來自不同地方、不同經驗的代表，在這裡共同承擔城市的下一段責任。』"],
      ["二、核心意義", "把第5屆放在制度傳承與多元代表的脈絡中，而不是人物名單快速輪播。"],
      ["三、畫面與鏡位", "四機紀錄：A 全景、B 宣誓／主席台、C 議員特寫、D 遊走與備援；雙卡同錄、時間碼同步。大合照另設階梯與均勻柔光。"],
      ["四、人物呈現", "每位議員至少保留一個可用正面鏡頭；姓名、選區、黨籍／無黨籍與職銜依議會核定資料製作可替換圖層。"],
      ["五、轉場與拍攝提醒", "掌聲延續到國際訪賓握手／多語歡迎畫面。\n典禮不可重來：前一日走位彩排、雙機位備援、獨立錄音、現場即時備份；未核定資料不上字。"]
    ],
    note: "就職典禮建立獨立拍攝任務書、機位圖、鏡頭責任表與備援清單；當日完成至少兩份實體備份。",
    sources: [LAW_ORG, SOURCE_DECK]
  },
  {
    no: "11", rail: "國際交流", title: "場景十一｜讓地方民主被世界理解", time: "10:05–10:55",
    callout: "五語不是逐字換聲，而是把制度與文化翻成國際訪賓能理解的語境；畫面維持同一版本。",
    blocks: [
      ["一、內容與旁白", "旁白：『地方治理面對的課題各不相同，但傾聽、審議與負責，是城市交流共同的語言。新北議會以開放的姿態，分享經驗，也持續學習。』"],
      ["二、核心意義", "服務外賓接待與城市交流，同時把五語製作從規格要求提升為議會形象的一部分。"],
      ["三、畫面與鏡位", "外賓入館、簡報室觀看、交換資料與會談廣角；避免只拍握手，補足聆聽、提問、翻閱手冊與導覽互動。"],
      ["四、語言與字幕", "中、英、日、台、韓版本共用畫面；語音分軌、字幕獨立。專有名詞建立術語表，英日韓由母語審校，台語由專業顧問審訂。"],
      ["五、轉場與拍攝提醒", "五種語言的『歡迎』快速交疊後歸於城市夜景。\n外賓肖像與旗幟須確認授權與外交禮序；無適當既有素材時，改以空間、文件與語言圖層呈現。"]
    ],
    note: "多語版不得以機器翻譯直接上線；配音前先核定中文定稿與術語表，避免五版本同步返工。",
    sources: [SOURCE_DECK]
  },
  {
    no: "12", rail: "未來收束", title: "場景十二｜不同聲音，在制度裡共同前進", time: "10:55–11:30",
    callout: "回到開場的生活場景，以一句可長期使用的品牌主張收束，讓影片不因單一任期事件快速過時。",
    blocks: [
      ["一、內容與旁白", "旁白：『從一個問題，到一場討論；從一項選擇，到城市的下一步。新北市議會，讓不同聲音在制度裡被聽見，讓民主成為我們共同的日常。』"],
      ["二、核心意義", "完成首尾呼應：議會的價值不只在作出決定，也在讓差異被看見、被討論、被公共檢驗。"],
      ["三、畫面與鏡位", "回到開場人物與城市夜景；議會建築定鏡 4–5 秒，最後疊上主標『看見新北議會｜讀懂民主的日常』。"],
      ["四、聲音與片尾", "音樂回到主旋律並留出一句旁白空間；片尾列製作、授權與議會核定資訊，不以冗長工作名單稀釋主標。"],
      ["五、版本與彈性", "標準片長 11:30；可依實際素材在 10:45–11:45 內微調，仍符合 10–12 分鐘需求。\n另輸出 60 秒／30 秒精華版時，沿用開場—制度—第5屆—主標四拍結構。"]
    ],
    note: "片尾主標至少停留 4 秒；五語版片尾均保留新北市議會正式中英文名稱與核定識別。",
    sources: [SOURCE_DECK]
  }
];

async function main() {
  await fs.mkdir(RENDER_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });
  const presentation = await PresentationFile.importPptx(await FileBlob.load(STARTER));

  // 1. Cover
  {
    const slide = presentation.slides.getItem(0);
    setText(slide, "Text 2", "影片企劃書");
    setText(slide, "Text 3", "看見新北議會");
    setText(slide, "Text 4", "讀懂民主的日常\n第5屆議會簡介影片");
    setText(slide, "Text 5", "詳細腳本與拍攝方案");
    setText(slide, "Text 7", "建議片長：11 分 30 秒｜符合 10–12 分鐘需求");
    setText(slide, "Text 8", "拍攝規格：4K 取材｜2K 以上製作與交付");
    setText(slide, "Text 9", "版本：中・英・日・台・韓五語");
    addNotes(slide, "封面主標延續整案『民主的日常／看得見的議會』概念。", [SOURCE_DECK]);
  }

  // 2. Positioning
  {
    const slide = presentation.slides.getItem(1);
    chrome(slide, 2, "影片企劃｜核心定位", "影片不是機關介紹，而是一段可被理解的民主旅程");
    setText(slide, "Text 6", "◆ 核心提案｜以『一個市民關心的問題，如何走進議會』串起會史、職權、審議、監督、第5屆與國際交流。");
    setText(slide, "Text 7", "一、影片核心定位");
    setTable(slide.tables.items[0], [
      ["片名主張", "看見新北議會｜讀懂民主的日常"],
      ["敘事引擎", "一個問題如何被聽見、整理、審議與追蹤"],
      ["觀眾收穫", "理解議會職權、感受民主參與、記住第5屆新章"]
    ]);
    setText(slide, "Text 8", "二、核心敘事命題");
    setText(slide, "Text 9", "議會不是遙遠的殿堂，而是市民生活議題進入公共制度、接受討論與監督的地方。");
    setText(slide, "Text 10", "看見歷史：地方自治如何一路累積。\n看見運作：問題如何走進議會、被檢驗。\n看見未來：第5屆如何承接責任、面向世界。");
    setText(slide, "Text 11", "建議成片 11:30；保留約 30 秒調整彈性，以實際典禮與議事素材品質微調。");
    setText(slide, "Text 12", "三、內容判準");
    setText(slide, "Text 13", "制度優先：不以個人政績取代議會功能。\n真實優先：議案、數字、人物均經議會核定。\n可理解優先：法律語言轉成生活情境，五語共享同一畫面邏輯。");
    addNotes(slide, "溝通工作：評選委員應看見一套可執行、可核對、可延伸為五語版本的完整敘事方案。", [SOURCE_DECK, LAW_POWERS]);
  }

  // 3. Audience
  {
    const slide = presentation.slides.getItem(2);
    chrome(slide, 3, "影片企劃｜觀眾與情境", "同一支影片，服務三種觀眾與四種播放情境");
    setText(slide, "Text 6", "◆ 觀眾設計｜先用生活共感降低理解門檻，再用制度與真實現場建立信任，最後以第5屆與國際交流形成記憶點。");
    setText(slide, "Text 7", "一、主要觀眾");
    setText(slide, "Text 8", "市民與學生是公民教育核心；國內訪賓需要快速理解議會運作；國際訪賓則需要少縮寫、強脈絡、可跨文化理解的制度敘事。");
    setText(slide, "Text 9", "二、看完應帶走什麼");
    setTable(slide.tables.items[0], [
      ["觀眾", "理解重點", "呈現方式"],
      ["市民／學生", "議會與生活的關係", "情境問題＋公民教育圖解"],
      ["國內訪賓", "會史、職權與第5屆", "時間軸＋真實議事現場"],
      ["國際訪賓", "地方民主如何運作", "五語旁白＋少術語的制度解說"]
    ]);
    setText(slide, "Text 10", "三、播放情境與節奏");
    setText(slide, "Text 11", "簡報室 LED 完整播映／會史館導覽前導／國內外訪賓接待／官網與社群延伸。前 40 秒須能獨立吸引注意；每 60–90 秒至少一次場景或資訊形式轉換。");
    addNotes(slide, "觀眾分類不使用精確人數；實際參訪族群由議會提供近年資料後再校準。", [SOURCE_DECK]);
  }

  // 4. Master timeline
  {
    const slide = presentation.slides.getItem(3);
    chrome(slide, 4, "影片企劃｜11:30 時間軸", "五幕敘事把制度資訊轉成一條能跟隨的路");
    setText(slide, "Text 6", "◆ 節奏原則｜前 3 分鐘建立『為什麼』，中段 5 分鐘說清楚『怎麼運作』，最後 3 分半形成第5屆、國際與未來記憶。");
    setText(slide, "Text 7", "一、五幕敘事與時間配置");
    setTable(slide.tables.items[0], [
      ["幕", "時間", "內容", "觀眾問題"],
      ["一", "00:00–01:35", "城市日常＋議會沿革", "為什麼需要議會？"],
      ["二", "01:35–03:20", "議會職權＋市民聲音", "議會做什麼？"],
      ["三", "03:20–05:35", "成案研議＋委員會審查", "問題如何進入制度？"],
      ["四", "05:35–08:05", "質詢監督＋預算議決", "如何檢驗與負責？"],
      ["五", "08:05–11:30", "透明教育＋第5屆＋國際＋收束", "民主如何延續？"]
    ]);
    setText(slide, "Text 8", "二、情緒與資訊密度曲線");
    setTable(slide.tables.items[1], [
      ["敘事元素", "開場", "沿革", "職權", "審議", "第5屆", "收束"],
      ["市民問題", "●", "", "●", "●", "●", "●"],
      ["會史資料", "", "●", "", "", "", ""],
      ["議事現場", "", "", "●", "●", "●", ""],
      ["人物訪談", "", "●", "●", "●", "●", ""],
      ["動態圖解", "●", "●", "●", "●", "●", "●"],
      ["音樂情緒", "建立", "沉穩", "清晰", "張力", "提升", "回收"],
      ["資訊密度", "低", "中", "中", "高", "中", "低"]
    ]);
    setText(slide, "Text 9", "註：總長 11:30；實際剪輯可於 10:45–11:45 內調整，但各幕功能與第5屆就職典禮段落不可省略。");
    addNotes(slide, "時間碼為第一版腳本基準；腳本核定後進行文字計時與 scratch voice 測試。", [SOURCE_DECK]);
  }

  // 5. Visual grammar
  {
    const slide = presentation.slides.getItem(4);
    chrome(slide, 5, "影片企劃｜拍攝語言", "4K 取材建立耐用素材，2K 以上交付確保大屏品質");
    setText(slide, "Text 6", "◆ 技術主張｜主攝影 4K、10-bit、4:2:2；主敘事 29.97p，動態與慢動作 59.94p，並依 LED 掃描與現場燈源完成防閃測試。");
    setText(slide, "Text 7", "一、攝影機與鏡頭");
    setText(slide, "Text 8", "主拍雙機、議事與典禮三至四機；24mm 建立空間、35/50mm 敘事、85mm 捕捉表情。訪談雙機保持 10–15° 視差，不越軸。");
    setText(slide, "Text 9", "二、光線與色彩");
    setText(slide, "Text 10", "自然、可信、具公共機關質感；人物以柔光＋輪廓光，空間保留環境層次。調色採中性膚色、深藍與暖金點題，不套政黨色。");
    setText(slide, "Text 11", "三、運鏡與節奏");
    setText(slide, "Text 12", "生活段落可穩定跟拍；議事段落以固定機位、緩推與完整反應鏡頭為主。避免過度滑軌、快速變焦與宣傳片式英雄仰角。");
    setText(slide, "Text 13", "四、收音與音樂");
    setText(slide, "Text 14", "48kHz／24-bit；訪談領夾＋指向麥雙備援，議場接 clean feed 並錄 room tone。音樂須取得完整授權，重要發言時主動降音樂。");
    setText(slide, "Text 15", "五、後製與輸出");
    setText(slide, "Text 16", "4K 母帶＋2K 以上主交付；另依 LED 原生解析度與處理器測試輸出播放檔。\n動態圖像使用時間軸、地圖、流程線與關鍵詞，不用大量圖示卡片。\n字幕維持安全邊界；五語分軌、可替換；保留無字幕 clean master。\n交付前於簡報室完成亮度、色彩、字幕可讀性、音量與一鍵播放測試。");
    addNotes(slide, "29.97/59.94p 為臺灣 60Hz 環境下的建議基準；最終依攝影機、LED 與室內燈具現場 flicker test 確認。", [SOURCE_DECK]);
  }

  scenes.forEach((scene, idx) => setScene(presentation.slides.getItem(idx + 5), idx + 6, scene));

  // 18. Interview and B-roll
  {
    const slide = presentation.slides.getItem(17);
    chrome(slide, 18, "拍攝執行｜訪談與補拍", "訪談提供觀點，B-roll 負責證明與轉場");
    setText(slide, "Text 6", "◆ 受訪原則｜每人只回答一個敘事任務；先取得完整句，再剪成 8–15 秒可用片段。名單由議會核定並兼顧黨團、性別、選區與角色多元。");
    setText(slide, "Text 7", "一、訪談設計");
    setText(slide, "Text 8", "訪談不重複旁白，而是補上『為什麼重要』與『現場如何做』。問題避免引導政績與未核定承諾；每位受訪者拍 20 秒靜默、自然工作與視線備援鏡頭。");
    setText(slide, "Text 9", "【建議每人錄製 15–25 分鐘；正式成片合計使用 60–90 秒，避免影片被訪談切碎。】");
    setText(slide, "Text 10", "二、角色、提問與拍攝方式");
    setTable(slide.tables.items[0], [
      ["受訪角色", "內容任務", "建議提問", "拍攝方式"],
      ["議長／議會代表", "議會定位", "議會與市民最重要的關係？", "議場雙機／正面穩重"],
      ["第5屆議員 2–3 位", "多元代表", "如何把選區聲音帶進議會？", "服務／議事場域交叉"],
      ["審查會角色", "審議方法", "審查時最重視哪些證據？", "文件前景＋肩後鏡"],
      ["議事／行政人員", "幕後運作", "如何確保程序與資料正確？", "工作現場觀察式"],
      ["市民／參訪者", "生活連結", "什麼讓你更理解議會？", "自然光／短句"],
      ["教師／學生", "公民教育", "看完最想再問什麼？", "會史館／群體互動"],
      ["外賓／多語代表", "國際理解", "地方議會交流的共同價值？", "簡報室／雙語收音"]
    ]);
    setText(slide, "Text 11", "三、必要 B-roll 清單");
    setText(slide, "Text 12", "建築晨昏、議場空鏡、會議進行、審查文件、服務與會勘、會史館展板、LED 播映、VOD 操作、外賓導覽、城市生活、就職典禮全流程。每一場景至少取得全／中／近／細節／反應五類鏡頭。");
    addNotes(slide, "受訪名單與問題須於拍攝前送議會核定；訪談同意書包含肖像、聲音、五語版本、公開播映與長期保存範圍。", [SOURCE_DECK]);
  }

  // 19. Languages and deliverables
  {
    const slide = presentation.slides.getItem(18);
    chrome(slide, 19, "後期製作｜五語與交付", "先鎖定中文，再讓五種語言共享同一套畫面證據");
    setText(slide, "Text 6", "◆ 版本策略｜五語共用畫面與時間碼；旁白、字幕、片頭尾及術語表分軌，日後更新不必重剪。");
    setText(slide, "Text 7", "一、五語製作流程");
    setText(slide, "Text 8", "中文旁白核定→建立專名／職稱／法規術語表→翻譯→母語審校→配音試讀→字幕與音軌→內部雙人檢核→議會確認。台語另由專業顧問審訂語體與讀音。");
    setText(slide, "Text 9", "二、三道版本閘門");
    setTable(slide.tables.items[0], [
      ["階段", "核對重點", "通過條件"],
      ["文字鎖定", "人名、職銜、議案、法規、年代", "議會書面核定"],
      ["語音鎖定", "讀音、語速、專名、句長", "母語審校＋試聽"],
      ["播放鎖定", "字幕、響度、色彩、LED 相容", "現場測試＋檢核表"]
    ]);
    setText(slide, "Text 10", "三、交付與可維護性");
    setText(slide, "Text 11", "交付 4K／2K 以上母帶、五語播放檔、無字幕 clean master、字幕檔、分軌音訊、配樂授權、工程檔與素材索引。影片中的第5屆人名與職銜採可替換圖層，保固期間更新不破壞主剪輯。");
    addNotes(slide, "實際檔案格式、編碼、響度與 LED 原生輸出解析度於設備整合測試後定稿。", [SOURCE_DECK]);
  }

  // 20. Risks and QA
  {
    const slide = presentation.slides.getItem(19);
    chrome(slide, 20, "製作管理｜風險與品管", "四個高風險點，都在拍攝前設好備援與核定閘門");
    setTable(slide.tables.items[0], [
      ["風險", "觸發情境", "因應與驗收證據"],
      ["就職典禮缺漏", "一次性事件、機位或收音失效", "四機＋雙卡＋獨立錄音；彩排、即時監看、當日雙備份"],
      ["事實或名單變動", "第5屆資料未定／職銜更新", "使用可替換圖層；以議會核定表作唯一資料來源"],
      ["五語語意不一致", "翻譯過長、專名不同、重錄", "中文先鎖；術語表、母語審校、配音前試讀"],
      ["LED 播放異常", "閃爍、字幕太小、色偏、音量不一", "現場樣片測試；輸出專用播放檔與備援檔" ]
    ]);
    setText(slide, "Text 5", "品質閘門與 120 日內建議節點");
    setText(slide, "Text 6", "D1–15 需求／中文大綱核定；D16–45 勘景、史料與先拍；D46–75 主拍及就職典禮；D76–100 剪輯、動態圖像與五語；D101–120 LED 測試、修正與驗收。每一閘門執行『內容正確→影像聲音→語言字幕→播放相容』四層檢核，留存核定紀錄、素材清單、授權與測試報告。");
    addNotes(slide, "時程須與議會實際決標日、就職典禮日期、審稿週期及 LED 安裝測試窗口整合後更新。", [SOURCE_DECK]);
  }

  for (let i = 0; i < presentation.slides.items.length; i += 1) {
    const slide = presentation.slides.getItem(i);
    const stem = `slide-${String(i + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1.5 });
    await fs.writeFile(`${RENDER_DIR}/${stem}.png`, new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${LAYOUT_DIR}/${stem}.layout.json`, await layout.text());
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(`${RENDER_DIR}/montage.webp`, new Uint8Array(await montage.arrayBuffer()));

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUT);
  console.log(JSON.stringify({ output: OUT, slides: presentation.slides.items.length, renderDir: RENDER_DIR }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
