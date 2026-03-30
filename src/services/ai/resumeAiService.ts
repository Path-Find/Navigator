import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import type {
    ExperienceBlock,
    CustomSkill,
    ResumeProfile
} from "../../types";
import { PARSING_PROMPTS, JOB_ANALYSIS_PROMPTS, CAREER_PROMPTS } from "../../prompts/index";
import { AI_MODELS } from "../../constants";
import { extractPdfText } from "../../utils/pdfExtractor";

const stringifyProfile = (profile: ResumeProfile): string => {
    const blocks = profile.blocks
        .filter(b => b.isVisible)
        .map(({ type, title, organization, dateRange, bullets }) => ({ type, title, organization, dateRange, bullets }));
    return JSON.stringify(blocks);
};

export const parseResumeFile = async (
    fileBase64: string,
    mimeType: string
): Promise<ExperienceBlock[]> => {
    let promptParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];
    if (mimeType === 'application/pdf') {
        const extractedText = await extractPdfText(fileBase64);
        promptParts = [{ text: `RESUME CONTENT:\n${extractedText}` }];
    } else {
        promptParts = [{ inlineData: { mimeType, data: fileBase64 } }];
    }
    const prompt = PARSING_PROMPTS.RESUME_PARSE();
    promptParts.push({ text: prompt });

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
        metadata.token_usage = response.response.usageMetadata;
        const parsed = JSON.parse(cleanJsonOutput(response.response.text()));
        return (parsed as ExperienceBlock[]).map((p) => ({ ...p, id: crypto.randomUUID(), isVisible: true }));
    }, { event_type: 'parsing', prompt, model: AI_MODELS.EXTRACTION });
};

export const tailorExperienceBlock = async (
    block: ExperienceBlock,
    jobDescription: string,
    instructions: string[],
    jobId?: string
): Promise<string[]> => {
    const prompt = JOB_ANALYSIS_PROMPTS.TAILOR_EXPERIENCE_BLOCK(jobDescription, block.title, block.organization, block.bullets, instructions);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" }, feature: 'resume_tailor' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'tailoring_block', prompt, model: 'dynamic', job_id: jobId });
};

export const inferProficiencyFromResponse = async (
    skillName: string,
    question: string,
    userAnswer: string
): Promise<{ proficiency: CustomSkill['proficiency']; evidence: string; feedback: string; passed: boolean }> => {
    const prompt = `
        You are an expert interviewer for ${skillName}.
        
        Question asked: "${question}"
        User's answer: "${userAnswer}"
        
        Analyze the user's answer. 
        1. Determine if the answer is correct and demonstrates proficiency.
        2. Assign a proficiency level based ONLY on this answer ('learning', 'comfortable', or 'expert').
        3. Provide brief, constructive feedback (1-2 sentences).
        4. Determine if they 'passed' this specific question (true/false).
        
        Return JSON: { "proficiency": "...", "evidence": "Analysis of answer...", "feedback": "...", "passed": true/false }
    `;
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'proficiency_inference', prompt, model: AI_MODELS.EXTRACTION });
};

export const generateSkillQuestions = async (
    skillName: string,
    proficiency: string
): Promise<{ questions: string[] }> => {
    const prompt = CAREER_PROMPTS.SKILL_VERIFICATION(skillName, proficiency);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const questions = JSON.parse(cleanJsonOutput(response.response.text()));
        return { questions };
    }, { event_type: 'skill_verification', prompt, model: AI_MODELS.EXTRACTION });
};

export const suggestSkillsFromResumes = async (
    resumes: ResumeProfile[]
): Promise<{ name: string; description: string }[]> => {
    const resumeContext = resumes.map(stringifyProfile).join('\n---\n');
    const prompt = CAREER_PROMPTS.SUGGEST_SKILLS(resumeContext);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'skill_suggestion', prompt, model: AI_MODELS.EXTRACTION });
};
