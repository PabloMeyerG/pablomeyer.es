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

  /* Casos: .is-in descubre la imagen (clip-path en home.css). La tarjeta
     ya entra con .fade-up; esto solo marca el momento del recorte. */
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      cardObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.case').forEach(el => cardObs.observe(el));

  const moving = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Titulos: cada palabra (o cada span, como el contorno de Designer)
     va en su mascara y sube al recibir .visible. Ver .mask en home.css. */
  if (moving) document.querySelectorAll('.hero-title, .section-title, .contact-title').forEach(title => {
    let i = 0;
    const mask = () => {
      const m = document.createElement('span'); m.className = 'mask';
      const inner = document.createElement('span'); inner.className = 'mask-in';
      inner.style.setProperty('--i', i++);
      m.appendChild(inner);
      return [m, inner];
    };
    [...title.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const [m, inner] = mask(); inner.textContent = part; frag.appendChild(m);
        });
        title.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        const [m, inner] = mask(); title.replaceChild(m, node); inner.appendChild(node);
      }
    });
    title.classList.add('is-split');
  });

  /* Nombre del caso: las letras se descifran de izquierda a derecha.
     El lector de pantalla oye el nombre real (aria-label) mientras dura. */
  function scramble(el) {
    if (!moving || el.dataset.busy) return;
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const oneLine = el.offsetHeight < parseFloat(getComputedStyle(el).lineHeight) * 1.5;
    el.dataset.busy = '1';
    el.setAttribute('aria-label', text);
    if (oneLine) el.classList.add('is-scrambling');
    const t0 = performance.now(), dur = 560;
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      const done = Math.floor(t * text.length);
      el.textContent = text.slice(0, done) + [...text.slice(done)].map(c => {
        if (!/[a-z]/i.test(c)) return c;
        const r = ABC[Math.random() * 26 | 0];
        return c === c.toLowerCase() ? r.toLowerCase() : r;
      }).join('');
      if (t < 1) { requestAnimationFrame(step); return; }
      el.textContent = text;
      el.classList.remove('is-scrambling');
      el.removeAttribute('aria-label');
      delete el.dataset.busy;
    };
    requestAnimationFrame(step);
  }

  /* Casos con raton: la foto sigue un poco al cursor con un muelle
     (rigidez + amortiguacion, con un leve rebote) y se acerca un 4 %. */
  if (moving && finePointer) document.querySelectorAll('.case').forEach(row => {
    const pic = row.querySelector('.case-media picture');
    const name = row.querySelector('.case-link');
    if (!pic) return;
    const K = 0.08, DAMP = 0.78;
    const s = { x: [0, 0, 0], y: [0, 0, 0], z: [1, 1, 0] }; // [destino, valor, velocidad]
    let raf = 0;
    const loop = () => {
      let quieto = true;
      Object.values(s).forEach(a => {
        a[2] = (a[2] + (a[0] - a[1]) * K) * DAMP;
        a[1] += a[2];
        if (Math.abs(a[0] - a[1]) + Math.abs(a[2]) > 0.0005) quieto = false;
      });
      pic.style.setProperty('--px', s.x[1].toFixed(3) + '%');
      pic.style.setProperty('--py', s.y[1].toFixed(3) + '%');
      pic.style.setProperty('--pz', s.z[1].toFixed(4));
      raf = quieto ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    row.addEventListener('pointerenter', () => { s.z[0] = 1.04; kick(); if (name) scramble(name); });
    row.addEventListener('pointermove', e => {
      const r = row.getBoundingClientRect();
      s.x[0] = ((e.clientX - r.left) / r.width - 0.5) * -3;
      s.y[0] = ((e.clientY - r.top) / r.height - 0.5) * -3;
      kick();
    });
    row.addEventListener('pointerleave', () => { s.x[0] = 0; s.y[0] = 0; s.z[0] = 1; kick(); });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

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
