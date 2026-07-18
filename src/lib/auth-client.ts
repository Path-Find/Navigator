import { createAuthClient } from '@neondatabase/auth';
import { SupabaseAuthAdapter } from '@neondatabase/auth/vanilla/adapters';

// SECURITY NOTE (2026-07-12): @neondatabase/auth is beta (0.4.2-beta) and pulls in
// better-auth@1.4.18, which has a disclosed critical CVE (OAuth auto-link account
// takeover + unauthorized org-invite acceptance — GHSA-g38m-r43w-p2q7, GHSA-fmh4-wcc4-5jm3).
// Both bugs live in the OAuth social-login and organization/invite plugins, which this
// app does not use (email/password only, no social login, no org invites). Re-audit
// before enabling either feature, or once @neondatabase/auth ships a stable release.

// SupabaseAuthAdapter (not BetterAuthReactAdapter) deliberately: it's typed as
// InstanceType<typeof AuthClient> from @supabase/auth-js — the same interface
// `supabase.auth` already exposes (getSession, onAuthStateChange, signOut, getUser,
// resend, signInWithPassword). Same Better Auth backend either way; this adapter
// just makes the 16-callsite Supabase→Neon swap near drop-in instead of a rewrite
// to Better Auth's different (signIn.email/useSession) API shape.
export const authClient = createAuthClient(
    import.meta.env.VITE_NEON_AUTH_URL,
    { adapter: SupabaseAuthAdapter() }
);

// Shared helper for calling api/* Vercel Functions (gemini-proxy, profile, etc.),
// which verify this same token against Neon Auth's JWKS endpoint.
export async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await authClient.getSession();
    return session?.access_token ?? null;
}
