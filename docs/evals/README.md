# Evals (docs)

Methodology and plans for judging AI quality. Versioned in git. **No personal letters, resumes, or full job dumps here.**

| Doc | What |
|---|---|
| [cover-letter-quality.md](./cover-letter-quality.md) | 50–100 letter corpus plan, Neon `logs`, job sourcing, review criteria |

## Where stuff lives

| Path | Git? | Purpose |
|---|---|---|
| `docs/evals/` | yes | Plans / criteria only |
| `test-runs/` | **no** (gitignored) | Generated letters, JD text, review.json, corpus exports |
| `samples/` | **no** (gitignored) | Hand-curated sample JDs + letters |
| `tests/` | yes | Automated product tests (Playwright, etc.) |
| `scripts/test-harness.ts` | yes | Offline generation harness → writes into `test-runs/` |

If you pull letters out of Neon for offline review, drop them under `test-runs/corpus/` (or any dated subfolder). They stay local.
