"""最新抽獎資訊。

活動內容異動時，只需要修改 ``LATEST_LOTTERY_INFO``，固定問答與 Gemini
知識庫都會一起更新。
"""


LATEST_LOTTERY_INFO = {
    "title": "扭蛋轉轉樂",
    "description": "前往美食地圖官方網站參加線上遊戲。",
    "prize": "有機會抽到合作店家美食優惠券。",
    "url": "https://lohasnet.tw/Taipei-HakkaFoodie/",
}

LOTTERY_KEYWORDS = (
    "最新抽獎資訊",
    "最新抽獎",
    "抽獎資訊",
    "抽獎活動",
    "抽獎內容",
    "怎麼抽獎",
    "如何抽獎",
    "有抽獎嗎",
    "扭蛋轉轉樂",
)


def get_latest_lottery_reply():
    """產生可以直接傳給 LINE 使用者的最新抽獎說明。"""

    return (
        "🎁 最新抽獎資訊\n\n"
        f"活動：{LATEST_LOTTERY_INFO['title']}\n"
        f"內容：{LATEST_LOTTERY_INFO['description']}\n"
        f"獎項：{LATEST_LOTTERY_INFO['prize']}\n"
        f"活動詳情：{LATEST_LOTTERY_INFO['url']}\n\n"
        "實際活動內容與優惠請以官方網站最新公告為準。"
    )


def find_lottery_answer(user_message):
    """辨識常見抽獎問法；按鈕送出的文字也走相同入口。"""

    normalized = user_message.strip().lower()
    if any(keyword.lower() in normalized for keyword in LOTTERY_KEYWORDS):
        return get_latest_lottery_reply()
    return None


def get_latest_lottery_knowledge():
    """提供給 Gemini 的抽獎資料，與固定回覆共用同一份來源。"""

    return get_latest_lottery_reply()
