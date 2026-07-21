# مستندات پروژه وب‌سایت پویش آیدا

این فولدر مرجع طراحی، ساختار و پیاده‌سازی وب‌سایت کمپین **پویش آیدا** است.

## فهرست فایل‌ها

| فایل | موضوع |
|------|--------|
| [01-campaign-review-and-site-proposal.md](./01-campaign-review-and-site-proposal.md) | **سند اصلی** — بررسی متریال، ساختار سایت، صفحات، فرم، وب‌هوک، تصاویر |
| [02-file-tree.md](./02-file-tree.md) | ساختار پیشنهادی پوشه‌ها و فایل‌های پروژه |
| [03-webhook-contract.md](./03-webhook-contract.md) | قرارداد فنی ارسال داده به n8n |
| [04-n8n-datatable-guide.md](./04-n8n-datatable-guide.md) | راهنمای n8n Data Table + عکس + کد رهگیری |
| [05-gtm-ga4-analytics-guide.md](./05-gtm-ga4-analytics-guide.md) | **راهنمای کامل GTM، GA4، dataLayer و Search Console** |
| [06-campaign-utm-links.md](./06-campaign-utm-links.md) | **راهنمای تولید لینک UTM برای تیم مارکتینگ** |
| [07-n8n-register-workflow-guide.md](./07-n8n-register-workflow-guide.md) | workflow ثبت مشارکت (Drive + Sheets + Data Table) |
| [08-n8n-stats-workflow-guide.md](./08-n8n-stats-workflow-guide.md) | **آمار روزانه پویش → commit فایل `stats.json` روی گیت** |

## متریال مرجع

- `Marketing Material/AIDA Campaign Brochure.pdf` — بروشور ۲ صفحه‌ای (محتوای تصویری)
- `Marketing Material/AIDA Campaign Poster.jpg.jpeg` — پوستر عمودی کمپین

## وضعیت پروژه

✅ **پیاده‌سازی اولیه انجام شد** (HTML/CSS/JS + تصاویر + فونت)

| صفحه | فایل |
|------|------|
| خانه | `index.html` |
| آگاهی HPV | `hpv.html` |
| گاردیسان | `gardisun.html` |
| ثبت مشارکت | `register.html` |
| تأیید | `thank-you.html` |

### قبل از راه‌اندازی

1. URL webhook n8n را در `assets/js/form.js` → `WEBHOOK_URL` قرار دهید
2. کد لایسنس فونت پلاک را در `assets/fonts/FontLicense.txt` درج کنید
3. سایت را روی هر host استاتیک (Netlify, GitHub Pages, cPanel, …) deploy کنید

### پیش‌نمایش محلی

```bash
python -m http.server 8080
```

سپس: http://localhost:8080
