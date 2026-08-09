import { useState, useCallback } from 'react';
import { formatParsedJobContext, generateTailoredSummary } from '../../../services/geminiService';
import { Storage } from '../../../services/storageService';
import { getJobRelevantResume } from '../utils/jobUtils';
import type { SavedJob } from '../types';
import type { ResumeProfile } from '../../resume/types';

export const useSummaryGeneration = (
    job: SavedJob,
    resumes: ResumeProfile[],
    onUpdateJob: (job: SavedJob) => void,
    showError: (msg: string) => void
) => {
    const [generatingSummary, setGeneratingSummary] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        const analysis = job.analysis;
        if (!analysis || generatingSummary) return;

        setGeneratingSummary(true);
        try {
            const textToUse = formatParsedJobContext(
                analysis.distilledJob,
                analysis.selectedAcademicEvidence || []
            );
            const relevantResume = getJobRelevantResume(resumes, analysis);
            const summary = await generateTailoredSummary(
                textToUse,
                relevantResume ? [relevantResume] : [],
                job.id
            );

            const updatedJob: SavedJob = { ...job, tailoredSummary: summary };
            await Storage.updateJob(updatedJob);
            onUpdateJob(updatedJob);
        } catch (err) {
            showError("Summary generation failed: " + (err as Error).message);
        } finally {
            setGeneratingSummary(false);
        }
    }, [job, resumes, generatingSummary, onUpdateJob, showError]);

    return {
        generatingSummary,
        handleGenerateSummary
    };
};
