import React from 'react';
import { Download, FileText, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ResumePreview } from './ResumePreview';
import type { ResumeBlock } from '../types';

interface ResumePreviewModalProps {
    isOpen: boolean;
    blocks: ResumeBlock[];
    onClose: () => void;
    onPrint: () => void;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
    isOpen,
    blocks,
    onClose,
    onPrint,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xl" onClick={onClose} />
            <div className="relative bg-neutral-100 dark:bg-neutral-950 w-full max-w-5xl h-full rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-xl text-neutral-900 dark:text-white">Preview</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={onPrint} variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                            Download PDF
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-none">
                    <div className="mx-auto shadow-2xl origin-top scale-[0.85] md:scale-100">
                        <ResumePreview blocks={blocks} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumePreviewModal;

