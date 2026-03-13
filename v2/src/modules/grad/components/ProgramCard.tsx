import React from 'react';
import { ExternalLink, Sparkles, MapPin, GraduationCap } from 'lucide-react';
import type { Program } from '../types/discovery';

interface ProgramCardProps {
    program: Program;
    onAnalyze?: (program: Program) => void;
    isAnalyzing?: boolean;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onAnalyze, isAnalyzing }) => {
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

            <div className="flex flex-col h-full gap-4 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-md">
                            {program.type}
                        </span>
                        {program.isVerified && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 px-2 py-0.5 rounded-md">
                                Verified
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-black text-neutral-900 dark:text-white leading-tight mb-1 group-hover:text-emerald-600 transition-colors break-words">
                        {program.name}
                    </h3>
                    <p className="text-xs font-bold text-neutral-500">{program.institution}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {program.location.city}, {program.location.province}
                </div>

                <div className="flex flex-wrap gap-1.5 py-1">
                    {program.keywords.map(kw => (
                        <span key={kw} className="px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 rounded-lg text-[9px] font-bold text-neutral-400">
                            {kw}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-4 flex items-center gap-3">
                    <a
                        href={program.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl text-xs font-black text-neutral-500 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                    >
                        Visit Site
                        <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                        onClick={() => onAnalyze?.(program)}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <Sparkles className="w-3 h-3 animate-pulse" />
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3" />
                                Match Profile
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
