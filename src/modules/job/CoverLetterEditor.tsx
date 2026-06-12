import React from 'react';
import type { SavedJob, ResumeProfile, JobAnalysis, TargetJob } from '../../types';
import type { UserTier } from '../../types/app';
import { useCoverLetterEditor } from './hooks/useCoverLetterEditor';
import { useUser } from '../../contexts/UserContext';
import { Sparkles, PenTool, ShieldAlert } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { GenerationProgress } from './components/cover-letter/GenerationProgress';
import { CoverLetterPreview } from './components/cover-letter/CoverLetterPreview';
import { printElement } from '../../utils/printService';

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
    const { bestResume, analysis, job } = props;
    const { user } = useUser();
    const {
        generating,
        showContextInput,
        setShowContextInput,
        copiedState,
        comparisonVersions,
        localJob,
        handleCopy,
        handleUpdateContext,
        handleGenerateCoverLetter,
        handleSelectVariant,
        handleRejectVariants,
        handleEditCoverLetter,
        generationStatus,
        generationProgress,
        isGenerating,
        acknowledgedAiBan,
        setAcknowledgedAiBan,
    } = useCoverLetterEditor(props);

    const isAiBanned = analysis.distilledJob?.isAiBanned;
    const aiBanReason = analysis.distilledJob?.aiBanReason;

    if (!bestResume) {
        return <CoverLetterEmptyState />;
    }

    const handleDownload = () => {
        printElement('cover-letter-print-target', `Cover Letter - ${job.analysis?.distilledJob.roleTitle || job.position}`);
    };

    return (
        <div className="space-y-6">
            {/* Main Editor Container */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <CoverLetterHeader
                    coverLetter={localJob.coverLetter}
                    userTier={props.userTier}
                    generating={generating}
                    copiedState={copiedState}
                    handleCopy={handleCopy}
                    handleGenerateCoverLetter={handleGenerateCoverLetter}
                    setShowContextInput={setShowContextInput}
                    onDownload={handleDownload}
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
                <div className="p-6 min-h-[600px] flex flex-col bg-white dark:bg-neutral-900 overflow-hidden">
                    {isGenerating ? (
                        <GenerationProgress 
                            status={generationStatus || "Drafting Narrative"} 
                            progress={generationProgress} 
                            title="Architecting Your Story"
                        />
                    ) : comparisonVersions ? (
                        <CoverLetterComparisonView
                            versions={comparisonVersions}
                            handleSelectVariant={handleSelectVariant}
                            handleRejectVariants={handleRejectVariants}
                        />
                    ) : localJob.coverLetter ? (
                        <div
                            className="flex-1 text-neutral-800 dark:text-neutral-200 leading-relaxed text-sm whitespace-pre-wrap selection:bg-indigo-100 dark:selection:bg-indigo-500/30 outline-none transition-colors border-none p-2 min-h-[500px]"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleEditCoverLetter(e.currentTarget.innerText)}
                            role="textbox"
                            aria-label="Cover Letter Content"
                            spellCheck={false}
                        >
                            {localJob.coverLetter}
                        </div>
                    ) : isAiBanned && !acknowledgedAiBan ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in duration-700">
                            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="max-w-md space-y-3">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">AI-Assisted Applications Prohibited</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                                    {aiBanReason || 'This employer prohibits the use of AI to write application materials.'}
                                </p>
                                <p className="text-neutral-400 dark:text-neutral-500 text-xs leading-relaxed">
                                    You can still generate a draft for personal reference — to understand the format or get ideas — but <strong>do not submit it directly</strong>.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="accent"
                                    size="lg"
                                    onClick={() => { setAcknowledgedAiBan(true); handleGenerateCoverLetter(); }}
                                    className="px-8 bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600"
                                    icon={<Sparkles className="w-4 h-4" />}
                                >
                                    Generate for reference only
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setAcknowledgedAiBan(true)}
                                    className="px-8"
                                    icon={<PenTool className="w-4 h-4" />}
                                >
                                    I'll write it myself
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20 animate-in fade-in duration-700">
                            <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                <PenTool className="w-10 h-10 text-neutral-300" />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">Ready to Draft</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 font-bold text-sm leading-relaxed mb-8">
                                    Create a personalized, story-driven cover letter tailored specifically to this role and company.
                                </p>
                                <Button
                                    variant="accent"
                                    size="lg"
                                    onClick={() => handleGenerateCoverLetter()}
                                    className="px-8"
                                    icon={<Sparkles className="w-4 h-4" />}
                                >
                                    Generate Story
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden component for printing */}
            <div className="hidden">
                 {localJob.coverLetter && (
                    <CoverLetterPreview 
                        id="cover-letter-print-target"
                        content={localJob.coverLetter}
                        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        roleTitle={job.analysis?.distilledJob.roleTitle || job.position}
                        companyName={job.analysis?.distilledJob.companyName || job.company}
                        userProfile={{
                            name: user?.user_metadata?.full_name || user?.email || 'User',
                            email: user?.email || '',
                            phone: '', 
                            location: job.analysis?.distilledJob.location || ''
                        }}
                    />
                )}
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
