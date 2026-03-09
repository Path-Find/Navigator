import React from 'react';
import { Loader2, Sparkles, Wand2, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { RESUME_TAILORING } from '../../../constants';
import { useResumeTailoring } from '../hooks/useResumeTailoring';
import { useSummaryGeneration } from '../hooks/useSummaryGeneration';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { getBestResume } from '../utils/jobUtils';
import type { SavedJob } from '../types';
import type { ExperienceBlock } from '../../resume/types';
import type { ModalType, ModalData } from '../../../contexts/ModalContext';

interface ResumeTabProps {
    job: SavedJob;
    onUpdateJob: (job: SavedJob) => void;
    userTier: string | undefined;
    openModal: (type: ModalType, data?: ModalData | null) => void;
    showSuccess: (msg: string) => void;
    showError: (msg: string) => void;
    generating: boolean;
    handleCopyResume: () => void;
}

export const ResumeTab: React.FC<ResumeTabProps> = ({
    job,
    onUpdateJob,
    userTier,
    openModal,
    showSuccess,
    showError,
    generating,
    handleCopyResume
}) => {
    const { resumes } = useResumeContext();
    const analysis = job.analysis;
    const bestResume = getBestResume(resumes, analysis);

    const {
        tailoringBlockId,
        bulkTailoringProgress,
        handleHyperTailor,
        handleBulkTailor,
        handleResetBlock
    } = useResumeTailoring(job, onUpdateJob, showError, showSuccess);

    const {
        generatingSummary,
        handleGenerateSummary
    } = useSummaryGeneration(job, resumes, onUpdateJob, showError);

    return (
        <div className="pb-8">
            <div className="space-y-12 p-8 md:p-12 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                {userTier === 'free' && (
                    <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/20">
                        <div className="flex items-center gap-3 min-w-0">
                            <Wand2 className="w-4 h-4 text-indigo-500 shrink-0" />
                            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Upgrade to rewrite every bullet for this specific role — this is what the trial was building toward.
                            </p>
                        </div>
                        <button
                            onClick={() => openModal('UPGRADE', { initialView: 'upgrade' })}
                            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                        >
                            Upgrade
                        </button>
                    </div>
                )}
                {userTier !== 'free' && (
                    <section>
                        <div className="flex justify-between items-center mb-6 border-b border-neutral-100 dark:border-neutral-800/50 pb-4">
                            <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                <Wand2 className="w-3.5 h-3.5" /> Professional Summary
                            </h3>
                            <Button
                                onClick={handleGenerateSummary}
                                disabled={generatingSummary}
                                variant="secondary"
                                size="xs"
                                className="text-[9px]"
                                icon={generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            >
                                {job.tailoredSummary ? 'Redraft' : 'Draft Tailored Summary'}
                            </Button>
                        </div>
                        {job.tailoredSummary ? (
                            <div className="relative group">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium italic border-l-2 border-indigo-500/20 pl-6 py-1">
                                    {job.tailoredSummary}
                                </p>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(job.tailoredSummary || ''); showSuccess('Summary copied!'); }}
                                    className="mt-4 text-[9px] font-black tracking-widest text-neutral-400 hover:text-indigo-500 flex items-center gap-2 transition-all"
                                >
                                    <Copy className="w-3 h-3" /> Copy optimized summary
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 italic">Generate a high-impact professional summary meticulously tailored for this role.</p>
                        )}
                    </section>
                )}

                <section>
                    <div className="flex justify-between items-center mb-8 border-b border-neutral-100 dark:border-neutral-800/50 pb-4">
                        <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400">Experience & Achievements</h3>
                        <div className="flex items-center gap-2">
                            {userTier !== 'free' && (
                                <Button
                                    onClick={() => {
                                        const blocks = bestResume?.blocks.filter((b: ExperienceBlock) => analysis?.recommendedBlockIds ? analysis.recommendedBlockIds.includes(b.id) : b.isVisible) || [];
                                        handleBulkTailor(blocks);
                                    }}
                                    disabled={!!bulkTailoringProgress || !!tailoringBlockId}
                                    variant="secondary"
                                    size="xs"
                                    className="text-[9px]"
                                    icon={bulkTailoringProgress ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                >
                                    {bulkTailoringProgress ? `Tailoring ${bulkTailoringProgress.current}/${bulkTailoringProgress.total}` : 'Tailor All'}
                                </Button>
                            )}
                            <Button
                                onClick={handleCopyResume}
                                disabled={generating}
                                variant="secondary"
                                size="xs"
                                className="text-[9px]"
                                icon={generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
                            >
                                Copy Full
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {bestResume?.blocks
                            .filter((b: ExperienceBlock) => analysis?.recommendedBlockIds ? analysis.recommendedBlockIds.includes(b.id) : b.isVisible)
                            .map((block: ExperienceBlock) => {
                                const tailoredBullets = job.tailoredResumes?.[block.id];
                                const isTailoring = tailoringBlockId === block.id;
                                return (
                                    <div key={block.id} className="space-y-4">
                                        <div className="group relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">{block.title}</h4>
                                                    <div className="text-[11px] text-neutral-500 font-bold mt-0.5">
                                                        {block.organization} <span className="mx-2 text-neutral-300">•</span> {block.dateRange}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {tailoredBullets && (
                                                        <button
                                                            onClick={() => handleResetBlock(block.id)}
                                                            className="text-[9px] font-bold text-neutral-400 hover:text-neutral-600 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded-md transition-all"
                                                            title="Reset to original"
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                    {userTier !== 'free' && (
                                                        <Button
                                                            onClick={() => handleHyperTailor(block)}
                                                            disabled={isTailoring || !!bulkTailoringProgress || (job.tailorCounts?.[block.id] || 0) >= RESUME_TAILORING.MAX_TAILORS_PER_BLOCK}
                                                            variant={tailoredBullets ? "secondary" : "accent"}
                                                            size="xs"
                                                            className="text-[9px] h-7"
                                                            icon={isTailoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                        >
                                                            {isTailoring ? 'Rewriting' : tailoredBullets ? 'Retry' : 'Hyper-Tailor'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <ul className="space-y-3">
                                                {(tailoredBullets || block.bullets).map((bullet: string, i: number) => (
                                                    <li
                                                        key={i}
                                                        className={`relative pl-6 text-sm leading-relaxed ${tailoredBullets ? 'text-neutral-800 dark:text-neutral-200 font-bold' : 'text-neutral-600 dark:text-neutral-400 font-medium'}`}
                                                    >
                                                        <div className={`absolute left-0 top-2 w-1.5 h-1.5 rounded-full ${tailoredBullets ? 'bg-indigo-50 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </section>
            </div>
        </div>
    );
};
