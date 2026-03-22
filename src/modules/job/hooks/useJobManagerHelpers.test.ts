import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadInitialJobsAndUsage } from './useJobManagerHelpers';
import { Storage } from '../../../services/storageService';
import { getUsageStats } from '../../../services/usageLimits';
import type { SavedJob } from '../../../types';

vi.mock('../../../services/storageService', () => ({
    Storage: {
        syncLocalToCloud: vi.fn(),
        getJobs: vi.fn(),
    },
}));

vi.mock('../../../services/usageLimits', () => ({
    getUsageStats: vi.fn(),
}));

const mockJob = (id: string): SavedJob => ({
    id,
    company: 'Acme',
    position: 'Developer',
    description: 'A job',
    status: 'saved',
    dateAdded: Date.now(),
    resumeId: 'resume-1',
});

describe('loadInitialJobsAndUsage', () => {
    const onShowError = vi.fn();
    const onShowInfo = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns jobs and stats for a logged-in user', async () => {
        const jobs = [mockJob('job-1'), mockJob('job-2')];
        const stats = { tier: 'pro', todayAnalyses: 1, analysisLimit: 100 } as any;

        vi.mocked(Storage.syncLocalToCloud).mockResolvedValue(undefined);
        vi.mocked(Storage.getJobs).mockResolvedValue(jobs);
        vi.mocked(getUsageStats).mockResolvedValue(stats);

        const result = await loadInitialJobsAndUsage({
            userId: 'user-123',
            canSyncToCloud: true,
            onShowError,
            onShowInfo,
        });

        expect(result.jobs).toEqual(jobs);
        expect(result.stats).toEqual(stats);
        expect(Storage.syncLocalToCloud).toHaveBeenCalled();
    });

    it('skips sync and stats for a logged-out user', async () => {
        const jobs = [mockJob('job-1')];

        vi.mocked(Storage.getJobs).mockResolvedValue(jobs);

        const result = await loadInitialJobsAndUsage({
            userId: null,
            canSyncToCloud: false,
            onShowError,
            onShowInfo,
        });

        expect(result.jobs).toEqual(jobs);
        expect(result.stats).toBeUndefined();
        expect(Storage.syncLocalToCloud).not.toHaveBeenCalled();
        expect(getUsageStats).not.toHaveBeenCalled();
    });

    it('shows error and continues when cloud sync fails', async () => {
        vi.mocked(Storage.syncLocalToCloud).mockRejectedValue(new Error('Network error'));
        vi.mocked(Storage.getJobs).mockResolvedValue([]);
        vi.mocked(getUsageStats).mockResolvedValue({ tier: 'free' } as any);

        const result = await loadInitialJobsAndUsage({
            userId: 'user-123',
            canSyncToCloud: true,
            onShowError,
            onShowInfo,
        });

        expect(onShowError).toHaveBeenCalledWith(expect.stringContaining('Cloud Sync Error'));
        expect(result.jobs).toEqual([]);
    });

    it('shows info banner when stats come back as fallback', async () => {
        vi.mocked(Storage.syncLocalToCloud).mockResolvedValue(undefined);
        vi.mocked(Storage.getJobs).mockResolvedValue([]);
        vi.mocked(getUsageStats).mockResolvedValue({ tier: 'free', isFallback: true } as any);

        await loadInitialJobsAndUsage({
            userId: 'user-123',
            canSyncToCloud: true,
            onShowError,
            onShowInfo,
        });

        expect(onShowInfo).toHaveBeenCalledWith(expect.stringContaining('offline mode'));
    });

    it('shows error and returns empty state on fatal failure', async () => {
        vi.mocked(Storage.syncLocalToCloud).mockResolvedValue(undefined);
        vi.mocked(Storage.getJobs).mockRejectedValue(new Error('Fatal DB error'));

        const result = await loadInitialJobsAndUsage({
            userId: 'user-123',
            canSyncToCloud: true,
            onShowError,
            onShowInfo,
        });

        expect(onShowError).toHaveBeenCalledWith(expect.stringContaining('Failed to load'));
        expect(result.jobs).toEqual([]);
        expect(result.stats).toBeUndefined();
    });

    it('returns undefined stats when getUsageStats throws', async () => {
        vi.mocked(Storage.syncLocalToCloud).mockResolvedValue(undefined);
        vi.mocked(Storage.getJobs).mockResolvedValue([]);
        vi.mocked(getUsageStats).mockRejectedValue(new Error('Stats error'));

        const result = await loadInitialJobsAndUsage({
            userId: 'user-123',
            canSyncToCloud: true,
            onShowError,
            onShowInfo,
        });

        expect(result.stats).toBeUndefined();
    });
});
