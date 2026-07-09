# راهنمای workflow ثبت مشارکت — Drive + Sheets + فشرده‌سازی عکس

فایل import: **`07-n8n-register-workflow.json`**

---

## ۱. قبل از import — ستون‌ها را اضافه کنید

### Google Sheet (تب اول — gid=0)

در **ردیف ۱** این دو ستون را اضافه کنید (اگر نیستند):

| ستون جدید | توضیح |
|-----------|--------|
| `tracking_code` | کد رهگیری مثل `AIDA-7K2M9P` |
| `purchase_date_jalali` | تاریخ شمسی خرید |

ستون `product_photo` **همان بماند** — از این به بعد **لینک Google Drive** در آن می‌نشیند (نه نام فایل).

ترتیب پیشنهادی ستون‌ها:

```
tracking_code | first_name | last_name | phone | gender | age | purchase_date | purchase_date_jalali | serial_number | product_photo | utm_source | ...
```

### Data Table در n8n (`aida-website`)

ستون **`purchase_date_jalali`** (نوع string) را اضافه کنید.  
ستون `phone` را **string** نگه دارید (نه number).

---

## ۲. Google Drive

پوشه آپلود (از قبل ساخته‌اید):

```
My Drive → 01 - PhamaTech → Aida → Product Images
```

**Folder ID:** `1o1xmg0uHUAJSlwLGgFbmnhJA7xOzSz4h`

نام فایل هر عکس: `AIDA-XXXXXX-15072010018958803818.jpg` (کد رهگیری + خط فاصله + UID)

---

## ۳. مسیر workflow (بعد از import)

```
Webhook
  → Prepare Row (کد رهگیری + فیلدها + honeypot)
  → Not Honeypot?
       ├─ بله → Compress Photo (کوچک‌کردن عکس)
       │         → Upload to Google Drive
       │         → Merge Photo URL
       │         → Insert row (Data Table)
       │         → Google Sheets
       │              ├─ موفق → Respond to Webhook (success + first_name)
       │              └─ خطا → Handle Sheets Error → Respond Error
       │         (اگر Drive خطا داد → Handle Drive Error → Respond Error)
       └─ خیر (ربات) → Respond Honeypot
```

### مدیریت خطا (Continue On Error Output)

روی nodeهای **Upload to Google Drive** و **Google Sheets** گزینه **Continue On Error Output** فعال است.

اگر آپلود Drive یا ذخیره Sheet شکست بخورد، workflow به‌جای توقف کامل، JSON خطا برمی‌گرداند:

```json
{
  "success": false,
  "error_code": "photo_upload_failed",
  "message": "آپلود عکس با مشکل مواجه شد. لطفاً ۱۵ ثانیه دیگر دوباره تلاش کنید.",
  "tracking_code": "AIDA-XXXXXX"
}
```

یا برای Sheet:

```json
{
  "success": false,
  "error_code": "sheet_save_failed",
  "message": "ذخیره گزارش با مشکل مواجه شد. لطفاً ۱۵ ثانیه دیگر دوباره تلاش کنید."
}
```

سایت (`form.js`) این پاسخ را می‌گیرد، کاربر روی **همان صفحه فرم** می‌ماند، پیام خطا نشان داده می‌شود و دکمه ثبت **۱۵ ثانیه** قفل می‌شود.

پاسخ موفق:

```json
{
  "success": true,
  "tracking_code": "AIDA-XXXXXX",
  "first_name": "مریم",
  "message": "با تشکر از مشارکت شما در پویش آیدا."
}
```

`first_name` برای شخصی‌سازی صفحه thank-you استفاده می‌شود.

### فشرده‌سازی عکس (node: Compress Photo)

- حداکثر ابعاد: **1600×1600** (نسبت حفظ می‌شود)
- خروجی: **JPEG** با کیفیت **82%**
- عکس ۵MB معمولاً به حدود **150–400 KB** می‌رسد

> **نیاز سرور:** node «Edit Image» به **GraphicsMagick** یا **ImageMagick** نیاز دارد.  
> اگر روی Docker رسمی n8n هستید، معمولاً نصب است. اگر خطای Compress Photo گرفتید، روی سرور `gm` یا `convert` را نصب کنید.

---

## ۴. مراحل import در n8n

1. workflow قدیمی **Aida Register Webhook** را **غیرفعال** کنید (Deactivate).  
   ⚠️ دو workflow با یک webhook نمی‌توانند همزمان Active باشند.

2. منو → **Import from File** → `07-n8n-register-workflow.json`

3. در nodeهای **Upload to Google Drive** و **Google Sheets**:
   - Credential گوگل را وصل کنید (همان اکانت Sheets).

4. در **Upload to Google Drive**:
   - پوشه را چک کنید: `Product Images` (`1o1xmg0uHUAJSlwLGgFbmnhJA7xOzSz4h`)

5. در **Google Sheets**:
   - Document: `aida-website`
   - Sheet: تب اول (Sheet1 / gid=0)

6. در **Insert row**:
   - Data Table: `aida-website` (`wp7uRy8Mmtihpyz2`)

7. **Test workflow** با Pin Data یا یک ثبت واقعی از سایت.

8. اگر تست OK بود → workflow جدید را **Active** کنید.

---

## ۵. صف کردن اجراها (همزمانی) در n8n

وقتی چند نفر همزمان ثبت می‌کنند، بدون محدودیت همه workflowها با هم اجرا می‌شوند و ممکن است:
- RAM سرور پر شود (عکس‌ها)
- Google موقتاً خطای «too many requests» بدهد

### روش ساده (پیشنهادی برای شما)

در فایل env سرور n8n (یا docker-compose):

```env
N8N_CONCURRENCY_PRODUCTION_LIMIT=5
```

یعنی حداکثر **۵ ثبت همزمان**؛ بقیه چند ثانیه در صف می‌مانند. کاربر معمولاً متوجه نمی‌شود.

بعد از تغییر، سرویس n8n را restart کنید.

### روش پیشرفته (اختیاری — کمپین خیلی سنگین)

**Queue mode** با Redis — برای هزاران ثبت همزمان. نیاز به Redis جدا دارد. برای کمپین فعلی معمولاً لازم نیست.

### Retry خودکار

روی nodeهای **Google Drive** و **Google Sheets** در این workflow:
- Retry On Fail: **فعال**
- Max Tries: **3**
- Wait: **5 ثانیه**

اگر Google لحظه‌ای شلوغ باشد، خودش دوباره تلاش می‌کند.

---

## ۶. تست سریع

بعد از Execute:

| node | باید ببینید |
|------|-------------|
| Webhook | `binary.product_photo` + فیلدهای فرم |
| Compress Photo | عکس کوچک‌تر در binary |
| Upload to Google Drive | `id`, `webViewLink` |
| Merge Photo URL | `product_photo` = لینک https://drive.google.com/... |
| Google Sheets | ردیف جدید با لینک در ستون product_photo |

---

## ۷. عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| Compress Photo خطا | GraphicsMagick/ImageMagick روی سرور |
| Drive خطای 403 | اکانت OAuth همان مالک پوشه Product Images باشد |
| Sheets ستون خالی | ستون‌های `tracking_code` و `purchase_date_jalali` را در ردیف ۱ اضافه کنید |
| سایت tracking_code نمی‌گیرد | Respond to Webhook باید Active و `responseMode: responseNode` روی Webhook باشد |
| خطا روی فرم ولی workflow سبز | node خطادار باید **Continue On Error Output** داشته باشد و به Respond Error وصل باشد |
| دو workflow فعال | فقط یکی Active — webhook یکتا است |

---

## ۸. Google Sheet ID

```
1_lk03YFFntZZNNzI8Z6EE49nQ47Ad1SnEKjeiL6iuXg
```

تب ثبت‌ها: **gid=0** (اولین شیت)
