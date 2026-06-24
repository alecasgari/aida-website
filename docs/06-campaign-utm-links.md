<div dir="rtl">

# راهنمای تولید لینک کمپین (UTM) — پویش آیدا

این سند برای **تیم مارکتینگ** است تا بدون نیاز به تیم فنی، لینک‌های ردیابی‌شده برای کانال‌های مختلف کمپین بسازید.

با این لینک‌ها می‌فهمیم هر بازدید و هر ثبت مشارکت از **کجا** آمده: داروخانه، تلگرام، اینستاگرام، پیامک و غیره.

---

## ۱. آدرس پایه سایت

<div dir="ltr">

```
https://www.iranaida.com
```

</div>

همیشه از همین دامنه استفاده کنید. از `http://` یا دامنه بدون `www` استفاده نکنید.

---

## ۲. صفحاتی که لینک می‌دهیم

| صفحه | آدرس | کی استفاده کنیم؟ |
|------|------|------------------|
| خانه | <span dir="ltr">`https://www.iranaida.com/`</span> | آگاهی عمومی، استوری، پست معرفی |
| آگاهی HPV | <span dir="ltr">`https://www.iranaida.com/hpv.html`</span> | محتوای آموزشی |
| گاردیسان | <span dir="ltr">`https://www.iranaida.com/gardisun.html`</span> | معرفی محصول |
| **ثبت مشارکت** | <span dir="ltr">`https://www.iranaida.com/register.html`</span> | **پوستر داروخانه، QR، SMS، CTA ثبت** |

**قانون ساده:**

- می‌خواهید کاربر **ثبت کند** → لینک به <span dir="ltr">`register.html`</span>
- می‌خواهید **آگاهی** بدهید → لینک به خانه یا <span dir="ltr">`hpv.html`</span>

---

## ۳. پنج پارامتر UTM — هر کدام یعنی چه؟

هر لینک کمپین پنج پارامتر دارد. فقط **حروف انگلیسی کوچک**، عدد و `_` (زیرخط) استفاده کنید. **فاصله، فارسی و علامت خاص** نگذارید.

| پارامتر | سوال | مثال |
|---------|------|------|
| <span dir="ltr">`utm_campaign`</span> | نام کمپین | <span dir="ltr">`aida2026`</span> |
| <span dir="ltr">`utm_source`</span> | از کدام پلتفرم؟ | <span dir="ltr">`instagram`</span> · <span dir="ltr">`telegram`</span> · <span dir="ltr">`pharmacy`</span> · <span dir="ltr">`sms`</span> |
| <span dir="ltr">`utm_medium`</span> | نوع انتشار | <span dir="ltr">`story`</span> · <span dir="ltr">`post`</span> · <span dir="ltr">`poster`</span> · <span dir="ltr">`qr`</span> · <span dir="ltr">`bulk`</span> |
| <span dir="ltr">`utm_content`</span> | جزئیات: کدام کانال / آیدی / داروخانه | <span dir="ltr">`aida_official`</span> · <span dir="ltr">`tehran_vanak_01`</span> |
| <span dir="ltr">`utm_term`</span> | اختیاری — موضوع یا برچسب اضافه | <span dir="ltr">`hpv_intro`</span> · <span dir="ltr">`wave2`</span> |

### مقدار ثابت کمپین

<div dir="ltr">

```
utm_campaign=aida2026
```

</div>

در **همه لینک‌ها** همین مقدار را بگذارید. عوض نکنید.

---

## ۴. ساختار یک لینک

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=aida2026&utm_content=CONTENT
```

</div>

- قبل از <span dir="ltr">`?`</span> → آدرس صفحه
- بعد از <span dir="ltr">`?`</span> → پارامترها با <span dir="ltr">`&`</span> به هم وصل می‌شوند

### مثال واقعی

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=pharmacy&utm_medium=poster&utm_campaign=aida2026&utm_content=tehran_vanak_01
```

</div>

---

## ۵. قوانین نام‌گذاری (حتماً رعایت شود)

| ✅ درست | ❌ غلط |
|---------|--------|
| <span dir="ltr">`aida_official`</span> | <span dir="ltr">`آیدا رسمی`</span> |
| <span dir="ltr">`tehran_vanak_01`</span> | <span dir="ltr">`tehran vanak`</span> (فاصله) |
| <span dir="ltr">`channel_health_iran`</span> | <span dir="ltr">`@channel_health`</span> (علامت @) |
| حروف کوچک انگلیسی | حروف بزرگ تصادفی |

### <span dir="ltr">`utm_content`</span> برای چه است؟

وقتی **چند منبع از یک پلتفرم** دارید، تفاوت را اینجا بگذارید:

- چند آیدی اینستاگرام → هر آیدی یک <span dir="ltr">`utm_content`</span>
- چند کانال تلگرام → هر کانال یک <span dir="ltr">`utm_content`</span>
- چند داروخانه → هر داروخانه یک <span dir="ltr">`utm_content`</span>
- چند موج پیامک → <span dir="ltr">`wave1`</span> · <span dir="ltr">`wave2`</span>

---

## ۶. جدول مرجع — <span dir="ltr">source</span> و <span dir="ltr">medium</span>

### داروخانه (پوستر / QR)

| محل | <span dir="ltr">utm_source</span> | <span dir="ltr">utm_medium</span> | <span dir="ltr">utm_content</span> (نمونه) |
|-----|-------------------|--------------------|---------------------|
| پوستر زیر پیشخوان | <span dir="ltr">`pharmacy`</span> | <span dir="ltr">`poster`</span> | <span dir="ltr">`counter_poster`</span> |
| QR روی پوستر | <span dir="ltr">`pharmacy`</span> | <span dir="ltr">`qr`</span> | <span dir="ltr">`counter_poster`</span> |
| داروخانه مشخص | <span dir="ltr">`pharmacy`</span> | <span dir="ltr">`poster`</span> | <span dir="ltr">`tehran_vanak_01`</span> |

**مقصد لینک:** همیشه <span dir="ltr">`register.html`</span>

---

### تلگرام

| نوع | <span dir="ltr">utm_source</span> | <span dir="ltr">utm_medium</span> | <span dir="ltr">utm_content</span> |
|-----|-------------------|--------------------|---------------------|
| پست در کانال | <span dir="ltr">`telegram`</span> | <span dir="ltr">`post`</span> | username کانال (بدون @) |
| پست پین‌شده | <span dir="ltr">`telegram`</span> | <span dir="ltr">`post`</span> | username کانال |
| لینک مستقیم ثبت | <span dir="ltr">`telegram`</span> | <span dir="ltr">`post`</span> | username کانال |

**مقصد پیشنهادی:**

- معرفی کمپین → خانه یا <span dir="ltr">`hpv.html`</span>
- دعوت به ثبت → <span dir="ltr">`register.html`</span>

---

### اینستاگرام

| نوع محتوا | <span dir="ltr">utm_medium</span> |
|-----------|--------------------|
| استوری | <span dir="ltr">`story`</span> |
| پست فید | <span dir="ltr">`post`</span> |
| ریلز | <span dir="ltr">`reel`</span> |
| لینک bio | <span dir="ltr">`bio`</span> |
| هایلایت | <span dir="ltr">`highlight`</span> |

| فیلد | مقدار |
|------|--------|
| <span dir="ltr">utm_source</span> | <span dir="ltr">`instagram`</span> |
| <span dir="ltr">utm_content</span> | handle آیدی (بدون @) مثل <span dir="ltr">`aida_official`</span> |

---

### پیامک انبوه (SMS)

| نوع | <span dir="ltr">utm_source</span> | <span dir="ltr">utm_medium</span> | <span dir="ltr">utm_content</span> |
|-----|-------------------|--------------------|---------------------|
| ارسال انبوه | <span dir="ltr">`sms`</span> | <span dir="ltr">`bulk`</span> | <span dir="ltr">`wave1`</span> · <span dir="ltr">`wave2`</span> |
| یادآوری | <span dir="ltr">`sms`</span> | <span dir="ltr">`reminder`</span> | <span dir="ltr">`wave1_followup`</span> |

**مقصد لینک:** <span dir="ltr">`register.html`</span>

**نکته SMS:** لینک UTM بلند است. قبل از ارسال، با سرویس **لینک کوتاه** (bit.ly، rebrandly یا دامنه کوتاه شرکت) کوتاه کنید. مطمئن شوید سرویس کوتاه‌کننده پارامترهای UTM را **حذف نکند**.

---

## ۷. قدم‌به‌قدم — خودتان لینک بسازید

### روش ۱ — دستی (سریع)

1. آدرس صفحه را بنویسید (مثلاً <span dir="ltr">`https://www.iranaida.com/register.html`</span>)
2. علامت <span dir="ltr">`?`</span> بگذارید
3. پارامترها را با <span dir="ltr">`&`</span> وصل کنید:

<div dir="ltr">

```
utm_source=instagram&utm_medium=story&utm_campaign=aida2026&utm_content=aida_official
```

</div>

4. لینک کامل را در مرورگر باز کنید و مطمئن شوید سایت درست باز می‌شود
5. لینک را در **جدول ثبت لینک‌ها** (بخش ۹) یادداشت کنید

---

### روش ۲ — ابزار گوگل (پیشنهادی برای تیم)

<div dir="ltr">

[Google Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/)

</div>

1. **Website URL** → آدرس صفحه (مثلاً <span dir="ltr">`https://www.iranaida.com/register.html`</span>)
2. **Campaign ID** → <span dir="ltr">`aida2026`</span> (همان <span dir="ltr">`utm_campaign`</span>)
3. **Campaign Source** → مثلاً <span dir="ltr">`instagram`</span>
4. **Campaign Medium** → مثلاً <span dir="ltr">`story`</span>
5. **Campaign Name** → می‌توانید خالی بگذارید یا همان <span dir="ltr">`aida2026`</span>
6. **Campaign Content** → مثلاً <span dir="ltr">`aida_official`</span>
7. لینک تولیدشده را کپی کنید

---

## ۸. نمونه لینک‌های آماده (کپی کنید و فقط <span dir="ltr">`utm_content`</span> را عوض کنید)

### داروخانه — پوستر عمومی

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=pharmacy&utm_medium=poster&utm_campaign=aida2026&utm_content=counter_poster
```

</div>

### داروخانه — QR

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=pharmacy&utm_medium=qr&utm_campaign=aida2026&utm_content=counter_poster
```

</div>

### تلگرام — پست کانال (خانه)

<div dir="ltr">

```
https://www.iranaida.com/?utm_source=telegram&utm_medium=post&utm_campaign=aida2026&utm_content=CHANNEL_USERNAME
```

</div>

<span dir="ltr">`CHANNEL_USERNAME`</span> را با username کانال عوض کنید.

### تلگرام — لینک ثبت

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=telegram&utm_medium=post&utm_campaign=aida2026&utm_content=CHANNEL_USERNAME
```

</div>

### اینستاگرام — استوری

<div dir="ltr">

```
https://www.iranaida.com/?utm_source=instagram&utm_medium=story&utm_campaign=aida2026&utm_content=ACCOUNT_HANDLE
```

</div>

### اینستاگرام — پست با لینک گاردیسان

<div dir="ltr">

```
https://www.iranaida.com/gardisun.html?utm_source=instagram&utm_medium=post&utm_campaign=aida2026&utm_content=ACCOUNT_HANDLE
```

</div>

### اینستاگرام — bio

<div dir="ltr">

```
https://www.iranaida.com/?utm_source=instagram&utm_medium=bio&utm_campaign=aida2026&utm_content=ACCOUNT_HANDLE
```

</div>

### پیامک — موج اول

<div dir="ltr">

```
https://www.iranaida.com/register.html?utm_source=sms&utm_medium=bulk&utm_campaign=aida2026&utm_content=wave1
```

</div>

### متن پیشنهادی SMS

<div dir="rtl">

```
مشارکت در پویش آیدا:
واکسیناسیون HPV، یک سهم برای آیدا
ثبت: [لینک کوتاه]
لغو11
```

</div>

---

## ۹. جدول ثبت لینک‌ها (الزامی برای تیم)

هر لینک جدید را **قبل از انتشار** در این جدول ثبت کنید تا دوباره ساخته نشود و گزارش‌گیری ممکن باشد.

| نام داخلی | لینک کامل | لینک کوتاه (SMS) | source | medium | content | صفحه مقصد | تاریخ انتشار | مسئول |
|-----------|-----------|------------------|--------|--------|---------|-----------|--------------|--------|
| پوستر داروخانه عمومی | … | — | pharmacy | poster | counter_poster | register | | |
| داروخانه ونک | … | — | pharmacy | poster | tehran_vanak_01 | register | | |
| تلگرام سلامت | … | — | telegram | post | channel_health_iran | home | | |
| اینستا آیدا استوری | … | — | instagram | story | aida_official | home | | |
| SMS موج ۱ | … | bit.ly/… | sms | bulk | wave1 | register | | |

فایل اکسل یا Google Sheets مشترک تیم را از همین جدول بسازید.

---

## ۱۰. بعد از انتشار — کجا نتیجه را ببینیم؟

| ابزار | مسیر | چه می‌بینیم |
|-------|------|-------------|
| Google Analytics 4 | Reports → Acquisition → Traffic acquisition | عملکرد هر <span dir="ltr">source / medium</span> |
| Google Analytics 4 | Reports → Realtime | بازدید لحظه‌ای بعد از انتشار |
| Google Analytics 4 | Engagement → Events → <span dir="ltr">`generate_lead`</span> | تعداد ثبت موفق |
| Looker Studio | داشبورد «پویش آیدا» | بازدید، ثبت، کانال‌ها (جدول Session source/medium) |

**معیار موفقیت اصلی:** تعداد <span dir="ltr">`generate_lead`</span> (ثبت مشارکت موفق) به تفکیک کانال.

---

## ۱۱. سوالات متداول

### اگر لینک را بدون UTM بفرستیم چه می‌شود؟

در گزارش‌ها به‌صورت <span dir="ltr">`(direct) / (none)`</span> می‌آید و نمی‌فهمیم از کدام کانال بوده.

### آیا می‌توانم بعداً پارامتر را عوض کنم؟

بله، اما لینک **جدید** می‌شود. لینک قدیمی همچنان با UTM قبلی ثبت می‌شود. همیشه لینک جدید را در جدول ثبت کنید.

### آیا UTM روی فرم ثبت هم می‌آید؟

بله. سایت اولین UTM همان session را ذخیره می‌کند و همراه فرم ثبت به سیستم backend هم ارسال می‌شود.

### برای QR چه کنم؟

همان لینک UTM را در هر سایت QR رایگان بسازید و تست کنید با موبایل اسکن شود.

### چند پارامتر اختیاری است؟

<span dir="ltr">`utm_term`</span> اختیاری است. چهار پارامتر دیگر را همیشه پر کنید.

---

## ۱۲. چک‌لیست قبل از انتشار

- [ ] <span dir="ltr">`utm_campaign=aida2026`</span> در لینک هست
- [ ] فقط حروف انگلیسی کوچک و `_` استفاده شده
- [ ] صفحه مقصد درست است (ثبت → <span dir="ltr">`register.html`</span>)
- [ ] لینک در مرورگر موبایل تست شده
- [ ] برای SMS لینک کوتاه ساخته و UTM حفظ شده
- [ ] لینک در جدول ثبت تیم ثبت شده
- [ ] QR (در صورت نیاز) از همان لینک ساخته شده

---

## ۱۳. تماس با تیم فنی

اگر کانال جدیدی خارج از جدول‌های این سند دارید، قبل از ساخت انبوه لینک با تیم فنی هماهنگ کنید تا <span dir="ltr">`source`</span> و <span dir="ltr">`medium`</span> استاندارد بماند.

**دامنه سایت:** <span dir="ltr">`https://www.iranaida.com`</span>  
**نام کمپین ثابت:** <span dir="ltr">`aida2026`</span>

</div>
