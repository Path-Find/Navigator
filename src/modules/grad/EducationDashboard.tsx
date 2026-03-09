import React from 'react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { EducationStats } from './components/EducationStats';
import { useAcademicLogic } from './hooks/useAcademicLogic';
import { PageHeader } from '../../components/ui/PageHeader';
import { CourseVerificationModal } from '../../components/edu/CourseVerificationModal';
import { useHeadlines } from '../../hooks/useHeadlines';
import { EduHero } from './components/EduHero';

export const EducationDashboard: React.FC = () => {
    const { setView } = useGlobalUI();
    const activeHeadline = useHeadlines('edu');
    const {
        transcript,
        calculatedGpa,
        totalCredits,
        targetCredits,
        progressPercentage,
        handleFileUpload,
        isParsing,
        parseError,
        tempTranscript,
        showVerification,
        setShowVerification,
        handleVerificationSave,
    } = useAcademicLogic();

    return (
        <SharedPageLayout maxWidth="full" animate={false} className="relative theme-edu" spacing="compact">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <PageHeader
                    variant="hero"
                    title={activeHeadline.text}
                    highlight={activeHeadline.highlight}
                    subtitle="Manage your academic records, track progress, and explore degree opportunities."
                />

                {/* Main Stats Grid */}
                <EducationStats
                    transcript={transcript}
                    calculatedGpa={calculatedGpa}
                    totalCredits={totalCredits}
                    targetCredits={targetCredits}
                    progressPercentage={progressPercentage}
                    onViewChange={setView}
                />

                {!transcript && (
                    <div className="max-w-4xl mx-auto mt-8">
                        <EduHero
                            transcript={null}
                            calculatedGpa={calculatedGpa}
                            totalCredits={totalCredits}
                            targetCredits={targetCredits}
                            progressPercentage={progressPercentage}
                            onViewChange={setView}
                            handleFileUpload={handleFileUpload}
                            isParsing={isParsing}
                            parseError={parseError}
                        />
                    </div>
                )}
            </div>

            {/* Verification Modal integration */}
            {tempTranscript && (
                <CourseVerificationModal
                    isOpen={showVerification}
                    onClose={() => setShowVerification(false)}
                    transcript={tempTranscript}
                    onSave={handleVerificationSave}
                />
            )}
        </SharedPageLayout>
    );
};
