import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { SavedJob } from '../types';

interface ProhibitionAlertProps {
    job: SavedJob;
}

export const ProhibitionAlert: React.FC<ProhibitionAlertProps> = ({ job }) => {
    const analysis = job.analysis;
    if (!analysis?.distilledJob?.isAiBanned) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex gap-4 shadow-sm"
        >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 mb-1">AI Usage Highly Restricted</h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                    This job posting specifically prohibits the use of AI tools in applications.
                    {analysis?.distilledJob?.aiBanReason && (
                        <span className="block mt-2 italic opacity-80">
                            &ldquo;{analysis.distilledJob.aiBanReason}&rdquo;
                        </span>
                    )}
                </p>
                <div className="mt-3 flex gap-2">
                    <span className="text-[10px] font-black bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200">
                        Safe Mode Active
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
