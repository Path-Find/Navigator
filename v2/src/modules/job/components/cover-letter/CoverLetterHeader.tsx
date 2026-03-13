import React from 'react';
import { Loader2, Sparkles, PenTool, Copy, Check } from 'lucide-react';
import type { UserTier } from '../../../../types/app';

interface CoverLetterHeaderProps {
    coverLetter?: string;
    userTier: UserTier;
    generating: boolean;
    analysisProgress: string | null;
    copiedState: 'cl' | null;
    handleCopy: (text: string) => void;
    handleGenerateCoverLetter: () => void;
    setShowContextInput: (show: boolean) => void;
}

export const CoverLetterHeader: React.FC<CoverLetterHeaderProps> = ({
    coverLetter,
    userTier,
    generating,
    analysisProgress,
    copiedState,
    handleCopy,
    handleGenerateCoverLetter,
    setShowContextInput
}) => {
    return (
        <div className="p-8 border-b border-neutral-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-neutral-900/50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                    <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-black text-neutral-900 dark:text-white tracking-tight">Cover Letter Draft</h3>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {coverLetter && (
                    <button
                        onClick={() => handleCopy(coverLetter)}
                        className="text-[10px] font-black px-5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        {copiedState === 'cl' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedState === 'cl' ? 'Copied' : 'Copy Text'}
                    </button>
                )}
                {(!coverLetter || userTier !== 'free') && (
                    <button
                        onClick={() => {
                            if (coverLetter) {
                                setShowContextInput(true);
                            } else {
                                handleGenerateCoverLetter();
                            }
                        }}
                        disabled={generating}
                        className="text-[10px] font-black px-5 py-2.5 bg-neutral-900 dark:bg-indigo-600 text-white rounded-xl hover:bg-neutral-800 dark:hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {generating ? (analysisProgress || 'Writing...') : coverLetter ? 'Refine Draft' : 'Generate Draft'}
                    </button>
                )}
            </div>
        </div>
    );
};
