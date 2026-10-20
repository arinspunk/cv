# Proposal

## Why

Publicar un post nuevo exige convertir a mano el borrador Markdown en tres HTML completos (es/en/pt), reescribir los metas cuatro veces por página, enlazar las traducciones entre sí y añadir la entrada en tres índices. Unas ~80 líneas de cabecera, header y footer se repiten en 54 páginas, así que cualquier cambio transversal (p. ej. el botón de copiar) toca ~48 ficheros. Además, `sitemap.xml` lleva desde 2021 sin incluir ningún post y no hay RSS. Un generador estático (Lume, sobre Deno) elimina todo ese trabajo sin cambiar el sitio publicado.

## What Changes

- Se introduce Lume como generador estático de **todo el sitio** (CV y blog, en los tres idiomas). El build publica en `_site/` y Netlify despliega esa carpeta en lugar de la raíz del repo.
- Los posts nuevos se escriben en Markdown estándar dentro de `src/posts/<id>/{es,en,pt}.md`, con un front matter mínimo (`id`, `lang`, `url`, `title`, `description`, `image`, `date`).
- Un layout base único para `<head>`, metas, favicons y scripts, y un header/footer común con una variante de color para el CV y otra para el blog.
- El build genera automáticamente: metas OG/Twitter/itemprop/canonical, el selector de idioma, los avisos "puedes leer este post en…" (`c-messages`), la cabecera del post (título y fecha), el enlace "descárgaselo como markdown", los índices del blog por idioma, `sitemap.xml` y un feed RSS por idioma.
- Un procesador del HTML generado aplica el marcado BEM a los elementos estándar: bloques de código (siempre `--scroll` y botón de copiar), imágenes, enlaces externos, tablas e ids de encabezados.
- Los comentarios del AT Protocol (web component `atproto-comments`) se activan con solo poner el elemento en el post: el build empaqueta el componente desde JSR y añade su JS y su CSS únicamente a los posts que lo usan, servidos desde xulioze.com en lugar de jsDelivr.
- Los 48 posts existentes y las 3 páginas del CV se migran a front matter + cuerpo HTML, sin reescribirlos, y se verifican con un diff contra el sitio actual.
- Se corrigen las fechas inconsistentes de 3 posts (el `datetime`, el texto visible o el índice no coinciden entre sí ni con las traducciones).
- El build valida el front matter obligatorio y falla indicando el fichero.
- Todas las URLs públicas actuales se mantienen (`.html`, slugs por idioma, `/pt/blogue/`).
- Comportamiento que cambia: los 3 posts de `atproto-comments` dejan de cargar el componente desde jsDelivr y lo cargan desde `/vendor/`. De forma visible: los 27 bloques de código que hoy no tienen botón de copiar (9 por idioma) lo ganan; los enlaces externos de los posts que aún no lo hacían se abren en pestaña nueva; los encabezados de sección de los posts reciben `id`; las 3 tablas sin clase reciben `c-post__table`; `sitemap.xml` pasa a listar todas las páginas; aparecen los feeds RSS; las fechas de 3 posts se corrigen.
- La compilación SCSS pasa a formar parte del build; `css/styles.css` deja de versionarse.

## Capabilities

### New Capabilities
- `site-build`: generación del sitio estático con Lume, conservación de URLs y recursos estáticos, compilación de estilos y despliegue en Netlify.
- `blog-posts`: escritura de posts en Markdown, front matter, transformación de los elementos estándar a componentes del sitio, cabecera del post e índices del blog.
- `site-i18n`: relación entre traducciones de páginas (posts y CV) mediante `id` y navegación entre idiomas generada.
- `site-metadata`: metas SEO/sociales generados a partir del front matter, sitemap, feeds RSS y robots.

### Modified Capabilities
<!-- No hay specs existentes en el proyecto. -->

## Impact

- **Contenido**: los 54 HTML actuales (`index.html`, `en/cv.html`, `pt/cv.html`, 3 índices de blog y 48 posts) se sustituyen por fuentes en `src/posts/`, `src/cv/`, `src/blog-index/` y plantillas en `src/_includes/`.
- **Nuevas dependencias**: Deno (runtime de build) y Lume con sus plugins oficiales (markdown, multilanguage, sitemap, feed, sass, esbuild) y `jsr:@arinspunk/atproto-comments@1.1.1`. Los metas se generan con un partial propio, sin el plugin `metas` (ver D6). No hay `package.json`, así que no se sustituye ninguna dependencia de Node.
- **Despliegue**: nuevo `netlify.toml` (comando de build y `publish = "_site"`). `netlify.toml` tiene prioridad sobre la configuración de la UI, así que el cambio de directorio de publicación entra con el merge y se revierte con un `git revert`. Requiere enlazar el repo en Netlify, que hoy se despliega a mano.
- **Prerrequisito**: `atproto-comments` 1.1.1 publicado en JSR con `src/atproto-comments.css` incluido (la 1.1.0 no lo incluye).
- **Recursos**: `img/claude-talk-to-figma-metas.psd` sale de `img/` (a `design/`) para que no se publique.
- **JS**: `js/application.js`, `js/application.min.js` y `js/markdown-converter.js` no cambian; el marcado generado debe seguir siendo compatible con ellos.
- **Fuera de alcance**: el comando de traducción en Claude Code (siguiente fase), convertir a Markdown los posts antiguos y rediseñar estilos.
