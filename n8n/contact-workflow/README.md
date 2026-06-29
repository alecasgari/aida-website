# ورک‌فلو تماس با ما — n8n

## فایل import

`aida-contact-workflow.json`

## قبل از import

### ۱. Data Table در n8n

یک جدول جدید بسازید (مثلاً `aida-contact`) با ستون‌های زیر — همه **string** به‌جز `submitted_at` که می‌تواند date/string باشد:

| ستون | نوع پیشنهادی |
|------|----------------|
| `name` | string |
| `phone` | string |
| `message` | string |
| `utm_source` | string |
| `utm_medium` | string |
| `utm_campaign` | string |
| `utm_term` | string |
| `utm_content` | string |
| `page_url` | string |
| `submitted_at` | string |
| `user_agent` | string |

### ۲. Google Sheet

یک شیت با هدر ردیف اول (همان نام ستون‌ها) بسازید. در node **Google Sheets** credential و Document/Sheet را انتخاب کنید.

## بعد از import

1. Workflow را import کنید و **فعال** کنید.
2. در node **Data Table** جدول `aida-contact` را انتخاب کنید.
3. در node **Google Sheets** سند و شیت را وصل کنید.
4. Webhook path باید با سایت یکی باشد:

```
https://n8n.alecasgari.com/webhook/f4e8c2a1-7b3d-4e9f-a1c2-8d5e6f7a8b9c
```

همین URL در `assets/js/contact-form.js` تنظیم شده است.

## ترتیب اجرا

```
Webhook (POST, responseMode: responseNode)
    ↓
Code — honeypot + آماده‌سازی فیلدها
    ↓
IF — اگر honeypot پر بود → فقط Respond (بدون ذخیره)
    ↓
Data Table — Insert
    ↓
Google Sheets — Append
    ↓
Respond to Webhook — { "success": true, "message": "..." }
```

## تست

```bash
curl -X POST "https://n8n.alecasgari.com/webhook/f4e8c2a1-7b3d-4e9f-a1c2-8d5e6f7a8b9c" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"تست\",\"phone\":\"09123456789\",\"message\":\"سلام\"}"
```

پاسخ مورد انتظار:

```json
{ "success": true, "message": "پیام شما دریافت شد." }
```

## به‌روزرسانی لیست داروخانه

فایل اکسل را در `docs/Pharmacy_list.xlsx` ویرایش کنید، سپس:

```bash
python scripts/export-pharmacies.py
```

خروجی: `assets/data/pharmacies.json`
