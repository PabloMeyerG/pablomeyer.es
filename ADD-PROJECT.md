# Cómo añadir un proyecto nuevo

El portfolio es HTML puro: añadir un caso significa duplicar un archivo, cambiar textos e imágenes, y referenciarlo desde la home.

Tiempo aproximado por proyecto: 30-45 min sin contar la maquetación del contenido.

---

## 1. Pon nombre al proyecto

Usa un slug corto, en minúsculas, sin tildes ni espacios. Ejemplos: `utopic`, `nike-social`, `branding-cafe`.

A partir de aquí lo llamo `SLUG`.

---

## 2. Sube las imágenes

1. Crea la carpeta `assets/img/projects/SLUG/`.
2. Mete dentro las imágenes del caso. Una de ellas tiene que ser el **hero** (1600×900 px aprox). Nómbrala `hero-SLUG.jpg` o `cover-SLUG.jpg`.
3. Convierte a WebP para que pesen menos. Si tienes `cwebp` instalado (viene con Homebrew: `brew install webp`):
   ```bash
   cd ~/Downloads/PABLOMEYER-PORTFOLIO/assets/img/projects/SLUG
   for f in *.{jpg,png}; do cwebp -q 82 "$f" -o "${f%.*}.webp"; done
   ```
   Si no quieres instalar nada, usa https://squoosh.app — subes la imagen, eliges WebP, descargas. Quédate también con el original `.jpg`/`.png` como fallback.

---

## 3. Duplica un caso existente

`coach.html` es el más completo (hero + reto + galería + decisiones + CTA). Si tu proyecto es UX o branding largo, parte de ahí. Si es algo más visual y suelto, parte de `galeria.html`.

```bash
cp projects/coach.html projects/SLUG.html
```

---

## 4. Edita el archivo nuevo

Abre `projects/SLUG.html` y cambia, en este orden:

**a) `<head>` — SEO y metadatos:**

- `<title>` → "Nombre del caso · Pablo Meyer"
- `<meta name="description">` → frase corta, máx 155 caracteres.
- `<link rel="canonical">` → `https://pablomeyer.es/projects/SLUG.html`
- Los tres `hreflang` (es, en, x-default) → cambiar también a `SLUG.html`.
- `og:title`, `og:description`, `og:image`, `og:url` → datos del proyecto y URL de tu hero.
- `twitter:title`, `twitter:description`, `twitter:image` → idem.
- **JSON-LD** (bloque `application/ld+json`) → cambia `name`, `headline`, `description`, `image`, `url` y los `about[]`.

**b) `<body>` — contenido visible:**

- `case-topbar` → cambia el número de caso ("Caso 04", "Caso 05", etc.).
- `case-title` → nombre del proyecto.
- `case-tags` → 2-4 etiquetas.
- `case-meta-row` → Tipo, Año, Rol, Duración.
- `case-cover` → ruta de la imagen hero (`webp` + fallback). Y los enlaces "Proyecto anterior / siguiente" hacia los archivos correctos.
- `case-reto` → el reto del proyecto (eyebrow, título, dos párrafos, tarjeta Detalles).
- `case-gallery` → todas las imágenes que quieras mostrar, con sus eyebrow + título por bloque.
- `case-decisions` → tres decisiones clave (numeradas).
- Bloque final con CTA hacia `index.html#hablemos`.

**c) Atributos `data-i18n`:**

Cada texto traducible tiene un atributo tipo `data-i18n="reto.title"`. Si no tocas las claves, no hace falta editar nada. Si añades secciones nuevas, mete las claves nuevas en el bloque `<script>` con `window.PAGE_I18N = { ... }` que hay al final del archivo.

---

## 5. Añade el proyecto a la home

Abre `index.html` y busca la sección `<div class="projects-list">` (línea ~628). Justo antes del `</div>` que cierra esa lista, pega:

```html
<a href="projects/SLUG.html" class="project-row">
  <span class="project-index">04</span>
  <div>
    <div class="project-name">NOMBRE DEL PROYECTO</div>
    <div class="project-tags">
      <span class="tag">Tag1</span>
      <span class="tag">Tag2</span>
      <span class="tag">Tag3</span>
    </div>
  </div>
  <div class="project-type">AÑO<br>Tipo · Disciplina</div>
  <div class="project-cta">Ver caso <span class="project-arrow">→</span></div>
</a>
```

Cambia el `01/02/03` al número que toque y los textos.

---

## 6. Añade el proyecto al sitemap

Abre `sitemap.xml` y antes del `</urlset>` pega:

```xml
<url>
  <loc>https://pablomeyer.es/projects/SLUG.html</loc>
  <lastmod>2026-XX-XX</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.9</priority>
  <xhtml:link rel="alternate" hreflang="es" href="https://pablomeyer.es/projects/SLUG.html"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://pablomeyer.es/projects/SLUG.html?lang=en"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://pablomeyer.es/projects/SLUG.html"/>
</url>
```

Pon la fecha del día en `<lastmod>`.

---

## 7. Sube los cambios

```bash
cd ~/Downloads/PABLOMEYER-PORTFOLIO
git add .
git commit -m "Añade caso: NOMBRE DEL PROYECTO"
git push
```

En 1-2 minutos GitHub Pages republica. El proyecto está vivo en `https://pablomeyer.es/projects/SLUG.html`.

---

## 8. Vuelve a enviar el sitemap (opcional pero recomendado)

Entra en Search Console → Sitemaps → enviar `sitemap.xml` otra vez. Acelera la indexación del caso nuevo.

---

## Checklist rápida (resumida)

- [ ] Imágenes en `assets/img/projects/SLUG/` + WebP generados.
- [ ] Archivo `projects/SLUG.html` duplicado y editado.
- [ ] Tarjeta nueva en `index.html`.
- [ ] Entrada nueva en `sitemap.xml`.
- [ ] `git add . && git commit && git push`.
- [ ] Verificar en `https://pablomeyer.es` que aparece y carga bien.
