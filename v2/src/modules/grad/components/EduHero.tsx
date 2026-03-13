import React from 'react';
import { Zap, GraduationCap, FileText } from 'lucide-react';
import type { Transcript } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { UnifiedUploadHero } from '../../../components/common/UnifiedUploadHero';


import type { ViewId } from '../../../utils/navigation';


interface EduHeroProps {
    transcript: Transcript | null;
    calculatedGpa: string;
    totalCredits: number;
    targetCredits: number;
    progressPercentage: number;
    onViewChange: (view: ViewId) => void;
    handleFileUpload: (files: File[]) => void;
    isParsing: boolean;
    parseError: string | null;
}

export const EduHero: React.FC<EduHeroProps> = ({
    transcript,
    calculatedGpa,
    totalCredits,
    targetCredits,
    progressPercentage,
    onViewChange,
    handleFileUpload,
    isParsing,
    parseError
}) => {
    return (
        <>
            <div className="w-full max-w-4xl mx-auto mb-16 px-4 animate-in zoom-in-95 fade-in duration-500">
                {!transcript ? (
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
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
                        {/* Academic Overview Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-white/5 shadow-sm group hover:shadow-xl hover:border-amber-500/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-white truncate">{transcript.university}</h3>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">{transcript.program}</p>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Cumulative GPA</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-neutral-900 dark:text-white font-mono tracking-tighter">{calculatedGpa}</span>
                                            <span className="text-sm font-bold text-neutral-300">/ 4.00</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onViewChange('edu-transcript')}
                                        icon={<FileText className="w-4 h-4" />}
                                        className="rounded-xl font-bold text-[10px]"
                                    >
                                        Registry
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 border border-neutral-100 dark:border-white/5 shadow-sm group hover:shadow-xl hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Degree Completion</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-neutral-900 dark:text-white font-mono tracking-tighter">{totalCredits}</span>
                                            <span className="text-sm font-bold text-neutral-300">/ {targetCredits} credits</span>
                                        </div>
                                    </div>
                                    <div className="relative w-16 h-16 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-50 dark:text-neutral-800" />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                fill="transparent"
                                                className="text-emerald-500 transition-all duration-1000 ease-out"
                                                strokeDasharray={175.84}
                                                strokeDashoffset={175.84 - (175.84 * progressPercentage) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute text-[10px] font-black text-neutral-900 dark:text-white">{Math.round(progressPercentage)}%</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                                            {totalCredits >= targetCredits ? 'Requirements Met' : 'Coursework Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
