import { neon } from '@neondatabase/serverless';
import { verifyUser, getCorsHeaders, AuthError } from './_lib/verifyAuth.js';
import { fetchSafe, readTextSafe } from './_lib/validator.js';
import { extractText, type GeminiResponse } from './_lib/types.js';

// Vercel Function port of supabase/functions/scrape-jobs/index.ts.
// Same business logic (tier gating, SSRF-safe fetch, text/AI extraction modes);
// auth + data access moved to Neon Auth + Neon Postgres.

const sql = neon(process.env.NEON_DATABASE_URL!);

async function handler(req: Request): Promise<Response> {
    const cors = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: cors });
    }

    try {
        // 1. AUTH & PROFILE CHECK
        const userId = await verifyUser(req.headers.get('Authorization'));

        const profileRows = await sql`
            SELECT subscription_tier, is_admin, is_tester, email_verified FROM profiles WHERE id = ${userId}
        `;
        const profile = profileRows[0];
        if (!profile) throw new Error('Profile not found');

        // 1b. Check Limits (Verification Gate & Token Ceiling)
        const limitRows = await sql`SELECT check_analysis_limit(${userId}, 'manual') AS result`;
        const limitCheck = limitRows[0]?.result;

        if (limitCheck && !limitCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'Limit Reached',
                reason: limitCheck.reason,
                message: limitCheck.message || 'You have reached your limit.',
            }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 429,
            });
        }

        // 2. Parse Request
        const { url, source, mode } = await req.json() as { url?: string; source?: string; mode?: string };
        if (!url) throw new Error('Missing URL');

        // 3. Fetch HTML (SSRF-safe: DNS/private-IP validation, manual redirect following)
        const response = await fetchSafe(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) throw new Error(`Failed to fetch site: ${response.status}`);

        const html = await readTextSafe(response, 5 * 1024 * 1024);

        // 3.5 Return Text Mode (for Job Analysis)
        if (mode === 'text') {
            let text = html;

            // nav/header/footer are site chrome, not job content — and on sites with a
            // responsive layout they're often duplicated (desktop + mobile menu markup),
            // which repeats that chrome 2-3x and can drown out the actual posting.
            const tagsToRemove = ['script', 'style', 'iframe', 'noscript', 'canvas', 'svg', 'nav', 'header', 'footer'];
            for (const tag of tagsToRemove) {
                const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gim');
                let prevText;
                do {
                    prevText = text;
                    text = text.replace(regex, '');
                } while (text !== prevText);
            }

            text = text.replace(/<(?:p|div|br|li|h[1-6]|tr)[^>]*>/gi, '\n');
            text = text.replace(/<[^>]+>/g, ' ');

            const entities: Record<string, string> = {
                '&nbsp;': ' ',
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#39;': "'",
            };
            text = text.replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (m) => entities[m])
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 50000);

            return new Response(JSON.stringify({ text }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Parse based on source
        let jobs: { title: string; url: string; company: string; location: string | null; postedDate: string | null }[] = [];

        // Special handling for TTC Early Talent page (simple HTML parsing)
        if (source === 'ttc' && url.includes('Early-Talent')) {
            const linkRegex = /<a\s+[^>]*href=["'](https:\/\/career17\.sapsf\.com\/sfcareer\/jobreqcareer\?[^"']+)["'][^>]*>([^<]+)<\/a>/gi;
            const dateRegex = /Last Day to Apply:\s*<\/b><\/span><span[^>]*>([^<]+)<\/span>/gi;

            let match;
            const jobData: { url: string; title: string }[] = [];
            const dates: string[] = [];

            while ((match = linkRegex.exec(html)) !== null) {
                const jobUrl = match[1];
                let title = match[2].trim();
                title = title.replace(/\s*\(\d+\)\s*$/, '');
                jobData.push({ url: jobUrl, title });
            }

            let dateMatch;
            while ((dateMatch = dateRegex.exec(html)) !== null) {
                dates.push(dateMatch[1].trim());
            }

            jobs = jobData.map((job, index) => ({
                title: job.title,
                url: job.url,
                company: 'Toronto Transit Commission',
                location: 'Toronto, ON',
                postedDate: dates[index] || null,
            }));

        } else {
            // For other pages, use Gemini AI parsing
            let cleanHtml = html;

            const tagsToRemove = ['script', 'style', 'svg', 'iframe', 'noscript'];
            for (const tag of tagsToRemove) {
                const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gim');
                let prevHtml;
                do {
                    prevHtml = cleanHtml;
                    cleanHtml = cleanHtml.replace(regex, '');
                } while (cleanHtml !== prevHtml);
            }

            let prevHtml;
            do {
                prevHtml = cleanHtml;
                cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
            } while (cleanHtml !== prevHtml);

            cleanHtml = cleanHtml.replace(/\s+/g, ' ').substring(0, 30000);

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('GEMINI_API_KEY not set');

            let userTier = profile.subscription_tier || 'free';
            if (profile.is_admin) userTier = 'admin';
            else if (profile.is_tester) userTier = 'tester';

            // Floating aliases only — the pinned models previously named here are all
            // retired and 404. See the note on TIER_MODELS in gemini-proxy.ts.
            const TIER_MODELS: Record<string, string> = {
                free: 'gemini-flash-lite-latest',
                plus: 'gemini-flash-lite-latest',
                pro: 'gemini-flash-latest',
                admin: 'gemini-flash-latest',
                tester: 'gemini-flash-latest',
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
            `;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const aiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });

            if (!aiResponse.ok) {
                const errText = await aiResponse.text();
                throw new Error(`Gemini Error: ${errText}`);
            }

            const result = await aiResponse.json() as GeminiResponse;
            const text = extractText(result);

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            if (parsed.error === 'no_jobs_found') {
                return new Response(JSON.stringify([]), {
                    headers: { ...cors, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
            jobs = parsed;

            const totalTokens = result.usageMetadata?.totalTokenCount || 0;
            if (totalTokens > 0) {
                try {
                    await sql`SELECT track_usage(${totalTokens}, false)`;
                } catch (usageError) {
                    console.error('Usage tracking error:', usageError);
                }
            }
        }

        // 5. Return jobs
        return new Response(JSON.stringify(jobs), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('scrape-jobs error:', message);

        if (error instanceof AuthError) {
            return new Response(JSON.stringify({ error: 'Your session has expired. Please sign in again.' }), {
                headers: { ...cors, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        return new Response(JSON.stringify({ error: 'Unable to process this job page. Please try again.' }), {
            headers: { ...cors, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
}

// Vercel only passes a Web-standard `Request` when the module exports a `fetch`
// member (or named GET/POST exports). A bare `export default function handler`
// is read as the legacy Node `(req, res)` signature, which makes every
// `req.headers.get(...)` throw `is not a function` at runtime.
export default { fetch: handler };
