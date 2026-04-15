# Resume Tailor — Token Efficiency & PDF Preview Design

**Date:** 2026-04-15  
**Scope:** `index.html` only (standalone web app, not the extension)

---

## Goals

1. Reduce Gemini token usage ~60–70% to stretch free-tier quota
2. Make tailoring faster (smaller payloads, less to generate)
3. Add live HTML resume preview in a split pane (view only, not exported)
4. Add one-click PDF download via LaTeX compile API

---

## Architecture Overview

Two independent features added to the existing single-file app:

```
JD paste → [client-side keyword extraction] → scored block toggles
         → [user selects blocks] → [strip LaTeX boilerplate] → Gemini (targeted prompt)
         → [reconstruct LaTeX] → [update HTML preview] → download PDF via API
```

---

## Feature 1: Client-side Keyword Extraction & Block Scoring

### How it works

On every JD input event (debounced 300ms), run a JS keyword extractor:

1. **Tokenize** the JD: lowercase, strip punctuation, split on whitespace
2. **Filter stop words**: a hardcoded set (~150 common English words)
3. **Extract tech terms**: single words AND bigrams (e.g., "machine learning", "type safety")
4. **Score each block**: count how many extracted keywords appear in the block's `.tex` text (case-insensitive)
5. **Display scores** on the block toggle chips as a small badge (e.g., `8 matches`)

No API call. Runs in <5ms.

### What changes in the UI

- Block toggles gain a small keyword-match badge
- Blocks with 0 matches get a subtle muted style (not hidden — user can still select them)
- Keywords panel (currently shown after tailoring) moves to appear immediately after JD is pasted, showing top 15 extracted terms

### Effect on LLM prompt

Before sending to Gemini:
- **Strip LaTeX boilerplate** from each block: extract only the `\resumeItem{...}` text contents using regex, send as plain bullet lists
- **Reconstruct** the full LaTeX client-side after Gemini returns rewrites
- **Only send selected blocks** (already true, but now the selection is informed by scores)

Prompt changes:
- Remove the "keep LaTeX structure exactly" instruction — Gemini no longer sees LaTeX
- Ask Gemini to return rewritten bullets as a simple numbered list per block
- Client-side reconstruction wraps them back into `\resumeItem{...}` calls

**Estimated token reduction:** ~65% on input (no LaTeX boilerplate), ~60% on output (plain text not LaTeX).

---

## Feature 2: Split Pane Layout with Live HTML Preview

### Layout

The tailor tab becomes a two-column layout:

```
┌─────────────────────────┬──────────────────────────────┐
│  Left (inputs)          │  Right (preview)             │
│                         │                              │
│  [JD textarea]          │  [HTML resume preview]       │
│  [keyword chips]        │                              │
│  [block toggles]        │                              │
│  [tailor resume →]      │  [↓ download PDF] [copy .tex]│
└─────────────────────────┴──────────────────────────────┘
```

Left column: ~45% width  
Right column: ~55% width, scrollable, `overflow-y: auto`

### HTML Resume Renderer

A `renderResumeHTML(blocks, tailoredMap)` function converts the current block state to styled HTML:

- **Heading/contact**: rendered from `BLOCKS.static` static_heading (parse name, email, links from LaTeX)
- **Education**: rendered from static_education block
- **Experience/Projects**: rendered from selected blocks, using tailored content if available, raw content otherwise
- **Skills**: rendered from static_skills

LaTeX → HTML conversion is regex-based (no full LaTeX parser):
- `\resumeSubheading{Title}{Date}{Subtitle}{Location}` → styled `<div>` with flex row
- `\resumeItem{text}` → `<li>text</li>`
- `\textbf{x}` → `<strong>x</strong>`
- `\href{url}{text}` → `<a href>text</a>`
- Ignore unknown commands, pass through text content

The HTML preview uses inline styles matching the app's existing CSS variables (`--text`, `--surface`, etc.) so it looks consistent. It intentionally does not try to pixel-match the PDF — it's a content preview, not a print preview.

Preview re-renders:
- When blocks are toggled (shows untailored content)
- After tailoring completes (shows AI-rewritten content)

### PDF Download

Button: `↓ download PDF`

Flow:
1. Assemble the full `.tex` string (existing `parseOutput` logic)
2. POST to `https://latexonline.cc/compile` with the `.tex` as the request body
3. Receive PDF blob, trigger `<a download>` with a filename like `jonathan_liang_resume.pdf`
4. Show spinner on button during compile (~5–15s)
5. On error: show inline error message, keep "copy .tex" available as fallback

No API key needed for latexonline.cc. File size limit is well within resume range.

---

## What Doesn't Change

- The `callGemini()` function itself is unchanged
- Cover letter tab is unchanged
- Block library tab is unchanged
- Settings tab is unchanged
- LaTeX block data structure is unchanged
- The `.tex` copy button stays alongside the download button

---

## Files Changed

Only `index.html` — all JS and CSS lives inline in the single file.

Additions:
- `extractKeywords(jdText)` — returns `Set<string>` of keywords
- `scoreBlock(block, keywords)` — returns integer match count
- `renderResumeHTML(selectedIds, tailoredMap)` — returns HTML string
- `downloadPDF()` — async, calls latexonline.cc
- Split pane CSS for the tailor tab
- Updated `renderBlockSelectors()` to show match badges
- Updated `tailorResume()` to strip LaTeX before sending and reconstruct after

Prompt change: replace full LaTeX block content with plain bullet text, update output format instructions.
