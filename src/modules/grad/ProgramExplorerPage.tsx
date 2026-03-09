import React from 'react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { MAEligibility } from './MAEligibility';
import { ProgramExplorer } from './components/ProgramExplorer';
import { GraduationCap, Zap } from 'lucide-react';
import { ProgramRequirements } from './components/ProgramRequirements';
import { useToast } from '../../contexts/ToastContext';
import { AcademicHero } from './components/AcademicHero';
import { useAcademicLogic } from './hooks/useAcademicLogic';

export const ProgramExplorerPage: React.FC = () => {
    const {
        transcript,
        programRequirements,
        isAnalyzingRequirements,
        fetchRequirements,
        handleFileUpload,
        isParsing,
        parseError,
        tempTranscript,
        showVerification,
        setShowVerification,
        handleVerificationSave
    } = useAcademicLogic();
    const [selectedProgram, setSelectedProgram] = React.useState<string | undefined>();
    useToast();

    return (
        <SharedPageLayout maxWidth="full" className="relative theme-edu" spacing="compact">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <PageHeader
                    variant="simple"
                    title="Programs"
                    subtitle="Track requirements for your current program and discover future opportunities."
                />

                {transcript ? (
                    <div className="space-y-16">
                        {/* 1. Current Progress Tracking */}
                        <div className="space-y-8">
                            <div className="flex flex-col gap-1 text-left">
                                <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Active Program</h3>
                                <p className="text-sm text-neutral-500 font-medium">Tracking requirements for: <span className="text-emerald-600 font-bold">{transcript.program}</span></p>
                            </div>
                            <div>
                                <ProgramRequirements
                                    requirements={programRequirements}
                                    isAnalyzing={isAnalyzingRequirements}
                                    onAnalyze={fetchRequirements}
                                    programName={transcript.program}
                                />
                            </div>
                        </div>

                        <div className="w-full h-px bg-neutral-100 dark:bg-neutral-800" />

                        {/* 2. Future Discovery */}
                        <div className="space-y-8">
                            <div className="flex flex-col gap-1 text-left">
                                <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Discovery Library</h3>
                                <p className="text-sm text-neutral-500 font-medium">Explore master's degrees, certifications, and career pivots.</p>
                            </div>

                            <ProgramExplorer
                                onSelect={(p: { institution: string; name: string }) => {
                                    setSelectedProgram(`${p.institution} - ${p.name}`);
                                    // Scroll to analyzer
                                    setTimeout(() => {
                                        document.getElementById('program-analyzer')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                            />

                            {selectedProgram && (
                                <div id="program-analyzer" className="animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-mt-20">
                                    <MAEligibility transcript={transcript} initialProgram={selectedProgram} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <AcademicHero
                            title="Ready to Explore?"
                            description="Upload your transcript to see which top programs you're eligible for."
                            handleFileUpload={handleFileUpload}
                            isParsing={isParsing}
                            parseError={parseError}
                            tempTranscript={tempTranscript}
                            showVerification={showVerification}
                            setShowVerification={setShowVerification}
                            handleVerificationSave={handleVerificationSave}
                            cards={{
                                foundation: {
                                    title: "Smart Discovery",
                                    description: "Stop searching and start discovering. We match your academic background against thousands of top-tier degree programs.",
                                    icon: GraduationCap,
                                    benefits: ['Instant Program Matching', 'Requirement Mapping', 'Automatic Eligibility']
                                },
                                intelligence: {
                                    title: "Match Logic",
                                    description: "See exactly why you're a fit for a program, from credit requirements to skill-based eligibility mapping.",
                                    icon: Zap,
                                    benefits: ['Credit Transfer Gap', 'Skill Alignment', 'Course Prerequisites']
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </SharedPageLayout>
    );
};
