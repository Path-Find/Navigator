import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSummaryGeneration } from './useSummaryGeneration';
import { generateTailoredSummary, formatParsedJobContext } from '../../../services/geminiService';
import { Storage } from '../../../services/storageService';

vi.mock('../../../services/geminiService', () => ({
    formatParsedJobContext: vi.fn(() => 'PARSED JOB CONTEXT'),
    generateTailoredSummary: vi.fn().mockResolvedValue('Tailored summary'),
}));

vi.mock('../../../services/storageService', () => ({
    Storage: {
        updateJob: vi.fn().mockResolvedValue(undefined),
    },
}));

describe('useSummaryGeneration', () => {
    it('sends only the analyzed job resume context to the summary call', async () => {
        const job = {
            id: 'job-1',
            analysis: {
                bestResumeProfileId: 'resume-1',
                recommendedBlockIds: ['work-1'],
                distilledJob: { roleTitle: 'Planner', companyName: 'Transit Co.' },
                selectedAcademicEvidence: [],
            },
        } as any;
        const resumes = [{
            id: 'resume-1',
            name: 'Primary',
            blocks: [
                { id: 'summary-1', type: 'summary', title: 'Summary', organization: '', dateRange: '', bullets: ['Summary'], isVisible: true },
                { id: 'work-1', type: 'work', title: 'Planner', organization: 'Transit Co.', dateRange: '2022', bullets: ['ArcGIS'], isVisible: true },
                { id: 'work-2', type: 'work', title: 'Unrelated', organization: 'Other Co.', dateRange: '2020', bullets: ['Baking'], isVisible: true },
            ],
        }, {
            id: 'resume-2',
            name: 'Secondary',
            blocks: [{ id: 'secondary-1', type: 'work', title: 'Other', organization: 'Other Co.', dateRange: '2018', bullets: ['Other'], isVisible: true }],
        }] as any;

        const onUpdateJob = vi.fn();
        const { result } = renderHook(() => useSummaryGeneration(job, resumes, onUpdateJob, vi.fn()));

        await act(async () => {
            await result.current.handleGenerateSummary();
        });

        expect(formatParsedJobContext).toHaveBeenCalledOnce();
        expect(generateTailoredSummary).toHaveBeenCalledWith(
            'PARSED JOB CONTEXT',
            [expect.objectContaining({
                id: 'resume-1',
                blocks: expect.arrayContaining([
                    expect.objectContaining({ id: 'summary-1' }),
                    expect.objectContaining({ id: 'work-1' }),
                ]),
            })],
            'job-1'
        );

        const summaryResume = vi.mocked(generateTailoredSummary).mock.calls[0][1][0];
        expect(summaryResume.blocks).toHaveLength(2);
        expect(summaryResume.blocks.some(block => block.id === 'work-2')).toBe(false);
        expect(summaryResume.blocks.some(block => block.id === 'secondary-1')).toBe(false);
        expect(Storage.updateJob).toHaveBeenCalledOnce();
        expect(onUpdateJob).toHaveBeenCalledOnce();
    });
});
