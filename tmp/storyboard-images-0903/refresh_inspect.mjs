import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903/source.pptx";
const output = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903/template-inspect/template-inspect.ndjson";
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,table,chart,notes,layout",
  include: "id,slide,name,textPreview,bbox,bboxUnit,isPlaceholder,placeholders",
  maxChars: 250000,
});
await fs.writeFile(output, snapshot.ndjson);
console.log(JSON.stringify({ output, recordCount: snapshot.recordCount, truncated: snapshot.truncated }));
