
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ALLOWED_ORIGINS = [
    Deno.env.get('SITE_URL') ?? '',
    'http://localhost:5173',
    'http://localhost:4173',
].filter(Boolean);

const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('Origin') ?? '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : '';
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
};

const MAX_LOG_LENGTH = 200;
const sanitizeLog = (val: unknown) => {
    // eslint-disable-next-line no-control-regex
    const str = String(val).replace(/[\n\r\t\0\x08\x09\x1a\x1b]/g, ' ');
    return str.length > MAX_LOG_LENGTH ? str.substring(0, MAX_LOG_LENGTH) + '...' : str;
};

export const TIER_MODELS: Record<string, { extraction: string; analysis: string }> = {
    free: {
        extraction: 'gemini-2.0-flash',
        analysis: 'gemini-2.0-flash',
    },
    plus: {
        extraction: 'gemini-2.0-flash',
        analysis: 'gemini-2.0-flash',
    },
    pro: {
        extraction: 'gemini-2.0-flash',
        analysis: 'gemini-2.0-flash',
    },
    admin: {
        extraction: 'gemini-2.0-flash',
        analysis: 'gemini-2.0-flash',
    },
    tester: {
        extraction: 'gemini-2.0-flash',
        analysis: 'gemini-2.0-flash',
    }
};

export const handler = async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) })
    }

    try {
        // 1. AUTHORIZATION & USER TIER CHECK
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        // Fetch user's subscription tier and flags
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier, is_admin, is_tester')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            console.error("Profile lookup error:", sanitizeLog(profileError));
            throw new Error('Failed to retrieve user profile')
        }

        let userTier = profile.subscription_tier || 'free';
        if (profile.is_admin) userTier = 'admin';
        else if (profile.is_tester) userTier = 'tester';

        // 1b. PRE-EXECUTION LIMIT CHECK
        const { data: limitCheck, error: limitError } = await supabase.rpc('check_analysis_limit', {
            p_user_id: user.id,
            p_source_type: 'manual'
        });

        if (limitError) {
            console.error("Limit check error:", sanitizeLog(limitError));
        } else if (limitCheck && !limitCheck.allowed) {
            return new Response(JSON.stringify({
                error: "Limit reached",
                reason: limitCheck.reason,
                used: limitCheck.used,
                limit: limitCheck.limit
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 429, // Correct Rate Limit status code
            });
        }

        // 2. PARSE REQUEST & RESOLVE MODEL
        const { payload, task = "analysis", generationConfig, feature, model } = await req.json()

        // Validate task
        const validTasks = ['extraction', 'analysis', 'interview', 'embedding'];
        const safeTask = validTasks.includes(task) ? task : 'analysis';

        if (safeTask === 'interview' && userTier === 'free') {
            return new Response(JSON.stringify({
                error: "limit_reached",
                message: "Interviews are a premium feature available on Plus and Pro tiers."
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

            const { count: monthlyInterviews, error: countError } = await supabase
                .from('logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('event_type', ['interview_generation', 'unified_skill_interview_generation', 'skill_interview_generation'])
                .gte('created_at', firstOfMonth.toISOString());

            if (!countError) {
                const interviewLimit = userTier === 'plus' ? 2 : 5;
                if ((monthlyInterviews || 0) >= interviewLimit) {
                    return new Response(JSON.stringify({
                        error: "limit_reached",
                        reason: "monthly_interview_limit",
                        used: monthlyInterviews,
                        limit: interviewLimit
                    }), {
                        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                        status: 429,
                    });
                }
            } else {
                console.error("Interview count error:", sanitizeLog(countError));
            }
        }

        // 2c. FEATURE-TIER ACCESS CHECK
        // Plus-only features: cover_letter, resume_tailor
        // Pro-only features: gap_analysis, roadmap, role_model
        const PLUS_ONLY_FEATURES = ['cover_letter', 'resume_tailor'];
        const PRO_ONLY_FEATURES = ['gap_analysis', 'roadmap', 'role_model'];

        if (feature && PLUS_ONLY_FEATURES.includes(feature) && userTier === 'free') {
            return new Response(JSON.stringify({
                error: "upgrade_required",
                message: "This feature requires a Plus or Pro plan."
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        if (feature && PRO_ONLY_FEATURES.includes(feature) && !['pro', 'admin', 'tester'].includes(userTier)) {
            return new Response(JSON.stringify({
                error: "upgrade_required",
                message: "This feature requires a Pro plan."
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        const tierConfig = TIER_MODELS[userTier] || TIER_MODELS.free;
        let modelName = safeTask === 'extraction' ? tierConfig.extraction : tierConfig.analysis;

        // Overwrite if it's an embedding task or if a specific model was requested (R&D only)
        if (safeTask === 'embedding') {
            modelName = model || 'text-embedding-004';
        }

        console.log("User action:", { userId: sanitizeLog(user.id), tier: sanitizeLog(userTier), task: sanitizeLog(safeTask), model: sanitizeLog(modelName) });

        // 3. RETRIEVE API KEY
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            console.error("GEMINI_API_KEY missing in secrets");
            throw new Error('GEMINI_API_KEY not set in Edge Function secrets.')
        }

        // 4. PESSIMISTIC QUOTA INCREMENT
        let quotaIncremented = false;
        if (safeTask === 'analysis') {
            const { error: incError } = await supabase.rpc('increment_analysis_count', {
                p_user_id: user.id
            });
            if (incError) {
                console.error("Analysis increment error:", sanitizeLog(incError));
                throw new Error(`Failed to increment analysis quota: ${incError.message}`);
            }
            quotaIncremented = true;
        }

        // 5. CALL GEMINI API VIA FETCH
        const method = safeTask === 'embedding' ? 'embedContent' : 'generateContent';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${method}?key=${apiKey}`;

        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...payload,
                    generationConfig,
                    // Inject a safety rule for all analysis tasks
                    systemInstruction: safeTask === 'analysis' ? {
                        role: 'system',
                        parts: [{ text: "CRITICAL: First validate if the provided content is a job description or related job metadata. Ignore website navigation, headers, and boilerplate. As long as there is mention of a role, responsibilities, or requirements anywhere in the text, proceed with the requested analysis. If it is purely non-job related content (e.g. a recipe or a weather report), return: {\"error\": \"not_a_job\"}." }]
                    } : undefined
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
            }
        } catch (apiError: any) {
            console.error("API execution failure:", sanitizeLog(apiError.message));

            // REFUND Logic
            if (quotaIncremented) {
                const { error: decError } = await supabase.rpc('decrement_analysis_count', {
                    p_user_id: user.id
                });
                if (decError) console.error("Refund failed:", sanitizeLog(decError));
            }
            throw apiError; // Re-throw to be caught by main catch block
        }

        const data = await response.json();

        // Handle Embedding Response
        if (safeTask === 'embedding') {
            const embedding = data.embedding?.values || [];
            return new Response(JSON.stringify({ embedding }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Handle Generation Response
        let text = "";
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            text = data.candidates[0].content.parts.map((p: { text: string }) => p.text).join('');
        }

        // 6. CONTENT VALIDATION & REFUND
        // If the AI returns a "not_a_job" flag (which we instruct it to do in prompts), we refund the credit
        if (safeTask === 'analysis' && (text.includes('"error": "not_a_job"') || text.includes('not_a_job'))) {
            console.warn("Analysis rejected by AI (not a job) for user:", { userId: sanitizeLog(user.id) });
            if (quotaIncremented) {
                const { error: decError } = await supabase.rpc('decrement_analysis_count', {
                    p_user_id: user.id
                });
                if (decError) console.error("Refund failed on rejection:", sanitizeLog(decError));
            }
            // Transform to a standard error format the client expects
            return new Response(JSON.stringify({
                error: "not_a_job",
                message: "This content doesn't look like a valid job description."
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // 7. TRACK USAGE (Tokens only, as analysis was already incremented)
        const totalTokens = (data.usageMetadata?.totalTokenCount) || 0;
        if (totalTokens > 0) {
            const { error: usageError } = await supabase.rpc('track_usage', {
                p_tokens: totalTokens,
                p_is_analysis: false // Always false here as we handled it pessimistically
            });
            if (usageError) console.error("Usage tracking error:", sanitizeLog(usageError));
        }

        // 8. LOG INTERVIEW USAGE (authoritative server-side record for monthly cap)
        if (safeTask === 'interview') {
            const { error: logError } = await supabase.from('logs').insert({
                user_id: user.id,
                event_type: 'interview_generation',
                model_name: modelName,
                status: 'success',
                metadata: { source: 'proxy', feature: feature || null }
            });
            if (logError) console.error("Interview log error:", sanitizeLog(logError));
        }

        return new Response(JSON.stringify({ text, usage: data.usageMetadata }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Gemini Proxy Error:", sanitizeLog(message));
        return new Response(JSON.stringify({ error: `Edge Function Error: ${message}` }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 500, // Correctly return an error status code
        })
    }
}

Deno.serve(handler)
