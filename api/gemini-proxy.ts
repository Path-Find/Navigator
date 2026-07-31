import { neon } from '@neondatabase/serverless';
import { verifyUser, getCorsHeaders } from './_lib/verifyAuth.js';

// Vercel Function port of supabase/functions/gemini-proxy/index.ts.
// Same business logic (tier gating, quota, refunds); auth + data access moved to Neon Auth + Neon Postgres.

// Node.js is the default runtime for /api functions on Vercel — no explicit config needed.

const sql = neon(process.env.NEON_DATABASE_URL!);

const MAX_LOG_LENGTH = 200;
const sanitizeLog = (val: unknown) => {
    // eslint-disable-next-line no-control-regex
    const str = String(val).replace(/[\n\r\t\0\x08\x09\x1a\x1b]/g, ' ');
    return str.length > MAX_LOG_LENGTH ? str.substring(0, MAX_LOG_LENGTH) + '...' : str;
};

// Use Google's floating `-latest` aliases, not pinned versions. Every pinned model
// this file used to name (2.5-flash, 2.0-flash, 1.5-pro) has since been retired —
// Google returns 404 "no longer available to new users", which silently kills every
// AI feature. The aliases track forward on their own.
//   gemini-flash-lite-latest -> currently gemini-3.5-flash-lite  (cheap, structured)
//   gemini-flash-latest      -> currently gemini-3.6-flash       (quality generation)
// Extraction is bulk structured parsing, so it gets the lite model; analysis covers
// scoring and cover-letter generation, where output quality is what Ryan judges.
export const TIER_MODELS: Record<string, { extraction: string; analysis: string }> = {
    free: { extraction: 'gemini-flash-lite-latest', analysis: 'gemini-flash-latest' },
    plus: { extraction: 'gemini-flash-lite-latest', analysis: 'gemini-flash-latest' },
    pro: { extraction: 'gemini-flash-lite-latest', analysis: 'gemini-flash-latest' },
    admin: { extraction: 'gemini-flash-lite-latest', analysis: 'gemini-flash-latest' },
    tester: { extraction: 'gemini-flash-lite-latest', analysis: 'gemini-flash-latest' },
};

export default async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) });
    }

    try {
        // 1. AUTHORIZATION & USER TIER CHECK
        const userId = await verifyUser(req.headers.get('Authorization'));

        const profileRows = await sql`
            SELECT subscription_tier, is_admin, is_tester FROM profiles WHERE id = ${userId}
        `;
        const profile = profileRows[0];
        if (!profile) {
            throw new Error('Failed to retrieve user profile');
        }

        let userTier = profile.subscription_tier || 'free';
        if (profile.is_admin) userTier = 'admin';
        else if (profile.is_tester) userTier = 'tester';

        // 1b. PRE-EXECUTION LIMIT CHECK
        let limitCheck: { allowed: boolean; reason?: string; used?: number; limit?: number } | null = null;
        try {
            const rows = await sql`SELECT check_analysis_limit(${userId}, 'manual') AS result`;
            limitCheck = rows[0]?.result ?? null;
        } catch (limitError) {
            console.error('Limit check error:', sanitizeLog(limitError));
        }

        if (limitCheck && !limitCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'Limit reached',
                reason: limitCheck.reason,
                used: limitCheck.used,
                limit: limitCheck.limit,
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 429,
            });
        }

        // 2. PARSE REQUEST & RESOLVE MODEL
        const { payload, task = 'analysis', generationConfig, feature, model } = await req.json();

        const validTasks = ['extraction', 'analysis', 'interview', 'embedding'];
        const safeTask = validTasks.includes(task) ? task : 'analysis';

        if (safeTask === 'interview' && userTier === 'free') {
            return new Response(JSON.stringify({
                error: 'limit_reached',
                message: 'Interviews are a premium feature available on Plus and Pro tiers.',
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        // 2b. MONTHLY INTERVIEW LIMIT (Plus: 2/month, Pro: 5/month)
        if (safeTask === 'interview' && (userTier === 'plus' || userTier === 'pro')) {
            const firstOfMonth = new Date();
            firstOfMonth.setDate(1);
            firstOfMonth.setHours(0, 0, 0, 0);

            try {
                const countRows = await sql`
                    SELECT COUNT(*)::int AS count FROM logs
                    WHERE user_id = ${userId}
                      AND event_type IN ('interview_generation', 'unified_skill_interview_generation', 'skill_interview_generation')
                      AND created_at >= ${firstOfMonth.toISOString()}
                `;
                const monthlyInterviews = countRows[0]?.count ?? 0;
                const interviewLimit = userTier === 'plus' ? 2 : 5;
                if (monthlyInterviews >= interviewLimit) {
                    return new Response(JSON.stringify({
                        error: 'limit_reached',
                        reason: 'monthly_interview_limit',
                        used: monthlyInterviews,
                        limit: interviewLimit,
                    }), {
                        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                        status: 429,
                    });
                }
            } catch (countError) {
                console.error('Interview count error:', sanitizeLog(countError));
            }
        }

        // 2c. FEATURE-TIER ACCESS CHECK
        const PLUS_ONLY_FEATURES = ['cover_letter', 'resume_tailor'];
        const PRO_ONLY_FEATURES = ['gap_analysis', 'roadmap', 'role_model'];

        if (feature && PLUS_ONLY_FEATURES.includes(feature) && userTier === 'free') {
            return new Response(JSON.stringify({
                error: 'upgrade_required',
                message: 'This feature requires a Plus or Pro plan.',
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        if (feature && PRO_ONLY_FEATURES.includes(feature) && !['pro', 'admin', 'tester'].includes(userTier)) {
            return new Response(JSON.stringify({
                error: 'upgrade_required',
                message: 'This feature requires a Pro plan.',
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        const tierConfig = TIER_MODELS[userTier] || TIER_MODELS.free;
        let modelName = safeTask === 'extraction' ? tierConfig.extraction : tierConfig.analysis;

        if (safeTask === 'embedding') {
            modelName = model || 'gemini-embedding-001';
        }

        console.log('User action:', { userId: sanitizeLog(userId), tier: sanitizeLog(userTier), task: sanitizeLog(safeTask), model: sanitizeLog(modelName) });

        // 3. RETRIEVE API KEY
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY missing');
            throw new Error('GEMINI_API_KEY not set in Vercel project env vars.');
        }

        // 4. PESSIMISTIC QUOTA INCREMENT
        let quotaIncremented = false;
        if (safeTask === 'analysis') {
            try {
                await sql`SELECT increment_analysis_count(${userId})`;
                quotaIncremented = true;
            } catch (incError) {
                console.error('Analysis increment error:', sanitizeLog(incError));
                throw new Error(`Failed to increment analysis quota: ${(incError as Error).message}`);
            }
        }

        // 5. CALL GEMINI API VIA FETCH
        const method = safeTask === 'embedding' ? 'embedContent' : 'generateContent';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${method}?key=${apiKey}`;

        let response: Response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    generationConfig: {
                        ...generationConfig,
                        // Gemini 3.x rejects `thinkingBudget: 0` outright (400 INVALID_ARGUMENT)
                        // — thinking can be turned down but not off. `thinkingLevel: 'low'` is
                        // the replacement and yields zero thought tokens on the flash models.
                        thinkingConfig: { thinkingLevel: 'low' },
                    },
                    systemInstruction: safeTask === 'analysis' ? {
                        role: 'system',
                        parts: [{ text: 'CRITICAL: First validate if the provided content is a job description or related job metadata. Ignore website navigation, headers, and boilerplate. As long as there is mention of a role, responsibilities, or requirements anywhere in the text, proceed with the requested analysis. If it is purely non-job related content (e.g. a recipe or a weather report), return: {"error": "not_a_job"}.' }],
                    } : undefined,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
            }
        } catch (apiError) {
            console.error('API execution failure:', sanitizeLog((apiError as Error).message));

            if (quotaIncremented) {
                try {
                    await sql`SELECT decrement_analysis_count(${userId})`;
                } catch (decError) {
                    console.error('Refund failed:', sanitizeLog(decError));
                }
            }
            throw apiError;
        }

        const data = await response.json();

        if (safeTask === 'embedding') {
            const embedding = data.embedding?.values || [];
            return new Response(JSON.stringify({ embedding }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        let text = '';
        if (data.candidates && data.candidates[0]?.content?.parts) {
            text = data.candidates[0].content.parts.map((p: { text: string }) => p.text).join('');
        }

        // 6. CONTENT VALIDATION & REFUND
        if (safeTask === 'analysis' && (text.includes('"error": "not_a_job"') || text.includes('not_a_job'))) {
            console.warn('Analysis rejected by AI (not a job) for user:', { userId: sanitizeLog(userId) });
            if (quotaIncremented) {
                try {
                    await sql`SELECT decrement_analysis_count(${userId})`;
                } catch (decError) {
                    console.error('Refund failed on rejection:', sanitizeLog(decError));
                }
            }
            return new Response(JSON.stringify({
                error: 'not_a_job',
                message: "This content doesn't look like a valid job description.",
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // 7. TRACK USAGE (tokens only, analysis already incremented)
        const totalTokens = data.usageMetadata?.totalTokenCount || 0;
        if (totalTokens > 0) {
            try {
                await sql`SELECT track_usage(${totalTokens}, false)`;
            } catch (usageError) {
                console.error('Usage tracking error:', sanitizeLog(usageError));
            }
        }

        // 8. LOG INTERVIEW USAGE
        if (safeTask === 'interview') {
            try {
                await sql`
                    INSERT INTO logs (user_id, event_type, model_name, status, metadata)
                    VALUES (${userId}, 'interview_generation', ${modelName}, 'success', ${JSON.stringify({ source: 'proxy', feature: feature || null })}::jsonb)
                `;
            } catch (logError) {
                console.error('Interview log error:', sanitizeLog(logError));
            }
        }

        return new Response(JSON.stringify({ text, usage: data.usageMetadata }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Gemini Proxy Error:', sanitizeLog(message));
        return new Response(JSON.stringify({ error: `Function Error: ${message}` }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
