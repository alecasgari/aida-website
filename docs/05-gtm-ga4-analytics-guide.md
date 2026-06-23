<div dir="rtl">
# راهنمای کامل GTM، GA4 و آنالیتیکس — وب‌سایت پویش آیدا

این سند مخصوص پروژه `aida-website` است و بر اساس کد فعلی، صفحات واقعی، دکمه‌ها، فرم و UTMهای پیاده‌سازی‌شده نوشته شده است.

---

## ۱. شناسه‌ها و دامنه

| مورد | مقدار دقیق |
|------|------------|
| دامنه اصلی سایت | `https://www.iranaida.com` |
| Google Tag Manager | `GTM-N387J6GK` |
| Google Analytics 4 | `G-DZMJTGPJ03` |
| Sitemap | `https://www.iranaida.com/sitemap.xml` |
| robots.txt | `https://www.iranaida.com/robots.txt` |

### وضعیت نصب در کد (الان)

| مورد | وضعیت |
|------|--------|
| اسکریپت GTM در `<head>` همه صفحات HTML | ✅ نصب شده |
| noscript GTM بعد از `<body>` | ✅ نصب شده |
| اسکریپت مستقیم `gtag.js` | ❌ نصب نشده (عمدی — فقط از GTM) |
| فایل `assets/js/analytics.js` | ❌ هنوز ساخته نشده |
| `dataLayer.push` برای رویدادهای سفارشی | ❌ هنوز در کد نیست |

> **قانون:** کد `gtag.js` را مستقیم در HTML نگذار. GA4 فقط از داخل GTM با Measurement ID `G-DZMJTGPJ03` وصل شود.

---

## ۲. معماری پیشنهادی

```
کاربر در سایت
    ↓
assets/js/analytics.js  →  dataLayer.push({ event: 'aida_...' })
    ↓
GTM-N387J6GK  →  Trigger  →  Tag GA4 Event
    ↓
GA4 Property (G-DZMJTGPJ03)
```

UTMها از قبل در `assets/js/utm.js` در `sessionStorage` با کلید `aida_utm` ذخیره می‌شوند و همراه فرم به n8n هم می‌روند. همان مقادیر باید در `dataLayer` هم ارسال شوند تا در GA4 گزارش Acquisition درست باشد.

---

## ۳. صفحات سایت — نام‌گذاری استاندارد

در GTM و GA4 از این `page_name` استفاده کن (ثابت و انگلیسی):

| فایل | URL | `page_name` | `page_title` (از `<title>`) |
|------|-----|-------------|------------------------------|
| `index.html` | `/` | `home` | پویش آیدا، آینده دختران ایران |
| `hpv.html` | `/hpv.html` | `hpv_awareness` | آگاهی از HPV، پویش آیدا |
| `gardisun.html` | `/gardisun.html` | `gardisun_product` | گاردیسان، پویش آیدا |
| `register.html` | `/register.html` | `register_form` | ثبت مشارکت، پویش آیدا |
| `thank-you.html` | `/thank-you.html` | `thank_you` | ثبت شد، پویش آیدا |

`page_path` را از `window.location.pathname` بگیر (مثلاً `/register.html`).

---

## ۴. UTM — پارامترهای دقیق پروژه

کلیدهای پشتیبانی‌شده در `assets/js/utm.js`:

| کلید Data Layer | کلید URL | مثال مقدار واقعی کمپین |
|-----------------|----------|-------------------------|
| `utm_source` | `utm_source` | `instagram` |
| `utm_medium` | `utm_medium` | `story` |
| `utm_campaign` | `utm_campaign` | `aida2026` |
| `utm_term` | `utm_term` | `hpv` |
| `utm_content` | `utm_content` | `poster_v1` |

### لینک‌های کمپین آماده

**صفحه اصلی — اینستاگرام استوری:**
```
https://www.iranaida.com/?utm_source=instagram&utm_medium=story&utm_campaign=aida2026&utm_content=poster_v1
```

**صفحه ثبت — QR داروخانه:**
```
https://www.iranaida.com/register.html?utm_source=pharmacy&utm_medium=qr&utm_campaign=aida2026&utm_content=pharmacy_counter
```

**صفحه آگاهی HPV — تلگرام:**
```
https://www.iranaida.com/hpv.html?utm_source=telegram&utm_medium=post&utm_campaign=aida2026&utm_content=hpv_education
```

**صفحه گاردیسان — وب‌سایت گاردیسان:**
```
https://www.iranaida.com/gardisun.html?utm_source=gardisun&utm_medium=referral&utm_campaign=aida2026&utm_content=product_page
```

---

## ۵. قرارداد `dataLayer` — رویدادها و پارامترها

همه رویدادهای سفارشی با پیشوند `aida_` شروع می‌شوند.

### ۵.۱ `aida_page_view`

**کی:** بارگذاری هر صفحه (یک بار per page load)

```javascript
window.dataLayer.push({
  event: 'aida_page_view',
  page_name: 'home',
  page_path: '/',
  page_title: 'پویش آیدا، آینده دختران ایران',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: ''
});
```

مقادیر UTM از `window.AidaUtm.get()` پر شوند؛ اگر خالی بود رشته خالی `''` بفرست.

---

### ۵.۲ `aida_cta_click`

**کی:** کلیک روی هر دکمه یا لینک هدف‌دار کمپین

| پارامتر | نوع | توضیح |
|---------|-----|--------|
| `cta_label` | string | متن دقیق دکمه در UI |
| `cta_location` | string | محل دکمه در صفحه (جدول زیر) |
| `cta_destination` | string | مسیر یا URL مقصد |
| `page_name` | string | صفحه‌ای که کلیک روی آن بوده |

#### جدول کامل CTAهای پروژه

**`index.html` (page_name: `home`)**

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `ثبت مشارکت` | `hero_primary` | `/register.html` |
| `بیشتر بدانید` | `hero_secondary` | `/hpv.html` |
| `اطلاعات بیشتر درباره گاردیسان` | `section_gardisun` | `/gardisun.html` |
| `ثبت مشارکت` | `cta_band` | `/register.html` |
| `ثبت مشارکت` | `header_mobile` | `/register.html` |
| `ثبت مشارکت` | `header_nav` | `/register.html` |
| `ثبت` | `bottom_nav` | `/register.html` |

**`hpv.html` (page_name: `hpv_awareness`)**

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `ثبت مشارکت` | `section_cta` | `/register.html` |
| `ثبت مشارکت` | `header_mobile` | `/register.html` |
| `ثبت مشارکت` | `header_nav` | `/register.html` |
| `ثبت` | `bottom_nav` | `/register.html` |

**`gardisun.html` (page_name: `gardisun_product`)**

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `ثبت مشارکت` | `section_cta` | `/register.html` |
| `ثبت مشارکت` | `header_mobile` | `/register.html` |
| `ثبت مشارکت` | `header_nav` | `/register.html` |
| `ثبت` | `bottom_nav` | `/register.html` |

**`register.html` (page_name: `register_form`)**

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `ثبت مشارکت` | `form_submit` | `/thank-you.html` |
| `از کجا پیدا کنم؟` | `uid_help_link` | `#uid-modal` |

**`thank-you.html` (page_name: `thank_you`)**

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `بازگشت به صفحه اصلی` | `thank_you_primary` | `/` |

---

### ۵.۳ `aida_outbound_click`

**کی:** کلیک لینک‌های خارجی فوتر (همه صفحات)

| `cta_label` | `cta_location` | `cta_destination` |
|-------------|----------------|-------------------|
| `MACSA` | `footer_partner` | `https://macsa.ir/fa/` |
| `گاردیسان` | `footer_partner` | `http://gardisun.ir/` |
| `بیوسان فارمد` | `footer_partner` | `https://biosunpharmed.com/` |

```javascript
window.dataLayer.push({
  event: 'aida_outbound_click',
  cta_label: 'MACSA',
  cta_location: 'footer_partner',
  cta_destination: 'https://macsa.ir/fa/',
  page_name: 'home'
});
```

---

### ۵.۴ `aida_form_start`

**کی:** اولین تعامل کاربر با `#register-form` (focus روی هر فیلد یا آپلود عکس)

```javascript
window.dataLayer.push({
  event: 'aida_form_start',
  page_name: 'register_form',
  form_id: 'register-form'
});
```

فقط **یک بار** per session ارسال شود.

---

### ۵.۵ `aida_form_error`

**کی:** validation ناموفق در `assets/js/form.js`

| `form_field` | متن خطای رایج |
|--------------|----------------|
| `first_name` | این فیلد الزامی است. |
| `last_name` | این فیلد الزامی است. |
| `phone` | شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود. |
| `gender` | این فیلد الزامی است. |
| `age` | سن باید بین ۹ تا ۵۰ باشد. |
| `purchase_date` | این فیلد الزامی است. |
| `serial_number` | شماره UID باید دقیقاً ۲۰ رقم باشد. |
| `product_photo` | حجم عکس نباید بیشتر از ۵ مگابایت باشد. / فرمت مجاز |
| `terms` | این فیلد الزامی است. |

```javascript
window.dataLayer.push({
  event: 'aida_form_error',
  page_name: 'register_form',
  form_id: 'register-form',
  form_field: 'serial_number',
  error_message: 'شماره UID باید دقیقاً ۲۰ رقم باشد.'
});
```

> **حریم خصوصی:** نام، تلفن، UID یا عکس را هرگز به GA4 نفرست.

---

### ۵.۶ `aida_form_submit`

**کی:** درخواست webhook موفق، **قبل از** redirect به `thank-you.html`

```javascript
window.dataLayer.push({
  event: 'aida_form_submit',
  page_name: 'register_form',
  form_id: 'register-form',
  utm_source: 'instagram',
  utm_medium: 'story',
  utm_campaign: 'aida2026',
  utm_term: '',
  utm_content: 'poster_v1'
});
```

---

### ۵.۷ `aida_conversion` (Conversion اصلی)

**کی:** بارگذاری `thank-you.html` (بعد از ثبت موفق)

```javascript
window.dataLayer.push({
  event: 'aida_conversion',
  page_name: 'thank_you',
  conversion_type: 'register_participation',
  has_tracking_code: true
});
```

پارامتر `tracking_code` خام را به GA4 **نفرست**. فقط `has_tracking_code: true/false`.

---

### ۵.۸ `aida_uid_help_open`

**کی:** کلیک دکمه `#uid-help-btn` در فرم ثبت

```javascript
window.dataLayer.push({
  event: 'aida_uid_help_open',
  page_name: 'register_form'
});
```

---

## ۶. تنظیم GTM — گام‌به‌گام

### ۶.۱ Variables (متغیرهای Data Layer)

در GTM → **Variables** → **New** → نوع **Data Layer Variable**

| نام Variable در GTM | Data Layer Variable Name |
|---------------------|--------------------------|
| `DLV - page_name` | `page_name` |
| `DLV - page_path` | `page_path` |
| `DLV - page_title` | `page_title` |
| `DLV - cta_label` | `cta_label` |
| `DLV - cta_location` | `cta_location` |
| `DLV - cta_destination` | `cta_destination` |
| `DLV - form_id` | `form_id` |
| `DLV - form_field` | `form_field` |
| `DLV - error_message` | `error_message` |
| `DLV - utm_source` | `utm_source` |
| `DLV - utm_medium` | `utm_medium` |
| `DLV - utm_campaign` | `utm_campaign` |
| `DLV - utm_term` | `utm_term` |
| `DLV - utm_content` | `utm_content` |
| `DLV - conversion_type` | `conversion_type` |
| `DLV - has_tracking_code` | `has_tracking_code` |

---

### ۶.۲ Triggers

| نام Trigger | نوع | Event name |
|-------------|-----|------------|
| `TRG - All Pages` | Page View | — (پیش‌فرض GTM) |
| `TRG - aida_page_view` | Custom Event | `aida_page_view` |
| `TRG - aida_cta_click` | Custom Event | `aida_cta_click` |
| `TRG - aida_outbound_click` | Custom Event | `aida_outbound_click` |
| `TRG - aida_form_start` | Custom Event | `aida_form_start` |
| `TRG - aida_form_error` | Custom Event | `aida_form_error` |
| `TRG - aida_form_submit` | Custom Event | `aida_form_submit` |
| `TRG - aida_conversion` | Custom Event | `aida_conversion` |
| `TRG - aida_uid_help_open` | Custom Event | `aida_uid_help_open` |

---

### ۶.۳ Tags

#### Tag 1: `GA4 - Configuration`

| فیلد | مقدار |
|------|--------|
| Tag type | Google Analytics: GA4 Configuration |
| Measurement ID | `G-DZMJTGPJ03` |
| Trigger | `TRG - All Pages` |

---

#### Tag 2: `GA4 - Event - aida_page_view`

| فیلد | مقدار |
|------|--------|
| Tag type | Google Analytics: GA4 Event |
| Configuration Tag | `GA4 - Configuration` |
| Event Name | `aida_page_view` |
| Event Parameters | |

| Parameter Name | Value |
|----------------|-------|
| `page_name` | `{{DLV - page_name}}` |
| `page_path` | `{{DLV - page_path}}` |
| `page_title` | `{{DLV - page_title}}` |
| `utm_source` | `{{DLV - utm_source}}` |
| `utm_medium` | `{{DLV - utm_medium}}` |
| `utm_campaign` | `{{DLV - utm_campaign}}` |

| Trigger | `TRG - aida_page_view` |

---

#### Tag 3: `GA4 - Event - aida_cta_click`

| Parameter Name | Value |
|----------------|-------|
| `cta_label` | `{{DLV - cta_label}}` |
| `cta_location` | `{{DLV - cta_location}}` |
| `cta_destination` | `{{DLV - cta_destination}}` |
| `page_name` | `{{DLV - page_name}}` |

| Event Name | `aida_cta_click` |
| Trigger | `TRG - aida_cta_click` |

---

#### Tag 4: `GA4 - Event - aida_outbound_click`

| Parameter Name | Value |
|----------------|-------|
| `cta_label` | `{{DLV - cta_label}}` |
| `cta_destination` | `{{DLV - cta_destination}}` |
| `page_name` | `{{DLV - page_name}}` |

| Event Name | `aida_outbound_click` |
| Trigger | `TRG - aida_outbound_click` |

---

#### Tag 5: `GA4 - Event - aida_form_start`

| Parameter Name | Value |
|----------------|-------|
| `form_id` | `{{DLV - form_id}}` |
| `page_name` | `{{DLV - page_name}}` |

| Event Name | `aida_form_start` |
| Trigger | `TRG - aida_form_start` |

---

#### Tag 6: `GA4 - Event - aida_form_error`

| Parameter Name | Value |
|----------------|-------|
| `form_field` | `{{DLV - form_field}}` |
| `error_message` | `{{DLV - error_message}}` |
| `page_name` | `{{DLV - page_name}}` |

| Event Name | `aida_form_error` |
| Trigger | `TRG - aida_form_error` |

---

#### Tag 7: `GA4 - Event - aida_form_submit`

| Parameter Name | Value |
|----------------|-------|
| `utm_source` | `{{DLV - utm_source}}` |
| `utm_medium` | `{{DLV - utm_medium}}` |
| `utm_campaign` | `{{DLV - utm_campaign}}` |
| `utm_term` | `{{DLV - utm_term}}` |
| `utm_content` | `{{DLV - utm_content}}` |
| `page_name` | `{{DLV - page_name}}` |

| Event Name | `aida_form_submit` |
| Trigger | `TRG - aida_form_submit` |

---

#### Tag 8: `GA4 - Event - generate_lead` (Conversion)

این Tag همان Conversion اصلی کمپین است.

| فیلد | مقدار |
|------|--------|
| Event Name | `generate_lead` |
| Trigger | `TRG - aida_conversion` |

| Parameter Name | Value |
|----------------|-------|
| `conversion_type` | `{{DLV - conversion_type}}` |
| `page_name` | `{{DLV - page_name}}` |
| `utm_campaign` | `{{DLV - utm_campaign}}` |
| `utm_source` | `{{DLV - utm_source}}` |
| `utm_medium` | `{{DLV - utm_medium}}` |

---

#### Tag 9: `GA4 - Event - aida_uid_help_open`

| Event Name | `aida_uid_help_open` |
| Trigger | `TRG - aida_uid_help_open` |

| Parameter Name | Value |
|----------------|-------|
| `page_name` | `{{DLV - page_name}}` |

---

### ۶.۴ Publish و تست

1. **Preview** → باز کردن `https://www.iranaida.com/register.html`
2. در Tag Assistant باید `GA4 - Configuration` روی All Pages fire شود
3. بعد از پیاده‌سازی `analytics.js`، کلیک روی `ثبت مشارکت` باید `aida_cta_click` را fire کند
4. **Submit** → **Publish**

---

## ۷. تنظیم GA4

### ۷.۱ ثبت Conversion

1. GA4 → **Admin** → **Events**
2. منتظر بمان تا `generate_lead` ظاهر شود (بعد از اولین ثبت واقعی یا تست)
3. **Mark as conversion** را روشن کن

### ۷.۲ Custom Definitions (پارامترهای سفارشی)

در **Admin** → **Custom definitions** → **Create custom dimensions**:

| Dimension name | Event parameter | Scope |
|----------------|-----------------|-------|
| `Page name` | `page_name` | Event |
| `CTA label` | `cta_label` | Event |
| `CTA location` | `cta_location` | Event |
| `CTA destination` | `cta_destination` | Event |
| `Form field` | `form_field` | Event |
| `UTM campaign` | `utm_campaign` | Event |
| `UTM source` | `utm_source` | Event |
| `UTM medium` | `utm_medium` | Event |

### ۷.۳ Funnel Exploration پیشنهادی

مسیر تبدیل کمپین:

```
home  →  register_form  →  thank_you
```

یا:

```
aida_page_view (page_name=home)
  → aida_cta_click (cta_destination=/register.html)
  → aida_form_start
  → aida_form_submit
  → aida_conversion
```

### ۷.۴ گزارش‌های هفتگی پیشنهادی

| گزارش | هدف |
|-------|-----|
| Acquisition → Traffic acquisition | عملکرد `utm_source` / `utm_medium` |
| Engagement → Events | تعداد `aida_cta_click` به تفکیک `cta_location` |
| Engagement → Events | تعداد `aida_form_error` به تفکیک `form_field` |
| Monetization / Conversions | تعداد `generate_lead` |
| Funnel | نرخ تبدیل home → register → thank_you |

---

## ۸. Google Search Console

### ۸.۱ ثبت Property

1. [search.google.com/search-console](https://search.google.com/search-console)
2. **Add property** → `https://www.iranaida.com`

### ۸.۲ تأیید مالکیت

روش HTML tag: متا تگ verification را در `<head>` فایل `index.html` بگذار و deploy کن.

### ۸.۳ ارسال Sitemap

1. منوی **Sitemaps**
2. وارد کن: `sitemap.xml`
3. Submit

صفحات داخل sitemap فعلی:

- `https://www.iranaida.com/`
- `https://www.iranaida.com/hpv.html`
- `https://www.iranaida.com/gardisun.html`
- `https://www.iranaida.com/register.html`

`thank-you.html` عمداً داخل sitemap نیست (`noindex`).

---

## ۹. تغییرات لازم در کد (مرحله بعد)

فایل‌هایی که باید اضافه/ویرایش شوند:

| فایل | تغییر |
|------|--------|
| `assets/js/analytics.js` | **جدید** — helper `pushEvent()` + `getPageName()` + `getUtmPayload()` |
| `index.html`, `hpv.html`, `gardisun.html`, `register.html`, `thank-you.html` | اضافه کردن `<script src="assets/js/analytics.js">` بعد از `utm.js` |
| `assets/js/main.js` | listener کلیک CTA و outbound footer |
| `assets/js/form.js` | `aida_form_start`, `aida_form_error`, `aida_form_submit` |
| `assets/js/shamsi-date.js` یا `form.js` | `aida_uid_help_open` روی `#uid-help-btn` |
| `thank-you.html` یا `main.js` | `aida_conversion` وقتی `page_name === thank_you` |

### نمونه ساختار `analytics.js`

```javascript
window.dataLayer = window.dataLayer || [];

function pushAidaEvent(eventName, payload) {
  var utm = window.AidaUtm ? window.AidaUtm.get() : {};
  window.dataLayer.push(Object.assign({
    event: eventName,
    utm_source: utm.utm_source || '',
    utm_medium: utm.utm_medium || '',
    utm_campaign: utm.utm_campaign || '',
    utm_term: utm.utm_term || '',
    utm_content: utm.utm_content || ''
  }, payload || {}));
}
```

### ترتیب لود اسکریپت در `register.html`

```html
<script src="assets/js/utm.js"></script>
<script src="assets/js/analytics.js"></script>
<script src="assets/js/stats.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/jalali.js"></script>
<script src="assets/js/shamsi-date.js"></script>
<script src="assets/js/form.js"></script>
```

`analytics.js` باید **بعد از** `utm.js` و **قبل از** `main.js` / `form.js` باشد.

---

## ۱۰. چک‌لیست راه‌اندازی

### الان (بدون تغییر کد analytics)

- [ ] GTM Container `GTM-N387J6GK` ساخته شده
- [ ] Tag `GA4 - Configuration` با `G-DZMJTGPJ03` روی All Pages
- [ ] GTM Publish شده
- [ ] GA4 Realtime بازدید را نشان می‌دهد
- [ ] Search Console verify شده
- [ ] `sitemap.xml` در Search Console submit شده

### بعد از پیاده‌سازی `analytics.js`

- [ ] همه Triggerهای `aida_*` در GTM ساخته شده
- [ ] Tagهای GA4 Event متصل شده
- [ ] `generate_lead` به عنوان Conversion علامت خورده
- [ ] Custom dimensions در GA4 ثبت شده
- [ ] Funnel تست شده با یک ثبت آزمایشی کامل

---

## ۱۱. خطاهای رایج

| مشکل | علت | راه‌حل |
|------|-----|--------|
| GA4 دوبار شمارش می‌کند | هم GTM هم `gtag.js` مستقیم | فقط GTM بماند |
| رویداد `aida_*` در GA4 نیست | `analytics.js` هنوز نیست یا Trigger اشتباه | کد + GTM Trigger را تطبیق بده |
| UTM در GA4 خالی است | کاربر بدون UTM آمده یا session تمام شده | لینک‌های کمپین را با UTM بفرست |
| Conversion ثبت نمی‌شود | `generate_lead` mark نشده | Admin → Events → Mark as conversion |
| thank-you در گزارش نیست | `noindex` است ولی event باید بیاید | `aida_conversion` را چک کن نه صفحه در Sitemap |

---

## ۱۲. ارجاع به فایل‌های مرتبط پروژه

| موضوع | فایل |
|-------|------|
| UTM capture | `assets/js/utm.js` |
| ارسال فرم + webhook | `assets/js/form.js` |
| فیلدهای فرم | `register.html` → `#register-form` |
| قرارداد webhook | `docs/03-webhook-contract.md` |
| Data Table n8n | `docs/04-n8n-datatable-guide.md` |

---

*آخرین به‌روزرسانی: بر اساس کد پروژه با دامنه `www.iranaida.com`، GTM `GTM-N387J6GK` و GA4 `G-DZMJTGPJ03`.*

</div>