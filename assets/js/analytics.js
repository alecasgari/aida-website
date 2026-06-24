(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  var PAGE_MAP = {
    '': 'home',
    'index.html': 'home',
    'hpv.html': 'hpv_awareness',
    'gardisun.html': 'gardisun_product',
    'register.html': 'register_form',
    'thank-you.html': 'thank_you',
    'utm.html': 'utm_builder'
  };

  var FORM_START_KEY = 'aida_form_start_sent';

  function getPageName() {
    var path = window.location.pathname.split('/').pop() || '';
    return PAGE_MAP[path] || 'home';
  }

  function getUtmPayload() {
    var utm = window.AidaUtm ? window.AidaUtm.get() : {};
    return {
      utm_source: utm.utm_source || '',
      utm_medium: utm.utm_medium || '',
      utm_campaign: utm.utm_campaign || '',
      utm_term: utm.utm_term || '',
      utm_content: utm.utm_content || ''
    };
  }

  function pushEvent(eventName, payload) {
    window.dataLayer.push(Object.assign({
      event: eventName
    }, getUtmPayload(), payload || {}));
  }

  function normalizeDestination(href) {
    if (!href) return '';
    try {
      var url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) {
        return url.pathname === '/' || url.pathname === '' ? '/' : url.pathname;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }

  function linkLabel(el) {
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text;
    var img = el.querySelector('img[alt]');
    return img ? img.getAttribute('alt') : '';
  }

  function resolveOutboundClick(el) {
    var link = el.closest('.footer__logos a[href]');
    if (!link) return null;

    var href = link.getAttribute('href') || '';
    var label = linkLabel(link);
    if (!label && href.indexOf('macsa.ir') !== -1) label = 'MACSA';
    if (!label && href.indexOf('gardisun.ir') !== -1) label = 'گاردیسان';
    if (!label && href.indexOf('biosunpharmed.com') !== -1) label = 'بیوسان فارمد';

    return {
      cta_label: label,
      cta_location: 'footer_partner',
      cta_destination: href
    };
  }

  function resolveCtaClick(el) {
    var link = el.closest('a[href], button');
    if (!link) return null;

    if (link.id === 'uid-help-btn') return null;
    if (link.id === 'copy-code' || link.closest('.file-drop')) return null;

    if (link.id === 'submit-btn') {
      return {
        cta_label: 'ثبت مشارکت',
        cta_location: 'form_submit',
        cta_destination: '/thank-you.html'
      };
    }

    if (link.closest('.thankyou') && link.matches('a.btn--primary')) {
      return {
        cta_label: 'بازگشت به صفحه اصلی',
        cta_location: 'thank_you_primary',
        cta_destination: '/'
      };
    }

    if (link.closest('.bottom-nav__item--cta')) {
      return {
        cta_label: 'ثبت',
        cta_location: 'bottom_nav',
        cta_destination: normalizeDestination(link.getAttribute('href'))
      };
    }

    if (link.classList.contains('header__cta-mobile')) {
      return {
        cta_label: 'ثبت مشارکت',
        cta_location: 'header_mobile',
        cta_destination: '/register.html'
      };
    }

    if (link.closest('.header__nav') && link.classList.contains('header__link--cta')) {
      return {
        cta_label: 'ثبت مشارکت',
        cta_location: 'header_nav',
        cta_destination: '/register.html'
      };
    }

    if (link.closest('.hero__actions')) {
      return {
        cta_label: linkLabel(link),
        cta_location: link.classList.contains('btn--primary') ? 'hero_primary' : 'hero_secondary',
        cta_destination: normalizeDestination(link.getAttribute('href'))
      };
    }

    if (getPageName() === 'home' && link.closest('.split') && (link.getAttribute('href') || '').indexOf('gardisun.html') !== -1) {
      return {
        cta_label: 'اطلاعات بیشتر درباره گاردیسان',
        cta_location: 'section_gardisun',
        cta_destination: '/gardisun.html'
      };
    }

    if (link.closest('.cta-band')) {
      return {
        cta_label: 'ثبت مشارکت',
        cta_location: getPageName() === 'home' ? 'cta_band' : 'section_cta',
        cta_destination: '/register.html'
      };
    }

    return null;
  }

  function initPageView() {
    pushEvent('aida_page_view', {
      page_name: getPageName(),
      page_path: window.location.pathname || '/',
      page_title: document.title || ''
    });
  }

  function initClickTracking() {
    document.addEventListener('click', function (e) {
      var pageName = getPageName();

      if (e.target.closest('#uid-help-btn')) {
        pushEvent('aida_uid_help_open', { page_name: 'register_form' });
        return;
      }

      var outbound = resolveOutboundClick(e.target);
      if (outbound) {
        pushEvent('aida_outbound_click', Object.assign({ page_name: pageName }, outbound));
        return;
      }

      var cta = resolveCtaClick(e.target);
      if (cta) {
        pushEvent('aida_cta_click', Object.assign({ page_name: pageName }, cta));
      }
    });
  }

  function initFormStart() {
    var form = document.getElementById('register-form');
    if (!form) return;

    function sendFormStart() {
      if (sessionStorage.getItem(FORM_START_KEY)) return;
      sessionStorage.setItem(FORM_START_KEY, '1');
      pushEvent('aida_form_start', {
        page_name: 'register_form',
        form_id: 'register-form'
      });
    }

    form.addEventListener('focusin', sendFormStart);
    form.addEventListener('change', function (ev) {
      if (ev.target && ev.target.type === 'file') sendFormStart();
    });
  }

  function initConversion() {
    if (getPageName() !== 'thank_you') return;

    var ref = new URLSearchParams(window.location.search).get('ref');
    pushEvent('aida_conversion', {
      page_name: 'thank_you',
      conversion_type: 'register_participation',
      has_tracking_code: !!(ref && String(ref).trim())
    });
  }

  window.AidaAnalytics = {
    push: pushEvent,
    getPageName: getPageName,
    getUtmPayload: getUtmPayload
  };

  document.addEventListener('DOMContentLoaded', function () {
    initPageView();
    initClickTracking();
    initFormStart();
    initConversion();
  });
})();
