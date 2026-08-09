import { neon } from '@neondatabase/serverless';
import { AuthError, getCorsHeaders, verifyUser } from './_lib/verifyAuth.js';

const sql = neon(process.env.NEON_DATABASE_URL!);

const SIGNAL_TYPES = new Set(['explicit_approval', 'explicit_correction', 'implicit_usage']);
const FEEDBACK_CONTEXTS = new Set(['tailoring', 'match_logic', 'cover_letter']);
const MAX_JSON_LENGTH = 100_000;

const jsonResponse = (body: unknown, cors: Record<string, string>, status = 200): Response =>
    new Response(JSON.stringify(body), {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        status,
    });

const serializeJson = (value: unknown, fieldName: string): string => {
    let serialized: string;
    try {
        serialized = JSON.stringify(value ?? null);
    } catch {
        throw new Error(`${fieldName} must be JSON-serializable.`);
    }
    if (serialized.length > MAX_JSON_LENGTH) {
        throw new Error(`${fieldName} is too large.`);
    }
    return serialized;
};

async function handler(req: Request): Promise<Response> {
    const cors = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: cors });
    }

    try {
        const userId = await verifyUser(req.headers.get('Authorization'));

        if (req.method === 'GET') {
            const url = new URL(req.url);
            if (url.searchParams.get('mode') === 'stats') {
                const rows = await sql`
                    SELECT signal_type, COUNT(*)::int AS count
                    FROM rd_modeling_feedback
                    WHERE user_id = ${userId}
                    GROUP BY signal_type
                `;
                const breakdown: Record<string, number> = Object.fromEntries(
                    rows.map(row => [String(row.signal_type), Number(row.count)])
                );
                return jsonResponse({
                    total: Object.values(breakdown).reduce((sum, count) => sum + count, 0),
                    breakdown,
                }, cors);
            }

            const requestedLimit = Number(url.searchParams.get('limit') || 50);
            const limit = Number.isFinite(requestedLimit)
                ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
                : 50;
            const signals = await sql`
                SELECT role_model_id AS "roleModelId", signal_type, context,
                       input_prompt_version AS "inputPromptVersion",
                       output_content AS "outputContent", user_correction AS "userCorrection",
                       impact_score AS "impactScore", metadata, created_at AS "createdAt"
                FROM rd_modeling_feedback
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
                LIMIT ${limit}
            `;
            return jsonResponse({ signals }, cors);
        }

        if (req.method === 'POST') {
            const body = await req.json() as Record<string, unknown>;
            const signalType = body.signalType;
            const context = body.context;

            if (typeof signalType !== 'string' || !SIGNAL_TYPES.has(signalType)) {
                return jsonResponse({ error: 'Invalid signal type.' }, cors, 400);
            }
            if (typeof context !== 'string' || !FEEDBACK_CONTEXTS.has(context)) {
                return jsonResponse({ error: 'Invalid feedback context.' }, cors, 400);
            }

            const roleModelId = typeof body.roleModelId === 'string' ? body.roleModelId : null;
            const promptVersion = typeof body.inputPromptVersion === 'string' ? body.inputPromptVersion : null;
            const impactScore = typeof body.impactScore === 'number' ? body.impactScore : 0;
            const outputContent = serializeJson(body.outputContent, 'outputContent');
            const userCorrection = serializeJson(body.userCorrection, 'userCorrection');
            const metadata = serializeJson(body.metadata, 'metadata');

            await sql`
                INSERT INTO rd_modeling_feedback (
                    user_id, role_model_id, signal_type, context, input_prompt_version,
                    output_content, user_correction, impact_score, metadata
                ) VALUES (
                    ${userId}, ${roleModelId}, ${signalType}, ${context}, ${promptVersion},
                    ${outputContent}::jsonb, ${userCorrection}::jsonb, ${impactScore}, ${metadata}::jsonb
                )
            `;
            return jsonResponse({ success: true }, cors, 201);
        }

        return jsonResponse({ error: 'Method not allowed.' }, cors, 405);
    } catch (error) {
        if (error instanceof AuthError) {
            return jsonResponse({ error: 'Authentication required.' }, cors, 401);
        }
        const message = error instanceof Error ? error.message : String(error);
        console.error('R&D feedback API error:', message);
        return jsonResponse({ error: 'Unable to record modeling feedback.' }, cors, 500);
    }
}

export default { fetch: handler };
