(function () {
  'use strict';

  var DATA_URL = 'assets/data/pharmacies.json';
  var allPharmacies = [];
  var debounceTimer;

  function $(sel) {
    return document.querySelector(sel);
  }

  function toFaNum(n) {
    return String(n).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
  }

  function stockTier(stock) {
    if (stock == null) return '';
    if (stock > 500) return 'high';
    if (stock >= 200) return 'medium';
    return 'low';
  }

  function stockBadgeHtml() {
    return (
      '<span class="pharmacy-badge pharmacy-badge--available">' +
        '<svg class="pharmacy-badge__check" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        'دارای موجودی' +
      '</span>'
    );
  }

  function normalizePhone(phone) {
    return (phone || '').replace(/[^\d+]/g, '');
  }

  function formatPhoneDisplay(phone) {
    var digits = normalizePhone(phone);
    if (!digits) return '';

    var formatted = digits;
    if (digits.indexOf('021') === 0 && digits.length > 3) {
      formatted = '021-' + digits.slice(3);
    } else if (digits.indexOf('09') === 0 && digits.length === 11) {
      formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    } else if (digits.length > 4) {
      formatted = digits.slice(0, 3) + '-' + digits.slice(3);
    }

    return toFaNum(formatted);
  }

  function mapsUrl(address) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
  }

  function uniqueSorted(list, key) {
    var set = {};
    list.forEach(function (p) {
      var val = (p[key] || '').trim();
      if (val) set[val] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      return a.localeCompare(b, 'fa');
    });
  }

  function populateSelect(select, values, allLabel) {
    var current = select.value;
    select.innerHTML = '<option value="">' + allLabel + '</option>';
    values.forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
    if (current && values.indexOf(current) !== -1) {
      select.value = current;
    }
  }

  function getFilters() {
    return {
      q: ($('#pharmacy-search').value || '').trim().toLowerCase(),
      city: $('#filter-city').value,
      region: $('#filter-region').value,
      stock: $('#filter-stock').value
    };
  }

  function activeFilterCount(filters) {
    var count = 0;
    if (filters.q) count += 1;
    if (filters.city) count += 1;
    if (filters.region) count += 1;
    if (filters.stock) count += 1;
    return count;
  }

  function matches(pharmacy, filters) {
    if (filters.city && pharmacy.city !== filters.city) return false;
    if (filters.region && pharmacy.region !== filters.region) return false;
    if (filters.stock && stockTier(pharmacy.stock) !== filters.stock) return false;
    if (!filters.q) return true;
    var haystack = [
      pharmacy.name,
      pharmacy.city,
      pharmacy.region,
      pharmacy.address,
      pharmacy.phone
    ].join(' ').toLowerCase();
    return haystack.indexOf(filters.q) !== -1;
  }

  function renderCard(pharmacy) {
    var phone = pharmacy.phone || '';
    var tel = normalizePhone(phone);

    return (
      '<article class="pharmacy-card" data-id="' + pharmacy.id + '">' +
        '<header class="pharmacy-card__head">' +
          '<h2 class="pharmacy-card__title">' + escapeHtml(pharmacy.name) + '</h2>' +
          '<div class="pharmacy-card__badges">' +
            stockBadgeHtml() +
            '<span class="pharmacy-badge pharmacy-badge--city">' + escapeHtml(pharmacy.city) + '</span>' +
            (pharmacy.region ? '<span class="pharmacy-badge pharmacy-badge--region">' + escapeHtml(pharmacy.region) + '</span>' : '') +
          '</div>' +
        '</header>' +
        '<div class="pharmacy-card__body">' +
          (pharmacy.address ? '<p class="pharmacy-card__address">' + escapeHtml(pharmacy.address) + '</p>' : '') +
        '</div>' +
        '<footer class="pharmacy-card__actions">' +
          (tel ? '<a class="btn btn--outline pharmacy-card__btn" href="tel:' + tel + '"><span class="pharmacy-card__phone-wrap" dir="rtl">تماس: <span class="pharmacy-phone" dir="ltr">' + escapeHtml(formatPhoneDisplay(phone)) + '</span></span></a>' : '') +
          (pharmacy.address ? '<a class="btn btn--primary pharmacy-card__btn" href="' + mapsUrl(pharmacy.address) + '" target="_blank" rel="noopener noreferrer">مسیریابی</a>' : '') +
        '</footer>' +
      '</article>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateMeta(resultsCount) {
    var stickyMeta = $('#pharmacy-sticky-meta');
    if (stickyMeta) {
      stickyMeta.textContent = toFaNum(resultsCount) + ' داروخانه فعال';
    }
  }

  function updateBadge(filters) {
    var badge = $('#filter-badge');
    if (!badge) return;
    var count = activeFilterCount(filters);
    if (!count) {
      badge.hidden = true;
      badge.textContent = '';
      return;
    }
    badge.hidden = false;
    badge.textContent = toFaNum(count);
  }

  function render() {
    var filters = getFilters();
    var results = allPharmacies.filter(function (p) {
      return matches(p, filters);
    });

    var grid = $('#pharmacy-grid');
    var empty = $('#pharmacy-empty');

    if (!grid) return;

    if (results.length) {
      grid.innerHTML = results.map(renderCard).join('');
      grid.hidden = false;
      empty.hidden = true;
    } else {
      grid.innerHTML = '';
      grid.hidden = true;
      empty.hidden = false;
    }

    updateMeta(results.length);
    updateBadge(filters);
  }

  function resetFilters() {
    $('#pharmacy-search').value = '';
    $('#filter-city').value = '';
    $('#filter-region').value = '';
    $('#filter-stock').value = '';
    render();
  }

  function onFilterChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  }

  function openModal() {
    var modal = $('#pharmacy-filter-modal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    var search = $('#pharmacy-search');
    if (search) search.focus();
  }

  function closeModal() {
    var modal = $('#pharmacy-filter-modal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    var openBtn = $('#pharmacy-filter-open');
    if (openBtn) openBtn.focus();
  }

  function initModal() {
    var modal = $('#pharmacy-filter-modal');
    var openBtn = $('#pharmacy-filter-open');
    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function init(data) {
    allPharmacies = (data && data.pharmacies) ? data.pharmacies.slice() : [];
    allPharmacies.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'fa');
    });

    populateSelect($('#filter-city'), uniqueSorted(allPharmacies, 'city'), 'همه شهرها');
    populateSelect($('#filter-region'), uniqueSorted(allPharmacies, 'region'), 'همه محدوده‌ها');

    ['#pharmacy-search', '#filter-city', '#filter-region', '#filter-stock'].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      el.addEventListener('input', onFilterChange);
      if (el.tagName === 'SELECT') el.addEventListener('change', render);
    });

    var resetBtn = $('#pharmacy-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    var modalResetBtn = $('#pharmacy-modal-reset');
    if (modalResetBtn) modalResetBtn.addEventListener('click', resetFilters);

    initModal();
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('#pharmacy-grid')) return;

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('load failed');
        return res.json();
      })
      .then(init)
      .catch(function () {
        var grid = $('#pharmacy-grid');
        if (grid) {
          grid.innerHTML = '<p class="pharmacy-error">بارگذاری لیست داروخانه‌ها ممکن نشد. لطفاً بعداً دوباره تلاش کنید.</p>';
        }
      });
  });
})();
