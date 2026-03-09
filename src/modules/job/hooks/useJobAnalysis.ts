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
    const [analysisProgress, setAnalysisProgress] = useState<string | null>(null);
    const hasStartedAnalysis = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const performAnalysis = useCallback(async () => {
        if (!job) return;

        // Abort previous
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setAnalysisProgress("Preparing");
        try {
            if (onAnalyzeJob) {
                await onAnalyzeJob(job);
            } else {
                let transcript: Transcript | null = null;
                const savedTranscript = LocalStorage.get(STORAGE_KEYS.TRANSCRIPT_CACHE);
                if (savedTranscript) {
                    try { transcript = JSON.parse(savedTranscript); } catch (e) { console.error(e); }
                }

                // Phase 2 Integration: Trajectory Context
                let trajectoryContext = '';
                if (isNextGen && user) {
                    if (signal.aborted) throw new Error("AbortError");
                    setAnalysisProgress("Mapping Trajectory");
                    const trajectory = await RdTrajectoryService.getTrajectoryProjection(user.id, job.position);
                    if (trajectory) {
                        trajectoryContext = `DIRECTION: ${trajectory.heading}\nPATH: ${trajectory.archetypeShift.from} -> ${trajectory.archetypeShift.to}\nGAPS: ${trajectory.trajectoryGap}`;
                    }
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
            if ((err as Error).message === 'AbortError') return;
            setAnalysisProgress(null);
            showError("Analysis failed: " + (err as Error).message);
        } finally {
            if (abortControllerRef.current?.signal === signal) abortControllerRef.current = null;
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
    }, [job?.status, job?.analysis, performAnalysis, job?.id]);

    return {
        analysisProgress,
        performAnalysis
    };
};
