import React from 'react';
import type { SavedJob, ResumeProfile, JobAnalysis, TargetJob } from '../../types';
import type { UserTier } from '../../types/app';
import { useCoverLetterEditor } from './hooks/useCoverLetterEditor';
import { PenTool } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';

// Sub-components
import { CoverLetterHeader } from './components/cover-letter/CoverLetterHeader';

import { CoverLetterComparisonView } from './components/cover-letter/CoverLetterComparisonView';
import { CoverLetterContextSection } from './components/cover-letter/CoverLetterContextSection';
import { CoverLetterEmptyState } from './components/cover-letter/CoverLetterEmptyState';

interface CoverLetterEditorProps {
    job: SavedJob;
    analysis: JobAnalysis;
    bestResume: ResumeProfile | undefined;
    userTier: UserTier;
    targetJobs: TargetJob[];
    onJobUpdate: (job: SavedJob) => void;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = (props) => {
    const { bestResume, analysis } = props;
    const {
        generating,
        showContextInput,
        setShowContextInput,
        copiedState,
        analysisProgress,
        comparisonVersions,
        localJob,
        handleCopy,
        handleUpdateContext,
        handleGenerateCoverLetter,
        handleSelectVariant,
        handleRejectVariants,
        handleRunCritique,
        handleEditCoverLetter
    } = useCoverLetterEditor(props);

    if (!bestResume) {
        return <CoverLetterEmptyState />;
    }

    return (
        <div className="space-y-6">
            {/* Main Editor Container */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <CoverLetterHeader
                    coverLetter={localJob.coverLetter}
                    userTier={props.userTier}
                    generating={generating}
                    analysisProgress={analysisProgress}
                    copiedState={copiedState}
                    handleCopy={handleCopy}
                    handleGenerateCoverLetter={handleGenerateCoverLetter}
                    handleRunCritique={handleRunCritique}
                    setShowContextInput={setShowContextInput}
                />

                {/* Safety Warning */}
                {analysis.distilledJob.isAiBanned && (
                    <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30">
                        <Alert
                            variant="warning"
                            title="Employer AI Prohibition Detected"
                            message="This job posting explicitly discourages or bans the use of AI/LLMs. Use this draft ONLY as a reference."
                        />
                    </div>
                )}

                {/* Editor Area */}
                <div className="p-6 min-h-[600px] flex flex-col bg-white dark:bg-neutral-900">
                    {comparisonVersions ? (
                        <CoverLetterComparisonView
                            versions={comparisonVersions}
                            handleSelectVariant={handleSelectVariant}
                            handleRejectVariants={handleRejectVariants}
                        />
                    ) : localJob.coverLetter ? (
                        <div
                            className="flex-1 text-neutral-800 dark:text-neutral-200 leading-relaxed text-sm whitespace-pre-wrap selection:bg-indigo-100 dark:selection:bg-indigo-500/30 outline-none transition-colors border-none p-2"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleEditCoverLetter(e.currentTarget.innerText)}
                            role="textbox"
                            aria-label="Cover Letter Content"
                            spellCheck={false}
                        >
                            {localJob.coverLetter}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20">
                            <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center animate-pulse">
                                <PenTool className="w-10 h-10 text-neutral-300" />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">Ready to Draft</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 font-bold text-sm leading-relaxed">
                                    Create a personalized, story-driven cover letter tailored specifically to this role and company.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Personal Context Section */}
            {showContextInput && (
                <CoverLetterContextSection
                    contextNotes={localJob.contextNotes}
                    generating={generating}
                    handleUpdateContext={handleUpdateContext}
                    handleGenerateCoverLetter={handleGenerateCoverLetter}
                    setShowContextInput={setShowContextInput}
                    hasCoverLetter={!!localJob.coverLetter}
                />
            )}

        </div>
    );
};
