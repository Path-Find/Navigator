import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { toSentenceCase } from '../../../utils/stringUtils';
import { getScoreLabel, getScoreColorClasses, SCORE_THRESHOLDS } from '../utils/jobUtils';
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
            <div className="flex items-end justify-between mb-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-neutral-900 dark:text-white">
                        {analysis?.compatibilityScore ?? '—'}
                    </span>
                    <span className="text-xs font-medium text-neutral-400">/ 100</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getScoreColorClasses(analysis?.compatibilityScore)}`}>
                    {analysisProgress ? 'Processing...' : getScoreLabel(analysis?.compatibilityScore)}
                </div>
            </div>

            <div className="relative h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full mb-8">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis?.compatibilityScore || 0}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full relative overflow-hidden ${
                        (analysis?.compatibilityScore ?? 0) >= 80
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : (analysis?.compatibilityScore ?? 0) >= 60
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-rose-400 to-rose-500'
                    }`}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </motion.div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Professional Insight
                </h3>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
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
                                {analysis.compatibilityScore >= SCORE_THRESHOLDS.STRONG
                                    ? "Strong match — tailor your resume to close it."
                                    : analysis.compatibilityScore >= SCORE_THRESHOLDS.FAIR
                                        ? "You're close. See exactly what's holding you back."
                                        : "There's a gap. Find out precisely what to close."}
                            </div>
                            <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 mt-0.5 tracking-wide">Unlock with Plus</div>
                        </div>
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )}
        </Card>
    );
};
