/* IKI — ZenElegance · movimiento del caso
   IntersectionObserver + un único listener de scroll con rAF.
   Nada se anima si el usuario pide menos movimiento. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Revelado al entrar en pantalla */
  /* Las máscaras se observan a través de su contenedor: un clip-path
     cerrado deja el elemento con área visible cero y el observer no salta. */
  const targets = document.querySelectorAll('.ik-rv, .ik-mask');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        (el._ikMask || el).classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(el => {
      if (el.classList.contains('ik-mask') && el.parentElement) {
        el.parentElement._ikMask = el;
        io.observe(el.parentElement);
      } else io.observe(el);
    });
  }

  /* IKI → 粋 → Understated elegance */
  const idea = document.querySelector('.ik-idea');
  const steps = idea ? idea.querySelectorAll('.ik-idea-steps li') : [];
  if (idea && !reduce) idea.classList.add('is-live');

  const closeImg = document.querySelector('.ik-close-img');
  const bar = document.getElementById('scroll-progress');

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = window.innerHeight;
    const y = window.scrollY;

    if (bar) {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      bar.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
    }

    if (idea && idea.classList.contains('is-live')) {
      const r = idea.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      const step = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      if (idea.dataset.step !== String(step)) {
        idea.dataset.step = step;
        steps.forEach((li, i) => li.classList.toggle('on', i === step));
      }
    }

    /* Parallax muy ligero solo en la imagen de cierre */
    if (closeImg && !reduce) {
      const r = closeImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        closeImg.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      }
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  onScroll();

  /* Menú móvil y cabecera: assets/js/nav.js, la misma que la home */

  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
