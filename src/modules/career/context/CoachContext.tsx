import React, { createContext, useContext } from 'react';
import type { RoleModelProfile, TargetJob, Transcript, ResumeProfile, CustomSkill } from '../../../types';

import { useCoachManager } from '../hooks/useCoachManager';

interface CoachContextType {
    roleModels: RoleModelProfile[];
    targetJobs: TargetJob[];
    transcript: Transcript | null;
    activeAnalysisIds: Set<string>;
    isLoading: boolean;

    // Actions
    handleAddRoleModel: (file: File) => Promise<void>;
    handleDeleteRoleModel: (id: string) => Promise<void>;
    handleRunGapAnalysis: (targetJobId: string, contextState: { resumes: ResumeProfile[], skills: CustomSkill[] }) => Promise<void>;
    handleGenerateRoadmap: (targetJobId: string) => Promise<void>;
    handleToggleMilestone: (targetJobId: string, milestoneId: string) => Promise<void>;
    handleTargetJobCreated: (url: string) => Promise<void>;
    handleEmulateRoleModel: (roleModelId: string) => Promise<void>;
    handleUpdateTargetJob: (targetJob: TargetJob) => Promise<void>;
    setTranscript: (transcript: Transcript | null) => void;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

export const useCoachContext = () => {
    const context = useContext(CoachContext);
    if (!context) {
        throw new Error('useCoachContext must be used within a CoachProvider');
    }
    return context;
};

export const CoachProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const coachManager = useCoachManager();

    return (
        <CoachContext.Provider value={coachManager}>
            {children}
        </CoachContext.Provider>
    );
};
