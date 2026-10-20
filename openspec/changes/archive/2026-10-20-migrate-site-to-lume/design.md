# Design

## Context

- El sitio son 54 HTML escritos a mano (3 CV, 3 índices de blog, 16 posts × 3 idiomas), SCSS compilado a mano a `css/styles.css` y JS sin build (`js/application.js` y su versión `.min`, `js/markdown-converter.js`). No hay `package.json` ni `netlify.toml`. El site de Netlify no está enlazado a Git: hoy se despliega a mano (Manual deploy), subiendo la carpeta del proyecto, que se publica tal cual.
- `js/application.js` depende de este marcado: `.c-footer__year`, `#downloadMarkdown`, `pre > .c-post__copy-btn` y `<html lang>` para elegir los textos del tooltip de copiar. `markdown-converter.js` lee el DOM del post. Ambos deben seguir funcionando sin cambios.
- Las páginas del CV enlazan con rutas absolutas (`/pt/cv.html`) y los posts con relativas (`../en/blog/...`).
- En el repo hay dos borradores que hoy se publican por accidente: `blog/extended-context-v2.md` y `en/blog/post-agents-context`.
- `img/` contiene un fuente de diseño, `img/claude-talk-to-figma-metas.psd`, que no debe publicarse.
- El marcado de los posts no es uniforme. En los 48 posts actuales:
  - 27 `pre` sin botón de copiar (9 por idioma: 8 en la guía de agentes y 1 en la introducción a bases de datos vectoriales);
  - 42 posts con `h2`–`h4` sin `id`;
  - 6 posts con enlaces externos sin `target="_blank"` (resarcimiento y prompt-contexto-memoria, en los 3 idiomas);
  - 3 tablas sin `c-post__table` (guía de Figma, en los 3 idiomas);
  - 9 posts con `img` sin clase, siempre dentro de un `figure.c-post__body-img` que ya la lleva;
  - `frontity-custom-page-templates` en es y pt usa `article.o-wrap` sin `section.c-post__body`;
  - `en/blog/frontity-custom-page-templates.html` contiene un enlace `mailto:`.
- Hay 3 posts con fechas inconsistentes entre el `datetime`, el texto visible, las traducciones y los índices (ver D14).
- `robots.txt` ya declara `Sitemap: https://xulioze.com/sitemap.xml` correctamente.
- Los 3 posts `atproto-comments` usan el web component `<atproto-comments>` (dentro de `.c-post__body`, con `thread-uri`, `strings` y `style` propios de cada idioma) y lo cargan desde jsDelivr (versión 1.1.0): un `<link>` al CSS en el `<head>` y un `<script type="module">` al final del `body`, fuera del cuerpo del post.
- El componente se publica también en JSR (`@arinspunk/atproto-comments`). La 1.1.0 de JSR no incluye el CSS; la 1.1.1 lo incluirá en `src/atproto-comments.css`. Este change se ejecuta después de publicar la 1.1.1.
- Deno 2.x ya está instalado en local.

Requisitos: ver `specs/site-build`, `specs/blog-posts`, `specs/site-i18n` y `specs/site-metadata`.

## Goals / Non-Goals

**Goals:**
- Que un post nuevo sean solo tres ficheros Markdown con front matter.
- Que la migración se pueda verificar mecánicamente contra el sitio actual.
- Que el marcado de cada componente se defina en un único sitio.

**Non-Goals:**
- Convertir a Markdown los cuerpos de los posts antiguos.
- Tocar el SCSS, el diseño visual o el JS del cliente.
- Minificar JS o HTML, optimizar imágenes o generar `picture`/`srcset`.
- El comando de traducción en Claude Code (siguiente fase).

## Decisions

### D1. Lume sobre Deno, versión fijada
Se usa Lume con un `deno.json` que fija la versión exacta de Lume y de sus plugins (la última estable al implementar), con las tareas `build`, `serve` y `compare`. La versión de `@arinspunk/atproto-comments` (1.1.1) no va en `deno.json`: se fija en `src/vendor/atproto-comments.ts` y en una constante de `_config.ts` (ver D16). La tarea `lume` se ejecuta con `deno run -A` en lugar del perfil de permisos `-P=lume` que propone el init de Lume, porque el cargador de esbuild escribe en la caché de Deno, que está fuera del proyecto y cambia según el sistema. La versión mayor (Lume 2 o 3) se anota en este documento al empezar la tarea 1.2 y todas las pruebas de comportamiento (D3, D7) se hacen sobre ella. `_config.ts` declara `location: new URL("https://xulioze.com")` y `prettyUrls: false` para mantener las URLs `.html`.
**Versión elegida:** Lume 3 (`v3.2.5`, importado desde `https://deno.land/x/lume@v3.2.5/`). En Lume 3 los plugins oficiales vienen dentro del propio paquete, así que quedan fijados con él.
*Alternativa:* Eleventy, equivalente en capacidades. Se elige Lume por preferencia del autor y porque no hay ninguna dependencia de Node que conservar.

### D2. Fuentes en `src/`, separadas del resto del repo
```
deno.json  deno.lock  _config.ts  netlify.toml  scripts/  drafts/  design/
src/
  _data/            site.yml (autor, imagen por defecto), i18n.yml (textos por idioma)
  _includes/
    layouts/        base.vto, post.vto, cv.vto, blog-index.vto
    partials/       head-metas.vto, header.vto, footer.vto, copy-button.svg
  posts/<id>/       es.md|es.html, en.*, pt.*     (_data.yml: layout post, type post)
  posts/fixture/    post de prueba con draft: true (sin "_": Lume ignora las carpetas con "_")
  cv/               es.html, en.html, pt.html     (id: cv)
  blog-index/       es.vto, en.vto, pt.vto        (id: blog-index)
  css/styles.scss   punto de entrada de Sass (ver D11)
  vendor/           atproto-comments.ts (entrada de esbuild; el CSS llega con remoteFile, ver D16)
  img/ fonts/ js/ scss/ favicon.ico humans.txt robots.txt
```
`img/`, `fonts/`, `js/` y los ficheros raíz se mueven con `git mv` y se copian a la salida con `site.copy`. `openspec/`, `.cursor/`, `.claude/`, `README.md` y `tokens.json` quedan fuera de `src/` y, por tanto, del sitio, sin necesidad de ignores. El `.psd` de `img/` se mueve a `design/`, fuera de `src/`.
*Alternativa:* usar la raíz como `src` e ignorar carpetas. Es más frágil: cada carpeta interna nueva acabaría publicada por defecto.

### D3. Posts antiguos y CV como páginas `.html` con front matter, sin motor de plantillas
Los cuerpos existentes se cargan como páginas `.html` (front matter + HTML tal cual) registradas con `site.loadPages([".html"])`, sin pasar por Vento ni por Markdown.
*Por qué no `.vto`:* Vento interpretaría cualquier `{{ }}` del contenido, y los prompts de los posts pueden contenerlo.
*Por qué no `.md` con HTML dentro:* markdown-it trata como código el HTML indentado que sigue a una línea en blanco, y los cuerpos actuales están indentados con tabuladores.
Los posts nuevos en `.md` tampoco pasan por Vento: en Lume 3 los `.md` solo se procesan con markdown-it, así que los `{{ }}` de los bloques de código se publican tal cual (comprobado al implementar la tarea 4.1). No se fija `templateEngine: md` en `posts/_data.yml`: se aplicaría también a los `.html` migrados y los renderizaría como Markdown.

### D4. Id de los posts antiguos
El `id` de cada post antiguo es el slug de su versión en español (`oneshot-vs-dialogo`), que también da nombre a su carpeta `posts/<id>/`. Las URLs de cada idioma se declaran en el front matter (`url`) con los slugs actuales.

### D5. Un layout base y un único header/footer con variante
`base.vto` contiene `<html lang>`, el head completo (metas, favicons, fuentes, CSS) y los scripts. `header.vto` y `footer.vto` son únicos y reciben `variant` (`cv` | `blog`), que añade los modificadores `c-header--blog` y `c-footer--blog` y la clase del body. Los textos que cambian por idioma (títulos de los enlaces, "¿Hablamos?", etc.) salen de `i18n.yml`. Todos los enlaces internos generados son absolutos desde la raíz (`/en/blog/...`).

Hoy esos textos no son uniformes: hay entre 2 y 5 variantes por idioma en los `title` del header y del footer, el orden y el texto de los avisos cambian entre posts (con emojis o idiomas cruzados), 10 posts es ponen "Hablamos?" sin "¿" y un post pt pone "Vamos conversar?". Se unifican en un único juego de textos por idioma, tomado de las páginas del CV (diferencia esperada 14):

| Clave | es | en | pt |
|---|---|---|---|
| `title` del logo (solo variante blog) | volver a mi CV | return to my CV | voltar ao meu CV |
| `title` del enlace a la versión en ese idioma (en el idioma de destino) | Versión en español | English version | Versão em português |
| Texto del enlace de idioma | Es | En | Pt |
| `title` / texto del enlace al CV | mi currículum / CV | my CV / CV | o meu curriculum / CV |
| `title` / texto del enlace al blog | aquí hablo de cosas / Blog | here I talk about things / Blog | aqui falo de cousas / Blogue |
| `title` / texto del botón de LinkedIn | Escríbeme en LinkedIn / ¿Hablamos? | I'm in LinkedIn :) / Let's talk? | Estou no LinkedIn :) / Falamos? |
| `title` de GitHub / Email / LinkedIn en el footer | Mis repositorios / Mi email / Perfil de LinkedIn | My repository / write me / My profile on LinkedIn | Os meus repositórios / O meu email / Perfil de LinkedIn |
| Aviso hacia ese idioma (en el idioma de destino) | 🦀 Puedes leer este post en `<span>`español`</span>`. | 🦑 You can read this post in `<span>`english`</span>`. | 🐙 Podes ler este post em `<span>`português`</span>`. |
| Enlace de descarga | 🤖 Si quieres que tu IA lea este post, … descárgaselo como markdown. | 🤖 If you want your AI to read this post, … download it as markdown. | 🤖 Se queres que a tua IA leia este post, … descarrega-o como markdown. |
| Prefijo de la fecha | Publicado el | Published on | Publicado a |
| `aria-label` del botón de copiar | Copiar código | Copy code | Copiar código |

Orden: en el selector del header, `pt`, `es`, `en` (el orden que ya tienen todas las páginas menos dos); en los avisos, `es`, `en`, `pt` (el orden de `multilanguage`), omitiendo el idioma de la página. El footer de los índices usa siempre la variante `blog` (hoy `en/blog.html` no la lleva).

### D6. Metas en un partial propio, no con el plugin `metas`
`head-metas.vto` genera exactamente las etiquetas actuales y en el mismo orden (`title`, `og:*`, `twitter:*`, `itemprop`, `apple-mobile-web-app-title`, `og:image:width/height`, canonical, copyright). Las URLs absolutas se forman con `location` + `url`/`image`. El título de los metas es `"<title> - Xúlio Zé"`; las páginas que no siguen ese patrón (el CV, "Xúlio Zé - AI & Software Developer") declaran el título completo con el campo opcional `fullTitle`, que no se usa en los posts.
*Alternativa:* el plugin `metas`. No genera `itemprop` ni `apple-mobile-web-app-title`, y su orden de salida haría ruidoso el diff de verificación. Un partial de unas 25 líneas es más fácil de controlar.

### D7. Traducciones con el plugin `multilanguage`
`lang` + `id` relacionan las traducciones: posts (`id` = slug en español), CV (`id: cv`) e índices del blog (`id: blog-index`). Los layouts recorren las alternativas de la página para generar el selector del header y los avisos `c-message`, cuyos textos y emojis (🦀 es, 🦑 en, 🐙 pt) salen de `i18n.yml`. Si falta una traducción, no se genera el elemento (spec `site-i18n`).
El plugin puede insertar `<link rel="alternate" hreflang>` en el `<head>` y alternates en el sitemap. Se aceptan (mejoran el SEO multilingüe) y se declaran como diferencia esperada; la tarea 1.5 comprueba qué genera exactamente la versión fijada.

### D8. Componentes del cuerpo: un procesador DOM sobre las páginas de post
Un único `site.process([".html"])` actúa solo sobre las páginas con `type: post` y solo dentro de `.c-post__body`:
- `pre`: añade `c-post__prompt c-post__prompt--scroll`, envuelve o marca el `code` con `c-post__prompt-code` e inserta el botón (`partials/copy-button.svg`, el marcado actual con el arreglo de iOS) con `aria-label` según `lang`. Si ya tiene botón, lo deja como está.
- `img`: añade `c-post__body-img` y `loading="lazy"` si faltan, **salvo** si está dentro de un `figure.c-post__body-img` (la clase ya está en el `figure`; duplicarla aplicaría los estilos dos veces).
- `a` con `href` `http:`/`https:` y host distinto de `xulioze.com`: añade `target="_blank"` y `rel="noopener"` si faltan. No se tocan `mailto:`, `tel:`, anclas `#` ni rutas relativas.
- `table`: añade `c-post__table`. `h2`–`h4` sin `id`: añade un id slugificado.
- `atproto-comments`: si el post contiene el elemento, añade una vez `<link rel="stylesheet" href="/vendor/atproto-comments.css">` al final del `<head>` y `<script type="module" src="/vendor/atproto-comments.js">` al final del `body`, tras los scripts del sitio (ver D16). El elemento y sus atributos no se tocan.

Todas las transformaciones son **idempotentes** ("añade si falta"). Por eso se aplican igual a los posts nuevos (`.md`) y a los antiguos (`.html`) sin alterar lo que ya es correcto. En los antiguos sí completan el marcado donde hoy falta, y se aceptan como mejoras: 27 bloques ganan botón, 42 posts ganan ids en los encabezados, 6 posts ganan `target`/`rel` en enlaces externos y 3 tablas ganan su clase (diferencias esperadas 1, 7, 8 y 9 de D13). Las 3 tablas se revisan visualmente.
*Alternativa:* sobrescribir los renderers de markdown-it. Solo funcionaría con `.md` y obligaría a mantener dos caminos para el mismo componente.
`markdown-it-attrs` (incluido por defecto en el plugin markdown de Lume) cubre las clases puntuales `{.clase}`.

### D9. Cabecera del post con título y fecha
`post.vto` pinta `c-info c-info--blog` con el `h1.h1--blog` del `title`, la línea de fecha, los avisos de idioma y el enlace de descarga en Markdown. La línea de fecha usa el formato que tienen hoy 47 de los 48 posts: texto suelto tras el `h1`, sin envoltorio. Lleva el prefijo de `i18n.yml` (es "Publicado el", en "Published on", pt "Publicado a") y `<time datetime="YYYY-MM-DD">` con la fecha formateada mediante `Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" })` (YAML convierte `2025-10-13` en medianoche UTC; sin `timeZone` se podría mostrar el día anterior). El `date` de cada post antiguo se extrae del atributo `datetime` de su propio `<time>`, con las correcciones de D14.

### D10. Índices, sitemap y feeds
- `blog-index/<lang>.vto` publica `blog.html`, `en/blog.html` y `pt/blogue.html` con la intro actual (copiada al template) y una búsqueda `type=post lang=<lang>` ordenada por `date` descendente. La fecha se formatea igual que en D9 y sale del `date` del post, así que índice y post no pueden discrepar.
- Plugin `sitemap`: genera `sitemap.xml` con todas las páginas y sustituye al fichero actual. También añade siempre `Sitemap: https://xulioze.com/sitemap.xml` a `robots.txt` (no es configurable), así que esa línea sale de `src/robots.txt`.
- Plugin `feed`: un feed por idioma en `/blog/feed.xml`, `/en/blog/feed.xml` y `/pt/blogue/feed.xml`, enlazado con `<link rel="alternate" type="application/rss+xml">` en el índice correspondiente.

### D11. SCSS dentro del build
El plugin `sass` publica cada `.scss` sin `_` en su misma ruta con extensión `.css`, así que `src/scss/styles.scss` saldría en `/scss/styles.css`. Para publicar en `css/styles.css` sin tocar el contenido del SCSS:
- `scss/styles.scss` se renombra a `src/scss/_index.scss` (contenido intacto);
- se crea `src/css/styles.scss` con una única línea que importa `../scss/index`.

Así `src/scss/` solo contiene parciales y no genera salida. El plugin `source_maps` publica también `css/styles.css.map`, que el CSS anterior ya referenciaba. Con el Sass actual, las declaraciones escritas después de una regla anidada (`animation` en 5 selectores) salen en un bloque aparte tras las media queries; ninguna media query redefine esas propiedades, así que el resultado visual no cambia (comprobado con capturas píxel a píxel del CV y de varios posts). `css/` sale del control de versiones y se añade `_site/` a `.gitignore`.

### D12. Netlify
`netlify.toml` define el comando de build (instalar Deno con una versión fijada y ejecutar `deno task build`) y `publish = "_site"`. `netlify.toml` tiene prioridad sobre la UI, así que la configuración vive en el repo y las deploy previews de las ramas usan el mismo build.
Antes del primer build hay que enlazar `arinspunk/cv` en la UI de Netlify (rama de producción `main`). Mientras no haya `netlify.toml`, el enlace publicaría la raíz de `main`, que incluye `openspec/`, `.cursor/` y `.claude/`. Por eso el enlace se hace con la PR de Lume abierta y el auto-publish desactivado hasta el merge.

### D13. Verificación por diff
`scripts/compare.ts` (Deno) compara cada HTML de un snapshot del sitio anterior (worktree de la etiqueta `pre-lume`) con su homólogo en `_site/`. Antes de comparar normaliza:
- espacios en blanco y comentarios HTML;
- el orden de los atributos;
- los `href`/`src` internos, resolviéndolos a rutas absolutas.

También comprueba que no falta ninguna URL. Lista de diferencias esperadas (se informan aparte y no hacen fallar la comparación):
1. Los 27 `pre.c-post__prompt` sin botón ganan `--scroll` y el botón.
2. Línea de fecha de los posts unificada (y `datetime` de los índices, que pasa también a `YYYY-MM-DD`): el prefijo pasa a ser uno por idioma (cambian `impresoras-3d-muerte-simetria` en es, que tenía "Publicado o", y los 12 posts pt con "Publicado o"/"Publicado em"); `datetime` pasa a ser solo la fecha (`YYYY-MM-DD`); `frontity-custom-page-templates` pierde el envoltorio `div.c-info__time`.
3. URLs y dimensiones de los metas, en todas las páginas: canonical, `og:url` y `twitter:url` pasan a `https://` (el CV y los índices usaban `http://xulioze.com`) y a la URL de la propia página (en `blog/resarcimiento.html` apuntaban a `resarcimento.html`, que no existe); `og:image`, `twitter:image` e `itemprop=image` pasan a URL absoluta sin la query `?crop=…` sobrante (el CV, los índices y 11 posts la tenían relativa; en `en/cv.html` y `pt/cv.html` resolvía a `/en/img/…` y `/pt/img/…`, que no existen; en `blog/guia-integrar-figma-con-ia.html` el `og:image` estaba roto, `https://xulioze.com/img/ v`, y pasa a ser la imagen de su `twitter:image`); `og:image:width`/`height` pasan a ser las dimensiones reales del fichero (varias imágenes de 1200×630 se declaraban como 900×470); `<link rel="author">` apunta siempre a `/humans.txt` (en `en/cv.html` y `pt/cv.html` apuntaba a `/en/humans.txt` y `/pt/humans.txt`, que no existen).
4. `copyright` unificado al año del build.
5. `<link rel="alternate">` de los feeds en los índices y, en todas las páginas con `id` (CV, índices y posts), los `<link rel="alternate" hreflang="<lang>" href="https://xulioze.com/...">` que `multilanguage` (Lume 3.2.5) añade al final del `<head>`: uno por traducción, incluida la propia página, sin `x-default` (comprobado en la tarea 1.5).
6. Ya no se publican los dos borradores (`blog/extended-context-v2.md`, `en/blog/post-agents-context`); pasan a `drafts/`, fuera de `src/`. Tampoco se publica el `.psd` de `img/`.
7. `id` en los `h2`–`h4` que no lo tenían (42 posts).
8. `target="_blank"` y `rel="noopener"` en los enlaces externos que no los tenían (6 posts).
9. `c-post__table` en las 3 tablas de la guía de Figma.
10. `frontity-custom-page-templates` en es y pt pasa a la estructura común del post (`article.c-post` > `section.c-post__body`).
11. Fechas corregidas según D14 (atributo, texto visible y posición en los índices).
12. `<head>` completo y uniforme: todas las páginas tienen las mismas etiquetas y en el mismo orden. Los 6 posts con el `<head>` reducido (`contexto-extendido-v2` y `atproto-comments`, en los 3 idiomas) ganan los metas Twitter, itemprop, robots, `apple-mobile-web-app-title`, copyright, etc.; `atproto-comments`, que no tiene `og:image`, gana la imagen social por defecto. Los colores de `mask-icon`, `msapplication-TileColor` y `theme-color` se unifican con los de 43 de las 54 páginas (`#0000ff`, `#da532c`, `#00000B`).
13. Los 3 posts `atproto-comments` cargan el CSS y el JS del componente desde `/vendor/atproto-comments.{css,js}` (versión 1.1.1, servida desde xulioze.com) en lugar de jsDelivr 1.1.0.
14. Cabecera, pie y avisos unificados con los textos de D5: `title` de los enlaces del header y del footer, texto del botón de LinkedIn ("Hablamos?" → "¿Hablamos?", "Vamos conversar?" → "Falamos?"), orden, texto y emoji de los avisos `c-message`, idioma del enlace de descarga, modificador `c-footer--blog` en `en/blog.html`, sin las clases `c-footer__menu-link--blog` y `c-footer__credits--blog` del footer de `blog.html` y `pt/blogue.html` (no tienen estilos), los enlaces del footer de `guia-desarrollar-software-agentes` en es y pt usan `c-footer__menu-link` (tenían `c-header__menu-link`), los enlaces de idioma salen siempre en el mismo orden (en `extended-context-v2` y `atproto-comments` en inglés estaban al revés) desaparece la entrada de relleno del final de `en/blog.html` y `pt/blogue.html` ("I promise there will be more!", que en `blog.html` ya estaba comentada), y el logo y el enlace "CV" llevan siempre al CV del idioma de la página (en la guía de agentes en/pt, "CV" llevaba al CV en español) (en `en/blog.html` apuntaba a `/cv.html`, que no existe). También se corrigen de paso: `<html lang="pt">` → `lang="en"` en 6 posts en inglés (extended-context, 3d-printers-death-symmetry, vector-stores-introduction, how-talk-with-chatgpt, ai-for-developers, reimbursement), el texto suelto "1200" antes del `<!DOCTYPE>` de `pt/blogue/prompt-contexto-memoria.html` y el `defer` de `markdown-converter.js` en los dos posts que lo tenían.
15. Títulos unificados con el `h1` (y metas de título con el título de otro post, como el `apple-mobile-web-app-title` "Resarcimiento" de `impresoras-3d-muerte-simetria`): el `<title>` y los metas de título (`og:title`, `twitter:title`, `itemprop=name`, `apple-mobile-web-app-title`) de los 6 posts que usaban un título corto distinto del `h1` (`construir-pwa-con-chatgpt` y `frontity-custom-page-templates`, en los 3 idiomas; `en/blog/build-pwa-with-chatgpt.html` lo tenía además en portugués) pasan a ser el `title` del post (su `h1`), y las 3 entradas de los índices cuyo texto no coincidía con el `h1` (es: PWA; pt: PWA y `como-falar-com-chatgpt`) pasan a mostrarlo. También el `<title>` del CV en español ("Xúlio Zé, AI & Software Developer" → "Xúlio Zé - AI & Software Developer", como en sus metas) y el `og:title` de `pt/blogue.html` ("Blog - Xúlio Zé" → "Blogue - Xúlio Zé", como su `<title>`). El CV declara su título completo con `fullTitle` en el front matter, porque no sigue el patrón "<título> - Xúlio Zé".

El normalizador también ordena los tokens de `class`, porque el procesador añade clases al final.
Antes de comparar se clasifica cada diferencia en una de estas categorías y el informe las agrupa; cualquier diferencia que no encaje en una categoría hace fallar la comparación.

### D14. Corrección de fechas
La fecha de referencia de cada post es la misma en sus tres idiomas. Se corrigen estas inconsistencias del sitio actual:

| Post | Fecha correcta | Qué estaba mal |
|---|---|---|
| `construir-pwa-con-chatgpt` / `build-pwa-with-chatgpt` / `construir-pwa-com-chatgpt` | 2023-04-14 | `datetime` del post es (2022-04-14) |
| `vector-stores-introduction` / `bases-datos-vectoriales-introduccion` / `bases-dados-vectoriais-introducao` | 2025-03-05 | `datetime` del post en (2023-06-30) y texto con cero inicial ("March 05") |
| `impresoras-3d-muerte-simetria` / `3d-printers-death-symmetry` / `impressoras-3d-morte-simetria` | 2024-02-12 | `datetime` de los posts y del índice en (2024-01-12) y texto de los posts es y pt (12 de enero/janeiro) |

El script de migración toma el `datetime`, aplica esta tabla y falla si, después, las tres traducciones de un post no tienen el mismo `date`.

### D15. Validación del front matter
Un `site.preprocess([".html", ".md"])` comprueba en las páginas con `type: post` que existen `id`, `lang` (`es`|`en`|`pt`), `url`, `title` y `date`, y lanza un error con la ruta del fichero si falta alguno. `image` y `description` no son obligatorios (sin `image` se usa la imagen por defecto). Para el CV y los índices comprueba `id`, `lang` y `url`.

### D16. Web component `atproto-comments` desde JSR
El componente se empaqueta en el build y se sirve desde el propio dominio, sin CDN de terceros:
- **JS:** `src/vendor/atproto-comments.ts` contiene solo `import "https://jsr.io/@arinspunk/atproto-comments/1.1.1/src/index.ts";` (la URL `https:` de JSR de esa versión: el cargador de esbuild de Lume 3.2.5 no resuelve los especificadores `jsr:`). El plugin `esbuild` (con `extensions: [".ts"]`, para no tocar `src/js/`, que se copia tal cual) lo empaqueta en `/vendor/atproto-comments.js`. Al importarse, el módulo registra `<atproto-comments>`.
- **CSS:** `site.remoteFile("vendor/atproto-comments.css", "https://jsr.io/@arinspunk/atproto-comments/1.1.1/src/atproto-comments.css")` + `site.copy("vendor/atproto-comments.css")`. Se descarga en el build desde la misma versión que el JS.
- **Inyección:** la hace el procesador de D8 solo en los posts que contienen el elemento. Los posts no declaran nada en el front matter: en un post nuevo en Markdown basta con pegar el elemento (HTML en línea).
- **Versión:** la constante `ATPROTO_COMMENTS_VERSION` de `_config.ts` forma la URL del CSS, y el build falla si el import de `src/vendor/atproto-comments.ts` no usa la misma versión.

El script de migración no copia los `<link>`/`<script>` de jsDelivr: el `<link>` está en el `<head>` (que se regenera) y el `<script>` fuera de `.c-post__body`.
*Alternativa:* seguir con jsDelivr con un campo `styles`/`scripts` en el front matter. Funciona, pero mantiene una dependencia de un CDN externo en tiempo de ejecución y obliga a declarar los recursos en cada post.
*Alternativa:* un campo `comments: <at-uri>` que pinte el componente desde `post.vto`, con los textos en `i18n.yml`. Queda para una fase posterior; D16 es compatible con ella.

## Risks / Trade-offs

- [`site.loadPages([".html"])` no se comporta como se espera con front matter en la versión fijada] → La primera tarea es una prueba con un post y el CV. Si falla, se usa un loader propio de texto + front matter (unas pocas líneas en `_config.ts`).
- [La migración mecánica de 54 páginas pierde contenido o metas] → La extracción la hace un script, no una edición manual, y `compare.ts` debe pasar sin diferencias inesperadas antes de hacer merge.
- [El merge cambia el directorio de publicación y algo falla en producción] → Revisar antes la deploy preview de la rama. Rollback: `git revert` del merge o, de forma inmediata, *Publish deploy* de un deploy anterior en la UI de Netlify.
- [El CSS compilado por otra versión de Sass difiere en bytes] → No se compara byte a byte. Se revisa visualmente el CV y dos posts en la deploy preview.
- [`multilanguage` o `sitemap` añaden marcado que no estaba previsto] → La prueba de la tarea 1.5 lo detecta pronto; lo que generen se revisa y se añade a las diferencias esperadas o se desactiva.
- [La 1.1.1 de `atproto-comments` no está publicada o no incluye el CSS] → El change no empieza hasta que la 1.1.1 esté en JSR con `src/atproto-comments.css` (comprobación en la tarea 1.2). Si `remoteFile` falla en el build, el build falla (no se publica un post sin estilos).
- [El build depende de jsr.io] → Ya depende de JSR/deno.land para Lume; `deno.lock` fija las versiones. El CSS se descarga en cada build; si jsr.io no responde, el build falla y Netlify mantiene el deploy anterior.
- [La imagen de build de Netlify no trae Deno] → Se instala en el comando de build con la versión fijada; se valida en la primera deploy preview.
- [Trade-off] Los posts antiguos seguirán en HTML: para editar su contenido hay que tocar HTML. Se pueden convertir a Markdown uno a uno cuando haga falta, sin cambiar nada más.

## Migration Plan

1. Etiquetar el estado actual como `pre-lume` y trabajar en una rama.
2. Montar Lume, layouts, procesador e índices. Migrar las páginas con el script de extracción.
3. `deno task build` y `compare.ts` en local hasta que solo queden las diferencias esperadas.
4. Comprobar que los comentarios cargan en un post de cada idioma.
5. Enlazar el repo en Netlify con el auto-publish desactivado (D12).
6. Abrir la PR y revisar la deploy preview de Netlify (CV, índices, varios posts en los tres idiomas, botón de copiar, descarga en Markdown, feeds, sitemap).
7. Hacer merge a `main` y reactivar el auto-publish; Netlify pasa a publicar `_site`.
8. Rollback: *Publish deploy* del último deploy manual en la UI de Netlify, o `git revert` del merge.
