# Evals (docs)

Methodology and plans for judging AI quality. Versioned in git. **No personal letters, resumes, or full job dumps here.**

| Doc | What |
|---|---|
| [cover-letter-quality.md](./cover-letter-quality.md) | 50–100 pairs via **normal product path** (bulk add + generate as Ryan), then AI grading |

## Where stuff lives

| Path | Git? | Purpose |
|---|---|---|
| `docs/evals/` | yes | Plans / criteria only |
| `test-runs/` | **no** (gitignored) | Generated letters, JD text, review.json, corpus exports |
| `samples/` | **no** (gitignored) | Hand-curated sample JDs + letters |
| `tests/` | yes | Automated product tests (Playwright, etc.) |
| `scripts/test-harness.ts` | yes | Offline generation harness → writes into `test-runs/` |

If you export for offline review, drop **pairs** under `test-runs/corpus/` — each entry needs `job-description.txt` + `cover-letter.txt` (or one jsonl row with both fields). Letters without JDs are not usable for quality judging.
