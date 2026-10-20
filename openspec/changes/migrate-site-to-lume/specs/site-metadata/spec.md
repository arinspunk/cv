# Spec Delta

## Purpose

Generar a partir del front matter los metadatos de cada página para buscadores y redes sociales, junto con el sitemap, los feeds RSS y robots.txt, para que el sitio sea descubrible sin mantenimiento manual.

## ADDED Requirements

### Requirement: Metas generados desde el front matter
Cada página SHALL incluir `title`, `description`, canonical y los metas Open Graph, Twitter e itemprop, generados a partir de `title`, `description`, `image` y `url` del front matter, sin repetirlos en las fuentes.

#### Scenario: Metas de un post
- **WHEN** se genera un post con `title: "¿One-shot prompting? Prefiero conversar con mi IA"`
- **THEN** `<title>`, `og:title`, `twitter:title`, `itemprop=name` y `apple-mobile-web-app-title` contienen ese título seguido de " - Xúlio Zé"
- **AND** `description`, `og:description`, `twitter:description` e `itemprop=description` contienen la `description`

#### Scenario: URLs absolutas
- **WHEN** se genera una página con `url: /blog/oneshot-vs-dialogo.html` e `image: /img/bicentennial-man-og.jpg`
- **THEN** canonical, `og:url` y `twitter:url` valen `https://xulioze.com/blog/oneshot-vs-dialogo.html`
- **AND** `og:image`, `twitter:image` e `itemprop=image` son URLs absolutas bajo `https://xulioze.com`, con las dimensiones `og:image:width` y `og:image:height`

#### Scenario: Página sin imagen propia
- **WHEN** una página no declara `image`
- **THEN** se usa la imagen social por defecto del sitio

### Requirement: Sitemap completo
El build SHALL generar `sitemap.xml` con todas las páginas publicadas en los tres idiomas.

#### Scenario: Post nuevo en el sitemap
- **WHEN** se publica un post nuevo
- **THEN** su URL absoluta aparece en `sitemap.xml` sin editar ningún fichero adicional

### Requirement: Feed RSS por idioma
El build SHALL generar un feed RSS por idioma con los posts de ese idioma, ordenados del más reciente al más antiguo, con título, descripción, fecha y URL absoluta.

#### Scenario: Feed en inglés
- **WHEN** se genera el sitio
- **THEN** existe un feed para `en` que contiene solo posts con `lang: en`
- **AND** el índice del blog en inglés enlaza a ese feed para su autodescubrimiento

### Requirement: robots.txt apunta al sitemap
`robots.txt` SHALL permitir todo el sitio y declarar la URL correcta del sitemap.

#### Scenario: URL del sitemap
- **WHEN** un rastreador lee `robots.txt`
- **THEN** encuentra `Sitemap: https://xulioze.com/sitemap.xml`
