/* Home — comportamiento de la portada (EN y ES). Antes iba en un
   <script> dentro de index.html; aqui lo comparten / y /es/. */
(() => {
  /* Textos del script por idioma: manda el <html lang> de la pagina */
  const T = document.documentElement.lang === 'es' ? {
    sending: 'Enviando…',
    error: 'No se ha podido enviar el mensaje. Vuelve a intentarlo o escríbeme a '
  } : {
    sending: 'Sending…',
    error: 'The message couldn’t be sent. Try again, or email me at '
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  setTimeout(() => {
    document.querySelectorAll('#hero .fade-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }, 100);

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const row = entry.target;
        row.classList.add('is-in');
        cardObs.unobserve(row);
        /* El escalonado es solo para la entrada: si se queda, tambien
           retrasa el cambio de tamano de las bandas al pasar de caso. */
        setTimeout(() => { row.style.transitionDelay = ''; }, 900);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.project-row').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 3) * 90 + 'ms';
    cardObs.observe(el);
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  /* Work: escenario clavado. El caso activo sale de la posicion de
     scroll — scroll normal, sin interceptar la rueda: antes cada golpe
     de rueda saltaba a la siguiente parada y la pagina dejaba de
     responder como el usuario espera. */
  (function () {
    const scroller = document.querySelector('.work-scroll');
    const sticky = document.querySelector('.work-sticky');
    const rows = Array.prototype.slice.call(document.querySelectorAll('.project-row'));
    if (!scroller || !sticky || rows.length < 2) return;
    const last = rows.length - 1;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0, ticking = false;

    function metrics() {
      const box = scroller.getBoundingClientRect();
      return { top: box.top, start: box.top + window.pageYOffset, len: box.height - sticky.offsetHeight };
    }
    function paint(i) {
      if (i === index) return;
      index = i;
      rows.forEach((el, k) => el.classList.toggle('is-lead', k === i));
    }
    function apply() {
      ticking = false;
      const m = metrics();
      if (m.len <= 0) return;
      const p = Math.min(Math.max(-m.top / m.len, 0), 1);
      paint(Math.round(p * last));
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    window.addEventListener('resize', apply);

    // Con teclado: al tabular a un caso, el carril se desplaza hasta el
    // para que no se active un caso que nunca se ha visto en grande.
    rows.forEach(function (el, i) {
      el.addEventListener('focus', function () {
        if (i === index) return;
        const m = metrics();
        paint(i);
        window.scrollTo({ top: m.start + Math.round((i / last) * m.len), behavior: smooth ? 'smooth' : 'auto' });
      });
    });

    // Al volver de un caso con #iki / #coach: el ancla nativa caeria en la
    // banda dentro del escenario (con el primer caso en grande); aqui se
    // lleva el carril a la parada de ese caso. 'instant' porque el html
    // tiene scroll-behavior: smooth y la vuelta no debe animarse.
    function goToHash() {
      const i = rows.findIndex(el => el.id && '#' + el.id === location.hash);
      if (i < 0) return;
      const m = metrics();
      paint(i);
      window.scrollTo({ top: m.start + Math.round((i / last) * m.len), behavior: 'instant' });
    }
    window.addEventListener('load', goToHash);
    window.addEventListener('hashchange', goToHash);

    apply();
  })();

  /* Menu movil, capsula .stuck y pildora: assets/js/nav.js */
  const moveIndicator = () => { if (window.pmNav) window.pmNav.moveIndicator(); };

  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          const on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        moveIndicator();
      }
    });
  /* Franja de 0px en mitad de la pantalla, no threshold 0.5: Work mide
     mas de dos pantallas y nunca llega a verse al 50%. */
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => activeObs.observe(s));

  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Formulario: validacion propia (novalidate) para poder mostrar el
     error junto a cada campo; carga, exito y error con mensaje claro. */
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  if (form && success && formError) {
    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn.textContent;
    const fields = form.querySelectorAll('input, select, textarea');
    const markInvalid = () => fields.forEach(f => f.setAttribute('aria-invalid', String(!f.checkValidity())));
    fields.forEach(f => f.addEventListener('input', () => { if (form.classList.contains('was-validated')) markInvalid(); }));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (btn.disabled) return;
      formError.textContent = '';
      form.classList.add('was-validated');
      markInvalid();
      if (!form.checkValidity()) {
        const first = form.querySelector(':invalid');
        if (first) first.focus();
        return;
      }
      btn.textContent = T.sending;
      btn.disabled = true;
      form.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch(form.action, {
          method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(res.status);
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (err) {
        formError.innerHTML = T.error + '<a href="mailto:pablo.meyer00@gmail.com">pablo.meyer00@gmail.com</a>.';
        btn.textContent = btnLabel;
        btn.disabled = false;
      } finally {
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
