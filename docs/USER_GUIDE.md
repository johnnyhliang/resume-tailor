# User Guide

## tailor

**What it does:** Takes a job description and your selected resume blocks, calls Gemini to reorder/rewrite bullets for keyword alignment, then outputs a complete tailored LaTeX resume. On download it runs an ATS compatibility check. A truthfulness guard scans the output and flags any claims not traceable to your source blocks. A keyword gap visualization shows which JD terms are covered and which are missing.

**Inputs:**
- Job description (paste full text)
- Selected blocks from your block library (checkboxes)

**Outputs:**
- Tailored LaTeX resume (copy or download)
- Truthfulness guard report (flagged fabrications highlighted)
- Keyword gap list (covered vs. missing)
- ATS compatibility report (triggered on download)

### ATS Scorecard

After tailoring completes, a scorecard appears in the output panel above the resume preview. It shows:

- **match_score** — 0–100% estimate of keyword and role alignment between your resume and the JD
- **critical_gaps** — keywords and skills present in the JD but absent from your tailored resume, shown as warning chips
- **smart_suggestions** — 3–4 actionable tips specific to this application (e.g. "Mention your gRPC experience in the multi-chain indexer block")

**When it appears:** automatically after every successful tailor run — no extra action needed.

**How to use the suggestions:** Read each suggestion before submitting. They reference your actual blocks and bullets by name, so they are directly actionable — either edit a bullet in the block library or manually adjust the output before downloading.

**Caveat:** The match_score is Gemini's estimate based on keyword overlap and semantic relevance. It is not produced by a real ATS (Applicant Tracking System). Different ATS vendors weight keywords differently; treat the score as a directional signal, not a guarantee.

**Tips:**
- Select only blocks relevant to the role — the AI will not fabricate missing experience, but it will over-stretch bullets if you give it irrelevant blocks
- The truthfulness guard catches hallucinated metrics and technologies; review every flagged item before submitting
- Download (don't just copy) to trigger the ATS check
- To log to tracker: click **+ log to tracker** manually after you're satisfied with the output — it is not automatic
- You can paste a job posting URL into the **fetch from URL** field above the JD textarea — the app will fetch and pre-fill the JD automatically (requires serving via localhost, not file://)

---

## cover letter

**What it does:** Generates a cover letter from a job description, role name, and tone selection.

**Inputs:**
- Job description
- Role/company name
- Tone: professional | enthusiastic | concise | storytelling

**Outputs:**
- Cover letter draft (copy)

**Tips:**
- Use "concise" tone unless the role explicitly calls for narrative writing
- Always personalize the opening line after generation — the AI uses generic openers
- Log to tracker manually via **+ log to tracker** if you want to record this application

---

## dossier

**What it does:** Takes a company name and generates a research pack: what the company does, recent momentum (funding, product launches, hiring signals), tech stack, likely hiring managers, smart questions to ask, and risks/red flags.

**Inputs:**
- Company name (and optionally role title)

**Outputs:**
- Structured research pack (what they do, momentum, tech stack, hiring managers, smart questions, risks)

**Tips:**
- Run this before writing outreach — the outreach hook should reference something from the dossier
- Run again the night before an interview for updated context
- Gemini's knowledge has a cutoff; verify funding/acquisition claims independently

---

## outreach

**What it does:** Drafts one of six message types, all under 150 words, with a mandatory hook field that forces specificity.

**Message types:**
1. Cold outreach (no connection)
2. Warm outreach (mutual connection or shared context)
3. Follow-up (no response after application)
4. Thank-you (post-interview)
5. Teardown (withdraw gracefully, keep relationship)
6. Referral request

**Inputs:**
- Message type selection
- Hook field (required — specific detail about the person/company)
- Recipient name, role, company
- Optional: your relevant context

**Outputs:**
- Draft message

**Tips:**
- The hook field is not optional — vague hooks produce generic messages that get ignored; use something from the dossier
- **Copying the output strips the "NOTES FOR SENDER" section** that appears at the bottom of the draft. That section contains reminders and customization suggestions for you — it is removed automatically on copy so you don't accidentally send it
- Keep messages under 150 words; the AI respects this but verify the count

---

## ats check

**What it does:** Uploads a compiled PDF resume and extracts text via pdf.js. Runs section detection, contact info recovery, garble heuristics (catches column-layout encoding artifacts), and keyword coverage scoring against an optional JD.

**Inputs:**
- PDF file (your compiled resume)
- Optional: job description for keyword coverage

**Outputs:**
- Extracted text
- Section detection results (Education, Experience, Skills, etc.)
- Contact info recovery (email, phone, LinkedIn)
- Garble warnings (likely ATS-unreadable segments)
- Keyword coverage score (if JD provided)

**Tips:**
- Test every new LaTeX template here before submitting anywhere
- Two-column layouts almost always garble — check the extraction carefully
- If contact info is missing from the recovery output, a real ATS may drop it too

---

## tracker

**What it does:** An inline-editable table of every application. Each row stores date, company, role, source, status, follow-up date, notes, and a snapshot of the exact resume LaTeX and blocks used. Follow-up overdue banners appear automatically. Per-block response-rate stats surface which resume sections correlate with callbacks. CSV export/import for backup. Weekly digest modal summarizes activity.

**Fields per row:**
- Date, Company, Role, Source, Status, Follow-up date, Notes
- Resume snapshot (LaTeX), Selected block IDs, Bullets snapshot, JD snapshot

**Statuses:** `applied` | `followup_sent` | `recruiter_screen` | `technical` | `onsite` | `offer` | `rejected` | `ghosted` | `withdrew`

**Inputs:**
- Manual entry or logged from other tabs via **+ log to tracker**
- CSV import (for migration or bulk entry)

**Outputs:**
- Application table (inline edit)
- Follow-up overdue banners
- Response-rate stats per block
- CSV export
- Weekly digest

**Tips:**
- The **+ log to tracker** button in tailor/cover letter tabs is not automatic — click it intentionally when you've submitted
- Export CSV weekly — localStorage can be cleared by the browser
- Set follow-up dates 5–7 days after applying; the banner appears when they pass
- Update status immediately when you hear back so response-rate stats stay accurate

---

## interview prep

**What it does:** Takes company, job description, and interview round type, then generates: behavioral STAR scaffolds using your actual resume bullets, likely technical questions for the role, smart questions to ask the interviewer, and a 24-hour cram list.

**Inputs:**
- Company name
- Job description
- Round type (recruiter screen | technical phone | take-home | onsite | final)

**Outputs:**
- Behavioral STAR scaffolds (pre-filled with your resume bullets)
- Likely technical questions
- Smart questions to ask
- 24h cram list

**Tips:**
- Run this the night before, not the morning of
- The STAR scaffolds are starting points — fill in the Situation and Result sections with specifics; the AI leaves those loose
- Use the dossier output alongside this for company-specific smart questions

---

## email parser

**What it does:** Parses a recruiter email into structured fields: company, role, intent, summary, required action, and a draft reply. One-click updates the corresponding row in tracker.

**Inputs:**
- Raw recruiter email (paste full text)

**Outputs:**
- Structured parse: company / role / intent / summary / action items / draft reply
- One-click tracker status update button

**Tips:**
- Use this for every inbound recruiter message to keep tracker status current
- The draft reply is a starting point — always personalize before sending
- If the company already has a tracker row, the one-click update will find it by company+role match

---

## leads

**What it does:** Ingests unstructured text from any source (funding announcements, HN "Who's Hiring" threads, Twitter/X, Discord job channels, newsletters) and extracts structured leads with signal strength, fit assessment for SWE internship, outreach angle, and facts to verify.

**Inputs:**
- Raw text (paste from any source)

**Outputs:**
- Lead cards with: company, what they do, signal strength, signal reason, SWE intern fit, outreach angle, facts to verify
- Links to open the company in outreach or dossier tabs directly

**Lead statuses:** `new` | `approached` | `dropped`

**Tips:**
- Paste the full HN thread or newsletter block — more context produces better fit assessments
- Always check "verify_facts" before reaching out; Gemini hallucinates funding amounts
- Use signal strength as a triage filter: act on high-signal leads same day

---

## block library

**What it does:** Displays all LaTeX resume blocks (experience entries, project entries, skills sections). Each block and each bullet shows response-rate stats derived from tracker data — how often applications using that block/bullet advanced past the applied stage.

**Inputs:**
- Direct editing in the UI

**Outputs:**
- Updated blocks used by tailor tab
- Per-block and per-bullet response-rate stats

**Tips:**
- Response-rate stats are only meaningful after ~20+ applications; don't over-optimize early
- Keep bullet edits to wording, not fabrication — the truthfulness guard in tailor will catch it anyway
- Blocks deleted here are gone; there's no version history

---

## settings

**What it does:** Stores Gemini API key, model selection, and personal info (name, email, phone, LinkedIn, target roles) used by all generation tabs.

**Inputs:**
- Gemini API key (from https://ai.google.dev)
- Model selection
- Personal info fields

**Tips:**
- Use `gemini-2.5-flash` — it's the only model that reliably stays within free-tier rate limits
- Personal info populates automatically into cover letters, outreach, and other generated outputs — fill it out once
