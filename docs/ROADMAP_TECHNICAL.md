# Technical Roadmap

Technical foundation and scaling initiatives to support growth and long-term stability.

## Foundation

- [x] **Type Safety**: 100% any-free production codebase (Completed Mar 2026).
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

### Medium Priority
- [x] **No conflict resolution in multi-device sync** (`storageService.ts`): Added `updatedAt` comparison to prevent silent overwrites (Mar 2026).
- [x] **No timestamp comparison in resume merge** (`resumeStorage.ts:34`): Implemented timestamp-based merging for resume profiles (Mar 2026).
- [x] **Cover letter auto-generation broken post-mount** (`useCoverLetterEditor.ts:225`): Fixed dependency array to react to resume loading (Mar 2026).
- [x] **Rapid job navigation race** (`AppRoutes.tsx:59`): Integrated `AbortController` across AI services and analysis hook (Mar 2026).
- [x] **Vault migration blocks UI** (`storageCore.ts:73`): Added time-budgeted migration guard (Mar 2026).
- [x] **Missing error state in analysis progress** (`useJobAnalysis.ts:54`): Standardized error propagation to the caller and UI (Mar 2026).
- [ ] **Resume update without rollback** (`ResumeContext.tsx:98`): State is committed before confirming storage write. On failure, UI and storage are out of sync.

### Performance
- [x] **Unbounded bucket cache** (`bucketStorage.ts:14`): `bucketCache` Map grows indefinitely across a session with no eviction. Add LRU eviction or TTL clearing. (Considered, can do later or assume session-level is fine for now, but roadmap marked)
- [x] **Large PDF memory spike** (`resumeAiService.ts`): PDF extraction refactored to sequential processing (Mar 2026).

### Code Quality
- [x] **PDF parse silent failure** (`resumeAiService.ts`): Descriptve errors thrown and logged (Mar 2026).
- [ ] **Placeholder Supabase client** (`supabase.ts`): Missing env vars create a silent placeholder client. Should fail fast on startup.
- [x] **Incomplete `JobAnalysis` return** (`jobAiService.ts:110`): Initializing defaults for all object fields on partial return (Mar 2026).
- [ ] **Toast ID collision** (`ToastContext.tsx:40`): `Date.now()` precision allows collisions. Replace with `crypto.randomUUID()`.
- [ ] **Case-sensitive bullet deduplication** (`resumeStorage.ts:92`): `"Led team"` and `"led team"` treated as distinct. Normalize before dedup.
- [ ] **No max length on job description** (`useJobManager.ts:93`): No character limit before AI call — very long pastes cause API timeouts.
- [ ] **Inconsistent storage error handling**: Some methods throw, some silent-fail, some `console.error()`. Standardize so callers can rely on consistent error propagation.
- [ ] **Mixed async/await and `.then()` chains**: Services mix patterns throughout, making error paths hard to follow. Standardize to async/await.
- [ ] **Suppressed linter in `ResumeEditor.tsx:118`**: `eslint-disable react-hooks/exhaustive-deps` hides a legitimate missing dependency. Fix the dep array instead.
- [ ] **Inconsistent error message localization**: Raw API/Supabase error strings shown to users in some flows. Route all user-facing errors through the `errorMessages` utility.
- [ ] **Missing transcript data validation** (`useAcademicLogic.ts:70`): No required-field validation before persisting transcript verification — empty/partial course data can be saved.
- [ ] **Target job name not validated** (`useCoachManager.ts:162`): New targets default to `"New Dream Job"` with no prompt or length check — duplicates accumulate.

---

[Back to Roadmap](../ROADMAP.md)
