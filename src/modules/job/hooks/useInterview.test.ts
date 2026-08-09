import { describe, expect, it, vi } from 'vitest';
import { getInterviewJobContext, getInterviewResumes } from './useInterview';

vi.mock('../../../services/geminiService', () => ({
    analyzeAndFollowUp: vi.fn(),
    formatParsedJobContext: (job: { roleTitle: string; companyName: string }) =>
        `Role: ${job.roleTitle} at ${job.companyName}`,
    generateGeneralBehavioralQuestions: vi.fn(),
    generateTailoredInterviewQuestions: vi.fn(),
}));

describe('getInterviewJobContext', () => {
    it('uses parsed job context instead of resending the raw posting', () => {
        const rawDescription = 'RAW JOB DESCRIPTION THAT SHOULD NOT BE RESENT';
        const context = getInterviewJobContext({
            description: rawDescription,
            analysis: {
                distilledJob: {
                    roleTitle: 'Planner',
                    companyName: 'Transit Co.',
                },
            },
        } as any);

        expect(context).toBe('Role: Planner at Transit Co.');
        expect(context).not.toContain(rawDescription);
    });

    it('falls back to the raw description for unanalyzed legacy jobs', () => {
        const rawDescription = 'LEGACY RAW JOB DESCRIPTION';

        expect(getInterviewJobContext({ description: rawDescription } as any)).toBe(rawDescription);
    });

    it('passes only the best resume and recommended visible blocks to tailored interviews', () => {
        const resumes = [{
            id: 'resume-1',
            name: 'Primary',
            blocks: [
                { id: 'summary-1', type: 'summary', title: 'Summary', organization: '', dateRange: '', bullets: ['Summary'], isVisible: true },
                { id: 'work-1', type: 'work', title: 'Planner', organization: 'Transit Co.', dateRange: '2022', bullets: ['ArcGIS'], isVisible: true },
                { id: 'work-2', type: 'work', title: 'Unrelated', organization: 'Other Co.', dateRange: '2020', bullets: ['Baking'], isVisible: true },
                { id: 'hidden-1', type: 'work', title: 'Hidden', organization: 'Other Co.', dateRange: '2019', bullets: ['Hidden'], isVisible: false },
            ],
        }, {
            id: 'resume-2',
            name: 'Secondary',
            blocks: [{ id: 'secondary-1', type: 'work', title: 'Secondary', organization: 'Other Co.', dateRange: '2018', bullets: ['Other'], isVisible: true }],
        }] as any;

        const focused = getInterviewResumes({
            description: 'raw',
            analysis: { bestResumeProfileId: 'resume-1', recommendedBlockIds: ['work-1'] },
        } as any, resumes);

        expect(focused).toHaveLength(1);
        expect(focused[0].id).toBe('resume-1');
        expect(focused[0].blocks.map((block: { id: string }) => block.id)).toEqual(['work-1']);
    });
});
