/* ===========================================================
   Lightbox — Pablo Meyer (Playground)
   -----------------------------------------------------------
   Abre cualquier enlace con [data-lb]. El href es la imagen
   grande: si el JS falla, el enlace sigue abriendo la pieza.
   Pie de foto: data-title + data-meta del propio enlace.

   - Click / tap para abrir; click fuera de la imagen cierra
   - ← / → y botones para navegar; swipe horizontal en tactil
   - ESC cierra; el foco queda atrapado dentro mientras esta
     abierto y vuelve a la pieza que se estaba viendo
   - El body no hace scroll mientras esta abierto
   =========================================================== */

(function () {
  'use strict';

  function ready(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else { cb(); }
  }

  ready(function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lb]'));
    if (!items.length) return;

    var T = document.documentElement.lang === 'es'
      ? { close: 'Cerrar', prev: 'Pieza anterior', next: 'Pieza siguiente' }
      : { close: 'Close', prev: 'Previous piece', next: 'Next piece' };

    var overlay = document.createElement('div');
    overlay.className = 'pm-lb';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-labelledby', 'pm-lb-title');
    overlay.innerHTML =
      '<button class="pm-lb-close" type="button" aria-label="' + T.close + '">&times;</button>' +
      '<button class="pm-lb-prev" type="button" aria-label="' + T.prev + '">&#8249;</button>' +
      '<button class="pm-lb-next" type="button" aria-label="' + T.next + '">&#8250;</button>' +
      '<div class="pm-lb-stage">' +
        '<picture class="pm-lb-pic">' +
          '<source class="pm-lb-source" type="image/webp">' +
          '<img class="pm-lb-img" alt="">' +
        '</picture>' +
        '<p class="pm-lb-caption">' +
          '<span class="pm-lb-title" id="pm-lb-title"></span>' +
          '<span class="pm-lb-meta"></span>' +
          '<span class="pm-lb-count" aria-hidden="true"></span>' +
        '</p>' +
      '</div>';

    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector('.pm-lb-img');
    var srcEl = overlay.querySelector('.pm-lb-source');
    var titleEl = overlay.querySelector('.pm-lb-title');
    var metaEl = overlay.querySelector('.pm-lb-meta');
    var cntEl = overlay.querySelector('.pm-lb-count');
    var prevBtn = overlay.querySelector('.pm-lb-prev');
    var nextBtn = overlay.querySelector('.pm-lb-next');
    var closeBtn = overlay.querySelector('.pm-lb-close');

    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      var img = item.querySelector('img');
      var webp = item.querySelector('source');

      srcEl.srcset = webp ? webp.getAttribute('srcset') || '' : '';
      imgEl.src = item.getAttribute('href') || '';
      imgEl.alt = img ? img.getAttribute('alt') || '' : '';
      titleEl.textContent = item.getAttribute('data-title') || '';
      metaEl.textContent = item.getAttribute('data-meta') || '';
      cntEl.textContent = (current + 1) + ' / ' + items.length;
    }

    function isOpen() { return overlay.classList.contains('pm-lb-visible'); }

    function open(i) {
      show(i);
      overlay.classList.add('pm-lb-visible');
      overlay.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('pm-lb-locked');
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('pm-lb-visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('pm-lb-locked');
      // Liberar la imagen grande (memoria en moviles)
      setTimeout(function () {
        if (!isOpen()) {
          imgEl.removeAttribute('src');
          srcEl.removeAttribute('srcset');
        }
      }, 250);
      // Vuelve a la pieza que se estaba viendo (no a activeElement: en
      // Safari un clic no enfoca el enlace)
      items[current].focus();
    }

    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        // Cmd/Ctrl/Shift/clic central: comportamiento nativo del enlace
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        open(i);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });

    // Click en el fondo (no en la imagen, el pie ni los botones) cierra
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('pm-lb-stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        // aria-modal: el foco no debe escaparse a la pagina de detras
        var focusables = [closeBtn, prevBtn, nextBtn];
        var at = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var step = e.shiftKey ? -1 : 1;
        focusables[(at + step + focusables.length) % focusables.length].focus();
      }
    });

    var touchStartX = 0;
    var touchStartY = 0;
    overlay.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(current + 1);
        else show(current - 1);
      }
    }, { passive: true });
  });
})();
