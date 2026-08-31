import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const STARTER = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_storyboard_edit/template-starter.pptx";
const OUT = "/Users/zhangzixuan/Desktop/hakka-food-linebot/新北市議會_第5屆簡介影片_詳細腳本_A4直式_含寫實分鏡.pptx";
const ASSET_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_storyboard_edit/assets";
const RENDER_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_storyboard_edit/rendered";
const LAYOUT_DIR = "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_storyboard_edit/layout/final";

const scenes = [
  { slide: 6, file: "scene-01-city-morning.png", alt: "分鏡示意：北台灣城市清晨的通勤、校園與市場日常" },
  { slide: 7, file: "scene-02-archive.png", alt: "分鏡示意：檔案人員檢視舊議事錄與歷史照片" },
  { slide: 8, file: "scene-03-chamber.png", alt: "分鏡示意：現代地方議會議場於會前準備" },
  { slide: 9, file: "scene-04-citizen.png", alt: "分鏡示意：市民在雨後街道反映道路與排水問題" },
  { slide: 10, file: "scene-05-inspection.png", alt: "分鏡示意：公共服務人員與居民進行道路現勘" },
  { slide: 11, file: "scene-06-committee.png", alt: "分鏡示意：地方議會委員會進行專業討論" },
  { slide: 12, file: "scene-07-questioning.png", alt: "分鏡示意：議會中進行質詢與答覆" },
  { slide: 13, file: "scene-08-budget.png", alt: "分鏡示意：預算文件逐項審閱與註記" },
  { slide: 14, file: "scene-09-exhibit.png", alt: "分鏡示意：民眾參觀互動式地方自治歷史展示" },
  { slide: 15, file: "scene-10-oath.png", alt: "分鏡示意：地方議會就職宣誓典禮概念重現" },
  { slide: 16, file: "scene-11-visitors.png", alt: "分鏡示意：國際訪賓在公共機構進行導覽交流" },
  { slide: 17, file: "scene-12-evening.png", alt: "分鏡示意：北台灣城市與公共建築的藍調夜景" },
];

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(RENDER_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });

  const presentation = await PresentationFile.importPptx(await FileBlob.load(STARTER));

  for (const item of scenes) {
    const slide = presentation.slides.getItem(item.slide - 1);
    const imagePath = `${ASSET_DIR}/${item.file}`;
    slide.images.add({
      blob: await readImageBlob(imagePath),
      contentType: "image/png",
      alt: item.alt,
      prompt: "AI-generated photorealistic storyboard concept image; anonymous generic civic setting; not documentary evidence.",
      fit: "cover",
      position: { left: 187, top: 832, width: 420, height: 214 },
      geometry: "roundRect",
      borderRadius: 8,
    });

    const label = slide.shapes.add({
      geometry: "rect",
      name: `Storyboard Concept Label ${String(item.slide - 5).padStart(2, "0")}`,
      position: { left: 187, top: 810, width: 420, height: 22 },
      fill: "none",
      line: { style: "solid", fill: "none", width: 0 },
    });
    label.text = "AI 分鏡示意｜非實拍";
    label.text.style = {
      fontSize: 11.5,
      typeface: "Microsoft JhengHei",
      bold: true,
      color: "#8A701B",
      alignment: "center",
      verticalAlignment: "middle",
      autoFit: "none",
      wrap: "none",
      insets: { top: 0, right: 8, bottom: 0, left: 8 },
    };

    slide.speakerNotes.append("\n- AI-generated storyboard concept image; not documentary evidence.");
    slide.speakerNotes.setVisible(true);
  }

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(`${RENDER_DIR}/${stem}.png`, await presentation.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${LAYOUT_DIR}/${stem}.layout.json`, await layout.text(), "utf8");
  }

  await writeBlob(
    "/Users/zhangzixuan/Desktop/hakka-food-linebot/.tmp_ntpc_storyboard_edit/final-montage.webp",
    await presentation.export({ format: "webp", montage: true, scale: 1 }),
  );

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUT);
  console.log(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
