import React from 'react';
import {
    Map,
    CheckCircle2,
    Target,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import type { TargetJob } from '../../../types';
import type { CoachViewType } from '../types';

interface GrowthPageProps {
    targetJobs: TargetJob[];
    onToggleMilestone: (targetJobId: string, milestoneId: string) => Promise<void>;
    onViewChange: (view: CoachViewType) => void;
}

export const GrowthPage: React.FC<GrowthPageProps> = ({
    targetJobs,
    onToggleMilestone,
    onViewChange
}) => {
    const jobsWithRoadmaps = targetJobs.filter(tj => tj.roadmap && tj.roadmap.length > 0);

    const totalMilestones = jobsWithRoadmaps.reduce((sum, tj) => sum + (tj.roadmap?.length || 0), 0);
    const completedMilestones = jobsWithRoadmaps.reduce(
        (sum, tj) => sum + (tj.roadmap?.filter(m => m.status === 'completed').length || 0), 0
    );
    const overallPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // Empty state: no roadmaps generated yet
    if (jobsWithRoadmaps.length === 0) {
        return (
            <>
                <PageHeader
                    variant="hero"
                    title="Your Growth Roadmap"
                    subtitle="Track your career milestones in one place."
                />

                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-sm px-8">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-8">
                            <Map className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">No Roadmaps Yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10 leading-relaxed">
                            Set a career goal, run a gap analysis, then generate your personalized 12-month roadmap to start tracking milestones here.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => onViewChange('coach-home')}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Target className="w-5 h-5" />
                                Set a Career Goal
                            </button>
                            <button
                                onClick={() => onViewChange('coach-gap-analysis')}
                                className="px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <TrendingUp className="w-5 h-5" />
                                View Goals
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-700 max-w-lg mx-auto text-left flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-neutral-900 dark:text-white">How It Works</div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Career → Set Goal → Run Gap Analysis → Generate Roadmap. Your milestones will appear here as a trackable timeline.
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Active state: roadmaps exist
    return (
        <>
            <PageHeader
                variant="hero"
                title="Your Growth Roadmap"
                subtitle="Track your career milestones in one place."
            />

            <div className="max-w-4xl mx-auto px-6 space-y-10 animate-in fade-in duration-500">
                {/* Aggregate Progress */}
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Map className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 dark:text-white">Overall Progress</h2>
                                <p className="text-xs text-neutral-400">{jobsWithRoadmaps.length} active roadmap{jobsWithRoadmaps.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-500">{overallPercent}%</div>
                    </div>

                    <div className="mt-4 h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            style={{ width: `${overallPercent}%` }}
                        />
                    </div>

                    <div className="mt-3 flex items-center gap-6 text-xs text-neutral-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            {completedMilestones} Completed
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            {totalMilestones - completedMilestones} Remaining
                        </div>
                    </div>
                </div>

                {/* Per-Goal Roadmap Cards */}
                {jobsWithRoadmaps.map(tj => {
                    const completed = tj.roadmap!.filter(m => m.status === 'completed').length;
                    const total = tj.roadmap!.length;
                    const percent = Math.round((completed / total) * 100);

                    return (
                        <div key={tj.id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            {/* Goal Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${tj.type === 'role_model' ? 'text-indigo-500' : 'text-emerald-600'}`}>
                                        {tj.type === 'role_model' ? 'Emulation Path' : 'Target Goal'}
                                    </div>
                                    <h3 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                        {tj.type === 'role_model' && <TrendingUp className="w-5 h-5 text-indigo-500" />}
                                        {tj.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-emerald-500">{percent}%</span>
                                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                        Month {Math.max(...tj.roadmap!.map(m => m.month))} Projected
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-3xl border border-neutral-200/50 dark:border-neutral-700/30 mb-8">
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-[10px] text-neutral-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        {completed} Completed
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                        {total - completed} Remaining
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Milestone Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(12)].map((_, i) => {
                                    const month = i + 1;
                                    const monthMilestones = tj.roadmap?.filter(m => m.month === month) || [];
                                    if (monthMilestones.length === 0) return null;

                                    return (
                                        <div key={month} className="p-4 rounded-3xl border border-emerald-500/30 bg-emerald-50/10">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 ml-1">Month {month}</div>
                                            <div className="space-y-2">
                                                {monthMilestones.map(m => (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => onToggleMilestone(tj.id, m.id)}
                                                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${m.status === 'completed'
                                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm'
                                                            }`}
                                                    >
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.status === 'completed' ? 'bg-emerald-500' :
                                                            m.type === 'project' ? 'bg-blue-500' :
                                                                m.type === 'certification' ? 'bg-emerald-500' :
                                                                    m.type === 'metric' ? 'bg-emerald-500' : 'bg-neutral-400'
                                                            }`} />

                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <div className={`text-[11px] font-bold mb-1 line-clamp-1 ${m.status === 'completed' ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'}`}>
                                                                    {m.title}
                                                                </div>
                                                                <div className="text-[9px] text-neutral-400 flex items-center gap-1">
                                                                    <span className="capitalize">{m.type}</span>
                                                                    <span>•</span>
                                                                    <span>{m.linkedSkill}</span>
                                                                </div>
                                                            </div>
                                                            {m.status === 'completed' && (
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                            )}
                                                        </div>
                                                        {m.status === 'completed' && (
                                                            <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px] pointer-events-none" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
