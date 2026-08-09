import { describe, expect, it, vi } from 'vitest';
import { analyzeGap } from './eduAiService';
import { callWithRetry, getModel } from './aiCore';
import { CAREER_PROMPTS } from '../../prompts/index';

vi.mock('./aiCore', () => ({
    getModel: vi.fn(),
    callWithRetry: vi.fn(),
    cleanJsonOutput: vi.fn((value: string) => value),
}));

vi.mock('../../prompts/index', () => ({
    CAREER_PROMPTS: {
        GAP_ANALYSIS: vi.fn(() => 'gap prompt'),
    },
    EDUCATION_PROMPTS: {},
    PARSING_PROMPTS: {},
}));

describe('Career analysis payloads', () => {
    it('keeps role models, resumes, skills, and transcript data separate and compact', async () => {
        vi.mocked(callWithRetry).mockImplementation(async (fn: any) => fn({}));
        vi.mocked(getModel).mockResolvedValue({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    usageMetadata: {},
                    text: () => JSON.stringify({}),
                },
            }),
        } as any);

        await analyzeGap(
            [{
                id: 'role-model-id',
                name: 'Role Model',
                headline: 'Planner',
                organization: 'Transit Co.',
                topSkills: ['Planning'],
                careerSnapshot: 'Started in planning.',
                rawTextSummary: 'Condensed history.',
                experience: [{ id: 'role-block-id', type: 'work', title: 'Planner', organization: 'Transit Co.', dateRange: '2020', bullets: ['Planned projects'] }],
                dateAdded: 123,
            }] as any,
            [{
                id: 'resume-id',
                name: 'Primary',
                blocks: [{ id: 'resume-block-id', type: 'work', title: 'Analyst', organization: 'City', dateRange: '2022', bullets: ['Analyzed data'], isVisible: true }],
                suggestedUpdates: [{ id: 'suggestion-id', suggestion: 'Do more', type: 'add', impact: 'More impact', source: 'AI', dateAdded: 123 }],
                importRevision: 4,
            }] as any,
            [{
                id: 'skill-id',
                user_id: 'user-id',
                name: 'ArcGIS',
                category: 'hard',
                proficiency: 'comfortable',
                evidence: 'Used at work',
                verificationCache: { questions: ['q'], generatedAt: 123, proficiencyLevel: 'comfortable' },
                created_at: 'old',
                updated_at: 'old',
            }] as any,
            {
                id: 'transcript-id',
                university: 'University',
                program: 'Planning',
                credentialType: "Bachelor's Degree",
                cgpa: 3.8,
                rawText: 'FULL RAW TRANSCRIPT SHOULD NOT BE SENT',
                dateUploaded: 123,
                semesters: [{ term: 'Fall', year: 2024, semesterGpa: 4, courses: [{ code: 'PLAN 302', title: 'Statistics', grade: 'A', credits: 0.5 }] }],
            } as any,
        );

        const [roleModels, resumes, skills, transcript] = vi.mocked(CAREER_PROMPTS.GAP_ANALYSIS).mock.calls[0];

        expect(roleModels).toContain('Transit Co.');
        expect(roleModels).not.toContain('role-model-id');
        expect(roleModels).not.toContain('role-block-id');
        expect(roleModels).not.toContain('123');

        expect(resumes).toContain('Analyzed data');
        expect(resumes).not.toContain('resume-id');
        expect(resumes).not.toContain('suggestion-id');
        expect(resumes).not.toContain('importRevision');

        expect(skills).toContain('ArcGIS');
        expect(skills).toContain('Used at work');
        expect(skills).not.toContain('verificationCache');
        expect(skills).not.toContain('created_at');

        expect(transcript).toContain('PLAN 302');
        expect(transcript).not.toContain('FULL RAW TRANSCRIPT SHOULD NOT BE SENT');
        expect(transcript).not.toContain('dateUploaded');
    });
});
