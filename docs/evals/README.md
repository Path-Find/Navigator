# Evals (docs)

Self-contained runbooks for judging AI quality. Versioned in git. **No personal letters, resumes, or full job dumps here.**

| Doc | What |
|---|---|
| [cover-letter-quality.md](./cover-letter-quality.md) | **Start here** for cover letter quality: full cold-start runbook (systems, non-negotiables, job filters, add → generate → grade) |

## Where stuff lives

| Path | Git? | Purpose |
|---|---|---|
| `docs/evals/` | yes | Runbooks only |
| `tests/e2e/` | yes | Playwright specs |
| `tests/results/` | **no** | Playwright output |
| `tests/runs/` | **no** | Eval/manual pair dumps (JD + letters) |
| `samples/` | **no** | Hand-curated sample pairs |

An agent should be able to open `cover-letter-quality.md` and execute without re-deriving the method from chat history.
