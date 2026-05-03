# resume-tailor — Operator Manual

---

## DAILY ROUTINE (weekdays, ~45 min)

### Morning Sourcing — 15 min

Check in this order (cap at 5 new leads total):
1. **LinkedIn Jobs** — saved search alerts in inbox, filter: posted <24h
2. **Greenhouse / Lever job boards** — bookmark target companies' careers pages, scan new postings
3. **Hacker News: Who's Hiring** — first of month only; ctrl+F your target stack
4. **Referral queue** — any slack/DM referrals from yesterday
5. Add to **Leads tab** → set status `new`, source, JD URL

### Per-Application — 5 min per app

Exact sequence:
1. Open JD URL → run bookmarklet → paste into tailor tab's JD field
2. Paste your master resume → click **Tailor** → wait for Gemini output
3. Copy tailored bullets → open LaTeX editor → swap in bullets → export PDF
4. **ATS Check tab** → upload PDF → confirm email/phone parse correctly
5. If ATS score <70% or contact info missing → fix PDF, re-upload
6. **Tracker tab** → change lead status `new` → `applied`, log date, role, JD URL
7. Submit on ATS → confirm submission email received

### Outreach — 10 min

1. Open **Outreach tab** → filter status `queued`
2. Pick top 3 leads by company priority
3. Find contact on LinkedIn (hiring manager or eng team lead) → add to outreach record
4. Edit the AI-drafted message: **fix the hook** (first sentence must be specific, not generic)
5. Send via LinkedIn InMail or email → mark `sent`, log date
6. Set follow-up reminder: +7 days if no reply

### Email Check — 5 min

Scan inbox for:
- Recruiter replies → update tracker status (`screen` / `interview` / `rejected`)
- ATS confirmation emails → log confirmation number if present
- Calendar invites → accept, add to interview prep queue

### Follow-ups — 5 min

Open **Tracker tab** → look for the **overdue banner** (any app >7d with no status change).  
For each overdue: send one follow-up via outreach tab (type=`follow_up`), or mark `ghosted`.

---

## WEEKLY REVIEW (Sunday, ~90 min)

| Task | Time |
|---|---|
| Export CSV from Tracker tab | 5 min |
| Review week's application stats (applied, responses, interviews) | 10 min |
| Ingest new sources into Leads tab (job boards, referrals) | 20 min |
| Digest → diagnose: response rate, ATS scores, outreach replies | 15 min |
| Fix one thing: resume bullet, ATS keyword, outreach hook | 20 min |
| Clear ghosted leads older than 30d | 5 min |
| Plan next week's target list (5–10 companies) | 15 min |

**Sources to ingest weekly:**
- LinkedIn saved search (new results since last Sunday)
- Target company careers pages (bookmark list)
- Recruiter inbound (LinkedIn, email)
- Second-degree referrals from network

**Diagnose → Fix one thing (pick the worst metric):**
- Response rate <10%: targeting or resume problem — see WHEN THINGS GO WRONG
- ATS scores trending down: check for keyword drift vs. your current resume
- Outreach reply rate <5%: rewrite the hook template
- Interview→offer conversion low: behavioral prep (see PER-INTERVIEW)

---

## PER-INTERVIEW CHECKLIST

### 24–48h Before
- [ ] Pull company dossier: product, recent news, funding, team size, tech stack
- [ ] Re-read the JD, map your STAR stories to the top 5 requirements
- [ ] Prep pack: 3 questions for interviewer, your "why this company" (specific)
- [ ] Confirm logistics: time zone, video link, interviewer names

### Night Before
- [ ] Re-read dossier + prep pack (15 min max)
- [ ] Write out STAR answers for top 5 behaviorals (bullet form is fine)
- [ ] Check your internet, camera, mic

### Day Of
- [ ] Re-read prep pack one more time (5 min)
- [ ] Have dossier open in a side tab during the call

### Within 4h After
- [ ] **Outreach tab** → new message, type=`thank_you` → send to each interviewer
- [ ] Log interview notes while fresh: questions asked, vibe, red flags
- [ ] Update tracker status → `interviewed`

### Immediately After Each Stage
- [ ] Update tracker: status, stage (screen/onsite/final), interviewer names, next step date

---

## WHEN THINGS GO WRONG

**429 from Gemini**  
Settings → switch model to `gemini-2.5-flash`. If flash is also 429, wait 60s and retry; Gemini free tier resets per minute. Pro tier hits daily limits — flash is the fallback.

**PDF won't parse in ATS Check**  
Likely image-based PDF (scanned or built from Canva/Word exported wrong). Re-download from [latexonline.cc](https://latexonline.cc) or recompile LaTeX → export as text-layer PDF. ATS cannot read images.

**Tracker data missing**  
`localStorage` was cleared (browser wipe, incognito session, or cache clear). Restore from your last CSV export. Going forward: export every Sunday without fail.

**Response rate <10% after 20 apps**  
Two causes: (1) targeting — applying too senior or wrong domain; lower title by one level or pivot to adjacent role. (2) Resume — run ATS check on your master resume against a job you should have gotten, check keyword coverage. If ATS score <65%, rewrite the skills section.

**No responses at all (0 after 15+ apps)**  
Run ATS check specifically for email and phone extraction — if the tool can't find your contact info, neither can a recruiter. Also check: are you applying to roles you're 40%+ qualified for on paper? Cold apps to "Senior" roles with 0 YoE get auto-filtered.

---

## OFFER LEVERAGE

When an offer arrives:
1. Update tracker status → `offer`, log amount, equity, deadline
2. Within 24h: message every other in-flight company — *"I have a competing offer expiring [today + 7 days]. I'd love to move forward with you — can we accelerate the process?"*
3. Look up role on **Levels.fyi** — if offer is >10% below median for company/level, counter with the median number and cite Levels
4. Get competing timelines in writing before countering
5. Do not renege after signing — the SWE hiring world is small and Glassdoor reviews are permanent

---

## STORAGE CAVEAT

> All tracker, leads, and outreach data lives in your **browser's localStorage**. It is not synced, not backed up, and not recoverable if cleared. Export CSV from the Tracker tab every Sunday. Clearing browser data, switching browsers, or using incognito = losing everything.
