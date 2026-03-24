import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyFeedStateProps {
    searchTerm: string;
    filterHighMatch: boolean;
    filterClosingSoon: boolean;
    onResetFilters?: () => void;
}

export const EmptyFeedState: React.FC<EmptyFeedStateProps> = ({
    searchTerm,
    filterHighMatch,
    filterClosingSoon,
    onResetFilters
}) => {
    const hasActiveFilters = searchTerm || filterHighMatch || filterClosingSoon;

    return (
        <div className="card-premium p-12 text-center space-y-8 max-w-2xl mx-auto shadow-2xl shadow-indigo-500/5 border-neutral-100 dark:border-white/5">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Sparkles className="w-10 h-10 text-neutral-300 dark:text-neutral-600 animate-pulse" />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">No matches found</h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    {hasActiveFilters
                        ? 'No jobs match your current filters. Try broadening your search or resetting categories.'
                        : 'Your personalized feed will populate as new opportunities are discovered through our smart scrapers.'}
                </p>
            </div>

            {hasActiveFilters && onResetFilters && (
                <button
                    onClick={onResetFilters}
                    className="btn-premium px-8 py-2.5 rounded-2xl text-sm font-bold tracking-wide"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );
};
