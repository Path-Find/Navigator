import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobAnalysis } from './useJobAnalysis';
import type { SavedJob } from '../types';

// --- Mocks ---

vi.mock('../../../services/geminiService', () => ({
    analyzeJobFit: vi.fn(),
}));

vi.mock('../../../services/storageService', () => ({
    Storage: {
        getTranscript: vi.fn().mockResolvedValue(null),
        updateJob: vi.fn(),
    },
}));

vi.mock('../../../utils/localStorage', () => ({
    LocalStorage: {
        get: vi.fn().mockReturnValue(null),
    },
}));

vi.mock('../../../hooks/useNextGen', () => ({
    useNextGen: vi.fn().mockReturnValue(false),
}));

vi.mock('../../../contexts/UserContext', () => ({
    useUser: vi.fn().mockReturnValue({ user: null }),
}));

vi.mock('../../../services/ai/rd/trajectoryService', () => ({
    RdTrajectoryService: {
        getTrajectoryProjection: vi.fn().mockResolvedValue(null),
    },
}));

// --- Helpers ---

import { analyzeJobFit } from '../../../services/geminiService';
import { Storage } from '../../../services/storageService';

const mockAnalysis = {
    compatibilityScore: 85,
    distilledJob: { roleTitle: 'Software Engineer', companyName: 'Acme' },
    strengths: ['TypeScript'],
    weaknesses: [],
};

const makeJob = (status: SavedJob['status'], hasAnalysis = false): SavedJob => ({
    id: 'job-1',
    company: 'Acme',
    position: 'Developer',
    description: 'Build things with TypeScript.',
    status,
    dateAdded: Date.now(),
    resumeId: 'resume-1',
    ...(hasAnalysis ? { analysis: mockAnalysis as any } : {}),
});

const noopUpdate = vi.fn();
const noopError = vi.fn();

describe('useJobAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not auto-trigger when job is saved with a valid analysis', () => {
        const job = makeJob('saved', true);

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, undefined)
        );

        expect(analyzeJobFit).not.toHaveBeenCalled();
    });

    it('does not trigger when job is undefined', () => {
        renderHook(() =>
            useJobAnalysis(undefined, [], [], noopUpdate, noopError, undefined)
        );

        expect(analyzeJobFit).not.toHaveBeenCalled();
    });

    it('calls onAnalyzeJob instead of analyzeJobFit when provided', async () => {
        const onAnalyzeJob = vi.fn().mockResolvedValue(makeJob('saved', true));
        const job = makeJob('analyzing');

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, onAnalyzeJob)
        );

        await waitFor(() => {
            expect(onAnalyzeJob).toHaveBeenCalledWith(job);
        });
        expect(analyzeJobFit).not.toHaveBeenCalled();
    });

    it('auto-triggers analysis when job status is "analyzing"', async () => {
        vi.mocked(analyzeJobFit).mockResolvedValue(mockAnalysis as any);
        const job = makeJob('analyzing');

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, undefined)
        );

        await waitFor(() => {
            expect(analyzeJobFit).toHaveBeenCalledOnce();
        });
    });

    it('auto-triggers analysis for a hollow job (saved but no analysis score)', async () => {
        vi.mocked(analyzeJobFit).mockResolvedValue(mockAnalysis as any);
        // saved but analysis has no compatibilityScore
        const job: SavedJob = {
            ...makeJob('saved'),
            analysis: { compatibilityScore: 0 } as any,
        };

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, undefined)
        );

        await waitFor(() => {
            expect(analyzeJobFit).toHaveBeenCalledOnce();
        });
    });

    it('calls onUpdateJob with the completed job after analysis', async () => {
        vi.mocked(analyzeJobFit).mockResolvedValue(mockAnalysis as any);
        const job = makeJob('analyzing');
        const onUpdate = vi.fn();

        renderHook(() =>
            useJobAnalysis(job, [], [], onUpdate, noopError, undefined)
        );

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalled();
        });

        const updatedJob: SavedJob = onUpdate.mock.calls[0][0];
        expect(updatedJob.analysis).toEqual(mockAnalysis);
        expect(updatedJob.status).toBe('saved');
    });

    it('calls showError when analysis fails with a non-abort error', async () => {
        vi.mocked(analyzeJobFit).mockRejectedValue(new Error('AI unavailable'));
        const job = makeJob('analyzing');
        const onError = vi.fn();

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, onError, undefined)
        );

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(
                expect.stringContaining('AI unavailable')
            );
        });
    });

    it('does not call showError when analysis is aborted', async () => {
        vi.mocked(analyzeJobFit).mockRejectedValue(new Error('AbortError'));
        const job = makeJob('analyzing');
        const onError = vi.fn();

        renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, onError, undefined)
        );

        await waitFor(() => expect(analyzeJobFit).toHaveBeenCalled());

        expect(onError).not.toHaveBeenCalled();
    });

    it('clears analysisProgress after successful analysis', async () => {
        vi.mocked(analyzeJobFit).mockResolvedValue(mockAnalysis as any);
        const job = makeJob('analyzing');

        const { result } = renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, undefined)
        );

        await waitFor(() => {
            expect(result.current.analysisProgress).toBeNull();
        });
    });

    it('does not re-trigger analysis after it has already started', async () => {
        vi.mocked(analyzeJobFit).mockResolvedValue(mockAnalysis as any);
        const job = makeJob('analyzing');

        const { rerender } = renderHook(() =>
            useJobAnalysis(job, [], [], noopUpdate, noopError, undefined)
        );

        await waitFor(() => expect(analyzeJobFit).toHaveBeenCalledOnce());

        rerender();

        // Still only called once
        expect(analyzeJobFit).toHaveBeenCalledOnce();
    });
});
