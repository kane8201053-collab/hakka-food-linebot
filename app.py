from faq import find_faq_answer
from knowledge import HAKKA_FOOD_KNOWLEDGE

from restaurants import (
    RESTAURANTS,
    TAIPEI_DISTRICTS,
    get_restaurant_knowledge,
    detect_district,
    find_restaurants_by_district
)

import os

from google import genai
from dotenv import load_dotenv
from flask import Flask, request, abort

from linebot.v3 import WebhookHandler
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.webhooks import MessageEvent, TextMessageContent

from linebot.v3.messaging import (
    Configuration,
    ApiClient,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage
)

load_dotenv()

app = Flask(__name__)

# LINE 金鑰
channel_secret = os.getenv("LINE_CHANNEL_SECRET")
channel_access_token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("找不到 GEMINI_API_KEY")

if not channel_secret:
    raise ValueError("找不到 LINE_CHANNEL_SECRET")

if not channel_access_token:
    raise ValueError("找不到 LINE_CHANNEL_ACCESS_TOKEN")

gemini_client = genai.Client(api_key=gemini_api_key)
restaurant_knowledge = get_restaurant_knowledge()

handler = WebhookHandler(channel_secret)

configuration = Configuration(
    access_token=channel_access_token
)


# 首頁
@app.route("/", methods=["GET"])
def home():
    return "2026 臺北客家美食節 LINE Bot 運作中！"


# LINE Webhook
@app.route("/callback", methods=["POST"])
def callback():

    signature = request.headers.get("X-Line-Signature")

    if not signature:
        abort(400)

    body = request.get_data(as_text=True)

    try:
        handler.handle(body, signature)

    except InvalidSignatureError:
        abort(400)

    return "OK"


# 收到 LINE 文字訊息
@handler.add(MessageEvent, message=TextMessageContent)
def handle_message(event):

user_message = event.message.text
    
detected_district = detect_district(user_message)

if detected_district:
    district_restaurants = find_restaurants_by_district(detected_district)

else:
    district_restaurants = []

    print("收到訊息：", user_message)
    print("偵測行政區：", detected_district)
    print("區域店家：", district_restaurants)
    
    answer = find_faq_answer(user_message)

    if answer:
        reply_text = answer

    else:
        try:
            prompt = f"""
你是「2026 臺北客家美食節」LINE 官方客服。

以下有兩份官方資料：

====================
【活動官方知識庫】
{HAKKA_FOOD_KNOWLEDGE}
====================

【合作店家資料庫】
{restaurant_knowledge}
====================

請根據以上官方知識庫回答使用者的問題。

回答規則：
1. 使用繁體中文。
2. 語氣親切自然，適合 LINE 客服。
3. 如果使用者詢問行政區，優先推薦該行政區的合作店家。
4. 如果使用者詢問料理，例如客家小炒、粄條、擂茶，請從合作店家資料尋找。
5. 如果使用者提出需求，例如：
   - 家庭聚餐
   - 長輩
   - 小朋友
   - 下午茶
   - 甜點
   - 午餐
   - 聚餐
   可以根據店家 features 推薦。
6. 如果知識庫沒有答案，請回答：
「目前官方資料尚未提供這項資訊，建議洽詢活動客服確認 🙏」
7. 一般客家文化、美食知識可以簡單回答，但不要假裝是本活動的官方資訊。
8. 每次推薦以 1到3 間為主。
9. 不可以推薦資料庫中不存在的合作店家。
10. 不可以自行捏造地址、優惠、餐點。
11. 如果該行政區目前沒有合作店家，請直接說目前資料庫沒有該區合作店家。
12. 如果資料不足，不要猜測。

使用者提到的行政區：
{detected_district if detected_district else "未指定"}

使用者問題：
{user_message}
"""

            interaction = gemini_client.interactions.create(
                model="gemini-3.7-flash",
                system_instruction="""
你是「2026 臺北客家美食節」官方 LINE AI 客服。

回答活動資訊時，只能使用提供的官方知識庫。

回答合作店家問題時，只能推薦提供的合作店家資料庫中的店家。

禁止自行創造：
- 店家名稱
- 地址
- 優惠
- 菜色
- 活動內容

可以依據店家的行政區、料理類型、推薦餐點與特色，
協助使用者進行合理推薦。

回答使用繁體中文，簡潔、親切。
"""
    input=prompt
)

            reply_text = interaction.output_text

        except Exception as e:
            print("Gemini 錯誤：", e)

            reply_text = (
                "不好意思 AI 客服目前暫時忙碌中 🙏 "
                "請稍後再試一次。"
            )

    with ApiClient(configuration) as api_client:

        line_bot_api = MessagingApi(api_client)

        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=event.reply_token,
                messages=[
                    TextMessage(text=reply_text)
                ]
            )
        )
    
if __name__ == "__main__":

    port = int(os.getenv("PORT", 5001))

    print("🍜 2026 臺北客家美食節 LINE Bot 啟動！")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )