import React, { useState } from 'react';
import { Sparkles, Loader2, ExternalLink, GraduationCap, Briefcase } from 'lucide-react';
import { extractProjectsFromCourses } from '../../../services/ai/eduAiService';
import { useToast } from '../../../contexts/ToastContext';
import type { Transcript, ProjectProposal } from '../../../types';

interface PortfolioProposerProps {
    transcript: Transcript;
}

export const PortfolioProposer: React.FC<PortfolioProposerProps> = ({ transcript }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [proposals, setProposals] = useState<ProjectProposal[] | null>(null);
    const { showError } = useToast();

    const handleExtraction = async () => {
        setIsAnalyzing(true);
        try {
            const result = await extractProjectsFromCourses(transcript);
            setProposals(result);
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Failed to extract projects');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-neutral-900 dark:text-white tracking-tight text-left">Portfolio Proposer</h3>
                        <p className="text-sm text-neutral-500 font-medium text-left">Turn academic grades into tangible job assets.</p>
                    </div>
                </div>
            </div>

            {!proposals ? (
                <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 relative">
                    <p className="text-sm text-neutral-500 font-bold mb-6 max-w-sm mx-auto">
                        Identify courses where you likely built significant projects and transform them into resume-ready blocks.
                    </p>
                    <button
                        onClick={handleExtraction}
                        disabled={isAnalyzing}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto disabled:opacity-50 active:scale-95"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing Courses...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Propose Portfolio
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 gap-4">
                        {proposals.map((project, idx) => (
                            <div key={idx} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl hover:border-emerald-200 transition-all shadow-sm group/card text-left">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded uppercase">{project.course}</span>
                                            <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-tight">{project.title}</h4>
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium leading-relaxed italic pr-4">
                                            "{project.description}"
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-400 group-hover/card:bg-emerald-500 group-hover/card:text-white flex items-center justify-center transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.skills.map((skill: string, si: number) => (
                                        <span key={si} className="text-[9px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-md uppercase tracking-wider">{skill}</span>
                                    ))}
                                    <div className="ml-auto text-[10px] font-black text-neutral-300 uppercase flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" />
                                        Evidence: {project.evidence}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setProposals(null)}
                        className="text-[10px] font-black text-neutral-400 hover:text-emerald-600 uppercase tracking-widest transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};
