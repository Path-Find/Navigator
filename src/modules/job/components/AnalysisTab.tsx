import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { SkillPill } from '../../../components/ui/SkillPill';
import { toTitleCase, toSentenceCase } from '../../../utils/stringUtils';
import { SCORE_THRESHOLDS } from '../utils/jobUtils';
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
            {analysis?.reasoning && (
                <Card variant="premium" className="p-6 border-accent-primary/10 shadow-indigo-500/10">
                    <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-4">Insight</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                        {toSentenceCase(analysis.reasoning)}
                    </p>
                    {userTier === 'free' && analysis.compatibilityScore != null && (
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
                                                ? "You're close. See which requirements to address."
                                                : "Review the main requirements to address."}
                                    </div>
                                    <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 mt-0.5 tracking-wide">Available with Plus</div>
                                </div>
                                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}
                </Card>
            )}

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
                        <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-4">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.distilledJob.requiredSkills.map((req: { name: string; level: 'learning' | 'comfortable' | 'expert' }, i: number) => {
                                const mySkill = userSkills.find(s => s.name.toLowerCase().includes(req.name.toLowerCase()));
                                return (
                                    <SkillPill
                                        key={i}
                                        name={toTitleCase(req.name)}
                                        proficiency={mySkill?.proficiency}
                                    />
                                );
                            })}
                        </div>
                    </Card>
                )
            )}

            {(analysis?.strengths?.length || 0) > 0 || (analysis?.weaknesses?.length || 0) > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card variant="glass" className="p-6">
                        <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-4">Strengths</h4>
                        <div className="space-y-3">
                            {analysis?.strengths?.map((s, i) => (
                                <div key={i} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card variant="glass" className="p-6">
                        <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-4">Gaps</h4>
                        {(() => {
                            const weaknesses = analysis?.weaknesses ?? [];
                            const isGated = userTier === 'free' && weaknesses.length > 1;
                            const visible = isGated ? weaknesses.slice(0, 1) : weaknesses;
                            const hidden = isGated ? weaknesses.slice(1) : [];
                            return (
                                <div className="space-y-3">
                                    {visible.map((w, i) => (
                                        <div key={i} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                            {w}
                                        </div>
                                    ))}
                                    {hidden.length > 0 && (
                                        <div className="relative mt-1">
                                            <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                                                {hidden.map((w, i) => (
                                                    <div key={i} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                                        {w}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <button
                                                    onClick={() => openModal('UPGRADE', { initialView: 'compare' })}
                                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                                                >
                                                    +{hidden.length} more — See with Plus
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

            <Card variant="glass" className="p-6">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-6">Competencies</h4>
                <div className="flex flex-wrap gap-2">
                    {(analysis?.distilledJob?.keySkills || []).map((skill: string, i: number) => (
                        <SkillPill key={i} name={toTitleCase(skill)} variant="indigo" />
                    ))}
                    {(!analysis?.distilledJob?.keySkills || analysis.distilledJob.keySkills.length === 0) && (
                        <span className="text-sm font-medium text-neutral-400 italic">No specific competencies extracted.</span>
                    )}
                </div>
            </Card>

            <Card variant="glass" className="p-6 border-neutral-200/50 dark:border-white/5">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-4">Responsibilities</h4>
                <div className="space-y-3">
                    {(analysis?.distilledJob?.coreResponsibilities || []).map((resp: string, i: number) => (
                        <div key={i} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-1.5 shrink-0" />
                            {toSentenceCase(resp)}
                        </div>
                    ))}
                    {job.status !== 'analyzing' && !analysisProgress && (!analysis?.distilledJob?.coreResponsibilities || analysis.distilledJob.coreResponsibilities.length === 0) && (
                        <div className="text-sm font-medium text-neutral-400 italic text-center py-10">No core responsibilities extracted.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};
