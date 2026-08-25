import React from 'react';
import { Sparkles, Copy, Check, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import type { UserTier } from '../../../../types/app';

interface CoverLetterHeaderProps {
    coverLetter?: string;
    userTier: UserTier;
    generating: boolean;
    copiedState: 'cl' | null;
    handleCopy: (text: string) => void;
    handleGenerateCoverLetter: () => void;
    setShowContextInput: (show: boolean) => void;
    onDownload?: () => void;
}

export const CoverLetterHeader: React.FC<CoverLetterHeaderProps> = ({
    coverLetter,
    userTier,
    generating,
    copiedState,
    handleCopy,
    handleGenerateCoverLetter,
    setShowContextInput,
    onDownload
}) => {
    return (
        <div className="p-6 border-b border-neutral-100 dark:border-white/5 flex justify-between items-start bg-white dark:bg-neutral-900/50">
            <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Cover Letter</h3>
            <div className="flex items-center gap-2">
                {coverLetter && (
                    <>
                        <Button
                            variant="secondary"
                            size="xs"
                            icon={<Download className="w-3 h-3" />}
                            onClick={onDownload}
                            title="Download PDF"
                        >
                            Download
                        </Button>
                        <Button
                            variant="secondary"
                            size="xs"
                            icon={copiedState === 'cl' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            onClick={() => handleCopy(coverLetter)}
                        >
                            {copiedState === 'cl' ? 'Copied' : 'Copy'}
                        </Button>
                    </>
                )}
                {(!coverLetter || userTier !== 'free') && !generating && (
                    <Button
                        variant="accent"
                        size="xs"
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-none hover:opacity-90 shadow-none hover:shadow-none"
                        icon={<Sparkles className="w-3 h-3" />}
                        onClick={() => {
                            if (coverLetter) {
                                setShowContextInput(true);
                            } else {
                                handleGenerateCoverLetter();
                            }
                        }}
                    >
                        {coverLetter ? 'Refine' : 'Generate'}
                    </Button>
                )}
            </div>
        </div>
    );
};
