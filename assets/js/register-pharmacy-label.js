(function () {
  'use strict';

  var LABEL_PREFIX = 'از طریق داروخانه ';
  var MAX_FONT_PX = 22;
  var MIN_FONT_PX = 14;

  var el = document.getElementById('register-pharmacy-label');
  if (!el) return;

  function fitLabelText(text) {
    var size = MAX_FONT_PX;
    el.textContent = text;
    el.style.fontSize = size + 'px';

    var maxWidth = el.clientWidth;
    if (!maxWidth) return;

    while (size > MIN_FONT_PX && el.scrollWidth > maxWidth) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }

  function showPharmacyLabel(name) {
    fitLabelText(LABEL_PREFIX + name);
    el.removeAttribute('aria-hidden');
  }

  function init() {
    var utm = window.AidaUtm && window.AidaUtm.get ? window.AidaUtm.get() : {};
    if (utm.utm_source !== 'pharmacy') return;

    var slug = (utm.utm_content || '').trim();
    if (!slug) return;

    fetch('assets/data/pharmacies.json')
      .then(function (res) {
        if (!res.ok) throw new Error('pharmacies.json');
        return res.json();
      })
      .then(function (data) {
        var pharmacies = data.pharmacies || [];
        var pharmacy = null;

        for (var i = 0; i < pharmacies.length; i++) {
          if (pharmacies[i].slug === slug) {
            pharmacy = pharmacies[i];
            break;
          }
        }

        if (pharmacy && pharmacy.name) {
          showPharmacyLabel(pharmacy.name);
        }
      })
      .catch(function () {
        /* ignore */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function () {
    if (!el.textContent) return;
    fitLabelText(el.textContent);
  });
})();
