/* Coach — comportamiento de la pagina (EN y ES).
   Todo es mejora progresiva: sin JS la pagina se lee entera, con el
   primer paso del recorrido en el movil y el comparador al 50 %. */

/* Salvaguarda de la entrada al hacer scroll (case.js): nada se queda en
   opacity 0 esperando a una animacion si el observador no llega a
   dispararse (salto con ancla, scroll rapido, captura de pagina). */
(() => {
  const hidden = () => document.querySelectorAll('.fade-up:not(.visible)');
  const show = el => el.classList.add('visible');
  if (!('IntersectionObserver' in window)) { hidden().forEach(show); return; }
  let t;
  const sweep = () => hidden().forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); });
  window.addEventListener('load', () => setTimeout(sweep, 300));
  window.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(sweep, 150); }, { passive: true });
  window.addEventListener('resize', sweep);
  window.addEventListener('beforeprint', () => hidden().forEach(show));
})();

/* Manifiesto: envuelve cada palabra para que el CSS la encienda al
   pasar. El texto sigue siendo uno solo para el lector de pantalla
   (los span no anaden nada que leer). */
(() => {
  document.querySelectorAll('[data-reveal]').forEach(p => {
    const words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
  });
})();

/* Recorrido: el paso que cruza la franja de lectura activa su pantalla
   en el iPhone fijo. En movil la franja esta mas abajo, debajo del
   iPhone. */
(() => {
  const tour = document.querySelector('[data-tour]');
  if (!tour || !('IntersectionObserver' in window)) return;
  const steps = tour.querySelectorAll('.cx-step[data-step]');
  const shots = tour.querySelectorAll('.cx-shot[data-step]');
  const count = tour.querySelector('[data-tour-count]');
  const total = steps.length;
  let current = 0;

  const activate = n => {
    if (n === current) return;
    current = n;
    steps.forEach(s => s.classList.toggle('is-active', s.dataset.step === String(n)));
    shots.forEach(s => s.classList.toggle('is-active', s.dataset.step === String(n)));
    if (count) count.textContent = String(n).padStart(2, '0');
  };

  let io;
  const observe = () => {
    if (io) io.disconnect();
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) activate(Number(e.target.dataset.step)); });
    }, { rootMargin: mobile ? '-62% 0px -26% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  };

  tour.classList.add('is-ready');
  activate(1);
  observe();
  window.matchMedia('(max-width: 900px)').addEventListener('change', observe);
  if (total && count) count.textContent = '01';
})();

/* Today anotada: al pasar por una nota (o su punto) se ilumina su zona.
   Es un refuerzo visual; la lista ya explica cada punto por si sola. */
(() => {
  const fig = document.querySelector('[data-anno]');
  const legend = document.querySelector('.cx-legend');
  if (!fig || !legend) return;
  const hot = (n, on) => {
    fig.querySelectorAll('[data-n="' + n + '"]').forEach(el => el.classList.toggle('is-hot', on));
    const li = legend.querySelector('li[data-n="' + n + '"]');
    if (li) li.classList.toggle('is-hot', on);
  };
  legend.querySelectorAll('li[data-n]').forEach(li => {
    li.addEventListener('mouseenter', () => hot(li.dataset.n, true));
    li.addEventListener('mouseleave', () => hot(li.dataset.n, false));
  });
})();

/* Antes / despues: el range nativo (teclado, lector, tactil) mueve la linea */
(() => {
  document.querySelectorAll('[data-compare]').forEach(box => {
    const range = box.querySelector('input[type="range"]');
    if (!range) return;
    const set = () => {
      box.style.setProperty('--pos', range.value + '%');
      range.setAttribute('aria-valuetext', range.value + '% 2024, ' + (100 - range.value) + '% 2026');
    };
    range.addEventListener('input', set);
    set();
  });
})();

/* Video corto del producto: la seccion solo aparece si el archivo existe.
   Con «reducir movimiento» no se reproduce solo: se muestran controles. */
(() => {
  const slot = document.querySelector('[data-video-slot]');
  const video = slot && slot.querySelector('video[data-src]');
  if (!video) return;
  const src = video.getAttribute('data-src');
  fetch(src, { method: 'HEAD' }).then(res => {
    if (!res.ok) return;
    video.src = src;
    slot.hidden = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.controls = true; return; }
    video.autoplay = true;
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); });
    }, { threshold: 0.25 }).observe(video);
  }).catch(() => {});
})();
