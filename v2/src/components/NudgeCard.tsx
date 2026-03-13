import React from 'react';
import { Sparkles, CheckCircle2, XCircle, Ghost, Clock, X } from 'lucide-react';
import type { SavedJob } from '../types';

interface NudgeCardProps {
    job: SavedJob;
    onUpdateStatus: (status: 'interview' | 'rejected' | 'ghosted') => void;
    onDismiss: () => void;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({ job, onUpdateStatus, onDismiss }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-100/50 dark:shadow-none overflow-hidden">
                {/* Decorative background gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />

                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl shrink-0">
                        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                            Checking in on <span className="text-indigo-600 dark:text-indigo-400">{job.company}</span>
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
                            It's been a few weeks since you generated that application. Any news?
                            <br className="hidden md:block" />
                            <span className="opacity-75 text-xs">(Helping us track this improves your future recommendations!)</span>
                        </p>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <button
                                onClick={() => onUpdateStatus('interview')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full transition-colors border border-green-200 dark:border-green-900/50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Got an Interview!
                            </button>

                            <button
                                onClick={() => onUpdateStatus('rejected')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold rounded-full transition-colors border border-red-200 dark:border-red-900/50"
                            >
                                <XCircle className="w-4 h-4" />
                                Rejected
                            </button>

                            <button
                                onClick={() => onUpdateStatus('ghosted')}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm font-semibold rounded-full transition-colors border border-neutral-200 dark:border-neutral-700"
                            >
                                <Ghost className="w-4 h-4" />
                                Ghosted
                            </button>

                            <button
                                onClick={onDismiss}
                                className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-sm font-medium transition-colors"
                            >
                                <Clock className="w-4 h-4" />
                                Still Waiting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
