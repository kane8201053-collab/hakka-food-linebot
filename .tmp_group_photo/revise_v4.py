from zipfile import ZipFile,ZIP_DEFLATED
from pathlib import Path
b=Path('/Users/zhangzixuan/Desktop/hakka-food-linebot')
src=b/'output/group-photo/三大啟動儀式總規劃YEH0912_新增大合照規劃_v3.pptx'
with ZipFile(src) as z:
 d={n:z.read(n) for n in z.namelist()}
d['ppt/photo_add/media/image.png']=(b/'output/group-photo/大合照正面場景示意_v4.png').read_bytes()
x=d['ppt/slides/slide38.xml'].decode()
assert '新紀元　　　義鳴紀' in x
x=x.replace('新紀元　　　義鳴紀','新紀元　　　義鳴紀　　　毛孩踩街')
d['ppt/slides/slide38.xml']=x.encode()
with ZipFile(b/'.tmp_group_photo/revised_v4.pptx','w',ZIP_DEFLATED) as z:
 for n,v in d.items():z.writestr(n,v)
s=(b/'.tmp_group_photo/finalize_v3.mjs').read_text().replace('_v3','_v4')
(b/'.tmp_group_photo/finalize_v4.mjs').write_text(s)
print('Updated scene and placard list')
