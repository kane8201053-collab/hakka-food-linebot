import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "/Users/zhangzixuan/Desktop/hakka-food-linebot/tmp/storyboard-images-0903/source.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
const slide = presentation.slides.getItem(2);
const visual = slide.shapes.items.find((item) => item.name === "visual-6");
const image = slide.images.items[0];

function methods(value) {
  const out = new Set();
  let cursor = value;
  while (cursor && cursor !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(cursor)) out.add(key);
    cursor = Object.getPrototypeOf(cursor);
  }
  return [...out].sort();
}

console.log(JSON.stringify({
  slideMethods: methods(slide),
  shapeCollectionMethods: methods(slide.shapes),
  imageCollectionMethods: methods(slide.images),
  visualMethods: methods(visual),
  imageMethods: methods(image),
}, null, 2));
