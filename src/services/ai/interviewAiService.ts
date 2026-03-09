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
        return (questions as any[]).map(q => ({ ...q, id: crypto.randomUUID() }));
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

export const generateGeneralBehavioralQuestions = async (resumeContext: string): Promise<InterviewQuestion[]> => {
    const prompt = INTERVIEW_PROMPTS.GENERAL_BEHAVIORAL(resumeContext);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'interview', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const questions = JSON.parse(cleanJsonOutput(response.response.text()));
        return (questions as any[]).map(q => ({ ...q, id: crypto.randomUUID() }));
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
