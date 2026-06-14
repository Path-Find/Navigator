# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Changed
- **Resume: Add Entry modal (AI-44)**: Clicking "Add Entry" now opens a modal with Title, Organization, and Date fields instead of silently appending a blank card to the bottom of the list. Date field includes a format hint ("Month Year — e.g. Jan 2024 – Present"). Summary and Skill sections still add directly. `useResumeEditor.addBlock` updated to accept optional initial field values.
- **Admin dashboard overhaul (AI-43)**: Removed all `uppercase` CSS across the entire page (labels, table headers, badges, stat cards). Fixed broken StatsCard icons — `bg-color bg-opacity-X` is incompatible with Tailwind JIT; replaced with explicit `iconBg`/`iconColor` props using slash-notation. Reduced oversized `rounded-[32px]`/`p-8` to `rounded-2xl`/`p-6`. Removed Simulate tier switcher. Replaced "cohort" jargon with plain language throughout.
- **History page consistency (AI-45)**: `maxWidth` corrected from `5xl` → `6xl` to match Feed, Jobs, and all other pages. Empty state updated to use `card-premium` wrapper and gradient icon circle, matching Feed's empty state.
- **Light mode default**: Removed system dark-mode preference fallback; app now defaults to light mode when no saved preference exists in localStorage.
- **Header icon order**: Moved icon group (Admin, Theme, Settings) before Sign Out button.
- **Jobs route**: `/jobs` now routes directly to the job match input instead of the homepage.

### Security
- **Waitlist bypass identified (AI-42)**: `PlansOnboardingStep.tsx` calls `supabase.auth.signUp` without the `check_user_exists` waitlist gate present in `AuthModal`. One external account (disposable email, zero usage) was created via this path. Issue logged as urgent in Linear.

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
