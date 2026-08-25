import React, { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Plus, Briefcase, Code, Zap, Sparkles, Heart, FileText, Download, X, UserRound } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { LoadingState } from '../../components/common/LoadingState';
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
import { ResumeInterviewModal } from './components/ResumeInterviewModal';
import { ResumeDiscoverySidebar } from './components/ResumeDiscoverySidebar';
import { AddEntryModal } from './components/AddEntryModal';
import { SECTIONS, getSortDate, getTypeColor } from './constants';
import type { SectionType } from './constants';
import { useSkillContext } from '../skills/context/SkillContext';
import { printElement } from '../../utils/printService';
import { ROUTES } from '../../constants';
import { useNavigate, useSearchParams } from 'react-router';
import type { ExperienceBlock } from './types';

export const ResumeEditor: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        resumes,
        handleUpdateResumes: onSave,
        handleImportResume: onImport,
        isParsingResume: isParsing,
        importError,
        clearImportError,
        isLoading
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
        handleDismissSuggestion,
        toggleCurrentBlock,
    } = useResumeEditor(initialResume, resumes, onSave);

    const [hasStartedManually, setHasStartedManually] = useState(false);
    const [addingSection, setAddingSection] = useState<SectionType | null>(null);
    const [parsingMessageIndex, setParsingMessageIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [interviewBlock, setInterviewBlock] = useState<ExperienceBlock | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const PARSING_MESSAGES = [
        { title: "Summoning achievement hunters...", subtitle: "Scouring your past for those gold-medal moments.", icon: Briefcase },
        { title: "Powering up impact engine...", subtitle: "Translating your hard work into career-defining fuel.", icon: Zap },
        { title: "Deciphering skill matrix...", subtitle: "Translating your 'can-do' attitude into 'done-that' proof.", icon: Code },
        { title: "Celebrating your altruism...", subtitle: "Ensuring your community impact gets the spotlight it deserves.", icon: Heart },
        { title: "Adding finishing sparkles...", subtitle: "Polishing every bullet point until it shines like a supernova.", icon: Sparkles }
    ];

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isParsing) {
            interval = setInterval(() => {
                setParsingMessageIndex((prev) => (prev + 1) % PARSING_MESSAGES.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isParsing, PARSING_MESSAGES.length]);

    useEffect(() => {
        return () => {
            clearImportError();
        };
    }, [clearImportError]);

    useEffect(() => {
        if (searchParams.get('interview') !== '1' || interviewBlock || isLoading) return;
        const firstExperience = blocks.find(block => block.isVisible && block.type !== 'summary');
        if (!firstExperience) return;
        setInterviewBlock(firstExperience);
        setSearchParams({}, { replace: true });
    }, [blocks, interviewBlock, isLoading, searchParams, setSearchParams]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onImport(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePrint = () => {
        printElement('resume-preview-print-target', 'Resume - Primary Experience');
    };

    if (isLoading) {
        return (
            <SharedPageLayout className="theme-resume" spacing="hero" maxWidth="6xl">
                 <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <LoadingState message="Restoring history..." />
                </div>
            </SharedPageLayout>
        );
    }

    const showEmptyState = blocks.length === 0 && !hasStartedManually && !isParsing;

    if (isParsing) {
        const CurrentIcon = PARSING_MESSAGES[parsingMessageIndex].icon;
        return (
            <SharedPageLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
                    <div className="relative group">
                        <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-neutral-500/10 blur-[100px] rounded-full animate-pulse transition-all duration-1000" />

                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-neutral-200/50 animate-[spin_10s_linear_infinite]" />

                            <Card variant="glass" className="relative w-32 h-32 flex items-center justify-center rounded-[2.5rem] shadow-2xl border-neutral-100/50 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-500/10 to-neutral-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CurrentIcon className="w-10 h-10 text-neutral-600 dark:text-neutral-400 animate-in zoom-in-50 fade-in duration-500" key={parsingMessageIndex} />
                            </Card>

                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-neutral-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce" />
                        </div>
                    </div>

                    <div className="text-center space-y-6 max-w-md mx-auto relative px-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight animate-in slide-in-from-bottom-4 duration-700" key={`title-${parsingMessageIndex}`}>
                                {PARSING_MESSAGES[parsingMessageIndex].title}
                            </h2>
                            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed animate-in slide-in-from-bottom-2 duration-700 delay-100" key={`subtitle-${parsingMessageIndex}`}>
                                {PARSING_MESSAGES[parsingMessageIndex].subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 px-6 py-3 bg-neutral-50 dark:bg-neutral-900/20 rounded-2xl border border-neutral-100/50 dark:border-neutral-800/50 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <Sparkles className="w-5 h-5 text-neutral-500 animate-pulse" />
                            <span className="text-sm font-black text-neutral-600 dark:text-neutral-400 tracking-wider">
                                Intelligence Engine Active
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {PARSING_MESSAGES.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === parsingMessageIndex ? 'w-8 bg-neutral-500' : 'w-1.5 bg-neutral-200 dark:bg-neutral-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </SharedPageLayout>
        );
    }

    return (
        <SharedPageLayout className="theme-resume" spacing="compact" maxWidth="6xl">
            <style>
                {`
                    @media print {
                        body {
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-only {
                            display: block !important;
                        }
                        .print-container {
                            display: block !important;
                            max-width: 100% !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        #resume-preview {
                            display: block !important;
                            visibility: visible !important;
                            position: static !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .page-layout-root {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div id="resume-preview-print-target" className="hidden print-only bg-white">
                <ResumePreview blocks={blocks} />
            </div>
            <GlobalDragOverlay onDrop={(files) => onImport(files[0])} />

            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neutral-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-neutral-500/5 blur-[150px] rounded-full" />
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
                            onClick={() => navigate(ROUTES.APPLICATION_PROFILE)}
                            variant="subtle"
                            size="xs"
                            icon={<UserRound className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Application Preferences</span>
                            <span className="sm:hidden">Profile</span>
                        </Button>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isParsing}
                            variant="subtle"
                            size="xs"
                            icon={isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        >
                            {isParsing ? 'Processing' : 'Import'}
                        </Button>
                        <Button
                            onClick={() => setIsPreviewOpen(true)}
                            variant="subtle"
                            size="xs"
                            icon={<FileText className="w-3.5 h-3.5" />}
                        >
                            Preview
                        </Button>
                        <Button
                            onClick={handlePrint}
                            variant="subtle"
                            size="xs"
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
                    <div className="flex-1 space-y-12">
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
                                    sectionBlocks.sort((a, b) => {
                                        const aIsCurrent = initialResume.candidateProfile?.currentBlockIds?.includes(a.id) ? 1 : 0;
                                        const bIsCurrent = initialResume.candidateProfile?.currentBlockIds?.includes(b.id) ? 1 : 0;
                                        return bIsCurrent - aIsCurrent || getSortDate(b.dateRange) - getSortDate(a.dateRange);
                                    });
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
                                                <Button
                                                    onClick={() => {
                                                        if (section.type === 'summary' || section.type === 'skill') {
                                                            addBlock(section.type);
                                                        } else {
                                                            setAddingSection(section.type);
                                                        }
                                                    }}
                                                    variant="subtle"
                                                    size="xs"
                                                    className="group/add"
                                                    icon={<Plus className="w-3.5 h-3.5 group-hover/add:rotate-90 transition-transform duration-300" />}
                                                >
                                                    Add {section.label === 'Professional Summary' ? 'Summary' : 'Entry'}
                                                </Button>
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
                                                    current={initialResume.candidateProfile?.currentBlockIds?.includes(block.id) || false}
                                                    onToggleCurrent={toggleCurrentBlock}
                                                    onStartInterview={setInterviewBlock}
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

            {/* Add Entry Modal */}
            <AnimatePresence>
                {addingSection && (
                    <AddEntryModal
                        type={addingSection}
                        sectionLabel={SECTIONS.find(s => s.type === addingSection)?.label ?? addingSection}
                        onAdd={(title, organization, dateRange) => {
                            addBlock(addingSection, { title, organization, dateRange });
                            setAddingSection(null);
                        }}
                        onClose={() => setAddingSection(null)}
                    />
                )}
            </AnimatePresence>

            {interviewBlock && (
                <ResumeInterviewModal
                    block={interviewBlock}
                    onSave={(narrativeContext) => {
                        updateBlock(interviewBlock.id, 'narrativeContext', narrativeContext);
                    }}
                    onClose={() => setInterviewBlock(null)}
                />
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xl" onClick={() => setIsPreviewOpen(false)} />
                    <div className="relative bg-neutral-100 dark:bg-neutral-950 w-full max-w-5xl h-full rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                        <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-500/10 rounded-xl text-neutral-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-xl text-neutral-900 dark:text-white">Preview</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrint} variant="subtle" size="xs" icon={<Download className="w-3.5 h-3.5" />}>
                                    Download PDF
                                </Button>
                                <Button
                                    onClick={() => setIsPreviewOpen(false)}
                                    variant="ghost"
                                    size="xs"
                                    className="p-2 w-9 h-9"
                                    icon={<X className="w-5 h-5" />}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-none">
                            <div className="mx-auto shadow-2xl origin-top scale-[0.85] md:scale-100">
                                <ResumePreview blocks={blocks} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SharedPageLayout>
    );
};

export default ResumeEditor;
