import lume from "lume/mod.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import sass from "lume/plugins/sass.ts";
import esbuild from "lume/plugins/esbuild.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import { extract, test } from "lume/deps/front_matter.ts";

const LANGUAGES = ["es", "en", "pt"];

// Versión del web component atproto-comments (D16). El import de
// src/vendor/atproto-comments.ts debe usar la misma; el build lo comprueba
const ATPROTO_COMMENTS_VERSION = "1.1.1";

const site = lume({
  src: "./src",
  location: new URL("https://xulioze.com"),
  prettyUrls: false,
});

// Páginas .html con front matter: el cuerpo se publica tal cual, sin motor de
// plantillas, para que los `{{ }}` del contenido no se interpreten (D3)
site.loadPages([".html"]);

// Validación del front matter (D15). Se registra antes de `multilanguage`, que
// rellena `lang` con el idioma por defecto. `url` y `date` se leen del propio
// fichero porque Lume los rellena si faltan; `id` puede venir de un `_data.yml`
site.preprocess([".html"], (pages) => {
  const errors: string[] = [];
  for (const page of pages) {
    const isPost = page.data.type === "post";
    if (!isPost && !/^\/(cv|blog-index)\//.test(page.src.path)) continue;

    const source = Deno.readTextFileSync(site.src(page.sourcePath));
    const attrs = test(source) ? extract<Record<string, unknown>>(source).attrs ?? {} : {};
    const required = isPost ? ["lang", "url", "title", "date"] : ["lang", "url"];
    const missing = required.filter((key) => attrs[key] === undefined || attrs[key] === "");
    if (page.data.id === undefined) missing.unshift("id");

    if (missing.length) errors.push(`${page.sourcePath}: falta ${missing.join(", ")}`);
    if (attrs.lang !== undefined && !LANGUAGES.includes(attrs.lang as string)) {
      errors.push(`${page.sourcePath}: lang "${attrs.lang}" no es ${LANGUAGES.join(", ")}`);
    }
  }
  if (errors.length) throw new Error(`Front matter inválido:\n  ${errors.join("\n  ")}`);
});

site.use(multilanguage({
  languages: LANGUAGES,
  defaultLanguage: "es",
}));

// sitemap.xml con todas las páginas, en los tres idiomas (D10)
site.use(sitemap());

// Un feed RSS por idioma, enlazado desde el índice del blog de ese idioma (D10)
const feeds = [
  { lang: "es", output: "/blog/feed.xml", title: "Blog - Xúlio Zé", description: "Un cuaderno donde hablo de mis proyectos y lo que aprendo." },
  { lang: "en", output: "/en/blog/feed.xml", title: "Blog - Xúlio Zé", description: "A notebook where I talk about my projects and what I learn." },
  { lang: "pt", output: "/pt/blogue/feed.xml", title: "Blogue - Xúlio Zé", description: "Um caderno onde falo dos meus projetos e o que com eles aprendo." },
];
for (const { lang, output, title, description } of feeds) {
  site.use(feed({
    output,
    query: `type=post lang=${lang}`,
    sort: "date=desc",
    limit: 1000,
    info: { title, description, lang, authorName: "Xúlio Zé", authorUrl: "https://xulioze.com/" },
  }));
}

site.data("year", new Date().getFullYear());

// Fechas de los posts (D9). YAML convierte `2025-10-13` en medianoche UTC, así
// que se formatean en UTC para no mostrar el día anterior
site.filter("isoDate", (date: Date) => date.toISOString().slice(0, 10));
site.filter("longDate", (date: Date, lang: string) =>
  new Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" }).format(date));

// Dimensiones reales de una imagen de `src/` para og:image:width/height (D6)
site.helper("imageSize", (path: string) => readImageSize(site.src(path)), {
  type: "filter",
});

// Estilos: `src/scss/` solo tiene parciales; se publica `/css/styles.css` con
// su mapa de fuentes, como antes (D11)
// El SCSS no se toca en este cambio: se silencian sus avisos de obsolescencia
site.use(sass({
  options: { silenceDeprecations: ["import", "global-builtin", "slash-div", "color-functions"] },
}));
site.use(sourceMaps());
site.add("css/styles.scss");

// Web component atproto-comments, servido desde el propio sitio (D16). Solo
// `.ts`: `src/js/` se copia tal cual
const atprotoEntry = Deno.readTextFileSync(site.src("vendor/atproto-comments.ts"));
if (!atprotoEntry.includes(`/@arinspunk/atproto-comments/${ATPROTO_COMMENTS_VERSION}/`)) {
  throw new Error(`src/vendor/atproto-comments.ts no importa la versión ${ATPROTO_COMMENTS_VERSION}`);
}
site.use(esbuild({ extensions: [".ts"] }));
site.add("vendor/atproto-comments.ts");
site.remoteFile(
  "vendor/atproto-comments.css",
  `https://jsr.io/@arinspunk/atproto-comments/${ATPROTO_COMMENTS_VERSION}/src/atproto-comments.css`,
);
site.copy("vendor/atproto-comments.css");

// Recursos estáticos, publicados tal cual en sus rutas actuales
site.copy("img");
site.copy("fonts");
site.copy("js");
site.copy("favicon.ico");
site.copy("humans.txt");
site.copy("robots.txt");

// Componentes del cuerpo de los posts (D8). Todas las transformaciones son
// idempotentes ("añade si falta"), así que valen igual para los posts nuevos en
// Markdown que para los antiguos en HTML
const copyButtonSvg = Deno.readTextFileSync(site.src("_includes/partials/copy-button.svg")).trim();

site.process([".html"], (pages) => {
  for (const page of pages) {
    if (page.data.type !== "post") continue;
    const document = page.document;
    const body = document.querySelector(".c-post__body");
    if (!body) continue;

    // Bloques de código: desplazables y con botón de copiar
    for (const pre of body.querySelectorAll("pre")) {
      pre.classList.add("c-post__prompt", "c-post__prompt--scroll");
      let code = pre.querySelector(":scope > code");
      if (!code) {
        code = document.createElement("code");
        code.append(...pre.childNodes);
        pre.append(code);
      }
      code.classList.add("c-post__prompt-code");
      if (!pre.querySelector(":scope > button.c-post__copy-btn")) {
        const button = document.createElement("button");
        button.className = "c-post__copy-btn";
        button.setAttribute("aria-label", page.data.i18n[page.data.lang!].copyLabel);
        button.innerHTML = copyButtonSvg;
        pre.prepend(button);
      }
    }

    // Imágenes, salvo las que están en una figura que ya lleva la clase
    for (const img of body.querySelectorAll("img")) {
      if (img.closest("figure.c-post__body-img")) continue;
      img.classList.add("c-post__body-img");
      if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    }

    // Enlaces externos en una pestaña nueva
    for (const a of body.querySelectorAll("a[href]")) {
      let url: URL;
      try {
        url = new URL(a.getAttribute("href")!);
      } catch {
        continue; // ruta relativa
      }
      if (!["http:", "https:"].includes(url.protocol) || url.hostname === "xulioze.com") continue;
      if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
      const rel = (a.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean);
      if (!rel.includes("noopener")) a.setAttribute("rel", [...rel, "noopener"].join(" "));
    }

    for (const table of body.querySelectorAll("table")) {
      table.classList.add("c-post__table");
    }

    // Comentarios del AT Protocol: CSS y JS del componente, una sola vez
    if (body.querySelector("atproto-comments")) {
      if (!document.querySelector('link[href="/vendor/atproto-comments.css"]')) {
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "/vendor/atproto-comments.css");
        document.head.append(link);
      }
      if (!document.querySelector('script[src="/vendor/atproto-comments.js"]')) {
        const script = document.createElement("script");
        script.setAttribute("type", "module");
        script.setAttribute("src", "/vendor/atproto-comments.js");
        document.body.append(script);
      }
    }

    // Encabezados enlazables
    const ids = new Set([...document.querySelectorAll("[id]")].map((el) => el.id));
    for (const heading of body.querySelectorAll("h2:not([id]), h3:not([id]), h4:not([id])")) {
      const slug = slugify(heading.textContent ?? "");
      let id = slug;
      for (let n = 2; ids.has(id); n++) id = `${slug}-${n}`;
      ids.add(id);
      heading.id = id;
    }
  }
});

export default site;

/** "¿Y si el valor está en la iteración?" → "y-si-el-valor-esta-en-la-iteracion" */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lee ancho y alto de la cabecera de un PNG o un JPEG */
function readImageSize(file: string): { width: number; height: number } {
  const bytes = Deno.readFileSync(file);
  const view = new DataView(bytes.buffer);

  // PNG: chunk IHDR
  if (view.getUint32(0) === 0x89504e47) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  // JPEG: primer marcador SOF
  if (view.getUint16(0) === 0xffd8) {
    let offset = 2;
    while (offset < bytes.length) {
      const marker = view.getUint16(offset);
      const length = view.getUint16(offset + 2);
      if (marker >= 0xffc0 && marker <= 0xffcf && ![0xffc4, 0xffc8, 0xffcc].includes(marker)) {
        return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  throw new Error(`No se pueden leer las dimensiones de ${file}`);
}
