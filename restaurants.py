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
        "phone":"02-28944082"
        "discount": 
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
        "phone":"02-2895-2219"
        "discount": 
        "notes": "實際營業時間、餐點供應及活動優惠依店家現場公告為準"
    },
    {
        "name": "範例甜點店C",
        "district": "信義區",
        "category": "甜點",
        "recommended_dishes": ["擂茶", "客家麻糬"],
        "features": ["下午茶", "適合拍照"],
        "address": "臺北市信義區範例路3號",
        "discount": "活動期間享指定品項優惠",
        "notes": ""
    }
]
def get_restaurant_knowledge():
    lines = []

    for restaurant in RESTAURANTS:
        dishes = "、".join(restaurant["recommended_dishes"])
        features = "、".join(restaurant["features"])

        text = f"""
店名：{restaurant["name"]}
行政區：{restaurant["district"]}
類型：{restaurant["category"]}
餐廳介紹：{restaurant["description"]}
推薦餐點：{dishes}
特色：{features}
地址：{restaurant["address"]}
營業時間：{restaurant["business_hours"]}
聯絡電話：{restaurant["phone"]}
優惠：{restaurant["discount"]}
備註：{restaurant["notes"]}
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
        
    return None