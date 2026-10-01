/* Coach: video corto del producto.
   La seccion esta oculta (hidden) y solo aparece si el archivo existe,
   asi nunca se ve un reproductor roto. Con «reducir movimiento» no se
   reproduce solo: se muestran los controles. */
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
