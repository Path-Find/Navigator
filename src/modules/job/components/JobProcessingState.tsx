import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, GitBranch, Scale, Layers, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import type { SavedJob } from '../types';

interface JobProcessingStateProps {
    job: SavedJob;
    analysisProgress: string | null;
    onBack: () => void;
}

const steps = [
    { id: 'researching',     label: 'Researching',     icon: Search,    threshold: 17 },
    { id: 'contextualizing', label: 'Contextualizing', icon: Shield,    threshold: 33 },
    { id: 'mapping',         label: 'Mapping',         icon: GitBranch, threshold: 50 },
    { id: 'benchmarking',    label: 'Benchmarking',    icon: Scale,     threshold: 67 },
    { id: 'synthesizing',    label: 'Synthesizing',    icon: Layers,    threshold: 83 },
    { id: 'finalizing',      label: 'Finalizing',      icon: Sparkles,  threshold: 100 },
];

export const JobProcessingState: React.FC<JobProcessingStateProps> = ({ job, analysisProgress, onBack }) => {
    const progress = job?.progress || 0;
    const activeStepIdx = steps.findIndex(s => progress < s.threshold);
    const currentStep = activeStepIdx === -1 ? steps[steps.length - 1] : steps[activeStepIdx];
    const status = analysisProgress || job?.progressMessage || currentStep.label;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 bg-white dark:bg-neutral-950">
            <div className="relative flex flex-col items-center text-center">
                {/* Icon + progress ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 relative"
                >
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <currentStep.icon className="w-14 h-14 text-neutral-600 dark:text-neutral-400 drop-shadow-sm" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none opacity-50">
                        <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-100 dark:text-white/5" />
                        <motion.circle
                            cx="50%" cy="50%" r="48%"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            strokeDasharray="100 100"
                            animate={{ strokeDasharray: [`${progress} 100`] }}
                            className="text-neutral-500 dark:text-neutral-400"
                            transition={{ duration: 0.5 }}
                        />
                    </svg>
                </motion.div>

                {/* Step label */}
                <div className="mb-12">
                    <div className="flex justify-center h-[2.5rem] items-end mb-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="flex overflow-hidden"
                            >
                                {status.split('').map((char, index) => (
                                    <motion.span
                                        key={`${status}-${index}`}
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
                                        className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter"
                                    >
                                        {char === ' ' ? ' ' : char}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Step dots */}
                <div className="w-full max-w-[280px] flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-neutral-100 dark:bg-white/5 -translate-y-1/2 z-0" />
                    {steps.map((step, idx) => {
                        const isCompleted = progress >= step.threshold;
                        const isActive = progress < step.threshold && (idx === 0 || progress >= steps[idx - 1].threshold);
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                <motion.div
                                    animate={{
                                        scale: isActive ? 1.4 : 1,
                                        backgroundColor: isCompleted ? '#22c55e' : isActive ? '#6366f1' : '#f5f5f5'
                                    }}
                                    className={`w-2 h-2 rounded-full border-2 border-white dark:border-neutral-950 shadow-sm transition-colors duration-500 ${!isCompleted && !isActive ? 'dark:bg-neutral-800' : ''}`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-16">
                <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack} className="font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    Cancel analysis and go back
                </Button>
            </div>
        </div>
    );
};
