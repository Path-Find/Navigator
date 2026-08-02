# Cover Letter Grading Guide

How to score generated cover letters for the Navigator quality eval. Generation is separate (product path); this doc is **judgment only**.

Pairs live under gitignored `tests/runs/pairs/<date>-<suite>/` with `job-description.txt`, `cover-letter.txt`, optional `meta.json`, and suite-level `resume.txt`.

Related: [cover-letter-quality.md](./cover-letter-quality.md) (build the pair set).

---

## Unit of work

Grade **one pair at a time**:

| Input | Required? |
|---|---|
| Job description | **yes** |
| Cover letter | **yes** |
| Resume snapshot (`resume.txt` / blocks) | **yes** for grounding / hallucination checks |
| `fit_score` (from Navigator analysis) | optional but useful context |

Do **not** grade a letter alone. Do **not** treat low fit as automatic Weak craft — a strong letter at fit ~38 can still be Strong on writing if it is honest and grounded.

---

## Output per pair

Write `grade.json` next to the pair (or one `grades.jsonl` line per pair at the suite root):

```json
{
  "verdict": "Strong | Average | Weak",
  "fit_score": 72,
  "scores": {
    "grounded": 1,
    "jd_relevant": 1,
    "fit_honest": 1,
    "variety": 1,
    "readable": 1
  },
  "failure_modes": ["generic"],
  "rationale": "One or two sentences."
}
```

Dimensions are **1–5** (integer). Omit `scores` only if doing a fast verdict-only pass.

---

## Dimensions (1–5)

| Key | Meaning |
|---|---|
| **grounded** | Claims only from resume; no invented tools/employers/metrics |
| **jd_relevant** | Maps to requirements in *this* JD, not a generic career letter |
| **fit_honest** | Tone matches real fit; low score does not read as “perfect match” |
| **variety** | Body paragraphs use different resume anchors; not the same 3 blocks every letter |
| **readable** | Hiring-manager prose; not AI sludge, filler, or bullet echo |

---

## Verdict scale

| Verdict | Rule of thumb |
|---|---|
| **Strong** | Competitive letter; no hard fails; most dimensions ≥ 4 |
| **Average** | Usable but generic, thin JD link, or mild variety/honesty issues |
| **Weak** | Hard fail (see below) or mostly unusable |

**Hard fails → Weak** (any one is enough):

- Invented tools / employers / credentials not on the resume  
- Heavy overclaim of fit when resume clearly lacks domain  
- Mostly resume-bullet paste or synonym-swapped bullets  
- Generic sludge that could attach to almost any job  

**Fit calibration note:** Fit score is context for `fit_honest`, not the grade itself. Low fit + honest transferable framing can still be Strong/Average. Low fit + “I am uniquely qualified for every requirement” is Weak.

---

## Failure mode tags

Use a short list; multiple allowed:

| Tag | Meaning |
|---|---|
| `generic` | Could be any role/employer |
| `overclaim` | Inflates fit or seniority |
| `bullet_echo` | Resume sentences lightly reworded |
| `invented_tools` | Tools/skills not on resume |
| `same_blocks` | Same few resume blocks as other letters / all paragraphs |
| `weak_jd_link` | Barely uses this JD’s requirements |
| `fit_ignored` | Ignores known gaps / fit score |
| `sludge` | Robotic AI filler |
| `model` | Suspected model quality limit (use sparingly) |
| `prompt` | Structural prompt issue (use sparingly) |
| `fit` | Failure mainly because the job is a poor match (use with craft note) |

Prefer concrete tags (`overclaim`, `invented_tools`) over vague `model`/`prompt` unless you are comparing systems.

---

## Process

1. Ensure suite folder has `resume.txt` and numbered pair folders.
2. AI grader (can be a stronger model than production writer) scores each pair → `grade.json`.
3. Aggregate across the suite:
   - % Strong / Average / Weak  
   - Top failure modes  
   - Optional slice by fit band: `<40` / `40–70` / `>70`  
4. **Human spot-check ~10–15%** (or all Weak + a sample of Strong).
5. Decision note (no letter paste in git docs): prompt fix vs provider switch vs neither / need more data.

---

## Suite folders

Keep **different selection tests** in different directories so aggregates stay meaningful:

- `…-civic-careers` — bulk feed import  
- `…-web-planning` — “would I apply” / planning-oriented web picks  

Same grading rubric; separate rollups.

---

## What not to do

- Grade without JD or without resume for grounding checks  
- Auto-fail every low fit_score  
- Hand-score all 100+ unless debugging the grader  
- Commit grades that embed full personal letters into tracked docs (keep `grade.json` under gitignored `tests/runs/`)
