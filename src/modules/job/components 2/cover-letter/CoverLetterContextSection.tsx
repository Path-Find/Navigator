import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

interface CoverLetterContextSectionProps {
    contextNotes?: string;
    generating: boolean;
    handleUpdateContext: (value: string) => void;
    handleGenerateCoverLetter: () => void;
    setShowContextInput: (show: boolean) => void;
    hasCoverLetter: boolean;
}

export const CoverLetterContextSection: React.FC<CoverLetterContextSectionProps> = ({
    contextNotes,
    generating,
    handleUpdateContext,
    handleGenerateCoverLetter,
    setShowContextInput,
    hasCoverLetter
}) => {
    return (
        <Card variant="premium" className="p-8 border-indigo-500/10 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-neutral-900 dark:text-white flex items-center gap-2 text-sm tracking-tight">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Add Personal Context
                </h4>
                <button onClick={() => setShowContextInput(false)} className="text-[10px] font-black text-neutral-400 hover:text-indigo-500">Close</button>
            </div>
            <div className="space-y-6">
                <textarea
                    className="w-full text-sm p-6 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-white/5 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-neutral-400 resize-none font-medium leading-relaxed"
                    rows={4}
                    placeholder="Share unique details (e.g., your connection to their mission or specific product experience)"
                    value={contextNotes || ''}
                    onChange={(e) => handleUpdateContext(e.target.value)}
                    autoFocus
                />
                <button
                    onClick={() => {
                        handleGenerateCoverLetter();
                        setShowContextInput(false);
                    }}
                    disabled={generating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {hasCoverLetter ? 'Refine Draft with Context' : 'Generate Draft'}
                </button>
            </div>
        </Card>
    );
};
