# Guía de despliegue — pablomeyer.es

El dominio `pablomeyer.es` está registrado en **one.com** y ya está cableado a **GitHub Pages**. No tocamos DNS. Hacemos:

1. Instalar Git en la Mac.
2. Crear un repo nuevo, subir el portfolio y migrar el dominio al repo nuevo. El viejo se borra al final.
3. Verificar Search Console (desde cero).

Tiempo estimado: 1 hora. Coste: 0 €.

---

## 0. Pre-requisito: instalar Git en la Mac

1. Abre **Terminal** (Cmd+Espacio → "Terminal").
2. Escribe `git --version` y pulsa Enter.
3. macOS abrirá un cuadro: **"Instalar las herramientas de línea de comandos"**. Acepta.
4. Espera 5-10 min a que descargue (no necesitas Xcode entero, solo las CLI tools).
5. Cuando termine, vuelve a Terminal y escribe `git --version` otra vez. Debe responder algo como `git version 2.39.x`.

Configura tu identidad de Git (solo se hace una vez):

```bash
git config --global user.name "Pablo Meyer"
git config --global user.email "pablo.meyer00@gmail.com"
```

---

## 1. Crear repo nuevo, subir el portfolio y migrar el dominio

Vamos a crear un repo limpio, verificar que funciona en una URL provisional, después transferir el dominio `pablomeyer.es` del repo viejo al nuevo, y por último borrar el viejo. El sitio queda offline máximo 1-2 minutos.

### a) Crear el repo nuevo en GitHub

1. Entra en https://github.com y arriba a la derecha → **+** → **New repository**.
2. **Repository name:** `pablomeyer.es` (o `portfolio`, da igual; pero conviene un nombre nuevo distinto al viejo).
3. **Public** (obligatorio para GitHub Pages gratis con dominio propio).
4. **NO** marques "Add a README", "Add .gitignore" ni licencia.
5. **Create repository**.
6. GitHub te llevará a una pantalla con instrucciones. Apunta la URL del repo, será algo como `https://github.com/TU_USUARIO/pablomeyer.es.git`.

### b) Generar un personal access token para autenticarte

GitHub no acepta contraseñas en Terminal — necesitas un token:

1. GitHub → arriba derecha → tu foto → **Settings**.
2. Menú lateral abajo: **Developer settings**.
3. **Personal access tokens → Tokens (classic) → Generate new token (classic)**.
4. **Note:** "Mac de Pablo".
5. **Expiration:** 90 days (o más).
6. **Scopes:** marca solo `repo`.
7. **Generate token**.
8. Copia el token que aparece (empieza por `ghp_...`) y guárdalo en un sitio seguro — no lo verás otra vez.

### c) Subir el portfolio nuevo desde Terminal

En Terminal, pega línea a línea (sustituye `TU_USUARIO` y, si lo cambiaste, el nombre del repo):

```bash
cd ~/Downloads/PABLOMEYER-PORTFOLIO
git init
git add .
git commit -m "Lanzamiento del portfolio rediseñado"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pablomeyer.es.git
git push -u origin main
```

Cuando pida `Username`, escribe tu usuario de GitHub.
Cuando pida `Password`, pega el **token** que generaste (no se ve mientras pegas — es normal, dale Enter).

### d) Activar GitHub Pages en el repo nuevo

1. En el repo (página de GitHub) → **Settings** → menú lateral → **Pages**.
2. **Source:** Deploy from a branch.
3. **Branch:** `main` · folder `/ (root)` → **Save**.
4. Espera 1-2 minutos. GitHub te dará una URL provisional tipo `https://TU_USUARIO.github.io/pablomeyer.es/`.
5. Abre esa URL: verifica que el portfolio nuevo se ve bien.

### e) Migrar el dominio del repo viejo al repo nuevo

Ahora vamos a transferir `pablomeyer.es` al repo nuevo. **Importante:** GitHub no permite que dos repos compartan el mismo dominio. Tienes que quitarlo del viejo antes de añadirlo al nuevo.

1. Ve al **repo VIEJO** → Settings → Pages → **Custom domain** → borra `pablomeyer.es` del campo → Save.
2. Ve al **repo NUEVO** → Settings → Pages → **Custom domain** → escribe `pablomeyer.es` → Save.
3. GitHub guardará automáticamente un archivo `CNAME` en el repo nuevo con tu dominio.
4. Espera 1-2 minutos. Cuando GitHub valide el DNS aparecerá un ícono verde y la casilla **Enforce HTTPS** se podrá marcar — márcala.
5. Abre `https://pablomeyer.es` y haz refresco fuerte (Cmd+Shift+R). El portfolio nuevo está vivo en tu dominio.

### f) Borrar el repo viejo

Una vez confirmado que `pablomeyer.es` carga el portfolio nuevo correctamente:

1. Repo viejo → Settings → baja del todo → **Danger Zone** → **Delete this repository**.
2. Confirma escribiendo el nombre del repo.
3. Listo.

---

## 2. Google Search Console (desde cero)

1. Entra en https://search.google.com/search-console.
2. **Añadir propiedad** → tipo **Dominio** (no URL prefix — el de Dominio cubre el sitio entero, con o sin www).
3. Pega `pablomeyer.es`.
4. Google te dará un **registro TXT** para verificar la propiedad. Cópialo (algo como `google-site-verification=ABC123...`).
5. En el panel de **one.com**: inicia sesión → **Dominios** → `pablomeyer.es` → **Configuración DNS avanzada** → **Añadir registro**:
   ```
   Tipo:  TXT
   Host:  @          (o déjalo vacío si el panel exige así)
   Valor: google-site-verification=XXXXXXXX...
   TTL:   por defecto
   ```
6. Vuelve a Search Console y pulsa **Verificar**. Si responde que no encuentra el registro, espera 15-30 min (propagación DNS) y reintenta.
7. Una vez verificado: panel lateral → **Sitemaps** → **Añadir un sitemap nuevo** → escribe `sitemap.xml` y envía.

A partir de aquí Google empieza a rastrear el sitio. Los primeros resultados de indexación tardan días o semanas en aparecer — paciencia.

---

## 3. Comprobaciones después del lanzamiento

- [ ] `https://pablomeyer.es` carga y muestra el portfolio nuevo.
- [ ] Cambia el idioma con el toggle EN/ES y comprueba que persiste al navegar.
- [ ] Envía un mensaje desde el formulario y confirma que te llega al email.
- [ ] Comparte el enlace en LinkedIn y mira que la preview muestra tu foto y el título.
- [ ] Comprueba en PageSpeed Insights: https://pagespeed.web.dev/?url=pablomeyer.es
- [ ] Pasa los Rich Results de Google: https://search.google.com/test/rich-results

---

## Notas

- El sitio antiguo desaparece cuando transfieras el dominio (paso 2.e). Si quieres conservar el contenido del repo viejo por si acaso, antes de borrarlo en el paso 2.f puedes descargarlo desde GitHub → Code → **Download ZIP**.
- GitHub Pages tiene un límite blando de 100 GB de transferencia al mes. Para un portfolio sobra de largo.
- El **personal access token** que generas en 2.b expira en 90 días. Cuando caduque, no podrás hacer `git push` hasta generar uno nuevo desde Settings → Developer settings.
- A partir del lanzamiento, para cualquier cambio futuro basta con: `git add . && git commit -m "mensaje" && git push`. En 1-2 min está vivo en `pablomeyer.es`. Mira `ADD-PROJECT.md` para añadir casos nuevos.
