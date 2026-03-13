# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.31.12] - 2026-03-13

### Optimization
- **Module-Based Route Splitting**: Implemented a coarse-grained lazy loading architecture by clustering routes into `JobModule`, `ResumeModule`, `CareerModule`, and `EducationModule`. This significantly reduces the initial application bundle by deferring the loading of module-specific providers, components, and heavy dependencies until they are actually navigated to.
- **Granular Feature Preview Loading**: Refactored the `FeaturePreviews` component to split ~20 SVG-heavy preview components into standalone, lazily-loaded chunks. This strips over 300KB of unused SVG path data from the initial homepage payload.
- **Mobile Animation Tuning**: Enforced "Static Mode" for `BentoCard` components on touch-enabled devices. Disables expensive 3D perspective calculations and mouse-follow listeners on mobile to ensure fluid scrolling and reduced CPU heat.
- **Provider Strategy**: Refined the provider architecture by deferring auxiliary providers (Coach, Education) to lazy-loaded modules while maintaining core providers (Jobs, Resumes, Skills) at the root for global stability and modal availability.
- **Vite Build Orchestration**: Removed rigid manual chunking configurations to allow for more efficient automatic tree-shaking and cross-module deduplication.
- **Parallel Boot Sequence**: Parallelized asynchronous initialization steps in `UserContext`, allowing the application shell to render significantly faster while user profiles and settings load in the background.
- **Lazy-Loaded PDF Processing**: Transitioned `pdf.js` to a dynamic loading model. The ~500KB library is now only fetched when a user performs a PDF resume parse, reducing the initial application bundle size and improving "Time to Interactive" on mobile devices.

### Security
- **Lazy Migration Support**: Implemented a "Lazy Migration" path in the encryption vault. Individual data items are now automatically upgraded to the hardened 600k-iteration PBKDF2 standard upon first read, preventing data loss if the global boot-time migration is interrupted by timeouts or browser caps.
- **Decryption Safeguards**: Hardened all storage modules (Jobs, Resumes, Skills, Coach) with decryption error guards. The system now explicitly detects unreadable vault data and aborts any merge or update operations that would otherwise lead to accidental data deletion.
- **Improved Migration Budgeting**: Refined the `migrateVaultData` logic to only mark global migration as complete if the entire batch finishes successfully.

### Fixed
- **Environment Parity**: Restored the missing `.env` configuration to the `v2/` directory to resolve the "Configuration Required" block.
- **Global Context Stability**: Resolved "useContext must be used within a Provider" crashes by ensuring core context providers (Jobs, Resumes, Skills) are available at the application root for global UI components.

### Added
- **Billing Portal**: Implemented `create-portal-session` Supabase Edge Function and `paymentService.getPortalUrl()` to support Stripe billing portal access.
- **User Preferences Context**: Split `UserContext` into `UserContext` (auth/profile/tier) and `UserPreferencesContext` (journey, notices, TOS version, archetype timestamp) for better separation of concerns.

### Fixed
- **Toast ID Collision**: Replaced `Date.now()`-based toast IDs with `crypto.randomUUID()` to eliminate rare collision cases.
- **Case-Sensitive Bullet Deduplication**: Resume bullet points are now normalized to lowercase before deduplication, preventing `"Led team"` and `"led team"` from being stored as duplicates.
- **Job Description Length**: Added a 25,000-character limit on job descriptions before AI analysis to prevent API timeouts on very long pastes.
- **Lazy Chunk Reload Guard**: Replaced boolean sessionStorage flag with a timestamp-based TTL (30s) so the reload guard expires correctly and later chunk failures can still trigger a retry.
- **Sync Partial Failures**: Replaced `Promise.all` with `Promise.allSettled` in cloud sync so individual failures are logged without aborting other sync tasks.
- **Vault Migration Logging**: Silent catch block in vault migration now logs skipped keys at debug level for easier diagnostics.
- **Fingerprint Promise Chain**: Added missing `.catch()` handlers to the nested device fingerprint update promise chain in `UserContext`.

### Code Quality
- **Type Safety**: Eliminated all remaining `as any` assertions from production code (45 instances across 8 files). Introduced `ProfileRow` interface, `PdfjsLib` global type declaration, and properly typed nav group arrays.
- **Duplicate Files**: Removed 112 macOS Finder-created duplicate files (`* 2.*`) from source, docs, and node_modules.
- **eslint-disable Removed**: Fixed `useResumeEditor.ts` dep array using a `useRef` pattern for `onSave` instead of suppressing the exhaustive-deps rule.
- **Storage Type Safety**: Replaced `any[]` generic type parameters in `storageService.ts` `syncLocalToCloud` with concrete types (`CustomSkill[]`, `RoleModelProfile[]`, `TargetJob[]`).
- **Consistent Cloud Error Handling**: Standardized cloud write error handling across all storage modules. Single-item write operations (`addJob`, `updateJob`, `deleteJob`, `addRoleModel`, `deleteRoleModel`, `saveTargetJob`, `deleteTargetJob`) now log cloud failures instead of throwing, reflecting that local writes already succeeded. Error messages use a uniform `'Cloud Sync Error (<Operation>):'` prefix.
- **Async/Await Consistency**: Eliminated mixed `.then()`/`async-await` patterns in `jobStorage.ts` (`deleteJob`), `resumeStorage.ts` (`addResume`), and `useCoachManager.ts` (initial data load). All async flows now use `async/await` with IIFE wrappers in `useEffect`.
- **Transcript Validation**: Added required-field guard to `handleVerificationSave` in `useAcademicLogic.ts`. Transcripts with no semesters now surface an error toast instead of saving an empty record.
- **Target Job Title Derivation**: `handleTargetJobCreated` in `useCoachManager.ts` now extracts a title from the first non-empty line of the job description (capped at 60 characters) or falls back to the URL hostname. Eliminates accumulation of duplicate `'New Dream Job'` entries.
- **ResumeEditor Decomposition**: Extracted the 837-LOC `ResumeEditor.tsx` into four focused files — `constants.tsx` (section definitions, sort/color helpers), `useSkillDiscovery.ts` (memoized skill detection hook), `ResumeSectionEditor.tsx` (per-block card), and `ResumeDiscoverySidebar.tsx` (right-hand discovery panel). Core component reduced to ~280 LOC.
- **Remaining `any` Elimination**: Replaced all `any` types in `useResumeEditor.ts`, `extractor.ts` (extension), `InterviewSessionScreen.tsx`, and `InterviewSelection.tsx` with proper interfaces (`ResumeProfile`, `ResumeSuggestion`, `InterviewQuestion`, `InterviewResponseAnalysis`, `SavedJob`, local JSON-LD types).
- **Test Infrastructure**: Added `window.matchMedia` mock and `crypto.randomUUID` polyfill to the Vitest setup file to resolve JSDOM environment gaps. Expanded test coverage with 14 new cases across `ResumeEditor` (block editing, sidebar, preview modal) and 4 new cases in `History` (status filtering, delete, View Analysis). Eliminated all `as any` casts from test mock helpers.
- **Lint Cleanup Pass**: Reduced lint warnings from 156 to 85 (0 errors). Purged 185 additional macOS duplicate files (`* 2.*`/`* 3.*`). Silenced `react-refresh/only-export-components` for intentional context co-location. Fixed `react-hooks/set-state-in-effect` error in `useResumeEditor.ts` using `useRef`-gated render-time sync. Added `caughtErrorsIgnorePattern` for `_`-prefixed catch variables. Resolved all remaining `no-unused-vars` and `exhaustive-deps` warnings across hooks (`useResumeTailoring`, `useJobManager`, `useCoverLetterEditor`, `useAcademicLogic`, `useJobAnalysis`, `JobMatchInput`, `SkillInterviewPage`).
- **Job Manager Decomposition**: Refactored `useJobManager` into smaller, focused helpers. Extracted nudge logic into `useApplicationNudge`, consolidated initial load into `loadInitialJobsAndUsage`, and centralized usage-limit handling in `useUsageLimits` to improve readability and reduce duplication.
- **Job Analysis Hook Hardening**: Simplified `useJobAnalysis` by extracting `createAbortController`, `loadTranscriptFromCache`, and `buildTrajectoryContext` helpers. Improved abort handling and error reporting while preserving existing NextGen trajectory and transcript behavior.
- **Job & Interview Utility Safety**: Hardened job utilities with stricter typing and safer fallbacks. `copyResumeToClipboard` now returns a boolean success flag and guards against missing clipboard APIs, while `computeSnippets` and `handleBankSuggestion` in `interviewUtils.ts` use typed suggestion kinds and deterministic random sampling without relying on array sort side effects.
- **Resume Parsing & Preview Components**: Extracted the resume parsing screen, preview modal, and print-specific styles from `ResumeEditor.tsx` into focused components (`ResumeParsingScreen`, `ResumePreviewModal`, `ResumePrintStyles`) for clearer separation of concerns and easier future changes.
- **Coach Role Model Upload Hook**: Moved role model upload state and side effects out of `CoachDashboard.tsx` into a dedicated `useRoleModelUpload` hook, keeping the dashboard component focused on high-level career/coach view orchestration.

### Changed
- **V2 Architecture Transition**: Consolidated the core application into the `v2/` directory for better modularity and structural clarity.
- **Root Cleanup**: Removed legacy files from the project root to streamline the repository structure.
- **N+1 Sync Finalization**: Fully merged and verified the cloud sync optimizations by resolving duplicate file conflicts.

## [2.31.11] - 2026-03-09

### Security
- **Local Storage Encryption**: Strengthened encryption key derivation using `crypto.subtle.generateKey` to create cryptographically secure 256-bit AES-GCM keys. Added a secure migration path for legacy data.
- **SSRF Protection**: Verified and reinforced Server-Side Request Forgery (SSRF) protections in the `scrape-jobs` Edge Function.
- **Log Injection**: Prevented potential CRLF log injection vulnerabilities in the Gemini Proxy and verified the absence of sensitive logging in `UserContext`.
- **Sanitization & Escaping**: Resolved code scanning alerts by fixing incomplete multi-character sanitization and double-escaping bugs in the job scraper and extension content extractor.
- **Security Policy**: Updated `SECURITY.md` with refined vulnerability reporting guidelines and response timelines.

### Added
- **Cloud Sync Optimization**: Resolved N+1 sync issues by batching job, skill, and target job insertions, drastically speeding up local-to-cloud synchronization.

### Fixed
- **Code Health**: Resolved specific `any` types in `FeatureGrid.tsx` and `NavigatorPro.tsx`, and verified `HEADLINES` constant extraction.
- **Test Coverage**: Added comprehensive test suites for block comparison logic, event service error handling, and `cleanJsonOutput` edge cases.

## [2.31.10] - 2026-03-09
### Added
- **Dynamic Reliability Filtering**: Replaced the hardcoded blocklist with an automated tracking system. The app now calculates the failure rate for every job board. If a domain (like LinkedIn) fails more than 80% of the time (over at least 5 attempts), it is automatically soft-blocked to save users from unnecessary "Scraping..." wait times.

- **Interview Advisor Restoration**: Fixed broken imports and restored missing functionality in `InterviewAdvisor.tsx`. Resolved a React rendering edge case where state updates were triggered synchronously inside an effect.
- **Onboarding & Skill Module Cleanup**: Cleaned up 100+ unused imports and variables across the Onboarding flow and Skill Interview components to resolve critical build and lint failures.
- **Restrictive Interview Advisor Access**: Removed a hard-coded `isAdmin` check that prevented Plus and Pro users from accessing the Mock Interview Advisor.
- **Education Visibility**: Fixed a bug where Education-specific dashboard cards were hidden from students on the homepage.
- **URL Scrape Persistence**: Resolved an issue where a broken job URL would persist and be attached to manual job description submissions after a scraping failure.
- **Tester Tier Symmetry**: Synced feature rankings for the `tester` tier to match administration privileges, ensuring consistent development and QA previews.

### Changed
- **Interview Component Strong Typing**: Replaced broad `any` prop definitions in `InterviewSelection` and `InterviewSessionScreen` with specific interfaces to improve code quality and prevent regressions.

## [2.31.9] - 2026-03-09

### Changed
- **Code Health Sweep**: Resolved major linting warnings across the project. Replaced generic `any` types with disciplined interfaces (`ProcessedJob`, specific `PromiseSettledResult`s) in `jobStorage.ts` and `usageLimits.ts`.
- **Hook Optimization**: Added missing dependencies to `useEffect`, `useMemo`, and `useCallback` hooks in `useCoachManager` and `EmailVerificationScreen` to prevent stale closure bugs.
- **Component Modularity**: Extracted large, monolithic components (`OnboardingPage`, `InterviewAdvisor`, `SkillInterviewPage`, `ResumeEditor`) into smaller, focused single-responsibility files (routing, selection, session, summary screens) with custom hooks (`useResumeEditor`).
- **Data Encapsulation**: Extracted the static `FEATURE_REGISTRY` object out of the UI and into a dedicated data file (`src/features.data.ts`), clarifying the separation between UI tracking and metadata definitions.

### Fixed
- **Storage Core Migration**: Increased the migration timeout budget from 3s to 5s and refined the Base64 regex detection in `Vault` to prevent silently skipping the PBKDF2 iteration migration.
- **Supabase Mock Fragility**: Restructured the Supabase test mocks in `jobStorage.test.ts` to fully support chained operations (`.from().update().eq().eq()`), stopping `TypeError` false positives during unit tests.
- **Unhandled Database Exceptions**: Fixed a bug in `usageLimits.ts` where failed or aborted Supabase queries caused unhandled promise rejections. Returns from `Promise.allSettled` are now safely extracted with fallback defaults.
- **Profile Data Sync**: Restored missing columns (`total_ai_calls`, `job_analyses_count`, `inbound_email_token`) to the `profiles` fetch query that previously broke tier limitations.

## [2.31.8] - 2026-03-08

### Fixed
- **Database Schema Drift**: Resolved a critical issue where the Supabase `jobs` table was missing columns (`updated_at`, `location`, `resume_id`, `cover_letter`, `cover_letter_critique`, `fit_score`), causing "schema cache" errors and blocking cloud synchronization.
- **Status Validation**: Expanded the `jobs` status constraint to include the `'analyzing'` state, preventing database insertion failures for jobs that are saved mid-analysis.
- **Job Match UX**: Fixed a state-sharing bug in the job input screen where failed scrape URLs would persist and conflict with the manual description fallback.
- **Submission Routing**: Ensured that form submissions correctly route to the manual description buffer when a scraping error is present, preventing redundant sync failures.

## [2.31.7] - 2026-03-08

### Added
- **Style Transformer**: Implemented the `RdStyleService` which distills user feedback into active instructions. These instructions are now "dark-wired" into the generation loop to automatically adjust AI output to the user's personal voice.
- **Semantic Trajectory Mapping**: Established the `RdEmbeddingService` using `text-embedding-004` to map professional experience into a 768-dimensional latent space. Implemented `RdTrajectoryService` to calculate the "Growth Vector" (semantic drift) between past profile versions and current target roles.
- **High-Fidelity Feedback Logs**: Integrated `RdFeedbackService` into the core generation and tailoring hooks. The engine now captures explicit picks (A/B testing), implicit edits, and real-world outcomes (Interview/Offer) to calibrate user-specific models.
- **Modeling Infrastructure**: Launched the `rd_user_embeddings` data store with `pgvector` support and implemented a secure, per-user R&D feature gating system (`isNextGenEnabled`).
- **Roadmap Visualization**: Introduced `docs/ROADMAP_NEXTGEN.md` to track the Modeling Engine architecture.
- **The Distiller**: Successfully implemented the LLM-powered style distillation logic. The engine now dynamically fetches the 25 most recent "Sensory Signals" (A/B picks, manual edits) and routes them through a low-temperature `MODELING_DISTILLER` pass to generate a personalized 60-word "Style Guide" for AI generations.
- **R&D Calibration Dashboard**: Launched a hidden admin-only calibration interface in Settings to visualize and trigger Style and Trajectory modeling. Includes real-time signal density stats and a **Trajectory Projection UI** to visualize professional archetype shifts.
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

---

## Older Releases
Historical changes prior to version 2.31.0 can be found in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
