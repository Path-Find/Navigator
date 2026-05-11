import React from 'react';
import { Sparkles, CheckCircle2, Ghost, Clock, X, ShieldAlert } from 'lucide-react';
import type { SavedJob } from '../types';

interface NudgeCardProps {
    job: SavedJob;
    onUpdateStatus: (status: 'interview' | 'rejected' | 'ghosted') => void;
    onDismiss: () => void;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({ job, onUpdateStatus, onDismiss }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="card-premium p-6 sm:p-8 overflow-hidden group">
                {/* Dismiss Button */}
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100/50 dark:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all z-20"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Icon Column */}
                    <div className="shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                            <Sparkles className="w-7 h-7" />
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                Status check: <span className="text-indigo-600 dark:text-indigo-400">{job.company}</span>
                            </h2>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500/60 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10 w-fit mx-auto md:mx-0">
                                Navigator Bot
                            </span>
                        </div>
                        
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-2xl font-medium">
                            Any news on your application? Updating your status keeps your job hunt organized.
                        </p>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                            <button
                                onClick={() => onUpdateStatus('interview')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Got an Interview!
                            </button>

                            <button
                                onClick={() => onUpdateStatus('rejected')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Rejected
                            </button>

                            <button
                                onClick={() => onUpdateStatus('ghosted')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/50 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <Ghost className="w-3.5 h-3.5" />
                                Ghosted
                            </button>

                            <button
                                onClick={onDismiss}
                                className="flex items-center gap-2 px-4 py-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs font-bold transition-colors"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                No update yet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
