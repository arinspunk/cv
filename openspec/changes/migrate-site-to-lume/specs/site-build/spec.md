# Spec Delta

## Purpose

Generar el sitio estático completo (CV y blog en es/en/pt) a partir de fuentes y plantillas, conservando las URLs y recursos públicos, y desplegarlo en Netlify.

## ADDED Requirements

### Requirement: Build único del sitio
El sitio SHALL generarse completo con un único comando de build que produce una carpeta de salida autocontenida, lista para publicarse sin pasos manuales adicionales.

#### Scenario: Build desde un clon limpio
- **WHEN** se ejecuta el comando de build en un clon limpio del repositorio con Deno instalado
- **THEN** se genera la carpeta de salida con todas las páginas, estilos y recursos del sitio
- **AND** el comando termina sin errores

#### Scenario: Build fallido
- **WHEN** una fuente tiene un error que impide generarla (p. ej. front matter inválido)
- **THEN** el build termina con código de salida distinto de cero y no se despliega

### Requirement: Conservación de URLs públicas
Toda URL de página publicada antes de la migración SHALL seguir existiendo en la salida del build con la misma ruta, incluida la extensión `.html`.

#### Scenario: URLs de posts conservadas
- **WHEN** se genera el sitio
- **THEN** existen `blog/<slug>.html`, `en/blog/<slug>.html` y `pt/blogue/<slug>.html` para los 45 posts actuales con sus slugs actuales

#### Scenario: URLs de CV e índices conservadas
- **WHEN** se genera el sitio
- **THEN** existen `index.html`, `en/cv.html`, `pt/cv.html`, `blog.html`, `en/blog.html` y `pt/blogue.html`

### Requirement: Recursos estáticos publicados
Los recursos estáticos públicos SHALL copiarse a la salida en sus rutas actuales: `img/`, `fonts/`, `js/`, `favicon.ico`, `humans.txt` y `robots.txt`.

#### Scenario: Recurso estático disponible
- **WHEN** se genera el sitio
- **THEN** `img/icons/site.webmanifest`, `fonts/sawtonbauhaus-thin-webfont.woff2` y `js/application.min.js` existen en la salida con contenido idéntico al del repositorio

#### Scenario: Ficheros internos no publicados
- **WHEN** se genera el sitio
- **THEN** la salida no contiene `openspec/`, `scss/`, `.cursor/`, `.claude/`, `README.md`, `tokens.json` ni ficheros `.psd`

### Requirement: Estilos compilados en el build
La hoja de estilos SHALL compilarse desde `scss/styles.scss` durante el build y publicarse en `css/styles.css`.

#### Scenario: CSS generado
- **WHEN** se genera el sitio
- **THEN** existe `css/styles.css` compilado a partir de las fuentes SCSS actuales
- **AND** las páginas lo enlazan en esa ruta

### Requirement: Despliegue en Netlify
Netlify SHALL construir el sitio con el comando de build y publicar únicamente la carpeta de salida, tanto en producción como en las deploy previews.

#### Scenario: Despliegue de producción
- **WHEN** se hace push a `main`
- **THEN** Netlify ejecuta el build y publica la carpeta de salida en xulioze.com

#### Scenario: Deploy preview
- **WHEN** se abre una pull request
- **THEN** Netlify publica una vista previa con el sitio generado desde esa rama

### Requirement: Equivalencia con el sitio anterior
El HTML generado para las páginas migradas SHALL ser equivalente al publicado antes de la migración, salvo en las diferencias declaradas como esperadas.

#### Scenario: Comparación sin regresiones
- **WHEN** se compara cada página generada con su versión anterior, normalizando espacios en blanco
- **THEN** las únicas diferencias son las de la lista de diferencias esperadas
