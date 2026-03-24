import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedJob, AppState } from '../../../types';
import { Storage } from '../../../services/storageService';
import { analyzeJobFit } from '../../../services/geminiService';
import { ScraperService } from '../../../services/scraperService';
import type { UsageStats, UsageLimitResult } from '../../../services/usageLimits';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { ROUTES } from '../../../constants';
import { useNextGen } from '../../../hooks/useNextGen';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';

import { useApplicationNudge } from './useApplicationNudge';
import { useUsageLimits } from './useUsageLimits';
import { loadInitialJobsAndUsage } from './useJobManagerHelpers';

export interface UseJobManagerReturn {
    jobs: SavedJob[];
    activeJobId: string | null;
    activeJob: SavedJob | undefined;
    isLoading: boolean;
    usageStats: UsageStats;
    upgradeModalData: UsageLimitResult | null;
    nudgeJob: SavedJob | null;
    setActiveJobId: Dispatch<SetStateAction<string | null>>;
    handleUpdateJob: (updatedJob: SavedJob) => Promise<void>;
    handleJobCreated: (newJob: SavedJob) => Promise<void>;
    handleDraftApplication: (url: string) => Promise<void>;
    handleDeleteJob: (id: string) => void;
    handleAnalyzeJob: (
        job: SavedJob,
        context: { resumes: AppState['resumes']; skills: AppState['skills'] }
    ) => Promise<SavedJob>;
    handlePromoteFromFeed: (jobId: string) => Promise<void>;
    handleSaveFromFeed: (jobId: string) => Promise<void>;
    closeUpgradeModal: () => void;
    checkAndConsumeAnalysis: () => Promise<UsageLimitResult>;
    dismissNudge: () => void;
}

export const useJobManager = (): UseJobManagerReturn => {
    const { user, isAdmin } = useUser();
    const { showInfo, showError } = useToast();
    const isNextGen = useNextGen();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<SavedJob[]>([]);
    const jobsRef = useRef<SavedJob[]>([]);
    useEffect(() => { jobsRef.current = jobs; }, [jobs]);

    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Usage & Limits
    const {
        usageStats,
        setUsageStats,
        upgradeModalData,
        checkAndConsumeAnalysis,
        refreshUsageStats,
        closeUpgradeModal
    } = useUsageLimits(user?.id ?? null, isAdmin);

    // Nudge Logic
    const { nudgeJob, dismissNudge } = useApplicationNudge(jobs, isLoading);

    // Initial Load Path
    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        const run = async () => {
            const { jobs: loadedJobs, stats } = await loadInitialJobsAndUsage({
                userId: user?.id ?? null,
                canSyncToCloud: Boolean(user),
                onShowError: showError,
                onShowInfo: showInfo
            });

            if (!mounted) return;

            if (loadedJobs.length) {
                setJobs(loadedJobs);
            }
            if (stats) {
                setUsageStats(stats);
            }
            setIsLoading(false);
        };

        run();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const activeJob = jobs.find(j => j.id === activeJobId);

    const handleUpdateJob = useCallback(async (updatedJob: SavedJob) => {
        const oldJob = jobsRef.current.find(j => j.id === updatedJob.id);
        const statusChanged = oldJob && oldJob.status !== updatedJob.status;

        // Optimistic update
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));

        try {
            await Storage.updateJob(updatedJob);

            if (isNextGen && user && statusChanged) {
                if (['applied', 'interview', 'offer', 'rejected'].includes(updatedJob.status || '')) {
                    RdFeedbackService.captureOutcome(user.id, updatedJob.id, updatedJob.status!);
                }
            }
        } catch (err) {
            console.error("FAILED TO PERSIST JOB:", err);
            showError("Critical: Failed to save changes.");
        }
    }, [showError, isNextGen, user]);

    const handleAnalyzeJob = useCallback(async (job: SavedJob, { resumes, skills }: { resumes: AppState['resumes'], skills: AppState['skills'] }) => {
        const MAX_DESCRIPTION_CHARS = 25_000;
        let textToAnalyze = job.description || '';

        try {
            if (!textToAnalyze && job.url) {
                const scrapedText = await ScraperService.scrapeJobContent(job.url);
                if (scrapedText) textToAnalyze = scrapedText;
            }

            if (!textToAnalyze) throw new Error("No job description found.");

            if (textToAnalyze.length > MAX_DESCRIPTION_CHARS) {
                textToAnalyze = textToAnalyze.slice(0, MAX_DESCRIPTION_CHARS);
            }

            const analysis = await analyzeJobFit(
                textToAnalyze,
                resumes,
                skills,
                async (msg, step, total) => {
                    const progress = Math.round((step / total) * 100);
                    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress, progressMessage: msg } : j));
                },
                job.id
            );

            const roleTitle = analysis.distilledJob?.roleTitle || job.position;

            const completedJob: SavedJob = {
                ...job,
                description: textToAnalyze,
                status: 'saved' as const,
                analysis,
                position: roleTitle,
                company: analysis.distilledJob?.companyName || job.company,
                roleId: analysis.distilledJob?.canonicalTitle || job.roleId,
                progress: 100,
                progressMessage: 'Analysis complete!'
            };

            await handleUpdateJob(completedJob);
            return completedJob;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
            const failedJob = { ...job, status: 'error' as const, progress: 0, progressMessage: errorMessage };
            await handleUpdateJob(failedJob);
            throw err;
        }
    }, [handleUpdateJob]);

    const handleJobCreated = useCallback(async (newJob: SavedJob) => {
        const limitCheck = await checkAndConsumeAnalysis();
        if (!limitCheck.allowed) return;

        await Storage.addJob(newJob);
        setJobs(prev => {
            const exists = prev.some(j => j.id === newJob.id);
            if (exists) return prev;
            return [newJob, ...prev];
        });
        setActiveJobId(newJob.id);
        navigate(ROUTES.JOB_DETAIL.replace(':id', newJob.id));

        await refreshUsageStats();
    }, [checkAndConsumeAnalysis, refreshUsageStats, navigate]);

    const handleSaveFromFeed = useCallback(async (jobId: string) => {
        const job = jobsRef.current.find(j => j.id === jobId);
        if (!job) return;

        const updatedJob: SavedJob = {
            ...job,
            status: 'saved' as const,
        };

        await Storage.updateJob(updatedJob);
        setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        showInfo("Saved to your history!");
    }, [showInfo]);

    const handlePromoteFromFeed = useCallback(async (jobId: string) => {
        const job = jobsRef.current.find(j => j.id === jobId);
        if (!job) {
            showError("Job not found in local state.");
            return;
        }

        const updatedJob: SavedJob = {
            ...job,
            status: 'analyzing' as const,
        };

        await Storage.updateJob(updatedJob);
        setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        setActiveJobId(jobId);
        navigate(ROUTES.JOB_DETAIL.replace(':id', jobId));
        showInfo("Promoting job alert to application...");
    }, [navigate, showInfo, showError]);

    const handleDraftApplication = useCallback(async (url: string) => {
        const jobId = crypto.randomUUID();
        const now = Date.now();
        const newJob: SavedJob = {
            id: jobId,
            company: '',
            position: 'New Job',
            description: '',
            url,
            resumeId: 'master',
            dateAdded: now,
            updatedAt: now,
            status: 'analyzing' as const,
        };

        await Storage.addJob(newJob);
        setJobs(prev => [newJob, ...prev]);
        setActiveJobId(jobId);
        navigate(ROUTES.JOB_DETAIL.replace(':id', jobId));
        showInfo("Drafting your tailored application...");
    }, [navigate, showInfo]);

    const handleDeleteJob = useCallback((id: string) => {
        Storage.deleteJob(id);
        setJobs(prev => prev.filter(j => j.id !== id));
        setActiveJobId(prev => prev === id ? null : prev);
        navigate(ROUTES.HISTORY);
    }, [navigate]);

    return {
        jobs,
        activeJobId,
        activeJob,
        isLoading,
        usageStats,
        upgradeModalData,
        nudgeJob,
        setActiveJobId,
        handleUpdateJob,
        handleJobCreated,
        handleDraftApplication,
        handleDeleteJob,
        handleAnalyzeJob,
        handlePromoteFromFeed,
        handleSaveFromFeed,
        closeUpgradeModal,
        checkAndConsumeAnalysis,
        dismissNudge
    };
};
