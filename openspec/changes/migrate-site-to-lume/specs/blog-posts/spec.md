# Spec Delta

## Purpose

Permitir escribir posts del blog en Markdown estándar con un front matter mínimo, y que el build los convierta en páginas con los componentes y la estructura del sitio, además de mantener los índices del blog.

## ADDED Requirements

### Requirement: Post en Markdown con front matter
Un post SHALL poder escribirse como un fichero Markdown con front matter que declara `id`, `lang`, `url`, `title`, `description`, `image` y `date`; el build publica una página completa en `url`.

#### Scenario: Publicar un post nuevo
- **WHEN** se añade `src/posts/<id>/es.md` con front matter válido y cuerpo Markdown
- **THEN** el build genera la página en la `url` declarada, con layout, header, footer y scripts del blog

#### Scenario: Campo obligatorio ausente
- **WHEN** un post no declara `id`, `lang`, `url`, `title` o `date`, o `lang` no es `es`, `en` ni `pt`
- **THEN** el build falla e indica el fichero afectado

### Requirement: Cabecera del post generada
La cabecera del post SHALL generarse a partir de `title` y `date`: el título como `h1` y, debajo, la fecha de publicación precedida de un texto fijo por idioma. El cuerpo no repite ninguno de los dos.

#### Scenario: Título en la cabecera
- **WHEN** se genera un post con `title`
- **THEN** la página muestra ese título como `h1.h1--blog` dentro del bloque de cabecera del post

#### Scenario: Fecha en la cabecera
- **WHEN** se genera un post con `date: 2025-10-13`
- **THEN** bajo el título aparece `<time datetime="2025-10-13">` con la fecha en formato largo del idioma del post
- **AND** va precedida de "Publicado el" (es), "Published on" (en) o "Publicado a" (pt)

### Requirement: Enlace de descarga en Markdown
Todo post SHALL incluir el enlace "descárgaselo como markdown" con el texto en el idioma del post y el marcado que espera el script del sitio.

#### Scenario: Descarga disponible
- **WHEN** se abre un post en cualquier idioma
- **THEN** aparece el enlace con id `downloadMarkdown` y al pulsarlo se descarga el post en Markdown

### Requirement: Bloques de código con botón de copiar
Todo bloque de código de un post SHALL renderizarse como bloque desplazable con botón de copiar, sin marcado especial en el Markdown.

#### Scenario: Bloque cercado en Markdown
- **WHEN** un post contiene un bloque de código cercado con ```
- **THEN** se genera `pre.c-post__prompt.c-post__prompt--scroll` con un `button.c-post__copy-btn` y un `code.c-post__prompt-code` con el contenido

#### Scenario: Etiqueta accesible por idioma
- **WHEN** el post está en inglés
- **THEN** el botón tiene `aria-label="Copy code"`; en español y portugués, `aria-label="Copiar código"`

#### Scenario: Copiar contenido
- **WHEN** el lector pulsa el botón de copiar
- **THEN** el contenido del bloque se copia al portapapeles y se muestra la confirmación en el idioma del post

### Requirement: Imágenes del cuerpo
Las imágenes Markdown del cuerpo SHALL renderizarse con la clase `c-post__body-img` y carga diferida, conservando el texto alternativo.

#### Scenario: Imagen en Markdown
- **WHEN** un post contiene `![Theodore pensando](/img/x.jpg)`
- **THEN** se genera un `img` con clase `c-post__body-img`, `loading="lazy"` y `alt="Theodore pensando"`

#### Scenario: Imagen dentro de una figura del sitio
- **WHEN** un `img` está dentro de un `figure.c-post__body-img`
- **THEN** el `img` no recibe la clase `c-post__body-img` (ya la tiene el `figure`)

### Requirement: Enlaces externos
Los enlaces del cuerpo a otros dominios SHALL abrirse en una pestaña nueva con `rel="noopener"`; los enlaces internos no cambian. El título opcional del enlace se conserva.

#### Scenario: Enlace externo con título
- **WHEN** un post contiene `[Cursor](https://cursor.com "Página oficial de Cursor")`
- **THEN** el enlace tiene `target="_blank"`, `rel="noopener"` y `title="Página oficial de Cursor"`

#### Scenario: Enlace interno
- **WHEN** un post enlaza a `https://xulioze.com/blog/...`, a una ruta relativa, a un ancla `#` o a un `mailto:`
- **THEN** el enlace no recibe `target="_blank"`

### Requirement: Tablas y encabezados
Las tablas del cuerpo SHALL llevar la clase `c-post__table` y los encabezados de sección SHALL tener un `id` derivado de su texto, para poder enlazarlos.

#### Scenario: Encabezado enlazable
- **WHEN** un post contiene `### Dev Mode MCP Server`
- **THEN** se genera `<h3 id="dev-mode-mcp-server">`

### Requirement: HTML y clases puntuales en Markdown
Un post SHALL poder incluir HTML en línea (p. ej. embeds de CodePen o `figure` con `figcaption`) y añadir clases a un elemento con la sintaxis `{.clase}`; ambos se publican tal cual.

#### Scenario: Embed en línea
- **WHEN** un post contiene un `iframe` con clase `c-post__body-iframe`
- **THEN** la página publicada contiene ese iframe sin alterar

### Requirement: Índices del blog generados
Cada idioma SHALL tener su índice del blog con todos los posts de ese idioma, ordenados por fecha descendente, con fecha y título enlazado.

#### Scenario: Post nuevo en el índice
- **WHEN** se publica un post con `lang: en`
- **THEN** aparece el primero en `en/blog.html` si es el más reciente, con su fecha y título
- **AND** no aparece en los índices de los otros idiomas

### Requirement: Posts antiguos migrados
Los 48 posts existentes SHALL conservar su contenido y presentación tras la migración. Los elementos estándar cuyo marcado estaba incompleto (bloques de código sin botón, encabezados sin `id`, enlaces externos sin `target`, tablas sin clase) lo completan, y las fechas inconsistentes se corrigen.

#### Scenario: Post antiguo
- **WHEN** se genera un post migrado
- **THEN** su cuerpo es equivalente al publicado antes de la migración, salvo las diferencias esperadas

#### Scenario: Fecha común a las traducciones
- **WHEN** se migra un post con tres traducciones
- **THEN** las tres tienen el mismo `date`
- **AND** el post de impresoras 3D tiene `date: 2024-02-12`, el de la PWA `2023-04-14` y el de bases de datos vectoriales `2025-03-05`
