(function () {
  'use strict';

  // TODO: URL webhook n8n را اینجا قرار دهید
  var WEBHOOK_URL = 'https://n8n.alecasgari.com/webhook/85da6969-8b96-4483-9808-223a4ce7b19c';

  var MAX_FILE_SIZE = 5 * 1024 * 1024;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function showAlert(el, message) {
    el.textContent = message;
    el.classList.add('is-visible');
  }

  function hideAlert(el) {
    el.classList.remove('is-visible');
    el.textContent = '';
  }

  function validatePhone(value) {
    return /^09\d{9}$/.test(value.replace(/\s/g, ''));
  }

  function validateForm(form) {
    var valid = true;
    var groups = form.querySelectorAll('.form-group[data-field]');

    groups.forEach(function (group) {
      group.classList.remove('is-invalid');
      var field = group.dataset.field;
      var input = group.querySelector('input, select, textarea');
      if (!input) return;

      var value = input.type === 'checkbox' ? input.checked : input.value.trim();
      var errEl = group.querySelector('.error-msg');
      var errMsg = '';

      if (input.required && !value) {
        errMsg = 'این فیلد الزامی است.';
      } else if (field === 'phone' && value && !validatePhone(value)) {
        errMsg = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
      } else if (field === 'age') {
        var age = parseInt(value, 10);
        if (age < 9 || age > 50) errMsg = 'سن باید بین ۹ تا ۵۰ باشد.';
      } else if (field === 'product_photo' && input.files.length) {
        var file = input.files[0];
        if (file.size > MAX_FILE_SIZE) errMsg = 'حجم عکس نباید بیشتر از ۵ مگابایت باشد.';
        else if (ALLOWED_TYPES.indexOf(file.type) === -1) errMsg = 'فرمت مجاز: JPG، PNG یا WebP';
      }

      if (errMsg) {
        group.classList.add('is-invalid');
        if (errEl) errEl.textContent = errMsg;
        valid = false;
      }
    });

    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var alertEl = $('#form-alert');
    var submitBtn = $('#submit-btn');

    hideAlert(alertEl);

    if ($('#website').value) return;

    if (!validateForm(form)) return;

    if (WEBHOOK_URL.indexOf('YOUR-N8N-DOMAIN') !== -1) {
      showAlert(alertEl, 'آدرس webhook هنوز تنظیم نشده است. لطفاً با مدیر سایت تماس بگیرید.');
      alertEl.classList.remove('form-alert--success');
      alertEl.classList.add('form-alert--error', 'is-visible');
      return;
    }

    var formData = new FormData(form);
    formData.delete('terms');
    formData.set('phone', formData.get('phone').replace(/\s/g, ''));

    if (window.AidaUtm) {
      window.AidaUtm.appendToFormData(formData);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            throw new Error('پاسخ سرور نامعتبر بود. لطفاً دوباره تلاش کنید.');
          }

          if (!res.ok) {
            var serverMsg = data.message || data.error || text;
            if (serverMsg && serverMsg.indexOf('Unused Respond to Webhook') !== -1) {
              throw new Error('تنظیمات webhook در n8n ناقص است: Response Mode باید «Using Respond to Webhook Node» باشد.');
            }
            throw new Error(serverMsg || 'خطا در ارسال اطلاعات (کد ' + res.status + ').');
          }

          if (data.message === 'Workflow was started' && !data.success) {
            throw new Error('webhook هنوز پاسخ JSON برنمی‌گرداند. در n8n حالت Respond را روی «Respond to Webhook Node» بگذارید.');
          }

          if (!data.success) {
            throw new Error(data.message || 'خطا در ارسال اطلاعات.');
          }

          return data;
        });
      })
      .then(function (data) {
        var ref = encodeURIComponent(data.tracking_code || '');
        window.location.href = 'thank-you.html?ref=' + ref;
      })
      .catch(function (err) {
        var msg = err.message || 'خطا در ارسال. لطفاً دوباره تلاش کنید.';
        if (err.name === 'TypeError' && msg.indexOf('fetch') !== -1) {
          msg = 'خطای CORS یا شبکه: webhook باید Access-Control-Allow-Origin را برای دامنه سایت برگرداند.';
        }
        showAlert(alertEl, msg);
        alertEl.classList.remove('form-alert--success');
        alertEl.classList.add('form-alert--error', 'is-visible');
        submitBtn.disabled = false;
        submitBtn.textContent = 'ثبت مشارکت';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = $('#register-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  });
})();
