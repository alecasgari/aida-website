(function () {
  'use strict';

  /* ── آمار پویش — این اعداد را دستی یا از API به‌روز کنید ── */
  var STATS = {
    participants: 169,
    freeRatio: 10,
    goal: 100000,
    provinces: 2,
    cities: 4
  };

  var STATS_API_URL = '';

  function faNum(n) {
    return Number(n).toLocaleString('fa-IR');
  }

  function calcDerived() {
    var free = Math.floor(STATS.participants / STATS.freeRatio);
    var progress = STATS.goal > 0 ? Math.min(100, (STATS.participants / STATS.goal) * 100) : 0;
    return { free: free, progress: progress };
  }

  function renderFull(el) {
    var d = calcDerived();
    el.innerHTML =
      '<div class="stats-board__header">' +
        '<span class="stats-board__live"><span class="stats-board__dot" aria-hidden="true"></span>آمار زنده پویش</span>' +
        '<h2 class="stats-board__title">هر مشارکت، یک سهم برای آیدا</h2>' +
        '<p class="stats-board__desc">به ازای هر ۱۰ مشارکت، ۱ واکسیناسیون رایگان؛ و این اعداد هر روز بیشتر می‌شوند</p>' +
      '</div>' +
      '<div class="stats-flow" aria-hidden="true">' +
        '<div class="stats-flow__side stats-flow__side--in">' +
          '<span class="stats-flow__num" data-count="' + STATS.participants + '">۰</span>' +
          '<span class="stats-flow__txt">مشارکت</span>' +
        '</div>' +
        '<div class="stats-flow__mid">' +
          '<span class="stats-flow__ratio">÷ ۱۰</span>' +
          '<svg class="stats-flow__arrow" viewBox="0 0 48 24" fill="none"><path d="M4 12h32M28 6l8 6-8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<div class="stats-flow__side stats-flow__side--out">' +
          '<span class="stats-flow__num stats-flow__num--accent" data-count="' + d.free + '">۰</span>' +
          '<span class="stats-flow__txt">واکسیناسیون رایگان</span>' +
        '</div>' +
      '</div>' +
      '<div class="stats-grid">' +
        statCard('participants', STATS.participants, 'نفر به پویش پیوستند', '👥', 'primary') +
        statCard('free', d.free, 'نفر تحت پوشش واکسیناسیون رایگان', '💚', 'accent') +
        statCard('provinces', STATS.provinces, 'استان در جریان پویش', '🗺️', 'purple') +
        statCard('cities', STATS.cities, 'شهر با مشارکت ثبت‌شده', '📍', 'coral') +
      '</div>' +
      '<div class="stats-goal">' +
        '<div class="stats-goal__top">' +
          '<span>پیشرفت تا هدف ' + faNum(STATS.goal) + ' مشارکت</span>' +
          '<strong data-count="' + Math.round(d.progress) + '" data-suffix="%">۰٪</strong>' +
        '</div>' +
        '<div class="stats-goal__track"><div class="stats-goal__fill" style="width:0%" data-width="' + d.progress + '%"></div></div>' +
        '<p class="stats-goal__hint">با ثبت مشارکت شما، این نوار یک قدم جلوتر می‌رود</p>' +
      '</div>';
  }

  function renderCompact(el) {
    var d = calcDerived();
    el.innerHTML =
      '<div class="stats-strip">' +
        '<div class="stats-strip__live"><span class="stats-board__dot"></span> هم‌اکنون</div>' +
        '<div class="stats-strip__items">' +
          '<div class="stats-strip__item">' +
            '<span class="stats-strip__num" data-count="' + STATS.participants + '">۰</span>' +
            '<span class="stats-strip__label">مشارکت</span>' +
          '</div>' +
          '<span class="stats-strip__divider">→</span>' +
          '<div class="stats-strip__item stats-strip__item--accent">' +
            '<span class="stats-strip__num" data-count="' + d.free + '">۰</span>' +
            '<span class="stats-strip__label">پوشش رایگان</span>' +
          '</div>' +
          '<span class="stats-strip__divider">·</span>' +
          '<div class="stats-strip__item">' +
            '<span class="stats-strip__num" data-count="' + Math.round(d.progress) + '" data-suffix="%">۰</span>' +
            '<span class="stats-strip__label">پیشرفت هدف</span>' +
          '</div>' +
        '</div>' +
        '<p class="stats-strip__msg">شما می‌توانید <strong>نفر بعدی</strong> باشید</p>' +
      '</div>';
  }

  function statCard(id, value, label, emoji, tone) {
    return (
      '<article class="stats-card stats-card--' + tone + '">' +
        '<span class="stats-card__emoji" aria-hidden="true">' + emoji + '</span>' +
        '<span class="stats-card__num" data-count="' + value + '">۰</span>' +
        '<span class="stats-card__label">' + label + '</span>' +
      '</article>'
    );
  }

  function animateCount(el, target, suffix, duration) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = faNum(target) + (suffix || '');
      return;
    }
    var start = 0;
    var startTime = null;
    duration = duration || 1400;

    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = faNum(current) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runAnimations(root) {
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      animateCount(el, target, suffix);
    });

    var fill = root.querySelector('.stats-goal__fill');
    if (fill) {
      var w = fill.getAttribute('data-width') || '0%';
      setTimeout(function () {
        fill.style.width = w;
      }, 400);
    }
  }

  function mount() {
    document.querySelectorAll('.aida-stats').forEach(function (el) {
      var variant = el.getAttribute('data-variant') || 'full';
      if (variant === 'compact') renderCompact(el);
      else renderFull(el);

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runAnimations(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        obs.observe(el);
      } else {
        runAnimations(el);
      }
    });
  }

  function fetchStats() {
    if (!STATS_API_URL) return Promise.resolve();
    return fetch(STATS_API_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.participants != null) STATS.participants = data.participants;
        if (data.goal != null) STATS.goal = data.goal;
        if (data.provinces != null) STATS.provinces = data.provinces;
        if (data.cities != null) STATS.cities = data.cities;
        if (data.freeRatio != null) STATS.freeRatio = data.freeRatio;
      })
      .catch(function () { /* از مقادیر پیش‌فرض استفاده می‌شود */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetchStats().then(mount);
  });

  window.AidaStats = { config: STATS, refresh: mount };
})();
