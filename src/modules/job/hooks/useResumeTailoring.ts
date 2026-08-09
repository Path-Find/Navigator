import { useState, useCallback } from 'react';
import { formatParsedJobContext, tailorExperienceBlock } from '../../../services/geminiService';
import { Storage } from '../../../services/storageService';
import { RESUME_TAILORING } from '../../../constants';
import type { SavedJob } from '../types';
import type { ExperienceBlock } from '../../resume/types';
import { useNextGen } from '../../../hooks/useNextGen';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdEmbeddingService } from '../../../services/ai/rd/embeddingService';
import { useUser } from '../../../contexts/UserContext';

export const useResumeTailoring = (
    job: SavedJob,
    onUpdateJob: (job: SavedJob) => void,
    showError: (msg: string) => void,
    showSuccess: (msg: string) => void
) => {
    const [tailoringBlockId, setTailoringBlockId] = useState<string | null>(null);
    const [bulkTailoringProgress, setBulkTailoringProgress] = useState<{ current: number; total: number } | null>(null);
    const isNextGen = useNextGen();
    const { user } = useUser();

    const handleHyperTailor = useCallback(async (block: ExperienceBlock) => {
        const analysis = job.analysis;
        if (!analysis || tailoringBlockId) return;

        const currentCount = job.tailorCounts?.[block.id] || 0;
        if (currentCount >= RESUME_TAILORING.MAX_TAILORS_PER_BLOCK) {
            showError(`Limit reached (${RESUME_TAILORING.MAX_TAILORS_PER_BLOCK}/${RESUME_TAILORING.MAX_TAILORS_PER_BLOCK}). Save this job or use another block.`);
            return;
        }

        setTailoringBlockId(block.id);
        try {
            const textToUse = formatParsedJobContext(
                analysis.distilledJob,
                analysis.selectedAcademicEvidence || []
            );
            const instructions = analysis.resumeTailoringInstructions || analysis.tailoringInstructions || [];
            const tailoredBullets = await tailorExperienceBlock(block, textToUse, instructions, job.id);

            const updatedJob: SavedJob = {
                ...job,
                tailoredResumes: {
                    ...(job.tailoredResumes || {}),
                    [block.id]: tailoredBullets
                },
                tailorCounts: {
                    ...(job.tailorCounts || {}),
                    [block.id]: currentCount + 1
                }
            };

            await Storage.updateJob(updatedJob);
            onUpdateJob(updatedJob);

            if (isNextGen && user) {
                RdFeedbackService.captureSignal(user.id, {
                    roleModelId: analysis.distilledJob?.canonicalTitle,
                    signalType: 'explicit_approval',
                    context: 'tailoring',
                    outputContent: block.bullets,
                    userCorrection: tailoredBullets,
                    metadata: { blockId: block.id, job_id: job.id }
                });

                // Phase 2: Professional Latent Space
                // Silently vectorize this tailored block to build the user's trajectory map
                RdEmbeddingService.vectorizeAndStore(
                    user.id,
                    tailoredBullets.join('\n'),
                    'experience_block',
                    block.id
                );
            }
        } catch (err) {
            showError("Tailoring failed: " + (err as Error).message);
        } finally {
            setTailoringBlockId(null);
        }
    }, [job, tailoringBlockId, onUpdateJob, showError, isNextGen, user]);

    const handleBulkTailor = useCallback(async (blocks: ExperienceBlock[]) => {
        const analysis = job.analysis;
        if (!analysis || tailoringBlockId || bulkTailoringProgress) return;

        const untailored = blocks.filter(b => {
            const counts = job.tailorCounts?.[b.id] || 0;
            return !job.tailoredResumes?.[b.id] && counts < RESUME_TAILORING.MAX_TAILORS_PER_BLOCK;
        });

        if (untailored.length === 0) {
            showSuccess("No eligible blocks to tailor (already tailored or limit reached).");
            return;
        }

        setBulkTailoringProgress({ current: 0, total: untailored.length });
        let currentJob = { ...job };

        try {
            for (let i = 0; i < untailored.length; i++) {
                const block = untailored[i];
                const currentCount = currentJob.tailorCounts?.[block.id] || 0;
                setBulkTailoringProgress({ current: i + 1, total: untailored.length });
                setTailoringBlockId(block.id);

                const textToUse = formatParsedJobContext(
                    analysis.distilledJob,
                    analysis.selectedAcademicEvidence || []
                );
                const instructions = analysis.resumeTailoringInstructions || analysis.tailoringInstructions || [];
                const tailoredBullets = await tailorExperienceBlock(block, textToUse, instructions, currentJob.id);

                currentJob = {
                    ...currentJob,
                    tailoredResumes: {
                        ...(currentJob.tailoredResumes || {}),
                        [block.id]: tailoredBullets
                    },
                    tailorCounts: {
                        ...(currentJob.tailorCounts || {}),
                        [block.id]: currentCount + 1
                    }
                };
            }

            await Storage.updateJob(currentJob);
            onUpdateJob(currentJob);
        } catch (err) {
            await Storage.updateJob(currentJob);
            onUpdateJob(currentJob);
            showError("Bulk tailoring stopped: " + (err as Error).message);
        } finally {
            setTailoringBlockId(null);
            setBulkTailoringProgress(null);
        }
    }, [job, tailoringBlockId, bulkTailoringProgress, onUpdateJob, showError, showSuccess]);

    const handleResetBlock = useCallback(async (blockId: string) => {
        if (!job.tailoredResumes?.[blockId]) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [blockId]: _removed, ...remaining } = job.tailoredResumes;
        const updatedJob: SavedJob = {
            ...job,
            tailoredResumes: Object.keys(remaining).length > 0 ? remaining : undefined
        };

        await Storage.updateJob(updatedJob);
        onUpdateJob(updatedJob);
    }, [job, onUpdateJob]);

    return {
        tailoringBlockId,
        bulkTailoringProgress,
        handleHyperTailor,
        handleBulkTailor,
        handleResetBlock
    };
};
