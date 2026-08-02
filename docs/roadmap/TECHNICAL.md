# Technical

Technical foundation and scaling initiatives to support growth and long-term stability.

## AI Model Strategy

All AI calls are proxied through `api/gemini-proxy.ts` (a Vercel Function), which enforces tier gating and quota tracking before forwarding to the provider.

**Current provider**: Google Gemini. Model selection lives in `TIER_MODELS` in that file.

**Never pin a Gemini model version.** Use the floating `-latest` aliases only. On 2026-07-31 every pinned model the app named — `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-2.5-pro`, `gemini-3-pro`, `text-embedding-004` — was found to return 404 "no longer available to new users" on a fresh API key. Pinned versions retire silently and take down every AI feature at once.

| Task | Model | Resolves to (2026-07-31) |
|---|---|---|
| `extraction` (job metadata parsing) | `gemini-flash-lite-latest` | gemini-3.5-flash-lite |
| `analysis` (scoring + cover letters) | `gemini-flash-latest` | gemini-3.6-flash |
| `embedding` (semantic search) | `gemini-embedding-001` | — |

Gemini 3.x rejects `thinkingConfig: {thinkingBudget: 0}` with a 400. Use `thinkingLevel: 'low'` — it still yields zero thought tokens on the flash models.

### Provider cost comparison (2026-07-31)

Per million tokens, input / output:

| Provider | Model | Cost |
|---|---|---|
| Google | Gemini 3.6 Flash (current, analysis) | $1.50 / $7.50 |
| OpenAI | GPT-5.6 Luna | $0.20 / $1.20 |
| OpenAI | GPT-5.6 Terra | $2 / $12 |
| Anthropic | Haiku 4.5 | $1 / $5 |
| Anthropic | Sonnet 5 | $3 / $15 |

OpenAI cut Luna 80% on 2026-07-30, which makes it roughly 6x cheaper than what extraction currently runs on. **Not adopted** — switching providers means a new SDK, a different response shape, and retuning every prompt, and there is currently no quality data to justify it. Revisit once the cover-letter corpus is large enough to judge output quality against cost — full plan in [`docs/evals/cover-letter-quality.md`](../evals/cover-letter-quality.md).

Earlier evaluation: **DeepSeek** was considered for extraction and not adopted, on the same single-provider-simplicity reasoning.

---

## Foundation

- [ ] **Storage Service**: Migrate local storage calls to encrypted StorageService.
- [ ] **Log Management**: Standardize production logging and remove sensitive data leakage.
- [ ] **Observability**: Integrate Sentry and LogSnag for error reporting and event tracking.
- [ ] **Security Audit**: Periodic sweep of security rules and API restriction hardening.
- [ ] **Performance Pass**: Optimization of V8 bundle size and asset loading for <2s initial load.

## Maintenance

- [ ] **Resume update without rollback** (`ResumeContext.tsx:108-119`, in `handleUpdateResume`/`handleUpdateResumes`): State is committed before confirming storage write. On failure, UI and storage are out of sync.
- [ ] **Inconsistent storage error handling**: Some methods throw, some silent-fail, some `console.error()`. Standardize so callers can rely on consistent error propagation.
- [ ] **Mixed async/await and `.then()` chains**: Services mix patterns throughout, making error paths hard to follow. Standardize to async/await.
- [ ] **Inconsistent error message localization**: Raw API/Supabase error strings shown to users in some flows. Route all user-facing errors through the `errorMessages` utility.
- [ ] **In-app URL scraper fails ~99% of the time** (`scraperService.ts` / `api/scrape-jobs.ts`, `mode: 'text'`): plain server-side fetch + regex, no JS execution — fails on anything beyond the hardcoded ATS blocklist (most modern career pages, bot detection). The browser extension's `content/extractor.ts` already solves this correctly (reads the rendered DOM client-side, has a working Workday selector) but is a separate, opt-in flow. Options: add a headless-browser backend (Playwright, same approach as GovJobs/Feed's scraper), or lean into steering users toward the extension instead of fixing the backend path. Undecided — tabled 2026-07-18.

## Data Retention

- [ ] **Job record tiering**: Active jobs store full record (description, AI analysis, screening scores). Expired jobs are tombstoned — title, company, status, notes only. Reduces storage as pipeline grows.
- [ ] **Expired + applied exception**: Jobs past submission date where status is Applied or further keep full record (needed for interview prep, follow-up, reference).

---

## Completed

### Foundation
- [x] **Type Safety**: 100% any-free production codebase (Completed Mar 2026).

### Maintenance
- [x] **Cloud sync silent failures**: Implemented timeouts and error propagation (Mar 2026).
- [x] **Optimistic state before DB confirmation**: Rollback mechanism implemented (Mar 2026).
- [x] **Double-fetch on load**: Consolidated to single fetch-after-sync (Mar 2026).
- [x] **N+1 cloud sync**: Batched insertions/upserts implemented (Mar 2026).
- [x] **Missing error boundaries**: Wrap main app root in App.tsx (Mar 2026).
- [x] **No timeout on cloud operations**: `withTimeout` utility applied to core operations (Mar 2026).
- [x] **Usage stats silent downgrade**: Fallback now triggers explicit notification to the user (Mar 2026).
- [x] **Interview Advisor Restoration**: Fixed broken imports, missing logic, and warnings (Mar 2026).
- [x] **Onboarding & Skill Module Cleanup**: Removed 100+ unused imports/variables and resolved build/lint failures (Mar 2026).
- [x] **No conflict resolution in multi-device sync**: Added `updatedAt` comparison (Mar 2026).
- [x] **No timestamp comparison in resume merge**: Implemented timestamp-based merging (Mar 2026).
- [x] **Cover letter auto-generation broken post-mount**: Fixed dependency array (Mar 2026).
- [x] **Rapid job navigation race**: Integrated `AbortController` (Mar 2026).
- [x] **Vault migration blocks UI**: Added time-budgeted migration guard (Mar 2026).
- [x] **Missing error state in analysis progress**: Standardized error propagation (Mar 2026).
- [x] **Deploy `create-portal-session` edge function**: Deployed Mar 2026 via CLI.
- [x] **Target job name not validated**: Dedup via title collision check (Mar 2026).
### Performance & Quality
- [x] **Unbounded bucket cache**: Added TTL clearing strategy (Mar 2026).
...
- [x] **Large PDF memory spike**: PDF extraction refactored to sequential processing (Mar 2026).
- [x] **PDF parse silent failure**: Descriptive errors thrown and logged (Mar 2026).
- [x] **Placeholder Supabase client**: Throws on startup in production if env vars missing (Mar 2026).
- [x] **Incomplete `JobAnalysis` return**: Initializing defaults for all object fields (Mar 2026).
- [x] **Toast ID collision**: Replaced `Date.now()` with `crypto.randomUUID()` (Mar 2026).
- [x] **Case-sensitive bullet deduplication**: Normalized before dedup (Mar 2026).
- [x] **No max length on job description**: Added 25,000 character limit (Mar 2026).
- [x] **Suppressed linter in `useResumeEditor.ts`**: Fixed dep array with `onSaveRef` pattern (Mar 2026).
- [x] **Missing transcript data validation**: Implemented course filtering and title/credit validation (Apr 2026).

---

For a full history of completed features, see the [Changelog](../../CHANGELOG.md) and [Changelog Archive](../../CHANGELOG_ARCHIVE.md).

[Back to Roadmap](../../ROADMAP.md)
