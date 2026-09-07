import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const root = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/fix-final-deck-20260903";
const deck = await PresentationFile.importPptx(await FileBlob.load(path.join(root, "source.pptx")));
const chunks = [];
for (let i = 1; i <= 18; i += 1) {
  const n = String(i).padStart(2, "0");
  const layout = JSON.parse(await fs.readFile(path.join(root, "template-inspect", "layouts", `source-slide-${n}.layout.json`), "utf8"));
  const result = await deck.inspect({
    target: { id: layout.slide.aid },
    kind: "slide,textbox,shape,image,table,chart,notes,thread",
    maxChars: 100000,
  });
  chunks.push(result.ndjson.trim());
}
await fs.writeFile(path.join(root, "template-inspect-full.ndjson"), `${chunks.filter(Boolean).join("\n")}\n`);
