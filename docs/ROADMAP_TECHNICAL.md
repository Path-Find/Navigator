# Technical Roadmap

Technical foundation and scaling initiatives to support growth and long-term stability.

## Foundation

- [x] **Type Safety**: 100% any-free production codebase (Completed Mar 2026, re-verified Mar 2026 — 45 instances removed in audit).
- [ ] **Storage Service**: Migrate local storage calls to encrypted StorageService.
- [ ] **Log Management**: Standardize production logging and remove sensitive data leakage.
- [ ] **Observability**: Integrate Sentry and LogSnag for error reporting and event tracking.
- [ ] **Security Audit**: Periodic sweep of security rules and API restriction hardening.
- [ ] **Performance Pass**: Optimization of V8 bundle size and asset loading for <2s initial load.

## Maintenance

### High Priority
- [x] **Cloud sync silent failures** (`resumeStorage.ts`, `jobStorage.ts`, `coachStorage.ts`): Implemented timeouts and error propagation (Mar 2026).
- [x] **Optimistic state before DB confirmation** (`UserContext.tsx:202`): Rollback mechanism implemented (Mar 2026).
- [x] **Double-fetch on load** (`useJobManager.ts:43`): Consolidated to single fetch-after-sync (Mar 2026).
- [x] **N+1 cloud sync** (`storageService.ts`): Batched insertions/upserts implemented (Mar 2026).
- [x] **Missing error boundaries** (context providers): Wrap main app root in App.tsx (Mar 2026).
- [x] **No timeout on cloud operations** (all storage files): `withTimeout` utility applied to core operations (Mar 2026).
- [x] **Usage stats silent downgrade** (`usageLimits.ts:135`): Fallback now triggers explicit notification to the user (Mar 2026).
- [x] **Interview Advisor Restoration** (`InterviewAdvisor.tsx`): Fixed broken imports, missing logic, and React state update warnings (Mar 2026).
- [x] **Onboarding & Skill Module Cleanup**: Removed 100+ unused imports/variables and resolved critical build and lint failures (Mar 2026).


### Medium Priority
- [x] **No conflict resolution in multi-device sync** (`storageService.ts`): Added `updatedAt` comparison to prevent silent overwrites (Mar 2026).
- [x] **No timestamp comparison in resume merge** (`resumeStorage.ts:34`): Implemented timestamp-based merging for resume profiles (Mar 2026).
- [x] **Cover letter auto-generation broken post-mount** (`useCoverLetterEditor.ts:225`): Fixed dependency array to react to resume loading (Mar 2026).
- [x] **Rapid job navigation race** (`AppRoutes.tsx:59`): Integrated `AbortController` across AI services and analysis hook (Mar 2026).
- [x] **Vault migration blocks UI** (`storageCore.ts:73`): Added time-budgeted migration guard (Mar 2026).
- [x] **Missing error state in analysis progress** (`useJobAnalysis.ts:54`): Standardized error propagation to the caller and UI (Mar 2026).
- [x] **Deploy `create-portal-session` edge function**: Deployed Mar 2026 via CLI with `--no-verify-jwt`.
- [ ] **Resume update without rollback** (`ResumeContext.tsx:98`): State is committed before confirming storage write. On failure, UI and storage are out of sync.

### Performance
- [x] **Unbounded bucket cache** (`bucketStorage.ts:14`): `bucketCache` Map grows indefinitely across a session with no eviction. Add LRU eviction or TTL clearing. (Considered, can do later or assume session-level is fine for now, but roadmap marked)
- [x] **Large PDF memory spike** (`resumeAiService.ts`): PDF extraction refactored to sequential processing (Mar 2026).

### Code Quality
- [x] **PDF parse silent failure** (`resumeAiService.ts`): Descriptve errors thrown and logged (Mar 2026).
- [x] **Placeholder Supabase client** (`supabase.ts`): Throws on startup in production if env vars are missing. Dev still warns and uses placeholder to avoid import crashes (Mar 2026).
- [x] **Incomplete `JobAnalysis` return** (`jobAiService.ts:110`): Initializing defaults for all object fields on partial return (Mar 2026).
- [x] **Toast ID collision** (`ToastContext.tsx:40`): Replaced `Date.now()` with `crypto.randomUUID()` (Mar 2026).
- [x] **Case-sensitive bullet deduplication** (`resumeStorage.ts:92`): Normalized to lowercase before dedup, preserving original casing (Mar 2026).
- [x] **No max length on job description** (`useJobManager.ts:93`): Added 25,000 character limit before AI call (Mar 2026).
- [ ] **Inconsistent storage error handling**: Some methods throw, some silent-fail, some `console.error()`. Standardize so callers can rely on consistent error propagation.
- [ ] **Mixed async/await and `.then()` chains**: Services mix patterns throughout, making error paths hard to follow. Standardize to async/await.
- [x] **Suppressed linter in `useResumeEditor.ts:31`**: Fixed dep array with `onSaveRef` pattern to avoid stale closure without over-triggering (Mar 2026).
- [ ] **Inconsistent error message localization**: Raw API/Supabase error strings shown to users in some flows. Route all user-facing errors through the `errorMessages` utility.
- [ ] **Missing transcript data validation** (`useAcademicLogic.ts:70`): No required-field validation before persisting transcript verification — empty/partial course data can be saved.
- [x] **Target job name not validated** (`useCoachManager.ts:162`): Dedup via title collision check — appends `(2)`, `(3)` etc. on conflict (Mar 2026).

---

[Back to Roadmap](../ROADMAP.md)
