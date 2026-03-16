import React from 'react';

import { CourseVerificationModal } from '../../../components/edu/CourseVerificationModal';
import type { Transcript } from '../../../types';
import { UnifiedUploadHero } from '../../../components/common/UnifiedUploadHero';
import type { UnifiedUploadHeroProps } from '../../../components/common/UnifiedUploadHero';
import { GraduationCap, Zap } from 'lucide-react';

interface AcademicHeroProps {
    handleFileUpload: (files: File[]) => void;
    isParsing: boolean;
    parseError: string | null;
    tempTranscript: Transcript | null;
    showVerification: boolean;
    setShowVerification: (show: boolean) => void;
    handleVerificationSave: (verified: Transcript) => void;
    title?: string;
    description?: string;
    cards?: UnifiedUploadHeroProps['cards'];
}

export const AcademicHero: React.FC<AcademicHeroProps> = ({
    handleFileUpload,
    isParsing,
    parseError,
    tempTranscript,
    showVerification,
    setShowVerification,
    handleVerificationSave,
    title = "Upload Transcript",
    description = "Drag & drop your PDF transcript here to automatically import your academic history",
    cards
}) => {
    const defaultCards = {
        foundation: {
            title: "Record Analysis",
            description: "Automatically extract every course, grade, and credit from your official transcript with perfect accuracy.",
            icon: GraduationCap,
            benefits: ['Direct PDF Extraction', 'Grade Normalization', 'Privacy-First Engine']
        },
        intelligence: {
            title: "GPA Intelligence",
            description: "Get a detailed breakdown of your academic performance, including major-specific and cumulative GPA tracking.",
            icon: Zap,
            benefits: ['Major GPA Tracking', 'Credit Balance', 'Performance Trends']
        }
    };
    return (
        <div className="max-w-5xl mx-auto mt-12 px-4">
            <UnifiedUploadHero
                title={title}
                description={description}
                onUpload={handleFileUpload}
                isLoading={isParsing}
                error={parseError}
                themeColor="amber"
                cards={cards || defaultCards}
            />

            {tempTranscript && (
                <CourseVerificationModal
                    isOpen={showVerification}
                    onClose={() => setShowVerification(false)}
                    transcript={tempTranscript}
                    onSave={handleVerificationSave}
                />
            )}
        </div>
    );
};

