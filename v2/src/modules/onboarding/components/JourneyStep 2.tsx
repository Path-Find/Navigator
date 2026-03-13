import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { JOURNEY_OPTIONS } from '../OnboardingPage';


export const JourneyStep = ({ selectedJourneys, toggleJourney, handleNext }: any) => {
    return (
        <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl"
        >
            <div className="card-premium p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="relative text-center mb-10">
                    <h1 className="text-4xl font-black mb-3 text-neutral-900 dark:text-white">
                        Welcome to <span className="text-gradient">Navigator</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium">
                        Where are you currently in your journey?
                    </p>
                </div>

                <div className="space-y-3 mb-10">
                    {JOURNEY_OPTIONS.map((option) => {
                        const isSelected = selectedJourneys.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                onClick={() => toggleJourney(option.id)}
                                className={`group w-full p-5 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${isSelected
                                    ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/30'
                                    }`}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl transition-all duration-500 flex items-center justify-center ${isSelected
                                        ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-400 group-hover:text-indigo-500 group-hover:scale-105 shadow-sm'
                                        }`}>
                                        {option.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-900 dark:text-white'}`}>{option.title}</h3>
                                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">{option.description}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="ml-auto animate-in zoom-in-50 duration-300">
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    disabled={selectedJourneys.length === 0}
                    className="w-full btn-premium py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 group"
                >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </motion.div>
    );
};
