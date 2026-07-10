# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Fixed
- **Extension**: Resolved Tailwind v4 PostCSS build issue in the browser extension by installing `@tailwindcss/postcss` and updating `extension/postcss.config.js`.

## [2.43.2] — 2026-06-21

### Fixed
- **GitHub Pages: Node 20 → 22**: Workflow was using Node 20 which doesn't satisfy the `>=22.19.0` engine requirement from `undici`/`jsdom` deps — causing `npm ci` to fail before the build even ran. Bumped to Node 22. Also set `cancel-in-progress: false` to prevent the race condition where back-to-back pushes caused the second deployment to be rejected while the first was still in progress.
- **Dependabot #50: `@babel/core` overridden to `>=7.29.6`**: Resolved the arbitrary file read via sourceMappingURL vulnerability (GHSA-4x5r-pxfx-6jf8). Added a top-level override so npm resolves `@babel/core` to the patched version without downgrading `eslint-plugin-react-hooks`. `npm audit` now reports **0 vulnerabilities**.

---

## [2.43.1] — 2026-06-21

### Fixed
- **Build: unused imports removed** (`AdminDashboard.tsx`, `AddEntryModal.tsx`): Removed `Cpu`, `ShieldCheck`, `Zap` from `AdminDashboard` and `AnimatePresence` from `AddEntryModal` — leftover from the admin overhaul and Add Entry modal work. TypeScript's `noUnusedLocals` flagged these at build time, causing Vercel deployment failures.
- **Build: `tsc -b --force`**: Changed build script from `tsc -b` to `tsc -b --force` to prevent stale incremental TypeScript build cache on Vercel from producing false-positive unused-variable errors after cache restores.

---

## [2.43.0] — 2026-06-20

### Changed
- **Resume: Add Entry modal (AI-44)**: Clicking "Add Entry" now opens a modal with Title, Organization, and Date fields instead of silently appending a blank card to the bottom of the list. Date field includes a format hint ("Month Year — e.g. Jan 2024 – Present"). Summary and Skill sections still add directly. `useResumeEditor.addBlock` updated to accept optional initial field values.
- **Admin dashboard overhaul (AI-43)**: Removed all `uppercase` CSS across the entire page (labels, table headers, badges, stat cards). Fixed broken StatsCard icons — `bg-color bg-opacity-X` is incompatible with Tailwind JIT; replaced with explicit `iconBg`/`iconColor` props using slash-notation. Reduced oversized `rounded-[32px]`/`p-8` to `rounded-2xl`/`p-6`. Removed Simulate tier switcher, refresh button, tier filter dropdown, and "Management Portal" badge. Replaced "cohort" jargon with plain language. Wrapped page in `SharedPageLayout` for consistent width and background with all other pages. Admin title reduced to `text-2xl font-bold` to match app norms. Deviations card is now a static always-visible list (no expand/collapse). Activity heatmap fixed to a proper `grid-cols-7` 4×7 layout. "Cluster pulse / Live" replaced with "Total (28d)" ops count. Users table replaced with a compact heatmap card grid — each user is a tile color-coded by activity intensity.
- **History page consistency (AI-45)**: `maxWidth` corrected from `5xl` → `6xl` to match Feed, Jobs, and all other pages. Empty state updated to use `card-premium` wrapper and gradient icon circle, matching Feed's empty state.
- **Light mode default**: Removed system dark-mode preference fallback; app now defaults to light mode when no saved preference exists in localStorage.
- **Header icon order**: Moved icon group (Admin, Theme, Settings) before Sign Out button.
- **Jobs route**: `/jobs/match` routes directly to the job match input. `/jobs` (index) shows the homepage.
- **Settings: Removed all-caps section headers**: "ACCOUNT", "PLAN", "INTEGRATIONS" headings now use normal title case. Removed `uppercase` from all three `h4` elements in `SettingsPage.tsx`.
- **NextGen Calibration redesign**: Replaced the sci-fi console aesthetic with the app's standard card style. Removed manual "Initialize" and "Map resume" buttons (signals and style are captured automatically). Removed "Test a role" panel (trajectory and match are already in the Career/Education modules). Panel is now read-only status: writing style learned from cover letters, activity signal count.
- **Browser Extension marked coming soon**: Added `stage: 'beta'` to the extension feature entry — it was showing as a public feature with a broken "Install" link. Now shows the "Soon" badge like Interview Advisor.
- **Retired "Explorer" tier branding**: The free tier is no longer presented as a named plan. Plans page is now a 2-column Plus/Pro grid with a "Start with N free analyses — no credit card required" note above. Features page filter is now All | Plus | Pro (Explorer tab removed). Plus card subtext updated from "Everything in Explorer, plus..." to "Everything in the free trial, plus...". Internal tier keys and feature registry tags are unchanged.
- **Loading screen consistency**: Job analysis (`JobProcessingState`) now uses the same cycling-stages pattern as cover letter generation — animated icon that changes per step, SVG progress ring, character-by-character step label, and step dots. Removed the old scanning document card and gradient progress bar. Ambient glow removed from both screens. Also removed the `overflow-hidden` clip on the cover letter editor panel that was creating a hard border around the loading state.

### Fixed
- **Skills extraction quality**: `keySkills` was including enrollment requirements and program eligibility criteria (e.g. "Enrolled in co-op program") as if they were skills. Updated extraction prompt to restrict `keySkills` to actual technical skills, soft skills, tools, and domain knowledge only. Also capped skill labels at 1–4 words — long verbatim JD sentences were being copied directly into skill pills.
- **Admin: Total users count** was showing `outliers.length` (users with tracked AI usage) instead of registered account count. Now correctly reads from `profiles` and excludes admins and testers.
- **AI model deprecated**: `gemini-2.0-flash` returned 404 from the Gemini API (model removed). Updated all tiers in `TIER_MODELS` to `gemini-2.5-flash` and redeployed `gemini-proxy`. AI analysis was broken since ~March 2026.
- **Missing `decrement_analysis_count` RPC**: Edge function calls this on analysis failure to refund the quota increment, but the function didn't exist. Created it — failed analyses now correctly refund the counter instead of permanently inflating `job_analyses_count`.

### Security
- **Waitlist bypass patched (AI-42)**: Added `check_user_exists` waitlist gate to `PlansOnboardingStep.tsx` before any auth call (both password and magic-link paths). Matches the gate in `AuthModal`. Previously an unapproved email could bypass the waitlist by going through the onboarding flow directly.
- **Test accounts deleted**: Removed 4 fake accounts (`ryan@ryan.com`, `testuser@gmail.com`, `tester@gmail.com`, `test.checkout.errorcap@gmail.com`) from auth and profiles.
- **Usage limits fixed**: `check_analysis_limit` was using a stale lifetime counter for Plus and Pro. Replaced with rolling windows — Plus: 200/week, Pro: 100/day. Old duplicate function overloads removed.
- **Dependabot: undici bumped to 8.5.0 / 7.28.0** (alerts #46–#49): Resolved 2 high and 2 medium severity vulnerabilities in `undici` — TLS certificate validation bypass (GHSA-vmh5-mc38-953g), cross-user information disclosure via shared cache whitespace bypass (GHSA-pr7r-676h-xcf6), WebSocket DoS via cumulative fragment bypass (GHSA-38rv-x7px-6hhq), and WebSocket DoS via fragment count bypass (GHSA-vxpw-j846-p89q). Root `undici` bumped to `8.5.0`; `jsdom`'s transitive `undici` pinned to `7.28.0` via nested override for API compatibility.

---


## [2.42.0] — 2026-06-12

### Changed
- **Resume storage cleanup**: Removed the wasted `resumes` Supabase query from `syncLocalToCloud` (result was never used after the Vault removal). `clearAllData` now also deletes the user's Supabase resume rows — previously it only cleared localStorage keys that no longer get written. Removed unused `ResumeProfile` import from `storageService.ts`. Updated `scripts/test-harness.ts` analysis and cover letter prompts to match current app versions (program requirement interpretation, evidence bridge tailoring instructions, Evidence Variety Rule, Fit Calibration).
- **Resume storage: Supabase-only (AI-26)**: Removed the Vault/localStorage dual-write from `resumeStorage.ts`. Reads and writes now go directly to Supabase — no local cache, no merge logic, no device-specific encryption key. `syncLocalToCloud` no longer tries to sync local resume data. Onboarding privacy copy updated to reflect cloud sync instead of "Local Vault".
- **Resume storage refactor**: Migrated from a single blob-per-user row to one row per profile, keyed on `(user_id, profile_id)` with a UNIQUE constraint. `saveResumes` now upserts each profile individually — eliminating the SELECT-then-INSERT race condition that created 378 duplicate rows. `getResumes` reconstructs the profiles array by reading all rows for the user. Existing data migrated in-place; 378 duplicate rows cleaned up.
- **AI-ban confirmation gate**: Cover letter generation is now blocked for employers on the AI ban list (e.g. TTC). Auto-generation is suppressed; the editor shows a warning screen explaining the employer's policy with two explicit choices — "Generate for reference only" (requires a click to acknowledge) or "I'll write it myself". The passive post-generation warning banner remains as a reminder once a letter exists.
- **Jobs-First Strategy Pivot**: Streamlined the entire platform to focus exclusively on Job Match and Application outcomes. Hidden Career Growth, Skills Interviews, and Education modules from the primary navigation, onboarding flows, pricing pages, and public features registry.
- **Leaner cover letter prompts**: Cover letter generation now passes a focused job context (distilled key skills + responsibilities + 2,000-char raw excerpt) instead of the full raw JD, and filters the resume to only the blocks the job analysis flagged as relevant — reducing prompt size significantly while keeping the signal.
- **Deterministic AI-ban detection**: `isAiBanned` is now a two-layer check that runs before any AI call. First, `detectAiBan` scans the job text for ban-language patterns. Second, `checkKnownEmployerBan` checks the extracted company name against `src/data/knownAiBanEmployers.ts` — a maintained list of employers whose policies are confirmed regardless of whether they include ban language in every posting. TTC is the first confirmed entry. Add new entries as they are discovered.
- **Smarter program requirement scoring**: Job analysis now reads JD language before penalizing for program mismatch — "or related field" clauses recognise Urban Planning as adjacent for transit/infrastructure/municipal roles; "considered an asset" lines no longer penalise the compatibility score; explicit "we encourage you to apply" language from the employer now shifts scoring toward demonstrated skills over credentials.
- **Cover letter quality improvements**: Three targeted changes to produce less generic, better-calibrated letters: (1) `coverLetterTailoringInstructions` in the job analysis prompt now requires explicit evidence-to-requirement mapping with resume block IDs rather than generic strategy bullets; (2) v1_direct template adds an Evidence Variety Rule (each paragraph must anchor to a different block) and a Fit Calibration rule (low-score jobs get a learning-trajectory framing instead of overstating fit); (3) the cover letter editor injects the job's compatibility score as context so the prompt automatically adjusts framing based on match strength.

### Fixed
- **Onboarding Stability**: Resolved TypeScript compilation errors in `OnboardingPage` to ensure stable deployment.
- **Resume data loss on reload**: Manually-added resume entries (e.g. new job blocks) were silently lost on the next login. Three bugs compounded: (1) `saveResumes` had no `ORDER BY` on its Supabase SELECT so it updated an arbitrary row while `getResumes` always read the newest — edits landed in a row that was never read back; (2) the save effect in `useResumeEditor` held a reference to the full `initialResume` object in its dependency array, triggering a perpetual save loop that caused hundreds of duplicate Supabase row inserts; (3) PDF imports could overwrite the editor's block state with pre-import data because the render-time sync only checked profile ID changes. Fixed by adding `ORDER BY created_at DESC` to `saveResumes`, removing the full object from effect deps, and introducing an `importRevision` field that triggers the editor sync on each import.

### Security
- **Dependency Bumps**: Updated a significant number of core project and browser extension dependencies to their latest secure versions.

---

## Older Releases
Earlier release history is available in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
