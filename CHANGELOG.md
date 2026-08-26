# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for earlier history.

## [Unreleased]
### Changed

- **Improved adaptive Skills scenarios**: follow-up questions now target earlier weaknesses without repeating the same setting or crisis.
- **Reduced Skills interview page height**: removed the duplicate viewport reservation so the conversation and answer box fit more naturally on screen.
- **Made Skills interviews adaptive**: questions now arrive one at a time, with the next question chosen from the answer and the interview ending when enough evidence is collected.
- **Added conservative skill canonicalization**: obvious spelling, abbreviation, and product-name variants now share one canonical skill without merging merely similar skills.
- **Consolidated duplicate communication skills**: “Communication,” “Communications,” and “Communications Skills” now behave as one skill in the Skills view and interview flow.
- **Made Skills interview selection user-controlled**: saved jobs influence the default ranking, users choose up to five skills, and unselected skills are never silently dropped.
- **Clarified the Skills interview**: the flow now explains what will happen, shows question progress, and uses measured completion language instead of “mastery” or “banking” claims.
- **Structured education credentials**: education entries now use a consistent credential-type selector while keeping the full degree or program name in the title.
- **Refined resume date controls**: styled month/year selectors now replace the native picker, and existing entries use one current-state control.
- **Replaced freeform resume dates**: entries now use month selectors and a Current checkbox so date ranges are consistent.
- **Made resume-story interviews type-aware**: project and volunteer entries now receive questions tailored to their goals, contributions, and impact instead of generic work-interview wording.
- **Removed resume-story interviews from education entries**: the action now appears only where capturing work or project depth is useful.
- **Standardized career-model AI context**: trajectory and role-gap analysis now use target-relevant resume evidence and the shared retry, usage, and logging controls.
- **Centralized AI context selection**: unrelated approved profile details are filtered out consistently, with shared resume and course limits preventing prompt rules from drifting across features.
- **Focused AI context beyond interviews**: cover letters and education tools now send only relevant resume blocks and capped coursework, while AI logs record prompt-size metrics for cost review.
- **Focused interview AI context**: each prompt now receives only the most relevant resume blocks, skills, and approved profile details needed for that task.
- **Hardened interview inputs**: answer length is capped, oversized AI requests are rejected server-side, and repeated interview requests are throttled.
- **Kept interview feedback professional**: profanity and insults in answers are not repeated verbatim in coaching.
- **Removed duplicate interview actions**: opening both STAR and ARC guidance now leaves one clear way to continue.
- **Gave feature cards distinct accents**: the homepage and Features page now use the shared palette so cards are easier to tell apart without bringing purple or pink back.
- **Made interview answer-framework help additive**: users can learn STAR and ARC independently without replacing earlier explanations.
- **Fixed interview framework recommendations**: experience examples, obstacles, conflicts, and mistakes now recommend STAR instead of falling through to ARC.
- **Made interview framework recommendations explicit**: generated questions now carry STAR or ARC metadata, with wording-based fallback for older questions.
- **Made interview framework guidance inline**: STAR and ARC coaching now stays compact beside the question instead of appearing as a large separate card.
- **Simplified resume coaching labels**: answer-based resume feedback now uses a shorter, lighter “Resume suggestion” treatment.
- **Clarified resume suggestion actions**: users now see “Save suggestion” and “Copy text” instead of unexplained icon-only controls.
- **Renamed the resume suggestion storage area**: “Discovery Bank” is now “Saved resume suggestions,” with plain-language review guidance.
- **Made interview completion visible**: the final response now shows a clear end-of-session message instead of relying on the disabled input hint.
- **Fixed premature interview completion**: the end message now waits for response analysis and follow-up insertion to finish.
- **Shortened interview sessions**: general interviews now start with eight questions, allow at most two follow-ups, and show progress through the session.
- **Added an evidence-based interview summary**: completed sessions now show reviewed-answer counts plus the strongest themes and next areas to improve.
- **Made the interview ending conversational**: the transcript now explicitly says when the last question is complete before showing the summary.
- **Added an optional job-specific closing exercise**: tailored interviews now leave space for candidates to write their own questions for the employer after the results.
- **Added optional question coaching**: candidates can ask Navigator to review their own employer questions without replacing them with canned prompts.
- **Restored homepage feature colours**: category accents are visible again using blue, teal, green, and amber while purple and pink remain out of the palette.
- **Standardized lifecycle labels**: unfinished features consistently use “Coming soon” across cards, plans, and feature listings.
- **Separated homepage feature accents**: Match, Cover Letters, Resume, and History now use distinct blue, amber, green, and teal treatments.
- **Made homepage colour assignments explicit**: the four public cards now map directly to unique blue, amber, green, and teal accents.
- **Removed the interview progression-button gradient**: the button now uses a flat grey treatment.
- **Made interview rewrites sound conversational**: resume-grounded introductions now turn action bullets into first-person statements instead of quoting resume text.
- **Preserved interview button treatment during the palette change**: action buttons retain their original hierarchy and shape while using grey accents.
- **Made resume prompts compact and inline**: company and experience hints now sit beside a short “Think about” label instead of taking over the question card.
- **Separated interview suggestions from actions**: optional resume prompts now use muted chips instead of looking like controls that advance the interview.
- **Preserved interview messages during coaching**: STAR guidance and the ready-to-answer prompt now appear as new messages instead of replacing the introduction.
- **Replaced the purple application-wide accent system**: general UI now uses a neutral grey palette, with colour reserved for meaningful states and feature categories.
- **Placed interview progression beside the completed response**: “Next Question” now appears directly after the answer and coaching instead of below the disabled composer.
- **Grounded interview introductions in user evidence**: “Tell me about yourself” coaching now assembles an answer from the resume and verified skills instead of generic placeholders.
- Centralized feature lifecycle helpers and generated footer navigation from the feature registry.
- Removed placeholder legal and privacy email addresses in favor of the contact form.
- Removed unfinished Career/Education and job-alert claims from upgrade and comparison surfaces.
- Hid unfinished interview, Feed, roadmap, mentor, transcript, and program destinations from navigation.
- Marked the live Practice Interviews experience as available instead of “Coming soon.”
- Removed placeholder social and support contact details so users are not sent to unowned accounts.

### Fixed

- Interview question guidance now keeps the approach and resume prompts together.
- Interview progress no longer advertises a fixed question count.
- Interview guidance choices now appear as user replies before Navigator responds.
- **NextGen diagnostics no longer duplicate profile preferences**: personal learned-style and activity details now live in Application Profile, alongside editable cover-letter style.
- **NextGen is automatic for admins and no longer has a confusing toggle**: eligible users see it in Application Profile, where its personal learned context belongs.
- **Application Profile is now reachable from Resume**: resume context and preferences are linked from the workflow where they are used instead of living under account settings.
- **Application Profile subsection headings are now readable**: labels use normal capitalization, sizing, and spacing instead of appearing like tiny all-caps metadata.
- **Profile review prompts no longer repeat the same resume finding**: the question asks for confirmation, the resume fact appears once, and the reason only explains the evidence.
- **Additional profile context no longer repeats the resume**: stale experience, education, skill, and imported facts are removed from that section and kept in the appropriate resume or structured profile area.
- **Removed the unused Additional profile details section**: profile information now lives only in the dedicated sections that explain how Navigator uses it.
- **Renamed Stories to Application examples**: the label now explains that these are reusable anecdotes for applications.
- **Removed meaningless reorder controls from Professional Summary**: up/down arrows remain only for ordered resume bullets.
- **Aligned resume editor actions**: Add Line, Move, and section controls no longer wrap or sit at mismatched heights.
- **Stopped current-status controls from overlapping resume titles**: long education and work titles now reserve space for their action button.
- **Simplified Interview Advisor cards**: the selection screen now uses compact neutral cards instead of four competing accent colours.
- **Renamed Interview Advisor options in plain language**: the choices now describe what each practice mode actually does.
- **Removed the redundant Interview Tips card**: Interview Advisor now focuses on the three actions users can actually take.
- **Combined interview practice modes**: one Practice interview card now offers general or specific-job practice without making them look like separate products.
- **Sunset the Feed surface for now**: removed its navigation and homepage card, while old Feed URLs return users to Jobs.
- **Removed the stale policy-update homepage card**: Terms and Privacy remain available in the footer without showing an outdated recurring notice.
- **Centralized homepage feature colours around neutral and indigo tones**: rose/pink accents are gone from feature cards, while rose remains available for actual errors and negative statuses.
- **Fixed the Admin Usage Deviations loading state**: admin metrics now use Navigator’s current Neon data connection instead of the retired Supabase client.
- **Finished the client data-layer audit**: active similarity and waitlist operations now use Neon too; the only remaining Supabase payment code is behind the intentional checkout kill switch.
- **Fixed the Update Focus homepage destination**: it now opens Application Profile instead of the old Settings page.
- **Simplified the availability save confirmation**: it now uses user-facing language instead of internal “structured” terminology.
- **Removed Upgrade from paid, tester, and admin navigation**: only free users see the upgrade prompt.
- **Clarified plan access labels**: current and admin/tester access no longer appears as the vague “Access included,” and sunset Feed no longer appears as a plan feature.
- **Added cover-letter quality checks for Free and Plus**: weak drafts now receive an honest-gap rewrite instead of shipping unchecked.
- **Hid unfinished integration controls**: browser-extension, email-alert setup, and inbound-email usage metrics no longer imply those flows are ready.
- **Simplified Application Preferences**: removed the unnecessary collapse control and moved the profile interview action into the page header with clearer wording.
- **Restored the resume-story interview option**: Interview Advisor now has practice, profile, and resume-context paths as three clear choices.
- **Moved practice-mode selection into the interview flow**: the Practice card now starts one interview entry point, which asks whether to use general or specific-job practice.
- **Added profile interview context before questions**: users now see what will be saved and how it will be reused before answering.
- **Made practice mode a real interview opening**: the first chat interaction asks whether to practice generally or for a specific job, while STAR help remains available inside the interview.
- **Made the resume-story card launch the resume interview**: choosing that path opens the resume and starts with an experience ready to discuss.
- **Fixed tailored interview job search**: typed job searches now check saved jobs and explain when a matching job still needs analysis.
- **Hide unavailable tailored practice**: users without saved jobs now see only general practice until they have a role to prepare for.
- **Sequence interview openings**: the first question now waits until the user continues past the interview introduction or STAR explanation.
- **Unified interview presentation**: Resume Story now uses the same full-screen coaching layout as the main interview experience instead of a separate modal.
- **Separated interview actions from suggestions**: opening choices now look like buttons, while resume prompts remain lightweight suggestion chips.
- **Put practice mode selection inside the interview shell**: choosing general or specific-job practice now starts in the focused Interview Advisor experience.
- **Restore public footer links**: Resume and History now appear under Jobs again while unfinished features stay hidden.
- **Center homepage cards responsively**: four-card homepages now use a centered four-column layout while five-card homepages keep the existing five-column layout.
- **Make STAR coaching additive**: STAR guidance now appears as a separate coaching message with rotating examples instead of replacing the interview introduction.
- **Disable answer input until needed**: interview typing stays visible but greyed out during introductions and coaching choices, then enables for actual questions.
- **Recommend answer structures by question**: interview prompts now suggest STAR for experience stories and ARC for direct, technical, or situational questions.
- **Ground “Better” answers in the resume**: interview coaching now uses the relevant resume evidence and avoids inventing placeholder accomplishments.
- **Renamed the plan limit from Alerts to Email alerts**: the pricing page now makes clear that this means forwarded job-alert emails.
- **Removed sunset job surfaces**: Feed and Job Alerts no longer appear as usable homepage or Features-page options, and Resume Interview no longer appears as “Story Mode” or “Soon.”
- **Added an optional STAR explanation at interview start**: users can get a plain-language framework and example before answering, or continue immediately.
- **Reconnected Resume Interview to resume entries**: work, education, volunteer, and project entries can now be interviewed individually to capture useful context behind them.
- **Application Profile no longer repeats the resume entry list**: current-role controls remain in the Resume editor instead of duplicating every role and school entry.
- **Resume dates now explain their expected format**: entry editing clearly asks for Month + Year and shows examples for past and current roles.
- **Settings now focuses on account management**: application preferences and reusable resume context have their own Application Profile page instead of crowding account settings.
- **Settings no longer opens as one long editor**: application-profile details are collapsed until needed, keeping account controls and integrations easy to scan.
- **Analysis usage no longer resets when saved jobs are deleted**: paid-plan limits and usage displays now count permanent analysis records instead of job-history rows.
- **Cover-letter generation now surfaces hard eligibility requirements first**: applicants must confirm the posting’s stated citizenship, residency, licensing, certification, or other non-negotiable conditions before Navigator drafts or refines a letter.
- **Admin and tester accounts no longer see paid-plan prompts**: plan comparisons now recognize access above Pro, while upgrade messaging uses direct language about what each plan provides.
- **Resume editing no longer shows the unrequested “Tell Your Story” control**: the editor stays focused on resume content and actions users asked for.
- **Cover letters no longer mechanically repeat resume metrics**: achievement facts remain grounded while numbers can be rounded, generalized, or omitted when natural wording is stronger.

### Security
- **Patched the high-severity nanoid denial-of-service vulnerability**: the development dependency now resolves to a fixed release.

## [2.43.13] — 2026-08-11

### Added
- **Signup now captures the name used on applications**: generated letters have a reliable account-owned name from the start.
- **Resume entries can be marked current**: current work, volunteer, education, and project entries move to the top of their section and can be used explicitly in applications.
- **Profile review now includes cautious resume observations**: users can confirm or reject possible education and career-stage patterns before Navigator reuses them.
- **Application profiles can prioritize reusable resume blocks**: users can select important experience without re-entering details or copying bullets into prompts.
- **Availability preferences now use structured choices**: users can save their city, relocation preference, work arrangement, employment type, and start timing.
- **Reusable application context can be reviewed in Settings**: confirmed facts, stories, skills, education evidence, and interview answers remain separated and removable.
- **Cover-letter style preferences now follow the user across applications**: account-level tone, voice, and length preferences stay separate from job-specific facts.
- **Cover-letter generation now adapts to the job and candidate situation**: relevant style and early-career or education signals are added only when supported.

### Changed
- **Profile settings now group current focus, writing preferences, reusable context, and observation decisions**: users have one place to manage how Navigator understands and represents them.
- **Confirmed observations now return for review when their resume evidence changes**: outdated inferences stop affecting AI calls until reconfirmed.
- **Homepage feature cards now fit into one row on desktop**: the five-card layout uses the available width more effectively.
- **Application status reminders now explain why outcome updates matter**: calmer controls connect feedback to better future guidance and applications.
- **NextGen now learns from application outcomes and actual letter usage**: interviews and offers reinforce patterns, while applications and ghosted jobs remain neutral; copy and download actions identify the stored letter used.
- **NextGen feedback is anonymized before storage**: personal names, contact details, URLs, and internal identifiers are removed from learning signals.
- **Mock interviews now always begin with “Tell me about yourself”**: the remaining questions are still generated for the specific role.
- **History now has a dedicated filter for jobs needing attention**: failed analyses no longer disappear among ordinary saved jobs.
- **Feed and Skills Interview are now consistently gated as beta features**: non-admin users cannot reach them through navigation, direct URLs, or bookmarks.

### Fixed
- **Production deployments no longer fail after dependency updates**: TypeScript remains on the supported 6.x line for Vercel compatibility.
- **Cover-letter output now has consistent application-owned greetings and sign-offs**: generic greetings are the default, clearly named contacts are used when available, model placeholders are removed, and print output does not duplicate the closing.
- **Education is no longer inferred as current from a year alone**: explicit wording such as “Present,” “Ongoing,” or “Expected” is required.
- **Manual cover-letter revisions no longer repeat the same critique twice**: revision guidance stays in one bounded instruction.
- **AI calls now use compact, relevant context**: parsed job requirements, selected resume evidence, employer hooks, skills, and academic evidence are reused downstream instead of resending full postings, full resumes, or raw transcripts.
- **AI prompt inputs are now clearly bounded as data**: job postings, resumes, candidate responses, and optional context cannot as easily override the task or leak internal labels and resume-block IDs.
- **Tailoring Strategy now gives forward-looking advice without exposing prompt fields or implementation identifiers.**
- **Job requirements now preserve required, preferred, and hard-gate distinctions**: scoring and downstream writing use the same priority information, including when older analyses are upgraded.
- **Fit analysis is more stable and honest**: repeated analyses produce more consistent scores, empty resumes no longer receive grounded-looking scores, and weak-fit Pro letters name hard gaps instead of repeatedly trying to persuade past them.
- **Cover-letter quality checks now catch unsupported tools and copied resume sentence structures**: generated prose must remain grounded in the supplied evidence.
- **Verified interview skills remain visible even when their names are not written verbatim in a resume bullet.**
- **Match insights now address the user directly instead of referring to “the candidate.”**
- **Job ingestion is more reliable**: repeated website boilerplate is cleaned, short pasted descriptions are preserved, invalid URLs are explained accurately, and one submission cannot create duplicate jobs.
- **Saved-job and resume storage is safer**: large histories sync without browser overflows, sign-out no longer deletes cloud resumes, duplicate job inserts are prevented, and cleanup failures are surfaced.
- **Neon-backed features now use the same live data source**: cover-letter tailoring lookups and admin usage data no longer depend on the retired Supabase path.
- **A stray debug message no longer replaces the “job not found” screen.**

### Security
- **Patched five undici vulnerabilities, including one high-severity issue**: both the top-level and nested dependency copies now resolve to patched versions.
- **Patched the high-severity brace-expansion denial-of-service vulnerability**: the dependency override now requires the patched release.

## [2.43.12] — 2026-07-31

### Fixed
- **Signing in didn't visibly sign you in**: the header/app state stayed on "logged out" after a successful sign-in until the page was manually refreshed. `signInWithPassword` never notified the app of the new session in the same tab (only on page load or from another tab) — the sign-in form now pulls the fresh session directly instead of waiting on that notification.

## [2.43.11] — 2026-07-31

### Fixed
- **API routes still 500'd after 2.43.10, for a second reason**: the handlers are written against the Web `Request`/`Response` API, but Vercel only passes a Web `Request` when a module exports a `fetch` member. A bare `export default function handler` is read as the legacy Node `(req, res)` signature, so every `req.headers.get(...)` threw `is not a function`. All four functions now `export default { fetch: handler }`.
- **The browser blocked every Neon request**: the Content Security Policy in `index.html` still allow-listed only `*.supabase.co`, so `connect-src` refused all calls to Neon Auth and the Neon Data API. Sign-in could not have worked from a browser regardless of the server-side fixes — confirmed against the live site, where a fetch to Neon fails while the same fetch to Supabase succeeds. Added `https://*.neon.tech`.
- **Semantic search embeddings were dead twice over**: the client still asked for `text-embedding-004`, which Google has retired, and that request overrode the server-side default. Even once corrected, the proxy attached `generationConfig` to embedding calls, which `embedContent` rejects with a 400. Both fixed — embeddings now return successfully.
- **Per-user token counts were never recorded**: `track_usage` was called with two arguments when it takes one, and its body resolves the caller through Supabase's `auth.uid()`, which doesn't exist on Neon. The failure was swallowed by a catch, so `daily_usage.token_count` read 0 for every row ever written. The proxy now writes the usage row directly using the already-verified user ID, which is what makes per-feature cost tracking possible.
- **Expired sessions looked like server errors**: an unauthenticated call to the AI proxy returned 500 and to job scraping returned 400, so the app retried instead of prompting a fresh sign-in. Auth failures now consistently return 401 across all four routes.
- **"Forgot password" emails led nowhere**: the reset link redirected to `/settings`, which sits behind the logged-in route guard — a visitor arriving with only a one-time recovery token (no session) was bounced straight to the homepage with no way to set a new password. Added a public `/reset-password` screen that reads the token and completes the reset, and pointed both password-reset call sites at it.
- **"Change" and "Forgot?" links on the sign-in form didn't match**: different font sizes and different right-edge alignment. Both now `text-xs` and sit flush with each other.

### Security
- **AI proxy leaked internal exception text**: `gemini-proxy` returned the raw error message to the client, which can name internal tables and environment variables. 2.43.9 removed this from the account, profile, and scraping routes but missed this one. The detail now stays in the server log.

### Changed
- **`api/` is now type-checked**: added `api/tsconfig.json`, which was missing entirely — the root config only covered `src` and `vite.config.ts`, so Vercel compiled these files with its own defaults and reported `process` as undefined on every build. That noise is what let a genuinely broken deploy look green. Typing the request and response bodies it turned up also removed several unchecked reads of `unknown`.

## [2.43.10] — 2026-07-31

### Fixed
- **All API routes were dead in production**: every `/api/*` function crashed on cold start with `ERR_MODULE_NOT_FOUND`. The shared `_lib` helpers were imported without a `.js` extension, which Node's ESM resolver rejects — so auth, profile reads, job scraping, and all AI generation returned 500. Watch for this on any new `api/` file: the build only reports it as a non-fatal TS2835 diagnostic, so a broken deploy still goes out green.
- **Every AI feature was pointed at retired Gemini models**: `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-2.5-pro`, `gemini-3-pro`, and `text-embedding-004` all now return 404 "no longer available to new users". Job parsing, scoring, cover letters, interviews, and embeddings would each have failed on a fresh API key. Switched to Google's floating `-latest` aliases so this can't silently rot again.
- **`thinkingBudget: 0` is rejected by Gemini 3.x**: the proxy sent it on every call, so even with working models each request would have 400'd. Replaced with `thinkingLevel: 'low'`, which is the supported way to minimise thinking and still returns zero thought tokens on the flash models.
- **JWT verification rejected valid Neon Auth tokens**: `verifyUser` required the `iss` claim to equal the Neon Auth *origin*, but Better Auth (which Neon Auth runs) issues `iss` as the full base URL including the `/neondb/auth` path. Every authenticated API call would have 401'd once the routes came back up. Both spellings are now accepted.

## [2.43.9] — 2026-07-28

### Security
- **Code scanning**: Stopped returning internal exception details from account, profile, and job-scraping APIs.

## [2.43.8] — 2026-07-27

### Fixed
- **Vercel deployment**: Pinned TypeScript to the supported 6.x line so API functions bundle without the TypeScript 7 compiler crash.

## [2.43.7] — 2026-07-27

### Security
- **Dependabot #55–#64**: Aligned the Neon Auth lockfile metadata and Better Auth passkey package with the patched `1.6.25` dependency graph.

## [2.43.6] — 2026-07-27

### Security
- **Dependabot #55–#64**: Pinned the transitive Better Auth dependency to `1.6.25`, resolving all 11 current Better Auth advisories.

## [2.43.5] — 2026-07-27

### Security
- **Dependabot #51**: Pinned `brace-expansion` to the patched release so transitive ESLint dependencies cannot resolve the vulnerable version.

## [2.43.4] — 2026-07-27

### Added
- **Neon migration (in progress)**: `gemini-proxy` ported from a Supabase Edge Function to a Vercel Function (`api/gemini-proxy.ts`), and Neon Auth wired up as the future auth provider (`src/lib/auth-client.ts`). Supabase remains the live backend for now — this is infrastructure groundwork, nothing user-facing has switched over yet.
- **Neon migration: auth cutover**: `UserContext.tsx` and 12 other files now drive sign-in/session/profile reads through Neon Auth instead of Supabase Auth, via a new `api/profile.ts` and `api/check-user-exists.ts`. Known gap: `paymentService.ts` (billing portal) and `scraperService.ts` still depend on a live Supabase session and will stop working once this ships, until their edge functions are ported too.
- **Neon migration: data layer**: the whole local-first storage layer (jobs, resumes, skills, role models, target jobs, feedback, `useJobFeed`) now reads/writes through Neon's Data API (a PostgREST-compatible endpoint with RLS enforced via Neon Auth JWTs) instead of Supabase — same query API, so the existing conflict-resolution/merge logic in each storage module is unchanged. Still on Supabase: `paymentService.ts`, `scraperService.ts`, and a few non-critical R&D/telemetry calls (`usageLimits.ts`, `embeddingService.ts`, `aiCore.ts`'s debug log).
- **Neon migration: scraper ported**: `scrape-jobs` moved to a Vercel Function (`api/scrape-jobs.ts`), including its SSRF-safe fetch/DNS validation. `paymentService.ts`'s billing portal was found to already be non-functional independent of this migration — `stripe-webhook` was meant to populate `profiles.stripe_customer_id` but that column doesn't exist and checkout has been kill-switched for a while, so it's left on Supabase rather than porting dead functionality.
- **Neon migration: complete except payments**: remaining R&D/telemetry calls (`usageLimits.ts`, `embeddingService.ts`, `aiCore.ts`'s debug log) moved to Neon. Every real, working feature in the app now runs on Neon — only the already-dead billing-portal path is still on Supabase.

### Security
- **Dependabot #53**: Upgraded React Router to the patched 8.3.0 release to resolve the RSC CSRF vulnerability.

## [2.43.3] — 2026-07-12

### Fixed
- **Extension**: Resolved Tailwind v4 PostCSS build issue in the browser extension by installing `@tailwindcss/postcss` and updating `extension/postcss.config.js`.

## [2.43.2] — 2026-06-21

### Fixed
- **GitHub Pages: Node 20 → 22**: Workflow was using Node 20 which doesn't satisfy the `>=22.19.0` engine requirement from `undici`/`jsdom` deps — causing `npm ci` to fail before the build even ran. Bumped to Node 22. Also set `cancel-in-progress: false` to prevent the race condition where back-to-back pushes caused the second deployment to be rejected while the first was still in progress.
- **Dependabot #50: `@babel/core` overridden to `>=7.29.6`**: Resolved the arbitrary file read via sourceMappingURL vulnerability (GHSA-4x5r-pxfx-6jf8). Added a top-level override so npm resolves `@babel/core` to the patched version without downgrading `eslint-plugin-react-hooks`. `npm audit` now reports **0 vulnerabilities**.

## [2.43.1] — 2026-06-21

### Fixed
- **Build: unused imports removed** (`AdminDashboard.tsx`, `AddEntryModal.tsx`): Removed `Cpu`, `ShieldCheck`, `Zap` from `AdminDashboard` and `AnimatePresence` from `AddEntryModal` — leftover from the admin overhaul and Add Entry modal work. TypeScript's `noUnusedLocals` flagged these at build time, causing Vercel deployment failures.
- **Build: `tsc -b --force`**: Changed build script from `tsc -b` to `tsc -b --force` to prevent stale incremental TypeScript build cache on Vercel from producing false-positive unused-variable errors after cache restores.

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

## [2.41.0] — 2026-06-05

### Added
- **Navigator V3 Roadmap**: Documented the strategic direction for V3, focusing on a Jobs-first architecture and end-to-end outcome loops.

### Fixed
- **Sign-out Reliability**: Improved `signOut` logic to handle missing auth sessions gracefully and added toast notifications for failure states.
- **Cleanup**: Purged legacy agent workflows and temporary lint artifacts to maintain repository hygiene.

### Changed
- **Storage Management**: Added internal test user and tier keys to the global clear-data sequence to ensure complete local resets.

## [2.40.0] — 2026-05-24

### Changed
- **PDF Infrastructure Hardening**: Resolved CDN loading failures by migrating the PDF loader to modern ESM dynamic imports and upgrading to `pdf.js` v4.3.136. This improves reliability across various network environments and addresses known security vulnerabilities in older versions.
- **Streamlined Generation UI**: Overhauled the cover letter generation progress screen to eliminate conflicting status labels and resolve the "card-in-card" nesting issue. Unified the display into a single high-fidelity animated title with a minimalist icon and progress indicator.
- **Information Conciseness Pass**: Restructured tailoring strategy and critique feedback prompts to enforce extremely concise, 1-sentence bullet points. Added UI-level capping to sidebars, restricting visible strategy and feedback items to a maximum of 3 to prevent information overload.
- **Responsive Grid Architecture**: Optimized the homepage `FeatureGrid` for standard laptop viewports (1280px-1440px) by adjusting breakpoints to a 4-column layout and implementing `max-w-md` constraints to prevent card stretching on sparsely populated rows.
- **Contextual Nudge Placement**: Relocated the `NudgeCard` from the top of the page to a focused area between the `PageHeader` and `FeatureGrid`, improving the visual hierarchy and preventing dashboard "push-down."
- **Nudge Card Aesthetic Overhaul**: Stripped aggressive tilt and glow animations from the `NudgeCard` in favor of the platform-standard `.card-premium` glassmorphism. Simplified the action workflow to focus on primary status updates (Interview, Rejected, Ghosted).
- **Refined Hero Scaling**: Compacted the `PageHeader` typography and vertical margins for the `hero` variant to better utilize vertical space on smaller desktop screens.
- **Transcript Cloud Sync**: Migrated transcript storage from `LocalStorage` to the unified `Storage` service with full Supabase sync, versioning, and bidirectional conflict resolution.

## [2.39.2] — 2026-05-11

### Security
- **Dependency Patches**: Upgraded `vite` to 8.0.5 (arbitrary file read via WebSocket, `server.fs.deny` bypass, `.map` path traversal), `happy-dom` to 20.8.9 (fetch credential cookie leak, ECMAScript module code injection), and enforced `picomatch ≥4.0.4` via overrides (POSIX character class method injection) — applies to both root and extension packages.

## [2.39.1] — 2026-04-08

### Fixed
- **Build Stability**: Resolved a TypeScript regression in `CoachHero` where missing `userSkills` and `orgCount` props were causing deployment failures.

## [2.39.0] — 2026-03-30

### Added
- **High-Fidelity Feature Previews**: Completed the visual design system by implementing custom graphics for **'Resume Interview'** (Story Mode) and **'Professional Organizations'**, ensuring 100% high-fidelity coverage across the platform features page.

### Changed
- **Unified "Midnight Aurora" Design System**: Performed a platform-wide visual synchronization, standardizing all modules (Jobs, Career, Education) under a unified BentoCard architecture with consistent 32px/24px spacing tokens.
- **Premium Typography & Casing**: Systematically replaced all-caps and wide-tracking utilities with polished Title Case and Sentence Case formatting across all status chips, labels, and headers.
- **Hardened PDF & Transcript Infrastructure**: Implemented a triple-CDN fallback for `pdf.js` and local client-side text extraction to resolve "Connection issue" errors and increase reliability for large academic documents.
- **Streamlined Sidebar & Navigation**: Consolidated Resume and Cover Letter sidebars with a focus on 'Tailoring Strategy', removed redundant headers, and unified icon/bullet styling.
- **UX & Logic Refinements**: Permanent dismissal for legal notices, conditional rendering of empty state modules, and improved nomenclature (e.g., "Behavioral Training").
- **Component Source-of-Truth**: Refined `BentoCard` and `UnifiedUploadHero` to act as the primary layout engines, eliminating visual drift across platform modules.

### Fixed
- **Build Infrastructure**: Resolved a critical TypeScript regression in `CoachHero` where missing `userSkills` and `orgCount` props were causing build failures, restoring CI/CD deployment stability.
- **Typography Rendering**: Resolved an issue where labels failed to render correctly following the typography refactor in `GapAnalysisSection`.
- **UI Layout Glitches**: Fixed z-index layering in `JobfitPreview`, header positioning in the Job "Posting" tab, and resume upload flickering.

## [2.38.0] — 2026-03-24

### Added
- **Automated AI Critique**: Cover letters now undergo an immediate architectural and stylistic review upon generation, providing instant feedback without manual triggers.
- **Admin User Matrix**: A new high-fidelity management console for oversight of all registered accounts, subscription statuses, and aggregate activity.
- **Network Pulse Heatmap**: Integrated a real-time behavioral monitoring tool that tracks system-wide activity pulses across the last 28 days, using dynamic indigo-intensity scaling to highlight usage spikes.
- **AI Internal Scratchpad**: Implemented a private deliberation field in the job analysis schema for Gemini to record logical checks and self-reminders, preventing internal "thinking" from leaking into user-facing professional advice.
- **Cohort Filtering**: Granular analytics support for Admin, Tester, Free, and Pro tiers to ensure visibility for all user types.
- **PDF Export Service**: Integrated a shared, high-fidelity print utility for resumes and cover letters. It uses an isolated window with optimized CSS to ensure documents are exported exactly as they appear in the live preview.
- **Improved Cover Letter UX**: Replaced the static "refining" state with a live, high-fidelity `GenerationProgress` UI in the editor area, providing clear stage-based messaging.
- **6-Stage Agentic Sequence**: Implemented a comprehensive progress pipeline for cover letter generation (**Researching**, **Contextualizing**, **Mapping**, **Drafting**, **Critiquing**, **Polishing**) to increase transparency during the AI's "thinking" phase.
- **Typewriter Reveal Animation**: Added dynamic character-by-character reveal for stage labels, creating an immersive "active writer" feel during the drafting and refinement stages.

### Changed
- **Admin Dashboard Aesthetics**: Completely overhauled the Management Portal with a premium glassmorphic design language, depth-based cards, and refined typography.

### Removed
- **Manual Critique Trigger**: The redundant 'Review' and 'Critique' actions in the cover letter editor have been removed in favor of a seamless, automated workflow.
- **Premature Analytics Integration**: Reverted the unfinished system statistics fetching and Recharts integration to prioritize strategic discussion and design refinement.

### Fixed
- **Admin Visibility Gap**: Resolved a query logic issue where Admin and Tester activity was excluded from the behavioral analytics views.
- **Job Title Truncation**: Removed the restrictive `max-w-md` and `truncate` classes in the Job Detail header and History list.
- **Analysis Progress Honesty**: Removed the 99% progress cap in `useJobManager` and injected granular steps into `jobAiService` for a more dynamic matching process.
- **Skill Gap Visibility**: Enhanced the "Match Quality" card to display specific weaknesses and skill gaps when scores are low.
- **Job Analysis UI Fix**: Removed a redundant container background behind the analysis buttons in the landing view.
- **AI Tone Normalization**: Enforced standard Sentence Case through both prompt guardrails and UI-level sanitization to eliminate "shouting" in bullet points and match quality cards.
- **Maintenance**: Stabilized CI/CD infrastructure by resolving transient CodeQL rate limit bottlenecks.
- **Empty Feed State UI**: Refined the "No matches found" and Admin "Feed" empty states, replacing outdated dashed-border containers with modern, premium glassmorphic cards and subtle indigo accents.

## [2.37.0] — 2026-03-23

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

## [2.36.0] — 2026-03-22

### Changed
- **Major Dependency Refresh**: Upgraded the core stack to modern standards across the root and extension:
    - **React 19**: Updated extension and root to React 19.2.4.
    - **Tailwind CSS 4**: Bumped to Tailwind CSS 4.2.2 for the extension.
    - **Build Infrastructure**: Upgraded to Vite 8.0.1 and Vitest 4.1.0.
    - **SDKs**: Updated `@supabase/supabase-js` to 2.99.3 and `@stripe/stripe-js` to 8.11.0.

### Tests
- **Utilities & Storage**: Added comprehensive test suites for `promiseUtils`, `resumeStorage`, `skillStorage`, `stringUtils`, `salaryParser`, and `navigation`.
- **Hooks & Services**: Implemented tests for `useJobAnalysis`, `jobAiService`, `useJobManagerHelpers`, and `coachStorage`.


## [2.35.0] — 2026-03-20

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

## [2.34.0] — 2026-03-17

### Changed
- **UI Metadata Polish**: Stripped all decorative icons from job metadata (Location, Company, Date, Reference Code, Salary, Deadline) across both Job History and Job Detail views to reduce visual clutter and achieve a more premium, modern aesthetic.
- **Simplified Status Filters**: Removed icons from the status filter options in Job History for a cleaner interface.
- **Improved Header Proportions**: Reduced the font size and weight of job titles in the History view and Job Detail header for better visual hierarchy and balance.
- **Concise Analysis Tabs**: Renamed section headers in the Analysis tab (Insight, Skills, Strengths, Gaps, Competencies, Responsibilities) to single-word labels for maximum brevity and clarity.
- **Improved Modal UX**: Added backdrop-click-to-close functionality to `AuthModal` and `UpgradeModal`, allowing users to dismiss them by clicking outside the modal content area for a more natural interaction pattern.
- **Landing Page Clarity**: Shortened feature descriptions on the landing page feature grid to ensure visual consistency and a "punchy" 4-5 line maximum across all components.

## [2.33.1] — 2026-03-17

### Security
- **Undici Vulnerability Patch**: Updated `undici` to `7.24.4` and enforced it via `overrides` in both the main application and browser extension to mitigate critical vulnerabilities (WebSocket length overflows, HTTP Request/Response Smuggling, and CRLF Injection).
- **CodeQL Remediation**:
    - Implemented recursive sanitization for HTML tags and comments in Supabase Edge Functions and the extension's `extractor.ts` to prevent filter bypasses via nested malicious sequences.
    - Hardened URL scheme validation in `NotificationBanner` components to explicitly reject `data:` and `vbscript:` protocols, preventing potential XSS vectors via notification actions.

## [2.33.0] — 2026-03-16

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

## [2.32.2] — 2026-03-13

### Fixed
- **TypeScript Payment Service Errors**: Fixed `TS18047` by verifying `session.access_token` existence before passing it in the `paymentService.ts` Edge Function.
- **Duplicate Admin Service File**: Removed an unused duplicate `adminService.ts` file in `src/modules/admin/services/`.

## [2.32.1] — 2026-03-13

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

## [2.32.0] — 2026-03-13

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

## [2.31.11] — 2026-03-09

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

## [2.31.10] — 2026-03-09

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

## [2.31.9] — 2026-03-09

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

## [2.31.8] — 2026-03-08

### Fixed
- **Database Schema Drift**: Resolved critical issues where Supabase `jobs` table was missing columns.
- **Status Validation**: Expanded status constraints to include `'analyzing'` state.
- **Job Match UX**: Fixed state-sharing bug where failed scrape URLs would persist.
- **Submission Routing**: Ensured correct routing to manual description buffer on scraping error.

## [2.31.7] — 2026-03-08

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


## [2.31.6] — 2026-03-08

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


## [2.31.4] — 2026-03-08

### Changed
- **Background Analysis Hardening**: Added error handling and `try-catch` blocks to the background analysis loop in `NavigatorPro` to prevent silent failures during scraping or analysis.
- **Improved Test Mocks**: Upgraded Supabase mocks to support method chaining (`.update().eq()`), improving the reliability of unit tests.
- **Linting & Cleanup**: Removed unused `ResumeRow` import and other dead code identified during the stability sweep.

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

## [2.31.3] — 2026-03-07

### Security
- **Critical SQL Fixes (Supabase)**: Manually applied three essential security and integrity patches to the production database:
  - **Quota System Recovery**: Fixed a missing variable declaration (`v_email_verified`) in the `check_analysis_limit` function that caused silent runtime failures and blocked quota enforcement.
  - **Stripe Webhook Integrity**: Corrected the session role check in `protect_sensitive_profile_fields` (switching to `current_user`) to ensure the Stripe `service_role` can successfully update user subscription tiers.
  - **SQL Syntax Resolution**: Removed a duplicate `LANGUAGE` clause in the `redeem_invite_code` function that caused intermittent migration failures.

## [2.31.2] — 2026-03-06

### Changed
- **Personalized General Behavioral Questions**: The general interview practice mode now passes the candidate's resume to the AI. Questions are still phrased naturally (no forced references to specific employers), but the AI uses the background to calibrate which themes and seniority level to target.
- **Smarter "Think About" Suggestions**: Resume suggestion pills now surface 2 randomly chosen places the candidate has worked rather than random bullet points. Pill shows the organization name; hovering reveals the job title. Label updated to "You might want to think about..." to match the coaching intent.

## [2.31.1] — 2026-03-06

### Changed
- **AI Call Efficiency (Interview)**: Merged `analyzeInterviewResponse` and `generateFollowUp` into a single `analyzeAndFollowUp` call. Each interview answer now costs one round trip instead of two, reducing per-minute API rate pressure without changing token usage or output quality.
- **Token Reduction (Skill Suggestions)**: `suggestSkillsFromResumes` now strips internal metadata (IDs, visibility flags, suggested updates) before sending profile data to the AI. Only the fields the model actually needs are transmitted.
- **Feature Registry (`stage` field)**: Replaced the ad-hoc `isComingSoon` and `requiresAdmin` flags with a single `stage` field (`'admin' | 'beta' | 'public'`). Stage is optional and defaults to public — only features that aren't ready are explicitly tagged. Admin-stage features are hidden from all public-facing surfaces (features page, plans, homepage grid).

### Removed
- **`FILTER_HARD_SKILLS` prompt**: Removed unused prompt from `career.ts`. The behaviour it targeted (suppressing vague soft-skill suggestions) is already enforced by a strict rule in the main `GAP_ANALYSIS` prompt.

## [2.31.0] — 2026-03-06

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



## [2.30.2] — 2026-03-06

### Fixed
- **Critical: Cross-Browser Job Sync**: Jobs were silently failing to save to Supabase, making them invisible when logging in from a different browser. Two root causes: (1) the `jobs` table was missing `resume_id`, `cover_letter`, `cover_letter_critique`, `fit_score`, and `location` columns, causing every INSERT to fail; (2) jobs created mid-analysis carried `status: 'analyzing'`, which violated the DB check constraint. Added a migration to add the missing columns and expand the constraint, and fixed `addJob`/`syncLocalToCloud` to map `'analyzing'` → `'saved'` on insert (corrected to the real status by `updateJob` when analysis completes).

## [2.30.1] — 2026-03-06

### Changed
- **Cover Letter Editor Modularization**: Decoupled state and logic into a dedicated `useCoverLetterEditor` hook and extracted UI into modular sub-components (`CoverLetterHeader`, `ReviewCard`, etc.), significantly improving maintainability.
- **Job Detail Decoupling**: Fully refactored `JobDetail.tsx` to remove monolithic logic, replaced with specialized hooks (`useJobAnalysis`, `useResumeTailoring`, `useSummaryGeneration`).

### Fixed
- **Lint & Purity Fixes**: Resolved various `react-hooks/set-state-in-effect` and `react-hooks/purity` violations across several components.
- **Hook Execution Integrity**: Fixed a "Rules of Hooks" violation in `JobDetail.tsx` caused by an early return before hook definitions.
- **Cascading Render Prevention**: Decoupled state updates from effect bodies in `useJobAnalysis` and `CourseEditModal` using microtask delays to satisfy `react-hooks/set-state-in-effect`.
- **Regex Logic Cleanup**: Removed redundant escape characters in the `salaryParser` utility.
- **Static Analysis Fixes**: Resolved variable re-assignment warnings in `useAcademicLogic` and purged the remaining traces of the unused `WelcomeScreen` component.


## [2.30.0] — 2026-03-06

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

## [2.29.1] — 2026-03-06

### Fixed
- **Orgs Navigation**: Clicking the Orgs stat on the Career home no longer silently fails. `career-orgs` was mapped to `/career` in `VIEW_TO_PATH`, the same path as the home view, so `setView` detected no URL change and never navigated. Added `CAREER_ORGS: '/career/orgs'` to `ROUTES` and updated the `PATH_TO_VIEW` and `VIEW_TO_PATH` entries in `navigation.ts` to use the dedicated path. The existing `CAREER_HOME + "/*"` wildcard route already covers `/career/orgs`, so no router change was needed.

## [2.29.0] — 2026-03-06

### Added
- **Salary Insights (Admin Preview)**: New `career-salary` view under the Career module. Groups a user's analyzed jobs by normalized canonical title and renders a salary range bar (low → average → high) for each role. The average marker is a weighted midpoint across all salary data points seen for that title. Range bars unlock at 10+ salary data points; roles below that threshold show the observed range and a count toward the threshold. Includes a filter/search bar to narrow roles. Gated to admin users while in development.
- **`salaryParser` Utility**: New `src/utils/salaryParser.ts` parses raw salary strings in any common format (`$80K–$120K`, `$80,000 - $120,000`, `$40/hour`, `Up to $90K`, etc.) into structured `{ min, max, midpoint }` numbers. Hourly rates are annualized at 2,080 hours/year. Includes a `formatSalary` helper that produces compact `$NNK` labels.
- **Roles Stat in Coach Home (Admin)**: Added a Roles counter to the CoachHero stats row showing the count of unique canonical titles across the user's job history. Visible to admins only. Clicking navigates to the Salary Insights view.
- **`LocalStorage` Utility**: New `src/utils/localStorage.ts` centralizes all non-Vault `localStorage` access behind a single typed `get`/`set`/`remove` interface. This is the single observation point for future encryption migration and cross-tab sync.
- **`Logger` Utility**: New `src/utils/logger.ts` provides a production-safe console wrapper. `Logger.log` and `Logger.debug` are no-ops in production builds; `Logger.warn` and `Logger.error` always pass through.
- **`STORAGE_KEYS` — New Keys**: Added `DEVICE_ID` (`nav_device_id`) and `ONBOARDING_STATE` (`onboarding_state`) to `STORAGE_KEYS`. Fixed a duplicate `PRIVACY_ACCEPTED` entry.

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

### Removed
- **BENTO Compat Layer**: Removed the deprecated `BENTO_CARDS_COMPAT`, `BENTO_CATEGORIES_COMPAT`, and `BENTO_RANKINGS_COMPAT` exports from `featureRegistry.ts`, and their corresponding re-exports (`BENTO_CARDS`, `BENTO_CATEGORIES`, `BENTO_RANKINGS`, `BentoCardConfig`) from `constants.ts`. Migration to `FEATURE_REGISTRY` is complete; no active code consumed these aliases. Removed the now-dead `BENTO_CATEGORIES` test from `constants.test.ts`.
- **Duplicate `adminService.ts`**: Deleted `src/modules/admin/services/adminService.ts`, which was byte-for-byte identical to `src/services/adminService.ts` and was never imported anywhere. Its empty parent directory was also removed.
- **`isTargetMode` removed from `JobMatchInput`**: Target/dream job mode belonged to the Career section, not the Job section. The job input page is for applying to jobs. Removed the mode state, all conditional logic branching on it, the `useCoachContext` import, the `TrendingUp` icon, and the hardcoded `mode` constant. The Career Coach section manages target jobs independently.
- **`showResumePrompt` dead code**: Removed unreachable resume upload modal from `JobMatchInput`. The state and JSX block existed but `setShowResumePrompt(true)` was never called anywhere. Also cleaned up the imports (`X`, `DropZone`) and destructured context values (`onImportResume`, `isParsing`, `importError`) that were only used by this modal.
- **`WelcomeScreen` component**: Deleted unused modal-based onboarding flow (`WelcomeScreen.tsx`). This was the original overlay version of onboarding and has been superseded by the route-based `OnboardingPage`. It was not imported anywhere in the codebase.

### Fixed
- **`JobMatchInput` input type**: Changed `type="url"` to `type="text"` on the primary job input. The field accepts both URLs and raw pasted job descriptions, making `url` incorrect and causing browser validation errors on plain-text input.
- **Vault Init Race Condition**: Concurrent `Vault.getSecure` calls on mount could each independently call `encryptionService.init()` before the first completed. Initialization is now guarded by a shared promise so concurrent callers await the same work.
- **`submitFeedback` Fire-and-Forget**: `supabase.from('feedback').insert()` was not awaited, silently swallowing errors. Now properly awaited.
- **`callWithRetry` Backoff Ignored Constant**: Retry delay multiplier was hardcoded as `* 2` instead of using `API_CONFIG.RETRY_BACKOFF_MULTIPLIER`. Now consistent with the constant.

### Security
- **`check_analysis_limit` — Undeclared variable fix**: Added missing `v_email_verified BOOLEAN` declaration to the `DECLARE` block in `check_analysis_limit`. The variable was selected into but never declared, causing the function to fail at runtime. Because the client-side caller fails open on DB errors, this meant quota limits were not being enforced. *Requires Supabase SQL migration to take effect.*
- **`protect_sensitive_profile_fields` — Correct role check**: Replaced `current_setting('role')` with `current_user` in the trigger that guards `subscription_tier`, `is_admin`, and `is_tester` from user self-modification. `current_setting('role')` reads a GUC config parameter and does not reliably return the active session role; `current_user` is the correct PostgreSQL function. The previous check was effectively always false, meaning the Stripe webhook (service role) could not update subscription tiers. *Requires Supabase SQL migration to take effect.*
- **`redeem_invite_code` — Duplicate `LANGUAGE` clause removed**: Removed a duplicate `language plpgsql` declaration that caused a SQL syntax error, which could break schema migrations depending on the PostgreSQL version. *Requires Supabase SQL migration to take effect.*

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

## [2.28.0] — 2026-03-05

### Added
- **Professional Organizations Tracker**: New `career-orgs` view under the Career module. Track professional associations, networks, and communities you belong to. Pre-populated suggestions for planning, transit, engineering, and business orgs (CIP, OPPI, YPT, ITE, CUTA, ULI, etc.). Supports search/filter, custom entries via keyboard, and persists to localStorage.
- **Orgs Stat in Coach Home**: Added an Organizations counter to the CoachHero stats row alongside Profiles, Goals, and Skills. Clicking navigates to the new orgs view.
- **Feature Registry — ORGS**: Registered `ORGS` in `featureRegistry.ts` (category: COACH, tier: explorer, `isComingSoon: true`).

### Changed
- **Feed Source Types**: Removed TTC/Toronto-specific hardcoding from `JobFeedItem.source`. Changed from `'ttc' | 'toronto' | 'other' | 'email'` to `'scraped' | 'other' | 'email'`. Updated `ScraperService.getFeed()` to return `[]` (removing the hardcoded TTC scraper) and fixed `NavigatorPro` feed card to derive the logo letter from company name instead of hardcoding 'T'.
- **Navigation**: Added `career-orgs` to `ViewId` and `VIEW_TO_PATH` in `navigation.ts`.

## [2.27.0] — 2026-03-05

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

### Fixed
- **Job Detail Evaluation Retry**: Resolved an issue where manually editing an incomplete job description and clicking "Evaluate Match" failed to trigger the analysis state transition due to a missing state update (`onUpdateJob`).

## [2.26.0] — 2026-03-04

### Security
- **Gemini API Key Rotation**: Successfully rotated the Gemini API key in Google Cloud (Navigator project) to mitigate potential exposure.
- **API Restriction Enforcement**: Strictly restricted the new API key to the `Generative Language API` only, preventing unauthorized use across other Google Cloud services.
- **Supabase Secret Synchronization**: Updated the `GEMINI_API_KEY` in Supabase Edge Function secrets to ensure seamless and secure proxying.

## [2.25.0] — 2026-03-04

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

## [2.23.0] — 2026-02-28

### Added
- **Prompt Evolution Tracker**: Established a dedicated tracking system (`PROMPTS_EVOLUTION.md`) for core AI prompt changes to maintain long-term architectural visibility.

### Changed
- **High-Fidelity Cover Letters**: Overhauled the cover letter generation engine to move from simple job-by-job mapping to a cohesive thematic synthesis. Implemented "Functional Connections" to eliminate robotic transitions and added category-aware metric handling (literal stats for technical roles, narrative impact for others).
- **Prompt Architecture**: Removed deprecated `analysis.ts` monolithic export wrapper and transitioned all domain AI services to consume modular prompt files directly.

## [2.22.0] — 2026-02-27

### Added
- **Browser Extension (v2.22.0)**: Officially launched the Navigator browser extension with a smart extraction engine (parsing `json-ld`, Open Graph metadata, and DOM heuristics) to instantly capture structured job data (title, company, location, salary, description) with one click. Replaces the legacy bookmarklet.
- **Premium Extension UI**: Initial release featuring a high-fidelity glassmorphic interface with a 3-state flow (Login -> Ready/Preview -> Saved) and instant extraction confidence feedback.

### Changed
- **Bookmarklet Deprecation**: Replaced the fragile JavaScript bookmarklet flow with the new Browser Extension. Updated all related notifications, tips, feature registry entries, and UI previews from "Bookmarklet" to "Browser Extension".

### Fixed
- **SEO & Metadata**: Removed hardcoded `navigator.career` references across the application. Generalized site URL logic in the `SEO` component and `index.html` to use dynamic origins and relative paths.
- **Cleanup**: Removed legacy `robots.txt` and `sitemap.xml` files that were hardcoded to an incorrect domain.

## [2.21.5] — 2026-02-25

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

## [2.21.0] — 2026-02-24

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

## [2.20.0] — 2026-02-23

### Added
- **Premium Education Suite**: Launched a re-architected Education Dashboard and Transcript Registry. Includes a database of 60+ Canadian universities, automated credential extraction, and intelligent course reorganization.
- **Academic Autocomplete**: High-fidelity `SearchableInput` for universities, programs, and degrees.
- **Interview "Suggested Topics"**: Context-aware recommendations to ground interview answers in factual evidence from the user's history.
- **Smart Resume Strength Engine**: Real-time evaluation of impact, professional depth, and skill alignment with verifiable evidence tracking.
- **Career Tip Service**: Intelligent engine providing contextually aware career advice based on the current state of a user's resume.
- **Email Verification Flow**: Comprehensive "Trust & Safety" gate with glassmorphic status polling and anti-spam cooldown logic.
- **Automated Feature Badging**: System-wide dynamic "NEW" badges based on `releaseDate` metadata.

### Changed
- **Platform-Wide Aesthetic Refinement**: Executed a comprehensive "Casing Polish" to remove aggressive all-caps/tracking. Standardized button casing, icon sizing, and layout patterns across all modules.
- **Education Module Redesign**: 12-column Bento-style dashboard grid, modular Academic Overview cards, and modernized "Term-and-Course" card architecture.
- **Interview Advisor UX Polish**: Implemented Focused Session Mode and refined action labels for a more professional practitioner experience.
- **Resume Editor Evolution**: Streamlined sidebar architecture, migrated key actions to the global header, and improved multi-word skill extraction.
- **Enhanced Storage Sync**: Implemented a non-destructive merge strategy to prevent data loss during authentication/sync cycles.

### Fixed
- **Skill Persistence & Sync**: Resolved critical race conditions in the storage layer to ensure local data is correctly persisted to the cloud.
- **Bookmarklet Security**: Fixed drag-and-drop registration for the 'Save to Navigator' tool.
- **Interview Advisor Stability**: Synchronized focused mode state to prevent navigation bleed during active sessions.
- **Layout & Typographical Fixes**: Resolved search bar misalignments, button clipping, and missing font weight fallbacks.

## [2.19.2] — 2026-02-22

### Changed
- **Footer Update**: Updated repository footer with "Happy Shipping!" and refined branding info.

## [2.19.1] — 2026-02-22

### Changed
- **Changelog Reorganization**: Implemented collapsible `<details>` sections for all historical releases (back to v2.0.0) and archived legacy history (pre-v2.0.0) into `CHANGELOG_ARCHIVE.md` to improve readability and file maintenance.

### Fixed
- **Navigation Consistency**: Resolved a bug where the 'Jobs' tab remained active when viewing the Upgrade page, Settings page, and other top-level landing views.

## [2.19.0] — 2026-02-22

### Added
- **Focused Session Mode**: Introduced a distraction-free "Focused Mode" for high-stakes assessments.
- **Interview Feedback Banking**: Enhanced the Interview Advisor with a new "Bank Suggestion" feature. Users can now persistently save AI-generated bullet points to their professional profile, bridging the gap between verbal narrative and their written resume.
- **Discovery Bank**: Integrated a persistent "Discovery Bank" sidebar in the Resume Editor that displays AI-captured suggestions from interview performance, featuring one-click "Apply" and "Dismiss" functionality.
- **Academic Contextual Analysis**: Integrated the user's academic transcript into the core Job Match engine. The AI now cross-references specific courses and grades to strengthen fit analysis, particularly beneficial for entry-level and transitional roles.
- **Cross-Module Communication**: Established a communication bridge between the Resume and Education modules. Transcripts are automatically fetched from local storage to provide deeper context during job analysis without manual input.
- **Academic Grounding Rules**: Updated the Job Fit prompt to leverage academic background as a substitute for or supplement to work experience when analyzing candidate-role alignment.
- **Skills module UI Polish**: Overhauled the "Your Skills" dashboard with a more compact, premium "Tag" design. Indicators (verified checkmark and proficiency dot) are now right-aligned to match the Job Analysis style and improve information density.
- **Design Parity (Skills)**: Aligned skill proficiency colors and "glow" effects with the main Job Match results, ensuring a cohesive visual language across both modules.
- **AI Discoveries Refresh**: Redesigned the Skill Suggestions section to use the new compact tag architecture and updated terminology ("Discoveries" / "AI Found") for better consistency with the platform's AI identity.
- **Prompt Architecture Refactor**: Decentralized the monolithic `analysis.ts` into a modular structure (`jobAnalysis.ts`, `coverLetter.ts`, `career.ts`, `education.ts`) for better maintainability and faster iteration.
- **High-Fidelity Cover Letters**: Overhauled the Cover Letter generation prompts to produce organic, narrative-driven documents that prioritize strategic alignment and professional depth over rigid word counts.

### Changed
- **Bento Grid UI Consistency**:
  - Standardized feature preview heights to a fixed 96px (`h-24`) to ensure perfect vertical alignment across all feature cards in the grid.
  - Resolved a layout discrepancy in the **Job Alerts** and **Feed** previews that previously caused neighboring cards to stretch and create excessive white space.
  - Refined vertical centering and hover scaling logic for system notice previews to maintain absolute design parity across the platform.
- **Premium Admin Dashboard**:
  - Rebranded "Admin Console" to a more professional **Admin** portal with a dedicated "Management Portal" identity.
  - Implemented **Consumption Efficiency** tracking, enabling real-time monitoring of average tokens consumed per network call.
  - Introduced a **System Health** command center with pulse indicators for live infrastructure monitoring.
  - Overhauled the usage table with high-fidelity behavioral flags (Extreme vs. High deviation) and premium typography.
  - Executed a dashboard-wide "Casing Polish," removing all-caps styling from labels, stats, and headers for a modern feel.
  - Standardized the dashboard layout using a premium 4-column grid with glassmorphism cards and responsive scaling.
- **Search & Filter Standardization**:
  - Enforced a consistent **60/40 split** between the search bar and filter controls across the application to ensure professional visual balance.
  - Standardized the layout logic in `StandardSearchBar`, using the `rightElement` prop to host filter groups in `Feed`, `History`, and `Skills` modules for absolute design parity.
  - Improved responsiveness by maintaining horizontal scrolling for filters within their allocated 40% space on desktop.
- **Program Explorer Premium Uplift**:
  - Overhauled the empty state for the Program Explorer with a high-fidelity `AcademicHero` interface, featuring Bento-style benefit cards and interactive glassmorphism design.
  - Integrated the `useAcademicLogic` hook directly into the Program Explorer, enabling users to upload and verify transcripts without navigating away from the discovery flow.
  - Enhanced the `AcademicHero` component with customizable title and description support.
- **Settings UI Optimization**:
  - Upgraded the "Current Focus" selection from a button grid to a premium, styled dropdown for a cleaner interface.
  - Implemented custom `ChevronDown` iconography and refined hover/focus states to align with the application's high-fidelity design language.
- **Header Premium Refinement**:
  - Centralized session branding into a sleek floating island that dynamically displays the active session name and icon.
  - Eliminated redundant branding from the left section of the header during focused sessions to prioritize content clarity.
  - Standardized the "Exit" button with exact horizontal alignment to the "Sign Out" position, featuring a smooth 180-degree rotation animation.
  - Implemented spatial preservation for right-side action icons (Admin, Theme, Settings) to maintain pixel-perfect layout consistency.
- **Skill Assessment & Interview Advisor**: Integrated the "Focused Mode" architecture across assessment modules, removing internal redundant headers for a more immersive experience.
- **Skill Verification Quality Focus**:
  - Implemented a standard cap of 8 skills per interview session to ensure high-fidelity, focused AI scenarios and prevent candidate fatigue.
  - Added a "Quality Focus" badge to the interview setup to clearly communicate the scope adjustment logic.
- **Homepage Bento Grid Optimization**:
  - Normalized card heights across the homepage spotlight grid by standardizing system notice previews to a fixed height.
  - Compacted BentoCard layouts by reducing minimum description heights and optimizing vertical spacing.
- **Global UI State**: Expanded global state management to support application-wide session awareness and synchronized UI focus transitions.
- **Resume Editor UI & Mechanics**:
  - Aligned the sticky sidebar with the top of the Professional Summary section for a balanced, premium layout.
  - Enhanced the sidebar with new interactive modules: **Resume Strength Meter**, **Top Skills Extracted**, and **AI Pro Tips**.
  - Standardized status badges with sentence-case styling for better readability.
- **Inclusive Career Journeys**: Overhauled onboarding journey selection to be more exhaustive and inclusive (Renamed "Grad School" to **Education**, "Career Planning" to **Career Growth**, and introduced **Just Exploring**).
- **Onboarding Personalization**: Refined journey descriptions and tailored headlines across the Welcome Screen and Onboarding flow.
- **Header Minimalist Refresh**: Streamlined header architecture by removing descriptive icons from functional page headers (`PageHeader` and `DetailHeader`).
- **Settings Synchronization**: Updated Account Settings to maintain absolute parity with the new onboarding journey categories and terminology.
- **Card Layout Consistency**: Implemented `mt-auto` alignment for action buttons across all homepage Bento cards, ensuring a uniform visual baseline.
- **Interactive Career Focus**: Upgraded the "Current Focus" setting to be fully interactive within the Account Settings page.
- **Aesthetic Refinement**: Executed a site-wide "Casing Polish," removing all-caps styling from feature previews, headers, and badges.
- **Feed Renaming**: Rebranded "Pro Feed" to simply **"Feed"** throughout the application for a more concise professional tone.
- **Search & Filter Synchronization**: Standardized the height of `StandardSearchBar` and `StandardFilterGroup` (44px / h-11) for perfect horizontal alignment across History, Feed, and Skills.
- **Resume Editor UI**: Redesigned experience blocks for better clarity and consolidated block controls next to the "Add Achievement" button.
- **Resume Editor Aesthetics**: Refined date badges with a full-rounded pill design, improved typography, and removed textured inner shadows.
- **UI Minimalism**: Streamlined the Resume Editor and Interview Advisor by removing redundant decorative icons and simplifying sidebar layouts.
- **Resume Automatic Sorting**: Implemented automatic chronological sorting (newest to oldest) for resume items within each section.
- **Resume Section Migration**: Added a "Move" dropdown to resume blocks, allowing users to transfer items between different sections.
- **Contextual Resume Entry**: Replaced the "Quick Add" sidebar list with contextual "Add" buttons in each section header.
- **Resume Editor Sidebar**: Overhauled sidebar architecture for absolute alignment, centering the "Experience Synced" status badge and refining typography.
- **BentoCard UI Refinement**: Standardized header and title container heights. Increased description line-clamp to 4 lines and optimized spacing.
- **Improved Coming Soon UX**: Relocated "Coming Soon" indicators to a prominent top-right badge and reserved action bar space globally for layout consistency.
- **Casing & Naming Standards**: Standardized feature display names in the registry (e.g., "Role Modeling", "Quality Loop") for better layout fit.
- **Usage Limit Transparency**: Refined the Plans page with explicit usage periods (e.g., "/ day", "/ week") for all limits.
- **Conversion Flow Optimization**: Upgraded the "Try it free" feature on the Features page to trigger authentication for guest users.
- **Vertical Alignment**: Resolved vertical positioning of the sticky sidebar to ensure absolute parity with the main editor header.
- **Footer Architecture**: Redesigned the global footer to centralize system metadata and reposition branding taglines.
- **Settings Clean-up**: Removed redundant Navigator branding and system version info from the Account Settings page.
- **Plans Page UX**: Moved the "Explore all features" link to be beside the monthly/annual switcher for better visibility.
- **Interview Advisor UI**: Standardized typography for buttons, labels, and status messages to align with the global design system.
- **Resume Editor UI**: Optimized the sticky sidebar layout with increased top offset (`top-24`) and standardized button variants.
- **Improved Focus**: Removed secondary placeholder states from the Resume Editor to prioritize a document-first writing experience.
- **Terminology Refinement**: Simplified technical terminology in Job Detail: "Key Skills", "Skill Match", and "Core Responsibilities".
- **Job Detail UI Aesthetics**: Switched headers from All-Caps to Title Case and increased font weights/sizes for a more premium look.
- **Layout Expansion**: Expanded the `JobDetail` container to `max-w-6xl` to better accommodate high-density analysis.
- **Programmatic Casing**: Implemented a global `stringUtils` utility to automatically handle Title Case and Sentence Case for AI-extracted data.
- **Balanced Cover Letter Critique**: Implemented a dual-gate critique system enforcing both technical fidelity and high-quality professional narrative.
- **Evidence Benchmarking**: Refined evidence requirements to prioritize "impactful relevance" over strict achievement tallies.
- **Job Detail Header UX**: Consolidated application status and external link actions into the primary Tab navigation row.
- **Reference Code Extraction**: Updated the AI analysis engine to specifically extract job reference numbers and IDs.
- **Location Context Polish**: Switched the location indicator to a map pin and improved geographical data extraction prompts.
- **Job Detail Header**: Expanded header to include extracted location and reference code with clear dedicated visual indicators.
- **Job Detail UI**: Standardized the Job Description header by removing "(AI CLEANED)" and all-caps styling.
- **UI Architecture**: Enhanced `DetailTabs` with a right-aligned `actions` slot and sticky glassmorphism support.
- **Cover Letter Sidebar**: Re-architected `JobDetail` layout to support a unified floating sidebar across Analysis, Resume, and Cover Letter tabs.
- **Simplified Cover Letter Editor**: Removed redundant internal grids and sidebars to fit parent layout architecture.
- **Module-Wide UI Polish**: Standardized typography and layout patterns across Grad Launchpad, GPA Calculator, Role Model Detail, and Onboarding.
- **Pricing & Plans**: Refined the plan comparison table with improved visual hierarchy and clearer value propositions.
- **Terminology Alignment**: Standardized "Browser Extension" to "Bookmarklet" across the feature registry and UI.
- **Premium Toast Notifications**: Redesigned notification system with a compact glassmorphism aesthetic and reduced dismissal timeout.
- **Bookmarklet UI**: Integrated persistent installation tips into Application History and Job Match pages.

### Removed
- **Settings Modal**: Removed the legacy modal-based settings interface to provide more breathing room for account management.
- **Resume Editor Empty States**: Removed redundant "No items found" placeholders and "Initialize Section" buttons.
- **History Page Bookmarklet Tip**: Removed the "Save from anywhere" banner from the Application History page.
- **All-Caps UI Transformation**: Removed `uppercase` text transformation across the entire application for a cleaner aesthetic.
- **Resume Editor Pro Tip**: Removed the "Pro Tip" sidebar card to reduce visual noise and documentation clutter.

### Fixed
- **Navigation Consistency**: Resolved a long-standing navigation bug where the "Jobs" menu item remained active while viewing the Admin page.
- **Resume Export Reliability**: Fixed the "Download PDF" feature by implementing a dedicated high-fidelity printable preview component.
- **Navigation**: Resolved a critical issue where the Settings button in the header failed to navigate to the Settings page.
- **Resume Editor**: Resolved a bug in the "Quick Add" functionality where secondary experience blocks failed to instantiate correctly.
- **Pro Feed Branding**: Renamed "Job Feed" to "Pro Feed" across the application and updated its primary icon to `Zap` for better consistency.
- **Match Breakdown (Strengths & Weaknesses)**: Restored the detailed Strengths and Weaknesses section to the Job Analysis view.
- **Concise Career Insights**: Optimized the Professional Insight prompt to deliver concise, high-impact reasoning (max 2 sentences).
- **Bookmarklet Integration**: Added support for direct job analysis via the 'Save to Navigator' bookmarklet from any external site.
- **Automatic Job Analysis**: Implemented automatic URL detection for the bookmarklet to pre-fill and trigger analysis instantly.
- **Unified Filter UI**: Compacted filter and search components and refactored the **Job Feed** to use the unified architecture.
- **UI Design Parity (Interviews & Career)**: Unified entry pages for Interview Advisor and Career Models with a consistent "Bento" architecture.
- **Bento Advisor UI**: Standardized Interview Advisor selection screen with compact Bento cards and refined typography.
- **Header Standardization**: Implemented consistent H1/Subtitle hierarchies and standard grid widths across all major modules.
- **Unified Page Architecture**: Standardized vertical alignment and title positioning across all modules using a consistent layout strategy.
- **Interview Advisor Refactor**: Redesigned entry page to use the global `SharedPageLayout` and `PageHeader` architecture.
- **Settings Page**: Replaced the Settings Modal with a dedicated, high-fidelity full-page experience.
- **Job Detail UX**: Refined alignment sections by removing sequential numbering and standardizing title casing.
- **Job Detail UX**: Prevented "blank" skeleton states during analysis by ensuring scanning animations persist until results are ready.
- **Resume UX**: Overhauled the "Resume" tab in Job Detail with a clean, document-inspired aesthetic.
- **Resume UX**: Resolved a layout conflict where floating action controls overlapped date range inputs.
- **Resume UX**: Refined Professional Summary section by removing redundant block counts and hiding duplicate delete icons.
- **Resume Editor**: Fixed a critical text wrapping bug where long professional summaries and achievement bullets were being cut off.
- **Resume Editor Labeling**: Restored descriptive section labels across the editor for better clarity.
- **Improved Sync Feedback**: Refined the "Synced" status indicator by removing the unnecessary timestamp.
- **Visual High-Intensity Styling**: Softened the visual profile of technical labels to improve readability and user empathy.

## [2.18.0] — 2026-02-21

### Added
- **Career Archetypes**: Launched an AI-powered professional persona system that analyzes application patterns to identify professional archetypes (Technologist, Leader, etc.) with premium interactive badges.
- **System Update Cards**: Implemented a sophisticated notification system with persistent dismissal, snooze logic, and priority-aware filtering for policy and product updates.
- **Resume Export**: Added "Download PDF" functionality with optimized print styles for clean document generation.

### Changed
- **Resume Redesign (Phase 2)**: Major overhaul of the Resume module with a focused centered layout, premium high-fidelity experience cards, real-time sync feedback, and a sticky action sidebar.
- **Premium UI Standardization**:
  - Unified **Skills**, **Job Feed**, and **Cover Letters** under the modern `SharedPageLayout` and `PageHeader` architecture.
  - Standardized all module search and filter components for absolute design parity.
  - Refined the **Settings Modal** with a high-density 3-column layout and improved visual hierarchy.
  - Optimized **UnifiedUploadHero** for better proportions across Education and Career modules.
- **Plans & Upgrade Flow**: Migrated plans to a focused `/upgrade` path with refined aesthetic cards and standardized usage limits.
- **Skills Dashboard**: Refined "Your Skills" dashboard with alphabetical sorting, improved metadata contrast, and streamlined action flows.

### Fixed
- **Stability**: Resolved critical crashes on the `/features` page and standardized `BentoCard` icons.
- **Navigation**: Finalized "Back" button patterns and standardized transition effects across listing pages.




## [2.17.0] — 2026-02-20

### Added
- **Job Detail UI Overhaul**:
  - Redesigned the "Analyzing" state with a high-fidelity "Scanning" animation, featuring dynamic beams, ambient glows, and interactive security badges.
  - Upgraded all analysis and result cards to the `premium` variant, utilizing glassmorphism and refined drop-shadows.
  - Implemented smooth entry animations for Experience Blocks with indigo pulse indicators.
  - Added a "Copy Full Resume" action with immediate visual feedback.
- **Education Module: Grad School Discovery**:
  - Introduced **Program Explorer** to search and filter curated Master's programs with seamless integration into the Program Fit Analyzer.
  - Added **Application Launchpad**, providing a structured, interactive roadmap for core admission requirements (GRE/GMAT, SOP, LORs).
  - Created **Portfolio Proposer**, an AI-driven tool that transforms academic courses into tangible, resume-ready technical projects.
- **Skill Interview "Professional Audit" Model**:
  - Increased interview depth to **10-12 cross-cutting questions** (approx. 24 interactions) for a more comprehensive assessment.
  - Implemented **Atomic Persistence**: Progress is banked "live" after every question, ensuring no work is lost if a session is interrupted.
  - Added **Historical Awareness**: The AI now recognizes previously verified skills and previous verification evidence to ask more advanced/targeted follow-ups.
  - Improved **Credit Transparency** labels on interview buttons to dynamically display real-time usage (e.g., "1 / 2 credits used" or "Unlimited credits") based on user subscription tiers.
- **Compact Header System**:
  - Introduced a `compact` variant to `SharedHeader` to optimize vertical space on functional sub-pages.
  - Applied the compact header to **LinkedIn Export Guide**, **Program Explorer**, **GPA Calculator**, and **Growth Roadmap**.
  - Refactored custom header implementations in Career and Education modules into the unified `SharedHeader` component for absolute design parity.
- **Tone & Decision Logic**:
  - Introduced a **Professional Decision Spectrum** (`Reject`, `Weak`, `Average`, `Strong`, `Exceptional`) across all AI feedback modules (Interviews & Cover Letters).
  - Updated terminology across Skills to be more neutral and professional (e.g., "Verified & Banked" and "In Development").
- **Job Analysis & Stability**:
  - Implemented **Auto-Reanalysis**: Jobs with missing or "hollow" data are now automatically refreshed in the background when viewed, ensuring data integrity without user effort.
  - Hardened **AI Extraction**: Enforced a strict JSON schema and mandatory validation for all job analysis results, preventing incomplete or malformed data from being saved.
  - Improved **Background Feedback**: Updated `JobDetail` UI to robustly handle auto-refresh states with skeleton loaders and synchronized progress messages.

### Changed
- **UI Architecture**:
  - Restored main header navigation to the Job Match page for better site-wide consistency.
  - Standardized `JobDetail` layout using `SharedPageLayout`, resolving inconsistent padding and width issues.
  - Refined the `JobDetail` layout to use the `premium` design system consistently across all tabs (Analysis, Job Post, Resume).
- **UI Consistency**:
  - Unified the "Interview Advisor" page header to use the standard `<PageHeader>` component, resolving alignment and font scale discrepancies with "Application History" and "Resume Editor".
  - Removed lingering focus outlines (blue pills) from navigation sub-items (e.g., "Interviews", "History") that remained stuck after a mouse click, while preserving standard `:focus-visible` accessibility rings for keyboard navigation.
- **Upload Experiences**: Unified the upload interface across the application (`ResumeEditor`, `EduHero`, `AcademicHero`) by introducing a new `UnifiedUploadHero` component. This provides a consistent 3-card "Bento" layout and standardized drag-and-drop functionality for both resumes and academic transcripts.
- **Resume Editor**: Updated the subtitle to be clearer and more literal: "Manage your professional history and accomplishments".
- **Plans & Monetization**:
  - Standardized usage limits to high-value reset cycles: **Weekly** for Job Analyses and **Monthly** for Skills Interviews.
  - Adjusted Skills Interview credits to reflect their increased depth and rarity: **2 / month** for Plus and **5 / month** for Pro.
  - Standardized Job Analysis limits to **100/week** (Plus) and **350/week** (Pro).
  - Removed redundant daily tracking for analyses to simplify user usage perception.
- **UI Architecture**:
  - Restored homepage card width by increasing the main content container from `max-w-4xl` to `max-w-6xl`, resolving issues where cards appeared too skinny in the 5-column grid.
  - Refactored the monolithic `HomeInput` component into two dedicated components: `HomePage` (focused landing experience) and `JobMatchInput` (focused job analysis tool).
  - Implemented a global **Header Strategy** that differentiates between "Explanatory" pages (Hero variant) and "Functional" pages (Simple variant).
  - Integrated the **Coach Mode Toggle** ("Emulate / Destination") directly into the `PageHeader` component's `actions` slot, removing awkward whitespace from the `CoachHero` component layout.
- **Secure Storage**:
  - Upgraded encryption key management to use **IndexedDB** for master key storage instead of `localStorage`.
  - Implemented **non-extractable keys** using the Web Crypto API, ensuring raw key material cannot be accessed by JavaScript.
  - Removed browser fingerprinting dependencies for key derivation to improve entropy and resolve security findings.
- **Job Flow Integration**: Unified job status terminology to `saved` across the **Pro Feed** and **Application History**, resolving inconsistencies where some jobs appeared as "analyzed" but were filtered out of core views.
- **Security & Safety**:
  - **Improved Log Sanitization**: Hardened the `gemini-proxy` log sanitization to strip a broader range of control characters (tabs, null bytes, backspaces) and fixed missing sanitization in error/warning paths to prevent potential log injection.
  - **Sensitive Data Exposure**: Prevented accidental exposure of sensitive user profile data (subscription tier, admin/tester status) in client-side debug logs.

### Fixed
- **AI Feedback**:
  - Fixed an issue in the Skills Assessment where the AI interviewer referred to the candidate in the third person instead of addressing them directly ("you").
- **Storage**:
  - Fixed a critical bug where a new user's initial resume upload would fail to persist to the cloud due to a missing `insert` clause in `resumeStorage`.
  - Added robust stringified JSON parsing for incoming cloud resume payloads to prevent data drops caused by schema type mismatches.
- **Match Calculations**: Fixed a UI bug where a literal **0% Match Score** was treated as "missing data", causing jobs to display "Analysis Needed" instead of their correct score.
- **Build & Stability**:
  - Fixed corrupted JSX structure and missing `SharedPageLayout` imports in `JobDetail.tsx`.
  - Resolved implicit `any` type and missing `SavedJob` import in `AppRoutes.tsx`.
  - Implemented a `process.env` shim in `vite.config.ts` to resolve the "process is not defined" error encountered during Vercel deployments.
  - Fixed corrupted JSX structure in the Job Detail module to ensure stable rendering across all application states.
  - Resolved missing icon imports for `Search` and `ShieldCheck` in `JobDetail.tsx`.


## [2.16.0] — 2026-02-20

### Added
- **UI Architecture**:
  - Introduced new global components: `StandardSearchBar` (glassmorphism input), `StandardFilterGroup` (unified filter layouts), and `DropZone` (drag-and-drop file utility).
  - Implemented these components across **History**, **Skills**, **Resume Editor**, and **Transcripts** to ensure absolute design pattern consistency.
- **Job Detail Enhancements**:
  - Automatically extracts and displays the salary range next to the company name.
  - Added graceful fallback empty states for specific data points, preventing "blank box" confusion if AI extraction is incomplete.

### Changed
- **Major UI Polish & Layout Refining**:
  - Redesigned the **Interview Advisor** and **Job Detail** headers into a premium floating capsule design featuring the primary logo.
  - Adjusted global spacing of all hero headers, raising the content block slightly (`1.5cm`) for a more proportional layout.
  - Standardized marketing headlines into Title Case and resolved scrolling/padding issues globally across empty state modules.
- **Skills & Resume Refinements**:
  - Overhauled the **Skills** module with new vibrant Bento cards and a compact, flex-wrap "pill collection" for cleaner data visualization.
  - Simplified the Resume Editor layout by consolidating control buttons and removing bulky section badges from experience entries.
- **Onboarding & Error Handling**:
  - Refined the unauthenticated home header to display clear, distinct **Sign In** and **Sign Up** prompts.
  - Standardized diverse CTA labels across features into clearer, action-oriented verbs (e.g., "Enter Navigator", "Open Feed", "Quick Start").
  - Implemented a "premium empathetic error UI" in Job Details that distinguishes between scraping failures and AI service errors.

### Removed
- **Education**: Removed redundant "Back to Education" headers to streamline screen architecture.
- **Privacy**: Removed outdated policy update badges from the home screen layout.

### Fixed
- **Critical Stability & Storage**:
  - Resolved a severe "destructive sync" race condition in `JobStorage` that could mistakenly clear local data before merging with the cloud.
  - Optimized data contexts (`ResumeContext`, `useJobManager`) to instantly re-fetch cloud data upon login without requiring a page refresh.
  - Patched persistent "Too many requests" AI limits by isolating the correct billing API keys in the environment setup.
- **Job Analysis State Flow**:
  - Fixed logic bugs preventing background job analysis from auto-starting and corrected manual-input errors trapping the system into fail-states.
  - Cleaned up lingering "AI is busy" alerts, implementing automatic notification clearing during route navigation.
- **UI Glitches & Alignment**:
  - Corrected multiple visual discrepancies including clipped hero gradients, broken dark mode toggles in Tailwind v4, and invisible button text on stark glass backdrops.
  - Corrected overlap issues with the fixed app headers across the History framework.
  - Fixed inconsistent hero header alignment on the Upgrade (`/plans`) page by adopting the standard `SharedPageLayout` component.

## [2.15.2] — 2026-02-19

### Fixed
- **Deployment**: Added `.npmrc` to bypass strict ERESOLVE peer dependencies caused by React 19 (`react-helmet-async`), resolving Vercel deployment failures.


## [2.15.1] — 2026-02-19

### Fixed
- **Stability**: Fixed a build error causing Vercel deployment failures by correcting deprecated `variant="default"` props on `Card` components.
- **Documentation**: Updated `README.md` to reflect recent feature additions (Interview Advisor) and removed outdated API key instructions.


## [2.15.0] — 2026-02-19

### Added
- **Security & Safety**:
  - Implemented **Pessimistic Quota Enforcement** and a **Refund Mechanism** for failed AI calls.
  - Added **Strict Email Normalization** and **Device Fingerprinting** to prevent abuse.
  - Integrated an **Email Verification Gate** and a global **Token Safety Ceiling** as emergency fuses.
  - Added automated **"Is-a-Job" Content Validation** with auto-refunds for non-job content.
  - Consolidated background tasks (`inbound-email`, `scrape-jobs`) to use centralized `gemini-proxy` logic.
- **AI & Architecture**:
  - Harmonized model mappings — **Gemini 1.5 Pro** now powers all Pro/Admin features.
  - Created centralized `featureRegistry.ts` as the single source of truth for all feature definitions.
- **UI/UX & Design**:
  - Implemented **3D tilt and 4px lift effects** on homepage Bento cards.
  - Added **micro-animations** (pulsing AI Safety shield, interactive match score) and background glows to the Hero section.
  - Created a reusable **Notification Banner** system and a premium Privacy Policy announcement.
  - Redesigned **Interview Advisor** with a chat-based UI and adaptive personas (e.g., "Senior Engineer").
- **Onboarding & Authentication**:
  - Implemented **delayed authentication**, allowing flow completion (journey, resume upload) before account creation.
  - Added **personalized "delight" snapshots** during parsing and high-fidelity loading states.
  - Integrated inline account creation and improved monthly/annual pricing toggles.
- **Features**:
  - **Skills**: Launched **Unified Skills Interview** (multi-skill assessment) with Proficiency Filtering.
  - **Education**: Added **Dynamic Degree Requirements** checklist and program-based progress tracking.
  - **Interviews**: Enhanced **Tailored Job Interview** mode with role-appropriate technical scenarios.
- **Plans & Monetization**:
  - Significantly increased **Pro Limits** (500 analyses/day) and implemented dynamic **Stripe Tier Mapping**.
  - Added **promotion code support** and dynamic **headline cycling** on the Plans page.
- **Legal**: Added **"Key Takeaway" cards** to TOS and expanded the Privacy Policy (Data Retention, User Rights).

### Changed
- **Premium Design Refresh**:
  - Massive UI overhaul of **Skills**, **Settings**, **Resume Editor**, and **Job** modules with a "glassmorphism" aesthetic.
  - Redesigned core `Card.tsx` and `BentoCard.tsx` to use light glass effects and ambient accent glows.
  - Refined **Skill Card** and **Application History** layouts for better visual consistency.
- **Navigation & Layout**:
  - Implemented **cumulative tier filtering** on the Features page (Pro includes all, Plus includes Explorer).
  - Standardized **Header padding** and nav island opacity (80%) to prevent content bleed.
  - Switched Features grid to **CSS Grid** for consistent alignment and centered final rows.
- **Stripe & Checkout**:
  - Migrated from embedded modals to **full-page hosted checkout** for improved reliability.
  - Fixed quota alignment and updated plan badges (e.g., "Recommended" for Pro).
- **Core Improvements**:
  - Migrated feature data into the centralized `featureRegistry.ts` for single-source-of-truth parity.
  - Updated homepage grid to follow a process-driven workflow: **Match → Skills → Resume → Cover Letters → Job Feed**.
- **Performance & Stability**:
  - Implemented build-time **code splitting** (Vite `manualChunks`) and `esbuild` minification.
  - Added `preconnect` and `dns-prefetch` hints for Google Fonts and deferred `pdf.js` loading.

### Removed
- **Redundancy**: Removed "Admin Beta" tags, "Beta Feature" notices, and "Resume parsed successfully" toasts.
- **Legacy Components**: Deleted deprecated `SkillInterviewModal.tsx` and removed redundant Education dashboard cards.
- **Design Clutter**: Removed footer taglines and "Added" dates from skill cards to simplify the interface.

### Fixed
- **UI & Navigation**:
  - Resolved invisible headline text and fixed vertical alignment in Settings and Home sections.
  - Fixed critical navigation bugs where header links/buttons failed to trigger route changes.
  - Resolved a navigation bug where the **"Jobs" tab incorrectly remained highlighted** while on the Home page.
  - Resolved active state highlighting for nested sub-routes and synchronized URL changes with internal state.
- **Stripe & Auth**:
  - Fixed "Invalid API key" and "Invalid JWT" errors by improving error identification and reporting.
  - Resolved `400 Bad Request` in checkout session generation for new users.
  - Synchronized price IDs with confirmed Stripe Test Mode values.
- **Stability**:
  - Resolved critical runtime crashes in `Header.tsx`, `AppRoutes.tsx`, and `OnboardingPage.tsx` caused by missing imports or malformed JSX.
  - Fixed a critical **"useUser" Context error** by implementing robust prop-passing across lazy-loaded module boundaries (`HomeInput`, `FeatureGrid`).
  - Fixed module import errors for `BentoCard`, `interviewAiService`, and `SkillInterviewModal`.
  - Resolved session start bugs in the Interview Advisor.
- **Code Quality**:
  - Cleaned up TypeScript linting errors and removed unused imports/variables across the codebase.


## [2.14.0] — 2026-02-18

### Added
- **Resume Tailoring Suite**: Implemented suite for Plus/Pro tiers, featuring **Tailored Summary** generation and **Hyper-Tailor** (Bulk & Individual) block rewriting.
- **Diff View**: Added visual before/after comparison (strikethrough vs. new) and per-block **Reset/Undo** functionality.
- **Premium Upload Flow**: Added new 3-card upload flow (Foundation, Intelligence, Upload) as the official empty state.
- **Education Mechanics**: Implemented automatic **GPA Calculator** (4.0 scale), **Program Explorer**, and "Add Term/Course" planning functionality.
- **Smart Onboarding**: Implemented real-time **Student Detection** (from resume) and predictive transcript prompts.
- **Edu Components**: Created state-aware `EduHero` component and **Parsing Snapshot** for real-time skills feedback during onboarding.
- **Mentorship Tools**: Implemented premium 3-card guide for Mentor upload flow (Identify, Distill, Analyze) and high-fidelity `LinkedInExportSteps` modal.
- **Dynamic Role Farming**: Implemented system for automatic job title standardization and `canonical_roles` tracking in Supabase.
- **Industry Personas**: Implemented granular **Job Mapping** system with specialized industry personas (`TRADES`, `HEALTHCARE`, `CREATIVE`, `TECHNICAL`) and role-specific prompt templates.
- **SEO Engine**: Integrated `react-helmet-async` and created centralized `SEO` component for dynamic head management.
- **SEO Assets**: Added standard `robots.txt`, `sitemap.xml`, and Open Graph/Twitter Card support with professional default meta tags.
- **System Constants**: Introduced structural constants in `src/constants.ts` for **Tracking Events**, **Bento Categories**, and **PLAN_LIMITS**.
- **Plans Page**: Created dedicated page featuring premium pricing tiers and feature comparisons.
- **Legal Compliance**: Implemented official high-fidelity **Privacy Policy**, **Terms of Service**, and **Contact** pages.
- **Theme Transitions**: Added "Theme Pulse" transition on onboarding completion.

### Changed
- **Guideline Injection**: Integrated modular injection for job analysis and cover letter generation.
- **Usage Limits**: Implemented **Resume Tailoring Usage Limits** (max 2 attempts per block) and "Dual-Gate" inbound limit system (Emails vs. Jobs).
- **Refactor**: Refactored `SEOLandingPage` to use the new component system.
- **Feed Architecture**: Generalized Job Feed to be strictly user-driven (removed hardcoded scraping targets).
- **Settings UI**: Updated `SettingsModal.tsx` with emerald (Jobs) and indigo (Emails) progress bars, and a 3-column layout (Account, Plan, Integrations).
- **Accessibility**: Improved **Cover Letter Editor** accessibility with ARIA roles and fixed mobile layout issues.
- **Navigation**: Added prominent "Upgrade" button and restored Dark Mode toggle to main navigation.
- **UX Feedback**: Added immediate "Copied!" feedback for tokens/emails and granular rating loops for cover letters.
- **Policies**: Updated transparency disclosures to include **AI Quality Logging** and **PII Redaction** policies.

### Removed
- **Self-Service Deletion**: Removed to prevent abuse.

### Fixed
- **Tests**: Added comprehensive unit tests for architectural constants, upload flows, and usage limits.


## [2.13.0] — 2026-02-17

### Added
- **Homepage Visuals**: Redesigned all bento cards with premium, interactive graphics, high-fidelity SVG animations, and ambient glows.
- **Education Graphics**: Complete overhaul of `EducationDashboard` graphics, including high-fidelity interactive previews for Academic Record, Program Explorer, and GPA Calculator.
- **Browser Extension Alpha**: Initial release of the Navigator Chrome Extension with job description capture and direct save functionality.
- **Email Alerts Usage**: Added visual progress bar in Settings to track daily email job alert limits.
- **Abuse Prevention**: Implemented browser fingerprinting to detect and limit multi-account abuse.
- **Data Integrity**: Added `job_id` tracing to all AI operations for improved debugging.
- **Career Planning**: Implemented "Quick Add" goal input and functional Drag & Drop support to the Role Models section.
- **Education Content**: Implemented randomized, aspirational headlines for the Education Command Center.
- **Feature Interaction**: Made feature cards fully clickable for smoother transitions.

### Changed
- **Visual Distinction**: Differentiated Match (circular) and GPA (vertical pillar) graphics for better module separation.
- **Micro-Animations**: Added hover-triggered state changes to all feature cards.
- **Branding Polish**: Updated dual taglines ("Building For Your Career" and "Privacy-First AI") and footer copyright to Title Case.
- **Navigation Terminology**: Renamed "Job" to **"Jobs"** (encompassing Feed, Match, History).
- **Standardized Naming**: Consistently singularized "Resumes" to **"Resume"** across the platform.
- **Transcript Identity**: Standardized "Academic Record" to **"Transcript"** for clearer module identity.
- **Module Architecture**: Refactored Education page to use the unified `BentoCard` system.
- **Routing Structure**: Refactored to use nested paths (`/jobs`, `/career`, `/education`) for better organization.
- **Score Branding**: Rebranded "Navigator Score" to **Match Score**.
- **Onboarding Refresh**: Updated `WelcomeScreen` to collect user names and register device IDs.
- **Career UI**: Redesigned toggles and mode selectors with premium glassmorphism.
- **History UI**: Redesigned Application History with premium glassmorphism and lift effects.
- **Profile Management**: Unified profile management in `UserContext`.

### Fixed
- **Navigation Bugs**: Resolved issues where header links (Career, Education) failed to navigate or highlight correctly.
- **Authentication**: Replaced token copy-paste in extension with standard Email/Password login.
- **Stability**: Resolved "Failed to fetch" errors by implementing `lazyWithRetry`.
- **UI Consistency**: Aligned Education card dimensions and centering with the Home page grid.
- **Clean-up**: Removed redundant "Cover Letters" and "Coach" sub-links.
- **Build & Tests**: Resolved post-refactor build failures and regression in `History` and `GapAnalysis` tests.
- **Navigation Verification**: Verified functionality of all 20+ Header and Footer links via automated browser testing.


## [2.12.0] — 2026-02-16

### Added
- **Global UI**: Architecture: Migrated theme state to `GlobalUIContext` for unified state management across the application.
- **Navigation**: Added interactive navigation to the "Profiles" and "Goals" stats cards on the Coach Dashboard.

### Changed
- **Branding**: Officially moved past "Beta" terminology in the UI. Renamed "Join the Beta" to "Create Account" and "Beta" tester tags to "Early Access".
- **Branding**: Simplified header branding to **Navigator**.
- **UX**: Removed the "work email" requirement/nudge from the sign-in modal to be more inclusive.
- **Auth**: Simplified authentication flow titles and removed waitlist references.
- **Navigation**: Updated active state style for main navigation with category-specific colors (Indigo, Emerald, Amber).
- **Settings**: Complete UI overhaul with a 3-column layout (Account, Plan & Usage, Settings).
- **Performance**: Removed ambient background animations to reduce resource usage.

### Fixed
- **Navigation**: Resolved a redirection bug where Career sub-pages (Models, Gap) incorrectly kicked users back to the main Coach view.
- **Routing**: Consolidated view-ID-to-path mappings for improved consistency across `AppRoutes` and `AppLayout`.
- **Navigation**: Fixed the "active pill" shape distortion during tab transitions.
- **Routing**: Fixed a mismatch between the `ROUTES.ANALYZE` constant and the route definition in `AppRoutes.tsx`.
- **Coach**: Resolved issue where Coach sub-pages were redirecting to the Coach Home page.
- **Usage Limits**: Fixed a bug where Admin and Tester users were subject to Free tier analysis limits.
- **Usage Limits**: Fixed a UI bug where admin users initially saw a "0 / 3" limit.
- **Security**: Hardened database functions by setting `search_path = public`.
- **Admin**: Restored full Admin Dashboard functionality and fixed database schema drift.


## [2.11.9] — 2026-02-16

### Added
- **Education module**: Restored the `EducationDashboard` (Overview) as the main entry point for the module.

### Changed
- **Navigation**: Separated "Education" (Overview) and "Academic Record" (Transcript) into distinct routes.
- **Routing**: Updated structure to support `/edu` and `/edu/record`.

### Fixed
- **Stability**: Resolved build-breaking TypeScript errors in `SettingsModal.tsx` and `EducationDashboard.tsx`.


## [2.11.1] — 2026-02-15

### Added
- **Quality Assurance**: Added automated tests for `Header` layout integrity to prevent regressions.
- **Workflow**: Introduced a UI Quality Checklist for future interface updates.

### Fixed
- **Navigation**: Resolved a layout issue where the navigation pill appeared below the header elements. Aligned it vertically to the center.
- **Stability**: Resolved a merge conflict in `Header.tsx` to ensure type safety.


## [2.11.0] — 2026-02-15

### Added
- **Navigation**: Integrated `framer-motion` for a premium, smooth transition experience. Includes a "sliding puck" active indicator and fluid layout resizing for the central navigation island.

### Fixed
- **Stability**: Resolved several build-breaking TypeScript errors caused by unused imports and variables in `SettingsModal.tsx`, `CoachContext.tsx`, and `storageCore.ts`.


## [2.10.0] — 2026-02-15

### Added
- **Architecture**: Established a "Single Source of Truth" for spacing using semantic categories (`hero`, `compact`, `none`) in `SharedPageLayout` and `PageLayout`. This ensures pixel-perfect vertical alignment across the entire app.

### Changed
- **Branding**: Simplified header branding from "Job Navigator" to just **Navigator** for a unified identity.
- **UI Refinement**: Standardized all pages with hero headers (Home, Job Detail, Coach, Grad) to a consistent `pt-24` top offset.
- **Honest Design**: Removed misleading grey circle placeholders and redundant copy from the Hero section.
- **Header**: Reverted the "Sign In" button to a clean text-only style for a more minimal aesthetic.
- **Cleanup**: Stripped all ad-hoc layout wrappers and paddings from `AppRoutes.tsx`.


## [2.9.0] — 2026-02-15

### Added
- **Job Alert Email Feed**: Implemented an AI-powered system that captures job alerts from inbound emails (Postmark) and triages them automatically in a new "Job Feed" view.
- **Inbound Email Tokens**: Unique Navigator email addresses generated per user for private job alert redirection.
- **Gemini Ingestion Engine**: Supabase Edge Function using Gemini to extract job data, calculate match scores, and provide triage reasoning from raw email bodies.
- **Auto-Cleanup**: Automated 7-day TTL (Time-To-Live) for feed items to keep the stream fresh and self-cleaning.
- **Monetization**: Restrictive access to Job Automation features for Pro-tier users with integrated upgrade nudges.
- **Save to History**: One-click bookmarking to move jobs from the transient Feed to permanent application History.

### Changed
- **Architecture**: Completed a major 3-phase refactor to improve modularity and maintainability.
  - **App Shell**: Extracted routing into `AppRoutes.tsx` and layout into `AppLayout.tsx`, reducing `App.tsx` from 400+ lines to 35.
  - **Context Logic**: Extracted heavy business logic from `JobContext` and `CoachContext` into dedicated "Manager" hooks (`useJobManager`, `useCoachManager`).
  - **Global Modal System**: Implemented a centralized `ModalContext` to eliminate prop-drilling for all global modals (Auth, Settings, etc.).
- **Visuals**: Cleaned up the application shell and improved background transitions.


## [2.8.3] — 2026-02-14

### Changed
- **Premium Design**: Redesigned the Bento feature grid with a unique, muted color palette (Sky, Violet, Rose, Indigo, Teal) for a more sophisticated and professional aesthetic.
- **Visual Consistency**: Ensured color uniqueness across all 10+ feature variants in both logged-in and logged-out states.

### Fixed
- **Navigation**: Resolved a critical issue where the header menu buttons updated the UI state but failed to trigger actual URL changes, causing the app to feel "broken" when navigating between modules.
- **Routing**: Implemented a bidirectional sync between the Global UI state and React Router URLs to ensure consistency across the application.


## [2.8.2] — 2026-02-13

### Changed
- **UI Refinement**: Reduced top padding and improved hero card spacing in `HomeInput` for a more balanced layout.
- **Layout**: Simplified route wrappers in `App.tsx` by delegating spacing to the `SharedPageLayout` component.


## [2.8.1] — 2026-02-13

### Fixed
- **Deployment**: Resolved a Vercel build failure caused by an unused `React` import in `LandingContent.tsx` which triggered a TypeScript error.


 
## [2.8.0] — 2026-02-13

### Added
- **Genuine Usage Tracking**: Implemented a two-tier tracking system distinguishing between user "Interest" (clicks) and actual "Usage" (feature actions) across all modules (JobFit, Coach, Keywords, Resumes, Cover Letters).
- **Admin Conversion Dashboard**: Added a comprehensive "Feature Usage" breakdown in Settings for Admins, showing curiosity (CLK) vs action (ACT) with real-time conversion rates.

### Changed
- **Centralized UI**: Unified `FeatureGrid.tsx` for a consistent 5-column layout across both logged-in and logged-out views.
- **UI Refinement**: Removed inaccurate "1,200+ analysis" badge from the landing page.

### Fixed
- **Stability**: Resolved "Failed to fetch" errors with `SettingsModal` dynamic imports.
- **Code Quality**: Fixed over 30 linting errors and resolved unused import warnings across the codebase.


## [2.7.0] — 2026-02-12

### Added
- **Education Module**: Reimagined `MAEligibility` as a **Targeted Program Fit** analyzer. Features include specific Match % scores, side-by-side GPA benchmarking, and traffic-light course mapping.
- **Career Module**: Implemented **Trajectory Comparison** overlay for side-by-side visualization of user journey vs. role model history (Point A to Point B).
- **Career Module**: Added **Evidence Quick-Copy** feature to Gap Analysis, providing AI-tailored resume bullets ready for one-click use.
- **AI Infrastructure**: Upgraded `analyzeMAEligibility` prompt to act as a "Program Architect," reverse-engineering school-specific admission requirements.

### Changed
- **Coach Dashboard**: Refactored `CoachDashboard.tsx` by extracting logic into atomic components (`CoachHero`, `RoleModelSection`, `GapAnalysisSection`) to improve maintainability.
- **Edu Module**: Refactored `AcademicHQ.tsx` by extracting logic into atomic components (`AcademicHero`, `AcademicProfileSummary`, etc.).
- **Testing & Stability**: Implemented a comprehensive test suite (23 new tests) for Career and Edu modules.
- **Code Quality**: Refined type definitions in `storageCore.ts` and improved error handling in Edge Functions.
- **State Management**: Resolved a nested state mutation bug in `useAcademicLogic` that affected credit calculations.
- **Test Infrastructure**: Fixed global state leakage in `localStorage` by ensuring mock stores are cleared.

### Fixed
- **History**: Resolved a bug where jobs in "Analyzing" or "Failed" states were hidden from the "Saved" filter view.
- **History**: Added distinct status labels and visual styles (including pulse animations) for "Analyzing" and "Failed" job states.
- **Storage**: Implemented a "Sync Fallback" to ensure jobs with "Analyzing" or "Failed" statuses are compatible with the backend database constraints.
- **History**: Resolved a filtering bug where jobs without a status (implicitly "Saved") were hidden from the "Saved" view.
- **History**: Fixed a React linting error by moving the `StatusTab` component out of the render cycle.
- **Tests**: Resolved failing tests in `jobStorage.test.ts` by correcting the Supabase mock path and updating test data to use valid UUIDs.
- **Tests**: Updated `History.test.tsx` to align with the current empty-state UI text.
- **Code Quality**: Fixed a critical "access before declaration" error in `ToastContext.tsx` and resolved over 30 linting errors across `App.tsx`, `AuthModal.tsx`, `JobDetail.tsx`, and AI service files.


## [2.6.0] — 2026-02-12

### Security
- **Backend AI Selection**: Migrated model resolution and Gemini API calls to a secure Supabase Edge Function to prevent client-side tampering and enforce subscription tiers.
- **JWT Verification**: Implemented mandatory authentication for all AI requests via the backend proxy.

### Changed
- Refactored `jobAiService`, `resumeAiService`, and `eduAiService` to use task-based model selection.
- Removed `TIER_MODELS` configuration from frontend to better hide backend logic.


## [2.5.0] — 2026-02-12

### Added
- **AI Infrastructure**: Implemented a **Tiered AI Model Strategy** that dynamically resolves models based on user subscription tiers (`free`, `pro`, `admin`, `tester`).
- **AI Infrastructure**: Added support for **Gemini 2.5 Pro** (Standard Pro) and **Gemini 3 Pro** (State of the Art Reasoning) for professional and admin tiers.
- **UX**: Added interactive status filter tabs (Applied, Interview, Offer, Rejected) to the `History` page for faster navigation.

### Changed
- **Architecture**: Refactored `aiCore.ts`, `jobAiService.ts`, `resumeAiService.ts`, and `eduAiService.ts` to support multi-model orchestration and task-based model selection.
- **Improved**: Enhanced developer visibility into AI API errors with explicit logging in `aiCore.ts`, surfacing specific error codes (like 404s) before generalization.
- **UI**: Redesigned the `History` page using the `PageLayout` component to match the premium aesthetic of the Job Feed.
- **UI**: Replaced the `History` grid with a detailed vertical list view, surfacing key metadata like Match Score and Application Status.
- **UI**: Removed "Save from anywhere" bookmarklet from the homepage to reduce clutter. It now only appears on job pages.
- **UX**: Job analysis now runs in the background, allowing users to read the job description or navigate the app while the AI processes the role. Replaces the blocking full-screen loader with non-intrusive skeleton states.

### Fixed
- **AI**: Resolved "404 Not Found" errors and application-wide "Connection issue" messages caused by the retirement of the `gemini-1.5-pro` model.
- **Tests**: Updated `constants.test.ts` to align with the new task-based model constants (`EXTRACTION`, `ANALYSIS_PRO`).


## [2.4.0] — 2026-02-12

### Added
- **Safety**: Automated detection of "No AI" policies in job descriptions. Warnings are displayed in the Cover Letter Editor to protect users from disqualification.
- **Agentic Workflow**: "Auto-Iterate" agent for Pro users that critiques and refines cover letters in a feedback loop until quality thresholds are met.
- **UX**: New "Job Post" tab in `JobDetail` that displays a clean, AI-distilled version of the job description, removing navigation and footer clutter.
- **Architecture**: Shared "Gradient Header" and "Page Layout" components to unify the design across Job, Coach, and Grad modules.
- **Stability**: Global Error Boundary to prevent application crashes from isolated component errors.

### Changed
- **Performance**: Increased job extraction limit to 15,000 characters to support full-page "Ctrl+A" pastes without data loss.
- **Code Quality**: Enforced strict `import type` usage across all services for better tree-shaking and smaller bundle sizes.
- **Refactor**: Centralized `extractJobInfo` logic to return structured `DistilledJob` data including new safety flags (`isAiBanned`).

### Fixed
- **UI**: Fixed card separator misalignment by enforcing consistent height for preview sections in `BentoCard`.
- **UI**: Reduced the height of dashboard cards in `ActionGrid` and `BentoCard` to improve visual density and reduce scrolling.
- **UI**: Fixed Dark Mode toggle by adding missing Tailwind v4 `@custom-variant` configuration.


## [2.3.4] — 2026-02-11

### Changed
- **Header**: Refactored `HeroHeader` into a reusable component for consistent branding across Job, Coach, and Grad pages.
- **Performance**: Removed expensive ambient background animations to reduce system resource usage.

### Fixed
- **Layout**: Fixed vertical alignment offset in `HomeInput` (Analyze page) by standardizing top padding.
- **Stability**: Resolved syntax errors and conditional rendering logic in `CoachDashboard` that caused white screens.


## [2.3.3] — 2026-02-11

### Fixed
- **Deployment**: Removed `/Navigator` base path configuration to support root domain deployment on Vercel.


## [2.3.2] — 2026-02-11

### Fixed
- **Routing**: Fixed a routing configuration mismatch (`base` vs `basename`) that caused a blank screen on deployment.


## [2.3.1] — 2026-02-11

### Removed
- **Marketing**: Removed the "ATS Comparison" and "Analyzing JD" preview graphics based on feedback.

### Fixed
- **Design System**: Restored clean `neutral` palette, removing the inadvertent blue tint from both theme modes.
- **Dark Mode**: Refined dark mode back to core black (`#0a0a0a`).
- **Layout**: Corrected the `History` view width to match the standard site container (`max-w-7xl`).
- **Visibility**: Fixed legibility of animated headlines ("Ace the...") that was impacted by theme changes.


## [2.3.0] — 2026-02-07

### Added
- **Programmatic SEO**: Implemented a dynamic SEO landing page engine at `/resume-for/:role` with a universal master template.
- **Canonical Routing**: Added a `CanonicalService` to map diverse job titles to standard high-quality SEO buckets.

### Changed
- **Architecture**: Refactored application state to distinguish between `activeSubmissionId` (specific user action) and `roleId` (canonical job role).
- **Architecture**: Updated all navigation and state logic to use the new "Submission ID" terminology for better clarity.
- **Routing**: Integrated `react-router-dom` more deeply to handle persistent SEO URLs and history navigation.


## [2.2.1] — 2026-02-07

### Changed
- **UI**: Narrowed Bento grid containers (`max-w-7xl`) to align perfectly with the header's navigation boundaries.
- **UI**: Reordered header buttons to a more logical flow: Log Out → Admin → Settings.
- **UI**: Optimized the `ActionGrid` to display 5 cards in a single row on XL screens for better balance.

### Fixed
- **UI**: Resolved a race condition where the "Sign In" button and navigation pill would flicker or appear together during authentication loading.
- **Build**: Fixed an unused `TrendingUp` icon import in `MarketingGrid` that was causing Vercel deployment failures.


## [2.2.0] — 2026-02-05

### Added
- **Role Model Emulation**: Comparison mode to bridge the gap between user profile and specific Role Models (`analyzeRoleModelGap`).
- **Token Usage Tracking**: Granular, per-user tracking of AI token consumption in `daily_usage`.
- **Admin Insights**: `usage_outliers` SQL view to detect abusive token usage per subscription tier.

### Security
- **Hardening**: Explicitly set `search_path = public` on all PL/PGSQL functions to prevent hijacking.
- **Privacy**: Restricted `daily_usage` table visibility to Admins only via RLS.
- **Reliability**: Enforced `application/json` on AI responses and implemented manual input sanitization.


## [2.1.4] — 2026-02-02

### Changed
- **UI**: Removed "Role Model Synthesis" card from logged-out marketing grid. Kept 8 cards for a perfect 2x4 layout: JobFit Score, Keyword Targeting, Private Vault, Smart Cover Letters, Tailored Summaries, Bookmarklet, AI Career Coach, and 12-Month Roadmap.
- **UI**: Updated `WelcomeScreen` feature cards to use `rounded-[2.5rem]` border radius for consistency with the glassmorphism design system.


## [2.1.3] — 2026-02-01

### Changed
- **UI**: Removed the "Bookmarklet" card from the marketing grid to create a perfect 8-card layout (2 rows of 4).


## [2.1.2] — 2026-02-01

### Changed
- **UI**: Aligned logged-out marketing card dimensions with logged-in action cards. Updated to 4-column grid, `p-6` padding, and `1920px` max-width.


## [2.1.1] — 2026-02-01

### Fixed
- **UI**: Fixed a bug where both marketing cards and action cards would render simultaneously for logged-out users. Added strict user session checks to the action card grid.


## [2.1.0] — 2026-02-01

### Changed
- **UI**: Unified design system between logged-in and logged-out states. All cards now use the premium glassmorphism aesthetic (`rounded-[2.5rem]`, backdrop blur).
- **Welcome**: Refined `WelcomeScreen` features with glassmorphism style for a better first impression.


## [2.0.1] — 2026-02-01

### Fixed
- **Build**: Fixed syntax error and unused variable in `CoachDashboard` that caused Vercel deployment failure.


## [2.0.0] — 2026-02-01

### Added
- **AI Career Coach**: New dashboard for career path analysis and role model tracking.
- **Role Model Support**: Capability to upload and distill patterns from LinkedIn profile PDFs.
- **Gap Analysis**: Detailed skill gap comparison between user profile and target roles.
- **12-Month Trajectory**: Automated professional roadmap generation.

### Fixed
- **Performance**: Resolved an infinite render loop in `HomeInput` component that caused high CPU usage.
- **Cleanup**: Terminated orphaned background processes during initialization.
