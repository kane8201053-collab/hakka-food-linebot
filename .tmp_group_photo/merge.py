from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
import posixpath as P
src='/Users/zhangzixuan/Desktop/三大啟動儀式總規劃YEH0912 .pptx'
add='.tmp_group_photo/additions.pptx'
out='.tmp_group_photo/merged.pptx'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rns='http://schemas.openxmlformats.org/package/2006/relationships'; cns='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(b):return E.fromstring(b)
def enc(t):return E.tostring(t,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(src) as a,ZipFile(add) as b:
 data={n:a.read(n) for n in a.namelist()}
 mp={n:'ppt/photo_add/'+n[4:] for n in b.namelist() if n.startswith('ppt/') and n not in ['ppt/presentation.xml','ppt/_rels/presentation.xml.rels']}
 for i in range(1,5):
  mp[f'ppt/slides/slide{i}.xml']=f'ppt/slides/slide{i+34}.xml'
  mp[f'ppt/slides/_rels/slide{i}.xml.rels']=f'ppt/slides/_rels/slide{i+34}.xml.rels'
 for old,new in mp.items():
  raw=b.read(old)
  if old.endswith('.rels'):
   root=xml(raw); owner=P.join(P.dirname(P.dirname(old)),P.basename(old)[:-5])
   newowner=mp.get(owner)
   for r in root:
    if r.get('TargetMode')=='External':continue
    target=P.normpath(P.join(P.dirname(owner),r.get('Target'))).lstrip('/')
    targetnew=mp.get(target)
    if targetnew and newowner:r.set('Target',P.relpath(targetnew,P.dirname(newowner)))
   raw=enc(root)
  data[new]=raw
 ct=xml(data['[Content_Types].xml']); existing={x.get('PartName') or x.get('Extension') for x in ct}
 for el in xml(b.read('[Content_Types].xml')):
  old=el.get('PartName')
  if old and old[1:] in mp:el.set('PartName','/'+mp[old[1:]])
  elif old:continue
  key=el.get('PartName') or el.get('Extension')
  if key not in existing:ct.append(el);existing.add(key)
 data['[Content_Types].xml']=enc(ct)
 pres=xml(data['ppt/presentation.xml']); rel=xml(data['ppt/_rels/presentation.xml.rels'])
 addpres=xml(b.read('ppt/presentation.xml')); addrels={x.get('Id'):x for x in xml(b.read('ppt/_rels/presentation.xml.rels'))}
 def append_list(tag,itemtag):
  al=addpres.find('p:'+tag,ns)
  if al is None:return
  dest=pres.find('p:'+tag,ns)
  if dest is None:return
  ids=[int(x.get('id')) for x in dest if x.get('id')]
  largest=max(ids) if ids else 256
  for j,item in enumerate(al):
   rd=addrels[item.get('{'+ns['r']+'}id')];newid='rIdPhoto_'+itemtag+str(j)
   newtarget=mp[P.normpath(P.join('ppt',rd.get('Target'))).lstrip('/')]
   rr=E.SubElement(rel,'{'+rns+'}Relationship',Id=newid,Type=rd.get('Type'),Target=P.relpath(newtarget,'ppt'))
   item.set('{'+ns['r']+'}id',newid)
   if item.get('id'):item.set('id',str(largest+j+1))
   dest.append(item)
 append_list('sldIdLst','slide');append_list('sldMasterIdLst','master')
 data['ppt/presentation.xml']=enc(pres);data['ppt/_rels/presentation.xml.rels']=enc(rel)
 if 'docProps/app.xml' in data:
  app=xml(data['docProps/app.xml'])
  for e in app.iter():
   if E.QName(e).localname=='Slides':e.text='38'
  data['docProps/app.xml']=enc(app)
 with ZipFile(out,'w',ZIP_DEFLATED) as z:
  for k,v in data.items():z.writestr(k,v)
 print('Merged 34 original + 4 new slides')
 for n in a.namelist():
  if n not in ['[Content_Types].xml','ppt/presentation.xml','ppt/_rels/presentation.xml.rels','docProps/app.xml']:assert data[n]==a.read(n),n
 print('All original slide and supporting parts preserved byte-for-byte')
