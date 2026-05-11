# Gemini

- **AI-Legibility**: Max 700 lines per file. Decouple components into specialized hooks.
- **State**: `Context` for Global/Cloud Sync; `useState` for UI.
- **Proxy**: All AI calls must hit `gemini-proxy` (No direct provider calls).
- **Aesthetics**: Use `index.css` Glassmorphism tokens. No ad-hoc styles.
- **Testing**: Use real emails only. No placeholder or fake addresses (affects auth/sync).
- **Notion**: Follow [NAVIGATORLOG.md](./NAVIGATORLOG.md). `NavigatorLog` is a portfolio tracker, not a feature log. Draft locally first when needed and only add final-form, notable entries.

## Changelog

- **Section order**: `Added → Changed → Removed → Fixed → Security → Performance`. Never deviate.
- **Bold labels**: Every bullet must open with a `**Title Case Label**:` — no lowercase, no exceptions.
- **One entry per bug**: Do not create multiple bullets describing the same root cause. Merge them.
- **Section assignment**: Features go in `Added`. Performance improvements go in `Performance`. Do not put features under `Performance` or vice versa.
- **No version-pinned archive pointer**: The archive link in `CHANGELOG.md` must not reference a specific version number (it becomes stale immediately).
- **Thin releases**: Entries with only internal maintenance (branch pruning, roadmap cleanup) should be folded into the nearest real release, not given their own version.
- **Archive header**: `CHANGELOG_ARCHIVE.md` must not reference a specific version cutoff in its opening line.
