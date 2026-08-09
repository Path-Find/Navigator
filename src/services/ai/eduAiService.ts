import { getModel, callWithRetry, cleanJsonOutput } from "./aiCore";
import type {
    Transcript,
    RoleModelProfile,
    GapAnalysisResult,
    RoadmapMilestone,
    ResumeProfile,
    CustomSkill,
    AdmissionEligibility,
    ProjectProposal
} from "../../types";
import { AI_MODELS, AI_TEMPERATURE } from "../../constants";
import { EDUCATION_PROMPTS, CAREER_PROMPTS, PARSING_PROMPTS } from "../../prompts/index";
import { extractPdfText } from "../../utils/pdfExtractor";

const stringifyResumeForCareer = (profile: ResumeProfile): string => JSON.stringify({
    name: profile.name,
    blocks: profile.blocks
        .filter(block => block.isVisible)
        .map(({ type, title, organization, dateRange, bullets, narrativeContext }) => ({
            type,
            title,
            organization,
            dateRange,
            bullets,
            ...(narrativeContext ? { narrativeContext } : {}),
        })),
});

const stringifyRoleModelForCareer = (roleModel: RoleModelProfile): string => JSON.stringify({
    name: roleModel.name,
    headline: roleModel.headline,
    organization: roleModel.organization,
    topSkills: roleModel.topSkills,
    careerSnapshot: roleModel.careerSnapshot,
    rawTextSummary: roleModel.rawTextSummary,
    experience: (roleModel.experience || []).map(({ type, title, organization, dateRange, bullets }) => ({
        type,
        title,
        organization,
        dateRange,
        bullets,
    })),
});

const stringifySkillsForCareer = (skills: CustomSkill[]): string => JSON.stringify(skills.map(({ name, category, proficiency, description, evidence }) => ({
    name,
    category,
    proficiency,
    ...(description ? { description } : {}),
    ...(evidence ? { evidence } : {}),
})));

const stringifyTranscriptForCareer = (transcript: Transcript): string => JSON.stringify({
    university: transcript.university,
    program: transcript.program,
    credentialType: transcript.credentialType,
    cgpa: transcript.cgpa,
    semesters: transcript.semesters.map(({ term, year, courses }) => ({
        term,
        year,
        courses: courses.map(({ code, title, grade, credits }) => ({ code, title, grade, credits })),
    })),
});

const stringifyCourses = (transcript: Transcript): string => JSON.stringify(
    transcript.semesters.flatMap(semester => semester.courses.map(({ code, title, grade, credits }) => ({
        code,
        title,
        grade,
        credits,
    })))
);

export const analyzeMAEligibility = async (
    transcript: Transcript,
    targetProgram: string
): Promise<AdmissionEligibility> => {
    const transcriptText = stringifyTranscriptForCareer(transcript);
    const prompt = EDUCATION_PROMPTS.GRAD_SCHOOL_ELIGIBILITY(transcriptText, targetProgram);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'ma_eligibility', prompt, model: AI_MODELS.EXTRACTION });
};

export const parseRoleModel = async (
    fileBase64: string,
    mimeType: string
): Promise<RoleModelProfile> => {
    const metadataPrompt = PARSING_PROMPTS.ROLE_MODEL_METADATA();
    return callWithRetry(async (metadata) => {
        const model = await getModel({
            task: 'extraction',
            generationConfig: { temperature: AI_TEMPERATURE.STRICT, responseMimeType: "application/json" },
            feature: 'role_model'
        });
        const response = await model.generateContent({
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { data: fileBase64, mimeType } },
                    { text: metadataPrompt }
                ]
            }]
        });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'role_model_metadata', prompt: metadataPrompt, model: AI_MODELS.EXTRACTION });
};

export const analyzeGap = async (
    roleModels: RoleModelProfile[],
    userResumes: ResumeProfile[],
    userSkills: CustomSkill[],
    transcript: Transcript | null = null,
): Promise<GapAnalysisResult> => {
    const roleModelContext = roleModels.map(stringifyRoleModelForCareer).join('\n---\n');
    const resumeContext = userResumes.map(stringifyResumeForCareer).join('\n---\n');
    const skillContext = stringifySkillsForCareer(userSkills);
    const transcriptContext = transcript ? stringifyTranscriptForCareer(transcript) : '';
    const prompt = CAREER_PROMPTS.GAP_ANALYSIS(roleModelContext, resumeContext, skillContext, transcriptContext);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" }, feature: 'gap_analysis' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'gap_analysis', prompt, model: 'dynamic' });
};

export const generateRoadmap = async (
    gapAnalysis: GapAnalysisResult
): Promise<RoadmapMilestone[]> => {
    const prompt = CAREER_PROMPTS.GENERATE_ROADMAP(JSON.stringify(gapAnalysis));
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" }, feature: 'roadmap' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        const parsed = JSON.parse(cleanJsonOutput(response.response.text()));
        return (parsed.milestones as RoadmapMilestone[]).map((m) => ({ ...m, status: 'pending' }));
    }, { event_type: 'roadmap_generation', prompt, model: 'dynamic' });
};

export const analyzeRoleModelGap = async (
    roleModel: RoleModelProfile,
    resumes: ResumeProfile[],
    userSkills: CustomSkill[] = [],
    onProgress?: (message: string, current: number, total: number) => void
): Promise<GapAnalysisResult> => {
    if (onProgress) onProgress("Simulating career emulation...", 1, 1);
    const roleModelContext = stringifyRoleModelForCareer(roleModel);
    const resumeContext = resumes.map(stringifyResumeForCareer).join('\n---\n');
    const skillsContext = stringifySkillsForCareer(userSkills);
    const analysisPrompt = CAREER_PROMPTS.ROLE_MODEL_GAP_ANALYSIS(roleModelContext, resumeContext, skillsContext);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" }, feature: 'role_model' });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: analysisPrompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'role_model_emulation', prompt: analysisPrompt, model: 'dynamic' }, undefined, undefined, onProgress);
};

export const parseTranscript = async (
    fileBase64: string,
    mimeType: string
): Promise<Transcript> => {
    let promptParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];
    let extractedText = "";

    if (mimeType === 'application/pdf') {
        extractedText = await extractPdfText(fileBase64);
        promptParts = [];
    } else {
        promptParts = [{ inlineData: { mimeType, data: fileBase64 } }];
    }

    const prompt = PARSING_PROMPTS.TRANSCRIPT_PARSE(extractedText);
    promptParts.push({ text: prompt });

    return callWithRetry(async (metadata) => {
        const model = await getModel({
            task: 'extraction',
            generationConfig: { temperature: AI_TEMPERATURE.STRICT, responseMimeType: "application/json" }
        });
        const response = await model.generateContent({
            contents: [{
                role: "user",
                parts: promptParts
            }]
        });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'transcript_parse', prompt, model: AI_MODELS.EXTRACTION });
};

export const extractSkillsFromCourses = async (
    transcript: Transcript
): Promise<CustomSkill[]> => {
    const coursesList = stringifyCourses(transcript);
    const prompt = EDUCATION_PROMPTS.COURSE_SKILL_EXTRACTION(coursesList);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'skill_extraction', prompt, model: AI_MODELS.EXTRACTION });
};

export const analyzeCurrentProgramRequirements = async (
    transcript: Transcript,
    programName: string,
    university: string
): Promise<AdmissionEligibility> => {
    const transcriptText = stringifyTranscriptForCareer(transcript);
    const prompt = EDUCATION_PROMPTS.PROGRAM_REQUIREMENTS_ANALYSIS(transcriptText, programName, university);

    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'analysis', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'program_requirements', prompt, model: 'dynamic' });
};

export const extractProjectsFromCourses = async (
    transcript: Transcript
): Promise<ProjectProposal[]> => {
    const coursesList = stringifyCourses(transcript);
    const prompt = EDUCATION_PROMPTS.COURSE_PROJECT_EXTRACTION(coursesList);
    return callWithRetry(async (metadata) => {
        const model = await getModel({ task: 'extraction', generationConfig: { responseMimeType: "application/json" } });
        const response = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
        metadata.token_usage = response.response.usageMetadata;
        return JSON.parse(cleanJsonOutput(response.response.text()));
    }, { event_type: 'project_extraction', prompt, model: AI_MODELS.EXTRACTION });
};
