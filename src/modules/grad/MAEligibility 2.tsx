import React, { useState } from 'react';
import { School, Search, AlertTriangle, Loader2, Sparkles, Target, ArrowRight } from 'lucide-react';
import { analyzeMAEligibility } from '../../services/ai/eduAiService';
import { useToast } from '../../contexts/ToastContext';
import type { Transcript, AdmissionEligibility } from '../../types';

interface MAEligibilityProps {
    transcript: Transcript;
    initialProgram?: string;
}

export const MAEligibility: React.FC<MAEligibilityProps> = ({ transcript, initialProgram }) => {
    const [targetProgram, setTargetProgram] = useState(initialProgram || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AdmissionEligibility | null>(null);
    const { showError } = useToast();

    // Sync with initialProgram prop
    React.useEffect(() => {
        if (initialProgram) {
            setTargetProgram(initialProgram);
        }
    }, [initialProgram]);

    const handleAnalysis = async () => {
        if (!targetProgram.trim()) return;
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeMAEligibility(transcript, targetProgram);
            setResult(analysis);
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : "Failed to analyze eligibility");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-neutral-700/50 p-8 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors duration-700" />

            <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                        <School className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-neutral-900 dark:text-white tracking-tight text-left">Match Profile</h3>
                        <p className="text-sm text-neutral-500 font-medium text-left">The admissions "A to B" trajectory.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 relative">
                <div className="flex gap-3">
                    <div className="relative flex-1 group/input">
                        <input
                            type="text"
                            placeholder="e.g. University of Waterloo - Masters of Urban Planning"
                            value={targetProgram}
                            onChange={(e) => setTargetProgram(e.target.value)}
                            className="w-full px-5 py-3.5 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
                        />
                        <Search className="w-5 h-5 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-rose-500 transition-colors" />
                    </div>
                    <button
                        onClick={handleAnalysis}
                        disabled={isAnalyzing || !targetProgram}
                        className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Researching...
                            </>
                        ) : (
                            'Analyze Match'
                        )}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Trajectory Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-neutral-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-xs font-bold text-rose-500 mb-2">Current Standing (A)</span>
                                <div className="text-2xl font-black">{transcript.cgpa || '8.2'}/10.0</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1">{transcript.university || 'Your University'}</div>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
                                    <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-black transition-colors ${result.probability === 'High' ? 'border-emerald-500' :
                                        result.probability === 'Medium' ? 'border-amber-500' : 'border-rose-500'
                                        }`}>
                                        <div className="text-3xl font-black leading-none">{result.probability === 'High' ? '85' : result.probability === 'Medium' ? '65' : '45'}%</div>
                                        <div className="text-[9px] font-bold text-white/70 tracking-tight mt-1">Match Score</div>
                                    </div>
                                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 md:hidden">
                                        <ArrowRight className="w-6 h-6 text-neutral-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end text-center md:text-right">
                                <span className="text-xs font-bold text-rose-500 mb-2">Target Goal (B)</span>
                                <div className="text-lg font-black leading-tight max-w-[150px]">{targetProgram}</div>
                                <div className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Admission Target</div>
                            </div>
                        </div>

                        {/* Benchmark & Prerequisites Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* GPA Benchmark */}
                            <div className="lg:col-span-1 space-y-6">
                                {result.gpaBenchmark && (
                                    <div className="p-8 bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 shadow-sm relative group/bench">
                                        <div className="absolute top-4 right-4">
                                            <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${result.gpaBenchmark.standing === 'Safe' ? 'bg-emerald-100 text-emerald-600' :
                                                result.gpaBenchmark.standing === 'Competitive' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-rose-100 text-rose-600'
                                                }`}>
                                                {result.gpaBenchmark.standing}
                                            </div>
                                        </div>
                                        <h4 className="text-xs font-bold text-neutral-400 tracking-tight mb-8 text-left">The Competitive Curve</h4>
                                        <div className="relative h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full mb-8">
                                            <div className="absolute inset-y-0 left-[20%] right-[30%] bg-indigo-500/20 rounded-full" title="Typical Intake Range" />
                                            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-lg transition-all duration-1000" style={{ left: `calc(${result.gpaBenchmark.userGPA.replace('%', '')}% - 8px)` }}>
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-600 whitespace-nowrap">You ({result.gpaBenchmark.userGPA})</div>
                                            </div>
                                            <div className="absolute bottom-[-1.5rem] left-[45%] text-[9px] font-bold text-neutral-400 tracking-tight">Intake Average ({result.gpaBenchmark.typicalIntake})</div>
                                        </div>
                                        <p className="text-xs text-neutral-500 font-bold leading-relaxed text-left">{result.gpaContext}</p>
                                    </div>
                                )}

                                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-tight mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Trajectory Risks
                                    </h4>
                                    <ul className="space-y-3">
                                        {result.weaknesses.map((w, i) => (
                                            <li key={i} className="text-xs text-neutral-700 dark:text-neutral-300 font-bold flex items-start gap-2 text-left">
                                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 shrink-0" />
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Prerequisite "Traffic Light" Grid */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <h4 className="text-xs font-bold text-neutral-400 tracking-tight">Prerequisite "Traffic Light" Mapping</h4>
                                    <div className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full italic">
                                        Research-Backed Requirements
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {result.prerequisites?.map((prereq, i) => (
                                        <div key={i} className="flex flex-col p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 group/item hover:border-indigo-200 transition-all text-left">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full animate-pulse ${prereq.status === 'met' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                        prereq.status === 'in-progress' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                                            'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]'
                                                        }`} />
                                                    <div className="font-black text-sm text-neutral-900 dark:text-white truncate max-w-[120px]">{prereq.requirement}</div>
                                                </div>
                                                <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${prereq.status === 'met' ? 'bg-emerald-100 text-emerald-600' :
                                                    prereq.status === 'in-progress' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {prereq.status}
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 font-bold mb-3 leading-relaxed">{prereq.description}</p>
                                            {prereq.mapping && (
                                                <div className="mt-auto pt-3 border-t border-neutral-50 dark:border-neutral-800 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-neutral-400 tracking-tight">Transcript Match</span>
                                                    <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-400">{prereq.mapping}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Strategic Bridging Roadmap */}
                        <div className="bg-neutral-900 dark:bg-black rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-left">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Target className="w-48 h-48 text-rose-500" />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative">
                                <div>
                                    <h4 className="font-black text-white text-3xl tracking-tight flex items-center gap-4">
                                        <Sparkles className="w-8 h-8 text-rose-500" />
                                        Functional Bridging Plan
                                    </h4>
                                    <p className="text-neutral-500 font-bold mt-2">Tactical steps to fill the blanks in your application.</p>
                                </div>
                                <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 shrink-0">
                                    <div className="text-xs font-bold text-rose-500 tracking-tight mb-1">Estimated Gap</div>
                                    <div className="text-lg font-black text-white">4-6 Months</div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 relative">
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-5 p-6 bg-white/5 hover:bg-white/10 transition-colors rounded-[2rem] border border-white/5 group/item">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-sm shrink-0 group-hover/item:bg-rose-500 group-hover/item:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-neutral-200 text-sm font-bold leading-relaxed">{rec}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
