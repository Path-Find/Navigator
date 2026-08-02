# Tests

| Path | What | Git? |
|---|---|---|
| `e2e/` | Playwright specs | yes |
| `results/` | Playwright output — **created when you run e2e**, not checked in | **no** |
| `runs/` | Manual/eval dumps (cover letter pairs, harness) | **no** (except `.gitkeep` / this README under `runs/` if present) |

Unit tests live next to source under `src/**/*.test.ts` (Vitest). Vitest excludes this whole `tests/` tree so Playwright specs are not run by `npm test`.

`results/` may not exist until `npx playwright test` (or `npm run test:e2e`) runs; that is normal.
