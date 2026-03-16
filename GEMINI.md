# Gemini

- **AI-Legibility**: Max 700 lines per file. Decouple components into specialized hooks.
- **State**: `Context` for Global/Cloud Sync; `useState` for UI.
- **Proxy**: All AI calls must hit `gemini-proxy` (No direct provider calls).
- **Aesthetics**: Use `index.css` Glassmorphism tokens. No ad-hoc styles.
- **Testing**: Use real emails only. No placeholder or fake addresses (affects auth/sync).
- **Notion**: Update the NavigatorLog database when deemed necessary (e.g., major ships or architectural wins).