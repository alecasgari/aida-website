(function () {
  'use strict';

  var MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  var WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function todayJalaali() {
    var now = new Date();
    return window.AidaJalali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function jalaaliWeekday(jy, jm, jd) {
    var g = window.AidaJalali.toGregorian(jy, jm, jd);
    var d = new Date(g.gy, g.gm - 1, g.gd);
    return (d.getDay() + 1) % 7;
  }

  function initShamsiDate(root) {
    var display = root.querySelector('.shamsi-date__display');
    var hidden = root.querySelector('.shamsi-date__value');
    var popup = root.querySelector('.shamsi-date__popup');
    var trigger = root.querySelector('.shamsi-date__trigger');
    var title = root.querySelector('.shamsi-date__title');
    var grid = root.querySelector('.shamsi-date__grid');
    var prevBtn = root.querySelector('[data-shamsi-prev]');
    var nextBtn = root.querySelector('[data-shamsi-next]');

    if (!display || !hidden || !popup || !grid) return;

    var view = todayJalaali();
    var selected = null;

    function setValue(jy, jm, jd) {
      if (!window.AidaJalali.isValidJalaaliDate(jy, jm, jd)) return;
      selected = { jy: jy, jm: jm, jd: jd };
      hidden.value = window.AidaJalali.jalaaliToIso(jy, jm, jd);
      display.value = window.AidaJalali.faDigits(window.AidaJalali.formatJalaali(jy, jm, jd));
      root.classList.add('shamsi-date--filled');
      var group = root.closest('.form-group');
      if (group) group.classList.remove('is-invalid');
      closePopup();
    }

    function clearValue() {
      selected = null;
      hidden.value = '';
      display.value = '';
      root.classList.remove('shamsi-date--filled');
    }

    function render() {
      title.textContent =
        window.AidaJalali.faDigits(view.jy) + ' ' + MONTHS[view.jm - 1];
      grid.innerHTML = '';

      WEEKDAYS.forEach(function (wd) {
        var head = document.createElement('span');
        head.className = 'shamsi-date__wd';
        head.textContent = wd;
        grid.appendChild(head);
      });

      var firstWd = jalaaliWeekday(view.jy, view.jm, 1);
      var len = window.AidaJalali.jalaaliMonthLength(view.jy, view.jm);
      var today = todayJalaali();

      for (var i = 0; i < firstWd; i++) {
        var blank = document.createElement('span');
        blank.className = 'shamsi-date__day shamsi-date__day--blank';
        grid.appendChild(blank);
      }

      for (var day = 1; day <= len; day++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'shamsi-date__day';
        btn.textContent = window.AidaJalali.faDigits(day);

        var isFuture =
          view.jy > today.jy ||
          (view.jy === today.jy && view.jm > today.jm) ||
          (view.jy === today.jy && view.jm === today.jm && day > today.jd);

        if (isFuture) {
          btn.disabled = true;
          btn.classList.add('shamsi-date__day--disabled');
        }

        if (
          today.jy === view.jy &&
          today.jm === view.jm &&
          today.jd === day
        ) {
          btn.classList.add('shamsi-date__day--today');
        }

        if (
          selected &&
          selected.jy === view.jy &&
          selected.jm === view.jm &&
          selected.jd === day
        ) {
          btn.classList.add('shamsi-date__day--selected');
        }

        (function (d) {
          btn.addEventListener('click', function () {
            setValue(view.jy, view.jm, d);
          });
        })(day);

        grid.appendChild(btn);
      }
    }

    function openPopup() {
      if (selected) {
        view = { jy: selected.jy, jm: selected.jm, jd: selected.jd };
      } else {
        view = todayJalaali();
      }
      render();
      popup.hidden = false;
      root.classList.add('shamsi-date--open');
    }

    function closePopup() {
      popup.hidden = true;
      root.classList.remove('shamsi-date--open');
    }

    function changeMonth(delta) {
      view.jm += delta;
      if (view.jm > 12) {
        view.jm = 1;
        view.jy++;
      } else if (view.jm < 1) {
        view.jm = 12;
        view.jy--;
      }
      render();
    }

    trigger.addEventListener('click', function () {
      if (popup.hidden) openPopup();
      else closePopup();
    });

    display.addEventListener('click', openPopup);

    if (prevBtn) prevBtn.addEventListener('click', function () { changeMonth(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { changeMonth(1); });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) closePopup();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });

    root.AidaShamsiDate = { clear: clearValue, getIso: function () { return hidden.value; } };
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-shamsi-date]').forEach(initShamsiDate);
  });
})();
