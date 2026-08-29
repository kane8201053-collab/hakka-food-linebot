# 2026 臺北客家美食節 LINE Bot

這是一個以 Flask、LINE Messaging API 與 Gemini 建置的活動客服，能回答活動 FAQ、依臺北市行政區推薦官方合作店家，並處理料理與用餐需求。

## Day 9～Day 10 教學

- [Day 9：防呆＋64 種民眾問題測試](docs/Day9_防呆與64題測試.md)
- [Day 10：正式部署，讓民眾使用](docs/Day10_正式部署.md)

## 快速驗證

```bash
.venv/bin/python -m unittest discover -s tests -v
```

看到最後顯示 `OK`，代表不需要呼叫 Gemini 的固定邏輯已通過測試。64 題測試資料位於 `tests/test_citizen_questions.py`。

## 主要檔案

| 檔案 | 用途 |
|---|---|
| `app.py` | Flask、LINE Webhook、Gemini 呼叫與 LINE 回覆 |
| `bot_logic.py` | 可單獨測試的防呆、FAQ、行政區、提示詞與回覆長度邏輯 |
| `faq.py` | 常見問題與關鍵字 |
| `knowledge.py` | 活動官方知識庫 |
| `lottery.py` | 最新抽獎內容與抽獎問法；活動異動時只需修改此檔 |
| `restaurants.py` | 合作店家資料庫與行政區辨識 |
| `tests/test_citizen_questions.py` | 64 種民眾問題及其他單元測試 |
| `render.yaml` | Render 正式環境設定，不包含真正金鑰 |

真正的金鑰只應放在本機 `.env` 或 Render Environment。不要將 `.env` 上傳到 GitHub。

## 更新最新抽獎資訊

修改 `lottery.py` 內的 `LATEST_LOTTERY_INFO` 後重新部署即可。LINE 回覆下方會顯示「🎁 最新抽獎資訊」按鈕；使用者點擊按鈕，或輸入「最新抽獎資訊」、「怎麼抽獎」等問法，都會讀取這份資料。

店家 Google Maps 網址會由 `restaurants.py` 根據店名與地址自動產生，不需要 Google API Key。若新增店家，只要提供 `name` 與 `address`，系統就會自動補上地圖連結。
