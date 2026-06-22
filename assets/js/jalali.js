(function (global) {
  'use strict';

  function div(a, b) {
    return ~~(a / b);
  }

  function toJalaali(gy, gm, gd) {
    var gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var gy2 = gm > 2 ? gy + 1 : gy;
    var days =
      355666 +
      365 * gy +
      div(gy2 + 3, 4) -
      div(gy2 + 99, 100) +
      div(gy2 + 399, 400) +
      gd +
      gdm[gm - 1];
    var jy = -1595 + 33 * div(days, 12053);
    days %= 12053;
    jy += 4 * div(days, 1461);
    days %= 1461;
    if (days > 365) {
      jy += div(days - 1, 365);
      days = (days - 1) % 365;
    }
    var jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
    var jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return { jy: jy, jm: jm, jd: jd };
  }

  function toGregorian(jy, jm, jd) {
    jy += 1595;
    var days =
      -355668 +
      365 * jy +
      div(jy, 33) * 8 +
      div((jy % 33) + 3, 4) +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    var gy = 400 * div(days, 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * div(--days, 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * div(days, 1461);
    days %= 1461;
    if (days > 365) {
      gy += div(days - 1, 365);
      days = (days - 1) % 365;
    }
    var gd = days + 1;
    var sal = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var gm = 0;
    for (gm = 1; gm <= 12 && gd > sal[gm]; gm++) {
      gd -= sal[gm];
    }
    return { gy: gy, gm: gm, gd: gd };
  }

  function isLeapJalaaliYear(jy) {
    var r = jy % 33;
    return r === 1 || r === 5 || r === 9 || r === 13 || r === 17 || r === 22 || r === 26 || r === 30;
  }

  function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaaliYear(jy) ? 30 : 29;
  }

  function isValidJalaaliDate(jy, jm, jd) {
    return (
      jy >= 1300 &&
      jy <= 1500 &&
      jm >= 1 &&
      jm <= 12 &&
      jd >= 1 &&
      jd <= jalaaliMonthLength(jy, jm)
    );
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function jalaaliToIso(jy, jm, jd) {
    var g = toGregorian(jy, jm, jd);
    return g.gy + '-' + pad2(g.gm) + '-' + pad2(g.gd);
  }

  function isoToJalaali(iso) {
    var parts = iso.split('-');
    if (parts.length !== 3) return null;
    var gy = parseInt(parts[0], 10);
    var gm = parseInt(parts[1], 10);
    var gd = parseInt(parts[2], 10);
    if (!gy || !gm || !gd) return null;
    return toJalaali(gy, gm, gd);
  }

  function formatJalaali(jy, jm, jd) {
    return jy + '/' + pad2(jm) + '/' + pad2(jd);
  }

  function faDigits(str) {
    return String(str).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
  }

  global.AidaJalali = {
    toJalaali: toJalaali,
    toGregorian: toGregorian,
    isValidJalaaliDate: isValidJalaaliDate,
    jalaaliMonthLength: jalaaliMonthLength,
    jalaaliToIso: jalaaliToIso,
    isoToJalaali: isoToJalaali,
    formatJalaali: formatJalaali,
    faDigits: faDigits
  };
})(window);
