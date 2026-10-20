/**
 * Migra los posts HTML anteriores a `src/posts/<id>/<lang>.html` (tarea 4.2).
 *
 *   deno run --allow-read --allow-write scripts/migrate-posts.ts [<dir>]
 *
 * Lee los posts de `<dir>/blog`, `<dir>/en/blog` y `<dir>/pt/blogue` (por
 * defecto, la raíz del repo) y escribe el front matter (id, lang, url, title,
 * description, image, date) y el contenido de `div.c-info__content` tal cual.
 * La cabecera del post (título, fecha, avisos y enlace de descarga) no se
 * copia: la genera `post.vto`.
 */
import { DOMParser, type Element } from "lume/deps/dom.ts";
import { join } from "jsr:@std/path@1.0.6";
import { existsSync } from "jsr:@std/fs@1.0.4/exists";

const SITE = "https://xulioze.com";
const DIRS = { es: "blog", en: "en/blog", pt: "pt/blogue" } as const;
type Lang = keyof typeof DIRS;

/** D14: fecha correcta de los posts con fechas inconsistentes */
const DATE_FIXES: Record<string, string> = {
  "construir-pwa-con-chatgpt": "2023-04-14",
  "bases-datos-vectoriales-introduccion": "2025-03-05",
  "impresoras-3d-muerte-simetria": "2024-02-12",
};

interface Post {
  id: string;
  lang: Lang;
  url: string;
  title: string;
  description?: string;
  image?: string;
  date: string;
  body: string;
  file: string;
}

const root = Deno.args[0] ?? ".";
const text = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();
const fail = (file: string, msg: string): never => {
  throw new Error(`${file}: ${msg}`);
};

/** Contenido de `div.c-info__content` en bruto, sin reserializar */
function extractBody(html: string, file: string): string {
  const start = html.search(/<div class="c-info__content[^"]*">/);
  if (start < 0) fail(file, "no tiene div.c-info__content");
  const open = html.indexOf(">", start) + 1;
  const tags = /<(\/?)div\b[^>]*>/g;
  tags.lastIndex = open;
  let depth = 1;
  for (let m; (m = tags.exec(html));) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index).replace(/^\n+|\s+$/g, "") + "\n";
  }
  return fail(file, "div.c-info__content sin cerrar");
}

/** La cabecera solo tiene lo que regenera `post.vto` */
function checkHeader(header: Element, file: string) {
  const allowed = ["h1", "time", "div.c-info__time", "div.c-messages", "span.c-link"];
  for (const el of header.children) {
    const tag = el.tagName.toLowerCase();
    const name = tag === "h1" ? tag : tag + (el.className ? "." + el.className.split(" ")[0] : "");
    if (!allowed.includes(name)) fail(file, `elemento inesperado en la cabecera: ${name}`);
  }
  const loose = [...header.childNodes]
    .filter((n) => n.nodeType === 3 && text(n.textContent))
    .map((n) => text(n.textContent));
  for (const t of loose) {
    if (!/^(Publicado (el|o|em|a)|Published on|🤖 .*,|\.)$/.test(t)) {
      fail(file, `texto inesperado en la cabecera: "${t}"`);
    }
  }
}

function parse(file: string, lang: Lang, html: string): Omit<Post, "id"> & { esUrl?: string } {
  html = html.replace(/^[^<]*(?=<!DOCTYPE)/i, "");
  const doc = new DOMParser().parseFromString(html, "text/html")!;
  const header = doc.querySelector("header.c-info") ?? fail(file, "no tiene header.c-info");
  checkHeader(header, file);

  const url = "/" + file;
  const abs = (href: string) => new URL(href, SITE + url);
  const meta = (selector: string) => doc.querySelector(selector)?.getAttribute("content") ?? undefined;

  const title = text(header.querySelector("h1")?.textContent) || fail(file, "sin h1");
  const datetime = header.querySelector("time")?.getAttribute("datetime") ?? fail(file, "sin <time>");
  const date = datetime.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(file, `datetime inválido: ${datetime}`);

  // Sin la query `?crop=…` sobrante, que en algunos posts está rota (`.jpg=entropy…`).
  // Si `og:image` no apunta a un fichero existente, se usa `twitter:image`
  const image = ['meta[property="og:image"]', 'meta[name="twitter:image"]']
    .map((selector) => meta(selector))
    .filter((content): content is string => !!content)
    .map((content) => abs(content).pathname.replace(/(\.(png|jpe?g|gif|webp))[^/]*$/i, "$1"))
    .find((path) => existsSync(join(root, "src", decodeURIComponent(path))));

  // La versión en español, desde el selector de idioma o los avisos
  const esUrl = [...doc.querySelectorAll("header.c-header a, .c-message")]
    .map((a) => abs(a.getAttribute("href")!).pathname)
    .find((p) => /^\/blog\/[^/]+\.html$/.test(p));

  return {
    lang,
    url,
    title,
    description: meta('meta[name="description"]'),
    image,
    date,
    body: extractBody(html, file),
    file,
    esUrl,
  };
}

const posts: Post[] = [];
for (const [lang, dir] of Object.entries(DIRS) as [Lang, string][]) {
  for await (const entry of Deno.readDir(join(root, dir))) {
    if (!entry.isFile || !entry.name.endsWith(".html")) continue;
    const file = `${dir}/${entry.name}`;
    const { esUrl, ...post } = parse(file, lang, await Deno.readTextFile(join(root, file)));
    const esPath = lang === "es" ? post.url : esUrl ?? fail(file, "no enlaza a su versión en español");
    const id = esPath.match(/^\/blog\/(.+)\.html$/)![1];
    posts.push({ ...post, id, date: DATE_FIXES[id] ?? post.date });
  }
}

// Las traducciones de un post comparten fecha (D14)
const byId = Map.groupBy(posts, (p) => p.id);
for (const [id, group] of byId) {
  const dates = new Set(group.map((p) => p.date));
  if (dates.size > 1) {
    throw new Error(`${id}: las traducciones no comparten fecha: ${group.map((p) => `${p.lang}=${p.date}`).join(", ")}`);
  }
  const langs = group.map((p) => p.lang).sort().join();
  if (langs !== "en,es,pt") console.warn(`${id}: traducciones ${langs}`);
}

const yaml = (s: string) => JSON.stringify(s);
for (const p of posts) {
  const fm = [
    "---",
    `id: ${p.id}`,
    `lang: ${p.lang}`,
    `url: ${p.url}`,
    `title: ${yaml(p.title)}`,
    ...(p.description ? [`description: ${yaml(p.description)}`] : []),
    ...(p.image ? [`image: ${p.image}`] : []),
    `date: ${p.date}`,
    "---",
  ].join("\n");
  const out = join(root, "src/posts", p.id, `${p.lang}.html`);
  await Deno.mkdir(join(root, "src/posts", p.id), { recursive: true });
  await Deno.writeTextFile(out, `${fm}\n${p.body}`);
}

console.log(`${posts.length} posts en ${byId.size} carpetas`);
