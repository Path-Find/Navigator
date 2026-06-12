import { useState, useEffect, useCallback } from 'react';
import type { SavedJob, ResumeProfile, JobAnalysis, TargetJob, CoverLetterCritique } from '../../../types';
import { Logger } from '../../../utils/logger';
import { Storage } from '../../../services/storageService';
import { JobStorage } from '../../../services/storage/jobStorage';
import type { UserTier } from '../../../types/app';
import { generateCoverLetter, generateCoverLetterWithQuality } from '../../../services/geminiService';
import { COVER_LETTER_PROMPTS } from '../../../prompts/coverLetter';
import { ArchetypeUtils } from '../../../utils/archetypeUtils';
import { TRACKING_EVENTS } from '../../../constants';
import { useToast } from '../../../contexts/ToastContext';
import { EventService } from '../../../services/eventService';
import { toTitleCase } from '../../../utils/stringUtils';
import { useNextGen } from '../../../hooks/useNextGen';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdStyleService } from '../../../services/ai/rd/styleService';
import { useUser } from '../../../contexts/UserContext';

interface UseCoverLetterEditorProps {
    job: SavedJob;
    analysis: JobAnalysis;
    bestResume: ResumeProfile | undefined;
    userTier: UserTier;
    targetJobs: TargetJob[];
    onJobUpdate: (job: SavedJob) => void;
}

export const useCoverLetterEditor = ({
    job,
    analysis,
    bestResume,
    userTier,
    targetJobs,
    onJobUpdate
}: UseCoverLetterEditorProps) => {
    const [generating, setGenerating] = useState(false);
    const [showContextInput, setShowContextInput] = useState(false);
    const [copiedState, setCopiedState] = useState<'cl' | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);
    const [comparisonVersions, setComparisonVersions] = useState<{ text: string; promptVersion: string }[] | null>(null);
    const [localJob, setLocalJob] = useState(job);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState(0);
    const isGenerating = generating;
    const { showError } = useToast();
    const isNextGen = useNextGen();
    const { user } = useUser();

    // Sync with parent when job prop changes
    useEffect(() => {
        setLocalJob(job);
    }, [job]);

    const handleCopy = useCallback(async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedState('cl');
        setTimeout(() => setCopiedState(null), 2000);
    }, []);

    const handleUpdateContext = useCallback(async (value: string) => {
        const updated = { ...localJob, contextNotes: value };
        setLocalJob(updated);
        onJobUpdate(updated);
        try {
            await Storage.updateJob(updated);
        } catch {
            showError('Failed to save context notes');
        }
    }, [localJob, onJobUpdate, showError]);

    const handleGenerateCoverLetter = useCallback(async (critiqueContext?: string) => {
        if (!bestResume) {
            showError("Please upload a resume first.");
            return;
        }

        setGenerating(true);
        setAnalysisProgress("Generating cover letter...");
        try {
            // Build a focused job context: distilled signal upfront, short raw excerpt for tone.
            // This replaces dumping the full 12k-char raw JD into the prompt.
            const d = analysis.distilledJob;
            const distilledLines = [
                `Role: ${toTitleCase(d.roleTitle)} at ${toTitleCase(d.companyName)}`,
                d.keySkills?.length ? `Key Skills Required: ${d.keySkills.join(', ')}` : '',
                d.coreResponsibilities?.length
                    ? `Core Responsibilities:\n${d.coreResponsibilities.map(r => `- ${r}`).join('\n')}`
                    : '',
            ].filter(Boolean).join('\n');
            const rawExcerpt = (analysis.cleanedDescription || localJob.description || '').substring(0, 2000);
            const textToUse = `${distilledLines}\n\n---\n${rawExcerpt}`;

            let finalContext = localJob.contextNotes;
            let instructions = analysis.coverLetterTailoringInstructions || analysis.tailoringInstructions || [];

            if (critiqueContext) {
                finalContext = critiqueContext;
                instructions = [...instructions, "CRITIQUE_FIX"];
            }

            // Inject fit level so the prompt can calibrate framing
            const score = analysis.compatibilityScore ?? 0;
            const fitNote = score < 50
                ? `[FIT LEVEL: Low (${score}/100). Use a learning-trajectory framing — acknowledge the gap, lead with transferable skills and genuine interest. Do not overstate credentials.]`
                : score < 70
                ? `[FIT LEVEL: Moderate (${score}/100). Emphasize the strongest direct connections; be specific about what transfers and what will be learned on the job.]`
                : `[FIT LEVEL: Strong (${score}/100). Lead with the most compelling direct evidence; avoid generic language.]`;
            finalContext = finalContext ? `${fitNote}\n${finalContext}` : fitNote;

            // Trajectory Context
            let trajectoryContext = '';
            if (targetJobs.length > 0) {
                const mainGoal = targetJobs[0];
                const completedCount = mainGoal.roadmap?.filter((m: any) => m.status === 'completed').length || 0;
                const totalCount = mainGoal.roadmap?.length || 0;

                trajectoryContext = `I am currently pursuing a career pivot / growth path towards: ${mainGoal.title}.`;
                if (totalCount > 0) {
                    trajectoryContext += ` I have completed ${completedCount} out of ${totalCount} milestones in my 12 - month professional roadmap, including ${mainGoal.roadmap?.filter((m: any) => m.status === 'completed').map((m: any) => m.title).join(', ')}.`;
                }
            }

            // Historical Application Pattern (Archetypes)
            const allJobs = await JobStorage.getJobs();
            const archetypes = ArchetypeUtils.calculateArchetypes(allJobs);
            if (archetypes.length > 0) {
                const archetypesContext = `My established application pattern shows I am primarily targeting: ${archetypes.map((a: any) => a.name).join(', ')}.`;
                trajectoryContext = trajectoryContext ? `${trajectoryContext} ${archetypesContext}` : archetypesContext;
            }

            // Filter resume to only blocks the analysis flagged as relevant.
            // Always keep the summary block. Falls back to full resume if no recommendations.
            const recommendedIds = new Set(analysis.recommendedBlockIds ?? []);
            const focusedResume = recommendedIds.size > 0
                ? { ...bestResume, blocks: bestResume.blocks.filter(b => b.type === 'summary' || recommendedIds.has(b.id)) }
                : bestResume;

            const isPro = ['pro', 'admin', 'tester'].includes(userTier);
            const canonicalTitle = analysis.distilledJob?.canonicalTitle;

            // Phase 3: Personalized Style Distillation
            let personalizedStyle = undefined;
            if (isNextGen && user) {
                setAnalysisProgress("Generating...");
                personalizedStyle = await RdStyleService.getPersonalizedStyle(user.id, 'cover_letter') || undefined;
            }

            const isComparisonTriggered = !critiqueContext && isPro && Math.random() < 0.1;

            if (isComparisonTriggered) {
                setAnalysisProgress("Generating...");
                const variants = Object.keys(COVER_LETTER_PROMPTS.COVER_LETTER.VARIANTS).slice(0, 2);

                const results = await Promise.all(variants.map(v =>
                    generateCoverLetter(textToUse, focusedResume, instructions || [], finalContext, v, trajectoryContext, localJob.id, canonicalTitle, personalizedStyle)
                ));

                setComparisonVersions(results);
                return;
            }

            if (isPro) {
                const result = await generateCoverLetterWithQuality(
                    textToUse,
                    focusedResume,
                    instructions,
                    userTier,
                    finalContext,
                    (msg: string, step?: number, total?: number) => {
                        setAnalysisProgress(msg);
                        setGenerationStatus(msg);
                        if (step && total) {
                            setGenerationProgress(Math.round((step / total) * 100));
                        }
                    },
                    trajectoryContext,
                    localJob.id,
                    canonicalTitle,
                    personalizedStyle
                );

                const updated = {
                    ...localJob,
                    coverLetter: result.text,
                    initialCoverLetter: result.text,
                    promptVersion: result.promptVersion,
                    coverLetterCritique: result.critique ? {
                        decision: result.decision as CoverLetterCritique['decision'],
                        feedback: result.critique.feedback,
                        strengths: result.critique.strengths
                    } : {
                        decision: result.decision as CoverLetterCritique['decision'],
                        feedback: [],
                        strengths: []
                    },
                };

                await Storage.updateJob(updated);
                setLocalJob(updated);
                onJobUpdate(updated);
                EventService.trackUsage(TRACKING_EVENTS.COVER_LETTERS);

                Logger.log(`[Pro] Cover letter generated with decision: ${result.decision} (${result.attempts} attempts)`);

                if (isNextGen && user) {
                    RdFeedbackService.captureSignal(user.id, {
                        roleModelId: canonicalTitle,
                        signalType: 'implicit_usage',
                        context: 'cover_letter',
                        inputPromptVersion: result.promptVersion,
                        outputContent: { text: result.text, decision: result.decision }
                    });
                }
            } else {
                const { text: letter, promptVersion } = await generateCoverLetter(
                    textToUse,
                    focusedResume,
                    instructions,
                    finalContext,
                    undefined,
                    trajectoryContext,
                    localJob.id,
                    canonicalTitle
                );

                const updated = {
                    ...localJob,
                    coverLetter: letter,
                    initialCoverLetter: letter,
                    promptVersion: promptVersion,
                    coverLetterCritique: undefined
                };

                await Storage.updateJob(updated);
                setLocalJob(updated);
                onJobUpdate(updated);
                EventService.trackUsage(TRACKING_EVENTS.COVER_LETTERS);
            }
        } catch (e) {
            console.error(e);
            showError(`Failed to generate cover letter: ${(e as Error).message}`);
        } finally {
            setGenerating(false);
            setAnalysisProgress(null);
            setGenerationStatus(null);
            setGenerationProgress(0);
        }
    }, [bestResume, analysis, localJob, targetJobs, userTier, onJobUpdate, showError, isNextGen, user]);

    const handleSelectVariant = useCallback(async (variant: { text: string; promptVersion: string }) => {
        const other = comparisonVersions?.find(v => v.promptVersion !== variant.promptVersion);

        const updated = {
            ...localJob,
            coverLetter: variant.text,
            initialCoverLetter: variant.text,
            promptVersion: variant.promptVersion
        };

        setLocalJob(updated);
        onJobUpdate(updated);
        setComparisonVersions(null);
        try {
            await Storage.updateJob(updated);
        } catch {
            showError('Failed to save selected variant');
        }

        Storage.submitFeedback(localJob.id, 1, `ab_test_pick:${variant.promptVersion}_vs_${other?.promptVersion || 'none'}`);

        if (isNextGen && user) {
            // Log the Winner
            RdFeedbackService.captureSignal(user.id, {
                roleModelId: analysis.distilledJob?.canonicalTitle,
                signalType: 'explicit_approval',
                context: 'cover_letter',
                inputPromptVersion: variant.promptVersion,
                outputContent: variant.text,
                impactScore: 3, // Choice is a stronger signal than just a save
                metadata: { ab_test: true, comparison_variant: other?.promptVersion }
            });

            // Log the Loser (implicit distance)
            if (other) {
                RdFeedbackService.captureSignal(user.id, {
                    roleModelId: analysis.distilledJob?.canonicalTitle,
                    signalType: 'explicit_correction',
                    context: 'cover_letter',
                    inputPromptVersion: other.promptVersion,
                    outputContent: other.text,
                    userCorrection: variant.text, // The winner is effectively the "correction" of the loser
                    impactScore: -1,
                    metadata: { ab_test_loss: true, winner: variant.promptVersion }
                });
            }
        }
    }, [isNextGen, user, analysis, comparisonVersions, localJob, onJobUpdate, showError]);

    const handleRejectVariants = useCallback(() => {
        setComparisonVersions(null);
        setGenerating(false);
        setAnalysisProgress(null);
    }, []);

    const handleEditCoverLetter = useCallback(async (newText: string) => {
        if (newText !== localJob.coverLetter) {
            const updated = { ...localJob, coverLetter: newText };
            setLocalJob(updated);
            onJobUpdate(updated);
            try {
                await Storage.updateJob(updated);

                if (isNextGen && user && localJob.coverLetter) {
                    RdFeedbackService.captureSignal(user.id, {
                        roleModelId: analysis.distilledJob?.canonicalTitle,
                        signalType: 'explicit_correction',
                        context: 'cover_letter',
                        inputPromptVersion: localJob.promptVersion,
                        outputContent: localJob.initialCoverLetter || localJob.coverLetter,
                        userCorrection: newText,
                        impactScore: 2 // Manual edit implies the AI was close but needed refinement
                    });
                }
            } catch {
                showError('Failed to save cover letter edits');
            }
        }
    }, [localJob, onJobUpdate, showError, isNextGen, user, analysis]);

    // Auto-Generate on Mount if no letter exists
    useEffect(() => {
        if (!localJob.coverLetter && !generating && !localJob.coverLetterCritique && bestResume) {
            handleGenerateCoverLetter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bestResume, !!localJob.coverLetter, !!localJob.coverLetterCritique]);

    return {
        generating,
        showContextInput,
        setShowContextInput,
        copiedState,
        analysisProgress,
        comparisonVersions,
        localJob,
        handleCopy,
        handleUpdateContext,
        handleGenerateCoverLetter,
        handleSelectVariant,
        handleRejectVariants,
        handleEditCoverLetter,
        generationStatus,
        generationProgress,
        isGenerating
    };
};
