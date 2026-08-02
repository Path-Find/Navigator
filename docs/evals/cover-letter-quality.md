# Cover Letter Quality Monitoring

Plan for building a real corpus of generated cover letters so quality (and cost) can be judged before any provider switch.

**Privacy:** this file is process only. Actual letters, job descriptions, and resume excerpts stay out of git — under gitignored `test-runs/` (and `samples/`). Don't paste personal corpus content into `docs/`.

Related:

- `test-runs/cover-letter-eval/` — June 2026 six-job diagnosis (local only; gitignored)
- `scripts/test-harness.ts` + `test-runs/README.md` — offline harness
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

## Data source (already exists)

No new logging pipeline. `aiCore.logToSupabase` (name is historical — writes to Neon) records every AI call in the `logs` table:

| Field | Use |
|---|---|
| `event_type` | Which feature made the call — separate cover letters from parsing |
| `prompt_text` | Full prompt; job description is embedded here |
| `response_text` | Generated letter |
| `metadata.token_usage` | Input and output tokens (for cost) |

Redaction strips only emails and phone numbers, so letters and job descriptions survive intact **in Neon**. Treat that as private product data, same as the rest of the account.

**Do not rely on `jobs.description` for pairing.** It has been NULL on rows that still have a cover letter. Use `logs.prompt_text`.

**Do not rely on `daily_usage.token_count`.** Stuck at 0 across rows; real per-call numbers are in `logs.metadata`.

Not built yet: convert token counts → dollars (price table + per-feature cost rollup on admin dashboard).

---

## Where to put downloaded / generated files

**Rule: a letter alone is not a corpus entry.** Every unit is a **pair** — job description + cover letter (optional: score, critique, tokens). You cannot judge quality without the JD that drove the letter.

Reuse gitignored `test-runs/` (and `samples/` for hand-curated pairs):

```
test-runs/
  cover-letter-eval/              ← existing June writeup (paired per job)
  corpus/                         ← bulk corpus (create when exporting)
    2026-08-02/
      001-employer-role/
        job-description.txt       ← required
        cover-letter.txt          ← required
        meta.json                 ← optional: score, model, variant, tokens, log id
      002-...
  2026-06-09-ttc-.../             ← harness run (already this shape)
    job-description.txt
    cover-letter.txt
    review.json
```

Same idea as `samples/[date]-[company]-[role]/` (`job-description.txt` + `cover-letter.txt`).

| Source | How pairing works |
|---|---|
| **In-app → Neon `logs`** | `prompt_text` has the JD; `response_text` is the letter. Keep them together when exporting — never export `response_text` only. Prefer extracting the JD section from the prompt (or re-fetch job text if still on the job row). **Do not trust `jobs.description` alone** (often NULL). |
| **Harness** | Already writes both files into one run folder. |
| **Manual / bulk seed** | Save cleaned JD when the job is added; after generation, write letter into the same pair folder. |

Optional one-file form for bulk dumps (still one pair per line/object):

```jsonl
{"id":"001","employer":"...","role":"...","job_description":"...","cover_letter":"...","score":72,"model":"gemini-flash-latest"}
```

---

## Status

| Date | Corpus |
|---|---|
| 2026-07-31 | 11 letters, all early February, all on retired `gemini-2.0-flash`, none with token data. Effectively starting from zero. |
| 2026-06-12 | Manual 6-job eval in `test-runs/cover-letter-eval/` (Claude Sonnet 4.6 against `v1_direct`; not production Gemini path) |

---

## How to grow the corpus

### Preferred: generate in-app on real jobs

1. Seed ~50–100 realistic job postings onto Ryan's Navigator account (mild fit preferred — poor-fit jobs only prove "fit is bad," not letter quality; see June diagnosis).
2. Run cover letter generation (and optionally match analysis) through the normal product path.
3. Letters land in `logs` automatically with full prompt + response + tokens.
4. Export to `test-runs/corpus/` only if you want offline review — **always as JD + letter pairs**, not letters alone. Otherwise score from Neon using `prompt_text` + `response_text` together.

### Job sourcing (bulk, not hand-paste)

Pain: manually finding and adding 50–100 jobs one-by-one.

Plan:

1. Query stored listings from **GovJobs / Feeds / Civic-Careers**.
2. Filter to roles Ryan is at least **mildly** qualified for (transit, policy-adjacent, coordination, student/co-op where relevant, generalist municipal/admin — not pure civil engineering / pure construction cost controls).
3. Insert those jobs into the Navigator `jobs` table for Ryan's account (or dump cleaned JD text into `test-runs/` for the harness).
4. Generate letters in batch or interactively from the UI.

Prior eval already showed 2/6 hand-picked jobs were unsolvable poor fits; bulk pick should bias toward medium–good fit so the corpus answers "is the letter good?" not "was the job a bad match?"

### Alternative: offline harness

```bash
# .env: TEST_EMAIL, TEST_PASSWORD (+ auth vars the harness expects)
bun scripts/test-harness.ts path/to/job-description.txt
bun scripts/test-harness.ts path/to/job-description.txt --variant=v2_storytelling
```

Outputs under `test-runs/[date]-[company]-[role]/`. Good for controlled A/B on a fixed JD set; does not replace the live `logs` corpus for production-path quality.

---

## Grading (later)

**Plan: use AI as the primary grader** over the pair corpus, not hand-scoring 50–100 letters.

### Input per item

- `job-description.txt` (required)
- `cover-letter.txt` (required)
- Optional: resume snapshot / block list used at generation time, compatibility score, prompt variant, model id — improves fit and hallucination checks

### Output per item (grader writes)

Suggested fields (store next to the pair, e.g. `grade.json`, still under `test-runs/`):

| Field | Purpose |
|---|---|
| `verdict` | e.g. Strong / Average / Weak (same rough scale as June eval) |
| `scores` | optional 1–5 dimensions (see criteria below) |
| `failure_modes` | tags: `model` / `prompt` / `fit` / `hallucination` / `generic` / `bullet_echo` / … |
| `rationale` | short why (for spot-checking the grader) |

### Criteria (what the grader is told to look for)

From the June diagnosis and later product fixes:

- **Fit honesty** — low-fit jobs shouldn't read as strong fit
- **Evidence variety** — different resume anchors across paragraphs; not the same 3 blocks every letter
- **No invented tools** — only skills/tools present on the resume (needs resume context if available)
- **No bullet echo** — prose, not reshuffled resume sentences
- **JD relevance** — claims map to requirements in *this* posting, not a generic career letter
- **Readable for a real hiring manager** — not generic AI sludge

### Process sketch (not built yet)

1. Build corpus of pairs (this doc).
2. Run a grading prompt over each pair → `grade.json` / one jsonl of grades.
3. Aggregate: pass rate, common failure modes, slice by fit score / variant / model.
4. Spot-check a sample of AI grades by hand so the grader isn’t quietly wrong.
5. Decide: prompt fix vs model/provider switch vs “fit filtering” product change.

Grader model choice is TBD — can be a stronger model than production (e.g. grade with a better model than the one that wrote the letter) so cost of grading stays small vs the corpus size.

---

## Done when

- [ ] ≥50 (stretch 100) production-path **pairs** (JD + letter) in `logs` with token usage
- [ ] Any local export under `test-runs/corpus/` keeps both files (or one jsonl object with both fields) per entry
- [ ] AI grading pass over the corpus + aggregate summary (pass rate, main failure modes)
- [ ] Spot-check sample of grades; decision note: prompt fix / provider switch / neither (summary can live in docs; raw pairs + grades stay local)
- [ ] Optional: admin cost rollup from `metadata.token_usage`
