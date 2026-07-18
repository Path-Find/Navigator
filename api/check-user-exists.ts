import { neon } from '@neondatabase/serverless';
import { getCorsHeaders } from './_lib/verifyAuth';

// Public endpoint — called pre-login to decide whether to show the password form
// or the waitlist form, so it can't require a token. Same exposure as the old
// Supabase anon-key RPC call (no security regression, just a different transport).

const sql = neon(process.env.NEON_DATABASE_URL!);

export default async function handler(req: Request): Promise<Response> {
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
        const { email } = await req.json();
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
        return new Response(JSON.stringify({ error: message }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
