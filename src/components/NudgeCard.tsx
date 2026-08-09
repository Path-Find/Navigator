import React from 'react';
import { Sparkles, CheckCircle2, Ghost, Clock, X, ShieldAlert, Briefcase } from 'lucide-react';
import type { SavedJob } from '../types';

interface NudgeCardProps {
    job: SavedJob;
    onUpdateStatus: (status: 'interview' | 'offer' | 'rejected' | 'ghosted') => void;
    onDismiss: () => void;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({ job, onUpdateStatus, onDismiss }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
                className="card-premium p-6 sm:p-7 overflow-hidden group"
                role="region"
                aria-label={`Application status reminder for ${job.company}`}
            >
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
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                Any news from <span className="text-indigo-600 dark:text-indigo-400">{job.company}</span>?
                            </h2>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20 w-fit mx-auto md:mx-0">
                                Navigator reminder
                            </span>
                        </div>
                        
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-2xl font-medium">
                            Updating your status keeps your job hunt organized and helps Navigator learn which application patterns are working, so future job guidance and cover letters can become more useful.
                        </p>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                            <button
                                onClick={() => onUpdateStatus('interview')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Got an Interview
                            </button>

                            <button
                                onClick={() => onUpdateStatus('offer')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <Briefcase className="w-3.5 h-3.5" />
                                Got an Offer
                            </button>

                            <button
                                onClick={() => onUpdateStatus('rejected')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Rejected
                            </button>

                            <button
                                onClick={() => onUpdateStatus('ghosted')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5"
                            >
                                <Ghost className="w-3.5 h-3.5" />
                                Ghosted
                            </button>

                            <button
                                onClick={onDismiss}
                                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-500/10 hover:bg-neutral-100 dark:hover:bg-neutral-500/20 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-500/20 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
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
