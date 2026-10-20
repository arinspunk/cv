/**
 * Compara el sitio anterior (etiqueta `pre-lume`) con el generado en `_site/` (D13).
 *
 *   deno task compare                       snapshot de pre-lume vs _site/
 *   deno task compare --old <dir> --new <dir>
 *   deno task compare --page blog/foo.html  solo esa página
 *   deno task compare --verbose             lista también las diferencias esperadas
 *
 * Normaliza espacios, comentarios, orden de atributos y de clases y URLs
 * internas; después clasifica cada diferencia en una de las categorías
 * esperadas de D13. Termina con código 1 si falta alguna URL o queda alguna
 * diferencia sin clasificar.
 */
import { DOMParser } from "lume/deps/dom.ts";
import { diffArrays } from "npm:diff@7.0.0";
import { parseArgs } from "jsr:@std/cli@1.0.6/parse-args";
import { walk } from "jsr:@std/fs@1.0.4/walk";
import { join, relative } from "jsr:@std/path@1.0.6";

const SITE = "https://xulioze.com";

// --- Páginas con diferencias esperadas propias ------------------------------

const CV = ["index.html", "en/cv.html", "pt/cv.html"];
const INDICES = ["blog.html", "en/blog.html", "pt/blogue.html"];

/** D14: posts con la fecha corregida */
const DATE_FIXES = [
  "blog/construir-pwa-con-chatgpt.html",
  "en/blog/build-pwa-with-chatgpt.html",
  "pt/blogue/construir-pwa-com-chatgpt.html",
  "blog/bases-datos-vectoriales-introduccion.html",
  "en/blog/vector-stores-introduction.html",
  "pt/blogue/bases-dados-vectoriais-introducao.html",
  "blog/impresoras-3d-muerte-simetria.html",
  "en/blog/3d-printers-death-symmetry.html",
  "pt/blogue/impressoras-3d-morte-simetria.html",
];

/** Diferencia 10: frontity en es y pt, sin `section.c-post__body` */
const FRONTITY = [
  "blog/frontity-custom-page-templates.html",
  "pt/blogue/frontity-custom-page-templates.html",
];

/** Diferencia 12: posts con el `<head>` reducido */
const REDUCED_HEAD = [
  "blog/contexto-extendido-v2.html",
  "en/blog/extended-context-v2.html",
  "pt/blogue/contexto-estendido-v2.html",
  "blog/atproto-comments.html",
  "en/blog/atproto-comments.html",
  "pt/blogue/atproto-comments.html",
];

/** Diferencia 13: posts con `<atproto-comments>` */
const ATPROTO = REDUCED_HEAD.filter((p) => p.includes("atproto-comments"));

/** Diferencia 14: posts en inglés que declaraban `lang="pt"` */
const LANG_FIXES = [
  "en/blog/extended-context.html",
  "en/blog/3d-printers-death-symmetry.html",
  "en/blog/vector-stores-introduction.html",
  "en/blog/how-talk-with-chatgpt.html",
  "en/blog/ai-for-developers.html",
  "en/blog/reimbursement.html",
];

/** Diferencia 15: posts cuyo `<title>` no era su `h1` */
const TITLE_FIXES = [
  "blog/construir-pwa-con-chatgpt.html",
  "en/blog/build-pwa-with-chatgpt.html",
  "pt/blogue/construir-pwa-com-chatgpt.html",
  ...FRONTITY,
  "en/blog/frontity-custom-page-templates.html",
];

/** Diferencia 15: entradas de los índices cuyo texto no era el `h1` */
const INDEX_TITLE_FIXES = [
  "blog/construir-pwa-con-chatgpt.html",
  "pt/blogue/construir-pwa-com-chatgpt.html",
  "pt/blogue/como-falar-com-chatgpt.html",
];

/** Diferencia 3: posts cuyo `og:image` no apuntaba a ningún fichero */
const BROKEN_OG_IMAGE = ["blog/guia-integrar-figma-con-ia.html"];

/** Diferencia 6: ficheros que dejan de publicarse */
const REMOVED = [
  "blog/extended-context-v2.md",
  "en/blog/post-agents-context",
  "img/claude-talk-to-figma-metas.psd",
];

/** Ficheros del repo anterior que nunca fueron parte del sitio */
const NOT_SITE = [
  /^\./,
  /^openspec\//,
  /^scss\//,
  /^README\.md$/,
  /^tokens\.json$/,
  /(^|\/)\.DS_Store$/,
];

// --- Tokens ------------------------------------------------------------------

interface Anc {
  tag: string;
  cls: string[];
  attrs: Record<string, string>;
}

interface Tok {
  kind: "open" | "close" | "text";
  tag: string;
  attrs: Record<string, string>;
  text: string;
  path: Anc[];
  key: string;
  /** href del `article.c-article` que lo contiene (índices) */
  group?: string;
}

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "source", "track", "wbr",
]);
const RAW = new Set(["pre", "code", "script", "style", "textarea"]);
const URL_ATTRS = new Set(["href", "src"]);

function normUrl(value: string, page: string): string {
  if (value.startsWith("#")) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value)) {
    return value;
  }
  let url: URL;
  try {
    url = new URL(value, `${SITE}/${page}`);
  } catch {
    return value;
  }
  if (url.origin !== SITE) return value;
  return url.href.replace(/\/index\.html(?=$|[?#])/, "/");
}

// deno-lint-ignore no-explicit-any
type DomNode = any;

function tokenize(html: string, page: string): Tok[] {
  const doc = new DOMParser().parseFromString(html, "text/html")!;
  const out: Tok[] = [];

  function visit(node: DomNode, path: Anc[], group?: string) {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const raw: string = child.textContent;
        if (!raw.trim()) continue;
        const inRaw = path.some((a) => RAW.has(a.tag));
        const text = inRaw ? raw : raw.replace(/\s+/g, " ").trim();
        out.push({
          kind: "text",
          tag: path.at(-1)?.tag ?? "",
          attrs: {},
          text,
          path,
          key: "#" + JSON.stringify(text),
          group,
        });
      } else if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        const attrs: Record<string, string> = {};
        for (const { name, value } of child.attributes) {
          if (name === "class") {
            attrs.class = value.split(/\s+/).filter(Boolean).sort().join(" ");
            if (!attrs.class) delete attrs.class;
          } else {
            attrs[name] = URL_ATTRS.has(name) ? normUrl(value, page) : value;
          }
        }
        const names = Object.keys(attrs).sort();
        const key = `<${tag}${
          names.map((n) => ` ${n}="${attrs[n]}"`).join("")
        }>`;
        let childGroup = group;
        if (tag === "article" && attrs.class?.split(" ").includes("c-article")) {
          const link = child.querySelector("a[href]");
          childGroup = link
            ? normUrl(link.getAttribute("href"), page)
            : undefined;
        }
        const anc: Anc = { tag, cls: attrs.class?.split(" ") ?? [], attrs };
        out.push({ kind: "open", tag, attrs, text: "", path, key, group: childGroup });
        const childPath = [...path, anc];
        // `<template>` guarda sus hijos en `content`
        visit(tag === "template" ? child.content : child, childPath, childGroup);
        if (!VOID.has(tag)) {
          out.push({
            kind: "close",
            tag,
            attrs,
            text: "",
            path,
            key: `</${tag}>`,
            group: childGroup,
          });
        }
      }
    }
  }

  visit(doc, []);
  return out;
}

// --- Diferencias ---------------------------------------------------------------

interface Item {
  op: "add" | "del" | "mod";
  /** token nuevo (add, mod) o antiguo (del) */
  tok: Tok;
  /** token antiguo (mod) */
  old?: Tok;
  /** la misma etiqueta aparece borrada y añadida en otro sitio de la página */
  moved?: boolean;
}

// Solo el padre inmediato: en frontity es/pt cambian los ancestros (diferencia 10)
const sig = (t: Tok) => `${t.kind}|${t.tag}|${t.path.at(-1)?.tag ?? ""}`;

/** Clave para emparejar un borrado con un añadido como modificación */
const pairKey = (t: Tok) =>
  sig(t) + (t.tag === "meta" || t.tag === "link" ? `|${metaName(t)}|${t.attrs.hreflang ?? ""}` : "");

function diff(oldToks: Tok[], newToks: Tok[]): Item[] {
  const parts = diffArrays(oldToks.map((t) => t.key), newToks.map((t) => t.key));
  const items: Item[] = [];
  let i = 0, j = 0;
  let dels: Tok[] = [], adds: Tok[] = [];

  const flush = () => {
    const free = [...adds];
    for (const d of dels) {
      const k = free.findIndex((a) => pairKey(a) === pairKey(d) && a.kind !== "close");
      if (k >= 0 && d.kind !== "close") {
        items.push({ op: "mod", tok: free[k], old: d });
        free.splice(k, 1);
      } else {
        items.push({ op: "del", tok: d });
      }
    }
    for (const a of free) items.push({ op: "add", tok: a });
    dels = [];
    adds = [];
  };

  for (const part of parts) {
    if (part.removed) {
      dels.push(...oldToks.slice(i, i + part.count!));
      i += part.count!;
    } else if (part.added) {
      adds.push(...newToks.slice(j, j + part.count!));
      j += part.count!;
    } else {
      flush();
      i += part.count!;
      j += part.count!;
    }
  }
  flush();

  // Movimientos: misma etiqueta borrada en un sitio y añadida en otro
  const added = new Map<string, Item[]>();
  for (const it of items) {
    if (it.op === "add") {
      const k = it.tok.key + "|" + sig(it.tok);
      added.set(k, [...(added.get(k) ?? []), it]);
    }
  }
  for (const it of items) {
    if (it.op !== "del") continue;
    const match = added.get(it.tok.key + "|" + sig(it.tok))?.find((a) => !a.moved);
    if (match) {
      it.moved = true;
      match.moved = true;
    }
  }
  return items;
}

// --- Clasificación ---------------------------------------------------------------

interface Page {
  path: string;
  kind: "cv" | "index" | "post";
  /** texto del `<title>` generado */
  title?: string;
}

const asAnc = (t: Tok): Anc | undefined =>
  t.kind === "text"
    ? undefined
    : { tag: t.tag, cls: t.attrs.class?.split(" ") ?? [], attrs: t.attrs };

/** El token (o alguno de sus ancestros) cumple `test` */
function within(t: Tok, test: (a: Anc) => boolean): boolean {
  const self = asAnc(t);
  return (self !== undefined && test(self)) || t.path.some(test);
}

const is = (tag: string, cls?: string) => (a: Anc) =>
  a.tag === tag && (!cls || a.cls.includes(cls));
const inHead = (t: Tok) => within(t, is("head"));
const inPostBody = (t: Tok) =>
  within(t, is("section", "c-post__body")) && !within(t, is("header", "c-info"));
const inInfo = (t: Tok) => within(t, is("header", "c-info"));

/** Cambios de atributos de un `mod` */
function delta(it: Item) {
  const o = it.old!.attrs, n = it.tok.attrs;
  const names = new Set([...Object.keys(o), ...Object.keys(n)]);
  const added: string[] = [], removed: string[] = [], changed: string[] = [];
  for (const name of names) {
    if (!(name in o)) added.push(name);
    else if (!(name in n)) removed.push(name);
    else if (o[name] !== n[name]) changed.push(name);
  }
  const oc = new Set(o.class?.split(" ") ?? []);
  const nc = new Set(n.class?.split(" ") ?? []);
  return {
    added,
    removed,
    changed,
    all: [...added, ...removed, ...changed],
    classAdded: [...nc].filter((c) => !oc.has(c)),
    classRemoved: [...oc].filter((c) => !nc.has(c)),
  };
}

/** El `mod` solo cambia los atributos `names` */
const onlyAttrs = (it: Item, ...names: string[]) =>
  it.op === "mod" && it.tok.kind !== "text" &&
  delta(it).all.every((n) => names.includes(n));

/** El `mod` solo añade las clases `classes` (y no toca nada más) */
const onlyAddsClasses = (it: Item, ...classes: string[]) => {
  if (it.op !== "mod" || it.tok.kind === "text") return false;
  const d = delta(it);
  return d.all.every((n) => n === "class") && d.classRemoved.length === 0 &&
    d.classAdded.length > 0 && d.classAdded.every((c) => classes.includes(c));
};

const metaName = (t: Tok) =>
  t.attrs.name ?? t.attrs.property ?? t.attrs.itemprop ?? t.attrs.rel ?? "";

interface Category {
  id: number;
  title: string;
  test: (it: Item, page: Page) => boolean;
}

const CATEGORIES: Category[] = [
  {
    id: 1,
    title: "Bloques de código: --scroll y botón de copiar",
    test: (it) => {
      const t = it.tok;
      if (!within(t, is("pre"))) return false;
      if (it.op === "add" && within(t, is("button", "c-post__copy-btn"))) return true;
      if (t.tag === "pre") return onlyAddsClasses(it, "c-post__prompt", "c-post__prompt--scroll");
      if (t.tag === "code") {
        if (it.op === "mod") return onlyAddsClasses(it, "c-post__prompt-code");
        return it.op === "add" && t.path.at(-1)?.tag === "pre" &&
          (t.kind === "close" || t.attrs.class === "c-post__prompt-code");
      }
      return false;
    },
  },
  {
    id: 2,
    title: "Línea de fecha unificada",
    test: (it, page) => {
      const t = it.tok;
      const where = page.kind === "index"
        ? within(t, is("div", "c-articles"))
        : inInfo(t);
      if (!where) return false;
      if (t.tag === "time" && t.kind === "open" && it.op === "mod") {
        const d = delta(it);
        return d.all.length === 1 && d.changed[0] === "datetime" &&
          it.old!.attrs.datetime.slice(0, 10) === t.attrs.datetime;
      }
      if (page.kind === "index" && t.kind === "text" && t.tag === "time" && it.op === "mod") {
        return it.old!.text.replace(/\b0(\d)\b/, "$1") === t.text;
      }
      if (t.kind === "text" && t.tag !== "time" && it.op === "mod") {
        const prefix = /^(Publicado (el|o|em|a)|Published on)$/;
        return prefix.test(it.old!.text) && prefix.test(t.text);
      }
      if (!FRONTITY.includes(page.path)) return false;
      if (it.op === "del" && t.tag === "div") return t.kind === "close" || t.attrs.class === "c-info__time";
      // El <time> y el prefijo cambian de padre: salen como borrado + añadido
      if (t.kind === "open" && t.tag === "time" && it.op !== "mod") {
        return /^\d{4}-\d{2}-\d{2}/.test(t.attrs.datetime ?? "");
      }
      return t.kind === "text" && it.op !== "mod" && /^(Publicado (el|o|em|a)|Published on)$/.test(t.text);
    },
  },
  {
    id: 3,
    title: "URLs y dimensiones de los metas",
    test: (it, page) => {
      if (!inHead(it.tok) || it.op !== "mod") return false;
      const name = metaName(it.tok);
      const o = it.old!.attrs, n = it.tok.attrs;
      if (name === "canonical" && onlyAttrs(it, "href")) {
        return sameUrl(o.href, n.href) || n.href === ownUrl(page);
      }
      if (["og:url", "twitter:url"].includes(name) && onlyAttrs(it, "content")) {
        return sameUrl(o.content, n.content) || n.content === ownUrl(page);
      }
      if (["og:image", "twitter:image", "image"].includes(name) && onlyAttrs(it, "content")) {
        // Mismo fichero de `/img/` (algunas rutas relativas apuntaban a `/en/img/…`)
        const file = new URL(o.content, `${SITE}/${page.path}`).pathname.split("/").pop()!
          .replace(/(\.(png|jpe?g|gif|webp)).*$/i, "$1");
        return n.content === `${SITE}/img/${file}` ||
          (BROKEN_OG_IMAGE.includes(page.path) && name === "og:image" && n.content.startsWith(`${SITE}/img/`));
      }
      if (["og:image:width", "og:image:height"].includes(name)) {
        return onlyAttrs(it, "content") && /^\d+$/.test(n.content);
      }
      if (name === "author") return onlyAttrs(it, "href") && n.href === `${SITE}/humans.txt`;
      return false;
    },
  },
  {
    id: 4,
    title: "Copyright con el año del build",
    test: (it) =>
      it.op === "mod" && metaName(it.tok) === "copyright" &&
      onlyAttrs(it, "content") && /^\(c\) \d{4} Xúlio Zé$/.test(it.tok.attrs.content),
  },
  {
    id: 5,
    title: "<link rel=alternate> de hreflang y feeds",
    test: (it) =>
      it.op === "add" && inHead(it.tok) && it.tok.tag === "link" &&
      it.tok.attrs.rel === "alternate" &&
      ("hreflang" in it.tok.attrs || it.tok.attrs.type === "application/rss+xml"),
  },
  // 6: URLs que dejan de publicarse (se comprueba aparte)
  {
    id: 7,
    title: "id en los encabezados del post",
    test: (it) =>
      ["h2", "h3", "h4"].includes(it.tok.tag) && inPostBody(it.tok) &&
      it.op === "mod" && delta(it).added.join() === "id" && delta(it).all.length === 1,
  },
  {
    id: 8,
    title: "target/rel en enlaces externos del post",
    test: (it) => {
      const t = it.tok;
      if (t.tag !== "a" || !inPostBody(t) || it.op !== "mod") return false;
      if (!/^https?:/.test(t.attrs.href ?? "") || t.attrs.href.startsWith(SITE)) return false;
      const d = delta(it);
      return d.removed.length === 0 && d.changed.every((n) => n === "rel") &&
        d.all.length > 0 && d.all.every((n) => n === "target" || n === "rel") &&
        t.attrs.target === "_blank" && t.attrs.rel.split(" ").includes("noopener");
    },
  },
  {
    id: 9,
    title: "c-post__table en las tablas",
    test: (it) => it.tok.tag === "table" && inPostBody(it.tok) && onlyAddsClasses(it, "c-post__table"),
  },
  {
    id: 10,
    title: "frontity es/pt con la estructura común del post",
    test: (it, page) => {
      if (!FRONTITY.includes(page.path)) return false;
      const t = it.tok;
      if (!["article", "section", "div"].includes(t.tag) || t.kind === "text") return false;
      if (t.kind === "close") return it.op !== "mod";
      const ok = (cls?: string) =>
        (cls?.split(" ") ?? []).every((c) =>
          ["o-wrap", "o-wrap--center", "c-post", "c-post__body"].includes(c)
        );
      return ok(t.attrs.class) && (it.op !== "mod" || ok(it.old!.attrs.class)) &&
        (it.op !== "mod" || onlyAttrs(it, "class"));
    },
  },
  {
    id: 11,
    title: "Fechas corregidas (D14)",
    test: (it, page) => {
      const t = it.tok;
      if (page.kind === "index") return DATE_FIXES.includes(groupPath(t) ?? "");
      if (!DATE_FIXES.includes(page.path) || !inInfo(t)) return false;
      if (t.kind === "text") return t.tag === "time" && it.op === "mod";
      return t.tag === "time" && it.op === "mod" && onlyAttrs(it, "datetime");
    },
  },
  {
    id: 12,
    title: "<head> completo y uniforme",
    test: (it) => {
      const t = it.tok;
      if (!inHead(t) || t.tag === "script" || t.tag === "title") return false;
      if (it.moved || (it.op === "add" && ["meta", "link"].includes(t.tag))) return true;
      if (it.op !== "mod") return false;
      const name = metaName(t);
      if (name === "mask-icon") return onlyAttrs(it, "color") && t.attrs.color === "#0000ff";
      if (name === "msapplication-TileColor") return onlyAttrs(it, "content") && t.attrs.content === "#da532c";
      if (name === "theme-color") return onlyAttrs(it, "content") && t.attrs.content === "#00000B";
      return false;
    },
  },
  {
    id: 13,
    title: "atproto-comments desde /vendor/ en lugar de jsDelivr",
    test: (it, page) => {
      if (!ATPROTO.includes(page.path)) return false;
      const t = it.tok;
      const url = t.attrs.href ?? t.attrs.src ?? "";
      if (t.kind === "close") return t.tag === "script" && it.op !== "mod";
      if (it.op === "del") return url.startsWith("https://cdn.jsdelivr.net/npm/atproto-comments@");
      const vendor = /^https:\/\/xulioze\.com\/vendor\/atproto-comments\.(css|js)$/;
      if (it.op === "add") return vendor.test(url);
      const oldUrl = it.old!.attrs.href ?? it.old!.attrs.src ?? "";
      return onlyAttrs(it, "href", "src") && vendor.test(url) &&
        oldUrl.startsWith("https://cdn.jsdelivr.net/npm/atproto-comments@");
    },
  },
  {
    id: 14,
    title: "Cabecera, pie y avisos unificados",
    test: (it, page) => {
      const t = it.tok;
      const chrome = within(t, is("header", "c-header")) || within(t, is("footer", "c-footer"));
      if (chrome) {
        if (it.moved) return true;
        if (it.op !== "mod") return false;
        if (t.kind === "text") return true;
        if (t.tag === "a" && onlyAttrs(it, "href", "title")) {
          // Logo y enlace "CV": al CV del idioma de la página
          if (CV_URLS.includes(t.attrs.href) && CV_URLS.includes(it.old!.attrs.href)) return true;
          // Enlaces de idioma en otro orden
          if (within(t, is("li", "c-header__menu-item--language"))) return true;
        }
        if (t.tag === "a" && within(t, is("footer", "c-footer")) && onlyAttrs(it, "class") &&
          it.old!.attrs.class === "c-header__menu-link" && t.attrs.class === "c-footer__menu-link") return true;
        // Logo: al CV del idioma (en `en/blog.html` apuntaba a /cv.html, que no existe)
        if (t.tag === "a" && t.attrs.class === "c-header__logo-link" && onlyAttrs(it, "href")) {
          return CV_URLS.includes(t.attrs.href);
        }
        const d = delta(it);
        return onlyAttrs(it, "title") || onlyAddsClasses(it, "c-footer--blog") ||
          (d.all.join() === "class" && d.classAdded.length === 0 &&
            d.classRemoved.every((c) => DEAD_FOOTER_CLASSES.includes(c)));
      }
      if (within(t, is("div", "c-messages"))) return true;
      // Entrada de relleno al final de los índices en/pt (en es estaba comentada)
      if (page.kind === "index" && it.op === "del" && within(t, is("div", "c-articles")) &&
        within(t, (a) => a.tag === "article" && a.cls.length === 0)) return true;
      if (inInfo(t) && t.kind === "text" && it.op === "mod") {
        return /^🤖/.test(it.old!.text) && /^🤖/.test(t.text) ||
          t.path.at(-1)?.attrs.id === "downloadMarkdown";
      }
      if (t.tag === "html" && LANG_FIXES.includes(page.path)) {
        return onlyAttrs(it, "lang") && t.attrs.lang === "en";
      }
      if (t.tag === "script" && it.op === "mod" && /markdown-converter\.js$/.test(t.attrs.src ?? "")) {
        return delta(it).removed.join() === "defer" && delta(it).all.length === 1;
      }
      return false;
    },
  },
  {
    id: 15,
    title: "Títulos unificados con el h1",
    test: (it, page) => {
      const t = it.tok;
      if (inHead(t) && it.op === "mod" && t.kind !== "text" && onlyAttrs(it, "content") &&
        ["og:title", "twitter:title", "name", "apple-mobile-web-app-title"].includes(metaName(t)) &&
        t.attrs.content === page.title) return true;
      if (page.kind === "index") {
        return it.op === "mod" && t.kind === "text" &&
          within(t, is("a", "c-article__link")) &&
          INDEX_TITLE_FIXES.includes(groupPath(t) ?? "");
      }
      if (!inHead(t) || it.op !== "mod") return false;
      if (page.path === "index.html") return t.kind === "text" && t.tag === "title";
      if (page.path === "pt/blogue.html") return metaName(t) === "og:title" && onlyAttrs(it, "content");
      const titleMeta = ["og:title", "twitter:title", "name", "apple-mobile-web-app-title"]
        .includes(metaName(t)) && onlyAttrs(it, "content");
      // Metas de título con el título de otro post
      if (titleMeta && t.attrs.content === page.title) return true;
      if (!TITLE_FIXES.includes(page.path)) return false;
      if (t.kind === "text") return t.tag === "title";
      return titleMeta;
    },
  },
];

const CV_URLS = [`${SITE}/`, `${SITE}/en/cv.html`, `${SITE}/pt/cv.html`];
const DEAD_FOOTER_CLASSES = ["c-footer__menu-link--blog", "c-footer__credits--blog"];

/** Misma URL salvo `http:` → `https:` y la barra final de la raíz */
function sameUrl(old: string, cur: string): boolean {
  const norm = (u: string) => u.replace(/^http:/, "https:").replace(/^(https:\/\/[^/]+)$/, "$1/");
  return cur.startsWith(`${SITE}/`) && norm(old) === cur;
}

const ownUrl = (page: Page) => `${SITE}/${page.path}`.replace(/\/index\.html$/, "/");

function groupPath(t: Tok): string | undefined {
  return t.group?.startsWith(SITE) ? t.group.slice(SITE.length + 1) : undefined;
}

// --- Informe ----------------------------------------------------------------------

function show(t: Tok): string {
  const where = t.path.slice(-3).map((a) =>
    a.tag + (a.cls.length ? "." + a.cls.join(".") : "")
  ).join(" > ");
  const what = t.kind === "text"
    ? JSON.stringify(t.text.length > 140 ? t.text.slice(0, 140) + "…" : t.text)
    : t.key.length > 200
    ? t.key.slice(0, 200) + "…"
    : t.key;
  return `${what}   [${where}]`;
}

function showItem(it: Item): string {
  const mv = it.moved ? " (movido)" : "";
  if (it.op === "mod") return `  ~ ${show(it.old!)}\n    → ${show(it.tok)}`;
  return `  ${it.op === "add" ? "+" : "-"} ${show(it.tok)}${mv}`;
}

/** Separa el texto suelto antes del `<!DOCTYPE>` (diferencia 14) */
function stripBeforeDoctype(html: string): { html: string; stray: string } {
  const m = html.match(/^[^<]*?(?=<!DOCTYPE)/i);
  const stray = m?.[0].trim() ?? "";
  return { html: m ? html.slice(m[0].length) : html, stray };
}

async function listFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for await (const e of walk(dir, { includeDirs: false, skip: [/\/\.git\//] })) {
    files.push(relative(dir, e.path));
  }
  return files.sort();
}

async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

async function git(...args: string[]) {
  const { success, stderr } = await new Deno.Command("git", { args, stdout: "null" }).output();
  if (!success) throw new Error(`git ${args.join(" ")}: ${new TextDecoder().decode(stderr)}`);
}

async function compare(oldDir: string, newDir: string, opts: { page?: string; verbose: boolean }) {
  const counts = new Map<number, { items: number; pages: Set<string> }>();
  const count = (id: number, page: string, n = 1) => {
    const c = counts.get(id) ?? { items: 0, pages: new Set() };
    c.items += n;
    c.pages.add(page);
    counts.set(id, c);
  };
  let copyButtons = 0;
  let unexpected = 0;
  const missing: string[] = [];

  const files = (await listFiles(oldDir)).filter((f) => !NOT_SITE.some((re) => re.test(f)));

  for (const file of files) {
    if (await exists(join(newDir, file))) continue;
    if (REMOVED.includes(file)) count(6, file);
    else missing.push(file);
  }

  const pages = files.filter((f) => f.endsWith(".html") && (!opts.page || f === opts.page));
  for (const path of pages) {
    if (!await exists(join(newDir, path))) continue;
    const page: Page = {
      path,
      kind: CV.includes(path) ? "cv" : INDICES.includes(path) ? "index" : "post",
    };
    // Texto suelto antes del <!DOCTYPE>: se quita en ambos lados para que no
    // descoloque el parseo, y solo cuenta si estaba en uno de ellos
    const old = stripBeforeDoctype(await Deno.readTextFile(join(oldDir, path)));
    const cur = stripBeforeDoctype(await Deno.readTextFile(join(newDir, path)));
    const newToks = tokenize(cur.html, path);
    page.title = newToks.find((t) => t.kind === "text" && t.tag === "title")?.text;
    const items = diff(tokenize(old.html, path), newToks);

    const bad: Item[] = [];
    if (old.stray !== cur.stray) {
      if (cur.stray) {
        bad.push({ op: "add", tok: { kind: "text", tag: "", attrs: {}, text: cur.stray, path: [], key: "" } });
      } else {
        count(14, path);
      }
    }
    const expected = new Map<number, Item[]>();
    for (const it of items) {
      const cat = CATEGORIES.find((c) => c.test(it, page));
      if (!cat) {
        bad.push(it);
        continue;
      }
      count(cat.id, path);
      expected.set(cat.id, [...(expected.get(cat.id) ?? []), it]);
      if (cat.id === 1 && it.op === "add" && it.tok.kind === "open" && it.tok.tag === "button") {
        copyButtons++;
      }
    }

    if (bad.length || (opts.verbose && expected.size)) console.log(`\n## ${path}`);
    if (opts.verbose) {
      for (const [id, its] of [...expected].sort((a, b) => a[0] - b[0])) {
        console.log(` (${id}) ${CATEGORIES.find((c) => c.id === id)!.title}`);
        its.forEach((it) => console.log(showItem(it)));
      }
    }
    if (bad.length) {
      console.log(` ✗ ${bad.length} diferencias inesperadas`);
      bad.forEach((it) => console.log(showItem(it)));
      unexpected += bad.length;
    }
  }

  console.log("\n# Resumen");
  console.log(`Páginas comparadas: ${pages.length}`);
  for (const id of [...counts.keys()].sort((a, b) => a - b)) {
    const c = counts.get(id)!;
    const title = id === 6 ? "Ficheros que dejan de publicarse" : CATEGORIES.find((x) => x.id === id)!.title;
    const extra = id === 1 ? `, ${copyButtons} botones añadidos` : "";
    console.log(`  (${id}) ${title}: ${c.items} cambios en ${c.pages.size} ficheros${extra}`);
  }
  if (missing.length) {
    console.log(`✗ URLs ausentes (${missing.length}):`);
    missing.forEach((m) => console.log(`  - ${m}`));
  } else {
    console.log("URLs ausentes: 0");
  }
  console.log(unexpected ? `✗ Diferencias inesperadas: ${unexpected}` : "Diferencias inesperadas: 0");
  return missing.length === 0 && unexpected === 0;
}

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    string: ["old", "new", "page", "ref"],
    boolean: ["verbose"],
    default: { new: "_site", ref: "pre-lume" },
  });

  let oldDir = args.old;
  let worktree: string | undefined;
  if (!oldDir) {
    worktree = await Deno.makeTempDir({ prefix: "pre-lume-" });
    await git("worktree", "add", "--detach", worktree, args.ref);
    oldDir = worktree;
  }

  try {
    const ok = await compare(oldDir, args.new, { page: args.page, verbose: args.verbose });
    Deno.exitCode = ok ? 0 : 1;
  } finally {
    if (worktree) await git("worktree", "remove", "--force", worktree);
  }
}
