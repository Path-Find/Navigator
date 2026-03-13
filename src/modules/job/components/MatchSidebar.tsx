import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { toSentenceCase } from '../../../utils/stringUtils';
import { getScoreLabel, getScoreColorClasses } from '../utils/jobUtils';
import type { SavedJob } from '../types';
import type { ModalType, ModalData } from '../../../contexts/ModalContext';

interface MatchSidebarProps {
    job: SavedJob;
    analysisProgress: string | null;
    userTier: string | undefined;
    openModal: (type: ModalType, data?: ModalData | null) => void;
}

export const MatchSidebar: React.FC<MatchSidebarProps> = ({
    job,
    analysisProgress,
    userTier,
    openModal
}) => {
    const analysis = job.analysis;

    if (job.status === 'analyzing' || analysisProgress) {
        return (
            <Card variant="premium" className="p-8 border-accent-primary/10 shadow-indigo-500/10">
                <div className="animate-pulse space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/3"></div>
                        <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-1/4"></div>
                    </div>
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full w-full"></div>
                    <div className="pt-6 space-y-3">
                        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2"></div>
                        <div className="h-24 bg-neutral-50 dark:bg-neutral-900 rounded-3xl"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="premium" className="p-8 border-accent-primary/10 shadow-indigo-500/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-neutral-400">Match Evaluation</h3>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border shadow-sm ${getScoreColorClasses(analysis?.compatibilityScore)}`}>
                    {analysisProgress ? 'Processing...' : getScoreLabel(analysis?.compatibilityScore)}
                </div>
            </div>

            <div className="relative h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full p-0.5 border border-neutral-200/50 dark:border-white/5 mb-8">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis?.compatibilityScore || 0}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-accent-primary-hex to-accent-secondary-hex relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </motion.div>
            </div>

            <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800/50">
                <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2 text-sm text-indigo-500 dark:text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" /> Professional Insight
                </h3>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-bold bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-[2rem] border border-neutral-100 dark:border-white/5 shadow-inner">
                    {toSentenceCase(analysis?.reasoning || "Analysis needed")}
                </div>
            </div>

            {userTier === 'free' && analysis?.compatibilityScore != null && (
                <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/50">
                    <button
                        onClick={() => openModal('UPGRADE', { initialView: 'compare' })}
                        className="w-full group flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-500/20 dark:hover:to-purple-500/20 transition-all"
                    >
                        <div className="text-left">
                            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                {analysis.compatibilityScore >= 75
                                    ? "Strong match — tailor your resume to close it."
                                    : analysis.compatibilityScore >= 50
                                        ? "You're close. See exactly what's holding you back."
                                        : "There's a gap. Find out precisely what to close."}
                            </div>
                            <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 mt-0.5 uppercase tracking-widest">Unlock with Plus</div>
                        </div>
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}
        </Card>
    );
};
