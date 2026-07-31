import { jwtVerify, createRemoteJWKSet } from 'jose';

// Shared Neon Auth JWT verification — https://neon.com/docs/auth/guides/plugins/jwt
// Used by every Vercel Function that needs to know who's calling.

const JWKS = process.env.NEON_AUTH_BASE_URL
    ? createRemoteJWKSet(new URL(`${process.env.NEON_AUTH_BASE_URL}/.well-known/jwks.json`))
    : null;

// Neon Auth runs Better Auth, which defaults the `iss` claim to the full configured
// baseURL — including the `/neondb/auth` path — not its origin. Accept both spellings
// so verification doesn't hinge on which one Neon happens to set; `jose` treats an
// array as "any of these". Checking only the origin silently 401s every request.
const ISSUERS = process.env.NEON_AUTH_BASE_URL
    ? [...new Set([
        process.env.NEON_AUTH_BASE_URL.replace(/\/$/, ''),
        new URL(process.env.NEON_AUTH_BASE_URL).origin,
    ])]
    : [];

/**
 * Thrown when the caller isn't authenticated, so handlers can answer 401 instead
 * of folding it into their generic 500/400 catch. A signed-out or expired-session
 * user needs to be sent back to sign-in; a 500 tells the client to retry forever.
 */
export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export async function verifyUser(authHeader: string | null): Promise<string> {
    if (!authHeader) throw new AuthError('Missing Authorization header');
    // Not an AuthError — this one is our misconfiguration, not the caller's fault,
    // and should surface as a 500 so it gets noticed rather than looking like a
    // routine signed-out request.
    if (!JWKS) throw new Error('NEON_AUTH_BASE_URL not configured');

    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
        const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUERS });
        if (!payload.sub) throw new AuthError('Token missing subject claim');
        return payload.sub;
    } catch (error) {
        if (error instanceof AuthError) throw error;
        // jose throws for expired, malformed, or wrongly-signed tokens — all of
        // which mean "sign in again", not "the server broke".
        throw new AuthError(error instanceof Error ? error.message : 'Invalid token');
    }
}

export const getCorsHeaders = (req: Request) => {
    const ALLOWED_ORIGINS = [
        process.env.SITE_URL ?? '',
        'http://localhost:5173',
        'http://localhost:4173',
    ].filter(Boolean);

    const origin = req.headers.get('Origin') ?? '';
    const isVercel = origin.endsWith('.vercel.app');
    const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isVercel) ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, content-type',
    };
};
