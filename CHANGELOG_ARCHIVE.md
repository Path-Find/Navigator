# Changelog Archive

All notable changes prior to those in [CHANGELOG.md](./CHANGELOG.md) are documented in this file.
For recent changes, see [CHANGELOG.md](./CHANGELOG.md).

## [1.1.0] — 2026-01-25

### Added
- Standardized documentation format including `SECURITY.md` and `LICENSE`.
- Secure storage utility for client-side encryption.

### Fixed
- **Security**: Removed hardcoded admin email from client code; admin status is now checked server-side via Supabase profiles.
- **Security**: Removed hardcoded invite code bypass; invite codes are now validated exclusively via server-side RPC.
- **Security**: Implemented AES-GCM encryption for API keys stored in `localStorage` using the Web Crypto API.
- **Security**: Eliminated third-party proxy dependency (`corsproxy.io`) for web scraping; all scraping is now handled via Supabase Edge Functions.

## [1.0.0] — 2026-01-24

### Added
- Initial release of JobFit.
- Job analysis with Google Gemini.
- Resume "Blocks" system.
- Cover letter generation.
- Local-first data storage.
