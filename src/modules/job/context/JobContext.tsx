import React, { createContext, useContext } from 'react';
import type { SavedJob, AppState } from '../../../types';
import { type UsageStats, type UsageLimitResult } from '../../../services/usageLimits';

import { useJobManager } from '../hooks/useJobManager';

// Define the shape of the context
interface JobContextType {
    jobs: SavedJob[];
    activeJobId: string | null;
    activeJob: SavedJob | undefined;
    isLoading: boolean;
    usageStats: UsageStats;
    showUpgradeModal: boolean;
    upgradeModalData: UsageLimitResult | null;
    nudgeJob: SavedJob | null;
    dismissNudge: () => void;

    // Actions
    setActiveJobId: (id: string | null) => void;
    handleUpdateJob: (job: SavedJob) => Promise<void>;
    handleJobCreated: (job: SavedJob) => Promise<void>;
    handleDraftApplication: (url: string) => Promise<void>;
    handleDeleteJob: (id: string) => void;
    handleAnalyzeJob: (job: SavedJob, contextState: { resumes: AppState['resumes'], skills: AppState['skills'] }) => Promise<SavedJob>;
    handlePromoteFromFeed: (jobId: string) => Promise<void>;
    handleSaveFromFeed: (jobId: string) => Promise<void>;
    closeUpgradeModal: () => void;
}

export const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobContext = () => {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error('useJobContext must be used within a JobProvider');
    }
    return context;
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        jobs, activeJobId, activeJob, isLoading, usageStats,
        upgradeModalData, nudgeJob, setActiveJobId, handleUpdateJob,
        handleJobCreated, handleDraftApplication, handleDeleteJob,
        handleAnalyzeJob, handlePromoteFromFeed, handleSaveFromFeed,
        closeUpgradeModal, dismissNudge
    } = useJobManager();

    const value = React.useMemo(() => ({
        jobs, activeJobId, activeJob, isLoading, usageStats,
        upgradeModalData, nudgeJob, setActiveJobId, handleUpdateJob,
        handleJobCreated, handleDraftApplication, handleDeleteJob,
        handleAnalyzeJob, handlePromoteFromFeed, handleSaveFromFeed,
        closeUpgradeModal, dismissNudge,
        showUpgradeModal: !!upgradeModalData,
    }), [
        jobs, activeJobId, activeJob, isLoading, usageStats,
        upgradeModalData, nudgeJob, setActiveJobId, handleUpdateJob,
        handleJobCreated, handleDraftApplication, handleDeleteJob,
        handleAnalyzeJob, handlePromoteFromFeed, handleSaveFromFeed,
        closeUpgradeModal, dismissNudge
    ]);

    return (
        <JobContext.Provider value={value}>
            {children}
        </JobContext.Provider>
    );
};
