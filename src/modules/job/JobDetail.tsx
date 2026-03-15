import React, { useState, useEffect } from 'react';
import { Storage } from '../../services/storageService';
import { useJobAnalysis } from './hooks/useJobAnalysis';
import { getBestResume, copyResumeToClipboard, getDeadlineInfo, getScoreLabel, getScoreColorClasses } from './utils/jobUtils';
import {
    FileText, PenTool, ExternalLink,
    BookOpen, MapPin, Hash, Sparkles, AlertCircle, ChevronDown
} from 'lucide-react';

import { Button } from '../../components/ui/Button';

import { useToast } from '../../contexts/ToastContext';
import { DetailHeader } from '../../components/common/DetailHeader';
import { DetailTabs, type TabItem } from '../../components/common/DetailTabs';
import { DetailLayout } from '../../components/common/DetailLayout';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { toTitleCase } from '../../utils/stringUtils';

import { useJobContext } from './context/JobContext';
import { useUser } from '../../contexts/UserContext';
import { useSkillContext } from '../skills/context/SkillContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useModal } from '../../contexts/ModalContext';

// Extracted Components
import { JobProcessingState } from './components/JobProcessingState';
import { JobErrorState } from './components/JobErrorState';
import { ResumeSidebar } from './components/ResumeSidebar';
import { AnalysisTab } from './components/AnalysisTab';
import { ResumeTab } from './components/ResumeTab';
import { ProhibitionAlert } from './components/ProhibitionAlert';
import { JobPostTab } from './components/JobPostTab';
import { CoverLetterSidebar } from './components/CoverLetterSidebar';
import { CoverLetterTab } from './components/CoverLetterTab';

// Types
import type { SavedJob } from './types';
import type { TargetJob } from '../../types/target';

export const JobDetail: React.FC = () => {
    const { activeJob: job, handleUpdateJob: onUpdateJob, handleAnalyzeJob, checkAndConsumeAnalysis } = useJobContext();
    const { userTier } = useUser();
    const { skills: userSkills } = useSkillContext();
    const { resumes } = useResumeContext();
    const { setView } = useGlobalUI();
    const { openModal } = useModal();

    const onBack = () => setView('history');

    const { showSuccess, showError } = useToast();
    const [targetJobs, setTargetJobs] = useState<TargetJob[]>([]);
    type JobTab = 'analysis' | 'resume' | 'cover-letter' | 'interview' | 'job-post';
    const [activeTab, setActiveTab] = useState<JobTab>('analysis');
    const [generating, setGenerating] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [editUrl, setEditUrl] = useState(job?.url || '');
    const [manualText, setManualText] = useState(job?.description || '');

    useEffect(() => {
        Storage.getTargetJobs().then(setTargetJobs);
    }, []);

    // Keep state in sync if job was missing on initial render
    useEffect(() => {
        if (!manualText && job?.description) setManualText(job.description);
        if (!editUrl && job?.url) setEditUrl(job.url);
    }, [job?.description, job?.url, manualText, editUrl]);

    const { analysisProgress } = useJobAnalysis(
        job!,
        resumes,
        userSkills,
        onUpdateJob,
        showError,
        (j) => handleAnalyzeJob(j, { resumes, skills: userSkills })
    );

    // If we have an active ID but the job isn't in the list yet, we're likely still loading from storage
    const { isLoading } = useJobContext();
    console.log("JobDetail render:", { job, isLoading, activeJobId: useJobContext().activeJobId, urlId: window.location.pathname });
    if (!job && isLoading) {
        return <JobProcessingState job={null as any} analysisProgress="Loading your data..." onBack={onBack} />;
    }

    if (!job) {
        // Only return null if we're definitively done loading and still have no job
        return <div style={{ fontSize: '24px', padding: '100px' }}>Job not found for ID: {useJobContext().activeJobId}. Total jobs: {useJobContext().jobs.length}</div>; 
    }

    const bestResume = getBestResume(resumes, job.analysis);

    const handleCopyResumeAction = async () => {
        setGenerating(true);
        try {
            await copyResumeToClipboard(job, bestResume);
            showSuccess('Resume copied to clipboard!');
        } catch {
            showError('Failed to copy resume');
        } finally {
            setGenerating(false);
        }
    };

    const handleManualRetry = async () => {
        if (!manualText.trim()) return;
        
        // 1. Check Limits First!
        const limitCheck = await checkAndConsumeAnalysis();
        if (!limitCheck.allowed) {
            // The upgrade modal will pop up automatically. Stop execution.
            return;
        }
        
        setRetrying(true);
        try {
            const updatedJob: SavedJob = {
                ...job,
                status: 'analyzing',
                description: manualText,
                url: editUrl || job.url,
            };
            await Storage.updateJob(updatedJob);
            onUpdateJob(updatedJob);
        } catch (err) {
            showError(`Failed to update job: ${(err as Error).message}`);
        } finally {
            setRetrying(false);
        }
    };

    if (!job.analysis && job.status !== 'error') {
        return <JobProcessingState job={job} analysisProgress={analysisProgress} onBack={onBack} />;
    }

    if (job.status === 'error') {
        return (
            <JobErrorState
                job={job}
                manualText={manualText}
                setManualText={setManualText}
                editUrl={editUrl}
                setEditUrl={setEditUrl}
                retrying={retrying}
                onBack={onBack}
                onManualRetry={handleManualRetry}
            />
        );
    }


    const tabs: TabItem[] = [
        { id: 'analysis', label: 'Analysis', icon: Sparkles },
        { id: 'resume', label: 'Resume', icon: FileText },
        { id: 'cover-letter', label: 'Cover Letter', icon: PenTool },
        { id: 'job-post', label: 'Posting', icon: BookOpen },
    ];

    const actionsMenu = (
        <div className="flex items-center gap-3">
            {job.analysis?.compatibilityScore != null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border ${getScoreColorClasses(job.analysis.compatibilityScore)}`}>
                    <span className="opacity-50 tracking-tight">Match</span>
                    <div className="flex items-center gap-1.5">
                        {job.analysis.compatibilityScore} <span className="opacity-30">·</span> {getScoreLabel(job.analysis.compatibilityScore)}
                    </div>
                </div>
            )}
            <div className="relative flex items-center">
                <select
                    value={job.status}
                    onChange={async (e) => {
                        const updated = { ...job, status: e.target.value as SavedJob['status'] };
                        onUpdateJob(updated);
                        try {
                            await Storage.updateJob(updated);
                        } catch {
                            showError('Failed to save status change');
                        }
                    }}
                    className="text-xs bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl pl-3 pr-7 py-1.5 font-semibold text-neutral-600 dark:text-neutral-300 focus:outline-none cursor-pointer appearance-none transition-all hover:bg-neutral-200 dark:hover:bg-white/10"
                >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
            {job.url && (
                <Button
                    variant="secondary"
                    size="sm"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open(job.url, '_blank')}
                />
            )}
        </div>
    );

    return (
        <SharedPageLayout className="theme-job" spacing="none" maxWidth="6xl">
            <div className="bg-white dark:bg-neutral-900 min-h-screen flex flex-col">
                <DetailHeader
                    hideBack
                    title={toTitleCase(job.analysis?.distilledJob?.roleTitle || job.position || 'Job Detail')}
                    subtitle={
                        <div className="flex items-center flex-wrap gap-2 text-sm text-neutral-500 font-semibold">
                            <span>{toTitleCase(job.analysis?.distilledJob?.companyName || job.company || 'Unknown Company')}</span>
                            {job.analysis?.distilledJob?.location && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{job.analysis.distilledJob.location}</span>
                                    </div>
                                </>
                            )}
                            {job.analysis?.distilledJob?.referenceCode && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <div className="flex items-center gap-1">
                                        <Hash className="w-3.5 h-3.5" />
                                        <span>{job.analysis.distilledJob.referenceCode}</span>
                                    </div>
                                </>
                            )}
                            {job.analysis?.distilledJob?.salaryRange && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{job.analysis.distilledJob.salaryRange}</span>
                                </>
                            )}
                            {(() => {
                                const deadlineInfo = getDeadlineInfo(job.analysis?.distilledJob?.applicationDeadline);
                                return deadlineInfo ? (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                        <div className={`flex items-center gap-1 font-black ${deadlineInfo.style}`}>
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{deadlineInfo.label}</span>
                                        </div>
                                    </>
                                ) : null;
                            })()}
                        </div>
                    }
                    onBack={onBack}
                />
                <DetailTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as JobTab)}
                    actions={actionsMenu}
                />

                <DetailLayout
                    sidebar={
                        activeTab === 'resume' ? (
                            <ResumeSidebar job={job} analysisProgress={analysisProgress} />
                        ) : activeTab === 'cover-letter' ? (
                            <CoverLetterSidebar job={job} />
                        ) : null
                    }
                >
                    <div className="space-y-8">
                        {(activeTab === 'analysis' || activeTab === 'resume' || activeTab === 'cover-letter') && <ProhibitionAlert job={job} />}

                        {activeTab === 'analysis' && (
                            <AnalysisTab
                                job={job}
                                userTier={userTier}
                                openModal={openModal}
                            />
                        )}

                        {activeTab === 'job-post' && <JobPostTab job={job} />}

                        {activeTab === 'resume' && (
                            <ResumeTab
                                job={job}
                                onUpdateJob={onUpdateJob}
                                userTier={userTier}
                                openModal={openModal}
                                showSuccess={showSuccess}
                                showError={showError}
                                generating={generating}
                                handleCopyResume={handleCopyResumeAction}
                            />
                        )}

                        {activeTab === 'cover-letter' && (
                            <CoverLetterTab
                                job={job}
                                bestResume={bestResume}
                                userTier={userTier}
                                targetJobs={targetJobs}
                                onUpdateJob={onUpdateJob}
                            />
                        )}
                    </div>
                </DetailLayout>
            </div>
        </SharedPageLayout>
    );
};

export default JobDetail;
