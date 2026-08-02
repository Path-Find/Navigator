# Cover Letter Quality Eval — Runbook

Self-contained instructions for building and judging a set of production cover letters (JD + letter pairs). Read this end-to-end before acting. Do **not** invent a parallel pipeline or ask the user to re-explain the method unless a prerequisite is actually missing.

**Privacy:** this file is process only. Never commit real letters, full JDs, or resume text into `docs/`. Raw outputs stay under gitignored `test-runs/` (and `samples/`).

---

## 1. Goal

Collect **50–100** real **(job description + cover letter)** pairs produced the way a normal Navigator user produces them, then **AI-grade** those pairs to decide:

- Are letters good enough?
- Failure modes: model vs prompt vs bad fit?
- Is a **provider switch** justified? (cost context: `docs/roadmap/TECHNICAL.md`)

A letter without its JD is **not** a valid pair for this eval. A letter produced outside the product AI path is **not** a valid pair for this eval for this eval.

---

## 2. Non-negotiables (do not violate)

1. **Normal user path only.** The account owner is the user under test. Automation is allowed **only** to avoid doing the same UI steps 50 times by hand. Behavior must match: save job → generate cover letter in Navigator.
2. **Same AI stack as production.** Generation must go through Navigator’s **`/api/gemini-proxy`** (authenticated as that user). Same models, tier gates, quota, prompts (`src/prompts/coverLetter.ts`, `jobAiService`), and Neon `logs` writing.
3. **Do not bypass guards** when generating these pairs: no direct `GEMINI_API_KEY` to Gemini, no offline-only harness as the primary path, no alternate prompts “for speed.”
4. **Mild fit jobs.** Prefer roles the resume can at least partially support. Poor-fit jobs measure “fit is bad,” not letter quality (see June 2026 diagnosis in local `test-runs/cover-letter-eval/`).
5. **Pairs always.** Export, grade, and count only JD + letter together.
6. **No secrets or personal pair dumps in git.** Plans in `docs/evals/`; dumps in `test-runs/`.

---

## 3. Systems map (where things live)

| System | Role | How to access |
|---|---|---|
| **Civic Careers (GovJobs)** | Source of real public-sector JDs | Live DB is **Turso** (`TURSO_URL` + `TURSO_AUTH_TOKEN` in Civic Careers `web/.env.local`). Tables: `jobs` + `job_details` (description, title, tags, student flags). API: deployed Vercel project `govjobs` → `/api/jobs`. **Not** Vercel Blob. Local `jobs.sqlite` in the Civic Careers repo is **stale** — do not use for seeding. |
| **Navigator** | User product under test | Repo: `~/Desktop/Platforms/Navigator/Navigator`. Production: `navigator-two-jet.vercel.app` (confirm via Vercel if needed). |
| **Neon Postgres** | User jobs, resumes, AI logs | `NEON_DATABASE_URL` in Navigator `.env`. Tables: `jobs` (`original_text` = JD, `cover_letter` = letter), `resumes`, `logs` (`prompt_text`, `response_text`, `event_type`, `metadata.token_usage`), `profiles`. |
| **Neon Auth** | Session for proxy calls | `VITE_NEON_AUTH_URL` / `NEON_AUTH_BASE_URL` + user email/password. Proxy requires `Authorization: Bearer <access_token>`. |
| **gemini-proxy** | Only allowed generation path | `POST https://<navigator-host>/api/gemini-proxy` with JWT; body includes `payload` (Gemini contents), `task: 'analysis'`, `feature: 'cover_letter'` (and analysis without that feature for match scoring if the UI would run it first). |

**Known data pitfalls:**

- Prefer `jobs.original_text` for the JD on the job row; `jobs.description` is often NULL.
- Prefer `logs.metadata` for tokens; `daily_usage.token_count` has been stuck at 0.
- Pair from `logs` via `prompt_text` + `response_text` when exporting generation history.

**Owner account (this machine’s eval target):** email `rhanna@live.com` unless the user says otherwise. Resolve `user_id` from `neon_auth.user` / `profiles`.

---

## 4. Prerequisites checklist

Before generating anything, confirm:

- [ ] Civic Careers Turso credentials work; can `SELECT` active jobs with non-empty `description`
- [ ] Navigator Neon credentials work; can read `jobs` / `resumes` / `profiles` for the user
- [ ] User has a non-empty resume profile in `resumes` (blocks with content)
- [ ] Can obtain a Neon Auth access token for that user (password in env or user-provided)
- [ ] Can `POST` production (or linked) `/api/gemini-proxy` with that token and get a 200 (not 401/403)
- [ ] User tier allows cover letters: Plus+, **or** admin/tester (proxy treats admin/tester as elevated). Free non-admin is blocked for `feature: 'cover_letter'`

If a box fails, fix that blocker — do not switch to direct Gemini.

---

## 5. Job selection criteria (mild fit)

**Include** (title/tags/employer heuristics; refine with resume if needed):

- Student / co-op / intern roles when the user is in that market
- Transit-adjacent coordination, engagement, policy-ish, program/admin, analyst (non-specialist)
- Employers such as TTC, Metrolinx, City of Toronto, GTHA municipalities/regions, similar public sector

**Exclude or deprioritize:**

- Pure trades, pure engineering (civil/electrical/rail tech without matching resume), pure clinical, pure accounting/payroll unless resume supports it
- Inventory/boilerplate postings, empty/short descriptions
- Closed jobs (past `closing_date` when present)
- Duplicates of jobs already on the user’s account (same company + title)

**Volume:** aim **50** solid pairs; stretch **100**. Quality of fit beats padding with nonsense roles.

---

## 6. Procedure — Phase A: build the pair set

Execute in order. Idempotent where possible (skip duplicates).

### A1. Pull candidates from Turso

Query active, non-inventory jobs with substantial `job_details.description`. Apply mild-fit filters from §5. Keep: id, source (company), job_title, location, url, full description, is_student, closing_date.

### A2. Add jobs to the user’s Navigator profile

For each selected job, insert a **normal saved job** into Neon `jobs` as the product would:

- `user_id` = target user
- `id` = new UUID
- `job_title`, `company` (Civic Careers `source`), `location`, `url`
- `original_text` = full JD (required for later generation/export)
- `status` = `saved`
- `date_added` / `created_at` / `updated_at` = now

Do **not** change generation behavior with special fixture modes. Optional quiet provenance in metadata or a trailing note is fine if it does not alter prompts.

**Sanity check:** job appears in History for that user with readable description.

### A3. Generate cover letter (product path)

For each saved job **without** a letter yet:

1. Load the user’s primary non-empty resume from `resumes`.
2. Authenticate as the user → access token.
3. Run the **same sequence the app uses** (see `src/services/ai/jobAiService.ts`):
   - Job analysis / match if the UI runs it before letters (recommended — produces fit score + `coverLetterTailoringInstructions`).
   - Cover letter generation with `feature: 'cover_letter'` via `/api/gemini-proxy`.
   - Quality/critique loop if the user’s tier is Pro/admin/tester (product already gates this).
4. Persist results on the job row: `cover_letter`, analysis/fit fields the app would save, critique if applicable.
5. Confirm a `logs` row exists for the cover-letter call with `response_text` and token metadata when available.

**One-job proof before bulk:** complete A2+A3 for a single mild-fit job and verify UI + `logs`. Only then batch.

### A4. Stop conditions

- Target count reached, or
- Quota/limit hit (stop; report used/limit; do not bypass), or
- Auth/proxy failure (stop; fix; do not fall back to raw API key)

---

## 7. Procedure — Phase B: grade (after pairs exist)

Grading is **separate** from generation. Grader model may differ from production writer.

1. Export pairs (from `jobs.original_text` + `jobs.cover_letter`, and/or `logs`) into gitignored `test-runs/pairs/<date>/` as either:
   - per-entry folders: `job-description.txt` + `cover-letter.txt` (+ optional `meta.json`), or
   - jsonl with both fields per line
2. Run an AI grader per pair with criteria below → `grade.json` / grades jsonl.
3. Aggregate: pass rate, failure-mode histogram, slices by fit score if available.
4. Human spot-check a sample of grades.
5. Write a short decision note (can land in this doc under Status, without pasting letters): prompt fix / provider switch / neither / need more data.

### Grading criteria

- Fit honesty (low fit must not read as strong fit)
- Evidence variety across paragraphs and across letters
- No invented tools/skills not on resume
- No resume bullet echo
- Claims map to **this** JD
- Readable, non-generic prose

Verdict scale: **Strong / Average / Weak** (align with June 2026 eval). Tag failure modes: `model` | `prompt` | `fit` | `hallucination` | `generic` | `bullet_echo`.

---

## 8. What “done” means

- [ ] ≥50 (stretch 100) pairs on the user account, letters produced via **gemini-proxy**
- [ ] Corresponding `logs` evidence for generation (tokens where captured)
- [ ] AI grades + aggregate summary
- [ ] Spot-check + decision note on prompt vs provider
- [ ] Optional: cost rollup from `logs.metadata.token_usage`

---

## 9. Explicitly out of scope for this eval

- Redesigning Navigator UI
- Switching production providers mid-eval
- Building a permanent bulk-import product feature (one-off automation scripts are fine)
- Grading without JDs
- Using Civic Careers UI scraping when Turso already has structured descriptions

---

## 10. Status log

| Date | Notes |
|---|---|
| 2026-07-31 | Prior production pairs effectively empty (old model, no tokens). |
| 2026-06-12 | Offline Claude 6-job diagnosis only — not production path. |
| 2026-08-02 | Confirmed Turso → Neon **job add** (1 Metrolinx junior coordinator). **Generation via proxy still to prove**, then bulk to 50–100. Doc rewritten as cold-start runbook. |

Update this table as the eval progresses.
