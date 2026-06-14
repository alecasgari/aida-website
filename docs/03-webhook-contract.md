# قرارداد فنی Webhook — n8n ↔ وب‌سایت

> این سند برای پیاده‌سازی workflow در n8n و اتصال `form.js` است.

---

## ۱. Endpoint

```
POST https://[YOUR-N8N-DOMAIN]/webhook/aida-register
```

- CORS باید در n8n یا reverse proxy برای دامنه سایت فعال شود
- یا از **Webhook Response node** در n8n استفاده شود (پیشنهادی)

---

## ۲. Request (از مرورگر)

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `first_name` | string | yes | `مریم` |
| `last_name` | string | yes | `احمدی` |
| `phone` | string | yes | `09121234567` |
| `gender` | string | yes | `female` / `male` |
| `age` | number | yes | `24` |
| `purchase_date` | string (ISO date) | yes | `2026-06-10` |
| `serial_number` | string | yes | `GS-2026-123456` |
| `product_photo` | file | yes | `vaccine.jpg` |
| `utm_source` | string | no | `instagram` |
| `utm_medium` | string | no | `story` |
| `utm_campaign` | string | no | `aida2026` |
| `utm_term` | string | no | — |
| `utm_content` | string | no | `poster_v1` |
| `page_url` | string | no | `https://.../register` |
| `submitted_at` | string (ISO datetime) | no | `2026-06-13T10:30:00+03:30` |
| `user_agent` | string | no | `Mozilla/5.0 ...` |

### مقادیر gender (ثابت)

```
female  →  زن
male    →  مرد
```

---

## ۳. Response (از n8n — Webhook Response)

### موفق — HTTP 200

```json
{
  "success": true,
  "tracking_code": "AIDA-7K2M9P",
  "message": "با تشکر از مشارکت شما در پویش آیدا."
}
```

### خطا — HTTP 400 / 500

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "شماره تماس نامعتبر است."
}
```

---

## ۴. پیشنهاد workflow n8n

```
[Webhook Trigger]
       ↓
[Validate fields]          ← Code node: phone, age, file size
       ↓
[Generate tracking_code]   ← Code node: AIDA-XXXXXX
       ↓
[Store data]               ← Google Sheets / Airtable / DB
       ↓
[Store photo]              ← Google Drive / S3 / local
       ↓
[Webhook Response]         ← JSON success + tracking_code
```

### نمونه Code node — تولید کد

```javascript
const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
let code = 'AIDA-';
for (let i = 0; i < 6; i++) {
  code += chars[Math.floor(Math.random() * chars.length)];
}
return [{ json: { tracking_code: code } }];
```

---

## ۵. رفتار frontend (`form.js`)

```javascript
// pseudo-code
const formData = new FormData(form);
// append UTM from sessionStorage
// append metadata

const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  body: formData
});

const data = await response.json();

if (data.success) {
  window.location.href = `thank-you.html?ref=${encodeURIComponent(data.tracking_code)}`;
} else {
  showError(data.message);
}
```

---

## ۶. امنیت (حداقلی — فاز ۱)

| مورد | پیشنهاد |
|------|---------|
| Rate limit | در n8n یا CDN |
| Max file size | ۵ MB — validate در JS + n8n |
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp` |
| Honeypot field | فیلد مخفی `website` — اگر پر شد، reject |
| Webhook URL | در `form.js` — بعداً می‌توان env/build time config کرد |

---

## ۷. داده ذخیره‌شده در n8n (پیشنهاد ستون‌ها)

| Column | Source |
|--------|--------|
| `id` | auto |
| `tracking_code` | generated |
| `first_name` | form |
| `last_name` | form |
| `phone` | form |
| `gender` | form |
| `age` | form |
| `purchase_date` | form |
| `serial_number` | form |
| `photo_url` | after upload |
| `utm_source` | form |
| `utm_medium` | form |
| `utm_campaign` | form |
| `utm_term` | form |
| `utm_content` | form |
| `submitted_at` | form |
| `created_at` | n8n timestamp |

---

*وقتی URL webhook آماده شد، در `assets/js/form.js` قرار می‌گیرد.*
