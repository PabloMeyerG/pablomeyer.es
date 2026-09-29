/* ===========================================================
   Nav — Pablo Meyer
   -----------------------------------------------------------
   La misma cabecera (.nav-hero) en la home y en los casos:
   capsula que se recoge al bajar (.stuck), menu movil y pildora
   gris bajo el enlace activo (solo home, que decide el enlace
   segun la seccion) y boton «Back» (solo casos).
   Expone window.pmNav.moveIndicator para que la home la mueva.
   =========================================================== */

(function () {
  'use strict';

  var bar = document.querySelector('.nav-hero');
  if (!bar) return;

  var ES = document.documentElement.lang === 'es';
  var T = ES ? { open: 'Abrir menú', close: 'Cerrar menú' } : { open: 'Open menu', close: 'Close menu' };

  /* Selector EN / ES: cada enlace ya apunta a la misma pagina en el
     otro idioma; al pulsar se le suma el ancla actual (#experience...)
     para caer en el mismo punto. Sin redirecciones automaticas. */
  document.querySelectorAll('[data-lang-switch]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (location.hash) a.href = a.href.split('#')[0] + location.hash;
    });
  });

  /* Menu movil */
  var burger = document.getElementById('nav-burger');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    var sync = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? T.close : T.open);
      bar.classList.toggle('menu-open', open);
    };
    var closeMenu = function () { menu.classList.remove('open'); sync(false); };
    burger.addEventListener('click', function () { sync(menu.classList.toggle('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }

  /* Pildora bajo el enlace activo */
  var indicator = bar.querySelector('.nav-indicator');
  function moveIndicator() {
    if (!indicator) return;
    var active = bar.querySelector('.nav-links a.active');
    var host = active && active.parentElement;
    if (!host || !host.offsetParent) { indicator.classList.remove('on'); return; }
    indicator.style.width = (host.offsetWidth + 20) + 'px';
    indicator.style.transform = 'translateX(' + (host.offsetLeft - 10) + 'px)';
    indicator.classList.add('on');
  }
  window.addEventListener('resize', moveIndicator, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  /* Casi transparente arriba; se recoge al separarse del top */
  var raf = null;
  function onScroll() {
    raf = null;
    bar.classList.toggle('stuck', window.scrollY > 90);
    moveIndicator();
  }
  window.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* «Back» en los casos: si se llego desde la home, es el atras del
     navegador, que devuelve la home tal cual (misma altura, mismo caso
     abierto en el carril). Si no (enlace compartido, o se paso de un
     caso a otro), el href lleva a la home con el ancla del proyecto. */
  function cameFromHome() {
    if (!document.referrer || window.history.length < 2) return false;
    try {
      var ref = new URL(document.referrer);
      var home = new URL('../', location.href);
      return ref.origin === location.origin &&
        (ref.pathname === home.pathname || ref.pathname === home.pathname + 'index.html');
    } catch (err) { return false; }
  }
  document.querySelectorAll('[data-back]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!cameFromHome()) return;
      e.preventDefault();
      window.history.back();
    });
  });

  window.pmNav = { moveIndicator: moveIndicator };
})();
