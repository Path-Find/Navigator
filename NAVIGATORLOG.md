# NavigatorLog

`NavigatorLog` is a portfolio tracker, not a development log.

It should read more like a resume than a changelog. The bar is not "did this ship?" The bar is "does this represent a substantial product, architecture, or strategic capability worth pointing to later?"

## What belongs

- Standout product capabilities that materially changed what Navigator is
- Major AI, platform, or architecture shifts with obvious user or system impact
- Meaningful infrastructure/security work when it reflects real engineering depth
- A small number of roadmap-worthy open items if they are unusually strong or distinctive

## What does not belong

- Patch-note clutter
- Narrow UI polish
- Small bug fixes unless they were truly critical and broadly impactful
- Cleanup, dependency churn, duplicate-file purges, lint passes, or maintenance-only work
- Release wrapper rows that just summarize other kept entries

## Title standard

- Prefer outcome-first titles that an outsider can understand quickly
- Avoid internal release framing like `v2.39.0`, `RC1`, or similar unless the version itself is the point
- Avoid titles that sound like commit messages or implementation scraps

## Workflow

- Draft entries locally first if there is any ambiguity
- Create entries in Notion only once they are final-form
- If the session cannot edit existing rows cleanly, treat Notion writes as write-once
- Default to adding shipped work after it is committed and pushed upstream

## Properties

- `Name`: concise, outsider-legible accomplishment title
- `Issue`: what was missing, broken, or strategically limited
- `Fix`: what changed technically and what it unlocked
- `Status`: usually `Shipped`; use backlog/in-progress sparingly and only for genuinely strong open items
- `Version`: fill only when it helps provenance; do not force it for every row
- `Author`: preserve original authorship for migrated legacy rows

## AI assistant rule

If something clearly meets this bar, add it directly.

If it is borderline, skip it rather than diluting the log.
