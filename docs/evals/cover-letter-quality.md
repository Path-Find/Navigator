# Cover Letter Quality Monitoring

Plan for building a real corpus of generated cover letters so quality (and cost) can be judged before any provider switch.

**Privacy:** this file is process only. Actual letters, job descriptions, and resume excerpts stay out of git — under gitignored `test-runs/` (and `samples/`). Don't paste personal corpus content into `docs/`.

Related:

- `test-runs/cover-letter-eval/` — June 2026 six-job diagnosis (local only; gitignored)
- `scripts/test-harness.ts` + `test-runs/README.md` — offline harness (secondary; not the primary corpus path)
- `docs/roadmap/TECHNICAL.md` — AI model strategy / provider cost table

---

## Goal

Collect **50–100** **pairs** (job description + generated cover letter), then **grade them with AI** (plus spot human checks) to decide good vs bad before spending anything on a provider switch (see cost table in TECHNICAL.md).

Pairs are the unit of work because a grader model needs the JD to judge fit honesty, evidence relevance, and generic sludge — a letter alone is not gradable.

Also useful for:

- Prompt regressions (`v1_direct` / variants)
- Fit-calibration behavior (low-score jobs shouldn't overclaim)
- Spotting repetitive evidence across letters (same 3 resume blocks every time)

---

## Principle: normal product path, bulk speed only

This is **not** a special eval pipeline, a guard bypass, or a side harness that pretends to be production.

Ryan is a normal user building a corpus on **his own Navigator account**. The only reason an agent does the clicks is that doing it ~50 times by hand is tedious.

| Step | What “normal user” means | Automation allowed |
|---|---|---|
| Find jobs | Browse Civic Careers / real postings | Query **Turso** (Civic Careers live DB) instead of scrolling |
| Add to profile | Save job → lands in History as `saved` with full JD | Insert into Neon `jobs` same shape as the app (`original_text`, company, title, url, status `saved`) |
| Generate letter | Open job → Generate cover letter | Call **`/api/gemini-proxy`** as Ryan (Neon Auth JWT) with `feature: 'cover_letter'` — same tier gates, quota, models, and `logs` as the UI |
| Later: grade | — | Separate step; can use a different model. Does **not** rewrite how letters were produced |

**Do not:**

- Call Gemini with a raw `GEMINI_API_KEY` for corpus letters (bypasses proxy, tier, usage, and product logging)
- Use a parallel prompt stack that doesn’t match `src/prompts/coverLetter.ts` + `jobAiService`
- Mark jobs as fake eval fixtures in a way that changes generation behavior (optional internal note is fine; generation must still be product-path)

Proof of add path (2026-08-02): Metrolinx *Junior Project Coordinator, Environmental Programs and Assessment (EPA)* saved on Ryan’s account from Turso → Neon. Letter generation for that row still to do via proxy.

---

## Data source (already exists)

No new logging pipeline. `aiCore.logToSupabase` (name is historical — writes to Neon) records every AI call in the `logs` table when the **product proxy** runs:

| Field | Use |
|---|---|
| `event_type` | Which feature made the call — separate cover letters from parsing |
| `prompt_text` | Full prompt; job description is embedded here |
| `response_text` | Generated letter |
| `metadata.token_usage` | Input and output tokens (for cost) |

Redaction strips only emails and phone numbers, so letters and job descriptions survive intact **in Neon**. Treat that as private product data, same as the rest of the account.

**Do not rely on `jobs.description` for pairing.** It has been NULL on rows that still have a cover letter. Prefer `jobs.original_text` for the JD on the job row, and `logs.prompt_text` + `logs.response_text` for the generation pair.

**Do not rely on `daily_usage.token_count`.** Stuck at 0 across rows; real per-call numbers are in `logs.metadata`.

Not built yet: convert token counts → dollars (price table + per-feature cost rollup on admin dashboard).

---

## Where jobs and letters live

### On the account (source of truth while building)

- **Jobs:** Neon `jobs` for Ryan’s `user_id` — full JD in `original_text`, letter in `cover_letter` once generated
- **AI trail:** Neon `logs` for each proxy call (prompt + response + tokens)

### Optional local export (gitignored)

**Rule: a letter alone is not a corpus entry.** Every unit is a **pair** — job description + cover letter.

```
test-runs/
  cover-letter-eval/              ← existing June writeup (paired per job)
  corpus/                         ← bulk export when grading offline
    2026-08-02/
      001-employer-role/
        job-description.txt       ← required
        cover-letter.txt          ← required
        meta.json                 ← optional: score, model, tokens, log id, job id
```

Export from Neon (`original_text` / `cover_letter` and/or `logs`) when ready to grade offline. Until then, the account + `logs` are enough.

---

## Job sourcing (Civic Careers / Turso)

Live Civic Careers data is **Turso** (`TURSO_URL` + `TURSO_AUTH_TOKEN`), not Vercel Blob. Local `jobs.sqlite` in the Civic Careers repo is stale — don’t use it for seeding.

| Filter | Intent |
|---|---|
| Active, non-inventory, has description | Usable JDs |
| Mild fit for Ryan | Transit-adjacent, coordination, policy-ish, student/co-op, municipal generalist — not pure trades / pure engineering / pure finance where resume has no anchor |
| Prefer GTHA employers when possible | TTC, Metrolinx, City of Toronto, regional municipalities, etc. |

Bias toward medium–good fit so the corpus answers “is the letter good?” not “was the job a bad match?” (June eval: 2/6 jobs were unsolvable poor fits).

---

## How to grow the corpus (ordered)

1. **Pull** mild-fit listings from Turso (title + source + full `description` + url).
2. **Add** each as a normal saved job on Ryan’s Navigator profile (same fields the app writes).
3. **Generate** cover letter (and match analysis if that’s what the UI would run first) via **production `gemini-proxy` as Ryan** — not a direct API key.
4. **Confirm** letter is on the job row and a `logs` row exists with `event_type` for cover letter + token usage.
5. Repeat until ≥50 (stretch 100).
6. **Later:** export pairs if needed → AI grade → aggregate → decide prompt vs provider.

### Offline harness (optional only)

`scripts/test-harness.ts` can generate letters offline for prompt A/B. It is **not** the primary path for this corpus and currently still leans on old Supabase auth wiring. Prefer the real proxy + account so the corpus matches production.

---

## Status

| Date | Notes |
|---|---|
| 2026-07-31 | 11 letters, early February, retired `gemini-2.0-flash`, no token data. Effectively starting from zero. |
| 2026-06-12 | Manual 6-job eval in `test-runs/cover-letter-eval/` (Claude, not production Gemini path). |
| 2026-08-02 | Confirmed Turso → Neon job add works (1 Metrolinx junior coordinator saved). Generation via product proxy still to prove on that row, then bulk. |

---

## Grading (later)

**Plan: use AI as the primary grader** over the pair corpus, not hand-scoring 50–100 letters.

Grading is a **separate** step from generation. Generation stays on production Navigator AI; the grader can be a stronger/cheaper model if useful.

### Input per item

- Job description (required)
- Cover letter (required)
- Optional: resume snapshot, compatibility score, prompt variant, model id

### Output per item

Suggested fields (e.g. `grade.json` under `test-runs/corpus/`, gitignored):

| Field | Purpose |
|---|---|
| `verdict` | Strong / Average / Weak (same rough scale as June) |
| `scores` | optional 1–5 dimensions |
| `failure_modes` | tags: `model` / `prompt` / `fit` / `hallucination` / `generic` / `bullet_echo` / … |
| `rationale` | short why (for spot-checking the grader) |

### Criteria

- **Fit honesty** — low-fit jobs shouldn't read as strong fit
- **Evidence variety** — different resume anchors across paragraphs; not the same 3 blocks every letter
- **No invented tools** — only skills/tools present on the resume
- **No bullet echo** — prose, not reshuffled resume sentences
- **JD relevance** — claims map to *this* posting
- **Readable for a real hiring manager** — not generic AI sludge

### Process sketch

1. Build corpus on account via product path (above).
2. Grade each pair → aggregate pass rate and failure modes.
3. Spot-check a sample of AI grades by hand.
4. Decide: prompt fix vs model/provider switch vs fit filtering.

---

## Done when

- [ ] ≥50 (stretch 100) **production-path** pairs: jobs on Ryan’s account + letters generated via `gemini-proxy` (visible in `logs` with token usage)
- [ ] Any local export keeps JD + letter together per entry
- [ ] AI grading pass + aggregate summary
- [ ] Spot-check sample of grades; decision note: prompt fix / provider switch / neither
- [ ] Optional: admin cost rollup from `metadata.token_usage`
