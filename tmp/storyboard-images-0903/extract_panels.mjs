import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903";
const crops = JSON.parse(await fs.readFile(`${root}/panel-crops.json`, "utf8"));
const outputDir = `${root}/assets/panels`;
await fs.mkdir(outputDir, { recursive: true });

let total = 0;
for (const [slide, data] of Object.entries(crops)) {
  for (let index = 0; index < data.panels.length; index += 1) {
    const panel = data.panels[index];
    const output = path.join(outputDir, `slide-${String(slide).padStart(2, "0")}-panel-${String(index + 1).padStart(2, "0")}.png`);
    await sharp(data.file)
      .extract({ left: 0, top: panel.sourceY0, width: data.width, height: panel.sourceY1 - panel.sourceY0 })
      .png()
      .toFile(output);
    total += 1;
  }
}

console.log(JSON.stringify({ outputDir, total }));
