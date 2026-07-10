(function () {
  'use strict';

  var DATA_URL = 'assets/data/pharmacies.json';
  var allPharmacies = [];
  var debounceTimer;
  var TEHRAN = 'تهران';

  var NAV_APPS = [
    {
      id: 'google',
      name: 'گوگل مپ',
      color: '#4285F4',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
      url: function (pharmacy) {
        if (pharmacy.maps_url) return pharmacy.maps_url;
        return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(navSearchQuery(pharmacy));
      }
    },
    {
      id: 'balad',
      name: 'بلد',
      color: '#1E4B8F',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#1E4B8F"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="sans-serif">B</text></svg>',
      url: function (pharmacy) {
        var coords = getCoords(pharmacy);
        if (coords) {
          return 'https://balad.ir/location?latitude=' + coords.lat + '&longitude=' + coords.lng;
        }
        return 'https://balad.ir/search?q=' + encodeURIComponent(navSearchQuery(pharmacy));
      }
    },
    {
      id: 'neshan',
      name: 'نشان',
      color: '#F05A24',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#F05A24"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="sans-serif">N</text></svg>',
      url: function (pharmacy) {
        var coords = getCoords(pharmacy);
        if (coords) {
          return 'https://neshan.org/maps/@' + coords.lat + ',' + coords.lng + ',17z';
        }
        return 'https://neshan.org/maps/search/' + encodeURIComponent(navSearchQuery(pharmacy));
      }
    },
    {
      id: 'snapp',
      name: 'اسنپ',
      color: '#00D170',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="#00D170"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="sans-serif">Sn</text></svg>',
      url: function (pharmacy) {
        var coords = getCoords(pharmacy);
        if (coords) {
          return 'https://app.snapp.taxi/pre-ride?destination_lat=' + coords.lat + '&destination_lng=' + coords.lng;
        }
        return 'https://app.snapp.taxi/deeplink/map_search?query=' + encodeURIComponent(navSearchQuery(pharmacy));
      }
    }
  ];

  function getCoords(pharmacy) {
    var lat = Number(pharmacy.lat);
    var lng = Number(pharmacy.lng);
    // Iran approximate bounds — reject bad resolves (e.g. Dubai defaults)
    if (!isFinite(lat) || !isFinite(lng)) return null;
    if (lat < 25 || lat > 40 || lng < 44 || lng > 64) return null;
    return { lat: lat, lng: lng };
  }

  function navSearchQuery(pharmacy) {
    var address = (pharmacy.address || '').trim();
    if (address) return address;
    return ('داروخانه ' + (pharmacy.name || '')).trim();
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function toFaNum(n) {
    return String(n).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
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
    } else if (digits.indexOf('041') === 0 && digits.length > 3) {
      formatted = '041-' + digits.slice(3);
    } else if (digits.indexOf('09') === 0 && digits.length === 11) {
      formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    } else if (digits.length > 4) {
      formatted = digits.slice(0, 3) + '-' + digits.slice(3);
    }

    return toFaNum(formatted);
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

  function tehranRegions() {
    return uniqueSorted(
      allPharmacies.filter(function (p) { return p.city === TEHRAN; }),
      'region'
    );
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

  function updateRegionFilter() {
    var citySelect = $('#filter-city');
    var regionSelect = $('#filter-region');
    var regionGroup = regionSelect ? regionSelect.closest('.pharmacy-filter') : null;
    if (!citySelect || !regionSelect || !regionGroup) return;

    var city = citySelect.value;
    var showRegion = !city || city === TEHRAN;

    regionGroup.hidden = !showRegion;
    regionSelect.disabled = !showRegion;

    if (!showRegion) {
      regionSelect.value = '';
      return;
    }

    populateSelect(regionSelect, tehranRegions(), 'همه مناطق');
  }

  function getFilters() {
    return {
      q: ($('#pharmacy-search').value || '').trim().toLowerCase(),
      city: $('#filter-city').value,
      region: $('#filter-region').value
    };
  }

  function activeFilterCount(filters) {
    var count = 0;
    if (filters.q) count += 1;
    if (filters.city) count += 1;
    if (filters.region) count += 1;
    return count;
  }

  function matches(pharmacy, filters) {
    if (filters.city && pharmacy.city !== filters.city) return false;
    if (filters.region && pharmacy.region !== filters.region) return false;
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
          ((pharmacy.maps_url || pharmacy.address || pharmacy.name) ? '<button type="button" class="btn btn--primary pharmacy-card__btn pharmacy-card__nav-btn" data-pharmacy-id="' + pharmacy.id + '">مسیریابی</button>' : '') +
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

  function renderNavApps(pharmacy) {
    var container = $('#pharmacy-nav-apps');
    if (!container) return;
    container.innerHTML = NAV_APPS.map(function (app) {
      return (
        '<a class="nav-modal__app" href="' + app.url(pharmacy) + '" target="_blank" rel="noopener noreferrer" style="--nav-app-color:' + app.color + '">' +
          '<span class="nav-modal__app-icon">' + app.icon + '</span>' +
          '<span class="nav-modal__app-name">' + app.name + '</span>' +
        '</a>'
      );
    }).join('');
  }

  function openNavModal(pharmacyId) {
    var pharmacy = allPharmacies.find(function (p) { return String(p.id) === String(pharmacyId); });
    if (!pharmacy) return;

    var modal = $('#pharmacy-nav-modal');
    var addressEl = $('#pharmacy-nav-address');
    if (!modal) return;

    if (addressEl) {
      addressEl.textContent = pharmacy.address
        ? pharmacy.address
        : ('داروخانه ' + (pharmacy.name || ''));
    }
    renderNavApps(pharmacy);
    modal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeNavModal() {
    var modal = $('#pharmacy-nav-modal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function initNavModal() {
    var modal = $('#pharmacy-nav-modal');
    if (!modal) return;

    modal.querySelectorAll('[data-nav-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeNavModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeNavModal();
    });
  }

  function initGridClicks() {
    var grid = $('#pharmacy-grid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-pharmacy-id]');
      if (!btn) return;
      openNavModal(btn.getAttribute('data-pharmacy-id'));
    });
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
    updateRegionFilter();
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

  function scrollToResults() {
    var target = $('#pharmacy-grid') || $('#pharmacy-empty');
    if (!target) return;

    var sticky = document.querySelector('.pharmacy-sticky-bar');
    var offset = sticky ? sticky.offsetHeight + 12 : 12;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });
  }

  function applyFiltersAndClose() {
    render();
    closeModal();
    requestAnimationFrame(function () {
      scrollToResults();
    });
  }

  function initModal() {
    var modal = $('#pharmacy-filter-modal');
    var openBtn = $('#pharmacy-filter-open');
    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', openModal);

    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.id === 'pharmacy-modal-apply') {
          applyFiltersAndClose();
          return;
        }
        closeModal();
      });
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
    updateRegionFilter();

    ['#pharmacy-search', '#filter-city', '#filter-region'].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      el.addEventListener('input', onFilterChange);
      if (el.tagName === 'SELECT') el.addEventListener('change', render);
    });

    var citySelect = $('#filter-city');
    if (citySelect) {
      citySelect.addEventListener('change', function () {
        updateRegionFilter();
        render();
      });
    }

    var resetBtn = $('#pharmacy-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    var modalResetBtn = $('#pharmacy-modal-reset');
    if (modalResetBtn) modalResetBtn.addEventListener('click', resetFilters);

    initModal();
    initNavModal();
    initGridClicks();
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
