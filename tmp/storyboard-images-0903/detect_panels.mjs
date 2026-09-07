import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assetDir = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903/assets";
const expected = new Map([
  [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 5], [9, 3],
  [10, 5], [11, 5], [12, 5], [13, 5], [14, 4], [15, 4],
]);

function groupRuns(values) {
  const runs = [];
  let start = null;
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] && start === null) start = i;
    if ((!values[i] || i === values.length - 1) && start !== null) {
      const end = values[i] ? i : i - 1;
      runs.push([start, end]);
      start = null;
    }
  }
  return runs;
}

const result = {};
for (const [slide, count] of expected.entries()) {
  const file = path.join(assetDir, `slide-${String(slide).padStart(2, "0")}-storyboard.png`);
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const whiteRows = [];
  for (let y = 0; y < info.height; y += 1) {
    let nearWhite = 0;
    for (let x = 0; x < info.width; x += 1) {
      const idx = (y * info.width + x) * info.channels;
      if (data[idx] > 242 && data[idx + 1] > 242 && data[idx + 2] > 242) nearWhite += 1;
    }
    whiteRows.push(nearWhite / info.width > 0.94);
  }

  let gutterRuns = groupRuns(whiteRows)
    .filter(([a, b]) => b - a + 1 >= 2)
    .filter(([a, b]) => a > 3 && b < info.height - 4);

  if (gutterRuns.length !== count - 1) {
    gutterRuns = Array.from({ length: count - 1 }, (_, i) => {
      const y = Math.round(((i + 1) * info.height) / count);
      return [y - 1, y + 1];
    });
  }

  const bounds = [0, ...gutterRuns.map(([a, b]) => Math.round((a + b) / 2)), info.height];
  const panels = [];
  for (let i = 0; i < count; i += 1) {
    const y0 = i === 0 ? 0 : bounds[i] + 2;
    const y1 = i === count - 1 ? info.height : bounds[i + 1] - 2;
    panels.push({
      top: y0 / info.height,
      bottom: 1 - y1 / info.height,
      sourceY0: y0,
      sourceY1: y1,
    });
  }
  result[slide] = { file, width: info.width, height: info.height, panels };
}

await fs.writeFile(
  "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903/panel-crops.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
