# :bowtie: A simple personal site #

Hi, this is the code of [my personal site](https://xulioze.com/). Really It's quite simple and it was made with HTML, CSS (SCSS) and some JavaScript, but inside it there are some features that maybe could interest you:

*  I've used [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (and its fallbacks).
*  For the classes names I've followed [BEM methodology](http://getbem.com/).
*  The CSS has been compiled under [ITCSS architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/).

So if you want to see the code, try it or reuse for another project, feel free to do it :wink:

## :tractor: How to run this ##

The site is built with [Lume](https://lume.land/), a static site generator for [Deno](https://deno.com/). Templates, metas, the language selector, the blog indices, `sitemap.xml` and the RSS feeds are generated; the SCSS is compiled in the same build.

1.  [Install Deno](https://docs.deno.com/runtime/getting_started/installation/) (2.x):

    ```sh
    curl -fsSL https://deno.land/install.sh | sh
    ```

2.  Clone the repository and run the development server:

    ```sh
    git clone https://github.com/[YOUR-USERNAME]/cv.git
    cd cv
    deno task serve
    ```

    The site is served at `http://localhost:3000` and rebuilt on every change.

### Tasks ###

| Command | What it does |
|---|---|
| `deno task serve` | Development server with live reload. |
| `deno task build` | Builds the site into `_site/` (the folder Netlify publishes). Fails, naming the file, if a post has an invalid front matter. |
| `LUME_DRAFTS=true deno task build` | Same, including the posts with `draft: true`. |
| `deno task compare` | Compares `_site/` with the site before the migration (git tag `pre-lume`) and fails on any unexpected difference. Run it after `deno task build`, not while `serve` is running (`serve` rewrites `_site/` with `localhost` URLs). |

### Structure ###

```
_config.ts            Lume configuration: plugins, post components, front matter validation
src/
  _data/
    site.yml          author and default social image
    i18n.yml          texts of the header, footer, notices and post header for es / en / pt
  _includes/
    layouts/          base.vto, cv.vto, post.vto, blog-index.vto
    partials/         head-metas.vto, header.vto, footer.vto, copy-button.svg
  cv/                 es.html, en.html, pt.html (the CV, one per language)
  blog-index/         es.vto, en.vto, pt.vto (intro of each blog index; the list is generated)
  posts/<id>/         es.md, en.md, pt.md (or .html for the posts written before the migration)
  css/styles.scss     Sass entry point, published as /css/styles.css
  scss/               Sass partials (ITCSS)
  vendor/             atproto-comments web component, bundled from JSR
  img/ fonts/ js/ favicon.ico humans.txt robots.txt
scripts/              compare.ts and migrate-posts.ts
drafts/               drafts that are not published
```

## :pencil2: How to write a post ##

A post is one Markdown file per language in `src/posts/<id>/`, where `<id>` is the slug of the Spanish version. The three files share `id` and `date`; that is what links the translations to each other (language selector and "you can read this post in…" notices).

```markdown
---
id: oneshot-vs-dialogo
lang: es
url: /blog/oneshot-vs-dialogo.html
title: "¿One-shot prompting? Prefiero conversar con mi IA"
description: "El valor real de la IA no está en la generación inicial, sino en las iteraciones posteriores."
image: /img/bicentennial-man-og.jpg
date: 2025-10-13
---

The body, in standard Markdown. Don't repeat the title or the date: the layout prints them.
```

| Field | | Notes |
|---|---|---|
| `id` | required | Same in the three languages. |
| `lang` | required | `es`, `en` or `pt`. |
| `url` | required | `/blog/<slug>.html`, `/en/blog/<slug>.html` or `/pt/blogue/<slug>.html`. The slug can change per language. |
| `title` | required | Without " - Xúlio Zé": the metas add it. |
| `date` | required | `YYYY-MM-DD`, the same in the three languages. |
| `description` | optional | Used in the metas and the RSS feed. |
| `image` | optional | Social image (`/img/...`). Without it, the default image of `site.yml` is used. |
| `draft` | optional | `true` to leave it out of the build (and of the indices, feeds and sitemap). |

What the build does for you:

*  Code blocks (```` ``` ````) get the scroll style and the copy button.
*  Images get `c-post__body-img` and `loading="lazy"`; external links open in a new tab; tables get `c-post__table`; `##`–`####` headings get an `id`.
*  A one-off class can be added with `{.class}` after a paragraph, and HTML can be written inline (CodePen embeds, `figure` with `figcaption`…).
*  To show AT Protocol comments, paste the element in the post: `<atproto-comments thread-uri="at://…"></atproto-comments>`. Its JS and CSS are added only to that post.
*  The post appears in the blog index, the RSS feed and `sitemap.xml` of its language.

### Translating a post with Claude Desktop ###

Write the Spanish version and ask for each translation with this prompt (change the language and the URL prefix):

```text
Translate the following Markdown blog post from Spanish to English.

Front matter (the block between the two "---" lines):
- Keep `id`, `date` and `image` exactly as they are.
- Set `lang: en`.
- Translate `title` and `description`.
- Set `url` to `/en/blog/<slug>.html`, where <slug> is a short English slug of the title, in lowercase with hyphens.

Body:
- Translate the text and the image alt texts, keeping the Markdown formatting.
- Do not translate code blocks, URLs, HTML tags or their attributes, or `{.class}` markers.

Answer only with the complete Markdown file, front matter included.
```

For Portuguese: `lang: pt` and `url: /pt/blogue/<slug>.html`. Save the results as `en.md` and `pt.md` next to `es.md`.

## :mage: How to minify the JS ##

https://www.npmjs.com/package/uglify-js

1.  Install uglifyjs

    ```
    npm install uglify-js -g
    ```

2.  Command line usage

    ```
    uglifyjs --compress --mangle -- js/application.js
    ```

## :copyright: Licenses ##

This project is under [GNU GPLv3 license](https://www.gnu.org/licenses/gpl-3.0.html)

Sawton, the beautiful font from [Atipo Foundry](https://www.atipofoundry.com), is under [its own license](https://www.atipofoundry.com/license). If you want to use it, you need to [buy it](https://www.atipofoundry.com/fonts/sawton).
