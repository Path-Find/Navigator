import React from 'react';
import { Sparkles } from 'lucide-react';

interface CoverLetterComparisonViewProps {
    versions: { text: string; promptVersion: string }[];
    handleSelectVariant: (variant: { text: string; promptVersion: string }) => void;
}

export const CoverLetterComparisonView: React.FC<CoverLetterComparisonViewProps> = ({
    versions,
    handleSelectVariant
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
            {versions.map((v, i) => (
                <div key={i} className="flex flex-col space-y-6 p-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-[10px] font-black text-neutral-400 shadow-sm">
                        Style Option {i + 1}
                    </div>
                    <div className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed line-clamp-[18]">
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
    );
};
