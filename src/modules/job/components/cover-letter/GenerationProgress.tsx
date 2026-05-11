import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Search, 
    Zap,
    Scale,
    PenTool,
    Shield
} from 'lucide-react';

interface GenerationProgressProps {
    status: string;
    progress: number;
    title?: string;
}

const steps = [
    { id: 'research', label: 'Researching', icon: Search, threshold: 16 },
    { id: 'context', label: 'Contextualizing', icon: Shield, threshold: 32 },
    { id: 'mapping', label: 'Mapping', icon: Zap, threshold: 48 },
    { id: 'drafting', label: 'Drafting', icon: PenTool, threshold: 72 },
    { id: 'critique', label: 'Critiquing', icon: Scale, threshold: 88 },
    { id: 'polish', label: 'Polishing', icon: FileText, threshold: 100 },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
    status, 
    progress,
}) => {
    const activeStepIdx = steps.findIndex(s => progress < s.threshold);
    const currentStep = activeStepIdx === -1 ? steps[steps.length - 1] : steps[activeStepIdx];

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px] max-w-2xl mx-auto relative overflow-hidden">
            {/* Immersive Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[80px] animate-pulse delay-700 pointer-events-none" />

            {/* Central High-Fidelity Icon */}
            {/* Central Animated Icon Section */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8 relative"
            >
                {/* Simplified Icon Glow */}
                <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl rounded-full" />
                
                {/* Icon Container - Soft, minimal, no "card-in-card" feel */}
                <div className="relative w-24 h-24 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <currentStep.icon className="w-14 h-14 text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress Ring Glow (SVG) */}
                <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none opacity-50">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-neutral-100 dark:text-white/5"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="100 100"
                        animate={{ strokeDasharray: [`${progress} 100`] }}
                        className="text-indigo-500 dark:text-indigo-400"
                        transition={{ duration: 0.5 }}
                    />
                </svg>
            </motion.div>

            {/* Main Label Section */}
            <div className="relative mb-12">
                <div className="flex justify-center h-[2.5rem] items-end mb-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={status} // Use the actual status prop for the big label
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="flex overflow-hidden"
                        >
                            {(status || currentStep.label).split('').map((char, index) => (
                                <motion.span
                                    key={`${status}-${index}`}
                                    variants={{
                                        hidden: { opacity: 0, y: 10 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.03,
                                        ease: "easeOut"
                                    }}
                                    className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter"
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Stepper with Connecting Lines */}
            <div className="w-full max-w-[280px] flex items-center justify-between relative px-2">
                {/* Background Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-neutral-100 dark:bg-white/5 -translate-y-1/2 z-0" />
                
                {steps.map((step, idx) => {
                    const isCompleted = progress >= step.threshold;
                    const isActive = progress < step.threshold && (idx === 0 || progress >= steps[idx-1].threshold);
                    
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.4 : 1,
                                    backgroundColor: isCompleted ? '#22c55e' : isActive ? '#6366f1' : '#f5f5f5'
                                }}
                                className={`w-2 h-2 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm transition-colors duration-500 ${!isCompleted && !isActive ? 'dark:bg-neutral-800' : ''}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
