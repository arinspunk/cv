# Backlog: Markdown Download - Multi-language Rollout

**Project:** Apply markdown download button to all blog posts (ES/EN/PT)
**Objective:** Add download button with correct translations and script paths across 42 blog posts
**Date:** 2025-10-17
**Source:** `.cursor/memory/20251017-02-solution-markdown-download.md` (Phase 3)

---

## Progress Summary
- **Total Tasks:** 3
- **Completed:** 0
- **In Progress:** 0
- **Pending:** 3
- **Blocked:** 0
- **Progress:** 0%

---

## Phase 3: Multi-language Rollout

### [3.1] ⏳ Apply to Spanish Posts
> **What to do:** Add download button to 13 remaining Spanish posts in `/blog/` (excluding `bases-datos-vectoriales-introduccion.html` already done). Button text: "📄 Descargar como Markdown". Script paths: `../js/markdown-converter.js` and `../js/application.min.js`. Insert button after `.c-messages` div, before closing `</header>`.
> **Date completed:** -
> **Work done:** -
> **Files (13):**
> - blog/oneshot-vs-dialogo.html
> - blog/claude-talk-to-figma-mcp.html
> - blog/guia-integrar-figma-con-ia.html
> - blog/usa-herramientas-formas-inesperadas-ia.html
> - blog/guia-desarrollar-software-agentes.html
> - blog/prompt-contexto-memoria.html
> - blog/contexto-extendido.html
> - blog/desarrollo-con-ia.html
> - blog/construir-pwa-con-chatgpt.html
> - blog/resarcimiento.html
> - blog/impresoras-3d-muerte-simetria.html
> - blog/como-hablar-con-chatgpt.html
> - blog/frontity-custom-page-templates.html

### [3.2] ⏳ Apply to English Posts
> **What to do:** Add download button to 14 English posts in `/en/blog/`. Button text: "📄 Download as Markdown". Script paths: `../../js/markdown-converter.js` and `../../js/application.min.js`. Insert button after `.c-messages` div, before closing `</header>`.
> **Date completed:** -
> **Work done:** -
> **Files (14):**
> - en/blog/oneshot-vs-dialogue.html
> - en/blog/use-tools-unexpected-ways-ai.html
> - en/blog/claude-talk-to-figma-mcp.html
> - en/blog/guide-integrate-figma-with-ai.html
> - en/blog/guide-develop-software-agents.html
> - en/blog/prompt-context-memory.html
> - en/blog/extended-context.html
> - en/blog/ai-for-developers.html
> - en/blog/vector-stores-introduction.html
> - en/blog/reimbursement.html
> - en/blog/how-talk-with-chatgpt.html
> - en/blog/build-pwa-with-chatgpt.html
> - en/blog/3d-printers-death-symmetry.html
> - en/blog/frontity-custom-page-templates.html

### [3.3] ⏳ Apply to Portuguese Posts
> **What to do:** Add download button to 14 Portuguese posts in `/pt/blogue/`. Button text: "📄 Descarregar como Markdown". Script paths: `../../js/markdown-converter.js` and `../../js/application.min.js`. Insert button after `.c-messages` div, before closing `</header>`.
> **Date completed:** -
> **Work done:** -
> **Files (14):**
> - pt/blogue/oneshot-vs-dialogo.html
> - pt/blogue/claude-talk-to-figma-mcp.html
> - pt/blogue/guia-integrar-figma-com-ia.html
> - pt/blogue/use-ferramentas-formas-inesperadas-ia.html
> - pt/blogue/guia-desenvolver-software-agentes.html
> - pt/blogue/prompt-contexto-memoria.html
> - pt/blogue/contexto-estendido.html
> - pt/blogue/bases-dados-vectoriais-introducao.html
> - pt/blogue/desenvolvimento-com-ia.html
> - pt/blogue/ressarcimento.html
> - pt/blogue/impressoras-3d-morte-simetria.html
> - pt/blogue/construir-pwa-com-chatgpt.html
> - pt/blogue/como-falar-com-chatgpt.html
> - pt/blogue/frontity-custom-page-templates.html

---

## Dependencies & Critical Path

**Critical Path:**
3.1 → 3.2 → 3.3 (can be done in parallel but sequential for tracking)

**Blockers:**
- None identified

**External Dependencies:**
- markdown-converter.js (already created ✅)
- Button styles in CSS (already compiled ✅)
- Event listener in application.js (already added ✅)

---

## Context & Decisions

### HTML Pattern (Spanish)
```html
<button class="c-button c-button--download" id="downloadMarkdown">
    📄 Descargar como Markdown
</button>
```

### HTML Pattern (English)
```html
<button class="c-button c-button--download" id="downloadMarkdown">
    📄 Download as Markdown
</button>
```

### HTML Pattern (Portuguese)
```html
<button class="c-button c-button--download" id="downloadMarkdown">
    📄 Descarregar como Markdown
</button>
```

### Script Tags Pattern (ES - /blog/)
```html
<script src="../js/markdown-converter.js"></script>
<script src="../js/application.min.js" defer></script>
```

### Script Tags Pattern (EN/PT - /en/blog/ & /pt/blogue/)
```html
<script src="../../js/markdown-converter.js"></script>
<script src="../../js/application.min.js" defer></script>
```

### Insertion Point
Find: `</div>` after `.c-messages`
Insert: Button HTML
Before: `</header>`

### Completion Criteria
- [ ] All 42 posts have download button
- [ ] Button text correctly translated per language
- [ ] Script paths correct per directory structure
- [ ] No console errors on any post
- [ ] Download works on sample posts from each language

---

## Notes
- Apply systematically: Spanish → English → Portuguese
- Test one file per language after batch update
- Button should appear consistently positioned across all posts
- Verify script loading on browser devtools for each language
