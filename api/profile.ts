import { neon } from '@neondatabase/serverless';
import { verifyUser, getCorsHeaders } from './_lib/verifyAuth';

// Vercel Function replacing direct client-side supabase.from('profiles') calls.
// Neon has no client-safe direct-Postgres access (unlike Supabase's RLS + anon key),
// so all profile reads/writes go through here instead.

const sql = neon(process.env.NEON_DATABASE_URL!);

const ALLOWED_UPDATE_FIELDS = [
    'device_id',
    'journey',
    'last_archetype_update',
    'accepted_tos_version',
    'next_gen_enabled',
] as const;

export default async function handler(req: Request): Promise<Response> {
    const cors = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: cors });
    }

    try {
        const userId = await verifyUser(req.headers.get('Authorization'));

        if (req.method === 'GET') {
            const rows = await sql`
                SELECT email, subscription_tier, is_admin, is_tester, next_gen_enabled,
                       journey, device_id, last_archetype_update, accepted_tos_version
                FROM profiles WHERE id = ${userId}
            `;
            const profile = rows[0];
            if (!profile) {
                return new Response(JSON.stringify({ error: 'Profile not found' }), {
                    headers: { ...cors, 'Content-Type': 'application/json' },
                    status: 404,
                });
            }
            return new Response(JSON.stringify({ profile }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (req.method === 'PATCH') {
            const body = await req.json();
            const updates: Record<string, unknown> = {};
            for (const key of ALLOWED_UPDATE_FIELDS) {
                if (key in body) updates[key] = body[key];
            }

            const keys = Object.keys(updates);
            if (keys.length === 0) {
                return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
                    headers: { ...cors, 'Content-Type': 'application/json' },
                    status: 400,
                });
            }

            const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
            const values = keys.map(key => updates[key]);
            const rows = await sql.query(
                `UPDATE profiles SET ${setClause} WHERE id = $1 RETURNING *`,
                [userId, ...values]
            );

            return new Response(JSON.stringify({ profile: rows[0] }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 405,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Profile API error:', message);
        return new Response(JSON.stringify({ error: 'Unable to load your profile. Please try again.' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 401,
        });
    }
}
