import { neon } from '@neondatabase/serverless';
import { getCorsHeaders } from './_lib/verifyAuth.js';

// Public endpoint — called pre-login to decide whether to show the password form
// or the waitlist form, so it can't require a token. Same exposure as the old
// Supabase anon-key RPC call (no security regression, just a different transport).

const sql = neon(process.env.NEON_DATABASE_URL!);

async function handler(req: Request): Promise<Response> {
    const cors = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: cors });
    }
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 405,
        });
    }

    try {
        const { email } = await req.json() as { email?: unknown };
        if (!email || typeof email !== 'string') {
            return new Response(JSON.stringify({ error: 'email is required' }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        const rows = await sql`SELECT check_user_exists(${email.toLowerCase().trim()}) AS exists`;
        return new Response(JSON.stringify({ exists: rows[0]?.exists ?? false }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('check-user-exists error:', message);
        return new Response(JSON.stringify({ error: 'Unable to check account status. Please try again.' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}

// Vercel only passes a Web-standard `Request` when the module exports a `fetch`
// member (or named GET/POST exports). A bare `export default function handler`
// is read as the legacy Node `(req, res)` signature, which makes every
// `req.headers.get(...)` throw `is not a function` at runtime.
export default { fetch: handler };
