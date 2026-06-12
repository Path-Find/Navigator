# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Changed
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
