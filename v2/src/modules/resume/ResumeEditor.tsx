import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Plus, FileText, Download } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useResumeContext } from './context/ResumeContext';
import { useResumeEditor } from './hooks/useResumeEditor';
import { UnifiedUploadHero } from '../../components/common/UnifiedUploadHero';
import { GlobalDragOverlay } from '../../components/common/GlobalDragOverlay';
import { ResumePreview } from './components/ResumePreview';
import { ResumeSectionEditor } from './components/ResumeSectionEditor';
import { ResumeDiscoverySidebar } from './components/ResumeDiscoverySidebar';
import { ResumeParsingScreen } from './components/ResumeParsingScreen';
import { ResumePreviewModal } from './components/ResumePreviewModal';
import { ResumePrintStyles } from './components/ResumePrintStyles';
import { SECTIONS, getSortDate, getTypeColor } from './constants';
import { useSkillContext } from '../skills/context/SkillContext';

export const ResumeEditor: React.FC = () => {
    const {
        resumes,
        handleUpdateResumes: onSave,
        handleImportResume: onImport,
        isParsingResume: isParsing,
        importError,
        clearImportError
    } = useResumeContext();

    const {
        skills,
        updateSkills: onSkillsUpdated
    } = useSkillContext();

    const initialResume = resumes.length > 0 ? resumes[0] : { id: 'primary', name: 'Primary Experience', blocks: [] };

    const {
        blocks,
        movingBlockId,
        setMovingBlockId,
        addBlock,
        removeBlock,
        updateBlock,
        updateBullet,
        addBullet,
        removeBullet,
        moveBullet,
        handleApplySuggestion,
        handleDismissSuggestion
    } = useResumeEditor(initialResume, resumes, onSave);

    const [hasStartedManually, setHasStartedManually] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            clearImportError();
        };
    }, [clearImportError]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onImport(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePrint = () => {
        window.print();
    };

    const showEmptyState = blocks.length === 0 && !hasStartedManually && !isParsing;

    if (isParsing) {
        return <ResumeParsingScreen />;
    }

    return (
        <SharedPageLayout className="theme-resume" spacing="compact" maxWidth="6xl">
            <ResumePrintStyles />

            <div id="resume-preview" className="hidden print-only bg-white">
                <ResumePreview blocks={blocks} />
            </div>
            <GlobalDragOverlay onDrop={(files) => onImport(files[0])} />

            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 blur-[150px] rounded-full" />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="application/pdf,image/png,image/jpeg"
                className="hidden"
            />

            <PageHeader
                title="Resume"
                subtitle="Manage your professional history and accomplishments"
                variant="simple"
                className="mb-8 no-print"
                actions={(
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isParsing}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        >
                            {isParsing ? 'Processing' : 'Import'}
                        </Button>
                        <Button
                            onClick={() => setIsPreviewOpen(true)}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={<FileText className="w-3.5 h-3.5" />}
                        >
                            Preview
                        </Button>
                        <Button
                            onClick={handlePrint}
                            variant="secondary"
                            size="sm"
                            className="font-black"
                            icon={<Download className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Download</span>
                            <span className="sm:hidden">PDF</span>
                        </Button>
                    </div>
                )}
            />

            {showEmptyState ? (
                <div className="animate-in zoom-in-95 duration-700 relative no-print pt-4">
                    <div className="relative z-10 w-full">
                        {importError && (
                            <div className="mb-8 max-w-2xl mx-auto">
                                <Alert
                                    variant="error"
                                    title="Import Status"
                                    message={importError}
                                    onClose={clearImportError}
                                />
                            </div>
                        )}

                        <UnifiedUploadHero
                            title="Upload"
                            description="Drop your resume to begin analysis"
                            onUpload={(files) => onImport(files[0])}
                            onManualEntry={() => setHasStartedManually(true)}
                            themeColor="indigo"
                            cards={{
                                foundation: {
                                    title: "Foundation",
                                    description: "We need your history to build a strong foundation. Upload your current resume to provide the essential data for your profile.",
                                    icon: FileText,
                                    benefits: ['Smart File Import', 'Automatic Cleanup', 'Privacy-First Engine']
                                },
                                intelligence: {
                                    title: "Intelligence",
                                    description: "Our AI processes your data to discover your unique strengths. We analyze your past experience to highlight your true impact and potential.",
                                    icon: Zap,
                                    benefits: ['Achievement Analysis', 'Skill Discovery', 'Career Alignment']
                                }
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start relative print-container">
                    {/* Left Column: Editor Sections */}
                    <div className="flex-1 space-y-12 animate-in slide-in-from-left-4 duration-700">
                        {importError && (
                            <div className="mb-10">
                                <Alert
                                    variant="error"
                                    title="Recent Issue"
                                    message={importError}
                                    onClose={clearImportError}
                                />
                            </div>
                        )}

                        <div className="space-y-12">
                            {SECTIONS.map((section) => {
                                const sectionBlocks = blocks.filter(b => b.type === section.type);
                                if (!movingBlockId) {
                                    sectionBlocks.sort((a, b) => getSortDate(b.dateRange) - getSortDate(a.dateRange));
                                }

                                return (
                                    <div key={section.type} className="scroll-mt-20 print-card">
                                        <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 dark:border-neutral-800/50 pb-3 no-print">
                                            <div className="flex flex-col flex-1">
                                                <h2 className="text-lg font-black text-neutral-900 dark:text-white items-center flex gap-2">
                                                    {section.label}
                                                    {sectionBlocks.length > 0 && section.type !== 'summary' && (
                                                        <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                                                            {sectionBlocks.length}
                                                        </span>
                                                    )}
                                                </h2>
                                            </div>
                                            {(section.type !== 'summary' || sectionBlocks.length === 0) && (
                                                <button
                                                    onClick={() => addBlock(section.type)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-neutral-500 hover:text-indigo-600 rounded-xl transition-all group/add shadow-sm hover:shadow-md"
                                                >
                                                    <Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-300" />
                                                    <span className="text-[10px] font-black tracking-tight">Add {section.label === 'Professional Summary' ? 'Summary' : 'Entry'}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            {sectionBlocks.map((block) => (
                                                <ResumeSectionEditor
                                                    key={block.id}
                                                    block={block}
                                                    movingBlockId={movingBlockId}
                                                    sections={SECTIONS}
                                                    getTypeColor={getTypeColor}
                                                    onUpdateBlock={updateBlock}
                                                    onUpdateBullet={updateBullet}
                                                    onAddBullet={addBullet}
                                                    onRemoveBullet={removeBullet}
                                                    onMoveBullet={moveBullet}
                                                    onRemoveBlock={removeBlock}
                                                    onSetMovingBlockId={setMovingBlockId}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <ResumeDiscoverySidebar
                        initialResume={initialResume}
                        blocks={blocks}
                        skills={skills}
                        onApplySuggestion={handleApplySuggestion}
                        onDismissSuggestion={handleDismissSuggestion}
                        onSkillsUpdated={onSkillsUpdated}
                    />
                </div>
            )}

            <ResumePreviewModal
                isOpen={isPreviewOpen}
                blocks={blocks}
                onClose={() => setIsPreviewOpen(false)}
                onPrint={handlePrint}
            />
        </SharedPageLayout>
    );
};

export default ResumeEditor;
