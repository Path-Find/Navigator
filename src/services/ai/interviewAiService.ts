import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import { INTERVIEW_PROMPTS } from "../../prompts/index";
import { AI_MODELS } from "../../constants";
import type { InterviewQuestion, InterviewResponseAnalysis, ResumeProfile } from "../../types";

const stringifyProfile = (profile: ResumeProfile): string => {
    return JSON.stringify(profile, null, 2);
};

export const generateTailoredInterviewQuestions = async (
    jobDescription: string,
    resumes: ResumeProfile[],
    jobId?: string,
    jobTitle?: string
): Promise<InterviewQuestion[]> => {
    const resumeContext = resumes.map(stringifyProfile).join('\n---\n');
    const prompt = INTERVIEW_PROMPTS.GENERATE_QUESTIONS(jobDescription, resumeContext, jobTitle);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const questions = JSON.parse(cleanJsonOutput(response.response.text()));
        return (questions as InterviewQuestion[]).map(q => ({ ...q, id: crypto.randomUUID() }));
    }, { event_type: 'interview_generation', prompt, model: 'dynamic', job_id: jobId });
};

export const generateUnifiedQuestions = async (
    skills: { name: string; proficiency: string }[]
): Promise<{ question: string; targetSkills: string[] }[]> => {
    const prompt = INTERVIEW_PROMPTS.UNIFIED_SKILL_INTERVIEW(skills);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'unified_skill_interview_generation', prompt, model: 'dynamic' });
};

export const analyzeUnifiedResponse = async (
    question: string,
    targetSkills: string[],
    userResponse: string
): Promise<{
    feedback: string;
    overallPassed: boolean;
    skillResults: { skill: string; demonstrated: boolean; note: string }[];
}> => {
    const prompt = INTERVIEW_PROMPTS.ANALYZE_UNIFIED_RESPONSE(question, targetSkills, userResponse);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'unified_skill_interview_analysis', prompt, model: 'dynamic' });
};

const TELL_ME_ABOUT_YOURSELF: InterviewQuestion = {
    id: crypto.randomUUID(),
    question: "Tell me about yourself.",
    category: 'behavioral',
    tips: "Keep it professional and relevant: a brief present-to-past-to-future arc — what you do now, the experience that led here, and what you're looking for next. Aim for under two minutes.",
};

export const generateGeneralBehavioralQuestions = async (resumeContext: string): Promise<InterviewQuestion[]> => {
    const prompt = INTERVIEW_PROMPTS.GENERAL_BEHAVIORAL(resumeContext);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const questions = JSON.parse(cleanJsonOutput(response.response.text()));
        return [
            { ...TELL_ME_ABOUT_YOURSELF, id: crypto.randomUUID() },
            ...(questions as InterviewQuestion[]).map(q => ({ ...q, id: crypto.randomUUID() })),
        ];
    }, { event_type: 'interview_generation_general', prompt, model: AI_MODELS.EXTRACTION });
};

export const analyzeInterviewResponse = async (
    question: string,
    userResponse: string,
    jobDescription?: string,
    jobId?: string
): Promise<InterviewResponseAnalysis> => {
    const prompt = INTERVIEW_PROMPTS.ANALYZE_RESPONSE(question, userResponse, jobDescription);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'interview_analysis', prompt, model: 'dynamic', job_id: jobId });
};

export const analyzeAndFollowUp = async (
    question: string,
    userResponse: string,
    jobDescription?: string,
    jobId?: string
): Promise<InterviewResponseAnalysis & { followUp: { shouldFollowUp: boolean; question: string | null; rationale?: string } }> => {
    const prompt = INTERVIEW_PROMPTS.ANALYZE_AND_FOLLOW_UP(question, userResponse, jobDescription);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'interview_analysis_with_followup', prompt, model: 'dynamic', job_id: jobId });
};

export const generateFollowUp = async (
    question: string,
    userResponse: string,
    jobDescription?: string,
    jobId?: string
): Promise<{ shouldFollowUp: boolean; question: string | null; rationale?: string }> => {
    const prompt = INTERVIEW_PROMPTS.FOLLOW_UP(question, userResponse, jobDescription);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'interview_followup', prompt, model: 'dynamic', job_id: jobId });
};

// ─── Resume Interview ────────────────────────────────────────────────────────
// Surfaces narrative depth behind resume bullets, saved as narrativeContext on the block.

const RESUME_INTERVIEW_GENERATE_PROMPT = (title: string, organization: string, bullets: string[]) => `
You are helping a job applicant capture the real story behind their resume experience.

EXPERIENCE BLOCK:
Role: ${title}
Organization: ${organization}
Bullets:
${bullets.map(b => `- ${b}`).join('\n')}

Generate exactly 3 interview questions that surface detail NOT already captured in the bullets above.
Focus on: what made the work technically complex, what the day-to-day reality was like, specific challenges or decisions, anything that shows depth beyond the surface-level bullet points.

Return a JSON array of 3 strings. Example: ["Question 1?", "Question 2?", "Question 3?"]
Return ONLY the JSON array, no other text.
`;

const RESUME_INTERVIEW_SUMMARIZE_PROMPT = (title: string, organization: string, bullets: string[], qaPairs: { question: string; answer: string }[]) => `
You are synthesizing a candidate's answers into narrative context for their resume experience.

EXPERIENCE BLOCK:
Role: ${title}
Organization: ${organization}
Bullets:
${bullets.map(b => `- ${b}`).join('\n')}

INTERVIEW ANSWERS:
${qaPairs.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Write 2-4 sentences of narrative context that captures the depth revealed in these answers.
Write in first person. Be specific and concrete. Do not restate the bullets — add what is behind them.
Use no colons, semicolons, or em dashes. Return only the narrative text, no labels or formatting.
`;

export interface ResumeInterviewQA {
    question: string;
    answer: string;
}

export const generateResumeInterviewQuestions = async (
    title: string,
    organization: string,
    bullets: string[]
): Promise<string[]> => {
    const prompt = RESUME_INTERVIEW_GENERATE_PROMPT(title, organization, bullets);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text())) as string[];
    }, { event_type: 'resume_interview_generation', prompt, model: 'dynamic' });
};

export const summarizeResumeInterview = async (
    title: string,
    organization: string,
    bullets: string[],
    qaPairs: ResumeInterviewQA[]
): Promise<string> => {
    const prompt = RESUME_INTERVIEW_SUMMARIZE_PROMPT(title, organization, bullets, qaPairs);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return response.response.text().trim();
    }, { event_type: 'resume_interview_summary', prompt, model: 'dynamic' });
};
