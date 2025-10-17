# Solution: Markdown Download Button

**Problem:** Add download button to convert blog post HTML to Markdown format
**Date:** 2025-10-17
**Type:** Feature implementation

## Problem Summary

User wants to add a "download as markdown" button that:
- Extracts HTML content from blog post
- Converts HTML tags to Markdown equivalents (h1→#, h2→##, ul→-, etc.)
- Generates downloadable file
- Opens system save dialog
- Works in all blog posts across three languages (ES/EN/PT)

### Multi-language Requirements
- **Spanish (ES):** `/blog/*.html` → Button text: "📄 Descargar como Markdown"
- **English (EN):** `/en/blog/*.html` → Button text: "📄 Download as Markdown"
- **Portuguese (PT):** `/pt/blogue/*.html` → Button text: "📄 Descarregar como Markdown"

### Script Paths by Language
- **ES:** `/blog/` → `../js/markdown-converter.js`
- **EN:** `/en/blog/` → `../../js/markdown-converter.js`
- **PT:** `/pt/blogue/` → `../../js/markdown-converter.js`

## Proposed Solution (KISS Approach)

### Core Strategy
1. **JavaScript vanilla function** to extract and convert HTML
2. **Browser Blob API** for file generation
3. **URL.createObjectURL()** for download trigger
4. **Simple mapping object** for HTML→Markdown conversion

### Implementation Steps

#### 1. HTML Button Addition
```html
<!-- Spanish -->
<button class="c-button c-button--download" id="downloadMarkdown">
  📄 Descargar como Markdown
</button>

<!-- English -->
<button class="c-button c-button--download" id="downloadMarkdown">
  📄 Download as Markdown
</button>

<!-- Portuguese -->
<button class="c-button c-button--download" id="downloadMarkdown">
  📄 Descarregar como Markdown
</button>
```

#### 2. JavaScript Conversion Function
```javascript
const convertToMarkdown = (htmlContent) => {
  const converter = {
    'h1': (text) => `# ${text}\n\n`,
    'h2': (text) => `## ${text}\n\n`,
    'h3': (text) => `### ${text}\n\n`,
    'p': (text) => `${text}\n\n`,
    'ul li': (text) => `- ${text}\n`,
    'ol li': (text, index) => `${index + 1}. ${text}\n`,
    'a': (element) => `[${element.textContent}](${element.href})`,
    'code': (text) => `\`${text}\``,
    'pre': (element) => {
      // Handle specific classes for code blocks
      if (element.classList.contains('c-post__prompt')) {
        const code = element.querySelector('code');
        return `\`\`\`\n${code ? code.textContent : element.textContent}\n\`\`\`\n\n`;
      }
      return `\`\`\`\n${element.textContent}\n\`\`\`\n\n`;
    },
    'em': (text) => `*${text}*`,
    'strong': (text) => `**${text}**`,
    'img': (element) => `![${element.alt}](${element.src})\n\n`
  };
  
  // Simple DOM parsing and conversion
  // Extract title, content, and convert recursively
};
```

#### 3. File Download Function
```javascript
const downloadMarkdown = (content, filename) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Target HTML Structure
Based on analysis, key elements to convert:
- `.h1--blog` → `# Title`
- `h2` → `## Section`
- `p` → Paragraph + double newline
- `a` → `[text](url)`
- `img.c-post__body-img` → `![alt](src)`
- `pre code` → Code blocks
- `ul li` → `- Bullet lists`
- `ol li` → `1. Numbered lists`

### Integration Approach

1. **Add button to post header** (after language switcher)
2. **Extend existing `application.js`** with new functionality
3. **Target `.c-info__content`** container for content extraction
4. **Extract title from `.h1--blog`** for filename
5. **Apply to all posts** in three languages with correct script paths

### File Structure
```
js/
├── application.js (existing scroll effects + download handler)
├── markdown-converter.js (new conversion logic)

blog/
├── *.html (ES posts - scripts: ../js/)

en/blog/
├── *.html (EN posts - scripts: ../../js/)

pt/blogue/
├── *.html (PT posts - scripts: ../../js/)
```

### Posts to Update
- **Spanish:** 14 posts in `/blog/`
- **English:** 14 posts in `/en/blog/`
- **Portuguese:** 14 posts in `/pt/blogue/`
- **Total:** 42 HTML files

## Trade-offs & Considerations

### Pros ✅
- **Simple implementation** using browser APIs
- **No external dependencies** (keeping with vanilla JS approach)
- **Lightweight solution** (~50 lines of code)
- **Works offline** (client-side only)

### Cons ⚠️
- **Limited HTML coverage** (only handles blog post elements)
- **Basic markdown formatting** (no advanced features)
- **Browser compatibility** (modern browsers only)

### Alternative Approaches (More Complex)
1. **Library-based:** Use Turndown.js (adds dependency)
2. **Server-side:** Generate markdown on backend (requires API)
3. **Web Workers:** For large content processing (overkill)

## Implementation Priority

**Phase 1:** Core functionality (✅ Completed)
- Headers, paragraphs, links, images
- Lists (ordered and unordered)
- Simple download functionality
- Emphasis, code blocks

**Phase 2:** UI Integration (✅ Completed)
- Button with styles
- Event listeners
- Single post implementation (ES)

**Phase 3:** Multi-language Rollout (Pending)
- Apply to all Spanish posts (14 files)
- Apply to all English posts (14 files)
- Apply to all Portuguese posts (14 files)
- Verify correct script paths per language

## Browser Compatibility
- **Modern browsers:** Full support (Chrome 52+, Firefox 55+, Safari 10.1+)
- **Fallback:** Show unsupported message for older browsers

## Integration with Existing Codebase

### CSS Classes (BEM)
```scss
.c-button {
  &--download {
    // Download button specific styles
  }
}
```

### JavaScript Pattern
Follow existing vanilla JS approach:
- Simple functions
- Direct DOM manipulation
- Event listeners
- No jQuery or frameworks

## Filename Generation
Pattern: `{post-title}-{date}.md`
Example: `bases-datos-vectoriales-introduccion-20250305.md`

This solution prioritizes simplicity and maintainability over feature completeness, aligning with KISS principles and existing codebase patterns.
