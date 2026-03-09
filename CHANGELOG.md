# Changelog

All notable changes to this project will be documented in this file.

## [2.31.7] - 2026-03-08

### Added
- **Style Transformer**: Implemented the `RdStyleService` which distills user feedback into active instructions. These instructions are now "dark-wired" into the generation loop to automatically adjust AI output to the user's personal voice.
- **Semantic Trajectory Mapping**: Established the `RdEmbeddingService` using `text-embedding-004` to map professional experience into a 768-dimensional latent space. Implemented `RdTrajectoryService` to calculate the "Growth Vector" (semantic drift) between past profile versions and current target roles.
- **High-Fidelity Feedback Logs**: Integrated `RdFeedbackService` into the core generation and tailoring hooks. The engine now captures explicit picks (A/B testing), implicit edits, and real-world outcomes (Interview/Offer) to calibrate user-specific models.
- **Modeling Infrastructure**: Launched the `rd_user_embeddings` data store with `pgvector` support and implemented a secure, per-user R&D feature gating system (`isNextGenEnabled`).
- **Roadmap Visualization**: Introduced `docs/ROADMAP_NEXTGEN.md` to track the five levels of the Modeling Engine architecture.
- **The Distiller**: Successfully implemented the LLM-powered style distillation logic. The engine now dynamically fetches the 25 most recent "Sensory Signals" (A/B picks, manual edits) and routes them through a low-temperature `MODELING_DISTILLER` pass to generate a personalized 60-word "Style Guide" for AI generations.
- **R&D Calibration Dashboard**: Launched a hidden admin-only calibration interface in Settings to visualize and trigger Level 1 (Style) and Level 2 (Trajectory) modeling. Includes real-time signal density stats and a **Trajectory Projection UI** to visualize professional archetype shifts.
- **Invite-Only / Waitlist Pivot**: Transitioned to a premium "Invite-Only" model. New users and those looking to upgrade can now join a Waitlist (`WaitlistService`). Simplified all growth-gated messaging across the app for better optics.

### Changed
- **Abortable AI Services**: Integrated `AbortController` support across `aiCore`, `jobAiService`, and `useJobAnalysis`. Rapid navigation or switching jobs now correctly cancels stale in-flight AI requests, preventing race conditions and improving performance.
- **Conflict Resolution (Jobs & Resumes)**: Implemented `updatedAt` timestamps and comparison logic during cloud synchronization. The engine now uses these timestamps to ensure the most recent version of a job or resume is preserved across multi-device sessions.
- **N+1 Batch Sync**: Refactored the `Storage.syncLocalToCloud` engine to use batched insertions and upserts. Syncing local history to the cloud now takes a single round trip instead of 50+, significantly reducing write failures on flaky networks.
- **Cloud Sync Rollbacks**: Implemented an optimistic rollback mechanism in `UserContext`. Profile updates (Journey, TOS, NextGen toggle) now immediately reflect in the UI but automatically revert if the Supabase write fails, ensuring the UI never desyncs from the database.
- **PDF Extraction Optimization**: Refactored PDF text extraction to process pages sequentially rather than in parallel. This significantly reduces memory spikes and prevents browser crashes when handling large resume files.
- **Request Timeouts**: Introduced a global `withTimeout` utility in `promiseUtils.ts` and wrapped all critical storage operations (Jobs, Resumes, Skills, Coach). The app now accurately identifies and recovers from "Cloud Hanging" scenarios instead of staying in a permanent loading state.
- **Initial Hydration**: Consolidated the job manager's initial load to fire *after* the primary sync, eliminating the "Double Fetch" pattern and ensuring the dashboard correctly reflects cloud items on the first render.
- **Vault Migration Guard**: Added a 3-second execution budget to the `migrateVaultData` loop. This prevents the primary application thread from blocking for too long if a user has an extremely large amount of encrypted data to re-key.

### Fixed
- **Descriptive PDF Errors**: Upgraded extraction logic to throw and log descriptive errors for empty or corrupted PDFs, replacing the silent "empty string" fallback that caused confused AI responses.
- **Safe Analysis Fallbacks**: Standardized the `analyzeJobFit` return signature to provide safe default values when no resumes are present. Prevents "TypeError: undefined" crashes in Sidebar and Analysis components for new users.
- **Cloud Sync Resilience**: Updated `syncLocalToCloud` to correctly propagate task errors, ensuring that background sync failures are surfaced via toast notifications rather than failing silently.

### Documentation
- **Technical Roadmap**: Updated `docs/ROADMAP_TECHNICAL.md` to track recently completed stability initiatives and maintenance priorities.

## [2.31.6] - 2026-03-08

### Optimization
- **Job Analysis Pipeline**: Redesigned to use a single consolidated AI pass instead of sequential extraction and analysis steps. This cuts network overhead by 50% and eliminates the primary cause of "Analysis Timed Out" (504) errors.
- **High-Efficiency Junk Filtering**: Significantly beefed up the `preCleanJobText` logic to aggressively strip common website "noise" (Share buttons, Map pins, Navigation, Cookie banners). Average character counts for messy scrapes reduced from ~8,000 to ~2,500, ensuring faster and more reliable AI responses.

### Fixed
- **Timeout Misdiagnosis**: Updated `JobErrorState` to correctly identify and signal "Service Interruptions" for timeouts and busy signals, preventing them from being confused with "Incomplete Job Details" errors.
- **Scraping UX**: The URL field is now automatically cleared when scraping fails, allowing you to instantly paste the job description without manually deleting the failed URL.

## [2.31.5] - 2026-03-08

### Documentation
- **Feedback Roadmap**: Added `docs/ROADMAP_FEEDBACK.md` to consolidate the full feedback loop — cover letter quality ratings, usage tracking, outcome nudges, and a future email nudge system.
- **Roadmap Reorganisation**: Cleaned up cross-roadmap duplication and misplaced items. Localization, Networking Graph, Job Alert Inbox, and Proactive Nudges moved from Product to Platform. Match Feedback Loop moved from Product to Feedback. Cross-links added between dependent items.
- **Roadmap Headings**: Standardised headings in `ROADMAP_PRODUCT.md` (removed mixed priority/thematic labels, now uses Experience / Data & Export).
- **N+1 Sync Branch**: Noted `perf/fix-n-plus-1-sync` branch in Technical Roadmap — work started, conflicts with main need resolution before merging.

### Maintenance
- **Branch Cleanup**: Deleted 12 stale remote branches (merged Jules/Copilot/Dependabot/fix branches). Pruned 4 additional stale local refs.

## [2.31.4] - 2026-03-08

### Security
- **Transitive Dependency Governance**: Enforced secure versions for high-risk transitive dependencies across the root project and browser extension via `overrides`:
  - **Rollup Path Traversal**: Patched CVE-2026-27606 by forcing `rollup@>=4.59.0` in both root and extension.
  - **Minimatch ReDoS**: Resolved CVE-2026-27903 by forcing `minimatch@>=3.1.5` in the root project.
  - **esbuild Development Safety**: Resolved a moderate severity CORS vulnerability by forcing `esbuild@>=0.25.0` in the extension.
- **Improved HTML/URL Sanitization**: Addressed 18 high-priority code scanning alerts by implementing robust sanitization:
  - **Extension Security**: Refactored `stripHtml` to use `DOMParser` instead of `innerHTML` to prevent XSS.
  - **Edge Functions**: Upgraded HTML extraction in `scrape-jobs` with recursive tag removal to prevent filter bypasses.
  - **Banner Logic**: Hardened URL scheme checks in `NotificationBanner` to handle case-insensitivity and dangerous protocols (`data:`, `vbscript:`).
  - **Information Privacy**: Removed raw stack traces and internal error details from checkout session responses.
  - **Supply Chain Integrity**: Added Subresource Integrity (SRI) hashes to third-party scripts in `index.html`.

### Fixed
- **Data Loss — Fire-and-Forget Storage Writes**: All `Storage.updateJob()` calls in `useCoverLetterEditor.ts` and `JobDetail.tsx` were not awaited, meaning cover letter edits, context notes, status changes, and generated letters could be silently lost if the user navigated away before the write completed. All writes are now properly awaited with error toasts on failure.
- **Data Loss — FileReader Race Window**: `reader.readAsDataURL()` was called before `onload`/`onerror` handlers were attached in `ResumeContext.tsx`, `useCoachManager.ts`, and `useAcademicLogic.ts`. On fast reads, the load event could fire before the handler was set and be silently dropped. Fixed by moving the read call to after handlers are registered inside the Promise executor.
- **Silent Failure — getUserId Cache**: A failed `supabase.auth.getSession()` call would cache `undefined` for 30 seconds, silently breaking all cloud sync operations for that window. Added `.catch(() => undefined)` and reduced the TTL from 30s to 5s.
- **Silent Failure — Skill Interview Save**: `Storage.saveSkill()` in `SkillContext` had no error handling — a failed write would leave the skill appearing saved in the UI but not persisted. Now wrapped in try/catch with an error toast. Initial skills load also now surfaces failures.
- **Silent Failure — Coach Data Load**: If the initial load of role models or target jobs failed in `useCoachManager`, the error was only console-logged and the user saw an empty dashboard with no explanation. Now shows an error toast.
- **Silent Failure — Coach Mutations**: `handleToggleMilestone`, `handleDeleteRoleModel`, `handleEmulateRoleModel`, and `handleUpdateTargetJob` in `useCoachManager` had no error handling — storage failures were swallowed silently. All now wrapped in try/catch with error toasts.
- **Silent Failure — Initial Resume Load**: `Storage.getResumes()` in `ResumeContext` had no `.catch()`, leaving the user staring at an empty resume list with no indication of what went wrong.
- **Null Subscription Tier**: If `subscription_tier` was null in the Supabase `profiles` table, it was cast directly to `UserTier` with no fallback, potentially breaking feature gating. Now safely falls back to `'free'`.
- **NavigatorPro Feed Logic**: Resolved a bug where background job analysis incorrectly cached jobs as `'saved'` instead of `'feed'`, causing them to move from the feed to history prematurely.
- **UI Hydration Fixes**: Fixed invalid HTML nesting in `ResumeEditor.tsx` (replacing `<p>` with `<div>` for labels) to prevent React hydration mismatches.
- **Interview Advisor Stability**: Resolved a duplicate variable declaration and fixed missing dependencies in the `chatMessages` hook.
- **AI Core Errors**: Fixed `preserve-caught-error` violations in `aiCore.ts` to ensure original error context is preserved during re-throws.
- **Usage Stats Reliability**: Refactored `getUsageStats` to return errors instead of throwing, ensuring `Promise.allSettled` can properly collect all resolved stats even if one query fails.

### Changed
- **Background Analysis Hardening**: Added error handling and `try-catch` blocks to the background analysis loop in `NavigatorPro` to prevent silent failures during scraping or analysis.

### Infrastructure
- **Improved Test Mocks**: Upgraded Supabase mocks to support method chaining (`.update().eq()`), improving the reliability of unit tests.
- **Linting & Cleanup**: Removed unused `ResumeRow` import and other dead code identified during the stability sweep.

---

## Older Releases
Historical changes prior to version 2.21.0 can be found in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
