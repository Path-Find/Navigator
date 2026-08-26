import { Sparkles, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const SkillInterviewSummary = ({ verifiedCount, skills, skillScores, verifiedSkills, handleClose, handleFinish }: any) => {
    return (
        <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="relative mb-10">
                <div className={`absolute inset-0 ${verifiedCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'} blur-[80px] opacity-20 rounded-full`} />
                <div className={`relative w-36 h-36 rounded-[3rem] ${verifiedCount > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'} flex items-center justify-center shadow-2xl`}>
                    <Sparkles className="w-16 h-16 text-white" />
                </div>
            </div>

            <h4 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                Skills interview complete
            </h4>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-10 max-w-lg">
                {verifiedCount > 0
                    ? `${verifiedCount} skill${verifiedCount !== 1 ? 's' : ''} now has interview evidence in your profile.`
                    : `No skills met the evidence threshold this time. You can practice again when you’re ready.`
                }
            </p>

            {/* Skill results grid */}
            <div className="w-full max-w-md mb-10 space-y-2">
                {skills.map((s: any) => {
                    const score = skillScores[s.name];
                    const verified = verifiedSkills.includes(s.name);
                    return (
                        <div
                            key={s.name}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${verified
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${verified
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'
                                    }`}>
                                    {verified ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </div>
                                <div className="text-left">
                                    <span className={`font-bold text-sm block ${verified ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-500'}`}>
                                        {s.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                        {verified ? 'Verified' : 'Needs more evidence'}
                                    </span>
                                </div>
                            </div>
                            {score && score.total > 0 && (
                                <span className="text-xs font-medium text-neutral-400">
                                    {score.demonstrated}/{score.total}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleClose}
                    className="px-8 py-4 rounded-2xl font-bold text-base text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                    Close
                </button>
                {verifiedCount > 0 && (
                    <button
                        onClick={handleFinish}
                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Return to skills
                    </button>
                )}
            </div>
        </motion.div>
    );
};
