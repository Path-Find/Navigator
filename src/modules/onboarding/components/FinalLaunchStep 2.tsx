import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';


export const FinalLaunchStep = ({ selectedJourneys, handleComplete }: any) => {
    return (
        <motion.div
            key="step-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl text-center"
        >
            <div className="card-premium p-10 shadow-2xl">
                <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-8 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-50 duration-500">
                        <Check className="w-14 h-14 text-white stroke-[3px]" />
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">
                        You're ready!
                    </h1>
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 font-medium max-w-md mx-auto">
                        {selectedJourneys.includes('job-hunter')
                            ? "Your journey to the perfect role starts here."
                            : "Let's build your path to success."}
                    </p>
                </div>

                <button
                    onClick={handleComplete}
                    className="w-full btn-premium py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 group"
                >
                    <span>Launch Navigator</span>
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                </button>
            </div>
        </motion.div>
    );
};
