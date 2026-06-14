(function () {
  'use strict';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORAGE_KEY = 'aida_utm';

  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function loadStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveStored(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* ignore */
    }
  }

  function capture() {
    var params = getParams();
    var stored = loadStored();
    var changed = false;

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value && !stored[key]) {
        stored[key] = value;
        changed = true;
      }
    });

    if (changed) {
      saveStored(stored);
    }
  }

  function getUtmData() {
    return loadStored();
  }

  function appendToFormData(formData) {
    var utm = getUtmData();
    UTM_KEYS.forEach(function (key) {
      if (utm[key]) {
        formData.append(key, utm[key]);
      }
    });
    formData.append('page_url', window.location.href);
    formData.append('submitted_at', new Date().toISOString());
    formData.append('user_agent', navigator.userAgent || '');
  }

  capture();

  window.AidaUtm = {
    get: getUtmData,
    appendToFormData: appendToFormData
  };
})();
