import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { fetchSafe, readTextSafe } from "./validator.ts"

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

Deno.serve(async (req) => {
    // 1. CORS & Auth Check
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization')

        // Initialize Supabase to check User
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // Fetch user profile for tier/verification
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, is_admin, is_tester, email_verified')
            .eq('id', user.id)
            .single();

        if (!profile) throw new Error('Profile not found');

        // 1b. Check Limits (Verification Gate & Token Ceiling)
        const { data: limitCheck } = await supabase.rpc('check_analysis_limit', {
            p_user_id: user.id
        });

        if (limitCheck && !limitCheck.allowed) {
            return new Response(JSON.stringify({
                error: "Limit Reached",
                reason: limitCheck.reason,
                message: limitCheck.message || "You have reached your limit."
            }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // 2. Parse Request
        const { url, source, mode } = await req.json()
        if (!url) throw new Error('Missing URL')

        // 3. Fetch HTML (with SSRF protection including redirect validation)
        // Note: fetchSafe handles DNS rebinding protection for HTTP
        const response = await fetchSafe(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!response.ok) throw new Error(`Failed to fetch site: ${response.status}`)

        // Use safe reader to prevent DoS (max 5MB)
        const html = await readTextSafe(response, 5 * 1024 * 1024)

        // 3.5 Return Text Mode (for Job Analysis)
        if (mode === 'text') {
            // Robust cleanup to extract readable text while avoiding common bypasses
            let text = html;

            // 1. Remove script, style, and iframe content entirely
            const tagsToRemove = ['script', 'style', 'iframe', 'noscript', 'canvas', 'svg'];
            for (const tag of tagsToRemove) {
                const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gim');
                text = text.replace(regex, "");
            }

            // 2. Convert common block tags to newlines to preserve separation
            text = text.replace(/<(?:p|div|br|li|h[1-6]|tr)[^>]*>/gi, "\n");

            // 3. Strip all remaining tags
            text = text.replace(/<[^>]+>/g, " ");

            // 4. Clean up whitespace and entities
            text = text
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 50000);

            return new Response(JSON.stringify({ text }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 4. Parse based on source
        let jobs: { title: string; url: string; company: string; location: string | null; postedDate: string | null }[] = []

        // Special handling for TTC Early Talent page (simple HTML parsing)
        if (source === 'ttc' && url.includes('Early-Talent')) {
            // This page is just a simple list of job links
            const linkRegex = /<a\s+[^>]*href=["'](https:\/\/career17\.sapsf\.com\/sfcareer\/jobreqcareer\?[^"']+)["'][^>]*>([^<]+)<\/a>/gi
            const dateRegex = /Last Day to Apply:\s*<\/b><\/span><span[^>]*>([^<]+)<\/span>/gi

            let match
            const jobData: { url: string; title: string }[] = []
            const dates: string[] = []

            // Extract all job links
            while ((match = linkRegex.exec(html)) !== null) {
                const jobUrl = match[1]
                let title = match[2].trim()

                // Remove job ID in parentheses if present
                title = title.replace(/\s*\(\d+\)\s*$/, '')

                jobData.push({ url: jobUrl, title })
            }

            // Extract all dates
            let dateMatch
            while ((dateMatch = dateRegex.exec(html)) !== null) {
                dates.push(dateMatch[1].trim())
            }

            // Combine jobs with dates
            jobs = jobData.map((job, index) => ({
                title: job.title,
                url: job.url,
                company: 'Toronto Transit Commission',
                location: 'Toronto, ON',
                postedDate: dates[index] || null
            }))

        } else {
            // For other pages, use Gemini AI parsing
            // Clean HTML (Recursive cleanup to avoid simple bypasses and save tokens)
            let cleanHtml = html;

            // Remove heavy content types
            const tagsToRemove = ['script', 'style', 'svg', 'iframe', 'noscript'];
            for (const tag of tagsToRemove) {
                const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gim');
                cleanHtml = cleanHtml.replace(regex, "");
            }

            cleanHtml = cleanHtml
                .replace(/<!--([\s\S]*?)-->/gim, "")
                .replace(/\s+/g, " ")
                .substring(0, 30000);

            const apiKey = Deno.env.get('GEMINI_API_KEY')
            if (!apiKey) throw new Error('GEMINI_API_KEY not set')

            // Resolve tiered model
            let userTier = profile.subscription_tier || 'free';
            if (profile.is_admin) userTier = 'admin';
            else if (profile.is_tester) userTier = 'tester';

            const TIER_MODELS: Record<string, string> = {
                free: 'gemini-2.0-flash',
                plus: 'gemini-2.0-flash',
                pro: 'gemini-1.5-pro',
                admin: 'gemini-1.5-pro',
                tester: 'gemini-1.5-pro'
            };
            const modelName = TIER_MODELS[userTier] || TIER_MODELS.free;

            const prompt = `
            You are a smart web scraper. Your task is to extract ALL job listings from the provided HTML.

            CRITICAL VALIDATION:
            1. First, check if this page actually contains job listings.
            2. If no jobs are found or it's not a job board, return exactly: {"error": "no_jobs_found"}
            
            EXTRACTION RULES:
            - Look for job titles in <a>, <h3>, <div> etc.
            - Job titles often contain words like "Co-op", "Student", "Analyst", "Engineer".
            - Each job may have an associated closing date.
            - Return ONLY a valid JSON array of objects.

            Schema:
            [
              {
                "title": "Job Title",
                "url": "absolute URL (base: ${new URL(url).origin})",
                "company": "Company name",
                "location": "Location or null",
                "postedDate": "Closing/Posted date in ISO format or null"
              }
            ]

            HTML Content:
            ${cleanHtml}
            `

            // Call Gemini via Fetch (Native)
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const aiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!aiResponse.ok) {
                const errText = await aiResponse.text();
                throw new Error(`Gemini Error: ${errText}`);
            }

            const result = await aiResponse.json();
            let text = "";
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
                text = result.candidates[0].content.parts.map((p: { text: string }) => p.text).join('');
            }

            // Clean JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
            const parsed = JSON.parse(jsonStr)

            // Validation check
            if (parsed.error === "no_jobs_found") {
                return new Response(JSON.stringify([]), {
                    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                    status: 200,
                })
            }
            jobs = parsed

            // Track Usage
            const totalTokens = result.usageMetadata?.totalTokenCount || 0;
            if (totalTokens > 0) {
                const { error: usageError } = await supabase.rpc('track_usage', {
                    p_tokens: totalTokens,
                    p_is_analysis: false // Scraping list is not a credit-deducting analysis
                });
                if (usageError) console.error("Usage tracking error:", usageError);
            }
        }

        // 5. Return jobs
        return new Response(JSON.stringify(jobs), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
