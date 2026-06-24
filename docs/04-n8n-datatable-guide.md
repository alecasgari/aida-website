# راهنمای n8n — Data Table + عکس + کد رهگیری

## نکته مهم درباره کد رهگیری

**کد رهگیری در سایت تولید نمی‌شود.**  
سایت فقط فرم را می‌فرستد؛ `form.js` منتظر پاسخ n8n است:

```json
{ "success": true, "tracking_code": "AIDA-7K2M9P" }
```

پس **کد باید در n8n ساخته شود** (قبل از Data Table و Respond to Webhook).

---

## ترتیب صحیح workflow

```
Webhook (POST, responseMode: responseNode)
    ↓
Code — تولید tracking_code + آماده‌سازی فیلدها
    ↓
[اختیاری] Google Drive — آپلود عکس
    ↓
Data Table — Insert row
    ↓
Respond to Webhook — برگرداندن tracking_code به سایت
```

---

## ۱. ستون جدید در Data Table

در جدول `aida-website` یک ستون اضافه کنید:

| ستون | نوع |
|------|-----|
| `tracking_code` | string |

ستون `phone` را **string** بگذارید (نه number) — چون با `۰۹` شروع می‌شود.

---

## ۲. Code node (بعد از Webhook)

نام node وب‌هوک را در expression عوض کنید اگر `Webhook` نیست.

```javascript
const item = $input.first();
const body = item.json.body || item.json;
const photo = item.binary?.product_photo;

// ── کد رهگیری ──
const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
let tracking_code = 'AIDA-';
for (let i = 0; i < 6; i++) {
  tracking_code += chars[Math.floor(Math.random() * chars.length)];
}

// ── عکس: فاز ۱ = نام فایل (فاز ۲ = URL بعد از Drive) ──
let product_photo = '';
if (photo) {
  product_photo = photo.fileName || 'product_photo.jpg';
}

return [{
  json: {
    tracking_code: tracking_code,
    first_name: body.first_name,
    last_name: body.last_name,
    phone: String(body.phone || ''),
    gender: body.gender,
    age: Number(body.age),
    purchase_date: body.purchase_date,
    serial_number: body.serial_number,
    product_photo: product_photo,
    utm_source: body.utm_source || '',
    utm_medium: body.utm_medium || '',
    utm_campaign: body.utm_campaign || '',
    utm_term: body.utm_term || '',
    utm_content: body.utm_content || '',
    page_url: body.page_url || '',
    submitted_at: body.submitted_at || new Date().toISOString(),
    user_agent: item.json.headers?.['user-agent'] || body.user_agent || ''
  },
  binary: item.binary
}];
```

---

## ۳. Data Table — mapping (بعد از Code)

دیگر از `$json.body.xxx` استفاده **نکنید**. بعد از Code همه چیز در `$json` است:

| ستون | Expression |
|------|------------|
| `tracking_code` | `={{ $json.tracking_code }}` |
| `first_name` | `={{ $json.first_name }}` |
| `last_name` | `={{ $json.last_name }}` |
| `phone` | `={{ $json.phone }}` |
| `gender` | `={{ $json.gender }}` |
| `age` | `={{ $json.age }}` |
| `purchase_date` | `={{ $json.purchase_date }}` |
| `serial_number` | `={{ $json.serial_number }}` |
| `product_photo` | `={{ $json.product_photo }}` |
| `utm_source` | `={{ $json.utm_source }}` |
| `utm_medium` | `={{ $json.utm_medium }}` |
| `utm_campaign` | `={{ $json.utm_campaign }}` |
| `utm_term` | `={{ $json.utm_term }}` |
| `utm_content` | `={{ $json.utm_content }}` |
| `page_url` | `={{ $json.page_url }}` |
| `submitted_at` | `={{ $json.submitted_at }}` |
| `user_agent` | `={{ $json.user_agent }}` |

❌ `"product_photo": "data"` اشتباه است — رشته ثابت `"data"` ذخیره می‌شود، نه عکس.

---

## ۴. عکس — سه روش

### روش A — ساده (فقط نام فایل) ✅ برای شروع

همان Code بالا → در `product_photo` نام فایل ذخیره می‌شود.

### روش B — URL واقعی عکس (پیشنهادی) ✅✅

```
Code → Google Drive (Upload) → Code (merge URL) → Data Table
```

- در **Google Drive** node:
  - Binary Property: `product_photo`
  - File Name: `={{ $json.tracking_code }}-{{ $binary.product_photo.fileName }}`

- Code بعد از Drive:

```javascript
const row = $('Code').first().json;
const drive = $input.first().json;
return [{
  json: {
    tracking_code: row.tracking_code,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    gender: row.gender,
    age: row.age,
    purchase_date: row.purchase_date,
    serial_number: row.serial_number,
    product_photo: drive.webViewLink || drive.webContentLink || drive.id,
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    utm_term: row.utm_term,
    utm_content: row.utm_content,
    page_url: row.page_url,
    submitted_at: row.submitted_at,
    user_agent: row.user_agent
  }
}];
```

### روش C — Base64 داخل Data Table ⚠️

برای عکس ۵MB عملی نیست — ستون string پر می‌شود و Data Table سنگین می‌شود. **توصیه نمی‌شود.**

---

## ۵. Respond to Webhook

```json
{
  "success": true,
  "tracking_code": "={{ $json.tracking_code }}",
  "message": "با تشکر از مشارکت شما در پویش آیدا."
}
```

Response Headers (CORS):

| Name | Value |
|------|-------|
| Access-Control-Allow-Origin | `*` |

---

## ۶. عیب‌یابی

| مشکل | علت |
|------|-----|
| عکس ذخیره نمی‌شود | فیلد binary جدا از body است؛ `"data"` literal نزنید |
| tracking_code خالی | Code node قبل از Data Table نیست |
| سایت redirect نمی‌کند | Respond باید `success: true` و `tracking_code` برگرداند |
| `$json.body` خالی | Webhook را Execute کنید و INPUT را ببینید؛ شاید ساختار `$json` متفاوت باشد |

---

## ۷. تست سریع

بعد از Execute Workflow، در خروجی Webhook باید ببینید:

- `body.first_name`, `body.phone`, ...
- `binary.product_photo` با `fileName`, `mimeType`

اگر `binary.product_photo` هست، عکس درست رسیده است.
