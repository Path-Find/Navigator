import React from 'react';
import type { CoverLetterCritique } from '../../../../types';

interface CoverLetterCritiqueInfoProps {
    critique: CoverLetterCritique;
}

export const CoverLetterCritiqueInfo: React.FC<CoverLetterCritiqueInfoProps> = ({ critique }) => {
    if (!critique?.decision) return null;

    const isStrong = critique.decision === 'Exceptional' || critique.decision === 'Strong';
    const isAverage = critique.decision === 'Average';

    return (
        <div className={`px-8 py-4 border-b dark:border-white/5 ${isStrong ? 'bg-emerald-50/50 dark:bg-emerald-500/5' :
            isAverage ? 'bg-blue-50/50 dark:bg-blue-500/5' :
                'bg-amber-50/50 dark:bg-amber-500/5'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isStrong ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                    <span className="text-xs font-black text-neutral-900 dark:text-white">
                        Candidate Match: {critique.decision}
                    </span>
                </div>
            </div>
        </div>
    );
};
