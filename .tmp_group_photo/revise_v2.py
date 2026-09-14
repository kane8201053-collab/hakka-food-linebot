from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from pathlib import Path
import posixpath as P
base=Path('/Users/zhangzixuan/Desktop/hakka-food-linebot')
src=base/'output/group-photo/三大啟動儀式總規劃YEH0912_新增大合照規劃.pptx'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
with ZipFile(src) as z:
 data={n:z.read(n) for n in z.namelist()}
 slide=E.fromstring(data['ppt/slides/slide36.xml'])
 rid=slide.find('.//a:blip',ns).get('{'+ns['r']+'}embed')
 rels=E.fromstring(data['ppt/slides/_rels/slide36.xml.rels'])
 target=next(x.get('Target') for x in rels if x.get('Id')==rid)
 part=P.normpath(P.join('ppt/slides',target)).lstrip('/')
 data[part]=(base/'output/group-photo/大合照正面場景示意_v2.png').read_bytes()
 with ZipFile(base/'.tmp_group_photo/revised_v2.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 print('Replaced only slide 36 image:',part)
s=(base/'.tmp_group_photo/finalize.mjs').read_text().replace('/merged.pptx','/revised_v2.pptx').replace('新增大合照規劃.pptx','新增大合照規劃_v2.pptx').replace('/validation.json','/validation_v2.json')
(base/'.tmp_group_photo/finalize_v2.mjs').write_text(s)
