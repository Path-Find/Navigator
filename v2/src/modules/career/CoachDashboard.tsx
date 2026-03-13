import React, { useState } from 'react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { useToast } from '../../contexts/ToastContext';

// Refactored Components
import { CoachHero } from './components/CoachHero';
import { RoleModelSection } from './components/RoleModelSection';
import { GapAnalysisSection } from './components/GapAnalysisSection';
import { RoleModelComparison } from './components/RoleModelComparison';
import { GrowthPage } from './components/GrowthPage';
import { OrgsSection } from './components/OrgsSection';
import { SalaryInsights } from './components/SalaryInsights';
import { useHeadlines } from '../../hooks/useHeadlines';
import { PageHeader } from '../../components/ui/PageHeader';
import type { CoachViewType } from './types';
import { useCoachContext } from './context/CoachContext';
import { useSkillContext } from '../skills/context/SkillContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../constants';
import type { ProfessionalOrg } from '../../types';
import { useUser } from '../../contexts/UserContext';
import { useRoleModelUpload } from './hooks/useRoleModelUpload';

export const CoachDashboard: React.FC = () => {
    const {
        roleModels, targetJobs, transcript, activeAnalysisIds = new Set<string>(),
        handleAddRoleModel: onAddRoleModel,
        handleDeleteRoleModel: onDeleteRoleModel,
        handleRunGapAnalysis: onRunGapAnalysis,
        handleGenerateRoadmap: onGenerateRoadmap,
        handleToggleMilestone: onToggleMilestone,
        handleTargetJobCreated: onAddTargetJob,
        handleEmulateRoleModel: onEmulateRoleModel,
        handleUpdateTargetJob: onUpdateTargetJob
    } = useCoachContext();

    const { isAdmin } = useUser();
    const { skills: userSkills } = useSkillContext();
    const [orgs] = useLocalStorage<ProfessionalOrg[]>(STORAGE_KEYS.ORGS, []);
    const { resumes } = useResumeContext();
    const { currentView, setView: onViewChange } = useGlobalUI();
    const toast = useToast();

    // Cast view safely for the dashboard
    const view = (currentView.startsWith('career') || currentView.startsWith('coach'))
        ? (currentView as CoachViewType)
        : 'coach-home';
    // State
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedRoleModelId, setSelectedRoleModelId] = useState<string | null>(null);
    const [comparisonRoleModelId, setComparisonRoleModelId] = useState<string | null>(null);
    const [url, setUrl] = useState('');
    const [isScrapingUrl, setIsScrapingUrl] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        fileInputRef,
        isUploading,
        handleFiles,
        handleFileChange,
        triggerUpload,
    } = useRoleModelUpload({ onAddRoleModel, toast });

    const activeHeadline = useHeadlines('goal');

    // Handlers
    const handleTargetJobSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim() || isScrapingUrl) return;

        setIsScrapingUrl(true);
        setError(null);

        try {
            await onAddTargetJob(url);
            EventService.trackUsage('coach');
            setUrl('');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save dream job");
        } finally {
            setIsScrapingUrl(false);
        }
    };

    const handleEmulateRoleModel = (roleModelId: string) => {
        onEmulateRoleModel(roleModelId);
        setSelectedRoleModelId(null);
    };

    return (
        <SharedPageLayout maxWidth="full" animate={false} className="relative theme-coach" spacing="hero">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={handleFileChange}
                />

                {/* Ambient Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
                    <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
                </div>

                {view === 'coach-home' && (
                    <PageHeader
                        variant="hero"
                        title={activeHeadline.text}
                        highlight={activeHeadline.highlight}
                        subtitle="Distill career paths into your personalized growth roadmap."
                    />
                )}

                {view === 'coach-home' && (
                    <CoachHero
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        triggerUpload={triggerUpload}
                        handleTargetJobSubmit={handleTargetJobSubmit}
                        url={url}
                        setUrl={setUrl}
                        isScrapingUrl={isScrapingUrl}
                        error={error}
                        setError={setError}
                        roleModels={roleModels}
                        targetJobs={targetJobs}
                        userSkills={userSkills}
                        orgCount={orgs.length}
                        onViewChange={onViewChange}
                    />
                )}

                {
                    view === 'coach-role-models' && (
                        <RoleModelSection
                            roleModels={roleModels}
                            selectedRoleModelId={selectedRoleModelId}
                            setSelectedRoleModelId={setSelectedRoleModelId}
                            isUploading={isUploading}
                            onDeleteRoleModel={onDeleteRoleModel}
                            handleEmulateRoleModel={handleEmulateRoleModel}
                            onUpload={handleFiles}
                        />
                    )
                }

                {view === 'coach-gap-analysis' && (
                    <GapAnalysisSection
                        targetJobs={targetJobs}
                        roleModels={roleModels}
                        transcript={transcript}
                        onUpdateTargetJob={onUpdateTargetJob}
                        onAddTargetJob={onAddTargetJob}
                        onRunGapAnalysis={(id) => onRunGapAnalysis(id, { resumes, skills: userSkills })}
                        onGenerateRoadmap={onGenerateRoadmap}
                        onToggleMilestone={onToggleMilestone}
                        onCompare={(id) => setComparisonRoleModelId(id)}
                        activeAnalysisIds={activeAnalysisIds}
                    />
                )}

                {
                    view === 'career-growth' && (
                        <GrowthPage
                            targetJobs={targetJobs}
                            onToggleMilestone={onToggleMilestone}
                            onViewChange={onViewChange}
                        />
                    )
                }

                {view === 'career-orgs' && (
                    <OrgsSection />
                )}

                {view === 'career-salary' && isAdmin && (
                    <SalaryInsights />
                )}

                {
                    comparisonRoleModelId && resumes[0] && (
                        <RoleModelComparison
                            userProfile={resumes[0]}
                            roleModel={roleModels.find(rm => rm.id === comparisonRoleModelId)!}
                            onBack={() => setComparisonRoleModelId(null)}
                        />
                    )
                }
            </div>
        </SharedPageLayout >
    );
};
