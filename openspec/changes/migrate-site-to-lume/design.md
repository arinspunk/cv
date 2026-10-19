# Design

## Context

- El sitio son 51 HTML escritos a mano (3 CV, 3 índices de blog, 15 posts × 3 idiomas), SCSS compilado a mano a `css/styles.css` y JS sin build (`js/application.js` y su versión `.min`, `js/markdown-converter.js`). No hay `package.json` ni `netlify.toml`: Netlify publica hoy la raíz del repo con la configuración de la UI.
- `js/application.js` depende de este marcado: `.c-footer__year`, `#downloadMarkdown`, `pre > .c-post__copy-btn` y `<html lang>` para elegir los textos del tooltip de copiar. `markdown-converter.js` lee el DOM del post. Ambos deben seguir funcionando sin cambios.
- Las páginas del CV enlazan con rutas absolutas (`/pt/cv.html`) y los posts con relativas (`../en/blog/...`).
- En el repo hay dos borradores que hoy se publican por accidente: `blog/extended-context-v2.md` y `en/blog/post-agents-context`.
- `img/` contiene un fuente de diseño, `img/claude-talk-to-figma-metas.psd`, que no debe publicarse.
- El marcado de los posts no es uniforme. En los 45 posts actuales:
  - 27 `pre` sin botón de copiar (9 por idioma: 8 en la guía de agentes y 1 en la introducción a bases de datos vectoriales);
  - 37 posts con `h2`–`h4` sin `id`;
  - 6 posts con enlaces externos sin `target="_blank"` (resarcimiento y prompt-contexto-memoria, en los 3 idiomas);
  - 3 tablas sin `c-post__table` (guía de Figma, en los 3 idiomas);
  - 9 posts con `img` sin clase, siempre dentro de un `figure.c-post__body-img` que ya la lleva;
  - `frontity-custom-page-templates` en es y pt usa `article.o-wrap` sin `section.c-post__body`;
  - `en/blog/frontity-custom-page-templates.html` contiene un enlace `mailto:`.
- Hay 3 posts con fechas inconsistentes entre el `datetime`, el texto visible, las traducciones y los índices (ver D14).
- `robots.txt` ya declara `Sitemap: https://xulioze.com/sitemap.xml` correctamente.
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
Se usa Lume con un `deno.json` que fija la versión exacta de Lume y de sus plugins (la última estable al implementar), con las tareas `build`, `serve` y `compare`. La versión mayor (Lume 2 o 3) se anota en este documento al empezar la tarea 1.2 y todas las pruebas de comportamiento (D3, D7) se hacen sobre ella. `_config.ts` declara `location: new URL("https://xulioze.com")` y `prettyUrls: false` para mantener las URLs `.html`.
*Alternativa:* Eleventy, equivalente en capacidades. Se elige Lume por preferencia del autor y porque no hay ninguna dependencia de Node que conservar.

### D2. Fuentes en `src/`, separadas del resto del repo
```
deno.json  _config.ts  netlify.toml  scripts/  drafts/  design/
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
  img/ fonts/ js/ scss/ favicon.ico humans.txt robots.txt
```
`img/`, `fonts/`, `js/` y los ficheros raíz se mueven con `git mv` y se copian a la salida con `site.copy`. `openspec/`, `.cursor/`, `.claude/`, `README.md` y `tokens.json` quedan fuera de `src/` y, por tanto, del sitio, sin necesidad de ignores. El `.psd` de `img/` se mueve a `design/`, fuera de `src/`.
*Alternativa:* usar la raíz como `src` e ignorar carpetas. Es más frágil: cada carpeta interna nueva acabaría publicada por defecto.

### D3. Posts antiguos y CV como páginas `.html` con front matter, sin motor de plantillas
Los cuerpos existentes se cargan como páginas `.html` (front matter + HTML tal cual) registradas con `site.loadPages([".html"])`, sin pasar por Vento ni por Markdown.
*Por qué no `.vto`:* Vento interpretaría cualquier `{{ }}` del contenido, y los prompts de los posts pueden contenerlo.
*Por qué no `.md` con HTML dentro:* markdown-it trata como código el HTML indentado que sigue a una línea en blanco, y los cuerpos actuales están indentados con tabuladores.
Para los posts nuevos en `.md`, el `_data.yml` de `posts/` fija `templateEngine: md`, así que Vento tampoco procesa los `{{ }}` de los bloques de código.

### D4. Id de los posts antiguos
El `id` de cada post antiguo es el slug de su versión en español (`oneshot-vs-dialogo`), que también da nombre a su carpeta `posts/<id>/`. Las URLs de cada idioma se declaran en el front matter (`url`) con los slugs actuales.

### D5. Un layout base y un único header/footer con variante
`base.vto` contiene `<html lang>`, el head completo (metas, favicons, fuentes, CSS) y los scripts. `header.vto` y `footer.vto` son únicos y reciben `variant` (`cv` | `blog`), que añade los modificadores `c-header--blog` y `c-footer--blog` y la clase del body. Los textos que cambian por idioma (títulos de los enlaces, "¿Hablamos?", etc.) salen de `i18n.yml`. Todos los enlaces internos generados son absolutos desde la raíz (`/en/blog/...`).

### D6. Metas en un partial propio, no con el plugin `metas`
`head-metas.vto` genera exactamente las etiquetas actuales y en el mismo orden (`title`, `og:*`, `twitter:*`, `itemprop`, `apple-mobile-web-app-title`, `og:image:width/height`, canonical, copyright). Las URLs absolutas se forman con `location` + `url`/`image`.
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

Todas las transformaciones son **idempotentes** ("añade si falta"). Por eso se aplican igual a los posts nuevos (`.md`) y a los antiguos (`.html`) sin alterar lo que ya es correcto. En los antiguos sí completan el marcado donde hoy falta, y se aceptan como mejoras: 27 bloques ganan botón, 37 posts ganan ids en los encabezados, 6 posts ganan `target`/`rel` en enlaces externos y 3 tablas ganan su clase (diferencias esperadas 1, 7, 8 y 9 de D13). Las 3 tablas se revisan visualmente.
*Alternativa:* sobrescribir los renderers de markdown-it. Solo funcionaría con `.md` y obligaría a mantener dos caminos para el mismo componente.
`markdown-it-attrs` (incluido por defecto en el plugin markdown de Lume) cubre las clases puntuales `{.clase}`.

### D9. Cabecera del post con título y fecha
`post.vto` pinta `c-info c-info--blog` con el `h1.h1--blog` del `title`, la línea de fecha, los avisos de idioma y el enlace de descarga en Markdown. La línea de fecha usa el formato que tienen hoy 44 de los 45 posts: texto suelto tras el `h1`, sin envoltorio. Lleva el prefijo de `i18n.yml` (es "Publicado el", en "Published on", pt "Publicado a") y `<time datetime="YYYY-MM-DD">` con la fecha formateada mediante `Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" })` (YAML convierte `2025-10-13` en medianoche UTC; sin `timeZone` se podría mostrar el día anterior). El `date` de cada post antiguo se extrae del atributo `datetime` de su propio `<time>`, con las correcciones de D14.

### D10. Índices, sitemap y feeds
- `blog-index/<lang>.vto` publica `blog.html`, `en/blog.html` y `pt/blogue.html` con la intro actual (copiada al template) y una búsqueda `type=post lang=<lang>` ordenada por `date` descendente. La fecha se formatea igual que en D9 y sale del `date` del post, así que índice y post no pueden discrepar.
- Plugin `sitemap`: genera `sitemap.xml` con todas las páginas y sustituye al fichero actual.
- Plugin `feed`: un feed por idioma en `/blog/feed.xml`, `/en/blog/feed.xml` y `/pt/blogue/feed.xml`, enlazado con `<link rel="alternate" type="application/rss+xml">` en el índice correspondiente.

### D11. SCSS dentro del build
El plugin `sass` publica cada `.scss` sin `_` en su misma ruta con extensión `.css`, así que `src/scss/styles.scss` saldría en `/scss/styles.css`. Para publicar en `css/styles.css` sin tocar el contenido del SCSS:
- `scss/styles.scss` se renombra a `src/scss/_index.scss` (contenido intacto);
- se crea `src/css/styles.scss` con una única línea que importa `../scss/index`.

Así `src/scss/` solo contiene parciales y no genera salida. `css/` sale del control de versiones y se añade `_site/` a `.gitignore`.

### D12. Netlify
`netlify.toml` define el comando de build (instalar Deno con una versión fijada y ejecutar `deno task build`) y `publish = "_site"`. `netlify.toml` tiene prioridad sobre la UI, así que la configuración vive en el repo y las deploy previews de las ramas usan el mismo build.

### D13. Verificación por diff
`scripts/compare.ts` (Deno) compara cada HTML de un snapshot del sitio anterior (worktree de la etiqueta `pre-lume`) con su homólogo en `_site/`. Antes de comparar normaliza:
- espacios en blanco y comentarios HTML;
- el orden de los atributos;
- los `href`/`src` internos, resolviéndolos a rutas absolutas.

También comprueba que no falta ninguna URL. Lista de diferencias esperadas (se informan aparte y no hacen fallar la comparación):
1. Los 8 `pre.c-post__prompt` sin botón ganan `--scroll` y el botón.
2. Línea de fecha de los posts unificada: el prefijo pasa a ser uno por idioma (cambian `impresoras-3d-muerte-simetria` en es, que tenía "Publicado o", y los 11 posts pt con "Publicado o"/"Publicado em"); `datetime` pasa a ser solo la fecha (`YYYY-MM-DD`); `frontity-custom-page-templates` pierde el envoltorio `div.c-info__time`.
3. Metas del CV: canonical `http://xulioze.com` → `https://xulioze.com/` y `og:image` relativo con query → URL absoluta.
4. `copyright` unificado al año del build.
5. `<link rel="alternate">` de los feeds en los índices y, si `multilanguage` los genera, `<link rel="alternate" hreflang>` en todas las páginas.
6. Ya no se publican los dos borradores (`blog/extended-context-v2.md`, `en/blog/post-agents-context`); pasan a `drafts/`, fuera de `src/`. Tampoco se publica el `.psd` de `img/`.
7. `id` en los `h2`–`h4` que no lo tenían (37 posts).
8. `target="_blank"` y `rel="noopener"` en los enlaces externos que no los tenían (6 posts).
9. `c-post__table` en las 3 tablas de la guía de Figma.
10. `frontity-custom-page-templates` en es y pt pasa a la estructura común del post (`article.c-post` > `section.c-post__body`).
11. Fechas corregidas según D14 (atributo, texto visible y posición en los índices).

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
Un `site.preprocess([".html", ".md"])` comprueba en las páginas con `type: post` que existen `id`, `lang` (`es`|`en`|`pt`), `url`, `title` y `date`, y lanza un error con la ruta del fichero si falta alguno. Para el CV y los índices comprueba `id`, `lang` y `url`.

## Risks / Trade-offs

- [`site.loadPages([".html"])` no se comporta como se espera con front matter en la versión fijada] → La primera tarea es una prueba con un post y el CV. Si falla, se usa un loader propio de texto + front matter (unas pocas líneas en `_config.ts`).
- [La migración mecánica de 51 páginas pierde contenido o metas] → La extracción la hace un script, no una edición manual, y `compare.ts` debe pasar sin diferencias inesperadas antes de hacer merge.
- [El merge cambia el directorio de publicación y algo falla en producción] → Revisar antes la deploy preview de la rama. Rollback: revertir el merge; sin `netlify.toml`, Netlify vuelve a publicar la raíz.
- [El CSS compilado por otra versión de Sass difiere en bytes] → No se compara byte a byte. Se revisa visualmente el CV y dos posts en la deploy preview.
- [`multilanguage` o `sitemap` añaden marcado que no estaba previsto] → La prueba de la tarea 1.5 lo detecta pronto; lo que generen se revisa y se añade a las diferencias esperadas o se desactiva.
- [La imagen de build de Netlify no trae Deno] → Se instala en el comando de build con la versión fijada; se valida en la primera deploy preview.
- [Trade-off] Los posts antiguos seguirán en HTML: para editar su contenido hay que tocar HTML. Se pueden convertir a Markdown uno a uno cuando haga falta, sin cambiar nada más.

## Migration Plan

1. Etiquetar el estado actual como `pre-lume` y trabajar en una rama.
2. Montar Lume, layouts, procesador e índices. Migrar las páginas con el script de extracción.
3. `deno task build` y `compare.ts` en local hasta que solo queden las diferencias esperadas.
4. Abrir la PR y revisar la deploy preview de Netlify (CV, índices, varios posts en los tres idiomas, botón de copiar, descarga en Markdown, feeds, sitemap).
5. Hacer merge a `main`; Netlify pasa a publicar `_site`.
6. Rollback: `git revert` del merge; el sitio vuelve a publicarse desde la raíz.
