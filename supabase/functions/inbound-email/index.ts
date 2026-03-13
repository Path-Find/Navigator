import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        );

        // 1. Parse Postmark Inbound Webhook
        const body = await req.json();
        const toEmail = body.To || "";
        const fromEmail = body.From || "";
        const subject = body.Subject || "";
        const textBody = body.TextBody || "";
        const htmlBody = body.HtmlBody || "";

        // 2. Extract Token (Format: navigator-TOKEN@inbound.domain.com)
        const tokenMatch = toEmail.match(/navigator-([a-zA-Z0-9]+)@/);
        if (!tokenMatch) {
            console.error("Invalid recipient email format:", toEmail);
            return new Response(JSON.stringify({ error: "Invalid recipient" }), { status: 400 });
        }
        const token = tokenMatch[1];

        // 3. Resolve User
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, subscription_tier, is_admin, is_tester")
            .eq("inbound_email_token", token)
            .single();

        if (profileError || !profile) {
            console.error("User not found for token:", token);
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // Tier Check: Allow Plus, Pro, and higher
        const allowedTiers = ["plus", "pro", "admin", "tester"];
        if (!allowedTiers.includes(profile.subscription_tier)) {
            console.warn("Blocked ingestion for unauthorized tier:", profile.id, profile.subscription_tier);
            return new Response(JSON.stringify({ error: "Paid subscription required" }), { status: 403 });
        }

        const userId = profile.id;

        // 3b. Dual-Gate Limit Check: Daily Emails & Inbound Jobs
        const { data: limitCheck, error: limitError } = await supabase.rpc('check_analysis_limit', {
            p_user_id: userId,
            p_source_type: 'email'
        });

        if (limitError) {
            console.error("Error checking limits for user:", userId, limitError);
            // Fail open for now to avoid blocking users on DB glitches, or fail shut for safety?
            // Given the risk of high AI costs, failing closed on explicit limit check might be safer, 
            // but let's follow the app's "fail open" pattern for now.
        } else if (limitCheck && !limitCheck.allowed) {
            console.warn("User reached daily inbound limit:", userId, limitCheck.reason);
            return new Response(JSON.stringify({
                error: "Daily limit reached",
                reason: limitCheck.reason,
                used: limitCheck.used,
                limit: limitCheck.limit
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 429
            });
        }

        // 4. Fetch User Context (Resumes & Skills) for Triage
        const { data: resumes } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

        const { data: targetJobs } = await supabase
            .from("target_jobs")
            .select("*")
            .eq("user_id", userId)
            .order("date_added", { ascending: false })
            .limit(1);

        // 5. Tier-Based Model Resolution
        let userTier = profile.subscription_tier || 'free';
        if (profile.is_admin) userTier = 'admin';
        else if (profile.is_tester) userTier = 'tester';

        // Map Tiers to Models (Mirroring gemini-proxy)
        const TIER_MODELS: Record<string, string> = {
            free: 'gemini-2.0-flash',
            plus: 'gemini-2.0-flash',
            pro: 'gemini-1.5-pro',
            admin: 'gemini-1.5-pro',
            tester: 'gemini-1.5-pro'
        };
        const modelName = TIER_MODELS[userTier] || TIER_MODELS.free;

        // 6. Pessimistic Quota Increment
        const { error: incError } = await supabase.rpc('increment_analysis_count', {
            p_user_id: userId
        });
        if (incError) {
            console.error("Failed to increment quota for email ingestion:", userId, incError);
            return new Response(JSON.stringify({ error: "Rate limit or quota reached" }), { status: 429 });
        }

        // 7. AI Parsing & Triage with Gemini
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        const prompt = `
      You are a specialized Job Ingestion Agent for "Navigator". 
      You just received a job alert email. Your task is to extract job details and triage it for the user.

      USER CONTEXT:
      - Latest Resume: ${resumes?.[0] ? JSON.stringify(resumes[0].content) : "No resume on file."}
      - Career Goals: ${targetJobs?.[0] ? JSON.stringify(targetJobs[0]) : "No specific goals set."}

      EMAIL SUBJECT: ${subject}
      EMAIL BODY:
      ${textBody || "See HTML body if empty"}
      ${htmlBody ? "(HTML content provided)" : ""}

      EXTRACTION RULES:
      1. CRITICAL: Validate if the email content is actually a job description or job alert.
      2. If it is NOT a job, return {"error": "not_a_job", "reason": "Brief explanation"}.
      3. If it IS a job:
         - Extract Job Title, Company, and a clean Job Description.
         - Find the application URL if present.
         - Calculate a "Match Score" (0-100) based on the user's resume and goals.
         - Suggest a status: "feed".
         - Provide a short "Triage Explanation".

      Return ONLY a valid JSON object.
    `;

        let aiResponse;
        try {
            aiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (!aiResponse.ok) {
                const errText = await aiResponse.text();
                throw new Error(`Gemini API Error (${aiResponse.status}): ${errText}`);
            }
        } catch (aiError: any) {
            console.error("AI execution failure in email ingestion:", aiError.message);
            // REFUND
            await supabase.rpc('decrement_analysis_count', { p_user_id: userId });
            throw aiError;
        }

        const aiData = await aiResponse.json();
        const resultText = aiData.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedResult = JSON.parse(resultText);

        // Validation Check
        if (parsedResult.error === "not_a_job") {
            console.warn("Email ingestion rejected: Not a job.", userId, parsedResult.reason);
            // REFUND since we didn't actually process a job
            await supabase.rpc('decrement_analysis_count', { p_user_id: userId });
            return new Response(JSON.stringify({ error: "Content is not a job description", reason: parsedResult.reason }), { status: 400 });
        }

        const parsedJob = parsedResult;

        // 6. TTL Cleanup: Remove old "feed" items for this user (7-day window)
        await supabase
            .from("jobs")
            .delete()
            .eq("user_id", userId)
            .eq("status", "feed")
            .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // 7. Insert into Jobs Table
        const { error: insertError } = await supabase.from("jobs").insert({
            user_id: userId,
            job_title: parsedJob.job_title,
            company: parsedJob.company,
            description: parsedJob.description,
            url: parsedJob.url,
            source_type: "email",
            status: "feed",
            analysis: {
                compatibilityScore: parsedJob.match_score,
                reasoning: parsedJob.triage_reasoning,
                distilledJob: {
                    roleTitle: parsedJob.job_title,
                    companyName: parsedJob.company,
                }
            }
        });

        if (insertError) throw insertError;

        // 9. Track Token Usage (Analysis count already handled)
        const totalTokens = aiData.usageMetadata?.totalTokenCount || 0;
        if (totalTokens > 0) {
            await supabase.rpc('track_usage', { p_tokens: totalTokens, p_is_analysis: false });
        }

        return new Response(JSON.stringify({ success: true, jobId: parsedJob.job_title }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Inbound Email Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
