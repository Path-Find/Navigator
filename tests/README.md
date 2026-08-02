# Tests

| Path | What | Git? |
|---|---|---|
| `e2e/` | Playwright specs | yes |
| `results/` | Playwright output (reports, last-run) | **no** |
| `runs/` | Manual/eval dumps (cover letter pairs, harness) | **no** |

Unit tests live next to source under `src/**/*.test.ts` (Vitest). Vitest excludes this whole `tests/` tree so Playwright specs are not run by `npm test`.
