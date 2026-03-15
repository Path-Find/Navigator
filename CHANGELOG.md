# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### UI & UX Refinement
- **Premium Sidebar Redesign**: Reordered the Resume and Cover Letter sidebars to prioritize tailoring instructions and feedback. Status and quality metrics (Draft Strength, Match Quality) have been moved to the bottom of the sidebar to keep the user focused on actionable content.
- **Unified Quality Cards**: Introduced high-fidelity card designs for `Match Quality` (Resume) and `Draft Strength` (Cover Letter) that include descriptive labels (Exceptional, Strong, Good, Needs Work) and alignment-based descriptions.
- **Review Required Alerts**: Redesigned the placeholder warning in the Cover Letter sidebar to match the premium card-based layout of the quality metrics, replacing generic alert banners.
- **Visual Consistency Pass**: 
    - Removed redundant "Focus" and "Job Description" headers for a cleaner look.
    - Syncing sidebar headers to be borderless and mixed-case across the entire job detail view.
    - Reduced vertical spacing between bullet points in all sidebars to improve information density and readability.
- **Cover Letter Workflow Enhancements**: 
    - Added a "None of these work for me" option to the stylistic variants comparison view, allowing users to reject both AI suggestions and return to the main editor.
    - Replaced purple accent buttons with sleek, neutral black/white designs for "Generate", "Refine", and stylistic choices.
    - Simplified AI progress messages to a clean "Generating..." status, removing technical jargon during distillation and generation phases.

### Fixed
- **Cover Letter Format Cleaning**: Hardened the AI service to strictly strip Markdown wrappers (e.g., ` ```markdown `) and accidental JSON artifacts from cover letter outputs, ensuring raw text is always delivered to the editor.
- **Sidebar Header Borders**: Removed accidental bottom borders from sidebar headers to maintain a minimalist aesthetic.
- **Placeholder Warnings**: Fixed inconsistent styling of the review required notification to ensure it matches the application's design system.

### Fixed
- **AI Analysis Restored**: Resolved persistent 401 Unauthorized errors on the `gemini-proxy` Edge Function caused by a JWT configuration mismatch. Redeployed with gateway-level JWT verification disabled — auth is handled internally by the function.
- **AI Proxy Direct Fetch**: Replaced `supabase.functions.invoke()` with a direct `fetch()` call in `aiCore.ts` for explicit control over auth headers.
- **Deprecated Gemini Model**: Replaced the retired `gemini-1.5-pro` with `gemini-2.0-flash` for all premium tiers.
- **Score Threshold Consistency**: Removed hardcoded threshold values (75, 50, 85) scattered across `MatchSidebar` and `NavigatorPro`. All score cutoffs now reference a single `SCORE_THRESHOLDS` constant exported from `jobUtils.ts` — the upgrade messaging thresholds and Feed "High Match" filter now correctly align with the label definitions (Strong ≥ 80, Fair ≥ 60).

### UI Polish
- **No All-Caps Headings**: Removed `uppercase` from every section heading and label across all job detail tabs and sidebars — Analysis, Resume, Cover Letter, Interview, Posting, Match sidebar, Resume sidebar, and Cover Letter sidebar. Buttons and labels also cleaned up.
- **Heading Style Unified**: All section headings across the job detail page now use `text-xs font-bold` — up from the previous `text-[10px]` micro-label style. `tracking-widest` reduced to `tracking-wide` where it remained, then removed entirely with the size bump. `indigo-600` on ResumeTab headings normalised to `indigo-500`.
- **Sidebar Card Titles Normalised**: "Strategic Alignment" (ResumeSidebar), "Refinement Strategy" (CoverLetterSidebar), and "Professional Insight" (MatchSidebar) were using `text-sm font-bold normal-case` — now match the unified heading style.
- **Match Insights in Card**: Wrapped the Match Insights section in a `Card variant="glass"` to match every other section on the Analysis tab.
- **SkillPill Component**: Extracted skill chip styling into a shared `SkillPill` component (`src/components/ui/SkillPill.tsx`). Match Insights and Skill Match in `AnalysisTab` now both use it — consistent chip size, font, dot, and border treatment matching `SkillCard` on the Skills page.
- **Cross-Tab Heading Consistency**: Standardised all card-internal section headings across every tab to `text-[10px] font-black tracking-widest uppercase` with `w-3.5 h-3.5` icons and indigo colour — Match Insights, Skill Match, Core Responsibilities, Professional Summary, Experience & Achievements, Cover Letter Draft, and Job Description were all on different scales and cases.
- **Interview Tab Title Removed**: Removed the standalone `h2` "Interview Prep" title, subtitle, and Beta badge that only the Interview tab rendered — no other tab had its own in-content title. Tab label is sufficient.
- **Interview Tab Spacing**: Normalised `space-y-6` to `space-y-8` to match the rest of the page.
- **"Questions to Ask Them" Heading Colour**: Changed from emerald to indigo to match every other heading in the app. Emerald bullet dots retained for visual distinction between the two question cards.
- **"Posting" Tab Rename**: Shortened "Job Posting" tab label to "Posting".
- **Draft Quality Moved to Sidebar**: Removed the "Candidate Match" quality banner from inside the cover letter editor card. The verdict now lives in the Cover Letter sidebar as "Draft Quality" — clearer label, better placement.
- **MatchSidebar Body Text**: Reduced from `text-sm` to `text-xs` to match ResumeSidebar and CoverLetterSidebar.
- **Detail Page Background Removed**: Removed the `bg-neutral-50/50` backdrop from `DetailLayout` that was creating a visible tinted background behind job detail content.
- **Tab Bar Consistency**: Restyled the job detail tab bar (`DetailTabs`) to match the top nav — pill-shaped container, glass background, no colored active borders.
- **Status Toggle**: Restyled the application status dropdown to match the tab bar pill aesthetic.
- **Job Detail Header**: Job title now renders as a proper bold heading. Removed redundant back arrow. Removed the double border line between header and tabs. Reference number no longer uses monospace font.
- **Match Sidebar**: Score now displayed as a large number with a colored progress bar and short label (Good, Strong, etc.) that match in color. Removed redundant divider and "Match Evaluation" label.
- **Analysis Tab Cards**: Removed colored tinted backgrounds from Core Strengths and Identified Gaps cards. Normalized body text from `font-black`/`font-bold` to `font-medium`. Core Responsibilities changed from individual cards per bullet to a plain list.
- **Analysis Tab Section Headers**: Skill Match and Core Responsibilities card headers now use the same `text-[10px] tracking-widest` style as Core Strengths and Identified Gaps — consistent inside-card heading treatment across the entire Analysis tab. Removed the divider line below Match Insights; `space-y-8` spacing is sufficient.
- **Skill Match**: Restyled to match the Skills tab — pill chips with colored proficiency dots (emerald/orange/gray), consistent with `SkillCard`.
- **Strategic Alignment / Refinement Strategy**: Removed individual card-per-bullet layout in Resume and Cover Letter sidebars; replaced with plain dot lists.
- **Cover Letter Sidebar**: Removed redundant wrapper div and extra `space-y-6` nesting. Card is now the root element, matching `ResumeSidebar`. Instruction text color, spacing, and empty state copy now match `ResumeSidebar`.
- **Interview Tab**: Renamed "Interview Mission Control" to "Interview Prep". Removed all-caps headers, military naming ("Eve of Battle"), and individual card-per-question layout. Normalized to match the rest of the page.
- **Cover Letter**: Removed `font-serif` from draft text to match the app's standard font.
- **Score Labels Unified**: History page and job detail page now use the same `getScoreLabel` and `getScoreColorClasses` functions. Removed hardcoded "Strong Fit" / "Excellent Match" / "Potential Fit" labels and mismatched indigo colors from History cards.
- **Score Labels Shortened**: Compatibility score labels simplified to single words — Exceptional, Strong, Good, Fair, Low.
- **Score Badge Consistency**: History card score badge now matches the status badge style — `text-[10px] font-black`, consistent pill sizing.
- **Date Formatting**: All job dates now use the same `"Mar 14, 2026"` format (`month: short, day: numeric, year: numeric`) across History, Cover Letters, and the Feed. Previously the Feed and Cover Letters used the browser's raw locale format.
- **`getDeadlineInfo` Centralised**: Deadline formatting logic extracted from `History.tsx` into `jobUtils.ts` so it can be shared across pages without duplication.
- **Match Score in Header**: Compatibility score badge (e.g. "82 · Strong") now displayed persistently in the job detail header actions area, visible on every tab — no longer buried inside the Analysis tab sidebar only.
- **Status Dropdown Affordance**: Application status selector now has a visible background, border, and chevron icon — previously rendered as unstyled plain text with no visual indication it was interactive.
- **Job Detail Layout Stability**: Locked the main content column to `col-span-8` on all tabs. Content width no longer shifts when switching between tabs with and without sidebars.
- **Analysis Tab Restructured**: "Professional Insight" (AI reasoning) moved from the MatchSidebar into the Analysis tab as the first card. Skill Match reordered to appear before Core Strengths/Gaps. "Match Insights" renamed to "Key Competencies" and moved to the bottom as supporting context. MatchSidebar removed.
- **Section Heading Icons Removed**: Stripped all decorative icons from card-internal section headings across every tab and sidebar — headings are now plain text.
- **Heading Font Fixed**: Professional Insight was inheriting the sidebar's `text-[10px] font-black tracking-wide` style. Now uses `text-xs font-bold` matching all other tab headings.
- **Cover Letter Font Fixed**: Removed lingering `font-serif text-base` from the cover letter editor body — uses the app's standard font at `text-sm`.
- **Cover Letter Header Simplified**: Removed the oversized `PenTool` icon container from the cover letter header. Title reduced to "Cover Letter".
- **Resume Tab Padding**: Reduced outer resume wrapper from `p-8 md:p-12 space-y-12` to `p-6 space-y-8` — consistent with other tabs.
- **Cover Letter Padding**: Reduced header and editor area padding from `p-8` to `p-6`.
- **Interview Tab Renamed**: "Predicted Questions" → "Likely Questions". "Questions to Ask Them" → "Your Questions". "Regenerate based on JD" → "Regenerate".
- **Posting Tab**: Removed redundant "Job Description" heading — the entire tab is the posting.
- **Resume Tab Sections Unified**: Resume tab now uses the same `SECTIONS` constant as the resume editor — single source of truth for section types, labels, and order. Summary and skill blocks excluded from rendered sections.
- **Experience / Education Split**: Resume tab now correctly separates Work, Volunteer, Project, and Other blocks from Education blocks into their own labelled sections, matching the resume editor layout.
- **Phantom Spacing Fixed**: Organization/date line in resume blocks now only renders when at least one of those values is present — blocks without them (e.g. summary-type blocks used as experience) no longer have extra whitespace above bullets.
- **Summary Block Excluded**: Blocks with `type: 'summary'` (e.g. "Urban Planning Student") no longer appear inside Experience or any other section — they were slipping through the filter.
- **Professional Summary Not Italic**: Tailored professional summary text on the Resume tab is no longer italicized.
- **Copy Summary Button Removed**: Removed the "Copy optimized summary" button from the Resume tab — redundant given the full copy action.
- **Tailor Button Consistent**: Hyper-Tailor button is now always `variant="secondary"` (no longer purple when untailored). Renamed "Hyper-Tailor" → "Tailor" / "Retry".
- **Section Header Alignment Fixed**: Section header rows across Resume tab and Cover Letter header changed from `items-center` to `items-start` — buttons were causing headings to appear lower than their `p-6` padding due to vertical centering against taller button height.
- **Copy Full Fixed**: Resume clipboard output now correctly separates Experience and Education into labelled sections. Previously all blocks were dumped under a single "Experience" heading.
- **Interview Tab Removed**: Interview tab hidden from job detail page — content was hardcoded placeholder text that was worse than nothing. Will be re-introduced when AI-generated.
- **Skill Pill Dot Position**: Proficiency dot in `SkillPill` moved from left to right, matching the indicator position on `SkillCard` in the Skills profile page.
- **Analysis Tab Bullet Consistency**: Core Responsibilities bullets changed from `text-sm` with `motion.div` stagger animations to `text-xs font-medium` matching Core Strengths — same size, same spacing, no animation difference.
- **Posting Tab Card-in-Card Removed**: Job description text was wrapped in a styled div inside a Card, creating a nested card appearance. Inner wrapper removed — text now renders directly inside the Card.
- **Sidebar Sticky Fixed**: Sidebar now correctly floats while scrolling. Root cause: `overflow-y-auto` on `DetailLayout`'s outer div was trapping `position: sticky` inside a non-scrolling container. Removed the overflow, let the document scroll, set `top: 136px` to clear the sticky tab bar.
- **Sidebar Grid Fix**: Grid changed from `items-start` (all columns shrink to content height) to default stretch with `self-start` on the main column — sidebar column now stretches to full grid height, giving sticky a parent tall enough to work in.
- **Resume Sidebar — How We Built This**: Replaced internal tailoring instructions with genuinely useful content: resume-specific tailoring strategy (`resumeTailoringInstructions`) shown as "Focus" bullets — explains what the AI prioritized when building the resume view.
- **Cover Letter Sidebar — How We Built This**: Cover letter sidebar now shows: Draft Quality badge (inline pill, not full-width banner), placeholder warning (if applicable), cover letter tailoring strategy (`coverLetterTailoringInstructions`) as "Focus" bullets, and critique feedback. Quality badge is a small pill in the heading row, consistent with the score badge in the job header.
- **Placeholder Warning Moved to Sidebar**: Unfilled placeholder detection (`/\[[^\]]{10,}\]/`) moved from inside the cover letter editor area into the Cover Letter sidebar — less intrusive, better placement.
- **Cover Letter Critique in Sidebar**: Draft Quality and critique feedback now live exclusively in the Cover Letter sidebar. The duplicate bottom card (`CoverLetterReviewCard`) has been removed.

## [2.32.2] - 2026-03-13

### Fixed
- **TypeScript Payment Service Errors**: Fixed `TS18047` by verifying `session.access_token` existence before passing it in the `paymentService.ts` Edge Function.
- **Duplicate Admin Service File**: Removed an unused duplicate `adminService.ts` file in `src/modules/admin/services/`.

## [2.32.1] - 2026-03-13

### UX & Polish
- **Job History Redesign**: Redesigned the Job History Card (`History.tsx`) to consolidate metadata into a single row, increase text readability, improve alignment, and added a location `MapPin` icon.
- **Match Score Labels**: Enhanced the Match Score display on the History Card to include qualitative labels (e.g., "Excellent Match", "Strong Fit") alongside the percentage score.
- **Graceful Loading States**: Added a `JobProcessingState` to the `JobDetail` component to display a smooth loading indicator while job data is fetched from IndexedDB, preventing jarring blank screens.

### Fixed
- **Blank Screen on Job Details**: Fixed a nested routing mismatch (`/jobs/:id`) in the `JobModule` that prevented the job details page from rendering, causing a completely blank screen when navigating from the History tab.
- **False Analysis Timeout Errors**: Resolved an issue where users received a generic "Analysis timed out" error instead of the proper "Daily Quota Exceeded" modal. Re-wired quota limit checks (`checkAndConsumeAnalysis()`) into the manual retry handler and improved proxy error transparency.
- **Job Creation Redirection**: Unified and corrected routing paths across `useJobManager` to ensure users are consistently redirected to the correct job detail view after job creation or promotion.
- **Processing State Null Safety**: Improved null safety in `JobProcessingState.tsx` to prevent crashes when job properties are temporarily unavailable during load.
- **Analyze Button Logic**: Resolved a state-tracking issue where the "View Match" button remained disabled during manual fallback after a scraping error. The button now correctly enables and updates its label to "Analyze" once valid job text is provided.
- **Resume Editor Stability**: Eliminated distracting slide-in and scroll-entry animations in the resume module that caused perceived layout instability and "narrowing" effects during page loads.
- **Job Match Visibility**: Fixed an issue where the Job Match URL input field was hidden on the `/jobs` page due to a routing conflict with the new dashboard.
- **Career Dashboard Routing**: Fixed a routing issue in `CareerModule` where absolute paths in nested routes caused no matches to be found.
- **Education Section Navigation**: Resolved navigation issues in the Education section by aligning route paths and transitioning to relative paths for consistent matching.
- **Improved User Existence Check**: Hardened the `check_user_exists` Supabase function to use case-insensitive lookups and fallback to `normalized_email`.
- **AI Proxy Authentication**: Resolved "401 Unauthorized" errors in `aiCore.ts` by explicitly injecting the Supabase session token into Edge Function calls.
- **Resume Navigation Loop**: Fixed a critical infinite loop in the `useResumeEditor` hook that caused the application to hang or trigger server-side connection resets when navigating to the Resume section.
- **Job Submission UX Polish**: Improved the `JobMatchInput` component to prevent clearing fields on error, fixed "View Match" label state logic, and added an automatic toggle to Manual Mode for failed scrapes or long-text inputs.

### Performance
- **Dashboard Optimization**: Significantly improved homepage snappiness by reducing background blur complexity and shortening pulse animation durations.
- **Instant Interaction**: Disabled initial fade-in animations on the primary dashboard to allow for immediate interaction upon navigation.
- **Database Lookups**: Added optimized indexes for `email` and `normalized_email` lookups in the profiles table.

### Diagnostics
- **Login Flow Logging**: Added temporary console logging to the sign-in process to assist with debugging intermittent authentication issues.

## [2.32.0] - 2026-03-13

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
