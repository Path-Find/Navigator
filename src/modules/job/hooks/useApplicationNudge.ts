import { useState, useEffect, useCallback } from 'react';
import type { SavedJob } from '../../../types';
import { TIME_PERIODS } from '../../../constants';

const STORAGE_KEY = 'navigator:nudge-dismissed-ids';

const getDismissedIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const saveDismissedId = (id: string): void => {
    try {
        const ids = getDismissedIds();
        ids.add(id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
        // ignore storage errors
    }
};

export const useApplicationNudge = (
    jobs: SavedJob[],
    isLoading: boolean
): { nudgeJob: SavedJob | null; dismissNudge: () => void } => {
    const [nudgeJob, setNudgeJob] = useState<SavedJob | null>(null);

    useEffect(() => {
        if (isLoading || jobs.length === 0) return;

        const dismissedIds = getDismissedIds();
        const now = Date.now();
        const staleJob = jobs.find(j =>
            j.status === 'applied' &&
            (now - j.dateAdded) > TIME_PERIODS.APPLIED_NUDGE_THRESHOLD_MS &&
            !dismissedIds.has(j.id)
        );

        const currentNudge = staleJob ?? null;
        queueMicrotask(() => {
            setNudgeJob(prev => prev?.id === currentNudge?.id ? prev : currentNudge);
        });
    }, [jobs, isLoading]);

    const dismissNudge = useCallback(() => {
        if (nudgeJob) saveDismissedId(nudgeJob.id);
        setNudgeJob(null);
    }, [nudgeJob]);

    return { nudgeJob, dismissNudge };
};
