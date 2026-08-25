import { motion } from 'framer-motion';
import { Loader2, Sparkles, PenTool } from 'lucide-react';


export const ProfileProcessingStep = ({ parsingSnapshot }: any) => {
    return (
        <motion.div
            key="step-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl text-center"
        >
            <div className="card-premium p-10 shadow-2xl">
                <div className="mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 dark:bg-neutral-900/30 text-neutral-600 dark:text-neutral-400 rounded-3xl mb-6 shadow-xl animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white mb-3">
                        Processing profile...
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg font-medium underline underline-offset-8 decoration-neutral-500/20">
                        Extracting your brilliance.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-neutral-500/5 to-neutral-500/5 rounded-[2rem] p-6 border border-neutral-500/10 flex items-center gap-5"
                    >
                        <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6 text-neutral-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-neutral-900 dark:text-white mb-1">Smart Tailoring</h3>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Instantly rewrite your resume to match any job.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-[2rem] p-6 border border-emerald-500/10 flex items-center gap-5"
                    >
                        <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <PenTool className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-neutral-900 dark:text-white mb-1">Cover Letters</h3>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Generate unique, persuasive cover letters.</p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-10 min-h-[40px]">
                    {parsingSnapshot && (
                        <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-black border border-neutral-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
                                {parsingSnapshot.roles} ROLES FOUND
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                SKILLS MAPPED
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
