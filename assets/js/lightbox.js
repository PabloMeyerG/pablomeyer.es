/* ===========================================================
   Lightbox — Pablo Meyer (galería)
   -----------------------------------------------------------
   Selecciona automáticamente .gallery-item dentro de
   #gallery-masonry. Si JS falla, los <a> siguen funcionando
   como descarga de la imagen original (fallback nativo).

   Soporta:
   - Click / tap para abrir
   - ← / → para navegar
   - ESC para cerrar
   - Swipe horizontal en mobile
   =========================================================== */

(function () {
  'use strict';

  function ready(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else { cb(); }
  }

  ready(function () {
    var root = document.getElementById('gallery-masonry');
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll('.gallery-item'));
    if (!items.length) return;

    // Construir overlay
    var overlay = document.createElement('div');
    overlay.className = 'pm-lb';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<button class="pm-lb-close" type="button" aria-label="Cerrar">&times;</button>' +
      '<button class="pm-lb-prev" type="button" aria-label="Anterior">&#8249;</button>' +
      '<button class="pm-lb-next" type="button" aria-label="Siguiente">&#8250;</button>' +
      '<div class="pm-lb-stage">' +
        '<picture class="pm-lb-pic">' +
          '<source class="pm-lb-source" srcset="" type="image/webp">' +
          '<img class="pm-lb-img" src="" alt="">' +
        '</picture>' +
        '<p class="pm-lb-caption" id="pm-lb-caption"></p>' +
        '<p class="pm-lb-count" aria-hidden="true"></p>' +
      '</div>';

    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector('.pm-lb-img');
    var srcEl = overlay.querySelector('.pm-lb-source');
    var capEl = overlay.querySelector('.pm-lb-caption');
    var cntEl = overlay.querySelector('.pm-lb-count');
    var prevBtn = overlay.querySelector('.pm-lb-prev');
    var nextBtn = overlay.querySelector('.pm-lb-next');
    var closeBtn = overlay.querySelector('.pm-lb-close');

    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      var fullSrc = item.getAttribute('href') || '';
      var img = item.querySelector('img');
      var alt = img ? img.getAttribute('alt') || '' : '';
      var webpSource = item.querySelector('source');
      var webpSrcset = webpSource ? webpSource.getAttribute('srcset') || '' : '';

      imgEl.src = fullSrc;
      imgEl.alt = alt;
      srcEl.srcset = webpSrcset;
      capEl.textContent = alt;
      cntEl.textContent = (current + 1) + ' / ' + items.length;
    }

    function open(i) {
      lastFocus = document.activeElement;
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
      // limpiar src para liberar memoria en móviles
      setTimeout(function () {
        if (!overlay.classList.contains('pm-lb-visible')) {
          imgEl.removeAttribute('src');
          srcEl.removeAttribute('srcset');
        }
      }, 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // Wire each item
    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        // mantener fallback si Cmd/Ctrl/Shift/middle-click (abrir en nueva pestaña)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        open(i);
      });
    });

    // Controles
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('pm-lb-stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('pm-lb-visible')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });

    // Swipe (touch)
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
