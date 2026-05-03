# Data Reference

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `gemini_api_key` | string | Gemini API key |
| `gemini_model` | string | Selected model ID (e.g. `gemini-2.5-flash`) |
| `resume_tracker_v1` | JSON array | All tracker rows |
| `resume_leads_v1` | JSON array | All leads |

---

## Tracker Row Schema (`resume_tracker_v1`)

Each element is an object with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique row ID (generated) |
| `date` | string | Application date (ISO 8601, e.g. `2025-05-01`) |
| `company` | string | Company name |
| `role` | string | Role/position title |
| `source` | string | Where the listing was found (e.g. LinkedIn, HN, referral) |
| `status` | string | Current application status (see values below) |
| `followup` | string | Follow-up due date (ISO 8601) |
| `notes` | string | Free-text notes |
| `resumeTex` | string | Full LaTeX source of the resume submitted for this application |
| `selectedBlockIds` | array of strings | Block IDs active when this application was logged |
| `bulletsSnapshot` | object | Map of block ID → bullet array at time of logging |
| `jdSnapshot` | string | Full JD text pasted when this application was logged |

**Status values:** `applied` | `followup_sent` | `recruiter_screen` | `technical` | `onsite` | `offer` | `rejected` | `ghosted` | `withdrew`

---

## Lead Schema (`resume_leads_v1`)

Each element is an object with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique lead ID (generated) |
| `company` | string | Company name |
| `what_they_do` | string | One-sentence description extracted by AI |
| `signal_strength` | string | `strong` / `medium` / `weak` |
| `signal_reason` | string | Why this lead has that signal strength |
| `fit_for_swe_intern` | string | AI assessment of fit for SWE internship |
| `outreach_angle` | string | Suggested hook/angle for first contact |
| `verify_facts` | string | Claims that should be independently verified before outreach |
| `added` | string | Date added (ISO 8601) |
| `source` | string | Source description (e.g. "HN Who's Hiring May 2025") |
| `status` | string | Lead status (see values below) |

**Status values:** `new` | `approached` | `dropped`

---

## CSV Export / Import (Tracker)

**Export:** Tracker tab → Export CSV button. Downloads a `.csv` with one row per application. All fields except `resumeTex`, `bulletsSnapshot`, and `jdSnapshot` are included (those are too large for CSV).

**Import:** Tracker tab → Import CSV button. Expects the same column headers as the export. Imported rows are merged by `id` — existing rows with matching IDs are updated, new IDs are appended. Rows without an `id` column get a new ID assigned.

---

## What Happens If localStorage Is Cleared

All tracker rows, leads, block edits, and settings are permanently lost. The browser can clear localStorage on:
- "Clear browsing data" in browser settings
- Private/incognito mode (data gone when window closes)
- Some browsers clearing it after extended inactivity

**Mitigation:** Export tracker CSV every Sunday. Keep the CSV in a location outside the browser (e.g. a folder in this repo or cloud storage).

---

## Migrating Between Browsers

1. In your current browser: Tracker tab → Export CSV
2. Open `index.html` in the new browser
3. Re-enter your Gemini API key in Settings
4. Tracker tab → Import CSV with the exported file
5. Re-enter personal info in Settings (not included in CSV export)

Note: Resume block library edits are stored in localStorage but not exported via CSV. Copy block content manually if you need to migrate block edits.

---

## Storage Limits

Browsers enforce a ~5MB limit on localStorage per origin (i.e., per file path for local files). Each tracker row with a full LaTeX resume snapshot is roughly 5–10KB. Estimated capacity: **500–800 rows** before approaching the limit.

Symptoms when approaching the limit: saving a new tracker row silently fails, or the app throws a `QuotaExceededError` in the browser console.

**Workaround:** Export CSV, then delete old rows (rejected/ghosted applications older than 90 days) from the tracker to free space.
