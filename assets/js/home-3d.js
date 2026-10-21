/* Home — hero con three.js (EN y ES).
   Mancha suave del amarillo de marca detras del titular: cambia de
   forma muy despacio (ruido organico), la acompana otra mas pequena y
   se desplaza un poco hacia el cursor, con retardo. No recibe clics.

   - Solo con raton (no en tactil) y cuando la pagina ya ha
     cargado: three.js no compite con el titular.
   - Se dibuja a media resolucion: es un degradado borroso y asi apenas
     cuesta. Se para cuando el hero sale de pantalla o la pestana se oculta.
   - Con «reducir movimiento» se pinta un solo fotograma, quieto.
   - Sin WebGL, el hero queda como siempre, en blanco. */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js';
const hero = document.getElementById('hero');
const desk = matchMedia('(hover: hover) and (pointer: fine)');
let started = false;

function start() {
  if (started || !hero) return;
  started = true;
  const go = () => window.requestIdleCallback ? requestIdleCallback(init, { timeout: 1200 }) : setTimeout(init, 300);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
if (desk.matches) start(); else desk.addEventListener('change', e => { if (e.matches) start(); });

const VERT = /* glsl */`
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */`
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;     // 0..1, origen abajo a la izquierda
  uniform vec3 uColor;
  uniform float uAlpha;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  // Mancha blanda: 1 dentro, 0 fuera, con un borde ancho y deformado
  float blob(vec2 p, vec2 c, float r, float soft, float seed) {
    float n = fbm(p * 1.4 + vec2(seed, uTime * 0.07));
    float d = length(p - c) + (n - 0.5) * 0.42;
    return smoothstep(r, r - soft, d);
  }

  void main() {
    float asp = uRes.x / uRes.y;
    vec2 p = gl_FragCoord.xy / uRes;
    p.x *= asp;
    vec2 m = vec2(uMouse.x * asp, uMouse.y);
    float t = uTime;

    // Mancha principal: deriva lenta alrededor del centro, atraida por el cursor
    vec2 c1 = vec2(asp * (0.5 + 0.07 * sin(t * 0.19)), 0.56 + 0.06 * cos(t * 0.15));
    c1 = mix(c1, m, 0.28);
    // Mancha secundaria: orbita a la principal
    vec2 c2 = c1 + vec2(cos(t * 0.23) * 0.34, sin(t * 0.27) * 0.18);

    float a = blob(p, c1, 0.36, 0.3, 3.1);
    a = max(a, 0.75 * blob(p, c2, 0.2, 0.2, 9.7));
    a *= uAlpha;
    gl_FragColor = vec4(uColor, a); // la mezcla de three ya premultiplica
  }`;

async function init() {
  let THREE;
  try { THREE = await import(THREE_URL); } catch (e) { return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  } catch (e) { return; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // el amarillo sale tal cual
  renderer.setPixelRatio(0.5);                              // borroso: media resolucion basta
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'hero-glow';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);

  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 11 },
    uMouse: { value: new THREE.Vector2(0.5, 0.56) },
    uColor: { value: new THREE.Color(0xF5D000) },
    uAlpha: { value: 0.55 },
  };
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true,
  })));

  let running = false, last = 0;
  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(uniforms.uRes.value);
    if (!running) renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(hero);

  // Cursor con retardo: la mancha llega tarde, como si flotara
  const target = { x: 0.5, y: 0.56 };
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
  });
  hero.addEventListener('pointerleave', () => { target.x = 0.5; target.y = 0.56; });

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000 || 0, 1 / 20);
    last = now;
    const k = 1 - Math.exp(-dt * 1.8);
    const mv = uniforms.uMouse.value;
    mv.x += (target.x - mv.x) * k;
    mv.y += (target.y - mv.y) * k;
    uniforms.uTime.value += dt;
    renderer.render(scene, camera);
  }

  const play = on => {
    if (reduced || on === running) return;
    running = on;
    if (on) { last = performance.now(); requestAnimationFrame(frame); }
  };
  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; play(inView && !document.hidden); }).observe(hero);
  document.addEventListener('visibilitychange', () => play(inView && !document.hidden));

  resize();
  hero.classList.add('has-glow');
  play(true);
}

