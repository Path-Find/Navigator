import { useState, useEffect, useCallback } from 'react';
import type { SavedJob } from '../../../types';
import { TIME_PERIODS } from '../../../constants';

export const useApplicationNudge = (
    jobs: SavedJob[],
    isLoading: boolean
): { nudgeJob: SavedJob | null; dismissNudge: () => void } => {
    const [nudgeDismissed, setNudgeDismissed] = useState(false);
    const [nudgeJob, setNudgeJob] = useState<SavedJob | null>(null);

    useEffect(() => {
        if (isLoading || jobs.length === 0 || nudgeDismissed) return;

        const now = Date.now();
        const staleJob = jobs.find(j =>
            j.status === 'applied' &&
            (now - j.dateAdded) > TIME_PERIODS.APPLIED_NUDGE_THRESHOLD_MS
        );

        if (staleJob) {
            setNudgeJob(staleJob);
        } else if (!staleJob && nudgeJob) {
            setNudgeJob(null);
        }
    }, [jobs, isLoading, nudgeDismissed, nudgeJob]);

    const dismissNudge = useCallback(() => {
        setNudgeJob(null);
        setNudgeDismissed(true);
    }, []);

    return { nudgeJob, dismissNudge };
};
