# Resume Tailor

A local, privacy-first job application system for the full hiring pipeline — resume tailoring, cover letters, company research, outreach drafting, ATS checking, application tracking, interview prep, and lead ingestion. No backend, no auth, no server — everything runs in your browser with data in localStorage.

## Quick Start

1. Get a free Gemini API key at https://ai.google.dev (1,500 req/day free tier)
2. Open `index.html` directly in your browser (double-click, no server needed)
3. Go to **Settings** tab → paste your API key → Save

## Model Note

Use `gemini-2.5-flash` (default). The Pro models hit 429 rate-limit errors on free tier during normal use.

## Tabs

| Tab | Purpose | When to use |
|-----|---------|-------------|
| **tailor** | Paste JD → AI-tailored LaTeX resume; flags unsubstantiated claims; keyword gap vis; ATS check on download | Every application |
| **cover letter** | JD + role + tone → cover letter draft | When explicitly required |
| **dossier** | Company name → research pack (what they do, momentum, tech stack, hiring managers, smart questions, risks) | Before applying or interviewing |
| **outreach** | 6 message types → draft under 150 words with forced hook field | Cold/warm email, follow-ups, thank-yous, teardowns |
| **ats check** | Upload PDF → text extraction, section detection, contact recovery, garble detection, keyword coverage vs JD | Verifying a compiled resume PDF |
| **tracker** | Inline-editable application table; stores resume snapshot per row; follow-up overdue banners; response-rate stats; CSV export/import; weekly digest | Managing every open application |
| **interview prep** | Company + JD + round → STAR scaffolds from real resume bullets, likely technical Qs, smart questions, 24h cram list | Night before every interview |
| **email parser** | Paste recruiter email → structured parse + one-click tracker status update | Processing inbound recruiter messages |
| **leads** | Ingest unstructured sources (funding news, HN, Twitter, Discord, newsletters) → AI-extracted leads with signal strength and outreach angle | Weekly lead sourcing |
| **block library** | Edit LaTeX resume blocks and bullets; per-block and per-bullet response-rate stats from tracker data | Maintaining and improving resume content |
| **settings** | Gemini API key, model selector, personal info | Initial setup and updates |

## Job Aggregator

Pull 1000+ fresh internship and new-grad leads from four GitHub repos into `leads.json`:

```bash
node scripts/aggregate_jobs.js
```

Then open the **leads** tab → **↑ import leads.json** to load them into the app. Re-run anytime to refresh. Sources: SimplifyJobs Summer 2026 Internships, SimplifyJobs New Grad Positions, Pitt-CSC, speedyapply.

## File Structure

```
resume-tailor/
├── index.html              # App entry point
├── src/
│   ├── app.js              # Core logic and state (1100+ lines)
│   ├── blocks.js           # Resume content and LaTeX blocks
│   ├── gemini-api.js       # Gemini API client
│   └── utils.js            # LaTeX parsing and keyword helpers
├── css/
│   └── style.css           # All styling
├── scripts/
│   └── aggregate_jobs.js   # Node.js lead aggregator (runs standalone)
├── leads.json              # Output of aggregator — import into leads tab
├── extension/              # Firefox extension version
├── docs/                   # Full documentation
│   ├── USER_GUIDE.md       # Every tab, every button
│   ├── DATA.md             # Storage schema, backup, migration
│   ├── PIPELINE.md         # Fast-apply flow + daily/weekly checklists
│   ├── MOBILE_SHORTCUTS.md # iOS Shortcut, Android, bookmarklet
│   └── OPERATOR_MANUAL.md  # Printable daily ops reference
└── JOB_HUNT_PLAYBOOK.md    # Full job-search strategy guide
```

## Privacy

- API key stored in `localStorage` only — never leaves your machine except in Gemini API calls
- No analytics, no tracking, no external dependencies except Google Fonts and the Gemini API
- All application data (tracker rows, leads, blocks) lives in your browser's localStorage

## License

MIT
