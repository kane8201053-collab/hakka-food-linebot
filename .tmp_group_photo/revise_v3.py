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
 data[part]=(base/'output/group-photo/大合照正面場景示意_v3.png').read_bytes()
 data['ppt/slides/slide35.xml']=data['ppt/slides/slide35.xml'].decode().replace('先以寬約 3 公尺規劃','寬度接近兩側最外位長官').replace('主標題高於人物頭部','底部立架約 3 公分').replace('本次尺寸更新：舞台約 50 公分；電視牆 3 公尺先按寬度解讀，現勘後定案。','本次更新：電視牆加寬並降至舞台面，底部僅留約 3 公分立架，實際尺寸現勘定案。').encode()
 with ZipFile(base/'.tmp_group_photo/revised_v3.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 print('Replaced only slide 36 image:',part)
s=(base/'.tmp_group_photo/finalize.mjs').read_text().replace('/merged.pptx','/revised_v3.pptx').replace('新增大合照規劃.pptx','新增大合照規劃_v3.pptx').replace('/validation.json','/validation_v3.json')
(base/'.tmp_group_photo/finalize_v3.mjs').write_text(s)
