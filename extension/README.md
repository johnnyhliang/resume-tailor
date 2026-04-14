# Resume Tailor — Firefox Extension

AI-powered resume tailoring and cover letter generation using Google Gemini. Built for Jonathan Liang.

## Features

- **Resume Tailor**: Paste a job description, select which experience/project blocks to include, and get a tailored LaTeX resume optimized for ATS keywords
- **Cover Letter Generator**: Generate professional cover letters customized to any role, with configurable tone (professional, enthusiastic, concise, storytelling)
- **Block Library**: Edit and manage your resume blocks — update bullet points, add new projects, tweak formatting
- **Settings**: Configure your Gemini API key, choose model, and manage personal info

## Setup (3 minutes)

### 1. Get a Free Gemini API Key

1. Go to https://ai.google.dev
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key (starts with `AIza...`)

**Free tier**: 15 requests/minute, 1,500 requests/day — more than enough for job applications.

### 2. Generate Extension Icons

The extension needs PNG icons. To create them:

1. Open `icons/generate-icons.html` in Firefox
2. It will automatically download `icon-48.png` and `icon-128.png`
3. Move both files into the `icons/` folder

Or use any 48x48 and 128x128 PNG images you want.

### 3. Load the Extension in Firefox

1. Open Firefox
2. Go to `about:debugging`
3. Click **"This Firefox"** in the left sidebar
4. Click **"Load Temporary Add-on..."**
5. Navigate to the `resume-tailor-extension` folder and select `manifest.json`
6. The extension icon should appear in your Firefox toolbar (puzzle piece → pin it)

### 4. Configure Your API Key

1. Click the extension icon → click **Settings** tab
2. Paste your Gemini API key
3. Click **Save**
4. Verify it says "● gemini connected" at the top

## Usage

### Tailoring a Resume

1. Go to the **Tailor** tab
2. Paste the job description
3. Toggle which experience/project blocks to include
4. Click **"tailor resume →"**
5. Review the output:
   - Extracted keywords shown as chips
   - Missing keywords highlighted in yellow
   - AI reasoning in the "tailoring notes" section
   - Full LaTeX code in the output panel
6. Click **"copy .tex"** to copy the complete LaTeX document

### Generating a Cover Letter

1. Go to the **Cover Letter** tab
2. Fill in: company name, role, job description
3. Optionally add specific points you want highlighted
4. Choose tone: Professional, Enthusiastic, Concise, or Storytelling
5. Click **"generate cover letter →"**
6. Click **"copy"** to copy to clipboard

### Managing Your Block Library

1. Go to the **Library** tab
2. Click any block to edit it
3. Modify the LaTeX code
4. Click **"save changes"** to persist updates
5. Click **"copy"** to copy individual blocks

## Available Gemini Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `gemini-2.0-flash` | ⚡ Fast | Good | Default, everyday use |
| `gemini-2.5-flash-preview` | Medium | Better | More nuanced tailoring |
| `gemini-2.5-pro-preview` | Slow | Best | Important applications |

## File Structure

```
resume-tailor-extension/
├── manifest.json          # Extension config
├── popup.html             # Main UI
├── blocks.js              # Resume block data
├── app.js                 # App logic + Gemini API
├── icons/
│   ├── icon-48.png       # Toolbar icon (small)
│   ├── icon-128.png      # Extension store icon
│   └── icon.svg          # Source SVG
└── README.md
```

## Costs

- **Gemini Free Tier**: 15 req/min, 1,500 req/day — essentially unlimited for personal use
- **Resume tailoring**: ~1 API call per job application
- **Cover letter**: ~1 API call per letter
- You will **never** hit the free tier limit applying to jobs

## Privacy

- Your API key is stored locally in Firefox's storage (never sent anywhere except Google's API)
- Resume data and job descriptions are not stored — they're sent to Gemini only when you click generate
- No analytics, no tracking, no external dependencies except Google Fonts and the Gemini API

## Troubleshooting

**"No API key configured" error**: Go to Settings and add your Gemini key.

**Empty response**: Try again — sometimes Gemini times out. Switch to `gemini-2.0-flash` for faster responses.

**LaTeX formatting issues**: The AI preserves your LaTeX structure. If something looks wrong, edit the block in the Library tab.

**Extension disappears on Firefox restart**: Firefox temporary add-ons are session-only. To make it permanent:
- Option A: Re-load it each session (takes 5 seconds)
- Option B: Package it as a proper `.xpi` and sign it (see Mozilla docs)

## Future Ideas

- Export directly to Overleaf
- Save job applications with JD + tailored resume version
- Multiple resume profiles (e.g., SWE vs. hardware roles)
- Auto-detect JD from LinkedIn/Indeed URLs
- Dark mode
