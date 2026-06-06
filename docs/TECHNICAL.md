# Technical

Technical foundation and scaling initiatives to support growth and long-term stability.

## Foundation

- [ ] **Storage Service**: Migrate local storage calls to encrypted StorageService.
- [ ] **Log Management**: Standardize production logging and remove sensitive data leakage.
- [ ] **Observability**: Integrate Sentry and LogSnag for error reporting and event tracking.
- [ ] **Security Audit**: Periodic sweep of security rules and API restriction hardening.
- [ ] **Performance Pass**: Optimization of V8 bundle size and asset loading for <2s initial load.

## Maintenance

- [ ] **Resume update without rollback** (`ResumeContext.tsx:98`): State is committed before confirming storage write. On failure, UI and storage are out of sync.
- [ ] **Inconsistent storage error handling**: Some methods throw, some silent-fail, some `console.error()`. Standardize so callers can rely on consistent error propagation.
- [ ] **Mixed async/await and `.then()` chains**: Services mix patterns throughout, making error paths hard to follow. Standardize to async/await.
- [ ] **Inconsistent error message localization**: Raw API/Supabase error strings shown to users in some flows. Route all user-facing errors through the `errorMessages` utility.

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

[Back to Roadmap](../ROADMAP.md)
