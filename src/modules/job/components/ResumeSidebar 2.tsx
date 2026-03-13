import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { SavedJob } from '../types';

interface ResumeSidebarProps {
    job: SavedJob;
    analysisProgress: string | null;
}

export const ResumeSidebar: React.FC<ResumeSidebarProps> = ({ job, analysisProgress }) => {
    const analysis = job.analysis;

    if (job.status === 'analyzing' || analysisProgress) {
        return (
            <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
                <div className="animate-pulse space-y-6">
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-16 bg-neutral-50 dark:bg-neutral-900 rounded-[1.5rem]"></div>
                        <div className="h-16 bg-neutral-50 dark:bg-neutral-900 rounded-[1.5rem]"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
            <h4 className="font-bold text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2 text-sm normal-case">
                <Sparkles className="w-3.5 h-3.5" /> Strategic Alignment
            </h4>
            <div className="space-y-4">
                {(analysis?.resumeTailoringInstructions || analysis?.tailoringInstructions || [])
                    .slice(0, 3).map((instruction: string, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-4 text-sm text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-neutral-800/50 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-white/5 shadow-sm"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 mt-2 shrink-0" />
                            <span className="text-xs font-bold leading-relaxed">{instruction}</span>
                        </motion.div>
                    ))}
                {(!analysis?.resumeTailoringInstructions && !analysis?.tailoringInstructions) && (
                    <div className="text-xs text-neutral-500 italic py-4 text-center">No high-level strategy identified.</div>
                )}
            </div>
        </Card>
    );
};
