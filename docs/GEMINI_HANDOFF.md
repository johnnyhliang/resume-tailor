# Gemini Handoff — resume-tailor

This document gives you full context to continue building features. Read it before touching any file.

---

## Current State

**App:** 11-tab single-page app, vanilla JS, no build step, works from `file://` or localhost.

**File layout:**
```
index.html          (427 lines) — all tab HTML, header with tab buttons
src/app.js          (1105 lines) — main logic: tab switching, all feature handlers, parseOutput, renderScorecard, renderTracker, renderLeads, renderLibrary
src/blocks.js       — BLOCKS object: BLOCKS.experience[], BLOCKS.projects[], BLOCKS.static[]
src/gemini-api.js   — callGemini(prompt) — single entry point for all Gemini calls
src/utils.js        — shared utilities: esc(), extractBulletText(), extractKeywords(), etc.
css/style.css       — all styles, CSS variables (see below)
scripts/aggregate_jobs.js — job aggregator: pulls from 4 GitHub repos → leads.json
leads.json          — generated artifact, user imports via "↑ import leads.json" button
```

**All tabs (in header order):** tailor, cover letter, dossier, outreach, ats check, tracker, interview prep, email parser, leads, block library, settings

**Tab IDs in DOM:** `page-tailor`, `page-coverletter`, `page-dossier`, `page-outreach`, `page-ats`, `page-tracker`, `page-prep`, `page-email`, `page-leads`, `page-library`, `page-settings`

---

## Architecture Rules — Do Not Violate

- **No build step, no TypeScript, no ES module imports.** All `<script>` tags in index.html load files directly. `file://` must work.
- **All functions are global scope.** No `export`/`import`. Functions defined in one `.js` file are callable from any other.
- **CSS variables:** `--bg`, `--surface`, `--surface2`, `--border`, `--border2`, `--text`, `--muted`, `--muted2`, `--accent`, `--accent-light`, `--accent-mid`, `--warn`, `--warn-light`, `--mono`, `--display`. Use these, never hardcoded colors.
- **All Gemini calls go through `callGemini(prompt)`** in `src/gemini-api.js`. Never call the Gemini API directly.
- **localStorage helpers** (defined in app.js): `loadTracker()` / `saveTracker(data)`, `loadLeads()` / `saveLeads(data)`. localStorage keys: `gemini_api_key`, `gemini_model`, `resume_tracker_v1`, `resume_leads_v1`.
- **XSS safety:** Any user or AI-generated content inserted via `innerHTML` must be wrapped with `esc()` from `src/utils.js`.
- **Adding a new tab requires:** (1) tab button in `<div class="tabs">` in index.html, (2) `<div class="page" id="page-{name}">` div in index.html, (3) entry in the `switchTab` map/switch in `app.js`.

---

## Known Bugs — Do Not Reintroduce

- `renderTracker()`, `renderLeads()`, `renderLibrary()` must **NOT** be called inside the `switchTab` forEach loop — call them after the loop exits.
- Leads `innerHTML` insertions must use `esc()` on all user/AI content before inserting.
- `createTrackerFromEmail()` must **NOT** pass JSON as an inline `onclick` string — use a data store pattern (store data in a JS object keyed by ID, reference the ID in onclick).
- The weekly digest modal must **NOT** store markdown in a `data-md` attribute — it truncates on long markdown. Pass via a JS variable instead.

---

## Working Features

### ATS Scorecard (app.js ~530–700)
Appears automatically after tailoring. Parsed from Gemini output in `parseOutput()`. Fields: `match_score` (0–100), `critical_gaps` (string[]), `smart_suggestions` (string[]). Rendered by `renderScorecard(data)` into `#scorecardBox`.

### Tracker (app.js)
Per-block and per-bullet response-rate stats. Resume snapshots stored per application. CSV export/import. Weekly digest modal. `renderTracker()` builds the full table UI.

### Leads Tab
Lead cards from `loadLeads()`. Statuses: `new`, `approached`, `dropped`. Import via "↑ import leads.json" button. `renderLeads()` builds the card UI.

### Job Aggregator (`scripts/aggregate_jobs.js`)
Pulls from 4 GitHub repos into `leads.json`. Current counts: SimplifyJobs-Internships: 976, SimplifyJobs-NewGrad: 306, Pitt-CSC: 1112, speedyapply: 0 (parser bug — fix pending). Run with `node scripts/aggregate_jobs.js`.

### URL Ingest (already built — do not rebuild)
"fetch from URL" field on tailor tab (`#jdUrl` input, `fetchJdFromUrl()` function). Fetches JD from a URL and pre-fills `#jdInput`. Only works on localhost (CORS). `package.json` has `"start": "npx serve . -p 3000"`.

---

## Next Features to Build

Pick **one feature per session**. These are parallelizable — do not depend on each other.

---

### Feature B: PWA Manifest + Share Target

**Goal:** User installs app as PWA on phone. Any job link shared from phone routes directly to the app.

**Steps:**
1. Create `manifest.json` at root:
   - `name`: "Resume Tailor", `short_name`: "resume.tailor"
   - `icons`: reference `extension/icons/icon.svg`
   - `start_url`: `/`, `display`: `standalone`
   - `share_target`: `{ "action": "/", "method": "GET", "params": { "text": "text", "url": "url" } }` with enctype `application/x-www-form-urlencoded` and query param `share-target` flag
2. Create `sw.js` at root: minimal service worker that caches app shell on install (`index.html`, `src/app.js`, `src/blocks.js`, `src/gemini-api.js`, `src/utils.js`, `css/style.css`) and serves from cache on fetch.
3. Add to `index.html` `<head>`: `<link rel="manifest" href="/manifest.json">` and service worker registration script.
4. In `app.js` on startup: check `new URLSearchParams(location.search).get('share-target')` — if truthy, extract `text` and `url` params, pre-fill `#jdInput` with them, switch to tailor tab.
5. Add a note to README: "Install via browser → share any job link → opens in app."

---

### Feature C: Leads Tab — Fit Scoring Against Resume

**Goal:** Surface the 50 leads most aligned with user's actual resume experience.

**Steps:**
1. Add a "score against my resume" button to the leads tab filter bar (near the existing filter buttons).
2. On click:
   a. Extract bullet text from `BLOCKS.experience` and `BLOCKS.projects` using `extractBulletText()` (defined in `src/utils.js`).
   b. Extract keywords from that text using `extractKeywords()` (defined in `src/utils.js`).
   c. For each lead, score keyword overlap between the lead's `role`, `company`, and `what_they_do` fields against the resume keyword set. Count matching keywords, normalize to 0–100.
   d. Sort leads by fit score descending.
   e. Show a fit score badge on each card (e.g. `<span class="chip">92% fit</span>`).
3. A second click or changing any filter should reset to default sort order.
4. Do not persist fit scores to localStorage — recompute on each click.

---

### Feature D: Weekly Digest Auto-Email Draft

**Goal:** After generating the weekly digest, let user get a ready-to-send email draft.

**Steps:**
1. Add a "draft email" button inside the weekly digest modal (after the markdown digest is rendered).
2. On click: make a second `callGemini(prompt)` call with the digest markdown as context. Prompt Gemini to write: subject line, 5-bullet summary of the week, 3 asks (feedback on resume version X, intro to company Y, accountability check-in). Format as a plain email draft.
3. Display the email draft in the modal below the digest (or in a second pane).
4. Add a copy-to-clipboard button for the email draft.
5. **Important:** pass the digest markdown via a JS variable, not via a DOM attribute (`data-md` truncates — see Known Bugs above).
6. No SMTP integration — output is clipboard only.

---

## Files You Must Not Touch

- `docs/` — maintained separately, do not edit
- `JOB_HUNT_PLAYBOOK.md` — strategy doc, not code
- `leads.json` — generated artifact, never hand-edit
- `extension/` — separate browser extension codebase; changes here can break it independently of the main app

---

## Verification Checklist (run after any change)

- Open `index.html` directly via `file://` — all tabs must render, no console errors
- Open via `npx serve . -p 3000` — URL fetch on tailor tab must work
- Tailor a resume end-to-end: JD → blocks selected → tailor → scorecard appears → log to tracker
- Tracker table renders, CSV export produces valid CSV
- Leads import from `leads.json` works, cards render without XSS
- No global function names collide with browser built-ins
