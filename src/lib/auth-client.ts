import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

// SECURITY NOTE (2026-07-12): @neondatabase/auth is beta (0.4.2-beta) and pulls in
// better-auth@1.4.18, which has a disclosed critical CVE (OAuth auto-link account
// takeover + unauthorized org-invite acceptance — GHSA-g38m-r43w-p2q7, GHSA-fmh4-wcc4-5jm3).
// Both bugs live in the OAuth social-login and organization/invite plugins, which this
// app does not use (email/password only, no social login, no org invites). Re-audit
// before enabling either feature, or once @neondatabase/auth ships a stable release.

export const authClient = createAuthClient(
    import.meta.env.VITE_NEON_AUTH_URL,
    { adapter: BetterAuthReactAdapter() }
);
