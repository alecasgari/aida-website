(function () {
  'use strict';

  function getCurrentPage() {
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function setActiveNav() {
    var page = getCurrentPage();

    document.querySelectorAll('.header__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('header__link--active');
      }
    });

    document.querySelectorAll('.bottom-nav__item').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('bottom-nav__item--active');
      }
    });
  }

  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var targets = document.querySelectorAll(
      '.section .container > *:not(.card-grid):not(.split):not(.bar-chart):not(.timeline):not(.hpv-types), ' +
      '.card, .impact-box, .split > *, .cta-band .container > *, .form-page:not(.aida-stats), .thankyou, .aida-stats'
    );

    targets.forEach(function (el) {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });

    document.querySelectorAll('.card-grid .card').forEach(function (card) {
      card.classList.add('reveal');
    });

    var charts = document.querySelectorAll('.bar-chart-wrap, .bar-chart, .sero-chart, .timeline');
    charts.forEach(function (el) {
      el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .impact-box, .bar-chart-wrap, .bar-chart, .sero-chart, .timeline').forEach(function (el) {
      observer.observe(el);
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initScrollReveal();
    initHeaderScroll();

    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    var codeEl = document.getElementById('tracking-code');

    if (codeEl && ref) {
      codeEl.textContent = decodeURIComponent(ref);
    }

    var copyBtn = document.getElementById('copy-code');
    if (copyBtn && codeEl) {
      copyBtn.addEventListener('click', function () {
        var text = codeEl.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'کپی شد!';
            setTimeout(function () {
              copyBtn.textContent = 'کپی کد';
            }, 2000);
          });
        }
      });
    }
  });
})();
