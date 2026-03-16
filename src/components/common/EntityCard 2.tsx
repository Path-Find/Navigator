import React from 'react';
import { Building, ArrowRight, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface EntityCardProps {
    title: string;
    subtitle: string;
    icon?: React.ReactNode;
    iconChar?: string;
    score?: number;
    badge?: React.ReactNode;
    date?: string;
    status?: 'analyzing' | 'error' | 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted';
    onClick?: () => void;
    onDelete?: () => void;
    onAction?: () => void;
    description?: string;
    tags?: string[];
    variant?: 'job' | 'role-model';
}

export const EntityCard: React.FC<EntityCardProps> = ({
    title,
    subtitle,
    icon,
    iconChar,
    score,
    badge,
    date,
    status,
    onClick,
    onDelete,
    onAction,
    description,
    tags,
    variant = 'job'
}) => {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-600 bg-green-50 border-green-100';
        if (s >= 70) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        if (s >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const isAnalyzing = status === 'analyzing';
    const isError = status === 'error';

    return (
        <div
            onClick={() => !isAnalyzing && onClick?.()}
            className={`group relative bg-white dark:bg-neutral-900 rounded-[2rem] p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all duration-300 flex flex-col h-full
                ${isAnalyzing
                    ? 'opacity-90 border-indigo-100 dark:border-indigo-900/30'
                    : isError
                        ? 'border-red-100 bg-red-50/10 hover:border-red-200 hover:shadow-red-500/5 cursor-pointer'
                        : 'hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
        >
            {/* Card Header: Icon & Status */}
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold
                    ${isAnalyzing
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 animate-pulse'
                        : isError
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600'
                            : variant === 'role-model'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                                : 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-600'
                    }`}>
                    {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        isError ? <AlertCircle className="w-6 h-6" /> :
                            icon ? icon : (iconChar || title.charAt(0).toUpperCase())}
                </div>

                {!isAnalyzing && !isError && (
                    <div className="flex flex-col items-end gap-1">
                        {score !== undefined && (
                            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(score)}`}>
                                {score}% Match
                            </div>
                        )}
                        {badge}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="flex-1 min-h-[5rem]">
                {isAnalyzing ? (
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">Analyzing...</h3>
                        <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                        <div className="h-4 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse delay-75" />
                    </div>
                ) : isError ? (
                    <div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-1">Analysis failed</h3>
                        <p className="text-sm text-red-600 dark:text-red-500/80 leading-relaxed mb-4">
                            We couldn't automatically process this job. Click to try manual entry.
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction?.(); }}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl text-xs font-black transition-all active:scale-95"
                        >
                            RETRY MANUALLY
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className={`text-lg font-bold text-neutral-900 dark:text-white transition-colors line-clamp-2 mb-1 ${variant === 'role-model' ? 'group-hover:text-emerald-600' : 'group-hover:text-indigo-600'}`} title={title}>
                            {title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">
                            {variant === 'job' && <Building className="w-4 h-4" />}
                            <span className="truncate">{subtitle}</span>
                        </div>

                        {description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                                {description}
                            </p>
                        )}

                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-[10px] font-medium border border-neutral-200/50 dark:border-neutral-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Card Footer */}
            <div className="pt-4 mt-auto border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                    {date}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className={`p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all ${variant === 'role-model' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {!isAnalyzing && (
                        <div className={`p-2 rounded-xl transition-colors ${isError ? 'text-red-400 bg-red-50 dark:bg-red-900/20' :
                            variant === 'role-model' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40' :
                                'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40'}`}>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
