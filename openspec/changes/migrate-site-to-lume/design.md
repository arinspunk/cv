# Design

## Context

- El sitio son 51 HTML escritos a mano (3 CV, 3 índices de blog, 15 posts × 3 idiomas), SCSS compilado a mano a `css/styles.css` y JS sin build (`js/application.js` y su versión `.min`, `js/markdown-converter.js`). No hay `package.json` ni `netlify.toml`: Netlify publica hoy la raíz del repo con la configuración de la UI.
- `js/application.js` depende de este marcado: `.c-footer__year`, `#downloadMarkdown`, `pre > .c-post__copy-btn` y `<html lang>` para elegir los textos del tooltip de copiar. `markdown-converter.js` lee el DOM del post. Ambos deben seguir funcionando sin cambios.
- Las páginas del CV enlazan con rutas absolutas (`/pt/cv.html`) y los posts con relativas (`../en/blog/...`).
- En el repo hay dos borradores que hoy se publican por accidente: `blog/extended-context-v2.md` y `en/blog/post-agents-context`.
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
Se usa Lume con un `deno.json` que fija la versión exacta de Lume y de sus plugins (la última estable al implementar), con las tareas `build` y `serve`. `_config.ts` declara `location: https://xulioze.com` y `prettyUrls: false` para mantener las URLs `.html`.
*Alternativa:* Eleventy, equivalente en capacidades. Se elige Lume por preferencia del autor y porque no hay ninguna dependencia de Node que conservar.

### D2. Fuentes en `src/`, separadas del resto del repo
```
deno.json  _config.ts  netlify.toml  scripts/
src/
  _data/            site.yml (autor, imagen por defecto), i18n.yml (textos por idioma)
  _includes/
    layouts/        base.vto, post.vto, cv.vto, blog-index.vto
    partials/       head-metas.vto, header.vto, footer.vto, copy-button.svg
  posts/<id>/       es.md|es.html, en.*, pt.*     (_data.yml: layout post, type post)
  cv/               es.html, en.html, pt.html
  blog-index/       es.vto, en.vto, pt.vto
  img/ fonts/ js/ scss/ favicon.ico humans.txt robots.txt
```
`img/`, `fonts/`, `js/` y los ficheros raíz se mueven con `git mv` y se copian a la salida con `site.copy`. `openspec/`, `.cursor/`, `.claude/`, `README.md` y `tokens.json` quedan fuera de `src/` y, por tanto, del sitio, sin necesidad de ignores.
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
`lang` + `id` relacionan las traducciones. Los layouts recorren las alternativas de la página para generar el selector del header y los avisos `c-message`, cuyos textos y emojis (🦀 es, 🦑 en, 🐙 pt) salen de `i18n.yml`. Si falta una traducción, no se genera el elemento (spec `site-i18n`).

### D8. Componentes del cuerpo: un procesador DOM sobre las páginas de post
Un único `site.process([".html"])` actúa solo sobre las páginas con `type: post` y solo dentro de `.c-post__body`:
- `pre`: añade `c-post__prompt c-post__prompt--scroll`, envuelve o marca el `code` con `c-post__prompt-code` e inserta el botón (`partials/copy-button.svg`, el marcado actual con el arreglo de iOS) con `aria-label` según `lang`. Si ya tiene botón, lo deja como está.
- `img`: añade `c-post__body-img` y `loading="lazy"` si faltan.
- `a` con host distinto de `xulioze.com`: añade `target="_blank"` y `rel="noopener"` si faltan.
- `table`: añade `c-post__table`. `h2`–`h4` sin `id`: añade un id slugificado.

Todas las transformaciones son **idempotentes** ("añade si falta"). Por eso se aplican igual a los posts nuevos (`.md`) y a los antiguos (`.html`) sin alterar lo que ya es correcto; la única diferencia en los antiguos son los 8 bloques sin botón.
*Alternativa:* sobrescribir los renderers de markdown-it. Solo funcionaría con `.md` y obligaría a mantener dos caminos para el mismo componente.
`markdown-it-attrs` (incluido por defecto en el plugin markdown de Lume) cubre las clases puntuales `{.clase}`.

### D9. Cabecera del post con título y fecha
`post.vto` pinta `c-info c-info--blog` con el `h1.h1--blog` del `title`, la línea de fecha, los avisos de idioma y el enlace de descarga en Markdown. La línea de fecha usa el formato que tienen hoy 44 de los 45 posts: texto suelto tras el `h1`, sin envoltorio. Lleva el prefijo de `i18n.yml` (es "Publicado el", en "Published on", pt "Publicado a") y `<time datetime="YYYY-MM-DD">` con la fecha formateada mediante `Intl.DateTimeFormat(lang, { dateStyle: "long" })`. El `date` de cada post antiguo se extrae de su propio `<time>`.

### D10. Índices, sitemap y feeds
- `blog-index/<lang>.vto` publica `blog.html`, `en/blog.html` y `pt/blogue.html` con la intro actual (copiada al template) y una búsqueda `type=post lang=<lang>` ordenada por `date` descendente. La fecha se formatea con `Intl.DateTimeFormat(lang, { dateStyle: "long" })`.
- Plugin `sitemap`: genera `sitemap.xml` con todas las páginas y sustituye al fichero actual.
- Plugin `feed`: un feed por idioma en `/blog/feed.xml`, `/en/blog/feed.xml` y `/pt/blogue/feed.xml`, enlazado con `<link rel="alternate" type="application/rss+xml">` en el índice correspondiente.

### D11. SCSS dentro del build
El plugin `sass` compila `src/scss/styles.scss` a `css/styles.css`. `css/` sale del control de versiones y se añade `_site/` a `.gitignore`.

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
5. `<link rel="alternate">` de los feeds en los índices.
6. Ya no se publican los dos borradores (`blog/extended-context-v2.md`, `en/blog/post-agents-context`); pasan a `drafts/`, fuera de `src/`.

## Risks / Trade-offs

- [`site.loadPages([".html"])` no se comporta como se espera con front matter en la versión fijada] → La primera tarea es una prueba con un post y el CV. Si falla, se usa un loader propio de texto + front matter (unas pocas líneas en `_config.ts`).
- [La migración mecánica de 51 páginas pierde contenido o metas] → La extracción la hace un script, no una edición manual, y `compare.ts` debe pasar sin diferencias inesperadas antes de hacer merge.
- [El merge cambia el directorio de publicación y algo falla en producción] → Revisar antes la deploy preview de la rama. Rollback: revertir el merge; sin `netlify.toml`, Netlify vuelve a publicar la raíz.
- [El CSS compilado por otra versión de Sass difiere en bytes] → No se compara byte a byte. Se revisa visualmente el CV y dos posts en la deploy preview.
- [La imagen de build de Netlify no trae Deno] → Se instala en el comando de build con la versión fijada; se valida en la primera deploy preview.
- [Trade-off] Los posts antiguos seguirán en HTML: para editar su contenido hay que tocar HTML. Se pueden convertir a Markdown uno a uno cuando haga falta, sin cambiar nada más.

## Migration Plan

1. Etiquetar el estado actual como `pre-lume` y trabajar en una rama.
2. Montar Lume, layouts, procesador e índices. Migrar las páginas con el script de extracción.
3. `deno task build` y `compare.ts` en local hasta que solo queden las diferencias esperadas.
4. Abrir la PR y revisar la deploy preview de Netlify (CV, índices, varios posts en los tres idiomas, botón de copiar, descarga en Markdown, feeds, sitemap).
5. Hacer merge a `main`; Netlify pasa a publicar `_site`.
6. Rollback: `git revert` del merge; el sitio vuelve a publicarse desde la raíz.
