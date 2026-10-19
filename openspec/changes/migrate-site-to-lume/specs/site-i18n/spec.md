# Spec Delta

## Purpose

Relacionar las versiones en español, inglés y portugués de cada página (posts, CV e índices del blog) y generar a partir de esa relación la navegación entre idiomas, sin enlaces escritos a mano.

## ADDED Requirements

### Requirement: Traducciones relacionadas por id
Las páginas que comparten el mismo `id` en su front matter SHALL tratarse como traducciones de un mismo contenido, cada una con su `lang` (`es`, `en` o `pt`) y su propia `url`.

#### Scenario: Post con tres traducciones
- **WHEN** `src/posts/oneshot-vs-dialogo/es.md`, `en.md` y `pt.md` declaran `id: oneshot-vs-dialogo` con `lang` distintos
- **THEN** el build trata las tres páginas como traducciones entre sí

#### Scenario: Slugs distintos por idioma
- **WHEN** las traducciones declaran URLs con slugs diferentes (`oneshot-vs-dialogo.html` y `oneshot-vs-dialogue.html`)
- **THEN** la relación entre ellas se mantiene igualmente

### Requirement: Selector de idioma generado
El header de cada página SHALL mostrar enlaces a las traducciones disponibles en los otros idiomas, generados a partir de la relación por `id`.

#### Scenario: Selector en un post
- **WHEN** se abre la versión en español de un post traducido a inglés y portugués
- **THEN** el header muestra los enlaces "Pt" y "En" apuntando a las URLs de esas traducciones

#### Scenario: Selector en el CV
- **WHEN** se abre `en/cv.html`
- **THEN** el header enlaza a la portada (es) y a `pt/cv.html`

#### Scenario: Selector en un índice del blog
- **WHEN** se abre `en/blog.html`
- **THEN** el header enlaza a `blog.html` (es) y a `pt/blogue.html`

### Requirement: Avisos de otras versiones del post
Cada post SHALL mostrar, bajo la cabecera, un aviso por cada traducción disponible ("You can read this post in english", etc.) con el texto en el idioma de destino.

#### Scenario: Avisos generados
- **WHEN** se abre un post en español con traducciones en inglés y portugués
- **THEN** aparecen dos avisos `c-message` que enlazan a cada traducción

### Requirement: Traducción ausente
Si a una página le falta la traducción a algún idioma, SHALL omitirse el enlace y el aviso de ese idioma, sin enlaces rotos.

#### Scenario: Post solo en español
- **WHEN** un post solo existe con `lang: es`
- **THEN** el build no falla, su página no tiene selector ni avisos hacia en/pt y no se genera ningún enlace a páginas inexistentes

### Requirement: Idioma declarado en la página
Cada página generada SHALL declarar su idioma en el atributo `lang` del elemento `html`.

#### Scenario: Atributo lang
- **WHEN** se genera una página con `lang: pt`
- **THEN** el elemento raíz es `<html lang="pt">`
