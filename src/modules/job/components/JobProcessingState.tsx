import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { SavedJob } from '../types';

interface JobProcessingStateProps {
    job: SavedJob;
    analysisProgress: string | null;
    onBack: () => void;
}

export const JobProcessingState: React.FC<JobProcessingStateProps> = ({
    job,
    analysisProgress,
    onBack
}) => {
    return (
        <div className="theme-job flex flex-col items-center justify-center min-h-[80vh] px-6 relative overflow-hidden bg-white dark:bg-[#000000]">
            {/* Background ambient glows */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-secondary-hex/5 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="relative w-full max-w-lg">
                {/* Main Scanning Card Container */}
                <Card variant="premium" className="p-8 text-center border-accent-primary/20 backdrop-blur-3xl">
                    {/* Scanning Animation Body */}
                    <div className="relative mx-auto w-32 h-40 mb-10 group">
                        {/* Document Icon Placeholder */}
                        <div className="absolute inset-0 border-2 border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col gap-2 p-3 overflow-hidden">
                            {[85, 72, 91, 65, 88, 77].map((w, i) => (
                                <div key={i} className="h-1.5 w-full bg-neutral-200 dark:border-neutral-800 rounded-full" style={{ width: `${w}%` }} />
                            ))}
                        </div>

                        {/* The Scanning Beam */}
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-primary-hex to-transparent z-20 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Scanning Light Wash */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-accent-primary-hex/20 to-transparent z-10"
                            animate={{ height: ["0%", "100%", "0%"], opacity: [0, 0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search className="w-12 h-12 text-accent-primary-hex animate-pulse" />
                        </div>
                    </div>

                    <h3 className="text-3xl font-black text-neutral-900 dark:text-white mb-3 tracking-tighter">
                        Matching
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-bold text-sm mb-12 max-w-[280px] mx-auto leading-relaxed">
                        Comparing the job requirements to your career profile.
                    </p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end text-[10px] font-bold text-neutral-400">
                            <span className="text-accent-primary-hex animate-pulse">{job.progressMessage || analysisProgress || "Thinking"}</span>
                            <span className="text-neutral-900 dark:text-white">{job.progress || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-full p-1 overflow-hidden border border-neutral-200/50 dark:border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent-primary-hex to-accent-secondary-hex rounded-full relative"
                                initial={{ width: "2%" }}
                                animate={{ width: `${Math.max(5, job.progress || 5)}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] -translate-x-full" />
                            </motion.div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-12">
                <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack} className="font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    Cancel analysis and go back
                </Button>
            </div>
        </div>
    );
};
