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
  var templateImageCache = {};
  var previewTimer = null;
  var pharmaciesList = [];
  var pharmaciesBySlug = {};
  var posterFontReady = null;
  var POSTER_FONT_FAMILY = 'Pelak, sans-serif';

  var QR_OVERLAYS = {
    poster: {
      src: 'assets/images/marketing/poster-qr.jpg?v=6',
      // پوستر ۴۴۱۹×۶۲۵۰ — QR: ۵۷۵px از چپ، ۱۹۰۵px از بالا، ۱۵۸۵×۱۵۸۵
      leftPx: 575,
      topPx: 1905,
      sizePx: 1585,
      pharmacyLabel: {
        topPx: 430,
        rightPx: 320,
        widthPx: 1210,
        heightPx: 100,
        color: '#003e48',
        prefix: 'از طریق داروخانه '
      },
      mime: 'image/jpeg',
      quality: 0.95
    }
  };

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
    renderContentField(source);
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

  function loadPharmacies() {
    return fetch('assets/data/pharmacies.json')
      .then(function (res) {
        if (!res.ok) throw new Error('pharmacies.json');
        return res.json();
      })
      .then(function (data) {
        pharmaciesList = data.pharmacies || [];
        pharmaciesBySlug = {};
        pharmaciesList.forEach(function (pharmacy) {
          if (pharmacy.slug) pharmaciesBySlug[pharmacy.slug] = pharmacy;
        });
        populatePharmacySelect();
      })
      .catch(function () {
        pharmaciesList = [];
        pharmaciesBySlug = {};
      });
  }

  function populatePharmacySelect() {
    var select = $('utm_pharmacy');
    if (!select) return;

    var current = $('utm_content').value.trim();
    select.innerHTML = '<option value="">داروخانه را انتخاب کنید</option>';
    pharmaciesList.forEach(function (pharmacy) {
      var option = document.createElement('option');
      option.value = pharmacy.slug;
      option.textContent = pharmacy.name + ' — ' + pharmacy.region;
      if (pharmacy.slug === current) option.selected = true;
      select.appendChild(option);
    });
  }

  function renderContentField(source) {
    var pharmacyWrap = $('pharmacy-content-wrap');
    var genericWrap = $('generic-content-wrap');
    var label = $('content-label');
    var hint = $('content-hint');
    var contentInput = $('utm_content_input');
    var pharmacySelect = $('utm_pharmacy');

    if (source === 'pharmacy') {
      pharmacyWrap.classList.remove('utm-field--hidden');
      genericWrap.classList.add('utm-field--hidden');
      if (label) {
        label.innerHTML = '۴. داروخانه (<span dir="ltr">utm_content</span>)';
      }
      if (hint) hint.textContent = 'نام فارسی روی پوستر · slug انگلیسی در UTM';
      if (pharmacySelect) {
        $('utm_content').value = pharmacySelect.value;
      }
    } else {
      pharmacyWrap.classList.add('utm-field--hidden');
      genericWrap.classList.remove('utm-field--hidden');
      if (label) {
        label.innerHTML = '۴. جزئیات کانال / آیدی (<span dir="ltr">utm_content</span>)';
      }
      if (hint) hint.textContent = 'حروف انگلیسی کوچک و _';
      if (contentInput) {
        $('utm_content').value = sanitizeContent(contentInput.value);
      }
      if (pharmacySelect) pharmacySelect.value = '';
    }
  }

  function getSelectedPharmacy() {
    if (state.source !== 'pharmacy') return null;
    var slug = $('utm_content').value.trim();
    return slug ? pharmaciesBySlug[slug] || null : null;
  }

  function ensurePosterFont() {
    if (!posterFontReady) {
      posterFontReady = document.fonts.load('700 72px ' + POSTER_FONT_FAMILY).catch(function () {
        return Promise.resolve();
      });
    }
    return posterFontReady;
  }

  function fitFontSize(ctx, text, maxWidth, maxHeight) {
    var size = Math.floor(maxHeight * 0.82);
    var minSize = 28;

    while (size >= minSize) {
      ctx.font = '700 ' + size + 'px ' + POSTER_FONT_FAMILY;
      if (ctx.measureText(text).width <= maxWidth) return size;
      size -= 2;
    }

    ctx.font = '700 ' + minSize + 'px ' + POSTER_FONT_FAMILY;
    return minSize;
  }

  function drawPharmacyLabel(ctx, canvasWidth, labelConfig, pharmacyName) {
    if (!labelConfig || !pharmacyName) return;

    var text = labelConfig.prefix + pharmacyName;
    var boxLeft = canvasWidth - labelConfig.rightPx - labelConfig.widthPx;
    var boxTop = labelConfig.topPx;
    var boxWidth = labelConfig.widthPx;
    var boxHeight = labelConfig.heightPx;
    var padding = 16;
    var fontSize = fitFontSize(ctx, text, boxWidth - padding * 2, boxHeight);

    ctx.save();
    ctx.fillStyle = labelConfig.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.font = '700 ' + fontSize + 'px ' + POSTER_FONT_FAMILY;
    ctx.fillText(text, boxLeft + boxWidth / 2, boxTop + boxHeight / 2);
    ctx.restore();
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
      setTemplateDownloadState(false);
      var previews = $('utm-template-previews');
      if (previews) previews.hidden = true;
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
    setTemplateDownloadState(true);
    window.setTimeout(scheduleTemplatePreviews, 350);
  }

  function setTemplateDownloadState(enabled) {
    var btn = $('download-poster-btn');
    if (btn) btn.disabled = !enabled;
  }

  function scheduleTemplatePreviews() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updateTemplatePreviews, 250);
  }

  function getContentSlug() {
    return $('utm_content').value.trim() || 'link';
  }

  function getDownloadTimestamp() {
    var d = new Date();
    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
      pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }

  function buildDownloadFilename(kind, ext) {
    return kind + '-' + getContentSlug() + '-' + getDownloadTimestamp() + '.' + ext;
  }

  function loadImage(src) {
    if (templateImageCache[src]) {
      return Promise.resolve(templateImageCache[src]);
    }

    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        templateImageCache[src] = img;
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error('بارگذاری قالب ' + src + ' ممکن نشد.'));
      };
      img.src = src;
    });
  }

  function getQrSourceDataUrl() {
    var img = getQrImageElement();
    if (!img) return null;

    if (img.tagName === 'IMG' && img.src) return img.src;
    if (img.tagName === 'CANVAS') return img.toDataURL('image/png');
    return null;
  }

  function getOverlayRect(template, overlay) {
    var width = template.naturalWidth || template.width;
    var height = template.naturalHeight || template.height;
    var size = overlay.sizePx != null
      ? overlay.sizePx
      : Math.round(width * overlay.sizeRatio);
    var x = overlay.leftPx != null
      ? overlay.leftPx
      : Math.round(width * overlay.xRatio);
    var y;
    if (overlay.topPx != null) {
      y = overlay.topPx;
    } else if (overlay.bottomPx != null) {
      y = height - overlay.bottomPx - size;
    } else {
      y = Math.round(height * overlay.yRatio);
    }
    var inset = Math.max(0, Math.round(width * (overlay.insetRatio || 0)));
    var pad = Math.max(2, Math.round(width * (overlay.padRatio || 0)));
    return {
      x: x,
      y: y,
      size: size,
      inset: inset,
      pad: pad,
      width: width,
      height: height
    };
  }

  function composeTemplate(templateKey, qrDataUrl) {
    var overlay = QR_OVERLAYS[templateKey];
    if (!overlay) return Promise.reject(new Error('قالب نامعتبر است.'));

    return ensurePosterFont().then(function () {
      return loadImage(overlay.src).then(function (templateImg) {
        var rect = getOverlayRect(templateImg, overlay);
        var canvas = document.createElement('canvas');
        canvas.width = rect.width;
        canvas.height = rect.height;
        var ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas در این مرورگر پشتیبانی نمی‌شود.');

        ctx.drawImage(templateImg, 0, 0, rect.width, rect.height);

        var pharmacy = getSelectedPharmacy();
        if (pharmacy && overlay.pharmacyLabel) {
          drawPharmacyLabel(ctx, rect.width, overlay.pharmacyLabel, pharmacy.name);
        }

        return new Promise(function (resolve, reject) {
          var qrImg = new Image();
          qrImg.onload = function () {
            var inset = rect.inset || 0;
            var innerX = rect.x + inset;
            var innerY = rect.y + inset;
            var innerSize = rect.size - inset * 2;
            var qrSize = innerSize - rect.pad * 2;
            var qrX = innerX + rect.pad;
            var qrY = innerY + rect.pad;

            if (inset || rect.pad) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(innerX, innerY, innerSize, innerSize);
            }
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            resolve({
              dataUrl: canvas.toDataURL(overlay.mime, overlay.quality),
              width: rect.width,
              height: rect.height
            });
          };
          qrImg.onerror = function () {
            reject(new Error('ترکیب QR با قالب ممکن نشد.'));
          };
          qrImg.src = qrDataUrl;
        });
      });
    });
  }

  function updateTemplatePreviews() {
    var qrDataUrl = getQrSourceDataUrl();
    var wrap = $('utm-template-previews');
    if (!qrDataUrl || !wrap) return;

    composeTemplate('poster', qrDataUrl).then(function (result) {
      var img = $('poster-preview-img');
      if (img) img.src = result.dataUrl;
    }).catch(function () {
      /* previews are optional */
    });

    wrap.hidden = false;
  }

  function getQrImageElement() {
    var wrap = $('qr-canvas');
    if (!wrap) return null;
    return wrap.querySelector('img') || wrap.querySelector('canvas');
  }

  function downloadQr() {
    var filename = buildDownloadFilename('qr-code', 'png');
    var source = getQrSourceDataUrl();

    if (!source) return;
    exportQrImage(source, filename);
  }

  function downloadTemplate(templateKey) {
    var overlay = QR_OVERLAYS[templateKey];
    var qrDataUrl = getQrSourceDataUrl();
    if (!overlay || !qrDataUrl) return;

    var ext = overlay.mime === 'image/jpeg' ? 'jpg' : 'png';
    var filename = buildDownloadFilename('poster-tracket', ext);
    var label = 'پوستر';

    composeTemplate(templateKey, qrDataUrl)
      .then(function (result) {
        triggerDownload(result.dataUrl, filename);
        showToast(label + ' دانلود شد', 'فایل ' + result.width + '×' + result.height + ' پیکسل با QR شما آماده چاپ است.');
      })
      .catch(function (err) {
        showToast('خطا در ساخت فایل', err.message || 'لطفاً دوباره تلاش کنید.');
      });
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
      if (preset.source === 'pharmacy') {
        populatePharmacySelect();
      } else {
        $('utm_content_input').value = preset.content;
      }
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

    $('utm_content_input').addEventListener('input', function (e) {
      e.target.value = sanitizeContent(e.target.value);
      $('utm_content').value = e.target.value;
      updateLink();
    });

    $('utm_pharmacy').addEventListener('change', function (e) {
      $('utm_content').value = e.target.value;
      lastQrUrl = '';
      updateLink();
    });

    $('copy-link-btn').addEventListener('click', copyLink);
    $('test-link-btn').addEventListener('click', testLink);
    $('download-qr-btn').addEventListener('click', downloadQr);
    $('download-poster-btn').addEventListener('click', function () {
      downloadTemplate('poster');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    loadPharmacies().finally(function () {
      var firstLanding = document.querySelector('.utm-choice[data-landing].utm-choice--active');
      if (firstLanding) state.landing = firstLanding.dataset.landing;
      var firstSource = document.querySelector('.utm-choice[data-source]');
      if (firstSource) setSource(firstSource.dataset.source, firstSource);
      else updateLink();
    });
  });
})();
