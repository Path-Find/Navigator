import React from 'react';
import { Sparkles, Zap, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import type { JobFeedItem } from '../../../types';

interface JobFeedCardProps {
    job: JobFeedItem;
    processingId: string | null;
    onAction: (job: JobFeedItem) => void;
    onSave?: (id: string) => void;
}

export const JobFeedCard: React.FC<JobFeedCardProps> = ({ job, processingId, onAction, onSave }) => {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-neutral-500/5 transition-all duration-300 group relative overflow-hidden">
            {job.isNew && (
                <div className="absolute top-0 right-0 bg-neutral-500 text-white text-[10px] font-bold px-4 py-2 rounded-bl-2xl shadow-sm z-10">
                    NEW
                </div>
            )}

            <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl
                    ${job.source === 'email' ? 'bg-neutral-50 text-neutral-600 dark:bg-neutral-900/20' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}
                `}>
                    {job.company.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-neutral-600 transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{job.company}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                                <span>•</span>
                                <span>{new Date(job.postedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                        {job.matchScore && (
                            <div className="bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-400 px-2 py-1 rounded-lg text-sm font-bold border border-neutral-100 dark:border-neutral-800/50 flex items-center gap-1 shrink-0 animate-in fade-in duration-300">
                                <Sparkles className="w-3 h-3" />
                                {job.matchScore}% Match
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <button
                            onClick={() => onAction(job)}
                            disabled={processingId === job.id}
                            className="flex-1 bg-neutral-600 hover:bg-neutral-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {processingId === job.id ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Apply
                                </>
                            )}
                        </button>

                        {job.source === 'email' && onSave && (
                            <button
                                onClick={() => onSave(job.id)}
                                className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 rounded-xl transition-colors"
                                title="Save to History"
                            >
                                <Bookmark className="w-5 h-5" />
                            </button>
                        )}

                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition-colors flex items-center gap-2"
                        >
                            <span>View</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
