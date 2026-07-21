# راهنمای workflow آمار پویش — روزانه + API عمومی

فایل import: **`08-n8n-stats-workflow.json`**

این workflow **جدا از** `Aida Register Webhook` است. workflow ثبت را تغییر ندهید.

---

## منطق آمار

| فیلد | منبع |
|------|------|
| `participants` | **۶۰۰۰** (پایه) + تعداد ردیف‌های Data Table `aida-website` |
| `registrations_from_form` | فقط تعداد ثبت‌های فرم (برای کنترل داخلی) |
| `provinces` / `cities` | **دستی** — در node `Calculate Stats` |
| `goalFirst` / `goalSecond` / `goalMain` | ثابت در همان node |
| `freeRatio` | ۱۰ (هر ۱۰ مشارکت = ۱ واکسیناسیون رایگان) |

هر ردیف Data Table = **یک مشارکت** (بدون حذف تکراری).

---

## ساختار workflow

```
Daily 6 AM ──┐
             ├── Get All Registrations → Calculate Stats → Save Stats Cache
Manual Refresh ┘

Stats API (GET) → Get Stats Cache → Format Stats Response → Respond Stats
```

- **شمارش:** روزانه ساعت ۶ صبح به وقت تهران (`Asia/Tehran`)
- **سرویس سایت:** Webhook GET همیشه فعال — آخرین عدد cache‌شده را برمی‌گرداند
- **cache:** Data Table جداگانه به نام **`aida-stats-cache`** (نه static data داخل workflow)

> **چرا Data Table؟**  
> `getWorkflowStaticData` بین اجرای Manual در ادیتور و webhook در production جدا می‌ماند. Data Table برای هر دو شاخه مشترک است.

---

## نصب (۶ قدم)

### ۱. ساخت Data Table کش

در n8n: **Data tables → Create → From scratch**

نام جدول: **`aida-stats-cache`**

ستون‌ها (همه را اضافه کنید):

| ستون | نوع |
|------|-----|
| `cache_key` | string |
| `participants` | number |
| `registrations_from_form` | number |
| `base_participants` | number |
| `provinces` | number |
| `cities` | number |
| `goalFirst` | number |
| `goalSecond` | number |
| `goalMain` | number |
| `freeRatio` | number |
| `updated_at` | string |

نیازی به ردیف اولیه نیست — اولین Manual Refresh خودش `cache_key = latest` را می‌سازد.

### ۲. Import / به‌روزرسانی workflow

در n8n: workflow فعلی را با **`08-n8n-stats-workflow.json`** جایگزین کنید، یا nodeهای جدید را دستی اضافه کنید:

- `Save Stats Cache` بعد از `Calculate Stats`
- `Get Stats Cache` + `Format Stats Response` به‌جای `Load Cached Stats`

### ۳. بررسی اتصال جداول

| Node | جدول |
|------|------|
| `Get All Registrations` | `aida-website` |
| `Save Stats Cache` | `aida-stats-cache` |
| `Get Stats Cache` | `aida-stats-cache` |

### ۴. اولین اجرا

یک‌بار **Execute workflow** روی `Manual Refresh` بزنید.

در تب Data tables → `aida-stats-cache` باید یک ردیف با `cache_key = latest` و `participants = 6003` (یا عدد فعلی) ببینید.

### ۵. Activate

workflow را **Active** کنید.

### ۶. URL در سایت

در `assets/js/stats.js`:

```
https://n8n.alecasgari.com/webhook/aida-campaign-stats
```

---

## تست

۱. Manual Refresh بزنید  
۲. در مرورگر باز کنید:

```
https://n8n.alecasgari.com/webhook/aida-campaign-stats
```

باید **همان عدد** Manual Refresh را ببینید (مثلاً `participants: 6003`).

---

## تغییر شهر / استان (دستی)

node **`Calculate Stats`**:

```javascript
const MANUAL_PROVINCES = 2;
const MANUAL_CITIES = 4;
```

بعد Manual Refresh بزنید.

---

## عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| Manual درست، webhook هنوز ۶۰۰۰ | workflow قدیمی با static data — نسخه جدید را import کنید و جدول `aida-stats-cache` بسازید |
| خطای Data Table not found | جدول `aida-stats-cache` ساخته نشده یا نام اشتباه است |
| `updated_at: null` در webhook | هنوز Manual Refresh نزده‌اید یا upsert خطا داده |
| سایت عدد قدیمی | deploy `stats.js` + cache مرورگر را خالی کنید |
