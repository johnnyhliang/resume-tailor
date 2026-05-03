# Pipeline

## Current Fast-Apply Pipeline (~95s + form fill)

Run this sequence for every application.

| Step | Action | Tab | Est. time |
|------|--------|-----|-----------|
| 1 | Copy full JD from posting | — | 10s |
| 2 | Paste JD → select relevant blocks → Generate | tailor | 25s (AI call) |
| 3 | Review truthfulness guard output; dismiss or fix flagged items | tailor | 15s |
| 4 | Check keyword gap — note any hard-missing keywords | tailor | 10s |
| 5 | Download PDF → review ATS check report | tailor | 10s |
| 6 | Click **+ log to tracker** | tailor | 5s |
| 7 | Fill out application form (company portal/LinkedIn Easy Apply) | — | varies |
| 8 | Return to tracker → set follow-up date (+6 days) | tracker | 5s |

**Total tooling time: ~80–95 seconds.** Form fill is separate and varies by portal.

---

## V2 Pipeline — URL Ingest (Not Yet Built)

Target: apply in under 60 seconds from phone to submission.

1. **Phone:** Share job posting URL from LinkedIn/job board app → share sheet sends to resume-tailor via a registered URL handler
2. **Laptop:** App pre-loads on the tailor tab with JD already extracted from the URL
3. **One click:** Select blocks → Generate (AI call runs) → Download
4. **Apply:** Application form is pre-filled where possible using personal info from settings
5. **Log:** Auto-logged to tracker on download

This collapses steps 1–6 of the current pipeline into a single share action. Requires building a URL-ingest endpoint and a mobile share target (likely the Firefox extension or a PWA manifest entry).

---

## Weekly Sunday Routine

- [ ] Export tracker CSV → save to `/docs/exports/` or cloud backup
- [ ] Open leads tab → paste this week's sources (HN Who's Hiring, funding newsletters, Discord job channels)
- [ ] Triage new leads: mark high-signal as `approached`, drop low-signal ones
- [ ] Draft outreach for the top 3–5 new leads (outreach tab)
- [ ] Review tracker: any overdue follow-ups? Send follow-up messages (outreach tab → follow-up type)
- [ ] Check weekly digest modal in tracker for response-rate trends
- [ ] Review block library stats — any blocks with 0% response rate on 5+ uses? Rewrite those bullets
- [ ] Update personal info in settings if anything changed (new projects, GPA update, etc.)

---

## Daily Cadence

- [ ] Check email/LinkedIn for inbound recruiter messages
- [ ] For each message: paste into email parser tab → review parse → one-click update tracker status
- [ ] Check tracker for overdue follow-up banners → send follow-ups if needed
- [ ] Apply to 2–5 new roles using the fast-apply pipeline
- [ ] Update tracker status for any roles that moved forward or were rejected

---

## Per-Interview Routine

**Night before:**
- [ ] Run dossier tab for the company → read fully
- [ ] Run interview prep tab with the correct round type → save output
- [ ] Fill in STAR scaffold Situation and Result fields with specifics from your memory
- [ ] Review the 24h cram list — focus on anything you can't recite cold
- [ ] Draft a thank-you message in outreach tab (thank-you type) → save draft, don't send yet

**Day of (post-interview):**
- [ ] Send thank-you within 2 hours (outreach tab draft)
- [ ] Update tracker status to the next stage
- [ ] Add notes to tracker row: topics covered, interviewer names, anything surprising
- [ ] If rejected: update status to `rejected`; note which round it ended at for future pattern analysis
