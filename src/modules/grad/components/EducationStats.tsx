import React from 'react';
import { GraduationCap, Calculator, BarChart3, Info, Sparkles, School } from 'lucide-react';
import type { Transcript } from '../../../types';
import type { ViewId } from '../../../utils/navigation';
import { BentoCard } from '../../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../../featureRegistry';

interface EducationStatsProps {
    transcript: Transcript | null;
    calculatedGpa: string;
    totalCredits: number;
    targetCredits: number;
    progressPercentage: number;
    onViewChange: (view: ViewId) => void;
}

export const EducationStats: React.FC<EducationStatsProps> = ({
    transcript,
    calculatedGpa,
    totalCredits,
    targetCredits,
    progressPercentage,
    onViewChange
}) => {
    // Determine effective target credits
    const displayTarget = targetCredits || 120; // Default to 120 if not set

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Stat: Academic Overview */}
            <BentoCard
                id="academic-overview"
                icon={GraduationCap}
                title="Academic"
                description={transcript?.university || (transcript ? "University" : "Academic standing")}
                color={FEATURE_COLORS.amber}
                previewContent={
                    transcript ? (
                        <div className="flex items-end gap-6 px-2">
                            <div className="flex flex-col">
                                <div className="text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tighter leading-none hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                                    {calculatedGpa}
                                </div>
                                <div className="text-[9px] tracking-[0.2em] font-black text-neutral-400 dark:text-white/40 mt-3">GPA</div>
                            </div>
                            <div className="w-px h-10 bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
                            <div className="flex flex-col">
                                <div className="text-xl font-black text-neutral-900 dark:text-white truncate max-w-[120px]">
                                    {transcript.program?.split(' ')[0] || 'Major'}
                                </div>
                                <div className="text-[9px] tracking-[0.2em] font-black text-neutral-400 dark:text-white/40 mt-1 uppercase">Program</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-2 text-neutral-300 dark:text-neutral-700 italic">
                            <Info className="w-5 h-5 opacity-50" />
                            <span className="text-[11px] font-bold">Upload to see stats</span>
                        </div>
                    )
                }
                onAction={transcript ? () => onViewChange('edu-transcript') : undefined}
                actionLabel={transcript ? "Transcript" : undefined}
            />

            {/* Stat: Degree Progress */}
            <BentoCard
                id="degree-progress"
                icon={BarChart3}
                title="Progress"
                description={targetCredits > 0 ? "Credits earned toward degree." : "Set your degree credit target."}
                color={FEATURE_COLORS.emerald}
                previewContent={
                    <div className="flex items-center gap-6 px-2 w-full">
                        <div className="flex flex-col">
                            <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                                {totalCredits}
                            </div>
                            <div className="text-[9px] tracking-[0.2em] font-black text-neutral-400 dark:text-white/40 mt-3">CREDITS</div>
                        </div>

                        <div className="flex-1 flex flex-col justify-end h-full py-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-emerald-600 tracking-widest">{targetCredits > 0 ? `${Math.round(progressPercentage)}%` : '--'}</span>
                                <span className="text-[10px] font-bold text-neutral-400">/ {displayTarget}</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${targetCredits > 0 ? progressPercentage : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                }
                onAction={() => onViewChange('edu-transcript')}
                actionLabel={targetCredits === 0 ? "Set Goal" : "Target"}
            />

            {/* Action: Programs */}
            <BentoCard
                id="edu-programs"
                icon={School}
                title="Programs"
                description="Explore master's degrees and certs."
                onAction={() => onViewChange('edu-programs')}
                actionLabel="Explore"
                color={FEATURE_COLORS.amber}
                previewContent={
                    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full scale-110 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-amber-500/10 shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out">
                            <Sparkles className="w-8 h-8 text-amber-500 relative z-10" />
                        </div>
                    </div>
                }
            />

            {/* Action: GPA Calculator */}
            <BentoCard
                id="edu-gpa"
                icon={Calculator}
                title="GPA"
                description="Calculate targets and track performance."
                onAction={() => onViewChange('edu-gpa')}
                actionLabel="Calculate"
                color={FEATURE_COLORS.blue}
                previewContent={
                    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full scale-110 group-hover:scale-150 transition-transform duration-1000" />

                        {/* Calculator Mockup */}
                        <div className="relative w-10 h-12 bg-white dark:bg-neutral-800 rounded-lg border border-blue-500/10 shadow-lg p-1.5 flex flex-col gap-1 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                            <div className="h-2 w-full bg-blue-500/10 rounded-sm mb-0.5" />
                            <div className="grid grid-cols-3 gap-0.5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-1 w-full bg-neutral-100 dark:bg-neutral-700 rounded-sm" />
                                ))}
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
