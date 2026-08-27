FAQ_DATA = {
    "活動時間": """
📅 2026 臺北客家美食節

活動日期與時間：
即日起至 2026/10/26

最新活動資訊將依官方公告為準！
""",

    "活動內容": """
🎉 2026 臺北客家美食節有什麼？

活動將以客家美食為主題，
帶大家認識更多臺北的客家好味道！

詳細活動請洽 2026 臺北客家美食地圖官方網站。
""",

    "有什麼好吃的": """
😋 想吃客家美食嗎？

中山區有六堆伙房，他的芋頭米粉湯他媽超讚
很屌真的
""",

    "店家名單": """
🍽️ 想知道有哪些店家參加？

詳細店家名單請洽 2026 臺北客家美食地圖官方網站。

之後也可以直接問我推薦店家喔！
"""
}


FAQ_KEYWORDS = {
    "活動時間": [
        "活動時間",
        "什麼時候",
        "哪一天",
        "日期"
    ],

    "活動內容": [
        "活動內容",
        "有什麼活動",
        "活動介紹",
        "可以玩什麼",
        "介紹"
    ],

    "有什麼好吃的": [
        "好吃",
        "吃什麼",
        "中山區"
    ],

    "店家名單": [
        "店家",
        "餐廳",
        "有哪些店",
        "店家名單"
    ]
}


def find_faq_answer(user_message):
    user_message = user_message.strip().lower()

    for faq_name, keywords in FAQ_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in user_message:
                return FAQ_DATA[faq_name]

    return None