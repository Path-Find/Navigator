# NextGen

The personalization engine that makes Navigator learn from you over time.

## What it does

Most of Navigator works the same way for everyone — you paste a job, we analyze it. NextGen is the layer that makes it personal. The more you use the app, the better it gets at understanding what fits you and how you write.

There are three things it tracks:

**Writing style** — every time you generate or edit a cover letter, the engine picks up patterns in how you write. Over time it builds a style guide that gets passed into cover letter generation, so letters sound like you rather than a generic AI.

**Activity signals** — when you save a job, approve a cover letter, or move a role to Interview or Offer, that gets recorded. The engine uses those signals to tune match quality — roles similar to the ones you've engaged with score higher.

**Career trajectory** — by comparing your resume experience against a target role, the engine can identify where the gaps are and frame cover letters around a growth narrative rather than just current fit.

## How it's wired up

- Style is fetched automatically before every cover letter generation and injected into the prompt
- Signals are captured automatically in the background — no action needed
- Trajectory context is passed into cover letter generation when a target role is set

The admin panel in Settings shows what the engine has learned so far — writing style extracted, signals recorded, and whether it's active.

## Implementation status

- [x] Feedback signal capture (save, approve, outcome)
- [x] Style distillation from cover letter edits
- [x] Style injection into cover letter generation
- [x] Career trajectory calculation
- [x] Semantic match scoring
- [x] Admin status panel in Settings
- [ ] Signal-weighted match scoring (use outcome signals to rerank feed)
- [ ] Cross-session style refinement (improve style model as more letters are written)

---

For a full history of completed features, see the [Changelog](../CHANGELOG.md) and [Changelog Archive](../CHANGELOG_ARCHIVE.md).

[Back to Roadmap](../ROADMAP.md)
