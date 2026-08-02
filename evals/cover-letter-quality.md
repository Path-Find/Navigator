# Cover Letter Quality Monitoring

Plan for building a real corpus of generated cover letters so quality (and cost) can be judged before any provider switch.

Lives under `evals/` (methodology / plans), not the product roadmap. Run outputs stay in `test-runs/`; automated product tests stay in `tests/`.

Related:

- `test-runs/cover-letter-eval/` — June 2026 six-job diagnosis (Claude vs prompts vs fit)
- `scripts/test-harness.ts` + `test-runs/README.md` — offline harness (one JD → analysis → letter → critique)
- `docs/roadmap/TECHNICAL.md` — AI model strategy / provider cost table

---

## Goal

Collect **50–100** generated cover letters **paired with the job descriptions that produced them**, then judge how good the output actually is before spending anything on a provider switch (see cost table in TECHNICAL.md).

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

Redaction strips only emails and phone numbers, so letters and job descriptions survive intact.

**Do not rely on `jobs.description` for pairing.** It has been NULL on rows that still have a cover letter. Use `logs.prompt_text`.

**Do not rely on `daily_usage.token_count`.** Stuck at 0 across rows; real per-call numbers are in `logs.metadata`.

Not built yet: convert token counts → dollars (price table + per-feature cost rollup on admin dashboard).

---

## Status

| Date | Corpus |
|---|---|
| 2026-07-31 | 11 letters, all early February, all on retired `gemini-2.0-flash`, none with token data. Effectively starting from zero. |
| 2026-06-12 | Manual 6-job eval in `test-runs/cover-letter-eval/` (Claude Sonnet 4.6 against `v1_direct` prompts; not production Gemini path) |

---

## How to grow the corpus

### Preferred: generate in-app on real jobs

1. Seed ~50–100 realistic job postings onto Ryan's Navigator account (mild fit preferred — poor-fit jobs only prove "fit is bad," not letter quality; see June diagnosis).
2. Run cover letter generation (and optionally match analysis) through the normal product path.
3. Letters land in `logs` automatically with full prompt + response + tokens.
4. Export / review from Neon when the count is high enough.

### Job sourcing (bulk, not hand-paste)

Pain: manually finding and adding 50–100 jobs one-by-one.

Plan:

1. Query stored listings from **GovJobs / Feeds / Civic-Careers** (`~/Desktop/Platforms/Navigator/Tools/…`).
2. Filter to roles Ryan is at least **mildly** qualified for (transit, policy-adjacent, coordination, student/co-op where relevant, generalist municipal/admin — not pure civil engineering / pure construction cost controls).
3. Insert those jobs into the Navigator `jobs` table for Ryan's account (or dump cleaned JD text files for the harness).
4. Generate letters in batch or interactively from the UI.

Prior eval already showed 2/6 hand-picked jobs were unsolvable poor fits; bulk pick should bias toward medium–good fit so the corpus answers "is the letter good?" not "was the job a bad match?"

### Alternative: offline harness

```bash
# .env: TEST_EMAIL, TEST_PASSWORD (+ Neon/auth vars the harness expects)
bun scripts/test-harness.ts path/to/job-description.txt
bun scripts/test-harness.ts path/to/job-description.txt --variant=v2_storytelling
```

Outputs under `test-runs/[date]-[company]-[role]/`. Good for controlled A/B on a fixed JD set; does not replace the live `logs` corpus for production-path quality.

---

## Review criteria (when judging the corpus)

Pull from the June diagnosis and later product fixes:

- **Fit honesty** — low scores shouldn't read as strong fit
- **Evidence variety** — different resume blocks across paragraphs / across letters
- **No invented tools** — only skills/tools present on the resume
- **No bullet echo** — prose, not reshuffled resume sentences
- **Strategy vs retrospective** — tailoring advice is forward-looking
- **Readable for a real hiring manager** — not generic AI sludge

Rough rubrics from June: Strong / Average / Weak, plus note if failure mode is **model**, **prompt**, or **fit**.

---

## Done when

- [ ] ≥50 (stretch 100) production-path letters in `logs` with token usage
- [ ] Each letter scorable against a known JD (from `prompt_text` or stored job text)
- [ ] Written quality summary: pass rate, main failure modes, whether a provider switch is justified
- [ ] Optional: admin cost rollup from `metadata.token_usage`
