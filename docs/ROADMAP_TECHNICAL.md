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
- [ ] **Missing error boundaries** (context providers): No error boundaries wrap async providers — unhandled rejections can crash the entire app silently.
- [x] **No timeout on cloud operations** (all storage files): `withTimeout` utility applied to core operations (Mar 2026).
- [ ] **Usage stats silent downgrade** (`usageLimits.ts:135`): If multiple stats queries fail, fallback silently downgrades a pro user to free-tier limits. Add explicit notification on fallback.

### Medium Priority
- [ ] **No conflict resolution in multi-device sync** (`storageService.ts`): Sync only checks job ID, not timestamp — diverged devices silently overwrite each other. Add `updatedAt` comparison.
- [ ] **No timestamp comparison in resume merge** (`resumeStorage.ts:34`): Cloud vs. local resume comparison checks data completeness but not recency — stale cloud data can overwrite fresh local edits.
- [ ] **Cover letter auto-generation broken post-mount** (`useCoverLetterEditor.ts:225`): Empty `useEffect` dep array (linter suppressed) means auto-generation never fires if `bestResume` loads after initial render.
- [ ] **Rapid job navigation race** (`AppRoutes.tsx:59`): Fast job switching can result in stale `activeJobId`. Add abort mechanism for in-flight loads.
- [ ] **Vault migration blocks UI** (`storageCore.ts:73`): `migrateVaultData()` iterates all localStorage inside `ensureInit()` with no timeout. Add timeout guard.
- [ ] **Missing error state in analysis progress** (`useJobAnalysis.ts:54`): If analysis fails mid-way, progress state clears but no error is exposed to the caller — UI gives no indication of failure.
- [ ] **Resume update without rollback** (`ResumeContext.tsx:98`): State is committed before confirming storage write. On failure, UI and storage are out of sync.

### Performance
- [ ] **Unbounded bucket cache** (`bucketStorage.ts:14`): `bucketCache` Map grows indefinitely across a session with no eviction. Add LRU eviction or TTL clearing.
- [ ] **Large PDF memory spike** (`resumeAiService.ts`): All PDF pages extracted in parallel via `Promise.all()` — a large PDF could overload memory. Process in batches instead.

### Code Quality
- [ ] **PDF parse silent failure** (`resumeAiService.ts`): Failed parses return `""` with no log or toast — user gets blank resume with no feedback.
- [ ] **Placeholder Supabase client** (`supabase.ts`): Missing env vars create a silent placeholder client. Should fail fast on startup.
- [ ] **Incomplete `JobAnalysis` return** (`jobAiService.ts:110`): Returns partial object when no resumes exist; missing fields crash downstream consumers.
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
