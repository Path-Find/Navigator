# Product

Immediate focus on expanding active workflow tools and solidifying platform trust.

## Immediate Focus (Experience & Quality)

- [ ] **Interactive Cover Letter (Co-Pilot)**: Shift from "one-shot" generation to a collaborative "Write it with me" experience. Includes gap analysis, narrative pivots, and step-by-step steering to give users maximum control over their story.
- [ ] **PDF Export (High Priority)**: Download tailored cover letters and resumes as clean, print-ready PDFs. Current `window.print()` approach is broken — needs a popup-window render or library-based solution.
- [ ] **Mobile Responsive Pass**: Ensure the dashboard and history are fully functional on mobile browsers.

## Job Cards

- [ ] **Personalized job cards (logged-in)**: When a user is authenticated, job cards across History and Feed should surface user-specific context rather than showing the same info for everyone. Directions to explore (in a separate branch):
  - **Fit score badge** — quick compatibility score against the user's resume shown directly on the card, so they can triage without clicking through
  - **Skills delta** — 2–3 matching skills the user has vs. notable gaps, surfaced inline on the card
  - **Status awareness** — cards that reflect prior interaction (already saved, applied, dismissed) instead of looking identical to untouched ones

## Data & Future

- [ ] **Accessibility**: Complete WCAG 2.1 pass for keyboard and screen reader support.
- [ ] **Data Portability**: Export application history and analyzed job data to CSV/JSON.

---

For a full history of completed features, see the [Changelog](../CHANGELOG.md) and [Changelog Archive](../CHANGELOG_ARCHIVE.md).

[Back to Roadmap](../ROADMAP.md)
