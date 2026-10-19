# Proposal

## Why

Publicar un post nuevo exige convertir a mano el borrador Markdown en tres HTML completos (es/en/pt), reescribir los metas cuatro veces por página, enlazar las traducciones entre sí y añadir la entrada en tres índices. Unas ~80 líneas de cabecera, header y footer se repiten en 51 páginas, así que cualquier cambio transversal (p. ej. el botón de copiar) toca ~45 ficheros. Además, `sitemap.xml` lleva desde 2021 sin incluir ningún post y no hay RSS. Un generador estático (Lume, sobre Deno) elimina todo ese trabajo sin cambiar el sitio publicado.

## What Changes

- Se introduce Lume como generador estático de **todo el sitio** (CV y blog, en los tres idiomas). El build publica en `_site/` y Netlify despliega esa carpeta en lugar de la raíz del repo.
- Los posts nuevos se escriben en Markdown estándar dentro de `posts/<id>/{es,en,pt}.md`, con un front matter mínimo (`id`, `lang`, `url`, `title`, `description`, `image`, `date`).
- Un layout base único para `<head>`, metas, favicons y scripts, y un header/footer común con una variante de color para el CV y otra para el blog.
- El build genera automáticamente: metas OG/Twitter/itemprop/canonical, el selector de idioma, los avisos "puedes leer este post en…" (`c-messages`), la cabecera del post (título y fecha), el enlace "descárgaselo como markdown", los índices del blog por idioma, `sitemap.xml` y un feed RSS por idioma.
- Un procesador del HTML generado aplica el marcado BEM a los elementos estándar: bloques de código (siempre `--scroll` y botón de copiar), imágenes, enlaces externos, tablas e ids de encabezados.
- Los 45 posts existentes y las 3 páginas del CV se migran a front matter + cuerpo HTML, sin reescribirlos, y se verifican con un diff contra el sitio actual.
- Todas las URLs públicas actuales se mantienen (`.html`, slugs por idioma, `/pt/blogue/`).
- Comportamiento que cambia de forma visible: los 8 bloques de código que hoy no tienen botón de copiar lo ganan; `sitemap.xml` pasa a listar todas las páginas; aparecen los feeds RSS; se corrige la URL del sitemap en `robots.txt`.
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

- **Contenido**: los 51 HTML actuales (`index.html`, `en/cv.html`, `pt/cv.html`, 3 índices de blog y 45 posts) se sustituyen por fuentes en `posts/`, `cv/` y plantillas en `_includes/`.
- **Nuevas dependencias**: Deno (runtime de build) y Lume con sus plugins oficiales (markdown, multilanguage, sitemap, feed, sass, metas). No hay `package.json`, así que no se sustituye ninguna dependencia de Node.
- **Despliegue**: nuevo `netlify.toml` (comando de build y `publish = "_site"`). Mientras la configuración de Netlify no se actualice, el sitio seguiría publicando la raíz del repo.
- **JS**: `js/application.js`, `js/application.min.js` y `js/markdown-converter.js` no cambian; el marcado generado debe seguir siendo compatible con ellos.
- **Fuera de alcance**: el comando de traducción en Claude Code (siguiente fase), convertir a Markdown los posts antiguos y rediseñar estilos.
