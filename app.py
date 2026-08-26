from faq import find_faq_answer
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

    print("收到訊息：", user_message)

    answer = find_faq_answer(user_message)

    if answer:
        reply_text = answer

    else:
        try:
            prompt = f"""
你是「2026 臺北客家美食節」LINE 官方客服。

回答規則：
1. 使用繁體中文。
2. 語氣親切、簡短。
3. 回答以 1到4 句為主。
4. 如果不知道活動官方資訊，不可以亂編。
5. 不知道時請回答：
「目前我還沒有這項官方資訊，建議洽詢活動客服確認 🙏」

使用者問題：
{user_message}
"""

            interaction = gemini_client.interactions.create(
                model="gemini-3.7-flash",
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