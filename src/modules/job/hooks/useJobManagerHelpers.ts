import { Storage } from '../../../services/storageService';
import { getUsageStats, type UsageStats } from '../../../services/usageLimits';
import type { SavedJob } from '../../../types';

export interface InitialLoadContext {
    userId: string | null;
    canSyncToCloud: boolean;
    onShowError: (msg: string) => void;
    onShowInfo: (msg: string) => void;
}

export const loadInitialJobsAndUsage = async (
    context: InitialLoadContext
): Promise<{ jobs: SavedJob[]; stats: UsageStats | undefined }> => {
    const { userId, canSyncToCloud, onShowError, onShowInfo } = context;

    try {
        if (canSyncToCloud) {
            await Storage.syncLocalToCloud().catch(err => {
                console.error("Initial sync failed:", err);
                onShowError("Cloud Sync Error: Some items haven't been backed up. Check your connection.");
            });
        }

        const [loadedJobs, stats] = await Promise.all([
            Storage.getJobs(),
            userId
                ? getUsageStats(userId).catch(err => {
                    console.error("Usage stats fetch failed:", err);
                    return undefined;
                })
                : Promise.resolve<UsageStats | undefined>(undefined)
        ]);

        if (stats?.isFallback) {
            onShowInfo("Unable to verify current usage. Using restricted offline mode.");
        }

        return {
            jobs: loadedJobs ?? [],
            stats
        };
    } catch (err) {
        console.error("Fatal error during initial load:", err);
        onShowError("Failed to load your data. Please check your connection.");
        return { jobs: [], stats: undefined };
    }
};
