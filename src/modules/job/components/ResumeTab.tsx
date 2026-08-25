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
import { SECTIONS } from '../../resume/constants';
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
            <div className="space-y-8 p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                {userTier === 'free' && (
                    <div className="flex items-start justify-between gap-4 px-6 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-500/20 bg-neutral-50/70 dark:bg-neutral-950/20">
                        <div className="flex items-start gap-3 min-w-0">
                            <Wand2 className="w-4 h-4 text-neutral-500 shrink-0" />
                            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Use Plus or Pro to rewrite resume bullets for this specific role.
                            </p>
                        </div>
                        <Button
                            onClick={() => openModal('UPGRADE', { initialView: 'upgrade' })}
                            variant="accent"
                            size="sm"
                            className="shrink-0 text-xs shadow-md shadow-neutral-500/20"
                        >
                            Upgrade
                        </Button>
                    </div>
                )}
                {userTier !== 'free' && (
                    <section>
                        <div className="flex justify-between items-start mb-6 border-b border-neutral-100 dark:border-neutral-800/50 pb-4">
                            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Professional Summary</h3>
                            <Button
                                onClick={handleGenerateSummary}
                                disabled={generatingSummary}
                                variant="subtle"
                                size="xs"
                                className="text-[9px]"
                                icon={generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            >
                                {job.tailoredSummary ? 'Regenerate' : 'Generate Summary'}
                            </Button>
                        </div>
                        {job.tailoredSummary ? (
                            <div className="relative group">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium border-l-2 border-neutral-500/20 pl-6 py-1">
                                    {job.tailoredSummary}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 italic">Generate a high-impact professional summary meticulously tailored for this role.</p>
                        )}
                    </section>
                )}

                {(() => {
                    const recommendedBlocks = bestResume?.blocks.filter((b: ExperienceBlock) =>
                        analysis?.recommendedBlockIds ? analysis.recommendedBlockIds.includes(b.id) : b.isVisible
                    ) || [];

                    const renderBlock = (block: ExperienceBlock, showTailor: boolean) => {
                        const tailoredBullets = job.tailoredResumes?.[block.id];
                        const isTailoring = tailoringBlockId === block.id;
                        return (
                            <div key={block.id} className="space-y-4">
                                <div className="group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">{block.title}</h4>
                                            {(block.organization || block.dateRange) && (
                                                <div className="text-[11px] text-neutral-500 font-bold mt-0.5">
                                                    {block.organization} <span className="mx-2 text-neutral-300">•</span> {block.dateRange}
                                                </div>
                                            )}
                                        </div>
                                        {showTailor && (
                                            <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {tailoredBullets && (
                                                    <Button
                                                        onClick={() => handleResetBlock(block.id)}
                                                        variant="ghost"
                                                        size="xs"
                                                        className="h-7 text-[10px] bg-neutral-50 dark:bg-neutral-800"
                                                        title="Reset to original"
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                                {userTier !== 'free' && (
                                                    <Button
                                                        onClick={() => handleHyperTailor(block)}
                                                        disabled={isTailoring || !!bulkTailoringProgress || (job.tailorCounts?.[block.id] || 0) >= RESUME_TAILORING.MAX_TAILORS_PER_BLOCK}
                                                        variant="subtle"
                                                        size="xs"
                                                        className="text-[9px] h-7"
                                                        icon={isTailoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                    >
                                                        {isTailoring ? 'Rewriting' : tailoredBullets ? 'Retry' : 'Tailor'}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <ul className="space-y-3">
                                        {(tailoredBullets || block.bullets).map((bullet: string, i: number) => (
                                            <li
                                                key={i}
                                                className={`relative pl-6 text-sm leading-relaxed ${tailoredBullets ? 'text-neutral-800 dark:text-neutral-200 font-bold' : 'text-neutral-600 dark:text-neutral-400 font-medium'}`}
                                            >
                                                <div className={`absolute left-0 top-2 w-1.5 h-1.5 rounded-full ${tailoredBullets ? 'bg-neutral-50 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    };

                    // Use the same SECTIONS definition as the resume editor — single source of truth
                    const tailorableSections = new Set(['work', 'volunteer', 'project', 'other']);
                    const allTailorableBlocks = recommendedBlocks.filter((b: ExperienceBlock) => tailorableSections.has(b.type));

                    return (
                        <>
                            {SECTIONS.filter(s => s.type !== 'summary' && s.type !== 'skill').map(section => {
                                const sectionBlocks = recommendedBlocks.filter((b: ExperienceBlock) => b.type === section.type);
                                if (sectionBlocks.length === 0) return null;
                                const canTailor = tailorableSections.has(section.type);
                                const isFirstTailorable = canTailor && SECTIONS.find(s => tailorableSections.has(s.type) && recommendedBlocks.some((b: ExperienceBlock) => b.type === s.type))?.type === section.type;

                                return (
                                    <section key={section.type}>
                                        <div className="flex justify-between items-start mb-8 border-b border-neutral-100 dark:border-neutral-800/50 pb-4">
                                            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{section.label}</h3>
                                            {isFirstTailorable && (
                                                <div className="flex items-start gap-2">
                                                    {userTier !== 'free' && (
                                                        <Button
                                                            onClick={() => handleBulkTailor(allTailorableBlocks)}
                                                            disabled={!!bulkTailoringProgress || !!tailoringBlockId}
                                                            variant="subtle"
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
                                                        variant="subtle"
                                                        size="xs"
                                                        className="text-[9px]"
                                                        icon={generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
                                                    >
                                                        Copy Full
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-10">
                                            {sectionBlocks.map((block: ExperienceBlock) => renderBlock(block, canTailor))}
                                        </div>
                                    </section>
                                );
                            })}
                        </>
                    );
                })()}
            </div>
        </div>
    );
};
