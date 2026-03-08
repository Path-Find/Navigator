import React, { createContext, useContext } from 'react';
<<<<<<< HEAD
import type { RoleModelProfile, TargetJob, Transcript, ResumeProfile, CustomSkill } from '../../../types';
=======
import type { RoleModelProfile, TargetJob, AppState } from '../../../types';
>>>>>>> origin/jules-fix-resume-any-16146333382224821113

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
<<<<<<< HEAD
    handleRunGapAnalysis: (targetJobId: string, contextState: { resumes: ResumeProfile[], skills: CustomSkill[] }) => Promise<void>;
=======
    handleRunGapAnalysis: (targetJobId: string, contextState: { resumes: AppState['resumes'], skills: AppState['skills'] }) => Promise<void>;
>>>>>>> origin/jules-fix-resume-any-16146333382224821113
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
