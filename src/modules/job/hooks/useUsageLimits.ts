import { useState, useCallback } from 'react';
import { checkAnalysisLimit, getUsageStats, type UsageStats, type UsageLimitResult } from '../../../services/usageLimits';

export const DEFAULT_USAGE_STATS = (isAdmin: boolean): UsageStats => ({
    tier: isAdmin ? 'admin' : 'free',
    todayAnalyses: 0,
    weekAnalyses: 0,
    lifetimeAnalyses: 0,
    todayEmails: 0,
    monthInterviews: 0,
    roleModelCount: 0,
    totalAICalls: 0,
    analysisLimit: isAdmin ? Infinity : 3,
    analysisPeriod: 'lifetime',
    emailLimit: 0,
    roleModelLimit: isAdmin ? Infinity : 0,
    interviewLimit: isAdmin ? Infinity : 0,
    isFallback: false
});

export const useUsageLimits = (userId: string | null, isAdmin: boolean) => {
    const [usageStats, setUsageStats] = useState<UsageStats>(DEFAULT_USAGE_STATS(isAdmin));
    const [upgradeModalData, setUpgradeModalData] = useState<UsageLimitResult | null>(null);

    const checkAndConsumeAnalysis = useCallback(async () => {
        if (!userId || isAdmin) return { allowed: true } as UsageLimitResult;

        const limitCheck = await checkAnalysisLimit(userId);
        if (!limitCheck.allowed) {
            setUpgradeModalData(limitCheck);
        }
        return limitCheck;
    }, [userId, isAdmin]);

    const refreshUsageStats = useCallback(async () => {
        if (!userId || isAdmin) return;
        const stats = await getUsageStats(userId);
        setUsageStats(stats);
    }, [userId, isAdmin]);

    const closeUpgradeModal = useCallback(() => {
        setUpgradeModalData(null);
    }, []);

    return {
        usageStats,
        setUsageStats,
        upgradeModalData,
        setUpgradeModalData,
        checkAndConsumeAnalysis,
        refreshUsageStats,
        closeUpgradeModal
    };
};
