import { describe, expect, it, vi } from 'vitest';
import { getInterviewJobContext } from './useInterview';

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
});
