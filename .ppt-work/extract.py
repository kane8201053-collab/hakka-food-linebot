from zipfile import ZipFile
from lxml import etree as E
import json,posixpath
from pathlib import Path
z=ZipFile('/Users/zhangzixuan/Desktop/115年國慶升旗典禮執行企畫書（腳本）_示意圖完成版.pptx'); ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
out=[]
for n in range(1,4):
 r=E.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
 rels={x.get('Id'):posixpath.normpath('ppt/slides/'+x.get('Target')) for x in E.fromstring(z.read(f'ppt/slides/_rels/slide{n}.xml.rels'))}
 pics=r.findall('.//p:pic',ns)
 rows=r.findall('.//a:tbl/a:tr',ns)[1:]
 for i,(row,pic) in enumerate(zip(rows,pics[2:])):
  vals=['\n'.join(''.join(p.xpath('.//a:t/text()',namespaces=ns)) for p in c.findall('.//a:p',ns)).strip() for c in row.findall('a:tc',ns)]
  img=rels[pic.find('.//a:blip',ns).get('{'+ns['r']+'}embed')]; dest=f'.ppt-work/image-{len(out)+1}'+Path(img).suffix;Path(dest).write_bytes(z.read(img))
  out.append({'values':vals,'image':dest})
 logo=rels[pics[1].find('.//a:blip',ns).get('{'+ns['r']+'}embed')];Path('.ppt-work/logo'+Path(logo).suffix).write_bytes(z.read(logo))
Path('.ppt-work/rows.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False,indent=2))
