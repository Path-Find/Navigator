import React from 'react';
import { Search, FileDown } from 'lucide-react';
import { UnifiedUploadHero } from '../../../components/common/UnifiedUploadHero';

interface LinkedInExportGuideProps {
    onUpload: (files: File[]) => void;
    onViewSteps: () => void;
    isUploading: boolean;
}

export const LinkedInExportGuide: React.FC<LinkedInExportGuideProps> = ({
    onUpload,
    onViewSteps,
    isUploading
}) => {
    return (
        <div className="animate-in zoom-in-95 duration-500 relative py-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        Career Models
                    </h1>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                        Follow these steps to ingest a mentor's profile.
                    </p>
                </div>

                <UnifiedUploadHero
                    title="Analyze"
                    description="Drop their LinkedIn PDF here to begin analyzing their blueprint."
                    onUpload={onUpload}
                    isLoading={isUploading}
                    loadingText="Distilling..."
                    themeColor="emerald"
                    cards={{
                        foundation: {
                            title: "Identify",
                            description: "Find a Mentor or Role Model on LinkedIn whose career path you want to study.",
                            icon: Search,
                            benefits: ['Target Titles', 'Desired Companies', 'Career Path Peaks']
                        },
                        intelligence: {
                            title: "Distill",
                            description: "On their profile, click More → Save to PDF. This captures their full journey.",
                            icon: FileDown,
                            benefits: ['Complete History', 'Role Transitions', 'Skill Evolution'],
                            actionLabel: "See steps",
                            onAction: onViewSteps
                        }
                    }}
                />
            </div>
        </div>
    );
};

