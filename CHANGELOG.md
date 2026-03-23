# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.37.0] - 2026-03-23

### Added
- **Resume Interview**: Each work, project, volunteer, or other experience block now has a "Tell Your Story" button that opens a focused interview modal. The AI generates 3 targeted questions about the experience, the user answers conversationally, and the answers are synthesized into `narrativeContext` saved to the block. This context is automatically included in cover letter generation, surfacing detail that never makes it into resume bullets. Button relabels to "Edit Story" if context already exists. Gated behind the interview limit — free users see an upgrade prompt.

### Fixed
- **JS-Only Domain Detection**: Added a static blocklist of known JavaScript-rendered job portals (Oracle Cloud, Workday, Taleo, iCIMS, Lever, etc.) that skip scraping immediately with a clear "paste manually" message, instead of attempting a doomed fetch and showing a confusing "Connection issue" error.
- **gemini-proxy CORS**: Redeployed the `gemini-proxy` edge function to fix a CORS error blocking job fit evaluation on the production Vercel deployment.
- **Deadline "Closed" false positive**: Date-only deadline strings (e.g. `2026-03-22`) were parsed as midnight UTC, making jobs appear Closed prematurely in negative-offset timezones. Now treated as end of day in local time.
- **NudgeCard dismissal persistence**: Dismissed nudge cards now survive page reloads — dismissed job IDs are stored in localStorage per job so the same card doesn't reappear next session.
- **Duplicate target job names**: Dream Job entries with colliding titles now get a `(2)`, `(3)` suffix instead of silently accumulating identical names.
- **Supabase fail-fast**: Missing env vars now throw immediately on startup in production instead of silently creating a placeholder client that fails all DB calls at runtime.

### Deployed
- **`create-portal-session` edge function**: Stripe billing portal is now live — subscribers can manage their subscription, update payment methods, and view invoices from Settings.

## [2.36.0] - 2026-03-22

### Changed
- **Major Dependency Refresh**: Upgraded the core stack to modern standards across the root and extension:
    - **React 19**: Updated extension and root to React 19.2.4.
    - **Tailwind CSS 4**: Bumped to Tailwind CSS 4.2.2 for the extension.
    - **Build Infrastructure**: Upgraded to Vite 8.0.1 and Vitest 4.1.0.
    - **SDKs**: Updated `@supabase/supabase-js` to 2.99.3 and `@stripe/stripe-js` to 8.11.0.

### Tests
- **Utilities & Storage**: Added comprehensive test suites for `promiseUtils`, `resumeStorage`, `skillStorage`, `stringUtils`, `salaryParser`, and `navigation`.
- **Hooks & Services**: Implemented tests for `useJobAnalysis`, `jobAiService`, `useJobManagerHelpers`, and `coachStorage`.


## [2.35.0] - 2026-03-20

### Changed
- **Duplicate File Purge**: Removed 46 redundant duplicate files (e.g., `filename 2.tsx`) across the codebase to resolve workspace clutter and improve project hygiene.
- **Homepage Layout Alignment**: Synchronized the `FeatureGrid` and `PageHeader` with the global navigation bar width (`6xl`) to ensure a perfectly aligned, edge-to-edge visual experience.
- **Improved Visual Spacing**: Increased vertical gutters between hero sections and feature grids for a more breathable, premium layout.
- **Container Cleanup**: Removed redundant `max-width` wrappers and internal padding from `HomePage` and `FeatureGrid` to prevent layout nesting issues.
- **Settings & NextGen Refinement**: Refined the NextGen Calibration panel and Settings cards to a solid, minimalist tactile design, moving away from glassmorphism to align with the rest of the application.
- **Header Standardization**: Reverted account settings header flair to a clean, text-only highlight.
- **PageHeader Enhancements**: Updated the `PageHeader` component to support `React.ReactNode` in the highlight prop for future flexibility.

### Fixed
- **Unused Asset Cleanup**: Cleaned up unused Lucide icons (`Zap`, `Sparkles`, `Shield`) and redundant imports.
- **Versioning Reversion**: Reverted premature version bump to 2.34.0.


## [2.34.0] - 2026-03-17

### Changed
- **UI Metadata Polish**: Stripped all decorative icons from job metadata (Location, Company, Date, Reference Code, Salary, Deadline) across both Job History and Job Detail views to reduce visual clutter and achieve a more premium, modern aesthetic.
- **Simplified Status Filters**: Removed icons from the status filter options in Job History for a cleaner interface.
- **Improved Header Proportions**: Reduced the font size and weight of job titles in the History view and Job Detail header for better visual hierarchy and balance.
- **Concise Analysis Tabs**: Renamed section headers in the Analysis tab (Insight, Skills, Strengths, Gaps, Competencies, Responsibilities) to single-word labels for maximum brevity and clarity.
- **Improved Modal UX**: Added backdrop-click-to-close functionality to `AuthModal` and `UpgradeModal`, allowing users to dismiss them by clicking outside the modal content area for a more natural interaction pattern.
- **Landing Page Clarity**: Shortened feature descriptions on the landing page feature grid to ensure visual consistency and a "punchy" 4-5 line maximum across all components.

## [2.33.1] - 2026-03-17

### Security
- **Undici Vulnerability Patch**: Updated `undici` to `7.24.4` and enforced it via `overrides` in both the main application and browser extension to mitigate critical vulnerabilities (WebSocket length overflows, HTTP Request/Response Smuggling, and CRLF Injection).
- **CodeQL Remediation**:
    - Implemented recursive sanitization for HTML tags and comments in Supabase Edge Functions and the extension's `extractor.ts` to prevent filter bypasses via nested malicious sequences.
    - Hardened URL scheme validation in `NotificationBanner` components to explicitly reject `data:` and `vbscript:` protocols, preventing potential XSS vectors via notification actions.

## [2.33.0] - 2026-03-16

### Added
- **OperationQueue for Vault**: Serialized async storage operations to prevent race conditions during encryption/decryption cycles.
- **ResizeObserver for Interview Chat**: Implemented dynamic scroll-to-bottom logic that reacts to content height changes (e.g., results or pills popping in).
- **Stable Feed Sorting**: Added secondary date-based sorting for jobs with identical match scores to ensure deterministic list order.
- **Enhanced Empty State**: Updated the Job Feed empty state with a "Clear All Filters" action and polished glassmorphism aesthetics.
- **Localized Error Boundaries**: Implemented `LocalizedErrorBoundary` to wrap high-risk components (Job Feed cards, Job Detail tabs, Cover Letter cards), preventing single-component failures from crashing the entire application and providing a "Retry" option.

### Changed
- **Architectural Refactor (AI-Legibility)**: Decoupled monolithic components and hooks to meet the 700-line "AI-Legibility" standard.
    - `useJobManager` refactored into `useUsageLimits`, `useApplicationNudge`, and `useJobManagerHelpers`.
    - `AuthModal` decomposed into specialized form components (`EmailForm`, `PasswordForm`, etc.) within a new `src/components/auth/` directory.
    - `NavigatorPro` logic extracted into `useJobFeed` hook and standalone UI components (`JobFeedCard`, `EmptyFeedState`).
- **Enhanced Error Logging**: Updated error boundaries to utilize the centralized `Logger` utility, ensuring component-level catches are logged with context.
- **Unused Code Hygiene**: Removed several unused imports and references (`useCallback`, `lastMessageRef`) identified during modularization.
- **Interview Advisor UX Refinement**: Removed the card-based container from the interview interface, transitioning to a more open and expansive layout (`max-w-4xl`) that fills the viewport height, bringing the chat input to the bottom of the screen.
- **In-Chat Preparation State**: Replaced the full-screen loading state with an integrated in-chat "preparing session" message, allowing for a more seamless transition from selection to practice.
- **Redesigned Chat Input**: Streamlined the input area with a circular, indigo-colored send button and refined typography for input hints (standardized lowercase and tighter tracking).
- **Consolidated Layout**: Removed redundant headers and reduced vertical whitespace (padding/margins) across the Interview Advisor to increase information density and focus on the conversation.
- **Eliminated Selection Redundancy**: Removed the "Other" job suggestion pill entirely when analyzed roles are present. The interface now contextually toggles between interactive selection pills (when roles are available) and a direct text input (when no roles exist), ensuring a clutter-free onboarding.
- **Naturalized Conversational Intro**: Replaced robotic "simulating an interview" templates with direct, coaching-oriented greetings like "Great pick! Let's practice for your [Role] role at [Company]..."
- **Standardized Typography**: Realigned the Interview Advisor's body text weight to the application-wide standard, removing excess `font-medium` weights to ensure 1:1 consistency with the Resume and Cover Letter modules.
- **Improved Chat Responsiveness**: Updated the input handler to clear messages immediately upon submission, preventing text "persistence" during AI processing.
- **Layout & Scrolling Fix**: Resolved a "stuck" scrolling issue in the interview interface by adding `min-h-0` constraints to flex containers and refining the auto-scroll logic to account for dynamic content rendering.
- **Comparison Logic Fix**: Corrected the URL structure for general and tailored interviews to support seamless browser navigation and session state management.
- **Job Selection Flow**: Refined the initial Tailored Mock job picker conversational flow to hide the text input box by default. Users now select from presented suggestion "Pills" based on analyzed jobs, or click an "Other" option to reveal the manual text input.
- **Submit Button Aesthetics**: Replaced the previous purple gradient Submit button in the chat interface with a sleek, minimalist neutral option (`bg-neutral-900` or white) to match the global aesthetic updates.
- **Suggestion Pills Styling**: Updated the generic suggestion pills (used for job selection and feedback) within the Chat interface. The prominent purple/indigo hover effects and borders have been neutralized to match the updated UI styling, and uppercase truncation was removed from the sub-labels for better readability.
- **Features Page Tiers**: Re-added the "All" features tab to the public Features page and set it as the default. Re-styled the tier switcher pill to match the global navigation bar's frosted glass aesthetic.
- **Home Page Feature Layout**: Reverted the home page Feature Grid to correctly display a single row of 5 feature cards on large screens, resolving a cluttered 8-card display issue.
- **Academic Transcript Polish**: Significantly tightened the layout of the `CourseRegistry` component. Removed large decorative icons, reduced term padding, shrunk font sizes and badges, and compacted the course rows to display much more information simultaneously without scrolling.
- **Button Component Standardization**: Refined global `Button` component to use `font-bold` instead of `font-black`, updated small sizes to use a `rounded-full` pill shape (except for the `xs` size which now uses `rounded-xl` and `h-7` for tight UI spaces), added a defined `subtle` variant (white/dark base, bordered, subtle hover effects), and neutralized hover states for a cleaner aesthetic.
- **Unified Button Heights and Variants**: Standardized all secondary action buttons across the Resume Editor (Import, Preview, Download) and Academic Course Registry (Add Term, Add Course) to use the new `subtle` variant and uniform `xs` height.
- **Centralized Button Component**: Replaced all remaining raw HTML `<button>` elements in the Resume Section Editor (Move Up, Move Down, Remove), Resume Job Tailoring Tab (Upgrade, Reset), and Resume Preview Modal with the core `<Button>` component for a fully unified design system.
- **Education Module Polish**: Removed redundant text (e.g., student name) from Academic Profile cards, disabled automatic term mapping, and standardized section headings to match the professional `text-xs font-bold` analysis style.
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
- **Input Hint Polish**: Optimized the typography of the interview chat input hint ("Press Enter to...") by removing excessive letter spacing (`tracking-widest`) and ensuring consistency with the site-wide standard font sizing and casing.
- **Precision Pill Matching**: Redesigned interview suggestion pills to perfectly match the site-wide design tokens found on the resume page, including `rounded-xl` styling and matching font sizes (11px name / 9px sublabel).
- **Navigation Clarity**: Standardized the Exit button in focused mode to match the primary Sign Out button aesthetic (ghost style with hover interaction) and updated its icon to a clearer "X".
- **Score Labels Simplified**: Compatibility score labels simplified to single words: Exceptional, Strong, Good, Fair, Low.
- **Layout Stability**: Locked the main content column to `col-span-8` on all tabs to prevent width shifts during tab switching.
- **Interview Flow Enhancement**: Transitioned the Tailored Mock job selection process from an external screen to an in-chat conversational flow, displaying the user's 5 most recent analyzed jobs as clickable suggestion pills.

### Removed
- **Interview Tab (Job Page)**: Hidden the Interview tab on the job details page temporarily until AI-generated content is ready, replacing the hardcoded placeholder text.
- **Redundant Actions**: Removed "Copy optimized summary" from the Resume tab and oversized icon containers from the Cover Letter header.
- **Sidebar Decorative Elements**: Stripped all decorative icons from card-internal section headings across every tab and sidebar.

### Fixed
- **Interview Session Launch**: Resolved a race condition where the `InterviewSessionScreen` would immediately exit back to the selection screen upon launch, causing "Practice Now" and "Launch Mock" buttons to appear unresponsive. Root cause was a conflict between focused mode state and the initial rendering cycle.
- **Mock Interview Initialization**: Fixed an infinite loading spinner that occurred during the initial job context selection phase of tailored Mock Interviews.
- **Interview Error Handling**: Added error state handling and user-facing toast notifications for failed AI requests during Mock Interviews, preventing silent failures and timeouts.
- **Interview Input Key Handler**: Fixed a form submission bug in `InterviewChat` where hitting `<Enter>` passed a newline carriage return into the chat input field alongside submitting the form.
- **Feature Card Layout**: Removed rigid height constraints and line clamping from `BentoCard` to prevent description text truncation. Relaxed the grid layout on the Features page to 4 columns to provide cards with more horizontal space on larger screens.
- **Education Dashboard Labels**: Resolved redundant "Major / Program" text on the Academic card. It now gracefully hides the major section entirely if no program is specified in the transcript rather than showing confusing placeholder text.
- **Cover Letter Format Cleaning**: Hardened the AI service to strictly strip Markdown wrappers and accidental JSON artifacts from outputs.
- **AI Infrastructure**: Resolved persistent 401 Unauthorized errors on `gemini-proxy`; replaced retired `gemini-1.5-pro` with `gemini-2.0-flash`.
- **Score Threshold Consistency**: All score cutoffs now reference a single `SCORE_THRESHOLDS` constant to correctly align labels and filters.
- **Education / Experience Split**: Resume tab now correctly separates Work, Volunteer, Project, and Other blocks from Education blocks into their own labelled sections.
- **Phantom Spacing**: Organization/date lines in resume blocks now only render when values are present, removing extra whitespace for summary-type blocks.
- **Placeholder Warnings**: Moved unfilled placeholder detection (e.g. `[TITLE]`) from the editor area into the Cover Letter sidebar for a cleaner experience.
- **Skill Pill Dot Position**: Proficiency dot in `SkillPill` moved from left to right to match the indicator position on the main Skills page.
- **Interview Advisor Card Visuals**: Resolved a double-border issue on selection cards by removing redundant internal separators from preview content.

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
- **The Distiller**: Implemented LLM-powered style distillation for personalized voice adjustments.
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


## [2.31.6] - 2026-03-08

### Changed
- **Roadmap Reorganization**: Cleaned up duplication and cross-linked dependent items across product and platform roadmaps.
- **Maintenance**: Deleted 12 stale remote branches and pruned local refs.

### Fixed
- **Timeout Misdiagnosis**: Updated error states to correctly signal service interruptions vs. data errors.
- **Scraping UX**: URL field automatically cleared on scraping failure for easier manual paste.
- **N+1 Sync Status**: Noted progress on sync optimization branch and resolved merge conflicts.

### Performance
- **Job Analysis Pipeline**: Consolidated into a single AI pass to cut network overhead by 50%.
- **High-Efficiency Junk Filtering**: Aggressively strips website noise, reducing average character counts by ~70%.

---

## Older Releases
Earlier release history is available in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
