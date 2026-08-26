import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import { INTERVIEW_PROMPTS } from "../../prompts/index";
import { AI_MODELS } from "../../constants";
import type { CandidateProfileSignal, CustomSkill, ExperienceBlock, InterviewQuestion, InterviewResponseAnalysis, ResumeProfile } from "../../types";
import { formatCandidateProfileContext, formatVerifiedSkills } from '../candidateProfileContext';
import { formatInterviewBlocks } from './interviewContext';

const stringifyProfile = (profile: ResumeProfile, jobContext = '', verifiedSkills: CustomSkill[] = []): string => {
    const blocks = formatInterviewBlocks(profile, jobContext);
    const candidateContext = formatCandidateProfileContext(profile, jobContext);
    const skillsContext = formatVerifiedSkills(verifiedSkills, jobContext);
    return [
        blocks,
        candidateContext ? `APPROVED CANDIDATE CONTEXT:\n${candidateContext}` : '',
        skillsContext,
    ].filter(Boolean).join('\n\n');
};

export const generateTailoredInterviewQuestions = async (
    jobDescription: string,
    resumes: ResumeProfile[],
    jobId?: string,
    jobTitle?: string,
    verifiedSkills: CustomSkill[] = []
): Promise<InterviewQuestion[]> => {
    const resumeContext = resumes.map(resume => stringifyProfile(resume, jobDescription, verifiedSkills)).join('\n---\n');
    const prompt = INTERVIEW_PROMPTS.GENERATE_QUESTIONS(jobDescription, resumeContext, jobTitle);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const questions = JSON.parse(cleanJsonOutput(response.response.text()));
        return (questions as InterviewQuestion[]).map(q => ({
            ...q,
            id: crypto.randomUUID(),
            answerFramework: q.answerFramework === 'STAR' || q.answerFramework === 'ARC' ? q.answerFramework : undefined,
        }));
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

export const generateUnifiedQuestion = async (
    skills: { name: string; proficiency: string }[],
): Promise<{ question: string; targetSkills: string[] }> => {
    const prompt = INTERVIEW_PROMPTS.UNIFIED_SKILL_QUESTION(skills);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'unified_skill_question_generation', prompt, model: 'dynamic' });
};

export const analyzeUnifiedResponse = async (
    question: string,
    targetSkills: string[],
    userResponse: string,
    options: {
        selectedSkills: string[];
        history: { question: string; answer: string }[];
        questionNumber: number;
        maxQuestions: number;
    },
): Promise<{
    feedback: string;
    overallPassed: boolean;
    skillResults: { skill: string; demonstrated: boolean; note: string }[];
    shouldContinue: boolean;
    nextQuestion: string | null;
    nextTargetSkills: string[];
}> => {
    const prompt = INTERVIEW_PROMPTS.ANALYZE_UNIFIED_RESPONSE(
        question,
        targetSkills,
        userResponse,
        options.selectedSkills,
        options.history,
        options.questionNumber,
        options.maxQuestions,
    );

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
    answerFramework: 'ARC',
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
            ...(questions as InterviewQuestion[]).map(q => ({
                ...q,
                id: crypto.randomUUID(),
                answerFramework: q.answerFramework === 'STAR' || q.answerFramework === 'ARC' ? q.answerFramework : undefined,
            })),
        ];
    }, { event_type: 'interview_generation_general', prompt, model: AI_MODELS.EXTRACTION });
};

export interface CandidateProfileDraft {
    signals: Array<Pick<CandidateProfileSignal, 'key' | 'value'>>;
    stories: Array<{ text: string; tags: string[] }>;
}

export const summarizeCandidateProfile = async (
    resumeContext: string,
    answers: Array<{ question: string; answer: string }>
): Promise<CandidateProfileDraft> => {
    const answerText = answers
        .map((item, index) => `Q${index + 1}: ${item.question}\nA: ${item.answer}`)
        .join('\n\n');
    const prompt = INTERVIEW_PROMPTS.PROFILE_SUMMARY(resumeContext, answerText);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: 'application/json' } });
        const response = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text())) as CandidateProfileDraft;
    }, { event_type: 'profile_interview_summary', prompt, model: 'dynamic' });
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
    jobId?: string,
    resumeContext?: string
): Promise<InterviewResponseAnalysis & { followUp: { shouldFollowUp: boolean; question: string | null; rationale?: string } }> => {
    const prompt = INTERVIEW_PROMPTS.ANALYZE_AND_FOLLOW_UP(question, userResponse, jobDescription, resumeContext);

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

export interface InterviewerQuestionReview {
    feedback: string;
    suggestions: string[];
}

export const reviewInterviewerQuestions = async (
    jobTitle: string,
    jobContext: string,
    candidateQuestions: string
): Promise<InterviewerQuestionReview> => {
    const prompt = INTERVIEW_PROMPTS.REVIEW_INTERVIEWER_QUESTIONS(jobTitle, jobContext, candidateQuestions);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text())) as InterviewerQuestionReview;
    }, { event_type: 'interviewer_question_review', prompt, model: 'dynamic' });
};

// ─── Resume Interview ────────────────────────────────────────────────────────
// Surfaces narrative depth behind resume bullets, saved as narrativeContext on the block.

const getResumeInterviewFocus = (entryType: ExperienceBlock['type']): string => {
    if (entryType === 'project') return 'Focus on the project goal, your specific contribution, approach, constraints, decisions, outcome, and lessons learned.';
    if (entryType === 'volunteer') return 'Focus on the community need, your responsibilities, collaboration, decisions, and measurable or meaningful impact.';
    return 'Focus on responsibilities, decisions, challenges, collaboration, and concrete impact beyond the surface-level bullets.';
};

const RESUME_INTERVIEW_GENERATE_PROMPT = (entryType: ExperienceBlock['type'], title: string, organization: string, bullets: string[]) => `
You are helping a job applicant capture the real story behind a resume entry.

EXPERIENCE BLOCK:
Entry type: ${entryType}
Role: ${title}
Organization: ${organization}
Bullets:
${bullets.map(b => `- ${b}`).join('\n')}

Generate exactly 3 interview questions that surface detail NOT already captured in the bullets above.
${getResumeInterviewFocus(entryType)}

Return a JSON array of 3 strings. Example: ["Question 1?", "Question 2?", "Question 3?"]
Return ONLY the JSON array, no other text.
`;

const RESUME_INTERVIEW_SUMMARIZE_PROMPT = (entryType: ExperienceBlock['type'], title: string, organization: string, bullets: string[], qaPairs: { question: string; answer: string }[]) => `
You are synthesizing a candidate's answers into narrative context for a resume ${entryType} entry.

EXPERIENCE BLOCK:
Entry type: ${entryType}
Role: ${title}
Organization: ${organization}
Bullets:
${bullets.map(b => `- ${b}`).join('\n')}

INTERVIEW ANSWERS:
${qaPairs.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Write 2-4 sentences of narrative context that captures the depth revealed in these answers.
Preserve the entry type accurately. ${getResumeInterviewFocus(entryType)}
Write in first person. Be specific and concrete. Do not restate the bullets — add what is behind them.
Use no colons, semicolons, or em dashes. Return only the narrative text, no labels or formatting.
`;

export interface ResumeInterviewQA {
    question: string;
    answer: string;
}

export const generateResumeInterviewQuestions = async (
    entryType: ExperienceBlock['type'],
    title: string,
    organization: string,
    bullets: string[]
): Promise<string[]> => {
    const prompt = RESUME_INTERVIEW_GENERATE_PROMPT(entryType, title, organization, bullets);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text())) as string[];
    }, { event_type: 'resume_interview_generation', prompt, model: 'dynamic' });
};

export const summarizeResumeInterview = async (
    entryType: ExperienceBlock['type'],
    title: string,
    organization: string,
    bullets: string[],
    qaPairs: ResumeInterviewQA[]
): Promise<string> => {
    const prompt = RESUME_INTERVIEW_SUMMARIZE_PROMPT(entryType, title, organization, bullets, qaPairs);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return response.response.text().trim();
    }, { event_type: 'resume_interview_summary', prompt, model: 'dynamic' });
};
