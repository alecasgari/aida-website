# راهنمای workflow آمار پویش — فایل استاتیک روی گیت

فایل import: **`08-n8n-stats-workflow.json`**

این workflow **جدا از** `Aida Register Webhook` است. workflow ثبت را تغییر ندهید.

---

## معماری (بدون webhook روی هر بازدید)

```
ساعت ۶ صبح / Manual
  → شمارش Data Table aida-website
  → محاسبه participants = 6000 + تعداد ردیف‌ها
  → commit فایل assets/data/stats.json روی GitHub (main)
  → GitHub Pages deploy می‌شود

سایت (هر بازدید)
  → فقط assets/data/stats.json را از همان دامنه می‌خواند
  → هیچ درخواستی به n8n نمی‌رود
```

---

## منطق آمار

| فیلد | منبع |
|------|------|
| `participants` | **۶۰۰۰** پایه + تعداد ردیف‌های `aida-website` |
| `provinces` / `cities` | دستی در node `Calculate Stats` |
| بقیه اهداف | ثابت در همان node |

هر ردیف Data Table = یک مشارکت.

---

## نصب

### ۱. Credential گیت‌هاب در n8n

1. در GitHub یک **Fine-grained PAT** یا classic token بسازید با دسترسی **Contents: Read and write** روی ریپوی `alecasgari/aida-website`
2. در n8n: **Credentials → Header Auth**
   - Name: `GitHub PAT (Aida Stats)`
   - Name (header): `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

### ۲. Import / جایگزینی workflow

- workflow قبلی آمار را Deactivate کنید (webhook دیگر لازم نیست)
- فایل `08-n8n-stats-workflow.json` را import کنید
- روی nodeهای `Get Current File` و `Commit Stats JSON` همان credential را انتخاب کنید

### ۳. Activate + تست

1. **Manual Refresh** بزنید
2. در GitHub باید commit جدید روی `assets/data/stats.json` ببینید
3. چند دقیقه بعد روی سایت عدد جدید ظاهر می‌شود

---

## تغییر شهر / استان

در node **`Calculate Stats`**:

```javascript
const MANUAL_PROVINCES = 2;
const MANUAL_CITIES = 4;
```

بعد Manual Refresh.

---

## نکات

| موضوع | توضیح |
|--------|--------|
| بدون تغییر عدد | اگر آمار عوض نشده، commit زده نمی‌شود (شاخه Already Up To Date) |
| جدول `aida-stats-cache` | دیگر لازم نیست؛ می‌توانید نگه دارید یا پاک کنید |
| Webhook قدیمی | غیرفعال کنید تا بار اضافه نسازد |
| سایت | `stats.js` از `assets/data/stats.json` می‌خواند |

---

## عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| 401 از GitHub | token یا Header Auth اشتباه است (`Bearer ` را فراموش نکنید) |
| 404 روی GET | فایل هنوز در ریپو نیست — PUT باید بدون `sha` ایجاد کند |
| 409 Conflict | sha قدیمی است — دوباره Manual بزنید |
| سایت عدد قدیمی | deploy Pages تمام نشده یا cache مرورگر — hard refresh |
