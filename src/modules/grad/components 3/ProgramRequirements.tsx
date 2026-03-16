import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Sparkles, Loader2, Target } from 'lucide-react';
import type { AdmissionEligibility } from '../types';

interface ProgramRequirementsProps {
    requirements: AdmissionEligibility | null;
    isAnalyzing: boolean;
    onAnalyze: () => void;
    programName?: string;
}

export const ProgramRequirements: React.FC<ProgramRequirementsProps> = ({
    requirements,
    isAnalyzing,
    onAnalyze,
    programName
}) => {
    if (!requirements && !isAnalyzing) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 mx-auto shadow-inner">
                    <Target className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white">Degree Requirement Tracking</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-xs mx-auto text-sm mt-1">
                        Use AI to analyze your transcript against standard {programName || 'Degree'} requirements.
                    </p>
                </div>
                <button
                    onClick={onAnalyze}
                    className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-amber-500/10 flex items-center gap-2 mx-auto"
                >
                    <Sparkles className="w-4 h-4" />
                    Analyze Requirements
                </button>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white">Mapping your trajectory...</h3>
                    <p className="text-neutral-500 font-medium text-sm animate-pulse tracking-wide uppercase text-[10px]">Consulting Navigator AI Advisor</p>
                </div>
            </div>
        );
    }

    if (!requirements) return null;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Degree Mapping</div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Core Requirements</h3>
                </div>
                <button
                    onClick={onAnalyze}
                    className="p-2 text-neutral-400 hover:text-amber-500 transition-colors"
                    title="Refresh analysis"
                >
                    <Sparkles className="w-4 h-4" />
                </button>
            </div>

            <div className="grid gap-3">
                {requirements.prerequisites?.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className={`shrink-0 ${req.status === 'met' ? 'text-emerald-500' :
                                    req.status === 'in-progress' ? 'text-amber-500' : 'text-neutral-300'
                                }`}>
                                {req.status === 'met' ? <CheckCircle2 className="w-5 h-5" /> :
                                    req.status === 'in-progress' ? <Circle className="w-5 h-5 fill-current opacity-20" /> :
                                        <Circle className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {req.requirement}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-medium">{req.description}</div>
                            </div>
                        </div>
                        {req.mapping && (
                            <div className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg uppercase">
                                {req.mapping}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-6 bg-neutral-900 dark:bg-black rounded-3xl text-white relative overflow-hidden group/card shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target className="w-24 h-24 text-amber-500" />
                </div>
                <div className="relative z-10 space-y-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-amber-500">Navigator Verdict</h4>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{requirements.analysis}</p>
                    <div className="pt-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Next Step: {requirements.recommendations[0]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
