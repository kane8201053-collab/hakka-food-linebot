from urllib.parse import urlencode


TAIPEI_DISTRICTS = [
    "中正區",
    "大同區",
    "中山區",
    "松山區",
    "大安區",
    "萬華區",
    "信義區",
    "士林區",
    "北投區",
    "內湖區",
    "南港區",
    "文山區"
]

DISTRICT_ALIASES = {
    district.removesuffix("區"): district
    for district in TAIPEI_DISTRICTS
}

RESTAURANTS = [
    {
        "name": "苗栗客家菜館",
        "district": "北投區",
        "category": "客家料理",
        "description":"榮獲北市客家料理冠軍！苗栗客家老闆親自掌廚，最正宗下飯美味，職人嚴選道地功夫菜，一口驚艷絕不能錯過",
        "recommended_dishes": ["客家小炒", "薑絲大腸", "白斬雞", "糖醋鮮魚"],
        "features": ["適合家庭聚餐", "多人聚餐", "道地苗栗客家傳統風味", "平價實惠家常料理"],
        "address": "臺北市北投區中和里中和街457-8號",
        "business_hours":"11:00至14:00、17:00至21:00 每週二休",
        "phone":"02-28944082",
        "discount": "目前尚未提供",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "我家客家菜 傳承茶蝦飯",
        "district": "北投區",
        "category": "客家料理 / 創意合菜 / 海鮮料理",
        "description":"茶蝦飯香氣濃郁，飛魚卵爆漿口感超震撼！北投必吃頂級功夫客家菜，冷壓苦茶油炒靈魂茶蝦飯！肥美大蝦搭飛魚卵，粒粒分明超驚豔",
        "recommended_dishes": ["茶蝦飯加飛魚卵"],
        "features": ["客家特色料理", "特色米食", "榮獲多項客家美食料理競賽肯定與電視媒體報導", "北投在地知名老字號私房名店，聚餐人氣極高"],
        "address": "臺北市北投區中央南路二段14-1號1樓",
        "business_hours":"週二至週六 11:00至14:30、17:00至21:00 週日11:00至15:00",
        "phone":"02-2895-2219",
        "discount": "目前尚未提供",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "關西客家仙草",
        "district": "中正區",
        "category": "甜點 / 客家甜品",
        "description":"新竹關西「仙草公」二代匠心傳承，純天然客家風味，隱身東門市場，藏不住的客家在地古早味！",
        "recommended_dishes": ["客家仙草"],
        "features": ["下午茶", "消暑", "關西仙草慢熬草香回甘"],
        "address": "臺北市中正區臨沂街75巷11號",
        "business_hours":"07:00至13:00 每週一休市，週二至週日營業",
        "phone":"暫無資料",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "富富の正",
        "district": "中正區",
        "category": "客家甜點 / 傳統米食",
        "description":"每日現做客家手作粿點，豐富品項傳統留香，東門市場必排古法米食，在地最佳伴手禮",
        "recommended_dishes": ["草仔粿"],
        "features": ["現作不隔夜｜內餡飽滿｜東門傳統粿｜可素食｜可預訂"],
        "address": "臺北市中正區金山南路一段110巷2號 東門市場52攤",
        "business_hours":"07:00至13:00 每週一休市，週二至週日營業",
        "phone":"0986638586",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "劉師傅客家粄條",
        "district": "中正區",
        "category": "客家料理",
        "description":"發源竹北客家庄，百元品嚐經典古早味麵飯 Q彈粄條佐香濃肉醬搭配入味腿庫與鮮餛飩百元有找",
        "recommended_dishes": ["客家肉醬乾粄條"],
        "features": ["客家粄條｜可換意麵｜套餐有湯｜二二八公園午餐"],
        "address": "臺北市中正區黎明里襄陽路33號",
        "business_hours":"週一至週五 10:30至19:30 週六、日休",
        "phone":"0223115137",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "甘家伙房",
        "district": "中正區",
        "category": "客家料理/合菜料理",
        "description":"苗栗道地客家味，減油減鹽健康美味上桌，客家湯圓與小炒雙冠名廚甘瑞琴親自掌廚",
        "recommended_dishes": ["客家鹹湯圓", "客家小炒"],
        "features": ["獅潭客家伙房｜白斬玉米雞｜可套餐可桌菜｜家常下飯"],
        "address": "臺北市中正區林興里汀州路三段2號",
        "business_hours":"週二至週日 11:30至13:30、17:00至19:00 週一休",
        "phone":"02-23676680",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "六堆伙房",
        "district": "中正區",
        "category": "客家料理",
        "description":"台北創新時尚客家麵食翻玩經典、平價精緻百元高CP值、明亮空間完美融匯客家新舊風味",
        "recommended_dishes": ["鹹蛋絲瓜麵線", "黑糖牛汶水"],
        "features": ["六堆客家、少油少鹽、高CP值"],
        "address": "臺北市中正區黎明里忠孝西路一段36號B1",
        "business_hours":"11:30至22:00",
        "phone":"02-25636239",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "龍傳客家放山雞莊",
        "district": "大同區",
        "category": "客家料理",
        "description":"穀物飼育放山閹雞、金黃Q彈、肉質緊實、皮凍油亮、扎實有嚼勁的經典白斬雞",
        "recommended_dishes": ["招牌白斬放山雞"],
        "features": ["放山閹雞｜白斬切盤｜竹筍雞湯｜客家鹹湯圓｜寧夏夜市旁"],
        "address": "臺北市大同區星明里寧夏路50號1樓",
        "business_hours":"12:00至15:00",
        "phone":"02-25566022",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "雙連良鹹湯圓",
        "district": "大同區",
        "category": "客家料理|客家點心",
        "description":"傳承五十年純米鹹湯圓，靈魂油蔥古早味，爆汁鮮肉佐鎔鑄靈魂油蔥湯，滿口古早懷念味",
        "recommended_dishes": ["古早味鹹湯圓"],
        "features": ["雙連市場｜三代鮮肉湯圓｜清湯油蔥｜傍晚才開"],
        "address": "臺北市大同區民生西路198-83號",
        "business_hours":"週二至週六 16:30至21:30、週日 16:30至21:00 每週一公休",
        "phone":"02-25562213",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "駱師傅醬味川客菜館",
        "district": "大同區",
        "category": "客家料理|川菜料理",
        "description":"駱師傅坐鎮！麻辣融合醬香，芋頭米粉濃郁綿密，川客獨門醬香搭配有料芋頭米粉，令人欲罷不能",
        "recommended_dishes": ["花枝丸芋頭米粉鍋", "回鍋肉"],
        "features": ["圓山站步行可到，川客雙味｜酸湯魚｜口水雞｜梅干扣肉｜圓山合菜"],
        "address": "臺北市大同區至聖里民族西路31巷36號",
        "business_hours":"11:00至14:00、17:00至21:00",
        "phone":"02-25916228",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "大烹小饌",
        "district": "大同區",
        "category": "客家料理",
        "description":"大料細饌用心烹、客家封肉晶瑩剔透、肥而不膩、考究銀獎功夫菜、封肉皮Q肉嫩、饕客必吃",
        "recommended_dishes": ["精緻客家小炒", "私房封肉"],
        "features": ["大武山客台菜｜麻油燒酒雞｜熱炒合菜｜平實老饕"],
        "address": "臺北市大同區光能里民生西路146-1號",
        "business_hours":"11:00至14:00、17:00至23:30",
        "phone":"02-27560882",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "思茶 Missing Tea",
        "district": "中山區",
        "category": "手搖飲",
        "description":"首創客家擂茶融合雙口感加料、手搖飲新概念、Q彈有料穀香濃、深夜療癒系飲品首選",
        "recommended_dishes": ["北埔珍珠擂擂鮮奶", "珍溜醇厚紅茶拿鐵"],
        "features": ["客語食茶｜北埔擂茶｜珍溜雙料｜平價現泡"],
        "address": "臺北市中山區錦州街358號",
        "business_hours":"週一至週六 10:30至13:00 每週日公休",
        "phone":"02-25170050",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "楗康盒子",
        "district": "中山區",
        "category": "客家飲食零售",
        "description":"客家飲食美學時尚轉化，健康純粹伴手禮，摩登包裝蘊含阿婆古早味，質感送禮體面首選",
        "recommended_dishes": ["細末擂茶"],
        "features": ["低溫堅果｜綜合果乾｜十里目茶包｜年節禮盒"],
        "address": "臺北市中山區忠孝西路一段66號 B2",
        "business_hours":"週日至週四 11:00至21:30、週五至週六 11:00至22:00",
        "phone":"0989766824",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "客蒸湘",
        "district": "中山區",
        "category": "客家料理",
        "description":"湘客融合！湖南瀏陽蒸菜佐客家手路風味，以蒸為本、新鮮現做，清爽少油保留食材原味!",
        "recommended_dishes": ["梅菜蒸紅燒肉", "肉餅蒸雞蛋"],
        "features": ["瀏陽小碗蒸菜｜客家湘味｜少油小份｜一人也能拼桌"],
        "address": "臺北市中山區聚盛里民生東路一段41號1樓",
        "business_hours":"週二至週日 11:00至14:00、17:00至20:00 週一休",
        "phone":"02-25373780",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "迎客松小吃店",
        "district": "中山區",
        "category": "客家料理",
        "description":"大份量高CP值、經濟實惠台菜與客家古早味、平價大碗庶民食堂、鹹豬肉油香下飯、CP值爆表",
        "recommended_dishes": ["客家鹹豬肉", "客家燜筍"],
        "features": ["行天宮眷村味｜膠質大骨湯｜雙醬麵｜肉燥配酸豆"],
        "address": "臺北市中山區行政里農安街166巷1號1樓",
        "business_hours":"週一至週六 11:30至20:00",
        "phone":"02-25151496",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "大風草客家便當專賣",
        "district": "中山區",
        "category": "客家便當",
        "description":"主打客家精緻便當，百元享用經典主菜，上班族午餐救星！入味主菜佐豐富配菜超人氣",
        "recommended_dishes": ["客家鹹豬肉便當", "紅糟排骨便當"],
        "features": ["客家便當｜紅糟紅麴｜少油清爽｜南京復興外帶"],
        "address": "臺北市中山區復華里南京東路三段89巷5-2號",
        "business_hours":"週一至週五 11:30至13:20",
        "phone":"02-25162963",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "京園坊",
        "district": "中山區",
        "category": "客家料理",
        "description":"現代湘客融合私房菜，顛覆重油重鹹傳統印象，融合現代與傳統功夫，顛覆重油鹹印象的極致湘客私房宴",
        "recommended_dishes": ["芋泥鴨", "桔醬排骨"],
        "features": ["合江街客家桌菜、包廂可唱、1995私房"],
        "address": "臺北市中山區江山里合江街69-4號",
        "business_hours":"11:30至14:30、17:30至21:30",
        "phone":"02-25099066",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "你家我家客家菜",
        "district": "中山區",
        "category": "客家料理",
        "description":"多年老字號堅持苗栗正宗老味，硬核酸鹹極致道地，老台北人激推正宗客家味，薑絲大腸酸香生津超過癮",
        "recommended_dishes": ["薑絲大腸", "客家小炒"],
        "features": ["吉林路老客菜｜小炒扣肉｜鹽焗雞｜近五十年"],
        "address": "臺北市中山區中庄里吉林路135號",
        "business_hours":"週二至週日 11:30至14:00、17:30至21:00",
        "phone":"02-25611869",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "金喝呷",
        "district": "中山區",
        "category": "客家料理",
        "description":"傳統客家庄濃厚人情味，完美融入熱氣騰騰台式熱炒，道地鑊氣完美結合客家經典，是極度道地且適合好友齊聚的熱炒首選",
        "recommended_dishes": ["薑絲大腸", "蒜苗鹹豬肉"],
        "features": ["長春路熱炒｜芥蘭牛肉｜包廂宵夜｜百道快炒"],
        "address": "臺北市中山區中原里長春路119-9號",
        "business_hours":"17:00至01:00",
        "phone":"02-25623622",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "凱紅小吃店",
        "district": "中山區",
        "category": "客家料理",
        "description":"傳承客家醬醃智慧，招牌醬料完美入菜，打造獨一無二摩登台味，經典鵝肉交織靈魂干貝醬，台北必訪微醺台味餐酒館",
        "recommended_dishes": ["凱紅干貝醬", "韭菜鵝腸", "醬鳳梨吳郭／午仔魚"],
        "features": ["中原街鵝肉｜夜間小吃｜現切配小菜"],
        "address": "臺北市中山區中原街141號",
        "business_hours":"週二至週六 17:00至22:00 週日、週一公休",
        "phone":"02-25864746",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "千采複合式客家菜",
        "district": "中山區",
        "category": "客家料理",
        "description":"結合客家與多元家常菜，老少咸宜、出菜極快，餐點豐富滿足全家大小，家庭聚餐絕佳首選",
        "recommended_dishes": ["梅干扣肉刈包", "薑絲大腸"],
        "features": ["雙連巷內客家｜鹽焗雞｜螺肉蒜湯｜複合合菜"],
        "address": "臺北市中山區民安里中山北路二段72巷11號",
        "business_hours":"週二至週日 11:00至14:00、17:00至21:00",
        "phone":"02-25672687",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "廚房客家美食餐廳",
        "district": "松山區",
        "category": "客家料理",
        "description":"專注傳統客家大菜，嚴選食材、扣肉燉煮至入口即化，深厚燜燉功夫傳承經典老味道，軟嫩入味、香氣濃郁，連長輩吃過都讚不絕口",
        "recommended_dishes": ["客家鹽焗雞", "梅干扣肉夾刈包"],
        "features": ["雙連巷內客家｜鹽焗雞｜螺肉蒜湯｜複合合菜"],
        "address": "臺北市松山區中正里敦化北路120巷20號",
        "business_hours":"週一至週日 11:00至14:00、17:00至21:00",
        "phone":"02-25465186",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },    
    {
        "name": "福客粥",
        "district": "松山區",
        "category": "客家料理|客家熱炒",
        "description":"主打綿密順口廣東粥，巧妙融入客家鹹豬肉，提供溫暖庶民美味，粥底濃郁綿密，搭配鹹香客家小菜堪稱絕配",
        "recommended_dishes": ["招牌皮蛋瘦肉粥", "客家鹹豬肉小菜"],
        "features": ["八德路砂鍋粥｜老菜脯雞｜小農小菜｜大烹手路"],
        "address": "臺北市松山區吉祥里八德路四段227號",
        "business_hours":"週二至週日 11:00至14:00、17:00至22:00",
        "phone":"02-27476261",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },     
    {
        "name": "鍾記通化魷魚羹",
        "district": "大安區",
        "category": "客家小吃",
        "description":"美濃客家職人手藝！柴魚羹湯搭配爽脆爆汁鮮魷，獨門鮮辣過癮",
        "recommended_dishes": ["魷魚羹"],
        "features": ["臨江夜市魷魚羹｜手工羹｜自製辣椒｜通化老攤"],
        "address": "臺北市大安區通化里臨江街87之12號",
        "business_hours":"16:00至00:00",
        "phone":"0937916426",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },      
    {
        "name": "小辣椒魷魚羹",
        "district": "大安區",
        "category": "客家小吃",
        "description":"客家職人獨門濃郁羹湯，嚴選鮮魷彈牙鮮甜，道地古早味，脆口生魷魚份量大方！搭靈魂辣醬與黑白切超滿足",
        "recommended_dishes": ["綜合魷魚羹"],
        "features": ["生魷粒魷羹｜大碗乾麵｜美濃粄條｜科技大樓小吃"],
        "address": "臺北市大安區群賢里和平東路二段267之1號",
        "business_hours":"週一至週六 10:30至20:00 週日公休",
        "phone":"02-27848586",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },       
    {
        "name": "新屋客家麵",
        "district": "大安區",
        "category": "客家小吃",
        "description":"傳承家鄉溫暖風味！客家油蔥結合香濃肉燥，交織誘人搭配無腥味黑白切，極致古早味！",
        "recommended_dishes": ["客家麵（乾/湯）", "客家米苔目（乾）"],
        "features": ["潮州街客家麵｜粄條米苔目｜新屋手路｜肝𦟪湯"],
        "address": "臺北市大安區錦泰里潮州街9-2號",
        "business_hours":"週二至週五 11:00至14:00、17:00至19:30 | 週六至週日 11:30至14:00、17:00至19:30 週一休",
        "phone":"02-23512131",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },  
    {
        "name": "八仙炭烤",
        "district": "大安區",
        "category": "客家料理｜客家熱炒",
        "description":"高空露天景觀！坐擁公園第一排夜景，三十年老字號客家小炒一絕，平價熱炒配炭烤！台北下班深夜聚會首選，道地客家小炒超美味",
        "recommended_dishes": ["客家小炒", "炭烤臭豆腐"],
        "features": ["森林公園熱炒｜炭烤臭豆腐｜海瓜子｜開到深夜"],
        "address": "臺北市大安區福住里新生南路二段28號",
        "business_hours":"17:00至01:00|週日 16:30至01:00",
        "phone":"02-23214507",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },    
    {
        "name": "胡鍋｜大烹小饌",
        "district": "大安區",
        "category": "客家料理｜客家火鍋",
        "description":"客家女婿匠心傳承！客家小炒入火鍋，打造驚艷酒食聚落，客家小炒爆炒入鍋，綻放鑊氣融入湯頭，交織絕妙舌尖相遇",
        "recommended_dishes": ["石頭火鍋肉片（豬/牛）"],
        "features": ["胡家燒酒雞｜黑米酒砂鍋｜先喝湯再涮｜大烹鍋線"],
        "address": "臺北市大安區忠孝東路三段251巷7弄13號",
        "business_hours":"週一至週日 17:00至23:00",
        "phone":"暫無提供",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "家家客家菜",
        "district": "大安區",
        "category": "客家料理",
        "description":"樸實客家小館！親切老闆娘與金黃油亮梅干扣肉，濃郁回味，人情味溫馨小館！肥美不膩梅干扣肉，滿滿媽媽溫暖味",
        "recommended_dishes": ["梅干扣肉", "九層塔炒蛋"],
        "features": ["永康客家菜｜滷元蹄｜梅乾扣肉｜東門巷弄"],
        "address": "臺北市大安區永康里永康街2巷10號",
        "business_hours":"週三至週一 11:00至14:00、17:00至21:00",
        "phone":"02-23933130",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "鳥以花香",
        "district": "大安區",
        "category": "客家料理",
        "description":"樸主打精緻新派客家菜與創意中式料理，現代美感擺盤驚艷味蕾，環境清幽雅致，融合傳統與現代創意，帶來視覺與味覺雙重享受",
        "recommended_dishes": ["創意客家小炒", "私房麻辣鍋"],
        "features": ["延吉街合菜｜金牌脆皮雞｜香蘋蝦鬆｜常客滿要訂位"],
        "address": "臺北市大安區光信里延吉街233巷3號1樓",
        "business_hours":"11:30至14:30、17:30至21:30",
        "phone":"02-23250990",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "闔家小館",
        "district": "大安區",
        "category": "客家料理",
        "description":"主打「家」的溫馨感！提供少油少鹽無味精健康台菜與客家小合菜，鹹香下飯的精緻家常菜，一口驚艷！給您如回家吃飯的滿滿安心",
        "recommended_dishes": ["豆乾肉絲", "客家小炒"],
        "features": ["仁愛圓環巷弄的台客家常菜、信義安和步行約5到8分鐘"],
        "address": "臺北市大安區仁愛路四段122巷49號1樓",
        "business_hours":"12:00至14:00、17:30至21:00 每週三公休",
        "phone":"02-23259499",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },   
    {
        "name": "富鼎餐館",
        "district": "信義區",
        "category": "客家料理｜台式熱炒",
        "description":"主廚炒功一流！將傳統客家菜完美改良，鑊氣十足超下飯，巷弄實力派私房菜！鑊氣十足、酸香夠勁的薑絲大腸必點",
        "recommended_dishes": ["薑絲炒大腸", "蒜苗五花肉"],
        "features": ["忠孝熱炒｜金沙杏鮑菇｜三杯雞｜開到午夜"],
        "address": "臺北市信義區永春里忠孝東路五段783號1樓",
        "business_hours":"17:00至00:00",
        "phone":"02-87858788",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },                           
    {
        "name": "士東客家莊",
        "district": "士林區",
        "category": "客家料理｜客家小吃",
        "description":"榮獲天下第一攤金賞！必吃傳統鹹湯圓、銷魂焢肉與回甘苦瓜，天母必吃老味道",
        "recommended_dishes": ["客家鹹湯圓"],
        "features": ["士東市場|客家鹹湯圓|好吃焢肉|245攤"],
        "address": "臺北市士林區蘭雅里士東路100號2樓 245攤位",
        "business_hours":"10:30至19:00 週一休",
        "phone":"02-28328779",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },      
    {
        "name": "匯客棧",
        "district": "士林區",
        "category": "客家料理",
        "description":"熱鬧氛圍聚餐首選、大腸Q彈無腥味、酸香夠勁超級下飯、酸香夠勁、調味精準、三五好友聚會小酌絕佳的客家好棧",
        "recommended_dishes": ["薑絲大腸", "客家小炒"],
        "features": ["士林台菜｜滑蛋蝦仁｜豬肚雞湯｜福華路巷弄"],
        "address": "臺北市士林區德華里福華路141巷24號",
        "business_hours":"週二至週日 11:30至14:00、17:30至22:30",
        "phone":"02-28385093",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },     
    {
        "name": "廚房客家小館",
        "district": "內湖區",
        "category": "客家料理",
        "description":"臺北老字號客家餐館！嚴選紮實炒功，完美重現「鹹香肥」經典精髓，家庭聚餐實力派首選！道地客家功夫菜，每一道都超讚極致下飯",
        "recommended_dishes": ["經典客家小炒", "薑絲大腸"],
        "features": ["大湖公園客家餐廳｜醬油蛋｜東坡肉｜掛包"],
        "address": "臺北市內湖區秀湖里成功路四段347號",
        "business_hours":"週一至週日 11:00至14:00、17:00至21:00",
        "phone":"02-27906756",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },      
    {
        "name": "南港大排檔海鮮熱炒",
        "district": "南港區",
        "category": "客家料理｜熱炒",
        "description":"融合客家庄熱情與露天大排檔！打造最接地氣、深夜必訪的台式深夜食堂，大火鑊氣完美激發鹹香精髓！道地功夫味，連挑剔的客家老饕都讚不絕口",
        "recommended_dishes": ["客家小炒", "椒麻雞翅"],
        "features": ["南港熱炒｜重陽路｜椒麻雞翅｜塩酥排骨"],
        "address": "臺北市南港區東新里重陽路184號",
        "business_hours":"週一至週六 17:00至22:00 每週日公休",
        "phone":"02-26521501",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },         
    {
        "name": "老頭家客家菜",
        "district": "文山區",
        "category": "客家料理",
        "description":"懷舊復古風客家餐館！獨門燜鯽魚骨酥肉嫩，展現極致功夫美味，懷舊感十足的老味道！獨門燜鯽魚與經典扣肉，完美展現時間沉澱的精緻手藝",
        "recommended_dishes": ["客家燜鯽魚", "梅干扣肉"],
        "features": ["文山客家｜忠順街｜古早味｜老頭家"],
        "address": "臺北市文山區樟樹里忠順街一段159號",
        "business_hours":"11:00至14:00、17:00至21:00 每週三公休；每月最後一個週三、週四連休二日",
        "phone":"02-29360678",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },      
    {
        "name": "羹的原味",
        "district": "文山區",
        "category": "客家小吃",
        "description":"客家老闆娘好手藝！清爽柴魚湯頭搭厚實魷魚羹，一口品嚐真材實料的好滋味",
        "recommended_dishes": ["花枝羹", "魷魚羹"],
        "features": ["原味羹｜魷魚羹｜肉羹｜可加麵"],
        "address": "臺北市文山區華興里木柵路一段136號",
        "business_hours":"10:30至19:30",
        "phone":"02-22360756",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },         
    {
        "name": "京展商行",
        "district": "文山區",
        "category": "客家商品｜客家飲食",
        "description":"承襲客家道地傳統！老闆精通獨門醃漬工藝，完美鎖住令人驚艷的酸香靈魂，傳承四十年老字號！專賣道地梅干菜與陳年老菜脯，主婦私藏的南北貨寶藏名店",
        "recommended_dishes": ["客家梅干菜", "老菜脯"],
        "features": ["興隆市場｜南北貨｜苗栗菜脯｜客家醃漬"],
        "address": "臺北市文山區興隆路二段97號 興隆市場57號、58號攤位",
        "business_hours":"08:00至17:30 週一店休",
        "phone":"02-29348936",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },   
    {
        "name": "興隆小吃",
        "district": "文山區",
        "category": "客家料理｜客家小吃",
        "description":"隱身市場飄香30年排隊老字號麵攤、銅板價就能品嚐的極致美味、在地人極力推崇私房美味、翠綠爽口雪菜粄條搭新鮮黑白切、必吃道地古早味",
        "recommended_dishes": ["客家粄條", "米苔目"],
        "features": ["興隆市場80號攤位|雪菜肉絲麵｜肉燥乾麵｜嘴邊肉"],
        "address": "臺北市文山區興豐里興隆路二段 興隆市場97號、80號攤位",
        "business_hours":"週二至週日 08:00至14:30",
        "phone":"0937017244",
        "discount": "",
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    }                
]


def build_google_maps_url(restaurant):
    """用店名與地址建立免 API Key 的 Google Maps 跨平台搜尋網址。"""

    query = f"{restaurant['name']}, {restaurant['address']}"
    return "https://www.google.com/maps/search/?" + urlencode(
        {"api": "1", "query": query}
    )


for _restaurant in RESTAURANTS:
    _restaurant.setdefault("google_maps_url", build_google_maps_url(_restaurant))


def get_restaurant_knowledge():
    lines = []

    for restaurant in RESTAURANTS:
        dishes = "、".join(restaurant["recommended_dishes"])
        features = "、".join(restaurant["features"])

        text = f"""
店名：{restaurant["name"]}
行政區：{restaurant["district"]}
類型：{restaurant["category"]}
餐廳介紹：{restaurant.get("description", "目前尚未提供")}
推薦餐點：{dishes}
特色：{features}
地址：{restaurant["address"]}
營業時間：{restaurant.get("business_hours", "目前尚未提供")}
聯絡電話：{restaurant.get("phone", "目前尚未提供")}
優惠：{restaurant.get("discount") or "目前尚未提供"}
Google Maps：{restaurant["google_maps_url"]}
備註：{restaurant.get("notes", "")}
"""
        lines.append(text.strip())

    return "\n\n".join(lines)

def find_restaurants_by_district(district):
    results = []

    for restaurant in RESTAURANTS:
        if restaurant["district"] == district:
            results.append(restaurant)

    return results

def detect_district(text):
    for district in TAIPEI_DISTRICTS:
        if district in text:
            return district

    for alias, district in DISTRICT_ALIASES.items():
        if alias in text:
            return district

    return None
