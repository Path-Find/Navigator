import React, { useState, useEffect } from 'react';
import { Storage } from '../../services/storageService';
import { useJobAnalysis } from './hooks/useJobAnalysis';
import { getBestResume, copyResumeToClipboard } from './utils/jobUtils';
import {
    FileText, PenTool, ExternalLink,
    BookOpen, MapPin, Hash, Sparkles, Target
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
import { MatchSidebar } from './components/MatchSidebar';
import { ResumeSidebar } from './components/ResumeSidebar';
import { AnalysisTab } from './components/AnalysisTab';
import { ResumeTab } from './components/ResumeTab';
import { InterviewTab } from './components/InterviewTab';
import { ProhibitionAlert } from './components/ProhibitionAlert';
import { JobPostTab } from './components/JobPostTab';
import { CoverLetterSidebar } from './components/CoverLetterSidebar';
import { CoverLetterTab } from './components/CoverLetterTab';

// Types
import type { SavedJob } from './types';
import type { TargetJob } from '../../types/target';

export const JobDetail: React.FC = () => {
    const { activeJob: job, handleUpdateJob: onUpdateJob, handleAnalyzeJob } = useJobContext();
    const { userTier } = useUser();
    const { skills: userSkills } = useSkillContext();
    const { resumes } = useResumeContext();
    const { setView } = useGlobalUI();
    const { openModal } = useModal();

    const onBack = () => setView('history');

    const { showSuccess, showError } = useToast();
    const [targetJobs, setTargetJobs] = useState<TargetJob[]>([]);
    const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'cover-letter' | 'interview' | 'job-post'>('analysis');
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

    if (!job) return null;

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
        { id: 'interview', label: 'Interview', icon: Target },
        { id: 'job-post', label: 'Job Posting', icon: BookOpen },
    ];

    const actionsMenu = (
        <div className="flex items-center gap-3">
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
                className="text-xs bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-2 font-black text-neutral-600 dark:text-neutral-400 border-none focus:ring-4 focus:ring-accent-primary/10 transition-all cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
            </select>
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
                    title={
                        <div className="flex items-center gap-3">
                            <span className="text-neutral-500 dark:text-neutral-400 font-bold text-sm truncate max-w-[200px] md:max-w-md">
                                {toTitleCase(job.analysis?.distilledJob?.roleTitle || job.position || 'Job Detail')}
                            </span>
                        </div>
                    }
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
                                        <span className="font-mono text-[10px] tracking-wider">{job.analysis.distilledJob.referenceCode}</span>
                                    </div>
                                </>
                            )}
                            {job.analysis?.distilledJob?.salaryRange && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{job.analysis.distilledJob.salaryRange}</span>
                                </>
                            )}
                        </div>
                    }
                    onBack={onBack}
                />
                <DetailTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                    actions={actionsMenu}
                />

                <DetailLayout
                    sidebar={
                        activeTab === 'analysis' ? (
                            <MatchSidebar
                                job={job}
                                analysisProgress={analysisProgress}
                                userTier={userTier}
                                openModal={openModal}
                            />
                        ) : activeTab === 'resume' ? (
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

                        {activeTab === 'interview' && (
                            <InterviewTab
                                job={job}
                                userTier={userTier}
                                openModal={openModal}
                            />
                        )}

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
