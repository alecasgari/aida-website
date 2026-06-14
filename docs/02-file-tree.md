# ساختار پیشنهادی فایل‌های پروژه

```
aida-website/
│
├── index.html
├── hpv.html
├── gardisun.html
├── register.html
├── thank-you.html
│
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   └── components.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── utm.js
│   │   └── form.js
│   │
│   └── images/
│       ├── logos/
│       │   ├── logo-aida.svg
│       │   ├── logo-aida-white.svg
│       │   ├── logo-gardisun.svg
│       │   ├── logo-biosun.svg
│       │   └── logo-macsa.svg
│       │
│       ├── hero/
│       │   ├── hero-bg.webp
│       │   └── hero-bg-mobile.webp
│       │
│       ├── product/
│       │   ├── gardisun-product.webp
│       │   ├── gardisun-hero.webp
│       │   └── doctor-patient.webp
│       │
│       ├── icons/
│       │   ├── step-awareness.svg
│       │   ├── step-consult.svg
│       │   ├── step-action.svg
│       │   └── step-contribute.svg
│       │
│       ├── infographics/
│       │   ├── social-impact-10-1.svg
│       │   ├── hpv-types.svg
│       │   ├── dose-timeline.svg
│       │   └── immunogenicity-chart.svg
│       │
│       ├── guide/
│       │   └── photo-guide.webp
│       │
│       └── meta/
│           ├── og-image.jpg
│           ├── favicon.ico
│           └── apple-touch-icon.png
│
├── Marketing Material/          ← متریال خام (موجود)
│   ├── AIDA Campaign Brochure.pdf
│   └── AIDA Campaign Poster.jpg.jpeg
│
└── docs/                        ← مستندات (موجود)
    ├── README.md
    ├── 01-campaign-review-and-site-proposal.md
    ├── 02-file-tree.md
    └── 03-webhook-contract.md
```

## توضیح کوتاه

| پوشه / فایل | نقش |
|-------------|-----|
| `*.html` | ۵ صفحه استاتیک |
| `assets/css/` | استایل مشترک — RTL، رنگ‌ها، کامپوننت |
| `assets/js/utm.js` | ذخیره UTM |
| `assets/js/form.js` | فرم ثبت + webhook |
| `assets/js/main.js` | منو، scroll، موارد عمومی |
| `assets/images/` | تصاویر بهینه‌شده وب |
