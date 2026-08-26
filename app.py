from faq import find_faq_answer
import os

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

if not channel_secret:
    raise ValueError("找不到 LINE_CHANNEL_SECRET")

if not channel_access_token:
    raise ValueError("找不到 LINE_CHANNEL_ACCESS_TOKEN")

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

    answer = find_faq_answer(user_message)

    if answer:
        reply_text = answer
    else:
        reply_text = """🍜 哈囉！我是 2026 臺北客家美食節小幫手！

目前可以問我：

📅 活動時間
🎉 活動內容
😋 美食推薦
🍽️ 店家名單

直接輸入問題就可以囉！
"""

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)

        line_bot_api.reply_message(
            ReplyMessageRequest(
                reply_token=event.reply_token,
                messages=[TextMessage(text=reply_text)]
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