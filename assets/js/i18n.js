/* ===========================================================
   i18n compartido — Pablo Meyer (páginas de proyecto)
   -----------------------------------------------------------
   Uso (al final del <body> de cada página de proyecto):

     <script src="../assets/js/i18n.js" defer></script>
     <script defer>
       window.pmI18nReady(function () {
         pmI18n.apply({
           es: { 'nav.about': 'Sobre mí', ... },
           en: { 'nav.about': 'About', ... }
         });
       });
     </script>
   =========================================================== */

(function () {
  'use strict';

  var STORAGE = 'lang';

  function getLang() {
    try {
      var s = localStorage.getItem(STORAGE);
      if (s === 'es' || s === 'en') return s;
    } catch (e) {}
    var html = document.documentElement.lang || 'es';
    return html.indexOf('en') === 0 ? 'en' : 'es';
  }

  function setLang(lang, dict) {
    var d = dict[lang] || dict.es || {};
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (d[k] !== undefined) el.innerHTML = d[k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (d[k] !== undefined) el.placeholder = d[k];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      if (d[k] !== undefined) el.setAttribute('aria-label', d[k]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-alt');
      if (d[k] !== undefined) el.setAttribute('alt', d[k]);
    });

    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'es' ? 'EN' : 'ES';

    try { localStorage.setItem(STORAGE, lang); } catch (e) {}
  }

  function apply(dict) {
    var current = getLang();
    setLang(current, dict);
    var btn = document.getElementById('lang-toggle');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var next = document.documentElement.lang === 'es' ? 'en' : 'es';
        setLang(next, dict);
      });
    }
  }

  window.pmI18n = { apply: apply, getLang: getLang };

  // helper para esperar al script (si se carga antes de DOM ready)
  window.pmI18nReady = function (cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  };
})();
