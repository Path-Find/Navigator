import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CoverLetterVariant } from '../../types';

interface CoverLetterComparisonViewProps {
    versions: CoverLetterVariant[];
    handleSelectVariant: (variant: CoverLetterVariant) => void;
    handleRejectVariants: () => void;
}

export const CoverLetterComparisonView: React.FC<CoverLetterComparisonViewProps> = ({
    versions,
    handleSelectVariant,
    handleRejectVariants
}) => {
    return (
        <div className="flex flex-col h-full space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {versions.map((v, i) => (
                <div key={i} className="flex flex-col space-y-6 p-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-[10px] font-black text-neutral-400 shadow-sm">
                        {v.styleLabel}
                    </div>
                    <div className="pt-2">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{v.styleDescription}</p>
                    </div>
                    <div className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-[18]">
                        {v.text}
                    </div>
                    <button
                        onClick={() => handleSelectVariant(v)}
                        className="w-full py-3.5 bg-neutral-900 dark:bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-neutral-800 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Use This Style
                    </button>
                </div>
            ))}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleRejectVariants}
                    className="text-[11px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-widest px-6 py-3 border border-neutral-100 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                    None of these work for me
                </button>
            </div>
        </div>
    );
};
