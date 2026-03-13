import React from 'react';
import { Users, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card } from '../../../../components/ui/Card';
import type { CoverLetterCritique } from '../../../../types';

interface CoverLetterReviewCardProps {
    critique?: CoverLetterCritique | string;
    generating: boolean;
    handleRunCritique: () => void;
}

export const CoverLetterReviewCard: React.FC<CoverLetterReviewCardProps> = ({
    critique,
    generating,
    handleRunCritique
}) => {
    return (
        <Card variant="glass" className="p-8 border-neutral-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-neutral-900 dark:text-white flex items-center gap-3 text-sm tracking-tight">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Blind AI Review
                </h4>
                {critique && (
                    <button
                        onClick={handleRunCritique}
                        disabled={generating}
                        className="text-[10px] font-black text-indigo-600 hover:underline"
                    >
                        Rerun Review
                    </button>
                )}
            </div>

            {critique && typeof critique !== 'string' ? (
                <div className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm">
                            <span className="text-[10px] font-black text-neutral-400 block mb-2">Hiring Decision</span>
                            <span className={`text-2xl font-black ${(critique.decision === 'Exceptional' || critique.decision === 'Strong') ? 'text-emerald-600 dark:text-emerald-400' :
                                critique.decision === 'Average' ? 'text-blue-600 dark:text-blue-400' :
                                    'text-rose-600 dark:text-rose-400'
                                }`}>
                                {critique.decision}
                            </span>
                        </div>
                        <div className="p-6 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm">
                            <span className="text-[10px] font-black text-neutral-400 block mb-2">Professionalism</span>
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">High Quality</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[11px] font-black text-neutral-400 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" /> Performance Analysis
                        </span>
                        <div className="grid gap-3">
                            {critique.feedback.map((f: string, i: number) => (
                                <div key={i} className="text-xs font-bold leading-relaxed text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 mt-1.5 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : critique && typeof critique === 'string' ? (
                <div className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed p-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl">
                    <ReactMarkdown>{critique}</ReactMarkdown>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto leading-relaxed">
                        Get an objective review from a hiring perspective to verify your draft before sending.
                    </p>
                    <button
                        onClick={handleRunCritique}
                        disabled={generating}
                        className="px-8 py-3.5 bg-neutral-900 dark:bg-neutral-800 text-white dark:text-neutral-200 rounded-2xl text-[10px] font-black hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all shadow-lg active:scale-95"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Run Performance Review'}
                    </button>
                </div>
            )}
        </Card>
    );
};
