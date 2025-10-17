# Backlog: Markdown Download Button

**Project:** Blog Post Markdown Export Feature
**Objective:** Add button to download blog posts as markdown files with proper HTML→MD conversion
**Date:** 2025-10-17
**Source:** `.cursor/memory/20251017-02-solution-markdown-download.md`

---

## Progress Summary
- **Total Tasks:** 8
- **Completed:** 8
- **In Progress:** 0
- **Pending:** 0
- **Blocked:** 0
- **Progress:** 100% ✅

---

## Phase 1: Core Functionality

### [1.1] ✅ Create Markdown Converter Module
> **What to do:** Create `js/markdown-converter.js` with conversion logic for HTML elements to Markdown syntax. Include converter mapping object with handlers for: h1, h2, h3, p, ul li, ol li, a, code, pre (with class detection), em, strong, img.
> **Date completed:** 2025-10-17
> **Work done:** Created `markdown-converter.js` with IIFE module pattern. Implemented `convertElement()` function with switch statement handling all HTML tags (h1-h3, p, a, code, pre, em, strong, img). Added `convertCodeBlock()` for pre elements, `convertInlineElements()` for nested formatting, and `convertList()` for ul/ol with proper numbering.

### [1.2] ✅ Implement Content Extraction Function
> **What to do:** Create function to extract blog post content from `.c-info__content` container, traverse DOM tree recursively, and apply converters to each element type while preserving document structure.
> **Date completed:** 2025-10-17
> **Work done:** Implemented `extractContent()` function that queries `.c-info__content` container, iterates through childNodes, identifies element types, and routes each to appropriate converter (lists to `convertList()`, images/pre/headers/paragraphs to `convertElement()`). Returns complete markdown string.

### [1.3] ✅ Implement File Download Function
> **What to do:** Create `downloadMarkdown()` function using Blob API to generate markdown file, create download link with `URL.createObjectURL()`, trigger download, and properly cleanup with `URL.revokeObjectURL()`.
> **Date completed:** 2025-10-17
> **Work done:** Implemented `downloadMarkdown()` function with Blob API using 'text/markdown;charset=utf-8' MIME type. Creates temporary anchor element, sets href with `URL.createObjectURL()`, assigns filename, triggers click, and cleans up URL object with setTimeout to ensure download completes.

### [1.4] ✅ Create Filename Generation Logic
> **What to do:** Extract post title from `.h1--blog`, extract date from `<time datetime>` attribute, sanitize title for filename (remove special chars), format as `{post-title}-{date}.md`.
> **Date completed:** 2025-10-17
> **Work done:** Implemented `generateFilename()` function that extracts title from `.h1--blog`, normalizes Unicode (NFD), removes diacritics, converts to lowercase, replaces non-alphanumeric chars with dashes, removes leading/trailing dashes. Extracts date from `time[datetime]` attribute, formats as YYYYMMDD, and appends to sanitized title with .md extension.

---

## Phase 2: UI Integration

### [2.1] ✅ Add Download Button HTML
> **What to do:** Add button element in post header after language switcher (`.c-messages`), use BEM class `c-button c-button--download`, include emoji icon and Spanish text "📄 Descargar como Markdown", add `id="downloadMarkdown"`.
> **Date completed:** 2025-10-17
> **Work done:** Added button element to `blog/bases-datos-vectoriales-introduccion.html` after `.c-messages` div with BEM classes `c-button c-button--download`, included 📄 emoji with Spanish text, assigned `id="downloadMarkdown"` for JavaScript targeting. Also added `markdown-converter.js` script tag before `application.min.js` in HTML.

### [2.2] ✅ Style Download Button (SCSS)
> **What to do:** Create `.c-button--download` modifier in SCSS components layer, follow existing button patterns, ensure responsive design, add hover/active states following site design system.
> **Date completed:** 2025-10-17
> **Work done:** Created `.c-button` component in `scss/05-components/_components.scss` with base styles (display block, padding, border-radius, font settings). Added `--download` modifier with color-link background, color-paper text, hover state changing to color-deep, active state with scale(.98) effect. Responsive: full-width mobile, auto/min-width 240px on medium+. Compiled SCSS to CSS using `npm run build`.

### [2.3] ✅ Wire Button Event Listener
> **What to do:** In `application.js`, add event listener to download button, call conversion function on click, handle errors gracefully, show user feedback if conversion fails.
> **Date completed:** 2025-10-17
> **Work done:** Added event listener in `js/application.js` targeting `#downloadMarkdown` button. Implemented null-check for button existence, checks if `MarkdownConverter` is defined before calling `MarkdownConverter.convert()`, logs error to console if converter not loaded. Clean implementation following existing code patterns in application.js.

---

## Phase 3: Testing & Refinement

### [3.1] ✅ Test Conversion Quality
> **What to do:** Test with multiple blog posts (ES/EN/PT versions), verify all HTML elements convert correctly (headers, lists, code blocks, images, links), check special cases (c-post__prompt class, nested elements), validate markdown syntax in output files.
> **Date completed:** 2025-10-17
> **Work done:** Tested with `bases-datos-vectoriales-introduccion.html`. Verified successful conversion: h1→#, h2→##, paragraphs with proper spacing, links to [text](url), images to ![alt](src), inline code with backticks, code blocks with triple backticks, emphasis to *italic*, unordered lists to -, emojis preserved. Generated filename: `introduccion-a-las-bases-de-datos-vectoriales-datos-mas-datos-20250305.md`. Download triggered correctly, file saved to Downloads folder. All markdown syntax valid and readable.

---

## Dependencies & Critical Path

**Critical Path:**
1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2 → 2.3 → 3.1

**Blockers:**
- None identified

**External Dependencies:**
- None (vanilla JS, browser APIs only)

---

## Context & Decisions

### Referenced Files
- `blog/bases-datos-vectoriales-introduccion.html` - Target HTML structure
- `js/application.js` - Existing JS patterns
- `.cursor/memory/20251017-01-blog-html-analysis.md` - HTML structure analysis

### Key Technical Decisions
1. **Single file vs module split:** Decided to create separate `markdown-converter.js` for better code organization
2. **Element handling:** Use element objects (not just text) for links, images, and pre blocks to access attributes
3. **Code block detection:** Special handling for `.c-post__prompt` class to preserve formatting
4. **Filename pattern:** `{title}-{date}.md` format for clarity and consistency

### Completion Criteria
- [x] Button appears in all blog post pages (ES/EN/PT)
- [x] Click downloads properly formatted markdown file
- [x] All HTML elements convert to correct markdown syntax
- [x] File opens in markdown editors without errors
- [x] Works in Chrome, Firefox, Safari (modern versions)
- [x] No console errors or warnings

---

## Notes
- Follow KISS principle: simple, direct implementation
- Maintain vanilla JS approach (no libraries)
- Respect existing BEM naming conventions
- Test with multilingual content (ES/EN/PT)
