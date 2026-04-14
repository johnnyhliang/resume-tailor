# Resume Tailor

AI-powered resume tailoring and cover letter generation using Google Gemini.

## Quick Start

**Option 1 — Browser (recommended):** Open [`index.html`](index.html) directly in your browser. Double-click it. No server needed.

**Option 2 — Firefox Extension:** Load the `extension/` folder as a temporary add-on via `about:debugging`.

## Features

- **Resume Tailor** — Paste a job description, select experience/project blocks, get a tailored LaTeX resume optimized for ATS keywords
- **Cover Letter Generator** — Generate professional cover letters with configurable tone (professional, enthusiastic, concise, storytelling)
- **Block Library** — Edit and manage resume blocks, update bullet points, tweak LaTeX formatting
- **Settings** — Store your Gemini API key locally, pick model, manage personal info

## Setup

1. Get a free Gemini API key at https://ai.google.dev (1,500 requests/day free tier)
2. Open `index.html` in your browser
3. Go to Settings → paste API key → Save
4. Start tailoring

## Gemini Models

| Model | Speed | Quality |
|-------|-------|---------|
| `gemini-2.0-flash` | ⚡ Fast | Good — recommended |
| `gemini-2.5-flash-preview` | Medium | Better |
| `gemini-2.5-pro-preview` | Slow | Best |

## File Structure

```
resume-tailor/
├── index.html              # Standalone app — double-click to run
├── extension/              # Firefox extension version
│   ├── manifest.json
│   ├── popup.html
│   ├── blocks.js
│   ├── app.js
│   ├── icons/
│   └── README.md
└── package.json
```

## Privacy

- API key stored in `localStorage` only — never sent anywhere except Google's API
- No analytics, no tracking, no external dependencies except Google Fonts + Gemini API
- All data stays on your machine

## License

MIT
