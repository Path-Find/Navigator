# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Professional Modeling Engine (R&D)
- **Phase 3: Personalized style Overrides**: Implemented the "Style Transformer" (`RdStyleService`) which distills user feedback into active instructions. These instructions are now "dark-wired" into the generation loop to automatically adjust AI output to the user's personal voice.
- **Phase 2: Semantic Trajectory Mapping**: Established the `RdEmbeddingService` using `text-embedding-004` to map professional experience into a 768-dimensional latent space. Every tailored resume block is now silently vectorized to build a persistent career trajectory map.
- **Phase 1: High-Fidelity Feedback Logs**: Integrated `RdFeedbackService` into the core generation and tailoring hooks. The engine now captures explicit picks (A/B testing), implicit edits, and real-world outcomes (Interview/Offer) to calibrate user-specific models.
- **Infrastructure**: Launched the `rd_user_embeddings` data store with `pgvector` support and implemented a secure, per-user R&D feature gating system (`isNextGenEnabled`).
- **Roadmap Visualization**: Introduced `docs/ROADMAP_NEXTGEN.md` to track the five levels of the Modeling Engine architecture.
- **The Distiller (Style Transformer)**: Successfully implemented the LLM-powered style distillation logic. The engine now dynamically fetches the 25 most recent "Sensory Signals" (A/B picks, manual edits) and routes them through a low-temperature `MODELING_DISTILLER` pass to generate a personalized 60-word "Style Guide" for AI generations.
- **R&D Calibration Dashboard**: Launched a hidden admin-only calibration interface in Settings to visualize and trigger the Style Distiller, allowing manual model recalibration and visibility into active style overrides.
- **Invite-Only Pivot**: Transitioned from a hard lockdown to an "Invite-Only" model. New users and those looking to upgrade can now join a Waitlist (`WaitlistService`). This improves growth optics while maintaining the necessary compute buffer for R&D.
- **Stability Pass — N+1 Batch Sync**: Refactored the `Storage.syncLocalToCloud` engine to use batched insertions and upserts. Syncing local history to the cloud now takes a single round trip instead of 50+, significantly reducing write failures on flaky networks.
- **Stability Pass — Cloud Rollbacks**: Implemented an optimistic rollback mechanism in `UserContext`. Profile updates (Journey, TOS, NextGen toggle) now immediately reflect in the UI but automatically revert if the Supabase write fails, ensuring the UI never desyncs from the database.
- **Stability Pass — Request Timeouts**: Introduced a global `withTimeout` utility in `promiseUtils.ts` and wrapped all critical storage operations (Jobs, Resumes, Skills, Coach). The app now accurately identifies and recovers from "Cloud Hanging" scenarios instead of staying in a permanent loading state.
- **Improved Initial Hydration**: Consolidated the job manager's initial load to fire *after* the primary sync, eliminating the "Double Fetch" pattern and ensuring the dashboard correctly reflects cloud items on the first render.

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


## [2.31.3] - 2026-03-07

### Security
- **Critical SQL Fixes (Supabase)**: Manually applied three essential security and integrity patches to the production database:
  - **Quota System Recovery**: Fixed a missing variable declaration (`v_email_verified`) in the `check_analysis_limit` function that caused silent runtime failures and blocked quota enforcement.
  - **Stripe Webhook Integrity**: Corrected the session role check in `protect_sensitive_profile_fields` (switching to `current_user`) to ensure the Stripe `service_role` can successfully update user subscription tiers.
  - **SQL Syntax Resolution**: Removed a duplicate `LANGUAGE` clause in the `redeem_invite_code` function that caused intermittent migration failures.

## [2.31.2] - 2026-03-06

### Changed
- **Personalized General Behavioral Questions**: The general interview practice mode now passes the candidate's resume to the AI. Questions are still phrased naturally (no forced references to specific employers), but the AI uses the background to calibrate which themes and seniority level to target.
- **Smarter "Think About" Suggestions**: Resume suggestion pills now surface 2 randomly chosen places the candidate has worked rather than random bullet points. Pill shows the organization name; hovering reveals the job title. Label updated to "You might want to think about..." to match the coaching intent.

## [2.31.1] - 2026-03-06

### Changed
- **AI Call Efficiency (Interview)**: Merged `analyzeInterviewResponse` and `generateFollowUp` into a single `analyzeAndFollowUp` call. Each interview answer now costs one round trip instead of two, reducing per-minute API rate pressure without changing token usage or output quality.
- **Token Reduction (Skill Suggestions)**: `suggestSkillsFromResumes` now strips internal metadata (IDs, visibility flags, suggested updates) before sending profile data to the AI. Only the fields the model actually needs are transmitted.
- **Feature Registry (`stage` field)**: Replaced the ad-hoc `isComingSoon` and `requiresAdmin` flags with a single `stage` field (`'admin' | 'beta' | 'public'`). Stage is optional and defaults to public — only features that aren't ready are explicitly tagged. Admin-stage features are hidden from all public-facing surfaces (features page, plans, homepage grid).

### Removed
- **`FILTER_HARD_SKILLS` prompt**: Removed unused prompt from `career.ts`. The behaviour it targeted (suppressing vague soft-skill suggestions) is already enforced by a strict rule in the main `GAP_ANALYSIS` prompt.

## [2.31.0] - 2026-03-06

### Added
- **Direct Manual Entry**: Introduced a "Paste manually" toggle on the job input screen, letting users bypass URL scraping and instantly paste descriptions.

### Changed
- **Automated Pre-cleaning & Resilience**: Upgraded the AI proxy to automatically strip website boilerplate ("navigation", "terms", etc.) from pasted text, drastically reducing "Not a job" extraction failures and timeout errors.
- **Streamlined Progress UX**: Refined loading labels into crisp single-word statuses (e.g., *Accessing*, *Cleaning*, *Matching*, *Thinking*).
- **Humanized Error Tone**: System errors now use personal language ("We're having trouble...") instead of technical phrasing.

### Fixed
- **Build & Static Analysis Failures**: Resolved unused variable `tsc` errors in `GapAnalysisSection` and `JobMatchInput` that were blocking deployments.
- **Misleading Timed-Out Errors**: Corrected an error routing bug where temporary AI service timeouts ("Proxy Error") were incorrectly displaying as "unreadable page format" scraping failures.
- **Data Persistence & Sync**: Squashed bugs involving missing Cloud sync URLs, auto-sync during manual retries, and schema alignment for the `location` field in the Supabase `jobs` table.
- **UI Flow Breaks**: Fixed a job analysis crash (`TypeError: undefined job`), prevented premature text clearing on failed analyses, raised toast visibility length to 6s, and fixed a history deletion bug that wrongly redirected users to the homepage path.

## [2.30.2] - 2026-03-06

### Fixed
- **Critical: Cross-Browser Job Sync**: Jobs were silently failing to save to Supabase, making them invisible when logging in from a different browser. Two root causes: (1) the `jobs` table was missing `resume_id`, `cover_letter`, `cover_letter_critique`, `fit_score`, and `location` columns, causing every INSERT to fail; (2) jobs created mid-analysis carried `status: 'analyzing'`, which violated the DB check constraint. Added a migration to add the missing columns and expand the constraint, and fixed `addJob`/`syncLocalToCloud` to map `'analyzing'` → `'saved'` on insert (corrected to the real status by `updateJob` when analysis completes).

## [2.30.1] - 2026-03-06

### Refactored
- **Cover Letter Editor Modularization**: Decoupled state and logic into a dedicated `useCoverLetterEditor` hook and extracted UI into modular sub-components (`CoverLetterHeader`, `ReviewCard`, etc.), significantly improving maintainability.
- **Job Detail Decoupling**: Fully refactored `JobDetail.tsx` to remove monolithic logic, replaced with specialized hooks (`useJobAnalysis`, `useResumeTailoring`, `useSummaryGeneration`).

### Fixed
- **Lint & Purity Fixes**: Resolved various `react-hooks/set-state-in-effect` and `react-hooks/purity` violations across several components.
- **Hook Execution Integrity**: Fixed a "Rules of Hooks" violation in `JobDetail.tsx` caused by an early return before hook definitions.
- **Cascading Render Prevention**: Decoupled state updates from effect bodies in `useJobAnalysis` and `CourseEditModal` using microtask delays to satisfy `react-hooks/set-state-in-effect`.
- **Regex Logic Cleanup**: Removed redundant escape characters in the `salaryParser` utility.
- **Static Analysis Fixes**: Resolved variable re-assignment warnings in `useAcademicLogic` and purged the remaining traces of the unused `WelcomeScreen` component.

## [2.30.0] - 2026-03-06

### Changed
- **`JobDetail` Modularization**: Completely overhauled `JobDetail.tsx` from a 1000+ line god component into a lean orchestrator backed by focused, testable units.
  - **Deleted `useJobDetailLogic`**: Replaced the monolithic hook with three purpose-built hooks — `useJobAnalysis` (match evaluation and progress tracking), `useResumeTailoring` (hyper-tailor and bulk-rewrite state), and `useSummaryGeneration` (async AI summary drafting).
  - **`jobUtils.ts`**: New `src/modules/job/utils/jobUtils.ts` centralizes shared logic — `copyResumeToClipboard` (extracted from 50+ inline lines), `getBestResume`, `getScoreLabel`, and `getScoreColorClasses`.
  - **Extracted sub-components**: `AnalysisTab`, `ResumeTab`, `MatchSidebar`, `ResumeSidebar`, `CoverLetterSidebar`, `CoverLetterTab`, `InterviewTab`, `JobPostTab`, `JobProcessingState`, `JobErrorState`, and `ProhibitionAlert` are now standalone files under `src/modules/job/components/`, each owning their own state and rendering logic. Eliminates a 15+ prop drilling chain.
- **`AppRoutes` Routing Cleanup**: Flattened the nested route structure. Public and protected routes are now declared at a consistent indentation level with clear `<ProtectedRoute>` and `<ProtectedRoute requireAdmin>` wrappers. Removes a layer of redundant nesting that made the route manifest hard to scan.
- **Global Page Width Reduction**: Reduced `max-w-7xl` to `max-w-6xl` across `HomePage`, `PlansPage`, `DetailLayout`, `AppRoutes` (nudge card), and related layout containers for improved readability on large screens. Consistent with the width standard established in 2.29.2.
- **Changelog Archive**: Migrated 1,000+ lines of historical release notes (prior to v2.21.0) to `CHANGELOG_ARCHIVE.md`.

### Fixed
- **Supabase Data Sync**: Resolved a critical data synchronization failure where jobs saved locally were not appearing in Supabase/Production.
  - **Schema Alignment**: Applied a final migration to add missing columns to `profiles` (`device_id`, `journey`, `accepted_tos_version`, etc.) and `jobs` (`job_title`, `source_type`, `fit_score`, `cover_letter`) to match recent app updates.
  - **Resiliency Patch (`jobStorage.ts`)**: `getJobs` now falls back to local data gracefully if Supabase returns a 400/schema error, instead of failing to load any jobs. Added a non-destructive self-healing merge: if a cloud job is missing `analysis` or has a truncated `description` that exists locally, it is repaired in the background via `updateJob`.
  - **Profile Fallback (`UserContext.tsx` + `usageLimits.ts`)**: If the full profile query fails (e.g. schema mismatch), a secondary query for `subscription_tier`, `is_admin`, and `is_tester` is attempted to prevent session crashes. `getUsageStats` now uses `Promise.allSettled` so a single failed table query cannot block the entire dashboard.
  - **Sync on Load**: `useJobManager` now runs `syncLocalToCloud` concurrently on mount and re-fetches jobs after sync completes, ensuring local history is pushed immediately on login.
- **Type Safety Pass**: Resolved multiple TypeScript issues in the `job` module — `UserTier` fallbacks, `ModalContext` prop mismatches, and unused imports (`motion`, `Card`, `FileText`, `Target`) left behind after the modularization pass.

## [2.29.1] - 2026-03-06

### Fixed
- **Orgs Navigation**: Clicking the Orgs stat on the Career home no longer silently fails. `career-orgs` was mapped to `/career` in `VIEW_TO_PATH`, the same path as the home view, so `setView` detected no URL change and never navigated. Added `CAREER_ORGS: '/career/orgs'` to `ROUTES` and updated the `PATH_TO_VIEW` and `VIEW_TO_PATH` entries in `navigation.ts` to use the dedicated path. The existing `CAREER_HOME + "/*"` wildcard route already covers `/career/orgs`, so no router change was needed.

## [2.29.0] - 2026-03-06

### Added
- **Salary Insights (Admin Preview)**: New `career-salary` view under the Career module. Groups a user's analyzed jobs by normalized canonical title and renders a salary range bar (low → average → high) for each role. The average marker is a weighted midpoint across all salary data points seen for that title. Range bars unlock at 10+ salary data points; roles below that threshold show the observed range and a count toward the threshold. Includes a filter/search bar to narrow roles. Gated to admin users while in development.
- **`salaryParser` Utility**: New `src/utils/salaryParser.ts` parses raw salary strings in any common format (`$80K–$120K`, `$80,000 - $120,000`, `$40/hour`, `Up to $90K`, etc.) into structured `{ min, max, midpoint }` numbers. Hourly rates are annualized at 2,080 hours/year. Includes a `formatSalary` helper that produces compact `$NNK` labels.
- **Roles Stat in Coach Home (Admin)**: Added a Roles counter to the CoachHero stats row showing the count of unique canonical titles across the user's job history. Visible to admins only. Clicking navigates to the Salary Insights view.
- **`LocalStorage` Utility**: New `src/utils/localStorage.ts` centralizes all non-Vault `localStorage` access behind a single typed `get`/`set`/`remove` interface. This is the single observation point for future encryption migration and cross-tab sync.
- **`Logger` Utility**: New `src/utils/logger.ts` provides a production-safe console wrapper. `Logger.log` and `Logger.debug` are no-ops in production builds; `Logger.warn` and `Logger.error` always pass through.
- **`STORAGE_KEYS` — New Keys**: Added `DEVICE_ID` (`nav_device_id`) and `ONBOARDING_STATE` (`onboarding_state`) to `STORAGE_KEYS`. Fixed a duplicate `PRIVACY_ACCEPTED` entry.

### Security
- **`check_analysis_limit` — Undeclared variable fix**: Added missing `v_email_verified BOOLEAN` declaration to the `DECLARE` block in `check_analysis_limit`. The variable was selected into but never declared, causing the function to fail at runtime. Because the client-side caller fails open on DB errors, this meant quota limits were not being enforced. ⚠️ *Requires Supabase SQL migration to take effect.*
- **`protect_sensitive_profile_fields` — Correct role check**: Replaced `current_setting('role')` with `current_user` in the trigger that guards `subscription_tier`, `is_admin`, and `is_tester` from user self-modification. `current_setting('role')` reads a GUC config parameter and does not reliably return the active session role; `current_user` is the correct PostgreSQL function. The previous check was effectively always false, meaning the Stripe webhook (service role) could not update subscription tiers. ⚠️ *Requires Supabase SQL migration to take effect.*
- **`redeem_invite_code` — Duplicate `LANGUAGE` clause removed**: Removed a duplicate `language plpgsql` declaration that caused a SQL syntax error, which could break schema migrations depending on the PostgreSQL version. ⚠️ *Requires Supabase SQL migration to take effect.*

### Performance
- **Bucket Round Trip Eliminated**: Replaced the sequential `ensureBucket` + `getBucket` calls in `analyzeJobFit` with a single `ensureAndGetBucket` that upserts and returns in one Supabase round trip. Saves ~200ms between the extraction and analysis AI steps on every job analysis.
- **Bucket In-Memory Cache**: Role guidelines (from `canonical_roles`) are now cached in a session-level `Map` in `bucketStorage.ts`. Repeat analyses of the same canonical role (e.g. multiple "Software Engineer" jobs) skip Supabase entirely.
- **`getUserId` Cache**: `getUserId()` is called by every storage operation. It now caches the session result for 30 seconds, eliminating repeated `supabase.auth.getSession()` reads. Cache is immediately invalidated on auth state changes (login/logout).
- **Parallel Mount Load**: Jobs and usage stats in `useJobManager` previously loaded in separate `useEffect`s. They now fire together in a single `Promise.all` on mount, cutting initial load time roughly in half.
- **Stripe + Recharts Chunked**: Added `vendor-charts` (recharts) and `vendor-stripe` (@stripe/react-stripe-js, @stripe/stripe-js) to Vite's `manualChunks`. These libraries (~400KB combined) now only download when the admin dashboard or plans page is visited, rather than on every initial load.
- **Inline Style Moved to CSS**: The `@keyframes theme-pulse`, `.animate-theme-pulse`, and `prefers-reduced-motion` rules were inline JSX strings in `AppLayout`, re-processed by React on every render. Moved to `index.css` where they are parsed once at load time.
- **Parallel Storage Writes**: All write operations across `jobStorage`, `coachStorage`, and `resumeStorage` now fire local (Vault/IndexedDB) and cloud (Supabase) writes simultaneously instead of sequentially. Cuts write latency roughly in half for logged-in users.
- **Parallel `getUsageStats` Queries**: The six sequential Supabase queries in `getUsageStats` now run as a single `Promise.all`. Reduces dashboard load time by ~5× on that call.
- **Parallel `syncLocalToCloud`**: All five sync sections (resumes, jobs, skills, role models, target jobs) now fetch cloud state and local data in one `Promise.all` and push changes concurrently.
- **Compact AI Prompt JSON**: `resumeAiService.stringifyProfile` no longer pretty-prints JSON with 2-space indentation when building prompts, reducing wasted tokens on every resume AI call.
- **Reduced Callback Re-creation**: `handleSaveFromFeed`, `handlePromoteFromFeed`, and `handleDeleteJob` in `useJobManager` no longer depend on the full `jobs` array. Introduced a `jobsRef` to read current jobs without triggering re-creation on every job state change.

### Changed
- **Gated Gaps List (`JobDetail`)**: Free-tier users now see only the first identified gap in full; remaining gaps are blurred with a "+N more — Unlock" button overlaid on top, opening the plans comparison. Paid users see the full list unchanged. Only activates when there are 2+ gaps — if there's just one, it's shown in full regardless of tier.
- **Score-Aware Upgrade Nudge (`JobDetail`)**: Added a contextual conversion prompt inside the match sidebar for free-tier users, shown after analysis completes. The message adapts to their score — strong matches (≥75%) are nudged toward resume tailoring, mid-range (50–74%) toward gap analysis, and low matches (<50%) toward skills gap closure. Tapping opens the plans comparison view. Does not render during analysis or for paid users.
- **Trial Counter (`UsageIndicator`)**: Rewrote the free-tier usage indicator on the job input page. Fixed a bug where it displayed `weekAnalyses` against a lifetime limit — now correctly uses `lifetimeAnalyses`. Copy updated from "N/3 weekly analyses used" to "Trial: N of 3 analyses used". At 2 of 3 used, the pill shifts to amber and copy flips to countdown framing: "1 trial analysis remaining."
- **Paywall Screen (`UpgradeModal`)**: Redesigned the upgrade view shown when the free trial limit is hit. "Limit Reached" replaced with "Trial Complete" to frame the moment as a milestone rather than a wall. Added a personalized stats card showing jobs analyzed and average match score, computed from the user's actual analyses and only shown when score data is available. Replaced the amber warning box with calm forward-facing copy. Average score is computed in `GlobalModals` from the `jobs` array and passed in via a new `averageScore` prop.
- **`interviewAiService` Added to AI Barrel**: Added `export * from './ai/interviewAiService'` to `geminiService.ts`. Updated `SkillInterviewPage.tsx` and `useInterview.ts` to import from `geminiService` instead of the direct path, consistent with all other AI services.
- **StorageService Migration**: Migrated all 25+ direct `localStorage.getItem/setItem/removeItem` calls in consumer files to go through `LocalStorage`. Affected files: `UserContext`, `GlobalUIContext`, `NavigatorPro`, `JobMatchInput`, `OnboardingPage`, `eventService`, `fingerprint`, `skillQuestionsService`, `useJobDetailLogic`, `storageService`.
- **Log Sanitation**: Removed the bare `console.log` in `aiCore.ts` (proxy debug noise). Replaced `console.log` in `storageCore.ts` (Vault migration trace), `resumeStorage.ts` (cloud sync debug), and `CoverLetterEditor.tsx` (AI decision trace) with `Logger.log` — dev-only, silent in production.
- **Removed Redundant Suspense**: `AppRoutes` had an outer `<Suspense>` wrapping all routes that was never triggered, since each individual route has its own `<Suspense>`. Removed the unused wrapper.
- **Storage Key Constants**: Added `USER_JOURNEY`, `LAST_ARCHETYPE_UPDATE`, `ACCEPTED_TOS_VERSION`, `DISMISSED_NOTICES`, and `PRIVACY_ACCEPTED` to `STORAGE_KEYS` in `constants.ts`. `UserContext` now references these instead of raw strings.
- **Nudge Threshold Constant**: Extracted `7 * 24 * 60 * 60 * 1000` magic number in nudge logic to `TIME_PERIODS.APPLIED_NUDGE_THRESHOLD_MS`.
- **`PlanLimitValues` Type**: Replaced `(limits as any).WEEKLY_ANALYSES` casts in `usageLimits.ts` with a proper `PlanLimitValues` intersection type. `||` fallbacks for nullish limit values replaced with `??`.
- **`encryptionService.decrypt`**: Replaced `split('').map(c => c.charCodeAt(0))` with `Uint8Array.from()` for consistency with the `encrypt` method.
- **`handleImportResume` Deps**: Removed unused `showSuccess` from the `useCallback` dependency array in `ResumeContext`.

### Fixed
- **`JobMatchInput` input type**: Changed `type="url"` to `type="text"` on the primary job input. The field accepts both URLs and raw pasted job descriptions, making `url` incorrect and causing browser validation errors on plain-text input.
- **Vault Init Race Condition**: Concurrent `Vault.getSecure` calls on mount could each independently call `encryptionService.init()` before the first completed. Initialization is now guarded by a shared promise so concurrent callers await the same work.
- **`submitFeedback` Fire-and-Forget**: `supabase.from('feedback').insert()` was not awaited, silently swallowing errors. Now properly awaited.
- **`callWithRetry` Backoff Ignored Constant**: Retry delay multiplier was hardcoded as `* 2` instead of using `API_CONFIG.RETRY_BACKOFF_MULTIPLIER`. Now consistent with the constant.

### Removed
- **BENTO Compat Layer**: Removed the deprecated `BENTO_CARDS_COMPAT`, `BENTO_CATEGORIES_COMPAT`, and `BENTO_RANKINGS_COMPAT` exports from `featureRegistry.ts`, and their corresponding re-exports (`BENTO_CARDS`, `BENTO_CATEGORIES`, `BENTO_RANKINGS`, `BentoCardConfig`) from `constants.ts`. Migration to `FEATURE_REGISTRY` is complete; no active code consumed these aliases. Removed the now-dead `BENTO_CATEGORIES` test from `constants.test.ts`.
- **Duplicate `adminService.ts`**: Deleted `src/modules/admin/services/adminService.ts`, which was byte-for-byte identical to `src/services/adminService.ts` and was never imported anywhere. Its empty parent directory was also removed.
- **`isTargetMode` removed from `JobMatchInput`**: Target/dream job mode belonged to the Career section, not the Job section. The job input page is for applying to jobs. Removed the mode state, all conditional logic branching on it, the `useCoachContext` import, the `TrendingUp` icon, and the hardcoded `mode` constant. The Career Coach section manages target jobs independently.
- **`showResumePrompt` dead code**: Removed unreachable resume upload modal from `JobMatchInput`. The state and JSX block existed but `setShowResumePrompt(true)` was never called anywhere. Also cleaned up the imports (`X`, `DropZone`) and destructured context values (`onImportResume`, `isParsing`, `importError`) that were only used by this modal.
- **`WelcomeScreen` component**: Deleted unused modal-based onboarding flow (`WelcomeScreen.tsx`). This was the original overlay version of onboarding and has been superseded by the route-based `OnboardingPage`. It was not imported anywhere in the codebase.

## [2.28.0] - 2026-03-05

### Added
- **Professional Organizations Tracker**: New `career-orgs` view under the Career module. Track professional associations, networks, and communities you belong to. Pre-populated suggestions for planning, transit, engineering, and business orgs (CIP, OPPI, YPT, ITE, CUTA, ULI, etc.). Supports search/filter, custom entries via keyboard, and persists to localStorage.
- **Orgs Stat in Coach Home**: Added an Organizations counter to the CoachHero stats row alongside Profiles, Goals, and Skills. Clicking navigates to the new orgs view.
- **Feature Registry — ORGS**: Registered `ORGS` in `featureRegistry.ts` (category: COACH, tier: explorer, `isComingSoon: true`).

### Changed
- **Feed Source Types**: Removed TTC/Toronto-specific hardcoding from `JobFeedItem.source`. Changed from `'ttc' | 'toronto' | 'other' | 'email'` to `'scraped' | 'other' | 'email'`. Updated `ScraperService.getFeed()` to return `[]` (removing the hardcoded TTC scraper) and fixed `NavigatorPro` feed card to derive the logo letter from company name instead of hardcoding 'T'.
- **Navigation**: Added `career-orgs` to `ViewId` and `VIEW_TO_PATH` in `navigation.ts`.

## [2.27.0] - 2026-03-05

### Fixed
- **Job Detail Evaluation Retry**: Resolved an issue where manually editing an incomplete job description and clicking "Evaluate Match" failed to trigger the analysis state transition due to a missing state update (`onUpdateJob`).

### Changed
- **Honest UI Statuses**: Replaced misleading "Analyzing" and "Processing" status labels across the application (Application History, Job Detail, Feed) with precise terms like "Saving...", or removed them entirely when the system is actually just blocked waiting for user input. This prevents the UI from falsely claiming deep AI work is happening.
- **Type Safety — `any` Elimination**: Systematically replaced all instances of the `any` type across 20+ files with specific, narrowed types:
  - `FeatureDefinition.targetView` upgraded from `string` to `ViewId`, propagating type-safe navigation through `FeatureGrid`, `HomePage`, and `JobMatchInput`.
  - `CoachContext` types (`transcript`, `resumes`, `skills`, `setTranscript`) replaced with proper `Transcript`, `ResumeProfile[]`, `CustomSkill[]` imports.
  - `StatsCard.icon` in `AdminDashboard` replaced with `React.ElementType`; simulation tier array typed with `UserTier`.
  - `CoverLetterEditor` — eliminated 5 `as any` casts via a `CoverLetterCritique` type guard.
  - `InterviewAdvisor.handleBankSuggestion` — cast `suggestion.type` to the correct `'add' | 'update' | 'remove'` union literal.
  - `SimpleCard` props in `Privacy.tsx` and `Terms.tsx` replaced with typed interfaces.
  - `ResumeEditor` — `interval` typed as `ReturnType<typeof setInterval>`, `handleApplySuggestion` given `{ id, type, suggestion }` shape.
  - `SkillExtractor.result.map` callback typed correctly against `CustomSkill[]` return.
  - `ProgramExplorerPage.onSelect` callback typed with `{ institution: string; name: string }`.
- **Error Handling Standardization**: Replaced all `catch (err: any)` / `catch (error: any)` clauses with `catch (err: unknown)` + `instanceof Error` narrowing across `useInterview.ts`, `useAcademicLogic.ts`, `MAEligibility.tsx`, `PlansOnboardingStep.tsx`, and `PlansPage.tsx`.
- **FeatureRegistry Navigation Fix**: Corrected `targetView` for COACH and ROLE_MODELS features from invalid `'career-home'` to the correct `'coach-home'` ViewId.

## [2.26.0] - 2026-03-04

### Security
- **Gemini API Key Rotation**: Successfully rotated the Gemini API key in Google Cloud (Navigator project) to mitigate potential exposure.
- **API Restriction Enforcement**: Strictly restricted the new API key to the `Generative Language API` only, preventing unauthorized use across other Google Cloud services.
- **Supabase Secret Synchronization**: Updated the `GEMINI_API_KEY` in Supabase Edge Function secrets to ensure seamless and secure proxying.

## [2.25.0] - 2026-03-04

### Added
- **Interview Session Accessibility**: Increased the monthly interview limit for the Free tier to 1, allowing users to test the Interview Advisor before upgrading.
- **Fail-Safe Session Launch**: Added explicit error feedback and toast notifications in the Interview Advisor when attempting to start a tailored mock without a selected job.

### Changed
- **Platform-Wide Aesthetic Refinement**:
  - Executed a comprehensive removal of all-cap typography (`uppercase tracking-widest`) across the Job Detail, Cover Letter Editor, Interview Advisor, History, and BentoCard modules for a cleaner, modern professional look.
  - Standardized metadata labels, status badges, and action buttons to use standard Title Case or Sentence Case.
- **UI Layout & Overlap Optimization**:
  - Refactored `BentoCard` layout architecture to use dynamic flex-grow heights instead of fixed constraints, resolving UI overlap issues in the Interview Advisor job selection flow.
  - Improved vertical alignment and spacing in the Activity History list.
- **Natural Language Polish**:
  - Refined AI-heavy wording throughout the Cover Letter Editor to be more organic and practitioner-focused (e.g., "Create a personalized, story-driven cover letter" vs. "Generate an organic, narrative-driven...").
  - Simplified action labels and removed redundant "AI-tailored" annotations to declutter the interface.
- **Content Width Refinement**: Narrowed page max-widths platform-wide (from `7xl` to `5xl`/`6xl`) for improved readability and a more focused layout on large screens. The URL input bar on the Jobs page was further tightened to `3xl`.

### Fixed
- **Security – Plan Limit Enforcement**: All AI feature tier restrictions were previously enforced client-side only. Server-side gating now blocks free users from cover letter and resume tailoring features, and blocks non-Pro users from gap analysis, roadmap, and role model features — enforced in the Gemini proxy Edge Function.
- **Security – Interview Cap Server-Side**: Monthly interview limits for Plus (2) and Pro (5) are now counted and enforced by the proxy. The proxy also writes its own log entry after each successful interview call, making the count tamper-resistant.
- **Security – Role Model Limit Was Dead Code**: `checkRoleModelLimit` was defined but never called. It now runs before a role model is added, with a user-facing error message on breach.
- **Security – Plan Limit Constants Mismatch**: `PLAN_LIMITS` constants and the `check_analysis_limit` SQL function were out of sync (Plus showed 100/week but enforced 200; Pro showed 350/week but enforced 500/day). Both now consistently reflect Plus = 200/week and Pro = 100/day. Includes a migration file to deploy the SQL correction.
- **Crash – Onboarding Race Condition**: `setTimeout` callback accessed `resumes[resumes.length - 1].blocks` without guarding against an empty array, causing a runtime crash if the resume list changed before the timer fired.
- **Crash – File Reader Null Dereference**: `reader.result.split(',')` in `ResumeContext` and `useCoachManager` could crash if the FileReader returned null or an unexpected format. Now guarded with an explicit null/format check.
- **Crash – `bestResume` Undefined**: `useJobDetailLogic` returned `resumes[0]` as `bestResume` without checking if the array was empty, causing downstream crashes on `bestResume.blocks` for new users.
- **Crash – Empty Proxy Response**: `aiCore` assumed `data.text` was always present. An unexpected proxy response (no `text` field) now throws a descriptive error instead of silently passing `undefined` into JSON parsers.
- **Crash – Feed Cache JSON.parse**: `NavigatorPro` called `JSON.parse(cachedData)` without a try-catch. Corrupted cache now clears itself and falls through to a fresh fetch. Also fixed `parseInt(cachedTimestamp)` which could return `NaN`, breaking cache age logic.
- **Crash – `useCoachManager` Promise.all**: Missing `.catch()` on `Promise.all([getRoleModels, getTargetJobs])` left the UI stuck in a permanent loading state if either storage call failed.
- **Reliability – Stale Usage Stats**: `getUsageStats` in `useJobManager` had no mounted flag, causing stale `setState` calls after the user changed or the component unmounted.
- **Reliability – Feed Cache Not Invalidated**: The job feed cache was never cleared when a job was saved or promoted, so users kept seeing already-processed jobs in the feed until the 24-hour TTL expired.
- **Reliability – Resume Bullet Stale Closure**: `addBullet` in `ResumeEditor` used a stale `blocks` reference instead of a functional updater, causing rapid clicks to merge bullets instead of appending them.
- **Reliability – Silent Supabase Mutations**: All four Supabase mutations in `coachStorage` (`insert`, `delete` ×2, `upsert`) swallowed errors silently. Cloud sync failures are now logged.
- **Data – Onboarding State Lost Across Tabs**: Onboarding progress was stored in `sessionStorage` (per-tab), causing state loss if the user opened a second tab or followed a Stripe redirect in a new tab. Switched to `localStorage` and the key is cleared on completion.
- **Auth – Unhandled Promise Rejections in UserContext**: `getSession()` and `getDeviceFingerprint()` chains had no `.catch()` handlers, leaving the app in an inconsistent auth state on network failure.
- **Job Detail Stability**: Resolved a JSX structural error in the Experience section that was causing layout breakages.
- **Interview Advisor Dependencies**: Fixed a missing context import (`useToast`) that caused session errors during failure states.

### Security
- **Gemini API Key Exposure**: Removed `VITE_GEMINI_API_KEY` build-time environment variable that was embedding the Gemini API key into the client-side JavaScript bundle. All AI requests now route exclusively through the server-side Supabase Edge Function proxy, keeping the API key out of the browser entirely.

## [2.23.0] - 2026-02-28

### Added
- **Prompt Evolution Tracker**: Established a dedicated tracking system (`PROMPTS_EVOLUTION.md`) for core AI prompt changes to maintain long-term architectural visibility.

### Changed
- **High-Fidelity Cover Letters**: Overhauled the cover letter generation engine to move from simple job-by-job mapping to a cohesive thematic synthesis. Implemented "Functional Connections" to eliminate robotic transitions and added category-aware metric handling (literal stats for technical roles, narrative impact for others).
- **Prompt Architecture**: Removed deprecated `analysis.ts` monolithic export wrapper and transitioned all domain AI services to consume modular prompt files directly.

## [2.22.0] - 2026-02-27

### Added
- **Browser Extension (v2.22.0)**: Officially launched the Navigator browser extension with a smart extraction engine (parsing `json-ld`, Open Graph metadata, and DOM heuristics) to instantly capture structured job data (title, company, location, salary, description) with one click. Replaces the legacy bookmarklet.
- **Premium Extension UI**: Initial release featuring a high-fidelity glassmorphic interface with a 3-state flow (Login -> Ready/Preview -> Saved) and instant extraction confidence feedback.

### Changed
- **Bookmarklet Deprecation**: Replaced the fragile JavaScript bookmarklet flow with the new Browser Extension. Updated all related notifications, tips, feature registry entries, and UI previews from "Bookmarklet" to "Browser Extension".

### Fixed
- **SEO & Metadata**: Removed hardcoded `navigator.career` references across the application. Generalized site URL logic in the `SEO` component and `index.html` to use dynamic origins and relative paths.
- **Cleanup**: Removed legacy `robots.txt` and `sitemap.xml` files that were hardcoded to an incorrect domain.

## [2.21.5] - 2026-02-25

### Added
- **Global Drag-and-Drop Overlay**: Implemented a platform-wide, high-fidelity drag-and-drop overlay for instant resume and transcript analysis.
- **Education Dashboard Analytics**: Introduced a new `EducationStats` bento-card suite for real-time tracking of GPA, credit progress, and academic targets.
- **Layout Expansion**: Standardized global maximum width to `7xl` across all core modules (Job Match, Feed, History, Resume Editor, Education HQ, and Settings) for a more expansive and immersive professional interface.

### Changed
- **Visual Design Parity**:
  - Harmonized horizontal padding and vertical baselines across every major view, ensuring a unified vertical line for all page headers and content blocks.
  - Updated `SkillsView` and `CoachDashboard` to support the new `7xl` width standard with improved spacing.
  - Expanded ambient background glows in the Coach module with wider blur radiuses for a more atmospheric depth.
- **Bento Card Evolution**: Removed `overflow-hidden` constraints from `BentoCard` to allow soft shadows and ambient glows to bleed naturally, eliminating hard "boxy" edges.

### Fixed
- **System Stability**: Resolved a critical issue causing 40%+ CPU spikes and intensive fan usage, primarily driven by massive system file synchronization and lingering browser processes.
- **UI Clipping**: Fixed several layout bugs where high-fidelity background animations were being clipped by restrictive container boundaries.
- **Code Clean-up**: Resolved persistent linting errors in the Cover Letters and Resume Editor modules by purging unused imports and variables.

## [2.21.0] - 2026-02-24

### Added
- **Resume Preview Modal**: Introduced a high-fidelity modal for instant, print-ready resume visualization within the editor.
- **Interactive Skill Discovery**: Enabled one-click saving of AI-discovered keywords directly to the global database from the resume sidebar.
- **Manual Achievement Control**: Added manual controls for achievement bullet reordering via interactive move buttons on hover.

### Changed
- **Context-Aware URL Navigation**: Integrated the browser URL as the single source of truth. The UI now contextually derives its state from the path, ensuring perfect synchronization and eliminating redundant state management.
- **Autonomous Component Architecture**: Refactored core views (`Header`, `HomePage`, `JobMatchInput`, `JobDetail`, `CoachDashboard`, etc.) to directly consume dependencies from specialized Context hooks, completely eliminating massive amounts of prop drilling across the application shell.
- **Clean Routing Manifest**: Simplified `AppRoutes.tsx` into a lean, declarative manifest, decoupling business logic from the routing layer.
- **Premium Graphic Identity**: Launched a massive visual upgrade for Skills Bento cards. Replaced repetitive circular motifs with high-fidelity graphics featuring 3D orbiting particles, scanning pulse animations, and "Diamond/Prism" glass aesthetics.
- **3D Glassmorphic Depth**: Implemented a stacked glass tile architecture for skill previews, featuring translucent layered depth, background blurs, and dynamic hover-driven rotation.
- **Platform-Wide Design Standardization**:
  - Unified vertical baselines and "Segmented Control" aesthetics for filters and search bars (standardized to 40px height) across the entire platform.
  - Implemented a comprehensive removal of aggressive all-caps/uppercase styling in favor of a modern, professional sentence-case aesthetic.
  - Standardized global rounding to `rounded-2xl` for interactive elements and implemented high-contrast `font-black` typography for primary buttons.
  - Executed a comprehensive scaling and alignment pass on all dashboard graphics to ensure professional visual hierarchy.
- **Unified Skill Indicators**: Reimagined the verification system into a single intuitive indicator. Verified skills now use emerald/orange checkmarks, while non-verified skills use proficiency dots.
- **Text Extraction High-Fidelity**: Upgraded the PDF extraction engine to proactively clean whitespace and resolve character artifacts (splitting ligatures like "fi", "fl", "ti") before AI processing.
- **Seamless Authentication**: Overhauled the login experience into a fluid "one-flow" model using intelligent email detection to route users automatically, removing redundant manual toggles between signing in and signing up.
- **Education Module Refinement**: Reverted nomenclature back to standard terms (**Programs** and **Transcript**) and improved the program exploration UX with an expanded discovery container.
- **Resume Editor Streamlining**: Optimized the editor by removing redundant metrics (Strength Score, Pro-Tips, status badges) to prioritize a high-density, document-first writing experience.

### Fixed
- **React Stability**: Resolved "Rules of Hooks" violations in `ProtectedRoute` and fixed critical JSX syntax errors and hook initialization issues in the Resume Editor.
- **UI Logic Fixes**: Corrected cursor behavior on interactive elements, resolved scroll-jitter in the header, fixed card dropdown clipping, and restored missing iconography to status filters.
- **Data Integrity**: Resolved a "data loss" edge case by implementing latest-first recovery for resume records and fixed a malformed `user_skills` database schema.

---

## Older Releases
Historical changes prior to version 2.21.0 can be found in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
