(function () {
  'use strict';

  var WEBHOOK_URL = 'https://n8n.alecasgari.com/webhook/85da6969-8b96-4483-9808-223a4ce7b19c';

  var MAX_FILE_SIZE = 5 * 1024 * 1024;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var SUBMIT_LABEL = 'ثبت مشارکت';
  var COOLDOWN_SEC = 15;
  var PROGRESS_MS = 20000;

  var submitState = {
    progressTimer: null,
    progressStart: 0,
    cooldownTimer: null
  };

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function toFaDigits(str) {
    return String(str).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
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

  function sanitizePhone(raw) {
    var digits = (raw || '').replace(/[^\d]/g, '');

    if (digits.length === 10 && digits.charAt(0) === '9') {
      digits = '0' + digits;
    }

    if (digits.length > 0 && digits.charAt(0) !== '0') {
      digits = '';
    }

    if (digits.length > 1 && digits.charAt(1) !== '9') {
      digits = digits.slice(0, 1);
    }

    return digits.slice(0, 11);
  }

  function initPhoneInput() {
    var phoneInput = $('#phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function () {
      phoneInput.value = sanitizePhone(phoneInput.value);
    });

    phoneInput.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted = (e.clipboardData || window.clipboardData).getData('text');
      phoneInput.value = sanitizePhone(pasted);
    });
  }

  function validateForm(form) {
    var valid = true;
    var groups = form.querySelectorAll('.form-group[data-field]');

    groups.forEach(function (group) {
      group.classList.remove('is-invalid');
      var field = group.dataset.field;
      var input = field === 'purchase_date'
        ? group.querySelector('.shamsi-date__value') || group.querySelector('input[type="hidden"]')
        : group.querySelector('input, select, textarea');
      if (!input) return;

      var value = input.type === 'checkbox' ? input.checked : (input.value || '').trim();
      var errEl = group.querySelector('.error-msg');
      var errMsg = '';

      if (input.type === 'file') {
        if (input.required && !input.files.length) {
          errMsg = 'این فیلد الزامی است.';
        }
      } else if (input.required && !value) {
        errMsg = 'این فیلد الزامی است.';
      } else if (field === 'phone' && value && !validatePhone(value)) {
        errMsg = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
      } else if (field === 'age') {
        var age = parseInt(value, 10);
        if (age < 9 || age > 50) errMsg = 'سن باید بین ۹ تا ۵۰ باشد.';
      } else if (field === 'serial_number' && value) {
        var uid = value.replace(/\s/g, '');
        if (!/^\d{20}$/.test(uid)) errMsg = 'شماره UID باید دقیقاً ۲۰ رقم باشد.';
      } else if (field === 'purchase_date' && value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          errMsg = 'تاریخ انتخاب‌شده معتبر نیست.';
        } else {
          var picked = new Date(value + 'T12:00:00');
          var now = new Date();
          now.setHours(23, 59, 59, 999);
          if (picked > now) errMsg = 'تاریخ نمی‌تواند در آینده باشد.';
        }
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

    if (!valid) {
      trackFormErrors(form);
    }

    return valid;
  }

  function trackFormErrors(form) {
    if (!window.AidaAnalytics) return;

    form.querySelectorAll('.form-group.is-invalid[data-field]').forEach(function (group) {
      var errEl = group.querySelector('.error-msg');
      var msg = errEl ? errEl.textContent.trim() : '';
      if (!msg) return;

      window.AidaAnalytics.push('aida_form_error', {
        page_name: 'register_form',
        form_id: 'register-form',
        form_field: group.dataset.field,
        error_message: msg
      });
    });
  }

  function trackFormError(field, message) {
    if (!window.AidaAnalytics || !message) return;

    window.AidaAnalytics.push('aida_form_error', {
      page_name: 'register_form',
      form_id: 'register-form',
      form_field: field,
      error_message: message
    });
  }

  function stopProgress() {
    if (submitState.progressTimer) {
      clearInterval(submitState.progressTimer);
      submitState.progressTimer = null;
    }
  }

  function setProgress(percent) {
    var bar = $('#submit-progress-bar');
    var label = $('#submit-progress-label');
    var wrap = document.querySelector('.submit-progress');
    var p = Math.max(0, Math.min(100, percent));

    if (bar) bar.style.width = p + '%';
    if (label) label.textContent = toFaDigits(Math.floor(p)) + '٪';
    if (wrap) wrap.setAttribute('aria-valuenow', String(Math.floor(p)));
  }

  function openSubmitModal() {
    var modal = $('#submit-modal');
    if (!modal) return;

    setProgress(0);
    modal.hidden = false;
    document.body.classList.add('modal-open');

    submitState.progressStart = Date.now();
    stopProgress();
    submitState.progressTimer = setInterval(function () {
      var elapsed = Date.now() - submitState.progressStart;
      var p = (elapsed / PROGRESS_MS) * 100;
      setProgress(p);
      if (p >= 100) stopProgress();
    }, 80);
  }

  function closeSubmitModal() {
    var modal = $('#submit-modal');
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove('modal-open');
    stopProgress();
  }

  function completeProgress() {
    setProgress(100);
    stopProgress();
  }

  function startCooldown(btn) {
    var sec = COOLDOWN_SEC;
    btn.disabled = true;
    btn.textContent = 'تلاش مجدد تا ' + toFaDigits(sec) + ' ثانیه';

    if (submitState.cooldownTimer) {
      clearInterval(submitState.cooldownTimer);
    }

    submitState.cooldownTimer = setInterval(function () {
      sec -= 1;
      if (sec <= 0) {
        clearInterval(submitState.cooldownTimer);
        submitState.cooldownTimer = null;
        btn.disabled = false;
        btn.textContent = SUBMIT_LABEL;
      } else {
        btn.textContent = 'تلاش مجدد تا ' + toFaDigits(sec) + ' ثانیه';
      }
    }, 1000);
  }

  function resolveErrorMessage(err, data) {
    if (data && data.message) return data.message;

    var msg = (err && err.message) ? err.message : 'خطا در ارسال. لطفاً دوباره تلاش کنید.';

    if (data && data.error_code === 'photo_upload_failed') {
      return 'آپلود عکس با مشکل مواجه شد. لطفاً ۱۵ ثانیه دیگر دوباره تلاش کنید.';
    }
    if (data && data.error_code === 'sheet_save_failed') {
      return 'ذخیره گزارش با مشکل مواجه شد. لطفاً ۱۵ ثانیه دیگر دوباره تلاش کنید.';
    }
    if (err && err.name === 'TypeError' && msg.indexOf('fetch') !== -1) {
      return 'خطای شبکه. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.';
    }

    return msg;
  }

  function redirectToThankYou(data, firstName) {
    var ref = encodeURIComponent(data.tracking_code || '');
    var name = encodeURIComponent(firstName || data.first_name || '');
    var target = 'thank-you.html?ref=' + ref + '&name=' + name;

    if (window.AidaAnalytics) {
      window.AidaAnalytics.push('aida_form_submit', {
        page_name: 'register_form',
        form_id: 'register-form',
        eventCallback: function () {
          window.location.href = target;
        },
        eventTimeout: 2000
      });
    } else {
      window.location.href = target;
    }
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

    var firstName = ($('#first_name') && $('#first_name').value.trim()) || '';

    var formData = new FormData(form);
    formData.delete('terms');
    formData.set('phone', formData.get('phone').replace(/\s/g, ''));
    if (formData.get('serial_number')) {
      formData.set('serial_number', formData.get('serial_number').replace(/\s/g, ''));
    }
    var purchaseDisplay = $('#purchase_date_display');
    if (purchaseDisplay && purchaseDisplay.value) {
      formData.set('purchase_date_jalali', purchaseDisplay.value);
    }

    if (window.AidaUtm) {
      window.AidaUtm.appendToFormData(formData);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ارسال...';
    openSubmitModal();

    fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch (parseErr) {
            var invalid = new Error('پاسخ سرور نامعتبر بود. لطفاً دوباره تلاش کنید.');
            invalid.parsed = {};
            throw invalid;
          }

          if (!res.ok || data.success === false) {
            var serverMsg = data.message || data.error || text;
            if (serverMsg && serverMsg.indexOf('Unused Respond to Webhook') !== -1) {
              serverMsg = 'تنظیمات webhook در n8n ناقص است.';
            }
            var fail = new Error(serverMsg || 'خطا در ارسال اطلاعات (کد ' + res.status + ').');
            fail.parsed = data;
            throw fail;
          }

          if (data.message === 'Workflow was started' && !data.success) {
            throw new Error('webhook هنوز پاسخ JSON برنمی‌گرداند.');
          }

          if (!data.success) {
            var noSuccess = new Error(data.message || 'خطا در ارسال اطلاعات.');
            noSuccess.parsed = data;
            throw noSuccess;
          }

          return data;
        });
      })
      .then(function (data) {
        completeProgress();

        setTimeout(function () {
          closeSubmitModal();
          redirectToThankYou(data, firstName);
        }, 450);
      })
      .catch(function (err) {
        closeSubmitModal();

        var data = err.parsed || {};
        var msg = resolveErrorMessage(err, data);

        showAlert(alertEl, msg);
        alertEl.classList.remove('form-alert--success');
        alertEl.classList.add('form-alert--error', 'is-visible');

        trackFormError('submit', msg);
        startCooldown(submitBtn);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = $('#register-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      initPhoneInput();
      initFileDrop();
      initUidModal();
    }
  });

  function initFileDrop() {
    var drop = $('#file-drop');
    var input = $('#product_photo');
    var empty = $('#file-drop-empty');
    var preview = $('#file-drop-preview');
    var previewImg = $('#file-preview-img');
    var previewName = $('#file-preview-name');
    var removeBtn = $('#file-remove-btn');
    var selectBtn = drop && drop.querySelector('.file-drop__btn');

    if (!drop || !input) return;

    function showPreview(file) {
      if (!file || ALLOWED_TYPES.indexOf(file.type) === -1) return;
      var url = URL.createObjectURL(file);
      previewImg.src = url;
      previewName.textContent = file.name;
      empty.hidden = true;
      preview.hidden = false;
      drop.classList.add('file-drop--filled');
    }

    function clearPreview() {
      input.value = '';
      previewImg.removeAttribute('src');
      previewName.textContent = '';
      empty.hidden = false;
      preview.hidden = true;
      drop.classList.remove('file-drop--filled');
    }

    function handleFiles(files) {
      if (!files || !files.length) return;
      var file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        var group = input.closest('.form-group');
        if (group) {
          var sizeMsg = 'حجم عکس نباید بیشتر از ۵ مگابایت باشد.';
          group.classList.add('is-invalid');
          var errEl = group.querySelector('.error-msg');
          if (errEl) errEl.textContent = sizeMsg;
          trackFormError('product_photo', sizeMsg);
        }
        return;
      }
      var dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      var group = input.closest('.form-group');
      if (group) group.classList.remove('is-invalid');
      showPreview(file);
    }

    if (selectBtn) {
      selectBtn.addEventListener('click', function () { input.click(); });
    }

    drop.addEventListener('click', function (e) {
      if (e.target.closest('.file-drop__remove') || e.target.closest('.file-drop__btn')) return;
      if (!preview.hidden) return;
      input.click();
    });

    input.addEventListener('change', function () {
      handleFiles(input.files);
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        clearPreview();
      });
    }

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add('file-drop--drag');
      });
    });

    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('file-drop--drag');
      });
    });

    drop.addEventListener('drop', function (e) {
      handleFiles(e.dataTransfer.files);
    });
  }

  function initUidModal() {
    var modal = $('#uid-modal');
    var openBtn = $('#uid-help-btn');
    if (!modal || !openBtn) return;

    var closers = modal.querySelectorAll('[data-modal-close]');

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('modal-open');
      modal.querySelector('.modal__close').focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);

    closers.forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }
})();
