import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import { KNOWN_AI_BAN_EMPLOYERS } from "../../data/knownAiBanEmployers";
import type { RetryProgressCallback } from "./aiCore";
import type {
    JobAnalysis,
    ResumeProfile,
    CustomSkill,
    DistilledJob,
    UserTier,
    Transcript,
    Semester,
    Course
} from "../../types";
import { AI_MODELS, AI_TEMPERATURE, AGENT_LOOP, USER_TIERS } from "../../constants";
import { JOB_ANALYSIS_PROMPTS, COVER_LETTER_PROMPTS } from "../../prompts/index";
import { BucketStorage } from "../storage/bucketStorage";

const stringifyProfile = (profile: ResumeProfile): string => {
    return profile.blocks
        .filter(b => b.isVisible)
        .map(b => {
            return `BLOCK_ID: ${b.id}\nROLE: ${b.title}\nORG: ${b.organization}\nDATE: ${b.dateRange}\nDETAILS:\n${b.bullets.map(bull => `- ${bull}`).join('\n')}\n`;
        })
        .join('\n---\n');
};

const sanitizeInput = (text: string): string => {
    return text.replace(/BLOCK_ID:\s*[a-zA-Z0-9-]+/g, '')
        .replace(/\(BLOCK_ID:\s*[a-zA-Z0-9-]+\)/g, '');
};

// Deterministic AI-ban check — runs before any AI call so it can't be missed.
// Add patterns here as new employer policies are discovered.
const AI_BAN_PATTERNS: RegExp[] = [
    /\bchatgpt\b/i,
    /\bllm\b/i,
    /generative[\s-]?ai\b/i,
    /ai[\s-]?(assisted|generated|written|tools)\b/i,
    /\bno\b.{0,25}\b(ai|artificial intelligence)\b/i,
    /artificial intelligence.{0,25}\b(prohibited|not permitted|not allowed|banned)\b/i,
    /original work.{0,30}\b(without|no)\b.{0,20}\b(ai|assistance)\b/i,
    /applications?.{0,30}(must|should).{0,20}(be|remain).{0,20}original/i,
    /do not (use|utilize).{0,20}(ai|artificial intelligence)/i,
    /use of (ai|artificial intelligence|chatgpt|generative).{0,30}(prohibited|not permitted|not allowed)/i,
];

export const detectAiBan = (text: string): { isBanned: boolean; reason: string | null } => {
    for (const pattern of AI_BAN_PATTERNS) {
        const match = text.match(pattern);
        if (match) return { isBanned: true, reason: match[0] };
    }
    return { isBanned: false, reason: null };
};

// Secondary check: employer name against the known-ban list.
// Call this after extraction once we have the company name.
export const checkKnownEmployerBan = (companyName: string): { isBanned: boolean; reason: string | null } => {
    if (!companyName) return { isBanned: false, reason: null };
    const normalized = companyName.toLowerCase();
    const match = KNOWN_AI_BAN_EMPLOYERS.find(e =>
        normalized.includes(e.name.toLowerCase()) ||
        e.aliases.some(a => normalized.includes(a.toLowerCase()))
    );
    return match
        ? { isBanned: true, reason: match.reason }
        : { isBanned: false, reason: null };
};

const preCleanJobText = (text: string): string => {
    // Remove common website navigation/boilerplate labels that often get caught in clippings
    const junkPatterns = [
        /^ontario\.ca homepage/i,
        /^fran\u00e7ais/i,
        /^search job openings/i,
        /^menu$/i,
        /^\u2190 back to search/i,
        /^back to search results/i,
        /^home$/i,
        /^accessibility$/i,
        /^privacy$/i,
        /^terms of use$/i,
        /^contact us$/i,
        /^site map$/i,
        /^top$/i,
        /^skip to main content/i,
        /^skip to footer/i,
        /^view all jobs/i,
        /^search by/i,
        /^create alert/i,
        /^share this job/i,
        /facebook|twitter|linkedin|email/i,
        /^apply now/i,
        /^add to favorites/i,
        /^map pin/i,
        /^radius marker pin/i,
        /^job title or keywords/i,
        /^search$/i,
        /^flexible working locations/i,
        /logo/i,
        /^careers home/i,
        /^english$/i,
        /^sign in/i,
        /^create account/i,
        /^job search$/i,
        /^search results/i,
        /^previous job/i,
        /^next job/i,
        /^save this job/i,
        /^return to/i,
        /^back$/i,
        /^close$/i,
        /^navigation/i,
        /©|copyright/i,
        /^all rights reserved/i,
        /^powered by/i,
        /^cookies/i,
        /^skip to/i,
        /^go back/i,
        /^breadcrumb/i,
        /^footer/i,
        /^header/i,
        /^menu/i,
        /^toggle/i
    ];

    return text
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            // Filter out empty lines, single character lines, and junk patterns
            if (trimmed.length < 3) return false;
            // Filter out social links / boilerplate that are usually long but useless
            if (trimmed.length > 500 && (trimmed.includes('http') || trimmed.includes('www.'))) return false;

            return !junkPatterns.some(pattern => pattern.test(trimmed));
        })
        .join('\n')
        .substring(0, 12000);
};

export const cleanCoverLetterOutput = (text: string): string => {
    let cleaned = text.trim();
    
    // 1. Remove markdown code blocks if present (any type)
    const codeBlockMatch = cleaned.match(/```(?:json|markdown|text)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        cleaned = codeBlockMatch[1];
    } else {
        // Fallback for dangling backticks
        cleaned = cleaned.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '');
    }
    
    // 2. If it looks like JSON, try to parse and extract known keys
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
        try {
            const parsed = JSON.parse(cleaned);
            if (parsed.cover_letter) return parsed.cover_letter.trim();
            if (parsed.text) return parsed.text.trim();
            if (parsed.content) return parsed.content.trim();
        } catch (e) {
            // Not valid JSON, continue
        }
    }
    
    return cleaned.trim();
};

const extractJobInfo = async (
    rawJobText: string,
    onProgress?: RetryProgressCallback
): Promise<{ distilledJob: DistilledJob; cleanedDescription: string }> => {
    // Basic cleanup to prevent AI confusion on junk website headers
    const cleanedText = preCleanJobText(rawJobText);

    // isAiBanned is detected deterministically before this call — no need to ask the AI.
    const aiBan = detectAiBan(cleanedText);

    // NOTE: Everything asked for here is derived purely from the job posting text — none
    // of it requires a candidate resume, so this prompt is safe to use as the fallback
    // path when there's no (or no usable) resume to score a candidate against. It must
    // stay resume-independent; do not add anything here that implies a match/score.
    const extractionPrompt = `
    Analyze this job posting:
    ${cleanedText}

    1. ROLE: What is the official role title?
    2. COMPANY: What is the company name?
    3. LOCATION: City, State/Province, or "Remote" (strictly geographical, exclude internal IDs).
    4. REFERENCE CODE: Is there a job ID or reference number? (Set as 'referenceCode')
    5. CATEGORY: Classify into 'technical', 'managerial', 'trades', 'healthcare', 'creative', or 'general'.
    6. CANONICAL TITLE: What is the most standard, high-level name for this role? (e.g. "Junior React Dev" -> "Software Engineer").
    7. KEY SKILLS: 5-8 actual skills required by the posting — technical skills, soft skills, tools, and domain knowledge ONLY. Do NOT include enrollment/eligibility requirements. Keep each 1-4 words (e.g. 'Problem-solving', 'Microsoft Office'). Set as 'keySkills'.
    8. REQUIRED SKILLS: Same skills as an array of { "name": string, "level": "learning" | "comfortable" | "expert" } reflecting how deeply the posting expects the skill. Set as 'requiredSkills'.
    9. CORE RESPONSIBILITIES: 4-6 primary duties from the posting. Set as 'coreResponsibilities'.
    10. APPLICATION DEADLINE: Closing date in YYYY-MM-DD format if stated, otherwise null. Set as 'applicationDeadline'.
    11. SALARY RANGE: Salary/wage range as stated (e.g. '$55,000-$65,000/yr'), otherwise null. Set as 'salaryRange'.

    Return JSON with 'roleTitle', 'companyName', 'location', 'referenceCode', 'category', 'canonicalTitle', 'keySkills', 'requiredSkills', 'coreResponsibilities', 'applicationDeadline', and 'salaryRange' fields.
    `;

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction' });
        const response = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: extractionPrompt }] }],
            generationConfig: {
                temperature: AI_TEMPERATURE.STRICT,
                responseMimeType: "application/json",
            }
        });
        metadata.token_usage = response.response.usageMetadata;
        const result = JSON.parse(cleanJsonOutput(response.response.text()));
        // Text scan + known-employer list — text scan wins if both fire
        const employerBan = checkKnownEmployerBan(result.companyName);
        const finalBan = aiBan.isBanned ? aiBan : employerBan;
        const distilledJob: DistilledJob = {
            ...result,
            isAiBanned: finalBan.isBanned,
            aiBanReason: finalBan.reason,
        };
        return { distilledJob, cleanedDescription: cleanedText };
    }, { event_type: 'job_extraction', prompt: extractionPrompt, model: AI_MODELS.EXTRACTION, job_id: undefined }, undefined, undefined, onProgress);
};

export const analyzeJobFit = async (
    jobDescription: string,
    resumes: ResumeProfile[],
    userSkills: CustomSkill[] = [],
    onProgress?: RetryProgressCallback,
    jobId?: string,
    transcript?: Transcript | null,
    trajectoryContext?: string,
    abortSignal?: AbortSignal
): Promise<JobAnalysis> => {
    if (onProgress) onProgress("Researching", 1, 6);

    // 1. Basic cleanup to prevent AI confusion
    const cleanedDescription = preCleanJobText(jobDescription);

    if (onProgress) onProgress("Contextualizing", 2, 6);

    // Build the exact candidate-context payload the prompt will receive, then gate on
    // that — not on resumes.length or blocks.length — so the check can't drift from what
    // the model actually sees. A resume row can exist (the primary profile is created as
    // an empty shell, blocks: [], before the user fills anything in) while still
    // contributing nothing: stringifyProfile also drops any block with isVisible === false.
    const resumeContext = resumes.map(stringifyProfile).join('\n---\n');
    const skillsContext = userSkills.length > 0
        ? `\nADDITIONAL SKILLS:\n${userSkills.map(s => `- ${s.name}: ${s.proficiency}`).join('\n')}`
        : '';

    const educationContext = transcript
        ? `\nACADEMIC BACKGROUND (Transcript):\nProgram: ${transcript.program} at ${transcript.university}\nCourses:\n${transcript.semesters.flatMap((s: Semester) => s.courses).map((c: Course) => `- ${c.title} (${c.code}): ${c.grade}`).join('\n')}`
        : '';

    // Skills and transcript data are legitimate grounding on their own (the prompt is
    // explicitly told to use transcript in place of missing work experience) — only
    // refuse to score when there is truly nothing to ground a match against.
    const hasGroundingData = Boolean(
        resumeContext.trim() || skillsContext.trim() || educationContext.trim()
    );

    if (!hasGroundingData) {
        // Job-only distillation still runs — none of it depends on candidate data —
        // but we do not attempt a compatibility score against blank candidate context.
        const { distilledJob } = await extractJobInfo(cleanedDescription, onProgress);
        return {
            distilledJob: {
                ...distilledJob,
                keySkills: distilledJob.keySkills || [],
                coreResponsibilities: distilledJob.coreResponsibilities || [],
                applicationDeadline: distilledJob.applicationDeadline || null
            },
            cleanedDescription,
            compatibilityScore: undefined,
            reasoning: "Resume required for compatibility analysis. Please upload one to see strengths, weaknesses, and a match score.",
            strengths: [],
            weaknesses: [],
            bestResumeProfileId: undefined
        } as JobAnalysis;
    }

    if (onProgress) onProgress("Mapping", 3, 6);

    // 2. Fetch Bucket Guidelines - Skipping for now to keep performance high
    // We can re-integrate this if it's critical, but we'd want to do it inside the main prompt or via parallel fetch.

    const analysisPrompt = JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.DEFAULT(cleanedDescription, (resumeContext + skillsContext + educationContext), undefined, trajectoryContext);

    if (onProgress) onProgress("Benchmarking", 4, 6);

    const analysis = await callWithRetry(async (metadata) => {
        // compatibilityScore is meant to be a consistent, comparable judgment across
        // postings — unlike cover letter generation/critique (which share this same
        // 'analysis' task tier and need creative variance), so it gets its own strict
        // temperature here rather than inheriting the tier default.
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json", temperature: AI_TEMPERATURE.STRICT }, signal: abortSignal });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: analysisPrompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(sanitizeInput(cleanJsonOutput(response.response.text())));
    }, { event_type: 'analysis', prompt: analysisPrompt, model: 'dynamic', job_id: jobId }, undefined, undefined, onProgress, abortSignal);

    if (onProgress) onProgress("Synthesizing", 5, 6);

    // Validation: If we have no score and no skills, something went wrong
    if (!analysis.compatibilityScore && (!analysis.distilledJob?.keySkills?.length)) {
        throw new Error("NOT_A_JOB: Analysis failed to generate meaningful insights. Please check if the source content is a valid job description.");
    }

    if (onProgress) onProgress("Finalizing", 6, 6);

    return {
        ...analysis,
        cleanedDescription,
        bestResumeProfileId: analysis.bestResumeProfileId || resumes[0]?.id
    };
};

export const generateCoverLetter = async (
    jobDescription: string,
    selectedResume: ResumeProfile,
    tailoringInstructions: string[],
    additionalContext?: string,
    forceVariant?: string,
    trajectoryContext?: string,
    jobId?: string,
    canonicalTitle?: string,
    personalizedStyle?: string,
    candidateName?: string
): Promise<{ text: string; promptVersion: string }> => {
    const resumeText = stringifyProfile(selectedResume);
    const variants = COVER_LETTER_PROMPTS.COVER_LETTER.VARIANTS;
    const template = forceVariant && forceVariant in variants
        ? variants[forceVariant as keyof typeof variants]
        : variants.v1_direct;

    // Fetch Bucket Strategy
    let bucketStrategy = undefined;
    if (canonicalTitle) {
        const bucket = await BucketStorage.getBucket(canonicalTitle);
        bucketStrategy = bucket?.guidelines?.coverLetterStrategy;
    }

    // Phase 3: Personalized Style Injection
    const finalPersonalizedContext = personalizedStyle
        ? `${additionalContext || ''}\n\n[USER PERSONAL STYLE MODEL]: ${personalizedStyle}`
        : additionalContext;

    // candidateName must be the person's real name (e.g. from their profile), not
    // selectedResume.name — that field is a resume/document label ("Resume", "Primary
    // Experience"), not the candidate's own name. See #192/#194.
    const prompt = COVER_LETTER_PROMPTS.COVER_LETTER.GENERATE(template, jobDescription, resumeText, tailoringInstructions, finalPersonalizedContext, trajectoryContext, bucketStrategy, candidateName || undefined);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', feature: 'cover_letter' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return { text: cleanCoverLetterOutput(sanitizeInput(response.response.text())), promptVersion: forceVariant || "v1" };
    }, { event_type: 'cover_letter', prompt, model: 'dynamic', job_id: jobId });
};

export const critiqueCoverLetter = async (
    jobDescription: string,
    coverLetter: string,
    resumeContext: string,
    jobId?: string
): Promise<{ decision: 'Reject' | 'Weak' | 'Average' | 'Strong' | 'Exceptional'; feedback: string[]; strengths: string[]; hallucinationAlerts: string[] }> => {
    const prompt = COVER_LETTER_PROMPTS.CRITIQUE_COVER_LETTER(jobDescription, coverLetter, resumeContext);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" }, feature: 'cover_letter' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'critique', prompt, model: 'dynamic', job_id: jobId });
};

export const generateCoverLetterWithQuality = async (
    jobDescription: string,
    selectedResume: ResumeProfile,
    tailoringInstructions: string[],
    userTier: UserTier,
    additionalContext?: string,
    onProgress?: (message: string) => void,
    trajectoryContext?: string,
    jobId?: string,
    canonicalTitle?: string,
    personalizedStyle?: string,
    candidateName?: string,
    fitScore?: number
): Promise<{
    text: string;
    promptVersion: string;
    decision: string;
    attempts: number;
    critique?: { feedback: string[]; strengths: string[]; hallucinationAlerts: string[] }
}> => {

    // 1. Initial Draft
    if (onProgress) onProgress("Researching");
    // Simul-Research and Contextualize
    if (onProgress) onProgress("Contextualizing");

    // Resume/Job alignment
    if (onProgress) onProgress("Mapping");

    if (onProgress) onProgress("Drafting");
    // For an extreme mismatch, don't burn retry attempts on persuasion that's very
    // unlikely to work — go straight to an honestly-framed first draft instead of
    // waiting for the loop to exhaust retries before admitting the gap (see #197).
    const EXTREME_MISMATCH_THRESHOLD = 20;
    const isExtremeMismatch = typeof fitScore === 'number' && fitScore < EXTREME_MISMATCH_THRESHOLD;
    const initialContext = isExtremeMismatch
        ? `${additionalContext ? `${additionalContext}\n\n` : ''}STRICT INSTRUCTION: This role's compatibility score is extremely low (${fitScore}/100) — a large, hard-to-bridge gap exists. Do not attempt to persuade past it. Include one clear, plain-language sentence that honestly names the specific gap (e.g. missing credential, licence, or years of direct experience) rather than glossing over it. Lead with genuine transferable strengths, but stay honest about the mismatch.`
        : additionalContext;
    let result = await generateCoverLetter(jobDescription, selectedResume, tailoringInstructions, initialContext, undefined, trajectoryContext, jobId, canonicalTitle, personalizedStyle, candidateName);
    let attempts = 1;

    // Fast Path for Free and Plus tiers (No iterative loop to protect margins)
    if (userTier === USER_TIERS.FREE || userTier === USER_TIERS.PLUS) {
        return { ...result, decision: 'Average', attempts };
    }

    // Extreme mismatch: an honest admission of a ~5/100-fit gap will essentially
    // never score Strong/Exceptional no matter how it's rewritten, so looping through
    // full retries just burns cost for no realistic gain. Critique once for a real
    // decision label, then stop.
    if (isExtremeMismatch) {
        if (onProgress) onProgress('Critiquing');
        const critique = await critiqueCoverLetter(jobDescription, result.text, stringifyProfile(selectedResume), jobId);
        return { ...result, decision: critique.decision, attempts, critique };
    }

    // 2. The Agent Loop (Pro/Admin only)
    let finalCritique: any = null;
    let currentDecision: 'Reject' | 'Weak' | 'Average' | 'Strong' | 'Exceptional' = 'Average';
    const resumeContext = stringifyProfile(selectedResume);

    while (attempts <= AGENT_LOOP.MAX_RETRIES + 1) { // +1 for initial draft
        // Critique current draft
        if (onProgress) onProgress(`Critiquing`);
        const critique = await critiqueCoverLetter(jobDescription, result.text, resumeContext, jobId);
        finalCritique = critique;
        currentDecision = critique.decision;

        // Success condition: High confidence on spectrum
        if (currentDecision === 'Strong' || currentDecision === 'Exceptional') {
            break;
        }

        // Failure condition (Max retries reached): rather than silently shipping the
        // last unacknowledged draft, force one final rewrite that must honestly name
        // the gap the critique keeps flagging, instead of another persuasion attempt.
        if (attempts > AGENT_LOOP.MAX_RETRIES) {
            if (onProgress) onProgress(`Finalizing`);
            const honestyInstruction = `
                FINAL ATTEMPT: this draft has not met the internal quality bar after ${attempts} attempts.
                CRITIQUE FEEDBACK: ${critique.feedback.join('; ')}
                STRICT INSTRUCTION: Stop attempting further persuasion. Include one clear, plain-language sentence that honestly names the specific gap identified above (e.g. a missing credential, licence, or years of direct experience) rather than glossing over it. The letter should read as self-aware about the gap, not falsely confident. Keep everything else about the letter's real strengths intact.
            `;
            const honestyContext = additionalContext ? `${additionalContext}\n\n${honestyInstruction}` : honestyInstruction;
            result = await generateCoverLetter(jobDescription, selectedResume, tailoringInstructions, honestyContext, undefined, trajectoryContext, jobId, canonicalTitle, personalizedStyle, candidateName);
            attempts++;
            break;
        }

        // Regenerate with feedback
        if (onProgress) onProgress(`Polishing`);
        const improvementContext = `
            PREVIOUS DECISION: ${currentDecision}
            CRITIQUE FEEDBACK: ${critique.feedback.join('; ')}
            ${critique.hallucinationAlerts.length > 0 ? `HALLUCINATION WARNINGS: ${critique.hallucinationAlerts.join('; ')}` : ''}
            STRICT INSTRUCTION: Fix these specific issues. Do not regress on strengths. Ensure all claims are supported by the provided resume.
        `;

        // We append the critique to any existing context
        const newContext = additionalContext ? `${additionalContext}\n\n${improvementContext}` : improvementContext;

        result = await generateCoverLetter(jobDescription, selectedResume, tailoringInstructions, newContext, undefined, trajectoryContext, jobId, canonicalTitle, personalizedStyle, candidateName);
        attempts++;
    }

    return { ...result, decision: currentDecision, attempts, critique: finalCritique };
};

export const generateTailoredSummary = async (
    jobDescription: string,
    resumes: ResumeProfile[],
    jobId?: string
): Promise<string> => {
    const resumeContext = resumes.map(stringifyProfile).join('\n---\n');
    const prompt = JOB_ANALYSIS_PROMPTS.TAILORED_SUMMARY(jobDescription, resumeContext);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(sanitizeInput(cleanJsonOutput(response.response.text()))).summary;
    }, { event_type: 'tailored_summary', prompt, model: AI_MODELS.EXTRACTION, job_id: jobId });
};
