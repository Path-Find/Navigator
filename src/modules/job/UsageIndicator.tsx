import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UsageStats } from '../../services/usageLimits';
import { ROUTES } from '../../constants';

interface UsageIndicatorProps {
    usageStats?: UsageStats | null;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ usageStats }) => {
    const navigate = useNavigate();

    if (!usageStats || usageStats.tier !== 'free') return null;

    const used = usageStats.lifetimeAnalyses;
    const limit = usageStats.analysisLimit;
    const remaining = limit - used;
    const isLast = remaining === 1;

    const dotColor = isLast ? 'bg-amber-500' : 'bg-blue-500';
    const containerColor = isLast
        ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-800/50'
        : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-800/50';
    const label = isLast ? '1 trial analysis remaining' : `Trial: ${used} of ${limit} analyses used`;

    return (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm animate-in fade-in duration-500">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${containerColor}`}>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 ${dotColor} rounded-full animate-pulse`} />
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                        {label}
                    </span>
                </div>
                {used >= 2 && (
                    <button
                        onClick={() => navigate(ROUTES.PLANS)}
                        className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        Upgrade
                    </button>
                )}
            </div>
        </div>
    );
};
