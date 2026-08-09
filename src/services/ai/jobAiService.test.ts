import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeJobFit, buildJobCandidateContext, cleanCoverLetterOutput, formatParsedJobContext } from './jobAiService';
import { callWithRetry, getModel } from './aiCore';
import { JOB_ANALYSIS_PROMPTS } from '../../prompts/index';

// Heavy AI/external deps — isolate so we can test pure logic without network calls
vi.mock('./aiCore', () => ({
    getModel: vi.fn(),
    callWithRetry: vi.fn(),
    cleanJsonOutput: vi.fn((s: string) => s.trim()),
}));

vi.mock('../storage/bucketStorage', () => ({
    BucketStorage: { getBucket: vi.fn().mockResolvedValue(null) },
}));

vi.mock('../../prompts/index', () => ({
    JOB_ANALYSIS_PROMPTS: {
        JOB_FIT_ANALYSIS: {
            DEFAULT: vi.fn(() => 'mock-prompt'),
            PARSE: vi.fn(() => 'mock-parse-prompt'),
            SCORE: vi.fn(() => 'mock-score-prompt'),
        },
        TAILORED_SUMMARY: vi.fn(() => 'mock-summary-prompt'),
    },
    COVER_LETTER_PROMPTS: {
        COVER_LETTER: {
            VARIANTS: { v1_direct: 'v1_direct' },
            GENERATE: vi.fn(() => 'mock-cl-prompt'),
        },
        CRITIQUE_COVER_LETTER: vi.fn(() => 'mock-critique-prompt'),
    },
}));

describe('cleanCoverLetterOutput', () => {
    it('strips markdown code block with json tag', () => {
        const input = '```json\n{"cover_letter": "Hello world"}\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Hello world');
    });

    it('strips generic markdown code block', () => {
        const input = '```\nDear Hiring Manager,\n\nI am writing...\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Hiring Manager,\n\nI am writing...');
    });

    it('strips markdown code block with text tag', () => {
        const input = '```text\nSome letter content\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Some letter content');
    });

    it('handles dangling opening backticks', () => {
        const input = '```json\nDear Manager,';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });

    it('handles dangling closing backticks', () => {
        const input = 'Dear Manager,\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });

    it('returns plain text unchanged', () => {
        const input = 'Dear Hiring Manager,\n\nThank you for the opportunity.';
        expect(cleanCoverLetterOutput(input)).toBe(input);
    });

    it('extracts cover_letter key from JSON', () => {
        const input = '{"cover_letter": "My letter here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My letter here.');
    });

    it('extracts text key from JSON', () => {
        const input = '{"text": "My text here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My text here.');
    });

    it('extracts content key from JSON', () => {
        const input = '{"content": "My content here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My content here.');
    });

    it('returns raw JSON if it has no known keys', () => {
        const input = '{"unknown_key": "value"}';
        expect(cleanCoverLetterOutput(input)).toBe(input);
    });

    it('trims surrounding whitespace', () => {
        const input = '  \n  Dear Manager,\n  \n  ';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });
});

describe('job context assembly', () => {
    const resume = {
        id: 'resume-1',
        name: 'Primary Resume',
        blocks: [{
            id: 'work-1',
            type: 'work',
            title: 'Planning Assistant',
            organization: 'City of Toronto',
            dateRange: '2022 - Present',
            bullets: ['Used ArcGIS to support transportation planning projects.'],
            isVisible: true,
        }],
    } as any;

    const parsedJob = {
        roleTitle: 'Student Transportation Planner',
        companyName: 'Transit Co.',
        keySkills: ['ArcGIS', 'Data analysis'],
        requiredSkills: [],
        coreResponsibilities: ['Analyze transportation data'],
        coverLetterHooks: ['Transit Co. is modernizing regional mobility through data-informed planning.'],
        applicationDeadline: null,
        courseworkRequirements: ['Statistics'],
        educationRequirements: [],
        experienceRequirements: [],
        hardGates: [],
        preferredRequirements: [],
    } as any;

    const transcript = {
        id: 'transcript-1',
        program: 'Urban Planning',
        university: 'University of Waterloo',
        semesters: [{
            term: 'Fall 2024',
            year: 2024,
            courses: [
                { code: 'PLAN 302', title: 'Statistics for Planning', grade: '86', credits: 0.5 },
                { code: 'HIST 101', title: 'Canadian History', grade: '90', credits: 0.5 },
            ],
        }],
        dateUploaded: Date.now(),
    } as any;

    const skill = (name: string) => ({
        id: name,
        user_id: 'user-1',
        name,
        proficiency: 'comfortable',
        created_at: '',
        updated_at: '',
    } as any);

    it('includes only job-relevant skills and academic evidence', () => {
        const context = buildJobCandidateContext(
            [resume],
            [skill('ArcGIS'), skill('Baking')],
            transcript,
            parsedJob,
        );

        expect(context.prompt).toContain('ArcGIS');
        expect(context.prompt).not.toContain('Baking');
        expect(context.prompt).toContain('Statistics for Planning');
        expect(context.prompt).not.toContain('Canadian History');
        expect(context.academicEvidence).toEqual(['Statistics for Planning (PLAN 302) — 86']);
    });

    it('omits transcripts when the parsed job has no education or coursework need', () => {
        const context = buildJobCandidateContext(
            [resume],
            [],
            transcript,
            { ...parsedJob, courseworkRequirements: [] },
        );

        expect(context.prompt).not.toContain('ACADEMIC EVIDENCE');
        expect(context.academicEvidence).toEqual([]);
    });

    it('uses a matching resume education block before adding transcript program evidence', () => {
        const context = buildJobCandidateContext(
            [{
                ...resume,
                blocks: [{
                    id: 'education-1',
                    type: 'education',
                    title: 'Bachelor of Urban Planning',
                    organization: 'University of Waterloo',
                    dateRange: '2021 - 2025',
                    bullets: [],
                    isVisible: true,
                }],
            } as any],
            [],
            transcript,
            { ...parsedJob, courseworkRequirements: [], educationRequirements: ['Urban Planning degree'] },
        );

        expect(context.prompt).toContain('Bachelor of Urban Planning');
        expect(context.prompt).not.toContain('ACADEMIC EVIDENCE');
        expect(context.academicEvidence).toEqual([]);
    });

    it('formats downstream context from parsed job data without the raw posting', () => {
        const context = formatParsedJobContext(parsedJob, ['Statistics for Planning (PLAN 302) — 86']);

        expect(context).toContain('Role: Student Transportation Planner at Transit Co.');
        expect(context).toContain('[required] coursework: Statistics');
        expect(context).toContain('Transit Co. is modernizing regional mobility');
        expect(context).toContain('Statistics for Planning (PLAN 302) — 86');
        expect(context).not.toContain('RAW JOB DESCRIPTION');
    });

    it('keeps preferred requirements visibly separate from mandatory requirements', () => {
        const context = formatParsedJobContext({
            ...parsedJob,
            requirements: [
                { text: 'Bachelor degree', category: 'education', priority: 'required' },
                { text: 'Master degree', category: 'education', priority: 'preferred' },
                { text: 'Professional licence', category: 'hard_gate', priority: 'hard_gate' },
            ],
            educationRequirements: [],
            hardGates: [],
            preferredRequirements: [],
        });

        expect(context).toContain('[required] education: Bachelor degree');
        expect(context).toContain('[preferred] education: Master degree');
        expect(context).toContain('[hard_gate] hard_gate: Professional licence');
    });
});

describe('parse and score call boundaries', () => {
    beforeEach(() => {
        vi.mocked(callWithRetry).mockImplementation(async (fn: any) => fn({}));
        vi.mocked(getModel).mockImplementation(async (params: any) => ({
            generateContent: vi.fn().mockResolvedValue({
                        response: {
                    usageMetadata: {},
                    text: () => params.task === 'extraction'
                        ? JSON.stringify({
                            roleTitle: 'Planner',
                            companyName: 'Transit Co.',
                            location: null,
                            keySkills: ['ArcGIS'],
                            requiredSkills: [],
                            coreResponsibilities: ['Plan projects'],
                            applicationDeadline: null,
                            coverLetterHooks: ['Transit Co. is modernizing regional mobility.'],
                            requirements: [
                                { text: 'ArcGIS', category: 'skill', priority: 'required' },
                                { text: 'Statistics', category: 'coursework', priority: 'preferred' },
                            ],
                            educationRequirements: [],
                            courseworkRequirements: [],
                            experienceRequirements: [],
                            hardGates: [],
                            preferredRequirements: [],
                        })
                        : JSON.stringify({
                            compatibilityScore: 72,
                            reasoning: 'Strong evidence match.',
                            strengths: ['ArcGIS'],
                            weaknesses: [],
                            recommendedBlockIds: ['work-1'],
                        }),
                },
            }),
        } as any));
    });

    it('parses the raw posting first and scores using parsed data instead of raw text', async () => {
        const parsePrompt = vi.mocked(JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.PARSE);
        const scorePrompt = vi.mocked(JOB_ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS.SCORE);
        const rawJob = 'RAW JOB DESCRIPTION THAT MUST NOT REACH THE SCORE PROMPT';
        parsePrompt.mockImplementation((text: string) => `PARSE:${text}`);
        scorePrompt.mockImplementation((parsed: string, candidate: string) => `SCORE:${parsed}\n${candidate}`);

        const result = await analyzeJobFit(rawJob, [{
            id: 'resume-1',
            name: 'Primary Resume',
            blocks: [{
                id: 'work-1',
                type: 'work',
                title: 'Planner',
                organization: 'Transit Co.',
                dateRange: '2022 - Present',
                bullets: ['Used ArcGIS.'],
                isVisible: true,
            }],
        } as any]);

        expect(parsePrompt).toHaveBeenCalledWith(rawJob);
        expect(scorePrompt).toHaveBeenCalledOnce();
        expect(scorePrompt.mock.calls[0][0]).toContain('"roleTitle": "Planner"');
        expect(scorePrompt.mock.calls[0][0]).toContain('"priority": "required"');
        expect(scorePrompt.mock.calls[0][1]).not.toContain(rawJob);
        expect(result.compatibilityScore).toBe(72);
        expect(result.distilledJob.roleTitle).toBe('Planner');
        expect(result.distilledJob.coverLetterHooks).toEqual(['Transit Co. is modernizing regional mobility.']);
        expect(result.distilledJob.requirements).toEqual([
            { text: 'ArcGIS', category: 'skill', priority: 'required' },
            { text: 'Statistics', category: 'coursework', priority: 'preferred' },
        ]);
    });
});
