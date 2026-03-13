import React from 'react';
import {
    Target,
    GraduationCap,
    TrendingUp,
    CheckCircle2,
    Loader2,
    Search,
    Plus,
    Map,
    Calendar,
    Copy,
    ArrowRight
} from 'lucide-react';
import type { RoleModelProfile, TargetJob, Transcript } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

interface GapAnalysisSectionProps {
    targetJobs: TargetJob[];
    roleModels: RoleModelProfile[];
    transcript: Transcript | null;
    onUpdateTargetJob: (job: TargetJob) => Promise<void>;
    onAddTargetJob: (url: string) => Promise<void>;
    onRunGapAnalysis: (targetJobId: string) => Promise<void>;
    onGenerateRoadmap: (targetJobId: string) => Promise<void>;
    onToggleMilestone: (targetJobId: string, milestoneId: string) => Promise<void>;
    onCompare?: (roleModelId: string) => void;
    activeAnalysisIds?: Set<string>;
}

export const GapAnalysisSection: React.FC<GapAnalysisSectionProps> = ({
    targetJobs,
    roleModels,
    transcript,
    onUpdateTargetJob,
    onAddTargetJob,
    onRunGapAnalysis,
    onGenerateRoadmap,
    onToggleMilestone,
    onCompare,
    activeAnalysisIds = new Set()
}) => {
    const { showSuccess } = useToast();

    return (
        <div className="max-w-4xl mx-auto px-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center border-2 border-emerald-500/20">
                        <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white">Growth Analysis</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">Comparing your <strong>persisted resume</strong> & <strong>skills</strong> against {roleModels.length} Role Models.</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {/* Academic Badge */}
                    {transcript && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 rounded-lg border border-violet-100 dark:border-violet-800/30">
                            <GraduationCap className="w-3 h-3" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Academic Context Active</span>
                        </div>
                    )}

                    {/* Strict Mode Toggle */}
                    <div
                        className="relative flex items-center p-1 bg-neutral-100/80 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 backdrop-blur-sm cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all"
                        onClick={() => {
                            // Toggle strict mode and clear analysis to force re-run
                            targetJobs.forEach(tj => {
                                onUpdateTargetJob({
                                    ...tj,
                                    strictMode: !(tj.strictMode ?? true),
                                    gapAnalysis: undefined // Clear analysis to force re-run
                                });
                            });
                        }}
                        title="Toggle between Technical Skills only or Generic Skills"
                    >
                        {/* Sliding Background Pill */}
                        <div
                            className={`absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-300 ease-out ${targetJobs.every(t => t.strictMode !== false) ? 'left-[calc(50%+2px)]' : 'left-1'
                                }`}
                        />

                        <div className={`relative z-10 px-4 py-1.5 text-[10px] uppercase tracking-widest font-black transition-colors duration-300 flex items-center justify-center min-w-[80px] ${targetJobs.every(t => t.strictMode !== false) ? 'text-neutral-400 dark:text-neutral-500' : 'text-white'
                            }`}>
                            General
                        </div>
                        <div className={`relative z-10 px-4 py-1.5 text-[10px] uppercase tracking-widest font-black transition-colors duration-300 flex items-center justify-center min-w-[80px] ${targetJobs.every(t => t.strictMode !== false) ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                            }`}>
                            Technical
                        </div>
                    </div>
                </div>
            </div>

            {targetJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {targetJobs.map(tj => (
                        <div key={tj.id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${tj.type === 'role_model' ? 'text-indigo-500' : 'text-emerald-600'}`}>
                                        {tj.type === 'role_model' ? 'Emulation Path' : 'Target Goal'}
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                        {tj.type === 'role_model' && <TrendingUp className="w-6 h-6 text-indigo-500" />}
                                        {tj.title}
                                    </h3>
                                </div>
                                {!tj.gapAnalysis ? (
                                    <button
                                        onClick={() => onRunGapAnalysis(tj.id)}
                                        disabled={activeAnalysisIds?.has(tj.id)}
                                        className={`px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 ${tj.type === 'role_model' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-neutral-900 dark:bg-emerald-600'}`}
                                    >
                                        {activeAnalysisIds?.has(tj.id) ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <TrendingUp className="w-4 h-4" />
                                        )}
                                        {activeAnalysisIds?.has(tj.id) ? 'Analyzing Path...' : 'Start Growth Analysis'}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Analysis Complete
                                        </div>
                                        {tj.type === 'role_model' && tj.roleModelId && onCompare && (
                                            <button
                                                onClick={() => onCompare(tj.roleModelId!)}
                                                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/30"
                                            >
                                                Compare Trajectory
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {tj.gapAnalysis && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Search className="w-5 h-5 text-emerald-500" />
                                                The Role Model Benchmark
                                            </h4>
                                            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                                                {tj.gapAnalysis.careerTrajectoryGap}
                                            </div>
                                        </div>

                                        {tj.gapAnalysis.strategicPathPatterns && tj.gapAnalysis.strategicPathPatterns.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {tj.gapAnalysis.strategicPathPatterns.map((pattern, pidx) => (
                                                    <div key={pidx} className="p-5 bg-white dark:bg-neutral-900 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl shadow-sm hover:border-emerald-500/30 transition-all group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                                                {pattern.prevalence}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-neutral-400">
                                                                {pattern.timing}
                                                            </div>
                                                        </div>
                                                        <h5 className="font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                                                            {pattern.title}
                                                        </h5>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                                            {pattern.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-lg font-bold flex items-center gap-2">
                                                <Plus className="w-5 h-5 text-emerald-500" />
                                                Priority Growth Areas
                                            </h4>
                                            <div className={`text-[10px] px-3 py-1 rounded-full font-bold border ${tj.strictMode !== false ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-800' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'}`}>
                                                {tj.strictMode !== false ? 'Focus: Technical Skills' : 'View: Holistic (All Skills)'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {tj.gapAnalysis.topSkillGaps.map((gap, idx) => (
                                                <div key={idx} className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="font-bold text-neutral-900 dark:text-white">{gap.skill}</div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < gap.importance ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 mb-6">{gap.gapDescription}</p>

                                                    <div className="mt-auto space-y-3">
                                                        <div className="text-[9px] uppercase tracking-widest font-black text-neutral-400">Actionable Evidence</div>
                                                        {gap.actionableEvidence.map((action, aidx) => (
                                                            <div key={aidx} className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 group/action relative">
                                                                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                                    {action.task}
                                                                </div>
                                                                <div className="text-[10px] text-neutral-400">Prove it: {action.metric}</div>

                                                                {action.resumeBullet && (
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(action.resumeBullet!);
                                                                            showSuccess("Evidence copied! Paste this into your profile or resume.");
                                                                        }}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-neutral-800 text-neutral-400 hover:text-emerald-600 rounded-lg border border-neutral-100 dark:border-neutral-700 opacity-0 group-hover/action:opacity-100 transition-all shadow-sm"
                                                                        title="Copy Resume Bullet"
                                                                    >
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                                        <div>Estimated Bridge Time: <span className="text-emerald-500 font-bold">{tj.gapAnalysis.estimatedTimeToBridge}</span></div>
                                        <div>Generated {new Date(tj.gapAnalysis.dateGenerated).toLocaleDateString()}</div>
                                    </div>

                                    {!tj.roadmap ? (
                                        <div className="p-8 bg-neutral-900 rounded-[2rem] text-white flex flex-col items-center text-center gap-6">
                                            <Map className="w-12 h-12 text-emerald-500" />
                                            <div>
                                                <h4 className="text-xl font-bold mb-2">Build your 12-Month Trajectory</h4>
                                                <p className="text-neutral-400 text-sm max-w-md mx-auto">
                                                    Ready to bridge these gaps? We'll sequence your actionable tasks into a step-by-step professional roadmap.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onGenerateRoadmap(tj.id)}
                                                disabled={activeAnalysisIds?.has(`${tj.id}-roadmap`)}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                                            >
                                                {activeAnalysisIds?.has(`${tj.id}-roadmap`) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Calendar className="w-4 h-4" />
                                                )}
                                                {activeAnalysisIds?.has(`${tj.id}-roadmap`) ? 'Generating...' : 'Generate Roadmap'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-bold flex items-center gap-2">
                                                    <Calendar className="w-6 h-6 text-emerald-500" />
                                                    12-Month Trajectory
                                                </h4>
                                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                                    Month {Math.max(...tj.roadmap.map(m => m.month))} Projected
                                                </div>
                                            </div>

                                            <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-3xl border border-neutral-200/50 dark:border-neutral-700/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Overall Progress</span>
                                                    <span className="text-sm font-black text-emerald-500">
                                                        {Math.round((tj.roadmap.filter(m => m.status === 'completed').length / tj.roadmap.length) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                        style={{ width: `${(tj.roadmap.filter(m => m.status === 'completed').length / tj.roadmap.length) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="mt-3 flex items-center gap-4 text-[10px] text-neutral-400 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        {tj.roadmap.filter(m => m.status === 'completed').length} Completed
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                                        {tj.roadmap.filter(m => m.status !== 'completed').length} Remaining
                                                    </div>
                                                </div>
                                            </div>

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
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-sm px-6">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">No Career Goals Defined</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10">Add a target role or career goal below to run your first Growth Analysis.</p>

                        <div className="max-w-xl mx-auto">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const input = form.elements.namedItem('goalUrl') as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (!value) return;

                                    const btn = form.querySelector('button');
                                    if (btn) btn.disabled = true;
                                    try {
                                        await onAddTargetJob(value);
                                        input.value = '';
                                    } finally {
                                        if (btn) btn.disabled = false;
                                    }
                                }}
                                className="relative flex flex-col md:flex-row items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-[2rem] border border-neutral-200 dark:border-neutral-700"
                            >
                                <input
                                    name="goalUrl"
                                    type="text"
                                    placeholder="Paste a LinkedIn Job URL or type a title..."
                                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-neutral-900 dark:text-white px-4 py-3 placeholder:text-neutral-400"
                                />
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Set Goal
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-700 max-w-lg mx-auto text-left flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-sm text-neutral-900 dark:text-white">Quick Tip</div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Found an interesting role? Paste the URL above and we'll analyze exactly what's missing from your profile.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
