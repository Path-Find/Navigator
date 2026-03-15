# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **Premium Sidebar Redesign**: Reordered the Resume and Cover Letter sidebars to prioritize tailoring instructions and feedback. Status and quality metrics (Draft Strength, Match Quality) have been moved to the bottom of the sidebar to keep the user focused on actionable content.
- **Unified Quality Cards**: Introduced high-fidelity card designs for `Match Quality` (Resume) and `Draft Strength` (Cover Letter) that include descriptive labels (Exceptional, Strong, Good, Needs Work) and alignment-based descriptions.
- **Review Required Alerts**: Redesigned the placeholder warning in the Cover Letter sidebar to match the premium card-based layout of the quality metrics, replacing generic alert banners.
- **Visual Consistency Pass**: Removed redundant "Focus" and "Job Description" headers; synced sidebar headers to be borderless and mixed-case; reduced vertical spacing between bullet points in all sidebars to improve information density.
- **Cover Letter Workflow Enhancements**: Added a "None of these work for me" option to rejecting AI suggestions; replaced purple accent buttons with neutral black/white designs; simplified AI progress messages to "Generating...".
- **No All-Caps Headings**: Removed `uppercase` from every section heading and label across all job detail tabs and sidebars.
- **Unified Heading Style**: All section headings across the job detail page now use `text-xs font-bold` (up from `text-[10px]`). `tracking-widest` reduced to `tracking-wide` or removed.
- **SkillPill Component**: Extracted skill chip styling into a shared `SkillPill` component. Match Insights and Skill Match in `AnalysisTab` now both use it for consistent treatment.
- **Match Insights Card**: Wrapped the Match Insights section in a `Card variant="glass"` to match other sections.
- **Interview Tab Title**: Removed the standalone `h2` title and Beta badge; tab label is now sufficient.
- **Date & Detail Formatting**: All job dates now use `"Mar 14, 2026"` format; centralized deadline formatting logic and score labeling functions (`getScoreLabel`, `getScoreColorClasses`).
- **Match Score Visibility**: Compatibility score badge (e.g. "82 · Strong") now displayed persistently in the job detail header actions area, visible on every tab.
- **Status Toggle Polish**: Application status selector now has a visible background, border, and chevron icon; restyled to match the tab bar pill aesthetic.
- **Job Detail Header**: Job title now renders as a proper bold heading; removed redundant back arrow and double border lines.
- **Analysis Tab Restructured**: "Professional Insight" (AI reasoning) moved from the MatchSidebar into the Analysis tab as the first card. Skill Match reordered to appear before Core Strengths/Gaps.
- **Sidebar Integration**: Sidebar now correctly floats while scrolling by fixing inner `overflow-y-auto` traps and grid height stretching.
- **Resume & Cover Letter Insights**: Sidebar now shows genuinely useful tailoring strategy ("Focus" bullets) explaining AI prioritization and critique feedback.
- **Score Labels Simplified**: Compatibility score labels simplified to single words: Exceptional, Strong, Good, Fair, Low.
- **Layout Stability**: Locked the main content column to `col-span-8` on all tabs to prevent width shifts during tab switching.

### Fixed
- **Cover Letter Format Cleaning**: Hardened the AI service to strictly strip Markdown wrappers and accidental JSON artifacts from outputs.
- **AI Infrastructure**: Resolved persistent 401 Unauthorized errors on `gemini-proxy`; replaced retired `gemini-1.5-pro` with `gemini-2.0-flash`.
- **Score Threshold Consistency**: All score cutoffs now reference a single `SCORE_THRESHOLDS` constant to correctly align labels and filters.
- **Education / Experience Split**: Resume tab now correctly separates Work, Volunteer, Project, and Other blocks from Education blocks into their own labelled sections.
- **Phantom Spacing**: Organization/date lines in resume blocks now only render when values are present, removing extra whitespace for summary-type blocks.
- **Placeholder Warnings**: Moved unfilled placeholder detection (e.g. `[TITLE]`) from the editor area into the Cover Letter sidebar for a cleaner experience.
- **Skill Pill Dot Position**: Proficiency dot in `SkillPill` moved from left to right to match the indicator position on the main Skills page.

### Removed
- **Interview Tab Content**: Hidden the Interview tab temporarily until AI-generated content is ready, replacing the hardcoded placeholder text.
- **Redundant Actions**: Removed "Copy optimized summary" from the Resume tab and oversized icon containers from the Cover Letter header.
- **sidebar decorative elements**: Stripped all decorative icons from card-internal section headings across every tab and sidebar.

## [2.32.2] - 2026-03-13

### Fixed
- **TypeScript Payment Service Errors**: Fixed `TS18047` by verifying `session.access_token` existence before passing it in the `paymentService.ts` Edge Function.
- **Duplicate Admin Service File**: Removed an unused duplicate `adminService.ts` file in `src/modules/admin/services/`.

## [2.32.1] - 2026-03-13

### Changed
- **Job History Redesign**: Redesigned Job History Card to consolidate metadata, increase readability, and improve alignment.
- **Match Score Labels**: Enhanced Match Score display on History Card to include qualitative labels alongside percentage scores.
- **Graceful Loading States**: Added `JobProcessingState` for smooth loading indicators while fetching job data.

### Fixed
- **Blank Screen on Job Details**: Fixed routing mismatch in `JobModule` that prevented job details page from rendering.
- **Analysis Errors**: Resolved false timeout errors by re-wiring quota limit checks and improving proxy transparency.
- **Job Creation Workflow**: Unified routing paths to ensure consistent redirection after job creation or promotion.
- **Processing State Null Safety**: Improved null safety to prevent crashes during temporary data unavailability.
- **Analyze Button Logic**: Resolved state-tracking issues where "View Match" remained disabled during manual fallback.
- **Resume Editor Stability**: Eliminated distracting animations causing perceived layout instability.
- **Job Match Visibility**: Fixed hidden URL input field due to routing conflicts.
- **Career Dashboard Routing**: Fixed absolute path issues in nested `CareerModule` routes.
- **Education Section Navigation**: Resolved navigation issues by aligning route paths to relative versions.
- **User Existence Check**: Hardened Supabase function with case-insensitive lookups and email fallbacks.
- **AI Proxy Authentication**: Resolved 401 errors by explicitly injecting session tokens.
- **Resume Navigation Loop**: Fixed critical infinite loop in `useResumeEditor` hook.
- **Job Submission UX**: Improved field persistence on error and added automatic toggle to Manual Mode.
- **Login Flow Logging**: Added temporary console logging to assist with debugging auth issues.

### Performance
- **Dashboard Optimization**: Improved homepage responsiveness by reducing background blur complexity and shortening animations.
- **Instant Interaction**: Disabled initial fade-in animations on the primary dashboard.

## [2.32.0] - 2026-03-13

### Added
- **Billing Portal**: Implemented `create-portal-session` Edge Function and `paymentService.getPortalUrl()` for Stripe billing access.
- **User Preferences Context**: Split `UserContext` into focused `UserContext` and `UserPreferencesContext`.

### Changed
- **Code Quality**: Eliminated remaining `as any` assertions; introduced proper interfaces and type declarations across 8 files.
- **Duplicate File Purge**: Removed 112 macOS-created duplicate files from source and docs.
- **Lint Cleanup**: Fixed `useResumeEditor` dependency arrays; resolved `set-state-in-effect` errors; purged remaining `no-unused-vars` and `exhaustive-deps` warnings.
- **Job Manager Decomposition**: Refactored `useJobManager` into focused helpers for nudges, initial load, and usage limits.
- **Job Analysis Hook Hardening**: Simplified `useJobAnalysis` and improved abort handling and error reporting.
- **Utility Safety**: Hardened job utilities with stricter typing and safer fallbacks for clipboard and interview sampling.

### Fixed
- **Environment Parity**: Restored missing `.env` configuration to resolve "Configuration Required" block.
- **Global Context Stability**: Ensured core providers are available at application root to prevent context crashes.
- **Toast ID Collision**: Replaced date-based IDs with `crypto.randomUUID()` to eliminate collisions.
- **Case-Sensitive Deduplication**: Resume bullet points normalized to lowercase before deduplication.
- **Job Description Length**: Added 25,000-character limit to prevent API timeouts on large inputs.
- **Lazy Chunk Reload Guard**: Implemented timestamp-based TTL for the reload guard to expire correctly.
- **Sync Partial Failures**: Used `Promise.allSettled` in cloud sync to prevent individual failures from aborting all tasks.
- **Fingerprint Promise Chain**: Added missing `.catch()` handlers to device fingerprint update chain.

### Security
- **Lazy Migration Support**: Implemented automatic data upgrade to hardened PBKDF2 standard upon first read.
- **Decryption Safeguards**: Hardened storage modules with error guards to prevent accidental data deletion on unreadable vault data.
- **Migration Budgeting**: Refined logic to ensure global migration only marks complete on full success.

### Performance
- **Module-Based Route Splitting**: Implemented lazy loading architecture to reduce initial bundle size.
- **Feature Preview Loading**: Refactored SVG-heavy components into standalone lazily-loaded chunks.
- **Mobile Animation Tuning**: Enforced "Static Mode" for `BentoCard` on mobile to ensure fluid scrolling.
- **Parallel Boot Sequence**: Parallelized async initialization in `UserContext` for faster shell rendering.
- **Lazy-Loaded PDF Processing**: Transitioned `pdf.js` to a dynamic loading model fetched only during resume parsing.

## [2.31.11] - 2026-03-09

### Added
- **Cloud Sync Optimization**: Resolved N+1 sync issues by batching job, skill, and target job insertions.

### Fixed
- **Code Health**: Resolved specific `any` types and verified `HEADLINES` constant extraction.
- **Test Coverage**: Added comprehensive test suites for comparison logic and edge cases.

### Security
- **Local Storage Encryption**: Strengthened key derivation using cryptographically secure 256-bit AES-GCM keys.
- **SSRF Protection**: Reinforced protections in `scrape-jobs` Edge Function.
- **Log Injection**: Prevented CRLF log injection in Gemini Proxy.
- **Sanitization & Escaping**: Resolved sanitization and double-escaping bugs in scraper and extractor.

## [2.31.10] - 2026-03-09

### Changed
- **Component Strong Typing**: Replaced broad `any` prop definitions with specific interfaces in Interview modules.

### Fixed
- **Dynamic Reliability Filtering**: Replaced hardcoded blocklist with automated failure-rate tracking for job boards.
- **Interview Advisor Restoration**: Fixed broken imports and resolved React rendering edge cases.
- **Onboarding & Skill Module Cleanup**: Resolved 100+ unused imports and variables to fix build and lint failures.
- **Interview Access**: Removed hard-coded admin checks for Plus and Pro users.
- **Education Visibility**: Fixed hidden dashboard cards for students on the homepage.
- **URL Scrape Persistence**: Resolved persistent broken job URL issues after scraping failure.
- **Tester Tier Symmetry**: Synced feature rankings for the `tester` tier.

## [2.31.9] - 2026-03-09

### Changed
- **Code Health Sweep**: Resolved major linting warnings across the project. Replaced generic `any` types with disciplined interfaces.
- **Hook Optimization**: Added missing dependencies to `useEffect`, `useMemo`, and `useCallback` hooks.
- **Component Modularity**: Extracted monolithic components into smaller, focused single-responsibility files.
- **Data Encapsulation**: Extracted static `FEATURE_REGISTRY` out of UI into a dedicated data file.

### Fixed
- **Storage Core Migration**: Refined Base64 regex detection to prevent skipping PBKDF2 migration.
- **Supabase Mock Fragility**: Restructured mocks to fully support chained operations.
- **Unhandled Database Exceptions**: Fixed unhandled promise rejections in `usageLimits.ts`.
- **Profile Data Sync**: Restored missing columns to the profiles fetch query.

## [2.31.8] - 2026-03-08

### Fixed
- **Database Schema Drift**: Resolved critical issues where Supabase `jobs` table was missing columns.
- **Status Validation**: Expanded status constraints to include `'analyzing'` state.
- **Job Match UX**: Fixed state-sharing bug where failed scrape URLs would persist.
- **Submission Routing**: Ensured correct routing to manual description buffer on scraping error.

## [2.31.7] - 2026-03-08

### Added
- **Style Transformer**: Implemented `RdStyleService` to distill user feedback into active tailored instructions.
- **Semantic Trajectory Mapping**: Established `RdEmbeddingService` to map professional experience into latent space.
- **High-Fidelity Feedback Logs**: Integrated `RdFeedbackService` to capture picks and edits for model calibration.
- **Modeling Infrastructure**: Launched `rd_user_embeddings` with `pgvector` support and feature gating.
- **Calibration Dashboard**: Launched admin-only interface for visualizing Style and Trajectory modeling.
- **Waitlist Pivot**: Transitioned to a premium "Invite-Only" model with a Waitlist system.

### Changed
- **Abortable AI Services**: Integrated `AbortController` support across all AI services for cleaner navigation.
- **Conflict Resolution**: Implemented timestamp-based comparison during cloud synchronization.
- **Batch Sync**: Refactored sync engine to use batched insertions and upserts.
- **Cloud Sync Rollbacks**: Implemented optimistic rollback mechanism for profile updates.
- **PDF Extraction Optimization**: Processed pages sequentially to reduce memory spikes.
- **Request Timeouts**: Introduced global `withTimeout` utility for all critical storage operations.
- **Initial Hydration**: Consolidated job manager load to fire after primary sync.

### Fixed
- **Descriptive PDF Errors**: Upgraded logic to throw descriptive errors for corrupt PDFs.
- **Safe Analysis Fallbacks**: Standardized return signatures to provide safe defaults when resumes are missing.
- **Cloud Sync Resilience**: Ensured background sync failures are correctly surfaced via toasts.

### Performance
- **The Distiller**: Implemented LLM-powered style distillation for personalized voice adjustments.

## [2.31.6] - 2026-03-08

### Fixed
- **Timeout Misdiagnosis**: Updated error states to correctly signal service interruptions vs. data errors.
- **Scraping UX**: URL field automatically cleared on scraping failure for easier manual paste.

### Performance
- **Job Analysis Pipeline**: Consolidated into a single AI pass to cut network overhead by 50%.
- **High-Efficiency Junk Filtering**: Aggressively strips website noise, reducing average character counts by ~70%.

## [2.31.5] - 2026-03-08

### Changed
- **Roadmap Reorganization**: Cleaned up duplication and cross-linked dependent items across product and platform roadmaps.
- **Maintenance**: Deleted 12 stale remote branches and pruned local refs.

### Fixed
- **N+1 Sync Status**: Noted progress on sync optimization branch and resolved merge conflicts.

---

## Older Releases
Historical changes prior to version 2.31.5 can be found in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
