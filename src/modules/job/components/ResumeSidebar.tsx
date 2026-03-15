import React from 'react';
import { Card } from '../../../components/ui/Card';
import { getScoreLabel, getScoreColorClasses } from '../utils/jobUtils';
import type { SavedJob } from '../types';

interface ResumeSidebarProps {
    job: SavedJob;
    analysisProgress: string | null;
}

export const ResumeSidebar: React.FC<ResumeSidebarProps> = ({ job, analysisProgress }) => {
    const analysis = job.analysis;

    if (job.status === 'analyzing' || analysisProgress) {
        return (
            <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
                <div className="animate-pulse space-y-6">
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-16 bg-neutral-50 dark:bg-neutral-900 rounded-[1.5rem]"></div>
                        <div className="h-16 bg-neutral-50 dark:bg-neutral-900 rounded-[1.5rem]"></div>
                    </div>
                </div>
            </Card>
        );
    }

    const tailoringFocus = analysis?.resumeTailoringInstructions || analysis?.tailoringInstructions || [];

    const score = job.analysis?.compatibilityScore;
    const scoreLabel = getScoreLabel(score);
    const scoreColor = getScoreColorClasses(score);
    const isStrong = score != null && score >= 80;

    return (
        <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
            <div className="mb-8">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400">How We Built This</h4>
            </div>

            {tailoringFocus.length > 0 ? (
                <div className="mb-8 space-y-3">
                    {tailoringFocus.map((item: string, idx: number) => (
                        <div key={idx} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-xs text-neutral-500 italic py-4 text-center mb-8">No tailoring data available.</div>
            )}

            {score != null && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/50">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-400 tracking-tight">Match Quality</span>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${scoreColor}`}>
                            <div className={`w-1 h-1 rounded-full ${isStrong ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            {scoreLabel}
                        </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                        {isStrong 
                            ? "Your profile reveals a high degree of alignment with the mission-critical needs of this role."
                            : "A partial match. Focus on the core skills below to improve your standing."
                        }
                    </p>
                </div>
            )}
        </Card>
    );
};
