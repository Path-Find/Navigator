import { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeJobFit } from '../../../services/geminiService';
import { Storage } from '../../../services/storageService';
import { LocalStorage } from '../../../utils/localStorage';
import { STORAGE_KEYS } from '../../../constants';
import type { SavedJob } from '../types';
import type { ResumeProfile } from '../../resume/types';
import type { CustomSkill } from '../../skills/types';
import type { Transcript } from '../../grad/types';
import { useNextGen } from '../../../hooks/useNextGen';
import { RdTrajectoryService } from '../../../services/ai/rd/trajectoryService';
import { useUser } from '../../../contexts/UserContext';

type AnalysisProgress = string | null;

const createAbortController = (existing: AbortController | null): AbortController => {
    if (existing) existing.abort();
    return new AbortController();
};

const loadTranscriptFromCache = (): Transcript | null => {
    const savedTranscript = LocalStorage.get(STORAGE_KEYS.TRANSCRIPT_CACHE);
    if (!savedTranscript) return null;

    try {
        return JSON.parse(savedTranscript) as Transcript;
    } catch (e) {
        console.error("Failed to parse cached transcript:", e);
        return null;
    }
};

const buildTrajectoryContext = async (
    userId: string,
    jobTitle: string,
    signal: AbortSignal
): Promise<string> => {
    if (signal.aborted) throw new Error("AbortError");

    const trajectory = await RdTrajectoryService.getTrajectoryProjection(userId, jobTitle);
    if (!trajectory) return '';

    return [
        `DIRECTION: ${trajectory.heading}`,
        `PATH: ${trajectory.archetypeShift.from} -> ${trajectory.archetypeShift.to}`,
        `GAPS: ${trajectory.trajectoryGap}`
    ].join('\n');
};

export const useJobAnalysis = (
    job: SavedJob | undefined,
    resumes: ResumeProfile[],
    userSkills: CustomSkill[],
    onUpdateJob: (job: SavedJob) => void,
    showError: (msg: string) => void,
    onAnalyzeJob?: (job: SavedJob) => Promise<SavedJob>
) => {
    const isNextGen = useNextGen();
    const { user } = useUser();
    const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>(null);
    const hasStartedAnalysis = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const performAnalysis = useCallback(async () => {
        if (!job) return;

        const controller = createAbortController(abortControllerRef.current);
        abortControllerRef.current = controller;
        const { signal } = controller;

        setAnalysisProgress("Preparing");

        try {
            if (onAnalyzeJob) {
                await onAnalyzeJob(job);
            } else {
                const transcript = loadTranscriptFromCache();

                let trajectoryContext = '';
                if (isNextGen && user) {
                    setAnalysisProgress("Mapping Trajectory");
                    trajectoryContext = await buildTrajectoryContext(user.id, job.position, signal);
                }

                if (signal.aborted) throw new Error("AbortError");

                const result = await analyzeJobFit(
                    job.description || '',
                    resumes,
                    userSkills,
                    (msg) => setAnalysisProgress(msg),
                    job.id,
                    transcript,
                    trajectoryContext,
                    signal
                );

                const finalJob: SavedJob = { ...job, analysis: result, status: 'saved' as const };
                await Storage.updateJob(finalJob);
                onUpdateJob(finalJob);
            }

            setAnalysisProgress(null);
        } catch (err) {
            const error = err as Error;
            if (error.message === 'AbortError') return;
            setAnalysisProgress(null);
            showError("Analysis failed: " + error.message);
        } finally {
            if (abortControllerRef.current?.signal === signal) {
                abortControllerRef.current = null;
            }
        }
    }, [job, onAnalyzeJob, resumes, userSkills, onUpdateJob, showError, isNextGen, user]);

    useEffect(() => {
        if (!job) return;

        const isHollow = job.status === 'saved' && (!job.analysis || !job.analysis.compatibilityScore);
        if (job.status !== 'analyzing' && !isHollow) {
            hasStartedAnalysis.current = false;
            return;
        }

        if ((job.status === 'analyzing' || isHollow) && !hasStartedAnalysis.current) {
            hasStartedAnalysis.current = true;
            setTimeout(() => performAnalysis(), 0);
        }

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job?.status, job?.analysis, performAnalysis, job?.id]);

    return {
        analysisProgress,
        performAnalysis
    };
};
