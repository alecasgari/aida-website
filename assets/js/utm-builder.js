(function () {
  'use strict';

  var PRESETS = {
    pharmacy_poster: {
      landing: 'https://www.iranaida.com/register.html',
      source: 'pharmacy',
      medium: 'poster',
      content: 'counter_poster'
    },
    pharmacy_qr: {
      landing: 'https://www.iranaida.com/register.html',
      source: 'pharmacy',
      medium: 'qr',
      content: 'counter_poster'
    },
    insta_story: {
      landing: 'https://www.iranaida.com/',
      source: 'instagram',
      medium: 'story',
      content: 'aida_official'
    },
    telegram_post: {
      landing: 'https://www.iranaida.com/',
      source: 'telegram',
      medium: 'post',
      content: 'channel_health_iran'
    },
    sms_bulk: {
      landing: 'https://www.iranaida.com/register.html',
      source: 'sms',
      medium: 'bulk',
      content: 'wave1'
    }
  };

  var MEDIUMS_BY_SOURCE = {
    instagram: [
      { value: 'story', label: 'استوری' },
      { value: 'post', label: 'پست فید' },
      { value: 'reel', label: 'ریلز' },
      { value: 'bio', label: 'لینک بیو' },
      { value: 'highlight', label: 'هایلایت' }
    ],
    telegram: [
      { value: 'post', label: 'پست کانال' },
      { value: 'pin', label: 'پست پین‌شده' },
      { value: 'direct', label: 'لینک مستقیم' }
    ],
    pharmacy: [
      { value: 'poster', label: 'پوستر' },
      { value: 'qr', label: 'کد QR' }
    ],
    sms: [
      { value: 'bulk', label: 'ارسال انبوه' },
      { value: 'reminder', label: 'پیامک یادآوری' }
    ]
  };

  var SOURCE_LABELS = {
    instagram: 'اینستاگرام',
    telegram: 'تلگرام',
    pharmacy: 'داروخانه',
    sms: 'پیامک'
  };

  var state = {
    landing: 'https://www.iranaida.com/register.html',
    source: '',
    medium: ''
  };

  var qrInstance = null;
  var lastQrUrl = '';
  var QR_EXPORT_PX = 1200;

  function $(id) {
    return document.getElementById(id);
  }

  function setActiveChoices(selector, activeBtn) {
    document.querySelectorAll(selector).forEach(function (btn) {
      btn.classList.remove('utm-choice--active');
    });
    if (activeBtn) activeBtn.classList.add('utm-choice--active');
  }

  function setLanding(url, btn) {
    state.landing = url;
    $('custom-landing').value = url;
    setActiveChoices('.utm-choice[data-landing]', btn);
    updateLink();
  }

  function setSource(source, btn) {
    state.source = source;
    $('utm_source').value = source;
    setActiveChoices('.utm-choice[data-source]', btn);
    renderMediums(source);
    updateLink();
  }

  function setMedium(medium, btn) {
    state.medium = medium;
    $('utm_medium').value = medium;
    setActiveChoices('.utm-choice[data-medium]', btn);
    updateLink();
  }

  function renderMediums(source) {
    var container = $('medium-container');
    var target = $('medium-buttons');
    target.innerHTML = '';
    state.medium = '';
    $('utm_medium').value = '';

    var options = MEDIUMS_BY_SOURCE[source];
    if (!options) {
      container.classList.add('utm-field--hidden');
      return;
    }

    container.classList.remove('utm-field--hidden');
    options.forEach(function (med) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'utm-choice utm-choice--medium';
      btn.textContent = med.label;
      btn.dataset.medium = med.value;
      btn.addEventListener('click', function () {
        setMedium(med.value, btn);
      });
      target.appendChild(btn);
    });
  }

  function sanitizeContent(value) {
    return value.toLowerCase()
      .replace(/@/g, '')
      .replace(/[\s.]+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  function updateLink() {
    var landing = (state.landing || '').trim() || 'https://www.iranaida.com/register.html';
    var source = state.source;
    var medium = state.medium;
    var content = $('utm_content').value.trim();
    var campaign = 'aida2026';
    var missing = [];

    if (!source) missing.push('utm_source');
    if (!medium) missing.push('utm_medium');
    if (!content) missing.push('utm_content');

    var params = ['utm_campaign=' + campaign];
    if (source) params.push('utm_source=' + encodeURIComponent(source));
    if (medium) params.push('utm_medium=' + encodeURIComponent(medium));
    if (content) params.push('utm_content=' + encodeURIComponent(content));

    var finalUrl = landing;
    if (params.length) {
      finalUrl += (finalUrl.indexOf('?') !== -1 ? '&' : '?') + params.join('&');
    }

    $('final-link').textContent = finalUrl;

    var badge = $('validation-badge');
    if (missing.length) {
      badge.className = 'utm-badge utm-badge--warn';
      badge.textContent = 'فرم ناقص است (نیاز به: ' + missing.join('، ') + ')';
    } else {
      badge.className = 'utm-badge utm-badge--ok';
      badge.textContent = 'لینک کامل و آماده کپی است';
    }

    updateQr(finalUrl, missing.length === 0);
  }

  function updateQr(url, isComplete) {
    var wrap = $('qr-canvas');
    var downloadBtn = $('download-qr-btn');
    if (!wrap || typeof QRCode === 'undefined') return;

    if (!isComplete) {
      wrap.innerHTML = '<p class="utm-qr__placeholder">پس از تکمیل فرم، QR اینجا ساخته می‌شود.</p>';
      lastQrUrl = '';
      if (downloadBtn) downloadBtn.disabled = true;
      qrInstance = null;
      return;
    }

    if (url === lastQrUrl) return;
    lastQrUrl = url;
    wrap.innerHTML = '';
    qrInstance = new QRCode(wrap, {
      text: url,
      width: QR_EXPORT_PX,
      height: QR_EXPORT_PX,
      colorDark: '#003e48',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    if (downloadBtn) downloadBtn.disabled = false;
  }

  function getQrImageElement() {
    var wrap = $('qr-canvas');
    if (!wrap) return null;
    return wrap.querySelector('img') || wrap.querySelector('canvas');
  }

  function downloadQr() {
    var content = $('utm_content').value.trim() || 'link';
    var filename = 'aida-qr-' + content + '.png';
    var img = getQrImageElement();

    if (img && img.tagName === 'IMG' && img.src) {
      exportQrImage(img.src, filename);
      return;
    }

    if (img && img.tagName === 'CANVAS') {
      exportQrImage(img.toDataURL('image/png'), filename);
    }
  }

  function exportQrImage(source, filename) {
    var exportImg = new Image();
    exportImg.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = QR_EXPORT_PX;
      canvas.height = QR_EXPORT_PX;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, QR_EXPORT_PX, QR_EXPORT_PX);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(exportImg, 0, 0, QR_EXPORT_PX, QR_EXPORT_PX);
      triggerDownload(canvas.toDataURL('image/png'), filename);
      showToast('QR دانلود شد', 'فایل ' + QR_EXPORT_PX + '×' + QR_EXPORT_PX + ' پیکسل آماده چاپ است.');
    };
    exportImg.src = source;
  }

  function triggerDownload(dataUrl, filename) {
    var link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function findLandingButton(url) {
    var file = url.replace(/\/$/, '').split('/').pop() || 'home';
    var buttons = document.querySelectorAll('.utm-choice[data-landing]');
    var match = null;
    buttons.forEach(function (btn) {
      if (btn.dataset.landing === url) match = btn;
      if (!match && file === 'register.html' && btn.dataset.landing.indexOf('register.html') !== -1) {
        match = btn;
      }
    });
    return match;
  }

  function findSourceButton(source) {
    var buttons = document.querySelectorAll('.utm-choice[data-source]');
    var match = null;
    buttons.forEach(function (btn) {
      if (btn.dataset.source === source) match = btn;
    });
    return match;
  }

  function loadPreset(key) {
    var preset = PRESETS[key];
    if (!preset) return;

    var landingBtn = findLandingButton(preset.landing);
    if (landingBtn) {
      setLanding(preset.landing, landingBtn);
    } else {
      state.landing = preset.landing;
      $('custom-landing').value = preset.landing;
      setActiveChoices('.utm-choice[data-landing]', null);
    }

    var sourceBtn = findSourceButton(preset.source);
    if (sourceBtn) setSource(preset.source, sourceBtn);

    window.setTimeout(function () {
      var mediumBtn = document.querySelector('.utm-choice[data-medium="' + preset.medium + '"]');
      if (mediumBtn) setMedium(preset.medium, mediumBtn);
      $('utm_content').value = preset.content;
      updateLink();
      showToast('قالب بارگذاری شد', 'مقادیر کمپین در فرم اعمال شدند.');
    }, 50);
  }

  function showToast(title, body) {
    var toast = $('utm-toast');
    $('toast-title').textContent = title;
    $('toast-body').textContent = body;
    toast.classList.add('is-visible');
    window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  function copyLink() {
    var linkText = $('final-link').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(linkText).then(function () {
        showToast('کپی موفق', 'لینک UTM در کلیپ‌بورد قرار گرفت.');
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var temp = document.createElement('textarea');
      temp.value = linkText;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast('کپی موفق', 'لینک UTM در کلیپ‌بورد قرار گرفت.');
    }
  }

  function testLink() {
    window.open($('final-link').textContent, '_blank', 'noopener,noreferrer');
  }

  function bindEvents() {
    document.querySelectorAll('.utm-choice[data-landing]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanding(btn.dataset.landing, btn);
      });
    });

    document.querySelectorAll('.utm-choice[data-source]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setSource(btn.dataset.source, btn);
      });
    });

    document.querySelectorAll('.utm-preset').forEach(function (btn) {
      btn.addEventListener('click', function () {
        loadPreset(btn.dataset.preset);
      });
    });

    $('custom-landing').addEventListener('input', function (e) {
      state.landing = e.target.value;
      setActiveChoices('.utm-choice[data-landing]', null);
      updateLink();
    });

    $('utm_content').addEventListener('input', function (e) {
      e.target.value = sanitizeContent(e.target.value);
      updateLink();
    });

    $('copy-link-btn').addEventListener('click', copyLink);
    $('test-link-btn').addEventListener('click', testLink);
    $('download-qr-btn').addEventListener('click', downloadQr);
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    var firstLanding = document.querySelector('.utm-choice[data-landing].utm-choice--active');
    if (firstLanding) state.landing = firstLanding.dataset.landing;
    var firstSource = document.querySelector('.utm-choice[data-source]');
    if (firstSource) setSource(firstSource.dataset.source, firstSource);
    updateLink();
  });
})();
