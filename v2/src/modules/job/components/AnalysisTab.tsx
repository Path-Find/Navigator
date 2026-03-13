import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, AlertCircle, XCircle, Target, BookOpen } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { toTitleCase, toSentenceCase } from '../../../utils/stringUtils';
import { useJobAnalysis } from '../hooks/useJobAnalysis';
import { useJobContext } from '../context/JobContext';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { useSkillContext } from '../../skills/context/SkillContext';
import { useToast } from '../../../contexts/ToastContext';
import type { SavedJob } from '../types';
import type { ModalType, ModalData } from '../../../contexts/ModalContext';

interface AnalysisTabProps {
    job: SavedJob;
    userTier: string | undefined;
    openModal: (type: ModalType, data?: ModalData | null) => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
    job,
    userTier,
    openModal
}) => {
    const { handleUpdateJob: onUpdateJob, handleAnalyzeJob } = useJobContext();
    const { resumes } = useResumeContext();
    const { skills: userSkills } = useSkillContext();
    const { showError } = useToast();

    const { analysisProgress } = useJobAnalysis(
        job,
        resumes,
        userSkills,
        onUpdateJob,
        showError,
        (j) => handleAnalyzeJob(j, { resumes, skills: userSkills })
    );

    const analysis = job.analysis;

    return (
        <div className="space-y-8 pb-8">
            <div className="pb-8 border-b border-neutral-100 dark:border-white/5">
                <h4 className="text-sm font-black text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2 normal-case">
                    <Sparkles className="w-4 h-4" /> Match Insights
                </h4>
                <div className="flex flex-wrap gap-2">
                    {(analysis?.distilledJob?.keySkills || []).map((skill: string, i: number) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-accent-primary/30 transition-all cursor-default flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                            {toTitleCase(skill)}
                        </motion.span>
                    ))}
                    {(!analysis?.distilledJob?.keySkills || analysis.distilledJob.keySkills.length === 0) && (
                        <span className="text-sm font-medium text-neutral-400 italic">No specific competencies extracted.</span>
                    )}
                </div>
            </div>

            {(analysis?.strengths?.length || 0) > 0 || (analysis?.weaknesses?.length || 0) > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card variant="glass" className="p-6 border-emerald-500/10 bg-emerald-500/5">
                        <h4 className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Core Strengths
                        </h4>
                        <div className="space-y-3">
                            {analysis?.strengths?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card variant="glass" className="p-6 border-rose-500/10 bg-rose-500/5">
                        <h4 className="text-[10px] font-black tracking-widest text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" /> Identified Gaps
                        </h4>
                        {(() => {
                            const weaknesses = analysis?.weaknesses ?? [];
                            const isGated = userTier === 'free' && weaknesses.length > 1;
                            const visible = isGated ? weaknesses.slice(0, 1) : weaknesses;
                            const hidden = isGated ? weaknesses.slice(1) : [];
                            return (
                                <div className="space-y-3">
                                    {visible.map((w, i) => (
                                        <div key={i} className="flex gap-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                            <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                            {w}
                                        </div>
                                    ))}
                                    {hidden.length > 0 && (
                                        <div className="relative mt-1">
                                            <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                                                {hidden.map((w, i) => (
                                                    <div key={i} className="flex gap-3 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                        <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                                        {w}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button
                                                    onClick={() => openModal('UPGRADE', { initialView: 'compare' })}
                                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                                                >
                                                    +{hidden.length} more — Unlock
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </Card>
                </div>
            ) : null}

            {job.status === 'analyzing' || analysisProgress ? (
                <Card variant="premium" className="p-6 animate-pulse border-accent-primary/10">
                    <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/4 mb-10"></div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="h-20 bg-neutral-50 dark:bg-neutral-800 rounded-[1.5rem]"></div>
                        <div className="h-20 bg-neutral-50 dark:bg-neutral-800 rounded-[1.5rem]"></div>
                    </div>
                </Card>
            ) : (
                analysis?.distilledJob?.requiredSkills && analysis.distilledJob.requiredSkills.length > 0 && (
                    <Card variant="premium" className="p-6 border-indigo-500/10 shadow-indigo-500/5">
                        <h4 className="font-black text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2 text-sm normal-case">
                            <Target className="w-4 h-4" /> Skill Match
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {analysis.distilledJob.requiredSkills.map((req: { name: string; level: 'learning' | 'comfortable' | 'expert' }, i: number) => {
                                const mySkill = userSkills.find(s => s.name.toLowerCase().includes(req.name.toLowerCase()));
                                const levels: Record<string, number> = { learning: 1, comfortable: 2, expert: 3 };
                                const isMatch = !!(mySkill && levels[mySkill.proficiency] >= levels[req.level]);
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-white/5 rounded-[1.5rem] shadow-sm hover:border-accent-primary/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isMatch ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                                {isMatch ? <ShieldCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-neutral-900 dark:text-white block">{toTitleCase(req.name)}</span>
                                                <span className="text-[9px] font-bold text-neutral-400">Required: {toTitleCase(req.level)}</span>
                                            </div>
                                        </div>
                                        {mySkill && (
                                            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                                My Level: {toTitleCase(mySkill.proficiency)}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>
                ))}

            <Card variant="glass" className="p-6 border-neutral-200/50 dark:border-white/5">
                <h4 className="font-black text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2 text-sm normal-case">
                    <BookOpen className="w-4 h-4" /> Core Responsibilities
                </h4>
                <div className="grid gap-4">
                    {(analysis?.distilledJob?.coreResponsibilities || []).map((resp: string, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-5 text-neutral-700 dark:text-neutral-300 text-sm font-bold leading-relaxed p-6 bg-neutral-50/50 dark:bg-neutral-800/40 rounded-[1.5rem] border border-neutral-50 dark:border-white/5"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 mt-2 shrink-0" />
                            {toSentenceCase(resp)}
                        </motion.div>
                    ))}
                    {job.status !== 'analyzing' && !analysisProgress && (!analysis?.distilledJob?.coreResponsibilities || analysis.distilledJob.coreResponsibilities.length === 0) && (
                        <div className="text-sm font-medium text-neutral-400 italic text-center py-10">No core responsibilities extracted.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};
