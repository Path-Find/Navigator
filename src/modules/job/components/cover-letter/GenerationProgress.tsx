import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
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
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-10 relative"
            >
                {/* Outer Glass Ring */}
                <div className="absolute inset-0 -m-4 border border-neutral-100 dark:border-white/5 rounded-[2.5rem] bg-white/30 dark:bg-white/5 backdrop-blur-xl" />
                
                {/* Inner Icon Container */}
                <div className="relative w-28 h-28 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border border-neutral-100 dark:border-white/5 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <currentStep.icon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Floating Sparkles for extra "life" */}
                    <motion.div 
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-4 right-4"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-300 dark:text-indigo-600" />
                    </motion.div>
                </div>

                {/* Progress Ring Glow (SVG) */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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

            {/* Content Section */}
            <div className="relative space-y-2 mb-12">
                <div className="flex justify-center h-[2.5rem] items-end">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.label}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="flex overflow-hidden"
                        >
                            {currentStep.label.split('').map((char, index) => (
                                <motion.span
                                    key={`${currentStep.label}-${index}`}
                                    variants={{
                                        hidden: { opacity: 0, y: 5 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.04,
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
                
                <div className="flex items-center justify-center gap-2 text-neutral-500 dark:text-neutral-400 font-bold text-sm h-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                    {status}
                </div>
            </div>

            {/* Stepper with Connecting Lines */}
            <div className="w-full max-w-sm flex items-center justify-between relative px-2">
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
                            {/* Identifier label */}
                            <div className={`absolute top-6 whitespace-nowrap text-[8px] uppercase tracking-widest font-black transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 text-indigo-500' : 'opacity-0 translate-y-1 group-hover:opacity-100 text-neutral-400'}`}>
                                {step.id}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
