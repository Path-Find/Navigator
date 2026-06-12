# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased]

### Changed
- **Jobs-First Strategy Pivot**: Streamlined the entire platform to focus exclusively on Job Match and Application outcomes. Hidden Career Growth, Skills Interviews, and Education modules from the primary navigation, onboarding flows, pricing pages, and public features registry.

### Fixed
- **Onboarding Stability**: Resolved TypeScript compilation errors in `OnboardingPage` to ensure stable deployment.
- **Resume data loss on reload**: Manually-added resume entries (e.g. new job blocks) were silently lost on the next login. Three bugs compounded: (1) `saveResumes` had no `ORDER BY` on its Supabase SELECT so it updated an arbitrary row while `getResumes` always read the newest — edits landed in a row that was never read back; (2) the save effect in `useResumeEditor` held a reference to the full `initialResume` object in its dependency array, triggering a perpetual save loop that caused hundreds of duplicate Supabase row inserts; (3) PDF imports could overwrite the editor's block state with pre-import data because the render-time sync only checked profile ID changes. Fixed by adding `ORDER BY created_at DESC` to `saveResumes`, removing the full object from effect deps, and introducing an `importRevision` field that triggers the editor sync on each import.

### Security
- **Dependency Bumps**: Updated a significant number of core project and browser extension dependencies to their latest secure versions.

---

## Older Releases
Earlier release history is available in the [Changelog Archive](./CHANGELOG_ARCHIVE.md).
