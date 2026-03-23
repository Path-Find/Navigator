# Feedback Roadmap

Closing the loop between what Navigator generates and whether it actually works. The core question: *did Navigator help you get a job?*

## The Loop

Every application has a natural arc:

> **Generate** → **Export** → **Apply** → **Did you use it?** → **Outcome** → **Rate it**

Right now these are disconnected fragments. This roadmap treats them as one system. The end goal isn't three separate data points — it's one signal: *did Navigator help you get a job?*

---

## What Exists

- **NudgeCard** — time-based check-in on the home page that asks interview / rejected / ghosted. Only fires if job status is already `applied`. Dismissal is session-only (not persisted).
- **`feedback` table + `submitFeedback()`** — DB and service layer are in place.
- **A/B variant selection** — the only current call to `submitFeedback()`, when a user picks between two cover letter styles.

---

## Phase 1 — In-App Feedback (Near Term)

Three distinct moments, designed separately.

### 1. Quality — Right After Generation

> "Is this cover letter good?" / "Was this analysis accurate?"

- [ ] Add thumbs up / down to `CoverLetterHeader` after a letter is generated.
- [ ] Add thumbs up / down to `AnalysisTab` for job match analyses.
- [ ] Wire both to `submitFeedback(jobId, rating, context)` — context distinguishes cover letter vs. analysis.
- [ ] No friction — passive, always visible once output exists.

### 2. Usage — Around Application Time

> "Did you actually use this?"

- [ ] Add a lightweight "Using this to apply" toggle or checkbox on the cover letter tab. Passive, always visible, no interruption or modal.
- [ ] Store as `coverLetterUsed: boolean` on the job record.
- [ ] No intercept, no status change required.

### 3. Outcome — The Nudge

> "What happened?"

The NudgeCard exists but needs fixes and expansion:

- [x] **Persist dismissal** — dismissed job IDs stored in localStorage per job (Mar 2026).
- [ ] **Decouple from `applied` status** — nudge should fire for any job with a cover letter past N days, regardless of whether the user ever set a status.
- [ ] **Surface in JobDetail** — not just the home page. A subtle banner on the Analysis tab after a few weeks gives context-aware prompting.
- [ ] **Two nudge tiers** — first nudge asks "did you apply?", second (if interview) asks "did you use the Navigator cover letter?"

---

## Phase 2 — Email Nudge (Later)

Meet users where they are, without requiring them to open the app. *(Requires infrastructure work — see [Technical Roadmap](./ROADMAP_TECHNICAL.md).)*

- [ ] **One-click outcome email** — sent very occasionally (once per job, max), 2–4 weeks after a cover letter is generated. Single question: "Did you get the interview?" Two buttons: **Got an interview** / **No news yet**.
- [ ] Clicking either button logs the outcome via a magic-link action token and lands the user in Navigator — no separate login step.
- [ ] Tone: thoughtful check-in, not a marketing email. One line of context, two buttons, nothing else.
- [ ] **Requires:** email service (Resend), magic-link action tokens, a simple resolve endpoint.

---

## What Not to Build

- Don't gate features on feedback submission.
- Don't send more than one nudge email per job — this can't feel like a drip campaign.
- Don't conflate AI critique (the Blind Review card) with user feedback — they answer different questions.
- Don't over-engineer the data model before there's enough volume to analyze.

---

[Back to Roadmap](../ROADMAP.md)
