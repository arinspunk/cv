# Solution: Filename from URL Path

**Problem:** Markdown download feature generates filename from post title + date, but user wants filename to match the HTML file from the URL path.

**Example:**
- Current URL: `https://xulioze.com/blog/claude-talk-to-figma-mcp.html`
- Desired filename: `claude-talk-to-figma-mcp.html.md`

---

## Proposed Solution (KISS)

Replace `generateFilename()` function to extract filename from `window.location.pathname` instead of parsing title/date.

**Implementation:**
1. Extract pathname from current URL
2. Get last segment (the HTML filename)
3. Append `.md` extension

**Code:**
```javascript
const generateFilename = () => {
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop(); // Gets "claude-talk-to-figma-mcp.html"
    return filename ? `${filename}.md` : 'post.html.md';
};
```

---

## Trade-offs

**Pros:**
- Much simpler than current implementation (3 lines vs ~25 lines)
- No string sanitization needed
- No DOM queries for title/date
- Filename always matches URL structure
- Works consistently across all languages

**Cons:**
- Filename includes `.html.md` extension (might look unusual)
- Relies on URL structure (but it's stable for this site)

---

## Implementation Steps

1. Replace `generateFilename()` function in `js/markdown-converter.js` (lines 151-176)
2. Test on multiple posts (ES/EN/PT)
3. Verify download works correctly
4. Update backlog documentation

**Estimated effort:** 5 minutes

