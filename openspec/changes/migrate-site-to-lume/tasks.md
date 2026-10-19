# Tasks

## 1. Preparación y esqueleto de Lume

- [ ] 1.1 Crear la etiqueta `pre-lume` sobre `main` y una rama de trabajo; verificar con `git tag -l pre-lume`
- [ ] 1.2 Elegir la versión mayor de Lume y anotarla en D1; añadir `deno.json` con Lume y sus plugins en versiones exactas y las tareas `build` y `serve`, y `_config.ts` con `src: "./src"`, `location: new URL("https://xulioze.com")` y `prettyUrls: false` (D1, D2); verificar que `deno task build` termina sin errores con un `src/` vacío
- [ ] 1.3 Mover `img/claude-talk-to-figma-metas.psd` a `design/`; mover con `git mv` `img/`, `fonts/`, `js/`, `scss/`, `favicon.ico`, `humans.txt` y `robots.txt` a `src/`, declarar las copias estáticas en `_config.ts` y añadir `_site/` a `.gitignore`; verificar que `_site/` contiene esos recursos en sus rutas actuales y no contiene `openspec/`, `.cursor/`, `.claude/`, `README.md`, `tokens.json` ni `.psd`
- [ ] 1.4 Mover los borradores `blog/extended-context-v2.md` y `en/blog/post-agents-context` a `drafts/` (fuera de `src/`); verificar que no aparecen en `_site/`
- [ ] 1.5 Prueba de D3: cargar una página `.html` con front matter y un `{{ }}` literal en el cuerpo mediante `site.loadPages([".html"])` y comprobar que sale en su `url` con el cuerpo intacto; si falla, implementar el loader alternativo de D3 y repetir la comprobación. En la misma prueba, con dos páginas relacionadas por `id`, anotar qué inserta `multilanguage` en el `<head>` (`hreflang`) y ajustar la diferencia esperada 5 de D13

## 2. Herramienta de verificación

- [ ] 2.1 Escribir `scripts/compare.ts` (D13): snapshot de `pre-lume` en un worktree temporal, normalización (espacios, comentarios, orden de atributos, orden de los tokens de `class`, URLs internas a absolutas), informe de URLs ausentes y diferencias por página, y clasificación en las 11 categorías de diferencias esperadas (cualquier otra hace fallar); añadir la tarea `deno task compare`; verificar ejecutándolo contra el propio snapshot (0 diferencias) y contra una copia con una modificación conocida (la detecta)

## 3. Layout base, header/footer y CV

- [ ] 3.1 Crear `src/_data/site.yml` e `i18n.yml` con autor, imagen social por defecto y todos los textos por idioma que hoy están en el header, footer, avisos, botón de copiar y enlace de descarga; verificar que los textos coinciden literalmente con los de los HTML actuales
- [ ] 3.2 Crear `base.vto` y `partials/head-metas.vto` (D5, D6) con `<html lang>`, metas, favicons, fuentes, CSS y scripts, en el orden actual; verificar con `compare` que el `<head>` del CV migrado solo difiere en las diferencias esperadas 3 y 4
- [ ] 3.3 Crear `header.vto` y `footer.vto` únicos con `variant` `cv`|`blog` y selector de idioma generado con `multilanguage` (D5, D7)
- [ ] 3.4 Migrar `index.html`, `en/cv.html` y `pt/cv.html` a `src/cv/{es,en,pt}.html` (front matter + cuerpo) con `id: cv`, `url: /` en la versión es, y layout `cv.vto`, y borrar los originales; verificar con `deno task compare` que las 3 páginas no tienen diferencias inesperadas y que en `deno task serve` el selector de idioma enlaza entre las tres

## 4. Posts migrados

- [ ] 4.1 Crear `post.vto` (D9) con la cabecera `c-info` (título y línea de fecha con prefijo por idioma), los avisos `c-message` generados a partir de las traducciones, el enlace `#downloadMarkdown` y el contenedor `.c-post__body`, y `src/posts/_data.yml` con `layout`, `type: post` y `templateEngine: md`
- [ ] 4.2 Escribir `scripts/migrate-posts.ts`, que extrae de cada post actual `title`, `description`, `image`, `url`, `lang`, `date` (del atributo `datetime` de su `<time>`, con las correcciones de D14) y el cuerpo (sin `h1`, línea de fecha, avisos ni enlace de descarga), y escribe `src/posts/<id>/<lang>.html` con `id` = slug en español (D4). Debe contemplar la estructura distinta de `frontity-custom-page-templates` en es y pt (sin `section.c-post__body`) y fallar si las traducciones de un post no comparten `date`; verificar que genera 45 ficheros en 15 carpetas, que ninguno tiene campos vacíos y que los 3 posts de D14 tienen las fechas corregidas
- [ ] 4.3 Ejecutar la migración y borrar `blog/`, `en/blog/` y `pt/blogue/` originales; verificar con `deno task compare` que los 45 posts existen en sus URLs y que las únicas diferencias son la 2, la 10, la 11 y las del `<head>` esperadas
- [ ] 4.4 Comprobar en `deno task serve` que, en un post de cada idioma, funcionan los avisos de idioma, la descarga en Markdown y el año del footer
- [ ] 4.5 Añadir en `_config.ts` la validación del front matter de D15; verificar que quitar `title` a un post hace fallar `deno task build` con código distinto de cero y un mensaje con la ruta del fichero, y que un `lang: fr` también falla

## 5. Componentes del cuerpo

- [ ] 5.1 Implementar en `_config.ts` el procesador DOM de D8 (bloques de código con botón desde `partials/copy-button.svg`, imágenes, enlaces externos, tablas, ids de encabezados), idempotente y limitado a `type: post` dentro de `.c-post__body`, con las excepciones de D8 (`img` dentro de `figure.c-post__body-img`, enlaces que no son `http(s)`); verificar con `deno task compare` que en los posts migrados solo aparecen las diferencias esperadas 1 (27 bloques), 7, 8 y 9, que ningún `img` dentro de un `figure` gana clase y que el `mailto:` de frontity en no cambia; revisar visualmente las 3 tablas de la guía de Figma
- [ ] 5.2 Crear un post de prueba en `src/posts/fixture/es.md` con `draft: true` (no en `_fixture/`: Lume ignora las carpetas que empiezan por `_`) que tenga un bloque cercado con `{{ }}`, una imagen, un enlace externo con título, uno interno, una tabla, un `###`, un `{.clase}`, un `mailto:` y un iframe en línea; construir con `LUME_DRAFTS=true` y verificar en el HTML generado cada escenario de `specs/blog-posts`, y que sin esa variable no aparece en `_site/` y que el botón de copiar funciona en el navegador

## 6. Índices, sitemap, feeds y robots

- [ ] 6.1 Crear `blog-index/{es,en,pt}.vto` (D10) con `id: blog-index`, la intro actual y la lista generada, ordenada por fecha con formato `Intl`, y borrar `blog.html`, `en/blog.html` y `pt/blogue.html`; verificar con `deno task compare` que los tres índices no tienen diferencias inesperadas (fechas y orden incluidos, con las correcciones de D14) y que el selector de idioma enlaza entre los tres
- [ ] 6.2 Configurar el plugin `sitemap` y borrar `sitemap.xml`; verificar que el generado contiene las 51 URLs absolutas
- [ ] 6.3 Configurar el plugin `feed` con un feed por idioma y añadir los `<link rel="alternate">` en los índices; verificar que cada feed es RSS válido y contiene solo los 15 posts de su idioma, del más reciente al más antiguo
- [ ] 6.4 Verificar que `_site/robots.txt` contiene `Sitemap: https://xulioze.com/sitemap.xml` (ya es correcto en el repo; añadir solo el salto de línea final)

## 7. Estilos

- [ ] 7.1 Renombrar `src/scss/styles.scss` a `src/scss/_index.scss`, crear `src/css/styles.scss` que lo importa, configurar el plugin `sass` y eliminar `css/` del repo (D11); verificar que `_site/css/styles.css` existe, que `_site/` no contiene ningún otro `.css` generado desde `scss/` y que el CV y un post se ven igual que en producción en `deno task serve`

## 8. Flujo de escritura y documentación

- [ ] 8.1 Actualizar `README.md` con cómo instalar Deno, `deno task serve`/`build`/`compare`, la estructura de `src/` y una plantilla de front matter para un post nuevo en tres idiomas (incluido el prompt para que Claude Desktop conserve y traduzca el front matter); verificar siguiendo el README para crear el post de prueba en `en` y `pt` y comprobar que aparece en los índices, los feeds, el sitemap y los selectores de idioma; después, devolverlo a `draft: true` (o borrar `en` y `pt`) y comprobar que el sitemap vuelve a tener 51 URLs

## 9. Despliegue en Netlify

- [ ] 9.1 Añadir `netlify.toml` con la instalación de Deno en versión fijada, `deno task build` y `publish = "_site"` (D12); verificar que la deploy preview de la PR se construye correctamente

## 10. Verificación de integración

- [ ] 10.1 Build limpio desde un clon nuevo + `deno task compare` completo: 0 URLs ausentes y solo diferencias esperadas
- [ ] 10.2 Revisar la deploy preview: CV y blog en los 3 idiomas, selector de idioma, avisos, botón de copiar (incluidos los 27 bloques nuevos), enlaces externos en pestaña nueva, tablas de la guía de Figma, fechas de los 3 posts de D14, descarga en Markdown, `sitemap.xml`, feeds y `robots.txt`; tras el merge, comprobar lo mismo en xulioze.com

## Workflow follow-up

- Archivar el cambio cuando el sitio esté en producción y verificado.
- Siguiente fase: comando de traducción en Claude Code.
