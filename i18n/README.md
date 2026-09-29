# Versión en castellano (/es/)

La web es HTML estático. El inglés es la versión principal y vive donde siempre
(`/`, `/projects/…`). El castellano son páginas propias en `/es/`, con su URL,
`lang="es"`, canonical, hreflang y metadatos. Comparten todo lo demás: CSS, JS,
imágenes y el CV están una sola vez en el proyecto.

## Cómo se generan

Las páginas de `/es/` **no se editan a mano**: se generan a partir de las
inglesas.

```sh
sh i18n/build-es.sh
```

1. `make-es.pl` copia cada página inglesa a `/es/` y ajusta `lang`, canonical,
   `og:url`, `og:locale`, las rutas a los assets compartidos y el selector EN/ES.
2. `apply.pl` aplica las traducciones: primero `common.es.txt` (cabecera,
   footer, bloque final de los casos) y después la tabla de cada página.

Cada tabla es una lista de pares literales `texto EN ||| texto ES`.

## Al cambiar el copy en inglés

1. Edita la página inglesa.
2. Ejecuta `sh i18n/build-es.sh`.
3. Si aparece `MISS: …`, esa frase inglesa ya no existe: actualiza el par en la
   tabla (`home.es.txt`, `iki.es.txt`, `coach.es.txt`, `galeria.es.txt`) y vuelve
   a ejecutar.

Los textos que genera JavaScript (errores del formulario, etiquetas del menú y
del lightbox) están en un diccionario EN/ES dentro de `assets/js/home.js`,
`nav.js` y `lightbox.js`, elegido según el `<html lang>` de la página.

## Página nueva

1. Añade la página inglesa con el selector EN/ES en la cabecera y sus
   `<link rel="alternate" hreflang>` (copia el patrón de `projects/iki.html`).
2. Crea `i18n/<pagina>.es.txt` y añade una línea `build …` en `build-es.sh`.
3. Añade las dos URLs a `sitemap.xml`.

## Pendiente

- TODO: Add Spanish CV — cuando exista `assets/downloads/CV-PabloMeyer-ES.pdf`,
  cambiar en `home.es.txt` el enlace de descarga (ahora apunta al CV inglés
  y lo dice: «Descargar CV (PDF, en inglés)»).
