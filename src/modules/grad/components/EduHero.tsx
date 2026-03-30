import React from 'react';
import { Zap, GraduationCap } from 'lucide-react';
import { UnifiedUploadHero } from '../../../components/common/UnifiedUploadHero';

interface EduHeroProps {
    handleFileUpload: (files: File[]) => void;
    isParsing: boolean;
    parseError: string | null;
}

export const EduHero: React.FC<EduHeroProps> = ({
    handleFileUpload,
    isParsing,
    parseError
}) => {
    return (
        <>
            <div className="w-full max-w-4xl mx-auto mb-16 px-4 animate-in zoom-in-95 fade-in duration-500">
                <div className="w-full max-w-5xl mx-auto pt-4">
                    <UnifiedUploadHero
                        title="Upload Transcript"
                        description="Drag & drop your PDF transcript here to automatically import your academic history"
                        onUpload={handleFileUpload}
                        isLoading={isParsing}
                        error={parseError}
                        themeColor="amber"
                        cards={{
                            foundation: {
                                title: "Academic Profile",
                                description: "Your education is more than just grades. We help you build a comprehensive profile of your learning journey.",
                                icon: GraduationCap,
                                benefits: ['Comprehensive Learning View', 'Skill Analysis', 'Educational Milestones']
                            },
                            intelligence: {
                                title: "Smart Analysis",
                                description: "Our AI extracts skills, projects, and achievements from your academic history to give you a competitive edge.",
                                icon: Zap,
                                benefits: ['Skill Pattern Discovery', 'Achievement Breakdown', 'Growth Mapping']
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
};
