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

export async function verifyUser(authHeader: string | null): Promise<string> {
    if (!authHeader) throw new Error('Missing Authorization header');
    if (!JWKS) throw new Error('NEON_AUTH_BASE_URL not configured');

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { payload } = await jwtVerify(token, JWKS, {
        issuer: ISSUERS,
    });
    if (!payload.sub) throw new Error('Token missing subject claim');
    return payload.sub;
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
