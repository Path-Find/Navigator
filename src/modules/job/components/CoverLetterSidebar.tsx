import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { SavedJob } from '../types';

interface CoverLetterSidebarProps {
    job: SavedJob;
}

export const CoverLetterSidebar: React.FC<CoverLetterSidebarProps> = ({ job }) => {
    const analysis = job.analysis;
    const instructions = analysis?.coverLetterTailoringInstructions || analysis?.tailoringInstructions || [];

    return (
        <div className="space-y-6">
            <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
                <h4 className="font-bold text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2 text-sm normal-case">
                    <Sparkles className="w-3.5 h-3.5" /> Refinement Strategy
                </h4>
                <div className="space-y-6">
                    <div className="space-y-3">
                        {instructions.slice(0, 3).map((instruction: string, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-white/5 italic leading-relaxed"
                            >
                                <span className="font-bold text-indigo-500/30">•</span>
                                <span>{instruction.replace(/\[Block ID: .*?\]/g, '').trim()}</span>
                            </motion.div>
                        ))}
                        {instructions.length === 0 && (
                            <div className="text-xs text-neutral-500 italic py-4 text-center">No strategy identified.</div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
