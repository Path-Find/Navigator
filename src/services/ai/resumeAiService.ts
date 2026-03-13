import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import type {
    ExperienceBlock,
    CustomSkill,
    ResumeProfile
} from "../../types";
import { PARSING_PROMPTS, JOB_ANALYSIS_PROMPTS, CAREER_PROMPTS } from "../../prompts/index";
import { AI_MODELS } from "../../constants";
import { loadPdfJS } from "../../utils/pdfLoader";

const stringifyProfile = (profile: ResumeProfile): string => {
    const blocks = profile.blocks
        .filter(b => b.isVisible)
        .map(({ type, title, organization, dateRange, bullets }) => ({ type, title, organization, dateRange, bullets }));
    return JSON.stringify(blocks);
};

export const extractPdfText = async (base64: string): Promise<string> => {
    try {
        const pdfjsLib = await loadPdfJS();
        if (!pdfjsLib) throw new Error("PDF library not loaded");

        const loadingTask = pdfjsLib.getDocument({ data: atob(base64) });
        const pdf = await loadingTask.promise;
        const pagesContent: string[] = [];

        // Sequential processing to prevent memory spikes on large PDFs
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            pagesContent.push(pageText);
        }

        const rawContent = pagesContent.join('\n');

        // Clean common PDF extraction artifacts (ligatures etc)
        const cleaned = rawContent
            .replace(/f\s+i/g, 'fi')
            .replace(/f\s+l/g, 'fl')
            .replace(/fi\s+/g, 'fi')
            .replace(/fl\s+/g, 'fl')
            .replace(/ti\s+/g, 'ti')
            .replace(/ff\s+/g, 'ff')
            .replace(/ft\s+/g, 'ft')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleaned.length < 10) {
            throw new Error("PDF appears empty or contains no readable text.");
        }

        return cleaned + '\n';
    } catch (err) {
        console.error("[PdfService] Extraction failed:", err);
        throw err;
    }
}

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
