(function () {
  'use strict';

  var WEBHOOK_URL = 'https://n8n.alecasgari.com/webhook/f4e8c2a1-7b3d-4e9f-a1c2-8d5e6f7a8b9c';
  var MAX_MESSAGE = 300;
  var THANK_YOU_URL = 'contact-thank-you.html';

  function $(sel) {
    return document.querySelector(sel);
  }

  function toFaNum(n) {
    return String(n).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
  }

  function showAlert(el, message) {
    el.textContent = message;
    el.className = 'form-alert is-visible form-alert--error';
  }

  function hideAlert(el) {
    el.className = 'form-alert';
    el.textContent = '';
  }

  function validatePhone(value) {
    return /^09\d{9}$/.test((value || '').replace(/\s/g, ''));
  }

  function validateForm(form) {
    var valid = true;
    form.querySelectorAll('.form-group[data-field]').forEach(function (group) {
      group.classList.remove('is-invalid');
      var field = group.dataset.field;
      var input = group.querySelector('input, textarea');
      var value = (input.value || '').trim();
      var errEl = group.querySelector('.error-msg');
      var errMsg = '';

      if (!value) {
        errMsg = 'این فیلد الزامی است.';
      } else if (field === 'phone' && !validatePhone(value)) {
        errMsg = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
      } else if (field === 'message' && value.length > MAX_MESSAGE) {
        errMsg = 'پیام نباید بیشتر از ۳۰۰ کاراکتر باشد.';
      }

      if (errMsg) {
        group.classList.add('is-invalid');
        if (errEl) errEl.textContent = errMsg;
        valid = false;
      }
    });
    return valid;
  }

  function buildPayload(form) {
    var payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.replace(/\s/g, ''),
      message: form.message.value.trim().slice(0, MAX_MESSAGE),
      website: $('#website').value,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href
    };

    if (window.AidaUtm) {
      var utm = window.AidaUtm.get();
      Object.keys(utm).forEach(function (key) {
        payload[key] = utm[key];
      });
    }

    payload.user_agent = navigator.userAgent || '';

    return payload;
  }

  function redirectToThankYou() {
    if (window.AidaAnalytics) {
      window.AidaAnalytics.push('aida_form_submit', {
        page_name: 'contact_form',
        form_id: 'contact-form'
      });
    }

    window.location.replace(THANK_YOU_URL);
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var alertEl = $('#contact-alert');
    var submitBtn = $('#contact-submit');

    hideAlert(alertEl);

    if ($('#website').value) return;

    if (!validateForm(form)) return;

    if (WEBHOOK_URL.indexOf('YOUR-N8N-DOMAIN') !== -1) {
      showAlert(alertEl, 'آدرس webhook هنوز تنظیم نشده است. لطفاً با مدیر سایت تماس بگیرید.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form))
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch (err) {
            throw new Error('پاسخ سرور نامعتبر بود. لطفاً دوباره تلاش کنید.');
          }
          if (!res.ok) {
            throw new Error(data.message || data.error || 'خطا در ارسال (کد ' + res.status + ').');
          }
          if (!data.success) {
            throw new Error(data.message || 'خطا در ارسال اطلاعات.');
          }
          return data;
        });
      })
      .then(function () {
        redirectToThankYou();
      })
      .catch(function (err) {
        var msg = err.message || 'خطا در ارسال. لطفاً دوباره تلاش کنید.';
        showAlert(alertEl, msg);
        submitBtn.disabled = false;
        submitBtn.textContent = 'ارسال پیام';
      });
  }

  function updateCounter() {
    var textarea = $('#contact-message');
    var counter = $('#message-count');
    if (!textarea || !counter) return;
    counter.textContent = toFaNum(textarea.value.length);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = $('#contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    var textarea = $('#contact-message');
    if (textarea) {
      textarea.addEventListener('input', updateCounter);
      updateCounter();
    }

    var phoneInput = $('#contact-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        phoneInput.value = phoneInput.value.replace(/[^\d]/g, '').slice(0, 11);
      });
    }
  });
})();
