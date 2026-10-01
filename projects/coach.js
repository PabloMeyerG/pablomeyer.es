/* Coach: video corto del producto.
   La seccion esta oculta (hidden) y solo aparece si el archivo existe,
   asi nunca se ve un reproductor roto. Con «reducir movimiento» no se
   reproduce solo: se muestran los controles. */
/* Salvaguarda de la entrada al hacer scroll (case.js): nada se queda en
   opacity 0 esperando a una animacion. Lo que ya esta a la vista o por
   encima (salto con ancla, scroll rapido, captura de pagina completa)
   aparece aunque el observador no haya llegado a dispararse. */
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

(() => {
  const slot = document.querySelector('[data-video-slot]');
  const video = slot && slot.querySelector('video[data-src]');
  if (!video) return;

  const src = video.getAttribute('data-src');
  fetch(src, { method: 'HEAD' }).then(res => {
    if (!res.ok) return;
    video.src = src;
    slot.hidden = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.controls = true;
      return;
    }
    video.autoplay = true;
    // Solo se reproduce mientras esta a la vista
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); });
    }, { threshold: 0.25 }).observe(video);
  }).catch(() => {});
})();
